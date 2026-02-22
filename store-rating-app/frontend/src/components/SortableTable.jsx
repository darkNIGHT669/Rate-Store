import React, { useState } from 'react';

export default function SortableTable({ columns, data, onSort, sortBy, sortOrder }) {
  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={sortBy === col.key ? 'sorted' : ''}
                onClick={() => col.sortable !== false && onSort && onSort(col.key)}
              >
                {col.label}
                {col.sortable !== false && (
                  <span className="sort-icon">
                    {sortBy === col.key ? (sortOrder === 'ASC' ? ' ↑' : ' ↓') : ' ⇅'}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-2)' }}>
                No records found
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr key={row.id || i}>
                {columns.map((col) => (
                  <td key={col.key}>{col.render ? col.render(row) : row[col.key] ?? '—'}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
