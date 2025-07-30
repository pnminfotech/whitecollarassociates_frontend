// previous code 
import React, { useEffect, useState } from 'react';
import { FaPlus, FaDownload, FaEdit } from "react-icons/fa";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import * as XLSX from 'xlsx';

const LightbillMaintenace = () => {
  const currentYear = new Date().getFullYear();
  // const [selectedYear, setSelectedYear] = useState(currentYear);

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // 1-based month (1=Jan)

  const [showFirstHalf, setShowFirstHalf] = useState(true);
  const [activeTab, setActiveTab] = useState('light');
  const [lightBills, setLightBills] = useState([]);
  const [otherExpenses, setOtherExpenses] = useState([]);
  // const [selectedMonth, setSelectedMonth] = useState('');
  const [buildingFilter, setBuildingFilter] = useState('');
  const [searchText, setSearchText] = useState('');

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [updatedTotalReading, setUpdatedTotalReading] = useState('');
  const [updatedAmount, setUpdatedAmount] = useState('');
  const [updatedDate, setUpdatedDate] = useState('');
  const [updatedStatus, setUpdatedStatus] = useState('');
// Added state to handle updated mainAmount and expenses for Other Expenses edit
  const [updatedMainAmount, setUpdatedMainAmount] = useState('');
  const [updatedExpenses, setUpdatedExpenses] = useState('');


const [tenants, setTenants] = useState([]);
const [showAddModal, setShowAddModal] = useState(false);
const [newEntry, setNewEntry] = useState({
  roomNo: '',
  meterNo: '',
  totalReading: '',
  amount: '',
  mainAmount: '',
  expenses: '',
  date: '',
  status:'',
});

  
  // const months = Array.from({ length: 12 }, (_, i) =>
  //   new Date(selectedYear, i).toLocaleString('default', { month: 'short' }) + '-' + String(selectedYear).slice(-2)
  // );
  // const visibleMonths = showFirstHalf ? months.slice(0, 6) : months.slice(6, 12);


  // For example, allow 5 years range for selection
const years = [];
for (let y = selectedYear - 2; y <= selectedYear + 2; y++) {
  years.push(y);
}

const months = [
  { value: 0, label: 'All Months' },
  { value: 1, label: 'Jan' },
  { value: 2, label: 'Feb' },
  { value: 3, label: 'Mar' },
  { value: 4, label: 'Apr' },
  { value: 5, label: 'May' },
  { value: 6, label: 'Jun' },
  { value: 7, label: 'Jul' },
  { value: 8, label: 'Aug' },
  { value: 9, label: 'Sep' },
  { value: 10, label: 'Oct' },
  { value: 11, label: 'Nov' },
  { value: 12, label: 'Dec' },
];


  const getMonthYear = (dateString) => {
    const date = new Date(dateString);
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear().toString().slice(-2);
    return `${month}-${year}`;
  };
useEffect(() => {
  const fetchTenants = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/');
      const data = await res.json();
      setTenants(data);
    } catch (err) {
      console.error("Error fetching tenants:", err);
    }
  };
  fetchTenants();
}, []);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    const url =
      activeTab === 'light'
        ? 'http://localhost:4000/api/light-bill/all'
        : 'http://localhost:4000/api/other-expense/all';
    try {
      const res = await fetch(url);
      const data = await res.json();
      activeTab === 'light' ? setLightBills(data) : setOtherExpenses(data);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };



  
