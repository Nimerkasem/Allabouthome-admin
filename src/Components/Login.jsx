import { useState } from "react";
import { useNavigate } from "react-router-dom";
import firebase from "../services/firebase";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import '../Css/Login.css'; 
import { Image } from 'react-bootstrap';
import logo from '../assets/logo.png';
import Cookies from 'js-cookie';


export default function Login({ setUser, setIslogedIn }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const checkDetails = async (e) => {
    e.preventDefault();
    if (email.includes("@allabouthome")) {
      try {
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
  
        const userDoc = await firebase.firestore().collection("appadmin").doc(user.uid).get();
        const userData = userDoc.data();
  
        setUser(userData);
        console.log("Success");
        setIslogedIn(true);
        navigate("/sales-dashboard");
      } catch (error) {
        console.log("Something error", error);
      }

    }
else{
    try {
      const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
      const user = userCredential.user;

      const userDoc = await firebase.firestore().collection("Admins").doc(user.uid).get();
      const userData = userDoc.data();
      if (!userData.isActive) {
        alert('Cannot log in: User is deactivated for more information please feel free contact us:admin@allabouthome.com '); 
    
        return;
      }

      setUser(userData);
      console.log("Success");
      setIslogedIn(true);
      navigate("/home");
    } catch (error) {
      console.log("Something error", error);
    }
  }
  }

  console.log(email, password)

  return (
    <div className="login-container" >
      <div className="form-container">
      <Image src={logo} style={{width: '200px',marginTop:'80px'}} alt="logo" />

        <Form onSubmit={checkDetails}>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Control style={{ border:" 2px solid #593087"}}  placeholder="Enter your email" type="text" onChange={(e) => setEmail(e.target.value)} />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Control style={{ border:" 2px solid #593087"}}  placeholder="Enter your Password" type="password" onChange={(e) => setPassword(e.target.value)} />
          </Form.Group>
          <div className="button-containerl">
  <Button variant="primary" type="submit">
    Login
  </Button>
  
  <br />
  <Button
    variant="primary"
    onClick={() => {
      navigate('/Register');
    }}
  >
    I don't have an account? Register
  </Button>
</div>

        </Form>
      </div>

      <div className="sec-container">
        <p>Welcome to</p>
      <h4 class="mb-4"> ALL ABOUT HOME</h4>
              <p class="small mb-0">We are thrilled to have you join our platform as a store.
               By registering with us, you can showcase your exquisite collection of furniture 
               and lights to a wide audience of potential customers.
               Get ready to boost your sales and expand your business online. Let's create beautiful spaces together.
              </p>
              <p class="p">ALL ABOUT HOME team.</p>

      </div>
    </div>
  );
}