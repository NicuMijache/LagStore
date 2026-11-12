import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { getErrorMessage } from '../api/errors';
import type { Cart, CheckoutData, DeliveryMethod, Order } from '../types';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import { formatPrice } from '../utils/format';
import Icon from '../components/Icon';
import { SkeletonRows } from '../components/Skeleton';
import './Shop.css';

const COUNTIES = [
  'Alba', 'Arad', 'Argeș', 'Bacău', 'Bihor', 'Bistrița-Năsăud', 'Botoșani', 'Brăila', 'Brașov',
  'București', 'Buzău', 'Călărași', 'Caraș-Severin', 'Cluj', 'Constanța', 'Covasna', 'Dâmbovița',
  'Dolj', 'Galați', 'Giurgiu', 'Gorj', 'Harghita', 'Hunedoara', 'Ialomița', 'Iași', 'Ilfov',
  'Maramureș', 'Mehedinți', 'Mureș', 'Neamț', 'Olt', 'Prahova', 'Sălaj', 'Satu Mare', 'Sibiu',
  'Suceava', 'Teleorman', 'Timiș', 'Tulcea', 'Vâlcea', 'Vaslui', 'Vrancea',
];

// Aceeași regulă ca pe server: mobil (07…) sau fix (02…, 03…), opțional cu prefix +40
const PHONE_REGEX = /^(\+40|0040|0)[237]\d{8}$/;
const POSTAL_REGEX = /^\d{6}$/;

type FieldName = 'fullName' | 'phone' | 'address' | 'city' | 'county' | 'postalCode' | 'notes';
type FieldErrors = Partial<Record<FieldName | 'deliveryMethodId', string>>;

/** Elimină spațiile, punctele și cratimele din numărul de telefon */
const normalizePhone = (phone: string) => phone.replace(/[\s.-]/g, '');

