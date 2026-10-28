import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import api from '../api/axios';
import { getErrorMessage } from '../api/errors';
import type { Order } from '../types';
import { useAuth } from '../context/AuthContext';
import OrderStatusBadge from '../components/OrderStatusBadge';
import { formatDate, formatPrice } from '../utils/format';
import './Shop.css';

export default function OrderDetails() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { isAdmin } = useAuth();
  const justPlaced = (location.state as { justPlaced?: boolean } | null)?.justPlaced === true;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    api
      .get<Order>(`/orders/${id}`)
      .then(({ data }) => {
        if (!cancelled) {
          setOrder(data);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const notFound = axios.isAxiosError(err) && err.response?.status === 404;
          setError(notFound ? 'Comanda nu a fost găsită.' : getErrorMessage(err));
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <div className="shop-page">
        <div className="shop-state">
          <div className="spinner" />
          <p>Se încarcă comanda…</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="shop-page">
        <div className="shop-state">
          <p>{error || 'Comanda nu a putut fi afișată.'}</p>
          <Link to="/orders" className="btn btn-outline">Înapoi la comenzi</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="shop-page">
      <div className="shop-container">
        {justPlaced && (
          <div className="shop-success" role="status">
            <h2>✓ Comanda a fost plasată cu succes!</h2>
            <p>
              Mulțumim, {order.fullName}! Comanda <strong>#{order.id}</strong> a fost înregistrată.
              Vei plăti {formatPrice(order.total)} la livrare.
            </p>
          </div>
        )}

        <div className="shop-header">
          <div>
            <h1 className="shop-title">Comanda #{order.id}</h1>
            <p className="shop-subtitle">Plasată pe {formatDate(order.createdAt)}</p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        <div className="shop-layout">
          <div>
            <div className="shop-table-wrapper">
              <table className="shop-table">
                <thead>
                  <tr>
                    <th>Produs</th>
                    <th className="num">Preț unitar</th>
                    <th className="num">Cantitate</th>
                    <th className="num">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, index) => (
                    <tr key={`${item.productId ?? 'sters'}-${index}`}>
                      <td className="shop-table-product">
                        {item.productId !== null ? (
                          <Link to={`/products/${item.productId}`}>{item.productName}</Link>
                        ) : (
                          <>
                            <span>{item.productName}</span>
                            <span className="shop-table-meta">Produsul nu mai este în catalog</span>
                          </>
                        )}
                      </td>
                      <td className="num">{formatPrice(item.unitPrice)}</td>
                      <td className="num">{item.quantity}</td>
                      <td className="num"><strong>{formatPrice(item.subtotal)}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="shop-actions">
              <Link to="/orders" className="btn btn-outline">← Toate comenzile mele</Link>
              {isAdmin && <Link to="/admin/orders" className="btn btn-outline">Administrare comenzi</Link>}
            </div>
          </div>

          <aside className="shop-sidebar">
            <div className="shop-panel">
              <h2 className="shop-panel-title">Livrare</h2>
              <div className="order-info-grid">
                <p>
                  <strong>{order.fullName}</strong><br />
                  {order.phone}<br />
                  {order.address}<br />
                  {order.city}, jud. {order.county}, {order.postalCode}
                </p>
              </div>
              {order.notes && (
                <div className="order-info-grid">
                  <p className="order-notes">„{order.notes}”</p>
                </div>
              )}

              <h2 className="shop-panel-title">Total</h2>
              <div className="summary-row">
                <span>Produse ({order.itemCount})</span>
                <span>{formatPrice(order.itemsTotal)}</span>
              </div>
              <div className="summary-row">
                <span>Livrare ({order.deliveryMethodName})</span>
                <span>{order.deliveryPrice === 0 ? 'Gratuită' : formatPrice(order.deliveryPrice)}</span>
              </div>
              <div className="summary-row summary-total">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
              <p className="summary-note">💵 Plata la livrare (ramburs)</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
