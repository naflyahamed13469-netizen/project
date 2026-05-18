import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Banknote, CreditCard } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function BookRental() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [available, setAvailable] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedDriver, setSelectedDriver] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/vehicles/available'),
      api.get('/users', { params: { role: 'driver' } }),
    ])
      .then(([vRes, dRes]) => {
        setAvailable(vRes.data || []);
        setDrivers(dRes.data ? dRes.data.filter((d) => d.role === 'driver') : []);
      })
      .catch((err) => {
        console.error('Error fetching data:', err);
        setAvailable([]);
        setDrivers([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const vehicle = available.find((v) => v.id === parseInt(selectedVehicle));
  const days = startDate && endDate
    ? Math.max(1, Math.ceil((new Date(endDate) - new Date(startDate)) / 86400000))
    : 0;
  const totalCost = vehicle ? Math.round(vehicle.daily_rate * days) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedVehicle || !selectedDriver || !startDate || !endDate) {
      toast.error('Please fill in all fields');
      return;
    }
    if (new Date(endDate) <= new Date(startDate)) {
      toast.error('End date must be after start date');
      return;
    }
    setShowPaymentModal(true);
  };

  const handleConfirmPayment = async () => {
    if (!selectedPaymentMethod) {
      return;
    }
    setProcessingPayment(true);
    try {
      const rentalPayload = {
        customer_id: user?.id,
        driver_id: parseInt(selectedDriver),
        vehicle_id: parseInt(selectedVehicle),
        start_date: startDate,
        end_date: endDate,
        total_cost: totalCost,
      };
      const rentalRes = await api.post('/rentals', rentalPayload);
      const rentalId = rentalRes?.data?.id;

      await api.post('/payments', {
        rental_id: rentalId,
        amount_paid: totalCost,
        payment_method: selectedPaymentMethod,
        transaction_id: `TXN${Date.now()}`,
      });

      await api.post('/receipts', {
        rental_id: rentalId,
        receipt_number: `RCP-${Date.now()}`,
        base_cost: totalCost,
        late_fee: 0,
        final_total: totalCost,
        is_voided: false,
      });

      setSelectedVehicle('');
      setSelectedDriver('');
      setStartDate('');
      setEndDate('');
      setSelectedPaymentMethod('');
      setShowPaymentModal(false);
      toast.success('Booking confirmed!');
      setTimeout(() => {
        window.location.href = '/customer/rentals';
      }, 1500);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) return <div className="page-enter px-8 py-6 text-white/30">Loading...</div>;

  return (
    <div className="page-enter relative min-h-screen overflow-hidden px-4 py-6 sm:px-8">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      >
        <source src="/bmw.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-black/65" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.16),transparent_60%)]" />

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-[1200px] grid-cols-1 gap-6 py-3 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-2xl border border-white/10 bg-[#111]/80 p-6 backdrop-blur-md sm:p-8">
          <h1 className="mb-1 text-[32px] font-syne font-extrabold text-white">Book a Rental</h1>
          <p className="mb-8 text-sm text-white/35">Select a vehicle and driver to get started</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-white/40 mb-1.5">Select Vehicle</label>
              <select
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
                className="w-full px-4 py-3 bg-[#111] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:border-[#f59e0b]/50 transition-colors"
              >
                <option value="" className="bg-[#1a1a1a]">Choose a vehicle</option>
                {available.map((v) => (
                  <option key={v.id} value={v.id} className="bg-[#1a1a1a]">
                    {v.brand} {v.model} - ${v.daily_rate}/day
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-white/40 mb-1.5">Select Driver</label>
              <select
                value={selectedDriver}
                onChange={(e) => setSelectedDriver(e.target.value)}
                className="w-full px-4 py-3 bg-[#111] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:border-[#f59e0b]/50 transition-colors"
              >
                <option value="" className="bg-[#1a1a1a]">Choose a driver</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id} className="bg-[#1a1a1a]">
                    {d.username} - {d.license_type}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/40 mb-1.5">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 bg-[#111] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:border-[#f59e0b]/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-white/40 mb-1.5">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-3 bg-[#111] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:border-[#f59e0b]/50 transition-colors"
                />
              </div>
            </div>

            {totalCost > 0 && (
              <>
                <div className="p-4 bg-[#f59e0b]/[0.06] border border-[#f59e0b]/20 rounded-xl">
                  <p className="text-sm text-white/40">{days} day{days !== 1 ? 's' : ''} x ${vehicle?.daily_rate}/day</p>
                  <p className="text-2xl font-syne font-extrabold text-[#f59e0b] mt-1">Estimated Total: ${totalCost}</p>
                </div>

                <div style={{
                  background: 'rgba(245, 158, 11, 0.08)',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  marginBottom: '16px',
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'flex-start',
                }}>
                  <span style={{ fontSize: '16px', marginTop: '1px' }}>⚠️</span>
                  <div>
                    <p style={{
                      color: '#f59e0b',
                      fontSize: '13px',
                      fontWeight: '600',
                      marginBottom: '4px',
                      fontFamily: 'Syne',
                    }}>
                      Booking Policy
                    </p>
                    <p style={{
                      color: 'rgba(255,255,255,0.55)',
                      fontSize: '12px',
                      lineHeight: '1.6',
                    }}>
                      The full rental cost of <strong style={{ color: 'white' }}>${totalCost}</strong> is
                      charged based on your selected rental period.
                      Early returns do not qualify for a refund -
                      the base cost remains the same regardless of
                      when the vehicle is returned. Additional
                      <strong style={{ color: '#f59e0b' }}> late fees</strong> may
                      apply if the vehicle is returned after the end date.
                    </p>
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-[#f59e0b] hover:bg-[#d97706] text-black font-syne font-bold rounded-lg transition-all duration-150 hover:brightness-110 hover:scale-[1.01] active:scale-[0.98]"
            >
              Confirm Booking
            </button>
          </form>
        </div>

        <aside className="rounded-2xl border border-white/10 bg-[#111]/80 p-5 backdrop-blur-md">
          <h2 className="text-lg font-syne font-bold text-white">Trip Summary</h2>
          <p className="mt-1 text-xs text-white/35">Live booking preview</p>

          <div className="mt-5 space-y-3">
            <div className="rounded-lg border border-white/10 bg-black/25 p-3">
              <p className="text-[11px] text-white/35">Vehicle</p>
              <p className="mt-1 text-sm text-white/90">
                {vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Not selected'}
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/25 p-3">
              <p className="text-[11px] text-white/35">Driver</p>
              <p className="mt-1 text-sm text-white/90">
                {selectedDriver
                  ? (drivers.find((d) => String(d.id) === String(selectedDriver))?.username || `Driver #${selectedDriver}`)
                  : 'Not selected'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-white/10 bg-black/25 p-3">
                <p className="text-[11px] text-white/35">Start</p>
                <p className="mt-1 text-sm text-white/90">{startDate || '-'}</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-black/25 p-3">
                <p className="text-[11px] text-white/35">End</p>
                <p className="mt-1 text-sm text-white/90">{endDate || '-'}</p>
              </div>
            </div>
            <div className="rounded-lg border border-[#f59e0b]/30 bg-[#f59e0b]/10 p-3">
              <p className="text-[11px] text-white/45">Estimated Total</p>
              <p className="mt-1 text-xl font-syne font-extrabold text-[#f59e0b]">
                ${totalCost || 0}
              </p>
              <p className="text-xs text-white/35">
                {days > 0 ? `${days} day${days > 1 ? 's' : ''}` : 'Select dates to calculate'}
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <button
              type="button"
              onClick={() => navigate('/customer/rentals')}
              className="w-full rounded-lg border border-white/20 px-3 py-2 text-left text-sm text-white/75 transition-colors hover:text-white"
            >
              View My Rentals
            </button>
            <button
              type="button"
              onClick={() => navigate('/customer/receipts')}
              className="w-full rounded-lg border border-white/20 px-3 py-2 text-left text-sm text-white/75 transition-colors hover:text-white"
            >
              View Receipts
            </button>
            <button
              type="button"
              onClick={() => navigate('/customer/reviews')}
              className="w-full rounded-lg border border-white/20 px-3 py-2 text-left text-sm text-white/75 transition-colors hover:text-white"
            >
              Leave a Review
            </button>
          </div>
        </aside>
      </div>

      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div
            className="w-full"
            style={{
              background: '#1a1a1a',
              border: '1px solid #2a2a2a',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '420px',
            }}
          >
            <h2 className="font-syne text-2xl font-bold text-white">Select Payment Method</h2>
            <p className="mt-1 text-sm text-white/40">Choose how you&apos;d like to pay</p>

            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={() => setSelectedPaymentMethod('Cash')}
                className="w-full rounded-xl border p-4 text-left transition-all"
                style={{
                  background: '#111',
                  borderColor: selectedPaymentMethod === 'Cash' ? '#f59e0b' : '#2a2a2a',
                  boxShadow: selectedPaymentMethod === 'Cash' ? '0 0 24px rgba(245,158,11,0.2)' : 'none',
                }}
              >
                <div className="flex items-start gap-3">
                  <Banknote size={22} color={selectedPaymentMethod === 'Cash' ? '#f59e0b' : '#9ca3af'} />
                  <div>
                    <p className="font-syne text-lg text-white">Cash</p>
                    <p className="text-sm text-white/40">Pay at pickup</p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPaymentMethod('Credit Card')}
                className="w-full rounded-xl border p-4 text-left transition-all"
                style={{
                  background: '#111',
                  borderColor: selectedPaymentMethod === 'Credit Card' ? '#f59e0b' : '#2a2a2a',
                  boxShadow: selectedPaymentMethod === 'Credit Card' ? '0 0 24px rgba(245,158,11,0.2)' : 'none',
                }}
              >
                <div className="flex items-start gap-3">
                  <CreditCard size={22} color={selectedPaymentMethod === 'Credit Card' ? '#f59e0b' : '#9ca3af'} />
                  <div>
                    <p className="font-syne text-lg text-white">Credit Card</p>
                    <p className="text-sm text-white/40">Pay securely online</p>
                  </div>
                </div>
              </button>
            </div>

            <div className="mt-5 rounded-xl border border-[#2a2a2a] bg-[#111] p-4">
              <p className="text-xs text-white/35">Vehicle</p>
              <p className="text-sm text-white">{vehicle ? `${vehicle.brand} ${vehicle.model}` : '-'}</p>
              <p className="mt-2 text-xs text-white/35">Rental Period</p>
              <p className="text-sm text-white">{startDate} - {endDate}</p>
              <p className="mt-2 text-xs text-white/35">Days</p>
              <p className="text-sm text-white">{days}</p>
              <p className="mt-2 text-xs text-white/35">Total</p>
              <p className="font-syne text-xl font-extrabold text-[#f59e0b]">${totalCost}</p>
            </div>

            <p className="mt-4 text-xs text-white/45">⚠️ Full amount charged regardless of early return</p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  if (processingPayment) return;
                  setShowPaymentModal(false);
                  setSelectedPaymentMethod('');
                }}
                className="rounded-lg border border-[#2a2a2a] bg-transparent px-4 py-3 text-sm font-semibold text-white/80 transition-colors hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedPaymentMethod || processingPayment}
                onClick={handleConfirmPayment}
                className="rounded-lg px-4 py-3 text-sm font-bold transition-colors"
                style={{
                  background: !selectedPaymentMethod || processingPayment ? '#4b5563' : '#f59e0b',
                  color: !selectedPaymentMethod || processingPayment ? 'rgba(255,255,255,0.75)' : '#111',
                }}
              >
                {processingPayment ? 'Processing...' : 'Confirm Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
