import React, { useState } from 'react';

// Utility functions for list configuration handling
export const ListConfigUtils = {
  // Validate list configuration structure
  validateConfig: (config: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!config) {
      errors.push('Configuration is required');
      return { isValid: false, errors };
    }
    
    if (!config.table || typeof config.table !== 'string') {
      errors.push('Table name is required and must be a string');
    }
    
    if (!config.columns || !Array.isArray(config.columns)) {
      errors.push('Columns array is required');
      return { isValid: false, errors };
    }
    
    if (config.columns.length === 0) {
      errors.push('At least one column is required');
    }
    
    config.columns.forEach((column: any, index: number) => {
      if (!column.name) {
        errors.push(`Column ${index}: name is required`);
      }
      
      if (!column.label) {
        errors.push(`Column ${index}: label is required`);
      }
      
      if (!column.data_type) {
        errors.push(`Column ${index}: data_type is required`);
      }
      
      if (column.position === undefined || column.position === null) {
        errors.push(`Column ${index}: position is required`);
      }
    });
    
    return { isValid: errors.length === 0, errors };
  },

  // Clean and normalize list configuration
  normalizeConfig: (config: any): any => {
    if (!config || !config.columns) return config;
    
    const normalizedConfig = { ...config };
    
    normalizedConfig.columns = config.columns.map((column: any) => ({
      ...column,
      position: Number(column.position) || 0,
      label: column.label || column.name || '',
      data_type: column.data_type || 'string'
    }));
    
    return normalizedConfig;
  },

  // Extract column statistics from config
  getConfigStats: (config: any): { 
    totalColumns: number; 
    columnTypes: Record<string, number>;
    hasSystemColumns: boolean;
  } => {
    if (!config || !config.columns) {
      return {
        totalColumns: 0,
        columnTypes: {},
        hasSystemColumns: false
      };
    }
    
    const stats = {
      totalColumns: config.columns.length,
      columnTypes: {} as Record<string, number>,
      hasSystemColumns: false
    };
    
    config.columns.forEach((column: any) => {
      const dataType = column.data_type || 'string';
      stats.columnTypes[dataType] = (stats.columnTypes[dataType] || 0) + 1;
      
      if (column.name && column.name.startsWith('sys_')) {
        stats.hasSystemColumns = true;
      }
    });
    
    return stats;
  },

  // Generate sample records for testing
  generateSampleRecords: (config: any, count: number = 10): any[] => {
    if (!config || !config.columns) return [];
    
    const records = [];
    
    for (let i = 0; i < count; i++) {
      const record: any = {
        sys_id: `sample_${i + 1}_${Date.now()}`
      };
      
      config.columns.forEach((column: any) => {
        switch (column.data_type.toLowerCase()) {
          case 'string':
            record[column.name] = `Sample ${column.label} ${i + 1}`;
            break;
          case 'email':
            record[column.name] = `user${i + 1}@example.com`;
            break;
          case 'boolean':
            record[column.name] = true;
            break;
          case 'glide_date_time':
          case 'datetime':
            record[column.name] = "12/12/2025 10:10:10";
            break;
          case 'glide_date':
          case 'date':
            record[column.name] = "12/12/2025";
            break;
          case 'integer':
            record[column.name] = 333;
            break;
          case 'reference':
            record[column.name] = {
              value: `ref_${i + 1}`,
              display_value: `Reference ${i + 1}`
            };
            break;
          default:
            record[column.name] = `${column.label} ${i + 1}`;
            break;
        }
      });
      
      records.push(record);
    }
    
    return records;
  }
};

// Component for importing/loading list configurations
interface ListConfigLoaderProps {
  onConfigLoad: (config: any) => void;
  onError?: (error: string) => void;
}

export const ListConfigLoader: React.FC<ListConfigLoaderProps> = ({
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
      const validation = ListConfigUtils.validateConfig(config);
      
      if (!validation.isValid) {
        onError?.(`Configuration errors:\n${validation.errors.join('\n')}`);
        setLoading(false);
        return;
      }
      
      const normalizedConfig = ListConfigUtils.normalizeConfig(config);
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
        const validation = ListConfigUtils.validateConfig(config);
        
        if (!validation.isValid) {
          onError?.(`Configuration errors:\n${validation.errors.join('\n')}`);
          setLoading(false);
          return;
        }
        
        const normalizedConfig = ListConfigUtils.normalizeConfig(config);
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

  const loadSampleConfig = () => {
    const sampleConfig = {
      "table": "sys_user",
      "view": "default",
      "list_sys_id": "sample_list_id",
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
    
    onConfigLoad(sampleConfig);
  };

  return (
    <div className="list-config-loader">
      <style dangerouslySetInnerHTML={{
        __html: `
        .list-config-loader {
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
        .config-btn-success {
          background: #28a745;
          color: white;
        }
        .config-btn-success:hover:not(:disabled) {
          background: #218838;
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
        Load List Configuration
      </div>
      
      <div className="config-input-group">
        <label htmlFor="list-json-input" className="form-label">
          Paste JSON Configuration:
        </label>
        <textarea
          id="list-json-input"
          className="config-textarea"
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder="Paste your list configuration JSON here..."
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
        
        <label htmlFor="list-file-input" className="config-btn config-btn-secondary">
          {loading ? '⏳' : '📁'} Load from File
        </label>
        <input
          id="list-file-input"
          type="file"
          accept=".json,application/json"
          onChange={handleFileLoad}
          disabled={loading}
          className="file-input"
        />
        
        <button
          className="config-btn config-btn-success"
          onClick={loadSampleConfig}
          disabled={loading}
        >
          📋 Load Sample
        </button>
      </div>
    </div>
  );
};

export default ListConfigUtils;