import { Link } from 'react-router-dom';
import type { Product } from '../types';
import './ProductCard.css';

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const outOfStock = product.stock === 0;

  return (
    <Link
      to={`/products/${product.id}`}
      className="product-card"
      id={`product-card-${product.id}`}
    >
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
        <span className="product-card-price">
          {product.price.toLocaleString('ro-RO', {
            style: 'currency',
            currency: 'RON',
            maximumFractionDigits: 2,
          })}
        </span>
        <span
          className={
            outOfStock ? 'product-card-stock out' : 'product-card-stock'
          }
        >
          {outOfStock ? '✕ Indisponibil' : `✓ ${product.stock} în stoc`}
        </span>
      </div>
    </Link>
  );
}
