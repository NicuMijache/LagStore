import type { OrderStatus } from '../types';
import { ORDER_STATUS_LABELS } from '../utils/format';

/** Stările se disting prin ton: livrată = plin negru, anulată = gri, restul = contur. */
const VARIANT: Record<OrderStatus, string> = {
  Plasata: '',
  InProcesare: '',
  Expediata: '',
  Livrata: 'badge--solid',
  Anulata: 'badge--muted',
};

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`badge order-status order-status-${status} ${VARIANT[status]}`}>
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}
