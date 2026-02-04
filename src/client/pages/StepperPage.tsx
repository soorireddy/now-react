import React, { useState, useEffect } from 'react'
import { IncidentService } from '../services/IncidentService'
import IncidentList from '../components/IncidentList'
import './StepperPage.css'

interface StepperPageProps {
    tableName: string
}

interface FormData {
    short_description: string
    description: string
    state: string
    impact: string
}

const steps = ['Record Details', 'Review Existing', 'Final Review & Submit']

export default function StepperPage({ tableName }: StepperPageProps) {
    const [activeStep, setActiveStep] = useState(0)
    const [formData, setFormData] = useState<FormData>({
        short_description: '',
        description: '',
        state: '1',
        impact: '2',
    })
    const [incidents, setIncidents] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const incidentService = new IncidentService(tableName)

    const loadIncidents = async () => {
        try {
            setLoading(true)
            setError(null)
            const data = await incidentService.list()
            setIncidents(data.slice(0, 10))
        } catch (err: any) {
            setError('Failed to load incidents: ' + (err.message || 'Unknown error'))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (activeStep === 1) {
            loadIncidents()
        }
    }, [activeStep])

    const handleNext = () => {
        if (activeStep === 0 && !formData.short_description.trim()) {
            setError('Short description is required')
            return
        }
        setError(null)
        setActiveStep((prev) => prev + 1)
    }

    const handleBack = () => {
        setError(null)
        setActiveStep((prev) => prev - 1)
    }

    const handleFormChange = (field: keyof FormData, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    const handleSubmit = async () => {
        try {
            setLoading(true)
            setError(null)
            await incidentService.create(formData)
            setSuccess(true)
        } catch (err: any) {
            setError('Failed to create incident: ' + (err.message || 'Unknown error'))
        } finally {
            setLoading(false)
        }
    }

    const handleReset = () => {
        setActiveStep(0)
        setFormData({
            short_description: '',
            description: '',
            state: '1',
            impact: '2',
        })
        setIncidents([])
        setError(null)
        setSuccess(false)
    }

    const getStateLabel = (state: string) => {
        const states: Record<string, string> = {
            '1': 'New',
            '2': 'In Progress',
            '3': 'On Hold',
            '6': 'Resolved',
            '7': 'Closed',
        }
        return states[state] || state
    }

    const getImpactLabel = (impact: string) => {
        const impacts: Record<string, string> = {
            '1': '1 - High',
            '2': '2 - Medium',
            '3': '3 - Low',
        }
        return impacts[impact] || impact
    }

    if (success) {
        return (
            <div className="container">
                <div className="success-container">
                    <div className="success-icon">✅</div>
                    <h2>Success!</h2>
                    <p>Your incident has been created successfully.</p>
                    <button className="btn btn-primary" onClick={handleReset}>
                        Create Another Incident
                    </button>
                </div>
            </div>
        )
    }

    const renderStepContent = (step: number) => {
        switch (step) {
            case 0:
                return (
                    <div className="step-content">
                        <div className="form-group">
                            <label className="form-label">
                                Short Description *
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.short_description}
                                onChange={(e) => handleFormChange('short_description', e.target.value)}
                                maxLength={160}
                                placeholder="Enter a brief description..."
                            />
                            <small className="form-text">
                                {formData.short_description.length}/160 characters
                            </small>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                Description
                            </label>
                            <textarea
                                className="form-control"
                                rows={4}
                                value={formData.description}
                                onChange={(e) => handleFormChange('description', e.target.value)}
                                maxLength={4000}
                                placeholder="Enter detailed description..."
                            />
                            <small className="form-text">
                                {formData.description.length}/4000 characters
                            </small>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">State</label>
                                <select
                                    className="form-control"
                                    value={formData.state}
                                    onChange={(e) => handleFormChange('state', e.target.value)}
                                >
                                    <option value="1">New</option>
                                    <option value="2">In Progress</option>
                                    <option value="3">On Hold</option>
                                    <option value="6">Resolved</option>
                                    <option value="7">Closed</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Impact</label>
                                <select
                                    className="form-control"
                                    value={formData.impact}
                                    onChange={(e) => handleFormChange('impact', e.target.value)}
                                >
                                    <option value="1">1 - High</option>
                                    <option value="2">2 - Medium</option>
                                    <option value="3">3 - Low</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )

            case 1:
                return (
                    <div className="step-content">
                        <h4>Current Incidents (Showing first 10)</h4>
                        {loading ? (
                            <div className="loading-container">
                                <div className="spinner"></div>
                                <p>Loading incidents...</p>
                            </div>
                        ) : (
                            <IncidentList
                                incidents={incidents}
                                onEdit={() => {}}
                                onRefresh={loadIncidents}
                                service={incidentService}
                                readonly={true}
                            />
                        )}
                    </div>
                )

            case 2:
                return (
                    <div className="step-content">
                        <div className="review-grid">
                            <div className="review-section">
                                <h4>📝 New Record Details</h4>
                                <div className="review-card">
                                    <div className="review-item">
                                        <strong>Table:</strong> {tableName}
                                    </div>
                                    <div className="review-item">
                                        <strong>Short Description:</strong>
                                        <p>{formData.short_description || 'N/A'}</p>
                                    </div>
                                    <div className="review-item">
                                        <strong>Description:</strong>
                                        <p>{formData.description || 'No description provided'}</p>
                                    </div>
                                    <div className="review-item">
                                        <strong>State:</strong>
                                        <span className="badge state-badge">{getStateLabel(formData.state)}</span>
                                    </div>
                                    <div className="review-item">
                                        <strong>Impact:</strong>
                                        <span className="badge impact-badge">{getImpactLabel(formData.impact)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="review-section">
                                <h4>📋 Current Records Summary</h4>
                                <div className="review-card">
                                    <div className="review-item">
                                        <strong>Table:</strong> {tableName}
                                    </div>
                                    <div className="review-item">
                                        <strong>Total Records:</strong> {incidents.length}
                                    </div>
                                    <div className="records-preview">
                                        {incidents.slice(0, 5).map((incident, index) => {
                                            const number = typeof incident.number === 'object' 
                                                ? incident.number.display_value 
                                                : incident.number
                                            const shortDesc = typeof incident.short_description === 'object' 
                                                ? incident.short_description.display_value 
                                                : incident.short_description
                                            const state = typeof incident.state === 'object' 
                                                ? incident.state.display_value 
                                                : incident.state

                                            return (
                                                <div key={index} className="record-preview">
                                                    <div className="record-number">{number}</div>
                                                    <div className="record-desc">{shortDesc}</div>
                                                    <span className="badge">{state}</span>
                                                </div>
                                            )
                                        })}
                                        {incidents.length > 5 && (
                                            <div className="more-records">
                                                ... and {incidents.length - 5} more records
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )

            default:
                return <div>Unknown step</div>
        }
    }

    return (
        <div className="container">
            <div className="stepper-container">
                <h1>Create New {tableName.charAt(0).toUpperCase() + tableName.slice(1)} - Step by Step</h1>

                {/* Stepper Header */}
                <div className="stepper">
                    {steps.map((label, index) => (
                        <div key={index} className={`step ${index <= activeStep ? 'active' : ''}`}>
                            <div className="step-number">{index + 1}</div>
                            <div className="step-label">{label}</div>
                        </div>
                    ))}
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="alert alert-error">
                        <span>⚠️</span>
                        <div>
                            <strong>Error:</strong> {error}
                        </div>
                        <button 
                            className="alert-close"
                            onClick={() => setError(null)}
                        >
                            ×
                        </button>
                    </div>
                )}

                {/* Step Content */}
                <div className="stepper-content">
                    {renderStepContent(activeStep)}
                </div>

                {/* Navigation */}
                <div className="stepper-actions">
                    <button
                        className="btn btn-secondary"
                        disabled={activeStep === 0}
                        onClick={handleBack}
                    >
                        ← Back
                    </button>
                    
                    <div className="spacer"></div>
                    
                    {activeStep === steps.length - 1 ? (
                        <button
                            className="btn btn-success"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <div className="spinner-small"></div>
                                    Creating...
                                </>
                            ) : (
                                <>
                                    💾 Create Incident
                                </>
                            )}
                        </button>
                    ) : (
                        <button
                            className="btn btn-primary"
                            onClick={handleNext}
                        >
                            Next →
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}