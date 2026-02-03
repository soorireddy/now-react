import '@servicenow/sdk/global'

declare global {
    namespace Now {
        namespace Internal {
            interface Keys extends KeysRegistry {
                explicit: {
                    bom_json: {
                        table: 'sys_module'
                        id: 'c3e9e7f43760443da54b68962d036d85'
                    }
                    'incident-manager-page': {
                        table: 'sys_ui_page'
                        id: '1b6334fd138d49189d1ce9081b367414'
                    }
                    package_json: {
                        table: 'sys_module'
                        id: 'dd59fd604025429c84cb459319b28212'
                    }
                    'x_845458_react/main': {
                        table: 'sys_ux_lib_asset'
                        id: '5627094bd8d74cef80790b162bdb3cc6'
                    }
                    'x_845458_react/main.js.map': {
                        table: 'sys_ux_lib_asset'
                        id: 'b4b96f39bc3d47a7b4eafce742def161'
                    }
                }
            }
        }
    }
}
