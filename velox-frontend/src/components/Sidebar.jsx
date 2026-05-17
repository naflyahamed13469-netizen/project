import { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Car,
  CalendarPlus,
  ClipboardList,
  Star,
  Receipt,
  Users,
  CreditCard,
  Truck,
  LogOut,
  Camera,
  Eye,
  Trash2,
  Upload,
  Check,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
} from 'lucide-react';

const USER_IMAGES_STORAGE_KEY = 'velox_user_images';
const imageUploadRoles = new Set(['admin', 'customer', 'driver']);

const customerLinks = [
  { to: '/customer/vehicles', label: 'Vehicles', icon: Car },
  { to: '/customer/book', label: 'Book Rental', icon: CalendarPlus },
  { to: '/customer/rentals', label: 'My Rentals', icon: ClipboardList },
  { to: '/customer/reviews', label: 'Reviews', icon: Star },
  { to: '/customer/receipts', label: 'Receipts', icon: Receipt },
  { to: '/customer/settings', label: 'Settings', icon: Settings },
];

const adminLinks = [
  { to: '/admin/vehicles', label: 'Vehicles', icon: Car },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/rentals', label: 'Rentals', icon: ClipboardList },
  { to: '/admin/payments', label: 'Payments', icon: CreditCard },
  { to: '/admin/receipts', label: 'Receipts', icon: Receipt },
  { to: '/admin/reviews', label: 'Reviews', icon: Star },
];

const driverLinks = [
  { to: '/driver/rentals', label: 'Assigned Rentals', icon: Truck },
];

