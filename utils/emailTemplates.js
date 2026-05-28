const BRAND_COLOR = '#5e4a7a';
const BRAND_ACCENT = '#b8956a';
const BRAND_NAME = 'Finvo';

/**
 * Generate professional invoice email HTML for client
 * Optimized for all email clients using table-based layout
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
        <tr>
            <td style="padding: 12px 15px; color: #666; font-size: 13px; border-bottom: 1px solid #e8e8e8;">${item.description}</td>
            <td style="padding: 12px 15px; text-align: center; color: #666; font-size: 13px; border-bottom: 1px solid #e8e8e8;">${item.qty}</td>
            <td style="padding: 12px 15px; text-align: right; color: #666; font-size: 13px; border-bottom: 1px solid #e8e8e8;">₦${item.unitPrice.toLocaleString()}</td>
            <td style="padding: 12px 15px; text-align: right; color: #333; font-weight: 600; font-size: 13px; border-bottom: 1px solid #e8e8e8;">₦${item.total.toLocaleString()}</td>
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
        <body style="margin: 0; padding: 20px; background-color: #f5f5f5; font-family: Arial, Helvetica, sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 900px; margin: 0 auto;">
                <tr>
                    <td style="background-color: #ffffff; border-radius: 8px;">
                        
                        <!-- HEADER WITH LOGO -->
                        <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                                <td style="background-color: ${BRAND_COLOR}; padding: 30px; color: white; text-align: center;">
                                    <h1 style="margin: 0; font-size: 28px; font-weight: bold;">📄 INVOICE</h1>
                                    <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.9;">Invoice #${invoiceId}</p>
                                </td>
                            </tr>
                        </table>

                        <!-- MAIN CONTENT -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="padding: 30px;">
                            <tr>
                                <td>
                                    
                                    <!-- DATE AND DUE INFO -->
                                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                                        <tr>
                                            <td style="width: 50%; padding-right: 15px;">
                                                <p style="margin: 0; font-size: 12px; color: #999; font-weight: bold;">INVOICE DATE</p>
                                                <p style="margin: 5px 0 0 0; font-size: 14px; color: #333;">${invoiceDate}</p>
                                            </td>
                                            <td style="width: 50%; padding-left: 15px;">
                                                <p style="margin: 0; font-size: 12px; color: #999; font-weight: bold;">DUE DATE</p>
                                                <p style="margin: 5px 0 0 0; font-size: 14px; color: #333;">${dueDateFormatted}</p>
                                            </td>
                                        </tr>
                                    </table>

                                    <!-- INVOICE TO -->
                                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px; padding: 20px; background-color: #f9f9f9; border-left: 4px solid ${BRAND_COLOR};">
                                        <tr>
                                            <td>
                                                <p style="margin: 0; font-size: 12px; color: #999; text-transform: uppercase; font-weight: bold; letter-spacing: 1px;">INVOICE TO</p>
                                                <h3 style="margin: 10px 0 0 0; font-size: 16px; color: #333; font-weight: bold;">${clientName}</h3>
                                                ${description ? `<p style="margin: 8px 0 0 0; font-size: 13px; color: #666;">${description}</p>` : ''}
                                            </td>
                                        </tr>
                                    </table>

                                    <!-- ITEMS TABLE -->
                                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 25px; border-collapse: collapse;">
                                        <thead>
                                            <tr style="background-color: ${BRAND_ACCENT}; color: white;">
                                                <th style="padding: 12px 15px; text-align: left; font-size: 12px; font-weight: bold; text-transform: uppercase;">Description</th>
                                                <th style="padding: 12px 15px; text-align: center; font-size: 12px; font-weight: bold; text-transform: uppercase;">Qty</th>
                                                <th style="padding: 12px 15px; text-align: right; font-size: 12px; font-weight: bold; text-transform: uppercase;">Price</th>
                                                <th style="padding: 12px 15px; text-align: right; font-size: 12px; font-weight: bold; text-transform: uppercase;">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${itemsHTML}
                                        </tbody>
                                    </table>

                                    <!-- TOTALS -->
                                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 25px;">
                                        <tr>
                                            <td width="60%"></td>
                                            <td width="40%">
                                                <table width="100%" cellpadding="0" cellspacing="0">
                                                    <tr>
                                                        <td style="padding: 10px 15px 10px 0; text-align: right; font-size: 13px; color: #666; border-bottom: 1px solid #e8e8e8;">
                                                            <strong>Sub-total:</strong>
                                                        </td>
                                                        <td style="padding: 10px 0; text-align: right; font-size: 13px; color: #666; border-bottom: 1px solid #e8e8e8;">
                                                            ₦${subtotal.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding: 10px 15px 10px 0; text-align: right; font-size: 13px; color: #666; border-bottom: 1px solid #e8e8e8;">
                                                            <strong>Tax (10%):</strong>
                                                        </td>
                                                        <td style="padding: 10px 0; text-align: right; font-size: 13px; color: #666; border-bottom: 1px solid #e8e8e8;">
                                                            ₦${tax.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding: 15px 15px; text-align: right; font-size: 16px; font-weight: bold; color: white; background-color: ${BRAND_ACCENT};">
                                                            Total:
                                                        </td>
                                                        <td style="padding: 15px 0; text-align: right; font-size: 16px; font-weight: bold; color: white; background-color: ${BRAND_ACCENT};">
                                                            ₦${calculatedAmount.toLocaleString()}
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>

                                    <!-- PAYMENT NOTE -->
                                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 25px; padding: 15px; background-color: #f0f7ff; border-left: 4px solid ${BRAND_COLOR};">
                                        <tr>
                                            <td>
                                                <p style="margin: 0; font-size: 12px; color: #666; line-height: 1.6;">
                                                    <strong>Payment Terms:</strong> Please arrange payment by the due date. If you have any questions about this invoice, please don't hesitate to contact us.
                                                </p>
                                            </td>
                                        </tr>
                                    </table>

                                </td>
                            </tr>
                        </table>

                        <!-- FOOTER -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #e8e8e8; padding: 20px; text-align: center; background-color: #fafafa;">
                            <tr>
                                <td>
                                    <p style="margin: 0; font-size: 12px; color: #999;">Thank you for your business!</p>
                                    <p style="margin: 8px 0 0 0; font-size: 11px; color: #bbb;">© 2026 ${BRAND_NAME}. All rights reserved.</p>
                                </td>
                            </tr>
                        </table>

                    </td>
                </tr>
            </table>
        </body>
        </html>
    `;
};

module.exports = {
    clientInvoiceEmail
};
