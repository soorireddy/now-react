import React, { useState, useEffect } from 'react';
import DynamicForm from '../components/DynamicForm';
import DynamicList from '../components/DynamicList';

// Declare GlideAjax on window object
declare global {
  interface Window {
    GlideAjax: any;
  }
}

const OOBDemoPage: React.FC = () => {
  const [currentTable, setCurrentTable] = useState('incident');
  const [currentMode, setCurrentMode] = useState<'form' | 'list' | 'both'>('both');
  const [currentSysId, setCurrentSysId] = useState('');
  const [currentView, setCurrentView] = useState('default');
  const [formConfig, setFormConfig] = useState<any>(null);
  const [listConfig, setListConfig] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uiActions, setUIActions] = useState<any[]>([]);

  // Load configurations when table or view changes
  useEffect(() => {
    loadConfigurations();
    loadUIActions();
  }, [currentTable, currentView]);

  const loadConfigurations = async () => {
    if (typeof window.GlideAjax === 'undefined') {
      setError('GlideAjax not available. This demo requires a live ServiceNow instance.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Load form configuration
      if (currentMode === 'form' || currentMode === 'both') {
        await loadFormConfiguration();
      }

      // Load list configuration
      if (currentMode === 'list' || currentMode === 'both') {
        await loadListConfiguration();
      }

      // Load sample records
      await loadSampleRecords();

    } catch (err) {
      setError(`Error loading configurations: ${err}`);
      console.error('Configuration loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadFormConfiguration = () => {
    return new Promise<void>((resolve, reject) => {
      const ajax = new window.GlideAjax('FormListUtil');
      ajax.addParam('sysparm_name', 'getFormMeta');
      ajax.addParam('sysparm_table', currentTable);
      ajax.addParam('sysparm_view', currentView);
      ajax.getXMLAnswer((response: string) => {
        try {
          const data = JSON.parse(response);
          if (data.error) {
            reject(data.error);
          } else {
            setFormConfig(data);
            console.log('Form configuration loaded:', data);
            resolve();
          }
        } catch (e) {
          reject(`Failed to parse form response: ${e}`);
        }
      });
    });
  };

  const loadListConfiguration = () => {
    return new Promise<void>((resolve, reject) => {
      const ajax = new window.GlideAjax('FormListUtil');
      ajax.addParam('sysparm_name', 'getListMeta');
      ajax.addParam('sysparm_table', currentTable);
      ajax.addParam('sysparm_view', currentView);
      ajax.getXMLAnswer((response: string) => {
        try {
          const data = JSON.parse(response);
          if (data.error) {
            reject(data.error);
          } else {
            setListConfig(data);
            console.log('List configuration loaded:', data);
            resolve();
          }
        } catch (e) {
          reject(`Failed to parse list response: ${e}`);
        }
      });
    });
  };

  const loadSampleRecords = () => {
    return new Promise<void>((resolve, reject) => {
      const ajax = new window.GlideAjax('FormListUtil');
      ajax.addParam('sysparm_name', 'getSampleRecords');
      ajax.addParam('sysparm_table', currentTable);
      ajax.addParam('sysparm_limit', '25');
      ajax.getXMLAnswer((response: string) => {
        try {
          const data = JSON.parse(response);
          if (data.error) {
            reject(data.error);
          } else {
            setRecords(data.records || []);
            console.log('Sample records loaded:', data);
            resolve();
          }
        } catch (e) {
          // If sample records fail, generate mock data
          console.warn('Failed to load sample records, using mock data');
          const mockRecords = generateMockRecords();
          setRecords(mockRecords);
          resolve();
        }
      });
    });
  };

  const loadUIActions = () => {
    if (typeof window.GlideAjax === 'undefined') return;

    const ajax = new window.GlideAjax('FormListUtil');
    ajax.addParam('sysparm_name', 'getUIActions');
    ajax.addParam('sysparm_table', currentTable);
    ajax.addParam('sysparm_view', currentView);
    ajax.getXMLAnswer((response: string) => {
      try {
        const data = JSON.parse(response);
        if (!data.error) {
          setUIActions(data.actions || []);
          console.log('UI Actions loaded:', data);
        }
      } catch (e) {
        console.warn('Failed to load UI actions:', e);
        // Set default UI actions
        setUIActions([
          { name: 'save', label: 'Save', icon: '💾', action: 'save' },
          { name: 'update', label: 'Update', icon: '✏️', action: 'update' },
          { name: 'delete', label: 'Delete', icon: '🗑️', action: 'delete' }
        ]);
      }
    });
  };

  const generateMockRecords = () => {
    const mockRecords = [];
    const currentTime = new Date();
    
    for (let i = 1; i <= 15; i++) {
      const record: any = {
        sys_id: `mock_${currentTable}_${i}`,
        sys_created_on: new Date(currentTime.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        sys_updated_on: new Date(currentTime.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
      };

      // Add table-specific fields
      switch (currentTable) {
        case 'incident':
          record.number = `INC000000${i}`;
          record.short_description = `Sample incident ${i}`;
          record.state = Math.floor(Math.random() * 7) + 1;
          record.priority = Math.floor(Math.random() * 5) + 1;
          record.category = ['software', 'hardware', 'network', 'inquiry'][Math.floor(Math.random() * 4)];
          record.assigned_to = { display_value: `User ${i}`, value: `user_${i}` };
          break;
        case 'sys_user':
          record.user_name = `user${i}`;
          record.name = `Test User ${i}`;
          record.email = `user${i}@example.com`;
          record.active = Math.random() > 0.2;
          break;
        default:
          record.name = `Sample ${currentTable} ${i}`;
          record.active = Math.random() > 0.2;
          break;
      }

      mockRecords.push(record);
    }

    return mockRecords;
  };

  const handleFormSubmit = (data: any) => {
    console.log('Form submitted:', data);
    
    if (currentSysId) {
      // Update existing record
      alert(`Would update ${currentTable} record ${currentSysId}\n\nData: ${JSON.stringify(data, null, 2)}`);
    } else {
      // Create new record
      const newRecord = {
        sys_id: `new_${currentTable}_${Date.now()}`,
        ...data,
        sys_created_on: new Date().toISOString(),
        sys_updated_on: new Date().toISOString()
      };
      setRecords(prev => [newRecord, ...prev]);
      alert(`Would create new ${currentTable} record\n\nData: ${JSON.stringify(data, null, 2)}`);
    }
  };

  const handleFormChange = (fieldName: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleEdit = (record: any) => {
    setCurrentSysId(record.sys_id);
    setFormData(record);
    setCurrentMode('form');
    console.log('Editing record:', record);
  };

  const handleDelete = (record: any) => {
    if (confirm(`Are you sure you want to delete ${currentTable} record ${record.sys_id}?`)) {
      setRecords(prev => prev.filter(r => r.sys_id !== record.sys_id));
      console.log('Deleted record:', record);
    }
  };

  const handleRefresh = () => {
    console.log('Refreshing data...');
    loadSampleRecords();
  };

  const handleNew = () => {
    setCurrentSysId('');
    setFormData({});
    setCurrentMode('form');
    console.log('Creating new record');
  };

  const handleUIAction = (action: any) => {
    console.log('UI Action triggered:', action);
    
    switch (action.action) {
      case 'save':
      case 'update':
        if (formConfig && Object.keys(formData).length > 0) {
          handleFormSubmit(formData);
        } else {
          alert('No form data to save');
        }
        break;
      case 'delete':
        if (currentSysId) {
          const record = records.find(r => r.sys_id === currentSysId);
          if (record) {
            handleDelete(record);
          }
        } else {
          alert('No record selected for deletion');
        }
        break;
      default:
        alert(`UI Action: ${action.label}\n\nThis would execute the ${action.name} action in ServiceNow.`);
        break;
    }
  };

  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh'
    }}>
      <style dangerouslySetInnerHTML={{
        __html: `
        .ui-actions-bar {
          background: white;
          padding: 1rem 1.5rem;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          margin-bottom: 1.5rem;
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
          align-items: center;
        }
        .ui-action-btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
        }
        .ui-action-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .ui-action-primary {
          background: #007bff;
          color: white;
        }
        .ui-action-success {
          background: #28a745;
          color: white;
        }
        .ui-action-danger {
          background: #dc3545;
          color: white;
        }
        .ui-action-secondary {
          background: #6c757d;
          color: white;
        }
        .error-alert {
          background: #f8d7da;
          color: #721c24;
          padding: 1rem;
          border-radius: 6px;
          border: 1px solid #f5c6cb;
          margin-bottom: 1rem;
        }
        .loading-indicator {
          text-align: center;
          padding: 2rem;
          color: #6c757d;
        }
        `}}
      />

      <h1 style={{
        color: '#333',
        marginBottom: '20px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, #007bff, #6610f2)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }}>ServiceNow Dynamic Components - Live Demo</h1>
      
      <div style={{
        background: 'linear-gradient(135deg, #e3f2fd, #e8f5e8)',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #b3e5fc'
      }}>
        <p><strong>🚀 Dynamic ServiceNow Configuration with Script Include Integration:</strong></p>
        <ul>
          <li><strong>Form Metadata:</strong> Loaded via FormListUtil.getFormMeta() from sys_ui_form and sys_dictionary</li>
          <li><strong>List Metadata:</strong> Loaded via FormListUtil.getListMeta() from sys_ui_list and sys_ui_list_element</li>
          <li><strong>UI Actions:</strong> Integrated React buttons that execute ServiceNow actions</li>
          <li><strong>Live Data:</strong> Real-time form and list rendering based on table configuration</li>
          <li><strong>Field Types:</strong> All ServiceNow field types with proper validation and formatting</li>
        </ul>
      </div>

      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3>Configuration Controls</h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginTop: '15px'
        }}>
          <div>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Table:</label>
            <select 
              value={currentTable}
              onChange={(e) => {
                setCurrentTable(e.target.value);
                setCurrentSysId('');
                setFormData({});
              }}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ccc',
                borderRadius: '6px'
              }}
            >
              <option value="incident">Incident</option>
              <option value="change_request">Change Request</option>
              <option value="problem">Problem</option>
              <option value="sc_request">Service Catalog Request</option>
              <option value="task">Task</option>
              <option value="sys_user">User</option>
              <option value="cmdb_ci">Configuration Item</option>
            </select>
          </div>

          <div>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>View:</label>
            <select 
              value={currentView}
              onChange={(e) => setCurrentView(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ccc',
                borderRadius: '6px'
              }}
            >
              <option value="default">Default</option>
              <option value="ess">ESS</option>
              <option value="itil">ITIL</option>
              <option value="mobile">Mobile</option>
            </select>
          </div>

          <div>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Display Mode:</label>
            <select 
              value={currentMode}
              onChange={(e) => setCurrentMode(e.target.value as 'form' | 'list' | 'both')}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ccc',
                borderRadius: '6px'
              }}
            >
              <option value="both">Both Form & List</option>
              <option value="form">Form Only</option>
              <option value="list">List Only</option>
            </select>
          </div>

          <div>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Record Sys ID:</label>
            <input 
              type="text"
              placeholder="Enter sys_id to edit existing record"
              value={currentSysId}
              onChange={(e) => setCurrentSysId(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ccc',
                borderRadius: '6px'
              }}
            />
          </div>
        </div>
      </div>

      {/* UI Actions Bar */}
      {uiActions.length > 0 && (
        <div className="ui-actions-bar">
          <strong>UI Actions:</strong>
          {uiActions.map((action, index) => (
            <button
              key={index}
              className={`ui-action-btn ${
                action.action === 'save' || action.action === 'update' ? 'ui-action-primary' :
                action.action === 'delete' ? 'ui-action-danger' :
                action.action === 'new' ? 'ui-action-success' : 'ui-action-secondary'
              }`}
              onClick={() => handleUIAction(action)}
            >
              {action.icon} {action.label}
            </button>
          ))}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="error-alert">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="loading-indicator">
          <div>⏳ Loading {currentTable} configuration...</div>
        </div>
      )}

      {/* Dynamic Components */}
      {!loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Dynamic Form */}
          {(currentMode === 'form' || currentMode === 'both') && formConfig && (
            <DynamicForm
              config={formConfig}
              data={formData}
              onSubmit={handleFormSubmit}
              onChange={handleFormChange}
              maxColumns={3}
            />
          )}

          {/* Dynamic List */}
          {(currentMode === 'list' || currentMode === 'both') && listConfig && (
            <DynamicList
              config={listConfig}
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
          )}
        </div>
      )}

      {/* Configuration Summary */}
      <div style={{
        background: 'white',
        padding: '15px',
        borderRadius: '8px',
        marginTop: '30px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h4>Current Configuration Summary:</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '10px' }}>
          <div><strong>Table:</strong> {currentTable}</div>
          <div><strong>View:</strong> {currentView}</div>
          <div><strong>Mode:</strong> {currentMode}</div>
          <div><strong>Record ID:</strong> {currentSysId || 'New Record'}</div>
          <div><strong>Form Sections:</strong> {formConfig?.sections?.length || 0}</div>
          <div><strong>List Columns:</strong> {listConfig?.columns?.length || 0}</div>
          <div><strong>Records Loaded:</strong> {records.length}</div>
          <div><strong>UI Actions:</strong> {uiActions.length}</div>
        </div>
      </div>

      {/* Technical Implementation */}
      <div style={{
        background: '#fff3cd',
        border: '1px solid #ffeaa7',
        borderRadius: '8px',
        padding: '15px',
        marginTop: '20px'
      }}>
        <h4>🔧 Implementation Details:</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '15px' }}>
          <div>
            <h5>Script Include Integration:</h5>
            <ul>
              <li><code>FormListUtil.getFormMeta(table, view)</code></li>
              <li><code>FormListUtil.getListMeta(table, view)</code></li>
              <li><code>FormListUtil.getUIActions(table, view)</code></li>
              <li><code>FormListUtil.getSampleRecords(table)</code></li>
            </ul>
          </div>
          <div>
            <h5>React Component Features:</h5>
            <ul>
              <li>Real-time configuration loading</li>
              <li>Dynamic field type rendering</li>
              <li>Responsive grid layouts (1-4 columns)</li>
              <li>Sortable, searchable lists with pagination</li>
              <li>Integrated UI actions as React buttons</li>
              <li>Form validation and error handling</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OOBDemoPage;