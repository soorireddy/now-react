import React, { useState, useEffect, useMemo } from 'react';
import { DashboardService } from '../services/DashboardService';
import MetricsCards from './dashboard/MetricsCards';
import PriorityChart from './dashboard/PriorityChart';
import TrendChart from './dashboard/TrendChart';
import CategoryChart from './dashboard/CategoryChart';
import AssigneeGrid from './dashboard/AssigneeGrid';
import IncidentGrid from './dashboard/IncidentGrid';
import './Dashboard.css';

interface DashboardData {
    metrics: {
        totalIncidents: number;
        openIncidents: number;
        resolvedIncidents: number;
        highPriorityIncidents: number;
    };
    priorityData: Array<{
        priority: string;
        count: number;
        color: string;
    }>;
    trends: Array<{
        date: string;
        created: number;
        resolved: number;
        open: number;
    }>;
    categories: Array<{
        category: string;
        incidents: number;
        avgResolutionTime: number;
    }>;
    assigneePerformance: Array<{
        assignee: string;
        assigned: number;
        resolved: number;
        avgResolutionHours: number;
    }>;
    recentIncidents: Array<{
        sys_id: string;
        number: string;
        priority: string;
        state: string;
        short_description: string;
        assigned_to: string;
        created_on: string;
        resolved_at?: string;
    }>;
}

export default function Dashboard() {
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const dashboardService = useMemo(() => new DashboardService(), []);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await dashboardService.loadDashboardData();
            setDashboardData(data);
        } catch (err) {
            setError('Failed to load dashboard data: ' + (err instanceof Error ? err.message : 'Unknown error'));
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        loadDashboard();
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="loading-spinner"></div>
                <p>Loading Dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-error">
                <div className="error-content">
                    <h3>Dashboard Error</h3>
                    <p>{error}</p>
                    <button onClick={handleRefresh} className="retry-button">
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <h1>Analytics Dashboard</h1>
                <div className="dashboard-actions">
                    <button onClick={handleRefresh} className="refresh-button">
                        🔄 Refresh
                    </button>
                </div>
            </header>

            <div className="dashboard-content">
                {/* Metrics Cards Row */}
                <div className="dashboard-row">
                    <MetricsCards metrics={dashboardData?.metrics} />
                </div>

                {/* Charts Row */}
                <div className="dashboard-row">
                    <div className="dashboard-col-4">
                        <div className="dashboard-card">
                            <div className="card-header">
                                <h3>Incidents by Priority</h3>
                            </div>
                            <div className="card-content">
                                <PriorityChart data={dashboardData?.priorityData} />
                            </div>
                        </div>
                    </div>
                    <div className="dashboard-col-8">
                        <div className="dashboard-card">
                            <div className="card-header">
                                <h3>30-Day Incident Trends</h3>
                            </div>
                            <div className="card-content">
                                <TrendChart data={dashboardData?.trends} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Category Chart Row */}
                <div className="dashboard-row">
                    <div className="dashboard-col-12">
                        <div className="dashboard-card">
                            <div className="card-header">
                                <h3>Incidents by Category & Resolution Time</h3>
                            </div>
                            <div className="card-content">
                                <CategoryChart data={dashboardData?.categories} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Grids Row */}
                <div className="dashboard-row">
                    <div className="dashboard-col-6">
                        <div className="dashboard-card">
                            <div className="card-header">
                                <h3>Team Performance</h3>
                            </div>
                            <div className="card-content">
                                <AssigneeGrid data={dashboardData?.assigneePerformance} />
                            </div>
                        </div>
                    </div>
                    <div className="dashboard-col-6">
                        <div className="dashboard-card">
                            <div className="card-header">
                                <h3>Recent Incidents</h3>
                            </div>
                            <div className="card-content">
                                <IncidentGrid data={dashboardData?.recentIncidents} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}