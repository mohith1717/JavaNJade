function escapeCsvCell(value) {
  if (value === null || value === undefined) return '';
  const stringValue = String(value).replace(/"/g, '""');
  return /[",\n]/.test(stringValue) ? `"${stringValue}"` : stringValue;
}

export function exportRowsToCsv(filename, columns, rows) {
  const header = columns.map((column) => escapeCsvCell(column.label)).join(',');
  const body = rows
    .map((row) => columns.map((column) => escapeCsvCell(row[column.key])).join(','))
    .join('\n');

  const csvContent = `${header}\n${body}`;
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
