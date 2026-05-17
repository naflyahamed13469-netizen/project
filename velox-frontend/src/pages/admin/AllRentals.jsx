import { Fragment, useState, useEffect } from 'react';
import api from '../../api/axios';
import Badge from '../../components/Badge';
import { ChevronDown, ChevronUp } from 'lucide-react';

const filters = ['All', 'Active', 'Completed'];

export default function AllRentals() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    api.get('/rentals')
      .then((res) => setRentals(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = rentals.filter((r) =>
    filter === 'All' ? true : r.status === filter
  );

  if (loading) return <div className="page-enter px-8 py-6 text-white/30">Loading...</div>;

  return (
    <div className="page-enter px-8 py-6">
      <h1 className="font-syne font-extrabold text-[32px] text-white mb-1">All Rentals</h1>
      <p className="text-white/35 text-sm mb-6">Overview of all rental transactions</p>

      <div className="flex gap-1 mb-6 border-b border-[#2a2a2a]">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-5 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              filter === f ? 'border-[#f59e0b] text-[#f59e0b]' : 'border-transparent text-white/35 hover:text-white/60'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1a1a1a] text-white/35">
              <th className="text-left py-3 px-4 font-medium rounded-tl-lg w-8"></th>
              <th className="text-left py-3 px-4 font-medium">ID</th>
              <th className="text-left py-3 px-4 font-medium">Customer</th>
              <th className="text-left py-3 px-4 font-medium">Driver</th>
              <th className="text-left py-3 px-4 font-medium">Vehicle</th>
              <th className="text-left py-3 px-4 font-medium">Start</th>
              <th className="text-left py-3 px-4 font-medium">End</th>
              <th className="text-left py-3 px-4 font-medium">Total</th>
              <th className="text-left py-3 px-4 font-medium">Status</th>
              <th className="text-left py-3 px-4 font-medium rounded-tr-lg">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => {
              const isExpanded = expanded === r.id;
              return (
                <Fragment key={r.id}>
                  <tr
                    className={`border-b border-white/[0.04] hover:bg-[#f59e0b]/[0.05] transition-colors cursor-pointer ${i % 2 === 0 ? 'bg-[#111]' : 'bg-[#0d0d0d]'}`}
                    onClick={() => setExpanded(isExpanded ? null : r.id)}
                  >
                    <td className="py-3 px-4 text-white/20">
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </td>
                    <td className="py-3 px-4 text-white/40">{r.id}</td>
                    <td className="py-3 px-4 text-white/90">{r.customer_name || r.customer?.name}</td>
                    <td className="py-3 px-4 text-white/40">{r.driver_name || r.driver?.name}</td>
                    <td className="py-3 px-4 text-white/40">{r.vehicleName || (r.brand && r.model ? `${r.brand} ${r.model}` : '')}</td>
                    <td className="py-3 px-4 text-white/30">{r.start_date}</td>
                    <td className="py-3 px-4 text-white/30">{r.end_date}</td>
                    <td className="py-3 px-4 text-[#f59e0b]">${r.total_cost}</td>
                    <td className="py-3 px-4">
                      <Badge text={r.status} color={r.status === 'Active' ? 'green' : 'gray'} />
                    </td>
                    <td className="py-3 px-4 text-white/20 text-xs">Details</td>
                  </tr>
                  {isExpanded && (
                    <tr className="bg-[#1a1a1a]/50">
                      <td colSpan={10} className="py-4 px-8">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-white/25 text-xs mb-1">Customer Email</p>
                            <p className="text-white/60">{r.customer_email || r.customerEmail || r.customer?.email || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-white/25 text-xs mb-1">Driver License</p>
                            <p className="text-white/60">{r.driver_license || r.driverLicense || r.driver?.licenseNumber || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-white/25 text-xs mb-1">Vehicle Number</p>
                            <p className="text-white/60">{r.vehicle_number || r.vehicleNumber || r.vehicle?.vehicleNumber || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-white/25 text-xs mb-1">Daily Rate</p>
                            <p className="text-[#f59e0b]">${r.daily_rate ?? r.dailyRate ?? r.vehicle?.dailyRate ?? 0}/day</p>
                          </div>
                          <div>
                            <p className="text-white/25 text-xs mb-1">Duration</p>
                            <p className="text-white/60">{Math.ceil((new Date(r.end_date) - new Date(r.start_date)) / 86400000)} days</p>
                          </div>
                          <div>
                            <p className="text-white/25 text-xs mb-1">Vehicle Type</p>
                            <p className="text-white/60">{r.type || r.vehicle?.type || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-white/25 text-xs mb-1">Vehicle Year</p>
                            <p className="text-white/60">{r.year || r.vehicle?.year || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-white/25 text-xs mb-1">Total Cost</p>
                            <p className="text-[#f59e0b] font-semibold">${r.total_cost}</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
