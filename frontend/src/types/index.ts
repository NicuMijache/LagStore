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
