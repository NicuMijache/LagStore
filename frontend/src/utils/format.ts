import type { OrderStatus } from '../types';

export function formatPrice(value: number): string {
  return value.toLocaleString('ro-RO', {
    style: 'currency',
    currency: 'RON',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatDate(iso: string): string {
  // Serverul trimite date UTC fără sufix "Z"
  const date = new Date(iso.endsWith('Z') ? iso : `${iso}Z`);
  return date.toLocaleString('ro-RO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const ORDER_STATUSES: OrderStatus[] = ['Plasata', 'InProcesare', 'Expediata', 'Livrata', 'Anulata'];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  Plasata: 'Plasată',
  InProcesare: 'În procesare',
  Expediata: 'Expediată',
  Livrata: 'Livrată',
  Anulata: 'Anulată',
};
