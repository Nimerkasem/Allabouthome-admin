import { Route, Routes } from "react-router-dom";
import Login from './Login';
import Register from './Register';
import Home from "./Home";
import Products from "./Products";


const AppRoutes = ({ setUser, user , setIslogedIn , isLogedIn}) => {
    return (
        <Routes>
            <Route path="/home" element={<Home user={user} />} />
            <Route path='/' element={<Login setUser={setUser} setIslogedIn={setIslogedIn}  />} />
            <Route path='/Register' element={<Register setUser={setUser} />} />
            <Route path="/Products" element={<Products  setUser={setUser} />} /> 
        </Routes>
    );
};

export default AppRoutes;
