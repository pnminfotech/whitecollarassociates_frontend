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


  const [editingTenant, setEditingTenant] = useState(null);
  const [editRentAmount, setEditRentAmount] = useState('');
  const [editRentDate, setEditRentDate] = useState('');
  const [activeTab, setActiveTab] = useState('light');
  const [lightBills, setLightBills] = useState([]);
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

  const [selectedWing, setSelectedWing] = useState('');

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

  const apiUrl = 'http://localhost:4000/api/';
  const correctPassword = "987654";



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
    { wing: 'K', floor: 4, roomNo: 'K404' }
  ];





  const [selectedFloor, setSelectedFloor] = useState("");

  const filteredRooms = roomData.filter((room) => {
    return (
      (selectedWing ? room.wing === selectedWing : true) &&
      (selectedFloor ? room.floor === parseInt(selectedFloor) : true)
    );
  });


  const [existingTenants, setExistingTenants] = useState([]);




  // Filter rooms for selected wing
  // Make sure roomsData, formData, and selectedWing are available
  const roomsInWing = roomsData.filter(
    (room) =>
      room.wing?.toString().trim().toLowerCase() === selectedWing?.toString().trim().toLowerCase()
  );

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
    axios.get(`${apiUrl}/forms`) // replace with your actual tenant API route
      .then((res) => setExistingTenants(res.data))
      .catch((err) => console.error('Error fetching tenants:', err));
  }, []);



  useEffect(() => {
    axios
      .get(apiUrl)
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
    axios.get('http://localhost:4000/api/rooms')
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




  useEffect(() => {
    axios.get('http://localhost:4000/api/available-rooms')
      .then(response => {
        if (response.data.occupiedRooms) {
          setOccupiedRoomsList(response.data.occupiedRooms);
        }
      })
      .catch(error => {
        console.error("Error fetching occupied rooms:", error);
      });
  }, []);



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
      const formData = new FormData();

      // ✅ Append all fields except 'adharno' and 'adharFile'
      const { srNo, ...rest } = newTenant; // 🔥 EXCLUDE srNo
      for (const key in newTenant) {
        if (

          key !== 'adharFile' && // ❗ handled separately
          newTenant[key] !== undefined &&
          newTenant[key] !== null
        ) {
          formData.append(key, newTenant[key]);
        }
      }

      // ✅ Append adharFile separately if it exists
      if (newTenant.adharFile) {
        formData.append('adharFile', newTenant.adharFile);
      }

      // ✅ Axios request
      await axios.post(`${apiUrl}forms`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert('Tenant added successfully!');
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

      if (error.response) {
        console.error("Error Response Data:", error.response.data);
        console.error("Error Status Code:", error.response.status);
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error("Axios setup error:", error.message);
      }
      let errMsg = "Failed to add tenant.";

      if (error.response?.data?.error) {
        errMsg = error.response.data.error;
      } else if (error.response?.data?.message) {
        errMsg = error.response.data.message;
      } else if (error.message) {
        errMsg = error.message;
      }

      alert(errMsg);

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
      const response = await axios.get(apiUrl);
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
      await axios.put(`${apiUrl}form/${editingTenant._id}`, {
        rentAmount: editRentAmount,
        date: editRentDate,
        month: new Date(editRentDate).toLocaleString('default', { month: 'short', year: '2-digit' })
      });
      setEditingTenant(null);
      // window.location.reload();
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
            <h4 className="fw-bold">{roomData.length}</h4>
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
              {formData.filter(d => !d.leaveDate).length}
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



            <h4 className="fw-bold text-danger"> {vacantRooms}</h4>
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
      </div>












      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="fw-bold mb-3">Room-wise Rent and Deposit Tracker</h5>



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

                    return (
                      !isLeaved && // 👈 EXCLUDE tenants who already left
                      (name.includes(searchText.toLowerCase()) || bed.includes(searchText)) &&
                      (selectedYear === 'All Records' || joinYear === Number(selectedYear))
                    );



                    const room = roomsData.find(r => String(r.roomNo) === String(tenant.roomNo));
                    if (!room || room.wing !== selectedWing) return false;
                    return true;


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
                              Rent: ₹{
                                (() => {
                                  const room = roomsData.find(r => String(r.roomNo) === String(tenant.roomNo));
                                  const bed = room?.beds.find(b => String(b.bedNo) === String(tenant.bedNo));
                                  return room?.price || 0;
                                })()
                              }
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


                        <td>
                          <span
                            className={`badge rounded-pill px-3 py-2 ${dueAmount === 0 ? 'bg-success' : 'bg-warning text-dark'}`}
                            style={{ cursor: dueAmount > 0 ? 'pointer' : 'default' }}
                            onClick={() => {
                              if (dueAmount > 0) {
                                const pending = getPendingMonthsForStatus(tenant.rents, tenant.joiningDate);
                                console.log('Pending Months:', pending); // DEBUG LOG
                                setStatusMonths(pending);
                                setStatusTenantName(tenant.name);
                                setShowStatusModal(true);
                              }
                            }}
                          >
                            {dueAmount === 0 ? 'Paid' : 'Pending'}
                          </span>
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
                            disabled={!newTenant.wing}
                          >
                            <option value="">Select Floor</option>
                            <option value="1">1st</option>
                            <option value="2">2nd</option>
                            <option value="3">3rd</option>
                            <option value="4">4th</option>
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
                                const isSameWing = room.wing === newTenant.wing;
                                const isSameFloor =
                                  String(room.floor) === String(newTenant.floorNo);
                                const roomId = `${room.floor}-${room.roomNo}`;
                                const isOccupied = occupiedRoomsList.includes(roomId);
                                return isSameWing && isSameFloor && !isOccupied;
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
                    {statusMonths.map((month, idx) => (
                      <li key={idx} className="list-group-item text-danger">{month}</li>
                    ))}
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



      {/* show details model */}

      {showDetailsModal && selectedTenant && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Tenant Details - {selectedTenant.name}</h5>
                <button className="btn-close" onClick={() => setShowDetailsModal(false)}></button>
              </div>
              <div className="modal-body">
                {/* Personal Info */}
                <h6>Personal Information</h6>
                <ul className="list-group mb-3">
                  <li className="list-group-item">Name:  {selectedTenant.name}</li>
                  <li className="list-group-item">Room No: {selectedTenant.roomNo}</li>
                  {/* <li className="list-group-item">Bed No: {selectedTenant.bedNo}</li> */}
                  <li className="list-group-item">Phone: {selectedTenant.phoneNo}</li>
                  <li className="list-group-item">Joining Date: {new Date(selectedTenant.joiningDate).toLocaleDateString()}</li>
                  <li className="list-group-item">Deposit: ₹{Number(selectedTenant.depositAmount || 0).toLocaleString('en-IN')}</li>
                  <li className="list-group-item">Address: {selectedTenant.address}</li>
                  {/* <li className="list-group-item">Company Address: {selectedTenant.companyAddress}</li> */}
                </ul>

                {/* Rent Info */}
                <h6>Rent History ({new Date().getFullYear()})</h6>
                <ul className="list-group">
                  {Array.from({ length: 12 }, (_, i) => {
                    const monthDate = new Date(new Date().getFullYear(), i, 1);
                    const key = monthDate.toLocaleString('default', { month: 'short' }) + '-' + String(monthDate.getFullYear()).slice(-2);

                    const rent = selectedTenant.rents?.find(r =>
                      new Date(r.date).getMonth() === i &&
                      new Date(r.date).getFullYear() === monthDate.getFullYear()
                    );

                    const isPast = monthDate < new Date(new Date().getFullYear(), new Date().getMonth(), 1);
                    const joiningDate = new Date(selectedTenant.joiningDate);
                    const rentStartMonth = new Date(joiningDate.getFullYear(), joiningDate.getMonth() + 1, 1);
                    const isFutureMonth = monthDate > new Date();
                    const isBeforeRentStart = monthDate < rentStartMonth;


                    return (
                      <li key={i} className="list-group-item d-flex justify-content-between align-items-center">
                        {monthDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        {isBeforeRentStart ? (
                          <span className="badge bg-secondary">Not Applicable</span>
                        ) : rent ? (
                          <span className="badge bg-success">₹{Number(rent.rentAmount).toLocaleString('en-IN')} on {new Date(rent.date).toLocaleDateString()}</span>
                        ) : isFutureMonth ? (
                          <span className="badge bg-warning text-dark">Upcoming</span>
                        ) : (
                          <span className="badge bg-danger">Pending</span>
                        )}
                      </li>
                    );

                  })}
                </ul>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowDetailsModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}



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