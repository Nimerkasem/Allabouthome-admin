import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../Css/Home.css'; 
import Button from 'react-bootstrap/Button';
import { Image } from 'react-bootstrap';
import userimg from '../assets/userimg.png';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import firebase from "../services/firebase";

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff6868', '#a17cff'];

export default function Home({ user }) {
  const [salesData, setSalesData] = useState([]);
  const [bagData, setBagData] = useState([]);

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        const adminCollectionRef = firebase.firestore().collection("Admins");
        const adminDocRef = adminCollectionRef.doc(user.uid);

        adminDocRef.collection("sales")
          .get()
          .then((snapshot) => {
            const data = snapshot.docs.map((doc) => doc.data());
            setSalesData(data);
          })
          .catch((error) => {
            console.log("Error fetching sales data:", error);
          });

        adminDocRef.collection("bag")
          .get()
          .then((snapshot) => {
            const data = snapshot.docs.map((doc) => doc.data());
            setBagData(data);
          })
          .catch((error) => {
            console.log("Error fetching bag data:", error);
          });
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <>
      <div className='home'>
        <div className='sidebar'>
          <h1>{user.name}</h1>
          <Image src={userimg} className='user' alt="user" />
          <div className="button-containerh">
            <Button style={{ background: "white" }} variant="primary" size="lg" active>
              <Link to="/Products">Manage Products</Link>
            </Button>
            <Button style={{ background: "white" }} variant="primary" size="lg" active>
              <Link to="/Lamps">Manage Lamps</Link>
            </Button>
            <Button style={{ background: "white" }} variant="primary" size="lg" active>
              <Link to="/Orders">Manage Orders</Link>
            </Button>
            <Button style={{ background: "white" }} variant="primary" size="lg" active>
              <Link to="/">SignOut</Link>
            </Button>
          </div>
        </div>
        <div className='bgdiv'>
          <h1>Welcome back {user.name}</h1>
          <div className='barchart'>
          <BarChart  width={500} height={300} data={salesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="quantityBought" fill="#8884d8" />
          </BarChart>
          </div>
            
          <h2>Total Future Incomes</h2>
<div className="chart-container">
  <div className="chart">
    <PieChart width={400} height={300}>
      <Pie
        data={bagData}
        dataKey="amountToSend"
        nameKey="name"
        cx="50%"
        cy="50%"
        outerRadius={100}
        fill="#8884d8"
      >
        {bagData.map((entry, index) => (
          <Cell
            key={`cell-${index}`}
            fill={COLORS[index % COLORS.length]}
          />
        ))}
      </Pie>
      <Tooltip />
    </PieChart>
  </div>
</div>

        </div>
      </div>
    </>
  );
}
