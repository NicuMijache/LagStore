import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { getErrorMessage } from '../api/errors';
import type { WishlistItem } from '../types';
import { useShop } from '../context/ShopContext';
import ProductCard from '../components/ProductCard';
import { SkeletonCards } from '../components/Skeleton';
import './Products.css';
import './Shop.css';

export default function Wishlist() {
  const { wishlistIds, toggleWishlist } = useShop();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removingId, setRemovingId] = useState<number | null>(null);

  // Se reîncarcă de fiecare dată când se schimbă favoritele (ex: inima de pe un card)
  useEffect(() => {
    let cancelled = false;
    api
      .get<WishlistItem[]>('/wishlist')
      .then(({ data }) => {
        if (!cancelled) {
          setItems(data);
          setError('');
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
  }, [wishlistIds]);

  const handleRemove = async (productId: number) => {
    setRemovingId(productId);
    try {
      await toggleWishlist(productId);
      setItems((prev) => prev.filter((p) => p.id !== productId));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="shop-page">
      <div className="shop-container">
        <div className="shop-header">
          <div>
            <h1 className="shop-title">Favorite</h1>
            <p className="shop-subtitle">
              {loading ? 'Se încarcă…' : `${items.length} produse salvate`}
            </p>
          </div>
        </div>

        {error && <div className="shop-error" role="alert">{error}</div>}

        {loading ? (
          <SkeletonCards count={4} />
        ) : items.length === 0 ? (
          <div className="empty-state">
            <h2 className="empty-state-title">Nu ai niciun produs la favorite</h2>
            <p className="empty-state-text">Apasă inima de pe un produs ca să-l salvezi aici.</p>
            <Link to="/" className="btn">Descoperă produsele</Link>
          </div>
        ) : (
          <div className="products-grid">
            {items.map((p) => (
              <div key={p.id} className="wishlist-item">
                <ProductCard product={p} />
                <button
                  className="btn-link wishlist-remove"
                  onClick={() => handleRemove(p.id)}
                  disabled={removingId === p.id}
                >
                  {removingId === p.id ? 'Se scoate…' : 'Scoate din favorite'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
