import { useEffect, useState } from 'react';
import api from '../api';
import toast from 'react-hot-toast';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users'); // this endpoint in adminController
      setUsers(res.data.data);
    } catch (error) {
      console.error(error);
      // Fallback: if endpoint missing, show dummy message
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (id) => {
    try {
      await api.put(`/admin/users/${id}/toggle-active`);
      toast.success('User status updated');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  if (loading) return <div className="text-white">Loading...</div>;

  return (
    <div>
      <h2 className="text-white text-2xl font-bold mb-4">Users Management</h2>
      {users.length === 0 && <p className="text-gray-400">No users found or endpoint not implemented.</p>}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-gray-300">
          <thead className="bg-gray-800">
            <tr>
              <th className="p-2">Name</th>
              <th className="p-2">Email</th>
              <th className="p-2">Role</th>
              <th className="p-2">Status</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-b border-gray-700">
                <td className="p-2">{user.name}</td>
                <td className="p-2">{user.email}</td>
                <td className="p-2">{user.role}</td>
                <td className="p-2">
                  <span className={`px-2 py-1 rounded text-xs ${user.isActive ? 'bg-green-800' : 'bg-red-800'}`}>
                    {user.isActive ? 'Active' : 'Suspended'}
                  </span>
                </td>
                <td className="p-2">
                  <button onClick={() => toggleActive(user.id)} className="bg-blue-600 px-3 py-1 rounded text-sm">
                    {user.isActive ? 'Suspend' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}