import React from 'react'
import { Link, useLocation } from 'react-router-dom'

interface NavigationProps {
    tableName: string
}

export default function Navigation({ tableName }: NavigationProps) {
    const location = useLocation()

    const isActive = (path: string) => {
        return location.pathname === path || location.pathname.startsWith(path)
    }

    return (
        <nav className="app-navigation">
            <div className="nav-header">
                <h1>Incident Manager</h1>
                <span className="table-info">Table: {tableName}</span>
            </div>
            <div className="nav-links">
                <Link 
                    to="/incidents" 
                    className={`nav-link ${isActive('/incidents') ? 'active' : ''}`}
                >
                    Incidents
                </Link>
                <Link 
                    to="/dashboard" 
                    className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                >
                    Dashboard
                </Link>
            </div>
        </nav>
    )
}