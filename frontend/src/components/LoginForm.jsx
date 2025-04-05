import React, { useState } from 'react';
import axios from 'axios';

const LoginForm = ({ onConfirm }) => {
  const [formData, setFormData] = useState({
    phone: '',
    password: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [confirmed, setConfirmed] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setUserData(null);

    try {
      const response = await axios.post('http://localhost:4242/api/login', formData);

      if (response.data.success) {
        setUserData(response.data.user);
        localStorage.setItem('token', response.data.token);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    setConfirmed(true);
    // Store user data in localStorage
    localStorage.setItem('userData', JSON.stringify(userData));
    onConfirm(userData);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full py-10">
      <div className="flex flex-col items-center justify-center w-full max-w-[1240px]">
        <h2 className="font-poppins font-semibold xs:text-[48px] text-[40px] text-white xs:leading-[76.8px] leading-[66.8px] w-full text-center mb-10">
          Login
        </h2>
        <div className="bg-black-gradient-2 rounded-[20px] p-8 w-full max-w-md">
          {!userData ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-lg font-medium text-dimWhite">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  pattern="[0-9]{10}"
                  className="w-full p-3 bg-white/10 border border-dimWhite rounded-[10px] text-white placeholder-gray-400 focus:outline-none focus:border-[#00f6ff]"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-lg font-medium text-dimWhite">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full p-3 bg-white/10 border border-dimWhite rounded-[10px] text-white placeholder-gray-400 focus:outline-none focus:border-[#00f6ff]"
                  required
                />
              </div>

              {error && (
                <div className="text-red-500 text-sm bg-red-900/20 p-3 rounded-[10px]">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-6 rounded-[10px] text-white font-medium text-lg transition-all duration-300 ${
                  loading 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-blue-gradient hover:shadow-lg hover:shadow-blue-500/50'
                }`}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-white mb-4">Your Details</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-dimWhite">Name</p>
                  <p className="text-white text-lg">{userData.name}</p>
                </div>
                <div>
                  <p className="text-dimWhite">Building</p>
                  <p className="text-white text-lg">{userData.building}</p>
                </div>
                <div>
                  <p className="text-dimWhite">Floor</p>
                  <p className="text-white text-lg">{userData.floor}</p>
                </div>
                <div>
                  <p className="text-dimWhite">Flat</p>
                  <p className="text-white text-lg">{userData.flat}</p>
                </div>
                <div>
                  <p className="text-dimWhite">Phone</p>
                  <p className="text-white text-lg">{userData.phone}</p>
                </div>
                <div>
                  <p className="text-dimWhite">Code</p>
                  <p className="text-white text-lg">{userData.code}</p>
                </div>
              </div>
              {!confirmed ? (
                <button
                  onClick={handleConfirm}
                  className="w-full py-3 px-6 rounded-[10px] text-white font-medium text-lg bg-blue-gradient hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300"
                >
                  Confirm Details
                </button>
              ) : (
                <div className="text-green-400 text-center bg-green-900/20 p-3 rounded-[10px]">
                  Details confirmed! Redirecting...
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginForm; 