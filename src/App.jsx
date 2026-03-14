import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Navbar from "./pages/Navbar";
import Footer from "./pages/Footer";
import { Route, Routes, Navigate, } from "react-router-dom";
import Allproducts from "./pages/Allproducts";
import Productdetails from "./pages/Productdetails";
import { createContext, useState, useEffect } from "react";
import Cart from "./pages/Cart";
import ScrollToTop from "./pages/ScrollTop";
import Explore from "./pages/Explore";
import Profile from "./pages/Profofile";
import Payment from "./pages/Payment";
import Orders from "./pages/Orders";
import Wishlist from "./pages/Wishlist";
import Search from "./pages/Search";
import { Toaster } from "react-hot-toast";
import About from "./pages/About";
import axios from "axios";

import AdminProtected from "./Admin-pages/Admin-route";
import AdminDashboard from "./Admin-pages/Dashboard";
import AdminProducts from "./Admin-pages/AdminProducts";
import Users from "./Admin-pages/Admin-users";
import AdminOrders from "./Admin-pages/Admin-orders"

export const context = createContext()

export default function App(){

  const[products, setProducts] = useState([])
  const [user, setUser] = useState(null); 
  const [cart, setCart] = useState([])
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([])

useEffect(() => {
  const savedUser = localStorage.getItem("user");
  if (savedUser) {
    setUser(JSON.parse(savedUser));
  }
}, []);

useEffect(() => {
  if (user) {
    axios.get(`http://localhost:5000/cart?userId=${user.id}`)
      .then(res => setCart(res.data))
      .catch(err => console.log(err));
  }
}, [user]);

  
  return(
    <>
    <ScrollToTop />
    <context.Provider value={{products, setProducts, cart, setCart, user, setUser, orders, setOrders, wishlist, setWishlist}}>
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/home" element={<><Navbar /><Home /><Footer /></>}/>
      <Route path="/allproducts" element={<><Allproducts /><Footer /></>} />
      <Route path="/productdetails/:id" element={<><Productdetails /><Footer /></>} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/explore" element={<><Explore /><Footer /></>} />
      <Route path="/payment" element={<Payment />} />
      <Route path="/wishlist" element={<Wishlist />} />
      <Route path="/search" element={<Search />} />
      <Route path="/about" element={<><Navbar /><About /><Footer /></>} />

      <Route path="/profile" element={<Profile />}>
      <Route path="orders" element={<Orders />} />
      </Route>

      <Route path="/admin/dashboard" element={<AdminProtected><AdminDashboard /></AdminProtected>}/>
      <Route path="/admin/products" element={<AdminProtected><AdminProducts /></AdminProtected>}/>
      <Route path="/admin/users" element={<AdminProtected><Users /></AdminProtected>} />
      <Route path="/admin/orders" element={<AdminProtected><AdminOrders /></AdminProtected>} />

    </Routes>
   </context.Provider>

    <Toaster position="top-center" reverseOrder={false} />
    </>
  )
}