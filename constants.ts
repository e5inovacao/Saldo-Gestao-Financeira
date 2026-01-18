import { Goal, Limit, Transaction, Category, MonthlyFlow, DailyFlow } from './types';

export const GOALS_DATA: Goal[] = [];

export const LIMITS_DATA: Limit[] = [
  { id: '1', category: 'Moradia', spent: 2800, limit: 3000, icon: 'home', color: 'blue', isSubcategory: false },
  { id: '2', category: 'Aluguel', spent: 2800, limit: 2800, icon: 'receipt_long', color: 'blue', isSubcategory: true },
  { id: '3', category: 'Alimentação', spent: 545.60, limit: 800, icon: 'shopping_cart', color: 'red', isSubcategory: false },
  { id: '4', category: 'Supermercado', spent: 447.60, limit: 600, icon: 'local_mall', color: 'red', isSubcategory: true },
  { id: '5', category: 'Restaurantes', spent: 98.00, limit: 200, icon: 'restaurant', color: 'red', isSubcategory: true },
  { id: '6', category: 'Lazer', spent: 98.00, limit: 400, icon: 'movie', color: 'purple', isSubcategory: false },
  { id: '7', category: 'Transporte', spent: 0, limit: 250, icon: 'commute', color: 'amber', isSubcategory: false },
];

export const RECENT_TRANSACTIONS: Transaction[] = [];

export const ALL_TRANSACTIONS: Transaction[] = [];

export const EXPENSES_BY_CATEGORY_DATA = [
  { name: 'Moradia', value: 2920, color: '#3b82f6' }, // blue-500
  { name: 'Alimentação', value: 585.60, color: '#ef4444' }, // red-500
  { name: 'Lazer', value: 153.90, color: '#a855f7' }, // purple-500
  { name: 'Saúde', value: 150.00, color: '#14b8a6' }, // teal-500
  { name: 'Transporte', value: 204.90, color: '#f59e0b' }, // amber-500
];

export const CATEGORIES_DATA: Category[] = [
  { 
    id: '1', 
    name: 'Moradia', 
    icon: 'home', 
    type: 'expense',
    subcategories: ['Aluguel', 'Condomínio', 'Energia']
  },
  { 
    id: '2', 
    name: 'Alimentação', 
    icon: 'restaurant', 
    type: 'expense',
    subcategories: ['Supermercado', 'Restaurantes e Bares']
  },
  { 
    id: '3', 
    name: 'Transporte', 
    icon: 'directions_car', 
    type: 'expense',
    subcategories: ['Combustível']
  },
  { 
    id: '4', 
    name: 'Salário', 
    icon: 'work', 
    type: 'income',
    subcategories: ['Salário']
  },
  { 
    id: '5', 
    name: 'Investimentos', 
    icon: 'savings', 
    type: 'income',
    subcategories: []
  },
];

export const CHART_DATA: MonthlyFlow[] = [
  { name: 'Semana 1', income: 4000, expense: 2400 },
  { name: 'Semana 2', income: 3000, expense: 1398 },
  { name: 'Semana 3', income: 2000, expense: 3800 },
  { name: 'Semana 4', income: 5000, expense: 2000 },
];

export const YEARLY_CHART_DATA: MonthlyFlow[] = [
  { name: 'Jan', income: 4500, expense: 3200 },
  { name: 'Fev', income: 4500, expense: 3400 },
  { name: 'Mar', income: 4500, expense: 2800 },
  { name: 'Abr', income: 4800, expense: 4000 },
  { name: 'Mai', income: 4800, expense: 3500 },
  { name: 'Jun', income: 5500, expense: 4200 },
  { name: 'Jul', income: 5500, expense: 3800 },
  { name: 'Ago', income: 5200, expense: 3900 },
  { name: 'Set', income: 5200, expense: 3600 },
  { name: 'Out', income: 5200, expense: 4100 },
  { name: 'Nov', income: 6800, expense: 5000 },
  { name: 'Dez', income: 8000, expense: 6000 },
];

// Mock data for the calendar view (current month)
export const CALENDAR_DATA: DailyFlow[] = [];
