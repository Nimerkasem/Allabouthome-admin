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
  const [showProductForm, setShowProductForm] = useState(false);
  const [showProductEditModal, setShowProductEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

const [searchTerm, setSearchTerm] = useState("");
const [filteredProducts, setFilteredProducts] = useState(products);

  const db = firebase.firestore();
  const navigate = useNavigate();
  const toggleProductForm = () => {
    setShowProductForm(!showProductForm);
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
      const productUID = productRef.id; 
      await productRef.update({ uid: productUID }); 
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

  const handleProductImageUpload = async (e) => {
    const file = e.target.files[0];
    setProductUploadedImage(file);
  };

  useEffect(() => {
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);
  

 

  const [adminName, setAdminName] = useState("");
  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        const adminCollectionRef = firebase.firestore().collection("Admins");
        const adminDocRef = adminCollectionRef.doc(user.uid);

        const adminUnsubscribe = adminDocRef.onSnapshot((docSnapshot) => {
          const data = docSnapshot.data();
          console.log("data", data);
          if (data ) {
            setProducts(data.products || []);
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
        setAdminName("");
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  
  

  const openProductEditModal = (product) => {
    setShowProductEditModal(true);
    setSelectedProduct(product);
  };
  
  const closeEditModals = () => {
    setShowProductEditModal(false);
  };

  const handleProductFormSubmit = async (e) => {
    e.preventDefault();

    const newProduct = {
      name: productName,
      description: productDescription,
      price: parseInt(productPrice),
      quantity: parseInt(productQuantity),
      imageURL: "",
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
  
  const handleProductEdit = async (updatedProductData) => {
    try {
      const currentUser = firebase.auth().currentUser;
      const adminCollectionRef = firebase.firestore().collection("Admins");
      const adminDocRef = adminCollectionRef.doc(currentUser.uid);
  
      const adminSnapshot = await adminDocRef.get();
      const adminData = adminSnapshot.data();
      const productsArray = [...adminData.products] || [];
  
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

        setSelectedProduct(null);
        setShowProductEditModal(false);
  
        console.log("Product updated successfully!");
      } else {
        console.error("Product not found in the admin's products array.");
      }
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };
  
  

  
  
  
return (
  <>
    <ListGroup style={{minWidth:"1218px" }}>
    
      <ListGroup.Item>
        <div className="button-containerp">
          <br />
          <Button variant="primary"type="submit"onClick={() => {navigate("/home");}}>Home</Button>
          <br />
          <Button variant="primary"type="submit"onClick={() => {navigate("/Lamps");}}>Manage Lamps</Button> 
          <br />  
          <Button variant="primary"type="submit"onClick={() => {navigate("/");}}>SignOut</Button> 
         </div>
        </ListGroup.Item>
        
        <ListGroup.Item>
        <h1 style={{color:"#2d0e4f", fontFamily:"'Courier New', Courier, monospace"}}>..Manage Products..</h1>

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
        </ListGroup.Item>
 
        <ListGroup.Item>
          <Form className="search">
          <Form.Group className="mb-3" controlId="formBasicSearch">
            <Form.Label >Search Products</Form.Label>
            <Form.Control
              type="text"
              placeholder="Search by product name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Form.Group>
          </Form>
        </ListGroup.Item>

        <ListGroup.Item>
          <div>
            <h1 className="h">My Products</h1>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <div className="product" key={product.name}>
                  <h1>{product.name}</h1>
                  <p>Description: {product.description}</p>
                  <p>Price: {product.price}</p>
                  <p>Quantity: {product.quantity}</p>
                  <img
                    style={{ width: "150px", height: "150px" , marginLeft:"5px" }}
                    src={product.imageURL}
                    alt={product.name}
                  />
                  <Button
                    variant="primary"
                    onClick={() => openProductEditModal(product)}
                  >
                    Edit
                  </Button>
                </div>
              ))
            ) : (
              <p>No products available.</p>
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
            <Form.Control
              type="text"
              required
              value={selectedProduct.name}
              onChange={(e) =>
                setSelectedProduct({
                   ...selectedProduct,
                   name: e.target.value })
              }
            />
            <Form.Label>Product Description</Form.Label>
            <Form.Control
              type="text"
              required
              value={selectedProduct.description}
              onChange={(e) =>
                setSelectedProduct({
                  ...selectedProduct,
                  description: e.target.value
                 })
              }
            />
            <Form.Label>Product Price</Form.Label>
            <Form.Control
              type="number"
              required
              value={selectedProduct.price}
              onChange={(e) =>
                setSelectedProduct({
                   ...selectedProduct,
                    price: e.target.value 
                })
              }
            />
            <Form.Label>Product Quantity</Form.Label>
            <Form.Control
              type="number"
              required
              value={selectedProduct.quantity}
              onChange={(e) =>
                setSelectedProduct({
                   ...selectedProduct,
                    quantity: e.target.value 
                })
              }
            />
          </Form.Group>
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
  </>
);
};
export default Products;