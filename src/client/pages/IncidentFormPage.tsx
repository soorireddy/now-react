import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { IncidentService } from '../services/IncidentService'
import IncidentForm from '../components/IncidentForm'

interface IncidentFormPageProps {
    tableName: string
}

export default function IncidentFormPage({ tableName }: IncidentFormPageProps) {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [incident, setIncident] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const incidentService = useMemo(() => new IncidentService(tableName), [tableName])
    const isEditing = Boolean(id)

    useEffect(() => {
        if (id) {
            loadIncident(id)
        }
    }, [id])

    const loadIncident = async (sysId: string) => {
        try {
            setLoading(true)
            setError(null)
            const data = await incidentService.get(sysId)
            setIncident(data)
        } catch (err: any) {
            setError('Failed to load incident: ' + (err.message || 'Unknown error'))
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (formData: any) => {
        try {
            setLoading(true)
            setError(null)
            
            if (isEditing && id) {
                await incidentService.update(id, formData)
            } else {
                await incidentService.create(formData)
            }
            
            // Navigate back to incidents list
            navigate('/incidents')
        } catch (err: any) {
            setError('Failed to save incident: ' + (err.message || 'Unknown error'))
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleCancel = () => {
        navigate('/incidents')
    }

    if (loading && isEditing) {
        return <div className="loading">Loading incident...</div>
    }

    return (
        <div className="incident-form-page">
            <div className="page-header">
                <h2>{isEditing ? 'Edit Incident' : 'Create New Incident'}</h2>
                <span className="table-info">Table: {tableName}</span>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                    <button onClick={() => setError(null)}>Dismiss</button>
                </div>
            )}

            <div className="form-container">
                <IncidentForm
                    incident={incident}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    loading={loading}
                />
            </div>
        </div>
    )
}