const handleAddEntry = async () => {
  try {
    const url = activeTab === 'light'
      ? 'http://localhost:4000/api/light-bill'
      : 'http://localhost:4000/api/other-expense';

    const bodyData = activeTab === 'light'
      ? {
          roomNo: newEntry.roomNo,
          meterNo: newEntry.meterNo,
          totalReading: newEntry.totalReading,
          amount: newEntry.amount,
          date: newEntry.date,
        }
      : {
          roomNo: newEntry.roomNo,
          mainAmount: newEntry.mainAmount,
          expenses: newEntry.expenses.split(',').map(e => e.trim()),
          date: newEntry.date,
        };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyData),
    });

    if (!res.ok) throw new Error("Add failed");

    alert("Entry added successfully!");
    setShowAddModal(false);
    setNewEntry({ roomNo: '', meterNo: '', totalReading: '', amount: '', mainAmount: '', expenses: '', date: '' });
    fetchData();
  } catch (err) {
    alert("Failed to add entry: " + err.message);
  }
};

  const downloadExcel = () => {
    const data = activeTab === 'light' ? lightBills : otherExpenses;
    const formatted = data.map((item, idx) =>
      activeTab === 'light'
        ? {
            'Sr No.': idx + 1,
            'Room No': item.roomNo,
            'Meter No': item.meterNo,
            'Total Reading': item.totalReading,
            Amount: item.amount,
            Date: new Date(item.date).toLocaleDateString(),
          }
        : {
            'Sr No.': idx + 1,
            'Room No': item.roomNo,
            'Main Amount': item.mainAmount,
            Expenses: item.expenses?.join(', ') || '',
            Date: new Date(item.date).toLocaleDateString(),
          }
    );
    const sheet = XLSX.utils.json_to_sheet(formatted);
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, activeTab === 'light' ? 'LightBills' : 'OtherExpenses');
    XLSX.writeFile(book, `${activeTab}-data-${selectedYear}.xlsx`);
  };



 

  // Modified handleEdit to handle both tabs
  const handleEdit = (bill) => {
    setSelectedBill(bill);
    if (activeTab === 'light') {
      setUpdatedTotalReading(bill.totalReading);
      setUpdatedAmount(bill.amount);
      setUpdatedDate(bill.date?.slice(0, 10));
      setUpdatedStatus(bill.status);
    } else {
      setUpdatedMainAmount(bill.mainAmount);
      setUpdatedExpenses(bill.expenses?.join(', ') || '');
      setUpdatedDate(bill.date?.slice(0, 10));
       setUpdatedStatus(bill.status);
    }
    setShowEditModal(true);
  };

  // Modified handleUpdateSubmit to handle both tabs
  const handleUpdateSubmit = async () => {
    try {
      let bodyData;
      let url;
      if (activeTab === 'light') {
        url = `http://localhost:4000/api/light-bill/${selectedBill._id}`;
        bodyData = {
          ...selectedBill,
          status: updatedStatus,
          totalReading: updatedTotalReading,
          amount: updatedAmount,
          date: updatedDate,
        };
      } else {
        url = `http://localhost:4000/api/other-expense/${selectedBill._id}`;
        bodyData = {
          ...selectedBill,
           status: updatedStatus,
          mainAmount: updatedMainAmount,
          expenses: updatedExpenses.split(',').map(e => e.trim()),
          date: updatedDate,

        };
      }

      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });

      if (!res.ok) throw new Error("Update failed");

      alert("Bill updated!");
      setShowEditModal(false);
      fetchData();
    } catch (err) {
      alert("Failed to update: " + err.message);
    }
  };

  // Modified handleDelete to handle both tabs
  const handleDelete = async (bill) => {
    if (window.confirm(`Are you sure you want to delete this ${activeTab === 'light' ? 'light bill' : 'other expense'}?`)) {
      try {
        const url = activeTab === 'light'
          ? `http://localhost:4000/api/light-bill/${bill._id}`
          : `http://localhost:4000/api/other-expense/${bill._id}`;

        const response = await fetch(url, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) throw new Error("Delete failed");

        alert(`${activeTab === 'light' ? 'Light Bill' : 'Other Expense'} deleted successfully`);
        fetchData();
      } catch (err) {
        alert("Delete failed: " + err.message);
      }
    }
  };




const rawBills = activeTab === 'light' ? lightBills : otherExpenses;

