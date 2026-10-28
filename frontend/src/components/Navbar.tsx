import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import './Navbar.css';

const ADMIN_LINKS = [
  { to: '/admin/products', label: 'Produse' },
  { to: '/admin/categories', label: 'Categorii' },
  { to: '/admin/suppliers', label: 'Furnizori' },
  { to: '/admin/delivery-methods', label: 'Metode de livrare' },
  { to: '/admin/orders', label: 'Comenzi' },
];

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { wishlistIds, cartCount } = useShop();
  const navigate = useNavigate();
  const location = useLocation();
  const [adminOpen, setAdminOpen] = useState(false);
  const adminMenuRef = useRef<HTMLDivElement>(null);

  // Închide meniul de administrare la click în afara lui
  useEffect(() => {
    if (!adminOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (adminMenuRef.current && !adminMenuRef.current.contains(e.target as Node)) {
        setAdminOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [adminOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <span className="navbar-logo-lag">Lag</span>
          <span className="navbar-logo-store">Store</span>
        </Link>

        <div className="navbar-links">
          <Link to="/" className="navbar-link">
            Produse
          </Link>
          {user && (
            <Link to="/orders" className="navbar-link" id="link-orders">
              Comenzile mele
            </Link>
          )}
          {isAdmin && (
            <div className="navbar-dropdown" ref={adminMenuRef}>
              <button
                type="button"
                className={`navbar-link navbar-link-admin navbar-dropdown-toggle ${isAdminPage ? 'active' : ''}`}
                onClick={() => setAdminOpen((o) => !o)}
                aria-expanded={adminOpen}
                aria-haspopup="true"
                id="btn-admin-menu"
              >
                Administrare ▾
              </button>
              {adminOpen && (
                <div className="navbar-dropdown-menu" role="menu">
                  {ADMIN_LINKS.map((l) => (
                    <Link
                      key={l.to}
                      to={l.to}
                      role="menuitem"
                      className={`navbar-dropdown-item ${location.pathname === l.to ? 'active' : ''}`}
                      onClick={() => setAdminOpen(false)}
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="navbar-auth">
          <Link to="/wishlist" className="navbar-icon" aria-label="Favorite" title="Favorite" id="link-wishlist">
            ♥
            {wishlistIds.size > 0 && <span className="navbar-count">{wishlistIds.size}</span>}
          </Link>
          <Link to="/cart" className="navbar-icon" aria-label="Coș" title="Coș" id="link-cart">
            🛒
            {cartCount > 0 && <span className="navbar-count">{cartCount}</span>}
          </Link>

          {user ? (
            <>
              <span className="navbar-user">
                👤 {user.fullName}
                {isAdmin && <span className="navbar-badge">Admin</span>}
              </span>
              <button
                id="btn-logout"
                className="btn btn-outline"
                onClick={handleLogout}
              >
                Deconectare
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline" id="btn-login">
                Autentificare
              </Link>
              <Link to="/register" className="btn btn-primary" id="btn-register">
                Înregistrare
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
