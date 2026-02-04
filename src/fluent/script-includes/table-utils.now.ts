import '@servicenow/sdk/global'
import { ScriptInclude } from '@servicenow/sdk/core'

ScriptInclude({
    $id: Now.ID['table-utils'],
    name: 'TableUtils',
    clientCallable: true,
    description: 'Utility functions for handling table operations from UI Pages',
    script: Now.include('../../server/table-utils.js'),
})