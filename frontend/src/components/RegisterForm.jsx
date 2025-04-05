import React, { useState } from 'react';
import axios from 'axios';
import styles from '../style';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    building: '',
    floor: '',
    flat: '',
    phone: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Validate form data
      if (!formData.name || !formData.building || !formData.floor || 
          !formData.flat || !formData.phone || !formData.password) {
        throw new Error('All fields are required');
      }

      if (formData.phone.length !== 10 || !/^\d+$/.test(formData.phone)) {
        throw new Error('Phone number must be 10 digits');
      }

      console.log('Sending registration data:', { ...formData, password: '[HIDDEN]' });

      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/register`, formData);
      console.log('Registration response:', response.data);

      setSuccess('Registration successful! You can now login.');
      setFormData({
        name: '',
        building: '',
        floor: '',
        flat: '',
        phone: '',
        password: ''
      });
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || err.message || 'Registration failed');
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

        <form onSubmit={handleSubmit} className="w-full max-w-md bg-black-gradient-2 rounded-[20px] p-8">
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

          <div className="space-y-4">
            <div>
              <label className="block text-lg font-medium text-dimWhite mb-2">
                Name
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

            <div>
              <label className="block text-lg font-medium text-dimWhite mb-2">
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

            <div>
              <label className="block text-lg font-medium text-dimWhite mb-2">
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

            <div>
              <label className="block text-lg font-medium text-dimWhite mb-2">
                Flat
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

            <div>
              <label className="block text-lg font-medium text-dimWhite mb-2">
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

            <div>
              <label className="block text-lg font-medium text-dimWhite mb-2">
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

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-6 mt-6 rounded-[10px] text-white font-medium text-lg transition-all duration-300 ${
                loading
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-blue-gradient hover:shadow-lg hover:shadow-blue-500/50'
              }`}
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm; 