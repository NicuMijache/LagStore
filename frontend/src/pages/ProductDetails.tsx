import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { getErrorMessage } from '../api/errors';
import type { Product } from '../types';
import { useShop } from '../context/ShopContext';
import WishlistButton from '../components/WishlistButton';
import QuantitySelector from '../components/QuantitySelector';
import './ProductDetails.css';

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useShop();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [cartMessage, setCartMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const handleAddToCart = async () => {
    if (!product) return;
    setAdding(true);
    setCartMessage(null);
    try {
      if (await addToCart(product.id, quantity)) {
        setCartMessage({ ok: true, text: `${quantity} × ${product.name} adăugat în coș.` });
      }
    } catch (err) {
      setCartMessage({ ok: false, text: getErrorMessage(err) });
    } finally {
      setAdding(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    api
      .get<Product>(`/products/${id}`)
      .then(({ data }) => {
        if (!cancelled) {
          setProduct(data);
          setError('');
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const status = (err as { response?: { status?: number } })?.response?.status;
          setError(
            status === 404
              ? 'Produsul nu a fost găsit.'
              : 'Nu am putut încărca produsul. Încearcă din nou.'
          );
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <div className="details-state">
        <div className="spinner" />
        <p>Se încarcă produsul…</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="details-state details-error">
        <p>{error || 'Produsul nu a putut fi afișat.'}</p>
        <button className="btn btn-outline" onClick={() => navigate('/')}>
          Înapoi la produse
        </button>
      </div>
    );
  }

  const outOfStock = product.stock === 0;

  return (
    <div className="details-page">
      <div className="details-container">
        {/* Breadcrumb */}
        <nav className="breadcrumb" aria-label="Navigare">
          <Link to="/">Produse</Link>
          <span className="breadcrumb-sep">›</span>
          <span>{product.name}</span>
        </nav>

        {/* Product header */}
        <div className="details-header">
          <div className="details-header-left">
            <span className="details-category">{product.categoryName}</span>
            <h1 className="details-name">{product.name}</h1>

            <div className="details-price-row">
              <span className="details-price">
                {product.price.toLocaleString('ro-RO', {
                  style: 'currency',
                  currency: 'RON',
                  maximumFractionDigits: 2,
                })}
              </span>
              <span
                className={`details-stock ${outOfStock ? 'out' : ''}`}
              >
                {outOfStock ? '✕ Stoc epuizat' : `✓ ${product.stock} bucăți în stoc`}
              </span>
            </div>

            <div className="details-actions">
              {!outOfStock && (
                <QuantitySelector
                  value={quantity}
                  min={1}
                  max={product.stock}
                  onChange={setQuantity}
                  disabled={adding}
                />
              )}
              <button
                id="btn-add-to-cart"
                className="btn btn-primary"
                onClick={handleAddToCart}
                disabled={outOfStock || adding}
              >
                {outOfStock ? 'Indisponibil' : adding ? 'Se adaugă…' : '🛒 Adaugă în coș'}
              </button>
              <WishlistButton productId={product.id} withLabel />
            </div>

            {cartMessage && (
              <p
                className={`details-cart-message ${cartMessage.ok ? 'ok' : 'error'}`}
                role={cartMessage.ok ? 'status' : 'alert'}
              >
                {cartMessage.text}
                {cartMessage.ok && <> <Link to="/cart">Vezi coșul →</Link></>}
              </p>
            )}
          </div>
        </div>

        <div className="details-body">
          {/* Left: description + specs */}
          <div className="details-main">
            {product.description && (
              <section className="details-section">
                <h2 className="details-section-title">Descriere</h2>
                <p className="details-description">{product.description}</p>
              </section>
            )}

            {product.specifications && (
              <section className="details-section">
                <h2 className="details-section-title">Specificații tehnice</h2>
                <pre className="details-specs">{product.specifications}</pre>
              </section>
            )}
          </div>

          {/* Right: info cards */}
          <aside className="details-sidebar">
            <div className="info-card">
              <h3 className="info-card-title">Furnizor</h3>
              <p className="info-card-value">{product.supplierName}</p>
            </div>

            <div className="info-card">
              <h3 className="info-card-title">Livrare</h3>
              <p className="info-card-value">{product.deliveryMethodName}</p>
              <div className="info-card-meta">
                <span className="info-tag">
                  💰{' '}
                  {product.deliveryPrice === 0
                    ? 'Gratuită'
                    : product.deliveryPrice.toLocaleString('ro-RO', {
                        style: 'currency',
                        currency: 'RON',
                        maximumFractionDigits: 2,
                      })}
                </span>
                <span className="info-tag">
                  📦 {product.estimatedDaysMin}–{product.estimatedDaysMax} zile
                </span>
              </div>
            </div>

            <div className="info-card">
              <h3 className="info-card-title">Categorie</h3>
              <p className="info-card-value">{product.categoryName}</p>
            </div>
          </aside>
        </div>

        <div className="details-back">
          <Link to="/" className="btn btn-outline" id="btn-back-to-products">
            ← Înapoi la produse
          </Link>
        </div>
      </div>
    </div>
  );
}
