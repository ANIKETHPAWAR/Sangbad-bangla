import { useEffect, useState } from 'react';

export const useGoogleTranslate = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Check if Google Translate is already loaded
    if (window.google && window.google.translate) {
      setIsLoaded(true);
      return;
    }

    // Load Google Translate script if not already loaded
    const loadGoogleTranslate = () => {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      
      // Define the callback function
      window.googleTranslateElementInit = () => {
        setIsLoaded(true);
        initializeTranslateElement();
      };

      document.head.appendChild(script);
    };

    loadGoogleTranslate();

    return () => {
      // Cleanup
      if (window.googleTranslateElementInit) {
        delete window.googleTranslateElementInit;
      }
    };
  }, []);

  const initializeTranslateElement = () => {
    if (!window.google || !window.google.translate) {
      return;
    }

    try {
      new window.google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: 'hi,en,bn', // Hindi, English, Bengali
        layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false
      }, 'google_translate_element');
      
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize Google Translate:', error);
    }
  };

  const translatePage = (targetLanguage) => {
    if (window.google && window.google.translate) {
      try {
        const translateElement = window.google.translate.TranslateElement.getInstance();
        if (translateElement) {
          translateElement.translatePage(targetLanguage);
        }
      } catch (error) {
        console.error('Failed to translate page:', error);
      }
    }
  };

  const restoreOriginalLanguage = () => {
    if (window.google && window.google.translate) {
      try {
        const translateElement = window.google.translate.TranslateElement.getInstance();
        if (translateElement) {
          translateElement.restore();
        }
      } catch (error) {
        console.error('Failed to restore original language:', error);
      }
    }
  };

  return {
    isLoaded,
    isInitialized,
    translatePage,
    restoreOriginalLanguage,
    initializeTranslateElement
  };
}; 