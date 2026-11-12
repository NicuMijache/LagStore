import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { getErrorMessage } from '../api/errors';
import type { Cart as CartData } from '../types';
import { useShop } from '../context/ShopContext';
import QuantitySelector from '../components/QuantitySelector';
import Icon from '../components/Icon';
import { SkeletonRows } from '../components/Skeleton';
import { formatPrice } from '../utils/format';
import './Shop.css';

export default function Cart() {
  const navigate = useNavigate();
  const { refreshCart } = useShop();
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    api
      .get<CartData>('/cart')
      .then(({ data }) => {
        if (!cancelled) {
          setCart(data);
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

  /** Execută o modificare a coșului, apoi reîncarcă și coșul, și contorul din navbar. */
  const mutate = async (productId: number | null, action: () => Promise<unknown>) => {
    setBusyId(productId);
    setError('');
    try {
      await action();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyId(null);
      setReloadKey((k) => k + 1);
      refreshCart();
    }
  };

  const changeQuantity = (productId: number, quantity: number) =>
    mutate(productId, () => api.put(`/cart/${productId}`, { quantity }));

  const removeLine = (productId: number) =>
    mutate(productId, () => api.delete(`/cart/${productId}`));

  const clearCart = () => mutate(-1, () => api.delete('/cart'));

  const hasStockProblem = cart?.items.some((i) => i.quantity > i.stock) ?? false;

  return (
    <div className="shop-page">
      <div className="shop-container">
        <div className="shop-header">
          <div>
            <h1 className="shop-title">Coșul meu</h1>
            <p className="shop-subtitle">
              {cart ? `${cart.itemCount} produse` : 'Se încarcă…'}
            </p>
          </div>
        </div>

        {error && <div className="shop-error" role="alert">{error}</div>}

        {loading ? (
          <SkeletonRows />
        ) : !cart ? (
          <div className="empty-state">
            <h2 className="empty-state-title">Coșul nu a putut fi încărcat</h2>
            <p className="empty-state-text">Verifică conexiunea și încearcă din nou.</p>
            <button className="btn" onClick={() => setReloadKey((k) => k + 1)}>
              Reîncearcă
            </button>
          </div>
        ) : cart.items.length === 0 ? (
          <div className="empty-state">
            <h2 className="empty-state-title">Coșul tău este gol</h2>
            <p className="empty-state-text">Adaugă produse din catalog și le vei găsi aici.</p>
            <Link to="/" className="btn">Mergi la catalog</Link>
          </div>
        ) : (
          <div className="shop-layout">
            <div>
              <div className="shop-table-wrapper">
                <table className="shop-table">
                  <thead>
                    <tr>
                      <th>Produs</th>
                      <th className="num">Preț</th>
                      <th>Cantitate</th>
                      <th className="num">Subtotal</th>
                      <th aria-label="Acțiuni" />
                    </tr>
                  </thead>
                  <tbody>
                    {cart.items.map((item) => (
                      <tr key={item.productId}>
                        <td className="shop-table-product">
                          <Link to={`/products/${item.productId}`}>{item.productName}</Link>
                          <span className="shop-table-meta">{item.categoryName}</span>
                          {item.quantity > item.stock && (
                            <span className="shop-table-warning">
                              Mai sunt doar {item.stock} bucăți în stoc
                            </span>
                          )}
                        </td>
                        <td className="num">{formatPrice(item.unitPrice)}</td>
                        <td>
                          <QuantitySelector
                            value={item.quantity}
                            min={1}
                            max={Math.max(item.stock, 1)}
                            onChange={(q) => changeQuantity(item.productId, Math.min(q, Math.max(item.stock, 1)))}
                            disabled={busyId !== null}
                          />
                        </td>
                        <td className="num"><strong>{formatPrice(item.subtotal)}</strong></td>
                        <td>
                          <button
                            className="shop-table-remove"
                            onClick={() => removeLine(item.productId)}
                            disabled={busyId !== null}
                            aria-label={`Șterge ${item.productName} din coș`}
                            title="Șterge din coș"
                          >
                            <Icon name="close" size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="shop-actions">
                <Link to="/" className="btn btn-outline">
                  <Icon name="arrowLeft" size={16} />
                  Continuă cumpărăturile
                </Link>
                <button className="btn btn-danger" onClick={clearCart} disabled={busyId !== null}>
                  Golește coșul
                </button>
              </div>
            </div>

            <aside className="shop-sidebar">
              <div className="shop-panel">
                <h2 className="shop-panel-title">Rezumat</h2>
                <div className="summary-row">
                  <span>Produse ({cart.itemCount})</span>
                  <span>{formatPrice(cart.total)}</span>
                </div>
                <div className="summary-row">
                  <span>Livrare</span>
                  <span>se alege la pasul următor</span>
                </div>
                <div className="summary-row summary-total">
                  <span>Total produse</span>
                  <span>{formatPrice(cart.total)}</span>
                </div>
                <button
                  id="btn-checkout"
                  className="btn btn-full"
                  onClick={() => navigate('/checkout')}
                  disabled={hasStockProblem || busyId !== null}
                >
                  Continuă spre comandă
                  <Icon name="arrowRight" size={16} />
                </button>
                {hasStockProblem && (
                  <p className="summary-note">Ajustează cantitățile marcate înainte de a continua.</p>
                )}
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
