import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PaymentForm = () => {
  const [amount, setAmount] = useState(1000); // Amount in INR
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError(null);

      // Create order on backend
      const { data: order } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/create-order`, {
        amount,
        currency: 'INR'
      });

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'KurtPay',
        description: 'Payment for your purchase',
        order_id: order.id,
        handler: async function (response) {
          try {
            // Verify payment on backend
            const verifyResponse = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/verify-payment`, {
              order_id: response.razorpay_order_id,
              payment_id: response.razorpay_payment_id,
              signature: response.razorpay_signature
            });

            if (verifyResponse.data.success) {
              setSuccess(true);
              // Handle successful payment (e.g., show success message, redirect, etc.)
            } else {
              setError('Payment verification failed');
            }
          } catch (err) {
            setError('Error verifying payment');
          }
        },
        prefill: {
          name: 'Customer Name',
          email: 'customer@example.com',
          contact: '9999999999'
        },
        theme: {
          color: '#00f6ff' // Matching your website's accent color
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      setError('Error initiating payment');
      console.error('Payment error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full py-10">
      <div className="flex flex-col items-center justify-center w-full max-w-[1240px]">
        <h2 className="font-poppins font-semibold xs:text-[48px] text-[40px] text-white xs:leading-[76.8px] leading-[66.8px] w-full text-center mb-10">
          Secure Payment
        </h2>
        <div className="bg-black-gradient-2 rounded-[20px] p-8 w-full max-w-md">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-lg font-medium text-dimWhite">
                Amount (INR)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full p-3 bg-white/10 border border-dimWhite rounded-[10px] text-white placeholder-gray-400 focus:outline-none focus:border-[#00f6ff]"
                min="1"
                required
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm bg-red-900/20 p-3 rounded-[10px]">
                {error}
              </div>
            )}

            <button
              onClick={handlePayment}
              disabled={loading}
              className={`w-full py-3 px-6 rounded-[10px] text-white font-medium text-lg transition-all duration-300 ${
                loading 
                  ? 'bg-gray-600 cursor-not-allowed' 
                  : 'bg-blue-gradient hover:shadow-lg hover:shadow-blue-500/50'
              }`}
            >
              {loading ? 'Processing...' : `Pay ₹${amount}`}
            </button>

            {success && (
              <div className="text-green-400 text-center bg-green-900/20 p-3 rounded-[10px]">
                Payment successful! Thank you for your purchase.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm; 