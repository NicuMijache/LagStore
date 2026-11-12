import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { getErrorMessage } from '../api/errors';
import type { Product } from '../types';
import { useShop } from '../context/ShopContext';
import WishlistButton from '../components/WishlistButton';
import QuantitySelector from '../components/QuantitySelector';
import Icon from '../components/Icon';
import { SkeletonDetail } from '../components/Skeleton';
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

  const backLink = (
    <Link to="/" className="back-link" id="btn-back-to-products">
      <Icon name="arrowLeft" size={16} />
      Înapoi la produse
    </Link>
  );

  if (loading) {
    return (
      <div className="page page--detail container">
        {backLink}
        <SkeletonDetail />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="page page--detail container">
        {backLink}
        <div className="empty-state" role="alert">
          <h1 className="empty-state-title">{error || 'Produsul nu a putut fi afișat.'}</h1>
          <p className="empty-state-text">Poate a fost scos din catalog. Caută alt produs în lista completă.</p>
          <button className="btn" onClick={() => navigate('/')}>
            Înapoi la produse
          </button>
        </div>
      </div>
    );
  }

  const outOfStock = product.stock === 0;

  return (
    <div className="page page--detail container details-page">
      {backLink}

      <div className="details-layout">
        {/* Produsele nu au imagini: placeholder tipografic */}
        <div className="details-media" aria-hidden="true">
          <span>{product.name}</span>
        </div>

        <div className="details-info">
          <span className="eyebrow">{product.categoryName}</span>
          <h1 className="details-name">{product.name}</h1>

          <div className="details-price-row">
            <span className="details-price">
              {product.price.toLocaleString('ro-RO', {
                style: 'currency',
                currency: 'RON',
                maximumFractionDigits: 2,
              })}
            </span>
            <span className="details-stock">
              {outOfStock ? 'Stoc epuizat' : `${product.stock} bucăți în stoc`}
            </span>
          </div>

          {product.description && (
            <p className="details-description">{product.description}</p>
          )}

          <section className="panel details-buy" aria-label="Cumpărare">
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
              <WishlistButton productId={product.id} withLabel />
            </div>
            <button
              id="btn-add-to-cart"
              className="btn btn-full"
              onClick={handleAddToCart}
              disabled={outOfStock || adding}
            >
              {outOfStock ? 'Indisponibil' : adding ? 'Se adaugă…' : 'Adaugă în coș'}
            </button>

            {cartMessage && (
              <p
                className={cartMessage.ok ? 'form-note' : 'form-alert'}
                role={cartMessage.ok ? 'status' : 'alert'}
              >
                {cartMessage.text}
                {cartMessage.ok && <> <Link to="/cart" className="details-cart-link">Vezi coșul</Link></>}
              </p>
            )}
          </section>

          <dl className="details-facts">
            <div className="details-fact">
              <dt className="eyebrow">Furnizor</dt>
              <dd>{product.supplierName}</dd>
            </div>
            <div className="details-fact">
              <dt className="eyebrow">Livrare</dt>
              <dd>
                {product.deliveryMethodName}
                <span className="details-fact-meta">
                  {product.deliveryPrice === 0
                    ? 'Gratuită'
                    : product.deliveryPrice.toLocaleString('ro-RO', {
                        style: 'currency',
                        currency: 'RON',
                        maximumFractionDigits: 2,
                      })}
                  {' · '}
                  {product.estimatedDaysMin}–{product.estimatedDaysMax} zile
                </span>
              </dd>
            </div>
            <div className="details-fact">
              <dt className="eyebrow">Categorie</dt>
              <dd>{product.categoryName}</dd>
            </div>
          </dl>

          {product.specifications && (
            <section className="details-specs-section">
              <h2 className="panel-title">Specificații tehnice</h2>
              <pre className="details-specs">{product.specifications}</pre>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
