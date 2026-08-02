const PDFDocument = require("pdfkit");
const nodemailer = require("nodemailer");
const { ToWords } = require("to-words");
const fs = require("fs");
const path = require("path");

const toWords = new ToWords({
  localeCode: "en-IN",
  converterOptions: {
    currency: true,
    ignoreDecimal: true,
    ignoreZeroCurrency: false,
    doNotAddOnly: false,
  },
});

exports.generateAndEmailPath = async (employee, slipData) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const fileName = `payslip_${employee.id}_${slipData.month}_${slipData.year}.pdf`;
    const tempDir = path.join(__dirname, "../../temp");
    const filePath = path.join(tempDir, fileName);

    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // --- Header ---
    const fontRegular = "Helvetica";
    const fontBold = "Helvetica-Bold";
    const fontOblique = "Helvetica-Oblique";

    // --- BRANDING & HEADER ---
    doc
      .fillColor("#1e293b") // Modern deep slate/navy color
      .font(fontBold)
      .fontSize(20)
      .text("PAYCRAFT LITE", { align: "right" });

    doc
      .font(fontRegular)
      .fontSize(9)
      .fillColor("#64748b")
      .text("Monthly Salary Slip", { align: "right" });

    doc.moveDown(1);

    // Decorative top accent bar
    doc.rect(50, doc.y, 512, 3).fill("#0f172a");
    doc.moveDown(2);

    // --- EMPLOYEE INFO BLOCK ---
    const infoStartY = doc.y;

    // Left side info
    doc
      .font(fontBold)
      .fontSize(10)
      .fillColor("#1e293b")
      .text("EMPLOYEE DETAILS", 50, infoStartY)
      .moveDown(0.5)
      .font(fontRegular)
      .fillColor("#334155")
      .text(`Name: ${employee.name}`)
      .text(`Designation: ${employee.designation}`)
      .text(`PAN: ${employee.pan}`);

    // Right side info (Aligned at X: 350)
    doc
      .font(fontBold)
      .fillColor("#1e293b")
      .text("PAYMENT DETAILS", 350, infoStartY)
      .moveDown(0.5)
      .font(fontRegular)
      .fillColor("#334155")
      .text(`Statement Period: ${slipData.month}/${slipData.year}`)
      .text(`Status: Paid`);

    doc.moveDown(3);

    // --- EARNINGS & DEDUCTIONS GRID ---
    const tableStartY = doc.y;

    // Section Headers
    doc.font(fontBold).fontSize(11).fillColor("#0f172a");
    doc.text("EARNINGS", 50, tableStartY);
    doc.text("DEDUCTIONS", 320, tableStartY);

    // Header underline row
    doc.moveDown(0.5);
    const lineY = doc.y;
    doc.rect(50, lineY, 230, 1).fill("#cbd5e1");
    doc.rect(320, lineY, 242, 1).fill("#cbd5e1");

    doc.font(fontRegular).fontSize(9.5).fillColor("#334155");

    // Safe programmatic loop rendering for columns to prevent text overlap bugs
    const earningsItems = [
      { label: "Basic Pay", val: slipData.earnings.basic },
      { label: "HRA", val: slipData.earnings.hra },
      { label: "Special Allowance", val: slipData.earnings.specialAllowance },
    ];

    const deductionItems = [
      { label: "TDS (Income Tax)", val: slipData.deductions.tds },
      { label: "Provident Fund (PF)", val: slipData.deductions.pfEmployee },
      { label: "Professional Tax", val: slipData.deductions.professionalTax },
    ];

    let currentY = lineY + 10;
    const rowHeight = 18;

    // Render Rows dynamically
    for (
      let i = 0;
      i < Math.max(earningsItems.length, deductionItems.length);
      i++
    ) {
      if (earningsItems[i]) {
        doc.text(earningsItems[i].label, 50, currentY);
        doc.text(`Rs. ${earningsItems[i].val}`, 200, currentY, {
          align: "right",
          width: 80,
        });
      }
      if (deductionItems[i]) {
        doc.text(deductionItems[i].label, 320, currentY);
        doc.text(`Rs. ${deductionItems[i].val}`, 480, currentY, {
          align: "right",
          width: 82,
        });
      }
      currentY += rowHeight;
    }

    // --- TOTALS SECTION ---
    // Reset absolute cursor coordinates properly using currentY
    doc.x = 50;
    doc.y = currentY + 15;

    const totalBoxY = doc.y;

    // Subtle gray box background
    doc.rect(50, totalBoxY, 512, 30).fill("#f8fafc");

    // Net Payable text overlay
    doc
      .font(fontBold)
      .fontSize(12)
      .fillColor("#0f172a")
      .text(`NET PAYABLE`, 65, totalBoxY + 9);

    doc.text(`Rs. ${slipData.netPay}`, 400, totalBoxY + 9, {
      align: "right",
      width: 150,
    });

    // Amount in words row
    doc.x = 50;
    doc.y = totalBoxY + 45;

    const netPayInWords = toWords.convert(slipData.netPay).toUpperCase();
    doc
      .font(fontOblique)
      .fontSize(8.5)
      .fillColor("#64748b")
      .text(`Amount in words: ${netPayInWords}`);

    doc.end();

    stream.on("finish", async () => {
      try {
        const transporter = nodemailer.createTransport({
          host: "sandbox.smtp.mailtrap.io",
          port: 2525,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        await transporter.sendMail({
          from: '"PayCraft HR" <hr@paycraft.com>',
          to: employee.email,
          subject: `Salary Slip - ${slipData.month}/${slipData.year}`,
          text: `Hello ${employee.name}, please find your salary slip attached.`,
          attachments: [{ filename: fileName, path: filePath }],
        });

        console.log(`✅ Email successfully sent via SMTP to ${employee.email}`);
        resolve(true);
      } catch (err) {
        console.error("❌ SMTP Error:", err);
        reject(err);
      }
    });
  });
};
