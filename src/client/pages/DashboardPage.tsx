import React from 'react'
import Dashboard from '../components/Dashboard'

interface DashboardPageProps {
    tableName: string
}

export default function DashboardPage({ tableName }: DashboardPageProps) {
    return (
        <div className="dashboard-page">
            <div className="page-header">
                <h2>Analytics Dashboard</h2>
                <span className="table-info">Table: {tableName}</span>
            </div>
            <Dashboard />
        </div>
    )
}