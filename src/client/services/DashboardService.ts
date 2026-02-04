export interface DashboardMetrics {
    totalIncidents: number;
    openIncidents: number;
    resolvedIncidents: number;
    highPriorityIncidents: number;
}

export interface IncidentByPriority {
    priority: string;
    count: number;
    color: string;
}

export interface IncidentTrend {
    date: string;
    created: number;
    resolved: number;
    open: number;
}

export interface IncidentDetails {
    sys_id: string;
    number: string;
    priority: string;
    state: string;
    short_description: string;
    assigned_to: string;
    created_on: string;
    resolved_at?: string;
}

export interface CategoryData {
    category: string;
    incidents: number;
    avgResolutionTime: number;
}

export interface AssigneePerformance {
    assignee: string;
    assigned: number;
    resolved: number;
    avgResolutionHours: number;
}

export class DashboardService {
    // Generate fake dashboard metrics
    getMetrics(): DashboardMetrics {
        return {
            totalIncidents: 1247,
            openIncidents: 89,
            resolvedIncidents: 1158,
            highPriorityIncidents: 23
        };
    }

    // Generate fake incident priority data for pie chart
    getIncidentsByPriority(): IncidentByPriority[] {
        return [
            { priority: 'Critical', count: 12, color: '#ff4757' },
            { priority: 'High', count: 34, color: '#ff7675' },
            { priority: 'Medium', count: 78, color: '#fdcb6e' },
            { priority: 'Low', count: 45, color: '#00b894' },
            { priority: 'Planning', count: 18, color: '#74b9ff' }
        ];
    }

    // Generate fake trend data for line chart
    getIncidentTrends(): IncidentTrend[] {
        const trends: IncidentTrend[] = [];
        const today = new Date();
        
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            
            const created = Math.floor(Math.random() * 20) + 5;
            const resolved = Math.floor(Math.random() * 18) + 3;
            const open = Math.max(0, created - resolved + Math.floor(Math.random() * 10));
            
            trends.push({
                date: date.toISOString().split('T')[0],
                created,
                resolved,
                open
            });
        }
        
        return trends;
    }

    // Generate fake category data for bar chart
    getCategoryData(): CategoryData[] {
        return [
            { category: 'Network', incidents: 45, avgResolutionTime: 4.2 },
            { category: 'Hardware', incidents: 32, avgResolutionTime: 8.7 },
            { category: 'Software', incidents: 78, avgResolutionTime: 3.1 },
            { category: 'Security', incidents: 23, avgResolutionTime: 12.5 },
            { category: 'Database', incidents: 19, avgResolutionTime: 6.8 },
            { category: 'Application', incidents: 56, avgResolutionTime: 5.3 }
        ];
    }

    // Generate fake assignee performance data
    getAssigneePerformance(): AssigneePerformance[] {
        return [
            { assignee: 'John Smith', assigned: 34, resolved: 31, avgResolutionHours: 4.2 },
            { assignee: 'Sarah Johnson', assigned: 28, resolved: 26, avgResolutionHours: 3.8 },
            { assignee: 'Mike Chen', assigned: 41, resolved: 38, avgResolutionHours: 5.1 },
            { assignee: 'Lisa Rodriguez', assigned: 22, resolved: 20, avgResolutionHours: 4.7 },
            { assignee: 'David Park', assigned: 35, resolved: 33, avgResolutionHours: 3.9 },
            { assignee: 'Emma Wilson', assigned: 19, resolved: 17, avgResolutionHours: 6.2 },
            { assignee: 'Alex Thompson', assigned: 26, resolved: 24, avgResolutionHours: 4.5 },
            { assignee: 'Grace Lee', assigned: 31, resolved: 29, avgResolutionHours: 4.1 }
        ];
    }

    // Generate fake recent incidents for grid
    getRecentIncidents(): IncidentDetails[] {
        const priorities = ['Critical', 'High', 'Medium', 'Low'];
        const states = ['New', 'In Progress', 'On Hold', 'Resolved', 'Closed'];
        const assignees = ['John Smith', 'Sarah Johnson', 'Mike Chen', 'Lisa Rodriguez', 'David Park'];
        const categories = ['Network', 'Hardware', 'Software', 'Security', 'Database', 'Application'];
        
        const incidents: IncidentDetails[] = [];
        
        for (let i = 1; i <= 50; i++) {
            const createdDate = new Date();
            createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 30));
            
            const state = states[Math.floor(Math.random() * states.length)];
            const resolvedAt = (state === 'Resolved' || state === 'Closed') 
                ? new Date(createdDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
                : undefined;
            
            incidents.push({
                sys_id: `inc${String(i).padStart(8, '0')}`,
                number: `INC${String(1000000 + i)}`,
                priority: priorities[Math.floor(Math.random() * priorities.length)],
                state,
                short_description: `${categories[Math.floor(Math.random() * categories.length)]} issue - ${this.generateRandomDescription()}`,
                assigned_to: assignees[Math.floor(Math.random() * assignees.length)],
                created_on: createdDate.toISOString(),
                resolved_at: resolvedAt
            });
        }
        
        // Sort by creation date (newest first)
        return incidents.sort((a, b) => new Date(b.created_on).getTime() - new Date(a.created_on).getTime());
    }

    private generateRandomDescription(): string {
        const issues = [
            'system unavailable',
            'slow performance',
            'connection timeout',
            'authentication failure',
            'data corruption',
            'service outage',
            'memory leak detected',
            'disk space full',
            'backup failure',
            'certificate expired',
            'configuration error',
            'integration failure'
        ];
        
        return issues[Math.floor(Math.random() * issues.length)];
    }

    // Simulate async data loading
    async loadDashboardData() {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
        
        return {
            metrics: this.getMetrics(),
            priorityData: this.getIncidentsByPriority(),
            trends: this.getIncidentTrends(),
            categories: this.getCategoryData(),
            assigneePerformance: this.getAssigneePerformance(),
            recentIncidents: this.getRecentIncidents()
        };
    }
}