const billsWithTenant = rawBills.map(item => {
  const tenant = tenants.find(t => t.roomNo === item.roomNo);
  return {
    ...item,
    tenantName: tenant?.name || '',
    tenantBedNo: tenant?.bedNo || ''
  };
});

const filteredBills = billsWithTenant.filter(item => {
  const itemDate = new Date(item.date);
  const matchesYear = itemDate.getFullYear() === selectedYear;
  const matchesMonth = selectedMonth === 0 || (itemDate.getMonth() + 1) === selectedMonth;
  const matchesRoom = buildingFilter === '' || item.roomNo === buildingFilter;
  const matchesSearch =
    searchText === '' ||
    item.tenantName.toLowerCase().includes(searchText.toLowerCase()) ||
    item.tenantBedNo.toLowerCase().includes(searchText.toLowerCase());

  return matchesYear && matchesMonth && matchesRoom && matchesSearch;
});

  const totalLightBill = lightBills.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const totalmaintainace = otherExpenses.reduce((sum, item) => sum + Number(item.mainAmount  || 0),0);


const totalPaidLightBill = lightBills
  .filter(item => item.status === 'paid')
  .reduce((sum, item) => sum + Number(item.amount || 0), 0);

const totalPendingLightBill = lightBills
  .filter(item => item.status !== 'paid')
  .reduce((sum, item) => sum + Number(item.amount || 0), 0);

const totalPaidMaintenance = otherExpenses
  .filter(item => item.status === 'paid')
  .reduce((sum, item) => sum + Number(item.mainAmount || 0), 0);

