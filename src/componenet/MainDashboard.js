import { FiBarChart2 } from 'react-icons/fi';
import { MdOutlineBedroomParent, MdLightbulbOutline, MdOutlineReceiptLong } from 'react-icons/md';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';







const COLORS = ['#1e3a8a', '#FBBF24', '#3B82F6', '#10B981', '#EF4444', '#6366F1'];

const MainDashboard = () => {
  const navigate = useNavigate();

  const [summary, setSummary] = useState({
    rent: {},
    beds: {},
    light: {},
    maintenance: {},
  });

  const [currentTime, setCurrentTime] = useState(new Date());

  const menuItems = [
    { label: 'Dashboard', icon: <FiBarChart2 />, path: '/maindashboard' },
    { label: 'Rent & Deposit', icon: <MdOutlineBedroomParent />, path: '/NewComponant' },
    { label: 'Light Bill', icon: <MdLightbulbOutline />, path: '/lightbillotherexpenses' },
    { label: 'Maintenance', icon: <MdOutlineReceiptLong />, path: '/lightbillotherexpenses' },
  ];

  const handleNavigation = (path) => navigate(path);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/");
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);









  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);






  useEffect(() => {
    Promise.all([
      fetch('https://whitecollarassociates.onrender.com/api/').then(res => res.json()), // tenants
      fetch('https://whitecollarassociates.onrender.com/api/rooms').then(res => res.json()), // ✅ rooms
      fetch('https://whitecollarassociates.onrender.com/api/light-bill/all').then(res => res.json()),
      fetch('https://whitecollarassociates.onrender.com/api/other-expense/all').then(res => res.json()),
    ]).then(([tenants, roomsData, lightBills, otherExpenses]) => {
      // ✅ ROOM SUMMARY
      const assignedRoomNos = tenants.map(t => String(t.roomNo).trim()).filter(Boolean);
      const occupiedRooms = roomsData.filter(room =>
        assignedRoomNos.includes(String(room.roomNo).trim())
      ).length;
      const totalRooms = roomsData.length;
      const vacantRooms = totalRooms - occupiedRooms;

      // ✅ RENT SUMMARY
      const now = new Date();
      const pendingRents = tenants.filter(t => {
        const lastRent = t.rents?.[t.rents.length - 1];
        if (!lastRent) return true;
        const rentDate = new Date(lastRent.date);
        return rentDate.getMonth() !== now.getMonth() || rentDate.getFullYear() !== now.getFullYear();
      }).length;
      const deposits = tenants.filter(t => Number(t.depositAmount) > 0).length;

      // ✅ LIGHT
      const totalLight = lightBills.reduce((sum, b) => sum + Number(b.amount || 0), 0);
      const paidLight = lightBills.filter(b => b.status === 'paid').reduce((sum, b) => sum + Number(b.amount), 0);
      const pendingLight = totalLight - paidLight;

      // ✅ MAINTENANCE
      const totalMaint = otherExpenses.reduce((sum, x) => sum + Number(x.mainAmount || 0), 0);
      const paidMaint = otherExpenses.filter(x => x.status === 'paid').reduce((sum, x) => sum + Number(x.mainAmount), 0);
      const pendingMaint = totalMaint - paidMaint;

      // ✅ FINAL SUMMARY
      setSummary({
        beds: { total: totalRooms, occupied: occupiedRooms, vacant: vacantRooms },
        rent: { pending: pendingRents, deposits },
        light: { paid: paidLight, pending: pendingLight },
        maintenance: { paid: paidMaint, pending: pendingMaint },
      });
    });
  }, []);


  const dayName = currentTime.toLocaleDateString(undefined, { weekday: 'long' });
  const dateString = currentTime.toLocaleDateString();
  const timeString = currentTime.toLocaleTimeString();
  const renderCard = (label, value, bgColor, icon) => (
    <div className="col-6 col-md-4 col-lg-3 mb-2"



      onMouseEnter={(e) => e.target.style.transform = 'translateX(10px)'}
      onMouseLeave={(e) => e.target.style.transform = 'translateX(0)'}
      style={{
        transition: 'transform 0.3s ease',
        padding: '20px',
        backgroundColor: '#f0f0f0',
        borderRadius: '10px'
      }}

    >
      <div
        className="card border-0 shadow-sm h-100"
        style={{ backgroundColor: bgColor, borderRadius: '12px', padding: '10px 8px' }}
      >
        <div className="card-body text-center p-2">
          <div className="fs-5 mb-1">{icon}</div>
          <div className="small text-uppercase text-muted" style={{ fontSize: '0.75rem' }}

          >{label}</div>
          <div className="fw-semibold" style={{ fontSize: '1rem' }}>{value}</div>
        </div>
      </div>
    </div>
  );


  const renderBarChart = () => {
    const totalLight = (summary.light.paid || 0) + (summary.light.pending || 0);
    const totalMaintenance = (summary.maintenance.paid || 0) + (summary.maintenance.pending || 0);
    const totalRent = (summary.rent.deposits || 0) + (summary.rent.pending || 0);

    const getPercent = (value, total) => total ? (value / total) * 100 : 0;

    const data = [
      {
        name: 'Light Bill',
        paid: getPercent(summary.light.pending, totalLight),
        pending: getPercent(summary.light.paid, totalLight),
      },

      {
        name: 'Maintenance',
        paid: getPercent(summary.maintenance.pending, totalMaintenance),
        pending: getPercent(summary.maintenance.paid, totalMaintenance),
      },

      {
        name: 'Rent',
        paid: getPercent(summary.rent.deposits, totalRent),
        pending: getPercent(summary.rent.pending, totalRent)
      }
    ];

    return (
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis domain={[0, 100]} tickFormatter={(value) => `${value.toFixed(0)}%`} />
          <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
          <Legend verticalAlign="top" height={36} />
          <Bar dataKey="paid" name="Paid" fill="#3db7b1" radius={[10, 10, 0, 0]} />
          <Bar dataKey="pending" name="Pending" fill="#1e3a8a" radius={[10, 10, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  };



  const renderPieCharts = () => {
    const pieData = [
      {
        title: 'Rent Status',
        data: [
          { name: 'Deposits', value: summary.rent.deposits || 0 },
          { name: 'Pending', value: summary.rent.pending || 0 },
        ],
      },
      {
        title: 'Light Bill Status',
        data: [
          { name: 'Paid', value: summary.light.paid || 0 },
          { name: 'Pending', value: summary.light.pending || 0 },
        ],
      },


    ];

    return (
      <div className="row g-3 mt-2 px-2">
        {pieData.map((chart, idx) => (
          <div className="col-12 col-md-6 col-lg-6" key={idx}>
            <div className="bg-white p-2 rounded shadow-sm h-100 text-center">
              <h6 className="text-primary mb-2">{chart.title}</h6>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={chart.data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={75}
                    label
                  >
                    {chart.data.map((entry, i) => (
                      <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>

            </div>
          </div>
        ))}
      </div>
    );
  };






  return (
    <div className="d-flex" style={{ minHeight: '100vh', fontFamily: 'Inter, sans-serif', backgroundColor: '#f8f9fa' }}>


      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: sidebarOpen ? 0 : '-250px',
          width: 250,
          height: '100vh',
          backgroundColor: '#1e3a8a',
          color: 'white',
          zIndex: 1000,
          transition: 'left 0.3s ease',
          overflowY: 'auto',
        }}
      >
        {/* Toggle Close Button */}
        <button
          onClick={toggleSidebar}
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            background: 'transparent',
            border: 'none',
            color: 'white',
            fontSize: 24,
            cursor: 'pointer',
          }}
        >
          ✕
        </button>

        <div className="p-3" style={{ marginTop: "50px" }} >
          <h2 className="fw-bold text-center">Hostel Manager</h2>
          <ul className="list-unstyled mt-4">
            {menuItems.map((item, idx) => (
              <li
                key={idx}
                onClick={() => handleNavigation(item.path)}
                className="mb-3"
                style={{ cursor: 'pointer' }}
              >
                {item.icon} <span className="ms-2">{item.label}</span>
              </li>
            ))}
            <li onClick={handleLogout} style={{ cursor: 'pointer' }}>
              <FontAwesomeIcon icon={faSignOutAlt} className="me-2" /> Logout
            </li>
          </ul>
          <div className="text-center text-white-50 small mt-4">
            <p>v1.0.0</p>
            <p>© Hostel Manager</p>
          </div>
        </div>
      </nav>

      <button
        onClick={toggleSidebar}
        style={{
          position: 'fixed',
          top: 10,
          left: 10,
          background: '#1e3a8a',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          padding: '6px 10px',
          fontSize: 18,
          zIndex: 1100,
        }}
      >
        ☰
      </button>



      {sidebarOpen && (
        <div
          onClick={toggleSidebar}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 999,
          }}
        />
      )}














      {/* Main Content */}
      <main className="container-fluid" style={{ marginLeft: 1, paddingTop: 24, marginTop: 40 }}>

        <div className="col-12 col-lg-12">
          <div className="bg-white p-3 rounded shadow-sm h-100 text-center">
            {/* <h1 className="text-primary pt-3">Welcome Admin 👋</h1> */}
            <h1
              className="text-primary pt-3"
              style={{
                transition: 'transform 0.3s ease, color 0.3s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.color = '#0a58ca';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.color = '#0d6efd';
              }}
            >
              Welcome Admin 👋
            </h1>
            <p>Today is <strong>{dayName}</strong>, {dateString}, <strong>{timeString}</strong></p>
            <p className="text-muted">
              This dashboard provides a complete overview of the hostel management system including bed occupancy, rent collection, light bill, and maintenance expenses.
            </p>
          </div>
        </div>

        {/* Summary Section */}
        <section className="row g-2 mb-3 px-2">
          {renderCard('Total Rooms', 48, '#76b1d9', <MdOutlineBedroomParent />)}
          {renderCard('Vacant Rooms', 0, '#efe89e', <MdOutlineBedroomParent />)}

          {renderCard('Pending Rents', summary.rent.pending || 0, '#ffe0e0', <FiBarChart2 />)}
          {renderCard('Deposits Received', summary.rent.deposits || 0, '#acddaf', <FiBarChart2 />)}

          {renderCard('Light Bill Paid', `₹${summary.light.paid || 0}`, '#7897af', <MdLightbulbOutline />)}
          {renderCard('Light Bill Pending', `₹${summary.light.pending || 0}`, '#f5d4a0', <MdLightbulbOutline />)}

          {renderCard('Maintenance Paid', `₹${summary.maintenance.paid || 0}`, '#cebaed', <MdOutlineReceiptLong />)}
          {renderCard('Maintenance Pending', `₹${summary.maintenance.pending || 0}`, '#afe6f3', <MdOutlineReceiptLong />)}
        </section>


        {/* Welcome & Chart Section */}
        <section className="row g-3 mt-2 px-2">

          <div className="col-12 col-lg-6">
            <div className="bg-white p-3 rounded shadow-sm h-100">
              <h5 className="text-primary mb-3 text-center">Tenant Status (%)</h5>
              {renderBarChart()}
            </div>
          </div>
          <div className="col-12 col-lg-6">
            {renderPieCharts()}
          </div>


        </section>

        {/* Pie Charts */}
        {/* {renderPieCharts()} */}
      </main>
    </div>
  );
};

export default MainDashboard;
