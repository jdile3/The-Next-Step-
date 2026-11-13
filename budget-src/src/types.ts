export type AccountType = 'Checking' | 'Savings' | 'Cash' | 'Credit Card' | 'Loan';

export interface Account {
  id: number | string;
  name: string;
  type: AccountType;
  statementBalance: number;
  balanceDate: string;
  archived?: boolean;
}

export interface Transaction {
  id: string;
  key?: string;
  date: string;
  description: string;
  amount: number;
  accountId: number | string;
  category: string;
  txType?: string;
  source?: 'Manual' | 'Imported' | 'Receipt Scan' | 'Bill System' | string;
  billId?: number | string;
  extraMeta?: Record<string, string>;
}

export interface Bill {
  id: number | string;
  name: string;
  amount: number;
  dueDay: number;
  dueDate?: string;
  category: string;
  accountId: number | string;
  paidMonths?: Record<string, boolean>;
  archived?: boolean;
  source?: string;
}

export interface Goal {
  id: number | string;
  name: string;
  targetAmount: number;
  targetDate: string;
  amountPerPayPeriod: number;
  status: 'what_if' | 'on_plan' | 'completed';
  assignedTxIds?: string[];
  archived?: boolean;
}

export type PayPeriodFrequency = 'weekly' | 'biweekly' | 'monthly';

export interface PayPeriodSettings {
  frequency: PayPeriodFrequency;
  anchorDate: string; // YYYY-MM-DD of a known start date / payday
}

export interface AppSettings {
  theme: string;
  hourlyRate: number;
  showFutureYou?: boolean;
  showRealityCheck?: boolean;
  trackedHabitCategory?: string;
  swipeNav: boolean;
  largeText: boolean;
  reduceAnimations: boolean;
  payPeriod: PayPeriodSettings;
  installDate?: string;
  isPro?: boolean;
  proSource?: 'trial' | 'purchased' | 'vip_passcode';
  ownershipSig?: string;
  unlockedAt?: string;
}

export interface PayPeriodInfo {
  startDate: string;      // YYYY-MM-DD
  endDate: string;        // YYYY-MM-DD
  nextPayday: string;     // YYYY-MM-DD
  daysLeft: number;       // days remaining in this period
  totalDays: number;      // total days in this cycle
  label: string;          // Human friendly label, e.g. "Nov 1 – Nov 14"
  formattedRange: string; // Full formatted range
}

export interface AppData {
  accounts: Account[];
  transactions: Transaction[];
  bills: Bill[];
  goals: Goal[];
  carriedForward: number;
  merchantRules: Record<string, string>;
  customCategories: string[];
  settings: AppSettings;
}

export type NavigationTab = 'home' | 'transactions' | 'calendar' | 'accounts' | 'more';
export type MoreSubPage = 'bills' | 'goals' | 'insights' | 'settings' | null;

export interface CsvCustomColumn {
  colIndex: number;
  header: string;
  include: boolean;
  ledgerName: string;
}

export interface DetectedBill {
  merchant: string;
  averageAmount: number;
  dueDay: number;
  reason: string;
}
