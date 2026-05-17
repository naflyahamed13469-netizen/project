import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/Badge';
import EmptyState from '../../components/EmptyState';
import { FileText } from 'lucide-react';

const PREFS_KEY = 'velox_customer_prefs';

export default function Receipts() {
  const { user } = useAuth();
  const [receiptList, setReceiptList] = useState([]);
  const [rentalMap, setRentalMap] = useState({});
  const [vehicleMap, setVehicleMap] = useState({});
  const [userMap, setUserMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [viewReceipt, setViewReceipt] = useState(null);
  const [showInsights, setShowInsights] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setShowInsights(parsed.showReceiptInsights !== false);
      } catch {
        setShowInsights(true);
      }
    }

    Promise.all([
      api.get('/receipts'),
      api.get('/rentals'),
      api.get('/vehicles'),
      api.get('/users'),
    ])
      .then(([receiptsRes, rentalsRes, vehiclesRes, usersRes]) => {
        setReceiptList(receiptsRes.data || []);

        const rentals = rentalsRes.data || [];
        const rentalsById = Object.fromEntries(rentals.map((r) => [Number(r.id), r]));
        setRentalMap(rentalsById);

        const vehicles = vehiclesRes.data || [];
        const vehiclesById = Object.fromEntries(vehicles.map((v) => [Number(v.id), v]));
        setVehicleMap(vehiclesById);

        const users = usersRes.data || [];
        const usersById = Object.fromEntries(users.map((u) => [Number(u.id), u]));
        setUserMap(usersById);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const getReceiptNo = (rc) => rc?.receiptNumber || rc?.receipt_no || `RCPT-${rc?.id ?? ''}`;
  const getVehicleName = (rc) =>
    rc?.vehicleName || rc?.vehicle_name || rc?.vehicle || [rc?.brand, rc?.model].filter(Boolean).join(' ') || rc?.vehicle_number || '';
  const getRentalId = (rc) => rc?.rentalId ?? rc?.rental_id ?? null;
  const getRental = (rc) => rentalMap[Number(getRentalId(rc))];
  const getRentalSummary = (rc) => {
    const rid = getRentalId(rc);
    const rental = getRental(rc);
    const vehicleFromRental = rental
      ? [vehicleMap[Number(rental.vehicle_id)]?.brand, vehicleMap[Number(rental.vehicle_id)]?.model].filter(Boolean).join(' ')
      : '';
    const vehicle = getVehicleName(rc) || vehicleFromRental;
    if (rid && vehicle) return `#${rid} - ${vehicle}`;
    if (rid) return `#${rid}`;
    if (vehicle) return vehicle;
    return '-';
  };
  const getBaseCost = (rc) => rc?.baseCost ?? rc?.base_cost ?? 0;
  const getLateFee = (rc) => rc?.lateFee ?? rc?.late_fee ?? 0;
  const getFinalTotal = (rc) => rc?.finalTotal ?? rc?.final_total ?? 0;
  const getVoided = (rc) => Boolean(rc?.isVoided ?? rc?.is_voided);
  const getCustomerName = (rc) => {
    const byReceipt = rc?.customerName || rc?.customer_name || rc?.customer?.name;
    if (byReceipt) return byReceipt;
    const customerId = Number(rc?.customer_id);
    return userMap[customerId]?.username || (customerId ? `Customer #${customerId}` : '-');
  };
  const getRentalPeriod = (rc) => {
    const rental = getRental(rc);
    const start = rc?.startDate || rc?.start_date || rental?.start_date || rental?.startDate;
    const end = rc?.endDate || rc?.end_date || rental?.end_date || rental?.endDate;
    return `${start || '-'} - ${end || '-'}`;
  };

  const myReceipts = receiptList.filter((rc) => rc.customer_id === user?.id);
  const receiptDetail = viewReceipt ? receiptList.find((r) => r.id === viewReceipt) || null : null;
  const activeReceipts = myReceipts.filter((r) => !getVoided(r));
  const voidedReceipts = myReceipts.filter((r) => getVoided(r));
  const totalPaid = myReceipts.reduce((sum, rc) => sum + Number(getFinalTotal(rc) || 0), 0);
  const totalLateFees = myReceipts.reduce((sum, rc) => sum + Number(getLateFee(rc) || 0), 0);
  const avgReceipt = myReceipts.length ? Math.round(totalPaid / myReceipts.length) : 0;
  const latestByRental = [...myReceipts].sort((a, b) => Number(getRentalId(b) || 0) - Number(getRentalId(a) || 0))[0] || null;
  const vehicleCount = myReceipts.reduce((acc, rc) => {
    const name = getRentalSummary(rc);
    if (!name || name === '-') return acc;
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});
  const topVehicle = Object.entries(vehicleCount).sort((a, b) => b[1] - a[1])[0];

  if (loading) return <div className="page-enter px-8 py-6 text-white/30">Loading...</div>;

  return (
    <div className="page-enter px-8 py-6">
      <h1 className="font-syne font-extrabold text-[32px] text-white mb-1">My Receipts</h1>
      <p className="text-white/35 text-sm mb-6">View your rental receipts</p>

      {myReceipts.length === 0 ? (
        <EmptyState icon={FileText} message="Receipts will appear after completed rentals." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#1a1a1a] text-white/35">
                <th className="text-left py-3 px-4 font-medium rounded-tl-lg">Receipt No.</th>
                <th className="text-left py-3 px-4 font-medium">Rental</th>
                <th className="text-left py-3 px-4 font-medium">Base Cost</th>
                <th className="text-left py-3 px-4 font-medium">Late Fee</th>
                <th className="text-left py-3 px-4 font-medium">Final Total</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
                <th className="text-left py-3 px-4 font-medium rounded-tr-lg">Action</th>
              </tr>
            </thead>
            <tbody>
              {myReceipts.map((rc, i) => (
                <tr
                  key={rc.id}
                  className={`border-b border-white/[0.04] hover:bg-[#f59e0b]/[0.05] transition-colors ${
                    i % 2 === 0 ? 'bg-[#111]' : 'bg-[#0d0d0d]'
                  }`}
                >
                  <td className="py-3 px-4 text-white/90 font-mono text-xs">{getReceiptNo(rc)}</td>
                  <td className="py-3 px-4 text-white/40">{getRentalSummary(rc)}</td>
                  <td className="py-3 px-4 text-white/40">${getBaseCost(rc)}</td>
                  <td className="py-3 px-4 text-amber-400">${getLateFee(rc)}</td>
                  <td className="py-3 px-4 text-[#f59e0b] font-semibold">${getFinalTotal(rc)}</td>
                  <td className="py-3 px-4">
                    <Badge text={getVoided(rc) ? 'Voided' : 'Active'} color={getVoided(rc) ? 'red' : 'green'} />
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => setViewReceipt(rc.id)}
                      className="px-3 py-1.5 text-xs border border-[#f59e0b]/40 text-[#f59e0b] rounded-lg hover:bg-[#f59e0b]/10 transition-colors"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {myReceipts.length > 0 && showInsights && (
        <section className="mt-8 space-y-4">
          <div>
            <h2 className="text-xl font-syne font-bold text-white">Receipt Insights</h2>
            <p className="mt-1 text-xs text-white/35">Quick summary of your receipt activity</p>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-white/10 bg-[#111]/80 p-4">
              <p className="text-[11px] text-white/35">Total Paid</p>
              <p className="mt-1 text-2xl font-syne font-extrabold text-[#f59e0b]">${totalPaid}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#111]/80 p-4">
              <p className="text-[11px] text-white/35">Late Fees Paid</p>
              <p className="mt-1 text-2xl font-syne font-extrabold text-amber-400">${totalLateFees}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#111]/80 p-4">
              <p className="text-[11px] text-white/35">Receipt Status</p>
              <p className="mt-1 text-sm text-white/85">Active: {activeReceipts.length}</p>
              <p className="text-sm text-white/55">Voided: {voidedReceipts.length}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#111]/80 p-4">
              <p className="text-[11px] text-white/35">Average Receipt</p>
              <p className="mt-1 text-2xl font-syne font-extrabold text-white">${avgReceipt}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-[#111]/80 p-4">
              <p className="text-[11px] text-white/35">Most Rented Vehicle</p>
              <p className="mt-1 text-sm text-white/90">{topVehicle ? topVehicle[0] : '-'}</p>
              <p className="mt-1 text-xs text-white/45">{topVehicle ? `${topVehicle[1]} receipt${topVehicle[1] > 1 ? 's' : ''}` : 'No vehicle data yet'}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#111]/80 p-4">
              <p className="text-[11px] text-white/35">Latest Rental Window</p>
              <p className="mt-1 text-sm text-white/90">{latestByRental ? getRentalPeriod(latestByRental) : '-'}</p>
              <p className="mt-1 text-xs text-white/45">{latestByRental ? getRentalSummary(latestByRental) : 'No recent rental found'}</p>
            </div>
          </div>
        </section>
      )}

      {receiptDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-8 max-w-[500px] w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-syne font-extrabold text-xl text-white">
                VELO<span className="text-[#f59e0b]">X</span><span className="text-[#f59e0b] text-[8px] align-top ml-0.5">.</span>
              </h2>
              <span className="text-sm text-white/25 font-medium tracking-wider">RECEIPT</span>
            </div>
            <div className="h-px bg-[#f59e0b]/30 mb-6" />

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-white/35">Receipt No.</span>
                <span className="text-white/80 font-mono">{getReceiptNo(receiptDetail)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/35">Customer</span>
                <span className="text-white/80">{getCustomerName(receiptDetail)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/35">Vehicle</span>
                <span className="text-white/80">{getRentalSummary(receiptDetail)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/35">Rental Period</span>
                <span className="text-white/80">{getRentalPeriod(receiptDetail)}</span>
              </div>
            </div>

            <div className="h-px bg-white/[0.06] mb-4" />

            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-white/35">Base Cost</span>
                <span className="text-white/60">${getBaseCost(receiptDetail)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/35">Late Fee</span>
                <span className="text-amber-400">${getLateFee(receiptDetail)}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-white/[0.06]">
                <span className="text-white/60 font-semibold">Total</span>
                <span className="text-[#f59e0b] font-syne font-extrabold text-lg">${getFinalTotal(receiptDetail)}</span>
              </div>
            </div>

            <p className="text-center text-xs text-white/20 mb-6">Thank you for choosing Rent-a-vroom!</p>

            <div className="flex gap-3">
              <button
                onClick={() => setViewReceipt(null)}
                className="flex-1 py-2.5 text-sm text-white/40 border border-[#2a2a2a] rounded-lg hover:text-white transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 text-sm bg-[#f59e0b] hover:bg-[#d97706] text-black font-semibold rounded-lg transition-colors"
              >
                Print
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
