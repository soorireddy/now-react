import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

interface TrendData {
    date: string;
    created: number;
    resolved: number;
    open: number;
}

interface TrendChartProps {
    data?: TrendData[];
}

export default function TrendChart({ data }: TrendChartProps) {
    if (!data || data.length === 0) {
        return <div>Loading trend data...</div>;
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={data}
                    margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }}
                        tickFormatter={formatDate}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                        labelFormatter={(label) => `Date: ${formatDate(label)}`}
                        contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #ccc',
                            borderRadius: '4px'
                        }}
                    />
                    <Legend />
                    <Line 
                        type="monotone" 
                        dataKey="created" 
                        stroke="#e74c3c" 
                        strokeWidth={3}
                        dot={{ fill: '#e74c3c', strokeWidth: 2, r: 4 }}
                        name="Created"
                    />
                    <Line 
                        type="monotone" 
                        dataKey="resolved" 
                        stroke="#27ae60" 
                        strokeWidth={3}
                        dot={{ fill: '#27ae60', strokeWidth: 2, r: 4 }}
                        name="Resolved"
                    />
                    <Line 
                        type="monotone" 
                        dataKey="open" 
                        stroke="#f39c12" 
                        strokeWidth={3}
                        dot={{ fill: '#f39c12', strokeWidth: 2, r: 4 }}
                        name="Open"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}