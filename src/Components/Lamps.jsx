
import React, { useState, useEffect } from "react";
import firebase from "../servises/firbase";
import { useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import ListGroup from "react-bootstrap/ListGroup";
import "../Css/Product.css";
import { Modal } from "react-bootstrap";


const Lamps = () => {
  const [lampName, setLampName] = useState("");
  const [lampDescription, setLampDescription] = useState("");
  const [lampPrice, setLampPrice] = useState("");
  const [lampQuantity, setLampQuantity] = useState("");
  const [lampCategories, setLampCategories] = useState([]);
  const [lampWattage, setLampWattage] = useState("");
  const [lampShade, setLampShade] = useState("");
  const [lampUploadedImage, setLampUploadedImage] = useState("");
  const [lamps, setLamps] = useState([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showLampForm, setShowLampForm] = useState(false);
  const [showProductEditModal, setShowProductEditModal] = useState(false);
  const [showLampEditModal, setShowLampEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedLamp, setSelectedLamp] = useState(null);
  const db = firebase.firestore();
  const navigate = useNavigate();
  const toggleProductForm = () => {
    setShowProductForm(!showProductForm);
  };
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredLamps, setFilteredLamps] = useState(lamps);

  const toggleLampForm = () => {
    setShowLampForm(!showLampForm);
  };
   
  const addToCategory = async (itemId, categories) => {
    try {
      if (!categories || categories.length === 0) {
        console.error("Categories array is empty or undefined.");
        return;
      }

      const batch = firebase.firestore().batch();
      const categoriesRef = db.collection("allCategory");

      const existingCategories = await categoriesRef
        .where(firebase.firestore.FieldPath.documentId(), "in", categories)
        .get();
      const existingCategoryIds = existingCategories.docs.map((doc) => doc.id);

      const newCategories = categories.filter(
        (category) => !existingCategoryIds.includes(category)
      );
      newCategories.forEach((category) => {
        const newCategoryRef = categoriesRef.doc(category);
        batch.set(newCategoryRef, { items: [itemId] });
      });

      existingCategories.forEach((doc) => {
        const categoryRef = categoriesRef.doc(doc.id);
        batch.update(categoryRef, {
          items: firebase.firestore.FieldValue.arrayUnion(itemId),
        });
      });

      await batch.commit();
      console.log("Item added to categories successfully!");
    } catch (error) {
      console.error("Error adding item to category:", error);
    }
  };

  const addLampToCollection = async (lamp) => {
    try {
      const currentUser = firebase.auth().currentUser;
      const adminUID = currentUser.uid;
      const currentTime = firebase.firestore.FieldValue.serverTimestamp();
      const adminSnapshot = await db.collection("Admins").doc(adminUID).get();
      const adminData = adminSnapshot.data();
      const adminName = adminData.name;
      const lampRef = await db.collection("alllamps").add({
        ...lamp,
        adminUID: adminUID,
        adminName: adminName,
        addedTime: currentTime,
        updatedTime: currentTime,
      });
      await lampRef.update({ uid: lampRef.id });
      console.log("Lamp added to lamps collection successfully!");

      return lampRef;
    } catch (error) {
      console.error("Error adding lamp to lamps collection:", error);
    }
  };


  const handleLampImageUpload = async (e) => {
    const file = e.target.files[0];
    setLampUploadedImage(file);
  };
  useEffect(() => {
    const filtered = lamps.filter(lamp =>
      lamp.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredLamps(filtered);
  }, [searchTerm, lamps]);
  

  const [adminName, setAdminName] = useState("");
  const [lampUIDs, setLampUIDs] = useState([]);
  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        const adminCollectionRef = firebase.firestore().collection("Admins");
        const adminDocRef = adminCollectionRef.doc(user.uid);

        const adminUnsubscribe = adminDocRef.onSnapshot((docSnapshot) => {
          const data = docSnapshot.data();
          console.log("data", data);
          if (data && data.lamps) {
            const updatedLamps = data.lamps.map((lamp) => {
              if (lamp.imageURL) {
                return { ...lamp, imageURL: lamp.imageURL };
              }
              return lamp;
            });
            const lampUIDs = data.lamps.map((lamp) => lamp.uid);

            setLamps(updatedLamps || []);
            setLampUIDs(lampUIDs);
          }
          if (data && data.adminName) {
            setAdminName(data.adminName);
          }
        });

        return () => {
          adminUnsubscribe();
        };
      } else {
        setLamps([]);
        setLampUIDs([]);
        setAdminName("");
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const openLampEditModal = (lamp) => {
    setShowLampEditModal(true);
    setSelectedLamp(lamp);
  };
  

  const closeEditModals = () => {
    setShowLampEditModal(false);
  };

  const handleLampFormSubmit = async (e) => {
    e.preventDefault();

    const newLamp = {
      name: lampName,
      description: lampDescription,
      price: parseInt(lampPrice),
      quantity: parseInt(lampQuantity),
      imageURL: "",
      categories: lampCategories,
      wattage: parseInt(lampWattage),
      shade: parseInt(lampShade),
      uid: "",
    };

    try {
      const currentUser = firebase.auth().currentUser;
      const adminCollectionRef = firebase.firestore().collection("Admins");
      const adminDocRef = adminCollectionRef.doc(currentUser.uid);
      const storage = firebase.storage();
      const adminUid = currentUser.uid;

      if (lampUploadedImage) {
        const imageRef = storage
          .ref()
          .child(`admin/${adminUid}/lamps/${lampUploadedImage.name}`);
        await imageRef.put(lampUploadedImage);
        const downloadURL = await imageRef.getDownloadURL();
        newLamp.imageURL = downloadURL;
      }

     
      const adminSnapshot = await adminDocRef.get();
      const adminData = adminSnapshot.data();
      const lampsArray = adminData.lamps || []; 
      const lampRef = await addLampToCollection(newLamp);
      const lampUID = lampRef.id; 
      newLamp.uid = lampUID;
      lampsArray.push(newLamp);
      
      await adminDocRef.update({
        lamps: lampsArray,
      });
      
      await addToCategory(lampUID, lampCategories);
      
      setLampName("");
      setLampDescription("");
      setLampPrice("");
      setLampQuantity("");
      setLampCategories([]);
      setLampWattage("");
      setLampShade("");
      setLampUploadedImage("");

      console.log("Lamp added successfully!");
    } catch (error) {
      console.error("Error adding lamp:", error);
    }
  };
  const handleLampEdit = async (updatedLampData) => {
    try {
      const currentUser = firebase.auth().currentUser;
      const adminCollectionRef = firebase.firestore().collection("Admins");
      const adminDocRef = adminCollectionRef.doc(currentUser.uid);
  
      const adminSnapshot = await adminDocRef.get();
      const adminData = adminSnapshot.data();
      const lampsArray = adminData.lamps || [];
  
      const lampIndex = lampsArray.findIndex(
        (lamp) => lamp.itemId === selectedLamp.itemId
      );
  
      if (lampIndex !== -1) {
        const updatedLamp = {
          ...lampsArray[lampIndex],
          name: updatedLampData.name,
          description: updatedLampData.description,
          price: updatedLampData.price,
          quantity: updatedLampData.quantity,
          wattage: updatedLampData.wattage,
          shade: updatedLampData.shade,
        };
  
        lampsArray[lampIndex] = updatedLamp;
  
        await adminDocRef.update({
          lamps: lampsArray,
        });
  
        await db.collection("alllamps").doc(selectedLamp.itemId).update(updatedLamp);
  
        setSelectedLamp(null);
        setShowLampEditModal(false);
  
        console.log("Lamp updated successfully!");
      } else {
        console.error("Lamp not found in the admin's lamps array.");
      }
    } catch (error) {
      console.error("Error updating lamp:", error);
    }
  };
   
  
  const handleEdit = (itemId, isLamp) => {
   if (isLamp) {
      const lamp = lamps.find((l) => l.itemId === itemId);
      if (lamp) {
        openLampEditModal(lamp);
      }
    }
  };
  
  
return (
  <>
    <ListGroup style={{ minWidth:"1218px" }}>
      <ListGroup.Item>
        <div className="button-containerp">
          <br />
          <Button variant="primary"type="submit"onClick={() => {navigate("/home");}}>Home</Button>
          <br />
          <Button variant="primary"type="submit"onClick={() => {navigate("/Products");}}>Manage Products</Button>
          <br />  
          <Button variant="primary"type="submit"onClick={() => {navigate("/");}}>SignOut</Button> 
        </div>
      </ListGroup.Item>

      <ListGroup.Item>
      <h1 style={{color:"#2d0e4f", fontFamily:"'Courier New', Courier, monospace"}}>..Manage Lamps..</h1>

        <Form className="form" onSubmit={handleLampFormSubmit}>
          <div>
            <h1>Add Lamp</h1>
          </div>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Lamp Name</Form.Label>
            <Form.Control
              type="text"
              required
              value={lampName}
              onChange={(e) => setLampName(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Description</Form.Label>
            <Form.Control
              type="text"
              required
              value={lampDescription}
              onChange={(e) => setLampDescription(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Price</Form.Label>
            <Form.Control
              type="number"
              required
              value={lampPrice}
              onChange={(e) => setLampPrice(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Quantity</Form.Label>
            <Form.Control
              type="number"
              required
              value={lampQuantity}
              onChange={(e) => setLampQuantity(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Lamp Image</Form.Label>
            <Form.Control
              type="file"
              required
              onChange={handleLampImageUpload}
            />
            {lampUploadedImage && (
              <div>
                <p>Image Uploaded:</p>
                <img
                  src={URL.createObjectURL(lampUploadedImage)}
                  alt="Uploaded"
                />
              </div>
            )}
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Categories</Form.Label>
            <Form>
              {[
                "Living Room",
                "Kitchen",
                "Bedroom",
                "Bathroom",
                "Home Office",
                "Laundry Room",
              ].map((category) => (
                <div key={category} className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label={category}
                    checked={lampCategories.includes(category)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setLampCategories([...lampCategories, category]);
                      } else {
                        setLampCategories(
                          lampCategories.filter((cat) => cat !== category)
                        );
                      }
                    }}
                  />
                </div>
              ))}
            </Form>
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Wattage</Form.Label>
            <Form.Control
              type="text"
              required
              value={lampWattage}
              onChange={(e) => setLampWattage(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Shade</Form.Label>
            <Form.Control
              as="select"
              required
              value={isNaN(lampShade) ? "" : lampShade}
              onChange={(e) => {
                const selectedValue = e.target.value;
                if (!isNaN(selectedValue)) {
                  setLampShade(selectedValue);
                } else {
                  setLampShade(""); 
                }
              }}
            >
              <option value="">Select Shade</option>
              <option value="3000">3000</option>
              <option value="4000">4000</option>
              <option value="6000">6000</option>
            </Form.Control>
          </Form.Group>

          <Button variant="primary" type="submit">
            Add Lamp
          </Button>
        </Form>
      </ListGroup.Item>

      <ListGroup.Item>
        <Form className="search">
          <Form.Group className="mb-3" controlId="formBasicSearch">
            <Form.Label>Search Lamps</Form.Label>
            <Form.Control
              type="text"
              placeholder="Search by lamp name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              />
          </Form.Group>
        </Form>
      </ListGroup.Item>

      <ListGroup.Item>
        <div>
          <h1 className="h">My Lamps</h1>
          {filteredLamps.length > 0 ? (
            filteredLamps.map((lamp) => (
            <div className="lamp" key={lamp.name}>
              <h1>{lamp.name}</h1>
              <p>Description: {lamp.description}</p>
              <p>Price: {lamp.price}</p>
              <p>Quantity: {lamp.quantity}</p>
              <p>watt: {lamp.wattage}</p>
               <p>shade: {lamp.shade}</p>
              <img
                style={{ width: "150px", height: "150px", marginLeft:"5px" }}
                src={lamp.imageURL}
                alt={lamp.name}
              />
              <Button
                variant="primary"
                onClick={() => openLampEditModal(lamp)}
              >
                Edit
              </Button>
        
            </div>
            ))
          ) : (
            <p>No lamps available.</p>
          )}
        </div>
      </ListGroup.Item>
    </ListGroup>

    {showLampEditModal && selectedLamp && (
      <Modal show={showLampEditModal} onHide={closeEditModals}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Lamp</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Lamp Name</Form.Label>
            <Form.Control
              type="text"
              required
              value={selectedLamp.name}
              onChange={(e) =>
                setSelectedLamp({ ...selectedLamp, name: e.target.value })
              } 
            />
            <Form.Label>Lamp Description</Form.Label>
            <Form.Control
              type="text"
              required
              value={selectedLamp.description}
              onChange={(e) =>
                setSelectedLamp({ ...selectedLamp, description: e.target.value })
              } 
            />
            <Form.Label>Lamp Price</Form.Label>
            <Form.Control
             type="text"
              required
              value={selectedLamp.price}
              onChange={(e) =>
                setSelectedLamp({ ...selectedLamp, price: e.target.value })
              }
            />
            <Form.Label>Lamp Quantity</Form.Label>
            <Form.Control
              type="text"
              required
              value={selectedLamp.quantity}
              onChange={(e) =>
                setSelectedLamp({ ...selectedLamp, quantity: e.target.value })
              } 
            />
            <Form.Label>Lamp Wattage</Form.Label>
            <Form.Control
              type="text"
              required
              value={selectedLamp.wattage}
              onChange={(e) =>
                setSelectedLamp({ ...selectedLamp, wattage: e.target.value })
              } 
            />
            <Form.Label>Lamp Shade</Form.Label>
            <Form.Control
              type="text"
              required
              value={selectedLamp.shade}
              onChange={(e) =>
                setSelectedLamp({ ...selectedLamp, shade: e.target.value })
              } 
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeEditModals}>
            Close
          </Button>
          <Button variant="primary" onClick={() => handleLampEdit(selectedLamp)}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    )}

  </>
);
};
export default Lamps;