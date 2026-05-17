import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const PREFS_KEY = 'velox_customer_prefs';

export default function Settings() {
  const { user, updateUser, logout } = useAuth();

  const [profile, setProfile] = useState({
    username: '',
    email: '',
    phone_number: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [prefs, setPrefs] = useState({
    compactTables: false,
    emailAlerts: true,
    showReceiptInsights: true,
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    setProfile({
      username: user.name || '',
      email: user.email || '',
      phone_number: user.phone_number || '',
    });
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) {
      try {
        setPrefs((prev) => ({ ...prev, ...JSON.parse(raw) }));
      } catch {
        // ignore malformed local storage
      }
    }

    api.get('/users')
      .then((res) => {
        const full = (res.data || []).find((u) => u.id === user.id);
        if (full) {
          setProfile({
            username: full.username || user.name || '',
            email: full.email || '',
            phone_number: full.phone_number || '',
          });
          updateUser({ name: full.username, email: full.email, phone_number: full.phone_number });
        }
      })
      .catch(() => {});
  }, [user?.id]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!profile.username || !profile.email) {
      toast.error('Name and email are required');
      return;
    }
    setSavingProfile(true);
    try {
      const res = await api.put(`/users/${user.id}/profile`, profile);
      const updated = res.data?.user;
      if (updated) {
        updateUser({
          name: updated.username,
          email: updated.email,
          phone_number: updated.phone_number,
        });
      }
      toast.success('Profile updated');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error('Fill all password fields');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setSavingPassword(true);
    try {
      await api.put(`/users/${user.id}/password`, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password updated. Please sign in again.');
      logout();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to update password');
    } finally {
      setSavingPassword(false);
    }
  };

  const togglePref = (key) => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    localStorage.setItem(PREFS_KEY, JSON.stringify(next));
  };

  return (
    <div className="page-enter px-8 py-6 space-y-6">
      <div>
        <h1 className="font-syne font-extrabold text-[32px] text-white">Settings</h1>
        <p className="text-white/35 text-sm mt-1">Manage your profile, password, and preferences</p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="rounded-xl border border-white/10 bg-[#111]/80 p-6">
          <h2 className="text-lg font-syne font-bold text-white">Profile</h2>
          <p className="text-xs text-white/35 mt-1">Update your basic customer account details</p>

          <form onSubmit={handleProfileSave} className="mt-5 space-y-4">
            <div>
              <label className="block text-sm text-white/40 mb-1.5">Full Name</label>
              <input
                value={profile.username}
                onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white text-sm focus:outline-none focus:border-[#f59e0b]/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-white/40 mb-1.5">Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white text-sm focus:outline-none focus:border-[#f59e0b]/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-white/40 mb-1.5">Phone</label>
              <input
                value={profile.phone_number}
                onChange={(e) => setProfile({ ...profile, phone_number: e.target.value })}
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white text-sm focus:outline-none focus:border-[#f59e0b]/50 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={savingProfile}
              className="w-full py-3 bg-[#f59e0b] hover:bg-[#d97706] text-black font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              {savingProfile ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </section>

        <section className="rounded-xl border border-white/10 bg-[#111]/80 p-6">
          <h2 className="text-lg font-syne font-bold text-white">Security</h2>
          <p className="text-xs text-white/35 mt-1">Change your account password</p>

          <form onSubmit={handlePasswordSave} className="mt-5 space-y-4">
            <div>
              <label className="block text-sm text-white/40 mb-1.5">Current Password</label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white text-sm focus:outline-none focus:border-[#f59e0b]/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-white/40 mb-1.5">New Password</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white text-sm focus:outline-none focus:border-[#f59e0b]/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-white/40 mb-1.5">Confirm New Password</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white text-sm focus:outline-none focus:border-[#f59e0b]/50 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={savingPassword}
              className="w-full py-3 bg-[#f59e0b] hover:bg-[#d97706] text-black font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              {savingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </section>
      </div>

      <section className="rounded-xl border border-white/10 bg-[#111]/80 p-6">
        <h2 className="text-lg font-syne font-bold text-white">Preferences</h2>
        <p className="text-xs text-white/35 mt-1">Customize your customer experience</p>
        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
          <button
            type="button"
            onClick={() => togglePref('compactTables')}
            className={`rounded-lg border px-4 py-3 text-left transition-colors ${prefs.compactTables ? 'border-[#f59e0b]/50 bg-[#f59e0b]/10 text-[#f59e0b]' : 'border-white/15 text-white/70 hover:text-white'}`}
          >
            <p className="text-sm font-medium">Compact Tables</p>
            <p className="text-xs opacity-80 mt-1">Reduce row spacing in tables</p>
          </button>
          <button
            type="button"
            onClick={() => togglePref('emailAlerts')}
            className={`rounded-lg border px-4 py-3 text-left transition-colors ${prefs.emailAlerts ? 'border-[#f59e0b]/50 bg-[#f59e0b]/10 text-[#f59e0b]' : 'border-white/15 text-white/70 hover:text-white'}`}
          >
            <p className="text-sm font-medium">Email Alerts</p>
            <p className="text-xs opacity-80 mt-1">Receive booking and receipt alerts</p>
          </button>
          <button
            type="button"
            onClick={() => togglePref('showReceiptInsights')}
            className={`rounded-lg border px-4 py-3 text-left transition-colors ${prefs.showReceiptInsights ? 'border-[#f59e0b]/50 bg-[#f59e0b]/10 text-[#f59e0b]' : 'border-white/15 text-white/70 hover:text-white'}`}
          >
            <p className="text-sm font-medium">Receipt Insights</p>
            <p className="text-xs opacity-80 mt-1">Show insights on receipts page</p>
          </button>
        </div>
      </section>
    </div>
  );
}
