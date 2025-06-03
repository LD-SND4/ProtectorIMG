import { useState } from 'react';
import WatermarkApp from './components/WatermarkApp';
import { translations } from './translations';
import './App.css';

function App() {
  const [language, setLanguage] = useState('en');

  const toggleLanguage = () => {
    setLanguage(prevLang => prevLang === 'en' ? 'es' : 'en');
  };

  return (
    <div className="relative min-h-screen">
      <button
        onClick={toggleLanguage}
        className="absolute top-4 right-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors z-10"
      >
        {language === 'en' ? 'ES' : 'EN'}
      </button>
      <WatermarkApp language={language} />
    </div>
  );
}

export default App;