export interface Category {
  id: number;
  name: string;
}

export interface Supplier {
  id: number;
  name: string;
  contactEmail: string;
  contactPhone?: string | null;
}

export interface DeliveryMethod {
  id: number;
  name: string;
  price: number;
  estimatedDaysMin: number;
  estimatedDaysMax: number;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  specifications: string;
  price: number;
  stock: number;
  categoryId: number;
  categoryName: string;
  supplierId: number;
  supplierName: string;
  deliveryMethodId: number;
  deliveryMethodName: string;
  deliveryPrice: number;
  estimatedDaysMin: number;
  estimatedDaysMax: number;
}

export interface ProductSave {
  name: string;
  description: string;
  specifications: string;
  price: number;
  stock: number;
  categoryId: number;
  supplierId: number;
  deliveryMethodId: number;
}

export interface AuthResponse {
  token: string;
  email: string;
  fullName: string;
  role: string;
}

export interface WishlistItem extends Product {
  addedAt: string;
}

export interface CartItem {
  productId: number;
  productName: string;
  categoryName: string;
  unitPrice: number;
  quantity: number;
  stock: number;
  subtotal: number;
}

export interface Cart {
  items: CartItem[];
  itemCount: number;
  total: number;
}

export type OrderStatus = 'Plasata' | 'InProcesare' | 'Expediata' | 'Livrata' | 'Anulata';

export interface OrderItem {
  productId: number | null;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: number;
  createdAt: string;
  status: OrderStatus;
  customerEmail: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  county: string;
  postalCode: string;
  notes: string | null;
  deliveryMethodName: string;
  deliveryPrice: number;
  itemsTotal: number;
  total: number;
  itemCount: number;
  items: OrderItem[];
}

/** Datele trimise la checkout. Prețurile și totalurile le calculează serverul. */
export interface CheckoutData {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  county: string;
  postalCode: string;
  notes: string;
  deliveryMethodId: number;
}
