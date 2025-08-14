// src/components/MonthlyBills.js
import React, { useEffect, useState } from "react";
import axios from "axios";

const MonthlyBills = () => {
    const [bills, setBills] = useState([]);

    useEffect(() => {
        axios.get("https://whitecollarassociates.onrender.com/api/monthly-bills/monthly")
            .then(res => setBills(res.data))
            .catch(err => console.error("Error fetching bills", err));
    }, []);

    return (
        <div>
            <h2>Monthly Bills</h2>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Room</th>
                        <th>Rent</th>
                        <th>Light Bill</th>
                        <th>Total</th>
                        <th>Cash</th>
                        <th>Online</th>
                        <th>Paid</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {bills.map((bill) => (
                        <tr key={bill._id}>
                            <td>{bill.tenantId?.name}</td>
                            <td>{bill.roomNo}</td>
                            <td>{bill.rentAmount}</td>
                            <td>{bill.lightBillAmount}</td>
                            <td>{bill.totalAmount}</td>
                            <td>{bill.cashPayment}</td>
                            <td>{bill.onlinePayment}</td>
                            <td>{bill.paidAmount}</td>
                            <td>{bill.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};


export default MonthlyBills;
