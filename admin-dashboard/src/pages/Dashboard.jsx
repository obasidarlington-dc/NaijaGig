import { useEffect, useState } from 'react';
import api from '../api';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/analytics');
        setStats(res.data.data);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load dashboard');
        // Still show empty stats to avoid crash
        setStats({ totalUsers: 0, totalArtisans: 0, totalClients: 0, totalBookings: 0, completedBookings: 0, pendingWithdrawals: 0, totalEarnings: 0 });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="text-white">Loading dashboard...</div>;

  return (
    <div>
      <h2 className="text-white text-2xl font-bold mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-gray-400 text-sm">Total Users</h3>
          <p className="text-white text-3xl font-bold">{stats.totalUsers}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-gray-400 text-sm">Total Bookings</h3>
          <p className="text-white text-3xl font-bold">{stats.totalBookings}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-gray-400 text-sm">Pending Withdrawals</h3>
          <p className="text-white text-3xl font-bold">{stats.pendingWithdrawals}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-gray-400 text-sm">Artisans</h3>
          <p className="text-white text-3xl font-bold">{stats.totalArtisans}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-gray-400 text-sm">Completed Jobs</h3>
          <p className="text-white text-3xl font-bold">{stats.completedBookings}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-gray-400 text-sm">Total Earnings</h3>
          <p className="text-white text-3xl font-bold">₦{stats.totalEarnings.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}