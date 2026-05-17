import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Badge from '../../components/Badge';
import { Search } from 'lucide-react';

const defaultVehicleImage = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800';
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

export default function Vehicles() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('All');
  const [brandFilter, setBrandFilter] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/vehicles')
      .then((res) => setVehicles(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const types = ['All', ...vehicleTypes];
  const brands = ['All', ...new Set(vehicles.map((v) => v.brand))];

  const filtered = vehicles.filter((v) => {
    if (typeFilter !== 'All' && v.type !== typeFilter) return false;
    if (brandFilter !== 'All' && v.brand !== brandFilter) return false;
    if (minPrice && v.daily_rate < Number(minPrice)) return false;
    if (maxPrice && v.daily_rate > Number(maxPrice)) return false;
    if (search && !`${v.brand} ${v.model}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="page-enter px-8 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden animate-pulse"
            >
              <div className="h-[180px] bg-[#111]" />
              <div className="p-5 space-y-3">
                <div className="h-6 w-2/3 bg-white/[0.08] rounded" />
                <div className="h-5 w-1/3 bg-white/[0.08] rounded" />
                <div className="flex gap-2">
                  <div className="h-6 w-16 bg-white/[0.08] rounded" />
                  <div className="h-6 w-20 bg-white/[0.08] rounded" />
                </div>
                <div className="h-10 w-full bg-white/[0.08] rounded-lg mt-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter px-8 py-6">
      <div style={{
        position: 'relative',
        width: '100%',
        height: '220px',
        borderRadius: '16px',
        overflow: 'hidden',
        marginBottom: '24px',
      }}>

        {/* Background Video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center center',
            zIndex: 0,
          }}
        >
          <source src="/bmw1.mp4" type="video/mp4" />
        </video>

        {/* Dark gradient overlay - darker at edges */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.75) 100%)',
          zIndex: 1,
        }}/>

        {/* Bottom fade */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '64px',
          background: 'linear-gradient(to bottom, transparent, #080808)',
          zIndex: 2,
        }}/>

        {/* Content */}
        <div style={{
          position: 'absolute',
          inset: 0,
          zIndex: 3,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: '0 36px',
        }}>
          
          {/* Top label */}
          <div style={{
            background: 'rgba(245,158,11,0.15)',
            border: '1px solid rgba(245,158,11,0.4)',
            borderRadius: '999px',
            padding: '3px 12px',
            fontSize: '10px',
            color: '#f59e0b',
            fontFamily: 'DM Sans',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            marginBottom: '10px',
          }}>
            Premium Fleet
          </div>

          {/* Main title */}
          <h1 style={{
            fontFamily: 'Syne',
            fontSize: '40px',
            fontWeight: '800',
            color: 'white',
            margin: 0,
            lineHeight: '1.1',
            marginBottom: '8px',
          }}>
            Find Your <span style={{color:'#f59e0b'}}>Perfect</span> Ride
          </h1>

          {/* Subtitle */}
          <p style={{
            fontFamily: 'DM Sans',
            fontSize: '14px',
            color: 'rgba(255,255,255,0.55)',
            margin: 0,
            marginBottom: '14px',
          }}>
            Premium vehicles at unbeatable rates
          </p>

          {/* Stats row */}
          <div style={{
            display: 'flex',
            gap: '18px',
          }}>
            {[
              { label: 'Vehicles', value: '50+' },
              { label: 'Daily Rate from', value: '$18' },
              { label: 'Available Now', value: `${vehicles.filter(v => v.available).length}+` },
            ].map((stat, i) => (
              <div key={i} style={{
                display: 'flex',
                flexDirection: 'column',
              }}>
                <span style={{
                  fontFamily: 'Syne',
                  fontSize: '19px',
                  fontWeight: '700',
                  color: '#f59e0b',
                }}>{stat.value}</span>
                <span style={{
                  fontFamily: 'DM Sans',
                  fontSize: '10px',
                  color: 'rgba(255,255,255,0.4)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Amber accent line at bottom */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: '36px',
          width: '64px',
          height: '3px',
          background: '#f59e0b',
          zIndex: 4,
          borderRadius: '999px',
        }}/>

      </div>

      <div className="flex flex-wrap items-end gap-3 mb-8 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs text-white/30 mb-1">Search</label>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Brand or model..."
              className="w-full pl-9 pr-3 py-2.5 bg-[#111] border border-[#2a2a2a] rounded-lg text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#f59e0b]/50 transition-colors"
            />
          </div>
        </div>
        <div className="min-w-[120px]">
          <label className="block text-xs text-white/30 mb-1">Type</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full py-2.5 px-3 bg-[#111] border border-[#2a2a2a] rounded-lg text-sm text-white focus:outline-none focus:border-[#f59e0b]/50 transition-colors"
          >
            {types.map((t) => (
              <option key={t} value={t} className="bg-[#1a1a1a]">{t}</option>
            ))}
          </select>
        </div>
        <div className="min-w-[120px]">
          <label className="block text-xs text-white/30 mb-1">Brand</label>
          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="w-full py-2.5 px-3 bg-[#111] border border-[#2a2a2a] rounded-lg text-sm text-white focus:outline-none focus:border-[#f59e0b]/50 transition-colors"
          >
            {brands.map((b) => (
              <option key={b} value={b} className="bg-[#1a1a1a]">{b}</option>
            ))}
          </select>
        </div>
        <div className="min-w-[80px]">
          <label className="block text-xs text-white/30 mb-1">Min $</label>
          <input
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="0"
            className="w-full py-2.5 px-3 bg-[#111] border border-[#2a2a2a] rounded-lg text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#f59e0b]/50 transition-colors"
          />
        </div>
        <div className="min-w-[80px]">
          <label className="block text-xs text-white/30 mb-1">Max $</label>
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="999"
            className="w-full py-2.5 px-3 bg-[#111] border border-[#2a2a2a] rounded-lg text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#f59e0b]/50 transition-colors"
          />
        </div>
        <button
          onClick={() => { setTypeFilter('All'); setBrandFilter('All'); setMinPrice(''); setMaxPrice(''); setSearch(''); }}
          className="px-5 py-2.5 bg-[#f59e0b] hover:bg-[#d97706] text-black font-semibold text-sm rounded-lg transition-colors"
        >
          Reset
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((v) => (
          <div
            key={v.id}
            className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden hover:translate-y-[-2px] hover:shadow-[0_12px_24px_rgba(245,158,11,0.12)] transition-all duration-300 group"
          >
            <img
              src={v.image_url || defaultVehicleImage}
              alt={v.brand}
              style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '12px 12px 0 0' }}
              onError={(e) => { e.target.src = defaultVehicleImage; }}
            />
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#111] border-b border-[#2a2a2a]">
              <span className="text-xs text-white/30 bg-white/[0.06] px-2 py-0.5 rounded">{v.type}</span>
              <Badge text={v.available ? 'Available' : 'Rented'} color={v.available ? 'green' : 'red'} />
            </div>
            <div className="p-5">
              <h3 className="font-syne font-bold text-[20px] text-white/90">
                {v.brand} {v.model}
              </h3>
              <p className="text-[#f59e0b] font-syne font-extrabold text-lg mt-1">${v.daily_rate}<span className="text-sm text-white/25 font-normal">/day</span></p>
              <div className="flex gap-2 mt-3">
                <span className="text-xs text-white/30 bg-white/[0.06] px-2 py-1 rounded">{v.year}</span>
                <span className="text-xs text-white/30 bg-white/[0.06] px-2 py-1 rounded">{v.type}</span>
              </div>
              {v.available ? (
                <button onClick={() => navigate('/customer/book')} className="mt-4 w-full py-2.5 bg-[#f59e0b] hover:bg-[#d97706] text-black font-semibold text-sm rounded-lg transition-colors">
                  Book Now
                </button>
              ) : (
                <button disabled className="mt-4 w-full py-2.5 bg-white/[0.06] text-white/20 text-sm rounded-lg cursor-not-allowed">
                  Unavailable
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
