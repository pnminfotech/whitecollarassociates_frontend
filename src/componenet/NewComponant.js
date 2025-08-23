import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit } from "react-icons/fa";
import { FaInfoCircle } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { FaBolt, FaReceipt, FaEye, FaTrash } from 'react-icons/fa'; // example icons
import { FaSearch } from 'react-icons/fa';
import { FaSignOutAlt, FaUndo, FaDownload } from "react-icons/fa";
import FormDownload from '../componenet/Maintanace/FormDownload';
import RoomManager from './RoomManager'; // adjust path if needed
// import { useNavigate } from 'react-router-dom';





function NewComponant() {
  const [formData, setFormData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roomsData, setRoomsData] = useState([]);

  // const [selectedWing, setSelectedWing] = useState('All Wings');
  const [selectedWing, setSelectedWing] = useState("All Wings");
  const [editingTenant, setEditingTenant] = useState(null);
  const [editRentAmount, setEditRentAmount] = useState('');
  const [editRentDate, setEditRentDate] = useState('');
  const [activeTab, setActiveTab] = useState('light');

  // const [activeTab, setActiveTab] = useState('light'); // 'light' or 'other'
  const [searchText, setSearchText] = useState('');
  const [leaveDates, setLeaveDates] = useState({});
  const [deletedData, setDeletedData] = useState([]);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [selectedLeaveDate, setSelectedLeaveDate] = useState('');
  const [currentLeaveId, setCurrentLeaveId] = useState(null);
  const [currentLeaveName, setCurrentLeaveName] = useState('');
  const [showRentModal, setShowRentModal] = useState(false);
  const [selectedRentDetails, setSelectedRentDetails] = useState([]);
  // const [selectedTenantName, setSelectedTenantName] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  ////form
  const [showFModal, setShowFModal] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [occupiedRoomsList, setOccupiedRoomsList] = useState([]);

  const [newTenant, setNewTenant] = useState({
    srNo: '',
    name: '',

    joiningDate: '',
    wing: '',
    roomNo: '',
    members: '',
    depositAmount: '',
    address: '',
    phoneNo: '',
    // relativeAddress1: '',
    // relativeAddress2: '',
    floorNo: '',
    adharFile: null,


  });
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [password, setPassword] = useState("");
  const [currentDeleteId, setCurrentDeleteId] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editTenantData, setEditTenantData] = useState(null);

  const [showDueModal, setShowDueModal] = useState(false);
  const [dueMonths, setDueMonths] = useState([]);
  const [selectedTenantName, setSelectedTenantName] = useState('');

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusMonths, setStatusMonths] = useState([]);
  const [statusTenantName, setStatusTenantName] = useState('');

  const [selectedYear, setSelectedYear] = useState('All Records');


  const [selectedBillId, setSelectedBillId] = useState(null);
  const [cashAmount, setCashAmount] = useState(0);
  const [onlineAmount, setOnlineAmount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);


  const [isSaving, setIsSaving] = React.useState(false);
  const [paymentStatus, setPaymentStatus] = React.useState(null); // "Paid" or "Pending"
  const [remainingAmount, setRemainingAmount] = React.useState(null);



  // calculate totals dynamically
  // const totalAmount = bills.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);











  const [monthlyBills, setMonthlyBills] = useState([]);



  const [dueAmountForModal, setDueAmountForModal] = useState(0);

  const [yearlyDataMap, setYearlyDataMap] = useState({});


  const fetchYearlySummary = async (tenantId, year) => {
    try {
      const res = await fetch(`${API_BASE}/monthly-bills/tenant/${tenantId}/summary?year=${year}`);
      const data = await res.json();
      setYearlyDataMap(prev => ({
        ...prev,
        [tenantId]: data,   // ✅ store only for this tenant
      }));
    } catch (err) {
      console.error("Fetch yearly bills error:", err);
    }
  };











  useEffect(() => {
    if (showDetailsModal && selectedTenant) {
      const year = new Date().getFullYear();
      fetch(`/api/monthly-bills/tenant/${selectedTenant._id}/summary?year=${year}`)
        .then(res => res.json())
        .then(data => {
          if (!selectedTenant?._id) return; // ✅ just stop if no tenant selected
          setYearlyDataMap(prev => ({
            ...prev,
            [selectedTenant._id]: data,
          }));
        })



        .catch(err => console.error("Fetch yearly bills error:", err));
    }
  }, [showDetailsModal, selectedTenant]);


  const getBillForTenant = (tenantId) => {
    if (!tenantId || !monthlyBills.length) return null;

    // Find all bills for this tenant (works for populated or plain tenantId)
    const billsForTenant = monthlyBills.filter(b =>
      b.tenantId?._id?.toString() === tenantId?.toString() ||
      b.tenantId?.toString() === tenantId?.toString()
    );

    if (!billsForTenant.length) return null;

    // Sort by created date (or any other timestamp you have)
    billsForTenant.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return billsForTenant[0]; // Most recent bill
  };

  const getTotalAmountFromBill = (tenantId) => {
    const bill = getBillForTenant(tenantId);
    return bill?.totalAmount ?? 0;
  };

  const getCashPaidAmount = (tenantId) => {
    const bill = getBillForTenant(tenantId);
    return bill?.cashPayment ?? 0;
  };

  const getOnlinePaidAmount = (tenantId) => {
    const bill = getBillForTenant(tenantId);
    return bill?.onlinePayment ?? 0;
  };

  const getRemainingAmountFromBill = (tenantId) => {
    const bill = getBillForTenant(tenantId);
    return bill?.remainingAmount ?? 0;
  };



  const findBillForTenant = (tenantId) => {
    return monthlyBills.find(
      b =>
        b.tenantId?._id?.toString() === tenantId?.toString() ||
        b.tenantId?.toString() === tenantId?.toString()
    ) || null;
  };






  const [selectedCash, setSelectedCash] = useState(0);
  const [selectedOnline, setSelectedOnline] = useState(0);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(null); // 0=Jan, 7=Aug etc.





  // tenant = tenant object
  // monthIndex = the row’s month (0=Jan ... 11=Dec)
  // cash, online = values from Room-wise tracker
  const handleOpenDetails = (tenant, monthIndex, cash, online) => {
    setSelectedTenant(tenant);
    setSelectedMonthIndex(monthIndex);
    setSelectedCash(Number(cash) || 0);
    setSelectedOnline(Number(online) || 0);
    setShowDetailsModal(true);
  };





  const updateMonthPayment = (tenantId, month, year, value, type) => {
    fetch(`/api/monthly-bills/tenant/${tenantId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        month,
        year,
        [type === "cash" ? "cashPayment" : "onlinePayment"]: Number(value)
      })
    })
      .then(res => res.json())
      .then(updated => {
        // Refresh state with updated bill
        setYearlyDataMap(prev => {
          const tenantData = prev[selectedTenant._id];
          if (!tenantData) return prev;

          const updatedBills = tenantData.bills.map(bill =>
            bill.month === updated.bill.month && bill.year === updated.bill.year
              ? updated.bill
              : bill
          );

          const summary = {
            totalAmount: updatedBills.reduce((sum, b) => sum + (b.totalAmount || 0), 0),
            paidAmount: updatedBills.reduce((sum, b) => sum + (b.paidAmount || 0), 0),
            cashPayment: updatedBills.reduce((sum, b) => sum + (b.cashPayment || 0), 0),
            onlinePayment: updatedBills.reduce((sum, b) => sum + (b.onlinePayment || 0), 0),
            remainingAmount: updatedBills.reduce((sum, b) => sum + (b.remainingAmount || 0), 0),
          };

          return {
            ...prev,
            [selectedTenant._id]: { ...tenantData, bills: updatedBills, summary },
          };
        });

      })
      .catch(err => console.error("Update payment error:", err));
  };





  const handleOpenPaymentModal = (tenant) => {
    setSelectedTenant(tenant);
    setIsModalOpen(true);

    // Fetch yearly summary immediately for this tenant
    const year = new Date().getFullYear();
    fetch(`/api/monthly-bills/tenant/${tenant._id}/summary?year=${year}`)
      .then(res => res.json())
      .then(data => {
        setYearlyDataMap(prev => ({
          ...prev,
          [tenant._id]: data,
        }));
      })
      .catch(err => console.error("Error fetching rent history:", err));
  };




  const getWingTotals = () => {
    let totalCash = 0;
    let totalOnline = 0;
    let totalOverall = 0;

    formData.forEach(tenant => {
      // ✅ Extract wing from roomNo (first char, e.g., A101 → A)
      const roomNo = tenant.roomNo?.toString().trim().toUpperCase() || '';
      const derivedWing = roomNo.charAt(0);

      if (selectedWing === "All Wings" || derivedWing === selectedWing.toUpperCase()) {
        const bill = findBillForTenant(tenant._id);

        const rent = Number(getLatestRentAmount(tenant)) || 0;
        const light = Number(getLatestLightBillAmount(tenant.roomNo)) || 0;
        const total = bill?.totalAmount ?? (rent + light);

        const cash = bill?.cashPayment ?? 0;
        const online = bill?.onlinePayment ?? 0;


        totalCash += bill?.cashPayment ?? 0;
        totalOnline += bill?.onlinePayment ?? 0;
        totalOverall += cash + online;
      }
    });

    return { totalCash, totalOnline, totalOverall };
  };




  const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];




  // ---------- Helpers (paste above return in your component) ----------
  const monthNames = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

  // Finds a bill in monthlyBills for a tenant + monthDate
  const getBillForTenantMonth = (tenantId, monthDate) => {
    if (!monthlyBills || !tenantId) return null;
    const monthStr = monthNames[monthDate.getMonth()]; // 0 -> "jan", 7 -> "aug"
    const year = monthDate.getFullYear();
    return (
      monthlyBills.find(
        (b) =>
          String(b.tenantId) === String(tenantId) &&
          String(b.month).toLowerCase() === monthStr &&
          Number(b.year) === Number(year)
      ) || null
    );
  };

  // Get recorded rent for the tenant for that month from tenant.rents
  const getRentForMonth = (tenant, monthDate) => {
    if (!tenant) return 0;
    const m = monthDate.getMonth();
    const y = monthDate.getFullYear();
    const entry = (tenant?.rents || []).find((r) => {
      const d = new Date(r.date);
      return d.getMonth() === m && d.getFullYear() === y;
    });
    return Number(entry?.rentAmount || 0);
  };

  // Compute display values for a tenant & monthDate
  const getDisplayForMonth = (tenant, tenantId, monthDate) => {
    const bill = getBillForTenantMonth(tenantId, monthDate);

    const cash = Number(bill?.cashPayment || 0);
    const online = Number(bill?.onlinePayment || 0);

    // If bill exists, paidAmount = cash + online (ignore DB paidAmount if it's always 0)
    const paidAmount = bill ? (cash + online) : 0;

    const expectedRent = getRentForMonth(tenant, monthDate);
    const displayTotal = bill ? paidAmount : expectedRent;

    // Status logic
    const joiningDate = tenant?.joiningDate ? new Date(tenant.joiningDate) : null;
    const rentStartMonth = joiningDate ? new Date(joiningDate.getFullYear(), joiningDate.getMonth(), 1) : null;
    const isBeforeRentStart = rentStartMonth ? monthDate < rentStartMonth : false;
    const isFutureMonth = monthDate > new Date();

    let status;
    if (isBeforeRentStart) status = "na";
    else if (bill) {
      status = Number(bill.remainingAmount || 0) > 0 ? "partial" : "paid";
    } else if (isFutureMonth) status = "upcoming";
    else if (expectedRent > 0) status = "pending";
    else status = "na";

    return { bill, cash, online, paidAmount, expectedRent, displayTotal, status };
  };


  // Totals for year (sums displayTotal/cash/online across 12 months, using same logic as table rows)
  const getTotalsForYear = (tenantId, tenant, year) => {
    let total = 0, cash = 0, online = 0;
    for (let i = 0; i < 12; i++) {
      const md = new Date(year, i, 1);
      const vals = getDisplayForMonth(tenant, tenantId, md);
      total += Number(vals.displayTotal || 0);
      cash += Number(vals.cash || 0);
      online += Number(vals.online || 0);
    }
    return { total, cash, online };
  };












  // const getPaymentsForMonth = (tenantId, monthDate) => {
  //   const monthKey = monthDate.toLocaleString("default", { month: "short" }).toLowerCase(); // e.g. "aug"
  //   const yearKey = monthDate.getFullYear();

  //   const bill = monthlyBills.find(
  //     b =>
  //       String(b.tenantId) === String(tenantId) &&   // 🔹 force both to string
  //       b.month?.toLowerCase() === monthKey &&
  //       Number(b.year) === yearKey
  //   );

  //   if (!bill) {
  //     return { cash: 0, online: 0, total: 0, status: "pending" };
  //   }

  //   return {
  //     cash: bill.cashPayment ?? 0,
  //     online: bill.onlinePayment ?? 0,
  //     total: bill.paidAmount ?? 0,
  //     status: bill.status ?? "pending"
  //   };
  // };








  // const getCashPaidAmount = (tenantId) => {
  //   const bill = monthlyBills.find(b => b.tenantId === tenantId);
  //   return bill?.cashPayment || 0;
  // };
  // const getTotalAmountFromBill = (tenantId) => {
  //   const bill = monthlyBills.find(b => {
  //     if (b.tenantId && typeof b.tenantId === "object" && b.tenantId._id) {
  //       return b.tenantId._id.toString() === tenantId.toString();
  //     }
  //     return b.tenantId?.toString() === tenantId.toString();
  //   });
  //   console.log("Searching totalAmount for tenant:", tenantId, "→ Found bill:", bill);
  //   return bill?.totalAmount ?? 0;
  // };


  // const getRemainingAmountFromBill = (tenantId) => {
  //   const bill = monthlyBills.find(
  //     b => b.tenantId?._id === tenantId || b.tenantId === tenantId
  //   );
  //   return bill?.remainingAmount ?? 0;
  // };


  // const getOnlinePaidAmount = (tenantId) => {
  //   const bill = monthlyBills.find(b => b.tenantId === tenantId);
  //   return bill?.onlinePayment || 0;
  // };

  const getRemainingAmount = (tenantId) => {
    const bill = monthlyBills.find(b => b.tenantId === tenantId);
    return bill?.remainingAmount ?? 0;
  };





  // Make sure you have these helpers/variables in scope:
  // - selectedTenant, selectedMonthIndex, cashAmount, onlineAmount
  // - setIsSaving, setYearlyData, setIsModalOpen, setPaymentStatus, setRemainingAmount
  // - monthNames: ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec']
  // - getLatestRentAmount(selectedTenant) and getLatestLightBillAmount(roomNo) if you want POST fallback

  const API_BASE = "https://whitecollarassociates.onrender.com/api";

  const handleSavePayment = async () => {
    if (!selectedTenant) return;
    if (cashAmount === undefined || onlineAmount === undefined) return;

    setIsSaving(true);

    try {
      const year = new Date().getFullYear();
      const monthIndex = Number.isInteger(selectedMonthIndex)
        ? selectedMonthIndex
        : new Date().getMonth();

      const month = (monthNames?.[monthIndex] || "").toLowerCase();
      if (!month) throw new Error("Invalid month selected");

      const cash = Number(cashAmount) || 0;
      const online = Number(onlineAmount) || 0;

      // 1) Try to update existing monthly bill (PUT)
      let res = await fetch(`${API_BASE}/monthly-bills/tenant/${selectedTenant._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month, year, cashPayment: cash, onlinePayment: online }),
      });

      // 2) If bill doesn't exist yet (404), create it (POST) with rent+light
      if (res.status === 404) {
        const rent = Number(getLatestRentAmount(selectedTenant)) || 0;
        const lightVal = getLatestLightBillAmount(selectedTenant.roomNo);
        const light = lightVal ? Number(lightVal) : 0;

        res = await fetch(`${API_BASE}/monthly-bills`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tenantId: selectedTenant._id,
            roomNo: selectedTenant.roomNo,
            month,
            year,
            rentAmount: rent,
            lightBillAmount: light,
            cashPayment: cash,
            onlinePayment: online,
          }),
        });
      }

      if (!res.ok) {
        const text = await res.text();
        console.error("Backend error:", text);
        throw new Error("Failed to save payment");
      }

      // 3) Refresh yearly summary for just this tenant
      const summaryRes = await fetch(
        `${API_BASE}/monthly-bills/tenant/${selectedTenant._id}/summary?year=${year}`
      );

      if (!summaryRes.ok) {
        const text = await summaryRes.text();
        console.error("Summary fetch error:", text);
        throw new Error("Failed to refresh yearly summary");
      }

      const summaryData = await summaryRes.json();
      setYearlyDataMap(prev => ({
        ...prev,
        [selectedTenant._id]: summaryData,
      }));
      // updates Rent History UI

      // Optional: Keep modal open; show status+remaining
      const totalForMonth = (() => {
        const bill = summaryData.bills.find(b => b.month === month);
        return (bill?.totalAmount || 0);
      })();
      const paidNow = cash + online;
      const remainingNow = Math.max((totalForMonth || 0) - paidNow, 0);

      setPaymentStatus(remainingNow === 0 ? "Paid" : paidNow > 0 ? "Partial" : "Pending");
      setRemainingAmount(remainingNow);

      alert(`✅ Payment saved for ${month.toUpperCase()} ${year} (Tenant: ${selectedTenant.name})`);

      // If you want to close modal after save, uncomment:
      // setIsModalOpen(false);
    } catch (err) {
      console.error("Error saving payment:", err);
      alert("❌ Failed to save payment");
    } finally {
      setIsSaving(false);
    }
  };



  // Make sure this is correct
  const apiUrl1 = "https://whitecollarassociates.onrender.com/api/monthly-bills/";

  const handleSaveStatus = async () => {
    if (!selectedTenant?._id) {
      alert("No tenant selected");
      return;
    }

    // ✅ Use safe ID match
    const bill = findBillForTenant(selectedTenant._id);

    if (!bill) {
      alert("Bill not found for this tenant");
      return;
    }

    setIsSaving(true);

    try {
      const res = await axios.put(`${apiUrl1}${bill._id}`, {
        cashPayment: cashAmount,
        onlinePayment: onlineAmount,
      });

      const updatedBill = res.data.bill;
      setMonthlyBills(prev =>
        prev.map(b => (b._id === updatedBill._id ? updatedBill : b))
      );

      setIsModalOpen(false);
      alert("Payment updated successfully!");
    } catch (error) {
      alert("Failed to save status");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };





  const fetchAllTenants = async () => {
    try {
      const res = await axios.get('https://whitecollarassociates.onrender.com/api/tenants');
      setFormData(res.data);
    } catch (err) {
      console.error('Error fetching tenants:', err);
    }
  };
  const fetchRooms = async () => {
    try {
      const res = await axios.get('https://whitecollarassociates.onrender.com/api/rooms'); // full backend URL
      setRoomsData(res.data);
    } catch (err) {
      console.error('Error fetching rooms:', err);
    }
  };



  const getLatestLightBillAmount = (roomNo) => {
    const billsForRoom = lightBills.filter(bill => bill.roomNo === roomNo);

    if (billsForRoom.length === 0) return 0;

    const latest = billsForRoom.reduce((latestBill, current) => {
      return new Date(current.date) > new Date(latestBill.date) ? current : latestBill;
    });

    return latest.amount || 0;
  };


  const getLatestRentAmount = (tenant) => {
    if (!tenant.rents || tenant.rents.length === 0) return 0;

    const latest = tenant.rents.reduce((a, b) => {
      return new Date(a.date) > new Date(b.date) ? a : b;
    });

    return latest.rentAmount || 0;
  };




  const getLatestTotalAmountForTenant = (roomNo) => {
    // Latest Rent
    const tenant = formData.find(t => t.roomNo === roomNo);
    const latestRent = tenant?.rents?.length
      ? tenant.rents.slice().sort((a, b) => new Date(b.date) - new Date(a.date))[0]?.rentAmount || 0
      : 0;

    // Latest Light Bill
    const billsForRoom = lightBills.filter(b => b.roomNo === roomNo);
    const latestLightBill = billsForRoom.length
      ? billsForRoom.sort((a, b) => new Date(b.date) - new Date(a.date))[0]?.amount || 0
      : 0;

    return latestRent + latestLightBill;
  };





  // const getCashPaidAmount = (tenantId) => {
  //   const bill = monthlyBills.find((b) => b.tenantId === tenantId);
  //   return bill?.cashPayment || 0;
  // };

  // const getOnlinePaidAmount = (tenantId) => {
  //   const bill = monthlyBills.find((b) => b.tenantId === tenantId);
  //   return bill?.onlinePayment || 0;
  // };




  const getLatestLightBillForTenant = (roomNo) => {
    const bills = lightBills
      .filter(bill => String(bill.roomNo).trim().toUpperCase() === String(roomNo).trim().toUpperCase())
      .sort((a, b) => new Date(b.month) - new Date(a.month));

    return bills.length > 0 ? bills[0].lightAmount : null;
  };



  const [lightBills, setLightBills] = useState([]);

  useEffect(() => {
    fetchLightBills();
  }, []);

  const fetchLightBills = async () => {
    try {
      const res = await axios.get(`${apiUrl}light-bill/all`);
      setLightBills(res.data);
    } catch (error) {
      console.error("Failed to fetch light bills:", error);
    }
  };

  useEffect(() => {
    axios.get('https://whitecollarassociates.onrender.com/api/monthly-bills/monthly')
      .then(res => setMonthlyBills(res.data))
      .catch(err => console.error(err));
  }, []);

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [roomNo, setRoomNo] = useState("");
  const [errors, setErrors] = useState({});


  const [wing, setWing] = useState('');
  const [floor, setFloor] = useState('');




  const years = ['All Records', ...Array.from(new Set(
    formData.map(d => new Date(d.joiningDate).getFullYear())
  )).sort((a, b) => b - a)];


  // const fetchSrNo = async () => {
  //   try {
  //     const response = await axios.get(`${apiUrl}forms/count`);
  //     setNewTenant(prev => ({ ...prev, srNo: response.data.nextSrNo }));
  //   } catch (error) {
  //     console.error("Error fetching Sr No:", error);
  //   }
  // };

  const openAddModal = () => {
    // fetchSrNo();

    setShowAddModal(true);
  };

  const apiUrl = 'https://whitecollarassociates.onrender.com/api/';
  const correctPassword = "5757";



  const fetchTotalAmountAndGenerate = async () => {
    try {
      // 1. Fetch total amount from your backend
      const totalAmountResponse = await axios.get(`${apiUrl}totalAmount`);
      const totalAmount = totalAmountResponse.data.amount;

      console.log("Total amount fetched:", totalAmount);

      // 2. Call generate API with totalAmount or any other data
      const generateResponse = await axios.post(`${apiUrl1}generate`, {
        amount: totalAmount,
        // add other data if needed
      });

      console.log("Generate API response:", generateResponse.data);

      alert("Generation successful!");
    } catch (error) {
      console.error("Error fetching amount or generating:", error);
    }
  };










  const roomData = [



    // Wing A - 16 Rooms (4 floors × 4 rooms)
    { wing: 'A', floor: 1, roomNo: 'A101' },
    { wing: 'A', floor: 1, roomNo: 'A102' },
    { wing: 'A', floor: 1, roomNo: 'A103' },
    { wing: 'A', floor: 1, roomNo: 'A104' },
    { wing: 'A', floor: 2, roomNo: 'A201' },
    { wing: 'A', floor: 2, roomNo: 'A202' },
    { wing: 'A', floor: 2, roomNo: 'A203' },
    { wing: 'A', floor: 2, roomNo: 'A204' },
    { wing: 'A', floor: 3, roomNo: 'A301' },
    { wing: 'A', floor: 3, roomNo: 'A302' },
    { wing: 'A', floor: 3, roomNo: 'A303' },
    { wing: 'A', floor: 3, roomNo: 'A304' },
    { wing: 'A', floor: 4, roomNo: 'A401' },
    { wing: 'A', floor: 4, roomNo: 'A402' },
    { wing: 'A', floor: 4, roomNo: 'A403' },
    { wing: 'A', floor: 4, roomNo: 'A404' },




    // Wing B - 16 Rooms
    { wing: 'B', floor: 1, roomNo: 'B101' },
    { wing: 'B', floor: 1, roomNo: 'B102' },
    { wing: 'B', floor: 1, roomNo: 'B103' },
    { wing: 'B', floor: 1, roomNo: 'B104' },
    { wing: 'B', floor: 2, roomNo: 'B201' },
    { wing: 'B', floor: 2, roomNo: 'B202' },
    { wing: 'B', floor: 2, roomNo: 'B203' },
    { wing: 'B', floor: 2, roomNo: 'B204' },
    { wing: 'B', floor: 3, roomNo: 'B301' },
    { wing: 'B', floor: 3, roomNo: 'B302' },
    { wing: 'B', floor: 3, roomNo: 'B303' },
    { wing: 'B', floor: 3, roomNo: 'B304' },
    { wing: 'B', floor: 4, roomNo: 'B401' },
    { wing: 'B', floor: 4, roomNo: 'B402' },
    { wing: 'B', floor: 4, roomNo: 'B403' },
    { wing: 'B', floor: 4, roomNo: 'B404' },


    // Wing K - 16 Rooms
    { wing: 'K', floor: 1, roomNo: 'K101' },
    { wing: 'K', floor: 1, roomNo: 'K102' },
    { wing: 'K', floor: 1, roomNo: 'K103' },
    { wing: 'K', floor: 1, roomNo: 'K104' },
    { wing: 'K', floor: 2, roomNo: 'K201' },
    { wing: 'K', floor: 2, roomNo: 'K202' },
    { wing: 'K', floor: 2, roomNo: 'K203' },
    { wing: 'K', floor: 2, roomNo: 'K204' },
    { wing: 'K', floor: 3, roomNo: 'K301' },
    { wing: 'K', floor: 3, roomNo: 'K302' },
    { wing: 'K', floor: 3, roomNo: 'K303' },
    { wing: 'K', floor: 3, roomNo: 'K304' },


    { wing: 'K', floor: 4, roomNo: 'K401' },
    { wing: 'K', floor: 4, roomNo: 'K402' },
    { wing: 'K', floor: 4, roomNo: 'K403' },
    { wing: 'K', floor: 4, roomNo: 'K404' },

    { wing: 'A', floor: 0, roomNo: 'A99' },
    { wing: 'A', floor: 0, roomNo: 'A100' },
    { wing: 'K', floor: 0, roomNo: 'K99' }

  ];





  const [selectedFloor, setSelectedFloor] = useState("");

  const filteredRooms = roomData.filter((room) => {
    const wingMatch = selectedWing ? room.wing === selectedWing : true;
    const floorMatch = selectedFloor
      ? room.floor === parseInt(selectedFloor)
      : true;
    return wingMatch && floorMatch;
  });



  const [existingTenants, setExistingTenants] = useState([]);




  const getFloorOptions = (selectedWing) => {
    const floors = [1, 2, 3, 4]; // regular floors
    const options = floors.map(f => <option key={f} value={f}>Floor {f}</option>);

    // Add Ground floor only for A and K
    if (selectedWing === 'A' || selectedWing === 'K') {
      options.unshift(<option key="0" value="0">Ground</option>);
    }

    return options;
  };










  // Filter rooms for selected wing
  // Make sure roomsData, formData, and selectedWing are available
  // Filter rooms for selected wing; if no wing is selected, fall back to all rooms
  const roomsInWing = selectedWing
    ? roomsData.filter(
      (room) =>
        room.wing?.toString().trim().toLowerCase() ===
        selectedWing?.toString().trim().toLowerCase()
    )
    : roomsData;


  // Check what room numbers are assigned from tenants
  const assignedRoomNos = formData
    .map((tenant) => tenant.roomNo)
    .filter(Boolean) // remove undefined/null
    .map((roomNo) => String(roomNo).trim()); // normalize

  // Occupied: rooms assigned to tenants
  const occupiedRoomList = roomsInWing.filter((room) =>
    assignedRoomNos.includes(String(room.roomNo).trim())
  );

  // Vacant: rooms not assigned to tenants
  const vacantRoomList = roomsInWing.filter((room) =>
    !assignedRoomNos.includes(String(room.roomNo).trim())
  );

  // Count
  const totalRooms = roomsInWing.length;
  const occupiedRooms = occupiedRoomList.length;
  const vacantRooms = vacantRoomList.length;




  // Debug log

  // const filteredRooms = roomsData
  //   .filter((room) => room.wing === newTenant.wing && room.floor === Number(newTenant.floorNo))
  //   .map((room) => {
  //     const isOccupied = formData.some(
  //       (tenant) => String(tenant.roomNo) === String(room.roomNo)
  //     );
  //     return (
  //       <option
  //         key={room.roomNo}
  //         value={room.roomNo}
  //         disabled={isOccupied}
  //       >
  //         {room.roomNo} ({isOccupied ? 'Occupied' : 'Vacant'})
  //       </option>
  //     );
  //   })



  useEffect(() => {
    axios.get(`${apiUrl}forms`) // replace with your actual tenant API route
      .then((res) => setExistingTenants(res.data))
      .catch((err) => console.error('Error fetching tenants:', err));
  }, []);



  useEffect(() => {
    axios
      .get(`${apiUrl}forms`) // GET https://whitecollarassociates.onrender.com/api/forms
      .then((response) => {
        setFormData(response.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch data');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    axios.get(`${apiUrl}forms`)
      .then(response => {
        const leaveMap = {};
        response.data.forEach(item => {
          if (item.leaveDate) {
            leaveMap[item._id] = new Date(item.leaveDate).toISOString().split("T")[0];
          }
        });
        setLeaveDates(leaveMap);
      })
      .catch(err => console.error("Error fetching leave data:", err));
  }, []);
  useEffect(() => {
    axios.get(`${apiUrl}forms/archived`)
      .then(response => setDeletedData(response.data))
      .catch(err => console.error("Error fetching archived tenants:", err));
  }, []);
  useEffect(() => {
    fetchRooms();
    fetchAllTenants();

    axios.get('https://whitecollarassociates.onrender.com/api/rooms')
      .then(response => setRoomsData(response.data))
      .catch(err => console.error("Failed to fetch rooms:", err));
  }, []);


  const NewComponant = () => {
    const navigate = useNavigate();



    return (
      <div>
        <h1>Welcome</h1>

        <button onClick={() => navigate('/TenantData')}>
          Tenant Data
        </button>
      </div>
    );
  };

  <button
    onClick={() => navigate('https://whitecollarassociates.onrender.com/api/monthly-bills')}
    style={{
      padding: '10px 20px',
      margin: '10px 0',
      backgroundColor: '#28a745',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer'
    }}
  >
    Monthly Bills
  </button>



  useEffect(() => {
    axios.get('https://whitecollarassociates.onrender.com/api/available-rooms')
      .then(response => {
        if (response.data.occupiedRooms) {
          setOccupiedRoomsList(response.data.occupiedRooms);
        }
      })
      .catch(error => {
        console.error("Error fetching occupied rooms:", error);
      });
  }, []);




  useEffect(() => {
    if (!selectedTenant) return;

    const rent = Number(getLatestRentAmount(selectedTenant)) || 0;
    const lightValue = getLatestLightBillAmount(selectedTenant.roomNo);
    const light = lightValue ? Number(lightValue) : 0;
    const total = rent + light;

    const paid = (cashAmount || 0) + (onlineAmount || 0);
    const remaining = total - paid;

    setRemainingAmount(remaining);

    if (remaining <= 0) {
      setPaymentStatus('Paid');
    } else {
      setPaymentStatus('Pending');
    }
  }, [cashAmount, onlineAmount, selectedTenant]);









  const validateForm = () => {
    const newErrors = {};

    if (!newTenant.name || !newTenant.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!newTenant.phoneNo || !newTenant.phoneNo.trim()) {
      newErrors.phoneNo = "Phone number is required";
    }

    if (!newTenant.roomNo || !newTenant.roomNo.trim()) {
      newErrors.roomNo = "Room number is required";
    }

    if (!newTenant.members || newTenant.members <= 0) {
      newErrors.members = "Members must be greater than 0";
    }

    if (!newTenant.address || !newTenant.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!newTenant.depositAmount || newTenant.depositAmount <= 0) {
      newErrors.depositAmount = "Deposit amount must be greater than 0";
    }

    if (!newTenant.joiningDate) {
      newErrors.joiningDate = "Joining date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };



  // === Global occupancy/vacancy based on roomData ===
  const activeTenants = formData.filter(t => !t.leaveDate && t.roomNo);
  const occupiedRoomSet = new Set(
    activeTenants.map(t => String(t.roomNo).trim())
  );
  const occupiedRoomsGlobal = occupiedRoomSet.size;

  // Use roomData for correct total rooms
  const totalRoomsGlobal = roomData.length;

  const vacantRoomsGlobal = Math.max(0, totalRoomsGlobal - occupiedRoomsGlobal);


  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'wing') {
      setWing(value);
      setFloor('');
      setRoomNo('');
      setNewTenant(prev => ({
        ...prev,
        wing: value,
        floorNo: '',
        roomNo: ''
      }));
    } else if (name === 'floor') {
      setFloor(value);
      setRoomNo('');
      setNewTenant(prev => ({
        ...prev,
        floorNo: value,
        roomNo: ''
      }));
    } else if (name === 'roomNo') {
      setRoomNo(value);
      setNewTenant(prev => ({
        ...prev,
        roomNo: value
      }));
    }
  };

  const handleAddTenant = async () => {
    if (!newTenant.name || !newTenant.address || !newTenant.joiningDate) {
      alert("Please fill in Name, Address, and Joining Date.");
      return;
    }

    if (isNaN(newTenant.members) || Number(newTenant.members) <= 0) {
      alert("Please enter a valid number for Family Members.");
      return;
    }

    try {
      const formDataObj = new FormData();

      for (const key in newTenant) {
        if (
          key !== 'adharFile' &&
          newTenant[key] !== undefined &&
          newTenant[key] !== null
        ) {
          formDataObj.append(key, newTenant[key]);
        }
      }

      if (newTenant.adharFile) {
        formDataObj.append('adharFile', newTenant.adharFile);
      }

      // Add tenant API call
      const response = await axios.post(`${apiUrl}forms`, formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const newTenantData = response.data;

      // ✅ Instantly update UI without waiting
      setFormData(prev => [...prev, newTenantData]);

      alert('Tenant added successfully!');
      // Reload current page
      window.location.reload();

      // ✅ Generate monthly bills
      try {
        await axios.post('https://whitecollarassociates.onrender.com/api/monthly-bills/generate');
      } catch (genErr) {
        console.error('Generate API error:', genErr);
      }

      // ✅ Delay backend sync so DB has time to save
      setTimeout(() => {
        fetchAllTenants();
      }, 300);

      setShowAddModal(false);
      setNewTenant({
        name: '',
        joiningDate: '',
        address: '',
        phoneNo: '',
        rentAmount: '',
        wing: '',
        roomNo: '',
        floorNo: '',
        members: '',
        depositAmount: '',
        adharFile: null,
      });

    } catch (error) {
      console.error("Add tenant error:", error);
      alert(error.response?.data?.message || "Failed to add tenant.");
    }
  };







  const getPendingMonthsForStatus = (rents = [], joiningDateStr) => {
    if (!joiningDateStr) return [];

    const now = new Date();
    const currentYear = now.getFullYear();

    // Map paid months
    const paidMonths = new Set(
      rents
        .filter(r => r.date && Number(r.rentAmount) > 0)
        .map(r => {
          const d = new Date(r.date);
          return `${d.getMonth()}-${d.getFullYear()}`;
        })
    );

    const months = [];
    const startMonth = new Date(currentYear, 0); // Jan of current year

    const joinDate = new Date(joiningDateStr);
    const startDate = joinDate > startMonth ? joinDate : startMonth;
    const tempDate = new Date(startDate);

    while (tempDate <= now) {
      const key = `${tempDate.getMonth()}-${tempDate.getFullYear()}`;
      if (!paidMonths.has(key)) {
        months.push(tempDate.toLocaleString('default', { month: 'long', year: 'numeric' }));
      }
      tempDate.setMonth(tempDate.getMonth() + 1);
    }

    return months;
  };



  const handleDownloadExcel = () => {
    const sheetData = formData.map(item => ({
      // SrNo: item.srNo,
      Name: item.name,
      Phone: item.phoneNo,

      members: item.members,
      JoiningDate: item.joiningDate,
      wing: item.wing,
      RoomNo: item.roomNo,
      FloorNo: item.floorNo,

      DepositAmount: item.depositAmount,
      BaseAmount: item.baseRent,
      Address: item.address,
      adharFile: item.adharFile
      // RelativeAddress1: item.relativeAddress1,
      // RelativeAddress2: item.relativeAddress2,


    }));

    const worksheet = XLSX.utils.json_to_sheet(sheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tenants");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "tenant_data.xlsx");
  };

  const getDisplayedRent = (rents = []) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    let current = null;
    let previous = null;

    rents.forEach(rent => {
      const date = new Date(rent.date);
      const m = date.getMonth();
      const y = date.getFullYear();

      if (m === currentMonth && y === currentYear) {
        current = rent;
      } else if (m === prevMonth && y === prevYear) {
        previous = rent;
      }
    });

    return { current, previous };
  };














  const calculateDue = (rents = [], joiningDateStr) => {
    if (!joiningDateStr) return 0;

    const now = new Date();
    const currentYear = now.getFullYear();
    const startOfYear = new Date(currentYear, 0, 1); // Jan 1 of current year
    const joinDate = new Date(joiningDateStr);
    const rentStart = new Date(joinDate.getFullYear(), joinDate.getMonth() + 1, 1);

    // Determine the actual starting month (either Jan or 1 month after joining)
    const startDate = rentStart > startOfYear ? rentStart : startOfYear;

    const tempDate = new Date(startDate);
    const paidMonths = new Set(
      rents
        .filter(r => r.date && Number(r.rentAmount) > 0)
        .map(r => {
          const d = new Date(r.date);
          return `${d.getMonth()}-${d.getFullYear()}`;
        })
    );

    const lastPaid = rents
      .filter(r => r.date && Number(r.rentAmount) > 0)
      .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

    const rentAmount = lastPaid ? Number(lastPaid.rentAmount) : 0;

    let dueCount = 0;

    // Go from startDate up to the current month of the current year
    while (tempDate <= now && tempDate.getFullYear() === currentYear) {
      const key = `${tempDate.getMonth()}-${tempDate.getFullYear()}`;
      if (!paidMonths.has(key)) {
        dueCount++;
      }
      tempDate.setMonth(tempDate.getMonth() + 1);
    }

    return rentAmount * dueCount;
  };


  const handleLeave = (tenant) => {
    setCurrentLeaveId(tenant._id);
    setCurrentLeaveName(tenant.name);
    setShowLeaveModal(true);
  };
  const confirmLeave = async () => {
    if (!selectedLeaveDate) {
      alert("Please select a leave date.");
      return;
    }

    try {
      const response = await axios.post(`${apiUrl}leave`, {
        formId: currentLeaveId,
        leaveDate: selectedLeaveDate,
      });

      if (response.data?.message) {
        alert(response.data.message);
        setLeaveDates((prev) => ({ ...prev, [currentLeaveId]: selectedLeaveDate }));
        setShowLeaveModal(false);
      } else {
        alert("Failed to mark leave.");
      }
    } catch (err) {
      console.error("Error setting leave:", err);
    }
  };

  const getDueMonths = (rents = [], joiningDateStr) => {
    if (!joiningDateStr) return [];

    const joiningDate = new Date(joiningDateStr);
    const startDate = new Date(joiningDate.getFullYear(), joiningDate.getMonth() + 1, 1);
    const now = new Date();
    const currentYear = now.getFullYear();

    const rentMap = new Map();
    rents.forEach(rent => {
      const d = new Date(rent.date);
      const key = `${d.getMonth()}-${d.getFullYear()}`;
      rentMap.set(key, true);
    });

    const months = [];
    const tempDate = new Date(startDate);

    while (tempDate <= now) {
      const year = tempDate.getFullYear();
      const month = tempDate.getMonth();
      const key = `${month}-${year}`;

      if (year === currentYear && !rentMap.has(key)) {
        months.push(tempDate.toLocaleString('default', { month: 'long', year: 'numeric' }));
      }

      tempDate.setMonth(tempDate.getMonth() + 1);
    }

    return months;
  };

  const handleEdit = (tenant) => {
    const { rentAmount, date } = getDisplayedRent(tenant.rents);
    setEditingTenant(tenant);
    setEditRentAmount(rentAmount);
    setEditRentDate(date || new Date().toISOString().split('T')[0]);
    // Reload current page



  };

  const handleDelete = async (tenant) => {
    try {
      // Determine current month-year key, matching how backend identifies rent
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const monthKey = `${currentMonth}-${currentYear}`; // format to match backend

      // Make sure you pass monthKey in URL or request body as per backend spec
      await axios.delete(`${apiUrl}form/${tenant._id}/rent/${monthKey}`);

      // Refresh data after delete
      const response = await axios.get(`${apiUrl}forms`);
      setFormData(response.data);
    } catch (error) {
      alert('Failed to delete rent: ' + (error.response?.data?.message || error.message));
    }
  };






  // formupdate

  const handleUndoClick = (tenant) => {
    if (!window.confirm(`Undo archive for ${tenant.name}?`)) return;

    axios
      .post(`${apiUrl}forms/restore`, { id: tenant._id })
      .then((response) => {
        const restored = response.data;
        setDeletedData((prev) => prev.filter((item) => item._id !== tenant._id));
        setFormData((prev) => [...prev, restored]);
      })
      .catch((error) => {
        console.error("Error restoring tenant:", error);
        alert("Failed to restore tenant.");
      });
  };
  const handleDownloadForm = async (tenant) => {
    try {
      const response = await axios.get(`${apiUrl}form/${tenant._id}`);
      const form = response.data;

      const formatted = [
        ["Field", "Value"],
        ["Name", form.name],
        ["Joining Date", new Date(form.joiningDate).toLocaleDateString()],
        ["Room No", form.roomNo],
        ["Deposit Amount", form.depositAmount],
        ["Leave Date", form.leaveDate ? new Date(form.leaveDate).toLocaleDateString() : "N/A"],
      ];

      if (form.rents && form.rents.length > 0) {
        formatted.push(["Rents", ""]);
        form.rents.forEach((rent, i) => {
          formatted.push([`Rent ${i + 1} Amount`, rent.rentAmount]);
          formatted.push([`Rent ${i + 1} Date`, new Date(rent.date).toLocaleDateString()]);
        });
      }

      const ws = XLSX.utils.aoa_to_sheet(formatted);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Tenant Data");
      XLSX.writeFile(wb, `Tenant_${tenant.name}.xlsx`);
    } catch (err) {
      console.error("Download failed", err);
      alert("Failed to download tenant data.");
    }
  };

  const handleTenantUpdate = async () => {
    try {
      const response = await axios.put(`${apiUrl}update/${editTenantData._id}`, editTenantData);
      alert("Tenant updated successfully!");

      // Replace updated tenant in list
      setFormData(prev =>
        prev.map(t => t._id === editTenantData._id ? response.data : t)
      );

      setShowEditModal(false);
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update tenant.");
    }
  };


  const openDeleteConfirmation = (tenantId) => {
    setCurrentDeleteId(tenantId);
    setShowPasswordPrompt(true); // Show password modal
  };
  const verifyPassword = () => {
    if (password === correctPassword) {
      setShowPasswordPrompt(false);
      setShowDeleteConfirmation(true);
    } else {
      alert("Incorrect password. Please try again.");
    }
  };
  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`${apiUrl}form/${currentDeleteId}`);
      setFormData(prev => prev.filter(t => t._id !== currentDeleteId));
      alert("Tenant deleted successfully.");
      setShowDeleteConfirmation(false);
    } catch (error) {
      console.error("Error deleting:", error);
      alert("Failed to delete tenant.");
    }
  };


  const showLastThreeRents = (tenant) => {
    const sortedRents = [...(tenant.rents || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
    const lastThree = sortedRents.slice(0, 3);
    setSelectedRentDetails(lastThree);
    setSelectedTenantName(tenant.name);
    setShowRentModal(true);
  };

  const handleSave = async () => {
    if (!editingTenant) return;
    try {
      const updatedData = {
        rentAmount: editRentAmount,
        date: editRentDate,
        month: new Date(editRentDate).toLocaleString('default', { month: 'short', year: '2-digit' })
      };

      const res = await axios.put(`${apiUrl}form/${editingTenant._id}`, updatedData);

      // ✅ Update local state (formData or whatever state holds tenant list)
      setFormData(prev =>
        prev.map(tenant =>
          tenant._id === editingTenant._id
            ? {
              ...tenant,
              rents: [...tenant.rents, updatedData]  // appending new rent data
            }
            : tenant
        )
      );

      setEditingTenant(null); // close modal or form

    } catch (error) {
      alert('Failed to update rent');
    }
  };

  const navigate = useNavigate();
  const handleNavigation = (path) => {
    navigate(path);
  };


  const [pendingRents, setPendingRents] = useState(0);

  useEffect(() => {
    if (!formData || !formData.length) return;

    const now = new Date();
    const count = formData.filter(t => {
      const lastRent = t.rents && t.rents.length ? t.rents[t.rents.length - 1] : null;
      if (!lastRent) return true;

      const rentDate = new Date(lastRent.date);
      return rentDate.getMonth() !== now.getMonth() || rentDate.getFullYear() !== now.getFullYear();
    }).length;

    setPendingRents(count);
  }, [formData]);









  const { totalCash, totalOnline, totalOverall } = getWingTotals();








  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (error) return <div className="text-center text-danger mt-5">{error}</div>;

  return (
    // <div className="container-fluid py-4" style={{ fontFamily: 'Inter, sans-serif' }}>
    <div className="container-fluid px-4 py-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* <h3 className="fw-bold mb-4">Rent & Deposite Tracker</h3> */}

      <h3
        className="fw-bold mb-4"
        style={{
          color: '#0d6efd',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
        onMouseOver={e => {
          e.target.style.color = '#084298';
          e.target.style.transform = 'scale(1.05)';
          e.target.style.textShadow = '0 0 8px rgba(13,110,253,0.5)';
        }}
        onMouseOut={e => {
          e.target.style.color = '#0d6efd';
          e.target.style.transform = 'scale(1)';
          e.target.style.textShadow = 'none';
        }}
      >
        Rent & Deposit Tracker
      </h3>




      <div className="d-flex align-items-center mb-4 flex-wrap">

        <button
          className="btn me-2"
          style={{
            backgroundColor: "#3db7b1",
            color: "white",
            border: "none",
            padding: "10px 16px",
            borderRadius: "6px",
            fontWeight: "bold",
            transition: "all 0.3s ease",
            boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
            cursor: "pointer"
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = "#319b96";
            e.target.style.transform = "scale(1.05)";
            e.target.style.boxShadow = "0 6px 12px rgba(0,0,0,0.3)";
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = "#3db7b1";
            e.target.style.transform = "scale(1)";
            e.target.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
          }}
          onClick={openAddModal}
        >
          <FaPlus className="me-1" /> Add Tenant
        </button>





        <button
          className="btn me-2"
          style={{
            ...(activeTab === 'light' ? style.colorA : style.colorB),
            transition: 'all 0.3s ease',
            border: 'none',
            borderRadius: '6px',
            padding: '10px 16px',
            fontWeight: 'bold',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            cursor: 'pointer',
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'scale(1.05)';
            e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = '0 2px 6px rgba(0,0,0,0.15)';
          }}
          onClick={() => {
            setActiveTab('light');
            navigate('/lightbillotherexpenses', { state: { tab: 'light' } });
          }}
        >
          <FaBolt className="me-1" />
          Light Bill
        </button>






        <button
          className="btn me-2"
          style={{
            backgroundColor: 'rgba(210, 204, 29, 0.38)',
            transition: 'all 0.3s ease',
            border: 'none',
            borderRadius: '6px',
            padding: '10px 16px',
            fontWeight: 'bold',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            cursor: 'pointer',
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'scale(1.05)';
            e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = '0 2px 6px rgba(0,0,0,0.15)';
          }}
          onClick={() => {

            navigate('/reports');
          }}
        >
          <FaReceipt className="me-1" />
          Report Generation
        </button>










        <button
          className="btn me-2"
          style={{
            ...style.successButton,
            transition: 'all 0.3s ease',
            borderRadius: '6px',
            fontWeight: 'bold',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            cursor: 'pointer'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'scale(1.05)';
            e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
            e.target.style.backgroundColor = '#28a745'; // darken on hover
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = '0 2px 6px rgba(0,0,0,0.15)';
            e.target.style.backgroundColor = style.successButton.backgroundColor;
          }}
          onClick={handleDownloadExcel}
        >
          <FaDownload className="me-1" />
          Download Excel
        </button>



        <button
          className="btn me-2"
          style={{
            ...(activeTab === 'light' ? style.colorA : style.colorB),
            transition: 'all 0.3s ease',
            border: 'none',
            borderRadius: '6px',
            padding: '10px 16px',
            fontWeight: 'bold',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            cursor: 'pointer',
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'scale(1.05)';
            e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = '0 2px 6px rgba(0,0,0,0.15)';
          }}
          onClick={() => {
            navigate('/TenantData');
          }}
        >
          <FaBolt className="me-1" />
          Tenant Data
        </button>



        <button
          className="btn me-2"
          style={{
            backgroundColor: "#3db7b1",
            color: "white",
            border: "none",
            padding: "10px 16px",
            borderRadius: "6px",
            fontWeight: "bold",
            transition: "all 0.3s ease",
            boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
            cursor: "pointer"
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = "#319b96";
            e.target.style.transform = "scale(1.05)";
            e.target.style.boxShadow = "0 6px 12px rgba(0,0,0,0.3)";
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = "#3db7b1";
            e.target.style.transform = "scale(1)";
            e.target.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
          }}
          onClick={() => {
            navigate('https://whitecollarassociates.onrender.com/api/monthly-bills');
          }}
        >
          <FaPlus className="me-1" /> MonthlyBills
        </button>








        <button
          className="btn me-2"
          style={{
            backgroundColor: "#483f3fab",
            color: "white",
            transition: "all 0.3s ease",
            borderRadius: "6px",
            fontWeight: "bold",
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            cursor: "pointer"
          }}
          onMouseOver={(e) => {
            e.target.style.transform = "scale(1.05)";
            e.target.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
          }}
          onMouseOut={(e) => {
            e.target.style.transform = "scale(1)";
            e.target.style.boxShadow = "0 2px 6px rgba(0,0,0,0.1)";
          }}
          onClick={() => handleNavigation('/maindashboard')}
        >
          <FaArrowLeft className="me-1" />
          Back
        </button>



      </div>



      <div className="row g-3 mb-4">
        <div className="col-md-2">
          <div className="bg-white border rounded shadow-sm p-3 text-center"
            style={{
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.1)';
            }}>
            <h6 className="text-muted mb-1">Total Rooms</h6>
            <h4 className="fw-bold">{totalRoomsGlobal}</h4>
          </div>
        </div>


        <div className="col-md-2">
          <div
            className="bg-white border rounded shadow-sm p-3 text-center"
            style={{
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.1)';
            }}
          >
            <h6 className="text-muted mb-1">Occupied</h6>
            <h4 className="fw-bold">
              {occupiedRoomsGlobal}

            </h4>
          </div>
        </div>



        <div className="col-md-2">
          <div className="bg-white border rounded shadow-sm p-3 text-center"
            style={{
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.1)';
            }}

          >
            <h6 className="text-muted mb-1">Vacant</h6>



            <h4 className="fw-bold text-danger">{vacantRoomsGlobal}</h4>
          </div>
        </div>
        {/* Pending Maintenance */}
        <div className="col-md-2">
          <div className="bg-white border rounded shadow-sm p-3 text-center"

            style={{
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.1)';
            }}

          >
            <h6 className="text-muted mb-1">Pending Rents</h6>
            <h4 className="fw-bold text-danger">{pendingRents}</h4>
          </div>



        </div>

        <div className="col-md-2">
          <div className="bg-white border rounded shadow-sm p-3 text-center"
            style={{
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.1)';
            }}
          >
            <h6 className="text-muted mb-1">Deposits</h6>
            <h4 className="fw-bold text-danger">{formData.filter(d => Number(d.depositAmount) > 0).length}</h4>
          </div>
        </div>




        <div className="mt-4 p-3 bg-light border rounded">
          <h6>
            {selectedWing === "All Wings" ? "All Wings" : `${selectedWing} Wing`} —{" "}
            {new Date().toLocaleString("default", { month: "long", year: "numeric" })}
          </h6>
          <p><strong>Total (Paid):</strong> ₹{totalOverall.toLocaleString("en-IN")}</p>
          <p className="text-success"><strong>Cash:</strong> ₹{totalCash.toLocaleString("en-IN")}</p>
          <p className="text-primary"><strong>Online:</strong> ₹{totalOnline.toLocaleString("en-IN")}</p>
        </div>






      </div>












      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="fw-bold mb-3">Room-wise Rent and Deposit Tracker</h5>
          <div className="mb-3 d-flex align-items-center">
            <label htmlFor="wingSelect" className="form-label me-2 mb-0 fw-semibold">Select Wing:</label>
            <select
              id="wingSelect"
              className="form-select w-auto"
              value={selectedWing}
              onChange={(e) => setSelectedWing(e.target.value)}
            >
              <option value="All Wings">All Wings</option>
              <option value="A">A Wing</option>
              <option value="B">B Wing</option>
              <option value="K">K Wing</option>
            </select>











          </div>

          <div className="table-responsive">
            <table className="table align-middle">
              <thead className="table-borderless">
                <tr className="fw-semibold text-secondary">
                  <th>RoomNo</th>
                  <th>Name</th>
                  <th>Deposit</th>
                  <th>Rent</th>
                  {/* <th>Rent Date</th> */}
                  <th>Due</th>
                  <th>Total Amount</th>

                  <th>Rent Status</th>
                  {/* <th>Deposit Status</th> */}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>

                {formData

                  .filter((tenant) => {
                    const name = tenant.name?.toLowerCase() || '';
                    const bed = tenant.bedNo?.toString() || '';
                    const joinYear = new Date(tenant.joiningDate).getFullYear();
                    const leaveDate = leaveDates[tenant._id];
                    const isLeaved = leaveDate && new Date(leaveDate) < new Date();

                    // ✅ Extract wing from roomNo (e.g., A101 → A)
                    const roomNo = tenant.roomNo?.toString().trim().toUpperCase() || '';
                    const derivedWing = roomNo.charAt(0); // First character

                    const matchesWing =
                      selectedWing === 'All Wings' || derivedWing === selectedWing.toUpperCase();








                    return (
                      !isLeaved &&
                      matchesWing &&
                      (name.includes(searchText.toLowerCase()) || bed.includes(searchText)) &&
                      (selectedYear === 'All Records' || joinYear === Number(selectedYear))
                    );
                  })








                  .map((tenant) => {
                    const { current, previous } = getDisplayedRent(tenant.rents);
                    const dueAmount = calculateDue(tenant.rents, tenant.joiningDate);
                    const depositCollected = Number(tenant.depositAmount) > 0;

                    return (
                      <tr key={tenant._id}>
                        <td>{tenant.roomNo} <div className="text-muted small">room {tenant.bedNo}</div></td>
                        <td>
                          <span
                            style={{ cursor: 'pointer', color: '#007bff' }}
                            onClick={() => {
                              setSelectedRowData(tenant);
                              setShowFModal(true);
                            }}
                          >
                            {tenant.name}
                            <br />

                            <small className="text-muted">
                              Rent: ₹{current?.rentAmount || (() => {
                                const room = roomsData.find(
                                  r => String(r.roomNo).trim() === String(tenant.roomNo).trim()
                                );
                                return room?.price || 0;
                              })()}
                            </small>


                            <div className="text-muted small">
                              {new Date(tenant.joiningDate).toLocaleDateString()}
                            </div>
                          </span>
                        </td>




                        {/* <td>{tenant.name} <div className="text-muted small">{new Date(tenant.joiningDate).toLocaleDateString()}</div></td> */}
                        <td>₹{Number(tenant.depositAmount || 0).toLocaleString('en-IN')}</td>
                        {/* <td>₹{rentAmount.toLocaleString('en-IN')}</td> */}
                        <td style={{ minWidth: "200px" }}>
                          <div className="d-flex justify-content-between align-items-start" onClick={() => handleEdit(tenant)} style={{ cursor: 'pointer' }}>


                            {previous ? (
                              <div className=" text-center">
                                <div>₹{Number(previous.rentAmount).toLocaleString('en-IN')}</div>
                                <small>{new Date(previous.date).toLocaleDateString('en-IN')}</small>
                              </div>
                            ) : (
                              <div className="text-danger text-center">
                                <div>--</div>
                                <small>(Prev)</small>
                              </div>
                            )}

                            {current ? (
                              <div className=" text-center me-2">
                                <div>₹{Number(current.rentAmount).toLocaleString('en-IN')}</div>
                                <small>{new Date(current.date).toLocaleDateString('en-IN')}</small>
                              </div>
                            ) : (
                              <div className="text-danger text-center me-2">
                                <div>--</div>
                                <small>(Current)</small>
                              </div>
                            )}
                          </div>
                        </td>



                        {/* <td>{rentDate ? new Date(rentDate).toLocaleDateString('en-IN') : '--'}</td> */}
                        <td style={{ cursor: 'pointer', color: dueAmount > 0 ? 'red' : 'inherit' }} onClick={() => {
                          const dueList = getDueMonths(tenant.rents, tenant.joiningDate);
                          setDueMonths(dueList);
                          setSelectedTenantName(tenant.name);
                          setShowDueModal(true);
                        }}>
                          ₹{dueAmount.toLocaleString('en-IN')}
                        </td>
                        <td
                          style={{ cursor: 'pointer', color: 'blue' }}
                          onClick={() => {
                            const bill = findBillForTenant(tenant._id);
                            setSelectedTenant(tenant);
                            setCashAmount(bill?.cashPayment || 0);
                            setOnlineAmount(bill?.onlinePayment || 0);
                            setIsModalOpen(true);
                          }}
                        >
                          ₹{(() => {
                            const bill = findBillForTenant(tenant._id);
                            if (bill && bill.totalAmount != null && bill.totalAmount !== 0) {
                              return bill.totalAmount.toLocaleString('en-IN');
                            }
                            // fallback calculation if no bill or totalAmount is missing
                            const rent = Number(getLatestRentAmount(tenant)) || 0;
                            const light = getLatestLightBillAmount(tenant.roomNo);
                            const lightAmount = light ? Number(light) : 0;

                            const total = rent + lightAmount;
                            return (total === rent ? rent : total).toLocaleString('en-IN');
                          })()}
                        </td>

                        <td>
                          {(() => {
                            const bill = findBillForTenant(tenant._id);

                            const rent = Number(getLatestRentAmount(tenant)) || 0;
                            const lightValue = getLatestLightBillAmount(tenant.roomNo);
                            const light = lightValue ? Number(lightValue) : 0;

                            const total = rent + light;

                            const cash = bill?.cashPayment ?? 0;
                            const online = bill?.onlinePayment ?? 0;

                            const remaining = Math.max(total - (cash + online), 0);

                            return (
                              <span
                                className={`badge rounded-pill px-3 py-2 ${remaining <= 0 ? "bg-success" : "bg-warning text-dark"
                                  }`}
                                style={{ cursor: remaining > 0 ? "pointer" : "default" }}
                                onClick={() => {
                                  setSelectedTenant(tenant);
                                  setCashAmount(cash);
                                  setOnlineAmount(online);
                                  setDueAmountForModal(remaining);
                                  setIsModalOpen(true);
                                }}
                              >
                                {remaining <= 0
                                  ? "Paid"
                                  : `Pending ₹${remaining.toLocaleString("en-IN")}`}
                              </span>
                            );
                          })()}
                        </td>









                        {/* <td>
            <span className={`badge rounded-pill px-3 py-2 ${depositCollected ? 'bg-success' : 'bg-warning text-dark'}`}>
              {depositCollected ? 'Collected' : 'Pending'}
            </span>
          </td> */}
                        <td>
                          <button className="btn btn-sm btn-outline-primary me-2" onClick={() => {
                            setEditTenantData(tenant);
                            setShowEditModal(true);
                          }}>
                            <FaEdit />
                          </button>

                          <button
                            style={{ backgroundColor: "#3db7b1", color: "white" }}
                            className="btn  btn-sm "
                            onClick={() => {
                              setSelectedTenant(tenant);
                              setShowDetailsModal(true);
                            }}>
                            <FaEye className="" />
                            {/* <FaInfoCircle className="me-2" />  */}

                          </button>

                          {/* <button className="btn btn-sm  me-2" onClick={() => handleLeave(tenant)} style={{ backgroundColor: "#f49f36", color: "white" }}>
                            <FaSignOutAlt />
                          </button> */}

                          <button className="btn btn-sm btn-danger" onClick={() => openDeleteConfirmation(tenant._id)}>
                            <FaTrash />
                          </button>

                          {leaveDates[tenant._id] && (
                            <div className="text-danger mt-1" style={{ fontSize: '12px' }}>
                              Leave on: {new Date(leaveDates[tenant._id]).toLocaleDateString('en-GB', {
                                day: '2-digit', month: 'short', year: 'numeric'
                              })}
                            </div>
                          )}

                        </td>
                      </tr>
                    );
                  })}
              </tbody>

            </table>



            {isModalOpen && selectedTenant && (
              <div
                className="modal-backdrop"
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "rgba(0,0,0,0.5)",
                  zIndex: 10,
                }}
              >
                <div
                  className="modal-content"
                  style={{
                    backgroundColor: "white",
                    padding: 20,
                    borderRadius: 10,
                    maxWidth: 420,
                    margin: "100px auto",
                  }}
                >
                  <h5>Payment Entry for {selectedTenant.name}</h5>

                  {/* Month Selector */}
                  <div className="mb-2">
                    <label>Select Month:</label>
                    <select
                      className="form-select"
                      value={
                        Number.isInteger(selectedMonthIndex)
                          ? selectedMonthIndex
                          : new Date().getMonth()
                      }
                      onChange={(e) => setSelectedMonthIndex(Number(e.target.value))}
                    >
                      {monthNames.map((m, i) => (
                        <option key={i} value={i}>
                          {m.toUpperCase()} {new Date().getFullYear()}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Cash Amount */}
                  <div className="mb-2">
                    <label>Cash Amount:</label>
                    <input
                      type="number"
                      className="form-control"
                      value={cashAmount ?? 0}
                      onChange={(e) => setCashAmount(Number(e.target.value) || 0)}
                      placeholder="Enter Cash Amount"
                    />
                  </div>

                  {/* Online Amount */}
                  <div className="mb-2">
                    <label>Online Amount:</label>
                    <input
                      type="number"
                      className="form-control"
                      value={onlineAmount ?? 0}
                      onChange={(e) => setOnlineAmount(Number(e.target.value) || 0)}
                      placeholder="Enter Online Amount"
                    />
                  </div>

                  {/* Totals (from your helpers) */}
                  <div className="mb-2">
                    <strong>
                      Total Rent + Light: ₹
                      {(() => {
                        const rent = Number(getLatestRentAmount(selectedTenant)) || 0;
                        const lightValue = getLatestLightBillAmount(selectedTenant.roomNo);
                        const light = lightValue ? Number(lightValue) : 0;
                        return (rent + light).toLocaleString("en-IN");
                      })()}
                    </strong>
                  </div>

                  {/* Pending preview */}
                  <div className="mb-2">
                    <strong>
                      Pending Amount: ₹
                      {(() => {
                        const rent = Number(getLatestRentAmount(selectedTenant)) || 0;
                        const lightValue = getLatestLightBillAmount(selectedTenant.roomNo);
                        const light = lightValue ? Number(lightValue) : 0;
                        const total = rent + light;
                        const paid = (cashAmount || 0) + (onlineAmount || 0);
                        return Math.max(total - paid, 0).toLocaleString("en-IN");
                      })()}
                    </strong>
                  </div>

                  {/* Buttons */}
                  <button
                    className="btn btn-success me-2"
                    onClick={handleSavePayment}
                    disabled={isSaving}
                  >
                    {isSaving ? "Saving..." : "Save"}
                  </button>

                  <button
                    className="btn btn-secondary"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </button>

                  {/* Status */}
                  {paymentStatus && (
                    <div style={{ marginTop: "1rem" }}>
                      <p>
                        Status:{" "}
                        <strong
                          className={
                            paymentStatus === "Paid" ? "text-success" : "text-danger"
                          }
                        >
                          {paymentStatus}
                        </strong>
                      </p>
                      <p>Remaining Amount: ₹{Number(remainingAmount || 0).toLocaleString("en-IN")}</p>
                    </div>
                  )}
                </div>
              </div>
            )}











            {deletedData.length > 0 && (
              <div className="mt-5">
                <h5 style={{ fontWeight: 'bold' }}>Leaved Tenants</h5>
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>Room No</th>
                      <th>Name</th>

                      <th>Joining Date</th>
                      <th>Leave Date</th>
                      {/* <th>Deposit</th> */}
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deletedData.map((tenant, index) => (
                      <tr key={index}>
                        {/* <td>{tenant.roomNo} <div className="text-muted small">bed {tenant.bedNo}</div></td>
                        <td style={{ cursor: 'pointer', }} onClick={() => showLastThreeRents(tenant)}>
                          {tenant.name}
                        </td> */}

                        <td>{new Date(tenant.joiningDate).toLocaleDateString()}</td>
                        <td>{new Date(tenant.leaveDate).toLocaleDateString()}</td>
                        {/* <td>₹{Number(tenant.depositAmount || 0).toLocaleString('en-IN')}</td> */}
                        <td>
                          <button className="btn btn-sm btn-success me-2" onClick={() => handleUndoClick(tenant)}>
                            <FaUndo />
                          </button>
                          <button className="btn btn-sm " style={{ backgroundColor: "#416ed7d1", color: "white" }} onClick={() => handleDownloadForm(tenant)}>
                            <FaDownload />
                          </button>



                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
              <div
                className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable"
                style={{ maxWidth: '95vw' }}
              >
                <div
                  className="modal-content"
                  style={{
                    borderRadius: '1rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    maxWidth: '900px',
                    margin: 'auto',
                    width: '100%',
                  }}
                >
                  {/* Header */}
                  <div
                    className="modal-header"
                    style={{
                      backgroundColor: 'rgb(94, 182, 92)',
                      color: 'white',
                      borderTopLeftRadius: '1rem',
                      borderTopRightRadius: '1rem',
                    }}
                  >
                    <h5
                      className="modal-title"
                      style={{ fontWeight: 'bold', width: '100%', textAlign: 'left' }}
                    >
                      🧾 Add New Tenant
                    </h5>
                    <button
                      type="button"
                      className="btn-close btn-close-white"
                      onClick={() => setShowAddModal(false)}
                    ></button>
                  </div>

                  {/* Body */}
                  <div
                    className="modal-body"
                    style={{
                      maxHeight: '85vh',
                      overflowY: 'auto',
                      padding: '1.5rem',
                    }}
                  >
                    <div className="container-fluid">
                      <div className="row g-3">
                        {[
                          { label: 'Name', key: 'name' },
                          { label: 'Family Members', key: 'members', type: 'number' },
                          { label: 'Joining Date', key: 'joiningDate', type: 'date' },
                          { label: 'Deposit Amount', key: 'depositAmount', type: 'number' },
                          { label: 'Phone No', key: 'phoneNo' },
                          { label: 'Address', key: 'address' },
                          { label: 'Rent Amount', key: 'rentAmount', type: 'number' },
                        ].map(({ label, key, type = 'text', readOnly = false }) => (
                          <div
                            className="col-12 col-md-6"
                            key={key}
                            style={{ display: 'flex', flexDirection: 'column' }}
                          >
                            <label style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                              {label}
                            </label>
                            <input
                              type={type}
                              className="form-control"
                              style={{
                                boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                              }}
                              value={newTenant[key] || ''}
                              readOnly={readOnly}
                              maxLength={key === 'phoneNo' ? 10 : undefined}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (key === 'phoneNo') {
                                  if (/^\d{0,10}$/.test(value)) {
                                    setNewTenant({ ...newTenant, [key]: value });
                                  }
                                } else {
                                  setNewTenant({ ...newTenant, [key]: value });
                                }
                              }}
                            />
                          </div>
                        ))}

                        {/* Aadhaar Upload */}
                        <div className="col-12 col-md-6">
                          <label style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                            Upload Aadhaar (PDF)
                          </label>
                          <input
                            type="file"
                            className="form-control"
                            accept=".pdf,.jpg,.jpeg,.png"
                            style={{
                              boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                            }}
                            onChange={(e) =>
                              setNewTenant({
                                ...newTenant,
                                adharFile: e.target.files[0],
                              })
                            }
                          />
                        </div>

                        {/* Wing */}
                        <div className="col-12 col-md-6">
                          <label style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                            Select Wing
                          </label>
                          <select
                            name="wing"
                            className="form-select"
                            value={newTenant.wing || ''}
                            style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}
                            onChange={(e) =>
                              setNewTenant({
                                ...newTenant,
                                wing: e.target.value,
                                floor: '',
                                roomNo: '',
                              })
                            }
                          >
                            <option value="">Select Wing</option>
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="K">K</option>
                          </select>
                        </div>

                        {/* Floor */}
                        <div className="col-12 col-md-6">
                          <label style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                            Select Floor
                          </label>
                          <select
                            name="floor"
                            className="form-select"
                            value={newTenant.floorNo || ''}
                            style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}
                            onChange={(e) =>
                              setNewTenant({
                                ...newTenant,
                                floorNo: e.target.value,
                                roomNo: '',
                              })
                            }
                            disabled={!newTenant.wing} // Disabled until wing is selected
                          >
                            <option value="">Select Floor</option>
                            <option value="1">1st</option>
                            <option value="2">2nd</option>
                            <option value="3">3rd</option>
                            <option value="4">4th</option>
                            {/* Add Ground floor only for A and K wings */}
                            {newTenant.wing === 'A' || newTenant.wing === 'K' ? (
                              <option value="0">Ground</option>
                            ) : null}
                          </select>
                        </div>


                        {/* Room */}
                        <div className="col-12 col-md-6">
                          <label style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                            Select Room
                          </label>
                          <select
                            className="form-select"
                            name="roomNo"
                            value={newTenant.roomNo}
                            style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}
                            onChange={handleChange}
                            required
                          >
                            <option value="">Select Room</option>
                            {roomData
                              .filter((room) => {
                                const matchWing =
                                  selectedWing === "All Wings" || room.wing === selectedWing;
                                const matchFloor = String(room.floor) === String(newTenant.floorNo);
                                const roomId = `${room.floor}-${room.roomNo}`;
                                const isOccupied = occupiedRoomsList.includes(roomId);

                                return matchWing && matchFloor && !isOccupied;
                              })
                              .map((room) => (
                                <option key={room.roomNo} value={room.roomNo}>
                                  {room.roomNo}
                                </option>
                              ))}

                          </select>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Footer */}
                  <div
                    className="modal-footer"
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      justifyContent: 'flex-end',
                      gap: '10px',
                      padding: '1.5rem',
                    }}
                  >
                    <button
                      className="btn btn-outline-secondary"
                      style={{ minWidth: '120px' }}
                      onClick={() => setShowAddModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn"
                      onClick={handleAddTenant}
                      style={{
                        backgroundColor: 'rgb(94, 182, 92)',
                        color: 'white',
                        minWidth: '140px',
                      }}
                    >
                      <FaPlus className="me-2" /> Save Tenant
                    </button>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

      {showStatusModal && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Pending Months for {statusTenantName}</h5>


                <button type="button" className="btn-close" onClick={() => setShowStatusModal(false)}></button>

              </div>
              <div className="modal-body">
                {statusMonths.length > 0 ? (
                  <ul className="list-group">
                    {statusMonths.map((month, idx) => {
                      const monthIndex = new Date(`${month} 1, ${new Date().getFullYear()}`).getMonth();
                      const monthDate = new Date(new Date().getFullYear(), monthIndex, 1);

                      const bill = getBillForTenantMonth(selectedTenant?._id, monthDate);
                      const cash = Number(bill?.cashPayment || 0);
                      const online = Number(bill?.onlinePayment || 0);
                      const paidTotal = Number(bill?.paidAmount || 0);

                      const expectedRent = getRentForMonth(selectedTenant, monthDate);
                      const displayTotal = bill ? paidTotal : expectedRent;
















                      return (
                        <li key={idx} className="list-group-item">
                          <strong>{month}</strong> —
                          <span className="text-success"> Cash: ₹{cash}</span> |
                          <span className="text-primary"> Online: ₹{online}</span>
                        </li>
                      );
                    })}

                  </ul>
                ) : (
                  <p className="text-success">No pending months!</p>
                )}
              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowStatusModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDueModal && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Due Months for {selectedTenantName}</h5>
                <button type="button" className="btn-close" onClick={() => setShowDueModal(false)}></button>
              </div>
              <div className="modal-body">
                {dueMonths.length > 0 ? (
                  <ul className="list-group">
                    {dueMonths.map((month, idx) => (
                      <li key={idx} className="list-group-item">{month}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-success">No dues!</p>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowDueModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editTenantData && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Tenant - {editTenantData.name}</h5>
                <button className="btn-close" onClick={() => setShowEditModal(false)}></button>
              </div>
              <div className="modal-body">
                {[
                  { label: "Name", key: "name" },
                  { label: "Phone", key: "phoneNo" },
                  { label: "Room No", key: "roomNo" },
                  // { label: "Bed No", key: "bedNo" },
                  { label: "Deposit Amount", key: "depositAmount" },
                  { label: "Address", key: "address" },
                  //{ label: "Company Address", key: "companyAddress" },
                ].map(field => (
                  <div className="mb-3" key={field.key}>
                    <label className="form-label">{field.label}</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editTenantData[field.key] || ''}
                      onChange={(e) =>
                        setEditTenantData(prev => ({ ...prev, [field.key]: e.target.value }))
                      }
                    />
                  </div>
                ))}
                <div className="mb-3">
                  <label className="form-label">Joining Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={editTenantData.joiningDate?.split('T')[0]}
                    onChange={(e) =>
                      setEditTenantData(prev => ({ ...prev, joiningDate: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleTenantUpdate}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showFModal && (
        <div
          className="modal-backdrop-custom"
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1050
          }}
          onClick={() => setShowFModal(false)} // ✅ Close on backdrop click
        >
          <div
            className="modal-dialog modal-lg"
            style={{ zIndex: 1060 }}
            onClick={(e) => e.stopPropagation()} // ❌ Prevent close when clicking inside
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Tenant Admission Form</h5>
                <button className="btn-close" onClick={() => setShowFModal(false)}></button>
              </div>
              <div className="modal-body">
                {selectedRowData && <FormDownload formData={selectedRowData} />}
              </div>
            </div>
          </div>
        </div>
      )}



      {showDetailsModal && selectedTenant && (() => {
        const year = new Date().getFullYear();
        const yearTotals = selectedTenant
          ? getTotalsForYear(selectedTenant?._id, selectedTenant, year)
          : { total: 0, cash: 0, online: 0 };

        return (
          <div
            className="modal d-block"
            tabIndex="-1"
            style={{
              backgroundColor: "rgba(0,0,0,0.5)",
            }}
          >
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div
                className="modal-content"
                style={{
                  borderRadius: "8px",
                  overflow: "hidden",
                  fontFamily: "Arial, sans-serif",
                  fontSize: "14px",
                }}
              >
                {/* Header */}
                <div
                  className="modal-header"
                  style={{
                    background: "#f5f6fa",
                    color: "#333",
                    padding: "12px 18px",
                    borderBottom: "1px solid #ddd",
                  }}
                >
                  <h5
                    className="modal-title"
                    style={{
                      fontSize: "1.2rem",
                      fontWeight: "500",
                      margin: 0,
                    }}
                  >
                    Tenant Details - {selectedTenant.name}
                  </h5>
                  <button
                    className="btn-close"
                    onClick={() => setShowDetailsModal(false)}
                  ></button>
                </div>

                {/* Body */}
                <div className="modal-body" style={{ padding: "18px" }}>
                  {/* Personal Info */}
                  <h6
                    className="mb-3"
                    style={{
                      fontSize: "1rem",
                      fontWeight: "600",
                      color: "#444",
                      textAlign: "left",
                      marginBottom: "10px",
                    }}
                  >
                    Personal Information
                  </h6>

                  <div
                    className="mb-4"
                    style={{
                      border: "1px solid #eee",
                      borderRadius: "6px",
                      padding: "12px 15px",
                      background: "#fff",
                    }}
                  >
                    <p style={{ margin: "6px 0", textAlign: "left" }}>
                      <strong style={{ color: "#555" }}>Name:</strong> {selectedTenant.name}
                    </p>
                    <p style={{ margin: "6px 0", textAlign: "left" }}>
                      <strong style={{ color: "#555" }}>Room No:</strong> {selectedTenant.roomNo}
                    </p>
                    <p style={{ margin: "6px 0", textAlign: "left" }}>
                      <strong style={{ color: "#555" }}>Phone:</strong> {selectedTenant.phoneNo}
                    </p>
                    <p style={{ margin: "6px 0", textAlign: "left" }}>
                      <strong style={{ color: "#555" }}>Joining Date:</strong>{" "}
                      {new Date(selectedTenant.joiningDate).toLocaleDateString()}
                    </p>
                    <p style={{ margin: "6px 0", textAlign: "left" }}>
                      <strong style={{ color: "#555" }}>Deposit:</strong> ₹
                      {Number(selectedTenant.depositAmount || 0).toLocaleString("en-IN")}
                    </p>
                    <p style={{ margin: "6px 0", textAlign: "left" }}>
                      <strong style={{ color: "#555" }}>Address:</strong> {selectedTenant.address}
                    </p>
                  </div>

                  {/* Rent History Table (unchanged) */}
                  <h6
                    className="mb-3"
                    style={{
                      fontSize: "1rem",
                      fontWeight: "600",
                      color: "#444",
                      textAlign: "left",
                    }}
                  >
                    Rent History ({year})
                  </h6>

                  <div className="table-responsive">
                    <table className="table table-bordered table-striped align-middle text-center">
                      <thead className="table-light">
                        <tr>
                          <th>Month</th>
                          <th>Total Amount</th>
                          <th>Cash</th>
                          <th>Online</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const yearlyData = yearlyDataMap[selectedTenant._id];

                          // 🔹 Build all bills for the year
                          const bills = months.map((m) => {
                            const billFromSummary = yearlyData?.bills?.find(
                              (b) => b.month === m && b.year === year
                            );
                            const billFromState = monthlyBills.find(
                              (b) =>
                                (b.tenantId?._id === selectedTenant._id ||
                                  b.tenantId === selectedTenant._id) &&
                                String(b.month).toLowerCase() === m &&
                                Number(b.year) === year
                            );
                            return (
                              billFromSummary ||
                              billFromState || {
                                month: m,
                                year,
                                totalAmount: 0,
                                cashPayment: 0,
                                onlinePayment: 0,
                                status: "pending",
                              }
                            );
                          });

                          // 🔹 Calculate totals from bills
                          const totalAmount = bills.reduce(
                            (sum, b) => sum + (Number(b.totalAmount) || 0),
                            0
                          );
                          const totalCash = bills.reduce(
                            (sum, b) => sum + (Number(b.cashPayment) || 0),
                            0
                          );
                          const totalOnline = bills.reduce(
                            (sum, b) => sum + (Number(b.onlinePayment) || 0),
                            0
                          );

                          // 🔹 Render rows
                          return (
                            <>
                              {bills.map((bill, i) => {
                                const joiningDate = new Date(selectedTenant.joiningDate);
                                const billDate = new Date(
                                  bill.year,
                                  months.indexOf(bill.month),
                                  1
                                );

                                return (
                                  <tr key={i}>
                                    <td>{bill.month.toUpperCase()} {bill.year}</td>
                                    <td>₹{Number(bill.totalAmount || 0).toLocaleString("en-IN")}</td>
                                    <td className="text-success">₹{Number(bill.cashPayment || 0).toLocaleString("en-IN")}</td>
                                    <td className="text-primary">₹{Number(bill.onlinePayment || 0).toLocaleString("en-IN")}</td>
                                    <td>
                                      {billDate < new Date(joiningDate.getFullYear(), joiningDate.getMonth(), 1) ? (
                                        <span className="badge bg-secondary">N/A</span>
                                      ) : bill.status === "paid" ? (
                                        <span className="badge bg-success">Paid</span>
                                      ) : bill.status === "partial" ? (
                                        <span className="badge bg-warning text-dark">Partial</span>
                                      ) : (
                                        <span className="badge bg-danger">Pending</span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}

                              {/* ✅ Summary row */}
                              {/* Summary row */}
                              <tr className="table-info fw-bold">
                                <td>Total (Year)</td>
                                <td>
                                  ₹{bills.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0).toLocaleString("en-IN")}
                                </td>
                                <td className="text-success">
                                  ₹{bills.reduce((sum, b) => sum + (Number(b.cashPayment) || 0), 0).toLocaleString("en-IN")}
                                </td>
                                <td className="text-primary">
                                  ₹{bills.reduce((sum, b) => sum + (Number(b.onlinePayment) || 0), 0).toLocaleString("en-IN")}
                                </td>
                                <td>-</td>
                              </tr>

                            </>
                          );
                        })()}
                      </tbody>
                    </table>
                  </div>


                </div>

                {/* Footer */}
                <div
                  className="modal-footer"
                  style={{ background: "#f9f9f9", borderTop: "1px solid #ddd" }}
                >
                  <button
                    className="btn btn-outline-secondary"
                    style={{
                      borderRadius: "20px",
                      padding: "6px 18px",
                      fontSize: "14px",
                    }}
                    onClick={() => setShowDetailsModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}


      {/* editmodel */}
      {editingTenant && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Rent for {editingTenant.name}</h5>
                <button type="button" className="btn-close" onClick={() => setEditingTenant(null)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Rent Amount</label>
                  <input type="number" className="form-control" value={editRentAmount} onChange={e => setEditRentAmount(e.target.value)} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Date</label>
                  <input type="date" className="form-control" value={editRentDate} onChange={e => setEditRentDate(e.target.value)} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingTenant(null)}>Cancel</button>
                <button type="button" className="btn btn-primary" onClick={handleSave}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showLeaveModal && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Select Leave Date</h5>
                <button type="button" className="btn-close" onClick={() => setShowLeaveModal(false)}></button>
              </div>
              <div className="modal-body">
                <input
                  type="date"
                  className="form-control"
                  value={selectedLeaveDate}
                  onChange={(e) => setSelectedLeaveDate(e.target.value)}
                />
                <p className="mt-3">
                  Are you sure you want <strong>{currentLeaveName}</strong> to leave on <strong>{selectedLeaveDate || "..."}</strong>?
                </p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowLeaveModal(false)}>Cancel</button>
                <button className="btn btn-danger" onClick={confirmLeave}>Confirm Leave</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showRentModal && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Last 3 Rents - {selectedTenantName}</h5>
                <button type="button" className="btn-close" onClick={() => setShowRentModal(false)}></button>
              </div>
              <div className="modal-body">
                {selectedRentDetails.length > 0 ? (
                  <ul className="list-group">
                    {selectedRentDetails.map((rent, index) => (
                      <li className="list-group-item" key={index}>
                        ₹{Number(rent.rentAmount).toLocaleString('en-IN')} – {new Date(rent.date).toLocaleDateString()}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No rent data available.</p>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowRentModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showPasswordPrompt && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Enter Password</h5>
                <button className="btn-close" onClick={() => setShowPasswordPrompt(false)}></button>
              </div>
              <div className="modal-body">
                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowPasswordPrompt(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={verifyPassword}>Submit</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showDeleteConfirmation && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Deletion</h5>
                <button className="btn-close" onClick={() => setShowDeleteConfirmation(false)}></button>
              </div>
              <div className="modal-body">
                Are you sure you want to delete this tenant?
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowDeleteConfirmation(false)}>Cancel</button>
                <button className="btn btn-danger" onClick={handleDeleteConfirm}>Yes, Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}











    </div>
  );
}
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
export default NewComponant;