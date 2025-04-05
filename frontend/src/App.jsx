import styles from "./style";
import { Billing, Business, CardDeal, Clients, CTA, Footer, Navbar, Stats, Testimonials, Hero } from "./components";
import RegisterForm from "./components/RegisterForm";
import LoginForm from "./components/LoginForm";
import Settings from "./components/Settings";
import { useState, useEffect } from "react";

const App = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Check for stored user data on component mount
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
  }, []);

  const handleAuthClick = (type) => {
    if (type === 'login') {
      setShowLogin(true);
      setShowRegister(false);
      setShowSettings(false);
    } else if (type === 'register') {
      setShowLogin(false);
      setShowRegister(true);
      setShowSettings(false);
    } else if (type === 'settings') {
      setShowLogin(false);
      setShowRegister(false);
      setShowSettings(true);
    } else if (type === 'logout') {
      setUserData(null);
      setShowLogin(false);
      setShowRegister(false);
      setShowSettings(false);
    } else {
      setShowLogin(false);
      setShowRegister(false);
      setShowSettings(false);
    }
  };

  const handleLoginConfirm = (user) => {
    setUserData(user);
    setTimeout(() => {
      setShowLogin(false);
    }, 1500); // Show success message for 1.5 seconds before redirecting
  };

  const handleUserUpdate = (updatedUser) => {
    setUserData(updatedUser);
  };

  const handleNavigation = (section) => {
    handleAuthClick(''); // Reset all forms
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-primary w-full overflow-hidden">
      <div className={`${styles.paddingX} ${styles.flexCenter}`}>
        <div className={`${styles.boxWidth}`}>
          <Navbar onAuthClick={handleAuthClick} userData={userData} onNavigate={handleNavigation} />
        </div>
      </div>

      {!showLogin && !showRegister && !showSettings && (
        <>
          <div className={`bg-primary ${styles.flexStart}`}>
            <div className={`${styles.boxWidth}`}>
              <Hero onAuthClick={handleAuthClick} />
            </div>
          </div>
          
          <div className={`bg-primary ${styles.paddingX} ${styles.flexCenter}`}>
            <div className={`${styles.boxWidth}`}>
              <Stats />
              <Business onAuthClick={handleAuthClick} />
              <Billing />
              <CardDeal onAuthClick={handleAuthClick} />
              <Testimonials />
              <Clients />
              <CTA onAuthClick={handleAuthClick} />
              <Footer />
            </div>
          </div>
        </>
      )}

      {(showLogin || showRegister || showSettings) && (
        <div 
          className="bg-primary min-h-screen"
          onClick={(e) => {
            // Only close if clicking the background, not the form itself
            if (e.target === e.currentTarget) {
              handleAuthClick('');
            }
          }}
        >
          {showLogin && (
            <div onClick={e => e.stopPropagation()}>
              <LoginForm onConfirm={handleLoginConfirm} />
              <div className="text-center pb-10">
                <button
                  onClick={() => handleAuthClick('register')}
                  className="text-dimWhite hover:text-white"
                >
                  Don't have an account? Register here
                </button>
              </div>
            </div>
          )}

          {showRegister && (
            <div onClick={e => e.stopPropagation()}>
              <RegisterForm />
              <div className="text-center pb-10">
                <button
                  onClick={() => handleAuthClick('login')}
                  className="text-dimWhite hover:text-white"
                >
                  Already have an account? Login here
                </button>
              </div>
            </div>
          )}

          {showSettings && (
            <div onClick={e => e.stopPropagation()}>
              <Settings userData={userData} onUpdateUser={handleUserUpdate} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
