import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ReportsPage = () => {
    const [tenants, setTenants] = useState([]);
    const [selectedTenant, setSelectedTenant] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        axios
            .get('http://localhost:4000/api/')
            .then((res) => setTenants(res.data))
            .catch((err) => console.error('Error fetching tenants:', err));
    }, []);

    const handlePrint = () => {
        if (!selectedTenant) {
            alert('Please select a tenant first.');
            return;
        }

        const tenant = selectedTenant;
        const monthlyRent = tenant.monthlyRent || 5000;
        const totalPaid = tenant.rents.reduce(
            (sum, rent) => sum + (rent.rentAmount || 0),
            0
        );
        const totalDue = (tenant.rents.length * monthlyRent) - totalPaid;

        const latestRents = tenant.rents
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 3);

        const printWindow = window.open('', '', 'height=700,width=900');
        printWindow.document.write(`
            <html>
            <head>
                <title>Rent Payment Receipt</title>
                <style>
                    body {
                        background-color: #f1f1f1;
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 40px;
                    }
                    .receipt {
                        background-color: #fff;
                        padding: 30px 40px;
                        border-radius: 10px;
                        max-width: 700px;
                        margin: auto;
                        box-shadow: 0 0 15px rgba(0,0,0,0.1);
                    }
                    .title {
                        text-align: center;
                        color: #007bff;
                        font-size: 24px;
                        font-weight: bold;
                        margin-bottom: 10px;
                    }
                    .subtitle {
                        text-align: center;
                        margin-bottom: 30px;
                        color: #444;
                    }
                    .info p {
                        margin: 6px 0;
                    }
                    .info strong {
                        display: inline-block;
                        width: 150px;
                    }
                    .amounts {
                        text-align: right;
                        margin-top: 20px;
                        margin-bottom: 20px;
                    }
                    .amounts p {
                        margin: 5px 0;
                    }
                    h3 {
                        color: #007bff;
                        margin-top: 30px;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 10px;
                    }
                    th {
                        background-color: #007bff;
                        color: white;
                        padding: 10px;
                        text-align: left;
                    }
                    td {
                        padding: 10px;
                        border-bottom: 1px solid #ccc;
                    }
                </style>
            </head>
            <body>
                <div class="receipt">
                    <div class="title">🏡 Rent Payment Receipt</div>
                    <div class="subtitle">Generated on ${new Date().toLocaleDateString()}</div>
                    <div class="info">
                        <p><strong>Name:</strong> ${tenant.name}</p>
                        <p><strong>Room No:</strong> ${tenant.roomNo}</p>
                        <p><strong>Monthly Rent:</strong> ₹${monthlyRent}</p>
                    </div>
                    <div class="amounts">
                        <p><strong>Total Paid:</strong> ₹${totalPaid}</p>
                        <p><strong>Due Amount:</strong> ₹${totalDue}</p>
                    </div>
                    <h3>Payment History</h3>
                    <table>
                        <tr>
                            <th>Month</th>
                            <th>Paid Amount</th>
                            <th>Paid Date</th>
                        </tr>
                        ${latestRents.map(rent => `
                            <tr>
                                <td>${rent.month || '-'}</td>
                                <td>₹${rent.rentAmount || 0}</td>
                                <td>${rent.date ? new Date(rent.date).toLocaleDateString() : '-'}</td>
                            </tr>
                        `).join('')}
                    </table>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    return (
        <div style={{
            padding: '30px 20px',
            fontFamily: 'Arial, sans-serif',
            backgroundColor: '#f8f9fa',
            minHeight: '100vh'
        }}>
            <div style={{
                maxWidth: '500px',
                margin: '0 auto',
                backgroundColor: '#ffffff',
                padding: '30px',
                borderRadius: '10px',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
            }}>
                <h2 style={{
                    fontSize: '24px',
                    marginBottom: '20px',
                    textAlign: 'center',
                    color: '#007bff'
                }}>
                    Generate Tenant Rent Report
                </h2>

                <select
                    onChange={(e) => {
                        const tenant = tenants.find((t) => t.roomNo === e.target.value);
                        setSelectedTenant(tenant);
                    }}
                    style={{
                        padding: '12px',
                        width: '100%',
                        border: '1px solid #ccc',
                        borderRadius: '5px',
                        fontSize: '16px',
                        marginBottom: '20px'
                    }}
                >
                    <option value="">-- Choose Tenant --</option>
                    {tenants.map((tenant, idx) => (
                        <option key={idx} value={tenant.roomNo}>
                            {tenant.name} - {tenant.roomNo}
                        </option>
                    ))}
                </select>

                <button
                    onClick={handlePrint}
                    style={{
                        padding: '12px',
                        width: '100%',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '16px',
                        cursor: 'pointer'
                    }}
                >
                    🧾 Generate PDF Report
                </button>

                <button
                    onClick={() => navigate(-1)}
                    style={{
                        marginTop: '15px',
                        padding: '8px 16px',
                        backgroundColor: '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        fontSize: '14px',
                        cursor: 'pointer',
                        display: 'block',
                        marginLeft: 'auto',
                        marginRight: 'auto'
                    }}
                >
                    ← Back
                </button>

            </div>
        </div>
    );
};

export default ReportsPage;
