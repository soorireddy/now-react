import { gs, GlideRecord } from '@servicenow/glide'

class TableUtils {
    
    getLayout() {
        const tableName = this.getParameter('sysparm_table')
        const viewName = this.getParameter('sysparm_view') || 'default'
        
        if (!tableName) {
            return JSON.stringify({ error: 'Table name required' })
        }
        
        try {
            const result = {
                table: tableName,
                view: viewName,
                form: {
                    formSysId: '',
                    sections: [] // [{caption, position, sys_id, fields:[]}]
                },
                list: {
                    listSysId: '',
                    columns: [] // [{name, position, label, type}]
                }
            }
            
            // -------------------------
            // 1) FORM: sys_ui_form -> sections -> elements
            // -------------------------
            const formGR = new GlideRecord('sys_ui_form')
            formGR.addQuery('name', tableName)
            this._addViewFilter(formGR, viewName)
            formGR.orderByDesc('sys_updated_on')
            formGR.setLimit(1)
            formGR.query()
            
            if (formGR.next()) {
                result.form.formSysId = formGR.getUniqueValue()
                
                // Get form sections
                const formSectionGR = new GlideRecord('sys_ui_form_section')
                if (formSectionGR.isValidField('sys_ui_form')) {
                    formSectionGR.addQuery('sys_ui_form', result.form.formSysId)
                } else {
                    formSectionGR.addQuery('form', result.form.formSysId)
                }
                formSectionGR.orderBy('position')
                formSectionGR.query()
                
                while (formSectionGR.next()) {
                    const sectionId = formSectionGR.getValue('section') || formSectionGR.getValue('sys_ui_section')
                    const sectionObj = this._buildSectionObject(sectionId, formSectionGR.getValue('position'), tableName, viewName)
                    result.form.sections.push(sectionObj)
                }
                
                // Handle orphan elements (elements with no section)
                const orphanFields = this._getElementsForSection(tableName, viewName, '')
                if (orphanFields.length > 0) {
                    result.form.sections.push({
                        sys_id: '',
                        caption: '(No Section)',
                        position: 9999,
                        fields: orphanFields
                    })
                }
            }
            
            // -------------------------
            // 2) LIST: sys_ui_list -> sys_ui_list_element
            // -------------------------
            const listGR = new GlideRecord('sys_ui_list')
            listGR.addQuery('name', tableName)
            this._addViewFilter(listGR, viewName)
            listGR.orderByDesc('sys_updated_on')
            listGR.setLimit(1)
            listGR.query()
            
            if (listGR.next()) {
                result.list.listSysId = listGR.getUniqueValue()
                
                const listElemGR = new GlideRecord('sys_ui_list_element')
                listElemGR.addQuery('list_id', result.list.listSysId)
                
                if (listElemGR.isValidField('position')) {
                    listElemGR.orderBy('position')
                } else if (listElemGR.isValidField('order')) {
                    listElemGR.orderBy('order')
                }
                listElemGR.query()
                
                while (listElemGR.next()) {
                    const elementName = listElemGR.getValue('element')
                    
                    // Get field details from dictionary
                    const dictGR = new GlideRecord('sys_dictionary')
                    dictGR.addQuery('name', tableName)
                    dictGR.addQuery('element', elementName)
                    dictGR.query()
                    
                    let fieldLabel = elementName
                    let fieldType = 'string'
                    
                    if (dictGR.next()) {
                        fieldLabel = dictGR.getDisplayValue('column_label') || elementName
                        fieldType = dictGR.getValue('internal_type') || 'string'
                    }
                    
                    result.list.columns.push({
                        name: elementName,
                        label: fieldLabel,
                        type: fieldType,
                        position: listElemGR.getValue('position') || listElemGR.getValue('order') || ''
                    })
                }
            }
            
            return JSON.stringify(result)
            
        } catch (e) {
            gs.error('Error in TableUtils.getLayout: ' + e.message)
            return JSON.stringify({ error: 'Failed to get layout: ' + e.message })
        }
    }
    
