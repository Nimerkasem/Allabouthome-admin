import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import firebase from "../servises/firbase";
import Button from 'react-bootstrap/Button';
import { Image } from 'react-bootstrap';
import userimg from '../assets/userimg.png';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff6868', '#a17cff'];

const SalesDashboard = () => {
  const [user, setUser] = useState({});
  const [adminsData, setAdminsData] = useState([]);

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        const adminCollectionRef = firebase.firestore().collection('appadmin');

        adminCollectionRef
          .get()
          .then((snapshot) => {
            const adminsData = [];
            snapshot.forEach((adminDoc) => {
              const adminSalesData = [];
              const adminCommissionsData = [];

              const adminBagRef = adminDoc.ref.collection('commissions');
              adminBagRef
                .get()
                .then((bagSnapshot) => {
                  bagSnapshot.forEach((bagDoc) => {
                    const bagData = bagDoc.data();
                    adminCommissionsData.push({
                      id: bagDoc.id,
                      amount: bagData.amount,
                    });
                  });
                })
                .catch((error) => {
                  console.log('Error fetching bag data:', error);
                });

              const adminSalesRef = adminDoc.ref.collection('sales');
              adminSalesRef
                .get()
                .then((salesSnapshot) => {
                  salesSnapshot.forEach((saleDoc) => {
                    const saleData = saleDoc.data();
                    adminSalesData.push({
                      name: saleData.name,
                      quantityBought: saleData.quantityBought,
                    });
                  });

                  adminsData.push({
                    adminName: adminDoc.data().name,
                    salesData: adminSalesData,
                    commissionsData: adminCommissionsData,
                  });
                  setAdminsData(adminsData);
                })
                .catch((error) => {
                  console.log('Error fetching sales data:', error);
                });
            });
          })
          .catch((error) => {
            console.log('Error fetching admins data:', error);
          });
      }
    });

    return () => unsubscribe();
  }, []);


  return (
    <>
      <div className="home">
        <div className="sidebar">
          <h1>{user.name}</h1>
          <Image src={userimg} className="user" alt="user" />
          <div className="button-containerh">
            <Button style={{ background: "white" }} variant="primary" size="lg" active>
              <Link to="/">SignOut</Link>
            </Button>
          </div>
        </div>
        <div className="sales-dashboard">
      {adminsData.map((adminData, index) => (
        <div key={index} className="admin-commissions">
          <h2>{adminData.adminName}'s Commissions</h2>
          <BarChart width={500} height={300} data={adminData.commissionsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="id" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="amount" fill={COLORS[index % COLORS.length]} />
              </BarChart>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default SalesDashboard;
