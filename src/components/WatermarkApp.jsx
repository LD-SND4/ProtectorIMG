import { useState, useRef, useEffect } from 'react';
import { encode } from 'ts-steganography';
import { translations } from '../translations';
import ReCAPTCHA from 'react-google-recaptcha';

// Replace these with your actual donation links
const PAYPAL_DONATION_LINK = 'https://www.paypal.com/donate/?hosted_button_id=V9ZXQCWSRCZEE';
// const PAYONEER_DONATION_LINK = 'https://p.payoneer.com/YOUR_PAYONEER_LINK';

export default function WatermarkApp({ language = 'en' }) {
  const [signature, setSignature] = useState('');
  const [signatureImage, setSignatureImage] = useState(null);
  const [image, setImage] = useState(null);
  const [watermarkedImage, setWatermarkedImage] = useState(null);
  const [opacity, setOpacity] = useState(0.5);
  const [angle, setAngle] = useState(45);
  const [density, setDensity] = useState(3);
  const [fontSize, setFontSize] = useState(20);
  const [signatureSize, setSignatureSize] = useState(100); // For image signature size
  const [textColor, setTextColor] = useState('#000000');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingSignature, setIsDraggingSignature] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [isProcessingDownload, setIsProcessingDownload] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [donationStatus, setDonationStatus] = useState(null); // null: not interacted, 'considered': closed without donating, 'donated': completed donation
  const canvasRef = useRef(null);

  // Show donation modal on every page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowDonationModal(true);
    }, 3000); // Show after 3 seconds of page load
    return () => clearTimeout(timer);
  }, []);

  const handleDonate = (platform) => {
    // Open donation link in a new tab
    const url = platform === 'paypal' ? PAYPAL_DONATION_LINK : PAYONEER_DONATION_LINK;
    window.open(url, '_blank', 'noopener,noreferrer');
    
    // TODO: Implement PayPal Webhook verification
    // 1. Create an order ID when donation starts
    // 2. Set up a webhook endpoint to receive payment notifications
    // 3. Verify payment status before setting donation status
    // 4. Update user's status in your database
    
    // For now, we'll optimistically assume the donation was successful
    setDonationStatus('donated');
    setShowDonationModal(false);
  };
  
  const handleCloseModal = () => {
    // If user closes without donating, set status to 'considered'
    if (donationStatus === null) {
      setDonationStatus('considered');
    }
    setShowDonationModal(false);
  };

  const DonationModal = ({ onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden">
        <div className="p-6">
          {donationStatus === 'donated' ? (
            <div className="text-center">
              <div className="text-center">
                <div className="text-5xl mb-4">🎉</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {translations[language].thanksForSupport || 'Thank You for Your Support!'}
                </h3>
                <p className="text-gray-600 mb-6">
                  Your support helps us keep improving this tool and is greatly appreciated!
                </p>
                <button
                  onClick={handleCloseModal}
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {translations[language].close || 'Close'}
                </button>
              </div>
            </div>
          ) : donationStatus === 'considered' ? (
            <div className="text-center">
              <div className="text-4xl mb-4">🙏</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {translations[language].thanksForConsidering || 'Thanks for Considering!'}
              </h3>
              <p className="text-gray-600 mb-6">
                We appreciate you considering to support us. You can always donate later from the menu.
              </p>
              <button
                onClick={handleCloseModal}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                {translations[language].close || 'Close'}
              </button>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {translations[language].supportUs}
                </h3>
                <p className="text-gray-600">
                  {translations[language].supportMessage}
                </p>
              </div>
              
              <div className="mb-6">
                <p className="text-sm text-gray-500 uppercase tracking-wider mb-3">
                  {translations[language].oneTimeDonation}
                </p>
                
                <button
                  onClick={() => handleDonate('paypal')}
                  className="w-full mb-3 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center justify-center transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.08c3.476 0 5.09.615 5.098.617.564.196 1.17.78 1.315 1.35.186.738.378 1.508.378 2.292 0 .42-.168.819-.48 1.105a.688.688 0 0 0-.25.515c0 .055.013.14.05.23.05.106.1.212.14.318.26.56.41 1.15.41 1.75 0 .28-.05.55-.15.79-.07.16-.18.3-.32.41.18.15.34.31.48.5.19.25.31.54.35.85.02.09.03.18.03.27 0 .41-.16.8-.44 1.09.01.1.01.18.01.27 0 .69-.12 1.36-.38 1.99-.16.38-.37.74-.63 1.06-.18.23-.39.44-.61.63-.28.24-.58.44-.89.6-.31.17-.64.31-.98.42-.34.11-.7.18-1.06.2-.08 0-.16.01-.24.01H8.136c-.14 0-.26.1-.31.24l-1.13 3.41c-.05.14-.17.24-.31.24l-1.32 1.64c-.07.08-.18.12-.29.12z"/>
                  </svg>
                  {translations[language].paypalDonate}
                </button>
                
                {/* Payoneer donation button commented out
                <button
                  onClick={() => handleDonate('payoneer')}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg flex items-center justify-center transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9.715 17.5h1.5l-.75-5.5h-1.5l.75 5.5zm-3.5 0h1.5l.25-5.5h-1.5l-.25 5.5zm7 0h1.5l-.25-5.5h-1.5l.25 5.5zm-10.5 0h1.5l.75-5.5h-1.5l-.75 5.5zm14.5-5.5h-1.5l-.5 5.5h1.5l.5-5.5zm-5.25 0h-1.5l.5 5.5h1.5l-.5-5.5zm-4.5-8h10.5v3h-10.5v-3zm0 4h10.5v3h-10.5v-3z"/>
                  </svg>
                  {translations[language].payoneerDonate}
                </button>
                */}
              </div>
              
              <div className="flex justify-center">
                <button
                  onClick={() => {
                    setDonationStatus('considered');
                    setShowDonationModal(false);
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  {translations[language].maybeLater || 'Maybe Later'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  // Show notification for a few seconds
  const showNotification = (message, type = 'success') => {
    setNotification({ 
      message: translations[language][message] || message, 
      type 
    });
    setTimeout(() => setNotification(null), 3000);
  };

  // Reset all form fields and state
  const resetAll = () => {
    setSignature('');
    setSignatureImage(null);
    setImage(null);
    setWatermarkedImage(null);
    setOpacity(0.5);
    setAngle(45);
    setDensity(3);
    setFontSize(20);
    setSignatureSize(100);
    setTextColor('#000000');
    showNotification('resetSuccess');
  };

  // Handle main image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.match('image.*')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setImage(img);
          showNotification('imageUploaded');
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle main image drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.match('image.*')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            setImage(img);
            showNotification('imageUploaded');
          };
          img.src = event.target.result;
        };
        reader.readAsDataURL(file);
      } else {
        showNotification('invalidImage', 'error');
      }
    }
  };

  // Handle signature image upload
  const handleSignatureImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match('image/png')) {
      showNotification('invalidSignatureImage', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Process the image to ensure transparency
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        const processedImg = new Image();
        processedImg.onload = () => {
          setSignatureImage(processedImg);
          showNotification('signatureImageUploaded');
        };
        processedImg.src = canvas.toDataURL('image/png');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Update the useEffect to handle both text and image watermarks
  useEffect(() => {
    if (!image || !canvasRef.current) return;
    if (!signature && !signatureImage) return;
    
    setIsProcessing(true);
    
    setTimeout(() => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      // Set canvas dimensions to match image
      canvas.width = image.width;
      canvas.height = image.height;
      
      // Draw the original image
      ctx.drawImage(image, 0, 0);
      
      // Calculate spacing based on density
      const spacing = Math.max(canvas.width, canvas.height) / density;
      
      // Save current state before rotation
      ctx.save();
      
      // Rotate context for diagonal watermark
      ctx.rotate((angle * Math.PI) / 180);
      
      // Set global alpha for opacity
      ctx.globalAlpha = opacity;
      
      // Draw text watermark if signature exists
      if (signature) {
        ctx.font = `${fontSize}px Arial`;
        
        // Parse the hex color and add opacity
        let r = parseInt(textColor.substr(1, 2), 16);
        let g = parseInt(textColor.substr(3, 2), 16);
        let b = parseInt(textColor.substr(5, 2), 16);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        
        // Draw text watermarks
        for (let y = -canvas.height; y < canvas.height * 2; y += spacing) {
          for (let x = -canvas.width; x < canvas.width * 2; x += spacing) {
            ctx.fillText(signature, x, y);
          }
        }
      }
      
      // Draw image watermark if signature image exists
      if (signatureImage) {
        // Calculate size based on signatureSize (percentage of canvas width)
        const size = (canvas.width * signatureSize) / 100;
        const ratio = signatureImage.width / signatureImage.height;
        const width = size;
        const height = size / ratio;
        
        // Draw image watermarks
        for (let y = -canvas.height; y < canvas.height * 2; y += spacing) {
          for (let x = -canvas.width; x < canvas.width * 2; x += spacing) {
            ctx.drawImage(signatureImage, x, y, width, height);
          }
        }
      }
      
      // Restore the unrotated context
      ctx.restore();
      
      // Save the watermarked image
      setWatermarkedImage(canvas.toDataURL());
      setIsProcessing(false);
    }, 100);
  }, [image, signature, signatureImage, opacity, angle, density, fontSize, textColor, signatureSize]);

  // Add these new functions
  const generateCaptcha = () => {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const applySteganography = async (imageUrl) => {
    try {
      const hiddenMessage = `Copyright ${new Date().getFullYear()}`;
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      
      return new Promise((resolve) => {
        img.onload = async () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          
          try {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const encoded = await encode(hiddenMessage, imageData);
            ctx.putImageData(encoded, 0, 0);
            resolve(canvas.toDataURL('image/png'));
          } catch (error) {
            console.error('Steganography error:', error);
            resolve(imageUrl); // Fallback to original
          }
        };
        img.src = imageUrl;
      });
    } catch (error) {
      console.error('Error in steganography:', error);
      return imageUrl; // Fallback to original
    }
  };

  const CaptchaModal = ({ onVerify, onClose, language }) => {
    const [verified, setVerified] = useState(false);
    const [error, setError] = useState('');
    const recaptchaRef = useRef(null);

    // Replace with your reCAPTCHA site key (get it from Google reCAPTCHA admin console)
    const RECAPTCHA_SITE_KEY = '6LdU71krAAAAABCSGrwFEdIWWonvuUVWi2P6xlcB';

    const handleVerify = (token) => {
      if (token) {
        setVerified(true);
        setError('');
      }
    };

    const handleExpired = () => {
      setVerified(false);
      setError(translations[language].captchaExpired || 'reCAPTCHA expired. Please verify again.');
    };

    const handleError = () => {
      setVerified(false);
      setError(translations[language].captchaError || 'Error verifying reCAPTCHA. Please try again.');
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      if (!verified) {
        setError(translations[language].captchaRequired || 'Please complete the reCAPTCHA verification.');
        return;
      }
      onVerify();
      onClose();
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg max-w-sm w-full">
          <h3 className="text-lg font-medium mb-4">
            {translations[language].captchaInstructions || 'Verify you\'re human'}
          </h3>
          
          <form onSubmit={handleSubmit}>
            <div className="flex justify-center mb-4">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={RECAPTCHA_SITE_KEY}
                onChange={handleVerify}
                onExpired={handleExpired}
                onErrored={handleError}
                size="normal"
                theme="light"
              />
            </div>
            
            {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
            
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
              >
                {translations[language].cancel || 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={!verified}
                className={`px-4 py-2 text-white rounded transition-colors ${
                  verified 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-blue-400 cursor-not-allowed'
                }`}
              >
                {translations[language].verify || 'Verify'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const handleDownload = () => {
    if (!watermarkedImage) return;
    setShowCaptcha(true);
  };

  const handleVerifiedDownload = async () => {
    setIsProcessingDownload(true);
    try {
      const protectedImage = await applySteganography(watermarkedImage);
      
      const link = document.createElement('a');
      link.href = protectedImage;
      link.download = `protected-artwork-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
      showNotification(translations[language].downloadFailed, 'error');
    } finally {
      setIsProcessingDownload(false);
    }
  };

  const signatureImageUpload = (
    <div className="mt-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {translations[language].orUploadCustomSignature}
      </label>
      <div 
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
          ${isDraggingSignature ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:bg-gray-50'}`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDraggingSignature(true);
        }}
        onDragLeave={() => setIsDraggingSignature(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDraggingSignature(false);
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleSignatureImageUpload({ target: { files: [e.dataTransfer.files[0]] } });
          }
        }}
      >
        <input
          type="file"
          accept=".png,image/png"
          className="hidden"
          id="signature-upload"
          onChange={handleSignatureImageUpload}
        />
        <label htmlFor="signature-upload" className="cursor-pointer">
          <div className="text-indigo-600 font-medium">
            {signatureImage ? translations[language].changeSignatureImage : translations[language].clickOrDragToUploadPNG}
          </div>
          <p className="text-xs text-gray-500 mt-1">{translations[language].transparentPNGRecommended}</p>
          {signatureImage && (
            <div className="mt-2">
              <div className="mt-2 flex justify-center">
                <img 
                  src={signatureImage.src} 
                  alt={translations[language].signaturePreview} 
                  className="max-h-20 max-w-full object-contain"
                />
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSignatureImage(null);
                }}
                className="mt-1 text-xs text-red-600 hover:text-red-800"
              >
                {translations[language].removeSignatureImage}
              </button>
            </div>
          )}
        </label>
      </div>
    </div>
  );

  return (
    <div className="relative">
      {showDonationModal && (
        <div className="fixed inset-0 z-50">
          <DonationModal onClose={() => setShowDonationModal(false)} />
        </div>
      )}
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-4 sm:p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          <header className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-indigo-600 mb-2">
              {translations[language].appTitle}
            </h1>
            <p className="text-gray-600">{translations[language].uploadAnImage}</p>
          </header>

          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">
              {translations[language].howItWorks}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-indigo-50 p-4 rounded-lg">
                <div className="text-indigo-600 font-bold text-xl mb-2">1</div>
                <h3 className="font-medium mb-2">
                  {translations[language].uploadYourArt}
                </h3>
                <p className="text-gray-600 text-sm">
                  {translations[language].uploadAnyImage}
                </p>
              </div>
              <div className="bg-indigo-50 p-4 rounded-lg">
                <div className="text-indigo-600 font-bold text-xl mb-2">2</div>
                <h3 className="font-medium mb-2">
                  {translations[language].addYourSignature}
                </h3>
                <p className="text-gray-600 text-sm">
                  {translations[language].enterYourName}
                </p>
              </div>
              <div className="bg-indigo-50 p-4 rounded-lg">
                <div className="text-indigo-600 font-bold text-xl mb-2">3</div>
                <h3 className="font-medium mb-2">
                  {translations[language].downloadProtectedArt}
                </h3>
                <p className="text-gray-600 text-sm">
                  {translations[language].downloadYourArtwork}
                </p>
              </div>
            </div>
          </div>

          {notification && (
            <div className={`mb-4 p-3 rounded-lg text-white text-center transition-all 
              ${notification.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
              {notification.message}
            </div>
          )}

          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  {translations[language].uploadConfigure}
                </h2>
                
                {/* Signature Input */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {translations[language].yourSignature}
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder={translations[language].signaturePlaceholder}
                    value={signature}
                    onChange={(e) => setSignature(e.target.value)}
                  />
                </div>
                
                {signatureImageUpload}
                
                {/* Image Upload */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {translations[language].uploadImage}
                  </label>
                  <div 
                    className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
                      ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:bg-gray-50'}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="image-upload"
                      onChange={handleImageUpload}
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <div className="text-indigo-600 font-medium">
                        {translations[language].clickOrDragToUpload}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {translations[language].pngJpgGifUpTo10MB}
                      </p>
                      {image && (
                        <div className="mt-2 text-sm text-gray-600">
                          {translations[language].imageLoaded} {Math.round(image.width)}x{Math.round(image.height)}px
                        </div>
                      )}
                    </label>
                  </div>
                </div>
                
                {/* Controls */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {translations[language].textColor}
                    </label>
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-full h-10 rounded-lg cursor-pointer"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {translations[language].opacity} {opacity.toFixed(2)}
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.05"
                      value={opacity}
                      onChange={(e) => setOpacity(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {translations[language].angle} {angle}°
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      step="5"
                      value={angle}
                      onChange={(e) => setAngle(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {translations[language].density} {density}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="1"
                      value={density}
                      onChange={(e) => setDensity(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {signatureImage ? translations[language].customSignatureSize : translations[language].fontSize} {signatureImage ? `${signatureSize}%` : `${fontSize}px`}
                    </label>
                    <input
                      type="range"
                      min={signatureImage ? "10" : "10"}
                      max={signatureImage ? "200" : "50"}
                      step="1"
                      value={signatureImage ? signatureSize : fontSize}
                      onChange={(e) => signatureImage 
                        ? setSignatureSize(parseInt(e.target.value)) 
                        : setFontSize(parseInt(e.target.value))
                      }
                      className="w-full"
                    />
                  </div>
                  
                  <button
                    onClick={resetAll}
                    className="mt-4 w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    {translations[language].resetAllSettings}
                  </button>
                </div>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  {translations[language].preview}
                </h2>
                <div 
                  className="bg-gray-100 bg-opacity-50 rounded-lg flex items-center justify-center p-2" 
                  style={{ minHeight: "300px" }}
                >
                  {isProcessing ? (
                    <div className="text-center">
                      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
                      <p className="mt-2 text-gray-600">
                        {translations[language].processingYourImage}
                      </p>
                    </div>
                  ) : watermarkedImage ? (
                    <div className="relative">
                      <img
                        src={watermarkedImage}
                        alt={translations[language].watermarkedPreview}
                        className="max-w-full max-h-64 md:max-h-80 rounded-lg shadow-md"
                      />
                      <button
                        onClick={handleDownload}
                        disabled={isProcessingDownload}
                        className="mt-2 bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center justify-center hover:bg-indigo-700 transition-colors disabled:opacity-50"
                      >
                        {isProcessingDownload ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {translations[language].processingYourImage}
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                            </svg>
                            {translations[language].downloadProtectedImage}
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="text-gray-500 text-center py-10">
                      {image ? (
                        signature || signatureImage ? (
                          translations[language].generatingPreview
                        ) : (
                          translations[language].enterYourSignature
                        )
                      ) : (
                        <div>
                          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <p className="mt-1">
                            {translations[language].uploadAnImageToSeePreview}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Information section */}
      {/*     <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">
              {translations[language].howItWorks}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-indigo-50 p-4 rounded-lg">
                <div className="text-indigo-600 font-bold text-xl mb-2">1</div>
                <h3 className="font-medium mb-2">
                  {translations[language].uploadYourArt}
                </h3>
                <p className="text-gray-600 text-sm">
                  {translations[language].uploadAnyImage}
                </p>
              </div>
              <div className="bg-indigo-50 p-4 rounded-lg">
                <div className="text-indigo-600 font-bold text-xl mb-2">2</div>
                <h3 className="font-medium mb-2">
                  {translations[language].addYourSignature}
                </h3>
                <p className="text-gray-600 text-sm">
                  {translations[language].enterYourName}
                </p>
              </div>
              <div className="bg-indigo-50 p-4 rounded-lg">
                <div className="text-indigo-600 font-bold text-xl mb-2">3</div>
                <h3 className="font-medium mb-2">
                  {translations[language].downloadProtectedArt}
                </h3>
                <p className="text-gray-600 text-sm">
                  {translations[language].downloadYourArtwork}
                </p>
              </div>
            </div>
          </div> */}
          
          {/* Hidden canvas for processing */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          
          <footer className="text-center text-gray-500 text-sm py-4">
            <p> {new Date().getFullYear()} {translations[language].digitalArtProtector} • {translations[language].allRightsReserved}</p>
          </footer>
        </div>
      </div>
      
      {/* Add the CAPTCHA modal at the end of your component */}
      {showCaptcha && (
        <CaptchaModal
          onVerify={handleVerifiedDownload}
          onClose={() => setShowCaptcha(false)}
          language={language}
        />
      )}
    </div>
  );
}
