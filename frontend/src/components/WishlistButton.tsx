import { useState } from 'react';
import { useShop } from '../context/ShopContext';
import './WishlistButton.css';

interface Props {
  productId: number;
  className?: string;
  /** Afișează și textul "Favorite" lângă inimă */
  withLabel?: boolean;
}

export default function WishlistButton({ productId, className = '', withLabel = false }: Props) {
  const { isInWishlist, toggleWishlist } = useShop();
  const [busy, setBusy] = useState(false);
  const active = isInWishlist(productId);

  const handleClick = async () => {
    setBusy(true);
    try {
      await toggleWishlist(productId);
    } catch {
      // starea se resincronizează automat din server
    } finally {
      setBusy(false);
    }
  };

  const label = active ? 'Scoate din favorite' : 'Adaugă la favorite';

  return (
    <button
      type="button"
      className={`wishlist-btn ${active ? 'active' : ''} ${withLabel ? 'with-label' : ''} ${className}`}
      onClick={handleClick}
      disabled={busy}
      aria-pressed={active}
      aria-label={label}
      title={label}
    >
      <span className="wishlist-btn-icon">{active ? '♥' : '♡'}</span>
      {withLabel && <span>{active ? 'În favorite' : 'Favorite'}</span>}
    </button>
  );
}
