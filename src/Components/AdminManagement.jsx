import React, { useEffect, useState } from "react";
import firebase from "../services/firebase";
import AdminActivationButton from "./AdminActivationButton";
import "../Css/AdminManagement.css";
import Button from 'react-bootstrap/Button';
import ListGroup from "react-bootstrap/ListGroup";
import { useNavigate } from "react-router-dom";



function AdminManagement() {
  const [admins, setAdmins] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const db = firebase.firestore();
    const adminsCollection = db.collection("Admins");

    const unsubscribe = adminsCollection.onSnapshot((snapshot) => {
      const adminList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAdmins(adminList);
    });

    return () => unsubscribe(); 
  }, []);

  return (
    <>

    <ListGroup style={{ minWidth:"1218px" }}>
      <ListGroup.Item>
        <div className="button-containerp">
          <br />
          <Button variant="primary" type="submit" onClick={() => { navigate("/sales-dashboard"); }}>Home</Button>
          <br />
          <Button variant="primary" type="submit" onClick={() => { navigate("/"); }}>SignOut</Button>
        </div>
      </ListGroup.Item>
      </ListGroup>
    <div className="container">
    <h1>Admins Management</h1>
    <ul className="admin-list">
      {admins.map((admin) => (
        <li key={admin.id} className="admin-item">
          <span className="admin-email">{admin.email}</span>
          <span className={`admin-status ${admin.isActive ? "active" : "inactive"}`}>
            {admin.isActive ? "Active" : "Inactive"}
          </span>
          <AdminActivationButton
            adminId={admin.id}
            isActive={admin.isActive}
          />
        </li>
      ))}
    </ul>
  </div>
  </>
  );
}

export default AdminManagement;