function validate(form: CheckoutData): FieldErrors {
  const errors: FieldErrors = {};
  if (!form.fullName.trim()) errors.fullName = 'Numele complet este obligatoriu.';
  if (!PHONE_REGEX.test(normalizePhone(form.phone)))
    errors.phone = 'Introdu un număr de telefon românesc valid (ex: 0722 123 456).';
  if (!form.address.trim()) errors.address = 'Adresa este obligatorie.';
  if (!form.city.trim()) errors.city = 'Orașul este obligatoriu.';
  if (!form.county) errors.county = 'Selectează județul.';
  if (!POSTAL_REGEX.test(form.postalCode.trim()))
    errors.postalCode = 'Codul poștal trebuie să aibă exact 6 cifre.';
  if (form.notes.length > 500) errors.notes = 'Observațiile pot avea maxim 500 de caractere.';
  if (!form.deliveryMethodId) errors.deliveryMethodId = 'Alege o metodă de livrare.';
  return errors;
}

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refreshCart } = useShop();

  const [cart, setCart] = useState<Cart | null>(null);
  const [deliveryMethods, setDeliveryMethods] = useState<DeliveryMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [form, setForm] = useState<CheckoutData>({
    fullName: user?.fullName ?? '',
    phone: '',
    address: '',
    city: '',
    county: '',
    postalCode: '',
    notes: '',
    deliveryMethodId: 0,
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([api.get<Cart>('/cart'), api.get<DeliveryMethod[]>('/deliverymethods')])
      .then(([cartRes, deliveryRes]) => {
        if (cancelled) return;
        setCart(cartRes.data);
        setDeliveryMethods(deliveryRes.data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setLoadError(getErrorMessage(err));
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const selectedDelivery = deliveryMethods.find((d) => d.id === form.deliveryMethodId);
  const deliveryPrice = selectedDelivery?.price ?? 0;
  const itemsTotal = cart?.total ?? 0;

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const selectDelivery = (id: number) => {
    setForm((prev) => ({ ...prev, deliveryMethodId: id }));
    setFieldErrors((prev) => ({ ...prev, deliveryMethodId: undefined }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errors = validate(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setSubmitError('Verifică câmpurile marcate.');
      return;
    }

    setSubmitError('');
    setSubmitting(true);
    try {
      // Se trimit doar datele clientului și id-ul livrării; totalul îl calculează serverul
      const payload: CheckoutData = {
        ...form,
        fullName: form.fullName.trim(),
        phone: normalizePhone(form.phone),
        address: form.address.trim(),
        city: form.city.trim(),
        postalCode: form.postalCode.trim(),
        notes: form.notes.trim(),
      };
      const { data } = await api.post<Order>('/orders', payload);
      refreshCart();
      navigate(`/orders/${data.id}`, { state: { justPlaced: true } });
    } catch (err) {
      setSubmitError(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  const inputProps = (name: FieldName) => ({
    id: `checkout-${name}`,
    name,
    value: form[name],
    onChange: handleChange,
    disabled: submitting,
    className: fieldErrors[name] ? 'invalid' : undefined,
    'aria-invalid': fieldErrors[name] ? true : undefined,
  });

  const fieldError = (name: FieldName) =>
    fieldErrors[name] && <span className="field-error">{fieldErrors[name]}</span>;

  if (loading) {
    return (
      <div className="shop-page">
        <div className="shop-container">
          <p className="eyebrow">Se pregătește comanda…</p>
          <SkeletonRows />
        </div>
      </div>
    );
  }

  if (loadError || !cart) {
    return (
      <div className="shop-page">
        <div className="shop-container">
          <div className="empty-state" role="alert">
            <h1 className="empty-state-title">Nu am putut încărca datele comenzii</h1>
            <p className="empty-state-text">{loadError || 'Încearcă din nou din pagina coșului.'}</p>
            <Link to="/cart" className="btn">Înapoi la coș</Link>
          </div>
        </div>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="shop-page">
        <div className="shop-container">
          <div className="empty-state">
            <h1 className="empty-state-title">Coșul tău este gol</h1>
            <p className="empty-state-text">Nu ai ce comanda încă. Adaugă produse din catalog.</p>
            <Link to="/" className="btn">Mergi la catalog</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="shop-page">
      <div className="shop-container">
        <div className="shop-header">
          <div>
            <h1 className="shop-title">Finalizare comandă</h1>
            <p className="shop-subtitle">Completează datele de livrare și alege metoda de livrare.</p>
          </div>
          <Link to="/cart" className="back-link checkout-back">
            <Icon name="arrowLeft" size={16} />
            Înapoi la coș
          </Link>
        </div>

        <form onSubmit={handleSubmit} noValidate className="shop-layout">
          <div className="checkout-form">
            {submitError && <div className="shop-error" role="alert">{submitError}</div>}

            <section className="shop-panel">
              <h2 className="shop-panel-title">Date de livrare</h2>
              <div className="checkout-fields">
                <div className="form-group span-2">
                  <label htmlFor="checkout-fullName">Nume complet *</label>
                  <input type="text" autoComplete="name" placeholder="Ion Popescu" {...inputProps('fullName')} />
                  {fieldError('fullName')}
                </div>
                <div className="form-group">
                  <label htmlFor="checkout-phone">Telefon *</label>
                  <input type="tel" autoComplete="tel" placeholder="0722 123 456" {...inputProps('phone')} />
                  {fieldError('phone')}
                </div>
                <div className="form-group">
                  <label htmlFor="checkout-postalCode">Cod poștal *</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    autoComplete="postal-code"
                    placeholder="010101"
                    {...inputProps('postalCode')}
                  />
                  {fieldError('postalCode')}
                </div>
                <div className="form-group span-2">
                  <label htmlFor="checkout-address">Adresă *</label>
                  <input
                    type="text"
                    autoComplete="street-address"
                    placeholder="Str. Exemplu nr. 10, bl. A, ap. 5"
                    {...inputProps('address')}
                  />
                  {fieldError('address')}
                </div>
                <div className="form-group">
                  <label htmlFor="checkout-city">Oraș *</label>
                  <input type="text" autoComplete="address-level2" placeholder="Cluj-Napoca" {...inputProps('city')} />
                  {fieldError('city')}
                </div>
                <div className="form-group">
                  <label htmlFor="checkout-county">Județ *</label>
                  <select {...inputProps('county')}>
                    <option value="">Selectează județul…</option>
                    {COUNTIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  {fieldError('county')}
                </div>
                <div className="form-group span-2">
                  <label htmlFor="checkout-notes">Observații (opțional)</label>
                  <textarea rows={3} placeholder="ex: sunați înainte de livrare" {...inputProps('notes')} />
                  {fieldError('notes')}
                </div>
              </div>
            </section>

            <section className="shop-panel">
              <h2 className="shop-panel-title">Metodă de livrare</h2>
              {deliveryMethods.length === 0 ? (
                <p>Nu există metode de livrare disponibile momentan.</p>
              ) : (
                <div className="delivery-options" role="radiogroup" aria-label="Metodă de livrare">
                  {deliveryMethods.map((d) => (
                    <label
                      key={d.id}
                      className={`delivery-option ${form.deliveryMethodId === d.id ? 'selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="deliveryMethodId"
                        value={d.id}
                        checked={form.deliveryMethodId === d.id}
                        onChange={() => selectDelivery(d.id)}
                        disabled={submitting}
                      />
                      <span className="delivery-option-info">
                        <span className="delivery-option-name">{d.name}</span>
                        <span className="delivery-option-days">
                          {d.estimatedDaysMin}–{d.estimatedDaysMax} zile lucrătoare
                        </span>
                      </span>
                      <span className="delivery-option-price">
                        {d.price === 0 ? 'Gratuită' : formatPrice(d.price)}
                      </span>
                    </label>
                  ))}
                </div>
              )}
              {fieldErrors.deliveryMethodId && (
                <span className="field-error">{fieldErrors.deliveryMethodId}</span>
              )}
            </section>

            <section className="shop-panel">
              <h2 className="shop-panel-title">Plată</h2>
              <p className="payment-box">
                <strong>Plata la livrare (ramburs).</strong> Plătești curierului când primești coletul.
              </p>
            </section>
          </div>

          <aside className="shop-sidebar">
            <div className="shop-panel">
              <h2 className="shop-panel-title">Rezumat comandă</h2>
              <ul className="summary-items">
                {cart.items.map((i) => (
                  <li key={i.productId}>
                    <span>{i.quantity} × {i.productName}</span>
                    <span>{formatPrice(i.subtotal)}</span>
                  </li>
                ))}
              </ul>
              <div className="summary-row">
                <span>Produse</span>
                <span>{formatPrice(itemsTotal)}</span>
              </div>
              <div className="summary-row">
                <span>Livrare{selectedDelivery ? ` (${selectedDelivery.name})` : ''}</span>
                <span>
                  {!selectedDelivery ? '—' : deliveryPrice === 0 ? 'Gratuită' : formatPrice(deliveryPrice)}
                </span>
              </div>
              <div className="summary-row summary-total">
                <span>Total</span>
                <span>{formatPrice(itemsTotal + deliveryPrice)}</span>
              </div>
              <button
                id="btn-place-order"
                type="submit"
                className="btn btn-full"
                disabled={submitting}
              >
                {submitting ? 'Se plasează comanda…' : 'Plasează comanda'}
              </button>
              <p className="summary-note">Nu îți cerem datele cardului: plătești doar la primirea coletului.</p>
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
}
