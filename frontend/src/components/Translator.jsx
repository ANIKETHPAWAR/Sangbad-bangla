import React, { useState, useEffect, useRef } from 'react';
import { FiGlobe, FiX, FiCopy, FiVolume2, FiRefreshCw } from 'react-icons/fi';
import { useGoogleTranslate } from '../hooks/useGoogleTranslate';
import './Translator.css';

const Translator = ({ isOpen, onClose }) => {
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState('');
  const [isBrowserTranslationSupported, setIsBrowserTranslationSupported] = useState(false);
  const [demoMode, setDemoMode] = useState(true);
  const inputRef = useRef(null);
  const outputRef = useRef(null);
  
  // Google Translate hook
  const { isLoaded: isGoogleTranslateLoaded, translatePage, restoreOriginalLanguage } = useGoogleTranslate();

  // Check if browser translation is supported
  useEffect(() => {
    const checkBrowserTranslation = () => {
      // Check for various browser translation APIs
      const hasTranslateAPI = 'translate' in document.documentElement;
      const hasWebkitTranslate = 'webkitTranslate' in document.documentElement;
      const hasMozTranslate = 'mozTranslate' in document.documentElement;
      
      setIsBrowserTranslationSupported(hasTranslateAPI || hasWebkitTranslate || hasMozTranslate);
    };

    checkBrowserTranslation();
  }, []);

  // Demo translation function
  const demoTranslate = (text) => {
    const demoTranslations = {
      'hello': 'नमस्ते',
      'how are you': 'आप कैसे हैं',
      'good morning': 'सुप्रभात',
      'thank you': 'धन्यवाद',
      'welcome': 'स्वागत है',
      'news': 'समाचार',
      'breaking news': 'ताज़ा खबर',
      'india': 'भारत',
      'cricket': 'क्रिकेट',
      'politics': 'राजनीति'
    };

    const lowerText = text.toLowerCase();
    for (const [english, hindi] of Object.entries(demoTranslations)) {
      if (lowerText.includes(english)) {
        return text.replace(new RegExp(english, 'gi'), hindi);
      }
    }
    
    // If no exact match, return a generic translation
    return text.split(' ').map(word => {
      const translation = demoTranslations[word.toLowerCase()];
      return translation || word;
    }).join(' ');
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      setError('Please enter text to translate');
      return;
    }

    setIsTranslating(true);
    setError('');

    try {
      if (demoMode) {
        // Demo mode - use simple translations
        setTimeout(() => {
          const translated = demoTranslate(inputText);
          setTranslatedText(translated);
          setIsTranslating(false);
        }, 1000);
        return;
      }

      // Method 1: Try using the browser's built-in translation
      if (isBrowserTranslationSupported) {
        // Create a temporary element with the text
        const tempElement = document.createElement('div');
        tempElement.textContent = inputText;
        tempElement.style.position = 'absolute';
        tempElement.style.left = '-9999px';
        tempElement.style.visibility = 'hidden';
        
        // Set language attributes
        tempElement.lang = 'en';
        tempElement.setAttribute('translate', 'yes');
        
        document.body.appendChild(tempElement);
        
        // Try to trigger browser translation
        if ('translate' in tempElement) {
          tempElement.translate = true;
        }
        
        // Wait a bit for translation to process
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Get the translated text (this might not work in all browsers)
        const translated = tempElement.textContent;
        
        document.body.removeChild(tempElement);
        
        if (translated !== inputText) {
          setTranslatedText(translated);
          return;
        }
      }

      // Method 2: Use Google Translate API via iframe (fallback)
      const googleTranslateUrl = `https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit`;
      
      // Create a temporary iframe for translation
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = `https://translate.google.com/translate?sl=en&tl=hi&u=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(inputText)}`;
      
      document.body.appendChild(iframe);
      
      // This is a simplified approach - in practice, you'd need to handle the response properly
      setTimeout(() => {
        document.body.removeChild(iframe);
        // For demo purposes, we'll show a placeholder
        setTranslatedText('Translation using browser capabilities...');
      }, 2000);

    } catch (err) {
      setError('Translation failed. Please try using your browser\'s built-in translation feature.');
      setTranslatedText('');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const handleSpeak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'hi-IN';
      speechSynthesis.speak(utterance);
    }
  };

  const handleClear = () => {
    setInputText('');
    setTranslatedText('');
    setError('');
  };

  const handleTranslatePage = () => {
    // Use Google Translate to translate the page
    if (isGoogleTranslateLoaded) {
      translatePage('hi');
    } else {
      // Fallback: try to change the page language
      document.documentElement.lang = 'hi';
      // This will trigger browser's translation prompt
      window.location.reload();
    }
  };

  const handleRestoreOriginal = () => {
    if (isGoogleTranslateLoaded) {
      restoreOriginalLanguage();
    }
  };

  const handleDemoToggle = () => {
    setDemoMode(!demoMode);
    setTranslatedText('');
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="translator-overlay">
      <div className="translator-modal">
        <div className="translator-header">
          <div className="translator-title">
            <FiGlobe className="translator-icon" />
            <span>English to Hindi Translator</span>
            <div className="translator-mode-toggle">
              <button 
                className={`mode-btn ${demoMode ? 'active' : ''}`}
                onClick={handleDemoToggle}
                title={demoMode ? 'Demo Mode Active' : 'Switch to Demo Mode'}
              >
                {demoMode ? 'Demo' : 'Live'}
              </button>
            </div>
          </div>
          <button className="translator-close" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className="translator-content">
          {/* Browser Translation Info */}
          <div className="translator-info">
            <p>
              <strong>Browser Translation Support:</strong> 
              {isBrowserTranslationSupported ? ' ✅ Available' : ' ❌ Not Available'}
            </p>
            <p>
              <strong>Google Translate:</strong> 
              {isGoogleTranslateLoaded ? ' ✅ Loaded' : ' ⏳ Loading...'}
            </p>
            <p>
              <strong>Mode:</strong> 
              {demoMode ? ' 🎯 Demo Mode (Simple Translations)' : ' 🌐 Live Translation'}
            </p>
            <p className="translator-tip">
              💡 Tip: Use your browser's built-in translation feature (usually accessible via right-click → "Translate to Hindi")
            </p>
          </div>

          <div className="translator-section">
            <div className="translator-label">
              <span>English Text</span>
              <button 
                className="translator-action-btn"
                onClick={() => handleSpeak(inputText)}
                title="Listen to English text"
              >
                <FiVolume2 />
              </button>
            </div>
            <textarea
              ref={inputRef}
              className="translator-input"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={demoMode ? "Try: hello, how are you, cricket, news..." : "Enter English text to translate..."}
              rows={4}
            />
            <div className="translator-actions">
              <button 
                className="translator-btn primary"
                onClick={handleTranslate}
                disabled={isTranslating || !inputText.trim()}
              >
                {isTranslating ? 'Translating...' : 'Translate'}
              </button>
              <button 
                className="translator-btn secondary"
                onClick={handleClear}
              >
                Clear
              </button>
            </div>
          </div>

          {/* Page Translation Section */}
          <div className="translator-section">
            <div className="translator-label">
              <span>Translate Entire Page</span>
            </div>
            <div className="translator-page-actions">
              <button 
                className="translator-btn page-btn"
                onClick={handleTranslatePage}
                disabled={!isGoogleTranslateLoaded}
                title="Translate the entire page to Hindi"
              >
                <FiRefreshCw />
                Translate Page to Hindi
              </button>
              <button 
                className="translator-btn secondary"
                onClick={handleRestoreOriginal}
                disabled={!isGoogleTranslateLoaded}
                title="Restore original language"
              >
                Restore Original
              </button>
              <p className="translator-page-tip">
                This will translate the entire website content to Hindi using Google Translate.
              </p>
            </div>
          </div>

          {error && (
            <div className="translator-error">
              {error}
            </div>
          )}

          {translatedText && (
            <div className="translator-section">
              <div className="translator-label">
                <span>Hindi Translation</span>
                <div className="translator-actions-small">
                  <button 
                    className="translator-action-btn"
                    onClick={() => handleCopy(translatedText)}
                    title="Copy translation"
                  >
                    <FiCopy />
                  </button>
                  <button 
                    className="translator-action-btn"
                    onClick={() => handleSpeak(translatedText)}
                    title="Listen to Hindi translation"
                  >
                    <FiVolume2 />
                  </button>
                </div>
              </div>
              <div className="translator-output" ref={outputRef}>
                {translatedText}
              </div>
            </div>
          )}

          {/* Google Translate Widget */}
          <div className="translator-section">
            <div className="translator-label">
              <span>Google Translate Widget</span>
            </div>
            <div className="translator-widget-container">
              <div id="google_translate_element"></div>
              <p className="translator-widget-tip">
                Use the Google Translate widget above to translate the entire page or specific text.
              </p>
            </div>
          </div>

          {/* Instructions */}
          <div className="translator-instructions">
            <h4>How to use browser translation:</h4>
            <ol>
              <li>Use the Google Translate widget above</li>
              <li>Select any text on the page and right-click → "Translate to Hindi"</li>
              <li>Use browser extensions like Google Translate</li>
              <li>For Chrome: Click the translate icon in the address bar</li>
              <li>For Firefox: Use the translate button in the toolbar</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Translator; 