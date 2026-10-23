import PDFDocument from 'pdfkit';

export function generateInvoicePDF(order, res) {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });

  // Handle stream error safely to avoid broken downloads
  doc.on('error', (err) => {
    console.error('💥 [PDFKit Error]:', err);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Failed to generate invoice document.' });
    }
  });

  doc.pipe(res);

  // Header Bar
  doc
    .fillColor('#0F172A')
    .rect(0, 0, 595.28, 75)
    .fill();

  doc
    .fillColor('#FFFFFF')
    .fontSize(22)
    .font('Helvetica-Bold')
    .text('E - S H O P', 40, 25, { characterSpacing: 2 });

  doc
    .fontSize(10)
    .font('Helvetica')
    .text('RETAIL TAX INVOICE & ORDER SUMMARY', 320, 25, { align: 'right' })
    .text(`Invoice No: ${order.invoiceNo || 'ESH-2026-0001'}`, 320, 40, { align: 'right' })
    .text(`Order No: ${order.orderNo || 'ORD-2026'}`, 320, 53, { align: 'right' });

  // Seller & Buyer Details
  const startY = 95;
  const isKarnataka = (order.shippingAddress?.state || '').toLowerCase().includes('karnataka');

  doc
    .fillColor('#334155')
    .fontSize(10)
    .font('Helvetica-Bold')
    .text('Sold By:', 40, startY)
    .font('Helvetica')
    .text('E-Shop Retail India Pvt. Ltd.')
    .text('Hub 560001, MG Road, Bengaluru Central')
    .text('Karnataka, India - 560001')
    .text('GSTIN: 29AAAAA0000A1Z5 (Demo Registered)');

  doc
    .font('Helvetica-Bold')
    .text('Billed & Shipped To:', 340, startY)
    .font('Helvetica')
    .text(order.shippingAddress?.fullName || 'Customer')
    .text(order.shippingAddress?.line1 || '')
    .text(`${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} - ${order.shippingAddress?.pincode || ''}`)
    .text(`Phone: ${order.shippingAddress?.phone || 'N/A'}`)
    .text(`Order Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`)
    .text(`Payment Mode: ${order.paymentMethod || 'UPI'} (${order.paymentStatus || 'PAID'})`);

  // Table Header
  const tableTop = 205;
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
    .text('HSN', 320, tableTop + 7, { width: 40, align: 'center' })
    .text('QTY', 365, tableTop + 7, { width: 30, align: 'center' })
    .text('PRICE', 405, tableTop + 7, { width: 65, align: 'right' })
    .text('TOTAL', 485, tableTop + 7, { width: 65, align: 'right' });

  // Table Rows
  let itemY = tableTop + 30;
  doc.font('Helvetica');

  (order.items || []).forEach((item, index) => {
    doc
      .fillColor('#334155')
      .fontSize(9)
      .text(String(index + 1), 45, itemY)
      .text(item.name ? item.name.substring(0, 45) : 'Product', 75, itemY, { width: 240 })
      .text('8517', 320, itemY, { width: 40, align: 'center' })
      .text(String(item.quantity), 365, itemY, { width: 30, align: 'center' })
      .text(`INR ${Number(item.price).toLocaleString('en-IN')}`, 405, itemY, { width: 65, align: 'right' })
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

  // Financial & GST Summary
  const subtotal = Number(order.pricing?.subtotal || 0);
  const discount = Number(order.pricing?.discount || 0);
  const deliveryFee = Number(order.pricing?.deliveryFee || 0);
  const total = Number(order.pricing?.total || 0);

  // Inclusive GST calculation (18% GST rate)
  const taxableValue = Math.round((total / 1.18) * 100) / 100;
  const gstAmount = Math.max(0, Math.round((total - taxableValue) * 100) / 100);

  let summaryY = itemY + 15;
  doc
    .fontSize(9)
    .fillColor('#475569')
    .text('Cart Subtotal:', 340, summaryY)
    .text(`INR ${subtotal.toLocaleString('en-IN')}`, 485, summaryY, { align: 'right' });

  if (discount > 0) {
    summaryY += 15;
    doc
      .text(`Discount (${order.couponCode || 'PROMO'}):`, 340, summaryY)
      .text(`- INR ${discount.toLocaleString('en-IN')}`, 485, summaryY, { align: 'right' });
  }

  summaryY += 15;
  doc
    .text('Delivery & Shipping:', 340, summaryY)
    .text(deliveryFee === 0 ? 'FREE' : `INR ${deliveryFee.toLocaleString('en-IN')}`, 485, summaryY, { align: 'right' });

  // GST Breakdown
  summaryY += 15;
  doc
    .text('Net Taxable Amount:', 340, summaryY)
    .text(`INR ${taxableValue.toLocaleString('en-IN')}`, 485, summaryY, { align: 'right' });

  if (isKarnataka) {
    summaryY += 14;
    doc
      .text('CGST (9%):', 340, summaryY)
      .text(`INR ${(Math.round(gstAmount / 2 * 100) / 100).toLocaleString('en-IN')}`, 485, summaryY, { align: 'right' });
    summaryY += 14;
    doc
      .text('SGST (9%):', 340, summaryY)
      .text(`INR ${(Math.round(gstAmount / 2 * 100) / 100).toLocaleString('en-IN')}`, 485, summaryY, { align: 'right' });
  } else {
    summaryY += 14;
    doc
      .text('IGST (18%):', 340, summaryY)
      .text(`INR ${gstAmount.toLocaleString('en-IN')}`, 485, summaryY, { align: 'right' });
  }

  // Grand Total Highlight
  summaryY += 18;
  doc
    .rect(330, summaryY - 3, 225, 24)
    .fillColor('#F8FAFC')
    .fill();

  doc
    .fillColor('#0F172A')
    .font('Helvetica-Bold')
    .fontSize(11)
    .text('Grand Total:', 340, summaryY + 4)
    .text(`INR ${total.toLocaleString('en-IN')}`, 485, summaryY + 4, { align: 'right' });

  // Footer notes & declaration
  doc
    .font('Helvetica')
    .fontSize(8)
    .fillColor('#64748B')
    .text(
      'Tax is included in all retail items unless specified. This is a computer generated invoice and requires no physical signature.',
      40,
      760,
      { align: 'center', width: 515 }
    );

  doc.end();
}
