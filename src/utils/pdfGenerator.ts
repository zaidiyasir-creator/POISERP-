import { jsPDF } from 'jspdf';
import { Quotation, Invoice, Client } from '../types';

// Helper to format currency
const formatRM = (val: number) => {
  return `RM ${val.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const drawPoisLogo = (doc: jsPDF, x: number, y: number, size: number) => {
  const k = size / 100;

  // Set line cap to round for beautiful smooth segments
  try {
    doc.setLineCap('round');
  } catch (e) {
    // ignore if unsupported
  }

  // 1. Draw Outer Ring Arc
  const startAngle = 154 * Math.PI / 180;
  const endAngle = 439 * Math.PI / 180;
  const steps = 60;
  doc.setDrawColor(197, 0, 62); // #C5003E
  doc.setLineWidth(6 * k);

  let prevX = x + (50 + 36 * Math.cos(startAngle)) * k;
  let prevY = y + (50 + 36 * Math.sin(startAngle)) * k;

  for (let i = 1; i <= steps; i++) {
    const angle = startAngle + (endAngle - startAngle) * (i / steps);
    const currX = x + (50 + 36 * Math.cos(angle)) * k;
    const currY = y + (50 + 36 * Math.sin(angle)) * k;
    doc.line(prevX, prevY, currX, currY);
    prevX = currX;
    prevY = currY;
  }

  // 2. Draw Quadrilateral 1 (Left Slanted Band)
  // Points: (23,64), (43,43), (58,43), (38,64)
  // Color: #C5003E
  doc.setFillColor(197, 0, 62);
  const q1 = [
    { x: 23, y: 64 },
    { x: 43, y: 43 },
    { x: 58, y: 43 },
    { x: 38, y: 64 }
  ].map(p => ({ x: x + p.x * k, y: y + p.y * k }));
  doc.triangle(q1[0].x, q1[0].y, q1[1].x, q1[1].y, q1[2].x, q1[2].y, 'F');
  doc.triangle(q1[0].x, q1[0].y, q1[2].x, q1[2].y, q1[3].x, q1[3].y, 'F');

  // 3. Draw Quadrilateral 2 (Right Slanted Band - Top)
  // Points: (47,28), (68,28), (82,42), (61,42)
  // Color: #C5003E
  doc.setFillColor(197, 0, 62);
  const q2 = [
    { x: 47, y: 28 },
    { x: 68, y: 28 },
    { x: 82, y: 42 },
    { x: 61, y: 42 }
  ].map(p => ({ x: x + p.x * k, y: y + p.y * k }));
  doc.triangle(q2[0].x, q2[0].y, q2[1].x, q2[1].y, q2[2].x, q2[2].y, 'F');
  doc.triangle(q2[0].x, q2[0].y, q2[2].x, q2[2].y, q2[3].x, q2[3].y, 'F');

  // 4. Draw Quadrilateral 3 (Right Slanted Band - Bottom)
  // Points: (61,42), (82,42), (68,56), (47,56)
  // Color: #8E002B (RGB: 142, 0, 43)
  doc.setFillColor(142, 0, 43);
  const q3 = [
    { x: 61, y: 42 },
    { x: 82, y: 42 },
    { x: 68, y: 56 },
    { x: 47, y: 56 }
  ].map(p => ({ x: x + p.x * k, y: y + p.y * k }));
  doc.triangle(q3[0].x, q3[0].y, q3[1].x, q3[1].y, q3[2].x, q3[2].y, 'F');
  doc.triangle(q3[0].x, q3[0].y, q3[2].x, q3[2].y, q3[3].x, q3[3].y, 'F');
};

export const downloadQuotationPDF = (quotation: Quotation, client: Client | undefined) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Margins & Dimensions
  const mLeft = 15;
  const mRight = 195;
  const wContent = mRight - mLeft; // 180

  // --- HEADER SECTION WITH LOGO ---
  // Draw the circular corporate logo
  drawPoisLogo(doc, mLeft, 14.5, 11);

  // Brand Logo Text (aligned on the right side of the Logo)
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(15, 23, 42); // slate-900 / brand-950
  doc.text('POIS CONNECT', mLeft + 13.5, 23);

  // Brand Metadata
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text('POIS Solutions Sdn Bhd (1093412-M)', mLeft, 29);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text([
    'Level 12, Menara CelcomDigi, No. 6, Persiaran Barat,',
    'Seksyen 52, 46200 Petaling Jaya, Selangor, Malaysia',
    'Tel: +60 3-7962 1000 | Email: corporate@pois.com.my'
  ], mLeft, 34);

  // Document Title
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(142, 0, 43); // brand-900 / deep burgundy (#8E002B)
  doc.text('COMMERCIAL PROPOSAL', mRight, 25, { align: 'right' });

  // Document Info Block
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105); // slate-600

  let rightY = 30;
  doc.text(`Ref No: ${quotation.refNo}`, mRight, rightY, { align: 'right' });
  rightY += 5;
  doc.text(`Date: ${quotation.date}`, mRight, rightY, { align: 'right' });
  rightY += 5;
  doc.text(`Validity: ${quotation.validityWeeks} Weeks`, mRight, rightY, { align: 'right' });
  rightY += 5;
  doc.text(`Account Manager: ${quotation.preparedBy}`, mRight, rightY, { align: 'right' });

  // Accent Line (Crimson brand-700 / crimson red)
  doc.setDrawColor(197, 0, 62); // crimson red
  doc.setLineWidth(0.8);
  doc.line(mLeft, 52, mRight, 52);

  // --- CLIENT / PROFILE SECTION ---
  const boxY = 58;
  const boxH = 34;
  const colW = wContent / 2 - 4; // 86

  // Client Company Profile Box
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.2);
  doc.roundedRect(mLeft, boxY, colW, boxH, 2, 2, 'FD');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('CLIENT COMPANY PROFILE', mLeft + 4, boxY + 5);

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(client?.name || 'N/A', mLeft + 4, boxY + 11);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Reg No: ${client?.regNo || 'N/A'}`, mLeft + 4, boxY + 16);
  
  // Wrap billing address text to prevent overflow
  const billAddress = client?.billingAddress || 'N/A';
  const billLines = doc.splitTextToSize(billAddress, colW - 8);
  doc.text(billLines, mLeft + 4, boxY + 21);

  // Technical Site Info Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(mLeft + colW + 8, boxY, colW, boxH, 2, 2, 'FD');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('TECHNICAL INSTALLATION SITE', mLeft + colW + 12, boxY + 5);

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(client?.contactPerson || 'N/A', mLeft + colW + 12, boxY + 11);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Email: ${client?.contactEmail || 'N/A'}`, mLeft + colW + 12, boxY + 16);
  doc.text(`Phone: ${client?.phone || 'N/A'}`, mLeft + colW + 12, boxY + 21);

  const siteAddress = client?.siteAddress || 'N/A';
  const siteLines = doc.splitTextToSize(siteAddress, colW - 8);
  doc.text(siteLines, mLeft + colW + 12, boxY + 26);

  // --- PROJECT TITLE HEADER ---
  const projY = 98;
  doc.setFillColor(15, 23, 42); // slate-900 / brand-950
  doc.roundedRect(mLeft, projY, wContent, 8, 1, 1, 'F');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(`PROJECT TITLE: ${quotation.title.toUpperCase()}`, mLeft + 4, projY + 5.5);

  // --- ITEMS TABLE SECTION ---
  let tableY = 112;
  
  // Table Headers
  doc.setFillColor(241, 245, 249); // slate-100
  doc.rect(mLeft, tableY, wContent, 7, 'F');
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.4);
  doc.line(mLeft, tableY, mRight, tableY);
  doc.line(mLeft, tableY + 7, mRight, tableY + 7);

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('No.', mLeft + 2, tableY + 4.8);
  doc.text('Service & Deliverable Specification', mLeft + 12, tableY + 4.8);
  doc.text('Qty', mLeft + 114, tableY + 4.8, { align: 'center' });
  doc.text('Unit Price', mLeft + 140, tableY + 4.8, { align: 'right' });
  doc.text('Tax (SST)', mLeft + 162, tableY + 4.8, { align: 'right' });
  doc.text('Amount', mRight - 2, tableY + 4.8, { align: 'right' });

  // Draw Line Items
  tableY += 7;
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85); // slate-700

  quotation.items.forEach((item, index) => {
    // Check if we exceed page height
    if (tableY > 230) {
      doc.addPage();
      tableY = 20; // reset to top of new page
      // Redraw table headers on new page
      doc.setFillColor(241, 245, 249);
      doc.rect(mLeft, tableY, wContent, 7, 'F');
      doc.line(mLeft, tableY, mRight, tableY);
      doc.line(mLeft, tableY + 7, mRight, tableY + 7);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text('No.', mLeft + 2, tableY + 4.8);
      doc.text('Service & Deliverable Specification', mLeft + 12, tableY + 4.8);
      doc.text('Qty', mLeft + 114, tableY + 4.8, { align: 'center' });
      doc.text('Unit Price', mLeft + 140, tableY + 4.8, { align: 'right' });
      doc.text('Tax (SST)', mLeft + 162, tableY + 4.8, { align: 'right' });
      doc.text('Amount', mRight - 2, tableY + 4.8, { align: 'right' });
      tableY += 7;
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
    }

    const itemNum = String(index + 1);
    const lineAmount = item.isFoc ? 0 : item.qty * item.unitPrice;
    
    // Split description in case it overflows
    const descText = item.isFoc ? `${item.description} (FOC)` : item.description;
    const descLines = doc.splitTextToSize(descText, 95);

    // Row drawing
    doc.text(itemNum, mLeft + 2, tableY + 5);
    doc.text(descLines, mLeft + 12, tableY + 5);
    doc.text(String(item.qty), mLeft + 114, tableY + 5, { align: 'center' });
    doc.text(item.isFoc ? 'RM 0.00' : formatRM(item.unitPrice), mLeft + 140, tableY + 5, { align: 'right' });
    doc.text(item.taxable && !item.isFoc ? '8%' : 'Exempt', mLeft + 162, tableY + 5, { align: 'right' });
    doc.text(formatRM(lineAmount), mRight - 2, tableY + 5, { align: 'right' });

    // Handle multi-line description vertical spacing
    const lineOffset = Math.max(descLines.length * 4.2, 7.5);
    
    // Row underline
    doc.setDrawColor(241, 245, 249);
    doc.setLineWidth(0.1);
    doc.line(mLeft, tableY + lineOffset - 0.5, mRight, tableY + lineOffset - 0.5);

    tableY += lineOffset;
  });

  // --- TOTALS BLOCK ---
  if (tableY > 210) {
    doc.addPage();
    tableY = 20;
  }

  // Draw Totals Box on Right Side
  const totalsX = mRight - 75;
  const totalsW = 75;
  
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(totalsX, tableY, mRight, tableY);

  tableY += 4;
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Subtotal:', totalsX, tableY + 1);
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text(formatRM(quotation.subtotal), mRight - 2, tableY + 1, { align: 'right' });

  tableY += 5;
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('SST Service Tax (8%):', totalsX, tableY + 1);
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text(formatRM(quotation.sstTotal), mRight - 2, tableY + 1, { align: 'right' });

  tableY += 6;
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.4);
  doc.line(totalsX, tableY, mRight, tableY);

  tableY += 5;
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('GRAND TOTAL:', totalsX, tableY + 1);
  doc.text(formatRM(quotation.grandTotal), mRight - 2, tableY + 1, { align: 'right' });

  // --- TERMS & CONDITIONS ---
  tableY += 15;
  if (tableY > 230) {
    doc.addPage();
    tableY = 20;
  }

  doc.setDrawColor(241, 245, 249);
  doc.setLineWidth(0.5);
  doc.line(mLeft, tableY, mRight, tableY);

  tableY += 5;
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('STANDARD CORPORATE TERMS & CONDITIONS', mLeft, tableY);

  tableY += 4;
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  
  const terms = [
    `1. Validity: This quotation is strictly valid for ${quotation.validityWeeks} weeks from the proposal date.`,
    `2. Contract Lock-in commitment period: ${quotation.lockInMonths} months from the active billing start date.`,
    `3. Delivery Period: Execution and physical fiber connectivity activation SLA is ${quotation.deliveryDays} working days from signed PO.`,
    `4. SST: 8% Sales and Service Tax applies to applicable monthly lines, cabling fees, and setup. Deposits are tax exempt.`,
    `5. Payment Schedule: Refundable deposit on PO confirmation. Installation balance invoiced on site activation.`
  ];
  
  terms.forEach(term => {
    doc.text(term, mLeft, tableY);
    tableY += 4;
  });

  // --- SIGNATURE SECTION ---
  tableY += 8;
  if (tableY > 250) {
    doc.addPage();
    tableY = 20;
  }

  const sigW = wContent / 2 - 10;

  // Reseller Signoff
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('AUTHORIZED RESELLER SIGNOFF', mLeft, tableY);
  
  doc.setFont('Courier', 'oblique');
  doc.setFontSize(10);
  doc.setTextColor(3, 105, 161);
  doc.text('Sarah Tan (Sales AM)', mLeft, tableY + 14);

  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.2);
  doc.line(mLeft, tableY + 16, mLeft + sigW, tableY + 16);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('For POIS Solutions Integrator', mLeft, tableY + 20);

  // Client Signoff
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('CLIENT ACCEPTANCE SIGNOFF & STAMP', mLeft + sigW + 20, tableY);

  if (quotation.status === 'accepted') {
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(16, 185, 129); // emerald-500
    doc.text('ACCEPTED VIA CUSTOMER SECURE PORTAL', mLeft + sigW + 20, tableY + 10);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Signed Date: ${quotation.dateAccepted || quotation.date}`, mLeft + sigW + 20, tableY + 14);
  } else {
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text('Sign here to accept commercial terms', mLeft + sigW + 20, tableY + 14);
  }

  doc.line(mLeft + sigW + 20, tableY + 16, mRight, tableY + 16);
  doc.text('Authorized Signatory Stamp & Date', mLeft + sigW + 20, tableY + 20);

  // Trigger Save/Download
  doc.save(`Quotation_${quotation.refNo}.pdf`);
};

