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
        { label: 'কলকাতা', to: '/kolkata' },
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
                    <Link to={link.to}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="footer-meta">
          <div className="footer-meta-links">
            <Link to="/rss">RSS</Link>
            <Link to="/advertise">Advertise with us</Link>
            <Link to="/about">About us</Link>
            <Link to="/contact">Contact us</Link>
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms of Use</Link>
            <Link to="/sitemap">Sitemap</Link>
            <Link to="/archive">Archive</Link>
          </div>
          <div className="footer-bottom">
            <div className="footer-copy">© {year} Sangbad Bangla</div>
            {/* Footer Logo */}
            <div className="footer-logo-section">
              <Link to="/" className="footer-logo">
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


