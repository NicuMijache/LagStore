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
    <div className="product-card" id={`product-card-${product.id}`}>
      <WishlistButton productId={product.id} className="product-card-heart" />

      <Link to={`/products/${product.id}`} className="product-card-link">
        <div className="product-card-header">
          <span className="product-card-category">{product.categoryName}</span>
          {outOfStock && (
            <span className="product-card-badge-out">Stoc epuizat</span>
          )}
        </div>

        <h3 className="product-card-name">{product.name}</h3>

        <p className="product-card-description">
          {product.description.length > 100
            ? product.description.slice(0, 100) + '…'
            : product.description || 'Fără descriere'}
        </p>

        <div className="product-card-footer">
          <span className="product-card-price">{formatPrice(product.price)}</span>
          <span
            className={
              outOfStock ? 'product-card-stock out' : 'product-card-stock'
            }
          >
            {outOfStock ? '✕ Indisponibil' : `✓ ${product.stock} în stoc`}
          </span>
        </div>
      </Link>

      <button
        className="btn btn-primary btn-sm btn-full"
        onClick={handleAddToCart}
        disabled={outOfStock || adding}
        id={`btn-add-cart-${product.id}`}
      >
        {outOfStock ? 'Indisponibil' : added ? '✓ Adăugat în coș' : adding ? 'Se adaugă…' : '🛒 Adaugă în coș'}
      </button>
      {error && <p className="product-card-error" role="alert">{error}</p>}
    </div>
  );
}
