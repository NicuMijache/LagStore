import { useEffect, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import api from '../api/axios';
import { getErrorMessage } from '../api/errors';
import '../pages/AdminProducts.css';

export type FormValues = Record<string, string>;

export interface FieldConfig {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'tel' | 'number';
  placeholder?: string;
  min?: string;
  step?: string;
}

export interface ColumnConfig<T> {
  label: string;
  render: (item: T) => ReactNode;
  className?: string;
}

interface Props<T extends { id: number }> {
  title: string;
  /** ex: "categorie", folosit în "Adaugă categorie" */
  singular: string;
  /** Endpoint-ul API, ex: "/categories" */
  endpoint: string;
  columns: ColumnConfig<T>[];
  fields: FieldConfig[];
  emptyForm: FormValues;
  toForm: (item: T) => FormValues;
  toPayload: (form: FormValues) => object;
  /** Returnează un mesaj de eroare sau șir gol dacă formularul e valid */
  validate: (form: FormValues) => string;
  itemName: (item: T) => string;
}

/**
 * Pagină de administrare reutilizabilă: tabel, adăugare/editare într-un modal
 * și ștergere cu confirmare. Folosită pentru categorii, furnizori și metode de livrare.
 */
export default function AdminCatalogPage<T extends { id: number }>({
  title,
  singular,
  endpoint,
  columns,
  fields,
  emptyForm,
  toForm,
  toPayload,
  validate,
  itemName,
}: Props<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormValues>(emptyForm);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState<T | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    let cancelled = false;
    api
      .get<T[]>(endpoint)
      .then(({ data }) => {
        if (!cancelled) {
          setItems(data);
          setListError('');
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setListError(getErrorMessage(err));
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [endpoint, reloadKey]);

  const reload = () => setReloadKey((k) => k + 1);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (item: T) => {
    setEditingId(item.id);
    setForm(toForm(item));
    setFormError('');
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormError('');
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validationError = validate(form);
    if (validationError) {
      setFormError(validationError);
      return;
    }
    setFormError('');
    setFormLoading(true);
    try {
      const payload = toPayload(form);
      if (editingId !== null) await api.put(`${endpoint}/${editingId}`, payload);
      else await api.post(endpoint, payload);
      closeForm();
      reload();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleteLoading(true);
    setDeleteError('');
    try {
      await api.delete(`${endpoint}/${confirmDelete.id}`);
      setConfirmDelete(null);
      reload();
    } catch (err) {
      // 409: elementul e folosit de produse; serverul trimite un mesaj explicit
      setDeleteError(getErrorMessage(err));
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <div>
            <h1 className="admin-title">{title}</h1>
            <p className="admin-subtitle">{items.length} înregistrări</p>
          </div>
          <button className="btn btn-primary" onClick={openAdd}>
            + Adaugă {singular}
          </button>
        </div>

        {listError && <div className="admin-error" role="alert">{listError}</div>}

        {loading ? (
          <div className="admin-loading">
            <div className="spinner" />
            <p>Se încarcă…</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  {columns.map((c) => <th key={c.label}>{c.label}</th>)}
                  <th>Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length + 2} className="table-empty">
                      Nu există înregistrări încă.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id}>
                      <td className="table-id">{item.id}</td>
                      {columns.map((c) => (
                        <td key={c.label} className={c.className}>{c.render(item)}</td>
                      ))}
                      <td className="table-actions">
                        <button className="btn btn-sm btn-outline" onClick={() => openEdit(item)}>
                          Editează
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => {
                            setDeleteError('');
                            setConfirmDelete(item);
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

        {showForm && (
          <div className="modal-overlay" onClick={closeForm}>
            <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">
                  {editingId !== null ? `Editează ${singular}` : `Adaugă ${singular}`}
                </h2>
                <button className="modal-close" onClick={closeForm} aria-label="Închide">✕</button>
              </div>

              {formError && <div className="admin-error" role="alert">{formError}</div>}

              <form onSubmit={handleSubmit} className="product-form" noValidate>
                {fields.map((f) => (
                  <div className="form-group" key={f.name}>
                    <label htmlFor={`field-${f.name}`}>{f.label}</label>
                    <input
                      id={`field-${f.name}`}
                      name={f.name}
                      type={f.type ?? 'text'}
                      min={f.min}
                      step={f.step}
                      placeholder={f.placeholder}
                      value={form[f.name] ?? ''}
                      onChange={handleChange}
                      disabled={formLoading}
                    />
                  </div>
                ))}

                <div className="form-actions">
                  <button type="button" className="btn btn-outline" onClick={closeForm} disabled={formLoading}>
                    Anulare
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={formLoading}>
                    {formLoading ? 'Se salvează…' : editingId !== null ? 'Salvează modificările' : 'Adaugă'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {confirmDelete && (
          <div className="modal-overlay" onClick={() => !deleteLoading && setConfirmDelete(null)}>
            <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">Confirmare ștergere</h2>
              </div>
              <p className="modal-body-text">
                Ești sigur că vrei să ștergi <strong>{itemName(confirmDelete)}</strong>?
                Această acțiune este ireversibilă.
              </p>

              {deleteError && <div className="admin-error" role="alert">{deleteError}</div>}

              <div className="form-actions">
                <button className="btn btn-outline" onClick={() => setConfirmDelete(null)} disabled={deleteLoading}>
                  {deleteError ? 'Închide' : 'Anulare'}
                </button>
                <button className="btn btn-danger" onClick={handleDelete} disabled={deleteLoading || deleteError !== ''}>
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
