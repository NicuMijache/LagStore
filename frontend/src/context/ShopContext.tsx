import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from './AuthContext';
import type { Cart, WishlistItem } from '../types';

interface ShopContextType {
  wishlistIds: Set<number>;
  cartCount: number;
  isInWishlist: (productId: number) => boolean;
  /** Adaugă sau scoate produsul din favorite. Vizitatorii sunt trimiși la login. */
  toggleWishlist: (productId: number) => Promise<void>;
  /** Adaugă în coș. Vizitatorii sunt trimiși la login; returnează false în acest caz. */
  addToCart: (productId: number, quantity: number) => Promise<boolean>;
  refreshWishlist: () => void;
  refreshCart: () => void;
}

interface ShopState {
  /** Tokenul pentru care au fost încărcate datele, ca să nu afișăm datele altui cont */
  owner: string;
  wishlistIds: Set<number>;
  cartCount: number;
}

const EMPTY_IDS = new Set<number>();

const ShopContext = createContext<ShopContextType | null>(null);

export function ShopProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const token = user?.token ?? '';

  const [state, setState] = useState<ShopState>({ owner: '', wishlistIds: EMPTY_IDS, cartCount: 0 });
  const [wishlistVersion, setWishlistVersion] = useState(0);
  const [cartVersion, setCartVersion] = useState(0);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    api
      .get<WishlistItem[]>('/wishlist')
      .then(({ data }) => {
        if (!cancelled) {
          setState((s) => ({ ...s, owner: token, wishlistIds: new Set(data.map((p) => p.id)) }));
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [token, wishlistVersion]);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    api
      .get<Cart>('/cart')
      .then(({ data }) => {
        if (!cancelled) setState((s) => ({ ...s, owner: token, cartCount: data.itemCount }));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [token, cartVersion]);

  const isCurrent = token !== '' && state.owner === token;
  const wishlistIds = isCurrent ? state.wishlistIds : EMPTY_IDS;
  const cartCount = isCurrent ? state.cartCount : 0;

  const refreshWishlist = useCallback(() => setWishlistVersion((v) => v + 1), []);
  const refreshCart = useCallback(() => setCartVersion((v) => v + 1), []);

  const toggleWishlist = async (productId: number) => {
    if (!token) {
      navigate('/login');
      return;
    }
    const wasFavorite = wishlistIds.has(productId);

    // Actualizare optimistă, ca inima să răspundă imediat
    setState((s) => {
      const next = new Set(s.wishlistIds);
      if (wasFavorite) next.delete(productId);
      else next.add(productId);
      return { ...s, wishlistIds: next };
    });

    try {
      if (wasFavorite) await api.delete(`/wishlist/${productId}`);
      else await api.post(`/wishlist/${productId}`);
    } finally {
      refreshWishlist();
    }
  };

  const addToCart = async (productId: number, quantity: number) => {
    if (!token) {
      navigate('/login');
      return false;
    }
    await api.post('/cart', { productId, quantity });
    refreshCart();
    return true;
  };

  return (
    <ShopContext.Provider
      value={{
        wishlistIds,
        cartCount,
        isInWishlist: (id) => wishlistIds.has(id),
        toggleWishlist,
        addToCart,
        refreshWishlist,
        refreshCart,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export function useShop(): ShopContextType {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error('useShop trebuie folosit în interiorul ShopProvider');
  return ctx;
}
