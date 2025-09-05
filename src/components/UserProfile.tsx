import React, { useState, useEffect } from 'react';

const DEFAULT_PROFILE = {
  name: '',
  email: '',
  preferences: {
    darkMode: false,
    notifications: true,
  },
  defaultView: null,
};

const UserProfile: React.FC = () => {
  const [profile, setProfile] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('userProfile') || 'null') || DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  });
  const [recentActivity, setRecentActivity] = useState<string[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    // Load recent activity from localStorage or backend
    setRecentActivity(JSON.parse(localStorage.getItem('recentActivity') || '[]'));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    if (name in profile.preferences) {
      setProfile((prev: any) => ({
        ...prev,
        preferences: { ...prev.preferences, [name]: type === 'checkbox' ? checked : value },
      }));
    } else {
      setProfile((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = () => {
    localStorage.setItem('userProfile', JSON.stringify(profile));
    setMsg('Profile saved!');
    setTimeout(() => setMsg(null), 2000);
  };

  const handleSetDefaultView = () => {
    // Save current dashboard view as default (stub, can be extended)
    localStorage.setItem('defaultDashboardView', JSON.stringify(profile.defaultView));
    setMsg('Default dashboard view set!');
    setTimeout(() => setMsg(null), 2000);
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">User Profile</h2>
      <div className="mb-4">
        <label className="block mb-1 font-semibold">Name</label>
        <input
          name="name"
          value={profile.name}
          onChange={handleChange}
          className="border rounded px-3 py-1 w-full"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-semibold">Email</label>
        <input
          name="email"
          value={profile.email}
          onChange={handleChange}
          className="border rounded px-3 py-1 w-full"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-semibold">Preferences</label>
        <div className="flex gap-4">
          <label>
            <input
              type="checkbox"
              name="darkMode"
              checked={profile.preferences.darkMode}
              onChange={handleChange}
            />{' '}
            Dark Mode
          </label>
          <label>
            <input
              type="checkbox"
              name="notifications"
              checked={profile.preferences.notifications}
              onChange={handleChange}
            />{' '}
            Notifications
          </label>
        </div>
      </div>
      <button className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700" onClick={handleSave}>
        Save Profile
      </button>
      <button className="ml-2 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300" onClick={handleSetDefaultView}>
        Set Current Dashboard as Default
      </button>
      {msg && <div className="mt-2 text-green-600 text-sm">{msg}</div>}
      <div className="mt-6">
        <h3 className="font-semibold mb-2">Recent Activity</h3>
        {recentActivity.length === 0 ? (
          <div className="text-xs text-gray-500">No recent activity.</div>
        ) : (
          <ul className="text-xs list-disc ml-6">
            {recentActivity.slice(-10).reverse().map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default UserProfile; 