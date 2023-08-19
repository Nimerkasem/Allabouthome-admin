import { Route, Routes } from "react-router-dom";
import Login from './Login';
import Register from './Register';
import Home from "./Home";
import Products from "./Products";
import AdminManagement from "./AdminManagement"; 
import SalesDashboard from "./SalesDashboard"; 
import Lamps from "./Lamps";
import Orders from "./Orders";

const AppRoutes = ({ setUser, user, setIslogedIn, isLogedIn }) => {
  return (
    <Routes>
      <Route path="/home" element={<Home user={user} />} />
      <Route path="/admin-management" element={<AdminManagement />} />
      <Route path="/sales-dashboard" element={<SalesDashboard />} />
      <Route path='/' element={<Login setUser={setUser} setIslogedIn={setIslogedIn} />} />
      <Route path='/Register' element={<Register setUser={setUser} />} />
      <Route path="/Products" element={<Products setUser={setUser} />} />
      <Route path="/Lamps" element={<Lamps setUser={setUser} />} />
      <Route path="/Orders" element={<Orders setUser={setUser} />} />

    </Routes>
  );
};

export default AppRoutes;
