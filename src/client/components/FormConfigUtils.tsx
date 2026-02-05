import React, { useState } from 'react';

// Utility functions for form configuration handling
export const FormConfigUtils = {
  // Validate form configuration structure
  validateConfig: (config: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!config) {
      errors.push('Configuration is required');
      return { isValid: false, errors };
    }
    
    if (!config.table || typeof config.table !== 'string') {
      errors.push('Table name is required and must be a string');
    }
    
    if (!config.sections || !Array.isArray(config.sections)) {
      errors.push('Sections array is required');
      return { isValid: false, errors };
    }
    
    config.sections.forEach((section: any, sectionIndex: number) => {
      if (typeof section.position !== 'number') {
        errors.push(`Section ${sectionIndex}: position must be a number`);
      }
      
      if (!section.fields || !Array.isArray(section.fields)) {
        errors.push(`Section ${sectionIndex}: fields array is required`);
        return;
      }
      
      section.fields.forEach((field: any, fieldIndex: number) => {
        if (!field.name) {
          errors.push(`Section ${sectionIndex}, Field ${fieldIndex}: name is required`);
        }
        
        if (typeof field.position !== 'number') {
          errors.push(`Section ${sectionIndex}, Field ${fieldIndex}: position must be a number`);
        }
        
        if (typeof field.visible !== 'boolean') {
          errors.push(`Section ${sectionIndex}, Field ${fieldIndex}: visible must be a boolean`);
        }
        
        if (typeof field.mandatory !== 'boolean') {
          errors.push(`Section ${sectionIndex}, Field ${fieldIndex}: mandatory must be a boolean`);
        }
        
        if (typeof field.read_only !== 'boolean') {
          errors.push(`Section ${sectionIndex}, Field ${fieldIndex}: read_only must be a boolean`);
        }
      });
    });
    
    return { isValid: errors.length === 0, errors };
  },

  // Clean and normalize form configuration
  normalizeConfig: (config: any): any => {
    if (!config || !config.sections) return config;
    
    const normalizedConfig = { ...config };
    
    normalizedConfig.sections = config.sections.map((section: any) => ({
      ...section,
      name: section.name || '',
      position: Number(section.position) || 0,
      fields: section.fields.map((field: any) => ({
        ...field,
        position: Number(field.position) || 0,
        visible: Boolean(field.visible),
        mandatory: Boolean(field.mandatory),
        read_only: Boolean(field.read_only),
        is_reference: Boolean(field.is_reference),
        label: field.label || field.name || '',
        data_type: field.data_type || 'string',
        default_value: field.default_value || '',
        reference_table: field.reference_table || '',
        choices: field.choices || []
      }))
    }));
    
    return normalizedConfig;
  },

  // Extract field statistics from config
  getConfigStats: (config: any): { 
    totalSections: number; 
    totalFields: number; 
    visibleFields: number; 
    mandatoryFields: number; 
    referenceFields: number;
    fieldTypes: Record<string, number>;
  } => {
    if (!config || !config.sections) {
      return {
        totalSections: 0,
        totalFields: 0,
        visibleFields: 0,
        mandatoryFields: 0,
        referenceFields: 0,
        fieldTypes: {}
      };
    }
    
    const stats = {
      totalSections: config.sections.length,
      totalFields: 0,
      visibleFields: 0,
      mandatoryFields: 0,
      referenceFields: 0,
      fieldTypes: {} as Record<string, number>
    };
    
    config.sections.forEach((section: any) => {
      if (section.fields) {
        section.fields.forEach((field: any) => {
          // Skip special fields
          if (!field.name || field.name.startsWith('.') || field.name.includes('.xml')) {
            return;
          }
          
          stats.totalFields++;
          
          if (field.visible) stats.visibleFields++;
          if (field.mandatory) stats.mandatoryFields++;
          if (field.is_reference) stats.referenceFields++;
          
          const dataType = field.data_type || 'string';
          stats.fieldTypes[dataType] = (stats.fieldTypes[dataType] || 0) + 1;
        });
      }
    });
    
    return stats;
  }
};

