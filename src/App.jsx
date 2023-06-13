import { useState , useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import firebase from './servises/firbase';
import NavBar from './Components/NavBar';
import AppRoutes from './Components/AppRoutes';

function App() {
  const [Admins, setAdmins] = useState([]);
  const [user , setUser] = useState([]);
  const [isLogedIn , setIslogedIn] = useState(false);
  useEffect(() => {
      const db = firebase.firestore();
      db.collection("Admins").get().then((querySnapshot) => {
          const data = querySnapshot.docs.map(doc => doc.data());
          setAdmins(data);
      });
  }, []);
  console.log(user)
  return (
    <>
    {<NavBar isLogedIn={isLogedIn} /> }
    <AppRoutes Admins={Admins} setUser={setUser} user={user} isLogedIn={isLogedIn} setIslogedIn={setIslogedIn} />
    </>
  )
}

export default App;
