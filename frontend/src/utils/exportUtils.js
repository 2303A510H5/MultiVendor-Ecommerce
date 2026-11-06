import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Export data to CSV file
export const exportToCSV = (data, fileName = 'report') => {
  if (!data || !data.length) {
    alert('No data available to export');
    return;
  }

  const headers = Object.keys(data[0]);
  const csvRows = [];

  // Header row
  csvRows.push(headers.join(','));

  // Data rows
  for (const row of data) {
    const values = headers.map((header) => {
      let val = row[header];
      if (val === null || val === undefined) val = '';
      if (typeof val === 'object') val = JSON.stringify(val);
      const escaped = ('' + val).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }

  const csvString = csvRows.join('\r\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileName}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Export data to PDF using jsPDF and autoTable
export const exportToPDF = ({ title, subtitle, columns, rows, fileName = 'report' }) => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });

  // Header banner
  doc.setFillColor(11, 29, 58); // Navy blue brand color
  doc.rect(0, 0, doc.internal.pageSize.width, 60, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('ShopVerse E-Commerce Platform', 40, 32);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, doc.internal.pageSize.width - 200, 32);

  // Subtitle / Report Name
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 40, 88);

  if (subtitle) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(subtitle, 40, 104);
  }

  // AutoTable
  doc.autoTable({
    startY: subtitle ? 116 : 100,
    head: [columns],
    body: rows,
    theme: 'striped',
    headStyles: {
      fillColor: [11, 29, 58],
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 40, right: 40, bottom: 40 },
    didDrawPage: (data) => {
      // Footer page numbering
      const str = `Page ${doc.internal.getNumberOfPages()}`;
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(str, doc.internal.pageSize.width - 80, doc.internal.pageSize.height - 20);
    },
  });

  doc.save(`${fileName}_${new Date().toISOString().slice(0, 10)}.pdf`);
};

// Print utility
export const printReport = () => {
  window.print();
};
