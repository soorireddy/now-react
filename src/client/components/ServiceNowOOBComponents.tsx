import React, { useEffect, useRef, useState } from 'react';

// Declare GlideAjax on window object
declare global {
  interface Window {
    GlideAjax: any;
  }
}

interface ServiceNowOOBComponentsProps {
  table?: string;
  sysId?: string;
  mode?: 'form' | 'list' | 'both';
  view?: string;
}

const ServiceNowOOBComponents: React.FC<ServiceNowOOBComponentsProps> = ({ 
  table = 'incident', 
  sysId = '',
  mode = 'both',
  view = 'default'
}) => {
  const formRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<any>(null);
  const [listData, setListData] = useState<any>(null);

  useEffect(() => {
    setLoading(true);
    setError('');
    setFormData(null);
    setListData(null);
    
    // Initialize ServiceNow OOB components when the component mounts
    initializeServiceNowComponents();
  }, [table, sysId, mode, view]);

  const initializeServiceNowComponents = () => {
    // Initialize OOB Form View
    if ((mode === 'form' || mode === 'both') && formRef.current) {
      initializeFormView();
    }

    // Initialize OOB List View
    if ((mode === 'list' || mode === 'both') && listRef.current) {
      initializeListView();
    }
  };

  const initializeFormView = () => {
    if (!formRef.current) return;

    const formHtml = `
      <div id="sn-form-container">
        <div class="sn-form-header">
          <h2>${table.charAt(0).toUpperCase() + table.slice(1)} Form</h2>
          <div class="form-info">
            <small>Table: <strong>${table}</strong> | View: <strong>${view}</strong> | ${sysId ? 'Edit Mode' : 'Create Mode'}</small>
          </div>
        </div>
        <div class="sn-form-loading">
          <div class="loading-spinner"></div>
          <p>Loading form configuration from ServiceNow...</p>
        </div>
        <form id="form_${table}" class="sn-form" method="post" action="" style="display:none;">
          <input type="hidden" name="sysparm_form" value="${table}">
          <input type="hidden" name="sys_id" value="${sysId}">
          <div id="form_sections_${table}"></div>
          <div class="sn-form-actions">
            <button type="button" id="btn-submit" class="btn btn-primary">
              ${sysId ? 'Update Record' : 'Create Record'}
            </button>
            <button type="button" id="btn-cancel" class="btn btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    `;
    
    formRef.current.innerHTML = formHtml;
    loadFormFields();
  };

  const initializeListView = () => {
    if (!listRef.current) return;

    const listHtml = `
      <div id="sn-list-container">
        <div class="sn-list-header">
          <h2>${table.charAt(0).toUpperCase() + table.slice(1)} List</h2>
          <div class="sn-list-actions">
            <button type="button" id="btn-new" class="btn btn-primary">
              New ${table.charAt(0).toUpperCase() + table.slice(1)}
            </button>
            <button type="button" id="btn-refresh" class="btn btn-secondary">
              Refresh List
            </button>
          </div>
        </div>
        <div class="sn-list-loading">
          <div class="loading-spinner"></div>
          <p>Loading list configuration from ServiceNow...</p>
        </div>
        <div id="list_${table}" class="sn-list-table-container" style="display:none;">
          <table class="sn-list-table">
            <thead id="list-header-${table}"></thead>
            <tbody id="list-body-${table}"></tbody>
          </table>
        </div>
      </div>
    `;
    
    listRef.current.innerHTML = listHtml;
    loadListData();
  };

  const loadFormFields = () => {
    if (typeof window.GlideAjax === 'undefined') {
      setError('GlideAjax not available. This demo requires a live ServiceNow instance.');
      hideLoading('form');
      return;
    }

    const ajax = new window.GlideAjax('TableUtils');
    ajax.addParam('sysparm_name', 'getFormFields');
    ajax.addParam('sysparm_table', table);
    ajax.addParam('sysparm_view', view);
    ajax.addParam('sysparm_sys_id', sysId);
    ajax.getXMLAnswer((response: string) => {
      try {
        const data = JSON.parse(response);
        if (data.error) {
          setError(`Form Error: ${data.error}`);
        } else {
          setFormData(data);
          renderDynamicForm(data);
        }
      } catch (e) {
        setError(`Failed to parse form response: ${e}`);
      }
      hideLoading('form');
      setLoading(false);
    });
  };

  const loadListData = () => {
    if (typeof window.GlideAjax === 'undefined') {
      setError('GlideAjax not available. This demo requires a live ServiceNow instance.');
      hideLoading('list');
      return;
    }

    const ajax = new window.GlideAjax('TableUtils');
    ajax.addParam('sysparm_name', 'getListData');
    ajax.addParam('sysparm_table', table);
    ajax.addParam('sysparm_view', view);
    ajax.addParam('sysparm_limit', '25');
    ajax.getXMLAnswer((response: string) => {
      try {
        const data = JSON.parse(response);
        if (data.error) {
          setError(`List Error: ${data.error}`);
        } else {
          setListData(data);
          renderDynamicList(data);
        }
      } catch (e) {
        setError(`Failed to parse list response: ${e}`);
      }
      hideLoading('list');
      setLoading(false);
    });
  };

  const hideLoading = (type: 'form' | 'list') => {
    const loadingEl = document.querySelector(`.sn-${type}-loading`) as HTMLElement;
    const contentEl = document.querySelector(`#${type === 'form' ? 'form_' + table : 'list_' + table}`) as HTMLElement;
    
    if (loadingEl) loadingEl.style.display = 'none';
    if (contentEl) contentEl.style.display = 'block';
  };

  const renderDynamicForm = (data: any) => {
    const container = document.getElementById(`form_sections_${table}`);
    if (!container || !data.layout || !data.layout.sections) {
      setError('Invalid form layout data received');
      return;
    }

    let sectionsHtml = '';
    
    if (data.layout.sections.length === 0) {
      sectionsHtml = `
        <div class="no-data-message">
          <h3>No form configuration found</h3>
          <p>No form sections found for table <strong>${table}</strong> with view <strong>${view}</strong>.</p>
          <p>This could mean:</p>
          <ul>
            <li>The table doesn't have a form configured</li>
            <li>The specified view doesn't exist</li>
            <li>You don't have access to the form configuration</li>
          </ul>
        </div>
      `;
    } else {
      // Render each section
      data.layout.sections.forEach((section: any, index: number) => {
        sectionsHtml += `
          <div class="sn-form-section">
            <h3 class="sn-section-header">
              ${section.caption || `Section ${index + 1}`}
              <small class="section-info">(${section.fields.length} fields, position: ${section.position})</small>
            </h3>
            <div class="sn-section-fields">
        `;
        
        section.fields.forEach((field: any) => {
          if (field.type === 'field' && field.element) {
            const currentValue = data.values[field.element] || field.default_value || '';
            sectionsHtml += `
              <div class="sn-form-field ${field.mandatory ? 'mandatory' : ''}">
                <label for="${field.element}" class="sn-field-label">
                  ${field.label}
                  ${field.mandatory ? ' <span class="required">*</span>' : ''}
                  <small class="field-info">(${field.internal_type})</small>
                </label>
                ${renderFieldInput(field, currentValue)}
              </div>
            `;
          }
        });
        
        sectionsHtml += `
            </div>
          </div>
        `;
      });
    }
    
    container.innerHTML = sectionsHtml;
  };

  const renderFieldInput = (field: any, value: string = '') => {
    const disabled = field.read_only ? 'disabled' : '';
    const required = field.mandatory ? 'required' : '';
    
    switch (field.internal_type) {
      case 'choice':
        let options = '<option value="">-- None --</option>';
        if (field.choices && field.choices.length > 0) {
          field.choices.forEach((choice: any) => {
            const selected = choice.value === value ? 'selected' : '';
            options += `<option value="${choice.value}" ${selected}>${choice.label}</option>`;
          });
        }
        return `<select id="${field.element}" name="${field.element}" class="sn-field-input" ${disabled} ${required}>${options}</select>`;
      
      case 'reference':
        return `
          <div class="sn-reference-field">
            <input type="text" id="${field.element}" name="${field.element}" value="${value}" class="sn-field-input" ${disabled} ${required} placeholder="Reference to ${field.reference_table}" />
            <button type="button" class="btn btn-sm btn-secondary" ${disabled} title="Reference lookup for ${field.reference_table}">
              🔍
            </button>
          </div>
        `;
      
      case 'glide_date':
      case 'date':
        return `<input type="date" id="${field.element}" name="${field.element}" value="${value}" class="sn-field-input" ${disabled} ${required} />`;
      
      case 'glide_date_time':
      case 'datetime':
        return `<input type="datetime-local" id="${field.element}" name="${field.element}" value="${value}" class="sn-field-input" ${disabled} ${required} />`;
      
      case 'boolean':
        const checked = value === 'true' || value === '1' ? 'checked' : '';
        return `
          <label class="checkbox-container">
            <input type="checkbox" id="${field.element}" name="${field.element}" ${checked} class="sn-checkbox" ${disabled} />
            <span class="checkbox-label">Yes</span>
          </label>
        `;
      
      case 'html':
      case 'journal':
      case 'journal_input':
        return `<textarea id="${field.element}" name="${field.element}" class="sn-field-input sn-textarea" ${disabled} ${required} placeholder="Enter ${field.label.toLowerCase()}">${value}</textarea>`;
      
      case 'integer':
        return `<input type="number" id="${field.element}" name="${field.element}" value="${value}" class="sn-field-input" ${disabled} ${required} step="1" />`;
      
      case 'decimal':
        return `<input type="number" id="${field.element}" name="${field.element}" value="${value}" class="sn-field-input" ${disabled} ${required} step="0.01" />`;
      
      case 'email':
        return `<input type="email" id="${field.element}" name="${field.element}" value="${value}" class="sn-field-input" ${disabled} ${required} />`;
      
      case 'url':
        return `<input type="url" id="${field.element}" name="${field.element}" value="${value}" class="sn-field-input" ${disabled} ${required} />`;
      
      default:
        return `<input type="text" id="${field.element}" name="${field.element}" value="${value}" class="sn-field-input" ${disabled} ${required} ${field.max_length ? 'maxlength="' + field.max_length + '"' : ''} placeholder="Enter ${field.label.toLowerCase()}" />`;
    }
  };

  const renderDynamicList = (data: any) => {
    const headerContainer = document.getElementById(`list-header-${table}`);
    const bodyContainer = document.getElementById(`list-body-${table}`);
    
    if (!headerContainer || !bodyContainer || !data.columns) {
      setError('Invalid list layout data received');
      return;
    }

    if (data.columns.length === 0) {
      const noDataHtml = `
        <tr><td class="no-data-message">
          <h3>No list configuration found</h3>
          <p>No list columns configured for table <strong>${table}</strong> with view <strong>${view}</strong>.</p>
        </td></tr>
      `;
      headerContainer.innerHTML = '<tr><th>Message</th></tr>';
      bodyContainer.innerHTML = noDataHtml;
      return;
    }

    // Render table headers
    let headerHtml = '<tr>';
    data.columns.forEach((column: any) => {
      headerHtml += `
        <th class="sn-list-header" title="${column.name} (${column.type})">
          ${column.label}
          <small class="column-info">${column.type}</small>
        </th>
      `;
    });
    headerHtml += '<th class="sn-list-header">Actions</th></tr>';
    headerContainer.innerHTML = headerHtml;

    // Render table rows
    let bodyHtml = '';
    if (data.records && data.records.length > 0) {
      data.records.forEach((record: any) => {
        bodyHtml += '<tr class="sn-list-row">';
        data.columns.forEach((column: any) => {
          const value = record[column.name] || '';
          bodyHtml += `<td class="sn-list-cell" title="${column.name}: ${value}">${value}</td>`;
        });
        bodyHtml += `
          <td class="sn-list-cell">
            <button type="button" class="btn btn-sm btn-primary" onclick="editRecord('${record.sys_id}')" title="Edit ${record.sys_id}">
              Edit
            </button>
            <button type="button" class="btn btn-sm btn-danger" onclick="deleteRecord('${record.sys_id}')" title="Delete ${record.sys_id}">
              Delete
            </button>
          </td>
        </tr>`;
      });
    } else {
      bodyHtml = `<tr><td colspan="${data.columns.length + 1}" class="text-center no-data-message">No records found in table ${table}</td></tr>`;
    }
    
    bodyContainer.innerHTML = bodyHtml;
  };

  // Global functions for UI Actions
  useEffect(() => {
    (window as any).submitForm = () => {
      const form = document.getElementById(`form_${table}`) as HTMLFormElement;
      if (form) {
        const formData = new FormData(form);
        const dataObj = Object.fromEntries(formData);
        console.log('Form data to submit:', dataObj);
        alert(`Would ${sysId ? 'update' : 'create'} ${table} record with data: ${JSON.stringify(dataObj, null, 2)}`);
      }
    };

    (window as any).cancelForm = () => {
      if (confirm('Cancel form? Any unsaved changes will be lost.')) {
        const form = document.getElementById(`form_${table}`) as HTMLFormElement;
        form?.reset();
      }
    };

    (window as any).createNewRecord = () => {
      console.log(`Create new ${table} record`);
      alert(`Would navigate to create new ${table} record`);
    };

    (window as any).refreshList = () => {
      console.log('Refreshing list...');
      loadListData();
    };

    (window as any).editRecord = (recordSysId: string) => {
      console.log(`Edit record: ${recordSysId}`);
      alert(`Would navigate to edit ${table} record: ${recordSysId}`);
    };

    (window as any).deleteRecord = (recordSysId: string) => {
      if (confirm(`Delete record ${recordSysId}?`)) {
        console.log(`Delete record: ${recordSysId}`);
        alert(`Would delete ${table} record: ${recordSysId}`);
      }
    };
  }, [table, sysId]);

  return (
    <div className="servicenow-oob-components">
      <style dangerouslySetInnerHTML={{
        __html: `
        .servicenow-oob-components {
          padding: 20px;
          max-width: 1400px;
          margin: 0 auto;
        }
        .sn-form, .sn-list-container {
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 8px;
          margin-bottom: 20px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .sn-form-header, .sn-list-header {
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid #007bff;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .form-info, .section-info, .field-info, .column-info {
          color: #666;
          font-size: 12px;
        }
        .sn-form-loading, .sn-list-loading {
          text-align: center;
          padding: 40px;
          color: #666;
        }
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #007bff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .sn-form-section {
          margin-bottom: 40px;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          padding: 20px;
          background: #f8f9fa;
        }
        .sn-section-header {
          color: #333;
          font-size: 18px;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 1px solid #dee2e6;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .sn-section-fields {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 20px;
        }
        .sn-form-field {
          background: white;
          padding: 15px;
          border-radius: 6px;
          border: 1px solid #dee2e6;
        }
        .sn-form-field.mandatory {
          border-left: 4px solid #dc3545;
        }
        .sn-field-label {
          display: block;
          margin-bottom: 8px;
          font-weight: bold;
          color: #333;
        }
        .required {
          color: #dc3545;
        }
        .sn-field-input {
          width: 100%;
          padding: 10px 15px;
          border: 1px solid #ced4da;
          border-radius: 6px;
          font-size: 14px;
          box-sizing: border-box;
          transition: border-color 0.3s, box-shadow 0.3s;
        }
        .sn-field-input:focus {
          border-color: #007bff;
          box-shadow: 0 0 0 3px rgba(0,123,255,0.1);
          outline: none;
        }
        .sn-textarea {
          min-height: 100px;
          resize: vertical;
        }
        .sn-reference-field {
          display: flex;
          gap: 8px;
        }
        .sn-reference-field input {
          flex: 1;
        }
        .checkbox-container {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }
        .sn-checkbox {
          width: auto !important;
        }
        .sn-form-actions, .sn-list-actions {
          margin-top: 30px;
          display: flex;
          gap: 15px;
        }
        .sn-list-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        .sn-list-header, .sn-list-cell {
          padding: 12px;
          border: 1px solid #dee2e6;
          text-align: left;
        }
        .sn-list-header {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          font-weight: bold;
          color: #495057;
        }
        .sn-list-row:hover {
          background-color: #f8f9fa;
        }
        .sn-list-row:nth-child(even) {
          background-color: #fcfcfc;
        }
        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.3s;
        }
        .btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
        .btn-primary {
          background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
          color: white;
        }
        .btn-secondary {
          background: linear-gradient(135deg, #6c757d 0%, #545b62 100%);
          color: white;
        }
        .btn-danger {
          background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
          color: white;
        }
        .btn-sm {
          padding: 6px 12px;
          font-size: 12px;
        }
        .text-center {
          text-align: center;
        }
        .error-message {
          background: #f8d7da;
          color: #721c24;
          padding: 15px;
          border-radius: 6px;
          margin-bottom: 20px;
          border: 1px solid #f5c6cb;
        }
        .no-data-message {
          padding: 40px;
          text-align: center;
          color: #6c757d;
          background: #f8f9fa;
          border-radius: 8px;
          border: 1px dashed #dee2e6;
        }
      `}} />
      
      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {(mode === 'form' || mode === 'both') && (
        <div ref={formRef} className="sn-form-wrapper"></div>
      )}
      
      {(mode === 'list' || mode === 'both') && (
        <div ref={listRef} className="sn-list-wrapper"></div>
      )}
      
      {/* Debug Info */}
      {(formData || listData) && (
        <div style={{
          marginTop: '30px',
          padding: '20px',
          background: '#f8f9fa',
          borderRadius: '8px',
          fontSize: '12px',
          color: '#666'
        }}>
          <h4>Debug Information:</h4>
          {formData && (
            <div>
              <strong>Form Data:</strong> {formData.layout.sections.length} sections found
              <br />
              <strong>Form Sys ID:</strong> {formData.layout.formSysId || 'None'}
            </div>
          )}
          {listData && (
            <div>
              <strong>List Data:</strong> {listData.columns.length} columns, {listData.records.length} records
              <br />
              <strong>List Sys ID:</strong> {listData.listSysId || 'None'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ServiceNowOOBComponents;