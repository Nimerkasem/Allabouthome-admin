import React, { useState, useEffect } from "react";
import firebase from '../services/firebase';

const Orders = () => {
  const [orderData, setOrderData] = useState([]);

  const fetchOrderData = async () => {
    try {
      const adminCollectionRef = firebase.firestore().collection("Admins");
      const adminQuerySnapshot = await adminCollectionRef.get();

      const orderDataArray = [];
      adminQuerySnapshot.forEach((adminDoc) => {
        const storeOrdersCollectionRef = adminDoc.ref.collection("store_orders");
        storeOrdersCollectionRef.get().then((orderQuerySnapshot) => {
          orderQuerySnapshot.forEach((orderDoc) => {
            const orderUID = orderDoc.id;
            const orderItems = orderDoc.data().items || [];
            orderDataArray.push({ orderUID, orderItems });
          });
          setOrderData(orderDataArray);
        });
      });
    } catch (error) {
      console.error("Error fetching order data:", error);
    }
  };

  useEffect(() => {
    fetchOrderData();
  }, []);

  const markOrderAsDelivered = async (orderUID, index) => {
    try {
      const adminCollectionRef = firebase.firestore().collection("Admins");
      const adminQuerySnapshot = await adminCollectionRef.get();

      adminQuerySnapshot.forEach(async (adminDoc) => {
        const storeOrdersCollectionRef = adminDoc.ref.collection("store_orders");
        const orderDocRef = storeOrdersCollectionRef.doc(orderUID);

        const currentItems = (await orderDocRef.get()).data().items;
        const updatedItems = [...currentItems];
        updatedItems[index] = {
          ...updatedItems[index],
          delivered: true
        };

        await orderDocRef.update({
          items: updatedItems
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
      <div>
        <h1>Orders and Items</h1>
        {orderData.map((order) => (
          <div style={{border:"2px solid red",marginBottom:"20px"}} key={order.orderUID}>
            <h2>Order UID: {order.orderUID}</h2>
            <table>
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
    </>
  );
};

export default Orders;