    // Add view filter for default vs named view
    _addViewFilter(gr, viewName) {
        if (!gr.isValidField('view')) return
        
        const v = (viewName || 'default').toLowerCase()
        
        if (v === 'default' || v === 'default view') {
            const qc = gr.addQuery('view', '') // empty view
            qc.addOrCondition('view.name', 'Default view') // explicit "Default view"
        } else {
            gr.addQuery('view.name', viewName) // named view
        }
    }
    
    // Build section object with fields
    _buildSectionObject(sectionSysId, position, tableName, viewName) {
        let sectionCaption = ''
        const sectionId = sectionSysId || ''
        
        if (sectionId) {
            const secGR = new GlideRecord('sys_ui_section')
            if (secGR.get(sectionId)) {
                sectionCaption = secGR.getValue('caption') || secGR.getValue('title') || secGR.getDisplayValue() || ''
            }
        }
        
        return {
            sys_id: sectionId,
            caption: sectionCaption,
            position: position,
            fields: this._getElementsForSection(tableName, viewName, sectionId)
        }
    }
    
    // Get elements for a specific section
    _getElementsForSection(tableName, viewName, sectionSysId) {
        const fields = []
        
        const elGR = new GlideRecord('sys_ui_element')
        elGR.addQuery('name', tableName)
        this._addViewFilter(elGR, viewName)
        
        if (elGR.isValidField('section')) {
            if (sectionSysId) {
                elGR.addQuery('section', sectionSysId)
            } else {
                elGR.addQuery('section', '') // no section
            }
        }
        
        if (elGR.isValidField('position')) {
            elGR.orderBy('position')
        }
        elGR.query()
        
        while (elGR.next()) {
            const elementName = elGR.getValue('element')
            
            // Skip if element is empty (formatter rows, etc.)
            if (!elementName) continue
            
            // Get field details from dictionary
            const dictGR = new GlideRecord('sys_dictionary')
            dictGR.addQuery('name', tableName)
            dictGR.addQuery('element', elementName)
            dictGR.query()
            
            let fieldDetails = {
                element: elementName,
                label: elGR.getValue('label') || elementName,
                type: elGR.getValue('type') || 'field',
                position: elGR.getValue('position'),
                mandatory: elGR.getValue('mandatory') === 'true',
                read_only: elGR.getValue('read_only') === 'true',
                // Dictionary details
                internal_type: 'string',
                max_length: '',
                reference_table: '',
                choices: [],
                default_value: ''
            }
            
            if (dictGR.next()) {
                fieldDetails.internal_type = dictGR.getValue('internal_type') || 'string'
                fieldDetails.max_length = dictGR.getValue('max_length') || ''
                fieldDetails.reference_table = dictGR.getValue('reference') || ''
                fieldDetails.default_value = dictGR.getValue('default_value') || ''
                
                // Override label from dictionary if not set in element
                if (!elGR.getValue('label')) {
                    fieldDetails.label = dictGR.getDisplayValue('column_label') || elementName
                }
                
                // Get choices for choice fields
                if (fieldDetails.internal_type === 'choice') {
                    const choices = new GlideRecord('sys_choice')
                    choices.addQuery('name', tableName)
                    choices.addQuery('element', elementName)
                    choices.orderBy('sequence')
                    choices.query()
                    
                    while (choices.next()) {
                        fieldDetails.choices.push({
                            value: choices.getValue('value'),
                            label: choices.getDisplayValue('label'),
                            sequence: choices.getValue('sequence')
                        })
                    }
                }
            }
            
            fields.push(fieldDetails)
        }
        
        return fields
    }
    
