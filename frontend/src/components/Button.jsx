import React from "react";

const Button = ({ styles, onClick }) => (
  <button 
    type="button" 
    className={`py-4 px-6 font-poppins font-medium text-[18px] text-primary bg-blue-gradient rounded-[10px] outline-none hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 ${styles}`}
    onClick={onClick}
  >
    Get Started
  </button>
);

export default Button;
