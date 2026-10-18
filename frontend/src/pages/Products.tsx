import { useState, useEffect } from 'react';
import api from '../api/axios';
import type { Product, Category } from '../types';
import ProductCard from '../components/ProductCard';
import './Products.css';

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadFlag, setReloadFlag] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Load categories once
  useEffect(() => {
    api
      .get<Category[]>('/categories')
      .then(({ data }) => setCategories(data))
      .catch(() => {/* categories are optional for filtering */});
  }, []);

  // Load products whenever filters change or reload is requested
  useEffect(() => {
    let cancelled = false;
    const params: Record<string, string> = {};
    if (debouncedSearch) params.search = debouncedSearch;
    if (selectedCategory !== null) params.categoryId = String(selectedCategory);

    api
      .get<Product[]>('/products', { params })
      .then(({ data }) => {
        if (!cancelled) {
          setProducts(data);
          setError('');
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Nu am putut încărca produsele. Încearcă din nou.');
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  // reloadFlag is intentionally included to allow manual refresh
  }, [debouncedSearch, selectedCategory, reloadFlag]);

  const handleRetry = () => {
    setLoading(true);
    setReloadFlag((f) => !f);
  };

  return (
    <div className="products-page">
      {/* Hero banner */}
      <div className="products-hero">
        <h1 className="products-hero-title">
          Periferice Gaming Premium
        </h1>
        <p className="products-hero-subtitle">
          Găsește echipamentul perfect pentru setup-ul tău
        </p>
      </div>

      {/* Filters */}
      <div className="products-filters">
        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input
            id="search-input"
            type="text"
            className="search-input"
            placeholder="Caută produse…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              className="search-clear"
              onClick={() => setSearch('')}
              title="Șterge căutarea"
            >
              ✕
            </button>
          )}
        </div>

        <div className="category-chips">
          <button
            id="cat-all"
            className={`chip ${selectedCategory === null ? 'chip-active' : ''}`}
            onClick={() => setSelectedCategory(null)}
          >
            Toate
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              id={`cat-${cat.id}`}
              className={`chip ${selectedCategory === cat.id ? 'chip-active' : ''}`}
              onClick={() =>
                setSelectedCategory(selectedCategory === cat.id ? null : cat.id)
              }
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="products-content">
        {loading ? (
          <div className="state-box">
            <div className="spinner" />
            <p>Se încarcă produsele…</p>
          </div>
        ) : error ? (
          <div className="state-box state-error">
            <p>{error}</p>
            <button className="btn btn-outline" onClick={handleRetry}>
              Reîncearcă
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="state-box">
            <p className="state-empty-icon">🎮</p>
            <p>Niciun produs nu corespunde criteriilor selectate.</p>
            <button
              className="btn btn-outline"
              onClick={() => {
                setSearch('');
                setSelectedCategory(null);
              }}
            >
              Resetează filtrele
            </button>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
