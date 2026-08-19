import type { Product } from '../types';

export const SAMPLE_PRODUCTS: Product[] = [
  { id: '1', name: 'Gel Cleanser',    brand: 'Placeholder Co.', category: 'cleanser',    concerns: ['barrier'],          frequency: 'AM+PM',     status: 'have', priceNote: '$24', buyUrl: 'https://example.com' },
  { id: '2', name: 'Vitamin C Serum', brand: 'Placeholder Co.', category: 'serum',       concerns: ['brightening'],      frequency: 'AM',        status: 'have', priceNote: '$38', buyUrl: 'https://example.com' },
  { id: '3', name: 'Rich Moisturizer',brand: 'Placeholder Co.', category: 'moisturizer', concerns: ['hydration'],        frequency: 'AM+PM',     status: 'have', priceNote: '$30', buyUrl: 'https://example.com' },
  { id: '4', name: 'Niacinamide 10%', brand: 'Placeholder Co.', category: 'treatment',   concerns: ['pores','texture'],  frequency: 'PM',        status: 'have', priceNote: '$16', buyUrl: 'https://example.com' },
  { id: '5', name: 'Daily SPF 50',    brand: 'Placeholder Co.', category: 'spf',         concerns: ['other'],            frequency: 'AM',        status: 'have', priceNote: '$28', buyUrl: 'https://example.com' },
  { id: '6', name: 'Lip Butter Balm', brand: 'Placeholder Co.', category: 'lip',         concerns: ['hydration'],        frequency: 'as-needed', status: 'want', priceNote: '$18', buyUrl: 'https://example.com' },
];
