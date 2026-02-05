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
                    sections: []
                },
                list: {
                    listSysId: '',
                    columns: []
                }
            }
            
            // Get the view sys_id
            let viewSysId = ''
            if (viewName && viewName !== 'default') {
                const viewGR = new GlideRecord('sys_ui_view')
                viewGR.addQuery('name', viewName)
                viewGR.query()
                if (viewGR.next()) {
                    viewSysId = viewGR.getUniqueValue()
                }
            }
            
            // -------------------------
            // 1) FORM: Get form layout
            // -------------------------
            const formGR = new GlideRecord('sys_ui_form')
            formGR.addQuery('name', tableName)
            
            // Handle view filter
            if (viewName === 'default' || !viewSysId) {
                formGR.addNullQuery('view')
            } else {
                formGR.addQuery('view', viewSysId)
            }
            
            formGR.orderByDesc('sys_updated_on')
            formGR.setLimit(1)
            formGR.query()
            
            if (formGR.next()) {
                result.form.formSysId = formGR.getUniqueValue()
                
                // Get form sections ordered by position
                const formSections = []
                const formSectionGR = new GlideRecord('sys_ui_form_section')
                formSectionGR.addQuery('form', result.form.formSysId)
                formSectionGR.orderBy('position')
                formSectionGR.query()
                
                while (formSectionGR.next()) {
                    const sectionSysId = formSectionGR.getValue('section')
                    const position = formSectionGR.getValue('position')
                    
                    // Get section details
                    const sectionGR = new GlideRecord('sys_ui_section')
                    if (sectionGR.get(sectionSysId)) {
                        const sectionData = {
                            sys_id: sectionSysId,
                            caption: sectionGR.getValue('caption') || sectionGR.getValue('title') || '',
                            position: parseInt(position) || 0,
                            fields: this._getSectionFields(tableName, viewSysId, sectionSysId)
                        }
                        formSections.push(sectionData)
                    }
                }
                
                // Sort sections by position
                formSections.sort((a, b) => a.position - b.position)
                result.form.sections = formSections
            }
            
            // -------------------------
            // 2) LIST: Get list layout  
            // -------------------------
            const listGR = new GlideRecord('sys_ui_list')
            listGR.addQuery('name', tableName)
            
            // Handle view filter for list
            if (viewName === 'default' || !viewSysId) {
                listGR.addNullQuery('view')
            } else {
                listGR.addQuery('view', viewSysId)
            }
            
            listGR.orderByDesc('sys_updated_on')
            listGR.setLimit(1)
            listGR.query()
            
            if (listGR.next()) {
                result.list.listSysId = listGR.getUniqueValue()
                
                // Get list elements ordered by position
                const listElemGR = new GlideRecord('sys_ui_list_element')
                listElemGR.addQuery('list_id', result.list.listSysId)
                listElemGR.orderBy('position')
                listElemGR.query()
                
                const columns = []
                while (listElemGR.next()) {
                    const elementName = listElemGR.getValue('element')
                    if (elementName) {
                        // Get field details from dictionary
                        const fieldDetails = this._getFieldDetails(tableName, elementName)
                        
                        columns.push({
                            name: elementName,
                            label: fieldDetails.label,
                            type: fieldDetails.internal_type,
                            position: parseInt(listElemGR.getValue('position')) || 0
                        })
                    }
                }
                
                result.list.columns = columns
            }
            
            return JSON.stringify(result)
            
        } catch (e) {
            gs.error('Error in TableUtils.getLayout: ' + e.message)
            return JSON.stringify({ error: 'Failed to get layout: ' + e.message })
        }
    }
    
    _getSectionFields(tableName, viewSysId, sectionSysId) {
        const fields = []
        
        const elemGR = new GlideRecord('sys_ui_element')
        elemGR.addQuery('name', tableName)
        elemGR.addQuery('section', sectionSysId)
        
        // Handle view filter for elements
        if (!viewSysId) {
            elemGR.addNullQuery('view')
        } else {
            elemGR.addQuery('view', viewSysId)
        }
        
        elemGR.orderBy('position')
        elemGR.query()
        
        while (elemGR.next()) {
            const elementName = elemGR.getValue('element')
            
            // Skip empty elements (formatters, etc.)
            if (!elementName) continue
            
            const fieldDetails = this._getFieldDetails(tableName, elementName)
            
            const field = {
                element: elementName,
                label: elemGR.getValue('label') || fieldDetails.label,
                type: elemGR.getValue('type') || 'field',
                position: parseInt(elemGR.getValue('position')) || 0,
                mandatory: elemGR.getValue('mandatory') === 'true',
                read_only: elemGR.getValue('read_only') === 'true',
                internal_type: fieldDetails.internal_type,
                max_length: fieldDetails.max_length,
                reference_table: fieldDetails.reference_table,
                choices: fieldDetails.choices,
                default_value: fieldDetails.default_value
            }
            
            fields.push(field)
        }
        
        return fields
    }
    
    _getFieldDetails(tableName, elementName) {
        const dictGR = new GlideRecord('sys_dictionary')
        dictGR.addQuery('name', tableName)
        dictGR.addQuery('element', elementName)
        dictGR.query()
        
        let fieldDetails = {
            label: elementName,
            internal_type: 'string',
            max_length: '',
            reference_table: '',
            choices: [],
            default_value: ''
        }
        
        if (dictGR.next()) {
            fieldDetails.label = dictGR.getDisplayValue('column_label') || elementName
            fieldDetails.internal_type = dictGR.getValue('internal_type') || 'string'
            fieldDetails.max_length = dictGR.getValue('max_length') || ''
            fieldDetails.reference_table = dictGR.getValue('reference') || ''
            fieldDetails.default_value = dictGR.getValue('default_value') || ''
            
            // Get choices for choice fields
            if (fieldDetails.internal_type === 'choice') {
                const choicesGR = new GlideRecord('sys_choice')
                choicesGR.addQuery('name', tableName)
                choicesGR.addQuery('element', elementName)
                choicesGR.orderBy('sequence')
                choicesGR.query()
                
                const choices = []
                while (choicesGR.next()) {
                    choices.push({
                        value: choicesGR.getValue('value'),
                        label: choicesGR.getDisplayValue('label'),
                        sequence: parseInt(choicesGR.getValue('sequence')) || 0
                    })
                }
                fieldDetails.choices = choices
            }
        }
        
        return fieldDetails
    }
    
    getFormFields() {
        const table = this.getParameter('sysparm_table')
        const view = this.getParameter('sysparm_view') || 'default'
        const sysId = this.getParameter('sysparm_sys_id')
        
        if (!table) {
            return JSON.stringify({ error: 'Table name required' })
        }
        
        try {
            // Get layout
            this.setParameter('sysparm_table', table)
            this.setParameter('sysparm_view', view)
            const layoutResult = JSON.parse(this.getLayout())
            
            if (layoutResult.error) {
                return JSON.stringify(layoutResult)
            }
            
            // Get current values if editing existing record
            let currentValues = {}
            if (sysId) {
                const record = new GlideRecord(table)
                if (record.get(sysId)) {
                    // Collect all field values from all sections
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
                view: view,
                sys_id: sysId,
                layout: layoutResult.form,
                values: currentValues
            })
            
        } catch (e) {
            gs.error('Error in TableUtils.getFormFields: ' + e.message)
            return JSON.stringify({ error: 'Failed to get form fields: ' + e.message })
        }
    }
    
    getListData() {
        const table = this.getParameter('sysparm_table')
        const view = this.getParameter('sysparm_view') || 'default'
        const limit = parseInt(this.getParameter('sysparm_limit') || '25')
        
        if (!table) {
            return JSON.stringify({ error: 'Table name required' })
        }
        
        try {
            // Get layout
            this.setParameter('sysparm_table', table)
            this.setParameter('sysparm_view', view)
            const layoutResult = JSON.parse(this.getLayout())
            
            if (layoutResult.error) {
                return JSON.stringify(layoutResult)
            }
            
            // Get actual records from the table
            const records = []
            const gr = new GlideRecord(table)
            gr.setLimit(limit)
            gr.query()
            
            while (gr.next()) {
                const record = { sys_id: gr.getUniqueValue() }
                
                // Get values for each configured column
                layoutResult.list.columns.forEach(column => {
                    record[column.name] = gr.getDisplayValue(column.name)
                })
                
                records.push(record)
            }
            
            return JSON.stringify({
                table: table,
                view: view,
                columns: layoutResult.list.columns,
                records: records,
                total: records.length
            })
            
        } catch (e) {
            gs.error('Error in TableUtils.getListData: ' + e.message)
            return JSON.stringify({ error: 'Failed to get list data: ' + e.message })
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
            return JSON.stringify({ error: 'Failed to save record: ' + e.message })
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
            return JSON.stringify({ error: 'Failed to delete record: ' + e.message })
        }
    }
}