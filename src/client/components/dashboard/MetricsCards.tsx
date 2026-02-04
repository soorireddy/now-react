import React from 'react';

interface MetricsCardsProps {
    metrics?: {
        totalIncidents: number;
        openIncidents: number;
        resolvedIncidents: number;
        highPriorityIncidents: number;
    };
}

export default function MetricsCards({ metrics }: MetricsCardsProps) {
    if (!metrics) {
        return <div>Loading metrics...</div>;
    }

    return (
        <div className="metrics-grid">
            <div className="metric-card total">
                <div className="metric-value">{metrics.totalIncidents.toLocaleString()}</div>
                <div className="metric-label">Total Incidents</div>
            </div>
            <div className="metric-card open">
                <div className="metric-value">{metrics.openIncidents.toLocaleString()}</div>
                <div className="metric-label">Open Incidents</div>
            </div>
            <div className="metric-card resolved">
                <div className="metric-value">{metrics.resolvedIncidents.toLocaleString()}</div>
                <div className="metric-label">Resolved</div>
            </div>
            <div className="metric-card high-priority">
                <div className="metric-value">{metrics.highPriorityIncidents.toLocaleString()}</div>
                <div className="metric-label">High Priority</div>
            </div>
        </div>
    );
}