import React, { useState, useMemo } from 'react'
import {
    Box,
    Stepper,
    Step,
    StepLabel,
    Button,
    Typography,
    Paper,
    Container,
    Grid,
    Card,
    CardContent,
    Divider,
} from '@mui/material'
import { IncidentService } from '../services/IncidentService'
import IncidentForm from '../components/IncidentForm'
import IncidentList from '../components/IncidentList'
import './StepperPage.css'

interface StepperPageProps {
    tableName: string
}

interface FormData {
    short_description: string
    description?: string
    state: string
    impact: string
}

const steps = ['Record Details', 'Review List', 'Final Review']

export default function StepperPage({ tableName }: StepperPageProps) {
    const [activeStep, setActiveStep] = useState(0)
    const [formData, setFormData] = useState<FormData | null>(null)
    const [incidents, setIncidents] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const incidentService = useMemo(() => new IncidentService(tableName), [tableName])

    const handleNext = () => {
        if (activeStep === 1) {
            // When moving from step 1 to step 2, load incidents
            loadIncidents()
        }
        setActiveStep((prevActiveStep) => prevActiveStep + 1)
    }

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1)
    }

    const handleReset = () => {
        setActiveStep(0)
        setFormData(null)
        setIncidents([])
        setError(null)
    }

    const loadIncidents = async () => {
        try {
            setLoading(true)
            setError(null)
            const data = await incidentService.list()
            setIncidents(data.slice(0, 10)) // Show only first 10 for demonstration
        } catch (err: any) {
            setError('Failed to load incidents: ' + (err.message || 'Unknown error'))
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleFormSubmit = async (data: FormData) => {
        setFormData(data)
        handleNext()
    }

    const handleFormCancel = () => {
        handleReset()
    }

    const handleFinalSubmit = async () => {
        if (!formData) return

        try {
            setLoading(true)
            setError(null)
            await incidentService.create(formData)
            // After successful creation, show success and reset
            alert('Record created successfully!')
            handleReset()
        } catch (err: any) {
            setError('Failed to create record: ' + (err.message || 'Unknown error'))
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const getStepContent = (step: number) => {
        switch (step) {
            case 0:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Step 1: Enter Record Details
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            Fill out the form below to create a new {tableName} record.
                        </Typography>
                        <Paper elevation={2} sx={{ p: 2 }}>
                            <IncidentForm
                                onSubmit={handleFormSubmit}
                                onCancel={handleFormCancel}
                                loading={loading}
                            />
                        </Paper>
                    </Box>
                )
            case 1:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Step 2: Review Existing Records
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            Review the current list of {tableName} records before proceeding.
                        </Typography>
                        <Paper elevation={2} sx={{ p: 2 }}>
                            {loading ? (
                                <Typography>Loading records...</Typography>
                            ) : (
                                <IncidentList
                                    incidents={incidents}
                                    onEdit={() => {}} // Disable edit in stepper
                                    onRefresh={loadIncidents}
                                    service={incidentService}
                                    readonly={true}
                                />
                            )}
                        </Paper>
                    </Box>
                )
            case 2:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Step 3: Final Review
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            Review your new record details and the current list before final submission.
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom color="primary">
                                            Your New Record
                                        </Typography>
                                        {formData && (
                                            <Box>
                                                <Typography variant="body2">
                                                    <strong>Short Description:</strong> {formData.short_description}
                                                </Typography>
                                                <Typography variant="body2" sx={{ mt: 1 }}>
                                                    <strong>Description:</strong> {formData.description || 'N/A'}
                                                </Typography>
                                                <Typography variant="body2" sx={{ mt: 1 }}>
                                                    <strong>State:</strong> {
                                                        formData.state === '1' ? 'New' :
                                                        formData.state === '2' ? 'In Progress' :
                                                        formData.state === '3' ? 'On Hold' :
                                                        formData.state === '6' ? 'Resolved' :
                                                        formData.state === '7' ? 'Closed' : 'Unknown'
                                                    }
                                                </Typography>
                                                <Typography variant="body2" sx={{ mt: 1 }}>
                                                    <strong>Impact:</strong> {
                                                        formData.impact === '1' ? '1 - High' :
                                                        formData.impact === '2' ? '2 - Medium' :
                                                        formData.impact === '3' ? '3 - Low' : 'Unknown'
                                                    }
                                                </Typography>
                                            </Box>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom color="primary">
                                            Current Records Summary
                                        </Typography>
                                        <Typography variant="body2">
                                            <strong>Total Records:</strong> {incidents.length}
                                        </Typography>
                                        <Typography variant="body2" sx={{ mt: 1 }}>
                                            <strong>Table:</strong> {tableName}
                                        </Typography>
                                        {incidents.length > 0 && (
                                            <>
                                                <Divider sx={{ my: 2 }} />
                                                <Typography variant="body2" color="text.secondary">
                                                    Recent Records:
                                                </Typography>
                                                {incidents.slice(0, 3).map((incident: any, index: number) => (
                                                    <Typography key={index} variant="body2" sx={{ mt: 0.5 }}>
                                                        • {incident.short_description?.display_value || incident.short_description || 'No description'}
                                                    </Typography>
                                                ))}
                                            </>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </Box>
                )
            default:
                return 'Unknown step'
        }
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom align="center">
                    {tableName.charAt(0).toUpperCase() + tableName.slice(1)} Workflow
                </Typography>
                
                <Box sx={{ width: '100%', mb: 4 }}>
                    <Stepper activeStep={activeStep}>
                        {steps.map((label, index) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                </Box>

                {error && (
                    <Paper 
                        elevation={1} 
                        sx={{ 
                            p: 2, 
                            mb: 3, 
                            backgroundColor: '#ffebee', 
                            borderLeft: '4px solid #d32f2f' 
                        }}
                    >
                        <Typography color="error">{error}</Typography>
                        <Button size="small" onClick={() => setError(null)} sx={{ mt: 1 }}>
                            Dismiss
                        </Button>
                    </Paper>
                )}

                <Box sx={{ mb: 4 }}>
                    {getStepContent(activeStep)}
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                    <Button
                        color="inherit"
                        disabled={activeStep === 0 || loading}
                        onClick={handleBack}
                        sx={{ mr: 1 }}
                    >
                        Back
                    </Button>
                    <Box sx={{ flex: '1 1 auto' }} />
                    
                    {activeStep === steps.length - 1 ? (
                        <Button 
                            onClick={handleFinalSubmit} 
                            disabled={loading}
                            variant="contained"
                            color="primary"
                        >
                            {loading ? 'Creating...' : 'Create Record'}
                        </Button>
                    ) : (
                        <Button 
                            onClick={handleNext}
                            disabled={activeStep === 0 && !formData}
                            variant="contained"
                        >
                            Next
                        </Button>
                    )}
                </Box>

                {activeStep === steps.length && (
                    <Paper square elevation={0} sx={{ p: 3, mt: 3, backgroundColor: '#e8f5e8' }}>
                        <Typography variant="h6" gutterBottom>
                            All steps completed - you&apos;re finished!
                        </Typography>
                        <Button onClick={handleReset} sx={{ mt: 1, mr: 1 }}>
                            Start Over
                        </Button>
                    </Paper>
                )}
            </Paper>
        </Container>
    )
}