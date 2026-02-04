import React, { useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

interface AssigneePerformance {
    assignee: string;
    assigned: number;
    resolved: number;
    avgResolutionHours: number;
}

interface AssigneeGridProps {
    data?: AssigneePerformance[];
}

export default function AssigneeGrid({ data }: AssigneeGridProps) {
    const columnDefs = useMemo(() => [
        {
            field: 'assignee',
            headerName: 'Assignee',
            flex: 2,
            sortable: true,
            filter: true,
        },
        {
            field: 'assigned',
            headerName: 'Assigned',
            flex: 1,
            sortable: true,
            filter: 'agNumberColumnFilter',
            cellStyle: { textAlign: 'center' }
        },
        {
            field: 'resolved',
            headerName: 'Resolved',
            flex: 1,
            sortable: true,
            filter: 'agNumberColumnFilter',
            cellStyle: { textAlign: 'center' },
            cellRenderer: (params: any) => {
                const percentage = params.data.assigned > 0 ? 
                    ((params.value / params.data.assigned) * 100).toFixed(1) : '0';
                return `${params.value} (${percentage}%)`;
            }
        },
        {
            field: 'avgResolutionHours',
            headerName: 'Avg Resolution',
            flex: 1.5,
            sortable: true,
            filter: 'agNumberColumnFilter',
            cellStyle: { textAlign: 'center' },
            cellRenderer: (params: any) => {
                const hours = params.value;
                const cellStyle = hours > 6 ? { color: '#e74c3c' } : 
                                hours > 4 ? { color: '#f39c12' } : 
                                { color: '#27ae60' };
                return `<span style="color: ${cellStyle.color}">${hours}h</span>`;
            }
        }
    ], []);

    const defaultColDef = useMemo(() => ({
        resizable: true,
        sortable: true,
        filter: true,
    }), []);

    if (!data || data.length === 0) {
        return <div>Loading assignee data...</div>;
    }

    return (
        <div className="grid-container ag-theme-alpine">
            <AgGridReact
                rowData={data}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                animateRows={true}
                rowSelection="single"
                pagination={false}
                domLayout="autoHeight"
            />
        </div>
    );
}