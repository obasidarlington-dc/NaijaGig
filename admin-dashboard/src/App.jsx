import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';      // your safe dashboard
import Artisans from './pages/Artisans';
import Bookings from './pages/Bookings';
import Withdrawals from './pages/Withdrawals';
import Users from './pages/Users';
import { Toaster } from 'react-hot-toast';

function App() {
  const token = localStorage.getItem('adminToken');
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={token ? <DashboardLayout /> : <Navigate to="/login" />}>
          <Route index element={<Dashboard />} />
          <Route path="artisans" element={<Artisans />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="withdrawals" element={<Withdrawals />} />
          <Route path="users" element={<Users />} />
        </Route>
        {/* Catch any unknown routes and redirect to dashboard */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;