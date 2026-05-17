import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';

import Login from './pages/Login';
import Register from './pages/Register';
import Vehicles from './pages/customer/Vehicles';
import BookRental from './pages/customer/BookRental';
import MyRentals from './pages/customer/MyRentals';
import Reviews from './pages/customer/Reviews';
import Receipts from './pages/customer/Receipts';
import Settings from './pages/customer/Settings';
import ManageVehicles from './pages/admin/ManageVehicles';
import ManageUsers from './pages/admin/ManageUsers';
import AllRentals from './pages/admin/AllRentals';
import Payments from './pages/admin/Payments';
import AdminReceipts from './pages/admin/AdminReceipts';
import AllReviews from './pages/admin/AllReviews';
import AssignedRentals from './pages/driver/AssignedRentals';

function PageWrapper() {
  const location = useLocation();

  return (
    <div key={location.key} className="page-enter">
      <Outlet />
    </div>
  );
}

function ProtectedLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('velox_sidebar_collapsed') === 'true');

  useEffect(() => {
    localStorage.setItem('velox_sidebar_collapsed', String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  if (!user) return <Navigate to="/" replace />;

  const isCustomerRoute = location.pathname.startsWith('/customer');
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isDriverRoute = location.pathname.startsWith('/driver');

  if (
    (isCustomerRoute && user.role !== 'customer') ||
    (isAdminRoute && user.role !== 'admin') ||
    (isDriverRoute && user.role !== 'driver')
  ) {
    const fallback =
      user.role === 'admin'
        ? '/admin/vehicles'
        : user.role === 'driver'
        ? '/driver/rentals'
        : '/customer/vehicles';
    return <Navigate to={fallback} replace />;
  }

  return (
    <div className="min-h-screen bg-[#080808]">
      <Sidebar collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)} />
      <main className={`main-content min-h-screen transition-all duration-300 ${sidebarCollapsed ? 'ml-[84px]' : 'ml-[260px]'}`}>
        <Routes>
          <Route element={<PageWrapper />}>
            <Route path="/customer/vehicles" element={<Vehicles />} />
            <Route path="/customer/book" element={<BookRental />} />
            <Route path="/customer/rentals" element={<MyRentals />} />
            <Route path="/customer/reviews" element={<Reviews />} />
            <Route path="/customer/receipts" element={<Receipts />} />
            <Route path="/customer/settings" element={<Settings />} />
            <Route path="/admin/vehicles" element={<ManageVehicles />} />
            <Route path="/admin/users" element={<ManageUsers />} />
            <Route path="/admin/rentals" element={<AllRentals />} />
            <Route path="/admin/payments" element={<Payments />} />
            <Route path="/admin/receipts" element={<AdminReceipts />} />
            <Route path="/admin/reviews" element={<AllReviews />} />
            <Route path="/driver/rentals" element={<AssignedRentals />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1a1a',
              color: '#fff',
              border: '1px solid #2a2a2a',
            },
          }}
        />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/*" element={<ProtectedLayout />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
