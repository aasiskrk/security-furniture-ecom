import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import ProductDetails from './pages/ProductDetails';
import UserOrders from './pages/UserOrders';
import Profile from './pages/Profile';
import Checkout from './pages/Checkout';
import Shop from './pages/Shop';
import Wishlist from './pages/Wishlist';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import Products from './pages/admin/Products';
import Users from './pages/admin/Users';
import AdminOrders from './pages/admin/AdminOrders';
import OrderDetails from './pages/OrderDetails';

const AppContent = () => {
  const location = useLocation();
  const hideFooter = ['/cart', '/profile'].includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <Toaster position="top-center" />
      <main className="flex-grow bg-white pt-14">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/wishlist" element={<Wishlist />} />

          {/* Protected Routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<UserOrders />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/order/:orderId" element={<OrderDetails />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<Products />} />
            <Route path="/admin/users" element={<Users />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
          </Route>
        </Routes>
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
