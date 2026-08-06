const BRAND_NAME = "Finvo";
const BRAND_COLOR = "#5E4A7A";
const BRAND_ACCENT = "#B8956A";
const SUPPORT_EMAIL = "adegboyegaphilip6@gmail.com";

const formatCurrency = (value) => {
    const amount = Number(value);

    if (!Number.isFinite(amount)) {
        return "0.00";
    }

    return amount.toLocaleString("en-NG", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

const clientInvoiceEmail = (
    clientName,
    invoiceId,
    description,
    items,
    calculatedAmount,
    dueDate
) => {

    const invoiceDate = new Date().toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    const dueDateFormatted = dueDate
        ? new Date(dueDate).toLocaleDateString("en-US", {
            day: "numeric",
            month: "long",
            year: "numeric",
        })
        : "Not specified";

    const taxRate = 0.1;

    const totalAmount = Number(calculatedAmount) || 0;

    const subtotal = totalAmount / (1 + taxRate);

    const tax = totalAmount - subtotal;

    const safeItems = Array.isArray(items) ? items : [];

    const itemsHTML =
        safeItems.length > 0
            ? safeItems
                .map(
                    (item) => `
<tr>
<td style="padding:14px;border-bottom:1px solid #eee;">
${item.description || ""}
</td>

<td align="center" style="padding:14px;border-bottom:1px solid #eee;">
${Number(item.qty) || 0}
</td>

<td align="right" style="padding:14px;border-bottom:1px solid #eee;">
₦${formatCurrency(item.unitPrice)}
</td>

<td align="right" style="padding:14px;border-bottom:1px solid #eee;font-weight:bold;">
₦${formatCurrency(item.total)}
</td>
</tr>
`
                )
                .join("")
            : `
<tr>
<td colspan="4"
style="padding:25px;text-align:center;color:#888;">
No invoice items available.
</td>
</tr>
`;

    return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Invoice #${invoiceId}</title>
</head>

<body style="
margin:0;
padding:30px;
background:#f5f7fb;
font-family:Arial,Helvetica,sans-serif;
">

<table
width="100%"
cellpadding="0"
cellspacing="0"
style="
max-width:800px;
margin:auto;
background:#ffffff;
border-radius:12px;
overflow:hidden;
box-shadow:0 8px 30px rgba(0,0,0,.08);
">

<tr>

<td
style="
background:${BRAND_COLOR};
padding:40px;
text-align:center;
color:white;
">

<h1 style="margin:0;font-size:34px;">
${BRAND_NAME}
</h1>

<p style="
margin-top:10px;
font-size:15px;
opacity:.9;
">
Professional Invoice Management
</p>

</td>

</tr>

<tr>

<td style="padding:40px;">

<h2 style="margin:0;color:#333;font-size:26px;">
Hi ${clientName},
</h2>

<p style="
margin:18px 0 28px;
font-size:15px;
line-height:26px;
color:#666;
">
Thank you for choosing <strong>${BRAND_NAME}</strong>.

Your invoice has been generated successfully.
Please review the details below and complete payment before the due date.
</p>

<table
width="100%"
cellpadding="0"
cellspacing="0"
style="
background:#f8f9fc;
border:1px solid #ececec;
border-radius:10px;
margin-bottom:35px;
">

<tr>

<td style="padding:20px;width:33%;">

<div style="font-size:12px;color:#888;">
Invoice No
</div>

<div style="
font-size:18px;
font-weight:bold;
margin-top:6px;
color:${BRAND_COLOR};
">
#${invoiceId}
</div>

</td>

<td style="padding:20px;width:33%;">

<div style="font-size:12px;color:#888;">
Invoice Date
</div>

<div style="
font-size:16px;
font-weight:bold;
margin-top:6px;
">
${invoiceDate}
</div>

</td>

<td style="padding:20px;width:33%;">

<div style="font-size:12px;color:#888;">
Due Date
</div>

<div style="
font-size:16px;
font-weight:bold;
margin-top:6px;
color:#d97706;
">
${dueDateFormatted}
</div>

</td>

</tr>

</table>

<h3 style="
margin:0 0 12px;
color:${BRAND_COLOR};
">
Invoice To
</h3>

<div style="
background:#fafafa;
padding:20px;
border-left:5px solid ${BRAND_COLOR};
margin-bottom:35px;
">

<div style="
font-size:20px;
font-weight:bold;
color:#333;
">
${clientName}
</div>

${description
            ?
            `
<p style="
margin-top:12px;
font-size:14px;
line-height:24px;
color:#666;
">
${description}
</p>
`
            :
            ""
        }

</div>

<h3 style="
margin-bottom:15px;
color:${BRAND_COLOR};
">
Invoice Items
</h3>

<table
width="100%"
cellpadding="0"
cellspacing="0"
style="
border-collapse:collapse;
margin-bottom:35px;
">

<tr style="
background:${BRAND_COLOR};
color:white;
">

<th align="left" style="padding:14px;">
Description
</th>

<th align="center" style="padding:14px;">
Qty
</th>

<th align="right" style="padding:14px;">
Unit Price
</th>

<th align="right" style="padding:14px;">
Total
</th>

</tr>

${itemsHTML}
</table>

<table
width="100%"
cellpadding="0"
cellspacing="0"
style="margin-bottom:35px;">

<tr>

<td width="60%"></td>

<td width="40%">

<table
width="100%"
cellpadding="8"
cellspacing="0"
style="border-collapse:collapse;">

<tr>

<td align="right"
style="color:#666;">
Subtotal
</td>

<td align="right">
₦${formatCurrency(subtotal)}
</td>

</tr>

<tr>

<td align="right"
style="color:#666;">
Tax (10%)
</td>

<td align="right">
₦${formatCurrency(tax)}
</td>

</tr>

<tr>

<td
align="right"
style="
padding:16px;
background:${BRAND_COLOR};
color:white;
font-size:18px;
font-weight:bold;
">
Total
</td>

<td
align="right"
style="
padding:16px;
background:${BRAND_COLOR};
color:white;
font-size:20px;
font-weight:bold;
">
₦${formatCurrency(totalAmount)}
</td>

</tr>

</table>

</td>

</tr>

</table>

<div style="
background:#eef6ff;
border-left:5px solid ${BRAND_COLOR};
padding:20px;
margin-bottom:30px;
border-radius:6px;
">

<h3 style="
margin:0 0 12px;
color:${BRAND_COLOR};
">
Payment Reminder
</h3>

<p style="
margin:0;
font-size:14px;
line-height:24px;
color:#555;
">

Please make payment on or before
<strong>${dueDateFormatted}</strong>.

If payment has already been made, kindly ignore this email.

</p>

</div>

<div style="
background:#fafafa;
padding:20px;
border-radius:8px;
margin-bottom:35px;
">

<h3 style="
margin-top:0;
color:${BRAND_COLOR};
">
Need Help?
</h3>

<p style="
font-size:14px;
line-height:24px;
color:#666;
margin:0;
">

If you have any questions regarding this invoice,
please contact us anytime.

</p>

<p style="
margin-top:12px;
font-size:15px;
">

${SUPPORT_EMAIL}

</p>

</div>

<p style="
font-size:15px;
line-height:26px;
color:#666;
">

Thank you for choosing
<strong>${BRAND_NAME}</strong>.

We appreciate your business and look forward to serving you again.

</p>

</td>

</tr>

<tr>

<td
style="
background:#f8f8f8;
padding:30px;
text-align:center;
border-top:1px solid #ececec;
">

<h3 style="
margin:0;
color:${BRAND_COLOR};
">
${BRAND_NAME}
</h3>

<p style="
margin:10px 0;
color:#777;
font-size:14px;
">
Professional Invoice Management
</p>

<p style="
margin:0;
font-size:12px;
color:#999;
">
© ${new Date().getFullYear()} ${BRAND_NAME}. All rights reserved.
</p>

</td>

</tr>

</table>

</body>

</html>

`;
};
const paymentReceivedEmail = (
    clientName,
    invoiceId,
    amountPaid
) => {

    return `
<!DOCTYPE html>

<html>

<body style="font-family:Arial;background:#f5f5f5;padding:40px;">

<table
width="600"
align="center"
style="
background:white;
border-radius:10px;
padding:40px;
">

<tr>

<td align="center">

<h1 style="color:#28a745;">
Payment Received
</h1>

</td>

</tr>

<tr>

<td>

<p>Hi <strong>${clientName}</strong>,</p>

<p>

We have successfully received your payment.

Thank you for your prompt payment.

</p>

<table
width="100%"
style="
margin:30px 0;
border-collapse:collapse;
">

<tr>

<td><strong>Invoice</strong></td>

<td>#${invoiceId}</td>

</tr>

<tr>

<td><strong>Amount Paid</strong></td>

<td>₦${Number(amountPaid).toLocaleString()}</td>

</tr>

<tr>

<td><strong>Status</strong></td>

<td style="color:green;">
PAID
</td>

</tr>

</table>

<div
style="
background:#EAF9EF;
padding:20px;
border-left:5px solid #28a745;
">

Your invoice has now been marked as fully paid.

</div>

<p style="margin-top:30px;">

Thank you for doing business with <strong>Finvo</strong>.

</p>

</td>

</tr>

</table>

</body>

</html>
`;

};

module.exports = {
    clientInvoiceEmail,
    paymentReceivedEmail
};

