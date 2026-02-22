import React from 'react';

/*
  columns: Array<{
    key: string,
    label: string,
    sortable?: boolean,   // default true
    render?: (row) => ReactNode
  }>
*/
export default function SortableTable({ columns, rows, sortBy, sortOrder, onSort }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((col) => {
              const sortable = col.sortable !== false;
              const sorted   = sortBy === col.key;
              return (
                <th
                  key={col.key}
                  className={[sortable ? 'sortable' : '', sorted ? 'sorted' : ''].join(' ')}
                  onClick={() => sortable && onSort?.(col.key)}
                >
                  {col.label}
                  {sortable && (
                    <span className="sort-icon">
                      {sorted ? (sortOrder === 'ASC' ? '↑' : '↓') : '⇅'}
                    </span>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr className="empty-row">
              <td colSpan={columns.length}>No records found.</td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr key={row.id || i}>
                {columns.map((col) => (
                  <td key={col.key}>
                    {col.render ? col.render(row) : (row[col.key] ?? <span className="td-muted">—</span>)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
