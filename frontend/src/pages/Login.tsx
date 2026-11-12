import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Auth.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = (): string => {
    if (!email.trim()) return 'Adresa de e-mail este obligatorie.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return 'Adresa de e-mail nu este validă.';
    if (password.length < 6)
      return 'Parola trebuie să aibă cel puțin 6 caractere.';
    return '';
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 401 || status === 400) {
          setError('E-mail sau parolă incorecte.');
        } else {
          setError('A apărut o eroare. Încearcă din nou.');
        }
      } else {
        setError('A apărut o eroare neașteptată.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page container auth-page">
      <div className="auth-intro">
        <h1 className="display">Autentificare</h1>
        <p className="lead">Bun venit înapoi!</p>
      </div>

      <div className="auth-column">
        <form onSubmit={handleSubmit} className="panel auth-form" noValidate>
          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Adresă de e-mail</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemplu@email.com"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Parolă</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minim 6 caractere"
              disabled={loading}
            />
          </div>

          <button
            id="btn-submit-login"
            type="submit"
            className="btn btn-full"
            disabled={loading}
          >
            {loading ? 'Se autentifică…' : 'Autentificare'}
          </button>
        </form>

        <p className="auth-footer">
          Nu ai cont?{' '}
          <Link to="/register" id="link-to-register">
            Înregistrează-te
          </Link>
        </p>
      </div>
    </div>
  );
}
