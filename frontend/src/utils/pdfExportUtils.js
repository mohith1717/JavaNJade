import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function exportRowsToPdf(filename, title, columns, rows) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });

  doc.setFontSize(16);
  doc.text(title, 40, 40);
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 40, 58);

  autoTable(doc, {
    head: [columns.map((column) => column.label)],
    body: rows.map((row) => columns.map((column) => row[column.key] ?? '')),
    startY: 75,
    styles: {
      fontSize: 9,
      cellPadding: 6,
    },
    headStyles: {
      fillColor: [21, 101, 192],
      textColor: 255,
      fontStyle: 'bold',
    },
  });

  doc.save(filename);
}
