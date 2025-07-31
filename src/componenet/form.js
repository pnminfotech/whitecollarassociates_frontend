import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../form.css';
import { useNavigate } from "react-router-dom";

const Form = () => {
  const [formData, setFormData] = useState({
    // srNo: '',
    name: '',
    joiningDate: '',
    roomNo: '',
    depositAmount: '',
    address: '',
    phoneNo: '',

    floorNo: '',
    adharFile: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // const fetchSrNo = async () => {
  //   try {
  //     const response = await axios.get('http://localhost:4000/api/forms/count');
  //     setFormData((prev) => ({ ...prev, srNo: response.data.nextSrNo }));
  //   } catch (error) {
  //     console.error("Error fetching Sr No:", error);
  //   }
  // };

  // useEffect(() => {
  //   fetchSrNo(); 
  // }, []);

  const navigate = useNavigate();
  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:4000/api/forms', formData);
      alert('Form submitted successfully');
      navigate('/add-data');
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit the form');
    }
  };
  return (
    <>
      <h2>Tenant Form</h2>
      <form onSubmit={handleSubmit} className="form-container">
       

        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            name="name"
            id="name"
            placeholder="Name"
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="joiningDate">Joining Date</label>
          <input
            type="date"
            name="joiningDate"
            id="joiningDate"
            placeholder="Joining Date"
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="roomNo">Room No.</label>
          <input
            type="text"
            name="roomNo"
            id="roomNo"
            placeholder="Room No."
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="depositAmount">Deposit Amount</label>
          <input
            type="number"
            name="depositAmount"
            id="depositAmount"
            placeholder="Deposit Amount"
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="address">Address</label>
          <input
            type="text"
            name="address"
            id="address"
            placeholder="Address"
            onChange={handleChange}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="phoneNo">phoneNo</label>
          <input
            type="text"
            name="phoneNo"
            id="phoneNo"
            placeholder="phoneNo"
            onChange={handleChange}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="relativeAddress1">Relative Address 1</label>
          <input
            type="text"
            name="relativeAddress1"
            id="relativeAddress1"
            placeholder="Relative Address 1"
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="relativeAddress2">Relative Address 2</label>
          <input
            type="text"
            name="relativeAddress2"
            id="relativeAddress2"
            placeholder="Relative Address 2"
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="floorNo">Floor No.</label>
          <input
            type="text"
            name="floorNo"
            id="floorNo"
            placeholder="Floor No."
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="bedNo">Bed No.</label>
          <input
            type="text"
            name="bedNo"
            id="bedNo"
            placeholder="Bed No."
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="companyAddress">Company Address/ College Address</label>
          <input
            type="text"
            name="companyAddress"
            id="companyAddress"
            placeholder="Company Address"
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="dateOfJoiningCollege">Date of Joining College / Office</label>
          <input
            type="date"
            name="dateOfJoiningCollege"
            id="dateOfJoiningCollege"
            placeholder="Date of Joining College"
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="dob">Date of Birth</label>
          <input
            type="date"
            name="dob"
            id="dob"
            placeholder="Date of Birth"
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <button type="submit" className="submit-btn">
          Submit
        </button>
        <button type="button" className="back-btn" onClick={() => handleNavigation('/mainpage')}>
          Back
        </button>
      </form>
    </>
  );
};

export default Form;
