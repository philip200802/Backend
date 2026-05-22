const BRAND_COLOR = '#1e88e5';
const BRAND_NAME = 'Finvo';

/**
 * Generate professional invoice email HTML for client
 * Shows complete itemization with qty, unit price, and totals
 */
const clientInvoiceEmail = (clientName, invoiceId, description, items, calculatedAmount, dueDate) => {
    // Format items into table rows
    const itemsHTML = items.map((item, index) => `
        <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 12px; text-align: center; color: #666; font-size: 14px;">${index + 1}</td>
            <td style="padding: 12px; color: #333; font-size: 14px;">${item.description}</td>
            <td style="padding: 12px; text-align: center; color: #666; font-size: 14px;">${item.qty}</td>
            <td style="padding: 12px; text-align: right; color: #666; font-size: 14px;">₦${item.unitPrice.toLocaleString()}</td>
            <td style="padding: 12px; text-align: right; color: #333; font-weight: bold; font-size: 14px;">₦${item.total.toLocaleString()}</td>
        </tr>
    `).join('');

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 0; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden;">
                
                <!-- HEADER -->
                <div style="background: linear-gradient(135deg, ${BRAND_COLOR} 0%, #1565c0 100%); padding: 30px; text-align: center; color: white;">
                    <h1 style="margin: 0; font-size: 28px; font-weight: bold;">📄 INVOICE</h1>
                    <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.9;">Payment Required</p>
                </div>

                <!-- CONTENT -->
                <div style="padding: 30px;">
                    
                    <!-- Greeting -->
                    <p style="margin: 0 0 20px 0; font-size: 16px; color: #333;">
                        Hi <strong>${clientName}</strong>,
                    </p>

                    <!-- Invoice ID & Status -->
                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin-bottom: 25px; border-left: 4px solid ${BRAND_COLOR};">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px 0; font-size: 13px; color: #666;">
                                    <strong>Invoice ID:</strong> #${invoiceId}
                                </td>
                                <td style="padding: 8px 0; text-align: right; font-size: 13px; color: #666;">
                                    <strong>Date:</strong> ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; font-size: 13px; color: #666;">
                                    <strong>Status:</strong> <span style="color: #ff9800; font-weight: bold;">PENDING</span>
                                </td>
                                <td style="padding: 8px 0; text-align: right; font-size: 13px; color: #666;">
                                    <strong>Due Date:</strong> ${dueDate ? new Date(dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Not specified'}
                                </td>
                            </tr>
                        </table>
                    </div>

                    <!-- Description (if provided) -->
                    ${description ? `
                    <div style="background-color: #e3f2fd; padding: 15px; border-radius: 6px; margin-bottom: 25px; border-left: 4px solid #2196f3;">
                        <p style="margin: 0; font-size: 14px; color: #1976d2;">
                            <strong>📝 Description:</strong> ${description}
                        </p>
                    </div>
                    ` : ''}

                    <!-- ITEMS LIST -->
                    <div style="margin-bottom: 25px;">
                        <h3 style="margin: 0 0 15px 0; font-size: 16px; color: #333; border-bottom: 2px solid ${BRAND_COLOR}; padding-bottom: 10px;">
                            📦 Items Purchased
                        </h3>
                        ${items.map((item, index) => `
                            <div style="padding: 15px; margin-bottom: 12px; background-color: #fafafa; border-left: 4px solid ${BRAND_COLOR}; border-radius: 4px;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                    <h4 style="margin: 0; font-size: 15px; color: #333; font-weight: bold;">
                                        ${index + 1}. ${item.description}
                                    </h4>
                                </div>
                                <div style="display: flex; justify-content: space-between; font-size: 13px; color: #666; margin-bottom: 6px;">
                                    <span><strong>Quantity:</strong> ${item.qty}</span>
                                    <span><strong>Unit Price:</strong> ₦${item.unitPrice.toLocaleString()}</span>
                                </div>
                                <div style="text-align: right; padding-top: 8px; border-top: 1px solid #ddd; font-size: 14px;">
                                    <strong style="color: ${BRAND_COLOR}; font-size: 16px;">Total: ₦${item.total.toLocaleString()}</strong>
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <!-- TOTAL AMOUNT -->
                    <div style="background-color: ${BRAND_COLOR}; padding: 20px; border-radius: 6px; text-align: right; margin-bottom: 25px;">
                        <p style="margin: 0; font-size: 14px; color: white; opacity: 0.9;">Total Amount Due</p>
                        <h2 style="margin: 8px 0 0 0; font-size: 32px; color: white; font-weight: bold;">
                            ₦${calculatedAmount.toLocaleString()}
                        </h2>
                    </div>

                    <!-- CALL TO ACTION -->
                    <div style="background-color: #f0f7ff; padding: 20px; border-radius: 6px; text-align: center; margin-bottom: 25px; border: 1px solid #b3e5fc;">
                        <p style="margin: 0 0 12px 0; font-size: 14px; color: #333; font-weight: bold;">
                            Please make payment as soon as possible
                        </p>
                        <p style="margin: 0; font-size: 13px; color: #666;">
                            If you have any questions or need an invoice adjustment, please contact us.
                        </p>
                    </div>

                    <!-- FOOTER -->
                    <div style="border-top: 1px solid #eee; padding-top: 15px; text-align: center;">
                        <p style="margin: 0 0 8px 0; font-size: 12px; color: #999;">
                            Thank you for your business!
                        </p>
                        <p style="margin: 0; font-size: 11px; color: #bbb;">
                            &copy; 2026 ${BRAND_NAME}. All rights reserved.
                        </p>
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
