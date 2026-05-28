const BRAND_COLOR = '#5e4a7a';
const BRAND_ACCENT = '#b8956a';
const BRAND_NAME = 'Finvo';

/**
 * Generate professional invoice email HTML for client
 * Matches premium invoice template design with modern styling
 */
const clientInvoiceEmail = (clientName, invoiceId, description, items, calculatedAmount, dueDate) => {
    const invoiceDate = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
    const dueDateFormatted = dueDate ? new Date(dueDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Not specified';

    // Calculate tax (assuming 10% tax rate, adjust as needed)
    const taxRate = 0.1;
    const subtotal = calculatedAmount / (1 + taxRate);
    const tax = calculatedAmount - subtotal;

    // Format items into table rows
    const itemsHTML = items.map((item) => `
        <tr style="border-bottom: 1px solid #e8e8e8;">
            <td style="padding: 12px 15px; color: #666; font-size: 13px;">${item.description}</td>
            <td style="padding: 12px 15px; text-align: center; color: #666; font-size: 13px;">${item.qty}</td>
            <td style="padding: 12px 15px; text-align: right; color: #666; font-size: 13px;">₦${item.unitPrice.toLocaleString()}</td>
            <td style="padding: 12px 15px; text-align: right; color: #333; font-weight: 600; font-size: 13px;">₦${item.total.toLocaleString()}</td>
        </tr>
    `).join('');

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Invoice #${invoiceId}</title>
        </head>
        <body style="margin: 0; padding: 20px; background-color: #f5f5f5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <div style="max-width: 900px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
                
                <!-- MAIN LAYOUT: Two-column with sidebar -->
                <div style="display: table; width: 100%; border-collapse: collapse;">
                    
                    <!-- LEFT SIDEBAR -->
                    <div style="display: table-cell; width: 35%; background: linear-gradient(135deg, ${BRAND_COLOR} 0%, #6b5a8a 100%); padding: 40px 30px; color: white; vertical-align: top;">
                        <div style="writing-mode: vertical-rl; transform: rotate(180deg); font-size: 24px; font-weight: bold; letter-spacing: 3px; margin-bottom: 40px; opacity: 0.3;">
                            INVOICE TEMPLATE
                        </div>
                        
                        <!-- Company Info -->
                        <div style="margin-top: 60px;">
                            <h2 style="margin: 0 0 20px 0; font-size: 28px; font-weight: bold; color: white;">
                                ${BRAND_NAME}
                            </h2>
                            <p style="margin: 0 0 15px 0; font-size: 13px; line-height: 1.8; opacity: 0.9;">
                                Professional Invoice Management<br/>
                                Simplifying Your Billing Process
                            </p>
                        </div>

                        <!-- Contact Info -->
                        <div style="margin-top: 40px; font-size: 12px; opacity: 0.85; line-height: 1.8;">
                            <p style="margin: 0;">📧 contact@finvo.com</p>
                            <p style="margin: 5px 0 0 0;">🌐 www.finvo.com</p>
                        </div>
                    </div>

                    <!-- RIGHT CONTENT -->
                    <div style="display: table-cell; width: 65%; padding: 40px 35px; vertical-align: top;">
                        
                        <!-- HEADER ROW -->
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px;">
                            <div>
                                <h1 style="margin: 0; font-size: 32px; font-weight: bold; color: #333;">INVOICE</h1>
                                <p style="margin: 5px 0 0 0; font-size: 13px; color: #999;">#${invoiceId}</p>
                            </div>
                            <div style="text-align: right;">
                                <p style="margin: 0; font-size: 13px; color: #666;"><strong>Date:</strong> ${invoiceDate}</p>
                                <p style="margin: 5px 0 0 0; font-size: 13px; color: #666;"><strong>Due:</strong> ${dueDateFormatted}</p>
                            </div>
                        </div>

                        <!-- INVOICE DETAILS -->
                        <div style="display: flex; justify-content: space-between; margin-bottom: 35px; padding-bottom: 25px; border-bottom: 2px solid #f0f0f0;">
                            <div>
                                <p style="margin: 0 0 15px 0; font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">INVOICE TO</p>
                                <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #333; font-weight: 600;">${clientName}</h3>
                                <p style="margin: 0; font-size: 13px; color: #666; line-height: 1.6;">
                                    ${description ? description + '<br/>' : ''}
                                </p>
                            </div>
                        </div>

                        <!-- ITEMS TABLE -->
                        <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
                            <thead>
                                <tr style="background-color: ${BRAND_ACCENT}; color: white;">
                                    <th style="padding: 12px 15px; text-align: left; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Description</th>
                                    <th style="padding: 12px 15px; text-align: center; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Qty</th>
                                    <th style="padding: 12px 15px; text-align: right; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Price</th>
                                    <th style="padding: 12px 15px; text-align: right; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsHTML}
                            </tbody>
                        </table>

                        <!-- TOTALS SECTION -->
                        <div style="display: flex; justify-content: flex-end; margin-top: 30px;">
                            <div style="width: 250px;">
                                <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e8e8e8; font-size: 13px; color: #666;">
                                    <span><strong>Sub-total:</strong></span>
                                    <span>₦${subtotal.toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e8e8e8; font-size: 13px; color: #666;">
                                    <span><strong>Tax:</strong></span>
                                    <span>₦${tax.toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; padding: 15px 0; background-color: ${BRAND_ACCENT}; padding: 15px 12px; border-radius: 4px; font-size: 16px; font-weight: bold; color: white; margin-top: 10px;">
                                    <span>Total:</span>
                                    <span>₦${calculatedAmount.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <!-- PAYMENT NOTE -->
                        <div style="margin-top: 30px; padding: 15px; background-color: #fafafa; border-left: 4px solid ${BRAND_COLOR}; border-radius: 3px;">
                            <p style="margin: 0; font-size: 12px; color: #666; line-height: 1.6;">
                                <strong>Payment Terms:</strong> Please arrange payment by the due date. If you have any questions about this invoice, please don't hesitate to contact us.
                            </p>
                        </div>

                        <!-- FOOTER -->
                        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e8e8e8; text-align: center; font-size: 11px; color: #999;">
                            <p style="margin: 0;">Thank you for your business! | © 2026 ${BRAND_NAME} • All rights reserved</p>
                        </div>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;
};

module.exports = {
    clientInvoiceEmail
};
