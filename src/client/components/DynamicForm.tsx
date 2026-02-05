import React, { useState, useEffect } from 'react';

// Types for the form configuration
interface Choice {
  value: string;
  label: string;
  sequence: number;
  inactive: boolean;
}

interface Field {
  name: string;
  position: number;
  label: string;
  data_type: string;
  default_value: string;
  visible: boolean;
  mandatory: boolean;
  read_only: boolean;
  is_reference: boolean;
  reference_table: string;
  choices?: Choice[];
}

interface Section {
  name: string;
  position: number;
  fields: Field[];
}

interface FormConfig {
  table: string;
  view: string;
  sections: Section[];
}

interface DynamicFormProps {
  config: FormConfig;
  data?: Record<string, any>;
  onSubmit?: (formData: Record<string, any>) => void;
  onChange?: (fieldName: string, value: any) => void;
  maxColumns?: number;
  className?: string;
}

const DynamicForm: React.FC<DynamicFormProps> = ({
  config,
  data = {},
  onSubmit,
  onChange,
  maxColumns = 4,
  className = ''
}) => {
  const [formData, setFormData] = useState<Record<string, any>>(data);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setFormData(data);
  }, [data]);

  const handleFieldChange = (fieldName: string, value: any) => {
    const newFormData = { ...formData, [fieldName]: value };
    setFormData(newFormData);
    
    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors({ ...errors, [fieldName]: '' });
    }
    
    onChange?.(fieldName, value);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    config.sections.forEach(section => {
      section.fields.forEach(field => {
        if (field.visible && field.mandatory && field.name && !field.name.startsWith('.')) {
          const value = formData[field.name];
          if (!value || (typeof value === 'string' && value.trim() === '')) {
            newErrors[field.name] = `${field.label || field.name} is required`;
          }
        }
      });
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit?.(formData);
    }
  };

  const renderField = (field: Field): JSX.Element | null => {
    // Skip non-visible fields and special fields like .split, .begin_split, etc.
    if (!field.visible || !field.name || field.name.startsWith('.') || field.name.includes('.xml')) {
      return null;
    }

    const value = formData[field.name] || field.default_value || '';
    const hasError = !!errors[field.name];
    const fieldId = `field_${field.name}`;

    const commonProps = {
      id: fieldId,
      name: field.name,
      value: value,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => 
        handleFieldChange(field.name, e.target.value),
      disabled: field.read_only,
      required: field.mandatory,
      className: `form-control ${hasError ? 'is-invalid' : ''}`,
    };

    let inputElement: JSX.Element;

    switch (field.data_type.toLowerCase()) {
      case 'string':
        if (field.choices && field.choices.length > 0) {
          // Render as dropdown for string fields with choices
          inputElement = (
            <select {...commonProps}>
              <option value="">-- Select --</option>
              {field.choices
                .filter(choice => !choice.inactive)
                .sort((a, b) => a.sequence - b.sequence)
                .map(choice => (
                  <option key={choice.value} value={choice.value}>
                    {choice.label}
                  </option>
                ))}
            </select>
          );
        } else {
          inputElement = <input type="text" {...commonProps} maxLength={255} />;
        }
        break;

      case 'choice':
      case 'integer':
        if (field.choices && field.choices.length > 0) {
          inputElement = (
            <select {...commonProps}>
              <option value="">-- Select --</option>
              {field.choices
                .filter(choice => !choice.inactive)
                .sort((a, b) => a.sequence - b.sequence)
                .map(choice => (
                  <option key={choice.value} value={choice.value}>
                    {choice.label}
                  </option>
                ))}
            </select>
          );
        } else {
          inputElement = <input type="number" {...commonProps} step="1" />;
        }
        break;

      case 'reference':
        inputElement = (
          <div className="input-group">
            <input
              type="text"
              {...commonProps}
              placeholder={`Reference to ${field.reference_table}`}
            />
            <div className="input-group-append">
              <button
                type="button"
                className="btn btn-outline-secondary"
                title={`Browse ${field.reference_table}`}
                disabled={field.read_only}
                onClick={() => {
                  // TODO: Implement reference lookup
                  alert(`Reference lookup for ${field.reference_table} would open here`);
                }}
              >
                🔍
              </button>
            </div>
          </div>
        );
        break;

      case 'boolean':
        inputElement = (
          <div className="form-check">
            <input
              type="checkbox"
              id={fieldId}
              name={field.name}
              checked={value === 'true' || value === true || value === '1'}
              onChange={(e) => handleFieldChange(field.name, e.target.checked)}
              disabled={field.read_only}
              className={`form-check-input ${hasError ? 'is-invalid' : ''}`}
            />
            <label className="form-check-label" htmlFor={fieldId}>
              Yes
            </label>
          </div>
        );
        break;

      case 'glide_date_time':
      case 'datetime':
        inputElement = <input type="datetime-local" {...commonProps} />;
        break;

      case 'glide_date':
      case 'date':
        inputElement = <input type="date" {...commonProps} />;
        break;

      case 'email':
        inputElement = <input type="email" {...commonProps} />;
        break;

      case 'password':
        inputElement = <input type="password" {...commonProps} autoComplete="new-password" />;
        break;

      case 'ph_number':
        inputElement = <input type="tel" {...commonProps} placeholder="Phone number" />;
        break;

      case 'user_image':
        inputElement = <input type="file" {...commonProps} accept="image/*" />;
        break;

      case 'html':
      case 'journal':
      case 'text':
        inputElement = (
          <textarea
            {...commonProps}
            rows={4}
            className={`form-control ${hasError ? 'is-invalid' : ''}`}
          />
        );
        break;

      default:
        inputElement = <input type="text" {...commonProps} />;
        break;
    }

    return (
      <div key={field.name} className="form-group mb-3">
        {field.data_type !== 'boolean' && (
          <label htmlFor={fieldId} className="form-label">
            {field.label || field.name}
            {field.mandatory && <span className="text-danger ms-1">*</span>}
            <small className="text-muted ms-1">({field.data_type})</small>
          </label>
        )}
        {inputElement}
        {hasError && (
          <div className="invalid-feedback d-block">
            {errors[field.name]}
          </div>
        )}
      </div>
    );
  };

  const renderSection = (section: Section): JSX.Element => {
    // Filter out visible fields and sort by position
    const visibleFields = section.fields
      .filter(field => field.visible && field.name && !field.name.startsWith('.') && !field.name.includes('.xml'))
      .sort((a, b) => a.position - b.position);

    if (visibleFields.length === 0) {
      return <div key={`section_${section.position}`}></div>;
    }

    // Calculate grid columns based on number of fields and maxColumns
    const columnsClass = Math.min(visibleFields.length, maxColumns);
    
    return (
      <div key={`section_${section.position}`} className="form-section mb-4">
        {section.name && (
          <div className="section-header mb-3">
            <h4 className="section-title">{section.name}</h4>
            <hr className="section-divider" />
          </div>
        )}
        <div className={`row row-cols-1 row-cols-md-2 row-cols-lg-${Math.min(columnsClass, 3)} row-cols-xl-${columnsClass}`}>
          {visibleFields.map(field => (
            <div key={field.name} className="col">
              {renderField(field)}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Sort sections by position
  const sortedSections = [...config.sections].sort((a, b) => a.position - b.position);

  return (
    <div className={`dynamic-form ${className}`}>
      <style dangerouslySetInnerHTML={{
        __html: `
        .dynamic-form {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        .form-header {
          background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
          color: white;
          padding: 20px;
          border-radius: 8px 8px 0 0;
          margin-bottom: 0;
        }
        .form-body {
          background: #fff;
          border: 1px solid #dee2e6;
          border-top: none;
          padding: 30px;
          border-radius: 0 0 8px 8px;
        }
        .form-section {
          margin-bottom: 2rem;
        }
        .section-header {
          margin-bottom: 1.5rem;
        }
        .section-title {
          color: #333;
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        .section-divider {
          border: none;
          height: 2px;
          background: linear-gradient(to right, #007bff, transparent);
          margin: 0;
        }
        .form-group {
          margin-bottom: 1rem;
        }
        .form-label {
          font-weight: 500;
          color: #333;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          flex-wrap: wrap;
        }
        .form-control, .form-select {
          border: 1px solid #ced4da;
          border-radius: 6px;
          padding: 0.75rem;
          font-size: 0.875rem;
          transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
        }
        .form-control:focus, .form-select:focus {
          border-color: #007bff;
          box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
        }
        .form-control.is-invalid, .form-select.is-invalid {
          border-color: #dc3545;
        }
        .form-check {
          padding-left: 1.5rem;
        }
        .form-check-input {
          margin-top: 0.25rem;
        }
        .form-check-label {
          margin-bottom: 0;
          font-weight: 500;
        }
        .input-group-append .btn {
          border-left: none;
        }
        .btn-outline-secondary {
          border-color: #ced4da;
        }
        .form-actions {
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid #dee2e6;
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
        }
        .btn {
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          font-weight: 500;
          transition: all 0.15s ease-in-out;
        }
        .btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }
        .btn-primary {
          background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
          border: none;
          color: white;
        }
        .btn-secondary {
          background: #6c757d;
          border: none;
          color: white;
        }
        .invalid-feedback {
          font-size: 0.75rem;
          color: #dc3545;
          margin-top: 0.25rem;
        }
        .text-danger {
          color: #dc3545 !important;
        }
        .text-muted {
          color: #6c757d !important;
        }
        .ms-1 {
          margin-left: 0.25rem !important;
        }
        .mb-3 {
          margin-bottom: 1rem !important;
        }
        .mb-4 {
          margin-bottom: 1.5rem !important;
        }
        .d-block {
          display: block !important;
        }
        
        /* Responsive grid classes */
        .row {
          display: flex;
          flex-wrap: wrap;
          margin-right: -0.75rem;
          margin-left: -0.75rem;
        }
        .col {
          flex-basis: 0;
          flex-grow: 1;
          max-width: 100%;
          padding-right: 0.75rem;
          padding-left: 0.75rem;
        }
        .row-cols-1 > * {
          flex: 0 0 100%;
          max-width: 100%;
        }
        .row-cols-2 > * {
          flex: 0 0 50%;
          max-width: 50%;
        }
        .row-cols-3 > * {
          flex: 0 0 33.333333%;
          max-width: 33.333333%;
        }
        .row-cols-4 > * {
          flex: 0 0 25%;
          max-width: 25%;
        }
        
        @media (min-width: 768px) {
          .row-cols-md-2 > * {
            flex: 0 0 50%;
            max-width: 50%;
          }
        }
        
        @media (min-width: 992px) {
          .row-cols-lg-2 > * {
            flex: 0 0 50%;
            max-width: 50%;
          }
          .row-cols-lg-3 > * {
            flex: 0 0 33.333333%;
            max-width: 33.333333%;
          }
          .row-cols-lg-4 > * {
            flex: 0 0 25%;
            max-width: 25%;
          }
        }
        
        @media (min-width: 1200px) {
          .row-cols-xl-2 > * {
            flex: 0 0 50%;
            max-width: 50%;
          }
          .row-cols-xl-3 > * {
            flex: 0 0 33.333333%;
            max-width: 33.333333%;
          }
          .row-cols-xl-4 > * {
            flex: 0 0 25%;
            max-width: 25%;
          }
        }
        
        /* Ensure proper spacing on mobile */
        @media (max-width: 767px) {
          .col {
            margin-bottom: 1rem;
          }
        }
        `}}
      />
      
      <div className="form-header">
        <h2 className="mb-0">
          {config.table.charAt(0).toUpperCase() + config.table.slice(1)} Form
        </h2>
        <small className="opacity-75">
          Table: {config.table} | View: {config.view || 'default'}
        </small>
      </div>
      
      <form onSubmit={handleSubmit} className="form-body">
        {sortedSections.map(renderSection)}
        
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setFormData({});
              setErrors({});
            }}
          >
            Reset Form
          </button>
          <button type="submit" className="btn btn-primary">
            Submit
          </button>
        </div>
      </form>
      
      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          background: '#f8f9fa',
          borderRadius: '6px',
          fontSize: '0.75rem',
          color: '#666'
        }}>
          <h6>Debug Information:</h6>
          <p><strong>Sections:</strong> {config.sections.length}</p>
          <p><strong>Total Fields:</strong> {config.sections.reduce((acc, section) => acc + section.fields.filter(f => f.visible && f.name && !f.name.startsWith('.')).length, 0)}</p>
          <p><strong>Current Data:</strong> {JSON.stringify(formData, null, 2)}</p>
        </div>
      )}
    </div>
  );
};

export default DynamicForm;