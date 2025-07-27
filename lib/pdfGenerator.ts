import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface ReportData {
  title: string;
  data: any[];
  columns: string[];
  summary?: { [key: string]: any };
  companyInfo?: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
}

export const generatePDFReport = async (reportData: ReportData): Promise<void> => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPosition = 20;

  // Company Header
  if (reportData.companyInfo) {
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(reportData.companyInfo.name, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(reportData.companyInfo.address, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 6;
    pdf.text(`Phone: ${reportData.companyInfo.phone} | Email: ${reportData.companyInfo.email}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;
  }

  // Report Title
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text(reportData.title, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  // Date
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 20;

  // Table Headers
  const colWidth = (pageWidth - 40) / reportData.columns.length;
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  
  reportData.columns.forEach((column, index) => {
    pdf.text(column, 20 + (index * colWidth), yPosition);
  });
  yPosition += 8;

  // Draw line under headers
  pdf.line(20, yPosition, pageWidth - 20, yPosition);
  yPosition += 5;

  // Table Data
  pdf.setFont('helvetica', 'normal');
  reportData.data.forEach((row, rowIndex) => {
    if (yPosition > pageHeight - 30) {
      pdf.addPage();
      yPosition = 20;
    }

    reportData.columns.forEach((column, colIndex) => {
      const value = row[column] || '';
      const displayValue = typeof value === 'number' ? value.toFixed(2) : String(value);
      pdf.text(displayValue, 20 + (colIndex * colWidth), yPosition);
    });
    yPosition += 6;
  });

  // Summary Section
  if (reportData.summary) {
    yPosition += 10;
    pdf.line(20, yPosition, pageWidth - 20, yPosition);
    yPosition += 10;
    
    pdf.setFont('helvetica', 'bold');
    pdf.text('Summary', 20, yPosition);
    yPosition += 8;
    
    pdf.setFont('helvetica', 'normal');
    Object.entries(reportData.summary).forEach(([key, value]) => {
      pdf.text(`${key}: ${value}`, 20, yPosition);
      yPosition += 6;
    });
  }

  // Save the PDF
  pdf.save(`${reportData.title.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const generatePurchaseOrderPDF = async (order: any, supplier: any, items: any[], companyInfo: any): Promise<void> => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  let yPosition = 20;

  // Company Header
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text(companyInfo.name, 20, yPosition);
  yPosition += 8;
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(companyInfo.address, 20, yPosition);
  yPosition += 6;
  pdf.text(`Phone: ${companyInfo.phone} | Email: ${companyInfo.email}`, 20, yPosition);
  yPosition += 20;

  // Purchase Order Title
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text('PURCHASE ORDER', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Order Details
  pdf.setFontSize(12);
  pdf.text(`PO Number: PO-${order.id}`, 20, yPosition);
  pdf.text(`Date: ${new Date(order.orderDate).toLocaleDateString()}`, pageWidth - 80, yPosition);
  yPosition += 8;
  pdf.text(`Expected Delivery: ${new Date(order.expectedDate).toLocaleDateString()}`, 20, yPosition);
  yPosition += 15;

  // Supplier Information
  pdf.setFont('helvetica', 'bold');
  pdf.text('Supplier:', 20, yPosition);
  yPosition += 8;
  pdf.setFont('helvetica', 'normal');
  pdf.text(supplier.name, 20, yPosition);
  yPosition += 6;
  pdf.text(supplier.address, 20, yPosition);
  yPosition += 6;
  pdf.text(`Phone: ${supplier.phone}`, 20, yPosition);
  yPosition += 6;
  pdf.text(`Email: ${supplier.email}`, 20, yPosition);
  yPosition += 20;

  // Items Table
  pdf.setFont('helvetica', 'bold');
  pdf.text('Item', 20, yPosition);
  pdf.text('Qty', 120, yPosition);
  pdf.text('Unit Price', 150, yPosition);
  pdf.text('Total', 180, yPosition);
  yPosition += 8;

  pdf.line(20, yPosition, pageWidth - 20, yPosition);
  yPosition += 5;

  pdf.setFont('helvetica', 'normal');
  let totalAmount = 0;
  
  items.forEach((item) => {
    const itemTotal = item.quantity * item.unitCost;
    totalAmount += itemTotal;
    
    pdf.text(item.name, 20, yPosition);
    pdf.text(item.quantity.toString(), 120, yPosition);
    pdf.text(`$${item.unitCost.toFixed(2)}`, 150, yPosition);
    pdf.text(`$${itemTotal.toFixed(2)}`, 180, yPosition);
    yPosition += 6;
  });

  yPosition += 10;
  pdf.line(20, yPosition, pageWidth - 20, yPosition);
  yPosition += 10;

  pdf.setFont('helvetica', 'bold');
  pdf.text(`Total Amount: $${totalAmount.toFixed(2)}`, 150, yPosition);

  pdf.save(`purchase_order_${order.id}.pdf`);
};