import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import Icon from './Icon';
import './Navbar.css';

const ADMIN_LINKS = [
  { to: '/admin/products', label: 'Produse' },
  { to: '/admin/categories', label: 'Categorii' },
  { to: '/admin/suppliers', label: 'Furnizori' },
  { to: '/admin/delivery-methods', label: 'Metode de livrare' },
  { to: '/admin/orders', label: 'Comenzi' },
];

type Menu = 'admin' | 'account' | 'mobile';

/** Închide meniul deschis la click în afara elementului dat */
function useOutsideClick(ref: RefObject<HTMLElement | null>, active: boolean, onOutside: () => void) {
  useEffect(() => {
    if (!active) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onOutside();
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [ref, active, onOutside]);
}

function initials(fullName: string) {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { wishlistIds, cartCount } = useShop();
  const navigate = useNavigate();
  const location = useLocation();

  // Meniul e deschis doar pe pagina pe care a fost deschis, deci se închide singur la navigare
  const [openMenu, setOpenMenu] = useState<{ menu: Menu; path: string } | null>(null);
  const isOpen = (menu: Menu) => openMenu?.menu === menu && openMenu.path === location.pathname;
  const toggle = (menu: Menu) => setOpenMenu(isOpen(menu) ? null : { menu, path: location.pathname });
  const closeAll = useCallback(() => setOpenMenu(null), []);

  const adminMenuRef = useRef<HTMLDivElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  useOutsideClick(adminMenuRef, isOpen('admin'), closeAll);
  useOutsideClick(accountMenuRef, isOpen('account'), closeAll);

  const handleLogout = () => {
    setOpenMenu(null);
    logout();
    navigate('/');
  };

  const isAdminPage = location.pathname.startsWith('/admin');
  const linkClass = ({ isActive }: { isActive: boolean }) => `navbar-link ${isActive ? 'active' : ''}`;

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-logo" aria-label="LagStore, pagina principală">
          <svg width="32" height="24" viewBox="0 0 32 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
            <path d="M9 4h14a7 7 0 0 1 7 7v2a7 7 0 0 1-12.6 4.2L16 15.5l-1.4 1.7A7 7 0 0 1 2 13v-2a7 7 0 0 1 7-7Z" />
            <path d="M8 9v5M5.5 11.5h5M22 10h.01M25 13h.01" />
          </svg>
          <span>LagStore</span>
        </Link>

        <nav className="navbar-links" aria-label="Navigare principală">
          <NavLink to="/" end className={linkClass}>
            Produse
          </NavLink>
          {user && (
            <NavLink to="/orders" className={linkClass} id="link-orders">
              Comenzile mele
            </NavLink>
          )}
          {isAdmin && (
            <div className="navbar-dropdown" ref={adminMenuRef}>
              <button
                type="button"
                className={`navbar-link navbar-dropdown-toggle ${isAdminPage ? 'active' : ''}`}
                onClick={() => toggle('admin')}
                aria-expanded={isOpen('admin')}
                aria-haspopup="true"
                id="btn-admin-menu"
              >
                Administrare
                <span className={`navbar-chevron ${isOpen('admin') ? 'open' : ''}`}>
                  <Icon name="chevronDown" size={12} />
                </span>
              </button>
              {isOpen('admin') && (
                <div className="navbar-dropdown-menu" role="menu">
                  {ADMIN_LINKS.map((l) => (
                    <Link
                      key={l.to}
                      to={l.to}
                      role="menuitem"
                      className={`navbar-dropdown-item ${location.pathname === l.to ? 'active' : ''}`}
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </nav>

        <div className="navbar-auth">
          <Link to="/wishlist" className="icon-btn" aria-label="Favorite" title="Favorite" id="link-wishlist">
            <Icon name="heart" />
            {wishlistIds.size > 0 && <span className="navbar-count">{wishlistIds.size}</span>}
          </Link>
          <Link to="/cart" className="icon-btn" aria-label="Coș" title="Coș" id="link-cart">
            <Icon name="cart" />
            {cartCount > 0 && <span className="navbar-count">{cartCount}</span>}
          </Link>

          {user ? (
            <div className="navbar-dropdown" ref={accountMenuRef}>
              <button
                type="button"
                className={`navbar-avatar ${isOpen('account') ? 'open' : ''}`}
                onClick={() => toggle('account')}
                aria-expanded={isOpen('account')}
                aria-haspopup="true"
                aria-label={`Contul meu: ${user.fullName}`}
                id="btn-account-menu"
              >
                {initials(user.fullName)}
              </button>
              {isOpen('account') && (
                <div className="navbar-dropdown-menu navbar-dropdown-menu--right" role="menu">
                  <div className="navbar-account">
                    <span className="navbar-account-name">{user.fullName}</span>
                    <span className="navbar-account-email">{user.email}</span>
                    {isAdmin && <span className="badge badge--solid navbar-account-badge">Admin</span>}
                  </div>
                  <Link to="/orders" role="menuitem" className="navbar-dropdown-item">
                    Comenzile mele
                  </Link>
                  <Link to="/wishlist" role="menuitem" className="navbar-dropdown-item">
                    Favorite
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    id="btn-logout"
                    className="navbar-dropdown-item"
                    onClick={handleLogout}
                  >
                    Deconectare
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="navbar-guest">
              <Link to="/login" className="btn btn-outline btn-sm" id="btn-login">
                Autentificare
              </Link>
              <Link to="/register" className="btn btn-sm" id="btn-register">
                Înregistrare
              </Link>
            </div>
          )}

          <button
            type="button"
            className={`icon-btn navbar-burger ${isOpen('mobile') ? 'open' : ''}`}
            onClick={() => toggle('mobile')}
            aria-expanded={isOpen('mobile')}
            aria-controls="navbar-mobile"
            aria-label={isOpen('mobile') ? 'Închide meniul' : 'Deschide meniul'}
          >
            <span className="navbar-burger-lines" aria-hidden="true" />
          </button>
        </div>
      </div>

      {isOpen('mobile') && (
        <nav className="navbar-mobile" id="navbar-mobile" aria-label="Meniu mobil">
          <div className="container navbar-mobile-inner">
            <Link to="/">Produse</Link>
            {user && <Link to="/orders">Comenzile mele</Link>}
            {isAdmin && ADMIN_LINKS.map((l) => (
              <Link key={l.to} to={l.to}>Administrare · {l.label}</Link>
            ))}
            {user ? (
              <button type="button" onClick={handleLogout}>Deconectare</button>
            ) : (
              <>
                <Link to="/login">Autentificare</Link>
                <Link to="/register">Înregistrare</Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
