import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import './Navigation.css'

interface NavigationProps {
    tableName: string
}

export default function Navigation({ tableName }: NavigationProps) {
    const navigate = useNavigate()
    const location = useLocation()

    const isActive = (path: string) => {
        if (path === '/incidents') {
            return location.pathname === '/' || location.pathname === '/incidents'
        }
        return location.pathname.startsWith(path)
    }

    const navigationButtons = [
        {
            label: 'Incidents',
            path: '/incidents',
            icon: '📋',
        },
        {
            label: 'Create New',
            path: '/incidents/new',
            icon: '➕',
        },
        {
            label: 'Dynamic Form',
            path: '/dynamic-form',
            icon: '📄',
        },
        {
            label: 'Stepper Workflow',
            path: '/stepper',
            icon: '📝',
        },
        {
            label: 'Dashboard',
            path: '/dashboard',
            icon: '📊',
        },
        {
            label: 'OOB Demo',
            path: '/oob-demo',
            icon: '🔧',
        },
    ]

    return (
        <nav className="navigation">
            <div className="nav-container">
                <div className="nav-brand">
                    <h2>ServiceNow Manager</h2>
                    <span className="table-badge">Table: {tableName}</span>
                </div>

                <div className="nav-buttons">
                    {navigationButtons.map((button) => (
                        <button
                            key={button.path}
                            className={`nav-button ${isActive(button.path) ? 'active' : ''}`}
                            onClick={() => navigate(button.path)}
                        >
                            <span className="nav-icon">{button.icon}</span>
                            <span className="nav-label">{button.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </nav>
    )
}