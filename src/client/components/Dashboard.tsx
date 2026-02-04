import React, { useState, useEffect } from 'react'
import { DashboardService } from '../services/DashboardService'
import './Dashboard.css'

interface DashboardData {
    metrics: {
        totalIncidents: number
        openIncidents: number
        resolvedIncidents: number
        highPriorityIncidents: number
    }
    priorityData: Array<{ priority: string; count: number; color: string }>
    trends: Array<{ date: string; created: number; resolved: number; open: number }>
    categories: Array<{ category: string; incidents: number; avgResolutionTime: number }>
    assigneePerformance: Array<{ assignee: string; assigned: number; resolved: number; avgResolutionHours: number }>
    recentIncidents: Array<any>
}

export default function Dashboard() {
    const [data, setData] = useState<DashboardData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const dashboardService = new DashboardService()

    const loadDashboardData = async () => {
        try {
            setLoading(true)
            setError(null)
            const dashboardData = await dashboardService.loadDashboardData()
            setData(dashboardData)
        } catch (err: any) {
            setError(err.message || 'Failed to load dashboard data')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadDashboardData()
    }, [])

    if (loading) {
        return (
            <div className="dashboard-container">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <div className="loading-text">Loading Dashboard...</div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="dashboard-container">
                <div className="error-container">
                    <div className="error-message">
                        <strong>Error:</strong> {error}
                    </div>
                    <button className="retry-button" onClick={loadDashboardData}>
                        Try Again
                    </button>
                </div>
            </div>
        )
    }

    if (!data) return null

    const calculatePercentage = (value: number, total: number) => {
        return total > 0 ? Math.round((value / total) * 100) : 0
    }

    const getStatusColor = (priority: string) => {
        switch (priority.toLowerCase()) {
            case 'critical': return '#dc3545'
            case 'high': return '#fd7e14'
            case 'medium': return '#ffc107'
            case 'low': return '#28a745'
            default: return '#6c757d'
        }
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Analytics Dashboard</h1>
                <button className="refresh-button" onClick={loadDashboardData}>
                    🔄 Refresh
                </button>
            </div>

            {/* Metrics Cards */}
            <div className="metrics-grid">
                <div className="metric-card">
                    <div className="metric-icon">📊</div>
                    <div className="metric-content">
                        <div className="metric-label">Total Incidents</div>
                        <div className="metric-value">{data.metrics.totalIncidents}</div>
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-icon">⚠️</div>
                    <div className="metric-content">
                        <div className="metric-label">Open Incidents</div>
                        <div className="metric-value">{data.metrics.openIncidents}</div>
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-icon">✅</div>
                    <div className="metric-content">
                        <div className="metric-label">Resolved</div>
                        <div className="metric-value">{data.metrics.resolvedIncidents}</div>
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-icon">🔴</div>
                    <div className="metric-content">
                        <div className="metric-label">High Priority</div>
                        <div className="metric-value">{data.metrics.highPriorityIncidents}</div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="charts-grid">
                {/* Priority Distribution */}
                <div className="chart-card">
                    <h3>Incidents by Priority</h3>
                    <div className="priority-chart">
                        {data.priorityData.map((item, index) => (
                            <div key={index} className="priority-item">
                                <div className="priority-bar">
                                    <div 
                                        className="priority-fill"
                                        style={{ 
                                            width: `${calculatePercentage(item.count, data.metrics.totalIncidents)}%`,
                                            backgroundColor: getStatusColor(item.priority)
                                        }}
                                    ></div>
                                </div>
                                <div className="priority-info">
                                    <span className="priority-label">{item.priority}</span>
                                    <span className="priority-count">{item.count}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Trends */}
                <div className="chart-card">
                    <h3>7-Day Trends</h3>
                    <div className="trends-chart">
                        <div className="trends-legend">
                            <span className="legend-item">
                                <span className="legend-color created"></span> Created
                            </span>
                            <span className="legend-item">
                                <span className="legend-color resolved"></span> Resolved
                            </span>
                            <span className="legend-item">
                                <span className="legend-color open"></span> Open
                            </span>
                        </div>
                        <div className="trends-bars">
                            {data.trends.slice(-7).map((trend, index) => (
                                <div key={index} className="trend-day">
                                    <div className="trend-bars-container">
                                        <div className="trend-bar created" style={{ height: `${trend.created * 3}px` }}></div>
                                        <div className="trend-bar resolved" style={{ height: `${trend.resolved * 3}px` }}></div>
                                        <div className="trend-bar open" style={{ height: `${trend.open * 3}px` }}></div>
                                    </div>
                                    <div className="trend-date">
                                        {new Date(trend.date).getDate()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Categories Table */}
            <div className="table-section">
                <div className="table-card">
                    <h3>Categories & Resolution Time</h3>
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Category</th>
                                    <th>Incidents</th>
                                    <th>Avg Resolution (hours)</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.categories.map((category, index) => (
                                    <tr key={index}>
                                        <td>{category.category}</td>
                                        <td>{category.incidents}</td>
                                        <td>{category.avgResolutionTime}</td>
                                        <td>
                                            <span 
                                                className={`status-badge ${category.avgResolutionTime < 5 ? 'good' : category.avgResolutionTime < 10 ? 'warning' : 'critical'}`}
                                            >
                                                {category.avgResolutionTime < 5 ? 'Good' : category.avgResolutionTime < 10 ? 'Warning' : 'Critical'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Team Performance */}
            <div className="table-section">
                <div className="table-card">
                    <h3>Team Performance</h3>
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Assignee</th>
                                    <th>Assigned</th>
                                    <th>Resolved</th>
                                    <th>Resolution Rate</th>
                                    <th>Avg Hours</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.assigneePerformance.map((assignee, index) => {
                                    const resolutionRate = calculatePercentage(assignee.resolved, assignee.assigned)
                                    return (
                                        <tr key={index}>
                                            <td>{assignee.assignee}</td>
                                            <td>{assignee.assigned}</td>
                                            <td>{assignee.resolved}</td>
                                            <td>
                                                <div className="progress-bar">
                                                    <div 
                                                        className="progress-fill"
                                                        style={{ width: `${resolutionRate}%` }}
                                                    ></div>
                                                    <span className="progress-text">{resolutionRate}%</span>
                                                </div>
                                            </td>
                                            <td>{assignee.avgResolutionHours}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}