import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { getErrorMessage } from '../api/errors';
import type { Order } from '../types';
import OrderStatusBadge from '../components/OrderStatusBadge';
import { formatDate, formatPrice } from '../utils/format';
import './Shop.css';

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    api
      .get<Order[]>('/orders')
      .then(({ data }) => {
        if (!cancelled) {
          setOrders(data);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(getErrorMessage(err));
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="shop-page">
      <div className="shop-container">
        <div className="shop-header">
          <div>
            <h1 className="shop-title">📦 Comenzile mele</h1>
            <p className="shop-subtitle">
              {loading ? 'Se încarcă…' : `${orders.length} comenzi plasate`}
            </p>
          </div>
        </div>

        {error && <div className="shop-error" role="alert">{error}</div>}

        {loading ? (
          <div className="shop-state">
            <div className="spinner" />
            <p>Se încarcă istoricul comenzilor…</p>
          </div>
        ) : !error && orders.length === 0 ? (
          <div className="shop-state">
            <p className="shop-state-icon">📦</p>
            <p>Nu ai plasat încă nicio comandă.</p>
            <Link to="/" className="btn btn-primary">Mergi la catalog</Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((o) => (
              <Link key={o.id} to={`/orders/${o.id}`} className="order-row" id={`order-${o.id}`}>
                <span className="order-row-id">Comanda #{o.id}</span>
                <span className="order-row-muted">{formatDate(o.createdAt)}</span>
                <OrderStatusBadge status={o.status} />
                <span>
                  <span className="order-row-total">{formatPrice(o.total)}</span>
                  <span className="order-row-muted"> · {o.itemCount} produse</span>
                </span>
                <span className="order-row-arrow">›</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
