import { useState, useEffect } from 'react';
import api from '../../api/axios';
import Badge from '../../components/Badge';
import toast from 'react-hot-toast';

export default function AdminReceipts() {
  const [receiptList, setReceiptList] = useState([]);
  const [rentalMap, setRentalMap] = useState({});
  const [vehicleMap, setVehicleMap] = useState({});
  const [userMap, setUserMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [viewReceipt, setViewReceipt] = useState(null);
  const [lateFeeModal, setLateFeeModal] = useState(null);
  const [lateFeeAmount, setLateFeeAmount] = useState('');
  const [voidModal, setVoidModal] = useState(null);

  const fetchReceipts = () => {
    Promise.all([
      api.get('/receipts'),
      api.get('/rentals'),
      api.get('/vehicles'),
      api.get('/users'),
    ])
      .then(([receiptsRes, rentalsRes, vehiclesRes, usersRes]) => {
        setReceiptList(receiptsRes.data || []);
        setRentalMap(Object.fromEntries((rentalsRes.data || []).map((r) => [Number(r.id), r])));
        setVehicleMap(Object.fromEntries((vehiclesRes.data || []).map((v) => [Number(v.id), v])));
        setUserMap(Object.fromEntries((usersRes.data || []).map((u) => [Number(u.id), u])));
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReceipts(); }, []);

  const getReceiptNo = (rc) => rc?.receiptNumber || rc?.receipt_no || `RCPT-${rc?.id ?? ''}`;
  const getRentalId = (rc) => rc?.rentalId ?? rc?.rental_id ?? '-';
  const getRental = (rc) => rentalMap[Number(getRentalId(rc))];
  const getVehicleName = (rc) =>
    rc?.vehicleName || rc?.vehicle_name || rc?.vehicle || [rc?.brand, rc?.model].filter(Boolean).join(' ') || rc?.vehicle_number || '';
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
  const getResolvedVehicle = (rc) => {
    const byReceipt = getVehicleName(rc);
    if (byReceipt) return byReceipt;
    const rental = getRental(rc);
    const vehicle = rental ? vehicleMap[Number(rental.vehicle_id)] : null;
    return vehicle ? [vehicle.brand, vehicle.model].filter(Boolean).join(' ') : '';
  };
  const getRentalPeriod = (rc) => {
    const rental = getRental(rc);
    const start = rc?.startDate || rc?.start_date || rental?.start_date || rental?.startDate;
    const end = rc?.endDate || rc?.end_date || rental?.end_date || rental?.endDate;
    return `${start || '-'} - ${end || '-'}`;
  };

  const applyLateFee = async () => {
    const amount = Number(lateFeeAmount);
    if (!amount || amount <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    try {
      await api.put(`/receipts/${lateFeeModal}/late-fee`, { amount, late_fee: amount });
      toast.success('Late fee applied');
      fetchReceipts();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to apply late fee');
    }
    setLateFeeModal(null);
    setLateFeeAmount('');
  };

  const voidReceipt = async () => {
    try {
      let ok = false;
      const attempts = [
        () => api.put(`/receipts/${voidModal}/void`),
        () => api.patch(`/receipts/${voidModal}/void`),
        () => api.post(`/receipts/${voidModal}/void`),
        () => api.put(`/receipts/void/${voidModal}`),
        () => api.patch(`/receipts/void/${voidModal}`),
        () => api.post(`/receipts/void/${voidModal}`),
      ];

      for (const attempt of attempts) {
        try {
          await attempt();
          ok = true;
          break;
        } catch {
          // Try next route variant.
        }
      }

      if (!ok) {
        throw new Error('Void endpoint unavailable');
      }
      toast.success('Receipt voided');
      fetchReceipts();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to void receipt');
    }
    setVoidModal(null);
  };

  const receiptDetail = viewReceipt ? receiptList.find((r) => r.id === viewReceipt) || null : null;

  if (loading) return <div className="page-enter px-8 py-6 text-white/30">Loading...</div>;

  return (
    <div className="page-enter px-8 py-6">
      <h1 className="font-syne font-extrabold text-[32px] text-white mb-1">Receipts</h1>
      <p className="text-white/35 text-sm mb-6">Manage all rental receipts</p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1a1a1a] text-white/35">
              <th className="text-left py-3 px-4 font-medium rounded-tl-lg">Receipt No.</th>
              <th className="text-left py-3 px-4 font-medium">Rental ID</th>
              <th className="text-left py-3 px-4 font-medium">Base Cost</th>
              <th className="text-left py-3 px-4 font-medium">Late Fee</th>
              <th className="text-left py-3 px-4 font-medium">Final Total</th>
              <th className="text-left py-3 px-4 font-medium">Voided</th>
              <th className="text-left py-3 px-4 font-medium rounded-tr-lg">Actions</th>
            </tr>
          </thead>
          <tbody>
            {receiptList.map((rc, i) => (
              <tr key={rc.id} className={`border-b border-white/[0.04] hover:bg-[#f59e0b]/[0.05] transition-colors ${i % 2 === 0 ? 'bg-[#111]' : 'bg-[#0d0d0d]'}`}>
                <td className="py-3 px-4 text-white/90 font-mono text-xs">{getReceiptNo(rc)}</td>
                <td className="py-3 px-4 text-white/40">{getRentalId(rc)}</td>
                <td className="py-3 px-4 text-white/40">${getBaseCost(rc)}</td>
                <td className="py-3 px-4 text-amber-400">${getLateFee(rc)}</td>
                <td className="py-3 px-4 text-[#f59e0b] font-semibold">${getFinalTotal(rc)}</td>
                <td className="py-3 px-4">
                  <Badge text={getVoided(rc) ? 'Voided' : 'Active'} color={getVoided(rc) ? 'red' : 'green'} />
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <button onClick={() => setViewReceipt(rc.id)} className="px-2.5 py-1 text-xs border border-[#f59e0b]/40 text-[#f59e0b] rounded-lg hover:bg-[#f59e0b]/10 transition-colors">View</button>
                    {!getVoided(rc) && (
                      <>
                        <button onClick={() => setLateFeeModal(rc.id)} className="px-2.5 py-1 text-xs border border-white/20 text-white/40 rounded-lg hover:text-white hover:border-white/40 transition-colors">Late Fee</button>
                        <button onClick={() => setVoidModal(rc.id)} className="px-2.5 py-1 text-xs border border-red-500/40 text-red-400 rounded-lg hover:bg-red-500/10 transition-colors">Void</button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {lateFeeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 max-w-sm w-full mx-4">
            <h3 className="font-syne font-bold text-lg text-white mb-4">Apply Late Fee</h3>
            <input
              type="number"
              value={lateFeeAmount}
              onChange={(e) => setLateFeeAmount(e.target.value)}
              placeholder="Enter fee amount"
              className="w-full px-4 py-3 bg-[#111] border border-[#2a2a2a] rounded-lg text-white text-sm focus:outline-none focus:border-[#f59e0b]/50 transition-colors mb-4"
            />
            <div className="flex gap-3 justify-end">
              <button onClick={() => { setLateFeeModal(null); setLateFeeAmount(''); }} className="px-4 py-2 text-sm text-white/40 border border-[#2a2a2a] rounded-lg hover:text-white transition-colors">Cancel</button>
              <button onClick={applyLateFee} className="px-4 py-2 text-sm bg-[#f59e0b] hover:bg-[#d97706] text-black font-semibold rounded-lg transition-colors">Apply</button>
            </div>
          </div>
        </div>
      )}

      {voidModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 max-w-sm w-full mx-4">
            <h3 className="font-syne font-bold text-lg text-white mb-2">Void Receipt</h3>
            <p className="text-sm text-white/40 mb-6">Are you sure? This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setVoidModal(null)} className="px-4 py-2 text-sm text-white/40 border border-[#2a2a2a] rounded-lg hover:text-white transition-colors">Cancel</button>
              <button onClick={voidReceipt} className="px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors">Void</button>
            </div>
          </div>
        </div>
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
                <span className="text-white/80">{getResolvedVehicle(receiptDetail) || (getRentalId(receiptDetail) !== '-' ? `Rental #${getRentalId(receiptDetail)}` : '-')}</span>
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
              <button onClick={() => setViewReceipt(null)} className="flex-1 py-2.5 text-sm text-white/40 border border-[#2a2a2a] rounded-lg hover:text-white transition-colors">Close</button>
              <button onClick={() => window.print()} className="flex-1 py-2.5 text-sm bg-[#f59e0b] hover:bg-[#d97706] text-black font-semibold rounded-lg transition-colors">Print</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
