export interface CreditNoteCellProps {
  note: {
    status: 'pending' | 'authorized' | 'failed';
    pointOfSale: number;
    number?: number;
    reason?: string;
    emailSentAt?: string;
    lastError?: string;
    publicUrl?: string;
  };
  isBusy: boolean;
  onResend: () => void;
  onRetry: () => void;
}
