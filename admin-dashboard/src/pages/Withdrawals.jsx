import { useEffect, useState } from 'react';
import api from '../api';
import toast from 'react-hot-toast';

export default function Withdrawals() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      const res = await api.get('/admin/withdrawals?status=PENDING');
      setWithdrawals(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = async (id, status) => {
    try {
      await api.put(`/admin/withdrawals/${id}/process`, { status });
      toast.success(`Withdrawal ${status.toLowerCase()}`);
      fetchWithdrawals();
    } catch (error) {
      toast.error('Failed to process');
    }
  };

  if (loading) return <div className="text-white">Loading...</div>;

  return (
    <div>
      <h2 className="text-white text-2xl font-bold mb-4">Pending Withdrawals</h2>
      {withdrawals.length === 0 && <p className="text-gray-400">No pending withdrawals.</p>}
      <div className="space-y-4">
        {withdrawals.map(w => (
          <div key={w.id} className="bg-gray-800 p-4 rounded-lg flex justify-between items-center">
            <div>
              <p className="text-white font-semibold">{w.user?.name}</p>
              <p className="text-gray-400 text-sm">{w.user?.email}</p>
              <p className="text-gray-400 text-sm">Amount: ₦{w.amount.toLocaleString()}</p>
              <p className="text-gray-400 text-sm">Bank: {w.bankAccount?.bankName} ●●●●{w.bankAccount?.accountNumber?.slice(-4)}</p>
            </div>
            <div className="space-x-2">
              <button onClick={() => handleProcess(w.id, 'COMPLETED')} className="bg-green-600 px-4 py-2 rounded text-white">Approve</button>
              <button onClick={() => handleProcess(w.id, 'FAILED')} className="bg-red-600 px-4 py-2 rounded text-white">Reject</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}