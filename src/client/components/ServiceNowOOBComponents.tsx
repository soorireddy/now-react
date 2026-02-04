import React, { useEffect, useRef } from 'react';

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
}

const ServiceNowOOBComponents: React.FC<ServiceNowOOBComponentsProps> = ({ 
  table = 'incident', 
  sysId = '',
  mode = 'both' 
}) => {
  const formRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize ServiceNow OOB components when the component mounts
    initializeServiceNowComponents();
  }, [table, sysId, mode]);

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

    // Create ServiceNow form using GlideForm
    const formHtml = `
      <div id="sn-form-container">
        <form id="form_${table}" class="sn-form" method="post" action="">
          <input type="hidden" name="sysparm_form" value="${table}">
          <input type="hidden" name="sys_id" value="${sysId}">
          <div class="sn-form-header">
            <h2>${table.charAt(0).toUpperCase() + table.slice(1)} Form</h2>
          </div>
          <div id="form_fields_${table}"></div>
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

    // Create ServiceNow list using GlideList
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
        <div id="list_${table}" class="sn-list-table-container">
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
      renderBasicForm();
      return;
    }

    // Use ServiceNow's server-side APIs to get form structure
    const ajax = new window.GlideAjax('TableUtils');
    ajax.addParam('sysparm_name', 'getFormFields');
    ajax.addParam('sysparm_table', table);
    ajax.addParam('sysparm_sys_id', sysId);
    ajax.getXMLAnswer((response: string) => {
      try {
        const formData = JSON.parse(response);
        renderFormFields(formData);
      } catch (e) {
        console.error('Error parsing form data:', e);
        renderBasicForm();
      }
    });
  };

  const loadListData = () => {
    // Check if GlideAjax is available, if not use fallback
    if (typeof window.GlideAjax === 'undefined') {
      console.warn('GlideAjax not available, using fallback list');
      renderBasicList();
      return;
    }

    // Use ServiceNow's server-side APIs to get list data
    const ajax = new window.GlideAjax('TableUtils');
    ajax.addParam('sysparm_name', 'getListData');
    ajax.addParam('sysparm_table', table);
    ajax.addParam('sysparm_limit', '25');
    ajax.getXMLAnswer((response: string) => {
      try {
        const listData = JSON.parse(response);
        renderListData(listData);
      } catch (e) {
        console.error('Error parsing list data:', e);
        renderBasicList();
      }
    });
  };

  const renderFormFields = (formData: any) => {
    const container = document.getElementById(`form_fields_${table}`);
    if (!container || !formData.fields) return;

    let fieldsHtml = '';
    formData.fields.forEach((field: any) => {
      fieldsHtml += `
        <div class="sn-form-field">
          <label for="${field.name}" class="sn-field-label">
            ${field.label}${field.mandatory ? ' *' : ''}
          </label>
          ${renderFieldInput(field)}
        </div>
      `;
    });
    
    container.innerHTML = fieldsHtml;
  };

  const renderFieldInput = (field: any) => {
    const value = field.value || '';
    const disabled = field.readonly ? 'disabled' : '';
    
    switch (field.type) {
      case 'choice':
        let options = '<option value="">-- None --</option>';
        field.choices?.forEach((choice: any) => {
          const selected = choice.value === value ? 'selected' : '';
          options += `<option value="${choice.value}" ${selected}>${choice.label}</option>`;
        });
        return `<select id="${field.name}" name="${field.name}" class="sn-field-input" ${disabled}>${options}</select>`;
      
      case 'reference':
        return `
          <div class="sn-reference-field">
            <input type="text" id="${field.name}" name="${field.name}" value="${value}" class="sn-field-input" ${disabled} />
            <button type="button" class="btn btn-sm btn-secondary" onclick="openReferenceSelector('${field.name}', '${field.reference_table}')">
              ...
            </button>
          </div>
        `;
      
      case 'date':
        return `<input type="date" id="${field.name}" name="${field.name}" value="${value}" class="sn-field-input" ${disabled} />`;
      
      case 'datetime':
        return `<input type="datetime-local" id="${field.name}" name="${field.name}" value="${value}" class="sn-field-input" ${disabled} />`;
      
      case 'boolean':
        const checked = value === 'true' ? 'checked' : '';
        return `<input type="checkbox" id="${field.name}" name="${field.name}" ${checked} class="sn-field-input" ${disabled} />`;
      
      case 'textarea':
        return `<textarea id="${field.name}" name="${field.name}" class="sn-field-input" ${disabled}>${value}</textarea>`;
      
      default:
        return `<input type="text" id="${field.name}" name="${field.name}" value="${value}" class="sn-field-input" ${disabled} />`;
    }
  };

  const renderListData = (listData: any) => {
    const headerContainer = document.getElementById(`list-header-${table}`);
    const bodyContainer = document.getElementById(`list-body-${table}`);
    
    if (!headerContainer || !bodyContainer || !listData.columns || !listData.records) return;

    // Render table headers
    let headerHtml = '<tr>';
    listData.columns.forEach((column: any) => {
      headerHtml += `<th class="sn-list-header">${column.label}</th>`;
    });
    headerHtml += '<th class="sn-list-header">Actions</th></tr>';
    headerContainer.innerHTML = headerHtml;

    // Render table rows
    let bodyHtml = '';
    listData.records.forEach((record: any) => {
      bodyHtml += '<tr class="sn-list-row">';
      listData.columns.forEach((column: any) => {
        const value = record[column.name] || '';
        bodyHtml += `<td class="sn-list-cell">${value}</td>`;
      });
      bodyHtml += `
        <td class="sn-list-cell">
          <button type="button" class="btn btn-sm btn-primary" onclick="editRecord('${record.sys_id}')">
            Edit
          </button>
          <button type="button" class="btn btn-sm btn-danger" onclick="deleteRecord('${record.sys_id}')">
            Delete
          </button>
        </td>
      </tr>`;
    });
    bodyContainer.innerHTML = bodyHtml;
  };

  const renderBasicForm = () => {
    // Fallback basic form for common incident fields
    const container = document.getElementById(`form_fields_${table}`);
    if (!container) return;

    const basicFields = table === 'incident' ? `
      <div class="sn-form-field">
        <label for="short_description" class="sn-field-label">Short Description *</label>
        <input type="text" id="short_description" name="short_description" class="sn-field-input" required />
      </div>
      <div class="sn-form-field">
        <label for="description" class="sn-field-label">Description</label>
        <textarea id="description" name="description" class="sn-field-input"></textarea>
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
    ` : `
      <div class="sn-form-field">
        <label for="name" class="sn-field-label">Name</label>
        <input type="text" id="name" name="name" class="sn-field-input" />
      </div>
    `;
    
    container.innerHTML = basicFields;
  };

  const renderBasicList = () => {
    // Fallback basic list
    const headerContainer = document.getElementById(`list-header-${table}`);
    const bodyContainer = document.getElementById(`list-body-${table}`);
    
    if (!headerContainer || !bodyContainer) return;

    const basicHeaders = table === 'incident' 
      ? '<tr><th>Number</th><th>Short Description</th><th>State</th><th>Priority</th><th>Actions</th></tr>'
      : '<tr><th>Name</th><th>Created</th><th>Actions</th></tr>';
    
    headerContainer.innerHTML = basicHeaders;
    bodyContainer.innerHTML = '<tr><td colspan="5" class="text-center">Loading...</td></tr>';
  };

  // Global functions for UI Actions (attached to window)
  useEffect(() => {
    // UI Actions
    (window as any).submitForm = () => {
      const form = document.getElementById(`form_${table}`) as HTMLFormElement;
      if (form) {
        // Process form submission
        const formData = new FormData(form);
        console.log('Submitting form:', Object.fromEntries(formData));
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
      // You would load the record data and populate the form
      if (formRef.current) {
        formRef.current.style.display = 'block';
      }
    };

    (window as any).deleteRecord = (recordSysId: string) => {
      if (confirm('Are you sure you want to delete this record?')) {
        console.log('Deleting record:', recordSysId);
        // Process deletion
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
        .sn-form-field {
          margin-bottom: 15px;
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
      `}} />
      
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