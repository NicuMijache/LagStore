import AdminCatalogPage from '../components/AdminCatalogPage';
import type { DeliveryMethod } from '../types';
import { formatPrice } from '../utils/format';

export default function AdminDeliveryMethods() {
  return (
    <AdminCatalogPage<DeliveryMethod>
      title="Administrare metode de livrare"
      singular="metodă de livrare"
      endpoint="/deliverymethods"
      columns={[
        { label: 'Nume', render: (d) => d.name, className: 'table-name' },
        { label: 'Preț', render: (d) => (d.price === 0 ? 'Gratuită' : formatPrice(d.price)), className: 'table-price' },
        { label: 'Durată', render: (d) => `${d.estimatedDaysMin}–${d.estimatedDaysMax} zile` },
      ]}
      fields={[
        { name: 'name', label: 'Nume *', placeholder: 'ex: Curier rapid' },
        { name: 'price', label: 'Preț (RON) *', type: 'number', min: '0', step: '0.01' },
        { name: 'estimatedDaysMin', label: 'Zile minim *', type: 'number', min: '0', step: '1' },
        { name: 'estimatedDaysMax', label: 'Zile maxim *', type: 'number', min: '0', step: '1' },
      ]}
      emptyForm={{ name: '', price: '0', estimatedDaysMin: '1', estimatedDaysMax: '3' }}
      toForm={(d) => ({
        name: d.name,
        price: String(d.price),
        estimatedDaysMin: String(d.estimatedDaysMin),
        estimatedDaysMax: String(d.estimatedDaysMax),
      })}
      toPayload={(f) => ({
        name: f.name.trim(),
        price: Number(f.price),
        estimatedDaysMin: Number(f.estimatedDaysMin),
        estimatedDaysMax: Number(f.estimatedDaysMax),
      })}
      validate={(f) => {
        const price = Number(f.price);
        const min = Number(f.estimatedDaysMin);
        const max = Number(f.estimatedDaysMax);
        if (!f.name.trim()) return 'Numele metodei de livrare este obligatoriu.';
        if (f.price === '' || Number.isNaN(price) || price < 0) return 'Prețul nu poate fi negativ.';
        if (!Number.isInteger(min) || !Number.isInteger(max) || min < 0 || max < 0)
          return 'Numărul de zile trebuie să fie un număr întreg pozitiv.';
        if (min > max) return 'Numărul minim de zile nu poate depăși maximul.';
        return '';
      }}
      itemName={(d) => `metoda de livrare „${d.name}”`}
    />
  );
}
