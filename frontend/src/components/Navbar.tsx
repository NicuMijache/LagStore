import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

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
          {isAdmin && (
            <Link to="/admin/products" className="navbar-link navbar-link-admin">
              Administrare produse
            </Link>
          )}
        </div>

        <div className="navbar-auth">
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
