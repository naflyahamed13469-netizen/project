import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';

const vehicleTypes = [
  'Sedan',
  'SUV',
  'Van',
  'Hatchback',
  'Pickup Truck',
  'Coupe',
  'Convertible',
  'Wagon',
  'Minivan',
  'Electric',
  'Luxury',
  'Sports Car'
];

const emptyForm = { brand: '', model: '', type: 'Sedan', dailyRate: '', year: '', vehicleNumber: '', image_url: '' };

export default function ManageVehicles() {
  const [vehicleList, setVehicleList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [imageChanged, setImageChanged] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);

  const fetchVehicles = () => {
    api.get('/vehicles')
      .then((res) => {
        console.log('Vehicles loaded:', res.data);
        setVehicleList(res.data || []);
      })
      .catch((err) => {
        console.error('Error fetching vehicles:', err);
        toast.error('Failed to load vehicles');
        setVehicleList([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchVehicles(); }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setImageChanged(false);
    setDrawerOpen(true);
  };

  const openEdit = (v) => {
    setEditingId(v.id);
    setForm({ brand: v.brand, model: v.model, type: v.type, dailyRate: String(v.daily_rate), year: String(v.year), vehicleNumber: v.vehicle_number, image_url: v.image_url || '' });
    setImageChanged(false);
    setDrawerOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.brand || !form.model || !form.dailyRate) {
      toast.error('Fill in required fields');
      return;
    }
    try {
      const payload = {
        brand: form.brand,
        model: form.model,
        type: form.type,
        daily_rate: Number(form.dailyRate),
        year: Number(form.year),
        vehicle_number: form.vehicleNumber,
        available: true
      };

      if (editingId) {
        if (imageChanged) {
          payload.image_url = form.image_url;
        }
        await api.put(`/vehicles/${editingId}`, payload);
        toast.success('Vehicle updated');
      } else {
        await api.post('/vehicles', { ...payload, image_url: form.image_url });
        toast.success('Vehicle added');
      }
      setDrawerOpen(false);
      fetchVehicles();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/vehicles/${deleteModal}`);
      toast.success('Vehicle deleted');
      fetchVehicles();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Delete failed');
    }
    setDeleteModal(null);
  };

  const toggleAvailable = async (id) => {
    const v = vehicleList.find((v) => v.id === id);
    if (!v) return;
    try {
      await api.put(`/vehicles/${id}`, { available: !v.available });
      setVehicleList(vehicleList.map((v) => v.id === id ? { ...v, available: !v.available } : v));
    } catch (err) {
      console.error(err);
      toast.error('Toggle failed');
    }
  };

  if (loading) return <div className="page-enter px-8 py-6 text-white/30">Loading...</div>;

  return (
    <div className="page-enter px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-syne font-extrabold text-[32px] text-white">Manage Vehicles</h1>
          <p className="text-white/35 text-sm mt-1">Add, edit, and manage the fleet</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-5 py-2.5 bg-[#f59e0b] hover:bg-[#d97706] text-black font-semibold text-sm rounded-lg transition-colors">
          <Plus size={16} /> Add Vehicle
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1a1a1a] text-white/35">
              <th className="text-left py-3 px-4 font-medium rounded-tl-lg">Image</th>
              <th className="text-left py-3 px-4 font-medium">Brand</th>
              <th className="text-left py-3 px-4 font-medium">Model</th>
              <th className="text-left py-3 px-4 font-medium">Type</th>
              <th className="text-left py-3 px-4 font-medium">Daily Rate</th>
              <th className="text-left py-3 px-4 font-medium">Year</th>
              <th className="text-left py-3 px-4 font-medium">Vehicle No</th>
              <th className="text-left py-3 px-4 font-medium">Available</th>
              <th className="text-left py-3 px-4 font-medium rounded-tr-lg">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vehicleList.map((v, i) => (
              <tr key={v.id} className={`border-b border-white/[0.04] hover:bg-[#f59e0b]/[0.05] transition-colors ${i % 2 === 0 ? 'bg-[#111]' : 'bg-[#0d0d0d]'}`}>
                <td className="py-3 px-4">
                  {v.image_url && (
                    <img
                      src={v.image_url}
                      alt={`${v.brand} ${v.model}`}
                      className="w-16 h-11 object-cover rounded-lg"
                    />
                  )}
                </td>
                <td className="py-3 px-4 text-white/90">{v.brand}</td>
                <td className="py-3 px-4 text-white/60">{v.model}</td>
                <td className="py-3 px-4 text-white/40">{v.type}</td>
                <td className="py-3 px-4 text-[#f59e0b]">${v.daily_rate}</td>
                <td className="py-3 px-4 text-white/40">{v.year}</td>
                <td className="py-3 px-4 text-white/40">{v.vehicle_number}</td>
                <td className="py-3 px-4">
                  <button onClick={() => toggleAvailable(v.id)} className={`relative w-10 h-5 rounded-full transition-colors ${v.available ? 'bg-emerald-500' : 'bg-red-500/60'}`}>
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${v.available ? 'left-5' : 'left-0.5'}`} />
                  </button>
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(v)} className="p-1.5 text-[#f59e0b] hover:bg-[#f59e0b]/10 rounded-lg transition-colors"><Pencil size={15} /></button>
                    <button onClick={() => setDeleteModal(v.id)} className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 size={15} /></button>
                  </div>
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
              <h2 className="font-syne font-extrabold text-xl text-white">{editingId ? 'Edit Vehicle' : 'Add Vehicle'}</h2>
              <button onClick={() => setDrawerOpen(false)} className="text-white/30 hover:text-white transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm text-white/40 mb-1.5">Brand</label>
                <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white text-sm focus:outline-none focus:border-[#f59e0b]/50 transition-colors" />
              </div>
              <div>
                <label className="block text-sm text-white/40 mb-1.5">Model</label>
                <input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white text-sm focus:outline-none focus:border-[#f59e0b]/50 transition-colors" />
              </div>
              <div>
                <label className="block text-sm text-white/40 mb-1.5">Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white text-sm focus:outline-none focus:border-[#f59e0b]/50 transition-colors">
                  {vehicleTypes.map((type) => (
                    <option key={type} value={type} className="bg-[#1a1a1a]">{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-white/40 mb-1.5">Daily Rate ($)</label>
                <input type="number" value={form.dailyRate} onChange={(e) => setForm({ ...form, dailyRate: e.target.value })} className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white text-sm focus:outline-none focus:border-[#f59e0b]/50 transition-colors" />
              </div>
              <div>
                <label className="block text-sm text-white/40 mb-1.5">Year</label>
                <input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white text-sm focus:outline-none focus:border-[#f59e0b]/50 transition-colors" />
              </div>
              <div>
                <label className="block text-sm text-white/40 mb-1.5">Vehicle Number</label>
                <input value={form.vehicleNumber} onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })} className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white text-sm focus:outline-none focus:border-[#f59e0b]/50 transition-colors" />
              </div>
              <div>
                {form.image_url && (
                  <div>
                    <p style={{ color: '#ffffff60', fontSize: '12px', marginBottom: '4px' }}>Current Image:</p>
                    <img
                      src={form.image_url}
                      alt="current"
                      style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px', marginBottom: '8px' }}
                    />
                  </div>
                )}
                <label style={{ color: '#ffffff60', fontSize: '14px' }}>
                  Change Image (optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setForm({ ...form, image_url: reader.result });
                        setImageChanged(true);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white text-sm file:mr-4 file:rounded-md file:border-0 file:bg-[#f59e0b] file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-black focus:outline-none focus:border-[#f59e0b]/50 transition-colors"
                />
              </div>
              <button type="submit" className="w-full py-3 bg-[#f59e0b] hover:bg-[#d97706] text-black font-syne font-bold rounded-lg transition-colors mt-2">Save</button>
              <button type="button" onClick={() => setDrawerOpen(false)} className="w-full py-3 text-white/40 border border-[#2a2a2a] rounded-lg hover:text-white transition-colors">Cancel</button>
            </form>
          </div>
        </div>
      )}

      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 max-w-sm w-full mx-4">
            <h3 className="font-syne font-bold text-lg text-white mb-2">Delete Vehicle</h3>
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
