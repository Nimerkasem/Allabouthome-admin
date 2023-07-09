import React, { useState, useEffect } from "react";
import firebase from "../servises/firbase";
import { useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import ListGroup from "react-bootstrap/ListGroup";
import "../Css/Product.css";
import { Modal } from "react-bootstrap";

//add timeadded to every item

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

      // Create and update category documents if they don't exist
      const newCategories = categories.filter(
        (category) => !existingCategoryIds.includes(category)
      );
      newCategories.forEach((category) => {
        const newCategoryRef = categoriesRef.doc(category);
        batch.set(newCategoryRef, { items: [itemId] });
      });

      // Update existing category documents
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
              // Check if the lamp has an image and update the imageURL property
              if (lamp.imageURL) {
                return { ...lamp, imageURL: lamp.imageURL };
              }
              return lamp;
            });
            // Retrieve the UID for lamps
            const lampUIDs = data.lamps.map((lamp) => lamp.uid);

            setProducts(data.products || []);
            setLamps(updatedLamps || []);
            // Set the UID for lamps in the state
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
        // Handle the case when the user is not logged in
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

      let imageURL = "";
      let directory = "";

      if (isLamp) {
        // Retrieve the lamps array from the admin document
        const adminSnapshot = await adminDocRef.get();
        const adminData = adminSnapshot.data();
        const lampsArray = adminData.lamps || [];

        // Find the lamp object with matching itemId
        const lamp = lampsArray.find((lamp) => lamp.itemId === itemId);

        if (lamp) {
          imageURL = lamp.imageURL;
          directory = "lamps";

          // Delete the lamp from the admin's lamps array
          await adminDocRef.update({
            lamps: firebase.firestore.FieldValue.arrayRemove(lamp),
          });
        }

        // Delete the lamp from the 'alllamps' collection
        await db.collection("alllamps").doc(itemId).delete();
      } else {
        // Retrieve the products array from the admin document
        const adminSnapshot = await adminDocRef.get();
        const adminData = adminSnapshot.data();
        const productsArray = adminData.products || [];

        // Find the product object with matching itemId
        const product = productsArray.find(
          (product) => product.itemId === itemId
        );

        if (product) {
          imageURL = product.imageURL;
          directory = "products";

          // Delete the product from the admin's products array
          await adminDocRef.update({
            products: firebase.firestore.FieldValue.arrayRemove(product),
          });
        }

        // Delete the product from the 'allproducts' collection
        await db.collection("allproducts").doc(itemId).delete();
        console.log("proudct deleted");
      }

      if (imageURL) {
        // Delete the corresponding image from storage
        const storage = firebase.storage();
        const adminUid = currentUser.uid;
        const imagePath = `admins/${adminUid}/${directory}/${itemId}`;

        await storage.ref().child(imagePath).delete();
      }

      // Delete the item from categories
      // await removeFromCategories(itemId);

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

  // Function to handle opening the lamp edit modal
  const openLampEditModal = (lamp) => {
    setSelectedLamp(lamp);
    setShowLampEditModal(true);
  };

  // Function to handle closing the edit modals
  const closeEditModals = () => {
    setShowProductEditModal(false);
    setShowLampEditModal(false);
  };

  const handleProductFormSubmit = async (e) => {
    e.preventDefault();

    // Create a new product object
    const newProduct = {
      name: productName,
      description: productDescription,
      price: parseInt(productPrice),
      quantity: parseInt(productQuantity),
      imageURL: "",
      categories: productCategories,
      uid: "", // Initialize UID as an empty string
    };

    try {
      // Get the current admin's Firestore collection reference
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
      }

      // Add the new product to the admin's collection as an array list
      const adminSnapshot = await adminDocRef.get();
      const adminData = adminSnapshot.data();
      const productsArray = adminData.products || []; // Retrieve the existing products array or initialize it as an empty array
      const productRef = await addProductToCollection(newProduct); // Add the product to the 'allproducts' collection and get its reference
      const productUID = productRef.id; // Retrieve the UID of the added product
      newProduct.uid = productUID; // Update the newProduct object with the UID
      productsArray.push(newProduct); // Add the updated newProduct object to the products array

      // Update the admin's collection with the updated products array
      await adminDocRef.update({
        products: productsArray,
      });

      await addToCategory(productUID, productCategories);

      // Reset the form fields
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

    // Create a new lamp object
    const newLamp = {
      name: lampName,
      description: lampDescription,
      price: parseInt(lampPrice),
      quantity: parseInt(lampQuantity),
      imageURL: "",
      categories: lampCategories,
      wattage: parseInt(lampWattage),
      shade: parseInt(lampShade),
    };

    try {
      // Get the current admin's Firestore collection reference
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

      // Add the new lamp to the admin's collection as an array list
      await adminDocRef.update({
        lamps: firebase.firestore.FieldValue.arrayUnion(newLamp),
      });

      const lampRef = await addLampToCollection(newLamp);
      await addToCategory(lampRef.id, lampCategories);

      // Reset the form fields
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
  
      const lampIndex = lampsArray.findIndex((lamp) => lamp.itemId === selectedLamp.itemId);
  
      if (lampIndex !== -1) {
        const updatedLamp = { ...lampsArray[lampIndex], ...updatedLampData };
        lampsArray[lampIndex] = updatedLamp;
  
        await adminDocRef.update({
          lamps: lampsArray,
        });
  
        await db.collection("alllamps").doc(selectedLamp.itemId).update(updatedLamp);
        setSelectedLamp(null); // Reset selectedLamp
      setShowLampEditModal(false); // Close the edit modal
        console.log("Lamp updated successfully!");
      } else {
        console.error("Lamp not found in the admin's lamps array.");
      }
    } catch (error) {
      console.error("Error updating lamp:", error);
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
  
      const productIndex = productsArray.findIndex((product) => product.itemId === selectedProduct.itemId);
  
      if (productIndex !== -1) {
        const updatedProduct = { ...productsArray[productIndex], ...updatedProductData };
        productsArray[productIndex] = updatedProduct;
  
        await adminDocRef.update({
          products: productsArray,
        });
        setSelectedProduct(null); // Reset selectedProduct
        setShowProductEditModal(false); // Close the edit modal
        await db.collection("allproducts").doc(selectedProduct.itemId).update(updatedProduct);
        console.log("Product updated successfully!");
      } else {
        console.error("Product not found in the admin's products array.");
      }
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };
  
  
  const handleEdit = (itemId) => {
    const product = products.find((p) => p.id === itemId);
    if (product) {
      setSelectedProduct(product);
      setShowProductEditModal(true);
    } else {
      const lamp = lamps.find((l) => l.id === itemId);
      if (lamp) {
        setSelectedLamp(lamp);
        setShowLampEditModal(true);
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
                  value={lampShade}
                  onChange={(e) => setLampShade(e.target.value)}
                >
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
            {products.map((product) => (
              <div className="product" key={product.name}>
                <h1>{product.name}</h1>
                <p>Description: {product.description}</p>
                <p>Price: {product.price}</p>
                <p>Quantity: {product.quantity}</p>
                <img
                  style={{ width: "150px", height: "150px" }}
                  src={product.imageURL}
                  alt={product.name}
                />
                <Button
                  class="button"
                  variant="primary"
                  onClick={() => handleEdit(product.id)}
                >
                  Edit
                </Button>
                <Button
                  variant="primary"
                  onClick={() => handleDelete(product.id, false)}
                >
                  Delete
                </Button>
              </div>
            ))}
          </div>
        </ListGroup.Item>
        <ListGroup.Item>
          <div>
            <h1 className="h">My Lamps</h1>

            {lamps.map((lamp) => (
              <div className="lamp" key={lamp.name}>
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
                <Button variant="primary" onClick={() => handleEdit(lamp.id)}>
                  Edit
                </Button>
                <Button
                  variant="primary"
                  onClick={() => handleDelete(lamp.name, true)}
                >
                  Delete
                </Button>
              </div>
            ))}
          </div>
        </ListGroup.Item>
      </ListGroup>
      {showProductEditModal && selectedProduct && (
        // Product Edit Modal
        <Modal show={showProductEditModal} onHide={closeEditModals}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Product</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {/* Add the form fields and logic to edit the product */}
            {/* For example: */}
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Product Name</Form.Label>
              <Form.Control
                type="text"
                required
                value={selectedProduct.name}
                onChange={(e) =>
                  setSelectedProduct({
                    ...selectedProduct,
                    name: e.target.value,
                  })
                }
              />
                <Form.Control
                type="text"
                required
                value={selectedProduct.description}
                onChange={(e) =>
                  setSelectedProduct({
                    ...selectedProduct,
                    description: e.target.value,
                  })
                }
              />
                  <Form.Control
                type="text"
                required
                value={selectedProduct.price}
                onChange={(e) =>
                  setSelectedProduct({
                    ...selectedProduct,
                    price: e.target.value,
                  })
                }
              />
                   <Form.Control
                type="text"
                required
                value={selectedProduct.quantity}
                onChange={(e) =>
                  setSelectedProduct({
                    ...selectedProduct,
                    quantity: e.target.value,
                  })
                }
              />
              
              
            </Form.Group>
            {/* Add other form fields for editing other properties */}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={closeEditModals}>
              Close
            </Button>
            <Button
              variant="primary"
              onClick={() => handleProductEdit(selectedProduct)}
            >
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
      )}
      {showLampEditModal && selectedLamp && (
        // Lamp Edit Modal
        <Modal show={showLampEditModal} onHide={closeEditModals}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Lamp</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {/* Add the form fields and logic to edit the lamp */}
            {/* For example: */}
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Lamp Name</Form.Label>
              <Form.Control
                type="text"
                required
                value={selectedLamp.name}
                onChange={(e) =>
                  setSelectedProduct({
                    ...selectedProduct,
                    name: e.target.value,
                  })
                }
              />
                <Form.Control
                type="text"
                required
                value={selectedLamp.description}
                onChange={(e) =>
                  setSelectedProduct({
                    ...selectedProduct,
                    Description: e.target.value,
                  })
                }
              />
                  <Form.Control
                type="text"
                required
                value={selectedLamp.price}
                onChange={(e) =>
                  setSelectedProduct({
                    ...selectedProduct,
                    Price: e.target.value,
                  })
                }
              />
                   <Form.Control
                type="text"
                required
                value={selectedLamp.quantity}
                onChange={(e) =>
                  setSelectedProduct({
                    ...selectedProduct,
                    Quantity: e.target.value,
                  })
                }
              />
                    <Form.Control
                type="text"
                required
                value={selectedLamp.wattage}
                onChange={(e) =>
                  setSelectedProduct({
                    ...selectedProduct,
                    watt: e.target.value,
                  })
                }
              />
                           <Form.Control
                type="text"
                required
                value={selectedLamp.shade}
                onChange={(e) =>
                  setSelectedProduct({
                    ...selectedProduct,
                    shade: e.target.value,
                  })
                }
              />
            </Form.Group>
            {/* Add other form fields for editing other properties */}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={closeEditModals}>
              Close
            </Button>
            <Button
              variant="primary"
              onClick={() => handleLampEdit(selectedLamp)}
            >
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
};
export default Products;
