export interface Goal {
  id: string;
  title: string;
  currentAmount: number;
  targetAmount: number;
  timeLeft?: string;
  isCompleted?: boolean;
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'pink';
  icon: string;
}

export interface Limit {
  id: string;
  category: string;
  spent: number;
  limit: number;
  icon: string;
  color: 'blue' | 'red' | 'purple' | 'amber';
  isSubcategory?: boolean;
}

export interface Transaction {
  id: string;
  category: string;
  date: string;
  amount: number;
  type: 'expense' | 'income';
  icon: string;
  color: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  subcategories?: string[];
  type: 'expense' | 'income';
}

export interface MonthlyFlow {
  name: string;
  income: number;
  expense: number;
}

export interface DailyFlow {
  day: number;
  income: number;
  expense: number;
  hasData: boolean;
}

// Supabase table types
export interface ProfileDB {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  goal: string | null;
  experience: string | null;
  occupation: string | null;
  cpf_cnpj: string | null;
  asaas_customer_id: string | null;
  updated_at: string | null; // ISO
}

export interface CategoryDB {
  id: string;
  user_id: string;
  name: string;
  icon: string | null;
  type: 'income' | 'expense';
  is_default?: boolean;
  created_at: string;
}

export interface SubcategoryDB {
  id: string;
  category_id: string;
  name: string;
  is_default?: boolean;
}

export interface TransactionDB {
  id: string;
  user_id: string;
  category_id: string;
  subcategory_id: string | null;
  description: string | null;
  amount: number;
  date: string; // YYYY-MM-DD
  type: 'income' | 'expense';
  created_at: string;
}

export interface GoalDB {
  id: string;
  user_id: string;
  title: string;
  current_amount: number;
  target_amount: number;
  target_date: string | null; // YYYY-MM-DD
  color: string | null;
  icon: string | null;
  is_completed: boolean;
}

export interface LimitDB {
  id: string;
  user_id: string;
  category_id: string;
  limit_amount: number;
}
