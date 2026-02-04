import React from 'react'
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Navigation from './components/Navigation'
import IncidentListPage from './pages/IncidentListPage'
import IncidentFormPage from './pages/IncidentFormPage'
import DashboardPage from './pages/DashboardPage'
import StepperPage from './pages/StepperPage'
import './app.css'

export default function App() {
    // Get table name from URL query parameters (before hash)
    const getTableName = () => {
        const urlParts = window.location.href.split('#')[0] // Get part before hash
        const urlParams = new URLSearchParams(urlParts.split('?')[1] || '')
        return urlParams.get('table') || 'incident'
    }
    
    const tableName = getTableName()
    
    return (
        <Router>
            <div className="app">
                <Navigation tableName={tableName} />
                <main className="main-content">
                    <Routes>
                        <Route path="/" element={<Navigate to="/incidents" replace />} />
                        <Route path="/incidents" element={<IncidentListPage tableName={tableName} />} />
                        <Route path="/incidents/new" element={<IncidentFormPage tableName={tableName} />} />
                        <Route path="/incidents/edit/:id" element={<IncidentFormPage tableName={tableName} />} />
                        <Route path="/dashboard" element={<DashboardPage tableName={tableName} />} />
                        <Route path="/stepper" element={<StepperPage tableName={tableName} />} />
                    </Routes>
                </main>
            </div>
        </Router>
    )
}