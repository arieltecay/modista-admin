export interface InvoiceStatusBadgeProps {
  status: 'pending' | 'authorized' | 'failed';
  /** Comprobante de prueba: se rotula para que nadie lo tome por uno real. */
  isTest?: boolean;
}
