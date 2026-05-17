import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Plus, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';

const tabs = ['Customers', 'Drivers', 'Admins'];
const roleMap = { Customers: 'customer', Drivers: 'driver', Admins: 'admin' };

const emptyForms = {
  Customers: { name: '', email: '', phone: '', password: '', nationalId: '' },
  Drivers: { name: '', email: '', phone: '', password: '', licenseNumber: '', licenseType: 'Light Vehicle' },
  Admins: { name: '', email: '', phone: '', password: '', accessLevel: 'Standard' },
};

const fieldConfigs = {
  Customers: [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'phone', label: 'Phone' },
    { key: 'password', label: 'Password' },
    { key: 'nationalId', label: 'National ID' },
  ],
  Drivers: [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'phone', label: 'Phone' },
    { key: 'password', label: 'Password' },
    { key: 'licenseNumber', label: 'License Number' },
    { key: 'licenseType', label: 'License Type', type: 'select', options: ['Light Vehicle', 'Heavy Vehicle'] },
  ],
  Admins: [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'phone', label: 'Phone' },
    { key: 'password', label: 'Password' },
    { key: 'accessLevel', label: 'Access Level', type: 'select', options: ['Standard', 'Super'] },
  ],
};

export default function ManageUsers() {
  const [data, setData] = useState({ Customers: [], Drivers: [], Admins: [] });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('Customers');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState(emptyForms.Customers);
  const [deleteModal, setDeleteModal] = useState(null);

  const fetchUsers = () => {
    api.get('/users')
      .then((res) => {
        const users = res.data;
        setData({
          Customers: users.filter((u) => u.role === 'customer'),
          Drivers: users.filter((u) => u.role === 'driver'),
          Admins: users.filter((u) => u.role === 'admin'),
        });
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const openAdd = () => {
    setForm(emptyForms[tab]);
    setDrawerOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      toast.error('Name and email are required');
      return;
    }
    try {
      const payload = {
        username: form.name,
        email: form.email,
        phone_number: form.phone,
        password: form.password || 'RentAvroom@123',
        role: roleMap[tab],
      };
      
      if (tab === 'Customers') {
        payload.national_id = form.nationalId;
      } else if (tab === 'Drivers') {
        payload.license_number = form.licenseNumber;
        payload.license_type = form.licenseType;
      } else if (tab === 'Admins') {
        payload.access_level = form.accessLevel;
      }
      
      await api.post('/users', payload);
      toast.success(`${tab.slice(0, -1)} added`);
      setDrawerOpen(false);
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Add failed');
    }
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/users/${deleteModal}`);
      toast.success('User deleted');
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Delete failed');
    }
    setDeleteModal(null);
  };

  const columns = {
    Customers: ['Name', 'Email', 'Phone', 'National ID'],
    Drivers: ['Name', 'Email', 'License Number', 'License Type'],
    Admins: ['Name', 'Email', 'Access Level'],
  };

  const getCellValue = (user, col) => {
    switch (col) {
      case 'Name': return user.username;
      case 'Email': return user.email;
      case 'Phone': return user.phone_number;
      case 'National ID': return user.national_id;
      case 'License Number': return user.license_number;
      case 'License Type': return user.license_type;
      case 'Access Level': return user.access_level;
      default: return '';
    }
  };

  if (loading) return <div className="page-enter px-8 py-6 text-white/30">Loading...</div>;

  return (
    <div className="page-enter px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-syne font-extrabold text-[32px] text-white">Manage Users</h1>
          <p className="text-white/35 text-sm mt-1">View and manage all system users</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-5 py-2.5 bg-[#f59e0b] hover:bg-[#d97706] text-black font-semibold text-sm rounded-lg transition-colors">
          <Plus size={16} /> Add {tab.slice(0, -1)}
        </button>
      </div>

      <div className="flex gap-1 mb-6 border-b border-[#2a2a2a]">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === t ? 'border-[#f59e0b] text-[#f59e0b]' : 'border-transparent text-white/35 hover:text-white/60'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1a1a1a] text-white/35">
              {columns[tab].map((col, i) => (
                <th key={col} className={`text-left py-3 px-4 font-medium ${i === 0 ? 'rounded-tl-lg' : ''}`}>{col}</th>
              ))}
              <th className="text-left py-3 px-4 font-medium rounded-tr-lg">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data[tab].map((user, i) => (
              <tr key={user.id} className={`border-b border-white/[0.04] hover:bg-[#f59e0b]/[0.05] transition-colors ${i % 2 === 0 ? 'bg-[#111]' : 'bg-[#0d0d0d]'}`}>
                {columns[tab].map((col) => (
                  <td key={col} className="py-3 px-4 text-white/60">{getCellValue(user, col)}</td>
                ))}
                <td className="py-3 px-4">
                  <button onClick={() => setDeleteModal(user.id)} className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 size={15} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <div className="absolute right-0 top-0 w-[400px] h-screen bg-[#111] p-8 overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-syne font-extrabold text-xl text-white">Add {tab.slice(0, -1)}</h2>
              <button onClick={() => setDrawerOpen(false)} className="text-white/30 hover:text-white transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              {fieldConfigs[tab].map(({ key, label, type, options }) => (
                <div key={key}>
                  <label className="block text-sm text-white/40 mb-1.5">{label}</label>
                  {type === 'select' ? (
                    <select value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white text-sm focus:outline-none focus:border-[#f59e0b]/50 transition-colors">
                      {options.map((o) => <option key={o} value={o} className="bg-[#1a1a1a]">{o}</option>)}
                    </select>
                  ) : (
                    <input type={type || 'text'} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white text-sm focus:outline-none focus:border-[#f59e0b]/50 transition-colors" />
                  )}
                </div>
              ))}
              <button type="submit" className="w-full py-3 bg-[#f59e0b] hover:bg-[#d97706] text-black font-syne font-bold rounded-lg transition-colors mt-2">Save</button>
              <button type="button" onClick={() => setDrawerOpen(false)} className="w-full py-3 text-white/40 border border-[#2a2a2a] rounded-lg hover:text-white transition-colors">Cancel</button>
            </form>
          </div>
        </div>
      )}

      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 max-w-sm w-full mx-4">
            <h3 className="font-syne font-bold text-lg text-white mb-2">Delete User</h3>
            <p className="text-sm text-white/40 mb-6">Are you sure? This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteModal(null)} className="px-4 py-2 text-sm text-white/40 border border-[#2a2a2a] rounded-lg hover:text-white transition-colors">Cancel</button>
              <button onClick={confirmDelete} className="px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
