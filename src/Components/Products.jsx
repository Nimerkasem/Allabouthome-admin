import React, { useState, useEffect } from 'react';
import firebase from "../servises/firbase";
import { useNavigate } from "react-router-dom";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import ListGroup from 'react-bootstrap/ListGroup';
import '../Css/Product.css';
//add timeadded to every item

const Products = () => {
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productQuantity, setProductQuantity] = useState('');
  const [productCategories, setProductCategories] = useState([]);
  const [productUploadedImage, setProductUploadedImage] = useState('');
  const [products, setProducts] = useState([]);
  const [lampName, setLampName] = useState('');
  const [lampDescription, setLampDescription] = useState('');
  const [lampPrice, setLampPrice] = useState('');
  const [lampQuantity, setLampQuantity] = useState('');
  const [lampCategories, setLampCategories] = useState([]);
  const [lampWattage, setLampWattage] = useState('');
  const [lampShade, setLampShade] = useState('');
  const [lampUploadedImage, setLampUploadedImage] = useState('');
  const [lamps, setLamps] = useState([]);
    const [showProductForm, setShowProductForm] = useState(false);
  const [showLampForm, setShowLampForm] = useState(false);
  
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
  
      const adminSnapshot = await db.collection('Admins').doc(adminUID).get();
      const adminData = adminSnapshot.data();
      const adminName = adminData.name;
  
      const productData = {
        ...product,
        adminUID: adminUID,
        adminName: adminName,
        addedTime: currentTime,
        updatedTime: currentTime,
      };
  
      // Add the product to the products collection and return the reference
      const productRef = await db.collection('allproducts').add(productData);
  
      console.log('Product added to products collection successfully!');
  
      return productRef;
    } catch (error) {
      console.error('Error adding product to products collection:', error);
    }
  };
  
  
 const addToCategory = async (itemId, categories) => {
  try {
    if (!categories || categories.length === 0) {
      console.error('Categories array is empty or undefined.');
      return;
    }

    const batch = firebase.firestore().batch();
    const categoriesRef = db.collection('allCategory');

    const existingCategories = await categoriesRef.where(firebase.firestore.FieldPath.documentId(), 'in', categories).get();
    const existingCategoryIds = existingCategories.docs.map((doc) => doc.id);

    // Create and update category documents if they don't exist
    const newCategories = categories.filter((category) => !existingCategoryIds.includes(category));
    newCategories.forEach((category) => {
      const newCategoryRef = categoriesRef.doc(category);
      batch.set(newCategoryRef, { items: [itemId] });
    });

    // Update existing category documents
    existingCategories.forEach((doc) => {
      const categoryRef = categoriesRef.doc(doc.id);
      batch.update(categoryRef, { items: firebase.firestore.FieldValue.arrayUnion(itemId) });
    });

    await batch.commit();
    console.log('Item added to categories successfully!');
  } catch (error) {
    console.error('Error adding item to category:', error);
  }
};

    
    
    
    const addLampToCollection = async (lamp) => {
      try {
        const currentUser = firebase.auth().currentUser;
        const adminUID = currentUser.uid;
        const currentTime = firebase.firestore.FieldValue.serverTimestamp();
        // ...
        const adminSnapshot = await db.collection('Admins').doc(adminUID).get();
        const adminData = adminSnapshot.data();
        const adminName = adminData.name;
        // Add the lamp to the lamps collection and return the reference
        const lampRef = await db.collection('alllamps').add({
          ...lamp,
          adminUID: adminUID,
          adminName: adminName,
          addedTime: currentTime,
          updatedTime: currentTime,
        });
    
        console.log('Lamp added to lamps collection successfully!');
    
        return lampRef;
      } catch (error) {
        console.error('Error adding lamp to lamps collection:', error);
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
    
    const [adminName, setAdminName] = useState('');

    useEffect(() => {
      const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          const adminCollectionRef = firebase.firestore().collection('Admins');
          const adminDocRef = adminCollectionRef.doc(user.uid);
    
          const adminUnsubscribe = adminDocRef.onSnapshot((docSnapshot) => {
            const data = docSnapshot.data();
            if (data && data.lamps) {
              const updatedLamps = data.lamps.map((lamp) => {
                // Check if the lamp has an image and update the imageURL property
                if (lamp.imageURL) {
                  return { ...lamp, imageURL: lamp.imageURL };
                }
                return lamp;
              });
    
              setProducts(data.products || []);
              setLamps(updatedLamps || []);
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
          setAdminName('');
        }
      });
    
      return () => {
        unsubscribe();
      };
    }, []);
    
    
   
    
    const handleDelete = async (itemId, isLamp) => {
      try {
        const currentUser = firebase.auth().currentUser;
        const adminCollectionRef = firebase.firestore().collection('Admins');
        const adminDocRef = adminCollectionRef.doc(currentUser.uid);
    
        let imageURL = '';
        let directory = '';
    
        if (isLamp) {
          // Retrieve the lamps array from the admin document
          const adminSnapshot = await adminDocRef.get();
          const adminData = adminSnapshot.data();
          const lampsArray = adminData.lamps || [];
    
          // Find the lamp object with matching itemId
          const lamp = lampsArray.find((lamp) => lamp.itemId === itemId);
    
          if (lamp) {
            imageURL = lamp.imageURL;
            directory = 'lamps';
    
            // Delete the lamp from the admin's lamps array
            await adminDocRef.update({
              lamps: firebase.firestore.FieldValue.arrayRemove(lamp),
            });
          }
          
          // Delete the lamp from the 'alllamps' collection
          await db.collection('alllamps').doc(itemId).delete();
        } else {
          // Retrieve the products array from the admin document
          const adminSnapshot = await adminDocRef.get();
          const adminData = adminSnapshot.data();
          const productsArray = adminData.products || [];
    
          // Find the product object with matching itemId
          const product = productsArray.find((product) => product.itemId === itemId);
    
          if (product) {
            imageURL = product.imageURL;
            directory = 'products';
    
            // Delete the product from the admin's products array
            await adminDocRef.update({
              products: firebase.firestore.FieldValue.arrayRemove(product),
            });
          }
          
          // Delete the product from the 'allproducts' collection
          await db.collection('allproducts').doc(itemId).delete();
        }
    
        if (imageURL) {
          // Delete the corresponding image from storage
          const storage = firebase.storage();
          const adminUid = currentUser.uid;
          const imagePath = `admin/${adminUid}/${directory}/${itemId}`;
    
          await storage.ref().child(imagePath).delete();
        }
    
        // Delete the item from categories
        // await removeFromCategories(itemId);
    
        console.log('Item deleted successfully!');
      } catch (error) {
        console.error('Error deleting item:', error);
        Products.reset
      }
    };
    
    
    
    
    

    const handleProductFormSubmit = async (e) => {
      e.preventDefault();
    
      // Create a new product object
      const newProduct = {
        name: productName,
        description: productDescription,
        price: productPrice,
        quantity: parseInt(productQuantity),
        imageURL: '',
        categories: productCategories,
      };
    
      try {
        // Get the current admin's Firestore collection reference
        const currentUser = firebase.auth().currentUser;
        const adminCollectionRef = firebase.firestore().collection('Admins');
        const adminDocRef = adminCollectionRef.doc(currentUser.uid);
        const storage = firebase.storage();
        const adminUid = currentUser.uid;
        if (productUploadedImage) {
          const imageRef = storage.ref().child(`admin/${adminUid}/products/${productUploadedImage.name}`);
          await imageRef.put(productUploadedImage);
          const downloadURL = await imageRef.getDownloadURL();
          newProduct.imageURL = downloadURL;
        }
    
        // Add the new product to the admin's collection as an array list
        await adminDocRef.update({
          products: firebase.firestore.FieldValue.arrayUnion(newProduct),
        });
    
        const productRef = await addProductToCollection(newProduct);
        await addToCategory(productRef.id, productCategories);

    
        // Reset the form fields
        setProductName('');
        setProductDescription('');
        setProductPrice('');
        setProductQuantity('');
        setProductCategories([]);
        setProductUploadedImage('');
    
        console.log('Product added successfully!');
      } catch (error) {
        console.error('Error adding product:', error);
      }
    };
    

    const handleLampFormSubmit = async (e) => {
      e.preventDefault();
    
      // Create a new lamp object
      const newLamp = {
        name: lampName,
        description: lampDescription,
        price: lampPrice,
        quantity: parseInt(lampQuantity),
        imageURL: '',
        categories: lampCategories,
        wattage: lampWattage,
        shade: lampShade,
      };
    
      try {
        // Get the current admin's Firestore collection reference
        const currentUser = firebase.auth().currentUser;
        const adminCollectionRef = firebase.firestore().collection('Admins');
        const adminDocRef = adminCollectionRef.doc(currentUser.uid);
        const storage = firebase.storage();
        const adminUid = currentUser.uid;
    
        if (lampUploadedImage) {
          const imageRef = storage.ref().child(`admin/${adminUid}/lamps/${lampUploadedImage.name}`);
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
        setLampName('');
        setLampDescription('');
        setLampPrice('');
        setLampQuantity('');
        setLampCategories([]);
        setLampWattage('');
        setLampShade('');
        setLampUploadedImage('');
    
        console.log('Lamp added successfully!');
      } catch (error) {
        console.error('Error adding lamp:', error);
      }
    };
    
    






    return (
        <>

<ListGroup style={{border:"red"}}>

  <ListGroup.Item>

        <div className="button-containerp">
        <Button  onClick={toggleProductForm}>Add Product</Button>
            <br/>
        <Button variant="primary" type="submit" onClick={()=>{
          navigate('/home');
        }}>
          Home
        </Button>
      <br/>
        <Button  onClick={toggleLampForm}>Add Lamp</Button>
            </div>
  </ListGroup.Item>
  <ListGroup.Item>
        {showProductForm && (
          <Form className='form' onSubmit={handleProductFormSubmit}>
            <div >
              <h1>Add Product</h1>
            </div>
    
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Product Name</Form.Label>
              <Form.Control type="text" required value={productName} onChange={(e) => setProductName(e.target.value)} />
            </Form.Group>
    
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Description</Form.Label>
              <Form.Control type="text" required value={productDescription} onChange={(e) => setProductDescription(e.target.value)} />
            </Form.Group>
    
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Price</Form.Label>
              <Form.Control type="number" required value={productPrice} onChange={(e) => setProductPrice(e.target.value)} />
            </Form.Group>
    
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Quantity</Form.Label>
              <Form.Control type="number" required value={productQuantity} onChange={(e) => setProductQuantity(e.target.value)} />
            </Form.Group>
    
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Product Image</Form.Label>
              <Form.Control type="file" required onChange={handleProductImageUpload} />
              {productUploadedImage && (
                <div>
                  <p>Image Uploaded:</p>
                  <img src={URL.createObjectURL(productUploadedImage)} alt="Uploaded" />
                </div>
              )}
            </Form.Group>
    
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label >Categories</Form.Label>
              <Form>
                {['Living Room', 'Kitchen', 'Bedroom', 'Bathroom', 'Home Office', 'Laundry Room'].map((category) => (
                  <div key={category} className="mb-3">
                    <Form.Check
                      type="checkbox"
                      label={category}
                      checked={productCategories.includes(category)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setProductCategories([...productCategories, category]);
                        } else {
                          setProductCategories(productCategories.filter((cat) => cat !== category));
                        }
                      }}
                    />
                  </div>
                ))}
              </Form>
            </Form.Group>
    
            <Button variant="primary" type="submit">Add Product</Button>
          </Form>
        )}

        {showLampForm && (
          <Form className='form' onSubmit={handleLampFormSubmit}>
            
            <div>
              <h1>Add Lamp</h1>
            </div>
    
            <Form.Group className='mb-3' controlId="formBasicEmail">
              <Form.Label>Lamp Name</Form.Label>
              <Form.Control type="text" required value={lampName} onChange={(e) => setLampName(e.target.value)} />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Description</Form.Label>
              <Form.Control type="text" required value={lampDescription} onChange={(e) => setLampDescription(e.target.value)} />
            </Form.Group>
    
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Price</Form.Label>
              <Form.Control type="number" required value={lampPrice} onChange={(e) => setLampPrice(e.target.value)} />
            </Form.Group>
    
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Quantity</Form.Label>
              <Form.Control type="number" required value={lampQuantity} onChange={(e) => setLampQuantity(e.target.value)} />
            </Form.Group>
    
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Lamp Image</Form.Label>
              <Form.Control type="file" required onChange={handleLampImageUpload} />
              {lampUploadedImage && (
                <div>
                  <p>Image Uploaded:</p>
                  <img src={URL.createObjectURL(lampUploadedImage)} alt="Uploaded" />
                </div>
              )}
            </Form.Group>
    
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Categories</Form.Label>
              <Form >
                {['Living Room', 'Kitchen', 'Bedroom', 'Bathroom', 'Home Office', 'Laundry Room'].map((category) => (
                  <div key={category} className="mb-3">
                    <Form.Check
                      type="checkbox"
                      label={category}
                      checked={lampCategories.includes(category)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setLampCategories([...lampCategories, category]);
                        } else {
                          setLampCategories(lampCategories.filter((cat) => cat !== category));
                        }
                      }}
                    />
                  </div>
                ))}
              </Form>
            </Form.Group>
    
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Wattage</Form.Label>
              <Form.Control type="text" required value={lampWattage} onChange={(e) => setLampWattage(e.target.value)} />
            </Form.Group>
    
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Shade</Form.Label>
              <Form.Control type="text" required value={lampShade} onChange={(e) => setLampShade(e.target.value)} />
            </Form.Group>
    
            <Button variant="primary" type="submit">Add Lamp</Button>
          </Form>
        )}
