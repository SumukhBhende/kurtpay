import { useState } from "react";

import { close, logo, menu } from "../assets";
import { navLinks } from "../constants";

const NavBar = ({ onAuthClick, userData, onNavigate }) => {
  const [active, setActive] = useState("Home");
  const [toggle, setToggle] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    onAuthClick('logout');
    setShowUserMenu(false);
  };

  const handleSettingsClick = () => {
    onAuthClick('settings');
    setShowUserMenu(false);
  };

  const handleNavClick = (nav) => {
    setActive(nav.title);
    onNavigate(nav.id);
    setToggle(false); // Close mobile menu if open
  };

  return (
    <nav className="w-full flex py-6 justify-between items-center NavBar">
      <img 
        src={logo} 
        alt="kurtpay" 
        className="w-[124px] h-[32px] cursor-pointer" 
        onClick={() => onNavigate('home')}
      />

      <ul className="list-none sm:flex hidden justify-end items-center flex-1">
        {navLinks.map((nav, index) => (
          <li
            key={nav.id}
            className={`font-poppins font-normal cursor-pointer text-[16px] ${
              active === nav.title ? "text-white" : "text-dimWhite"
            } ${index === navLinks.length - 1 ? "mr-10" : "mr-10"}`}
            onClick={() => handleNavClick(nav)}
          >
            <a href={`#${nav.id}`}>{nav.title}</a>
          </li>
        ))}
        
        {!userData ? (
          <>
            <li>
              <button
                onClick={() => onAuthClick('login')}
                className="font-poppins font-medium text-[16px] text-primary bg-blue-gradient rounded-[10px] px-6 py-2 outline-none mr-4 hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300"
              >
                Login
              </button>
            </li>
            <li>
              <button
                onClick={() => onAuthClick('register')}
                className="font-poppins font-medium text-[16px] text-primary bg-blue-gradient rounded-[10px] px-6 py-2 outline-none hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300"
              >
                Register
              </button>
            </li>
          </>
        ) : (
          <li className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-gradient text-primary font-poppins font-medium text-[16px] hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300"
            >
              {userData.code}
            </button>
            
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-[10px] bg-black-gradient-2 py-2 shadow-xl">
                <button
                  onClick={handleSettingsClick}
                  className="block w-full text-left px-4 py-2 text-white hover:bg-white/10"
                >
                  Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-red-500 hover:bg-white/10"
                >
                  Logout
                </button>
              </div>
            )}
          </li>
        )}
      </ul>

      <div className="sm:hidden flex flex-1 justify-end items-center">
        <img
          src={toggle ? close : menu}
          alt="menu"
          className="w-[28px] h-[28px] object-contain"
          onClick={() => setToggle(!toggle)}
        />


        <div
          className={`${
            !toggle ? "hidden" : "flex"
          } p-6 bg-black-gradient absolute top-20 right-0 mx-4 my-2 min-w-[140px] rounded-xl sidebar`}
        >
          <ul className="list-none flex justify-end items-start flex-1 flex-col">
            {navLinks.map((nav, index) => (
              <li
                key={nav.id}
                className={`font-poppins font-medium cursor-pointer text-[16px] ${
                  active === nav.title ? "text-white" : "text-dimWhite"
                } ${index === navLinks.length - 1 ? "mb-4" : "mb-4"}`}
                onClick={() => handleNavClick(nav)}
              >
                <a href={`#${nav.id}`}>{nav.title}</a>
              </li>
            ))}
            
            {!userData ? (
              <>
                <li className="w-full mb-4">
                  <button
                    onClick={() => {
                      onAuthClick('login');
                      setToggle(false);
                    }}
                    className="font-poppins font-medium text-[16px] text-primary bg-blue-gradient rounded-[10px] px-6 py-2 outline-none w-full hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300"
                  >
                    Login
                  </button>
                </li>
                <li className="w-full">
                  <button
                    onClick={() => {
                      onAuthClick('register');
                      setToggle(false);
                    }}
                    className="font-poppins font-medium text-[16px] text-primary bg-blue-gradient rounded-[10px] px-6 py-2 outline-none w-full hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300"
                  >
                    Register
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="w-full mb-4 flex justify-center">
                  <div className="w-12 h-12 rounded-full bg-blue-gradient text-primary font-poppins font-medium text-[16px] flex items-center justify-center">
                    {userData.code}
                  </div>
                </li>
                <li className="w-full mb-2">
                  <button
                    onClick={() => {
                      handleSettingsClick();
                      setToggle(false);
                    }}
                    className="w-full text-left px-4 py-2 text-white hover:bg-white/10 rounded-[10px]"
                  >
                    Settings
                  </button>
                </li>
                <li className="w-full">
                  <button
                    onClick={() => {
                      handleLogout();
                      setToggle(false);
                    }}
                    className="w-full text-left px-4 py-2 text-red-500 hover:bg-white/10 rounded-[10px]"
                  >
                    Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
