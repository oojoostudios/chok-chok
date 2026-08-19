import type { Product } from '../types';

export const SAMPLE_PRODUCTS: Product[] = [
  // Beauty
  { id: '1', name: 'Gel Cleanser',     brand: 'Placeholder Co.', type: 'beauty', category: 'cleanser',    concerns: ['barrier'],          frequency: 'AM+PM',     status: 'have', priceNote: '$24', buyUrl: 'https://example.com' },
  { id: '2', name: 'Vitamin C Serum',  brand: 'Placeholder Co.', type: 'beauty', category: 'serum',       concerns: ['brightening'],      frequency: 'AM',        status: 'have', priceNote: '$38', buyUrl: 'https://example.com' },
  { id: '3', name: 'Rich Moisturizer', brand: 'Placeholder Co.', type: 'beauty', category: 'moisturizer', concerns: ['hydration'],        frequency: 'AM+PM',     status: 'have', priceNote: '$30', buyUrl: 'https://example.com' },
  { id: '4', name: 'Niacinamide 10%',  brand: 'Placeholder Co.', type: 'beauty', category: 'treatment',   concerns: ['pores','texture'],  frequency: 'PM',        status: 'have', priceNote: '$16', buyUrl: 'https://example.com' },
  { id: '5', name: 'Daily SPF 50',     brand: 'Placeholder Co.', type: 'beauty', category: 'spf',         concerns: ['other'],            frequency: 'AM',        status: 'have', priceNote: '$28', buyUrl: 'https://example.com' },
  { id: '6', name: 'Lip Butter Balm',  brand: 'Placeholder Co.', type: 'beauty', category: 'lip',         concerns: ['hydration'],        frequency: 'as-needed', status: 'want', priceNote: '$18', buyUrl: 'https://example.com' },

  // Wellness — neutral placeholders you organize. NOT recommendations, NO health claims.
  { id: '7',  name: 'Vitamin D3', brand: 'Placeholder Co.', type: 'wellness', category: 'vitamin',    concerns: [], frequency: 'AM', status: 'have', dosage: '1000 IU',   priceNote: '$12' },
  { id: '8',  name: 'Magnesium',  brand: 'Placeholder Co.', type: 'wellness', category: 'mineral',    concerns: [], frequency: 'PM', status: 'have', dosage: '400 mg',    priceNote: '$15' },
  { id: '9',  name: 'Omega-3',    brand: 'Placeholder Co.', type: 'wellness', category: 'supplement', concerns: [], frequency: 'AM', status: 'have', dosage: '1000 mg',   priceNote: '$20' },
  { id: '10', name: 'Collagen',   brand: 'Placeholder Co.', type: 'wellness', category: 'supplement', concerns: [], frequency: 'AM', status: 'have', dosage: '10 g',      priceNote: '$28' },
  { id: '11', name: 'Probiotic',  brand: 'Placeholder Co.', type: 'wellness', category: 'supplement', concerns: [], frequency: 'AM', status: 'want', dosage: '1 capsule', priceNote: '$22' },
];
