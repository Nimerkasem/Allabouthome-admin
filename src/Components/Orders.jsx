import React, { useState, useEffect } from "react";
import firebase from '../services/firebase';
import "../Css/Orders.css";

const Orders = () => {
  const [orderUIDs, setOrderUIDs] = useState([]);
  const [ordersData, setOrdersData] = useState([]);

  const fetchOrdersData = async (currentUserUID) => {
    try {
      const adminCollectionRef = firebase.firestore().collection("Admins");
      const adminDocRef = adminCollectionRef.doc(currentUserUID);
      const storeOrdersCollectionRef = adminDocRef.collection("store_orders");

      const orderQuerySnapshot = await storeOrdersCollectionRef.get();
      const ordersDataArray = [];

      orderQuerySnapshot.forEach((orderDoc) => {
        ordersDataArray.push({
          orderUID: orderDoc.id,
          orderItems: orderDoc.data().items, 
        });
      });

      setOrdersData(ordersDataArray);
    } catch (error) {
      console.error("Error fetching orders data:", error);
    }
  };

  useEffect(() => {
    const currentUser = firebase.auth().currentUser;
    if (currentUser) {
      const currentUserUID = currentUser.uid;
      fetchOrdersData(currentUserUID);
    }
  }, []);

  const handleDelivered = async (orderUID, itemIndex) => {
    try {
      const currentUser = firebase.auth().currentUser;
      if (currentUser) {
        const adminCollectionRef = firebase.firestore().collection("Admins");
        const adminDocRef = adminCollectionRef.doc(currentUser.uid);
        const storeOrdersCollectionRef = adminDocRef.collection("store_orders");
        const orderDocRef = storeOrdersCollectionRef.doc(orderUID);
        const orderSnapshot = await orderDocRef.get();
        
        if (orderSnapshot.exists) {
          const orderData = orderSnapshot.data();
          if (Array.isArray(orderData.items) && itemIndex >= 0 && itemIndex < orderData.items.length) {
            orderData.items[itemIndex].delivered = true;
            
            await orderDocRef.update({
              items: orderData.items,
            });
  
            const userId = orderData.items[itemIndex].userid; // Get the userid from the item
            
            const userOrdersCollectionRef = firebase
              .firestore()
              .collection("Users")
              .doc(userId) // Use the obtained userid
              .collection("orders");
  
            const userOrderDocRef = userOrdersCollectionRef.doc(orderData.userOrderUid);
  
            await userOrderDocRef.update({
              items: orderData.items, // Update the delivered status in the user's order
            });
            
            fetchOrdersData(currentUser.uid);
          }
        }
      }
    } catch (error) {
      console.error("Error marking item as delivered:", error);
    }
  };
  

  return (
    <div className="orders-container">
      <h1>My Orders</h1>
      {ordersData.map((order) => (
        <div className="order-card" key={order.orderUID}>
          <h2>Order UID: {order.orderUID}</h2>
          <table className="order-table">
            <thead>
              <tr>
                <th>Index</th>
                <th>Image</th>
                <th>Item Name</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(order.orderItems) ? (
                order.orderItems.map((item, index) => (
                  <tr key={index}>
  <td>{index}</td>
  <td>
    <img
      style={{ width: "150px", height: "150px", marginLeft: "5px" }}
      src={item.image} 
      alt={item.name} 
    />
  </td>
  <td>{item.name}</td>
  <td>{item.price}</td>
  <td>{item.quantity}</td>
  <td>{item.delivered ? "Yes" : "No"}</td>
  <td>
    {!item.delivered ? (
      <button
        className="deliver-button"
        onClick={() => handleDelivered(order.orderUID, index)}
      >
        Mark Delivered
      </button>
    ) : (
      <button className="delivered-button">Delivered</button>
    )}
  </td>
</tr>

                ))
              ) : (
                <tr>
                  <td colSpan="6">No items in this order.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default Orders;