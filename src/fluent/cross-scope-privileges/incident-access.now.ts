import '@servicenow/sdk/global'
import { CrossScopePrivilege } from '@servicenow/sdk/core'

// Cross-scope privilege to read incident table
CrossScopePrivilege({
    $id: Now.ID['incident_read_privilege'],
    status: 'requested',
    operation: 'read',
    target_name: 'incident',
    target_scope: 'global',
    target_type: 'sys_db_object',
})

// Cross-scope privilege to write to incident table
CrossScopePrivilege({
    $id: Now.ID['incident_write_privilege'],
    status: 'requested',
    operation: 'write',
    target_name: 'incident',
    target_scope: 'global',
    target_type: 'sys_db_object',
})

// Cross-scope privilege to create incident records
CrossScopePrivilege({
    $id: Now.ID['incident_create_privilege'],
    status: 'requested',
    operation: 'create',
    target_name: 'incident',
    target_scope: 'global',
    target_type: 'sys_db_object',
})

// Cross-scope privilege to delete incident records
CrossScopePrivilege({
    $id: Now.ID['incident_delete_privilege'],
    status: 'requested',
    operation: 'delete',
    target_name: 'incident',
    target_scope: 'global',
    target_type: 'sys_db_object',
})