import { useEffect, useState } from 'react';
import api from '../api';

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/admin/bookings');
      setBookings(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-white">Loading...</div>;

  return (
    <div>
      <h2 className="text-white text-2xl font-bold mb-4">All Bookings</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-gray-300">
          <thead className="bg-gray-800">
            <tr>
              <th className="p-2">ID</th>
              <th className="p-2">Client</th>
              <th className="p-2">Artisan</th>
              <th className="p-2">Service</th>
              <th className="p-2">Status</th>
              <th className="p-2">Amount</th>
              <th className="p-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(booking => (
              <tr key={booking.id} className="border-b border-gray-700">
                <td className="p-2 text-sm">{booking.id.slice(-8)}</td>
                <td className="p-2">{booking.client?.name}</td>
                <td className="p-2">{booking.artisan?.name}</td>
                <td className="p-2">{booking.serviceType}</td>
                <td className="p-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    booking.status === 'COMPLETED' ? 'bg-green-800' :
                    booking.status === 'PENDING' ? 'bg-yellow-800' :
                    'bg-blue-800'
                  }`}>
                    {booking.status}
                  </span>
                </td>
                <td className="p-2">₦{booking.finalPrice?.toLocaleString() || booking.estimatedPrice?.toLocaleString()}</td>
                <td className="p-2">{new Date(booking.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}