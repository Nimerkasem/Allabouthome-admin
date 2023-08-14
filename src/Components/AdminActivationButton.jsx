import React from "react";
import firebase from "../servises/firbase";
import "../Css/AdminManagement.css";


function AdminActivationButton({ adminId, isActive }) {
  const toggleActivation = async () => {
    const db = firebase.firestore();
    const adminRef = db.collection("Admins").doc(adminId);

    try {
      await adminRef.update({ isActive: !isActive });
      console.log("Admin status updated successfully!");
    } catch (error) {
      console.error("Error updating admin status:", error);
    }
  };

  return (
    <>
      
    <div>
    <button
      className={`activation-button ${isActive ? "activeB" : "inactiveB"}`}
      onClick={toggleActivation}
    >
      {isActive ? "Deactivate Admin" : "Activate Admin"}
    </button>
    </div>
    
    </>
  );
}

export default AdminActivationButton;
