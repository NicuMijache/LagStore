import AdminCatalogPage from '../components/AdminCatalogPage';
import type { Category } from '../types';

export default function AdminCategories() {
  return (
    <AdminCatalogPage<Category>
      title="Administrare categorii"
      singular="categorie"
      endpoint="/categories"
      columns={[{ label: 'Nume', render: (c) => c.name, className: 'table-name' }]}
      fields={[{ name: 'name', label: 'Nume categorie *', placeholder: 'ex: Mouse-uri' }]}
      emptyForm={{ name: '' }}
      toForm={(c) => ({ name: c.name })}
      toPayload={(f) => ({ name: f.name.trim() })}
      validate={(f) => {
        if (!f.name.trim()) return 'Numele categoriei este obligatoriu.';
        if (f.name.trim().length > 100) return 'Numele poate avea maxim 100 de caractere.';
        return '';
      }}
      itemName={(c) => `categoria „${c.name}”`}
    />
  );
}
