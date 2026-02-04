import '@servicenow/sdk/global'
import { UiPage } from '@servicenow/sdk/core'
import dashboardPage from '../../client/dashboard-index.html'

UiPage({
    $id: Now.ID['analytics-dashboard-page'],
    endpoint: 'x_845458_react_analytics_dashboard.do',
    description: 'Analytics Dashboard with Charts and Grids',
    category: 'general',
    html: dashboardPage,
    direct: true,
})