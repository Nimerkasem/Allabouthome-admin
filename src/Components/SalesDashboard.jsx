import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import firebase from "../servises/firbase";

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff6868', '#a17cff'];

const SalesDashboard = () => {
  const [adminsData, setAdminsData] = useState([]);

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        const adminCollectionRef = firebase.firestore().collection('Admins');

        adminCollectionRef
          .get()
          .then((snapshot) => {
            const adminsData = [];
            snapshot.forEach((adminDoc) => {
              const adminSalesData = [];
              const adminBagRef = adminDoc.ref.collection('bag');

              adminBagRef
                .get()
                .then((bagSnapshot) => {
                  bagSnapshot.forEach((bagDoc) => {
                    const bagData = bagDoc.data();
                    adminSalesData.push({
                      name: bagData.name,
                      quantityBought: bagData.quantityBought,
                    });
                  });
                })
                .catch((error) => {
                  console.log('Error fetching bag data:', error);
                });

              adminsData.push({
                adminName: adminDoc.data().name,
                salesData: adminSalesData,
              });
            });
            setAdminsData(adminsData);
          })
          .catch((error) => {
            console.log('Error fetching admins data:', error);
          });
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="sales-dashboard">
      {adminsData.map((adminData, index) => (
        <div key={index} className="admin-sales">
          <h2>{adminData.adminName}'s Sales</h2>
          <BarChart width={500} height={300} data={adminData.salesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="quantityBought" fill={COLORS[index % COLORS.length]} />
          </BarChart>
        </div>
      ))}
    </div>
  );
};

export default SalesDashboard;