const totalPendingMaintenance = otherExpenses
  .filter(item => item.status !== 'paid')
  .reduce((sum, item) => sum + Number(item.mainAmount || 0), 0);


  
  return (
    <div className="container-fluid px-4 py-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <h3 className="fw-bold mb-4">Light Bill & Maintenance Tracker</h3>

     
      {/* Filters */}
      <div className="d-flex align-items-center mb-3 gap-3 flex-wrap">
      


  <select
    className="form-select"
    style={{ width: '120px' }}
    value={selectedYear}
    onChange={(e) => setSelectedYear(Number(e.target.value))}
  >
    {years.map((year) => (
      <option key={year} value={year}>{year}</option>
    ))}
  </select>

  <select
    className="form-select"
    style={{ width: '120px' }}
    value={selectedMonth}
    onChange={(e) => setSelectedMonth(Number(e.target.value))}
  >
    {months.map(({ value, label }) => (
      <option key={value} value={value}>{label}</option>
    ))}
  </select>

  {/* Keep your other filters and buttons here */}




       <select className="form-select" style={{ width: '200px' }} value={buildingFilter} onChange={(e) => setBuildingFilter(e.target.value)}>
  <option value="">Select Room No</option>
  {[...new Set(tenants.map(t => t.roomNo))] // Unique roomNos
    .filter(room => room) // Exclude undefined/null
    .map((room, idx) => (
      <option key={idx} value={room}>{room}</option>
  ))}
</select>


        <input
          type="text"
          placeholder="Search by Tenant Name / Bed No"
          className="form-control"
          style={{ maxWidth: '300px' }}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
<button
  className="btn me-2"
  style={activeTab === 'light' ? style.colorA : style.colorB}
  onClick={() => setActiveTab('light')}
>
  Light Bill
</button>

<button
  className="btn me-2"
  style={activeTab === 'other' ? style.colorA : style.colorB}
  onClick={() => setActiveTab('other')}
>
  Other Expenses
</button>

<button
  className="btn"
  style={style.successButton}
  onClick={downloadExcel}
>
  <FaDownload className="me-1" /> Download Excel
</button>


       
  <button
  className="btn me-2"
  style={activeTab === 'light' ? style.colorA : style.colorB}
  onClick={() => setShowAddModal(true)}
>
  <FaPlus className="me-1" />
  Add {activeTab === 'light' ? 'Light Bill' : 'Other Expense'}
</button>



      </div>

      {/* Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="bg-white border rounded shadow-sm p-3 text-center">
            <h6 className="text-muted mb-1">Total Light Bill</h6>
            <h4 className="fw-bold">{totalLightBill.toLocaleString()}</h4>
          </div>
        </div>
        <div className="col-md-3">
          <div className="bg-white border rounded shadow-sm p-3 text-center">
            <h6 className="text-muted mb-1">Total Maintenance Collected</h6>
            <h4 className="fw-bold"> {totalmaintainace.toLocaleString()}</h4>
          </div>
        </div>
      
 {/* <div className="col-md-4">
  <div className="bg-white border rounded shadow-sm p-3 text-center">
    <h6 className="text-muted mb-1">Total Paid Light Bill</h6>
    <h4 className="fw-bold">{totalPaidLightBill.toLocaleString()}</h4>
  </div>
</div> */}

{/* Total Paid Maintenance */}
{/* <div className="col-md-4">
  <div className="bg-white border rounded shadow-sm p-3 text-center">
    <h6 className="text-muted mb-1">Total Paid Maintenance</h6>
    <h4 className="fw-bold">{totalPaidMaintenance.toLocaleString()}</h4>
  </div>
</div> */}


<div className="col-md-3">
  <div className="bg-white border rounded shadow-sm p-3 text-center">
    <h6 className="text-muted mb-1">Pending LightBill</h6>
    <h4 className="fw-bold text-danger">{totalPendingLightBill.toLocaleString()}</h4>
  </div>
</div>
{/* Pending Maintenance */}
<div className="col-md-3">
  <div className="bg-white border rounded shadow-sm p-3 text-center">
    <h6 className="text-muted mb-1">Pending Maintenance</h6>
    <h4 className="fw-bold text-danger">{totalPendingMaintenance.toLocaleString()}</h4>
  </div>
</div>
</div>
      

      {/* Table */}
     <div className="table-responsive">
  <table className="table table-bordered align-middle">
    <thead className="table-light">
      <tr>
        <th>#</th>
        <th>Tenant Name</th>
        <th>Bed No</th>
        <th>Room No</th>
        {activeTab === 'light' ? (
          <>
            <th>Meter No</th>
            <th>Total Reading</th>
            <th>Amount</th>
          </>
        ) : (
          <>
            <th>Main Amount</th>
            <th>Expenses</th>
          </>
        )}
        <th>Date</th>
        <th>Status</th>
        <th className="text-center">Actions</th>
      </tr>
    </thead>
    <tbody>
      {filteredBills.length === 0 ? (
        <tr>
          <td colSpan="10" className="text-center">No data found.</td>
        </tr>
      ) : (
        filteredBills.map((item, idx) => (
          <tr key={item._id || idx}>
            <td>{idx + 1}</td>
           
<td>{item.tenantName || '-'}</td>
<td>{item.tenantBedNo || '-'}</td>


            <td>{item.roomNo || '-'}</td>
            {activeTab === 'light' ? (
              <>
                <td>{item.meterNo || '-'}</td>
                <td>{item.totalReading || '-'}</td>
                <td>{item.amount?.toLocaleString() || '-'}</td>
              </>
            ) : (
              <>
                <td>{item.mainAmount?.toLocaleString() || '-'}</td>
                <td>{item.expenses?.join(', ') || '-'}</td>
              </>
            )}
            <td>{new Date(item.date).toLocaleDateString()}</td>
            <td>
              {item.status === 'paid' ? (
                <span className="badge bg-success">Paid</span>
              ) : (
                <span className="badge bg-warning text-dark">Pending</span>
              )}
            </td>
            <td className="text-center">
              <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEdit(item)}>
                <FaEdit />
              </button>
              <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(item)}>
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </td>
          </tr>
        ))
      )}
    </tbody>
  </table>
</div>

