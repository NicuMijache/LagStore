import { Routes, Route } from 'react-router-dom'
import type { ReactNode } from 'react'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Products from './pages/Products'
import ProductDetails from './pages/ProductDetails'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminProducts from './pages/AdminProducts'
import AdminCategories from './pages/AdminCategories'
import AdminSuppliers from './pages/AdminSuppliers'
import AdminDeliveryMethods from './pages/AdminDeliveryMethods'
import AdminOrders from './pages/AdminOrders'
import Wishlist from './pages/Wishlist'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Orders from './pages/Orders'
import OrderDetails from './pages/OrderDetails'

const loggedIn = (page: ReactNode) => <ProtectedRoute>{page}</ProtectedRoute>
const adminOnly = (page: ReactNode) => <ProtectedRoute requireAdmin>{page}</ProtectedRoute>

function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/wishlist" element={loggedIn(<Wishlist />)} />
          <Route path="/cart" element={loggedIn(<Cart />)} />
          <Route path="/checkout" element={loggedIn(<Checkout />)} />
          <Route path="/orders" element={loggedIn(<Orders />)} />
          <Route path="/orders/:id" element={loggedIn(<OrderDetails />)} />

          <Route path="/admin/products" element={adminOnly(<AdminProducts />)} />
          <Route path="/admin/categories" element={adminOnly(<AdminCategories />)} />
          <Route path="/admin/suppliers" element={adminOnly(<AdminSuppliers />)} />
          <Route path="/admin/delivery-methods" element={adminOnly(<AdminDeliveryMethods />)} />
          <Route path="/admin/orders" element={adminOnly(<AdminOrders />)} />
        </Routes>
      </main>
    </>
  )
}

export default App
