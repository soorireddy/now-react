import React, { useState } from 'react';
import ServiceNowOOBComponents from '../components/ServiceNowOOBComponents';

const OOBDemoPage: React.FC = () => {
  const [currentTable, setCurrentTable] = useState('incident');
  const [currentMode, setCurrentMode] = useState<'form' | 'list' | 'both'>('both');
  const [currentSysId, setCurrentSysId] = useState('');
  const [currentView, setCurrentView] = useState('default');

  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh'
    }}>
      <h1 style={{
        color: '#333',
        marginBottom: '20px',
        textAlign: 'center'
      }}>ServiceNow OOB Components - Dynamic Layout Demo</h1>
      
      <div style={{
        background: '#e3f2fd',
        padding: '15px',
        borderRadius: '4px',
        marginBottom: '20px',
        borderLeft: '4px solid #2196f3'
      }}>
        <p><strong>🚀 Now with Dynamic ServiceNow UI Configuration:</strong></p>
        <ul>
          <li><strong>Form Fields:</strong> Loaded from sys_ui_form, sys_ui_section, and sys_ui_element</li>
          <li><strong>List Columns:</strong> Loaded from sys_ui_list and sys_ui_list_element</li>
          <li><strong>Field Types:</strong> Supports all ServiceNow field types (choice, reference, date, boolean, etc.)</li>
          <li><strong>Sections:</strong> Form fields are organized by their configured sections</li>
          <li><strong>Views:</strong> Supports different form/list views (default, ess, itil, etc.)</li>
        </ul>
      </div>

      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3>Dynamic Configuration Controls</h3>
        
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
              onChange={(e) => setCurrentTable(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ccc',
                borderRadius: '4px'
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
                borderRadius: '4px'
              }}
            >
              <option value="default">Default</option>
              <option value="ess">ESS (Employee Self Service)</option>
              <option value="itil">ITIL</option>
              <option value="mobile">Mobile</option>
              <option value="agent">Agent</option>
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
                borderRadius: '4px'
              }}
            >
              <option value="both">Both Form & List</option>
              <option value="form">Form Only</option>
              <option value="list">List Only</option>
            </select>
          </div>

          <div>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Record Sys ID (for editing):</label>
            <input 
              type="text"
              placeholder="Enter sys_id to edit existing record"
              value={currentSysId}
              onChange={(e) => setCurrentSysId(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
          </div>
        </div>
      </div>

      {/* Configuration Summary */}
      <div style={{
        background: 'white',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h4>Current Configuration:</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
          <div><strong>Table:</strong> {currentTable}</div>
          <div><strong>View:</strong> {currentView}</div>
          <div><strong>Mode:</strong> {currentMode}</div>
          <div><strong>Record ID:</strong> {currentSysId || 'New Record'}</div>
        </div>
      </div>

      {/* Dynamic ServiceNow Components */}
      <ServiceNowOOBComponents 
        table={currentTable}
        sysId={currentSysId}
        mode={currentMode}
        view={currentView}
      />

      {/* Technical Details */}
      <div style={{
        background: '#fff3cd',
        border: '1px solid #ffeaa7',
        borderRadius: '4px',
        padding: '15px',
        marginTop: '30px'
      }}>
        <h4>🔧 Technical Implementation Details:</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginTop: '10px' }}>
          <div>
            <h5>Form Configuration Sources:</h5>
            <ul>
              <li><code>sys_ui_form</code> - Form definition</li>
              <li><code>sys_ui_form_section</code> - Section ordering</li>
              <li><code>sys_ui_section</code> - Section details</li>
              <li><code>sys_ui_element</code> - Field configuration</li>
              <li><code>sys_dictionary</code> - Field metadata</li>
              <li><code>sys_choice</code> - Choice options</li>
            </ul>
          </div>
          <div>
            <h5>List Configuration Sources:</h5>
            <ul>
              <li><code>sys_ui_list</code> - List definition</li>
              <li><code>sys_ui_list_element</code> - Column configuration</li>
              <li><code>sys_dictionary</code> - Column metadata</li>
            </ul>
          </div>
        </div>
        <div style={{ marginTop: '15px', padding: '10px', background: '#f8f9fa', borderRadius: '4px' }}>
          <strong>💡 Key Features:</strong>
          <ul style={{ margin: '10px 0' }}>
            <li>Sections are rendered in position order with proper headers</li>
            <li>Fields support all ServiceNow types (choice, reference, date, boolean, etc.)</li>
            <li>Mandatory fields are marked with asterisks</li>
            <li>Read-only fields are properly disabled</li>
            <li>Choice fields populate from sys_choice table</li>
            <li>Current values are loaded for existing records</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default OOBDemoPage;