import React from 'react';
import './DataTable.css';

const DataTable = ({ columns, data, onRowClick, loading = false, emptyMessage = 'No data available' }) => {
  if (loading) {
    return (
      <div className='table-loading'>
        <div className='spinner'></div>
        <p>Loading data...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className='table-empty'>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className='data-table-container'>
      <table className='data-table'>
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index}>{column.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={row.id || rowIndex}
              onClick={() => onRowClick && onRowClick(row)}
              className={onRowClick ? 'clickable' : ''}
            >
              {columns.map((column, colIndex) => (
                <td key={colIndex}>
                  {column.render
                    ? column.render(row[column.field], row)
                    : row[column.field] || 'N/A'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;