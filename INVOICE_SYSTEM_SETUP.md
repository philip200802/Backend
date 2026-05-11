# Invoice Management System - Complete Setup Guide

## ✅ Backend Implementation Complete

### 1. **Database Schema** (`Models/finvoInvoice.model.js`)

```javascript
Invoice Schema includes:
- clientName (String, required)
- amount (Number, required) - Calculated from items
- status (String: Pending, Paid, Overdue)
- owner (ObjectId, ref 'user', required) - Links to user who created it
- items (Array of objects):
  - description (String, required)
  - qty (Number, required)
  - unitPrice (Number, required)
  - total (Number) - Calculated
- amountPaid (Number, default: 0)
- amountDue (Number, default: amount)
- paymentHistory (Array):
  - amountPaid (Number)
  - paymentDate (Date, default: now)
  - paymentMethod (String)
  - notes (String)
- dueDate (Date)
- description (String)
- timestamps (createdAt, updatedAt)
```

### 2. **Environment Variables** (`.env`)

```env
PORT=2008
MONGO_URI=mongodb://...
Email_passkey=wukf wlew uoaw zecu
Email_user=adegboyegaphilip6@gmail.com
JWT_SECRET=f3bbd93072e82be6f25d3ccd97f925a4c015429f2ca545525b9b0cad4aea2bb037a35269d3b282826403dc80326b3107c502a0c6aaf08607b264c0440efb9480
```

**Note:** No spaces around `=` signs in .env

### 3. **API Endpoints**

#### **POST /invoice/create** - Create Invoice
```json
Headers:
{
  "Authorization": "Bearer {token}"
}

Body:
{
  "clientName": "John Doe",
  "dueDate": "2025-12-31",
  "description": "Project invoice",
  "clientEmail": "john@example.com",
  "items": [
    {
      "description": "Web Development",
      "qty": 10,
      "unitPrice": 5000
    }
  ]
}

Response:
{
  "message": "Invoice created successfully",
  "invoiceId": "...",
  "amount": 50000
}
```

**Features:**
- ✅ JWT authentication required
- ✅ Validates items (description required, qty > 0, unitPrice > 0)
- ✅ Calculates total amount from items (trusts server, not frontend)
- ✅ Sends email to both client and admin
- ✅ Only owner can create

---

#### **GET /invoice/all** - Get All Invoices
```json
Headers:
{
  "Authorization": "Bearer {token}"
}

Response:
{
  "message": "Invoices retrieved successfully",
  "count": 5,
  "invoices": [
    {
      "_id": "...",
      "clientName": "John Doe",
      "amount": 50000,
      "status": "Pending",
      "amountPaid": 0,
      "amountDue": 50000,
      "items": [...],
      "owner": {...}
    }
  ]
}
```

**Features:**
- ✅ Returns only invoices belonging to logged-in user
- ✅ Sorted by most recent first
- ✅ Includes owner information

---

#### **GET /invoice/:id** - Get Single Invoice
```json
Headers:
{
  "Authorization": "Bearer {token}"
}

Response:
{
  "message": "Invoice retrieved successfully",
  "invoice": {...}
}
```

**Features:**
- ✅ Ownership verification
- ✅ Returns full invoice with items and payment history

---

#### **PUT /invoice/:id** - Update Invoice
```json
Headers:
{
  "Authorization": "Bearer {token}"
}

Body:
{
  "clientName": "Updated Name",
  "dueDate": "2025-12-31",
  "description": "Updated description",
  "items": [
    {
      "description": "New item",
      "qty": 5,
      "unitPrice": 2000
    }
  ]
}

Response:
{
  "message": "Invoice updated successfully",
  "invoice": {...}
}
```

**Features:**
- ✅ Ownership verification
- ✅ Recalculates amount if items updated
- ✅ Cannot update paid invoices
- ✅ Input validation

---

#### **DELETE /invoice/:id** - Delete Invoice
```json
Headers:
{
  "Authorization": "Bearer {token}"
}

Response:
{
  "message": "Invoice deleted successfully",
  "invoice": {...}
}
```

**Features:**
- ✅ Ownership verification
- ✅ Cannot delete paid invoices

---

#### **POST /invoice/:id/payment** - Record Payment
```json
Headers:
{
  "Authorization": "Bearer {token}"
}

Body:
{
  "amountPaid": 10000,
  "paymentMethod": "Bank Transfer",
  "notes": "Partial payment"
}

Response:
{
  "message": "Payment recorded successfully",
  "invoice": {...},
  "paymentSummary": {
    "amountPaid": 10000,
    "amountDue": 40000,
    "status": "Pending"
  }
}
```

**Features:**
- ✅ Ownership verification
- ✅ Validates payment amount (> 0)
- ✅ Ensures payment doesn't exceed amountDue
- ✅ Prevents payment if already fully paid
- ✅ Auto-updates status:
  - If amountDue ≤ 0 → "Paid"
  - If still owing → "Pending"
  - Preserves "Overdue" if status was Overdue

---