    getFormFields() {
        const table = this.getParameter('sysparm_table')
        const sysId = this.getParameter('sysparm_sys_id')
        
        if (!table) {
            return JSON.stringify({ error: 'Table name required' })
        }
        
        try {
            // Get layout first
            const layoutResult = JSON.parse(this.getLayout())
            if (layoutResult.error) {
                return JSON.stringify(layoutResult)
            }
            
            // Get current values if editing existing record
            let currentValues = {}
            if (sysId) {
                const record = new GlideRecord(table)
                if (record.get(sysId)) {
                    // Collect all field values
                    layoutResult.form.sections.forEach(section => {
                        section.fields.forEach(field => {
                            if (field.element) {
                                currentValues[field.element] = record.getDisplayValue(field.element)
                            }
                        })
                    })
                }
            }
            
            return JSON.stringify({
                table: table,
                sys_id: sysId,
                layout: layoutResult.form,
                values: currentValues
            })
            
        } catch (e) {
            gs.error('Error in TableUtils.getFormFields: ' + e.message)
            return JSON.stringify({ error: 'Failed to get form fields' })
        }
    }
    
    getListData() {
        const table = this.getParameter('sysparm_table')
        const limit = parseInt(this.getParameter('sysparm_limit') || '25')
        
        if (!table) {
            return JSON.stringify({ error: 'Table name required' })
        }
        
        try {
            // Get layout first
            const layoutResult = JSON.parse(this.getLayout())
            if (layoutResult.error) {
                return JSON.stringify(layoutResult)
            }
            
            // Get records
            const records = []
            const gr = new GlideRecord(table)
            gr.setLimit(limit)
            gr.query()
            
            while (gr.next()) {
                const record = { sys_id: gr.getUniqueValue() }
                layoutResult.list.columns.forEach(column => {
                    record[column.name] = gr.getDisplayValue(column.name)
                })
                records.push(record)
            }
            
            return JSON.stringify({
                table: table,
                columns: layoutResult.list.columns,
                records: records,
                total: gr.getRowCount()
            })
            
        } catch (e) {
            gs.error('Error in TableUtils.getListData: ' + e.message)
            return JSON.stringify({ error: 'Failed to get list data' })
        }
    }
    
    saveRecord() {
        const table = this.getParameter('sysparm_table')
        const sysId = this.getParameter('sysparm_sys_id')
        const data = this.getParameter('sysparm_data')
        
        if (!table || !data) {
            return JSON.stringify({ error: 'Table name and data required' })
        }
        
        try {
            const recordData = JSON.parse(data)
            const gr = new GlideRecord(table)
            
            if (sysId) {
                // Update existing record
                if (!gr.get(sysId)) {
                    return JSON.stringify({ error: 'Record not found' })
                }
            } else {
                // Create new record
                gr.initialize()
            }
            
            // Set field values
            Object.keys(recordData).forEach(field => {
                if (field !== 'sys_id') {
                    gr.setValue(field, recordData[field])
                }
            })
            
            const resultSysId = gr.update()
            
            return JSON.stringify({
                success: true,
                sys_id: resultSysId || sysId,
                operation: sysId ? 'updated' : 'created'
            })
            
        } catch (e) {
            gs.error('Error in TableUtils.saveRecord: ' + e.message)
            return JSON.stringify({ error: 'Failed to save record' })
        }
    }
    
    deleteRecord() {
        const table = this.getParameter('sysparm_table')
        const sysId = this.getParameter('sysparm_sys_id')
        
        if (!table || !sysId) {
            return JSON.stringify({ error: 'Table name and sys_id required' })
        }
        
        try {
            const gr = new GlideRecord(table)
            if (gr.get(sysId)) {
                gr.deleteRecord()
                return JSON.stringify({ success: true, operation: 'deleted' })
            } else {
                return JSON.stringify({ error: 'Record not found' })
            }
            
        } catch (e) {
            gs.error('Error in TableUtils.deleteRecord: ' + e.message)
            return JSON.stringify({ error: 'Failed to delete record' })
        }
    }
}