import React from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navigation from './components/Navigation'
import IncidentListPage from './pages/IncidentListPage'
import IncidentFormPage from './pages/IncidentFormPage'
import DashboardPage from './pages/DashboardPage'
import StepperPage from './pages/StepperPage'
import OOBDemoPage from './pages/OOBDemoPage'
import DynamicFormPage from './pages/DynamicFormPage'
import './app.css'

export default function App() {
    // Parse table name from URL query parameters
    const urlParams = new URLSearchParams(window.location.search)
    const tableName = urlParams.get('table') || 'incident'

    return (
        <HashRouter>
            <div className="app-container">
                <Navigation tableName={tableName} />
                <main className="main-content">
                    <Routes>
                        <Route path="/" element={<Navigate to="/incidents" replace />} />
                        <Route path="/incidents" element={<IncidentListPage tableName={tableName} />} />
                        <Route path="/incidents/new" element={<IncidentFormPage tableName={tableName} />} />
                        <Route path="/incidents/edit/:id" element={<IncidentFormPage tableName={tableName} />} />
                        <Route path="/dashboard" element={<DashboardPage tableName={tableName} />} />
                        <Route path="/stepper" element={<StepperPage tableName={tableName} />} />
                        <Route path="/oob-demo" element={<OOBDemoPage />} />
                        <Route path="/dynamic-form" element={<DynamicFormPage />} />
                    </Routes>
                </main>
            </div>
        </HashRouter>
    )
}