import '@servicenow/sdk/global'
import { UiPage } from '@servicenow/sdk/core'
import incidentPage from '../../client/index.html'

UiPage({
    $id: Now.ID['incident-manager-page'],
    endpoint: 'x_845458_react_incident_manager.do',
    description: 'Incident Response Manager UI Page with React Router - supports ?table=<table_name> query parameter',
    category: 'general',
    html: incidentPage,
    direct: true,
})