{showAddModal && (
  <div className="modal d-block" tabIndex="-1">
    <div className="modal-dialog">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Add {activeTab === 'light' ? 'Light Bill' : 'Other Expense'}</h5>
          <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
        </div>
        <div className="modal-body">
          <div className="mb-3">
            <label className="form-label">Room No</label>
            <select
  className="form-select"
  value={newEntry.roomNo}
  onChange={(e) => setNewEntry({ ...newEntry, roomNo: e.target.value })}
>
  <option value="">Select Room No</option>
  {[...new Set(tenants.map(t => t.roomNo))]
    .filter(room => room)
    .map((room, idx) => (
      <option key={idx} value={room}>{room}</option>
    ))
  }
</select>

          </div>

          {activeTab === 'light' ? (
            <>
              <div className="mb-3">
                <label className="form-label">Meter No</label>
                <input
                  type="text"
                  className="form-control"
                  value={newEntry.meterNo}
                  onChange={(e) => setNewEntry({ ...newEntry, meterNo: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Total Reading</label>
                <input
                  type="number"
                  className="form-control"
                  value={newEntry.totalReading}
                  onChange={(e) => setNewEntry({ ...newEntry, totalReading: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Amount</label>
                <input
                  type="number"
                  className="form-control"
                  value={newEntry.amount}
                  onChange={(e) => setNewEntry({ ...newEntry, amount: e.target.value })}
                />
              </div>
            </>
          ) : (
            <>
              <div className="mb-3">
                <label className="form-label">Main Amount</label>
                <input
                  type="number"
                  className="form-control"
                  value={newEntry.mainAmount}
                  onChange={(e) => setNewEntry({ ...newEntry, mainAmount: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Expenses (comma separated)</label>
                <input
                  type="text"
                  className="form-control"
                  value={newEntry.expenses}
                  onChange={(e) => setNewEntry({ ...newEntry, expenses: e.target.value })}
                />
              </div>
            </>
          )}

          <div className="mb-3">
            <label className="form-label">Date</label>
            <input
              type="date"
              className="form-control"
              value={newEntry.date}
              onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleAddEntry} style={{backgroundColor:"#5eb65c"}}>Add</button>
        </div>
      </div>
    </div>
  </div>
)}

  {showEditModal && (
    <div className="modal d-block" tabIndex="-1">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Edit {activeTab === 'light' ? 'Light Bill' : 'Other Expense'}</h5>
            <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
          </div>
          <div className="modal-body">
            {activeTab === 'light' ? (
              <>
               <div className="mb-3">
                  <label className="form-label">Status</label>
  <select
    className="form-select"
    value={updatedStatus}
    onChange={(e) => setUpdatedStatus(e.target.value)}
  >
    <option value="pending">Pending</option>
    <option value="paid">Paid</option>
  </select>
                </div>
              <div className="mb-3">
                  <label className="form-label">Total Reading</label>
                  <input
                    type="number"
                    className="form-control"
                    value={updatedTotalReading}
                    onChange={(e) => setUpdatedTotalReading(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Amount</label>
                  <input
                    type="number"
                    className="form-control"
                    value={updatedAmount}
                    onChange={(e) => setUpdatedAmount(e.target.value)}
                  />
                </div>
              </>
            ) : (
              <>
              <div className="mb-3">
                  <label className="form-label">Status</label>
  <select
    className="form-select"
    value={updatedStatus}
    onChange={(e) => setUpdatedStatus(e.target.value)}
  >
    <option value="pending">Pending</option>
    <option value="paid">Paid</option>
  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Main Amount</label>
                  <input
                    type="number"
                    className="form-control"
                    value={updatedMainAmount}
                    onChange={(e) => setUpdatedMainAmount(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Expenses (comma separated)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={updatedExpenses}
                    onChange={(e) => setUpdatedExpenses(e.target.value)}
                    placeholder="e.g. Repair, Cleaning"
                  />
                </div>
              </>
            )}
            <div className="mb-3">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-control"
                value={updatedDate}
                onChange={(e) => setUpdatedDate(e.target.value)}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
            <button className="btn " onClick={handleUpdateSubmit} style={{backgroundColor:"#5eb65c"}}>Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  )}

     
    </div>
  );
};
const style = {
  colorA: {
    backgroundColor: '#387fbc',
    color: '#fff',
    border: '1px solid #387fbc',
  },
  colorB: {
    backgroundColor: '#5eb65c',
    color: '#fff',
    border: '1px solid #5eb65c',
  },
  successButton: {
    backgroundColor: '#efad4d',
    color: '#fff',
    border: '1px solid #efad4d',
  },
};


export default LightbillMaintenace;

















// MainDashboard.jsx
import React, { useEffect, useState } from 'react';
import { FiBarChart2 } from 'react-icons/fi';
import { MdOutlineBedroomParent, MdLightbulbOutline, MdOutlineReceiptLong } from 'react-icons/md';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#2563eb', '#facc15', '#10b981', '#ef4444', '#6366f1', '#1e3a8a'];

const MainDashboard = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState({ rent: {}, beds: {}, light: {}, maintenance: {} });
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:5000/api/').then(res => res.json()),
      fetch('http://localhost:5000/api/light-bill/all').then(res => res.json()),
      fetch('http://localhost:5000/api/other-expense/all').then(res => res.json()),
    ]).then(([tenants, lightBills, otherExpenses]) => {
      const totalBeds = tenants.length;
      const occupied = tenants.filter(t => !t.leaveDate).length;
      const vacant = totalBeds - occupied;
      const deposits = tenants.filter(t => Number(t.depositAmount) > 0).length;

      const now = new Date();
      const pendingRents = tenants.filter(t => {
        const lastRent = t.rents?.[t.rents.length - 1];
        if (!lastRent) return true;
        const rentDate = new Date(lastRent.date);
        return rentDate.getMonth() !== now.getMonth() || rentDate.getFullYear() !== now.getFullYear();
      }).length;

      const totalLight = lightBills.reduce((sum, b) => sum + Number(b.amount || 0), 0);
      const paidLight = lightBills.filter(b => b.status === 'paid').reduce((sum, b) => sum + Number(b.amount), 0);
      const pendingLight = totalLight - paidLight;

      const totalMaint = otherExpenses.reduce((sum, x) => sum + Number(x.mainAmount || 0), 0);
      const paidMaint = otherExpenses.filter(x => x.status === 'paid').reduce((sum, x) => sum + Number(x.mainAmount), 0);
      const pendingMaint = totalMaint - paidMaint;

      setSummary({
        beds: { total: totalBeds, occupied, vacant },
        rent: { pending: pendingRents, deposits },
        light: { paid: paidLight, pending: pendingLight },
        maintenance: { paid: paidMaint, pending: pendingMaint },
      });
    });
  }, []);

  const handleNavigation = (path) => navigate(path);
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/");
  };

  const renderCard = (label, value) => (
    <div className="col-sm-6 col-lg-3">
      <div className="p-3 bg-white border rounded shadow-sm text-center">
        <h6 className="text-muted mb-1">{label}</h6>
        <h4 className="fw-bold text-primary">{value}</h4>
      </div>
    </div>
  );

  const renderPie = (data, title) => (
    <div className="bg-white rounded shadow-sm p-3" style={{ width: '100%', minHeight: 300 }}>
      <h6 className="text-center text-muted mb-3">{title}</h6>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={70}
            innerRadius={40}
            label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {data.map((entry, idx) => (
              <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );

  const renderBarChart = () => {
    const totalLight = (summary.light.paid || 0) + (summary.light.pending || 0);
    const totalMaint = (summary.maintenance.paid || 0) + (summary.maintenance.pending || 0);
    const totalRent = (summary.rent.deposits || 0) + (summary.rent.pending || 0);

    const getPercent = (value, total) => total ? (value / total) * 100 : 0;

    const data = [
      { name: 'Light', Paid: getPercent(summary.light.paid, totalLight), Pending: getPercent(summary.light.pending, totalLight) },
      { name: 'Maintenance', Paid: getPercent(summary.maintenance.paid, totalMaint), Pending: getPercent(summary.maintenance.pending, totalMaint) },
      { name: 'Rent', Paid: getPercent(summary.rent.deposits, totalRent), Pending: getPercent(summary.rent.pending, totalRent) },
    ];

    return (
      <div className="bg-white rounded shadow-sm p-3">
        <h6 className="text-center text-muted mb-3">Overall Payment Status</h6>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} tickFormatter={(val) => `${val.toFixed(0)}%`} />
            <Tooltip formatter={(val) => `${val.toFixed(1)}%`} />
            <Legend />
            <Bar dataKey="Paid" fill="#10B981" />
            <Bar dataKey="Pending" fill="#EF4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const dayName = currentTime.toLocaleDateString(undefined, { weekday: 'long' });
  const dateString = currentTime.toLocaleDateString();
  const timeString = currentTime.toLocaleTimeString();

  return (
    <div className="d-flex" style={{ minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      {/* Sidebar */}
      <aside className="bg-primary text-white p-4" style={{ width: 250 }}>
        <h4 className="text-center mb-4 fw-bold">🏨 Hostel Manager</h4>
        <ul className="list-unstyled">
          {[{ label: 'Dashboard', icon: <FiBarChart2 />, path: '/maindashboard' },
            { label: 'Rent & Deposit', icon: <MdOutlineBedroomParent />, path: '/NewComponant' },
            { label: 'Light Bill', icon: <MdLightbulbOutline />, path: '/lightbillmaintance' },
            { label: 'Maintenance', icon: <MdOutlineReceiptLong />, path: '/lightbillmaintance' }]
            .map(({ label, icon, path }) => (
              <li key={label} className="mb-3" onClick={() => handleNavigation(path)} style={{ cursor: 'pointer' }}>
                {icon} <span className="ms-2">{label}</span>
              </li>
            ))}
          <li className="mt-3" onClick={handleLogout} style={{ cursor: 'pointer' }}>
            <FontAwesomeIcon icon={faSignOutAlt} /> <span className="ms-2">Logout</span>
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="flex-grow-1 p-4 bg-light" style={{ marginLeft: 250 }}>
        <div className="mb-4 text-center">
          <h3 className="text-primary fw-bold">Welcome Admin 👋</h3>
          <p className="text-muted">{dayName}, {dateString} | {timeString}</p>
        </div>

        {/* Summary Cards */}
        <div className="row g-3 mb-4">
          {renderCard('Total Beds', summary.beds.total || 0)}
          {renderCard('Occupied', summary.beds.occupied || 0)}
          {renderCard('Pending Rents', summary.rent.pending || 0)}
          {renderCard('Deposits', summary.rent.deposits || 0)}
        </div>

        {/* Bar Chart */}
        <div className="row mb-4">
          <div className="col-12">{renderBarChart()}</div>
        </div>

        {/* Pie Charts */}
        <div className="row g-3">
          <div className="col-md-6 col-lg-3">{renderPie([
            { name: 'Paid', value: summary.light.paid || 0 },
            { name: 'Pending', value: summary.light.pending || 0 }
          ], 'Light Bill')}</div>

          <div className="col-md-6 col-lg-3">{renderPie([
            { name: 'Paid', value: summary.maintenance.paid || 0 },
            { name: 'Pending', value: summary.maintenance.pending || 0 }
          ], 'Maintenance')}</div>

          <div className="col-md-6 col-lg-3">{renderPie([
            { name: 'Received', value: summary.rent.deposits || 0 },
            { name: 'Pending', value: summary.rent.pending || 0 }
          ], 'Rent')}</div>

          <div className="col-md-6 col-lg-3">{renderPie([
            { name: 'Occupied', value: summary.beds.occupied || 0 },
            { name: 'Vacant', value: summary.beds.vacant || 0 }
          ], 'Bed Status')}</div>
        </div>
      </main>
    </div>
  );
};

export default MainDashboard;
