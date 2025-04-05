import React, { useState } from 'react';
import axios from 'axios';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    building: '',
    floor: '',
    flat: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

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

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      setLoading(false);
      return;
    }

    if (formData.phone.length !== 10) {
      setError("Phone number must be 10 digits");
      setLoading(false);
      return;
    }

    try {
      // Generate code from building and flat
      const code = `${formData.building}${formData.flat}`;
      
      const response = await axios.post('http://localhost:4242/api/register', {
        ...formData,
        code
      });

      if (response.data.success) {
        setSuccess(true);
        setFormData({
          name: '',
          building: '',
          floor: '',
          flat: '',
          phone: '',
          password: '',
          confirmPassword: ''
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full py-10">
      <div className="flex flex-col items-center justify-center w-full max-w-[1240px]">
        <h2 className="font-poppins font-semibold xs:text-[48px] text-[40px] text-white xs:leading-[76.8px] leading-[66.8px] w-full text-center mb-10">
          Register
        </h2>
        <div className="bg-black-gradient-2 rounded-[20px] p-8 w-full max-w-md">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-lg font-medium text-dimWhite">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
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
                value={formData.building}
                onChange={handleChange}
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
                value={formData.floor}
                onChange={handleChange}
                className="w-full p-3 bg-white/10 border border-dimWhite rounded-[10px] text-white placeholder-gray-400 focus:outline-none focus:border-[#00f6ff]"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-lg font-medium text-dimWhite">
                Flat Number
              </label>
              <input
                type="text"
                name="flat"
                value={formData.flat}
                onChange={handleChange}
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

            <div className="space-y-2">
              <label className="block text-lg font-medium text-dimWhite">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
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
              {loading ? 'Registering...' : 'Register'}
            </button>

            {success && (
              <div className="text-green-400 text-center bg-green-900/20 p-3 rounded-[10px]">
                Registration successful! You can now login.
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm; 