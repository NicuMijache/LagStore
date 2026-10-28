import AdminCatalogPage from '../components/AdminCatalogPage';
import type { Supplier } from '../types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AdminSuppliers() {
  return (
    <AdminCatalogPage<Supplier>
      title="Administrare furnizori"
      singular="furnizor"
      endpoint="/suppliers"
      columns={[
        { label: 'Nume', render: (s) => s.name, className: 'table-name' },
        { label: 'Email', render: (s) => s.contactEmail },
        { label: 'Telefon', render: (s) => s.contactPhone || '—' },
      ]}
      fields={[
        { name: 'name', label: 'Nume furnizor *', placeholder: 'ex: Logitech' },
        { name: 'contactEmail', label: 'Email de contact *', type: 'email', placeholder: 'contact@firma.ro' },
        { name: 'contactPhone', label: 'Telefon (opțional)', type: 'tel', placeholder: '0721 000 000' },
      ]}
      emptyForm={{ name: '', contactEmail: '', contactPhone: '' }}
      toForm={(s) => ({ name: s.name, contactEmail: s.contactEmail, contactPhone: s.contactPhone ?? '' })}
      toPayload={(f) => ({
        name: f.name.trim(),
        contactEmail: f.contactEmail.trim(),
        contactPhone: f.contactPhone.trim() || null,
      })}
      validate={(f) => {
        if (!f.name.trim()) return 'Numele furnizorului este obligatoriu.';
        if (!EMAIL_REGEX.test(f.contactEmail.trim())) return 'Introdu o adresă de email validă.';
        return '';
      }}
      itemName={(s) => `furnizorul „${s.name}”`}
    />
  );
}
