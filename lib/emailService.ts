export interface EmailData {
  to: string;
  subject: string;
  body: string;
  attachments?: Array<{
    filename: string;
    content: string;
    type: string;
  }>;
}

export const sendEmail = async (emailData: EmailData): Promise<boolean> => {
  try {
    // In a real application, this would integrate with an email service like SendGrid, Mailgun, etc.
    // For demo purposes, we'll simulate email sending and open the user's email client
    
    const mailtoLink = `mailto:${emailData.to}?subject=${encodeURIComponent(emailData.subject)}&body=${encodeURIComponent(emailData.body)}`;
    window.open(mailtoLink);
    
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
};

export const generatePurchaseOrderEmail = (order: any, supplier: any, companyInfo: any): EmailData => {
  const subject = `Purchase Order PO-${order.id} from ${companyInfo.name}`;
  
  const body = `Dear ${supplier.name},

We are pleased to send you the following purchase order:

Purchase Order Number: PO-${order.id}
Order Date: ${new Date(order.orderDate).toLocaleDateString()}
Expected Delivery Date: ${new Date(order.expectedDate).toLocaleDateString()}

Please confirm receipt of this order and provide an estimated delivery schedule.

Items Ordered:
${order.items.map((item: any, index: number) => 
  `${index + 1}. ${item.name} - Quantity: ${item.quantity} - Unit Price: $${item.unitCost}`
).join('\n')}

Total Amount: $${order.totalAmount.toFixed(2)}

Please contact us if you have any questions regarding this order.

Best regards,
${companyInfo.name}
${companyInfo.phone}
${companyInfo.email}`;

  return {
    to: supplier.email,
    subject,
    body
  };
};