import React, { useState } from 'react';
import DynamicList from '../components/DynamicList';
import { ListConfigLoader, ListConfigUtils } from '../components/ListConfigUtils';

const DynamicListPage: React.FC = () => {
  const [selectedTable, setSelectedTable] = useState<'sys_user' | 'incident' | 'custom'>('sys_user');
  const [customConfig, setCustomConfig] = useState<any>(null);
  const [configError, setConfigError] = useState<string>('');
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Sample sys_user list configuration
  const sysUserListConfig = {
    "table": "sys_user",
    "view": "",
    "list_sys_id": "a1ceec690a0006415fa0f0e4705d379a",
    "columns": [
      {
        "name": "user_name",
        "label": "User ID",
        "data_type": "string",
        "position": "0"
      },
      {
        "name": "name",
        "label": "Name",
        "data_type": "string",
        "position": "1"
      },
      {
        "name": "email",
        "label": "Email",
        "data_type": "email",
        "position": "2"
      },
      {
        "name": "active",
        "label": "Active",
        "data_type": "boolean",
        "position": "3"
      },
      {
        "name": "sys_created_on",
        "label": "Created",
        "data_type": "glide_date_time",
        "position": "4"
      },
      {
        "name": "sys_updated_on",
        "label": "Updated",
        "data_type": "glide_date_time",
        "position": "5"
      }
    ]
  };

  // Sample incident list configuration
  const incidentListConfig = {
    "table": "incident",
    "view": "default",
    "list_sys_id": "incident_list_id",
    "columns": [
      {
        "name": "number",
        "label": "Number",
        "data_type": "string",
        "position": "0"
      },
      {
        "name": "short_description",
        "label": "Short Description",
        "data_type": "string",
        "position": "1"
      },
      {
        "name": "state",
        "label": "State",
        "data_type": "integer",
        "position": "2"
      },
      {
        "name": "priority",
        "label": "Priority",
        "data_type": "integer",
        "position": "3"
      },
      {
        "name": "category",
        "label": "Category",
        "data_type": "string",
        "position": "4"
      },
      {
        "name": "assigned_to",
        "label": "Assigned To",
        "data_type": "reference",
        "position": "5"
      },
      {
        "name": "sys_created_on",
        "label": "Created",
        "data_type": "glide_date_time",
        "position": "6"
      },
      {
        "name": "sys_updated_on",
        "label": "Updated",
        "data_type": "glide_date_time",
        "position": "7"
      }
    ]
  };

  const getCurrentConfig = () => {
    if (selectedTable === 'custom' && customConfig) {
      return customConfig;
    }
    return selectedTable === 'sys_user' ? sysUserListConfig : incidentListConfig;
  };

  const currentConfig = getCurrentConfig();

  // Generate sample records when config changes
  React.useEffect(() => {
    if (currentConfig) {
      const sampleRecords = ListConfigUtils.generateSampleRecords(currentConfig, 25);
      setRecords(sampleRecords);
    }
  }, [currentConfig]);

  const handleConfigLoad = (config: any) => {
    setCustomConfig(config);
    setSelectedTable('custom');
    setConfigError('');
    
    // Generate sample records for the new config
    const sampleRecords = ListConfigUtils.generateSampleRecords(config, 25);
    setRecords(sampleRecords);
    
    console.log('Loaded custom list configuration:', config);
  };

  const handleConfigError = (error: string) => {
    setConfigError(error);
    console.error('Configuration error:', error);
  };

  const handleEdit = (record: any) => {
    console.log('Edit record:', record);
    alert(`Edit ${currentConfig.table} record: ${record.sys_id}\n\n${JSON.stringify(record, null, 2)}`);
  };

  const handleDelete = (record: any) => {
    if (confirm(`Are you sure you want to delete this ${currentConfig.table} record?`)) {
      setRecords(prev => prev.filter(r => r.sys_id !== record.sys_id));
      console.log('Deleted record:', record);
      alert(`Deleted ${currentConfig.table} record: ${record.sys_id}`);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    console.log('Refreshing list...');
    
    // Simulate API call
    setTimeout(() => {
      const newRecords = ListConfigUtils.generateSampleRecords(currentConfig, 25);
      setRecords(newRecords);
      setLoading(false);
      console.log('List refreshed with new data');
    }, 1000);
  };

  const handleNew = () => {
    console.log(`Create new ${currentConfig.table} record`);
    alert(`Would navigate to create new ${currentConfig.table} record`);
  };

  const stats = ListConfigUtils.getConfigStats(currentConfig);

  return (
    <div className="dynamic-list-page">
      <style dangerouslySetInnerHTML={{
        __html: `
        .dynamic-list-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          padding: 20px;
        }
        .page-header {
          text-align: center;
          margin-bottom: 2rem;
          color: #333;
        }
        .page-title {
          font-size: 2.5rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, #007bff, #6610f2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .page-subtitle {
          font-size: 1.1rem;
          color: #6c757d;
          margin-bottom: 2rem;
        }
        .list-selector {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          margin-bottom: 2rem;
          max-width: 800px;
          margin-left: auto;
          margin-right: auto;
        }
        .list-selector h3 {
          color: #333;
          margin-bottom: 1rem;
          text-align: center;
        }
        .selector-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }
        .selector-btn {
          padding: 0.75rem 1.5rem;
          border: 2px solid #007bff;
          background: white;
          color: #007bff;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s;
          text-transform: capitalize;
        }
        .selector-btn.active {
          background: #007bff;
          color: white;
        }
        .selector-btn:hover:not(.active) {
          background: #e3f2fd;
        }
        .list-container {
          max-width: 1400px;
          margin: 0 auto;
        }
        .config-stats {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          margin-bottom: 2rem;
          max-width: 800px;
          margin-left: auto;
          margin-right: auto;
        }
        .config-stats h4 {
          color: #333;
          margin-bottom: 1rem;
          text-align: center;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
          margin-bottom: 1rem;
        }
        .stat-item {
          text-align: center;
          padding: 0.75rem;
          background: #f8f9fa;
          border-radius: 6px;
          border: 1px solid #dee2e6;
        }
        .stat-value {
          font-size: 1.5rem;
          font-weight: bold;
          color: #007bff;
        }
        .stat-label {
          font-size: 0.875rem;
          color: #6c757d;
          margin-top: 0.25rem;
        }
        .column-types {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #dee2e6;
        }
        .column-types-title {
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #495057;
        }
        .column-type-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .column-type-badge {
          background: #e9ecef;
          color: #495057;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 500;
        }
        .error-alert {
          background: #f8d7da;
          color: #721c24;
          padding: 1rem;
          border-radius: 6px;
          border: 1px solid #f5c6cb;
          margin-bottom: 1rem;
          white-space: pre-line;
        }
        `}}
      />
      
      <div className="page-header">
        <h1 className="page-title">Dynamic List Builder</h1>
        <p className="page-subtitle">
          Interactive data tables with sorting, searching, and pagination
        </p>
      </div>

      <div className="list-selector">
        <h3>Select List Configuration</h3>
        <div className="selector-buttons">
          <button
            className={`selector-btn ${selectedTable === 'sys_user' ? 'active' : ''}`}
            onClick={() => {
              setSelectedTable('sys_user');
              setConfigError('');
            }}
          >
            👤 User List
          </button>
          <button
            className={`selector-btn ${selectedTable === 'incident' ? 'active' : ''}`}
            onClick={() => {
              setSelectedTable('incident');
              setConfigError('');
            }}
          >
            📋 Incident List
          </button>
          <button
            className={`selector-btn ${selectedTable === 'custom' ? 'active' : ''}`}
            onClick={() => {
              if (!customConfig) {
                alert('Please load a custom configuration first');
                return;
              }
              setSelectedTable('custom');
              setConfigError('');
            }}
            disabled={!customConfig}
          >
            ⚙️ Custom Config
          </button>
        </div>

        {selectedTable !== 'custom' && (
          <ListConfigLoader
            onConfigLoad={handleConfigLoad}
            onError={handleConfigError}
          />
        )}

        {configError && (
          <div className="error-alert">
            {configError}
          </div>
        )}
      </div>

      <div className="config-stats">
        <h4>List Configuration Statistics</h4>
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-value">{stats.totalColumns}</div>
            <div className="stat-label">Columns</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{records.length}</div>
            <div className="stat-label">Records</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{stats.hasSystemColumns ? 'Yes' : 'No'}</div>
            <div className="stat-label">System Columns</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{Object.keys(stats.columnTypes).length}</div>
            <div className="stat-label">Data Types</div>
          </div>
        </div>
        <div className="column-types">
          <div className="column-types-title">Column Types Used:</div>
          <div className="column-type-list">
            {Object.entries(stats.columnTypes).map(([type, count]) => (
              <span key={type} className="column-type-badge">
                {type} ({count})
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="list-container">
        <DynamicList
          config={currentConfig}
          records={records}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRefresh={handleRefresh}
          onNew={handleNew}
          pageSize={10}
          showActions={true}
          sortable={true}
        />
      </div>
    </div>
  );
};

export default DynamicListPage;