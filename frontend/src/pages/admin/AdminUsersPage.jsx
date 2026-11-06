import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { formatDate } from '../../utils/formatters';
import Sidebar from '../../components/common/Sidebar';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';
import { Users, Search } from 'lucide-react';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      let url = '/admin/users';
      const params = [];
      if (roleFilter !== 'all') params.push(`role=${roleFilter}`);
      if (searchTerm) params.push(`search=${searchTerm}`);
      if (params.length) url += `?${params.join('&')}`;

      const res = await api.get(url);
      if (res.success) {
        setUsers(res.users || []);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleToggleStatus = async (user) => {
    try {
      const res = await api.put(`/admin/users/${user._id}/toggle-status`);
      if (res.success) {
        toast.success(res.message);
        fetchUsers();
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50">
      <Sidebar role="admin" />

      <main className="flex-1 p-4 sm:p-8 space-y-6 max-w-7xl">
        <div className="pb-4 border-b border-slate-200">
          <h1 className="text-2xl font-black text-navy-950">Platform Users & Customer Accounts</h1>
          <p className="text-xs text-slate-500">
            View registered customers, vendors, and manage account authorization status
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search user by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </form>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-500 font-bold">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
            >
              <option value="all">All Roles</option>
              <option value="customer">Customers</option>
              <option value="vendor">Vendors</option>
              <option value="admin">Administrators</option>
            </select>
          </div>
        </div>

        {loading ? (
          <Loader message="Loading accounts..." />
        ) : users.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No Users Found"
            description="No users matched your query."
          />
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                    <th className="p-4">User</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Phone</th>
                    <th className="p-4">Joined Date</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                            alt=""
                            className="w-9 h-9 rounded-full object-cover bg-slate-100 border border-slate-200"
                          />
                          <span className="font-bold text-navy-950">{u.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-slate-600 font-mono">{u.email}</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            u.role === 'admin'
                              ? 'bg-amber-100 text-amber-900'
                              : u.role === 'vendor'
                              ? 'bg-orange-100 text-brand-orange'
                              : 'bg-blue-100 text-blue-900'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4">{u.phone || 'N/A'}</td>
                      <td className="p-4 text-slate-500">{formatDate(u.createdAt)}</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {u.isActive ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {u.role !== 'admin' && (
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(u)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                              u.isActive
                                ? 'border border-rose-200 text-rose-600 hover:bg-rose-50'
                                : 'border border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                            }`}
                          >
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminUsersPage;
