import React, { useEffect, useState } from 'react';
import { FaPlus, FaDownload, FaEdit } from "react-icons/fa";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import * as XLSX from 'xlsx';
import { HiHome } from "react-icons/hi";
import { FaBolt, FaReceipt } from 'react-icons/fa'; // example icons
import { FaSearch } from 'react-icons/fa';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { FaTachometerAlt } from "react-icons/fa";

const LightbillOtherExpenses = () => {
  const currentYear = new Date().getFullYear();
  const [lightData, setLightData] = useState([]);

  // const [selectedYear, setSelectedYear] = useState(currentYear);

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(0); // 0 means 'All Months'

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
  // const [newEntry, setNewEntry] = useState({
  //   roomNo: '',
  //   meterNo: '',
  //   totalReading: '',
  //   amount: '',
  //   mainAmount: '',
  //   expenses: '',
  //   date: '',
  //   status:'',
  // });

  const [data, setData] = useState([]);
  const [newEntry, setNewEntry] = useState({
    type: "meter",
    name: "",
    roomNo: "",
    meterNo: "",


    oldUnits: '',
    newUnits: '',
    amount: '',
    month: "",
    year: new Date().getFullYear(),
    mainAmount: '',
    expenses: [""],
    date: '',
    status: '',
  });
  const [showModal, setShowModal] = useState(false);
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





  const rooms = [
    { roomNo: '101', meterNo: 'Meter A' },
    { roomNo: '102', meterNo: 'Meter B' },
    { roomNo: '103', meterNo: 'Meter C' },
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
  // In your LightbillOtherExpenses.js component, update the useEffect hook:

  useEffect(() => {
    async function fetchData() {
      try {
        const url = activeTab === 'light'
          ? 'http://localhost:4000/api/light-bill/all'
          : 'http://localhost:4000/api/other-expense/all';

        const res = await fetch(url);

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          if (activeTab === 'light') {
            setLightBills(data);
          } else {
            setOtherExpenses(data);
          }
        } else {
          const text = await res.text();
          console.error('Response is not JSON:', text);
          throw new Error('Response is not JSON');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        if (activeTab === 'light') {
          setLightBills([]);
        } else {
          setOtherExpenses([]);
        }
      }
    }

    fetchData(); // ✅ Call the function properly
  }, [activeTab]);

  // const fetchData = async () => {
  //   const url =
  //     activeTab === 'light'
  //       ? 'http://localhost:4000/api/light-bill/all'
  //       : 'http://localhost:4000/api/other-expense/all';
  //   try {
  //     const res = await fetch(url);
  //     const data = await res.json();
  //     activeTab === 'light' ? setLightBills(data) : setOtherExpenses(data);
  //   } catch (err) {
  //     console.error('Error fetching data:', err);
  //   }
  // };


  const handleAddEntry = async () => {
    try {
      const url = activeTab === 'light'
        ? 'http://localhost:4000/api/light-bill/'
        : 'http://localhost:4000/api/other-expense/all';

      let bodyData;

      if (activeTab === 'light') {
        // Destructure roomNo and meterNo from newEntry
        const { meterNo, amount, month, year, oldUnits, newUnits, roomNo } = newEntry;

        // Validation to ensure roomNo and meterNo are provided
        if (!roomNo) throw new Error("Room No is required.");
        if (!meterNo) throw new Error("Meter No is required.");
        if (!month || !year) throw new Error("Month and Year are required.");

        const monthNumber = months.find(m => m.label === month)?.value;
        if (!monthNumber) {
          alert("Please select a valid month.");
          return;
        }

        const formattedDate = `${year}-${String(monthNumber).padStart(2, '0')}-01`;

        let previousDue = 0;
        try {
          const unpaidRes = await fetch(`http://localhost:4000/api/light-bill/unpaid?meterNo=${meterNo}`);
          if (unpaidRes.ok) {
            const unpaidData = await unpaidRes.json();
            previousDue = unpaidData?.amount || 0;
          }
        } catch (fetchErr) {
          console.warn("Could not fetch unpaid amount, proceeding with base amount.");
        }

        const totalAmount = (Number(amount) || 0) + Number(previousDue);

        // Construct bodyData with roomNo and meterNo
        bodyData = {
          roomNo, // The selected room number
          meterNo, // The entered meter number
          oldUnits: Number(oldUnits),
          newUnits: Number(newUnits),
          amount: totalAmount,
          month,
          year,
          status: newEntry.status || 'pending',
          date: formattedDate,
        };
      } else {
        bodyData = {
          mainAmount: newEntry.mainAmount,
          expenses: Array.isArray(newEntry.expenses)
            ? newEntry.expenses.filter(e => e.trim() !== "")
            : [],
          date: newEntry.date,
        };
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });

      if (!res.ok) throw new Error("Add failed");

      alert("Entry added successfully!");
      setShowAddModal(false);
      // Reset newEntry state after successful addition
      setNewEntry({
        roomNo: '',
        meterNo: '',
        oldUnits: '',
        newUnits: '',
        amount: '',
        month: '',
        year: new Date().getFullYear(),
        status: 'pending',
      });

      fetchData(); // Refresh data after adding
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

  // const billsWithTenant = rawBills.map(item => {
  //   const tenant = tenants.find(t => t.roomNo === item.roomNo);
  //   return {
  //     ...item,
  //     tenantName: tenant?.name || '',
  //     tenantBedNo: tenant?.bedNo || ''
  //   };
  // });

  // const filteredBills = billsWithTenant.filter(item => {
  //   const itemDate = new Date(item.date);
  //   const matchesYear = itemDate.getFullYear() === selectedYear;
  //   const matchesMonth = selectedMonth === 0 || (itemDate.getMonth() + 1) === selectedMonth;
  //   const matchesRoom = buildingFilter === '' || item.roomNo === buildingFilter;
  //   const matchesSearch =
  //     searchText === '' ||
  //     item.tenantName.toLowerCase().includes(searchText.toLowerCase()) ||
  //     item.tenantBedNo.toLowerCase().includes(searchText.toLowerCase());

  //   return matchesYear && matchesMonth && matchesRoom && matchesSearch;
  // });
  const lightBillsWithTenants = lightBills.flatMap(item => {
    const tenantsInRoom = tenants.filter(t => t.roomNo === item.roomNo);
    if (tenantsInRoom.length > 0) {
      return tenantsInRoom.map(tenant => ({
        ...item,
        tenantName: tenant.name,
        tenantBedNo: tenant.bedNo,
      }));
    } else {
      return [{
        ...item,
        tenantName: '',
        tenantBedNo: '',
      }];
    }
  });

  const otherExpensesWithTenants = otherExpenses.flatMap(item => {
    const tenantsInRoom = tenants.filter(t => t.roomNo === item.roomNo);
    if (tenantsInRoom.length > 0) {
      return tenantsInRoom.map(tenant => ({
        ...item,
        tenantName: tenant.name,
        tenantBedNo: tenant.bedNo,
      }));
    } else {
      return [{
        ...item,
        tenantName: '',
        tenantBedNo: '',
      }];
    }
  });

  // Updated groupData to eliminate duplicates based on latest entry per name + month
  const groupData = (dataList) => {
    const matrix = {};
    const monthMap = new Map();

    dataList.forEach(item => {
      const name = item.name || item.meterNo || item.customLabel || 'Unknown';
      const date = new Date(item.date);
      const monthIndex = new Date(item.date).getMonth() + 1;
      const monthLabel = months[monthIndex]?.label;

      const key = `${name}_${monthLabel}`;
      if (!monthMap.has(key) || new Date(item.date) > new Date(monthMap.get(key).date)) {
        monthMap.set(key, item);
      }
    });

    monthMap.forEach(item => {
      const name = item.name || item.meterNo || item.customLabel || 'Unknown';
      const monthIndex = new Date(item.date).getMonth() + 1;
      const monthLabel = months[monthIndex]?.label;

      if (!matrix[name]) matrix[name] = {};
      matrix[name][monthLabel] = item;
    });

    return matrix;
  };






  // const groupData = (dataList) => {
  //   const matrix = {};

  //   dataList.forEach(item => {
  //     const name = item.name || item.meterNo || item.customLabel || 'Unknown';
  //     const date = new Date(item.date);
  //     const month = months[date.getMonth()]; // 'Jan', 'Feb', etc.

  //     if (!matrix[name]) matrix[name] = {};

  //     // Keep latest entry per month (based on createdAt or date field)
  //     if (
  //       !matrix[name][month] || 
  //       new Date(item.date) > new Date(matrix[name][month].date)
  //     ) {
  //       matrix[name][month] = item;
  //     }
  //   });

  //   return matrix;
  // };




  const filteredLightBills = lightBillsWithTenants.filter(item => {
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

  const filteredOtherExpenses = otherExpensesWithTenants.filter(item => {
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


  // Total Light Bill (only meter entries)
  const totalLightBill = filteredLightBills
    .filter(item => item.type === 'meter')
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  // Total Paid Light Bill (only meter entries + paid)
  const totalPaidLightBill = filteredLightBills
    .filter(item => item.type === 'meter' && item.status === 'paid')
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  // Total Pending Light Bill (only meter entries + not paid)
  const totalPendingLightBill = filteredLightBills
    .filter(item => item.type === 'meter' && item.status !== 'paid')
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);


  const totalmaintainace = otherExpenses.reduce((sum, item) => sum + Number(item.mainAmount || 0), 0);

  // const totalPaidLightBill = filteredLightBills
  //   .filter(item => item.status === 'paid')
  //   .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  // const totalPendingLightBill = filteredLightBills
  //   .filter(item => item.status !== 'paid')
  //   .reduce((sum, item) => sum + Number(item.amount || 0), 0);



  const totalPaidMaintenance = otherExpenses
    .filter(item => item.status === 'paid')
    .reduce((sum, item) => sum + Number(item.mainAmount || 0), 0);

  const totalPendingMaintenance = otherExpenses
    .filter(item => item.status !== 'paid')
    .reduce((sum, item) => sum + Number(item.mainAmount || 0), 0);


  const navigate = useNavigate();
  const handleNavigation = (path) => {
    navigate(path);
  };
  return (
    <div className="container-fluid px-4 py-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <h3 className="fw-bold mb-4 me-3">
        {activeTab === 'light' ? 'Monthly Expense' : 'Other Expense'}
      </h3>


      {/* Filters */}
      <div className="d-flex align-items-center mb-3 mt-1 gap-3 flex-wrap">



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






        {/* <div style={{ position: 'relative', maxWidth: '300px' }}>
  <FaSearch 
    style={{
      position: 'absolute',
      left: '10px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#aaa',
      pointerEvents: 'none',
      zIndex: 1,
      
    }}
  />
  <input 
    type="text"
    placeholder="Search by Name / Bed No"
    className="form-control ps-4 mx-1"  // padding-left to make space for icon
    value={searchText}
    onChange={(e) => setSearchText(e.target.value)}
  />
</div> */}
        <button
          className="btn me-2"
          style={activeTab === 'light' ? style.colorA : style.colorB}
          onClick={() => setActiveTab('light')}
        >
          <FaBolt className="me-1" />
          Light Bill
        </button>

        <button
          className="btn me-2"
          style={activeTab === 'other' ? style.colorA : style.colorB}
          onClick={() => setActiveTab('other')}
        >
          <FaReceipt className="me-1" />
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
        <button
          className="btn me-2"
          style={{ backgroundColor: "#3db7b1", color: "white" }}
          onClick={() => handleNavigation('/NewComponant')}>

          <HiHome className="me-1" />
          Rent & Deposite
        </button>
        <button
          className="btn me-2"
          style={{ backgroundColor: "#483f3fab", color: "white" }}

          onClick={() => handleNavigation('/maindashboard')}>
          <FaArrowLeft className="me-1" />
          Back
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
            <h6 className="text-muted mb-1">Total Maintenance </h6>
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
        {activeTab === 'light' ? (
          <>
            <div
              className="d-flex align-items-center gap-3 justify-content-end mb-2"
              style={{ fontSize: '0.8rem', color: '#6c757d' }}
            >
              <strong>*Legend:</strong>
              <span className="text-secondary">
                <FaBolt style={{ color: "#e37727" }} /> = Light Bill Amount
              </span>
              <span className="text-secondary">
                <FaTachometerAlt className="text-success" /> = Reading (Units)
              </span>
            </div>

            <div className="table-responsive">
              <table className="table table-bordered mt-0">
                <thead>
                  <tr>
                    <th>Name</th>
                    {months
                      .filter(m => m.value !== 0)
                      .map((month) => (
                        <th key={month.value}>{month.label}</th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(groupData(filteredLightBills)).map(([name, values]) => (
                    <tr key={name}>
                      <td><strong>{name}</strong></td>
                      {months
                        .filter(m => m.value !== 0)
                        .map((month) => (
                          <td
                            key={`${name}-${month.label}`}
                            style={{ cursor: values[month.label] ? 'pointer' : 'default' }}
                            onClick={() => {
                              if (values[month.label]) handleEdit(values[month.label]);
                            }}
                          >
                            {values[month.label] ? (
                              values[month.label].type === "maushi" ? (
                                <>₹ {values[month.label].salary}</>
                              ) : values[month.label].type === "meter" ? (
                                <>
                                  <FaBolt style={{ color: "#e37727" }} /> ₹{values[month.label].amount}<br />
                                  <small className="text-muted">
                                    <FaTachometerAlt className="me-1 text-success" />
                                    {values[month.label].totalReading}
                                  </small>
                                  <br />
                                  <span
                                    className={`badge ${values[month.label].status === 'paid' ? 'bg-success' : 'bg-warning text-dark'}`}
                                    style={{ fontSize: '0.7em' }}
                                  >
                                    {values[month.label].status}
                                  </span>
                                </>
                              ) : (
                                <>₹{values[month.label].amount}</>
                              )
                            ) : (
                              "-"
                            )}
                          </td>
                        ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <table className="table table-bordered align-middle">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Date</th>
                <th>Room No</th> {/* ✅ Added */}
                <th>Expenses</th>
                <th>Main Amount</th>
                <th>Light Bill Status</th> {/* ✅ Added */}
                <th>Status</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOtherExpenses.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center">No data found.</td>
                </tr>
              ) : (
                filteredOtherExpenses.map((item, idx) => (
                  <tr key={item._id + '-' + idx}>
                    <td>{idx + 1}</td>
                    <td>{new Date(item.date).toLocaleDateString()}</td>
                    <td>{item.roomNo || '-'}</td> {/* ✅ Room No */}
                    <td>{item.expenses?.join(', ') || '-'}</td>
                    <td>{item.mainAmount?.toLocaleString() || '-'}</td>

                    <td> {/* ✅ Light Bill Status */}
                      {item.lightBillStatus === 'paid' ? (
                        <span className="badge bg-success">Paid</span>
                      ) : item.lightBillStatus === 'pending' ? (
                        <span className="badge bg-warning text-dark">Pending</span>
                      ) : (
                        '-'
                      )}
                    </td>

                    <td>
                      {item.status === 'paid' ? (
                        <span className="badge bg-success">Paid</span>
                      ) : (
                        <span className="badge bg-warning text-dark">Pending</span>
                      )}
                    </td>
                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => handleEdit(item)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(item)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {showAddModal && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add {activeTab === 'light' ? 'Light Bill' : 'Other Expense'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
              </div>
              <div className="modal-body">







                {/* Room No Input Field */}
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label>Room No</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newEntry.roomNo || ""}
                      onChange={async (e) => {
                        const roomNo = e.target.value;
                        setNewEntry(prev => ({ ...prev, roomNo })); // update roomNo


                      }}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label>Meter No</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter Meter No"
                      value={newEntry.meterNo}
                      onChange={(e) => setNewEntry({ ...newEntry, meterNo: e.target.value })}
                    />


                  </div>
                </div>

                <div className="row">
                  {activeTab === 'light' ? (
                    <>




                      {newEntry.type === 'meter' && (
                        <>


                          {/* Old Units */}
                          <div className="col-md-6 mb-3">
                            <label>Old Units</label>
                            <input
                              type="number"
                              className="form-control"
                              value={newEntry.oldUnits}
                              onChange={(e) => {
                                const oldUnits = parseFloat(e.target.value);
                                const newUnits = parseFloat(newEntry.newUnits);
                                const units = !isNaN(oldUnits) && !isNaN(newUnits) ? newUnits - oldUnits : '';
                                const amount = units > 0 ? units * 15 : '';
                                setNewEntry({
                                  ...newEntry,
                                  oldUnits: e.target.value,
                                  amount
                                });
                              }}
                            />
                          </div>

                          {/* New Units */}
                          <div className="col-md-6 mb-3">
                            <label>New Units</label>
                            <input
                              type="number"
                              className="form-control"
                              value={newEntry.newUnits}
                              onChange={(e) => {
                                const newUnits = parseFloat(e.target.value);
                                const oldUnits = parseFloat(newEntry.oldUnits);
                                const units = !isNaN(oldUnits) && !isNaN(newUnits) ? newUnits - oldUnits : '';
                                const amount = units > 0 ? units * 15 : '';
                                setNewEntry({
                                  ...newEntry,
                                  newUnits: e.target.value,
                                  amount
                                });
                              }}
                            />
                          </div>

                          {/* Auto Calculated Amount */}
                          <div className="col-md-6 mb-3">
                            <label>Amount (₹15 × Units)</label>
                            <input
                              type="text"
                              className="form-control"
                              value={
                                newEntry.oldUnits && newEntry.newUnits
                                  ? `${newEntry.newUnits - newEntry.oldUnits} units × ₹15 = ₹${newEntry.amount}`
                                  : ''
                              }
                              readOnly
                            />
                          </div>






                          {/* <div className="col-md-6 mb-3">
                            <label>Total Reading</label>
                            <input
                              type="number"
                              className="form-control"
                              value={newEntry.totalReading}
                              onChange={(e) => setNewEntry({ ...newEntry, totalReading: e.target.value })}
                            />
                          </div> */}
                          <div className="col-md-6 mb-3">
                            <label>Amount</label>
                            <input
                              type="number"
                              className="form-control"
                              value={newEntry.amount}
                              onChange={(e) => setNewEntry({ ...newEntry, amount: e.target.value })}
                            />
                          </div>

                        </>
                      )}

                      {newEntry.type === 'maushi' && (
                        <div className="col-md-6 mb-3">
                          <label>Salary</label>
                          <input
                            type="number"
                            className="form-control"
                            value={newEntry.salary}
                            onChange={(e) => setNewEntry({ ...newEntry, salary: e.target.value })}
                          />
                        </div>
                      )}

                      {newEntry.type === 'custom' && (
                        <>
                          <div className="col-md-6 mb-3">
                            <label>Label</label>
                            <input
                              type="text"
                              className="form-control"
                              value={newEntry.customLabel}
                              onChange={(e) => setNewEntry({ ...newEntry, customLabel: e.target.value })}
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label>Amount</label>
                            <input
                              type="number"
                              className="form-control"
                              value={newEntry.amount}
                              onChange={(e) => setNewEntry({ ...newEntry, amount: e.target.value })}
                            />
                          </div>
                        </>
                      )}

                      <div className="col-md-6 mb-3">
                        <label>Month</label>
                        <select
                          className="form-select" style={{ marginBottom: '10px', marginTop: '10px' }}
                          value={newEntry.month}
                          onChange={(e) => setNewEntry({ ...newEntry, month: e.target.value })}
                        >
                          <option value="">Select Month</option>
                          {months.filter(m => m.value !== 0).map(month => (
                            <option key={month.label} value={month.label}>{month.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label>Year</label>
                        <input
                          type="number"
                          className="form-control"
                          value={newEntry.year}
                          onChange={(e) => setNewEntry({ ...newEntry, year: e.target.value })}
                        />
                      </div>


                      {/* <div className="col-md-6 mb-3">
                        <label>Status</label>
                        <select
                          className="form-select"
                          value={newEntry.status}
                          onChange={(e) => setNewEntry({ ...newEntry, status: e.target.value })}
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                        </select>
                      </div> */}

                    </>
                  ) : (
                    <>
                      {/* <div className="col-md-6 mb-3">
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
                      ))}
                  </select>
                </div> */}
                      <div className="col-md-6 mb-3">
                        <label>Main Amount</label>
                        <input
                          type="number"
                          className="form-control"
                          value={newEntry.mainAmount}
                          onChange={(e) => setNewEntry({ ...newEntry, mainAmount: e.target.value })}
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label>Date</label>
                        <input
                          type="date"
                          className="form-control"
                          value={newEntry.date}
                          onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                        />
                      </div>
                      <div className="col-12 mb-3">
                        <label className="form-label">Expenses:</label>
                        {newEntry.expenses.map((expense, index) => (
                          <div key={index} className="d-flex mb-2">
                            <input
                              type="text"
                              className="form-control"
                              placeholder={`Expense ${index + 1}`}
                              value={expense}
                              onChange={(e) => {
                                const updated = [...newEntry.expenses];
                                updated[index] = e.target.value;
                                setNewEntry({ ...newEntry, expenses: updated });
                              }}
                            />
                            <button
                              type="button"
                              className="btn btn-danger ms-2"
                              onClick={() => {
                                const updated = newEntry.expenses.filter((_, i) => i !== index);
                                setNewEntry({ ...newEntry, expenses: updated });
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => setNewEntry({ ...newEntry, expenses: [...newEntry.expenses, ''] })}
                        >
                          Add Expense
                        </button>
                      </div>


                    </>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button className="btn btn-success" onClick={handleAddEntry}>Save Entry</button>
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


export default LightbillOtherExpenses;


