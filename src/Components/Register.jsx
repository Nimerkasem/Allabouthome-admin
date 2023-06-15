import { useState } from "react";
import { useNavigate } from "react-router-dom";
import firebase from '../servises/firbase';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import './Register.css'; 
import { CardGroup, Container, Row } from "react-bootstrap";



export default function Register({ setUser }) {
    const navigate = useNavigate();
    const [phoneNumber, setPhoneNumber] = useState("");
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const registerUser = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            console.log("Passwords do not match");
            return;
        }

        try {
            // create user with Firebase Authentication
            const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // create a reference to the user's document in Firestore
            const userDocRef = firebase.firestore().collection('Admins').doc(user.uid);

            // set the user's data in Firestore
            const newUser = {
                phoneNumber,
                email,
                name,
                address,
                password
            };
            await userDocRef.set(newUser);

            setUser(newUser);
            navigate("/");
        } catch (error) {
            console.error(error);
        }
    };

    return (
      
      <div className="login-container" >
      <div className="para">
        <h1 className="my-5 display-3 fw-bold  ">
            The best offer <br />
            <span className="text-primary">for your business</span><br />
            Register Now!
        </h1>

        
      </div>

      <div className="register-form">
      <h1 style={{color:"white"}}>ALL ABOUT HOME</h1>
      <Form onSubmit={registerUser} >
        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Control style={{ border:" 2px solid #593087"}} placeholder="Email address" type="text" onChange={(e) => setEmail(e.target.value)} />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Control style={{ border:" 2px solid #593087"}} placeholder="Full Name" type="text" onChange={(e) => setName(e.target.value)} />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Control style={{ border:" 2px solid #593087"}} placeholder="Phone Number" type="text" onChange={(e) => setPhoneNumber(e.target.value)} />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Control style={{ border:" 2px solid #593087"}} placeholder="Address" type="text" onChange={(e) => setAddress(e.target.value)} />
        </Form.Group>
  
        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Control style={{ border:" 2px solid #593087"}} placeholder="Password" type="password" onChange={(e) => setPassword(e.target.value)} />
        </Form.Group>    

        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Control style={{ border:" 2px solid #593087"}} placeholder="Confirm Password" type="Confirm password" onChange={(e) => setConfirmPassword(e.target.value)} />
        </Form.Group>     
        <div className="button-container">
            <Button variant="primary" type="submit">
             Register
            </Button>
            <Button variant="primary" type="submit" onClick={()=>{
              navigate('/');
            }}>
             Already have an account? Login.
            </Button>
          
          </div>
      </Form>
    </div>

    </div>
    );
}
