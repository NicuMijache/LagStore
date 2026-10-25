import {
  useState,
  useEffect,
  useCallback,
  type FormEvent,
  type ChangeEvent,
} from 'react';
import api from '../api/axios';
import type { Product, ProductSave, Category, Supplier, DeliveryMethod } from '../types';
import axios from 'axios';
import './AdminProducts.css';

// ─── helpers ────────────────────────────────────────────────────────────────

function extractError(err: unknown): string {
  if (!axios.isAxiosError(err)) return 'A apărut o eroare neașteptată.';
  const status = err.response?.status;
  const data = err.response?.data as
    | string
    | { errors?: Record<string, string[]>; title?: string }
    | undefined;

  if (status === 403) return 'Nu ai permisiunea să efectuezi această acțiune.';
  if (status === 401) return 'Sesiunea a expirat. Te rugăm să te autentifici din nou.';

  if (typeof data === 'string' && data.trim().length > 0) return data;

  if (data && typeof data === 'object') {
    if (data.errors) {
      const messages = Object.values(data.errors).flat();
      if (messages.length > 0) return messages.join(' ');
    }
    if (data.title) return data.title;
  }

  return `Eroare ${status ?? ''}: cererea nu a putut fi procesată.`;
}

// ─── empty form ──────────────────────────────────────────────────────────────

function emptyForm(): ProductSave {
  return {
    name: '',
    description: '',
    specifications: '',
    price: 0,
    stock: 0,
    categoryId: 0,
    supplierId: 0,
    deliveryMethodId: 0,
  };
}

