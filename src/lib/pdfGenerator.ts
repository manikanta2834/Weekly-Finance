import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Borrower } from '../types';
import { formatDate, getBorrowerProgress } from './calculator';

// PDF-safe currency formatter (replaces Unicode ₹ with standard Rs. to prevent jsPDF font-encoding glyph errors)
export function formatPdfINR(val: number): string {
  if (isNaN(val) || val === null || val === undefined) return 'Rs. 0';
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(val);
  return `Rs. ${formatted}`;
}

export function generateBorrowerPDF(borrower: Borrower, language: string = 'en') {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const progress = getBorrowerProgress(borrower);

  // 1. Background Header Banner (Dark Forest Green)
  doc.setFillColor(6, 29, 26);
  doc.rect(0, 0, 210, 40, 'F');

  // Gold accent bar
  doc.setFillColor(245, 158, 11);
  doc.rect(0, 40, 210, 2.5, 'F');

  // Title & Brand
  doc.setTextColor(245, 158, 11); // Amber
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('MANIKANTA WEEKLY FINANCE', 14, 17);

  doc.setFontSize(9.5);
  doc.setTextColor(180, 210, 205);
  doc.setFont('helvetica', 'normal');
  doc.text('Vaddi Vault • Micro-Finance 21-Week Loan Ledger & Statement', 14, 25);

  doc.setFontSize(8.5);
  doc.setTextColor(200, 215, 210);
  const genDateStr = `Generated on: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`;
  doc.text(genDateStr, 14, 33);

  // Status Badge on Header right
  if (progress.isFullyPaid) {
    doc.setFillColor(16, 185, 129); // Emerald
    doc.roundedRect(142, 12, 54, 12, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.text('LOAN COMPLETED', 169, 19.5, { align: 'center' });
  } else {
    doc.setFillColor(245, 158, 11); // Amber
    doc.roundedRect(142, 12, 54, 12, 2, 2, 'F');
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.text('LOAN ACTIVE', 169, 19.5, { align: 'center' });
  }

  // 2. Borrower Details & Financial Terms Section (Clean Structured 2-Column Card)
  doc.setFillColor(248, 250, 250);
  doc.roundedRect(14, 48, 182, 44, 3, 3, 'F');
  doc.setDrawColor(210, 225, 222);
  doc.setLineWidth(0.4);
  doc.roundedRect(14, 48, 182, 44, 3, 3, 'S');

  // Left Column: Borrower Profile
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(borrower.name || 'Unnamed Borrower', 20, 58);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(70, 80, 95);
  doc.text(`Mobile Number:`, 20, 66);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`+91 ${borrower.mobile_number || 'N/A'}`, 50, 66);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(70, 80, 95);
  doc.text(`City / Area:`, 20, 74);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${borrower.city_name || 'N/A'}`, 50, 74);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(70, 80, 95);
  doc.text(`Loan Start Date:`, 20, 82);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${formatDate(borrower.date, 'en')}`, 50, 82);

  // Vertical Divider in Profile Card
  doc.setDrawColor(220, 230, 228);
  doc.line(105, 52, 105, 88);

  // Right Column: Financial Summary Terms
  const rightLabelX = 110;
  const rightValX = 190;

  // Row 1: Principal
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(70, 80, 95);
  doc.text('Principal Lent (Asalu):', rightLabelX, 58);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(formatPdfINR(borrower.amount), rightValX, 58, { align: 'right' });

  // Row 2: Weekly Due
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(70, 80, 95);
  doc.text(`Weekly Due (${borrower.duration_weeks || 21} wks):`, rightLabelX, 66);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(180, 83, 9); // Amber
  doc.text(`${formatPdfINR(borrower.weekly_amount)} / week`, rightValX, 66, { align: 'right' });

  // Row 3: Total Target
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(70, 80, 95);
  doc.text('Total Repayment Target:', rightLabelX, 74);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 150, 105); // Emerald
  doc.text(formatPdfINR(borrower.total_amount), rightValX, 74, { align: 'right' });

  // Row 4: Pure Interest Profit
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(70, 80, 95);
  doc.text('Net Interest Profit (Vaddi):', rightLabelX, 82);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(217, 119, 6); // Amber bold
  doc.text(`+${formatPdfINR(borrower.interest_amount)}`, rightValX, 82, { align: 'right' });

  // 3. Progress KPI Metric Boxes
  const kpiY = 98;
  
  // Box 1: Collected
  doc.setFillColor(236, 253, 245); // Emerald-50
  doc.roundedRect(14, kpiY, 56, 17, 2, 2, 'F');
  doc.setDrawColor(167, 243, 208);
  doc.roundedRect(14, kpiY, 56, 17, 2, 2, 'S');
  doc.setFontSize(7.5);
  doc.setTextColor(6, 95, 70);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL COLLECTED', 18, kpiY + 5.5);
  doc.setFontSize(11.5);
  doc.text(formatPdfINR(progress.collected), 18, kpiY + 12.5);

  // Box 2: Remaining Balance
  doc.setFillColor(254, 243, 199); // Amber-50
  doc.roundedRect(77, kpiY, 56, 17, 2, 2, 'F');
  doc.setDrawColor(253, 230, 138);
  doc.roundedRect(77, kpiY, 56, 17, 2, 2, 'S');
  doc.setFontSize(7.5);
  doc.setTextColor(146, 64, 14);
  doc.setFont('helvetica', 'bold');
  doc.text('REMAINING BALANCE', 81, kpiY + 5.5);
  doc.setFontSize(11.5);
  doc.text(formatPdfINR(progress.remaining), 81, kpiY + 12.5);

  // Box 3: Weeks Progress
  doc.setFillColor(240, 253, 250); // Teal-50
  doc.roundedRect(140, kpiY, 56, 17, 2, 2, 'F');
  doc.setDrawColor(204, 251, 241);
  doc.roundedRect(140, kpiY, 56, 17, 2, 2, 'S');
  doc.setFontSize(7.5);
  doc.setTextColor(19, 78, 74);
  doc.setFont('helvetica', 'bold');
  doc.text('PROGRESS STATUS', 144, kpiY + 5.5);
  doc.setFontSize(10.5);
  doc.text(`${progress.paidWeeksCount} / ${borrower.duration_weeks || 21} wks (${progress.percentage}%)`, 144, kpiY + 12.5);

  // 4. Week-by-Week Payments Table
  const paymentsList = borrower.payments || [];
  const tableData = paymentsList.map((p) => {
    let statusText = p.status.toUpperCase();
    if (p.status === 'paid') statusText = 'PAID';
    else if (p.status === 'partial') statusText = `PARTIAL (${formatPdfINR(p.paid_amount || 0)})`;
    else if (p.status === 'defaulted') statusText = 'MISSED / DEFAULT';
    else statusText = 'PENDING';

    const isProfit = (p.week_number * borrower.weekly_amount) > borrower.amount;
    const stageText = p.notes || (isProfit ? 'Profit Phase Week (+Profit)' : 'Principal Recovery');

    return [
      `Week ${p.week_number}`,
      formatDate(p.due_date, 'en'),
      formatPdfINR(p.amount_due),
      statusText,
      p.paid_date ? formatDate(p.paid_date, 'en') : '—',
      stageText,
    ];
  });

  autoTable(doc, {
    startY: 121,
    head: [['Week #', 'Due Date', 'Installment', 'Payment Status', 'Paid Date', 'Ledger Stage / Notes']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [6, 29, 26],
      textColor: [245, 158, 11],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
      cellPadding: 2,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 250],
    },
    columnStyles: {
      0: { fontStyle: 'bold', halign: 'center', cellWidth: 20 },
      1: { halign: 'center', cellWidth: 26 },
      2: { halign: 'right', fontStyle: 'bold', cellWidth: 26 },
      3: { halign: 'center', cellWidth: 34 },
      4: { halign: 'center', cellWidth: 26 },
      5: { halign: 'left' },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 3) {
        const text = String(data.cell.raw);
        if (text.startsWith('PAID')) {
          data.cell.styles.textColor = [5, 150, 105];
          data.cell.styles.fontStyle = 'bold';
        } else if (text.startsWith('PARTIAL')) {
          data.cell.styles.textColor = [217, 119, 6];
          data.cell.styles.fontStyle = 'bold';
        } else if (text.startsWith('MISSED')) {
          data.cell.styles.textColor = [225, 29, 72];
          data.cell.styles.fontStyle = 'bold';
        } else {
          data.cell.styles.textColor = [100, 116, 139];
        }
      }
    },
  });

  // 5. Signatures & Footer Note
  const finalY = (doc as any).lastAutoTable?.finalY || 240;
  
  // If there is space on the current page, add signature section
  if (finalY < 255) {
    doc.setDrawColor(180, 195, 192);
    doc.line(20, 268, 75, 268);
    doc.line(135, 268, 190, 268);

    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.text('Borrower Signature', 47.5, 273, { align: 'center' });
    doc.text('Lender / Agent Signature', 162.5, 273, { align: 'center' });
  }

  // Page Numbers
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Vaddi Vault Micro-Finance Ledger • Borrower: ${borrower.name || 'Borrower'} • Page ${i} of ${pageCount}`,
      105,
      290,
      { align: 'center' }
    );
  }

  // Save / Download PDF Directly to Device
  const safeName = (borrower.name || 'Borrower').replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`${safeName}_21Week_Ledger_Statement.pdf`);
}