#### **GET /invoice/:id/payments** - Get Payment History
```json
Headers:
{
  "Authorization": "Bearer {token}"
}

Response:
{
  "message": "Payment history retrieved successfully",
  "invoiceId": "...",
  "clientName": "John Doe",
  "totalAmount": 50000,
  "amountPaid": 10000,
  "amountDue": 40000,
  "paymentHistory": [
    {
      "amountPaid": 10000,
      "paymentDate": "2025-01-15T10:30:00Z",
      "paymentMethod": "Bank Transfer",
      "notes": "Partial payment"
    }
  ]
}
```

**Features:**
- ✅ Ownership verification
- ✅ Shows complete payment history with dates
- ✅ Shows current payment status

---

### 4. **Security Features**

- ✅ **JWT Authentication:** All endpoints require valid JWT token
- ✅ **Ownership Verification:** Users can only see/modify their own invoices
- ✅ **Input Validation:** All inputs are validated before processing
- ✅ **Server-Side Calculations:** Amount calculated from items, not trusted from frontend
- ✅ **Payment Validation:** Cannot pay more than owed

---

### 5. **Email Notifications**

**On Invoice Creation:**
- ✅ Email sent to client with invoice details
- ✅ Email sent to admin with notification
- ✅ Emails sent asynchronously (don't block response)

**Environment Variables Required:**
- `Email_user`: Gmail address
- `Email_passkey`: 16-character Gmail app password (not regular password)

**To Generate Gmail App Password:**
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Windows Computer"
3. Generate and copy the 16-character password
4. Add to `.env` as `Email_passkey`

---

### 6. **Frontend Integration Examples**

#### Creating an Invoice
```javascript
const createInvoice = async (formData) => {
  const response = await fetch('/invoice/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(formData)
  });
  
  const data = await response.json();
  return data;
};

// Usage
createInvoice({
  clientName: 'Acme Corp',
  dueDate: '2025-12-31',
  description: 'Q4 Services',
  clientEmail: 'contact@acme.com',
  items: [
    { description: 'Web Dev', qty: 40, unitPrice: 5000 },
    { description: 'Hosting', qty: 1, unitPrice: 10000 }
  ]
});
```

#### Fetching All Invoices
```javascript
const fetchInvoices = async () => {
  const response = await fetch('/invoice/all', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  return data.invoices;
};
```

#### Recording Payment
```javascript
const recordPayment = async (invoiceId, paymentData) => {
  const response = await fetch(`/invoice/${invoiceId}/payment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(paymentData)
  });
  
  return await response.json();
};

// Usage
recordPayment(invoiceId, {
  amountPaid: 25000,
  paymentMethod: 'Credit Card',
  notes: 'Payment for partial invoice'
});
```

---

### 7. **Testing Checklist**

- [ ] Create invoice with multiple items
- [ ] Verify amount calculated correctly from items
- [ ] Check email sent to client
- [ ] Check email sent to admin
- [ ] Fetch invoices (should only show own invoices)
- [ ] Record partial payment
- [ ] Record full payment (status should change to "Paid")
- [ ] Verify payment history shows all transactions
- [ ] Try to update a paid invoice (should fail)
- [ ] Try to delete a paid invoice (should fail)
- [ ] Try to access another user's invoice (should fail with 403)

---

### 8. **Deployment Notes**

**Before deploying to Onrender:**

1. **Push all changes to Git:**
   ```bash
   git add .
   git commit -m "Complete invoice system implementation"
   git push
   ```

2. **Update Environment Variables on Onrender:**
   - Go to your Onrender dashboard
   - Add/update these variables with NO spaces around `=`:
     ```
     Email_passkey=wukf wlew uoaw zecu
     Email_user=adegboyegaphilip6@gmail.com
     JWT_SECRET=f3bbd93072e82be6f25d3ccd97f925a4c015429f2ca545525b9b0cad4aea2bb037a35269d3b282826403dc80326b3107c502a0c6aaf08607b264c0440efb9480
     ```

3. **Manual redeploy (if needed):**
   - Onrender usually auto-deploys on push
   - If not, manually trigger redeploy from dashboard

4. **Test after deployment:**
   - Create test invoice
   - Verify email sent
   - Record payment
   - Check all endpoints working

---

### 9. **Error Handling**

All endpoints return proper HTTP status codes:

- `200 OK` - Successful GET/update operations
- `201 Created` - Successful POST operations
- `400 Bad Request` - Invalid input/validation failed
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - User doesn't own the resource
- `404 Not Found` - Resource doesn't exist
- `500 Internal Server Error` - Server error

Response format:
```json
{
  "message": "Human-readable message",
  "error": "Error details (if applicable)",
  "invoice": {...} // Included in relevant responses
}
```

---

## 🎉 System is Ready!

Your invoice management system now has:
- ✅ Complete CRUD operations
- ✅ Payment tracking with history
- ✅ JWT authentication & authorization
- ✅ Item-based invoicing with calculations
- ✅ Email notifications
- ✅ Proper error handling
- ✅ Input validation

Happy invoicing! 🚀
