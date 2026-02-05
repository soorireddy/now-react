var FormListUtil = Class.create();
FormListUtil.prototype = {

    initialize: function() {},

    /**
     * Get form fields (by sections) + list columns for a given table/view.
     *
     * @param {String} tableName  - e.g. "incident"
     * @param {String} viewName   - optional. "default" (default), "ess", "itil", etc.
     * @returns {Object}          - JSON-friendly object
     */
    getLayout: function(tableName, viewName) {
        viewName = (viewName || "default").toString();

        var result = {
            table: tableName,
            view: viewName,
            form: {
                formSysId: "",
                sections: [] // [{caption, position, sys_id, fields:[]}]
            },
            list: {
                listSysId: "",
                columns: [] // [{name, position}]
            }
        };

        // -------------------------
        // 1) FORM: sys_ui_form -> sections -> elements
        // -------------------------
        var formGR = new GlideRecord("sys_ui_form");
        formGR.addQuery("name", tableName);
        this._addViewFilter(formGR, viewName);

        // If multiple forms exist (role-based/customizations), pick most recently updated.
        formGR.orderByDesc("sys_updated_on");
        formGR.setLimit(1);
        formGR.query();

        if (formGR.next()) {
            result.form.formSysId = formGR.getUniqueValue();

            // sys_ui_form_section defines ordering of sections on that form
            var formSectionGR = new GlideRecord("sys_ui_form_section");

            // Field name is usually "sys_ui_form" (ref to sys_ui_form)
            // Some instances have "form" — so handle safely:
            if (formSectionGR.isValidField("sys_ui_form"))
                formSectionGR.addQuery("sys_ui_form", result.form.formSysId);
            else
                formSectionGR.addQuery("form", result.form.formSysId);

            formSectionGR.orderBy("position");
            formSectionGR.query();

            while (formSectionGR.next()) {
                var sectionId = formSectionGR.getValue("section") || formSectionGR.getValue("sys_ui_section");
                var sectionObj = this._buildSectionObject(sectionId, formSectionGR.getValue("position"), tableName, viewName);
                result.form.sections.push(sectionObj);
            }

            // Also fetch "orphan" elements (sometimes elements have no section)
            var orphanFields = this._getElementsForSection(tableName, viewName, "");
            if (orphanFields.length > 0) {
                result.form.sections.push({
                    sys_id: "",
                    caption: "(No Section)",
                    position: 9999,
                    fields: orphanFields
                });
            }
        }

        // -------------------------
        // 2) LIST: sys_ui_list -> sys_ui_list_element
        // -------------------------
        var listGR = new GlideRecord("sys_ui_list");
        listGR.addQuery("name", tableName);
        this._addViewFilter(listGR, viewName);
        listGR.orderByDesc("sys_updated_on");
        listGR.setLimit(1);
        listGR.query();

        if (listGR.next()) {
            result.list.listSysId = listGR.getUniqueValue();

            var listElemGR = new GlideRecord("sys_ui_list_element");
            listElemGR.addQuery("list_id", result.list.listSysId);

            // order field is usually "position"
            if (listElemGR.isValidField("position"))
                listElemGR.orderBy("position");
            else if (listElemGR.isValidField("order"))
                listElemGR.orderBy("order");

            listElemGR.query();

            while (listElemGR.next()) {
                result.list.columns.push({
                    name: listElemGR.getValue("element"),
                    position: listElemGR.getValue("position") || listElemGR.getValue("order") || ""
                });
            }
        }

        return result;
    },

    // -------------------------
    // Helpers
    // -------------------------

    /**
     * Adds view filter for "default" vs named view.
     * Default view in ServiceNow is often:
     *  - view is empty OR
     *  - view.name == "Default view"
     */
    _addViewFilter: function(gr, viewName) {
        if (!gr.isValidField("view")) return;

        var v = (viewName || "default").toLowerCase();

        if (v === "default" || v === "default view") {
            var qc = gr.addQuery("view", ""); // empty view
            qc.addOrCondition("view.name", "Default view"); // explicit "Default view"
        } else {
            gr.addQuery("view.name", viewName); // named view
        }
    },

    _buildSectionObject: function(sectionSysId, position, tableName, viewName) {
        var sectionCaption = "";
        var sectionId = sectionSysId || "";

        if (sectionId) {
            var secGR = new GlideRecord("sys_ui_section");
            if (secGR.get(sectionId)) {
                // caption field exists; sometimes "title" or "caption"
                sectionCaption = secGR.getValue("caption") || secGR.getValue("title") || secGR.getDisplayValue() || "";
            }
        }

        return {
            sys_id: sectionId,
            caption: sectionCaption,
            position: position,
            fields: this._getElementsForSection(tableName, viewName, sectionId)
        };
    },

    /**
     * Get sys_ui_element rows for a given table/view/section ordered by position.
     * Includes fields + formatter rows (you can filter if you want).
     */
    _getElementsForSection: function(tableName, viewName, sectionSysId) {
        var fields = [];

        var elGR = new GlideRecord("sys_ui_element");
        elGR.addQuery("name", tableName);
        this._addViewFilter(elGR, viewName);

        if (elGR.isValidField("section")) {
            if (sectionSysId)
                elGR.addQuery("section", sectionSysId);
            else
                elGR.addQuery("section", ""); // no section
        }

        // order by "position" if present
        if (elGR.isValidField("position"))
            elGR.orderBy("position");

        elGR.query();

        while (elGR.next()) {
            fields.push({
                element: elGR.getValue("element"),
                label: elGR.getValue("label"),
                type: elGR.getValue("type"), // can be "field", "formatter", etc.
                position: elGR.getValue("position"),
                mandatory: elGR.getValue("mandatory"),
                read_only: elGR.getValue("read_only")
            });
        }

        return fields;
    },


    type: 'FormListUtil'
};