export const downloadInvoicePDF = (invoice: Invoice, client: Client | undefined) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Margins & Dimensions
  const mLeft = 15;
  const mRight = 195;
  const wContent = mRight - mLeft; // 180

  // --- HEADER SECTION WITH LOGO ---
  // Draw the circular corporate logo
  drawPoisLogo(doc, mLeft, 14.5, 11);

  // Brand Logo Text (aligned on the right side of the Logo)
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(15, 23, 42); // slate-900 / brand-950
  doc.text('POIS CONNECT', mLeft + 13.5, 23);

  // Brand Metadata
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text('POIS Solutions Sdn Bhd (1093412-M)', mLeft, 29);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text([
    'Level 12, Menara CelcomDigi, No. 6, Persiaran Barat,',
    'Seksyen 52, 46200 Petaling Jaya, Selangor, Malaysia',
    'Tel: +60 3-7962 1000 | Web: www.pois.com.my'
  ], mLeft, 34);

  // Document Title
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(142, 0, 43); // brand-900 / deep burgundy (#8E002B)
  doc.text('TAX INVOICE', mRight, 25, { align: 'right' });

  // Document Info Block
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105); // slate-600

  let rightY = 30;
  doc.text(`Invoice No: ${invoice.id}`, mRight, rightY, { align: 'right' });
  rightY += 5;
  doc.text(`Date Issued: ${invoice.date}`, mRight, rightY, { align: 'right' });
  rightY += 5;
  doc.text(`Due Date: ${invoice.dueDate}`, mRight, rightY, { align: 'right' });
  rightY += 5;
  doc.text(`Terms: COD / 14 Days`, mRight, rightY, { align: 'right' });

  // Accent Line (Crimson brand-700 / crimson red)
  doc.setDrawColor(197, 0, 62); // crimson red
  doc.setLineWidth(0.8);
  doc.line(mLeft, 52, mRight, 52);

  // --- CLIENT / PROFILE SECTION ---
  const boxY = 58;
  const boxH = 34;
  const colW = wContent / 2 - 4; // 86

  // Bill To Box
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.2);
  doc.roundedRect(mLeft, boxY, colW, boxH, 2, 2, 'FD');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('BILLED TO (CORPORATE PROFILE)', mLeft + 4, boxY + 5);

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(client?.name || 'N/A', mLeft + 4, boxY + 11);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Reg No: ${client?.regNo || 'N/A'}`, mLeft + 4, boxY + 16);

  const billAddress = client?.billingAddress || 'N/A';
  const billLines = doc.splitTextToSize(billAddress, colW - 8);
  doc.text(billLines, mLeft + 4, boxY + 21);

  // Corporate Ledger Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(mLeft + colW + 8, boxY, colW, boxH, 2, 2, 'FD');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('CORPORATE LEDGER SUMMARY', mLeft + colW + 12, boxY + 5);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Client CRM Code:`, mLeft + colW + 12, boxY + 11);
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(client?.id || 'N/A', mLeft + colW + 48, boxY + 11);

  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Account AM:`, mLeft + colW + 12, boxY + 16);
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(client?.accountManager || 'N/A', mLeft + colW + 48, boxY + 16);

  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Invoice Status:`, mLeft + colW + 12, boxY + 21);
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(invoice.status === 'paid' ? 16 : 225, invoice.status === 'paid' ? 185 : 29, invoice.status === 'paid' ? 129 : 72); // green / red
  doc.text(invoice.status.toUpperCase(), mLeft + colW + 48, boxY + 21);

  // --- INVOICE ITEMS TABLE ---
  let tableY = 100;

  // Table Headers
  doc.setFillColor(241, 245, 249); // slate-100
  doc.rect(mLeft, tableY, wContent, 7, 'F');
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.4);
  doc.line(mLeft, tableY, mRight, tableY);
  doc.line(mLeft, tableY + 7, mRight, tableY + 7);

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('No.', mLeft + 2, tableY + 4.8);
  doc.text('Specification Service Rendered', mLeft + 12, tableY + 4.8);
  doc.text('Qty', mLeft + 114, tableY + 4.8, { align: 'center' });
  doc.text('Unit Price', mLeft + 140, tableY + 4.8, { align: 'right' });
  doc.text('Tax (SST)', mLeft + 162, tableY + 4.8, { align: 'right' });
  doc.text('Total Amount', mRight - 2, tableY + 4.8, { align: 'right' });

  // Draw Lines
  tableY += 7;
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);

  invoice.items.forEach((item, index) => {
    if (tableY > 230) {
      doc.addPage();
      tableY = 20;
      doc.setFillColor(241, 245, 249);
      doc.rect(mLeft, tableY, wContent, 7, 'F');
      doc.line(mLeft, tableY, mRight, tableY);
      doc.line(mLeft, tableY + 7, mRight, tableY + 7);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text('No.', mLeft + 2, tableY + 4.8);
      doc.text('Specification Service Rendered', mLeft + 12, tableY + 4.8);
      doc.text('Qty', mLeft + 114, tableY + 4.8, { align: 'center' });
      doc.text('Unit Price', mLeft + 140, tableY + 4.8, { align: 'right' });
      doc.text('Tax (SST)', mLeft + 162, tableY + 4.8, { align: 'right' });
      doc.text('Total Amount', mRight - 2, tableY + 4.8, { align: 'right' });
      tableY += 7;
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
    }

    const itemNum = String(index + 1);
    const descLines = doc.splitTextToSize(item.description, 95);

    doc.text(itemNum, mLeft + 2, tableY + 5);
    doc.text(descLines, mLeft + 12, tableY + 5);
    doc.text(String(item.qty), mLeft + 114, tableY + 5, { align: 'center' });
    doc.text(formatRM(item.unitPrice), mLeft + 140, tableY + 5, { align: 'right' });
    doc.text(item.taxable ? '8%' : 'Exempt', mLeft + 162, tableY + 5, { align: 'right' });
    doc.text(formatRM(item.totalAmount), mRight - 2, tableY + 5, { align: 'right' });

    const lineOffset = Math.max(descLines.length * 4.2, 7.5);
    doc.setDrawColor(241, 245, 249);
    doc.setLineWidth(0.1);
    doc.line(mLeft, tableY + lineOffset - 0.5, mRight, tableY + lineOffset - 0.5);

    tableY += lineOffset;
  });

  // --- BALANCE BLOCK ---
  if (tableY > 210) {
    doc.addPage();
    tableY = 20;
  }

  const totalsX = mRight - 75;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(totalsX, tableY, mRight, tableY);

  tableY += 4;
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Subtotal:', totalsX, tableY + 1);
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text(formatRM(invoice.subtotal), mRight - 2, tableY + 1, { align: 'right' });

  tableY += 5;
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('SST Service Tax (8%):', totalsX, tableY + 1);
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text(formatRM(invoice.sstTotal), mRight - 2, tableY + 1, { align: 'right' });

  tableY += 6;
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.4);
  doc.line(totalsX, tableY, mRight, tableY);

  tableY += 5;
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('INVOICE GRAND TOTAL:', totalsX, tableY + 1);
  doc.text(formatRM(invoice.grandTotal), mRight - 2, tableY + 1, { align: 'right' });

  // Payment Logs
  if (invoice.payments.length > 0) {
    tableY += 6;
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(16, 185, 129); // emerald-500
    doc.text('PAYMENTS LOGS RECEIVED:', totalsX, tableY);
    
    invoice.payments.forEach(p => {
      tableY += 4;
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(`${p.date} - ${p.method}`, totalsX, tableY);
      doc.setFont('Helvetica', 'bold');
      doc.text(`-${formatRM(p.amount)}`, mRight - 2, tableY, { align: 'right' });
    });
  }

  // --- BANK DETAILS SECTION ---
  tableY += 15;
  if (tableY > 230) {
    doc.addPage();
    tableY = 20;
  }

  doc.setDrawColor(241, 245, 249);
  doc.setLineWidth(0.5);
  doc.line(mLeft, tableY, mRight, tableY);

  tableY += 6;
  const colW2 = wContent / 2 - 5;

  // Maybank Coordinates
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('ELECTRONIC FUND BANK COORDINATES', mLeft, tableY);

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text('MALAYAN BANKING BERHAD (MAYBANK)', mLeft, tableY + 4.5);
  
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text([
    'Account Holder: POIS SOLUTIONS SDN BHD',
    'Account No: 5142-9904-8931',
    'SWIFT BIC: MBBEMYKL',
    'Please quote Invoice Ref No upon wire execution.'
  ], mLeft, tableY + 8.5);

  // Corporate SST Decl
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('COMPANY SST DECLARATION', mLeft + colW2 + 10, tableY);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text([
    'Company SST Reg Number: W10-1808-32000041',
    'All billing disputes must be logged with corporate finance',
    'accounts within 7 working days from tax invoice issuance date.',
    '',
    'Thank you for your business!'
  ], mLeft + colW2 + 10, tableY + 4.5);

  // Trigger Download
  doc.save(`Invoice_${invoice.id}.pdf`);
};
