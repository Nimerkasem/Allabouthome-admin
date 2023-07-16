import React, { useState, useEffect } from "react";
import firebase from "../servises/firbase";
import { useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import ListGroup from "react-bootstrap/ListGroup";
import "../Css/Product.css";
import { Modal } from "react-bootstrap";


const Products = () => {
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productQuantity, setProductQuantity] = useState("");
  const [productCategories, setProductCategories] = useState([]);
  const [productUploadedImage, setProductUploadedImage] = useState("");
  const [products, setProducts] = useState([]);
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

  const toggleLampForm = () => {
    setShowLampForm(!showLampForm);
  };

  const addProductToCollection = async (product) => {
    try {
      const currentUser = firebase.auth().currentUser;
      const adminUID = currentUser.uid;
      const currentTime = firebase.firestore.FieldValue.serverTimestamp();

      const adminSnapshot = await db.collection("Admins").doc(adminUID).get();
      const adminData = adminSnapshot.data();
      const adminName = adminData.name;

      const productData = {
        ...product,
        adminUID: adminUID,
        adminName: adminName,
        addedTime: currentTime,
        updatedTime: currentTime,
      };

      const productRef = await db.collection("allproducts").add(productData);
      console.log(productRef);
      const productUID = productRef.id; // Retrieve the UID of the added product
      await productRef.update({ uid: productUID }); // Update the document with the UID
      console.log("Product added to products collection successfully!");

      return productRef;
    } catch (error) {
      console.error("Error adding product to products collection:", error);
    }
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

  const handleProductImageUpload = async (e) => {
    const file = e.target.files[0];
    setProductUploadedImage(file);
  };

  const handleLampImageUpload = async (e) => {
    const file = e.target.files[0];
    setLampUploadedImage(file);
  };

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

            setProducts(data.products || []);
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
        setProducts([]);
        setLamps([]);
        setLampUIDs([]);
        setAdminName("");
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleDelete = async (itemId, isLamp) => {
    console.log(itemId);
    try {
      const currentUser = firebase.auth().currentUser;
      const adminCollectionRef = firebase.firestore().collection("Admins");
      const adminDocRef = adminCollectionRef.doc(currentUser.uid);
  
      let imageName = "";
      let directory = "";
  
      if (isLamp) {
        const adminSnapshot = await adminDocRef.get();
        const adminData = adminSnapshot.data();
        const lampsArray = adminData.products || [];
  
        const lamp = lampsArray.find(
          (lamp) => lamp.itemId === itemId);
        console.log('lampsArray', lampsArray);
        console.log("lamp", lamp);

        if (lamp) {
          imageName = lamp.imageName;
          directory = "lamps";
  
          await adminDocRef.update({
            lamps: firebase.firestore.FieldValue.arrayRemove(lamp),
          });
  
          await db.collection("alllamps").doc(itemId).delete();
          console.log("lamp deleted");
        }
      } else {
        const adminSnapshot = await adminDocRef.get();
        const adminData = adminSnapshot.data();
        const productsArray = adminData.products || [];
  
        const product = productsArray.find(
          (product) => product.itemId === itemId
        );
  
        if (product) {
          imageName = product.imageName;
          directory = "products";
  
          await adminDocRef.update({
            products: firebase.firestore.FieldValue.arrayRemove(product),
          });
  
          await db.collection("allproducts").doc(product.uid).delete();
          console.log("product deleted");
        }
      }
  
      if (imageName) {
        const storage = firebase.storage();
        const adminUid = currentUser.uid;
        const imagePath = `admin/${adminUid}/${directory}/${imageName}`;
  
        await storage.ref().child(imagePath).delete();
      }
  
      console.log("Item deleted successfully!");
    } catch (error) {
      console.error("Error deleting item:", error);
      Products.reset;
    }
  };
  

  const openProductEditModal = (product) => {
    setSelectedProduct(product);
    setShowProductEditModal(true);
  };

  const openLampEditModal = (lamp) => {
    setShowLampEditModal(true);
    setSelectedLamp(lamp);
  };
  

  const closeEditModals = () => {
    setShowProductEditModal(false);
    setShowLampEditModal(false);
  };

  const handleProductFormSubmit = async (e) => {
  e.preventDefault();

  const newProduct = {
    name: productName,
    description: productDescription,
    price: parseInt(productPrice),
    quantity: parseInt(productQuantity),
    imageURL: "",
    imageName: "",
    categories: productCategories,
    uid: "",
  };

  try {
    const currentUser = firebase.auth().currentUser;
    const adminCollectionRef = firebase.firestore().collection("Admins");
    const adminDocRef = adminCollectionRef.doc(currentUser.uid);
    const storage = firebase.storage();
    const adminUid = currentUser.uid;

    if (productUploadedImage) {
      const imageRef = storage
        .ref()
        .child(`admin/${adminUid}/products/${productUploadedImage.name}`);
      await imageRef.put(productUploadedImage);
      const downloadURL = await imageRef.getDownloadURL();
      newProduct.imageURL = downloadURL;
      newProduct.imageName = productUploadedImage.name; // Save the image name
    }

    const adminSnapshot = await adminDocRef.get();
    const adminData = adminSnapshot.data();
    const productsArray = adminData.products || [];
    const productRef = await addProductToCollection(newProduct);
    const productUID = productRef.id;
    newProduct.uid = productUID;
    productsArray.push(newProduct);

    await adminDocRef.update({
      products: productsArray,
    });

    await addToCategory(productUID, productCategories);

    setProductName("");
    setProductDescription("");
    setProductPrice("");
    setProductQuantity("");
    setProductCategories([]);
    setProductUploadedImage("");

    console.log("Product added successfully!");
  } catch (error) {
    console.error("Error adding product:", error);
  }
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
      imageName: "",
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
        newLamp.imageName=lampUploadedImage.name;
      }

      /*await adminDocRef.update({
        lamps: firebase.firestore.FieldValue.arrayUnion(newLamp),
      });

      const lampRef = await addLampToCollection(newLamp);
      await addToCategory(lampRef.id, lampCategories);
*/
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
  const handleProductEdit = async (updatedProductData) => {
    try {
      const currentUser = firebase.auth().currentUser;
      const adminCollectionRef = firebase.firestore().collection("Admins");
      const adminDocRef = adminCollectionRef.doc(currentUser.uid);
  
      const adminSnapshot = await adminDocRef.get();
      const adminData = adminSnapshot.data();
      const productsArray = adminData.products || [];
  
      const productIndex = productsArray.findIndex(
        (product) => product.uid === selectedProduct.uid
      );
  
      if (productIndex !== -1) {
        const updatedProduct = {
          ...productsArray[productIndex],
          name: updatedProductData.name,
          description: updatedProductData.description,
          price: updatedProductData.price,
          quantity: updatedProductData.quantity,
        };
  
        productsArray[productIndex] = updatedProduct;
  
        await adminDocRef.update({
          products: productsArray,
        });
  
        await db.collection("allproducts").doc(selectedProduct.uid).update(updatedProduct);
  
        setSelectedProduct(updatedProduct);
        setShowProductEditModal(false);
  
        console.log("Product updated successfully!");
      } else {
        console.error("Product not found in the admin's products array.");
      }
    } catch (error) {
      console.error("Error updating product:", error);
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
        (lamp) => lamp.uid === selectedLamp.uid
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
  
        await db.collection("alllamps").doc(selectedLamp.uid).update(updatedLamp);
  
        setSelectedLamp(updatedLamp);
        setShowLampEditModal(false);
  
        console.log("Lamp updated successfully!");
      } else {
        console.error("Lamp not found in the admin's lamps array.");
      }
    } catch (error) {
      console.error("Error updating lamp:", error);
    }
  };
  
  // Open edit modal for a selected Lamp or Product item from Admin Dashboard page
  const handleEdit = (itemId, isLamp) => {
    console.log("itemId",itemId)
    if (isLamp) {
      const lamp = lamps.find((lamp) => lamp.uid === itemId);
      if (lamp) {
        openLampEditModal(lamp);
      }
    } else {
      const product = products.find((product) => product.uid === itemId);
      if (product) {
        openProductEditModal(product);
      }
    }
  };
  
  

  return (
    <>
      <ListGroup style={{ border: "red" }}>
        <ListGroup.Item>
          <div className="button-containerp">
            <Button onClick={toggleProductForm}>Add Product</Button>
            <br />
            <Button
              variant="primary"
              type="submit"
              onClick={() => {
                navigate("/home");
              }}
            >
              Home
            </Button>
            <br />
            <Button onClick={toggleLampForm}>Add Lamp</Button>
          </div>
        </ListGroup.Item>
        <ListGroup.Item>
          {showProductForm && (
            <Form className="form" onSubmit={handleProductFormSubmit}>
              <div>
                <h1>Add Product</h1>
              </div>

              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Product Name</Form.Label>
                <Form.Control
                  type="text"
                  required
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  type="text"
                  required
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Price</Form.Label>
                <Form.Control
                  type="number"
                  required
                  value={productPrice}
                  onChange={(e) => setProductPrice(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Quantity</Form.Label>
                <Form.Control
                  type="number"
                  required
                  value={productQuantity}
                  onChange={(e) => setProductQuantity(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Product Image</Form.Label>
                <Form.Control
                  type="file"
                  required
                  onChange={handleProductImageUpload}
                />
                {productUploadedImage && (
                  <div>
                    <p>Image Uploaded:</p>
                    <img
                      src={URL.createObjectURL(productUploadedImage)}
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
                        checked={productCategories.includes(category)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setProductCategories([
                              ...productCategories,
                              category,
                            ]);
                          } else {
                            setProductCategories(
                              productCategories.filter(
                                (cat) => cat !== category
                              )
                            );
                          }
                        }}
                      />
                    </div>
                  ))}
                </Form>
              </Form.Group>

              <Button variant="primary" type="submit">
                Add Product
              </Button>
            </Form>
          )}

          {showLampForm && (
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
        setLampShade(""); // Reset to empty string if NaN or non-numeric value is selected
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
          )}
        </ListGroup.Item>




        <ListGroup.Item>
  <div>
    <h1 className="h">My Products</h1>
    {products.length > 0 ? (
      products.map((product) => (
        <div className="product" key={product.uid}>
          <h1>{product.name}</h1>
          <p>Description: {product.description}</p>
          <p>Price: {product.price}</p>
          <p>Quantity: {product.quantity}</p>
          <img
            style={{ width: "150px", height: "150px" }}
            src={product.imageURL}
            alt={product.name}
          />
<Button variant="primary" onClick={() => handleEdit(product.uid, false)}>  Edit </Button>
          <Button
            variant="primary"
            onClick={() => handleDelete(product.id, false)}
          >
            Delete
          </Button>
        </div>
      ))
    ) : (
      <p>No products available.</p>
    )}
  </div>
</ListGroup.Item>
<ListGroup.Item>
  <div>
    <h1 className="h">My Lamps</h1>
    {lamps.length > 0 ? (
      lamps.map((lamp) => (
        <div className="lamp" key={lamp.uid}>
          <h1>{lamp.name}</h1>
          <p>Description: {lamp.description}</p>
          <p>Price: {lamp.price}</p>
          <p>Quantity: {lamp.quantity}</p>
          <p>watt: {lamp.wattage}</p>
          <p>shade: {lamp.shade}</p>
          <img
            style={{ width: "150px", height: "150px" }}
            src={lamp.imageURL}
            alt={lamp.name}
          />
          <Button variant="primary" onClick={() => handleEdit(lamp.uid, true)}>
            Edit</Button>
          <Button
            variant="primary"
            onClick={() => handleDelete(lamp.id, false)}
          >
            Delete
          </Button>
        </div>
      ))
    ) : (
      <p>No lamps available.</p>
    )}
  </div>
</ListGroup.Item>

      </ListGroup>




    {showProductEditModal && selectedProduct && (
      <Modal show={showProductEditModal} onHide={closeEditModals}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Product Name</Form.Label>
            <Form.Control type="text" required value={selectedProduct.name}
              onChange={(e) => setSelectedProduct({ ...selectedProduct, name: e.target.value })}/>
            <Form.Label>Product Description</Form.Label>
            <Form.Control type="text" required value={selectedProduct.description}
              onChange={(e) => setSelectedProduct({ ...selectedProduct, description: e.target.value})}/>
            <Form.Label>Product Price</Form.Label>
            <Form.Control type="text" required value={selectedProduct.price}
              onChange={(e) => setSelectedProduct({ ...selectedProduct, price: e.target.value })}/>
            <Form.Label>Product Quantity</Form.Label>
            <Form.Control type="text" required value={selectedProduct.quantity}
             onChange={(e) => setSelectedProduct({ ...selectedProduct, quantity: e.target.value })}/>
          </Form.Group>
        </Modal.Body>
        
        <Modal.Footer>
          <Button variant="secondary" onClick={closeEditModals}> Close </Button>
          <Button variant="primary" onClick={() => handleProductEdit(selectedProduct)}>Save Changes</Button>
        </Modal.Footer>
      </Modal>
    )}

    {showLampEditModal && selectedLamp && (
      <Modal show={showLampEditModal} onHide={closeEditModals}>
        <Modal.Header closeButton>
        <Modal.Title>Edit Lamp</Modal.Title>
       </Modal.Header>
      <Modal.Body>
        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>Lamp Name</Form.Label>
          <Form.Control type="text" required value={selectedLamp.name}
            onChange={(e) => setSelectedLamp({ ...selectedLamp, name: e.target.value })}/>
          <Form.Label>Lamp Description</Form.Label>
          <Form.Control type="text" required value={selectedLamp.description}
            onChange={(e) =>setSelectedLamp({ ...selectedLamp, description: e.target.value })}/>
          <Form.Label>Lamp Price</Form.Label>
          <Form.Control type="text" required value={selectedLamp.price}
            onChange={(e) => setSelectedLamp({ ...selectedLamp, price: e.target.value })}/>
          <Form.Label>Lamp Quantity</Form.Label>
          <Form.Control type="text" required value={selectedLamp.quantity}
            onChange={(e) =>setSelectedLamp({ ...selectedLamp, quantity: e.target.value })}/>
          <Form.Label>Lamp Wattage</Form.Label>
          <Form.Control type="text" required value={selectedLamp.wattage}
            onChange={(e) =>setSelectedLamp({ ...selectedLamp, wattage: e.target.value })}/>
          <Form.Label>Lamp Shade</Form.Label>
          <Form.Control type="text" required value={selectedLamp.shade}
            onChange={(e) => setSelectedLamp({ ...selectedLamp, shade: e.target.value })}/>
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
export default Products;