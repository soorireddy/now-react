import React, { useState, useMemo } from 'react';

// Types for the list configuration
interface ListColumn {
  name: string;
  label: string;
  data_type: string;
  position: string | number;
}

interface ListConfig {
  table: string;
  view: string;
  list_sys_id: string;
  columns: ListColumn[];
}

interface ListRecord {
  sys_id: string;
  [key: string]: any;
}

interface DynamicListProps {
  config: ListConfig;
  records?: ListRecord[];
  loading?: boolean;
  onEdit?: (record: ListRecord) => void;
  onDelete?: (record: ListRecord) => void;
  onRefresh?: () => void;
  onNew?: () => void;
  pageSize?: number;
  className?: string;
  showActions?: boolean;
  sortable?: boolean;
}

type SortDirection = 'asc' | 'desc' | null;

const DynamicList: React.FC<DynamicListProps> = ({
  config,
  records = [],
  loading = false,
  onEdit,
  onDelete,
  onRefresh,
  onNew,
  pageSize = 25,
  className = '',
  showActions = true,
  sortable = true
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Sort columns by position
  const sortedColumns = useMemo(() => {
    return [...config.columns].sort((a, b) => {
      const posA = parseInt(String(a.position)) || 0;
      const posB = parseInt(String(b.position)) || 0;
      return posA - posB;
    });
  }, [config.columns]);

  // Filter records based on search term
  const filteredRecords = useMemo(() => {
    if (!searchTerm.trim()) return records;
    
    const term = searchTerm.toLowerCase();
    return records.filter(record =>
      Object.values(record).some(value =>
        String(value).toLowerCase().includes(term)
      )
    );
  }, [records, searchTerm]);

  // Sort records
  const sortedRecords = useMemo(() => {
    if (!sortColumn || !sortDirection) return filteredRecords;
    
    return [...filteredRecords].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];
      
      let comparison = 0;
      
      if (aValue < bValue) comparison = -1;
      else if (aValue > bValue) comparison = 1;
      
      return sortDirection === 'desc' ? -comparison : comparison;
    });
  }, [filteredRecords, sortColumn, sortDirection]);

  // Paginate records
  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedRecords.slice(startIndex, startIndex + pageSize);
  }, [sortedRecords, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedRecords.length / pageSize);

  const handleSort = (columnName: string) => {
    if (!sortable) return;
    
    if (sortColumn === columnName) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortColumn(null);
        setSortDirection(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortColumn(columnName);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  const formatCellValue = (value: any, dataType: string): string => {
    if (value === null || value === undefined || value === '') {
      return '';
    }

    switch (dataType.toLowerCase()) {
      case 'boolean':
        return value === true || value === 'true' || value === '1' ? '✅' : '❌';
      
      case 'glide_date_time':
      case 'datetime':
        try {
          const date = new Date(value);
          return date.toLocaleString();
        } catch {
          return String(value);
        }
      
      case 'glide_date':
      case 'date':
        try {
          const date = new Date(value);
          return date.toLocaleDateString();
        } catch {
          return String(value);
        }
      
      case 'email':
        return value ? `📧 ${value}` : '';
      
      case 'phone':
      case 'ph_number':
        return value ? `📞 ${value}` : '';
      
      case 'url':
        return value ? `🔗 ${value}` : '';
      
      case 'currency':
        return value ? `💰 ${value}` : '';
      
      case 'reference':
        // If it's an object with display_value, show that
        if (typeof value === 'object' && value.display_value) {
          return value.display_value;
        }
        return String(value);
      
      default:
        return String(value);
    }
  };

  const getSortIcon = (columnName: string): string => {
    if (sortColumn !== columnName) return '↕️';
    return sortDirection === 'asc' ? '⬆️' : '⬇️';
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div className={`dynamic-list ${className}`}>
      <style dangerouslySetInnerHTML={{
        __html: `
        .dynamic-list {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        .list-header {
          background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
          color: white;
          padding: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .list-title {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
        }
        .list-subtitle {
          opacity: 0.8;
          font-size: 0.875rem;
          margin: 0.25rem 0 0 0;
        }
        .list-actions {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .list-controls {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #dee2e6;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
          background: #f8f9fa;
        }
        .search-container {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex: 1;
          max-width: 400px;
        }
        .search-input {
          flex: 1;
          padding: 0.5rem 0.75rem;
          border: 1px solid #ced4da;
          border-radius: 6px;
          font-size: 0.875rem;
        }
        .search-input:focus {
          border-color: #007bff;
          box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
          outline: none;
        }
        .list-stats {
          color: #6c757d;
          font-size: 0.875rem;
        }
        .table-container {
          overflow-x: auto;
          max-height: 70vh;
        }
        .list-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;
        }
        .table-header {
          background: #f8f9fa;
          border-bottom: 2px solid #dee2e6;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .table-header th {
          padding: 0.75rem;
          text-align: left;
          font-weight: 600;
          color: #495057;
          white-space: nowrap;
          cursor: ${sortable ? 'pointer' : 'default'};
          user-select: none;
          transition: background-color 0.15s;
        }
        .table-header th:hover {
          background-color: ${sortable ? '#e9ecef' : 'transparent'};
        }
        .table-header th.sortable::after {
          content: attr(data-sort-icon);
          margin-left: 0.5rem;
          opacity: 0.6;
        }
        .table-row {
          border-bottom: 1px solid #dee2e6;
          transition: background-color 0.15s;
        }
        .table-row:hover {
          background-color: #f8f9fa;
        }
        .table-row:nth-child(even) {
          background-color: #fcfcfc;
        }
        .table-row:nth-child(even):hover {
          background-color: #f0f0f0;
        }
        .table-cell {
          padding: 0.75rem;
          border-right: 1px solid #f1f3f4;
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .table-cell:last-child {
          border-right: none;
        }
        .actions-cell {
          white-space: nowrap;
          text-align: center;
          min-width: 120px;
        }
        .btn {
          padding: 0.375rem 0.75rem;
          border: none;
          border-radius: 4px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
        }
        .btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
        .btn-primary {
          background: #007bff;
          color: white;
        }
        .btn-secondary {
          background: #6c757d;
          color: white;
        }
        .btn-success {
          background: #28a745;
          color: white;
        }
        .btn-warning {
          background: #ffc107;
          color: #212529;
        }
        .btn-danger {
          background: #dc3545;
          color: white;
        }
        .btn-sm {
          padding: 0.25rem 0.5rem;
          font-size: 0.75rem;
        }
        .pagination {
          padding: 1rem 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid #dee2e6;
          background: #f8f9fa;
        }
        .pagination-info {
          color: #6c757d;
          font-size: 0.875rem;
        }
        .pagination-controls {
          display: flex;
          gap: 0.25rem;
        }
        .page-btn {
          padding: 0.375rem 0.75rem;
          border: 1px solid #dee2e6;
          background: white;
          color: #6c757d;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.875rem;
          transition: all 0.15s;
        }
        .page-btn:hover:not(:disabled) {
          background: #e9ecef;
          border-color: #adb5bd;
        }
        .page-btn.active {
          background: #007bff;
          border-color: #007bff;
          color: white;
        }
        .page-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .loading-overlay {
          position: relative;
          min-height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6c757d;
        }
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #f3f3f3;
          border-top: 3px solid #007bff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .empty-state {
          text-align: center;
          padding: 3rem 1.5rem;
          color: #6c757d;
        }
        .empty-state-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          opacity: 0.5;
        }
        
        /* Mobile responsive */
        @media (max-width: 768px) {
          .list-header {
            flex-direction: column;
            text-align: center;
          }
          .list-controls {
            flex-direction: column;
            align-items: stretch;
          }
          .search-container {
            max-width: none;
          }
          .table-container {
            font-size: 0.75rem;
          }
          .table-cell {
            max-width: 120px;
            padding: 0.5rem 0.25rem;
          }
          .pagination {
            flex-direction: column;
            gap: 1rem;
          }
          .pagination-controls {
            flex-wrap: wrap;
            justify-content: center;
          }
        }
        `}}
      />

      <div className="list-header">
        <div>
          <h2 className="list-title">
            {config.table.charAt(0).toUpperCase() + config.table.slice(1)} List
          </h2>
          <p className="list-subtitle">
            View: {config.view || 'default'} | List ID: {config.list_sys_id}
          </p>
        </div>
        <div className="list-actions">
          {onRefresh && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={onRefresh}
              disabled={loading}
            >
              🔄 Refresh
            </button>
          )}
          {onNew && (
            <button
              className="btn btn-success btn-sm"
              onClick={onNew}
            >
              ➕ New {config.table.charAt(0).toUpperCase() + config.table.slice(1)}
            </button>
          )}
        </div>
      </div>

      <div className="list-controls">
        <div className="search-container">
          <span>🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search records..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="list-stats">
          Showing {paginatedRecords.length} of {sortedRecords.length} records
          {searchTerm && ` (filtered from ${records.length})`}
        </div>
      </div>

      {loading ? (
        <div className="loading-overlay">
          <div>
            <div className="loading-spinner"></div>
            <div>Loading {config.table} records...</div>
          </div>
        </div>
      ) : sortedRecords.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3>No Records Found</h3>
          <p>
            {searchTerm 
              ? `No records match "${searchTerm}"`
              : `No ${config.table} records available`
            }
          </p>
          {searchTerm && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setSearchTerm('')}
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="list-table">
              <thead className="table-header">
                <tr>
                  {sortedColumns.map((column) => (
                    <th
                      key={column.name}
                      className={sortable ? 'sortable' : ''}
                      data-sort-icon={getSortIcon(column.name)}
                      onClick={() => handleSort(column.name)}
                      title={sortable ? `Sort by ${column.label}` : column.label}
                    >
                      {column.label}
                      <small style={{ display: 'block', fontWeight: 'normal', opacity: 0.7 }}>
                        ({column.data_type})
                      </small>
                    </th>
                  ))}
                  {showActions && (
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {paginatedRecords.map((record) => (
                  <tr key={record.sys_id} className="table-row">
                    {sortedColumns.map((column) => (
                      <td
                        key={column.name}
                        className="table-cell"
                        title={String(record[column.name] || '')}
                      >
                        {formatCellValue(record[column.name], column.data_type)}
                      </td>
                    ))}
                    {showActions && (
                      <td className="table-cell actions-cell">
                        {onEdit && (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => onEdit(record)}
                            title={`Edit ${record.sys_id}`}
                          >
                            ✏️
                          </button>
                        )}
                        {onDelete && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => onDelete(record)}
                            title={`Delete ${record.sys_id}`}
                            style={{ marginLeft: '0.25rem' }}
                          >
                            🗑️
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <div className="pagination-info">
                Page {currentPage} of {totalPages} 
                ({sortedRecords.length} total records)
              </div>
              <div className="pagination-controls">
                <button
                  className="page-btn"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  ← Previous
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      className={`page-btn ${pageNum === currentPage ? 'active' : ''}`}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  className="page-btn"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DynamicList;