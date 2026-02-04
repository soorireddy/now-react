import React, { useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

interface IncidentDetails {
    sys_id: string;
    number: string;
    priority: string;
    state: string;
    short_description: string;
    assigned_to: string;
    created_on: string;
    resolved_at?: string;
}

interface IncidentGridProps {
    data?: IncidentDetails[];
}

export default function IncidentGrid({ data }: IncidentGridProps) {
    const columnDefs = useMemo(() => [
        {
            field: 'number',
            headerName: 'Number',
            flex: 1,
            sortable: true,
            filter: true,
            pinned: 'left'
        },
        {
            field: 'priority',
            headerName: 'Priority',
            flex: 1,
            sortable: true,
            filter: true,
            cellRenderer: (params: any) => {
                const priority = params.value;
                let colorClass = '';
                switch (priority) {
                    case 'Critical':
                        colorClass = '#e74c3c';
                        break;
                    case 'High':
                        colorClass = '#f39c12';
                        break;
                    case 'Medium':
                        colorClass = '#3498db';
                        break;
                    case 'Low':
                        colorClass = '#27ae60';
                        break;
                    default:
                        colorClass = '#95a5a6';
                }
                return `<span style="color: ${colorClass}; font-weight: bold;">● ${priority}</span>`;
            }
        },
        {
            field: 'state',
            headerName: 'State',
            flex: 1,
            sortable: true,
            filter: true,
            cellRenderer: (params: any) => {
                const state = params.value;
                let backgroundColor = '';
                let textColor = 'white';
                switch (state) {
                    case 'New':
                        backgroundColor = '#e74c3c';
                        break;
                    case 'In Progress':
                        backgroundColor = '#f39c12';
                        break;
                    case 'On Hold':
                        backgroundColor = '#95a5a6';
                        break;
                    case 'Resolved':
                        backgroundColor = '#27ae60';
                        break;
                    case 'Closed':
                        backgroundColor = '#2c3e50';
                        break;
                    default:
                        backgroundColor = '#bdc3c7';
                        textColor = '#2c3e50';
                }
                return `<span style="background-color: ${backgroundColor}; color: ${textColor}; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">${state}</span>`;
            }
        },
        {
            field: 'short_description',
            headerName: 'Description',
            flex: 3,
            sortable: true,
            filter: true,
            cellRenderer: (params: any) => {
                const description = params.value;
                return `<div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${description}">${description}</div>`;
            }
        },
        {
            field: 'assigned_to',
            headerName: 'Assignee',
            flex: 1.5,
            sortable: true,
            filter: true,
        },
        {
            field: 'created_on',
            headerName: 'Created',
            flex: 1.5,
            sortable: true,
            filter: 'agDateColumnFilter',
            cellRenderer: (params: any) => {
                const date = new Date(params.value);
                return date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }
        }
    ], []);

    const defaultColDef = useMemo(() => ({
        resizable: true,
        sortable: true,
        filter: true,
        suppressMenu: true,
    }), []);

    if (!data || data.length === 0) {
        return <div>Loading incident data...</div>;
    }

    return (
        <div className="grid-container ag-theme-alpine">
            <AgGridReact
                rowData={data.slice(0, 20)} // Limit to first 20 for performance
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                animateRows={true}
                rowSelection="single"
                pagination={false}
                domLayout="autoHeight"
                rowHeight={40}
                headerHeight={35}
            />
        </div>
    );
}