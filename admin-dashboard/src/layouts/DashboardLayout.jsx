import { Outlet, Link, useNavigate } from 'react-router-dom';
import { FaUsers, FaHardHat, FaBook, FaMoneyBillWave, FaSignOutAlt, FaTachometerAlt } from 'react-icons/fa';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-obsidian">
      {/* Sidebar */}
      <aside className="w-64 bg-mercury p-4 border-r border-gray-800">
        <h1 className="text-white text-xl font-bold mb-6">ProxiCraft Admin</h1>
        <nav className="space-y-2">
          <Link to="/" className="flex items-center text-silver hover:text-white p-2 rounded hover:bg-gray-800">
            <FaTachometerAlt className="mr-2" /> Dashboard
          </Link>
          <Link to="/artisans" className="flex items-center text-silver hover:text-white p-2 rounded hover:bg-gray-800">
            <FaHardHat className="mr-2" /> Artisans
          </Link>
          <Link to="/bookings" className="flex items-center text-silver hover:text-white p-2 rounded hover:bg-gray-800">
            <FaBook className="mr-2" /> Bookings
          </Link>
          <Link to="/withdrawals" className="flex items-center text-silver hover:text-white p-2 rounded hover:bg-gray-800">
            <FaMoneyBillWave className="mr-2" /> Withdrawals
          </Link>
          <Link to="/users" className="flex items-center text-silver hover:text-white p-2 rounded hover:bg-gray-800">
            <FaUsers className="mr-2" /> Users
          </Link>
          <button onClick={handleLogout} className="flex items-center text-red-400 hover:text-red-300 p-2 rounded w-full mt-8">
            <FaSignOutAlt className="mr-2" /> Logout
          </button>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}