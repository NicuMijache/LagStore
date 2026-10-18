import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Auth.css';

function extractServerError(err: unknown): string {
  if (!axios.isAxiosError(err)) return 'A apărut o eroare neașteptată.';
  const status = err.response?.status;
  const data = err.response?.data as
    | string
    | { errors?: Record<string, string[]>; title?: string }
    | undefined;

  if (status === 409) return 'Această adresă de e-mail este deja folosită.';

  if (typeof data === 'string' && data.length > 0) return data;

  if (data && typeof data === 'object') {
    if (data.errors) {
      const messages = Object.values(data.errors).flat();
      if (messages.length > 0) return messages.join(' ');
    }
    if (data.title) return data.title;
  }

  return 'A apărut o eroare. Încearcă din nou.';
}

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = (): string => {
    if (!fullName.trim()) return 'Numele complet este obligatoriu.';
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
      await register(fullName, email, password);
      navigate('/');
    } catch (err: unknown) {
      setError(extractServerError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="auth-logo-lag">Lag</span>
          <span className="auth-logo-store">Store</span>
        </div>
        <h1 className="auth-title">Creează cont</h1>
        <p className="auth-subtitle">Alătură-te comunității LagStore</p>

        {error && (
          <div className="auth-error" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="fullName">Nume complet</label>
            <input
              id="fullName"
              type="text"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ion Popescu"
              disabled={loading}
            />
          </div>

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
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minim 6 caractere"
              disabled={loading}
            />
          </div>

          <button
            id="btn-submit-register"
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? 'Se creează contul…' : 'Înregistrare'}
          </button>
        </form>

        <p className="auth-footer">
          Ai deja cont?{' '}
          <Link to="/login" id="link-to-login">
            Autentifică-te
          </Link>
        </p>
      </div>
    </div>
  );
}
