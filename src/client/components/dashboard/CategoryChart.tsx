import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';

interface CategoryData {
    category: string;
    incidents: number;
    avgResolutionTime: number;
}

interface CategoryChartProps {
    data?: CategoryData[];
}

export default function CategoryChart({ data }: CategoryChartProps) {
    if (!data || data.length === 0) {
        return <div>Loading category data...</div>;
    }

    return (
        <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
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
                        dataKey="category" 
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                    />
                    <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                    <YAxis 
                        yAxisId="right" 
                        orientation="right" 
                        tick={{ fontSize: 12 }}
                        label={{ value: 'Avg Resolution (hours)', angle: 90, position: 'insideRight' }}
                    />
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #ccc',
                            borderRadius: '4px'
                        }}
                        formatter={(value: number, name: string) => {
                            if (name === 'incidents') return [`${value} incidents`, 'Incident Count'];
                            if (name === 'avgResolutionTime') return [`${value}h`, 'Avg Resolution Time'];
                            return [value, name];
                        }}
                    />
                    <Legend />
                    <Bar 
                        yAxisId="left"
                        dataKey="incidents" 
                        fill="#3498db" 
                        name="incidents"
                        radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                        yAxisId="right"
                        dataKey="avgResolutionTime" 
                        fill="#e67e22"
                        name="avgResolutionTime"
                        radius={[4, 4, 0, 0]}
                    />
                    <ReferenceLine yAxisId="right" y={6} stroke="#e74c3c" strokeDasharray="5 5" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}