export default function Sidebar({ collapsed = false, onToggleCollapse }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [userImage, setUserImage] = useState('');
  const [pendingImage, setPendingImage] = useState('');
  const [photoManagerOpen, setPhotoManagerOpen] = useState(false);
  const [inspectImage, setInspectImage] = useState('');

  const links =
    user?.role === 'admin'
      ? adminLinks
      : user?.role === 'driver'
      ? driverLinks
      : customerLinks;

  const initials = user?.name
    ?.split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase() || '?';

  useEffect(() => {
    if (!user?.id) {
      setUserImage('');
      return;
    }
    try {
      const images = JSON.parse(localStorage.getItem(USER_IMAGES_STORAGE_KEY) || '{}');
      setUserImage(images[user.id] || '');
    } catch {
      setUserImage('');
    }
  }, [user?.id]);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';

    if (!file || !file.type.startsWith('image/') || !user?.id) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const imageData = typeof reader.result === 'string' ? reader.result : '';
      if (!imageData) {
        return;
      }
      setPendingImage(imageData);
    };
    reader.readAsDataURL(file);
  };

  const savePendingPhoto = () => {
    if (!pendingImage || !user?.id) return;
    try {
      const images = JSON.parse(localStorage.getItem(USER_IMAGES_STORAGE_KEY) || '{}');
      images[user.id] = pendingImage;
      localStorage.setItem(USER_IMAGES_STORAGE_KEY, JSON.stringify(images));
      setUserImage(pendingImage);
      setPendingImage('');
      setPhotoManagerOpen(false);
    } catch {
      // Ignore localStorage parse/write failures.
    }
  };

  const deleteCurrentPhoto = () => {
    if (!user?.id) return;
    try {
      const images = JSON.parse(localStorage.getItem(USER_IMAGES_STORAGE_KEY) || '{}');
      delete images[user.id];
      localStorage.setItem(USER_IMAGES_STORAGE_KEY, JSON.stringify(images));
      setUserImage('');
    } catch {
      // Ignore localStorage parse/write failures.
    }
  };

  const closePhotoManager = () => {
    setPhotoManagerOpen(false);
    setPendingImage('');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
    <aside className={`fixed top-0 left-0 h-screen bg-[#111111] flex flex-col z-50 transition-all duration-300 overflow-hidden ${collapsed ? 'w-[84px]' : 'w-[260px]'}`}>
      <div className={`pt-8 pb-6 flex items-center ${collapsed ? 'px-3 justify-center' : 'px-6 gap-2'}`}>
        <span className="text-[#f59e0b] font-syne font-extrabold text-[24px] leading-none shrink-0">R</span>
        {!collapsed && (
        <span className="font-syne font-extrabold text-[20px] text-white leading-none">
          Rent-a-<span className="text-[#f59e0b]">vroom!</span>
        </span>
        )}
      </div>

      <div className={`pb-6 border-b border-white/[0.06] ${collapsed ? 'px-2' : 'px-4'}`}>
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="relative shrink-0">
            <div className="w-16 h-16 rounded-full bg-[#f59e0b]/15 overflow-hidden flex items-center justify-center text-[#f59e0b] font-syne font-bold text-base">
              {userImage ? (
                <img src={userImage} alt={`${user?.name || 'User'} profile`} className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>
            {imageUploadRoles.has(user?.role) && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <button
                  type="button"
                  onClick={() => setPhotoManagerOpen(true)}
                  className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#f59e0b] text-black flex items-center justify-center hover:bg-[#d97706] transition-colors"
                  title="Manage profile image"
                >
                  <Camera size={14} />
                </button>
              </>
            )}
          </div>
          {!collapsed && (
          <div className="min-w-0">
            <p className="text-white text-sm font-medium leading-tight truncate">{user?.name}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 text-[11px] font-medium bg-[#f59e0b]/15 text-[#f59e0b] rounded-full capitalize">
              {user?.role}
            </span>
          </div>
          )}
        </div>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              `flex items-center ${collapsed ? 'justify-center px-2' : 'gap-3 px-6'} py-2.5 text-sm font-dm transition-all duration-200 border-l-[3px] whitespace-nowrap ${
                isActive
                  ? 'border-l-[#f59e0b] text-[#f59e0b] bg-[#f59e0b]/[0.08]'
                  : 'border-l-transparent text-white/50 hover:translate-x-1 hover:text-white/80'
              }`
            }
          >
            <Icon size={18} className="shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className={`pb-3 ${collapsed ? 'px-2' : 'px-4'}`}>
        <button
          type="button"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          onClick={onToggleCollapse}
          className={`flex items-center ${collapsed ? 'justify-center w-full px-2' : 'gap-3 w-full px-3'} py-2.5 text-sm text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors duration-200`}
        >
          {collapsed ? <PanelLeftOpen size={18} className="shrink-0" /> : <PanelLeftClose size={18} className="shrink-0" />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>

      <div className={`${collapsed ? 'px-2 pb-6' : 'px-4 pb-6'}`}>
        <button
          title={collapsed ? 'Logout' : undefined}
          onClick={handleLogout}
          className={`flex items-center ${collapsed ? 'justify-center w-full px-2' : 'gap-3 w-full px-3'} py-2.5 text-sm text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors duration-200 whitespace-nowrap`}
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
    {photoManagerOpen && imageUploadRoles.has(user?.role) && (
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 px-4">
        <div className="w-full max-w-lg rounded-xl border border-[#2a2a2a] bg-[#111] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-syne text-lg font-bold text-white">Manage Profile Photo</h3>
            <button
              type="button"
              onClick={closePhotoManager}
              className="rounded-md p-1 text-white/40 transition-colors hover:text-white"
            >
              <X size={16} />
            </button>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] p-3">
              <p className="mb-2 text-xs text-white/40">Current Photo</p>
              {userImage ? (
                <div className="flex items-center gap-3">
                  <img src={userImage} alt="Current profile" className="h-14 w-14 rounded-md object-cover" />
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setInspectImage(userImage)} className="flex items-center gap-1 rounded-md border border-[#2a2a2a] px-2 py-1 text-xs text-white/70 hover:text-white">
                      <Eye size={12} /> Inspect
                    </button>
                    <button type="button" onClick={deleteCurrentPhoto} className="flex items-center gap-1 rounded-md border border-red-500/40 px-2 py-1 text-xs text-red-300 hover:text-red-200">
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-white/35">No current photo</p>
              )}
            </div>

            <div className="rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] p-3">
              <p className="mb-2 text-xs text-white/40">New Photo</p>
              {pendingImage ? (
                <div className="flex items-center gap-3">
                  <img src={pendingImage} alt="New profile" className="h-14 w-14 rounded-md object-cover" />
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setInspectImage(pendingImage)} className="flex items-center gap-1 rounded-md border border-[#2a2a2a] px-2 py-1 text-xs text-white/70 hover:text-white">
                      <Eye size={12} /> Inspect
                    </button>
                    <button type="button" onClick={() => setPendingImage('')} className="flex items-center gap-1 rounded-md border border-red-500/40 px-2 py-1 text-xs text-red-300 hover:text-red-200">
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-white/35">No new photo selected</p>
              )}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1 rounded-lg border border-[#2a2a2a] px-3 py-2 text-sm text-white/80 hover:text-white"
            >
              <Upload size={14} /> Choose Photo
            </button>
            <button
              type="button"
              disabled={!pendingImage}
              onClick={savePendingPhoto}
              className="flex items-center gap-1 rounded-lg bg-[#f59e0b] px-3 py-2 text-sm font-semibold text-black disabled:opacity-50"
            >
              <Check size={14} /> Save New Photo
            </button>
            <button
              type="button"
              onClick={closePhotoManager}
              className="rounded-lg border border-[#2a2a2a] px-3 py-2 text-sm text-white/60 hover:text-white"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )}

    {inspectImage && (
      <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 p-4">
        <div className="relative flex flex-col items-center">
          <button
            type="button"
            onClick={() => setInspectImage('')}
            className="absolute -right-3 -top-3 rounded-full bg-[#111] p-1 text-white/70 hover:text-white"
          >
            <X size={16} />
          </button>
          <img
            src={inspectImage}
            alt="Profile preview"
            className="h-64 w-64 rounded-full border-2 border-[#f59e0b]/60 object-cover shadow-[0_0_40px_rgba(245,158,11,0.2)] sm:h-72 sm:w-72 md:h-80 md:w-80"
          />
        </div>
      </div>
    )}
    </>
  );
}
