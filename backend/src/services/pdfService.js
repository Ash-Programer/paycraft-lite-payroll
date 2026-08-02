const PDFDocument = require("pdfkit");
const fs = require("fs");

exports.generateSlipPDF = (data, outputPath) => {
  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(fs.createWriteStream(outputPath));

  // Header
  doc.fontSize(20).text("PayCraft Lite - Salary Slip", { align: "center" });
  doc.moveDown();
  doc.fontSize(12).text(`Employee: ${data.employeeName}`);
  doc.text(`Month: ${data.month} ${data.year}`);
  doc.moveDown();

  // Earnings Table logic (simplified)
  doc.text("Earnings", { underline: true });
  doc.text(`Basic: ${data.earnings.basic}`);
  doc.text(`HRA: ${data.earnings.hra}`);
  doc.moveDown();

  // Deductions Table
  doc.text("Deductions", { underline: true });
  doc.text(`TDS: ${data.deductions.tax}`);
  doc.text(`PF: ${data.deductions.pf}`);
  doc.moveDown();

  doc.fontSize(14).text(`Net Pay: ${data.netPay}`, { bold: true });
  doc.text(`In Words: ${data.netPayInWords}`);

  doc.end();
};
