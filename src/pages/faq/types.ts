export interface FAQ {
  _id: string;
  question: string;
  answer: string;
  iconName: string;
  category: 'general' | 'purchase-process' | 'courses';
  order: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface FAQFormData {
  question: string;
  answer: string;
  iconName: string;
  category: 'general' | 'purchase-process' | 'courses';
  order: number;
  status: 'active' | 'inactive';
}
