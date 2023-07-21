import { Route, Routes } from "react-router-dom";
import Login from './Login';
import Register from './Register';
import Home from "./Home";
import Products from "./Products";
import SalesDashboard from "./SalesDashboard"; // Import the SalesDashboard component

const AppRoutes = ({ setUser, user, setIslogedIn, isLogedIn }) => {
  return (
    <Routes>
      <Route path="/home" element={<Home user={user} />} />
      <Route path="/sales-dashboard" element={<SalesDashboard />} />
      <Route path='/' element={<Login setUser={setUser} setIslogedIn={setIslogedIn} />} />
      <Route path='/Register' element={<Register setUser={setUser} />} />
      <Route path="/Products" element={<Products setUser={setUser} />} />
    </Routes>
  );
};

export default AppRoutes;
