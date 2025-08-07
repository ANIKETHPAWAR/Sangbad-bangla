import React, { useState } from 'react';
import Translator from './Translator';
import { FiGlobe } from 'react-icons/fi';
import './TranslatorDemo.css';

const TranslatorDemo = () => {
  const [isTranslatorOpen, setIsTranslatorOpen] = useState(false);

  const sampleTexts = [
    "Hello, how are you?",
    "Breaking news from India",
    "Cricket match today",
    "Thank you for reading",
    "Welcome to our website"
  ];

  return (
    <div className="translator-demo">
      <div className="demo-header">
        <h1>🌐 Translator Feature Demo</h1>
        <p>Click the globe icon to open the English to Hindi translator</p>
      </div>

      <div className="demo-content">
        <div className="demo-section">
          <h2>Sample English Text for Translation</h2>
          <div className="sample-texts">
            {sampleTexts.map((text, index) => (
              <div key={index} className="sample-text-item">
                <span className="text-label">Sample {index + 1}:</span>
                <span className="text-content">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="demo-section">
          <h2>How to Use the Translator</h2>
          <div className="usage-steps">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Open Translator</h3>
                <p>Click the globe icon (🌐) in the header to open the translator modal</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Enter Text</h3>
                <p>Type or paste English text in the input field</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Translate</h3>
                <p>Click the "Translate" button to get Hindi translation</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3>Page Translation</h3>
                <p>Use "Translate Page" to translate the entire website</p>
              </div>
            </div>
          </div>
        </div>

        <div className="demo-section">
          <h2>Features Available</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Demo Mode</h3>
              <p>Simple translations for common words and phrases</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌐</div>
              <h3>Live Translation</h3>
              <p>Real-time translation using browser capabilities</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📄</div>
              <h3>Page Translation</h3>
              <p>Translate the entire website content</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔊</div>
              <h3>Text-to-Speech</h3>
              <p>Listen to both English and Hindi text</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📋</div>
              <h3>Copy Translation</h3>
              <p>Copy translated text to clipboard</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚙️</div>
              <h3>Google Translate Widget</h3>
              <p>Integrated Google Translate widget</p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Translator Button */}
      <button 
        className="floating-translator-btn"
        onClick={() => setIsTranslatorOpen(true)}
        title="Open Translator"
      >
        <FiGlobe />
        <span>Translate</span>
      </button>

      {/* Translator Modal */}
      <Translator 
        isOpen={isTranslatorOpen} 
        onClose={() => setIsTranslatorOpen(false)} 
      />
    </div>
  );
};

export default TranslatorDemo; 