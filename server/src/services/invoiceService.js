import PDFDocument from 'pdfkit';

export function generateInvoicePDF(order, res) {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });

  // Stream output to HTTP response
  doc.pipe(res);

  // Header Bar
  doc
    .fillColor('#0F172A')
    .rect(0, 0, 595.28, 70)
    .fill();

  doc
    .fillColor('#FFFFFF')
    .fontSize(22)
    .font('Helvetica-Bold')
    .text('E - S H O P', 40, 25, { characterSpacing: 2 });

  doc
    .fontSize(10)
    .font('Helvetica')
    .text('TAX INVOICE / CASH MEMO', 420, 25, { align: 'right' })
    .text(`Invoice No: ${order.invoiceNo || 'ESH-2026-0001'}`, 420, 40, { align: 'right' });

  // Seller & Buyer Details
  const startY = 90;
  doc
    .fillColor('#334155')
    .fontSize(10)
    .font('Helvetica-Bold')
    .text('Sold By:', 40, startY)
    .font('Helvetica')
    .text('E-Shop Retail India Pvt. Ltd.')
    .text('Hub 560001, MG Road, Bengaluru Central')
    .text('Karnataka, India - 560001')
    .text('GSTIN: 29AAAAA0000A1Z5');

  doc
    .font('Helvetica-Bold')
    .text('Billed & Shipped To:', 340, startY)
    .font('Helvetica')
    .text(order.shippingAddress?.fullName || 'Customer')
    .text(order.shippingAddress?.line1 || '')
    .text(`${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} - ${order.shippingAddress?.pincode || ''}`)
    .text(`Phone: ${order.shippingAddress?.phone || 'N/A'}`)
    .text(`Order Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`);

  // Table Header
  const tableTop = 200;
  doc
    .rect(40, tableTop, 515, 24)
    .fillColor('#F1F5F9')
    .fill();

  doc
    .fillColor('#0F172A')
    .fontSize(9)
    .font('Helvetica-Bold')
    .text('SL', 45, tableTop + 7)
    .text('ITEM DESCRIPTION', 75, tableTop + 7)
    .text('QTY', 360, tableTop + 7, { width: 30, align: 'center' })
    .text('PRICE', 410, tableTop + 7, { width: 60, align: 'right' })
    .text('TOTAL', 485, tableTop + 7, { width: 65, align: 'right' });

  // Table Rows
  let itemY = tableTop + 30;
  doc.font('Helvetica');

  (order.items || []).forEach((item, index) => {
    doc
      .fillColor('#334155')
      .fontSize(9)
      .text(String(index + 1), 45, itemY)
      .text(item.name ? item.name.substring(0, 50) : 'Product', 75, itemY, { width: 270 })
      .text(String(item.quantity), 360, itemY, { width: 30, align: 'center' })
      .text(`INR ${Number(item.price).toLocaleString('en-IN')}`, 410, itemY, { width: 60, align: 'right' })
      .text(`INR ${Number(item.subtotal).toLocaleString('en-IN')}`, 485, itemY, { width: 65, align: 'right' });

    itemY += 22;
  });

  // Divider
  doc
    .strokeColor('#E2E8F0')
    .lineWidth(1)
    .moveTo(40, itemY + 5)
    .lineTo(555, itemY + 5)
    .stroke();

  // Financial Summary
  const summaryY = itemY + 15;
  doc
    .fontSize(9)
    .fillColor('#475569')
    .text('Subtotal:', 380, summaryY)
    .text(`INR ${Number(order.pricing?.subtotal || 0).toLocaleString('en-IN')}`, 485, summaryY, { align: 'right' })
    
    .text('Coupon Discount:', 380, summaryY + 15)
    .text(`- INR ${Number(order.pricing?.discount || 0).toLocaleString('en-IN')}`, 485, summaryY + 15, { align: 'right' })
    
    .text('Shipping & Delivery:', 380, summaryY + 30)
    .text(order.pricing?.deliveryFee === 0 ? 'FREE' : `INR ${order.pricing?.deliveryFee}`, 485, summaryY + 30, { align: 'right' });

  // Grand Total Box
  doc
    .rect(370, summaryY + 50, 185, 28)
    .fillColor('#0F172A')
    .fill();

  doc
    .fillColor('#FFFFFF')
    .fontSize(10)
    .font('Helvetica-Bold')
    .text('GRAND TOTAL:', 380, summaryY + 58)
    .text(`INR ${Number(order.pricing?.total || 0).toLocaleString('en-IN')}`, 485, summaryY + 58, { align: 'right' });

  // Footer & Signature
  doc
    .fillColor('#64748B')
    .fontSize(8)
    .font('Helvetica')
    .text('Payment Mode: ' + (order.paymentMethod || 'UPI'), 40, summaryY + 60)
    .text('Payment Status: ' + (order.paymentStatus || 'PAID'), 40, summaryY + 75)
    .text('This is a computer-generated tax invoice. No signature required.', 40, 750, { align: 'center' });

  doc.end();
}
