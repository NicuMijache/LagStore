import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { getErrorMessage } from '../api/errors';
import type { Order } from '../types';
import OrderStatusBadge from '../components/OrderStatusBadge';
import Icon from '../components/Icon';
import { SkeletonRows } from '../components/Skeleton';
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
            <h1 className="shop-title">Comenzile mele</h1>
            <p className="shop-subtitle">
              {loading ? 'Se încarcă…' : `${orders.length} comenzi plasate`}
            </p>
          </div>
        </div>

        {error && <div className="shop-error" role="alert">{error}</div>}

        {loading ? (
          <SkeletonRows />
        ) : !error && orders.length === 0 ? (
          <div className="empty-state">
            <h2 className="empty-state-title">Nu ai plasat încă nicio comandă</h2>
            <p className="empty-state-text">Comenzile tale vor apărea aici, cu starea lor la zi.</p>
            <Link to="/" className="btn">Mergi la catalog</Link>
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
                <span className="order-row-arrow"><Icon name="arrowRight" size={16} /></span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
