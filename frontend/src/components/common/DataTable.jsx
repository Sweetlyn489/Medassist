import './dataTable.css';

/**
 * Minimal, dense data table used throughout the app instead of "cards".
 * columns: [{ key, header, render?(row) }]
 */
export default function DataTable({ columns, rows, emptyMessage = 'No records found.', onRowClick }) {
  if (!rows || rows.length === 0) {
    return <div className="table-empty">{emptyMessage}</div>;
  }

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key}>{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row._id || row.id} className={onRowClick ? 'clickable' : ''} onClick={() => onRowClick && onRowClick(row)}>
              {columns.map((c) => (
                <td key={c.key}>{c.render ? c.render(row) : row[c.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
