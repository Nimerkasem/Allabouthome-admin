import React, { useState, useEffect } from "react";
import firebase from '../services/firebase';
import "../Css/Orders.css";
import Button from 'react-bootstrap/Button';
import ListGroup from "react-bootstrap/ListGroup";
import { Link } from 'react-router-dom';


const Orders = ({ user }) => {
  const [orderData, setOrderData] = useState([]);

  useEffect(() => {
    console.log("Current User:", user);

    const fetchOrderData = async () => {
      try {
        const adminCollectionRef = firebase.firestore().collection("Admins");
        const currentAdminRef = adminCollectionRef.doc(user.uid);

        console.log("Current Admin Ref:", currentAdminRef.path);

        const storeOrdersCollectionRef = currentAdminRef.collection("store_orders");
        const orderQuerySnapshot = await storeOrdersCollectionRef.get();

        console.log("Order Query Snapshot:", orderQuerySnapshot.docs.length);

        const orderDataArray = [];
        orderQuerySnapshot.forEach((orderDoc) => {
          const orderUID = orderDoc.id;
          const orderItems = orderDoc.data().items || [];
          orderDataArray.push({ orderUID, orderItems });
        });

        console.log("Order Data Array:", orderDataArray);

        setOrderData(orderDataArray);
      } catch (error) {
        console.error("Error fetching order data:", error);
      }
    };

    fetchOrderData();
  }, [user]);
  const markOrderAsDelivered = async (orderUID, index) => {
    try {
      const adminCollectionRef = firebase.firestore().collection("Admins");
      const adminQuerySnapshot = await adminCollectionRef.get();
      
      adminQuerySnapshot.forEach(async (adminDoc) => {
        const storeOrdersCollectionRef = adminDoc.ref.collection("store_orders");
        const orderDocRef = storeOrdersCollectionRef.doc(orderUID);
      
        // Update the delivered status in store_orders document
        await orderDocRef.update({
          items: firebase.firestore.FieldValue.arrayUnion({
            index,
            delivered: true
          })
        });
      
        // Update user's order status
        const userOrderUid = (await orderDocRef.get()).data().userOrderUid;
        const userId = (await orderDocRef.get()).data().userid;
      
        const userCollectionRef = firebase.firestore().collection("Users");
        const userDocRef = userCollectionRef.doc(userId);
      
        const userOrdersCollectionRef = userDocRef.collection("orders");
        const userOrderDocRef = userOrdersCollectionRef.doc(userOrderUid);
      
        await userOrderDocRef.update({
          delivered: true
        });
      
        // Refresh the order data after marking as delivered
        fetchOrderData();
      });
    } catch (error) {
      console.error("Error marking order as delivered:", error);
    }
  };
  
  
  return (
    <>
     <ListGroup style={{ minWidth: "1218px" }}>
      <ListGroup.Item>
        <div className="button-containerp">
          <br />
          <Link to="/home">
            <Button variant="primary" type="submit">
              Home
            </Button>
          </Link>
          <br />
          <Link to="/Products">
            <Button variant="primary" type="submit">
              Manage Products
            </Button>
          </Link>
          <br />
          <Link to="/Lamps">
            <Button variant="primary" type="submit">
              Manage Lamps
            </Button>
          </Link>
          <br />
          <Link to="/">
            <Button variant="primary" type="submit">
              SignOut
            </Button>
          </Link>
        </div>
      </ListGroup.Item>
      <ListGroup.Item>
    <div className="orders-container">
        <h1> My Orders</h1>
        {orderData.map((order) => (
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
                            src={item.image} // Assuming the image URL is stored in the 'image' field
                            alt={item.name} // Assuming 'item.name' is the name of the item
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
                                onClick={() => markOrderAsDelivered(order.orderUID, index)}
                              >
                                Mark Delivered
                              </button>
                            ) : (
                              <button
                                className="delivered-button"
                              >
                                Delivered
                              </button>
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
      </ListGroup.Item>
    </ListGroup>
    </>
  );
};

export default Orders;