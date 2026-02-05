import React, { useState } from 'react';
import DynamicForm from '../components/DynamicForm';
import { FormConfigLoader, FormConfigUtils } from '../components/FormConfigUtils';

const DynamicFormPage: React.FC = () => {
  const [selectedTable, setSelectedTable] = useState<'incident' | 'sys_user' | 'custom'>('incident');
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [customConfig, setCustomConfig] = useState<any>(null);
  const [configError, setConfigError] = useState<string>('');

  // Sample incident form configuration
  const incidentFormConfig = {
    "table": "incident",
    "view": "",
    "sections": [
      {
        "name": "",
        "position": 0,
        "fields": [
          {
            "name": "number",
            "position": 0,
            "label": "Number",
            "data_type": "string",
            "default_value": "",
            "visible": true,
            "mandatory": false,
            "read_only": true,
            "is_reference": false,
            "reference_table": ""
          },
          {
            "name": "caller_id",
            "position": 1,
            "label": "Caller",
            "data_type": "reference",
            "default_value": "",
            "visible": true,
            "mandatory": true,
            "read_only": false,
            "is_reference": true,
            "reference_table": "sys_user"
          },
          {
            "name": "category",
            "position": 2,
            "label": "Category",
            "data_type": "string",
            "default_value": "inquiry",
            "visible": true,
            "mandatory": false,
            "read_only": false,
            "is_reference": false,
            "reference_table": "",
            "choices": [
              { "value": "inquiry", "label": "Inquiry / Help", "sequence": 1, "inactive": false },
              { "value": "software", "label": "Software", "sequence": 2, "inactive": false },
              { "value": "hardware", "label": "Hardware", "sequence": 3, "inactive": false },
              { "value": "network", "label": "Network", "sequence": 4, "inactive": false },
              { "value": "database", "label": "Database", "sequence": 5, "inactive": false },
              { "value": "password_reset", "label": "Password Reset", "sequence": 100, "inactive": false }
            ]
          },
          {
            "name": "subcategory",
            "position": 3,
            "label": "Subcategory",
            "data_type": "string",
            "default_value": "",
            "visible": true,
            "mandatory": false,
            "read_only": false,
            "is_reference": false,
            "reference_table": "",
            "choices": [
              { "value": "antivirus", "label": "Antivirus", "sequence": 0, "inactive": false },
              { "value": "cpu", "label": "CPU", "sequence": 0, "inactive": false },
              { "value": "email", "label": "Email", "sequence": 0, "inactive": false },
              { "value": "internal application", "label": "Internal Application", "sequence": 0, "inactive": false },
              { "value": "keyboard", "label": "Keyboard", "sequence": 0, "inactive": false },
              { "value": "monitor", "label": "Monitor", "sequence": 0, "inactive": false }
            ]
          },
          {
            "name": "contact_type",
            "position": 10,
            "label": "Contact Type",
            "data_type": "string",
            "default_value": "",
            "visible": true,
            "mandatory": false,
            "read_only": false,
            "is_reference": false,
            "reference_table": ""
          },
          {
            "name": "state",
            "position": 11,
            "label": "State",
            "data_type": "integer",
            "default_value": "1",
            "visible": true,
            "mandatory": false,
            "read_only": false,
            "is_reference": false,
            "reference_table": "",
            "choices": [
              { "value": "1", "label": "New", "sequence": 1, "inactive": false },
              { "value": "2", "label": "In Progress", "sequence": 2, "inactive": false },
              { "value": "3", "label": "On Hold", "sequence": 3, "inactive": false },
              { "value": "6", "label": "Resolved", "sequence": 6, "inactive": false },
              { "value": "7", "label": "Closed", "sequence": 7, "inactive": false }
            ]
          },
          {
            "name": "impact",
            "position": 13,
            "label": "Impact",
            "data_type": "integer",
            "default_value": "3",
            "visible": true,
            "mandatory": false,
            "read_only": false,
            "is_reference": false,
            "reference_table": "",
            "choices": [
              { "value": "1", "label": "High", "sequence": 1, "inactive": false },
              { "value": "2", "label": "Medium", "sequence": 2, "inactive": false },
              { "value": "3", "label": "Low", "sequence": 3, "inactive": false }
            ]
          },
          {
            "name": "urgency",
            "position": 14,
            "label": "Urgency",
            "data_type": "integer",
            "default_value": "3",
            "visible": true,
            "mandatory": false,
            "read_only": false,
            "is_reference": false,
            "reference_table": "",
            "choices": [
              { "value": "1", "label": "High", "sequence": 1, "inactive": false },
              { "value": "2", "label": "Medium", "sequence": 2, "inactive": false },
              { "value": "3", "label": "Low", "sequence": 3, "inactive": false }
            ]
          },
          {
            "name": "priority",
            "position": 15,
            "label": "Priority",
            "data_type": "integer",
            "default_value": "5",
            "visible": true,
            "mandatory": false,
            "read_only": true,
            "is_reference": false,
            "reference_table": "",
            "choices": [
              { "value": "1", "label": "Critical", "sequence": 1, "inactive": false },
              { "value": "2", "label": "High", "sequence": 2, "inactive": false },
              { "value": "3", "label": "Moderate", "sequence": 3, "inactive": false },
              { "value": "4", "label": "Low", "sequence": 4, "inactive": false },
              { "value": "5", "label": "Planning", "sequence": 5, "inactive": false }
            ]
          },
          {
            "name": "assignment_group",
            "position": 16,
            "label": "Assignment Group",
            "data_type": "reference",
            "default_value": "",
            "visible": true,
            "mandatory": false,
            "read_only": false,
            "is_reference": true,
            "reference_table": "sys_user_group"
          },
          {
            "name": "assigned_to",
            "position": 17,
            "label": "Assigned To",
            "data_type": "reference",
            "default_value": "",
            "visible": true,
            "mandatory": false,
            "read_only": false,
            "is_reference": true,
            "reference_table": "sys_user"
          },
          {
            "name": "short_description",
            "position": 19,
            "label": "Short Description",
            "data_type": "string",
            "default_value": "",
            "visible": true,
            "mandatory": true,
            "read_only": false,
            "is_reference": false,
            "reference_table": ""
          },
          {
            "name": "description",
            "position": 20,
            "label": "Description",
            "data_type": "html",
            "default_value": "",
            "visible": true,
            "mandatory": false,
            "read_only": false,
            "is_reference": false,
            "reference_table": ""
          }
        ]
      },
      {
        "name": "Notes",
        "position": 1,
        "fields": [
          {
            "name": "work_notes",
            "position": 6,
            "label": "Work Notes",
            "data_type": "journal",
            "default_value": "",
            "visible": true,
            "mandatory": false,
            "read_only": false,
            "is_reference": false,
            "reference_table": ""
          },
          {
            "name": "comments",
            "position": 5,
            "label": "Comments",
            "data_type": "journal",
            "default_value": "",
            "visible": true,
            "mandatory": false,
            "read_only": false,
            "is_reference": false,
            "reference_table": ""
          }
        ]
      },
      {
        "name": "Related Records",
        "position": 2,
        "fields": [
          {
            "name": "parent_incident",
            "position": 0,
            "label": "Parent Incident",
            "data_type": "reference",
            "default_value": "",
            "visible": true,
            "mandatory": false,
            "read_only": false,
            "is_reference": true,
            "reference_table": "incident"
          },
          {
            "name": "problem_id",
            "position": 1,
            "label": "Problem",
            "data_type": "reference",
            "default_value": "",
            "visible": true,
            "mandatory": false,
            "read_only": false,
            "is_reference": true,
            "reference_table": "problem"
          },
          {
            "name": "rfc",
            "position": 3,
            "label": "Change Request",
            "data_type": "reference",
            "default_value": "",
            "visible": true,
            "mandatory": false,
            "read_only": false,
            "is_reference": true,
            "reference_table": "change_request"
          }
        ]
      },
      {
        "name": "Resolution Information",
        "position": 3,
        "fields": [
          {
            "name": "close_code",
            "position": 1,
            "label": "Close Code",
            "data_type": "string",
            "default_value": "",
            "visible": true,
            "mandatory": false,
            "read_only": false,
            "is_reference": false,
            "reference_table": "",
            "choices": [
              { "value": "Duplicate", "label": "Duplicate", "sequence": 0, "inactive": false },
              { "value": "Known error", "label": "Known error", "sequence": 1, "inactive": false },
              { "value": "Solution provided", "label": "Solution provided", "sequence": 7, "inactive": false },
              { "value": "Workaround provided", "label": "Workaround provided", "sequence": 8, "inactive": false }
            ]
          },
          {
            "name": "resolved_by",
            "position": 3,
            "label": "Resolved By",
            "data_type": "reference",
            "default_value": "",
            "visible": true,
            "mandatory": false,
            "read_only": false,
            "is_reference": true,
            "reference_table": "sys_user"
          },
          {
            "name": "resolved_at",
            "position": 4,
            "label": "Resolved At",
            "data_type": "glide_date_time",
            "default_value": "",
            "visible": true,
            "mandatory": false,
            "read_only": false,
            "is_reference": false,
            "reference_table": ""
          },
          {
            "name": "close_notes",
            "position": 6,
            "label": "Close Notes",
            "data_type": "html",
            "default_value": "",
            "visible": true,
            "mandatory": false,
            "read_only": false,
            "is_reference": false,
            "reference_table": ""
          }
        ]
      }
    ]
  };

  // Sample sys_user form configuration (truncated for brevity)
  const sysUserFormConfig = {
    "table": "sys_user",
    "view": "",
    "sections": [
      {
        "name": "",
        "position": 0,
        "fields": [
          {
            "name": "user_name",
            "position": 0,
            "label": "User ID",
            "data_type": "string",
            "default_value": "",
            "visible": true,
            "mandatory": true,
            "read_only": false,
            "is_reference": false,
            "reference_table": ""
          },
          {
            "name": "first_name",
            "position": 1,
            "label": "First Name",
            "data_type": "string",
            "default_value": "",
            "visible": true,
            "mandatory": true,
            "read_only": false,
            "is_reference": false,
            "reference_table": ""
          },
          {
            "name": "last_name",
            "position": 2,
            "label": "Last Name",
            "data_type": "string",
            "default_value": "",
            "visible": true,
            "mandatory": true,
            "read_only": false,
            "is_reference": false,
            "reference_table": ""
          },
          {
            "name": "title",
            "position": 3,
            "label": "Title",
            "data_type": "string",
            "default_value": "",
            "visible": true,
            "mandatory": false,
            "read_only": false,
            "is_reference": false,
            "reference_table": "",
            "choices": [
              { "value": "Administrative Assistant", "label": "Administrative Assistant", "sequence": 0, "inactive": false },
              { "value": "Chief Executive Officer", "label": "Chief Executive Officer", "sequence": 0, "inactive": false },
              { "value": "Director", "label": "Director", "sequence": 0, "inactive": false },
              { "value": "IT Technician", "label": "IT Technician", "sequence": 0, "inactive": false },
              { "value": "Junior Developer", "label": "Junior Developer", "sequence": 0, "inactive": false },
              { "value": "Senior Developer", "label": "Senior Developer", "sequence": 0, "inactive": false },
              { "value": "System Administrator", "label": "System Administrator", "sequence": 0, "inactive": false }
            ]
          },
          {
            "name": "department",
            "position": 4,
            "label": "Department",
            "data_type": "reference",
            "default_value": "",
            "visible": true,
            "mandatory": false,
            "read_only": false,
            "is_reference": true,
            "reference_table": "cmn_department"
          },
          {
            "name": "email",
            "position": 13,
            "label": "Email",
            "data_type": "email",
            "default_value": "",
            "visible": true,
            "mandatory": true,
            "read_only": false,
            "is_reference": false,
            "reference_table": ""
          },
          {
            "name": "phone",
            "position": 19,
            "label": "Business Phone",
            "data_type": "ph_number",
            "default_value": "",
            "visible": true,
            "mandatory": false,
            "read_only": false,
            "is_reference": false,
            "reference_table": ""
          },
          {
            "name": "active",
            "position": 8,
            "label": "Active",
            "data_type": "boolean",
            "default_value": "true",
            "visible": true,
            "mandatory": false,
            "read_only": false,
            "is_reference": false,
            "reference_table": ""
          }
        ]
      }
    ]
  };

  const getCurrentConfig = () => {
    if (selectedTable === 'custom' && customConfig) {
      return customConfig;
    }
    return selectedTable === 'incident' ? incidentFormConfig : sysUserFormConfig;
  };

  const currentConfig = getCurrentConfig();

  const handleFormSubmit = (data: Record<string, any>) => {
    console.log('Form submitted:', data);
    alert(`Form submitted successfully!\n\nData: ${JSON.stringify(data, null, 2)}`);
  };

  const handleFieldChange = (fieldName: string, value: any) => {
    console.log(`Field changed: ${fieldName} = ${value}`);
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleConfigLoad = (config: any) => {
    setCustomConfig(config);
    setSelectedTable('custom');
    setFormData({});
    setConfigError('');
    console.log('Loaded custom configuration:', config);
  };

  const handleConfigError = (error: string) => {
    setConfigError(error);
    console.error('Configuration error:', error);
  };

  const stats = FormConfigUtils.getConfigStats(currentConfig);

  return (
    <div className="dynamic-form-page">
      <style dangerouslySetInnerHTML={{
        __html: `
        .dynamic-form-page {
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
        .form-selector {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          margin-bottom: 2rem;
          max-width: 800px;
          margin-left: auto;
          margin-right: auto;
        }
        .form-selector h3 {
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
        .form-container {
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
        .field-types {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #dee2e6;
        }
        .field-types-title {
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #495057;
        }
        .field-type-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .field-type-badge {
          background: #e9ecef;
          color: #495057;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 500;
        }
        .current-data {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          margin-top: 2rem;
        }
        .current-data h4 {
          color: #333;
          margin-bottom: 1rem;
        }
        .data-display {
          background: #f8f9fa;
          padding: 1rem;
          border-radius: 6px;
          border-left: 4px solid #007bff;
          font-family: 'Courier New', monospace;
          font-size: 0.875rem;
          white-space: pre-wrap;
          max-height: 300px;
          overflow-y: auto;
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
        <h1 className="page-title">Dynamic Form Builder</h1>
        <p className="page-subtitle">
          Responsive React forms with automatic field type detection and validation
        </p>
      </div>

      <div className="form-selector">
        <h3>Select Form Configuration</h3>
        <div className="selector-buttons">
          <button
            className={`selector-btn ${selectedTable === 'incident' ? 'active' : ''}`}
            onClick={() => {
              setSelectedTable('incident');
              setFormData({});
              setConfigError('');
            }}
          >
            📋 Incident Form
          </button>
          <button
            className={`selector-btn ${selectedTable === 'sys_user' ? 'active' : ''}`}
            onClick={() => {
              setSelectedTable('sys_user');
              setFormData({});
              setConfigError('');
            }}
          >
            👤 User Form
          </button>
          <button
            className={`selector-btn ${selectedTable === 'custom' ? 'active' : ''}`}
            onClick={() => {
              if (!customConfig) {
                alert('Please load a custom configuration first');
                return;
              }
              setSelectedTable('custom');
              setFormData({});
              setConfigError('');
            }}
            disabled={!customConfig}
          >
            ⚙️ Custom Config
          </button>
        </div>

        {selectedTable !== 'custom' && (
          <FormConfigLoader
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
        <h4>Configuration Statistics</h4>
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-value">{stats.totalSections}</div>
            <div className="stat-label">Sections</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{stats.visibleFields}</div>
            <div className="stat-label">Visible Fields</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{stats.mandatoryFields}</div>
            <div className="stat-label">Required Fields</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{stats.referenceFields}</div>
            <div className="stat-label">Reference Fields</div>
          </div>
        </div>
        <div className="field-types">
          <div className="field-types-title">Field Types Used:</div>
          <div className="field-type-list">
            {Object.entries(stats.fieldTypes).map(([type, count]) => (
              <span key={type} className="field-type-badge">
                {type} ({count})
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="form-container">
        <DynamicForm
          config={currentConfig}
          data={formData}
          onSubmit={handleFormSubmit}
          onChange={handleFieldChange}
          maxColumns={4}
        />
      </div>

      {Object.keys(formData).length > 0 && (
        <div className="current-data">
          <h4>Current Form Data</h4>
          <div className="data-display">
            {JSON.stringify(formData, null, 2)}
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicFormPage;