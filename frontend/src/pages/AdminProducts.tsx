import {
  useState,
  useEffect,
  useCallback,
  type FormEvent,
  type ChangeEvent,
} from 'react';
import api, { assetUrl } from '../api/axios';
import type { Product, ProductSave, Category, Supplier, DeliveryMethod } from '../types';
import axios from 'axios';
import Icon from '../components/Icon';
import { SkeletonRows } from '../components/Skeleton';
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

// ─── poze ────────────────────────────────────────────────────────────────────

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

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

  // Poza produsului: fișierul ales acum, previzualizarea lui și poza deja salvată
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);

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

  const resetImage = (savedUrl: string | null) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setImageFile(null);
    setPreviewUrl(null);
    setCurrentImageUrl(savedUrl);
    setRemoveImage(false);
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // permite alegerea aceluiași fișier din nou
    if (!file) return;

    if (!IMAGE_TYPES.includes(file.type)) {
      setFormError('Alege o poză JPG, PNG sau WEBP.');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setFormError('Poza poate avea maxim 5 MB.');
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setRemoveImage(false);
    setFormError('');
  };

  const handleImageRemove = () => {
    if (imageFile) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setImageFile(null);
      setPreviewUrl(null);
    } else {
      setRemoveImage(true);
    }
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm());
    resetImage(null);
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
    resetImage(p.imageUrl);
    setFormError('');
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    resetImage(null);
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
      let productId = editingId;
      if (productId !== null) {
        await api.put(`/products/${productId}`, form);
      } else {
        const { data } = await api.post<Product>('/products', form);
        productId = data.id;
        // Dacă poza eșuează, o nouă salvare editează produsul creat, nu mai creează altul
        setEditingId(productId);
      }

      if (imageFile) {
        const body = new FormData();
        body.append('file', imageFile);
        await api.post(`/products/${productId}/image`, body);
      } else if (removeImage && currentImageUrl) {
        await api.delete(`/products/${productId}/image`);
      }

      closeForm();
      loadProducts();
    } catch (err) {
      setFormError(extractError(err));
      loadProducts();
    } finally {
      setFormLoading(false);
    }
  };

  const shownImage = previewUrl ?? (currentImageUrl && !removeImage ? assetUrl(currentImageUrl) : null);

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
          <SkeletonRows count={6} />
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
                      <td className="table-name">
                        <span className="table-product">
                          <span className="table-thumb">
                            {p.imageUrl && <img src={assetUrl(p.imageUrl)} alt="" loading="lazy" />}
                          </span>
                          {p.name}
                        </span>
                      </td>
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
                  <Icon name="close" size={18} />
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

                <div className="image-field">
                  <div className="image-field-preview">
                    {shownImage ? <img src={shownImage} alt="Poza produsului" /> : <span>Fără poză</span>}
                  </div>
                  <div className="image-field-body">
                    <span className="eyebrow">Poză produs</span>
                    <div className="image-field-actions">
                      <input
                        id="form-image"
                        type="file"
                        accept={IMAGE_TYPES.join(',')}
                        className="visually-hidden"
                        onChange={handleImageChange}
                        disabled={formLoading}
                      />
                      <label htmlFor="form-image" className="btn btn-outline btn-sm">
                        {shownImage ? 'Schimbă poza' : 'Alege poza'}
                      </label>
                      {shownImage && (
                        <button
                          type="button"
                          className="btn-link"
                          onClick={handleImageRemove}
                          disabled={formLoading}
                        >
                          Scoate poza
                        </button>
                      )}
                    </div>
                    <p className="image-field-hint">JPG, PNG sau WEBP, maxim 5 MB.</p>
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