</ListGroup.Item>  
<ListGroup.Item>
        
   
      <div >
        <h1 class="h">My Products</h1>
      {products.map((product) => (
        <div class='product' key={product.name}>
          <h1>{product.name}</h1>
          <p>Description: {product.description}</p>
          <p>Price: {product.price}</p>
          <p>Quantity: {product.quantity}</p>
          <img style={{width:"150px",height:"150px"}} src={product.imageURL} alt={product.name} />
          <Button class='button' variant="primary" onClick={() => handleEdit(product.id)}>Edit</Button>
          <Button  variant="primary" onClick={() => handleDelete(product.name, false)}>Delete</Button>
        </div>
      ))}
      </div>
  </ListGroup.Item>
  <ListGroup.Item>
      <div > 
      <h1 class="h">My Lamps</h1>

    {lamps.map((lamp) => (
    <div class='lamp' key={lamp.name}>
      <h1>{lamp.name}</h1>
      <p>Description: {lamp.description}</p>
      <p>Price: {lamp.price}</p>
      <p>Quantity: {lamp.quantity}</p>
      <p>watt: {lamp.wattage}</p>
      <p>shade: {lamp.shade}</p>
      <img style={{ width: "150px", height: "150px" }} src={lamp.imageURL} alt={lamp.name} />
      <Button  variant="primary" onClick={() => handleEdit(lamp.id)}>Edit</Button>
      <Button  variant="primary" onClick={() => handleDelete(lamp.name, true)}>Delete</Button>
    </div>
  ))}
</div>
</ListGroup.Item>
</ListGroup >

    </>

    
      
  );
  
};
export default Products;


