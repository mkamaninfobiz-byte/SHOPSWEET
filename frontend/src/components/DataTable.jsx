const DataTable = ({ title, columns, rows, rowKey, onRowClick, renderActions }) => {
  const resolveKey = (row, index) => {
    if (rowKey && row[rowKey] != null) return row[rowKey];
    if (row.id != null) return row.id;
    if (row.email) return `${row.email}-${index}`;
    return index;
  };

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 font-medium text-slate-600">
                  {col.label}
                </th>
              ))}
              {renderActions && (
                <th className="px-4 py-3 font-medium text-slate-600">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (renderActions ? 1 : 0)}
                  className="px-4 py-8 text-center text-slate-500"
                >
                  No records found.
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr
                  key={resolveKey(row, index)}
                  className={`hover:bg-slate-50 ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-4 text-slate-700">
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                  {renderActions && (
                    <td
                      className="px-4 py-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {renderActions(row)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
