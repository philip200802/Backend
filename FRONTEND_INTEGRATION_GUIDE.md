# Frontend Integration Guide - Invoice System

## Sample React Components

### 1. **InvoiceList.jsx** - Display All Invoices

```jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const InvoiceList = ({ token }) => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            const response = await fetch('http://localhost:2008/invoice/all', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch invoices');

            const data = await response.json();
            setInvoices(data.invoices);
        } catch (err) {
            console.error('Error:', err);
            alert('Failed to load invoices');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Paid':
                return '#4caf50'; // Green
            case 'Pending':
                return '#ff9800'; // Orange
            case 'Overdue':
                return '#f44336'; // Red
            default:
                return '#9e9e9e'; // Gray
        }
    };

    const deleteInvoice = async (id) => {
        if (!window.confirm('Are you sure you want to delete this invoice?')) return;

        try {
            const response = await fetch(`http://localhost:2008/invoice/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to delete invoice');

            setInvoices(invoices.filter(inv => inv._id !== id));
            alert('Invoice deleted successfully');
        } catch (err) {
            console.error('Error:', err);
            alert(err.message);
        }
    };

    if (loading) return <p>Loading invoices...</p>;

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>My Invoices ({invoices.length})</h2>
                <button 
                    onClick={() => navigate('/create-invoice')}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#1e88e5',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    + Create Invoice
                </button>
            </div>

            {invoices.length === 0 ? (
                <p>No invoices yet. Create one to get started!</p>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Client Name</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Amount</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Paid</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Due</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Due Date</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map(invoice => (
                                <tr key={invoice._id} style={{ borderBottom: '1px solid #ddd' }}>
                                    <td style={{ padding: '12px' }}>
                                        <a href={`/invoice/${invoice._id}`} style={{ color: '#1e88e5', textDecoration: 'none' }}>
                                            {invoice.clientName}
                                        </a>
                                    </td>
                                    <td style={{ padding: '12px' }}>₦{invoice.amount.toLocaleString()}</td>
                                    <td style={{ padding: '12px' }}>
                                        <span style={{
                                            display: 'inline-block',
                                            padding: '4px 8px',
                                            backgroundColor: getStatusColor(invoice.status),
                                            color: '#fff',
                                            borderRadius: '4px',
                                            fontSize: '12px'
                                        }}>
                                            {invoice.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px' }}>₦{invoice.amountPaid.toLocaleString()}</td>
                                    <td style={{ padding: '12px' }}>₦{invoice.amountDue.toLocaleString()}</td>
                                    <td style={{ padding: '12px' }}>
                                        {new Date(invoice.dueDate).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        <button
                                            onClick={() => navigate(`/invoice/${invoice._id}`)}
                                            style={{ marginRight: '5px', padding: '5px 10px', cursor: 'pointer' }}
                                        >
                                            View
                                        </button>
                                        <button
                                            onClick={() => deleteInvoice(invoice._id)}
                                            style={{ padding: '5px 10px', backgroundColor: '#f44336', color: '#fff', border: 'none', cursor: 'pointer' }}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default InvoiceList;
```

---

### 2. **InvoiceDetail.jsx** - View Invoice & Record Payment

```jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const InvoiceDetail = ({ token }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [paymentForm, setPaymentForm] = useState({
        amountPaid: '',
        paymentMethod: 'Bank Transfer',
        notes: ''
    });

    useEffect(() => {
        fetchInvoice();
    }, [id]);

    const fetchInvoice = async () => {
        try {
            const response = await fetch(`http://localhost:2008/invoice/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch invoice');

            const data = await response.json();
            setInvoice(data.invoice);
        } catch (err) {
            console.error('Error:', err);
            alert('Failed to load invoice');
            navigate('/invoices');
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();

        if (!paymentForm.amountPaid || paymentForm.amountPaid <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        try {
            const response = await fetch(`http://localhost:2008/invoice/${id}/payment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    amountPaid: parseFloat(paymentForm.amountPaid),
                    paymentMethod: paymentForm.paymentMethod,
                    notes: paymentForm.notes
                })
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.message);

            alert('Payment recorded successfully!');
            setPaymentForm({ amountPaid: '', paymentMethod: 'Bank Transfer', notes: '' });
            fetchInvoice();
        } catch (err) {
            console.error('Error:', err);
            alert(err.message);
        }
    };

    if (loading) return <p>Loading invoice...</p>;
    if (!invoice) return <p>Invoice not found</p>;

    const outstandingBalance = invoice.amountDue;

    return (
        <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
            <button 
                onClick={() => navigate('/invoices')}
                style={{ marginBottom: '20px', padding: '8px 16px', cursor: 'pointer' }}
            >
                ← Back to Invoices
            </button>

            <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div>
                        <h1 style={{ margin: '0 0 10px 0' }}>Invoice</h1>
                        <p style={{ margin: '0', color: '#666' }}>ID: {invoice._id}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <span style={{
                            display: 'inline-block',
                            padding: '8px 16px',
                            backgroundColor: invoice.status === 'Paid' ? '#4caf50' : invoice.status === 'Overdue' ? '#f44336' : '#ff9800',
                            color: '#fff',
                            borderRadius: '4px'
                        }}>
                            {invoice.status}
                        </span>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
                    <div>
                        <h3>Client Information</h3>
                        <p><strong>{invoice.clientName}</strong></p>
                        <p style={{ margin: '5px 0' }}>Due: {new Date(invoice.dueDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                        <h3>Payment Status</h3>
                        <table style={{ width: '100%' }}>
                            <tbody>
                                <tr>
                                    <td>Total Amount:</td>
                                    <td style={{ textAlign: 'right', fontWeight: 'bold' }}>₦{invoice.amount.toLocaleString()}</td>
                                </tr>
                                <tr>
                                    <td>Paid:</td>
                                    <td style={{ textAlign: 'right' }}>₦{invoice.amountPaid.toLocaleString()}</td>
                                </tr>
                                <tr style={{ backgroundColor: '#fff3cd' }}>
                                    <td><strong>Outstanding:</strong></td>
                                    <td style={{ textAlign: 'right', fontWeight: 'bold' }}>₦{outstandingBalance.toLocaleString()}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Items Table */}
            <div style={{ marginBottom: '20px' }}>
                <h3>Line Items</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Description</th>
                            <th style={{ padding: '12px', textAlign: 'center' }}>Qty</th>
                            <th style={{ padding: '12px', textAlign: 'right' }}>Unit Price</th>
                            <th style={{ padding: '12px', textAlign: 'right' }}>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoice.items.map((item, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #ddd' }}>
                                <td style={{ padding: '12px' }}>{item.description}</td>
                                <td style={{ padding: '12px', textAlign: 'center' }}>{item.qty}</td>
                                <td style={{ padding: '12px', textAlign: 'right' }}>₦{item.unitPrice.toLocaleString()}</td>
                                <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>₦{item.total.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Payment History */}
            {invoice.paymentHistory && invoice.paymentHistory.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                    <h3>Payment History</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Date</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Method</th>
                                <th style={{ padding: '12px', textAlign: 'right' }}>Amount</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Notes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoice.paymentHistory.map((payment, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid #ddd' }}>
                                    <td style={{ padding: '12px' }}>{new Date(payment.paymentDate).toLocaleDateString()}</td>
                                    <td style={{ padding: '12px' }}>{payment.paymentMethod}</td>
                                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>₦{payment.amountPaid.toLocaleString()}</td>
                                    <td style={{ padding: '12px' }}>{payment.notes}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Payment Form */}
            {invoice.status !== 'Paid' && (
                <div style={{ backgroundColor: '#e3f2fd', padding: '20px', borderRadius: '8px' }}>
                    <h3>Record Payment</h3>
                    <form onSubmit={handlePaymentSubmit}>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>
                                Amount to Pay (Outstanding: ₦{outstandingBalance.toLocaleString()})
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                max={outstandingBalance}
                                value={paymentForm.amountPaid}
                                onChange={(e) => setPaymentForm({ ...paymentForm, amountPaid: e.target.value })}
                                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                                placeholder="Enter amount"
                            />
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Payment Method</label>
                            <select
                                value={paymentForm.paymentMethod}
                                onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                            >
                                <option>Bank Transfer</option>
                                <option>Card</option>
                                <option>Cash</option>
                                <option>Check</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Notes (Optional)</label>
                            <textarea
                                value={paymentForm.notes}
                                onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                                style={{ width: '100%', padding: '8px', boxSizing: 'border-box', minHeight: '80px' }}
                                placeholder="Add any payment notes"
                            />
                        </div>

                        <button
                            type="submit"
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#4caf50',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '16px'
                            }}
                        >
                            Record Payment
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default InvoiceDetail;
```

---

### 3. **CreateInvoice.jsx** - Create New Invoice with Items

```jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateInvoice = ({ token }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        clientName: '',
        clientEmail: '',
        dueDate: '',
        description: '',
        items: [{ description: '', qty: 1, unitPrice: 0 }]
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleItemChange = (idx, field, value) => {
        const newItems = [...formData.items];
        newItems[idx][field] = value;
        setFormData({ ...formData, items: newItems });
    };

    const addItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { description: '', qty: 1, unitPrice: 0 }]
        });
    };

    const removeItem = (idx) => {
        if (formData.items.length > 1) {
            setFormData({
                ...formData,
                items: formData.items.filter((_, i) => i !== idx)
            });
        }
    };

    const calculateTotal = () => {
        return formData.items.reduce((sum, item) => sum + (item.qty * item.unitPrice), 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.clientName.trim()) {
            alert('Client name is required');
            return;
        }

        if (formData.items.some(item => !item.description || item.qty <= 0 || item.unitPrice <= 0)) {
            alert('Please fill in all item details');
            return;
        }

        try {
            const response = await fetch('http://localhost:2008/invoice/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.message);

            alert('Invoice created successfully!');
            navigate('/invoices');
        } catch (err) {
            console.error('Error:', err);
            alert(err.message);
        }
    };

    const total = calculateTotal();

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h2>Create New Invoice</h2>

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Client Name *</label>
                    <input
                        type="text"
                        name="clientName"
                        value={formData.clientName}
                        onChange={handleInputChange}
                        style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
                        placeholder="Enter client name"
                    />
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Client Email</label>
                    <input
                        type="email"
                        name="clientEmail"
                        value={formData.clientEmail}
                        onChange={handleInputChange}
                        style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
                        placeholder="client@example.com"
                    />
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Due Date</label>
                    <input
                        type="date"
                        name="dueDate"
                        value={formData.dueDate}
                        onChange={handleInputChange}
                        style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
                    />
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        style={{ width: '100%', padding: '10px', boxSizing: 'border-box', minHeight: '80px' }}
                        placeholder="Invoice description"
                    />
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <h3>Line Items *</h3>
                    {formData.items.map((item, idx) => (
                        <div key={idx} style={{
                            display: 'grid',
                            gridTemplateColumns: '2fr 1fr 1fr auto',
                            gap: '10px',
                            marginBottom: '10px',
                            alignItems: 'end'
                        }}>
                            <input
                                type="text"
                                placeholder="Item description"
                                value={item.description}
                                onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                                style={{ padding: '8px' }}
                            />
                            <input
                                type="number"
                                placeholder="Qty"
                                min="1"
                                value={item.qty}
                                onChange={(e) => handleItemChange(idx, 'qty', parseFloat(e.target.value))}
                                style={{ padding: '8px' }}
                            />
                            <input
                                type="number"
                                placeholder="Unit Price"
                                min="0"
                                step="0.01"
                                value={item.unitPrice}
                                onChange={(e) => handleItemChange(idx, 'unitPrice', parseFloat(e.target.value))}
                                style={{ padding: '8px' }}
                            />
                            <button
                                type="button"
                                onClick={() => removeItem(idx)}
                                style={{
                                    padding: '8px 12px',
                                    backgroundColor: '#f44336',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={addItem}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#2196f3',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        + Add Item
                    </button>
                </div>

                <div style={{
                    backgroundColor: '#f5f5f5',
                    padding: '15px',
                    borderRadius: '4px',
                    marginBottom: '20px'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold' }}>
                        <span>Total Amount:</span>
                        <span>₦{total.toLocaleString()}</span>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        type="submit"
                        style={{
                            padding: '12px 24px',
                            backgroundColor: '#4caf50',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '16px'
                        }}
                    >
                        Create Invoice
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/invoices')}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: '#999',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateInvoice;
```

---

## API Base URL Configuration

Create an `api.js` file:

```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:2008';

export const API_ENDPOINTS = {
    CREATE_INVOICE: `${API_BASE_URL}/invoice/create`,
    GET_INVOICES: `${API_BASE_URL}/invoice/all`,
    GET_INVOICE: (id) => `${API_BASE_URL}/invoice/${id}`,
    UPDATE_INVOICE: (id) => `${API_BASE_URL}/invoice/${id}`,
    DELETE_INVOICE: (id) => `${API_BASE_URL}/invoice/${id}`,
    RECORD_PAYMENT: (id) => `${API_BASE_URL}/invoice/${id}/payment`,
    GET_PAYMENT_HISTORY: (id) => `${API_BASE_URL}/invoice/${id}/payments`
};

export const apiCall = async (url, options = {}) => {
    const token = localStorage.getItem('token');
    
    return fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers
        }
    });
};
```

---

## Environment Variables (.env)

```
REACT_APP_API_URL=http://localhost:2008
```

---

## Integration with Routing

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import InvoiceList from './pages/InvoiceList';
import InvoiceDetail from './pages/InvoiceDetail';
import CreateInvoice from './pages/CreateInvoice';

function App() {
    const token = localStorage.getItem('token');

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/invoices" element={<InvoiceList token={token} />} />
                <Route path="/invoice/:id" element={<InvoiceDetail token={token} />} />
                <Route path="/create-invoice" element={<CreateInvoice token={token} />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
```

---

That's it! Your invoice system is fully integrated and ready to use! 🎉
