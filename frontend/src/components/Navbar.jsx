import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Wrench, LogIn, LogOut, Headphones, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner container">
        <Link to="/" className="navbar__logo">
          <Wrench size={22} color="#3b82f6" className="navbar__logo-icon" />
          <span className="navbar__logo-text">
            Auto<span className="gradient-text">Fix</span>
          </span>
        </Link>

        <div className={`navbar__links ${menuOpen ? 'navbar__links--open' : ''}`}>
          <Link to="/" className={`navbar__link ${isActive('/') ? 'navbar__link--active' : ''}`}>
            Home
          </Link>
          <Link to="/services" className={`navbar__link ${isActive('/services') ? 'navbar__link--active' : ''}`}>
            Services
          </Link>
          <a href="/#about" className="navbar__link">About Us</a>

          {(user?.role === 'operator' || user?.role === 'admin') && (
            <Link to="/operator" className={`navbar__link ${isActive('/operator') ? 'navbar__link--active' : ''}`}>
              <Headphones size={15} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 4 }} />
              Operator Panel
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link to="/admin" className={`navbar__link ${isActive('/admin') ? 'navbar__link--active' : ''}`}>
              <ShieldCheck size={15} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 4 }} />
              Admin Panel
            </Link>
          )}
        </div>

        <div className="navbar__actions">
          {isAuthenticated ? (
            <div className="navbar__user">
              <Link to="/account" className="navbar__user-link" title="My Account">
                {user.avatar_url || user.profilePhoto ? (
                  <img
                    src={user.avatar_url || user.profilePhoto}
                    alt={user.login}
                    className="navbar__avatar-img"
                  />
                ) : (
                  <div className="navbar__avatar">
                    {user.login?.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="navbar__username">{user.login}</span>
              </Link>
              <button className="btn btn-ghost navbar__logout" onClick={handleLogout}>
                <LogOut size={15} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 4 }} />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="navbar__auth">
              <Link to="/signin" className="btn btn-ghost">
                <LogIn size={15} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 4 }} />
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary">Register</Link>
            </div>
          )}

          <button
            className={`navbar__hamburger ${menuOpen ? 'navbar__hamburger--open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </div>
    </nav>
  );
}
