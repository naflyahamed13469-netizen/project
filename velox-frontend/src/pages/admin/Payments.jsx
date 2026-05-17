import { useState, useEffect } from 'react';
import api from '../../api/axios';
import StatCard from '../../components/StatCard';
import Badge from '../../components/Badge';
import { CreditCard, DollarSign, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [receiptLateFeeByRental, setReceiptLateFeeByRental] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/payments'), api.get('/receipts')])
      .then(([paymentsRes, receiptsRes]) => {
        console.log('Payments loaded:', paymentsRes.data);
        setPayments(paymentsRes.data || []);

        const lateFeeMap = (receiptsRes.data || []).reduce((acc, rc) => {
          const rentalId = Number(rc?.rental_id ?? rc?.rentalId);
          const lateFee = Number(rc?.late_fee ?? rc?.lateFee ?? 0);
          if (rentalId) {
            acc[rentalId] = lateFee;
          }
          return acc;
        }, {});
        setReceiptLateFeeByRental(lateFeeMap);
      })
      .catch((err) => {
        console.error('Error fetching payments/receipts:', err);
        setPayments([]);
        setReceiptLateFeeByRental({});
      })
      .finally(() => setLoading(false));
  }, []);

  const getLateFee = (payment) => {
    return Number(payment?.late_fee ?? payment?.late_fee_amount ?? payment?.lateFee ?? 0);
  };
  const isLateFeePayment = (payment) =>
    String(payment?.payment_method || '').toLowerCase().includes('late fee');
  const getRentalId = (payment) => Number(payment?.rental_id ?? payment?.rentalId ?? 0);
  const getPaymentAmount = (payment) => Number(payment?.amount_paid ?? 0);
  const rentalHasLateFeePayment = payments.reduce((acc, payment) => {
    const rentalId = getRentalId(payment);
    if (rentalId && isLateFeePayment(payment)) {
      acc[rentalId] = true;
    }
    return acc;
  }, {});
  const lateFeePaidByRental = payments.reduce((acc, payment) => {
    const rentalId = getRentalId(payment);
    if (!rentalId || !isLateFeePayment(payment)) return acc;
    acc[rentalId] = (acc[rentalId] || 0) + getPaymentAmount(payment) + getLateFee(payment);
    return acc;
  }, {});
  const primaryNonLatePaymentByRental = payments.reduce((acc, payment) => {
    const rentalId = getRentalId(payment);
    if (!rentalId || isLateFeePayment(payment)) return acc;
    const current = acc[rentalId];
    if (!current || Number(payment?.id ?? 0) > Number(current?.id ?? 0)) {
      acc[rentalId] = payment;
    }
    return acc;
  }, {});
  const getFallbackReceiptLateFee = (payment) => {
    const rentalId = getRentalId(payment);
    if (!rentalId || isLateFeePayment(payment)) return 0;
    const primary = primaryNonLatePaymentByRental[rentalId];
    if (!primary || Number(primary?.id ?? 0) !== Number(payment?.id ?? 0)) return 0;
    const receiptLateFee = Number(receiptLateFeeByRental[rentalId] ?? 0);
    const alreadyPaidAsLateFee = Number(lateFeePaidByRental[rentalId] ?? 0);
    return Math.max(0, receiptLateFee - alreadyPaidAsLateFee);
  };
  const getPaymentRevenue = (payment) =>
    getPaymentAmount(payment) + getLateFee(payment) + getFallbackReceiptLateFee(payment);

  const totalRevenue = payments.reduce((sum, p) => sum + getPaymentRevenue(p), 0);
  const avgPayment = payments.length > 0 ? Math.round(totalRevenue / payments.length) : 0;
  const revenueByDate = payments.reduce((acc, payment) => {
    const date = new Date(payment.payment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    acc[date] = (acc[date] || 0) + getPaymentRevenue(payment);
    return acc;
  }, {});

  const chartData = Object.entries(revenueByDate).map(([date, revenue]) => ({
    date,
    revenue
  }));

  if (loading) return <div className="page-enter px-8 py-6 text-white/30">Loading...</div>;

  return (
    <div className="page-enter px-8 py-6">
      <h1 className="font-syne font-extrabold text-[32px] text-white mb-1">Payments</h1>
      <p className="text-white/35 text-sm mb-6">Track all payment transactions</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard title="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} icon={DollarSign} color="amber" />
        <StatCard title="Total Payments" value={payments.length} icon={CreditCard} color="amber" />
        <StatCard title="Average Payment" value={`$${avgPayment}`} icon={TrendingUp} color="amber" />
      </div>

      <div style={{
        background: '#1a1a1a',
        border: '1px solid #2a2a2a',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
      }}>
        <h3 style={{
          fontFamily: 'Syne',
          fontSize: '16px',
          fontWeight: '700',
          marginBottom: '20px',
          color: 'white'
        }}>Revenue Growth</h3>
        
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a"/>
            <XAxis
              dataKey="date"
              stroke="#ffffff40"
              tick={{ fill: '#ffffff40', fontSize: 12 }}
            />
            <YAxis
              stroke="#ffffff40"
              tick={{ fill: '#ffffff40', fontSize: 12 }}
              tickFormatter={(v) => '$' + v}
            />
            <Tooltip
              contentStyle={{
                background: '#111111',
                border: '1px solid #2a2a2a',
                borderRadius: '8px',
                color: 'white'
              }}
              formatter={(value) => ['$' + value, 'Revenue']}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#f59e0b"
              strokeWidth={2}
              fill="url(#revenueGrad)"
              dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#f59e0b' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1a1a1a] text-white/35">
              <th className="text-left py-3 px-4 font-medium rounded-tl-lg">Payment ID</th>
              <th className="text-left py-3 px-4 font-medium">Rental ID</th>
              <th className="text-left py-3 px-4 font-medium">Amount</th>
              <th className="text-left py-3 px-4 font-medium">Method</th>
              <th className="text-left py-3 px-4 font-medium">Transaction ID</th>
              <th className="text-left py-3 px-4 font-medium rounded-tr-lg">Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p, i) => (
              <tr key={p.id ?? p.transaction_id ?? `rental-${p.rental_id}`} className={`border-b border-white/[0.04] hover:bg-[#f59e0b]/[0.05] transition-colors ${i % 2 === 0 ? 'bg-[#111]' : 'bg-[#0d0d0d]'}`}>
                <td className="py-3 px-4 text-white/40">{p.id ?? 'Auto'}</td>
                <td className="py-3 px-4 text-white/40">{p.rental_id}</td>
                <td className="py-3 px-4 text-[#f59e0b] font-semibold">${getPaymentRevenue(p)}</td>
                <td className="py-3 px-4">
                  <Badge
                    text={p.payment_method}
                    color={p.payment_method === 'Credit Card' ? 'blue' : p.payment_method === 'M-Pesa' ? 'green' : 'gray'}
                  />
                </td>
                <td className="py-3 px-4 text-white/30 font-mono text-xs">{p.transaction_id}</td>
                <td className="py-3 px-4 text-white/30">{p.payment_date ? new Date(p.payment_date).toLocaleDateString() : 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {payments.length === 0 && (
          <div className="text-center py-12 text-white/30">No payments yet.</div>
        )}
      </div>
    </div>
  );
}