// ─── component ───────────────────────────────────────────────────────────────

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [deliveryMethods, setDeliveryMethods] = useState<DeliveryMethod[]>([]);

  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState('');

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductSave>(emptyForm());
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Delete state
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // ── data loading ────────────────────────────────────────────────────────

  const [reloadKey, setReloadKey] = useState(0);

  const loadProducts = useCallback(() => {
    setLoadingList(true);
    setReloadKey((k) => k + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    api
      .get<Product[]>('/products')
      .then(({ data }) => { if (!cancelled) { setProducts(data); setListError(''); setLoadingList(false); } })
      .catch((err: unknown) => { if (!cancelled) { setListError(extractError(err)); setLoadingList(false); } });
    return () => { cancelled = true; };
  }, [reloadKey]);

  useEffect(() => {
    api.get<Category[]>('/categories').then(({ data }) => setCategories(data)).catch(() => {});
    api.get<Supplier[]>('/suppliers').then(({ data }) => setSuppliers(data)).catch(() => {});
    api.get<DeliveryMethod[]>('/deliverymethods').then(({ data }) => setDeliveryMethods(data)).catch(() => {});
  }, []);

  // ── form helpers ────────────────────────────────────────────────────────

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm());
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      description: p.description,
      specifications: p.specifications,
      price: p.price,
      stock: p.stock,
      categoryId: p.categoryId,
      supplierId: p.supplierId,
      deliveryMethodId: p.deliveryMethodId,
    });
    setFormError('');
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormError('');
  };

  const handleFieldChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === 'number' || name === 'categoryId' || name === 'supplierId' || name === 'deliveryMethodId'
          ? Number(value)
          : value,
    }));
  };

  const validateForm = (): string => {
    if (!form.name.trim()) return 'Numele produsului este obligatoriu.';
    if (form.price <= 0) return 'Prețul trebuie să fie mai mare ca 0.';
    if (form.stock < 0) return 'Stocul nu poate fi negativ.';
    if (!form.categoryId) return 'Selectează o categorie.';
    if (!form.supplierId) return 'Selectează un furnizor.';
    if (!form.deliveryMethodId) return 'Selectează o metodă de livrare.';
    return '';
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validationErr = validateForm();
    if (validationErr) {
      setFormError(validationErr);
      return;
    }
    setFormError('');
    setFormLoading(true);
    try {
      if (editingId !== null) {
        await api.put(`/products/${editingId}`, form);
      } else {
        await api.post('/products', form);
      }
      closeForm();
      loadProducts();
    } catch (err) {
      setFormError(extractError(err));
    } finally {
      setFormLoading(false);
    }
  };

  // ── delete ───────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (confirmDeleteId === null) return;
    setDeleteLoading(true);
    setDeleteError('');
    try {
      await api.delete(`/products/${confirmDeleteId}`);
      setConfirmDeleteId(null);
      loadProducts();
    } catch (err) {
      setDeleteError(extractError(err));
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── render ───────────────────────────────────────────────────────────────

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <div>
            <h1 className="admin-title">Administrare produse</h1>
            <p className="admin-subtitle">{products.length} produse în catalog</p>
          </div>
          <button id="btn-add-product" className="btn btn-primary" onClick={openAdd}>
            + Adaugă produs
          </button>
        </div>

        {listError && (
          <div className="admin-error" role="alert">
            {listError}
          </div>
        )}

        {/* Table */}
        {loadingList ? (
          <div className="admin-loading">
            <div className="spinner" />
            <p>Se încarcă produsele…</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nume</th>
                  <th>Categorie</th>
                  <th>Furnizor</th>
                  <th>Preț (RON)</th>
                  <th>Stoc</th>
                  <th>Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="table-empty">
                      Nu există produse în catalog.
                    </td>
                  </tr>
                ) : (
                  products.map((p) => (
                    <tr key={p.id}>
                      <td className="table-id">{p.id}</td>
                      <td className="table-name">{p.name}</td>
                      <td>
                        <span className="table-badge">{p.categoryName}</span>
                      </td>
                      <td>{p.supplierName}</td>
                      <td className="table-price">
                        {p.price.toLocaleString('ro-RO', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td>
                        <span className={p.stock === 0 ? 'table-stock-out' : ''}>
                          {p.stock}
                        </span>
                      </td>
                      <td className="table-actions">
                        <button
                          id={`btn-edit-${p.id}`}
                          className="btn btn-sm btn-outline"
                          onClick={() => openEdit(p)}
                        >
                          Editează
                        </button>
                        <button
                          id={`btn-delete-${p.id}`}
                          className="btn btn-sm btn-danger"
                          onClick={() => {
                            setDeleteError('');
                            setConfirmDeleteId(p.id);
                          }}
                        >
                          Șterge
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Form modal ─────────────────────────────────────────────────── */}
        {showForm && (
          <div className="modal-overlay" onClick={closeForm}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">
                  {editingId !== null ? 'Editează produs' : 'Adaugă produs nou'}
                </h2>
                <button className="modal-close" onClick={closeForm} aria-label="Închide">
                  ✕
                </button>
              </div>

              {formError && (
                <div className="admin-error" role="alert">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="product-form" noValidate>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="form-name">Nume produs *</label>
                    <input
                      id="form-name"
                      name="name"
                      type="text"
                      value={form.name}
                      onChange={handleFieldChange}
                      placeholder="ex: Mouse Logitech G502"
                      disabled={formLoading}
                    />
                  </div>
                </div>

                <div className="form-row form-row-3">
                  <div className="form-group">
                    <label htmlFor="form-categoryId">Categorie *</label>
                    <select
                      id="form-categoryId"
                      name="categoryId"
                      value={form.categoryId}
                      onChange={handleFieldChange}
                      disabled={formLoading}
                    >
                      <option value={0}>Selectează categorie…</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="form-supplierId">Furnizor *</label>
                    <select
                      id="form-supplierId"
                      name="supplierId"
                      value={form.supplierId}
                      onChange={handleFieldChange}
                      disabled={formLoading}
                    >
                      <option value={0}>Selectează furnizor…</option>
                      {suppliers.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="form-deliveryMethodId">Metodă de livrare *</label>
                    <select
                      id="form-deliveryMethodId"
                      name="deliveryMethodId"
                      value={form.deliveryMethodId}
                      onChange={handleFieldChange}
                      disabled={formLoading}
                    >
                      <option value={0}>Selectează metodă…</option>
                      {deliveryMethods.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.estimatedDaysMin}–{d.estimatedDaysMax} zile)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row form-row-2">
                  <div className="form-group">
                    <label htmlFor="form-price">Preț (RON) *</label>
                    <input
                      id="form-price"
                      name="price"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={form.price}
                      onChange={handleFieldChange}
                      disabled={formLoading}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="form-stock">Stoc *</label>
                    <input
                      id="form-stock"
                      name="stock"
                      type="number"
                      min="0"
                      step="1"
                      value={form.stock}
                      onChange={handleFieldChange}
                      disabled={formLoading}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="form-description">Descriere</label>
                  <textarea
                    id="form-description"
                    name="description"
                    rows={4}
                    value={form.description}
                    onChange={handleFieldChange}
                    placeholder="Descriere produs…"
                    disabled={formLoading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="form-specifications">Specificații tehnice</label>
                  <textarea
                    id="form-specifications"
                    name="specifications"
                    rows={4}
                    value={form.specifications}
                    onChange={handleFieldChange}
                    placeholder="ex: DPI: 200–25600&#10;Butoane: 11&#10;Conexiune: USB"
                    disabled={formLoading}
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={closeForm}
                    disabled={formLoading}
                  >
                    Anulare
                  </button>
                  <button
                    id="btn-form-submit"
                    type="submit"
                    className="btn btn-primary"
                    disabled={formLoading}
                  >
                    {formLoading
                      ? 'Se salvează…'
                      : editingId !== null
                      ? 'Salvează modificările'
                      : 'Adaugă produs'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Delete confirmation modal ───────────────────────────────────── */}
        {confirmDeleteId !== null && (
          <div
            className="modal-overlay"
            onClick={() => !deleteLoading && setConfirmDeleteId(null)}
          >
            <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">Confirmare ștergere</h2>
              </div>

              <p className="modal-body-text">
                Ești sigur că vrei să ștergi produsul{' '}
                <strong>
                  {products.find((p) => p.id === confirmDeleteId)?.name}
                </strong>
                ? Această acțiune este ireversibilă.
              </p>

              {deleteError && (
                <div className="admin-error" role="alert">
                  {deleteError}
                </div>
              )}

              <div className="form-actions">
                <button
                  id="btn-cancel-delete"
                  className="btn btn-outline"
                  onClick={() => setConfirmDeleteId(null)}
                  disabled={deleteLoading}
                >
                  Anulare
                </button>
                <button
                  id="btn-confirm-delete"
                  className="btn btn-danger"
                  onClick={handleDelete}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? 'Se șterge…' : 'Șterge definitiv'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
