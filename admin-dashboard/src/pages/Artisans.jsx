import { useEffect, useState } from 'react';
import api from '../api';
import toast from 'react-hot-toast';

export default function Artisans() {
  const [pending, setPending] = useState([]);
  const [approved, setApproved] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchArtisans = async () => {
    try {
      const res = await api.get('/admin/artisans/pending');
      setPending(res.data.data);
      const allRes = await api.get('/admin/artisans?approved=true'); // you can add endpoint or filter
      setApproved([]); // optional
    } catch (error) {
      toast.error('Failed to load artisans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtisans();
  }, []);

  const handleApprove = async (userId, approved) => {
    try {
      await api.put(`/admin/artisans/${userId}/approve`, { approved });
      toast.success(`Artisan ${approved ? 'approved' : 'rejected'}`);
      fetchArtisans();
    } catch (error) {
      toast.error('Action failed');
    }
  };

  if (loading) return <div className="text-white">Loading...</div>;

  return (
    <div>
      <h2 className="text-white text-2xl font-bold mb-4">Pending Artisans</h2>
      {pending.length === 0 && <p className="text-gray-400">No pending approvals.</p>}
      <div className="space-y-4">
        {pending.map(artisan => (
          <div key={artisan.id} className="bg-gray-800 p-4 rounded-lg flex justify-between items-center">
            <div>
              <p className="text-white font-semibold">{artisan.name}</p>
              <p className="text-gray-400 text-sm">{artisan.email}</p>
              <p className="text-gray-400 text-sm">Category: {artisan.artisanProfile?.serviceCategory}</p>
            </div>
            <div className="space-x-2">
              <button onClick={() => handleApprove(artisan.id, true)} className="bg-green-600 px-4 py-2 rounded text-white">Approve</button>
              <button onClick={() => handleApprove(artisan.id, false)} className="bg-red-600 px-4 py-2 rounded text-white">Reject</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}