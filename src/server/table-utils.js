import { gs, GlideRecord } from '@servicenow/glide'

class TableUtils {
    type = 'ajax'
    
    getFormFields() {
        const table = this.getParameter('sysparm_table')
        const sysId = this.getParameter('sysparm_sys_id')
        
        if (!table) {
            return JSON.stringify({ error: 'Table name required' })
        }
        
        try {
            // Get table dictionary information
            const fields = []
            const dict = new GlideRecord('sys_dictionary')
            dict.addQuery('name', table)
            dict.addQuery('active', true)
            dict.orderBy('order')
            dict.query()
            
            while (dict.next()) {
                if (dict.getValue('element') === '') continue // Skip table-level record
                
                const field = {
                    name: dict.getValue('element'),
                    label: dict.getDisplayValue('column_label') || dict.getValue('element'),
                    type: dict.getValue('internal_type'),
                    mandatory: dict.getValue('mandatory') === 'true',
                    readonly: dict.getValue('read_only') === 'true',
                    max_length: dict.getValue('max_length'),
                    reference_table: dict.getValue('reference'),
                    choices: [],
                    value: ''
                }
                
                // Get choice options for choice fields
                if (field.type === 'choice') {
                    const choices = new GlideRecord('sys_choice')
                    choices.addQuery('name', table)
                    choices.addQuery('element', field.name)
                    choices.orderBy('sequence')
                    choices.query()
                    
                    while (choices.next()) {
                        field.choices.push({
                            value: choices.getValue('value'),
                            label: choices.getDisplayValue('label')
                        })
                    }
                }
                
                // Get current value if editing existing record
                if (sysId) {
                    const record = new GlideRecord(table)
                    if (record.get(sysId)) {
                        field.value = record.getDisplayValue(field.name)
                    }
                }
                
                fields.push(field)
            }
            
            return JSON.stringify({
                table: table,
                sys_id: sysId,
                fields: fields
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
            // Get list layout information
            const columns = []
            const listDict = new GlideRecord('sys_dictionary')
            listDict.addQuery('name', table)
            listDict.addQuery('active', true)
            listDict.addQuery('list_column', true)
            listDict.orderBy('order')
            listDict.query()
            
            while (listDict.next()) {
                if (listDict.getValue('element') === '') continue
                
                columns.push({
                    name: listDict.getValue('element'),
                    label: listDict.getDisplayValue('column_label') || listDict.getValue('element'),
                    type: listDict.getValue('internal_type')
                })
            }
            
            // If no list columns defined, use basic ones
            if (columns.length === 0) {
                if (table === 'incident') {
                    columns.push(
                        { name: 'number', label: 'Number', type: 'string' },
                        { name: 'short_description', label: 'Short Description', type: 'string' },
                        { name: 'state', label: 'State', type: 'choice' },
                        { name: 'priority', label: 'Priority', type: 'choice' }
                    )
                } else {
                    columns.push(
                        { name: 'name', label: 'Name', type: 'string' },
                        { name: 'sys_created_on', label: 'Created', type: 'glide_date_time' }
                    )
                }
            }
            
            // Get records
            const records = []
            const gr = new GlideRecord(table)
            gr.setLimit(limit)
            gr.query()
            
            while (gr.next()) {
                const record = { sys_id: gr.getUniqueValue() }
                columns.forEach(column => {
                    record[column.name] = gr.getDisplayValue(column.name)
                })
                records.push(record)
            }
            
            return JSON.stringify({
                table: table,
                columns: columns,
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