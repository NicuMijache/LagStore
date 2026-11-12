import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../types';
import { useShop } from '../context/ShopContext';
import { getErrorMessage } from '../api/errors';
import { formatPrice } from '../utils/format';
import WishlistButton from './WishlistButton';
import './ProductCard.css';

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const { addToCart } = useShop();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState('');

  const outOfStock = product.stock === 0;
  const productUrl = `/products/${product.id}`;

  const handleAddToCart = async () => {
    setAdding(true);
    setError('');
    try {
      if (await addToCart(product.id, 1)) {
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setAdding(false);
    }
  };

  return (
    <article
      className={`product-card ${outOfStock ? 'product-card--sold-out' : ''}`}
      id={`product-card-${product.id}`}
    >
      <div className="product-card-media">
        {/* Produsele nu au imagini: placeholder tipografic, ca grila să rămână uniformă */}
        <Link to={productUrl} className="product-card-placeholder" tabIndex={-1} aria-hidden="true">
          <span>{product.name}</span>
        </Link>
        {outOfStock && <span className="product-card-badge">Stoc epuizat</span>}
        <WishlistButton productId={product.id} className="product-card-heart" />
      </div>

      <Link to={productUrl} className="product-card-link">
        <span className="eyebrow">{product.categoryName}</span>
        <h3 className="product-card-name">{product.name}</h3>
        <p className="product-card-description">
          {product.description.length > 100
            ? product.description.slice(0, 100) + '…'
            : product.description || 'Fără descriere'}
        </p>
        <span className="product-card-stock">
          {outOfStock ? 'Indisponibil' : `${product.stock} în stoc`}
        </span>
        <span className="product-card-price">{formatPrice(product.price)}</span>
      </Link>

      <button
        className="btn btn-outline btn-sm btn-full"
        onClick={handleAddToCart}
        disabled={outOfStock || adding}
        id={`btn-add-cart-${product.id}`}
      >
        {outOfStock ? 'Indisponibil' : added ? 'Adăugat în coș' : adding ? 'Se adaugă…' : 'Adaugă în coș'}
      </button>
      {error && <p className="product-card-error" role="alert">{error}</p>}
    </article>
  );
}
