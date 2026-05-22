// Email Templates for Finvo
const BRAND_COLOR = '#1e88e5';
const BRAND_NAME = 'Finvo';

/**
 * Client Invoice Email Template - Comprehensive Invoice Display
 */
const clientInvoiceEmail = (clientName, invoiceId, description, items, calculatedAmount, dueDate) => {
    const dueDateFormatted = dueDate
        ? new Date(dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : 'Not specified';

    // Generate items rows
    const itemsHTML = items.map((item, index) => `
        <tr>
            <td style="padding: 16px 0; border-bottom: 1px solid #eee;">
                <strong style="display: block; margin-bottom: 4px; font-size: 15px; color: #333;">${index + 1}. ${item.description}</strong>
                <table width="100%" style="margin-top: 8px;">
                    <tr>
                        <td style="font-size: 13px; color: #666;">
                            <strong>Qty:</strong> ${item.qty}
                        </td>
                        <td style="font-size: 13px; color: #666;">
                            <strong>Unit Price:</strong> ₦${Number(item.unitPrice).toLocaleString()}
                        </td>
                        <td style="text-align: right; font-size: 13px; color: #666;">
                            <strong>Total:</strong> ₦${Number(item.total).toLocaleString()}
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    `).join('');

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Invoice #${invoiceId} - ${BRAND_NAME}</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #f5f7fa;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f5f7fa;">
                <tr>
                    <td style="padding: 40px 20px;">
                        <table width="100%" max-width="600px" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                            
                            <!-- Header with Logo/Brand -->
                            <tr>
                                <td style="background: linear-gradient(135deg, ${BRAND_COLOR} 0%, #1565c0 100%); padding: 40px 30px; text-align: center; color: white;">
                                    <h1 style="margin: 0; font-size: 32px; font-weight: bold; letter-spacing: -0.5px;">Invoice</h1>
                                    <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.9;">From ${BRAND_NAME}</p>
                                </td>
                            </tr>

                            <!-- Invoice Details Header -->
                            <tr>
                                <td style="padding: 30px; background-color: #fafbfc; border-bottom: 1px solid #eee;">
                                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                        <tr>
                                            <td>
                                                <p style="margin: 0 0 8px 0; font-size: 12px; color: #999; text-transform: uppercase; font-weight: 600;">Invoice ID</p>
                                                <p style="margin: 0; font-size: 16px; color: #333; font-weight: bold;">#${invoiceId}</p>
                                            </td>
                                            <td style="text-align: right;">
                                                <p style="margin: 0 0 8px 0; font-size: 12px; color: #999; text-transform: uppercase; font-weight: 600;">Status</p>
                                                <p style="margin: 0; font-size: 16px; color: #ff9800; font-weight: bold;">PENDING</p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>

                            <!-- Customer Info -->
                            <tr>
                                <td style="padding: 30px;">
                                    <p style="margin: 0 0 20px 0; font-size: 14px; color: #333;">
                                        <strong style="display: block; margin-bottom: 4px; color: #999; font-size: 12px; text-transform: uppercase;">Bill To</strong>
                                        <span style="font-size: 16px; font-weight: 600;">${clientName}</span>
                                    </p>

                                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 20px;">
                                        <tr>
                                            <td style="width: 50%;">
                                                <p style="margin: 0 0 4px 0; font-size: 12px; color: #999; text-transform: uppercase; font-weight: 600;">Due Date</p>
                                                <p style="margin: 0; font-size: 14px; color: #333; font-weight: 600;">${dueDateFormatted}</p>
                                            </td>
                                        </tr>
                                    </table>

                                    ${description ? `
                                    <div style="background-color: #f0f7ff; padding: 12px 16px; border-radius: 4px; border-left: 3px solid ${BRAND_COLOR};">
                                        <p style="margin: 0; font-size: 13px; color: #1565c0;">
                                            <strong>Description:</strong> ${description}
                                        </p>
                                    </div>
                                    ` : ''}
                                </td>
                            </tr>

                            <!-- Items Breakdown -->
                            <tr>
                                <td style="padding: 30px;">
                                    <h3 style="margin: 0 0 20px 0; font-size: 14px; color: #333; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Items Breakdown</h3>
                                    
                                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                        ${itemsHTML}
                                    </table>
                                </td>
                            </tr>

                            <!-- Divider -->
                            <tr>
                                <td style="padding: 0 30px;">
                                    <div style="height: 1px; background-color: #eee;"></div>
                                </td>
                            </tr>

                            <!-- Total Amount -->
                            <tr>
                                <td style="padding: 30px;">
                                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                        <tr>
                                            <td style="font-size: 14px; color: #666;">
                                                <strong>TOTAL AMOUNT</strong>
                                            </td>
                                            <td style="text-align: right; font-size: 28px; color: ${BRAND_COLOR}; font-weight: bold;">
                                                ₦${Number(calculatedAmount).toLocaleString()}
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>

                            <!-- CTA Section -->
                            <tr>
                                <td style="padding: 30px; background-color: #f8f9fa; text-align: center;">
                                    <a href="https://finvo.app/invoice/${invoiceId}" style="display: inline-block; background-color: ${BRAND_COLOR}; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; transition: background-color 0.3s ease;">
                                        View Full Invoice
                                    </a>
                                </td>
                            </tr>

                            <!-- Footer -->
                            <tr>
                                <td style="padding: 25px 30px; background-color: #fafbfc; border-top: 1px solid #eee; text-align: center;">
                                    <p style="margin: 0; font-size: 12px; color: #999; line-height: 1.6;">
                                        Please make payment at your earliest convenience.<br>
                                        If you have any questions, please contact us.
                                    </p>
                                    <p style="margin: 15px 0 0 0; font-size: 11px; color: #bbb;">
                                        &copy; 2026 ${BRAND_NAME}. All rights reserved.
                                    </p>
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
