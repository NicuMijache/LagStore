import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { getErrorMessage } from '../api/errors';
import type { Order, OrderStatus } from '../types';
import OrderStatusBadge from '../components/OrderStatusBadge';
import { formatDate, formatPrice, ORDER_STATUSES, ORDER_STATUS_LABELS } from '../utils/format';
import './AdminProducts.css';
import './Products.css';
import './Shop.css';

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [filter, setFilter] = useState<OrderStatus | null>(null);

  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [pendingCancel, setPendingCancel] = useState<Order | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .get<Order[]>('/orders/all')
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
  }, [reloadKey]);

  const updateStatus = async (order: Order, status: OrderStatus) => {
    setUpdatingId(order.id);
    setError('');
    try {
      await api.put(`/orders/${order.id}/status`, { status });
      setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status } : o)));
    } catch (err) {
      setError(getErrorMessage(err));
      setReloadKey((k) => k + 1);
    } finally {
      setUpdatingId(null);
      setPendingCancel(null);
    }
  };

  const handleStatusChange = (order: Order, status: OrderStatus) => {
    // Anularea restituie stocul și e definitivă, așa că cere confirmare
    if (status === 'Anulata') setPendingCancel(order);
    else updateStatus(order, status);
  };

  const visible = filter ? orders.filter((o) => o.status === filter) : orders;

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <div>
            <h1 className="admin-title">Administrare comenzi</h1>
            <p className="admin-subtitle">{orders.length} comenzi în total</p>
          </div>
        </div>

        <div className="category-chips" style={{ marginBottom: 20 }}>
          <button className={`chip ${filter === null ? 'chip-active' : ''}`} onClick={() => setFilter(null)}>
            Toate ({orders.length})
          </button>
          {ORDER_STATUSES.map((s) => (
            <button
              key={s}
              className={`chip ${filter === s ? 'chip-active' : ''}`}
              onClick={() => setFilter(filter === s ? null : s)}
            >
              {ORDER_STATUS_LABELS[s]} ({orders.filter((o) => o.status === s).length})
            </button>
          ))}
        </div>

        {error && <div className="admin-error" role="alert">{error}</div>}

        {loading ? (
          <div className="admin-loading">
            <div className="spinner" />
            <p>Se încarcă comenzile…</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Data</th>
                  <th>Client</th>
                  <th>Produse</th>
                  <th>Total</th>
                  <th>Stare</th>
                  <th>Schimbă starea</th>
                  <th aria-label="Detalii" />
                </tr>
              </thead>
              <tbody>
                {visible.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="table-empty">
                      {orders.length === 0 ? 'Nu există comenzi încă.' : 'Nicio comandă cu această stare.'}
                    </td>
                  </tr>
                ) : (
                  visible.map((o) => (
                    <tr key={o.id}>
                      <td className="table-id">{o.id}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>{formatDate(o.createdAt)}</td>
                      <td>
                        <span className="table-name">{o.fullName}</span>
                        <span className="shop-table-meta">{o.customerEmail}</span>
                      </td>
                      <td>{o.itemCount}</td>
                      <td className="table-price">{formatPrice(o.total)}</td>
                      <td><OrderStatusBadge status={o.status} /></td>
                      <td>
                        <div className="form-group">
                          <select
                            aria-label={`Starea comenzii #${o.id}`}
                            value={o.status}
                            onChange={(e) => handleStatusChange(o, e.target.value as OrderStatus)}
                            disabled={updatingId === o.id || o.status === 'Anulata'}
                          >
                            {ORDER_STATUSES.map((s) => (
                              <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td>
                        <Link to={`/orders/${o.id}`} className="btn btn-sm btn-outline">Detalii</Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {pendingCancel && (
          <div className="modal-overlay" onClick={() => updatingId === null && setPendingCancel(null)}>
            <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">Anulare comandă</h2>
              </div>
              <p className="modal-body-text">
                Anulezi comanda <strong>#{pendingCancel.id}</strong> a clientului {pendingCancel.fullName}?
                Produsele vor fi readăugate în stoc, iar comanda nu mai poate fi modificată după anulare.
              </p>
              <div className="form-actions">
                <button
                  className="btn btn-outline"
                  onClick={() => setPendingCancel(null)}
                  disabled={updatingId !== null}
                >
                  Renunță
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => updateStatus(pendingCancel, 'Anulata')}
                  disabled={updatingId !== null}
                >
                  {updatingId !== null ? 'Se anulează…' : 'Anulează comanda'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
