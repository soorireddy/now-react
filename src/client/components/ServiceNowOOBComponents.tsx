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

  useEffect(() => {
    setLoading(true);
    setError('');
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

    // Create ServiceNow form container
    const formHtml = `
      <div id="sn-form-container">
        <div class="sn-form-header">
          <h2>${table.charAt(0).toUpperCase() + table.slice(1)} Form</h2>
          <div class="form-info">
            <small>View: ${view} | ${sysId ? 'Edit Mode' : 'Create Mode'}</small>
          </div>
        </div>
        <div class="sn-form-loading">Loading form fields...</div>
        <form id="form_${table}" class="sn-form" method="post" action="" style="display:none;">
          <input type="hidden" name="sysparm_form" value="${table}">
          <input type="hidden" name="sys_id" value="${sysId}">
          <div id="form_sections_${table}"></div>
          <div class="sn-form-actions">
            <button type="button" id="btn-submit" class="btn btn-primary" onclick="submitForm()">
              ${sysId ? 'Update' : 'Submit'}
            </button>
            <button type="button" id="btn-cancel" class="btn btn-secondary" onclick="cancelForm()">
              Cancel
            </button>
          </div>
        </form>
      </div>
    `;
    
    formRef.current.innerHTML = formHtml;
    
    // Load form fields using ServiceNow's form renderer
    loadFormFields();
  };

  const initializeListView = () => {
    if (!listRef.current) return;

    // Create ServiceNow list container
    const listHtml = `
      <div id="sn-list-container">
        <div class="sn-list-header">
          <h2>${table.charAt(0).toUpperCase() + table.slice(1)} List</h2>
          <div class="sn-list-actions">
            <button type="button" id="btn-new" class="btn btn-primary" onclick="createNewRecord()">
              New ${table.charAt(0).toUpperCase() + table.slice(1)}
            </button>
            <button type="button" id="btn-refresh" class="btn btn-secondary" onclick="refreshList()">
              Refresh
            </button>
          </div>
        </div>
        <div class="sn-list-loading">Loading list data...</div>
        <div id="list_${table}" class="sn-list-table-container" style="display:none;">
          <table class="sn-list-table">
            <thead id="list-header-${table}"></thead>
            <tbody id="list-body-${table}"></tbody>
          </table>
        </div>
      </div>
    `;
    
    listRef.current.innerHTML = listHtml;
    
    // Load list data using ServiceNow's list renderer
    loadListData();
  };

  const loadFormFields = () => {
    // Check if GlideAjax is available, if not use fallback
    if (typeof window.GlideAjax === 'undefined') {
      console.warn('GlideAjax not available, using fallback form');
      hideLoading('form');
      renderBasicForm();
      return;
    }

    // Use ServiceNow's server-side APIs to get form structure
    const ajax = new window.GlideAjax('TableUtils');
    ajax.addParam('sysparm_name', 'getFormFields');
    ajax.addParam('sysparm_table', table);
    ajax.addParam('sysparm_view', view);
    ajax.addParam('sysparm_sys_id', sysId);
    ajax.getXMLAnswer((response: string) => {
      try {
        const formData = JSON.parse(response);
        if (formData.error) {
          console.error('Server error:', formData.error);
          setError(formData.error);
          renderBasicForm();
        } else {
          renderDynamicForm(formData);
        }
      } catch (e) {
        console.error('Error parsing form data:', e);
        renderBasicForm();
      }
      hideLoading('form');
      setLoading(false);
    });
  };

  const loadListData = () => {
    // Check if GlideAjax is available, if not use fallback
    if (typeof window.GlideAjax === 'undefined') {
      console.warn('GlideAjax not available, using fallback list');
      hideLoading('list');
      renderBasicList();
      return;
    }

    // Use ServiceNow's server-side APIs to get list data
    const ajax = new window.GlideAjax('TableUtils');
    ajax.addParam('sysparm_name', 'getListData');
    ajax.addParam('sysparm_table', table);
    ajax.addParam('sysparm_view', view);
    ajax.addParam('sysparm_limit', '25');
    ajax.getXMLAnswer((response: string) => {
      try {
        const listData = JSON.parse(response);
        if (listData.error) {
          console.error('Server error:', listData.error);
          setError(listData.error);
          renderBasicList();
        } else {
          renderDynamicList(listData);
        }
      } catch (e) {
        console.error('Error parsing list data:', e);
        renderBasicList();
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

  const renderDynamicForm = (formData: any) => {
    const container = document.getElementById(`form_sections_${table}`);
    if (!container || !formData.layout || !formData.layout.sections) return;

    let sectionsHtml = '';
    
    // Render each section
    formData.layout.sections.forEach((section: any) => {
      if (section.fields && section.fields.length > 0) {
        sectionsHtml += `
          <div class="sn-form-section">
            ${section.caption ? `<h3 class="sn-section-header">${section.caption}</h3>` : ''}
            <div class="sn-section-fields">
        `;
        
        section.fields.forEach((field: any) => {
          if (field.type === 'field' && field.element) {
            const currentValue = formData.values[field.element] || field.default_value || '';
            sectionsHtml += `
              <div class="sn-form-field ${field.mandatory ? 'mandatory' : ''}">
                <label for="${field.element}" class="sn-field-label">
                  ${field.label}${field.mandatory ? ' *' : ''}
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
      }
    });
    
    container.innerHTML = sectionsHtml;
  };

  const renderFieldInput = (field: any, value: string = '') => {
    const disabled = field.read_only ? 'disabled' : '';
    const required = field.mandatory ? 'required' : '';
    
    switch (field.internal_type) {
      case 'choice':
        let options = '<option value="">-- None --</option>';
        field.choices?.forEach((choice: any) => {
          const selected = choice.value === value ? 'selected' : '';
          options += `<option value="${choice.value}" ${selected}>${choice.label}</option>`;
        });
        return `<select id="${field.element}" name="${field.element}" class="sn-field-input" ${disabled} ${required}>${options}</select>`;
      
      case 'reference':
        return `
          <div class="sn-reference-field">
            <input type="text" id="${field.element}" name="${field.element}" value="${value}" class="sn-field-input" ${disabled} ${required} />
            <button type="button" class="btn btn-sm btn-secondary" onclick="openReferenceSelector('${field.element}', '${field.reference_table}')" ${disabled}>
              ...
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
        return `<input type="checkbox" id="${field.element}" name="${field.element}" ${checked} class="sn-field-input" ${disabled} />`;
      
      case 'html':
      case 'journal':
      case 'journal_input':
        return `<textarea id="${field.element}" name="${field.element}" class="sn-field-input sn-textarea" ${disabled} ${required}>${value}</textarea>`;
      
      case 'integer':
      case 'decimal':
        return `<input type="number" id="${field.element}" name="${field.element}" value="${value}" class="sn-field-input" ${disabled} ${required} ${field.max_length ? 'max="' + field.max_length + '"' : ''} />`;
      
      case 'email':
        return `<input type="email" id="${field.element}" name="${field.element}" value="${value}" class="sn-field-input" ${disabled} ${required} />`;
      
      case 'url':
        return `<input type="url" id="${field.element}" name="${field.element}" value="${value}" class="sn-field-input" ${disabled} ${required} />`;
      
      default:
        return `<input type="text" id="${field.element}" name="${field.element}" value="${value}" class="sn-field-input" ${disabled} ${required} ${field.max_length ? 'maxlength="' + field.max_length + '"' : ''} />`;
    }
  };

  const renderDynamicList = (listData: any) => {
    const headerContainer = document.getElementById(`list-header-${table}`);
    const bodyContainer = document.getElementById(`list-body-${table}`);
    
    if (!headerContainer || !bodyContainer || !listData.columns || !listData.records) return;

    // Render table headers
    let headerHtml = '<tr>';
    listData.columns.forEach((column: any) => {
      headerHtml += `<th class="sn-list-header" title="${column.type}">${column.label}</th>`;
    });
    headerHtml += '<th class="sn-list-header">Actions</th></tr>';
    headerContainer.innerHTML = headerHtml;

    // Render table rows
    let bodyHtml = '';
    listData.records.forEach((record: any) => {
      bodyHtml += '<tr class="sn-list-row">';
      listData.columns.forEach((column: any) => {
        const value = record[column.name] || '';
        bodyHtml += `<td class="sn-list-cell" title="${column.name}">${value}</td>`;
      });
      bodyHtml += `
        <td class="sn-list-cell">
          <button type="button" class="btn btn-sm btn-primary" onclick="editRecord('${record.sys_id}')" title="Edit Record">
            Edit
          </button>
          <button type="button" class="btn btn-sm btn-danger" onclick="deleteRecord('${record.sys_id}')" title="Delete Record">
            Delete
          </button>
        </td>
      </tr>`;
    });
    
    if (listData.records.length === 0) {
      bodyHtml = `<tr><td colspan="${listData.columns.length + 1}" class="text-center">No records found</td></tr>`;
    }
    
    bodyContainer.innerHTML = bodyHtml;
  };

  const renderBasicForm = () => {
    // Fallback basic form for common fields
    const container = document.getElementById(`form_sections_${table}`);
    if (!container) return;

    const basicFields = `
      <div class="sn-form-section">
        <h3 class="sn-section-header">Basic Information</h3>
        <div class="sn-section-fields">
          <div class="sn-form-field mandatory">
            <label for="short_description" class="sn-field-label">Short Description *</label>
            <input type="text" id="short_description" name="short_description" class="sn-field-input" required />
          </div>
          <div class="sn-form-field">
            <label for="description" class="sn-field-label">Description</label>
            <textarea id="description" name="description" class="sn-field-input sn-textarea"></textarea>
          </div>
          <div class="sn-form-field">
            <label for="priority" class="sn-field-label">Priority</label>
            <select id="priority" name="priority" class="sn-field-input">
              <option value="">-- None --</option>
              <option value="1">1 - Critical</option>
              <option value="2">2 - High</option>
              <option value="3">3 - Moderate</option>
              <option value="4">4 - Low</option>
              <option value="5">5 - Planning</option>
            </select>
          </div>
          <div class="sn-form-field">
            <label for="state" class="sn-field-label">State</label>
            <select id="state" name="state" class="sn-field-input">
              <option value="">-- None --</option>
              <option value="1">New</option>
              <option value="2">In Progress</option>
              <option value="3">On Hold</option>
              <option value="6">Resolved</option>
              <option value="7">Closed</option>
            </select>
          </div>
        </div>
      </div>
    `;
    
    container.innerHTML = basicFields;
  };

  const renderBasicList = () => {
    // Fallback basic list
    const headerContainer = document.getElementById(`list-header-${table}`);
    const bodyContainer = document.getElementById(`list-body-${table}`);
    
    if (!headerContainer || !bodyContainer) return;

    const basicHeaders = '<tr><th>Number</th><th>Short Description</th><th>State</th><th>Priority</th><th>Actions</th></tr>';
    
    headerContainer.innerHTML = basicHeaders;
    bodyContainer.innerHTML = '<tr><td colspan="5" class="text-center">Sample data - Connect to ServiceNow instance for live data</td></tr>';
  };

  // Global functions for UI Actions (attached to window)
  useEffect(() => {
    // UI Actions
    (window as any).submitForm = () => {
      const form = document.getElementById(`form_${table}`) as HTMLFormElement;
      if (form) {
        // Process form submission
        const formData = new FormData(form);
        const dataObj = Object.fromEntries(formData);
        console.log('Submitting form:', dataObj);
        
        // Here you would call saveRecord via AJAX
        alert(`${sysId ? 'Updated' : 'Created'} ${table} record successfully!`);
      }
    };

    (window as any).cancelForm = () => {
      if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
        // Reset form or navigate away
        const form = document.getElementById(`form_${table}`) as HTMLFormElement;
        form?.reset();
      }
    };

    (window as any).createNewRecord = () => {
      // Clear form for new record
      const form = document.getElementById(`form_${table}`) as HTMLFormElement;
      form?.reset();
      // Show form if in list mode
      if (formRef.current) {
        formRef.current.style.display = 'block';
      }
    };

    (window as any).refreshList = () => {
      loadListData();
    };

    (window as any).editRecord = (recordSysId: string) => {
      // Load record for editing
      console.log('Editing record:', recordSysId);
      // You would reload the component with the sys_id
      if (formRef.current) {
        formRef.current.style.display = 'block';
      }
    };

    (window as any).deleteRecord = (recordSysId: string) => {
      if (confirm('Are you sure you want to delete this record?')) {
        console.log('Deleting record:', recordSysId);
        // Process deletion via AJAX
        alert('Record deleted successfully!');
        loadListData(); // Refresh list
      }
    };

    (window as any).openReferenceSelector = (fieldName: string, referenceTable: string) => {
      console.log(`Opening reference selector for ${fieldName} (${referenceTable})`);
      // Open ServiceNow's reference selector dialog
      // This would typically open a popup to select a reference record
    };
  }, [table, sysId]);

  return (
    <div className="servicenow-oob-components">
      <style dangerouslySetInnerHTML={{
        __html: `
        .servicenow-oob-components {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .sn-form, .sn-list-container {
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 4px;
          margin-bottom: 20px;
          padding: 20px;
        }
        .sn-form-header, .sn-list-header {
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 1px solid #eee;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .form-info {
          color: #666;
        }
        .sn-form-loading, .sn-list-loading {
          text-align: center;
          padding: 40px;
          color: #666;
        }
        .sn-form-section {
          margin-bottom: 30px;
        }
        .sn-section-header {
          color: #333;
          font-size: 18px;
          margin-bottom: 15px;
          padding-bottom: 8px;
          border-bottom: 2px solid #007bff;
        }
        .sn-section-fields {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }
        .sn-form-field {
          margin-bottom: 15px;
        }
        .sn-form-field.mandatory .sn-field-label::after {
          content: ' *';
          color: red;
        }
        .sn-field-label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
          color: #333;
        }
        .sn-field-input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 14px;
          box-sizing: border-box;
        }
        .sn-textarea {
          min-height: 80px;
          resize: vertical;
        }
        .sn-reference-field {
          display: flex;
          gap: 5px;
        }
        .sn-reference-field input {
          flex: 1;
        }
        .sn-form-actions, .sn-list-actions {
          margin-top: 20px;
          display: flex;
          gap: 10px;
        }
        .sn-list-table {
          width: 100%;
          border-collapse: collapse;
        }
        .sn-list-header, .sn-list-cell {
          padding: 10px;
          border: 1px solid #ddd;
          text-align: left;
        }
        .sn-list-header {
          background-color: #f5f5f5;
          font-weight: bold;
        }
        .sn-list-row:hover {
          background-color: #f9f9f9;
        }
        .btn {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }
        .btn-primary {
          background-color: #007bff;
          color: white;
        }
        .btn-secondary {
          background-color: #6c757d;
          color: white;
        }
        .btn-danger {
          background-color: #dc3545;
          color: white;
        }
        .btn-sm {
          padding: 4px 8px;
          font-size: 12px;
        }
        .text-center {
          text-align: center;
        }
        .error-message {
          background: #f8d7da;
          color: #721c24;
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 20px;
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
    </div>
  );
};

export default ServiceNowOOBComponents;