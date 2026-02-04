import React, { useState } from 'react';

const OOBDemoPage: React.FC = () => {
  const [currentTable, setCurrentTable] = useState('incident');
  const [currentMode, setCurrentMode] = useState<'form' | 'list' | 'both'>('both');
  const [currentSysId, setCurrentSysId] = useState('');

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
      }}>ServiceNow OOB Components Demo</h1>
      
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <p><strong>This page demonstrates ServiceNow's Out-of-the-Box components:</strong></p>
        <ul>
          <li><strong>Form View:</strong> Renders native ServiceNow forms with proper field types</li>
          <li><strong>List View:</strong> Displays table data in ServiceNow's standard list format</li>
          <li><strong>UI Actions:</strong> Includes standard CRUD operations (Create, Read, Update, Delete)</li>
        </ul>
      </div>

      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3>Controls</h3>
        
        <div style={{
          display: 'flex',
          gap: '20px',
          alignItems: 'center',
          marginBottom: '15px'
        }}>
          <label style={{ fontWeight: 'bold', minWidth: '100px' }}>Table:</label>
          <select 
            value={currentTable}
            onChange={(e) => setCurrentTable(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              minWidth: '200px'
            }}
          >
            <option value="incident">Incident</option>
            <option value="change_request">Change Request</option>
            <option value="problem">Problem</option>
            <option value="sc_request">Service Catalog Request</option>
            <option value="task">Task</option>
          </select>
        </div>

        <div style={{
          display: 'flex',
          gap: '20px',
          alignItems: 'center',
          marginBottom: '15px'
        }}>
          <label style={{ fontWeight: 'bold', minWidth: '100px' }}>View Mode:</label>
          <select 
            value={currentMode}
            onChange={(e) => setCurrentMode(e.target.value as 'form' | 'list' | 'both')}
            style={{
              padding: '8px 12px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              minWidth: '200px'
            }}
          >
            <option value="both">Both Form & List</option>
            <option value="form">Form Only</option>
            <option value="list">List Only</option>
          </select>
        </div>

        <div style={{
          display: 'flex',
          gap: '20px',
          alignItems: 'center',
          marginBottom: '15px'
        }}>
          <label style={{ fontWeight: 'bold', minWidth: '100px' }}>Record Sys ID:</label>
          <input 
            type="text"
            placeholder="Enter sys_id for editing existing record"
            value={currentSysId}
            onChange={(e) => setCurrentSysId(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              minWidth: '200px'
            }}
          />
        </div>
      </div>

      {/* Simple OOB Components Demo */}
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3>Selected Settings:</h3>
        <p><strong>Table:</strong> {currentTable}</p>
        <p><strong>Mode:</strong> {currentMode}</p>
        <p><strong>Sys ID:</strong> {currentSysId || 'None (Create new record)'}</p>
      </div>

      {/* Mock Form View */}
      {(currentMode === 'form' || currentMode === 'both') && (
        <div style={{
          background: 'white',
          border: '1px solid #ddd',
          borderRadius: '4px',
          marginBottom: '20px',
          padding: '20px'
        }}>
          <div style={{
            marginBottom: '20px',
            paddingBottom: '10px',
            borderBottom: '1px solid #eee',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h2>{currentTable.charAt(0).toUpperCase() + currentTable.slice(1)} Form</h2>
          </div>
          
          <form>
            <div style={{ marginBottom: '15px' }}>
              <label style={{
                display: 'block',
                marginBottom: '5px',
                fontWeight: 'bold',
                color: '#333'
              }}>
                Short Description *
              </label>
              <input type="text" style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '14px'
              }} />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{
                display: 'block',
                marginBottom: '5px',
                fontWeight: 'bold',
                color: '#333'
              }}>
                Priority
              </label>
              <select style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '14px'
              }}>
                <option value="">-- None --</option>
                <option value="1">1 - Critical</option>
                <option value="2">2 - High</option>
                <option value="3">3 - Moderate</option>
                <option value="4">4 - Low</option>
                <option value="5">5 - Planning</option>
              </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{
                display: 'block',
                marginBottom: '5px',
                fontWeight: 'bold',
                color: '#333'
              }}>
                State
              </label>
              <select style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '14px'
              }}>
                <option value="">-- None --</option>
                <option value="1">New</option>
                <option value="2">In Progress</option>
                <option value="3">On Hold</option>
                <option value="6">Resolved</option>
                <option value="7">Closed</option>
              </select>
            </div>

            <div style={{
              marginTop: '20px',
              display: 'flex',
              gap: '10px'
            }}>
              <button type="button" style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                backgroundColor: '#007bff',
                color: 'white'
              }}>
                {currentSysId ? 'Update' : 'Submit'}
              </button>
              <button type="button" style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                backgroundColor: '#6c757d',
                color: 'white'
              }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Mock List View */}
      {(currentMode === 'list' || currentMode === 'both') && (
        <div style={{
          background: 'white',
          border: '1px solid #ddd',
          borderRadius: '4px',
          marginBottom: '20px',
          padding: '20px'
        }}>
          <div style={{
            marginBottom: '20px',
            paddingBottom: '10px',
            borderBottom: '1px solid #eee',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h2>{currentTable.charAt(0).toUpperCase() + currentTable.slice(1)} List</h2>
            <div style={{
              display: 'flex',
              gap: '10px'
            }}>
              <button type="button" style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                backgroundColor: '#007bff',
                color: 'white'
              }}>
                New {currentTable.charAt(0).toUpperCase() + currentTable.slice(1)}
              </button>
              <button type="button" style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                backgroundColor: '#6c757d',
                color: 'white'
              }}>
                Refresh
              </button>
            </div>
          </div>
          
          <table style={{
            width: '100%',
            borderCollapse: 'collapse'
          }}>
            <thead>
              <tr>
                <th style={{
                  padding: '10px',
                  border: '1px solid #ddd',
                  textAlign: 'left',
                  backgroundColor: '#f5f5f5',
                  fontWeight: 'bold'
                }}>Number</th>
                <th style={{
                  padding: '10px',
                  border: '1px solid #ddd',
                  textAlign: 'left',
                  backgroundColor: '#f5f5f5',
                  fontWeight: 'bold'
                }}>Short Description</th>
                <th style={{
                  padding: '10px',
                  border: '1px solid #ddd',
                  textAlign: 'left',
                  backgroundColor: '#f5f5f5',
                  fontWeight: 'bold'
                }}>State</th>
                <th style={{
                  padding: '10px',
                  border: '1px solid #ddd',
                  textAlign: 'left',
                  backgroundColor: '#f5f5f5',
                  fontWeight: 'bold'
                }}>Priority</th>
                <th style={{
                  padding: '10px',
                  border: '1px solid #ddd',
                  textAlign: 'left',
                  backgroundColor: '#f5f5f5',
                  fontWeight: 'bold'
                }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{
                  padding: '10px',
                  border: '1px solid #ddd'
                }}>INC0010001</td>
                <td style={{
                  padding: '10px',
                  border: '1px solid #ddd'
                }}>Sample incident for demo</td>
                <td style={{
                  padding: '10px',
                  border: '1px solid #ddd'
                }}>New</td>
                <td style={{
                  padding: '10px',
                  border: '1px solid #ddd'
                }}>3 - Moderate</td>
                <td style={{
                  padding: '10px',
                  border: '1px solid #ddd'
                }}>
                  <button style={{
                    padding: '4px 8px',
                    fontSize: '12px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    backgroundColor: '#007bff',
                    color: 'white',
                    marginRight: '5px'
                  }}>
                    Edit
                  </button>
                  <button style={{
                    padding: '4px 8px',
                    fontSize: '12px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    backgroundColor: '#dc3545',
                    color: 'white'
                  }}>
                    Delete
                  </button>
                </td>
              </tr>
              <tr>
                <td style={{
                  padding: '10px',
                  border: '1px solid #ddd'
                }}>INC0010002</td>
                <td style={{
                  padding: '10px',
                  border: '1px solid #ddd'
                }}>Another demo incident</td>
                <td style={{
                  padding: '10px',
                  border: '1px solid #ddd'
                }}>In Progress</td>
                <td style={{
                  padding: '10px',
                  border: '1px solid #ddd'
                }}>2 - High</td>
                <td style={{
                  padding: '10px',
                  border: '1px solid #ddd'
                }}>
                  <button style={{
                    padding: '4px 8px',
                    fontSize: '12px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    backgroundColor: '#007bff',
                    color: 'white',
                    marginRight: '5px'
                  }}>
                    Edit
                  </button>
                  <button style={{
                    padding: '4px 8px',
                    fontSize: '12px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    backgroundColor: '#dc3545',
                    color: 'white'
                  }}>
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <div style={{
        background: '#fff3cd',
        border: '1px solid #ffeaa7',
        borderRadius: '4px',
        padding: '15px',
        marginTop: '20px'
      }}>
        <h4>🚧 Implementation Notes:</h4>
        <ul>
          <li>This is a simplified demo version showing the layout and structure</li>
          <li>In the full version, forms and lists would dynamically load from ServiceNow tables</li>
          <li>UI Actions would connect to actual ServiceNow CRUD operations</li>
          <li>Field types would be rendered based on the table schema</li>
        </ul>
      </div>
    </div>
  );
};

export default OOBDemoPage;