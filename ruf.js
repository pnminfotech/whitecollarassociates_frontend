import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { FaDownload } from "react-icons/fa";
import { FaUndo } from "react-icons/fa";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import * as XLSX from 'xlsx';
import '../App.css';
import { useNavigate } from "react-router-dom";
import '../stylecss/mainpage.css';
import '../componenet/Maintanace/FormDownload.css'
import FormDownload from '../componenet/Maintanace/FormDownload';
import Kahata from '../Componen/Kahata';
import { FaEdit} from "react-icons/fa";
import { Modal} from "react-bootstrap";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

function AddData() {
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [password, setPassword] = useState("");
  const [formData, setFormData] = useState([]);
  const { id } = useParams(); 
  const [singleForm , setSingleForm] =useState(null);
  const [deletedData, setDeletedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRowData, setSelectedRowData] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [currentDeleteId, setCurrentDeleteId] = useState(null);
  const [selectedLeaveDate, setSelectedLeaveDate] = useState("");
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [currentLeaveId, setCurrentLeaveId] = useState(null);
  const [currentLeaveName, setCurrentLeaveName] = useState("");
   const [isLightBill, setIsLightBill] = useState(true);
 const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Default: current year
  const [leaveDates, setLeaveDates] = useState({}); // Key: ID, Value: Leave Date
   const [showModal, setShowModal] = useState(false);
  const [showFModal, setShowFModal] = useState(false);
  const [currentFormId, setCurrentFormId] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [newRent, setNewRent] = useState({ rentAmount: '', date: '' });
  const [lightBills, setLightBills] = useState([]);
  const [updatedFormData, setUpdatedFormData] = useState({
    srNo: '',
    name: '',
    joiningDate: '',
    roomNo: '',
    depositAmount: '',
    address: '',
    phoneNo:'',
    relativeAddress1: '',
    relativeAddress2: '',
    floorNo: '',
    bedNo: '',
    companyAddress: '',
  });

  const apiUrl = 'https://hostelpaymentmanger.onrender.com/api/'; // Replace with your actual API endpoint
  const correctPassword = "987654";
  
  const months = Array.from({ length: 12 }, (_, index) => {
    const month = new Date(selectedYear, index).toLocaleString("default", { month: "short" });
    return `${month}-${selectedYear.toString().slice(-2)}`;
  });

  const [showFirstHalf, setShowFirstHalf] = useState(true);
  const toggleMonths = () => {
    setShowFirstHalf((prev) => !prev);
  };
  const visibleMonths = showFirstHalf ? months.slice(0, 6) : months.slice(5, 12);

  useEffect(() => {
    axios
      .get(apiUrl)
      .then((response) => {
        setFormData(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setError('Failed to fetch data. Please try again later.');
        setLoading(false);
      });
  }, []);

    useEffect(() => {
      if (!id) return;
  
      const fetchData = async () => {
        try {
          const response = await fetch(`https://hostelpaymentmanger.onrender.com/api/form/${id}`);
          if (!response.ok) throw new Error("Failed to fetch data");
  
          const data = await response.json();
          setSingleForm(data);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };
  
      fetchData();
    }, [id]);
      const handleDownload = () => {
        const filteredData = formData.filter(data =>
          data.rents.some(rent => new Date(rent.date).getFullYear() === selectedYear)
        );
    
        const worksheetData = filteredData.map(data => {
          const row = {
            "Sr No.": data.srNo,
            Name: data.name,
            "Room No.": data.roomNo,
            "Deposit Amount": data.depositAmount,
          };
    
          months.forEach(month => {
            const matchingRent = data.rents.find(rent => getMonthYear(rent.date) === month);
            row[month] = matchingRent ? matchingRent.rentAmount : "--";
          });
    
          return row;
        });
    
        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, `RentData-${selectedYear}`);
        XLSX.writeFile(workbook, `RentData-${selectedYear}.xlsx`);
      };

    const handleDownloadForm = async (data) => {
      try {
        const response = await axios.get(`https://hostelpaymentmanger.onrender.com/api/form/${data._id}`);
        if (response.status !== 200) throw new Error("Failed to fetch data");
  
        const singleForm = response.data;
        console.log("Fetched Data for Download:", singleForm);
  
        if (!singleForm) {
          console.error("No data available for download.");
          return;
        }
  
        const formattedData = [
          ["Field", "Value"],
          ["Sr No", singleForm.srNo],
          ["Name", singleForm.name],
          ["Joining Date", new Date(singleForm.joiningDate).toLocaleDateString()],
          ["Room No", singleForm.roomNo],
          ["Deposit Amount", singleForm.depositAmount],
          ["Address", singleForm.address],
          ["Phone No", singleForm.phoneNo],
          ["Relative Address 1", singleForm.relativeAddress1 || "N/A"],
          ["Relative Address 2", singleForm.relativeAddress2 || "N/A"],
          ["Floor No", singleForm.floorNo],
          ["Bed No", singleForm.bedNo],
          ["Company Address", singleForm.companyAddress || "N/A"],
          ["Date of Joining College", new Date(singleForm.dateOfJoiningCollege).toLocaleDateString()],
          ["Date of Birth", new Date(singleForm.dob).toLocaleDateString()],
        ];
  
        // Handle rents array
        if (singleForm.rents && singleForm.rents.length > 0) {
          formattedData.push(["Rents", ""]);
          singleForm.rents.forEach((rent, index) => {
            formattedData.push([`Rent ${index + 1} Amount`, rent.rentAmount]);
            formattedData.push([`Rent ${index + 1} Date`, new Date(rent.date).toLocaleDateString()]);
          });
        }
  
        console.log("Formatted Data:", formattedData);
  
        // Convert to worksheet
        const ws = XLSX.utils.aoa_to_sheet(formattedData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "UserDetails");
  
        console.log("Downloading file...");
  
        // Write and trigger download
        XLSX.writeFile(wb, `UserDetails_${data._id}.xlsx`);
      } catch (error) {
        console.error("Error fetching data for download:", error);
      }
    };
  const navigate = useNavigate();
  const handleNavigation = (path) => {
    navigate(path);
  };


  useEffect(() => {
    fetchLightBills();
  }, []);

  const fetchLightBills = async () => {
    try {
      const response = await fetch(
        "https://hostelpaymentmanger.onrender.com/api/light-bill/all"
      );
      const data = await response.json();
      setLightBills(data); // Assuming data is an array
    } catch (error) {
      console.error("Error fetching light bill data:", error);
    }
  };
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const idsToArchive = Object.keys(leaveDates).filter((id) => leaveDates[id] === today);
  
    idsToArchive.forEach((id) => {
      const recordToArchive = formData.find((data) => data._id === id);
      if (recordToArchive) {
        // Archive the record
        axios
          .post(`https://hostelpaymentmanger.onrender.com/api/forms/archive`, { id })
          .then((response) => {
            console.log('Data archived:', response.data);
            // Remove from formData
            setFormData((prev) => prev.filter((data) => data._id !== id));
            // Add to deletedData
            setDeletedData((prev) => [...prev, response.data]);
          })
          .catch((error) => {
            console.error('Error archiving data:', error);
          });
      }
    });
  }, [leaveDates, formData]);
  
  useEffect(() => {
    axios
      .get(apiUrl)
      .then((response) => {
        setFormData(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setError('Failed to fetch data. Please try again later.');
        setLoading(false);
      });
  }, [apiUrl]);

  useEffect(() => {
    axios
      .get('https://hostelpaymentmanger.onrender.com/api/forms/archived')
      .then((response) => {
        console.log('Archived data fetched:', response.data);
        setDeletedData(response.data); // Populate the archived data state
      })
      .catch((error) => {
        console.error('Error fetching archived data:', error);
        setError('Failed to fetch archived data.');
      });
  }, []);
  
  useEffect(() => {
    axios
      .get("https://hostelpaymentmanger.onrender.com/api/forms")
      .then((response) => {
        const leaveData = {};
        response.data.forEach((item) => {
          if (item.leaveDate) {
            leaveData[item._id] = new Date(item.leaveDate).toISOString().split("T")[0]; 
          }
        });
        setLeaveDates(leaveData);
      })
      .catch((error) => console.error("Error fetching leave data:", error));
  }, []);
 
  
  //download sheet for light bill
  const downloadLightBillExcel = async () => {
    const apiUrl = isLightBill
      ? "https://hostelpaymentmanger.onrender.com/api/light-bill/all"
      : "https://hostelpaymentmanger.onrender.com/api/other-expense/all";
  
    try {
      // Fetch data from the backend
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error("Failed to fetch data.");
      }
  
      const data = await response.json();
  
      // Format data for Excel
      const formattedData = isLightBill
        ? data.map((item) => ({
            "Meter No": item.meterNo,
            "Total Reading": item.totalReading,
            Amount: item.amount,
            Date: item.date,
          }))
        : data.map((item) => ({
            "Main Amount": item.mainAmount,
            Expenses: item.expenses.join(", "),
            Date: item.date,
          }));
  
      // Generate and download Excel file
      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
      XLSX.writeFile(
        workbook,
        `${isLightBill ? "LightBill" : "OtherExpense"}Data.xlsx`
      );
    } catch (error) {
      console.error("Error downloading Excel file:", error);
      alert("Failed to download Excel file.");
    }
  };
  
  // download Sheet for all Tenants
  // const downloadExcel = () => {
  //   const flattenedData = formData.map((data) => ({
  //     'Sr No.': data.srNo || '',
  //     Name: data.name || '',
  //     'Room No.': data.roomNo || '',
  //     'Phone No' : data.phoneNo || '',
  //     'Joining Date': formatDate(data.joiningDate) || '',
  //     'Deposit Amount': data.depositAmount || '',
  //     ...months.reduce((acc, month) => {
  //       const rent = data.rents.find((r) => getMonthYear(r.date) === month);
  //       acc[month] = rent ? `${rent.rentAmount} | ${formatDate(rent.date)}` : '--';
  //       return acc;
  //     }, {}),
  //   }));

  //   const flattenedDeletedData = deletedData.map((data, index) => ({
  //     'Sr No.': index + 1,
  //     Name: data.name || '',
  //     'Room No.': data.roomNo || '',
  //     'Joining Date': formatDate(data.joiningDate) || '',
  //     'Deposit Amount': data.depositAmount || '',
  //   }));

  //   const workbook = XLSX.utils.book_new();
  //   const activeSheet = XLSX.utils.json_to_sheet(flattenedData);
  //   const deletedSheet = XLSX.utils.json_to_sheet(flattenedDeletedData);

  //   XLSX.utils.book_append_sheet(workbook, activeSheet, 'Active Data');
  //   XLSX.utils.book_append_sheet(workbook, deletedSheet, 'Deleted Data');

  //   XLSX.writeFile(workbook, 'RentData.xlsx');
  // };
  const openUpdateModal = (id) => {
    setCurrentFormId(id);
    setShowModal(true);
  };
  const openModal = (rowData) => {
    setSelectedRowData(rowData);
    setShowFModal(true);
  };

  const closeUpdateModal = () => {
    setShowModal(false);
    setNewRent({ rentAmount: '', date: '' });
    setCurrentFormId(null);
  };

  const openFormUpdateModal = (id) => {
    setCurrentFormId(id);
    const selectedForm = formData.find((data) => data._id === id);
    if (selectedForm) {
      setUpdatedFormData({
        srNo: selectedForm.srNo,
        name: selectedForm.name,
        roomNo: selectedForm.roomNo,
        depositAmount: selectedForm.depositAmount,
        rentAmount: selectedForm.rents[0]?.rentAmount || '',
        joiningDate: selectedForm.joiningDate,
        address: selectedForm.address,
        phoneNo:selectedForm.phoneNo,
        relativeAddress1: selectedForm.relativeAddress1 || '',
        relativeAddress2: selectedForm.relativeAddress2 || '',
        floorNo: selectedForm.floorNo || '',
        bedNo: selectedForm.bedNo || '',
        companyAddress: selectedForm.companyAddress || '',
      });
    }
    setShowUpdateModal(true);
  };

  const closeFormUpdateModal = () => {
    setShowUpdateModal(false);
    setUpdatedFormData({
      srNo: '',
      name: '',
      joiningDate: '',
      roomNo: '',
      depositAmount: '',
      address: '',
      phoneNo:'',
      relativeAddress1: '',
      relativeAddress2: '',
      floorNo: '',
      bedNo: '',
      companyAddress: '',
    });
    setCurrentFormId(null);
  };

  const handleLeave = (data) => {
    setCurrentLeaveId(data._id);
    setCurrentLeaveName(data.name);
    setShowLeaveModal(true);
  };
  
  const confirmLeave = async () => {
    if (!selectedLeaveDate) {
      alert("Please select a leave date.");
      return;
    }
  
    const currentDate = new Date().toISOString().split("T")[0];
  
    try {
      const response = await fetch("https://hostelpaymentmanger.onrender.com/api/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formId: currentLeaveId,
          leaveDate: selectedLeaveDate,
        }),
      });
  
      const result = await response.json();
  
      if (response.ok) {
        alert(result.message);
        setLeaveDates((prev) => ({ ...prev, [currentLeaveId]: selectedLeaveDate }));
        setShowLeaveModal(false);
      } else {
        alert(result.error || "Failed to process leave request.");
      }
    } catch (error) {
      console.error("Error processing leave:", error);
    }
  };
  
  const handleUpdate = () => {
    if (!newRent.rentAmount || !newRent.date) {
      alert('Please fill out all fields.');
      return;
    }
  
    const monthYear = getMonthYear(newRent.date);
    const newRentAmount = parseFloat(newRent.rentAmount);
  
    // Find the current entry for the given month
    const currentData = formData.find((data) => data._id === currentFormId);
    const rentIndex = currentData ? currentData.rents.findIndex((rent) => getMonthYear(rent.date) === monthYear) : -1;
  
    if (newRentAmount === 0) {
      if (rentIndex !== -1) {
        // If rent exists for the month and user sets it to 0, remove it
        const updatedFormData = formData.map((data) => {
          if (data._id === currentFormId) {
            data.rents.splice(rentIndex, 1); // Remove the rent entry
          }
          return data;
        });
  
        setFormData(updatedFormData); // Update state
  
        // Send DELETE request to backend to remove rent entry for that month
        axios
          .delete(`https://hostelpaymentmanger.onrender.com/api/form/${currentFormId}/rent/${monthYear}`)
          .then(() => {
            alert("Rent removed successfully!");
            closeUpdateModal();
          })
          .catch((error) => {
            console.error("Error removing rent:", error);
            alert("Failed to remove rent. Please try again.");
          });
      } else {
        // If no rent existed and user sets it to 0, do nothing
        alert("Rent amount is set to 0, so it will not be added.");
        closeUpdateModal();
      }
      return;
    }
  
    // Prepare new rent entry
    const newRentEntry = {
      rentAmount: newRent.rentAmount,
      date: newRent.date,
    };
  
    const updatedFormData = formData.map((data) => {
      if (data._id === currentFormId) {
        if (rentIndex !== -1) {
          data.rents[rentIndex] = newRentEntry; // Update existing rent entry
        } else {
          data.rents.push(newRentEntry); // Add new rent entry
        }
      }
      return data;
    });
  
    setFormData(updatedFormData); // Update local state
  
    // Send PUT request to backend
    axios
      .put(`https://hostelpaymentmanger.onrender.com/api/form/${currentFormId}`, newRentEntry)
      .then((response) => {
        setFormData((prevFormData) =>
          prevFormData.map((data) =>
            data._id === response.data._id ? response.data : data
          )
        );
        closeUpdateModal();
      })
      .catch((error) => {
        console.error("Error updating rent:", error);
        alert("Failed to update rent. Please try again later.");
      });
  };
  
  const getMonthYear = (date) => {
    const d = new Date(date);
    return `${d.toLocaleString('default', { month: 'short' })}-${d.getFullYear().toString().slice(-2)}`;
  };
  const openDeleteConfirmation = (id) => {
    setCurrentDeleteId(id);
    setShowPasswordPrompt(true); // Show password input first
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
      await axios.delete(`https://hostelpaymentmanger.onrender.com/api/form/${currentDeleteId}`);
      setFormData((prevFormData) => prevFormData.filter((data) => data._id !== currentDeleteId));
      alert('Form deleted successfully');
      setShowDeleteConfirmation(false);  // Close confirmation modal
    } catch (error) {
      console.error('Error deleting form:', error);
      alert('Failed to delete form. Please try again later.');
    }
  };

  const handleUndoClick = (data) => {
    const isConfirmed = window.confirm(`Are you sure you want to undo ${data.name}?`);
    if (isConfirmed) {
      undoArchive(data);
    }
  };
  
  const undoArchive = (data) => {
    axios
      .post(`https://hostelpaymentmanger.onrender.com/api/forms/restore`, { id: data._id })
      .then((response) => {
        console.log('Data restored:', response.data);
  
        // Remove leaveDate before adding to active data
        const { leaveDate, ...restoredData } = response.data;
  
        setDeletedData((prev) => prev.filter((item) => item._id !== data._id)); // Remove from archived data
        setFormData((prev) => [...prev, restoredData]); // Add to active data without leaveDate
      })
      .catch((error) => {
        console.error('Error restoring data:', error);
      });
  };
  
  const handleFormUpdate = () => {
    // if (!updatedFormData.name || !updatedFormData.roomNo || !updatedFormData.depositAmount || !updatedFormData.rentAmount) {
    //   alert('Please fill out all fields.');
    //   return;
    // }

    axios
      .put(`https://hostelpaymentmanger.onrender.com/api/update/${currentFormId}`, updatedFormData)
      .then((response) => {
        const updatedData = formData.map((data) =>
          data._id === response.data._id ? response.data : data
        );
        setFormData(updatedData);
        closeFormUpdateModal();
      })
      .catch((error) => {
        alert('Failed to update entity. Please try again later.');
      });
  }; 

  const formatDate = (date) => {
    const formattedDate = new Date(date).toLocaleDateString(); // Ensures only the date is displayed
    return formattedDate;
  };

  const formatDateNew = (dateString) => {
    const date = new Date(dateString);
    const options = { day: '2-digit', month: 'short', year: '2-digit' };
    return date.toLocaleDateString('en-GB', options).replace(',', '').replace(' ', '-');
  };
  

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  if (error) {
    return <div className="text-center mt-5 text-danger">{error}</div>;
  }

  return (
    <div className="m-4" style={{fontFamily: "Century Gothic", fontSize:12}}>
        <div className="d-flex align-items-center" >
        <label className="me-2" style={{ fontWeight: 'bold' }}>Select Year:</label>
        <select
          className="form-select w-auto"
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
        >
          {[2024, 2025, 2026, 2027, 2028, 2029, 2030 , 2031, 2032, 2033 , 2034, 2035].map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
        <button className="btn btn-primary1 ms-3" onClick={handleDownload}>
         <FaDownload className="me-2" />{selectedYear} 
        </button>
        <button  className="btn btn-primary1 ms-3 me-2" onClick={toggleMonths} style={{cursor: "pointer" }}>
        {showFirstHalf ? "Show Jul - Dec" : "Show Jan - Jun"}
      </button>
      <button className="btn btn-primary1 me-2" onClick={() => handleNavigation("/form")}>
         ADD
        </button>
        <button className="btn btn-primary1 me-2" onClick={() => handleNavigation("/meter")}>
         MAINTENANCE
        </button>
        <button className="btn btn-primary1 me-2" onClick={() => handleNavigation("/suppliers")}>
        KHATA BOOK
        </button>
        {/* <button className="btn btn-primary me-2" onClick={downloadExcel}>
         DOWNLOAD
        </button> */}
        {/* <button className="btn btn-primary me-2" onClick={() => handleNavigation("/duplicate-data")}>
        ARCHIVE
      </button> */}
      <button className="btn btn-primary1 me-2" onClick={() => handleNavigation("/mainpage")}>
         BACK
        </button>
      </div>
      <table className="table table-bordered table-hover" style={{border: '2px solid black'}}>
        <thead className="thead-light styled-header">

          
          <tr style={{ fontWeight: 'bold', color: 'black' }}>
            <th style={{ backgroundColor: 'rgb(199 124 136)', color:'white' }}>Sr</th>
            {/* <th style={{ backgroundColor: 'rgb(199 124 136)' , color:'white' }}>Edit</th> Combined column */}
            {/* <th style={{ backgroundColor: 'rgb(199 124 136)', color:'white' }}>Information</th> */}
            <th colSpan={2}  style={{ backgroundColor: 'rgb(199 124 136)', color:'white' }}>Name </th>
            <th style={{ backgroundColor: 'rgb(199 124 136)', color:'white' }}>Phone No. </th>
            {visibleMonths.map((month) => (
              <th key={month} style={{ backgroundColor: "rgb(199 124 136)", color: "white" }}>
                {month}
              </th>
            ))}
             <th style={{ backgroundColor: 'rgb(199 124 136)', color: 'white' }}>Leave</th>
          </tr>
          <tr>
            <th style={{ backgroundColor: 'rgb(199 124 136)', color:'white' }}></th>
            {/* <th style={{ backgroundColor: 'rgb(199 124 136)', color:'white' }}>Delete</th> */}
            {/* <th style={{ backgroundColor: 'rgb(199 124 136)', color:'white' }}></th> */}
            <th colSpan={2} style={{ backgroundColor: 'rgb(199 124 136)', color:'white' }}>Joining Date</th>
            <th style={{ backgroundColor: 'rgb(199 124 136)', color:'white' }}>Deposit Amount</th>
            {visibleMonths.map((month) => (
              <th style={{ backgroundColor: 'rgb(199 124 136)', color:'white' }} key={month}>Rent Date</th>
            ))}
            <th style={{ backgroundColor: 'rgb(199 124 136)', color: 'white' }}>Edit/Delete</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(formData) && formData.length > 0 ? ( 
            formData.sort((a, b) => {
              const order = [301, 302, 402]; // Define the preferred order
              const indexA = order.includes(a.roomNo) ? order.indexOf(a.roomNo) : order.length;
              const indexB = order.includes(b.roomNo) ? order.indexOf(b.roomNo) : order.length;
              return indexA - indexB || a.roomNo - b.roomNo; // Sort by predefined order, then numerically
            })
            .map((data, index) => (
              <tr style={{ fontWeight: 'bold', color: 'black' }} key={index}>
  <td>{index + 1}</td>
  <td>
    
      <div
        className="">

       <div onClick={() => openModal(data)}
        onMouseEnter={(e) => {
          e.target.style.color = '#a12929';
          e.target.style.fontWeight = '900';
          e.target.style.cursor = 'pointer';
        }}
        onMouseLeave={(e) => {
          e.target.style.color = 'black';
          e.target.style.fontWeight = 'bold';
          e.target.style.cursor = 'default';
        }}
        style={{ 
          fontWeight: 'bold', 
          color: 'black',  
          fontSize: 15,
          whiteSpace: 'pre-wrap', // Allows text to wrap
          wordWrap: 'break-word', // Breaks words if needed
          maxWidth: '150px', // You can adjust the max width based on your design
        }}
      >
        {data.name} </div>
<p style={{marginTop:-10 , marginBottom:0}}>________________</p>
        <div style={{ color: 'rgb(209 94 13)' }}  onMouseLeave={(e) => {
          e.target.style.color = '#a12929';
          e.target.style.fontWeight = 'bold';
          e.target.style.cursor = 'default';
        }}> {formatDateNew(data.joiningDate)}</div>
      </div>
      {/* <div className="col-12" style={{ color: 'rgb(209 94 13)' }}>
        {formatDate(data.joiningDate)}
      </div> */}
    
  </td>
  <td>
  <div  className="col-auto"  style={{ fontWeight: 'bold', fontSize:15 , color: data.roomNo == 301 ? 'orange' :
                data.roomNo == 302 ? 'green' :
                data.roomNo == 401 ? 'red' :
                data.roomNo == 402 ? '#38a5e5' : '#ffc107'}}>
        {data.roomNo}
      </div>
  </td>
  <td>
    <div className="row">
      <div className="col-12" style={{    color:' #2c2c2c',
    fontWeight: 900,   }}>
        {data.phoneNo}
      </div>
     <div><hr/></div> 
      <div className="col-12" style={{ color: 'rgb(209 94 13)' }}>
        {data.depositAmount}
      </div>
    </div>
  </td>
  {visibleMonths.map((month) => {
    const matchingRent = data.rents.find(
      (rent) => 
        new Date(rent.date).toLocaleString('default', { month: 'short' }) +
        '-' + new Date(rent.date).getFullYear().toString().slice(-2) === month
    );

    const currentDate = new Date();
    const [monthName, yearSuffix] = month.split('-');
    const monthDate = new Date(`${monthName} 1, 20${yearSuffix}`);

    const isPastMonth = monthDate < new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const isCurrentMonth = monthDate.getMonth() === currentDate.getMonth() && 
                           monthDate.getFullYear() === currentDate.getFullYear();

    const depositDay = new Date(data.joiningDate).getDate();
    const isOneDayBeforeDeposit = currentDate.getDate() === depositDay - 1;
    const isDepositDatePassed = currentDate.getDate() >= depositDay;

    const joiningDate = new Date(data.joiningDate);
    const joiningMonth = joiningDate.getMonth();
    const joiningYear = joiningDate.getFullYear();
    
    const isBeforeJoining = monthDate.getFullYear() < joiningYear || 
                           (monthDate.getFullYear() === joiningYear && monthDate.getMonth() <= joiningMonth);
    
    const isMissingRent = !isBeforeJoining && ((isPastMonth && !matchingRent) || 
                         ((isCurrentMonth && (isOneDayBeforeDeposit || isDepositDatePassed)) && !matchingRent));
    
    return (
     <td
        key={month}
        style={{
          backgroundColor: matchingRent ? 'transparent' : isMissingRent ? 'red' : 'transparent',
          color: matchingRent ? 'black' : isMissingRent ? 'white' : 'black',
        }}
        ref={(el) => {
          if (el) {
            el.style.setProperty('background-color', matchingRent ? 'transparent' : isMissingRent ? 'red' : 'transparent', 'important');
            el.style.setProperty('color', matchingRent ? 'black' : isMissingRent ? 'white' : 'black', 'important');
          }
        }}
      >
        {matchingRent ? (
          <>
            <div
              onClick={() => openUpdateModal(data._id)}
              onMouseEnter={(e) => {
                e.target.style.color = 'green';
                e.target.style.fontWeight = 'bold';
                e.target.style.cursor = 'pointer';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = 'black';
                e.target.style.fontWeight = 'bold';
                e.target.style.cursor = 'default';
              }}
            >
              {matchingRent.rentAmount}
            </div>
            <hr/>
            <div style={{ color: 'rgb(209 94 13)' }}>{formatDateNew(matchingRent.date)}</div>
          </>
        ) : isMissingRent ? (
          <div style={{ color: 'white', fontWeight: 'bold' }}>
            Rent Due!!
            <div className="d-flex justify-content-between mt-2">
              <button
                className="btn btn-sm btn-warning"
                onClick={() => setNewRent({ rentAmount: '', date: new Date().toISOString().split('T')[0] }) || setCurrentFormId(data._id) || setShowModal(true)}
              >
                OK
              </button>
            </div>
          </div>
        ) : (
          <button
            className="btn btn-sm btn"
            onClick={() => setNewRent({ rentAmount: '', date: new Date().toISOString().split('T')[0] }) || setCurrentFormId(data._id) || setShowModal(true)}
          >
            --
          </button>
        )}
      </td>
    );
})}


  <td>
    <div>
    <button
        className="btn"
        style={{fontSize:'15px' , color:'green', padding:10}}
        onClick={() => openFormUpdateModal(data._id)} >
        <FaEdit />
      </button>
      <button
        className="btn"
        style={{fontSize:'15px' , color:'red',padding:10}}
        onClick={() => openDeleteConfirmation(data._id)} >
        <FontAwesomeIcon icon={faTrash} />
      </button>
      <button  className="btn"
        style={{fontSize:'15px' , color:'black', padding:10}} onClick={() => handleLeave(data)}>
      <FontAwesomeIcon icon={faSignOutAlt} />
</button>

{leaveDates[data._id] && (
  <div style={{ marginTop: "5px", color: "red"}}>
   Leave on: {new Date(leaveDates[data._id]).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
  </div>
)}

    </div>
  </td>
</tr>))
          ) : (
            <tr>
              <td colSpan={months.length + 3}>No data available</td>
            </tr>
          )}
        </tbody>
      </table>

         {/* Password Prompt Modal */}
         {showPasswordPrompt && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Enter Password</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowPasswordPrompt(false)}
                ></button>
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
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowPasswordPrompt(false)}
                >
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={verifyPassword}>
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

       {/* Leave Confirmation Modal */}
       {showLeaveModal && (
      <div className="modal show d-block" tabIndex="-1">
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
                Are you sure you want <strong>{currentLeaveName}</strong> to leave on{" "}
                <strong>{selectedLeaveDate || "..."}</strong>?
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowLeaveModal(false)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={confirmLeave}>
                Yes, Confirm Leave
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

       {/* update Form */}
       {showUpdateModal && (
  <div className="modal show d-block" tabIndex="-1">
    <div className="modal-dialog modal-dialog-scrollable">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Update Entity</h5>
          <button type="button" className="btn-close" onClick={closeFormUpdateModal}></button>
        </div>
        <div className="modal-body">
          {/* Render input fields for all properties */}
          <div className="mb-3">
            <label htmlFor="srNo" className="form-label">SR No.</label>
            <input
              type="text"
              className="form-control"
              id="srNo"
              value={updatedFormData.srNo}
              onChange={(e) =>
                setUpdatedFormData((prev) => ({ ...prev, srNo: e.target.value }))
              }
            />
          </div>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">Name</label>
            <input
              type="text"
              className="form-control"
              id="name"
              value={updatedFormData.name}
              onChange={(e) =>
                setUpdatedFormData((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </div>
          <div className="mb-3">
            <label htmlFor="roomNo" className="form-label">Room No.</label>
            <input
              type="text"
              className="form-control"
              id="roomNo"
              value={updatedFormData.roomNo}
              onChange={(e) =>
                setUpdatedFormData((prev) => ({ ...prev, roomNo: e.target.value }))
              }
            />
          </div>
          <div className="mb-3">
            <label htmlFor="depositAmount" className="form-label">Deposit Amount</label>
            <input
              type="number"
              className="form-control"
              id="depositAmount"
              value={updatedFormData.depositAmount}
              onChange={(e) =>
                setUpdatedFormData((prev) => ({ ...prev, depositAmount: e.target.value }))
              }
            />
          </div>
          <div className="mb-3">
            <label htmlFor="address" className="form-label">Address</label>
            <input
              type="text"
              className="form-control"
              id="address"
              value={updatedFormData.address}
              onChange={(e) =>
                setUpdatedFormData((prev) => ({ ...prev, address: e.target.value }))
              }
            />
          </div>
          <div className="mb-3">
            <label htmlFor="phoneNo" className="form-label">phoneNo</label>
            <input
              type="number"
              className="form-control"
              id="phoneNo"
              value={updatedFormData.phoneNo}
              onChange={(e) =>
                setUpdatedFormData((prev) => ({ ...prev, phoneNo: e.target.value }))
              }
            />
          </div>
          <div className="mb-3">
            <label htmlFor="relativeAddress1" className="form-label">Relative Address 1</label>
            <input
              type="text"
              className="form-control"
              id="relativeAddress1"
              value={updatedFormData.relativeAddress1}
              onChange={(e) =>
                setUpdatedFormData((prev) => ({ ...prev, relativeAddress1: e.target.value }))
              }
            />
          </div>
          <div className="mb-3">
            <label htmlFor="relativeAddress2" className="form-label">Relative Address 2</label>
            <input
              type="text"
              className="form-control"
              id="relativeAddress2"
              value={updatedFormData.relativeAddress2}
              onChange={(e) =>
                setUpdatedFormData((prev) => ({ ...prev, relativeAddress2: e.target.value }))
              }
            />
          </div>
          <div className="mb-3">
            <label htmlFor="floorNo" className="form-label">Floor No.</label>
            <input
              type="text"
              className="form-control"
              id="floorNo"
              value={updatedFormData.floorNo}
              onChange={(e) =>
                setUpdatedFormData((prev) => ({ ...prev, floorNo: e.target.value }))
              }
            />
          </div>
          <div className="mb-3">
            <label htmlFor="bedNo" className="form-label">Bed No.</label>
            <input
              type="text"
              className="form-control"
              id="bedNo"
              value={updatedFormData.bedNo}
              onChange={(e) =>
                setUpdatedFormData((prev) => ({ ...prev, bedNo: e.target.value }))
              }
            />
          </div>
          <div className="mb-3">
            <label htmlFor="companyAddress" className="form-label">Company Address</label>
            <input
              type="text"
              className="form-control"
              id="companyAddress"
              value={updatedFormData.companyAddress}
              onChange={(e) =>
                setUpdatedFormData((prev) => ({ ...prev, companyAddress: e.target.value }))
              }
            />
          </div>
          <div className="mb-3">
            <label htmlFor="joiningDate" className="form-label">Joining Date</label>
            <input
              type="date"
              className="form-control"
              id="joiningDate"
              value={updatedFormData.joiningDate}
              onChange={(e) =>
                setUpdatedFormData((prev) => ({ ...prev, joiningDate: e.target.value }))
              }
            />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={closeFormUpdateModal}>
            Close
          </button>
          <button className="btn btn-primary" onClick={handleFormUpdate}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  </div>
)}
  
       {showDeleteConfirmation && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Deletion</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDeleteConfirmation(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this form?</p>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteConfirmation(false)}
                >
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={handleDeleteConfirm}>
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Rent Amount Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Update Rent</h5>
                <button type="button" className="btn-close" onClick={closeUpdateModal}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="rentAmount" className="form-label">
                    Rent Amount
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="rentAmount"
                    value={newRent.rentAmount}
                    onChange={(e) =>
                      setNewRent((prev) => ({ ...prev, rentAmount: e.target.value }))
                    }
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="rentDate" className="form-label">
                    Rent Date
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    id="rentDate"
                    value={newRent.date}
                    onChange={(e) =>
                      setNewRent((prev) => ({ ...prev, date: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={closeUpdateModal}>
                  Close
                </button>
                <button className="btn btn-primary" onClick={handleUpdate}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


<Modal show={showFModal} onHide={() => setShowFModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Admission Form</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRowData && <FormDownload formData={selectedRowData} />}
        </Modal.Body>
      </Modal>


      {deletedData.length > 0 ? (
  <div className="mt-5">
    <h3 style={{fontWeight:800}}>Leaved Tenanat Data</h3>
    <table className="table table-bordered table-hover">
      <thead>
        <tr>
          <th>Sr No.</th>
          <th>Name</th>
          <th>Room No.</th>
          <th>Joining Date</th>
          <th>Deposit Amount</th>
          <th>Rents</th>
          <th>Leaves</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {deletedData.map((data, index) => (
          <tr key={index}>
            <td>{index + 1}</td>
            <td>  {data.name.split(" ").map((word, index) => (
    <div key={index}>{word}</div>
  ))}</td>
            <td>{data.roomNo}</td>
            <td>{formatDate(data.joiningDate)}</td>
            <td>{data.depositAmount}</td>
            <td>
              {data.rents && data.rents.length > 0 ? (
                <ul>
                  {data.rents.map((rent, rentIndex) => (
                    <li key={rentIndex}>
                      {`Amount: ${rent.rentAmount}, Date: ${formatDate(rent.date)}`}
                    </li>
                  ))}
                </ul>
              ) : (
                'No Rents'
              )}
            </td>
            <td style={{fontWeight:'bold'}}>{new Date(data.leaveDate).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
            <td>
              <button
                className="btn btn-sm btn-success"
                onClick={() => handleUndoClick(data)}
                style={{marginLeft:10}}
              >
                <FaUndo
                // style={{ cursor: "pointer", fontSize: "24px", color: "blue" }}
      />
              </button>
              <button
      className="btn btn-sm btn-success"
      onClick={() => handleDownloadForm(data)}
      style={{ marginLeft: 10 }}
    >
      <FaDownload /> 
    </button>
            </td>
          
          </tr>
        ))}
      </tbody>
    </table>
  </div>
      ) : (
     <div className="mt-5">No archived data found.</div>
     )}


    {/* Display Light Bill Data */}
    <div className="mt-5">
        <h3 style={{fontWeight:800}}>Meter Bill Reading <button type="button" className="btn btn-success" onClick={downloadLightBillExcel}>
                        <FaDownload className="me-2" />
                      </button></h3>
        {lightBills.length > 0 ? (
          <table className="table table-bordered table-hover">
            <thead>
              <tr>
                <th>Sr No.</th>
                <th>Meter No.</th>
                <th>Total Reading</th>
                <th>Amount</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {lightBills.map((bill, index) => (
                <tr key={bill._id}>
                  <td>{index + 1}</td>
                  <td>{bill.meterNo}</td>
                  <td>{bill.totalReading}</td>
                  <td>{bill.amount}</td>
                  <td>{formatDate(bill.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div>No light bill data available.</div>
        )}
      </div>

    </div>
  );
}

export default AddData;


// backedn code 

const Form = require('../models/formModels');
const Archive = require('../models/archiveSchema');
const DuplicateForm = require('../models/DuplicateForm'); // Import the DuplicateForm model
const cron = require("node-cron");


const processLeave = async (req, res) => {
  try {
    const { formId, leaveDate } = req.body;
    const form = await Form.findById(formId);

    if (!form) return res.status(404).json({ error: "Form not found" });

    const currentDate = new Date().toISOString().split("T")[0];

    if (leaveDate <= currentDate) {
      // If the leave date is past or current, move the record to archive
      const archivedData = new Archive({ ...form.toObject(), leaveDate });
      await archivedData.save();
      await Form.findByIdAndDelete(formId);

      return res.status(200).json({ message: "Record archived successfully." });
    } else {
      // If leave date is in the future, update the form record
      form.leaveDate = leaveDate;
      await form.save();
      return res.status(200).json({ message: "Leave date saved. It will be archived on the leave date." });
    }
  } catch (error) {
    console.error("Error processing leave:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// CRON JOB to check for leave dates every day at midnight
cron.schedule("0 0 * * *", async () => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const formsToArchive = await Form.find({ leaveDate: today });

    for (const form of formsToArchive) {
      const archivedData = new Archive({ ...form.toObject(), leaveDate: today });
      await archivedData.save();
      await Form.findByIdAndDelete(form._id);
    }

    console.log(`Archived ${formsToArchive.length} records for ${today}`);
  } catch (error) {
    console.error("Error archiving records:", error);
  }
});

// @desc Save form data to the database
// @route POST /api/forms
// @access Public

const getNextSrNo = async (req, res) => {
  try {
    const activeCount = await Form.countDocuments();
    const archivedCount = await Archive.countDocuments();
    const nextSrNo = (activeCount + archivedCount + 1).toString();

    res.status(200).json({ nextSrNo });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching Sr. No.', error });
  }
};

const saveForm = async (req, res) => {
  try {
    // Count total records from both collections
    const activeCount = await Form.countDocuments();
    const archivedCount = await Archive.countDocuments();
    const totalCount = activeCount + archivedCount + 1; // New Sr No.

    // Assign srNo automatically
    req.body.srNo = totalCount.toString(); 

    const newForm = new Form(req.body);
    await newForm.save();
    
    res.status(201).json({ message: 'Form submitted successfully', form: newForm });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting form', error });
  }
};

// @desc Get all forms from the database
// @route GET /api/forms
// @access Public
const getAllForms = async (req, res) => {
  try {
    const forms = await Form.find();
    res.status(200).json(forms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update rent for a specific form
// @route PUT /api/forms/:id
// @access Public
// @desc Update rent for a specific form
// @route PUT /api/forms/:id
// @access Public

const getMonthYear = (date) => {
  const d = new Date(date);
  return `${d.toLocaleString('default', { month: 'short' })}-${d.getFullYear().toString().slice(-2)}`;
};


const updateForm = async (req, res) => {
  const { id } = req.params;
  const { rentAmount, date } = req.body;

  try {
    const form = await Form.findById(id);
    if (!form) return res.status(404).json({ message: "Form not found" });

    const monthYear = getMonthYear(date);
    const rentIndex = form.rents.findIndex((rent) => getMonthYear(rent.date) === monthYear);

    if (rentIndex !== -1) {
      form.rents[rentIndex] = { rentAmount: Number(rentAmount), date: new Date(date) };
    } else {
      form.rents.push({ rentAmount: Number(rentAmount), date: new Date(date) });
    }

    const updatedForm = await form.save();
    res.status(200).json(updatedForm); // Return updated form data
  } catch (error) {
    res.status(500).json({ message: "Error updating rent: " + error.message });
  }
};

// @desc Delete a form and move its data to the DuplicateForm model
// @route DELETE /api/forms/:id
// @access Public
const deleteForm = async (req, res) => {
  const { id } = req.params;

  try {
    // Find the form to delete
    const formToDelete = await Form.findById(id);

    if (!formToDelete) {
      return res.status(404).json({ message: 'Form not found' });
    }

    // Create a new duplicate form using the data from the original form
    const duplicateForm = new DuplicateForm({
      originalFormId: formToDelete._id,
      formData: formToDelete, // Save all the form's data
      deletedAt: Date.now(),
    });

    // Save the duplicate form
    await duplicateForm.save();

    // Delete the original form
    await Form.findByIdAndDelete(id);

    res.status(200).json({ message: 'Form deleted and saved as a duplicate successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getDuplicateForms = async (req, res) => {
  try {
    const duplicateForms = await DuplicateForm.find().populate('originalFormId').exec();
    res.status(200).json(duplicateForms);
  } catch (err) {
    console.error('Error fetching duplicate forms:', err.message);
    res.status(500).json({ message: 'Error fetching duplicate forms' });
  }
};

const saveLeaveDate = async (req, res) => {
  const { id, leaveDate } = req.body;

  try {
    const form = await Form.findById(id);
    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    form.leaveDate = new Date(leaveDate);
    await form.save();

    res.status(200).json({ form, leaveDate: form.leaveDate });
  } catch (error) {
    res.status(500).json({ message: "Error saving leave date: " + error.message });
  }
};

// Function to check and archive expired leave dates
const checkAndArchiveLeaves = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Ensure comparison is date-only

    // Find forms where leaveDate is exactly today
    const expiredForms = await Form.find({ leaveDate: today });

    for (let form of expiredForms) {
      await archiveAndDeleteForm(form);
    }

    console.log("Checked and archived expired leave records.");
  } catch (error) {
    console.error("Error checking and archiving leaves:", error);
  }
};

// Schedule this to run every midnight
setInterval(checkAndArchiveLeaves, 24 * 60 * 60 * 1000); 

// Function to archive and delete form
const archiveAndDeleteForm = async (form) => {
  const archivedData = new Archive({ ...form._doc });
  await archivedData.save();
  await Form.findByIdAndDelete(form._id);
};

// Schedule the archive check to run daily at midnight


// Fetch all forms with leave dates to display them on the frontend
const getForms = async (req, res) => {
  try {
    const forms = await Form.find({});
    res.status(200).json(forms);
  } catch (error) {
    res.status(500).json({ message: "Error fetching forms: " + error.message });
  }
};

const archiveForm = async (req, res) => {
  const { id } = req.body;

  try {
    const formToArchive = await Form.findById(id);
    if (!formToArchive) {
      return res.status(404).json({ message: 'Form not found' });
    }

    const archivedData = new Archive({
      ...formToArchive._doc, // Copy all data
    });

    await archivedData.save();
    await Form.findByIdAndDelete(id);

    res.status(200).json(archivedData);
  } catch (error) {
    res.status(500).json({ message: 'Error archiving form: ' + error.message });
  }
};


const restoreForm = async (req, res) => {
  const { id } = req.body;
  console.log('Restore Request ID:', id);

  try {
    const archivedData = await Archive.findById(id);
    console.log('Archived Data Found:', archivedData);

    if (!archivedData) {
      return res.status(404).json({ message: 'Archived data not found' });
    }

    // Create a new form document using archived data (excluding leaveDate)
    const { leaveDate, ...restoredData } = archivedData.toObject();

    const restoredForm = new Form(restoredData);

    // Save the restored form data
    await restoredForm.save();
    console.log('Restored Data:', restoredForm);

    // Remove the record from the archive
    await Archive.findByIdAndDelete(id);
    console.log('Archived Data Deleted:', id);

    res.status(200).json(restoredForm);
  } catch (error) {
    console.error('Error restoring archived data:', error.message);
    res.status(500).json({ message: 'Error restoring archived data' });
  }
};



const getArchivedForms = async (req, res) => {
  try {
    const archivedForms = await Archive.find(); // Fetch all archived forms
    res.status(200).json(archivedForms);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching archived forms: ' + error.message });
  }
};

// Update form details
const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Find the entity by ID and update it with new data
    const updatedForm = await Form.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedForm) {
      return res.status(404).json({ message: "Entity not found" });
    }

    res.status(200).json(updatedForm);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};


const getFormById = async (req, res) => {
  try {
    const { id } = req.params;
    const form = await Archive.findById(id);

    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    res.json(form);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

//for rentAmount updation Logic 0 

const rentAmountDel = async (req, res) => {
  const { formId, monthYear } = req.params;

  try {
    const form = await Form.findById(formId);
    if (!form) return res.status(404).json({ message: "Form not found" });

    // Remove rent entry for the specified month
    form.rents = form.rents.filter((rent) => getMonthYear(rent.date) !== monthYear);
    await form.save();

    res.status(200).json({ message: "Rent entry removed successfully", form });
  } catch (error) {
    console.error("Error removing rent entry:", error);
    res.status(500).json({ message: "Failed to remove rent", error });
  }
};
module.exports = { getNextSrNo, rentAmountDel , processLeave , getFormById , getForms, checkAndArchiveLeaves, updateProfile , getArchivedForms,saveLeaveDate, restoreForm  , archiveForm , saveForm, getAllForms, updateForm, deleteForm ,getDuplicateForms };

































// import React, { useState, useEffect } from "react";

// const UpdateForm = ({ formId }) => {
//   const [formData, setFormData] = useState({
//     srNo: "",
//     name: "",
//     joiningDate: "",
//     roomNo: "",
//     depositAmount: "",
//     address: "",
//     relativeAddress1: "",
//     relativeAddress2: "",
//     floorNo: "",
//     bedNo: "",
//     companyAddress: "",
//     dateOfJoiningCollege: "",
//     dob: "",
//     rents: [{ rentAmount: "", date: "" }],
//   });

//   useEffect(() => {
//     // Fetch existing data for the given formId
//     fetch(`http://localhost:5000/api/form/${formId}`)
//       .then((res) => res.json())
//       .then((data) => {
//         setFormData(data);
//       })
//       .catch((err) => console.error(err));
//   }, [formId]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//   };

//   const handleRentChange = (index, e) => {
//     const { name, value } = e.target;
//     const updatedRents = [...formData.rents];
//     updatedRents[index][name] = value;
//     setFormData({ ...formData, rents: updatedRents });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await fetch(`http://localhost:5000/api/form/update/${formId}`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(formData),
//       });

//       const result = await response.json();
//       if (response.ok) {
//         alert("Form updated successfully!");
//       } else {
//         alert("Error updating form: " + result.message);
//       }
//     } catch (error) {
//       console.error("Error updating form:", error);
//     }
//   };

//   return (
//     <div>
//       <h2>Update Form</h2>
//       <form onSubmit={handleSubmit}>
//         <input type="text" name="srNo" value={formData.srNo} onChange={handleChange} placeholder="Sr No" required />
//         <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Name" required />
//         <input type="date" name="joiningDate" value={formData.joiningDate} onChange={handleChange} required />
//         <input type="text" name="roomNo" value={formData.roomNo} onChange={handleChange} placeholder="Room No" required />
//         <input type="number" name="depositAmount" value={formData.depositAmount} onChange={handleChange} placeholder="Deposit Amount" required />
//         <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Address" required />
//         <input type="text" name="relativeAddress1" value={formData.relativeAddress1} onChange={handleChange} placeholder="Relative Address 1" />
//         <input type="text" name="relativeAddress2" value={formData.relativeAddress2} onChange={handleChange} placeholder="Relative Address 2" />
//         <input type="text" name="floorNo" value={formData.floorNo} onChange={handleChange} placeholder="Floor No" required />
//         <input type="text" name="bedNo" value={formData.bedNo} onChange={handleChange} placeholder="Bed No" required />
//         <input type="text" name="companyAddress" value={formData.companyAddress} onChange={handleChange} placeholder="Company Address" />
//         <input type="date" name="dateOfJoiningCollege" value={formData.dateOfJoiningCollege} onChange={handleChange} required />
//         <input type="date" name="dob" value={formData.dob} onChange={handleChange} required />

//         <h3>Rents</h3>
//         {formData.rents.map((rent, index) => (
//           <div key={index}>
//             <input
//               type="number"
//               name="rentAmount"
//               value={rent.rentAmount}
//               onChange={(e) => handleRentChange(index, e)}
//               placeholder="Rent Amount"
//             />
//             <input
//               type="date"
//               name="date"
//               value={rent.date}
//               onChange={(e) => handleRentChange(index, e)}
//             />
//           </div>
//         ))}

//         <button type="submit">Update</button>
//       </form>
//     </div>
//   );
// };

// export default UpdateForm;


















// import React, { useState, useEffect } from 'react';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import axios from 'axios';
// import { useNavigate } from "react-router-dom";
// import '../stylecss/mainpage.css'

// import { FaEdit, FaTrash } from "react-icons/fa";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; // For FontAwesome
// import { faPen, faTrash } from "@fortawesome/free-solid-svg-icons";

// import '../App.css';

// function UpdateData() {
//   const [formData, setFormData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
// const [currentDeleteId, setCurrentDeleteId] = useState(null);

//   const [showModal, setShowModal] = useState(false);
//   const [currentFormId, setCurrentFormId] = useState(null);
//   const [newRent, setNewRent] = useState({ rentAmount: '', date: '' });
//    const navigate = useNavigate();
  
//     const handleNavigation = (path) => {
//       navigate(path);
//     };

//   const apiUrl = 'https://hostelpaymentmanger.onrender.com/api/'; // Replace with your actual API endpoint

//   const months = [
//     'Jan-25',
//     'Feb-25',
//     'Mar-25',
//     'Apr-25',
//     'May-25',
//     'Jun-25',
//     'Jul-25',
//     'Aug-25',
//     'Sep-25',
//     'Oct-25',
//     'Nov-25',
//     'Dec-25',
//     'Jan-26',
//     'Feb-26',
//     'Mar-26',
//     'Apr-26',
//     'May-26',
//     'Jun-26',
//     'Jul-26',
//     'Aug-26',
//     'Sep-26',
//     'Oct-26',
//     'Nov-26',
//     'Dec-26',
//   ];

//   useEffect(() => {
//     axios
//       .get(apiUrl)
//       .then((response) => {
//         console.log('Response Data:', response.data); // Check the data structure
//         setFormData(response.data);
//         setLoading(false);
//       })
//       .catch((error) => {
//         console.error('Error fetching data:', error);
//         setError('Failed to fetch data. Please try again later.');
//         setLoading(false);
//       });
//   }, [apiUrl]);

//   // function getMonthYear(date) {
//   //   const month = new Date(date).toLocaleString('default', { month: 'short' }); // Get the short month name
//   //   const year = new Date(date).getFullYear().toString().slice(-2); // Get the last two digits of the year
//   //   return `${month}-${year}`; // Return a string like 'Feb-25'
//   // }

//   const openUpdateModal = (id) => {
//     setCurrentFormId(id);
//     setShowModal(true);
//   };

//   const closeUpdateModal = () => {
//     setShowModal(false);
//     setNewRent({ rentAmount: '', date: '' });
//     setCurrentFormId(null);
//   };

//   const handleUpdate = () => {
//     if (!newRent.rentAmount || !newRent.date) {
//       alert('Please fill out all fields.');
//       return;
//     }
  
//     // Get the formatted month-year
//     const monthYear = getMonthYear(newRent.date);
  
//     // Create the new rent entry
//     const newRentEntry = {
//       rentAmount: newRent.rentAmount,
//       date: newRent.date,
//     };
  
//     // Update local formData state
//     const updatedFormData = formData.map((data) => {
//       if (data._id === currentFormId) {
//         const rentIndex = data.rents.findIndex(
//           (rent) => getMonthYear(rent.date) === monthYear
//         );
  
//         if (rentIndex !== -1) {
//           // If a rent entry for the same month exists, update it
//           data.rents[rentIndex] = newRentEntry;
//         } else {
//           // If no rent entry exists for the month, add the new rent
//           data.rents.push(newRentEntry);
//         }
//       }
//       return data;
//     });
  
//     setFormData(updatedFormData); // Update the local state
  
//     // Send PUT request to backend
//     axios
//       .put(`https://hostelpaymentmanger.onrender.com/api/form/${currentFormId}`, newRentEntry)
//       .then((response) => {
//         setFormData((prevFormData) =>
//           prevFormData.map((data) =>
//             data._id === response.data._id ? response.data : data
//           )
//         );
//         closeUpdateModal();
//       })
//       .catch((error) => {
//         console.error('Error updating rent:', error);
//         alert('Failed to update rent. Please try again later.');
//       });
//   };
  
//   // Utility Function to Get Month-Year Format
//   const getMonthYear = (date) => {
//     const d = new Date(date);
//     return `${d.toLocaleString('default', { month: 'short' })}-${d.getFullYear().toString().slice(-2)}`;
//   };
  
//   // Utility Function to Get Month-Year Format

  
//   const openDeleteConfirmation = (id) => {
//     setCurrentDeleteId(id);
//     setShowDeleteConfirmation(true);
//   };
//   // const deleteForm = async (id) => {
//   //   try {
//   //     await axios.delete(`http://localhost:5000/api/form/${id}`);
//   //     setFormData((prevFormData) => prevFormData.filter((data) => data._id !== id));
//   //     alert('Form deleted and saved as a duplicate successfully');
//   //   } catch (error) {
//   //     console.error('Error deleting form:', error);
//   //     alert('Failed to delete form. Please try again later.');
//   //   }
//   // };

//   const handleDeleteConfirm = async () => {
//     try {
//       await axios.delete(`https://hostelpaymentmanger.onrender.com/api/form/${currentDeleteId}`);
//       setFormData((prevFormData) => prevFormData.filter((data) => data._id !== currentDeleteId));
//       alert('Form deleted successfully');
//       setShowDeleteConfirmation(false);  // Close confirmation modal
//     } catch (error) {
//       console.error('Error deleting form:', error);
//       alert('Failed to delete form. Please try again later.');
//     }
//   };

//   if (loading) {
//     return <div className="text-center mt-5">Loading...</div>;
//   }

//   if (error) {
//     return <div className="text-center mt-5 text-danger">{error}</div>;
//   }

//   return (
//     <div className="container mt-5">
//     <div className="mb-4">
//       <button className="btn btn-primary me-3" onClick={() => window.history.back()}>
//         Back
//       </button>
//       <button className="btn btn-primary me-3" onClick={() => handleNavigation("/duplicate-data")}>
//         BACKUP DATA
//       </button>
//     </div>
//     <table className="table table-bordered table-hover">
//     <thead className="thead-light styled-header" style={{ backgroundColor: '#f5f5dc' }}>
//   <tr style={{ fontWeight: 'bold', color: 'black' }}>
//     <th style={{ backgroundColor: '#ffc0cb' }}>Edit/Delete</th> {/* Combined column */}
//     <th style={{ backgroundColor: '#ffc0cb' }}>Sr No.</th>
//     <th className="light-brown" style={{ backgroundColor: '#ffc0cb' }}>
//       <div className="header-item">
//         <span>Name</span>
//              </div>
//     </th>
//     <th className="light-brown" style={{ backgroundColor: '#ffc0cb' }}>
//       <div className="header-item">
//         <span>Room No.</span>
       
//       </div>
//     </th>
//     {months.map((month) => (
//       <th key={month} className="light-brown" style={{ backgroundColor: '#ffc0cb' }}>
//         <div className="header-item">
//           <span>{month}</span>
         
//         </div>
//       </th>
//     ))}
//   </tr>
//   <tr style={{ fontWeight: 'bold', color: 'black' }}>
//     <th style={{ backgroundColor: '#ffc0cb' }}></th> {/* Combined column */}
//     <th style={{ backgroundColor: '#ffc0cb' }}></th>
//     <th className="light-brown" style={{ backgroundColor: '#ffc0cb' }}>
//       <div className="header-item">
        
//         <span>Joining Date</span>
//       </div>
//     </th>
//     <th className="light-brown" style={{ backgroundColor: '#ffc0cb' }}>
//       <div className="header-item">
       
//         <span>Deposit Amount</span>
//       </div>
//     </th>
//     {months.map((month) => (
//       <th key={month} className="light-brown" style={{ backgroundColor: '#ffc0cb' }}>
//         <div className="header-item">
         
//           <span>Date</span>
//         </div>
//       </th>
//     ))}
//   </tr>
// </thead>
//       <tbody>
//         {Array.isArray(formData) && formData.length > 0 ? (
//           formData.map((data, index) => (
//             <tr style={{ fontWeight: 'bold', color: 'black' }} key={index}>
//               <td>
//                 <div className="d-flex gap-4">
//                   <button
//                     className="btn btn-primary"
//                     onClick={() => openUpdateModal(data._id)}
//                   >
//                      <FaEdit  />
                   
//                   </button>
//                   <button
//                     className="btn btn-danger"
//                     onClick={() => openDeleteConfirmation(data._id)}
//                   >
//                     <FontAwesomeIcon icon={faTrash}  />
//                   </button>
//                 </div>
//               </td>
//               <td style={{ fontWeight: 'bold', color: 'black' }}>{index + 1}</td>
//               <td>
//                 <div className="row-item">
//                   <span style={{ fontWeight: 'bold', color: 'black' }}>{data.name}</span>
//                   <hr />
//                   <span>{new Date(data.joiningDate).toLocaleDateString()}</span>
//                 </div>
//               </td>
//               <td>
//                 <div className="row-item">
//                   <span style={{ color: '#ffc107' }}>{data.roomNo}</span>
//                   <hr />
//                   <span style={{ color: '#ffc107' }}>{data.depositAmount}</span>
//                 </div>
//               </td>
//               {months.map((month) => {
//                 const matchingRent = data.rents.find((rent) => getMonthYear(rent.date) === month);
//                 console.log(`Month: ${month}, Matching Rent:`, matchingRent);
  
//                 return (
//                   <td key={month}>
//                     <div className="row-item">
//                       {matchingRent ? (
//                         <>
//                           <span>{matchingRent.rentAmount}</span>
//                           <hr />
//                           <span style={{ color: 'green' }}>{new Date(matchingRent.date).toLocaleDateString()}</span>
//                         </>
//                       ) : (
//                         <span>--</span>
//                       )}
//                     </div>
//                   </td>
//                 );
//               })}
//             </tr>
//           ))
//         ) : (
//           <tr>
//             <td colSpan={months.length + 3}>No data available</td>
//           </tr>
//         )}
//       </tbody>
//     </table>
//     {/* Modals remain unchanged */}
 
  
//       {showDeleteConfirmation && (
//         <div className="modal show d-block" tabIndex="-1">
//           <div className="modal-dialog">
//             <div className="modal-content">
//               <div className="modal-header">
//                 <h5 className="modal-title">Confirm Deletion</h5>
//                 <button
//                   type="button"
//                   className="btn-close"
//                   onClick={() => setShowDeleteConfirmation(false)}
//                 ></button>
//               </div>
//               <div className="modal-body">
//                 <p>Are you sure you want to delete this form?</p>
//               </div>
//               <div className="modal-footer">
//                 <button
//                   className="btn btn-secondary"
//                   onClick={() => setShowDeleteConfirmation(false)}
//                 >
//                   Cancel
//                 </button>
//                 <button className="btn btn-danger" onClick={handleDeleteConfirm}>
//                   Yes, Delete
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Update Modal */}
//       {showModal && (
//         <div className="modal show d-block" tabIndex="-1">
//           <div className="modal-dialog">
//             <div className="modal-content">
//               <div className="modal-header">
//                 <h5 className="modal-title">Update Rent</h5>
//                 <button type="button" className="btn-close" onClick={closeUpdateModal}></button>
//               </div>
//               <div className="modal-body">
//                 <div className="mb-3">
//                   <label htmlFor="rentAmount" className="form-label">
//                     Rent Amount
//                   </label>
//                   <input
//                     type="number"
//                     className="form-control"
//                     id="rentAmount"
//                     value={newRent.rentAmount}
//                     onChange={(e) =>
//                       setNewRent((prev) => ({ ...prev, rentAmount: e.target.value }))
//                     }
//                   />
//                 </div>
//                 <div className="mb-3">
//                   <label htmlFor="rentDate" className="form-label">
//                     Rent Date
//                   </label>
//                   <input
//                     type="date"
//                     className="form-control"
//                     id="rentDate"
//                     value={newRent.date}
//                     onChange={(e) =>
//                       setNewRent((prev) => ({ ...prev, date: e.target.value }))
//                     }
//                   />
//                 </div>
//               </div>
//               <div className="modal-footer">
//                 <button className="btn btn-secondary" onClick={closeUpdateModal}>
//                   Close
//                 </button>
//                 <button className="btn btn-primary" onClick={handleUpdate}>
//                   Save Changes
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default UpdateData;
// add data

// import React, { useState, useEffect } from 'react';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import axios from 'axios';
// import * as XLSX from 'xlsx';
// import '../App.css';
// import { useNavigate } from "react-router-dom";
// import '../stylecss/mainpage.css';
// import FormDownload from '../componenet/Maintanace/FormDownload';
// import { FaEdit} from "react-icons/fa";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; // For FontAwesome
// import { faTrash } from "@fortawesome/free-solid-svg-icons";

// function AddData() {
//   const [formData, setFormData] = useState([]);
//   const [deletedData, setDeletedData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selectedRowData, setSelectedRowData] = useState(null);
//     const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
//   const [currentDeleteId, setCurrentDeleteId] = useState(null);
//   const [selectedMonthYear, setSelectedMonthYear] = useState('');
// const [showRentAmountModal, setShowRentAmountModal] = useState(false);

//     const [showModal, setShowModal] = useState(false);
//     const [currentFormId, setCurrentFormId] = useState(null);
//     const [newRent, setNewRent] = useState({ rentAmount: '', date: '' });

//   const apiUrl = 'https://hostelpaymentmanger.onrender.com/api/'; // Replace with your actual API endpoint

//   const months = [
//     'Jan-25', 'Feb-25', 'Mar-25', 'Apr-25', 'May-25', 'Jun-25', 'Jul-25',
//     'Aug-25', 'Sep-25', 'Oct-25', 'Nov-25', 'Dec-25',
    
//   ];
//    const navigate = useNavigate();
//   const handleNavigation = (path) => {
//     navigate(path);
//   };

  
//   useEffect(() => {
//     axios
//       .get(apiUrl)
//       .then((response) => {
//         setFormData(response.data);
//         setLoading(false);
//       })
//       .catch((error) => {
//         console.error('Error fetching data:', error);
//         setError('Failed to fetch data. Please try again later.');
//         setLoading(false);
//       });
//   }, [apiUrl]);

//   const downloadExcel = () => {
//     const flattenedData = formData.map((data) => ({
//       'Sr No.': data.srNo || '',
//       Name: data.name || '',
//       'Room No.': data.roomNo || '',
//       'Joining Date': formatDate(data.joiningDate) || '',
//       'Deposit Amount': data.depositAmount || '',
//       ...months.reduce((acc, month) => {
//         const rent = data.rents.find((r) => getMonthYear(r.date) === month);
//         acc[month] = rent ? `${rent.rentAmount} | ${formatDate(rent.date)}` : '--';
//         return acc;
//       }, {}),
//     }));

//     const flattenedDeletedData = deletedData.map((data, index) => ({
//       'Sr No.': index + 1,
//       Name: data.name || '',
//       'Room No.': data.roomNo || '',
//       'Joining Date': formatDate(data.joiningDate) || '',
//       'Deposit Amount': data.depositAmount || '',
//     }));

//     const workbook = XLSX.utils.book_new();
//     const activeSheet = XLSX.utils.json_to_sheet(flattenedData);
//     const deletedSheet = XLSX.utils.json_to_sheet(flattenedDeletedData);

//     XLSX.utils.book_append_sheet(workbook, activeSheet, 'Active Data');
//     XLSX.utils.book_append_sheet(workbook, deletedSheet, 'Deleted Data');

//     XLSX.writeFile(workbook, 'RentData.xlsx');
//   };
//   const openUpdateModal = (id) => {
//     setCurrentFormId(id);
//     setShowModal(true);
//   };

//   const closeUpdateModal = () => {
//     setShowModal(false);
//     setNewRent({ rentAmount: '', date: '' });
//     setCurrentFormId(null);
//   };

//   const handleUpdate = () => {
//     if (!newRent.rentAmount || !newRent.date) {
//       alert('Please fill out all fields.');
//       return;
//     }
  
//     // Get the formatted month-year
//     const monthYear = getMonthYear(newRent.date);
  
//     // Create the new rent entry
//     const newRentEntry = {
//       rentAmount: newRent.rentAmount,
//       date: newRent.date,
//     };
  
//     // Update local formData state
//     const updatedFormData = formData.map((data) => {
//       if (data._id === currentFormId) {
//         const rentIndex = data.rents.findIndex(
//           (rent) => getMonthYear(rent.date) === monthYear
//         );
  
//         if (rentIndex !== -1) {
//           // If a rent entry for the same month exists, update it
//           data.rents[rentIndex] = newRentEntry;
//         } else {
//           // If no rent entry exists for the month, add the new rent
//           data.rents.push(newRentEntry);
//         }
//       }
//       return data;
//     });
  
//     setFormData(updatedFormData); // Update the local state
  
//     // Send PUT request to backend
//     axios 
//       .put(`https://hostelpaymentmanger.onrender.com/api/form/${currentFormId}`, newRentEntry)
//       .then((response) => {
//         setFormData((prevFormData) =>
//           prevFormData.map((data) =>
//             data._id === response.data._id ? response.data : data
//           )
//         );
//         closeUpdateModal();
//       })
//       .catch((error) => {
//         console.error('Error updating rent:', error);
//         alert('Failed to update rent. Please try again later.');
//       });
//   };
  
//   // Utility Function to Get Month-Year Format
//   const getMonthYear = (date) => {
//     const d = new Date(date);
//     return `${d.toLocaleString('default', { month: 'short' })}-${d.getFullYear().toString().slice(-2)}`;
//   };
//   const openDeleteConfirmation = (id) => {
//     setCurrentDeleteId(id);
//     setShowDeleteConfirmation(true);
//   };
  

//   const handleRentAmountUpdate = () => {
//     if (!newRent.rentAmount || !selectedMonthYear) {
//       alert('Please provide a valid rent amount and select a month-year.');
//       return;
//     }
  
//     axios
//       .put(`http://localhost:5000/api/form/${currentFormId}/rent-amount`, {
//         rentAmount: newRent.rentAmount,
//         monthYear: selectedMonthYear,
//       })
//       .then((response) => {
//         setFormData((prevFormData) =>
//           prevFormData.map((data) =>
//             data._id === response.data._id ? response.data : data
//           )
//         );
//         closeUpdateModal(); // Close the modal
//       })
//       .catch((error) => {
//         console.error('Error updating rent amount:', error);
//         alert('Failed to update rent amount. Please try again.');
//       });
//   };
  
//   const closeRentAmountModal = () => {
//     setShowRentAmountModal(false);
//     setNewRent({ rentAmount: '', date: '' });
//     setSelectedMonthYear('');
//   };
//   const openRentAmountModal = (monthYear, formId) => {
//     setSelectedMonthYear(monthYear);
//     setCurrentFormId(formId);
//     setShowRentAmountModal(true);
//   };
  

//   const handleDeleteConfirm = async () => {
//     try {
//       await axios.delete(`https://hostelpaymentmanger.onrender.com/api/form/${currentDeleteId}`);
//       setFormData((prevFormData) => prevFormData.filter((data) => data._id !== currentDeleteId));
//       alert('Form deleted successfully');
//       setShowDeleteConfirmation(false);  // Close confirmation modal
//     } catch (error) {
//       console.error('Error deleting form:', error);
//       alert('Failed to delete form. Please try again later.');
//     }
//   };
//   const formatDate = (date) => {
//     const formattedDate = new Date(date).toLocaleDateString(); // Ensures only the date is displayed
//     return formattedDate;
//   };

//   if (loading) {
//     return <div className="text-center mt-5">Loading...</div>;
//   }

//   if (error) {
//     return <div className="text-center mt-5 text-danger">{error}</div>;
//   }

//   return (
//     <div className="ms-5 mt-5">
//       <div className="mb-4">
//         <button className="btn btn-primary me-3" onClick={() => window.history.back()}>
//            Back
//         </button>
//         <button className="btn btn-primary me-3" onClick={downloadExcel}>
//           Download
//         </button>
//         <button className="btn btn-primary me-3" onClick={() => handleNavigation("/duplicate-data")}>
//         Backup
//       </button>
//       </div>

//       <table className="table table-bordered table-hover" style={{border: '2px solid black'}}>
//         <thead className="thead-light styled-header">
//           <tr style={{ fontWeight: 'bold', color: 'black' }}>
//             <th style={{ backgroundColor: 'rgb(199 124 136)', color:'white' }}>Sr No.</th>
//             <th style={{ backgroundColor: 'rgb(199 124 136)' , color:'white' }}>Edit</th> {/* Combined column */}
//             {/* <th style={{ backgroundColor: 'rgb(199 124 136)', color:'white' }}>Information</th> */}
//             <th style={{ backgroundColor: 'rgb(199 124 136)', color:'white' }}>Name </th>
//             <th style={{ backgroundColor: 'rgb(199 124 136)', color:'white' }}>Room No. </th>
//             {months.map((month) => (
//               <th key={month}  style={{ backgroundColor: 'rgb(199 124 136)' , color:'white'}}>{month}</th>
//             ))}
//           </tr>
//           <tr>
//             <th style={{ backgroundColor: 'rgb(199 124 136)', color:'white' }}></th>
//             <th style={{ backgroundColor: 'rgb(199 124 136)', color:'white' }}>Delete</th>
//             {/* <th style={{ backgroundColor: 'rgb(199 124 136)', color:'white' }}></th> */}
//             <th style={{ backgroundColor: 'rgb(199 124 136)', color:'white' }}>Joining Date</th>
//             <th style={{ backgroundColor: 'rgb(199 124 136)', color:'white' }}>Deposit Amount</th>
//             {months.map((month) => (
//               <th style={{ backgroundColor: 'rgb(199 124 136)', color:'white' }} key={month}>Rent Date</th>
//             ))}
//           </tr>
//         </thead>
//         <tbody>
//           {Array.isArray(formData) && formData.length > 0 ? (
//             formData.map((data, index) => (
//               <tr style={{ fontWeight: 'bold', color: 'black' }} key={index}>
//                 <td>{index + 1}</td>
//                 <td>
//                           <div className="d-flex gap-2">
//                             <button
//                               className="btn"
//                               style={{fontSize:'25px'}}
//                               onClick={() => openUpdateModal(data._id)}
//                             >
//                               <FaEdit />
//                             </button>
//                             <button
//                               className="btn "
//                               style={{fontSize:'20px'}}
//                               onClick={() => openDeleteConfirmation(data._id)}
//                             >
//                               <FontAwesomeIcon icon={faTrash} />
//                             </button>
//                           </div>
//                         </td>
//                 {/* <td>
//                   <button
//                     className="btn"
//                     style={{ color: 'black', backgroundColor: '#bbb8b8' ,fontSize:'11px', fontWeight:'500'}}
//                     onClick={() => setSelectedRowData(data)}
//                   >
//                     Add. Form Download
//                   </button>
//                 </td> */}
// <td>
//   <div className="row">
//     <div
//       className="col-12"
//       onClick={() => setSelectedRowData(data)}
//       onMouseEnter={(e) => {
//         e.target.style.color = 'Black';
//         e.target.style.fontWeight = 'bold';
//         e.target.style.cursor = 'pointer';
//       }}
//       onMouseLeave={(e) => {
//         e.target.style.color = 'black';
//         e.target.style.fontWeight = 'normal';
//         e.target.style.cursor = 'default';
//       }}
//       style={{ fontWeight: 'bold', color: 'black' }}
//     >
//       {data.name}
//     </div>
//     <div className="col-12" style={{ color: 'rgb(209 94 13)' }}>
//       {formatDate(data.joiningDate)}
//     </div>
//   </div>
// </td>

//                 <td>
//                 <div className="row">
//                   <div className="col-12"  style={{
//               color:
//                 data.roomNo == 301
//                   ? 'orange'
//                   : data.roomNo == 302
//                   ? 'green'
//                   : data.roomNo == 401
//                   ? 'red'
//                   : data.roomNo == 402
//                   ? '#38a5e5'
//                   : '#ffc107', // Default color
//             }}>{data.roomNo}</div>
//                   <div className="col-12"  style={{ color: 'rgb(209 94 13)' }} >{data.depositAmount}</div>
//                   </div>
//                 </td>
//                 {months.map((month) => {
//                   const matchingRent = data.rents.find(
//                     (rent) =>
//                       new Date(rent.date).toLocaleString('default', { month: 'short' }) +
//                       '-' +
//                       new Date(rent.date).getFullYear().toString().slice(-2) ===
//                       month
//                   );
//                   const isCurrentMonth =
//                   month ===
//                   `${new Date().toLocaleString('default', { month: 'short' })}-${new Date()
//                     .getFullYear()
//                     .toString()
//                     .slice(-2)}`;
//                 const isDepositDatePassed = new Date(data.joiningDate).getDate() <= new Date().getDate();
//                 const isMissingCurrentRent = isCurrentMonth && !matchingRent && isDepositDatePassed;
              
//                   return (
//                     <td key={month}>
//                       {matchingRent ? (
//                         <>
//                           <div
//                             onClick={() => openRentAmountModal(month, data._id)}
//                             onMouseEnter={(e) => {
//                               e.target.style.color = 'green';
//                               e.target.style.fontWeight = 'bold';
//                               e.target.style.cursor = 'pointer';
//                             }}
//                             onMouseLeave={(e) => {
//                               e.target.style.color = 'black';
//                               e.target.style.fontWeight = 'bold';
//                               e.target.style.cursor = 'default';
//                             }}
//       >{matchingRent.rentAmount}</div>
//                           <div style={{ color: 'rgb(209 94 13)' }}>{formatDate(matchingRent.date)}</div>
//                         </>
//                       )  : isMissingCurrentRent ? (
//                         <div style={{ color: 'red' }}>
//                           No Rent Added
//                           <div className="d-flex justify-content-between mt-2">
//                             <button
//                               className="btn btn-sm btn-primary"
//                               onClick={() =>
//                                 setNewRent({ rentAmount: '', date: new Date().toISOString().split('T')[0] }) ||
//                                 setCurrentFormId(data._id) ||
//                                 setShowModal(true)
//                               }
//                             >
//                               OK
//                             </button>
//                             <button className="btn btn-sm btn-secondary" onClick={() => setNewRent({ rentAmount: '', date: '' })}>
//                               Undo
//                             </button>
//                           </div>
//                         </div>
//                       ) : (
//                         '--'
//                       )}
//                     </td>
//                   );
//                 })}
//               </tr>
//             ))
//           ) : (
//             <tr>
//               <td colSpan={months.length + 3}>No data available</td>
//             </tr>
//           )}
//         </tbody>
//       </table>

//       {selectedRowData && (
//         <div className="mt-5">
//           <FormDownload formData={selectedRowData} />
//         </div>
//       )}

//        {/* Modals remain unchanged */}
 
  
//        {showDeleteConfirmation && (
//         <div className="modal show d-block" tabIndex="-1">
//           <div className="modal-dialog">
//             <div className="modal-content">
//               <div className="modal-header">
//                 <h5 className="modal-title">Confirm Deletion</h5>
//                 <button
//                   type="button"
//                   className="btn-close"
//                   onClick={() => setShowDeleteConfirmation(false)}
//                 ></button>
//               </div>
//               <div className="modal-body">
//                 <p>Are you sure you want to delete this form?</p>
//               </div>
//               <div className="modal-footer">
//                 <button
//                   className="btn btn-secondary"
//                   onClick={() => setShowDeleteConfirmation(false)}
//                 >
//                   Cancel
//                 </button>
//                 <button className="btn btn-danger" onClick={handleDeleteConfirm}>
//                   Yes, Delete
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}


// {showRentAmountModal && (
//   <div className="modal show d-block" tabIndex="-1">
//     <div className="modal-dialog">
//       <div className="modal-content">
//         <div className="modal-header">
//           <h5 className="modal-title">Update Rent Amount</h5>
//           <button type="button" className="btn-close" onClick={closeRentAmountModal}></button>
//         </div>
//         <div className="modal-body">
//           <div className="mb-3">
//             <label htmlFor="rentAmount" className="form-label">
//               Rent Amount
//             </label>
//             <input
//               type="number"
//               className="form-control"
//               id="rentAmount"
//               value={newRent.rentAmount}
//               onChange={(e) =>
//                 setNewRent((prev) => ({ ...prev, rentAmount: e.target.value }))
//               }
//             />
//           </div>
//           <div className="mb-3">
//             <label htmlFor="monthYear" className="form-label">
//               Month-Year
//             </label>
//             <input
//               type="text"
//               className="form-control"
//               id="monthYear"
//               value={selectedMonthYear}
//               readOnly
//             />
//           </div>
//         </div>
//         <div className="modal-footer">
//           <button className="btn btn-secondary" onClick={closeRentAmountModal}>
//             Close
//           </button>
//           <button className="btn btn-primary" onClick={handleRentAmountUpdate}>
//             Save Changes
//           </button>
//         </div>
//       </div>
//     </div>
//   </div>
// )}

//       {/* Update Modal */}
//       {showModal && (
//         <div className="modal show d-block" tabIndex="-1">
//           <div className="modal-dialog">
//             <div className="modal-content">
//               <div className="modal-header">
//                 <h5 className="modal-title">Update Rent</h5>
//                 <button type="button" className="btn-close" onClick={closeUpdateModal}></button>
//               </div>
//               <div className="modal-body">
//                 <div className="mb-3">
//                   <label htmlFor="rentAmount" className="form-label">
//                     Rent Amount
//                   </label>
//                   <input
//                     type="number"
//                     className="form-control"
//                     id="rentAmount"
//                     value={newRent.rentAmount}
//                     onChange={(e) =>
//                       setNewRent((prev) => ({ ...prev, rentAmount: e.target.value }))
//                     }
//                   />
//                 </div>
//                 <div className="mb-3">
//                   <label htmlFor="rentDate" className="form-label">
//                     Rent Date
//                   </label>
//                   <input
//                     type="date"
//                     className="form-control"
//                     id="rentDate"
//                     value={newRent.date}
//                     onChange={(e) =>
//                       setNewRent((prev) => ({ ...prev, date: e.target.value }))
//                     }
//                   />
//                 </div>
//               </div>
//               <div className="modal-footer">
//                 <button className="btn btn-secondary" onClick={closeUpdateModal}>
//                   Close
//                 </button>
//                 <button className="btn btn-primary" onClick={handleUpdate}>
//                   Save Changes
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default AddData;




//update data

// import React, { useState, useEffect } from 'react';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import axios from 'axios';
// import { useNavigate } from "react-router-dom";
// import '../stylecss/mainpage.css'

// import { FaEdit} from "react-icons/fa";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; // For FontAwesome
// import { faTrash } from "@fortawesome/free-solid-svg-icons";

// import '../App.css';

// function UpdateData() {
//   const [formData, setFormData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
// const [currentDeleteId, setCurrentDeleteId] = useState(null);

//   const [showModal, setShowModal] = useState(false);
//   const [currentFormId, setCurrentFormId] = useState(null);
//   const [newRent, setNewRent] = useState({ rentAmount: '', date: '' });
//    const navigate = useNavigate();
  
//     const handleNavigation = (path) => {
//       navigate(path);
//     };

//   const apiUrl = 'https://hostelpaymentmanger.onrender.com/api/'; // Replace with your actual API endpoint

//   const months = [
//     'Jan-25',
//     'Feb-25',
//     'Mar-25',
//     'Apr-25',
//     'May-25',
//     'Jun-25',
//     'Jul-25',
//     'Aug-25',
//     'Sep-25',
//     'Oct-25',
//     'Nov-25',
//     'Dec-25',
//     'Jan-26',
//     'Feb-26',
//     'Mar-26',
//     'Apr-26',
//     'May-26',
//     'Jun-26',
//     'Jul-26',
//     'Aug-26',
//     'Sep-26',
//     'Oct-26',
//     'Nov-26',
//     'Dec-26',
//   ];

//   useEffect(() => {
//     axios
//       .get(apiUrl)
//       .then((response) => {
//         console.log('Response Data:', response.data); // Check the data structure
//         setFormData(response.data);
//         setLoading(false);
//       })
//       .catch((error) => {
//         console.error('Error fetching data:', error);
//         setError('Failed to fetch data. Please try again later.');
//         setLoading(false);
//       });
//   }, [apiUrl]);

//   // function getMonthYear(date) {
//   //   const month = new Date(date).toLocaleString('default', { month: 'short' }); // Get the short month name
//   //   const year = new Date(date).getFullYear().toString().slice(-2); // Get the last two digits of the year
//   //   return `${month}-${year}`; // Return a string like 'Feb-25'
//   // }

//   const openUpdateModal = (id) => {
//     setCurrentFormId(id);
//     setShowModal(true);
//   };

//   const closeUpdateModal = () => {
//     setShowModal(false);
//     setNewRent({ rentAmount: '', date: '' });
//     setCurrentFormId(null);
//   };

//   const handleUpdate = () => {
//     if (!newRent.rentAmount || !newRent.date) {
//       alert('Please fill out all fields.');
//       return;
//     }
  
//     // Get the formatted month-year
//     const monthYear = getMonthYear(newRent.date);
  
//     // Create the new rent entry
//     const newRentEntry = {
//       rentAmount: newRent.rentAmount,
//       date: newRent.date,
//     };
  
//     // Update local formData state
//     const updatedFormData = formData.map((data) => {
//       if (data._id === currentFormId) {
//         const rentIndex = data.rents.findIndex(
//           (rent) => getMonthYear(rent.date) === monthYear
//         );
  
//         if (rentIndex !== -1) {
//           // If a rent entry for the same month exists, update it
//           data.rents[rentIndex] = newRentEntry;
//         } else {
//           // If no rent entry exists for the month, add the new rent
//           data.rents.push(newRentEntry);
//         }
//       }
//       return data;
//     });
  
//     setFormData(updatedFormData); // Update the local state
  
//     // Send PUT request to backend
//     axios
//       .put(`https://hostelpaymentmanger.onrender.com/api/form/${currentFormId}`, newRentEntry)
//       .then((response) => {
//         setFormData((prevFormData) =>
//           prevFormData.map((data) =>
//             data._id === response.data._id ? response.data : data
//           )
//         );
//         closeUpdateModal();
//       })
//       .catch((error) => {
//         console.error('Error updating rent:', error);
//         alert('Failed to update rent. Please try again later.');
//       });
//   };
  
//   // Utility Function to Get Month-Year Format
//   const getMonthYear = (date) => {
//     const d = new Date(date);
//     return `${d.toLocaleString('default', { month: 'short' })}-${d.getFullYear().toString().slice(-2)}`;
//   };
  
//   // Utility Function to Get Month-Year Format

  
//   const openDeleteConfirmation = (id) => {
//     setCurrentDeleteId(id);
//     setShowDeleteConfirmation(true);
//   };
//   // const deleteForm = async (id) => {
//   //   try {
//   //     await axios.delete(`http://localhost:5000/api/form/${id}`);
//   //     setFormData((prevFormData) => prevFormData.filter((data) => data._id !== id));
//   //     alert('Form deleted and saved as a duplicate successfully');
//   //   } catch (error) {
//   //     console.error('Error deleting form:', error);
//   //     alert('Failed to delete form. Please try again later.');
//   //   }
//   // };

//   const handleDeleteConfirm = async () => {
//     try {
//       await axios.delete(`https://hostelpaymentmanger.onrender.com/api/form/${currentDeleteId}`);
//       setFormData((prevFormData) => prevFormData.filter((data) => data._id !== currentDeleteId));
//       alert('Form deleted successfully');
//       setShowDeleteConfirmation(false);  // Close confirmation modal
//     } catch (error) {
//       console.error('Error deleting form:', error);
//       alert('Failed to delete form. Please try again later.');
//     }
//   };

//   if (loading) {
//     return <div className="text-center mt-5">Loading...</div>;
//   }

//   if (error) {
//     return <div className="text-center mt-5 text-danger">{error}</div>;
//   }

//   return (
//     <div className="mt-5 ms-5">
//     <div className="mb-4">
//       <button className="btn btn-primary me-3" onClick={() => window.history.back()}>
//         Back
//       </button>
//       <button className="btn btn-primary me-3" onClick={() => handleNavigation("/duplicate-data")}>
//         BACKUP DATA
//       </button>
//     </div>
//     <table className="table table-bordered table-hover" style={{border: '2px solid black'}}>
//     <thead className="thead-light styled-header">
//   <tr style={{ fontWeight: 'bold', color: 'black' }}>
//     <th style={{ backgroundColor: 'rgb(201 94 112)' }}>Edit/Delete</th> {/* Combined column */}
//     <th style={{ backgroundColor: 'rgb(201 94 112)' }}>Sr No.</th>
//     <th className="light-brown" style={{ backgroundColor: 'rgb(201 94 112)' }}>
//       <div className="header-item">
//         <span>Name</span>
//              </div>
//     </th>
//     <th className="light-brown" style={{ backgroundColor: 'rgb(201 94 112)' }}>
//       <div className="header-item">
//         <span>Room No.</span>
       
//       </div>
//     </th>
//     {months.map((month) => (
//       <th key={month} className="light-brown" style={{ backgroundColor: 'rgb(201 94 112)' }}>
//         <div className="header-item">
//           <span>{month}</span>
         
//         </div>
//       </th>
//     ))}
//   </tr>
//   <tr style={{ fontWeight: 'bold', color: 'black' }}>
//     <th style={{ backgroundColor: '#ffc0cb' }}></th> {/* Combined column */}
//     <th style={{ backgroundColor: '#ffc0cb' }}></th>
//     <th className="light-brown" style={{ backgroundColor: '#ffc0cb' }}>
//       <div className="header-item">
        
//         <span>Joining Date</span>
//       </div>
//     </th>
//     <th className="light-brown" style={{ backgroundColor: '#ffc0cb' }}>
//       <div className="header-item">
       
//         <span>Deposit Amount</span>
//       </div>
//     </th>
//     {months.map((month) => (
//       <th key={month} className="light-brown" style={{ backgroundColor: '#ffc0cb' }}>
//         <div className="header-item">
         
//           <span>Date</span>
//         </div>
//       </th>
//     ))}
//   </tr>
// </thead>
// <tbody>
//   {Array.isArray(formData) && formData.length > 0 ? (
//     formData.map((data, index) => (
//       <tr style={{ fontWeight: 'bold', color: 'black' }} key={index}>
//         <td>
//           <div className="d-flex gap-2">
//             <button
//               className="btn"
//               style={{fontSize:'25px'}}
//               onClick={() => openUpdateModal(data._id)}
//             >
//               <FaEdit />
//             </button>
//             <button
//               className="btn "
//               style={{fontSize:'20px'}}
//               onClick={() => openDeleteConfirmation(data._id)}
//             >
//               <FontAwesomeIcon icon={faTrash} />
//             </button>
//           </div>
//         </td>
//         <td style={{ fontWeight: 'bold', color: 'black' }}>{index + 1}</td>
//         <td>
//           <div className="row-item">
//             <span style={{ fontWeight: 'bold', color: 'black' }}>{data.name}</span>
//             <hr />
//             <span style={{ color: 'rgb(209 94 13)' }}>{new Date(data.joiningDate).toLocaleDateString()}</span>
//           </div>
//         </td>
//         <td>
//           <div className="row-item">
//             <span style={{
//               color:
//                 data.roomNo == 301
//                   ? 'orange'
//                   : data.roomNo == 302
//                   ? 'green'
//                   : data.roomNo == 401
//                   ? 'red'
//                   : data.roomNo == 402
//                   ? '#38a5e5'
//                   : '#ffc107', // Default color
//             }}>{data.roomNo}</span>
//             <hr />
//             <span style={{ color: 'rgb(209 94 13)' }}>{data.depositAmount}</span>
//           </div>
//         </td>
//         {months.map((month) => {
//           const matchingRent = data.rents.find((rent) => getMonthYear(rent.date) === month);
//           const currentMonth = new Date().getMonth();
//           const currentYear = new Date().getFullYear();
//           const isCurrentMonth = currentMonth === new Date(month).getMonth();

//           const missingRent =
//             isCurrentMonth &&
//             !matchingRent &&
//             new Date(data.joiningDate).getDate() <= new Date().getDate();

//           return (
//             <td key={month}>
//               <div className="row-item">
//                 {missingRent ? (
//                   <span style={{ color: 'red' }}>
//                     {new Date(currentYear, currentMonth).toLocaleDateString()}
//                   </span>
//                 ) : matchingRent ? (
//                   <>
//                     <span>{matchingRent.rentAmount}</span>
//                     <hr />
//                     <span style={{ color: 'green' }}>
//                       {new Date(matchingRent.date).toLocaleDateString()}
//                     </span>
//                   </>
//                 ) : (
//                   <span>--</span>
//                 )}
//               </div>
//             </td>
//           );
//         })}
//       </tr>
//     ))
//   ) : (
//     <tr>
//       <td colSpan={months.length + 3}>No data available</td>
//     </tr>
//   )}
// </tbody>

//     </table>
//     {/* Modals remain unchanged */}
 
  
//       {showDeleteConfirmation && (
//         <div className="modal show d-block" tabIndex="-1">
//           <div className="modal-dialog">
//             <div className="modal-content">
//               <div className="modal-header">
//                 <h5 className="modal-title">Confirm Deletion</h5>
//                 <button
//                   type="button"
//                   className="btn-close"
//                   onClick={() => setShowDeleteConfirmation(false)}
//                 ></button>
//               </div>
//               <div className="modal-body">
//                 <p>Are you sure you want to delete this form?</p>
//               </div>
//               <div className="modal-footer">
//                 <button
//                   className="btn btn-secondary"
//                   onClick={() => setShowDeleteConfirmation(false)}
//                 >
//                   Cancel
//                 </button>
//                 <button className="btn btn-danger" onClick={handleDeleteConfirm}>
//                   Yes, Delete
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Update Modal */}
//       {showModal && (
//         <div className="modal show d-block" tabIndex="-1">
//           <div className="modal-dialog">
//             <div className="modal-content">
//               <div className="modal-header">
//                 <h5 className="modal-title">Update Rent</h5>
//                 <button type="button" className="btn-close" onClick={closeUpdateModal}></button>
//               </div>
//               <div className="modal-body">
//                 <div className="mb-3">
//                   <label htmlFor="rentAmount" className="form-label">
//                     Rent Amount
//                   </label>
//                   <input
//                     type="number"
//                     className="form-control"
//                     id="rentAmount"
//                     value={newRent.rentAmount}
//                     onChange={(e) =>
//                       setNewRent((prev) => ({ ...prev, rentAmount: e.target.value }))
//                     }
//                   />
//                 </div>
//                 <div className="mb-3">
//                   <label htmlFor="rentDate" className="form-label">
//                     Rent Date
//                   </label>
//                   <input
//                     type="date"
//                     className="form-control"
//                     id="rentDate"
//                     value={newRent.date}
//                     onChange={(e) =>
//                       setNewRent((prev) => ({ ...prev, date: e.target.value }))
//                     }
//                   />
//                 </div>
//               </div>
//               <div className="modal-footer">
//                 <button className="btn btn-secondary" onClick={closeUpdateModal}>
//                   Close
//                 </button>
//                 <button className="btn btn-primary" onClick={handleUpdate}>
//                   Save Changes
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}


// {/*  */}
//     </div>
//   );
// }

// export default UpdateData;


// https://chatgpt.com/c/67a3399e-31c8-8000-931e-382bc5bb7a13  //24 aaccouont chat gpt//

// https://chatgpt.com/c/67ad88e2-ff98-8000-bbe6-6a14396d490f

// https://chatgpt.com/c/67adad0a-041c-8000-b4b4-f47476486165
// https://chatgpt.com/c/67ac3a80-414c-8000-9989-e286498176d9
// https://chatgpt.com/c/67adad0a-041c-8000-b4b4-f47476486165

// https://chatgpt.com/c/67c01388-1a38-8000-a631-aa24be9f77e0 // New 24@gm