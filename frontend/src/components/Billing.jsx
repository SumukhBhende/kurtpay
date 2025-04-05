import { useState, useEffect } from 'react';
import styles, { layout } from "../style";

const Billing = () => {
  const [images, setImages] = useState({
    bill: null,
    apple: null,
    google: null
  });
  
  const [imageError, setImageError] = useState({
    bill: false,
    apple: false,
    google: false
  });

  useEffect(() => {
    // Import images
    Promise.all([
      import('../assets/bill.png'),
      import('../assets/apple.svg'),
      import('../assets/google.svg')
    ]).then(([billImg, appleImg, googleImg]) => {
      setImages({
        bill: billImg.default,
        apple: appleImg.default,
        google: googleImg.default
      });
    }).catch(error => {
      console.error('Error loading images:', error);
    });
  }, []);

  const handleImageError = (imageName) => {
    setImageError(prev => ({
      ...prev,
      [imageName]: true
    }));
    console.error(`Failed to load image: ${imageName}`);
  };

  return (
    <section id="product" className={layout.sectionReverse}>
      <div className={layout.sectionImgReverse}>
        {images.bill && !imageError.bill ? (
          <img 
            src={images.bill} 
            alt="billing" 
            className="w-[100%] h-[100%] relative z-[5]" 
            onError={() => handleImageError('bill')}
          />
        ) : (
          <div className="w-[100%] h-[100%] relative z-[5] bg-black-gradient-2 rounded-[20px] flex items-center justify-center">
            <p className="text-white text-xl">
              {!images.bill ? 'Loading...' : 'Billing Image'}
            </p>
          </div>
        )}

        {/* gradient start */}
        <div className="absolute z-[3] -left-1/2 top-0 w-[50%] h-[50%] rounded-full white__gradient" />
        <div className="absolute z-[0] w-[50%] h-[50%] -left-1/2 bottom-0 rounded-full pink__gradient" />
        {/* gradient end */}
      </div>

      <div className={layout.sectionInfo}>
        <h2 className={styles.heading2}>
          Easily control your <br className="sm:block hidden" /> billing &
          invoicing
        </h2>
        <p className={`${styles.paragraph} max-w-[470px] mt-5`}>
          Pay your bills online and get a generated receipt for your paid bills.
          You can also track your bills and manage your bills online.
        </p>

        <div className="flex flex-row flex-wrap sm:mt-10 mt-6">
          {images.apple && !imageError.apple ? (
            <img 
              src={images.apple} 
              alt="apple_store" 
              className="w-[128.86px] h-[42.05px] object-contain mr-5 cursor-pointer" 
              onError={() => handleImageError('apple')}
            />
          ) : (
            <div className="w-[128.86px] h-[42.05px] bg-black-gradient-2 rounded-[10px] flex items-center justify-center mr-5">
              <p className="text-white text-sm">
                {!images.apple ? 'Loading...' : 'App Store'}
              </p>
            </div>
          )}
          
          {images.google && !imageError.google ? (
            <img 
              src={images.google} 
              alt="google_play" 
              className="w-[144.17px] h-[43.08px] object-contain cursor-pointer" 
              onError={() => handleImageError('google')}
            />
          ) : (
            <div className="w-[144.17px] h-[43.08px] bg-black-gradient-2 rounded-[10px] flex items-center justify-center">
              <p className="text-white text-sm">
                {!images.google ? 'Loading...' : 'Google Play'}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Billing;
