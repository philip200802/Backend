// Email Templates for Finvo
const BRAND_COLOR = '#1e88e5';
const BRAND_NAME = 'Finvo';

/**
 * Client Invoice Email Template
 */
const clientEmailTemplate = (clientName, invoiceId, description, items, calculatedAmount, dueDate) => {
    const itemsHTML = items.map(item => `
        <tr>
            <td style="padding: 12px 10px; border-bottom: 1px solid #eee; font-size: 14px;">
                ${item.description}
            </td>
            <td style="padding: 12px 10px; border-bottom: 1px solid #eee; text-align: center; font-size: 14px;">
                ${item.qty}
            </td>
            <td style="padding: 12px 10px; border-bottom: 1px solid #eee; text-align: right; font-size: 14px;">
                ₦${item.unitPrice.toLocaleString()}
            </td>
            <td style="padding: 12px 10px; border-bottom: 1px solid #eee; text-align: right; font-size: 14px; font-weight: bold;">
                ₦${item.total.toLocaleString()}
            </td>
        </tr>
    `).join('');

    const dueDateFormatted = dueDate ? new Date(dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Not specified';

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Invoice Created - ${BRAND_NAME}</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f6f8;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f6f8;">
                <tr>
                    <td align="center" style="padding: 40px 20px;">
                        <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                            
                            <!-- Header -->
                            <tr>
                                <td style="background-color: ${BRAND_COLOR}; padding: 40px 30px; text-align: center; color: #ffffff;">
                                    <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Invoice Created</h1>
                                    <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Invoice #${invoiceId}</p>
                                </td>
                            </tr>

                            <!-- Content -->
                            <tr>
                                <td style="padding: 40px 30px;">
                                    <p style="margin: 0 0 20px 0; font-size: 16px; color: #333;">Hi <strong>${clientName}</strong>,</p>
                                    
                                    <p style="margin: 0 0 30px 0; font-size: 14px; color: #666; line-height: 1.6;">
                                        We've created a new invoice for you. Please find the details below. Thank you for your business!
                                    </p>

                                    ${description ? `
                                    <div style="background-color: #f8f9fb; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                                        <p style="margin: 0; font-size: 13px; color: #666;"><strong>Description:</strong> ${description}</p>
                                    </div>
                                    ` : ''}

                                    <!-- Items Table -->
                                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 20px 0;">
                                        <tr style="background-color: #f8f9fb; border-bottom: 2px solid #e0e0e0;">
                                            <th style="padding: 12px 10px; text-align: left; font-size: 12px; font-weight: 600; color: #333; text-transform: uppercase; letter-spacing: 0.5px;">Item</th>
                                            <th style="padding: 12px 10px; text-align: center; font-size: 12px; font-weight: 600; color: #333; text-transform: uppercase; letter-spacing: 0.5px;">Qty</th>
                                            <th style="padding: 12px 10px; text-align: right; font-size: 12px; font-weight: 600; color: #333; text-transform: uppercase; letter-spacing: 0.5px;">Unit Price</th>
                                            <th style="padding: 12px 10px; text-align: right; font-size: 12px; font-weight: 600; color: #333; text-transform: uppercase; letter-spacing: 0.5px;">Total</th>
                                        </tr>
                                        ${itemsHTML}
                                        <tr style="background-color: #f8f9fb;">
                                            <td colspan="3" style="padding: 15px 10px; text-align: right; font-size: 14px; font-weight: 600; color: #333;">Total Amount:</td>
                                            <td style="padding: 15px 10px; text-align: right; font-size: 16px; font-weight: bold; color: ${BRAND_COLOR};">₦${calculatedAmount.toLocaleString()}</td>
                                        </tr>
                                    </table>

                                    <!-- Invoice Details -->
                                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 30px 0;">
                                        <tr>
                                            <td style="width: 50%; padding: 10px 0;">
                                                <p style="margin: 0 0 5px 0; font-size: 12px; color: #999; text-transform: uppercase;">Due Date</p>
                                                <p style="margin: 0; font-size: 14px; color: #333; font-weight: 600;">${dueDateFormatted}</p>
                                            </td>
                                            <td style="width: 50%; padding: 10px 0;">
                                                <p style="margin: 0 0 5px 0; font-size: 12px; color: #999; text-transform: uppercase;">Status</p>
                                                <p style="margin: 0; font-size: 14px; color: #ff9800; font-weight: 600;">Pending</p>
                                            </td>
                                        </tr>
                                    </table>

                                    <!-- CTA Button -->
                                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 30px 0;">
                                        <tr>
                                            <td align="center">
                                                <a href="https://finvo.app/invoice/${invoiceId}" style="display: inline-block; background-color: ${BRAND_COLOR}; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">
                                                    View Invoice
                                                </a>
                                            </td>
                                        </tr>
                                    </table>

                                    <p style="margin: 30px 0 0 0; font-size: 13px; color: #999; line-height: 1.6;">
                                        Please make payment at your earliest convenience. If you have any questions, feel free to contact us.
                                    </p>
                                </td>
                            </tr>

                            <!-- Footer -->
                            <tr>
                                <td style="background-color: #f8f9fb; padding: 20px 30px; text-align: center; border-top: 1px solid #eee;">
                                    <p style="margin: 0; font-size: 12px; color: #999;">
                                        &copy; 2026 ${BRAND_NAME}. All rights reserved.
                                    </p>
                                    <p style="margin: 5px 0 0 0; font-size: 11px; color: #bbb;">
                                        You're receiving this email because you have an invoice with ${BRAND_NAME}.
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

/**
 * Admin Invoice Notification Email Template
 */
const adminEmailTemplate = (clientName, invoiceId, calculatedAmount, itemCount, dueDate, ownerEmail) => {
    const dueDateFormatted = dueDate ? new Date(dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Not specified';

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Invoice Created - ${BRAND_NAME}</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f6f8;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f6f8;">
                <tr>
                    <td align="center" style="padding: 40px 20px;">
                        <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                            
                            <!-- Header -->
                            <tr>
                                <td style="background-color: ${BRAND_COLOR}; padding: 40px 30px; text-align: center; color: #ffffff;">
                                    <h1 style="margin: 0; font-size: 28px; font-weight: bold;">New Invoice Created</h1>
                                    <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">${BRAND_NAME} Admin Notification</p>
                                </td>
                            </tr>

                            <!-- Content -->
                            <tr>
                                <td style="padding: 40px 30px;">
                                    <p style="margin: 0 0 20px 0; font-size: 14px; color: #666;">A new invoice has been created in your ${BRAND_NAME} account.</p>

                                    <!-- Invoice Details Box -->
                                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8f9fb; border-left: 4px solid ${BRAND_COLOR}; margin: 20px 0; border-radius: 4px;">
                                        <tr>
                                            <td style="padding: 20px;">
                                                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                                    <tr>
                                                        <td style="padding: 8px 0;">
                                                            <p style="margin: 0; font-size: 12px; color: #999; text-transform: uppercase;">Invoice ID</p>
                                                            <p style="margin: 3px 0; font-size: 14px; color: #333; font-weight: 600;">#${invoiceId}</p>
                                                        </td>
                                                        <td style="padding: 8px 0; text-align: right;">
                                                            <p style="margin: 0; font-size: 12px; color: #999; text-transform: uppercase;">Amount</p>
                                                            <p style="margin: 3px 0; font-size: 16px; color: ${BRAND_COLOR}; font-weight: bold;">₦${calculatedAmount.toLocaleString()}</p>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 0 20px; border-top: 1px solid #e0e0e0;">
                                                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                                    <tr>
                                                        <td style="padding: 12px 0;">
                                                            <p style="margin: 0 0 5px 0; font-size: 12px; color: #999; text-transform: uppercase;">Client</p>
                                                            <p style="margin: 0; font-size: 14px; color: #333; font-weight: 600;">${clientName}</p>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding: 12px 0;">
                                                            <p style="margin: 0 0 5px 0; font-size: 12px; color: #999; text-transform: uppercase;">Items</p>
                                                            <p style="margin: 0; font-size: 14px; color: #333; font-weight: 600;">${itemCount} item${itemCount !== 1 ? 's' : ''}</p>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding: 12px 0;">
                                                            <p style="margin: 0 0 5px 0; font-size: 12px; color: #999; text-transform: uppercase;">Due Date</p>
                                                            <p style="margin: 0; font-size: 14px; color: #333; font-weight: 600;">${dueDateFormatted}</p>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>

                                    <!-- CTA Button -->
                                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 30px 0;">
                                        <tr>
                                            <td align="center">
                                                <a href="https://finvo.app/dashboard/invoices/${invoiceId}" style="display: inline-block; background-color: ${BRAND_COLOR}; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">
                                                    View in Dashboard
                                                </a>
                                            </td>
                                        </tr>
                                    </table>

                                </td>
                            </tr>

                            <!-- Footer -->
                            <tr>
                                <td style="background-color: #f8f9fb; padding: 20px 30px; text-align: center; border-top: 1px solid #eee;">
                                    <p style="margin: 0; font-size: 12px; color: #999;">
                                        &copy; 2026 ${BRAND_NAME}. All rights reserved.
                                    </p>
                                    <p style="margin: 5px 0 0 0; font-size: 11px; color: #bbb;">
                                        This is an automated notification from your ${BRAND_NAME} account.
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
    clientEmailTemplate,
    adminEmailTemplate
};
