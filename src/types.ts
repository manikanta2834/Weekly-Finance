export type Language = 'en' | 'te';

export type ActiveView = 'landing' | 'dashboard' | 'calculator' | 'login';

export type PaymentStatus = 'pending' | 'paid' | 'defaulted' | 'partial';

export interface WeeklyPayment {
  id: string;
  borrower_id: string;
  week_number: number;
  due_date: string;
  amount_due: number;
  status: PaymentStatus;
  paid_date: string | null;
  paid_amount: number | null;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Borrower {
  id: string;
  user_id: string;
  name: string;
  date: string; // Loan start date (YYYY-MM-DD)
  mobile_number: string;
  city_name: string;
  surity: string; // Guarantor name
  amount: number; // Principal lent (e.g. 10000)
  weekly_amount: number; // Fixed weekly collection (e.g. 600)
  duration_weeks: number; // e.g. 21
  total_amount: number; // weekly_amount * duration_weeks
  interest_amount: number; // total_amount - amount
  created_at: string;
  updated_at: string;
  // Hydrated helper fields
  payments?: WeeklyPayment[];
}

export interface LoanCalculation {
  principalAmount: number;
  weeklyAmount: number;
  durationWeeks: number;
  totalAmount: number;
  interestAmount: number;
  roiPercentage: number;
  weeklyInterestGain: number;
}

export interface DashboardStats {
  totalActiveLoans: number;
  totalCompletedLoans: number;
  totalPrincipalDisbursed: number;
  totalExpectedCollection: number;
  totalInterestEarned: number;
  totalCollectedSoFar: number;
  totalPendingBalance: number;
  thisWeekDueCount: number;
  thisWeekDueAmount: number;
  collectionRatePercentage: number;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  business_name?: string;
  phone?: string;
  is_demo?: boolean;
}