// Component for importing/loading form configurations
interface FormConfigLoaderProps {
  onConfigLoad: (config: any) => void;
  onError?: (error: string) => void;
}

export const FormConfigLoader: React.FC<FormConfigLoaderProps> = ({
  onConfigLoad,
  onError
}) => {
  const [jsonInput, setJsonInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJsonLoad = () => {
    if (!jsonInput.trim()) {
      onError?.('Please enter JSON configuration');
      return;
    }

    setLoading(true);
    
    try {
      const config = JSON.parse(jsonInput);
      const validation = FormConfigUtils.validateConfig(config);
      
      if (!validation.isValid) {
        onError?.(`Configuration errors:\n${validation.errors.join('\n')}`);
        setLoading(false);
        return;
      }
      
      const normalizedConfig = FormConfigUtils.normalizeConfig(config);
      onConfigLoad(normalizedConfig);
      setJsonInput(''); // Clear input after successful load
      
    } catch (error) {
      onError?.(`Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileLoad = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      onError?.('Please select a JSON file');
      return;
    }

    setLoading(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const config = JSON.parse(content);
        const validation = FormConfigUtils.validateConfig(config);
        
        if (!validation.isValid) {
          onError?.(`Configuration errors:\n${validation.errors.join('\n')}`);
          setLoading(false);
          return;
        }
        
        const normalizedConfig = FormConfigUtils.normalizeConfig(config);
        onConfigLoad(normalizedConfig);
        
      } catch (error) {
        onError?.(`Error reading file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };
    
    reader.onerror = () => {
      onError?.('Error reading file');
      setLoading(false);
    };
    
    reader.readAsText(file);
  };

  return (
    <div className="form-config-loader">
      <style dangerouslySetInnerHTML={{
        __html: `
        .form-config-loader {
          background: white;
          border: 1px solid #dee2e6;
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }
        .config-loader-title {
          color: #333;
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }
        .config-input-group {
          margin-bottom: 1rem;
        }
        .config-textarea {
          width: 100%;
          min-height: 150px;
          padding: 0.75rem;
          border: 1px solid #ced4da;
          border-radius: 6px;
          font-family: 'Courier New', monospace;
          font-size: 0.875rem;
          resize: vertical;
          box-sizing: border-box;
        }
        .config-textarea:focus {
          border-color: #007bff;
          box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
          outline: none;
        }
        .config-actions {
          display: flex;
          gap: 1rem;
          align-items: center;
          flex-wrap: wrap;
        }
        .config-btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }
        .config-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .config-btn-primary {
          background: #007bff;
          color: white;
        }
        .config-btn-primary:hover:not(:disabled) {
          background: #0056b3;
        }
        .config-btn-secondary {
          background: #6c757d;
          color: white;
        }
        .config-btn-secondary:hover:not(:disabled) {
          background: #545b62;
        }
        .file-input {
          display: none;
        }
        .divider {
          margin: 1rem 0;
          text-align: center;
          color: #6c757d;
          position: relative;
        }
        .divider::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: #dee2e6;
        }
        .divider span {
          background: white;
          padding: 0 1rem;
        }
        `}}
      />
      
      <div className="config-loader-title">
        Load Form Configuration
      </div>
      
      <div className="config-input-group">
        <label htmlFor="json-input" className="form-label">
          Paste JSON Configuration:
        </label>
        <textarea
          id="json-input"
          className="config-textarea"
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder="Paste your form configuration JSON here..."
          disabled={loading}
        />
      </div>
      
      <div className="config-actions">
        <button
          className="config-btn config-btn-primary"
          onClick={handleJsonLoad}
          disabled={loading || !jsonInput.trim()}
        >
          {loading ? '⏳' : '📄'} Load from Text
        </button>
        
        <div className="divider">
          <span>or</span>
        </div>
        
        <label htmlFor="file-input" className="config-btn config-btn-secondary">
          {loading ? '⏳' : '📁'} Load from File
        </label>
        <input
          id="file-input"
          type="file"
          accept=".json,application/json"
          onChange={handleFileLoad}
          disabled={loading}
          className="file-input"
        />
      </div>
    </div>
  );
};

export default FormConfigUtils;