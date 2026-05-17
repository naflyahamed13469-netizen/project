import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/Badge';
import EmptyState from '../../components/EmptyState';
import { ClipboardList } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MyRentals() {
  const { user } = useAuth();
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('Active');
  const [returnModal, setReturnModal] = useState(null);
  const [returning, setReturning] = useState(false);

  const fetchRentals = () => {
    api.get('/rentals')
      .then((res) => setRentals(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRentals(); }, []);

  const myRentals = rentals.filter((r) => r.customer_id === user?.id);

  const filtered = myRentals.filter((r) =>
    tab === 'Active' ? r.status === 'Active' : r.status === 'Completed'
  );

  const confirmReturn = async () => {
    if (!returnModal || returning) return;

    setReturning(true);

    try {
      await api.put(`/rentals/${returnModal}/complete`);
      setRentals((current) =>
        current.map((r) => (r.id === returnModal ? { ...r, status: 'Completed' } : r))
      );
      toast.success('Vehicle returned successfully');
      setReturnModal(null);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to return vehicle');
    } finally {
      setReturning(false);
    }
  };

  if (loading) return <div className="page-enter px-8 py-6 text-white/30">Loading...</div>;

  return (
    <div className="page-enter px-8 py-6">
      <h1 className="font-syne font-extrabold text-[32px] text-white mb-1">My Rentals</h1>
      <p className="text-white/35 text-sm mb-6">Track your current and past rentals</p>

      <div className="flex gap-1 mb-6 border-b border-[#2a2a2a]">
        {['Active', 'Past'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === t
                ? 'border-[#f59e0b] text-[#f59e0b]'
                : 'border-transparent text-white/35 hover:text-white/60'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={ClipboardList} message={`No ${tab.toLowerCase()} rentals found.`} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#1a1a1a] text-white/35">
                <th className="text-left py-3 px-4 font-medium rounded-tl-lg">Vehicle</th>
                <th className="text-left py-3 px-4 font-medium">Driver</th>
                <th className="text-left py-3 px-4 font-medium">Start</th>
                <th className="text-left py-3 px-4 font-medium">End</th>
                <th className="text-left py-3 px-4 font-medium">Cost</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
                <th className="text-left py-3 px-4 font-medium rounded-tr-lg">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr
                  key={r.id}
                  className={`border-b border-white/[0.04] hover:bg-[#f59e0b]/[0.05] transition-colors ${
                    i % 2 === 0 ? 'bg-[#111]' : 'bg-[#0d0d0d]'
                  }`}
                >
                  <td className="py-3 px-4 text-white/90">{r.brand} {r.model}</td>
                  <td className="py-3 px-4 text-white/40">{r.driver_name}</td>
                  <td className="py-3 px-4 text-white/30">{new Date(r.start_date).toLocaleDateString()}</td>
                  <td className="py-3 px-4 text-white/30">{new Date(r.end_date).toLocaleDateString()}</td>
                  <td className="py-3 px-4 text-[#f59e0b] font-semibold">${r.total_cost}</td>
                  <td className="py-3 px-4">
                    <Badge text={r.status} color={r.status === 'Active' ? 'green' : 'gray'} />
                  </td>
                  <td className="py-3 px-4">
                    {r.status === 'Active' && (
                      <button
                        onClick={() => setReturnModal(r.id)}
                        className="px-3 py-1.5 text-xs border border-[#f59e0b]/40 text-[#f59e0b] rounded-lg hover:bg-[#f59e0b]/10 transition-colors"
                      >
                        Return Vehicle
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {returnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 max-w-sm w-full mx-4">
            <h3 className="font-syne font-bold text-lg text-white mb-2">Return Vehicle</h3>
            <p className="text-sm text-white/40 mb-6">Are you sure you want to return this vehicle? This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setReturnModal(null)}
                className="px-4 py-2 text-sm text-white/40 hover:text-white border border-[#2a2a2a] rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmReturn}
                disabled={returning}
                className="px-4 py-2 text-sm bg-[#f59e0b] hover:bg-[#d97706] disabled:bg-[#6b7280] disabled:text-white/70 disabled:cursor-not-allowed text-black font-semibold rounded-lg transition-colors"
              >
                {returning ? 'Returning...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
