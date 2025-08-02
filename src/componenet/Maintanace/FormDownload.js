import React from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "../Maintanace/FormDownload.css";
import Img from '../../image/mutkehostel.png';


const FormDownload = ({ formData }) => {
  const handleDownload = async () => {
    const element = document.getElementById("form-container");
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("Admission_Form.pdf");
  };

  return (
    <div>
      <div id="form-container" className="form-container">
        {/* Header */}
        <header className="form-header">
          {/* <img src={Img} alt="Logo" className="form-logo" /> */}
          <div className="form-title">
            <div className="form-no">
              <span  >Form No:</span>
              <div className="form-box"></div>
            </div>
            <p style={{ marginLeft: '-118px', marginTop: '4px', fontSize: '12px' }}>New Admission Form</p>

          </div>
          <div className="form-photo-box"></div>
        </header>

        {/* Body */}
        <div className="form-body">
          <p>
            <strong>Name Of Occupant:</strong> {formData?.name || "__________________________________"}
          </p>
          <p>
            <strong>Address:</strong> {formData?.address || "__________________________________"}
          </p>

          <p>
            <strong>Hostel Joining Date:</strong> {formData?.joiningDate ? new Date(formData.joiningDate).toLocaleDateString() : "__________________________________"}   &nbsp;  &nbsp;  &nbsp;
            {/* <strong>Deposit Amount:</strong> {formData?.depositAmount  || "__________________________________"}          */}
          </p>
          <p>
            <strong>Flat No:</strong> {formData?.roomNo || "_________"} &nbsp; &nbsp;  &nbsp;
            <strong>Floor No:</strong> {formData?.floorNo || "_________"} &nbsp; &nbsp;  &nbsp;

          </p>
          <hr />
          <p>
            <strong>Name & Address of Company/College/Institute/Other:</strong><br></br> {formData?.companyAddress || "_______________________________________"}
          </p>
          <p>
            <strong>Date Of Joining:</strong> {formData?.joiningDate ? new Date(formData.joiningDate).toLocaleDateString() : "__________________________________"} &nbsp; &nbsp;  &nbsp;  &nbsp;  &nbsp;
            <strong>Date Of Birth:</strong> {formData?.dob ? new Date(formData.dob).toLocaleDateString() : "__________________________________"} &nbsp;
          </p>
          <p>
            <strong>Has Occupant Givin Rules & Regulation Copy To Read & Understand:</strong> {formData?.rulesProvided || "Yes/No"}
          </p>
        </div>

        {/* Footer */}
        <footer className="form-footer">
          <div className="signature" style={{ fontSize: '10px' }}>
            <p>Sign of Warden:</p>
            <span>_____</span>
          </div>
          <div className="signature" style={{ fontSize: '10px' }}>
            <p>Sign of Occupant:</p>
            <span>_____</span>
          </div>
          <div className="signature" style={{ fontSize: '10px' }}>
            <p>Sign of Guardian:</p>
            <span>_____</span>
          </div>

        </footer>


      </div>

      {/* Download Button */}
      <button onClick={handleDownload} className="download-button">
        Download as PDF
      </button>

      {/* <button onClick={handleDownload} className="download-button">
        UPDATE FORM
      </button> */}
    </div>
  );
};

export default FormDownload;
