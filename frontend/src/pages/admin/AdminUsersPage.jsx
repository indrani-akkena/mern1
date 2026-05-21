import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import API from '../../utils/api';

const AdminUsersPage = () => {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/users?limit=100');
      setUsers(data.users || []);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleToggleRole = async (user) => {
    if (user.role === 'admin') return toast.warn("Can't change admin role");
    setUpdatingId(user._id);
    try {
      const newRole = user.role === 'user' ? 'admin' : 'user';
      await API.put(`/users/${user._id}`, { role: newRole });
      setUsers(prev => prev.map(u => u._id === user._id ? { ...u, role: newRole } : u));
      toast.success(`Role updated to ${newRole}`);
    } catch {
      toast.error('Failed to update role');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleActive = async (user) => {
    setUpdatingId(user._id);
    try {
      await API.put(`/users/${user._id}`, { isActive: !user.isActive });
      setUsers(prev => prev.map(u => u._id === user._id ? { ...u, isActive: !u.isActive } : u));
      toast.success(`User ${user.isActive ? 'deactivated' : 'activated'}`);
    } catch {
      toast.error('Failed to update user status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (userId, userName) => {
    if (!window.confirm(`Delete user "${userName}"?`)) return;
    try {
      await API.delete(`/users/${userId}`);
      setUsers(prev => prev.filter(u => u._id !== userId));
      toast.success('User deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
          <p className="text-gray-500 text-sm">{users.length} total users</p>
        </div>
      </div>

      <div className="mb-5">
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email..." className="input-field max-w-sm" />
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array(6).fill(0).map((_, i) => <div key={i} className="shimmer h-16 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['User', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(user => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {user.role === 'admin' ? '👑 Admin' : '👤 User'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-xs">
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => handleToggleRole(user)}
                            disabled={updatingId === user._id}
                            className="text-purple-600 hover:text-purple-800 font-medium disabled:opacity-50"
                          >
                            Make {user.role === 'user' ? 'Admin' : 'User'}
                          </button>
                        )}
                        <span className="text-gray-200">|</span>
                        <button
                          onClick={() => handleToggleActive(user)}
                          disabled={updatingId === user._id}
                          className={`font-medium disabled:opacity-50 ${user.isActive ? 'text-orange-500 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}`}
                        >
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        {user.role !== 'admin' && (
                          <>
                            <span className="text-gray-200">|</span>
                            <button
                              onClick={() => handleDelete(user._id, user.name)}
                              className="text-red-500 hover:text-red-700 font-medium"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-400 text-sm">No users found.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
