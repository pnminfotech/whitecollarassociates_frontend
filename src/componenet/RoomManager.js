import React, { useEffect, useState } from 'react';
import axios from 'axios';

const apiUrl = 'http://localhost:4000/api/rooms';

export default function RoomManager() {
  const [rooms, setRooms] = useState([]);
  const [roomForm, setRoomForm] = useState({ roomNo: '', floorNo: '' });
  const [showAddBedModal, setShowAddBedModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [bedForm, setBedForm] = useState({ bedNo: '', category: '', price: '' });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTarget, setEditTarget] = useState({ roomNo: '', bedNo: '', price: '' });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    const res = await axios.get(apiUrl);
    setRooms(res.data);
  };

  const addRoom = async () => {
    if (!roomForm.roomNo || !roomForm.floorNo) {
      alert("Room No and Floor No required.");
      return;
    }
    try {
      await axios.post(apiUrl, roomForm);
      setRoomForm({ roomNo: '', floorNo: '' });
      fetchRooms();
    } catch (error) {
      console.error("Error adding room:", error);
      alert("Failed to add room.");
    }
  };

  const openAddBedModal = (room) => {
    setSelectedRoom(room);
    setBedForm({ bedNo: '', category: '', price: '' });
    setShowAddBedModal(true);
  };

  const addBedToRoom = async () => {
    if (!selectedRoom || !bedForm.bedNo || !bedForm.category || !bedForm.price) {
      alert("All bed details are required.");
      return;
    }
    try {
      await axios.post(`${apiUrl}/${selectedRoom.roomNo}/bed`, {
        bedNo: bedForm.bedNo,
        category: bedForm.category,
        price: Number(bedForm.price)
      });
      fetchRooms();
      setShowAddBedModal(false);
    } catch (err) {
      console.error("Failed to add bed:", err);
      alert("Failed to add bed. See console for details.");
    }
  };

  const openEditModal = (roomNo, bedNo, currentPrice) => {
    setEditTarget({ roomNo, bedNo, price: currentPrice });
    setShowEditModal(true);
  };

  const updateBedPrice = async () => {
    try {
      await axios.put(`${apiUrl}/${editTarget.roomNo}/bed/${editTarget.bedNo}`, { price: editTarget.price });
      setShowEditModal(false);
      fetchRooms();
    } catch (error) {
      console.error("Error updating price:", error);
      alert("Failed to update price.");
    }
  };

  const modalBackdropStyle = {
    backgroundColor: 'rgba(0,0,0,0.5)',
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1050
  };

  return (
    <div className="container mt-4">
      {/* <h4 className="mb-4">Room & Bed Management</h4> */}
      <div className="d-flex flex-column flex-md-row justify-content-center align-items-center gap-2 mb-4 position-relative text-center text-md-start">
        {/* Title */}
        <h4 className="m-0 text-center flex-grow-1">Room &amp; Bed Management</h4>

        {/* Back Button */}
        <button
          className="btn btn-sm btn-primary px-3 py-2 mt-2 mt-md-0"
          style={{ fontWeight: 500 }}
          onClick={() => window.history.back()}
        >
          Back →
        </button>
      </div>








      <div className="card mb-4">
        <div className="card-header">Add Room</div>
        <div className="card-body d-flex gap-3">
          <input
            className="form-control"
            placeholder="Room No"
            value={roomForm.roomNo}
            onChange={(e) => setRoomForm({ ...roomForm, roomNo: e.target.value })}
          />
          <input
            className="form-control"
            placeholder="Floor No"
            value={roomForm.floorNo}
            onChange={(e) => setRoomForm({ ...roomForm, floorNo: e.target.value })}
          />
          <button className="btn btn-success" onClick={addRoom}>Add Room</button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">Rooms & Beds</div>
        <div className="card-body table-responsive">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Room No</th>
                <th>Floor No</th>

              </tr>
            </thead>
            <tbody>
              {rooms.map(room => (
                <tr key={room.roomNo}>
                  <td>{room.roomNo}</td>
                  <td>{room.floorNo}</td>
                  <td>
                    {room.beds.map(bed => (
                      <div key={bed.bedNo} className="d-flex justify-content-between align-items-center">
                        <span>{bed.bedNo} - {bed.category}</span><br />
                        <span
                          style={{ cursor: 'pointer', color: 'blue' }}
                          onClick={() => openEditModal(room.roomNo, bed.bedNo, bed.price)}
                        >
                          ₹{bed.price}
                        </span>
                      </div>
                    ))}
                  </td>
                  <td>
                    <button className="btn btn-sm btn-primary" onClick={() => openAddBedModal(room)}>Add Price</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>











      {/* Add Bed Modal */}
      {showAddBedModal && (
        <div className="modal d-block" tabIndex="-1" style={modalBackdropStyle}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Bed to Room {selectedRoom.roomNo}</h5>
                <button className="btn-close" onClick={() => setShowAddBedModal(false)}></button>
              </div>
              <div className="modal-body d-flex flex-column gap-3">





                <select
                  className="form-control"
                  value={bedForm.category}
                  onChange={(e) => setBedForm({ ...bedForm, category: e.target.value })}
                >
                  <option>Select Category</option>
                  <option value="1BHK">1BHK</option>
                  <option value="2BHK">2BHK</option>
                </select>




                <input
                  className="form-control"
                  placeholder="Price"
                  type="number"
                  value={bedForm.price}
                  onChange={(e) => setBedForm({ ...bedForm, price: e.target.value })}
                />
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowAddBedModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={addBedToRoom}>Add Bed</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Price Modal */}
      {showEditModal && (
        <div className="modal d-block" tabIndex="-1" style={modalBackdropStyle}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Update Price</h5>
                <button className="btn-close" onClick={() => setShowEditModal(false)}></button>
              </div>
              <div className="modal-body">
                <input
                  type="number"
                  className="form-control"
                  value={editTarget.price}
                  onChange={(e) => setEditTarget({ ...editTarget, price: e.target.value })}
                />
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button className="btn btn-success" onClick={updateBedPrice}>Update</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
