import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    nationalId: '',
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Full name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    if (!form.phone.trim()) errs.phone = 'Phone number is required';
    if (!form.password) errs.password = 'Password is required';
    if (form.password && form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (!form.confirmPassword) errs.confirmPassword = 'Please confirm your password';
    if (form.password && form.confirmPassword && form.password !== form.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }
    if (!form.nationalId.trim()) errs.nationalId = 'National ID is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/register', {
        username: form.name,
        email: form.email,
        phone_number: form.phone,
        password: form.password,
        national_id: form.nationalId,
      });
      toast.success('Account created! Please sign in.');
      navigate('/');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe' },
    { name: 'email', label: 'Email', type: 'email', placeholder: 'you@mail.com' },
    { name: 'phone', label: 'Phone Number', type: 'text', placeholder: '+1-555-0000' },
    { name: 'nationalId', label: 'National ID', type: 'text', placeholder: 'NID-0000' },
  ];

  return (
    <div className="min-h-screen flex">
      <div
        className="hidden lg:flex lg:w-1/2 relative items-end justify-center p-12"
        style={{ background: 'linear-gradient(135deg, #111 0%, #1a1a1a 100%)' }}
      >
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative z-10 w-full">
          <h1 className="font-syne font-extrabold text-[56px] leading-none">
            <span className="text-white">Rent-a-</span><span className="text-[#f59e0b]">vroom!</span>
          </h1>
          <p className="text-white/35 text-lg mt-3 font-dm">Premium Vehicle Rentals</p>
          <div className="flex gap-3 mt-10">
            {['Zero Hidden Fees', '24/7 Support', '100+ Vehicles'].map((pill) => (
              <span
                key={pill}
                className="px-4 py-2 text-sm text-[#f59e0b] border border-[#f59e0b]/30 rounded-full"
              >
                {pill}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[#080808]">
        <div className="w-full max-w-[400px]">
          <h2 className="font-syne font-extrabold text-[32px] text-white">Create Account</h2>
          <p className="text-white/35 text-sm mt-1 mb-8">Join Rent-a-vroom! and start renting</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(({ name, label, type, placeholder }) => (
              <div key={name}>
                <label className="block text-sm text-white/40 mb-1.5">{label}</label>
                <input
                  name={name}
                  type={type}
                  value={form[name]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white placeholder-white/20 font-dm text-sm focus:outline-none focus:border-[#f59e0b]/50 transition-colors"
                />
                {errors[name] && (
                  <p className="text-red-400 text-xs mt-1">{errors[name]}</p>
                )}
              </div>
            ))}

            <div>
              <label className="block text-sm text-white/40 mb-1.5">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
                  className="w-full px-4 py-3 pr-11 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white placeholder-white/20 font-dm text-sm focus:outline-none focus:border-[#f59e0b]/50 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-white/40 mb-1.5">Confirm Password</label>
              <input
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white placeholder-white/20 font-dm text-sm focus:outline-none focus:border-[#f59e0b]/50 transition-colors"
              />
              {errors.confirmPassword && (
                <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#f59e0b] text-black font-syne font-bold rounded-lg transition-all duration-150 hover:brightness-110 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-white/25 mt-6">
            Already have an account?{' '}
            <Link to="/" className="text-[#f59e0b] hover:text-[#d97706] transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
