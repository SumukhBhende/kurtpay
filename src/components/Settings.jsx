import React, { useState } from 'react';
import axios from 'axios';

const Settings = ({ userData, onUpdateUser }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    name: userData?.name || '',
    building: userData?.building || '',
    floor: userData?.floor || '',
    flat: userData?.flat || '',
    phone: userData?.phone || ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        'http://localhost:4242/api/user/profile',
        profileData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setSuccess('Profile updated successfully');
        // Update the user data in localStorage and parent component
        const updatedUser = { ...userData, ...profileData };
        localStorage.setItem('userData', JSON.stringify(updatedUser));
        onUpdateUser(updatedUser);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        'http://localhost:4242/api/user/password',
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setSuccess('Password updated successfully');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full py-10">
      <div className="flex flex-col items-center justify-center w-full max-w-[1240px]">
        <h2 className="font-poppins font-semibold xs:text-[48px] text-[40px] text-white xs:leading-[76.8px] leading-[66.8px] w-full text-center mb-10">
          Settings
        </h2>

        <div className="bg-black-gradient-2 rounded-[20px] p-8 w-full max-w-md">
          <div className="flex mb-6 border-b border-dimWhite/20">
            <button
              className={`px-4 py-2 text-lg font-medium ${
                activeTab === 'profile'
                  ? 'text-[#00f6ff] border-b-2 border-[#00f6ff]'
                  : 'text-dimWhite hover:text-white'
              }`}
              onClick={() => setActiveTab('profile')}
            >
              Profile Details
            </button>
            <button
              className={`px-4 py-2 text-lg font-medium ${
                activeTab === 'password'
                  ? 'text-[#00f6ff] border-b-2 border-[#00f6ff]'
                  : 'text-dimWhite hover:text-white'
              }`}
              onClick={() => setActiveTab('password')}
            >
              Change Password
            </button>
          </div>

          {error && (
            <div className="text-red-500 text-sm bg-red-900/20 p-3 rounded-[10px] mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="text-green-400 text-sm bg-green-900/20 p-3 rounded-[10px] mb-4">
              {success}
            </div>
          )}

          {activeTab === 'profile' ? (
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-lg font-medium text-dimWhite">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={profileData.name}
                  onChange={handleProfileChange}
                  className="w-full p-3 bg-white/10 border border-dimWhite rounded-[10px] text-white placeholder-gray-400 focus:outline-none focus:border-[#00f6ff]"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-lg font-medium text-dimWhite">
                  Building
                </label>
                <input
                  type="text"
                  name="building"
                  value={profileData.building}
                  onChange={handleProfileChange}
                  className="w-full p-3 bg-white/10 border border-dimWhite rounded-[10px] text-white placeholder-gray-400 focus:outline-none focus:border-[#00f6ff]"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-lg font-medium text-dimWhite">
                  Floor
                </label>
                <input
                  type="text"
                  name="floor"
                  value={profileData.floor}
                  onChange={handleProfileChange}
                  className="w-full p-3 bg-white/10 border border-dimWhite rounded-[10px] text-white placeholder-gray-400 focus:outline-none focus:border-[#00f6ff]"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-lg font-medium text-dimWhite">
                  Flat
                </label>
                <input
                  type="text"
                  name="flat"
                  value={profileData.flat}
                  onChange={handleProfileChange}
                  className="w-full p-3 bg-white/10 border border-dimWhite rounded-[10px] text-white placeholder-gray-400 focus:outline-none focus:border-[#00f6ff]"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-lg font-medium text-dimWhite">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleProfileChange}
                  pattern="[0-9]{10}"
                  className="w-full p-3 bg-white/10 border border-dimWhite rounded-[10px] text-white placeholder-gray-400 focus:outline-none focus:border-[#00f6ff]"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-6 rounded-[10px] text-white font-medium text-lg transition-all duration-300 ${
                  loading
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-blue-gradient hover:shadow-lg hover:shadow-blue-500/50'
                }`}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-lg font-medium text-dimWhite">
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full p-3 bg-white/10 border border-dimWhite rounded-[10px] text-white placeholder-gray-400 focus:outline-none focus:border-[#00f6ff]"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-lg font-medium text-dimWhite">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full p-3 bg-white/10 border border-dimWhite rounded-[10px] text-white placeholder-gray-400 focus:outline-none focus:border-[#00f6ff]"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-lg font-medium text-dimWhite">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full p-3 bg-white/10 border border-dimWhite rounded-[10px] text-white placeholder-gray-400 focus:outline-none focus:border-[#00f6ff]"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-6 rounded-[10px] text-white font-medium text-lg transition-all duration-300 ${
                  loading
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-blue-gradient hover:shadow-lg hover:shadow-blue-500/50'
                }`}
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings; 