import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { IncidentService } from '../services/IncidentService'
import IncidentList from '../components/IncidentList'

interface IncidentListPageProps {
    tableName: string
}

export default function IncidentListPage({ tableName }: IncidentListPageProps) {
    const [incidents, setIncidents] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const incidentService = useMemo(() => new IncidentService(tableName), [tableName])

    const refreshIncidents = async () => {
        try {
            setLoading(true)
            setError(null)
            const data = await incidentService.list()
            setIncidents(data)
        } catch (err: any) {
            setError('Failed to load incidents: ' + (err.message || 'Unknown error'))
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        void refreshIncidents()
    }, [tableName])

    const handleEditClick = (incident: any) => {
        const sysId = typeof incident.sys_id === 'object' ? incident.sys_id.value : incident.sys_id
        window.location.href = `/x_845458_react_incident_manager.do#/incidents/edit/${sysId}?table=${tableName}`
    }

    return (
        <div className="incident-list-page">
            <div className="page-header">
                <h2>({tableName})</h2>
                <Link to="/incidents/new" className="create-button">
                    Create New Incident
                </Link>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                    <button onClick={() => setError(null)}>Dismiss</button>
                </div>
            )}

            {loading ? (
                <div className="loading">Loading incidents...</div>
            ) : (
                <IncidentList
                    incidents={incidents}
                    onEdit={handleEditClick}
                    onRefresh={refreshIncidents}
                    service={incidentService}
                />
            )}
        </div>
    )
}