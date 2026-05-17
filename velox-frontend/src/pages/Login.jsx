import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { User, Shield, Truck, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

const roles = [
  { key: 'customer', label: 'Customer', icon: User },
  { key: 'driver', label: 'Driver', icon: Truck },
  { key: 'admin', label: 'Admin', icon: Shield },
];

export default function Login() {
  const [selectedRole, setSelectedRole] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRole) {
      toast.error('Please select a role');
      return;
    }
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data;
      if (user.role !== selectedRole) {
        toast.error(`This account is registered as ${user.role}. Please select the correct role.`);
        return;
      }
      login(user, token);
      toast.success('Welcome back!');
      const role = user.role;
      navigate(
        role === 'admin'
          ? '/admin/vehicles'
          : role === 'driver'
          ? '/driver/rentals'
          : '/customer/vehicles'
      );
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full overflow-hidden bg-[#080808] lg:flex">
      <style>{`
        .sign-in-shine::before {
          content: '';
          position: absolute;
          top: 0;
          left: -80%;
          width: 50%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent);
          transform: skewX(-18deg);
          transition: left 0.55s ease;
        }

        .sign-in-shine:hover::before {
          left: 130%;
        }
      `}</style>

      <div
        className="hidden lg:block"
        style={{
          position: 'relative',
          width: '50%',
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
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
              objectPosition: 'center',
              zIndex: 0,
            }}
          >
            <source
              src="/bmw2.mp4"
              type="video/mp4"
            />
          </video>

          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.52) 40%, rgba(0,0,0,0.18) 72%, rgba(0,0,0,0) 100%)',
            zIndex: 1,
          }} />

          <div style={{
            position: 'relative',
            zIndex: 2,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '48px',
            paddingRight: '64px',
          }}>
            <h1 style={{ fontFamily: 'Syne', fontSize: '56px', fontWeight: '800', color: 'white', marginBottom: '8px', lineHeight: 1.05, maxWidth: 'min(100%, 740px)', overflowWrap: 'anywhere' }}>
              Rent-a-<span style={{ color: '#f59e0b' }}>vroom!</span>
            </h1>
            <p style={{ fontFamily: 'DM Sans', color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', marginBottom: '32px' }}>
              The road is yours.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {['24/7 Support', 'Verified Fleet', 'Secure Payment'].map((f) => (
                <span key={f} style={{
                  padding: '8px 16px',
                  borderRadius: '999px',
                  border: '1px solid rgba(245,158,11,0.4)',
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '13px',
                  fontFamily: 'DM Sans',
                  background: 'rgba(245,158,11,0.05)',
                  borderLeft: '3px solid #f59e0b'
                }}>{f}</span>
              ))}
            </div>
            <p style={{ marginTop: '14px', fontFamily: 'DM Sans', fontSize: '16px', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>
              Developed by WD1.1.02
            </p>
          </div>
        </div>
      </div>

      <div className="relative flex min-h-screen flex-1 items-center justify-center bg-[#0d0d0d] px-6 py-12">
        <div className="absolute left-0 right-0 top-0 h-[2px] bg-[linear-gradient(90deg,transparent,#f59e0b,transparent)]" />
        <div className="w-full max-w-[400px]">
          <h2 className="font-syne font-extrabold text-[40px] text-white">Welcome Back</h2>
          <p className="text-white/40 text-sm mt-2 mb-8">Select your role and sign in to continue.</p>

          <div className="grid grid-cols-3 gap-3 mb-7">
            {roles.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedRole(key)}
                className={`flex min-h-[104px] flex-col items-center justify-center gap-3 rounded-xl border px-3 py-5 transition-all duration-300 ${
                  selectedRole === key
                    ? 'border-[#f59e0b] bg-[linear-gradient(135deg,rgba(245,158,11,0.1),transparent)] shadow-[0_0_28px_rgba(245,158,11,0.16)]'
                    : 'border-[#2a2a2a] bg-[#1a1a1a] hover:border-[#f59e0b]/50 hover:shadow-[0_0_28px_rgba(245,158,11,0.14)]'
                }`}
              >
                <Icon
                  size={26}
                  className={selectedRole === key ? 'text-[#f59e0b]' : 'text-white/30'}
                />
                <span
                  className={`text-sm font-medium ${
                    selectedRole === key ? 'text-[#f59e0b]' : 'text-white/40'
                  }`}
                >
                  {label}
                </span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="h-[52px] w-full rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] pl-12 pr-4 text-sm text-white placeholder-white/20 transition-all duration-300 focus:border-[#f59e0b]/70 focus:shadow-[0_0_0_3px_rgba(245,158,11,0.15)] focus:outline-none"
              />
            </div>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="h-[52px] w-full rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] pl-12 pr-12 text-sm text-white placeholder-white/20 transition-all duration-300 focus:border-[#f59e0b]/70 focus:shadow-[0_0_0_3px_rgba(245,158,11,0.15)] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="sign-in-shine relative h-[52px] w-full overflow-hidden rounded-lg bg-[linear-gradient(135deg,#f59e0b,#d97706)] font-syne font-bold text-black transition-all duration-300 hover:scale-[1.02] hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-white/25 mt-6">
            New customer?{' '}
            <Link to="/register" className="text-[#f59e0b] transition-colors hover:text-[#d97706] hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
