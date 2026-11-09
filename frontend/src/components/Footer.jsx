import { Link } from 'react-router-dom';
import { Wrench, MapPin, Phone, Send } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__grid">
          <div className="footer__brand">
            <div className="footer__logo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Wrench size={22} color="#3b82f6" />
              <span className="footer__logo-text">Auto<span className="gradient-text">Fix</span></span>
            </div>
            <p className="footer__tagline">
              Premium auto care, made simple. Book your service in minutes.
            </p>
            <div className="footer__secure">
              <span className="footer__secure-dot" />
              <span>SSL Encrypted · Data Protected</span>
            </div>
          </div>

          <div className="footer__section">
            <h4 className="footer__heading">Navigation</h4>
            <ul className="footer__list">
              <li><Link to="/" className="footer__link">Home</Link></li>
              <li><Link to="/services" className="footer__link">Services</Link></li>
              <li><a href="/#about" className="footer__link">About Us</a></li>
              <li><Link to="/register" className="footer__link">Register</Link></li>
            </ul>
          </div>

          <div className="footer__section">
            <h4 className="footer__heading">Services</h4>
            <ul className="footer__list">
              <li><span className="footer__link">Oil Change</span></li>
              <li><span className="footer__link">Brake Inspection</span></li>
              <li><span className="footer__link">Engine Diagnostics</span></li>
              <li><span className="footer__link">Wheel Alignment</span></li>
            </ul>
          </div>

          <div className="footer__section">
            <h4 className="footer__heading">Contact</h4>
            <ul className="footer__list">
              <li className="footer__link" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={15} style={{ flexShrink: 0 }} /> Multiple locations available
              </li>
              <li className="footer__link" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Phone size={15} style={{ flexShrink: 0 }} /> Contact via service chatbot
              </li>
              <li>
                <a
                  href="https://t.me/Auto_Service_BookingProject_Bot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer__link footer__telegram"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Send size={15} style={{ flexShrink: 0 }} /> Telegram Bot
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <p>© {year} AutoFix Service. All rights reserved.</p>
          <div className="footer__badges">
            <span className="badge badge-green">24/7 Support</span>
            <span className="badge badge-blue">6 Locations</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
