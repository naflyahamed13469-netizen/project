import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/StatCard';
import Badge from '../../components/Badge';
import EmptyState from '../../components/EmptyState';
import toast from 'react-hot-toast';
import { ClipboardList, CheckCircle, Clock } from 'lucide-react';

export default function AssignedRentals() {
  const { user } = useAuth();
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [completing, setCompleting] = useState(null);

  useEffect(() => {
    api.get('/rentals')
      .then((res) => setRentals(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleCompleteRental = async (rentalId) => {
    setCompleting(rentalId);
    try {
      await api.put(`/rentals/${rentalId}/complete`);
      setRentals(rentals.map(r => r.id === rentalId ? { ...r, status: 'Completed' } : r));
      toast.success('Rental completed successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to complete rental');
    } finally {
      setCompleting(null);
    }
  };

  const myRentals = rentals.filter((r) => r.driver_id === user?.id);
  const totalAssigned = myRentals.length;
  const activeNow = myRentals.filter((r) => r.status === 'Active').length;
  const completed = myRentals.filter((r) => r.status === 'Completed').length;

  if (loading) return <div className="page-enter px-8 py-6 text-white/30">Loading...</div>;

  return (
    <div className="page-enter px-8 py-6">
      <h1 className="font-syne font-extrabold text-[32px] text-white mb-1">Assigned Rentals</h1>
      <p className="text-white/35 text-sm mb-6">View your current and past assignments</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard title="Total Assigned" value={totalAssigned} icon={ClipboardList} color="amber" />
        <StatCard title="Active Now" value={activeNow} icon={Clock} color="amber" />
        <StatCard title="Completed" value={completed} icon={CheckCircle} color="amber" />
      </div>

      {myRentals.length === 0 ? (
        <EmptyState icon={ClipboardList} message="No rentals assigned yet." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#1a1a1a] text-white/35">
                <th className="text-left py-3 px-4 font-medium rounded-tl-lg w-8"></th>
                <th className="text-left py-3 px-4 font-medium">Customer</th>
                <th className="text-left py-3 px-4 font-medium">Vehicle</th>
                <th className="text-left py-3 px-4 font-medium">Start Date</th>
                <th className="text-left py-3 px-4 font-medium">End Date</th>
                <th className="text-left py-3 px-4 font-medium rounded-tr-lg">Status</th>
              </tr>
            </thead>
            <tbody>
              {myRentals.map((r, i) => {
                const isExpanded = expanded === r.id;
                return (
                  <>
                    <tr
                      key={r.id}
                      onClick={() => setExpanded(isExpanded ? null : r.id)}
                      className={`border-b border-white/[0.04] hover:bg-[#f59e0b]/[0.05] transition-colors cursor-pointer ${i % 2 === 0 ? 'bg-[#111]' : 'bg-[#0d0d0d]'}`}
                    >
                      <td className="py-3 px-4 text-white/20 text-xs">
                        <svg width="12" height="12" viewBox="0 0 12 12" className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`}><path d="M4 2l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5"/></svg>
                      </td>
                      <td className="py-3 px-4 text-white/90">{r.customer_name || r.customer?.name}</td>
                      <td className="py-3 px-4 text-white/40">{r.vehicleName || (r.brand && r.model ? `${r.brand} ${r.model}` : '')}</td>
                      <td className="py-3 px-4 text-white/30">{r.start_date}</td>
                      <td className="py-3 px-4 text-white/30">{r.end_date}</td>
                      <td className="py-3 px-4">
                        <Badge text={r.status} color={r.status === 'Active' ? 'green' : 'gray'} />
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${r.id}-detail`} className="bg-[#1a1a1a]/50">
                        <td colSpan={6} className="py-4 px-8">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-4">
                            <div>
                              <p className="text-white/25 text-xs mb-1">Customer Phone</p>
                              <p className="text-white/60">{r.customerPhone || r.customer?.phone || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-white/25 text-xs mb-1">Vehicle Number</p>
                              <p className="text-white/60">{r.vehicle_number || r.vehicle?.vehicleNumber}</p>
                            </div>
                            <div>
                              <p className="text-white/25 text-xs mb-1">Start</p>
                              <p className="text-white/60">{r.start_date}</p>
                            </div>
                            <div>
                              <p className="text-white/25 text-xs mb-1">End</p>
                              <p className="text-white/60">{r.end_date}</p>
                            </div>
                          </div>
                          {r.status === 'Active' && (
                            <button
                              onClick={() => handleCompleteRental(r.id)}
                              disabled={completing === r.id}
                              className="px-4 py-2 bg-[#f59e0b] hover:bg-[#d97706] text-black font-semibold text-sm rounded-lg transition-colors disabled:opacity-50"
                            >
                              {completing === r.id ? 'Completing...' : 'Complete Rental'}
                            </button>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
