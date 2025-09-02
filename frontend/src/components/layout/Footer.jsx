import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo-3.jpg';
import './Footer.css';

const Footer = () => {
  const year = new Date().getFullYear();

  const sections = [
    {
      title: 'Sections',
      links: [
        { label: 'ক্রিকেট', to: '/cricket' },
        { label: 'টেকটক', to: '/lifestyle' },
        { label: 'ভাগ্যলিপি', to: '/astrology' },
        { label: 'ফুটবলের মহারণ', to: '/football' },
        { label: 'ছবিঘর', to: '/photo-gallery' }
      ]
    },
    {
      title: 'বাংলার মুখ',
      links: [
        { label: 'অন্যান্য জেলা', to: '/bengal-face' }
      ]
    },
    {
      title: 'ক্রিকেট',
      links: [
        { label: 'লাইভ ক্রিকেট স্কোর', to: '/cricket' },
        { label: 'আইপিএলের সূচি', to: '/cricket' },
        { label: 'পয়েন্ট তালিকা', to: '/cricket' }
      ]
    },
    {
      title: 'ভাগ্যলিপি',
      links: [
        { label: 'রাশিফল', to: '/astrology' },
        { label: 'উৎসব সূচি', to: '/astrology' }
      ]
    }
  ];

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {sections.map((section, idx) => (
            <div key={idx} className="footer-col">
              <h4 className="footer-heading">{section.title}</h4>
              <ul className="footer-links">
                {section.links.map((link, i) => (
                  <li key={i}>
                    <Link
                      to={link.to}
                      onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' })}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="footer-meta">
          <div className="footer-meta-links">
            <Link to="/rss" onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })}>RSS</Link>
            <Link to="/advertise" onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })}>Advertise with us</Link>
            <Link to="/about" onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })}>About us</Link>
            <Link to="/contact" onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })}>Contact us</Link>
            <Link to="/privacy" onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })}>Privacy</Link>
            <Link to="/terms" onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })}>Terms of Use</Link>
            <Link to="/sitemap" onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })}>Sitemap</Link>
            <Link to="/archive" onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })}>Archive</Link>
          </div>
          <div className="footer-bottom">
            <div className="footer-copy">© {year} Sangbad Bangla</div>
            {/* Footer Logo */}
            <div className="footer-logo-section">
              <Link to="/" className="footer-logo" onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })}>
                <img src={logo} alt="Sangbad Bangla" className="footer-logo-image" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


