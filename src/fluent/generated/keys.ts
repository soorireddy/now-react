import '@servicenow/sdk/global'

declare global {
    namespace Now {
        namespace Internal {
            interface Keys extends KeysRegistry {
                explicit: {
                    'analytics-dashboard-page': {
                        table: 'sys_ui_page'
                        id: '9875b683956343ea9e76f29a46e476a7'
                    }
                    bom_json: {
                        table: 'sys_module'
                        id: 'c3e9e7f43760443da54b68962d036d85'
                    }
                    incident_create_privilege: {
                        table: 'sys_scope_privilege'
                        id: '1b53a55c4c3a4a31973dec1b2496131b'
                    }
                    incident_delete_privilege: {
                        table: 'sys_scope_privilege'
                        id: '31f6c3ec4b45449fba1e5b783bf181f8'
                    }
                    incident_read_privilege: {
                        table: 'sys_scope_privilege'
                        id: 'd906c6be4512441695882390ec34bbcb'
                    }
                    incident_write_privilege: {
                        table: 'sys_scope_privilege'
                        id: '02b7f5e5d3b74a968b575dfc55895d0a'
                    }
                    'incident-manager-page': {
                        table: 'sys_ui_page'
                        id: '1b6334fd138d49189d1ce9081b367414'
                    }
                    'node_modules/ag-grid-community/styles/ag-grid.css': {
                        table: 'sys_ux_theme_asset'
                        id: '0d659aa1501b4f8a813e905dae6b5549'
                        deleted: true
                    }
                    'node_modules/ag-grid-community/styles/ag-theme-alpine.css': {
                        table: 'sys_ux_theme_asset'
                        id: '75a033b2dad24146a14ba86a0a94a423'
                        deleted: true
                    }
                    package_json: {
                        table: 'sys_module'
                        id: 'dd59fd604025429c84cb459319b28212'
                    }
                    'src_server_table-utils_js': {
                        table: 'sys_module'
                        id: '6939acbe6fa74b37be8683fe0aba3d51'
                    }
                    'table-utils': {
                        table: 'sys_script_include'
                        id: 'eeb1fb15e5604920a0a44eed932006f4'
                    }
                    'x_1872892_react/____insertStyle': {
                        table: 'sys_ux_lib_asset'
                        id: '480ce7fc222a4c3599bbe03583817c58'
                        deleted: true
                    }
                    'x_1872892_react/____insertStyle.js.map': {
                        table: 'sys_ux_lib_asset'
                        id: '8a47f5d4c0b94070927872c03fb36753'
                        deleted: true
                    }
                    'x_1872892_react/Dashboard': {
                        table: 'sys_ux_lib_asset'
                        id: 'a29f074bfeff459f89dd5774bbe47ce0'
                    }
                    'x_1872892_react/dashboard-main': {
                        table: 'sys_ux_lib_asset'
                        id: '0b443a62b78c45bc9a4de330539e6c68'
                    }
                    'x_1872892_react/dashboard-main.js.map': {
                        table: 'sys_ux_lib_asset'
                        id: '3b89be6b720c4e2189c9771a3b52d8e9'
                    }
                    'x_1872892_react/Dashboard.js.map': {
                        table: 'sys_ux_lib_asset'
                        id: 'e5c003c8e5e74e23b29788863c1cefb3'
                    }
                    'x_1872892_react/main': {
                        table: 'sys_ux_lib_asset'
                        id: '5627094bd8d74cef80790b162bdb3cc6'
                    }
                    'x_1872892_react/main.js.map': {
                        table: 'sys_ux_lib_asset'
                        id: 'b4b96f39bc3d47a7b4eafce742def161'
                    }
                }
                composite: [
                    {
                        table: 'sys_user_role'
                        id: '1ef3b5a283f6f210c7e81c29feaad30b'
                        key: {
                            name: 'x_1872892_react.admin'
                        }
                    },
                    {
                        table: 'sys_user_role'
                        id: '1ef3b5a283f6f210c7e81c29feaad314'
                        key: {
                            name: 'x_1872892_react.user'
                        }
                    },
                    {
                        table: 'sys_user_role'
                        id: '9af375a283f6f210c7e81c29feaad3fd'
                        deleted: true
                        key: {
                            name: 'x_1872892_react.asd'
                        }
                    },
                ]
            }
        }
    }
}
