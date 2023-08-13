import React, { useEffect, useState } from "react";
import firebase from "../servises/firbase";
import AdminActivationButton from "./AdminActivationButton"; 

function AdminManagement() {
  const [admins, setAdmins] = useState([]);

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
    <div>
      <h1>Admins Management</h1>
      <ul>
        {admins.map((admin) => (
          <li key={admin.id}>
            {admin.email} - {admin.isActive ? "Active" : "Inactive"}
            <AdminActivationButton
              adminId={admin.id}
              isActive={admin.isActive}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AdminManagement;
