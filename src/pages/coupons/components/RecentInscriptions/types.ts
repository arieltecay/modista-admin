export interface RecentInscriptionsProps {
  rows: Array<{ name: string; status: 'pending' | 'paid' | 'partial'; date: string; price: number }>;
}
