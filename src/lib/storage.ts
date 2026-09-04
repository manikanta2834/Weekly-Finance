import { Borrower, DashboardStats, PaymentStatus, UserProfile, WeeklyPayment } from '../types';
import { calculateLoan, generateWeeklySchedule, getBorrowerProgress } from './calculator';
import { isSupabaseConfigured, supabase } from './supabase';

const STORAGE_KEY = 'vaddi_vault_borrowers_v1';
const USER_KEY = 'vaddi_vault_current_user_v1';

// Seed initial realistic data demonstrating the exact ₹10,000 -> ₹12,600 in 21 weeks formula
function getInitialSeedBorrowers(userId: string): Borrower[] {
  const today = new Date();
  
  // Helper to format ISO date minus N weeks
  const getPastDate = (weeksAgo: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (weeksAgo * 7));
    return d.toISOString().split('T')[0];
  };

  const b1Id = 'b-ravi-kumar-101';
  const b1Calc = calculateLoan(10000, 600, 21);
  const b1Schedule = generateWeeklySchedule(b1Id, getPastDate(8), 600, 21);
  // Mark first 7 weeks paid, week 8 pending
  b1Schedule.forEach((p, idx) => {
    if (idx < 7) {
      p.status = 'paid';
      p.paid_date = p.due_date;
      p.paid_amount = 600;
    } else if (idx === 7) {
      p.status = 'pending';
    }
  });

  const b2Id = 'b-venkat-rao-102';
  const b2Calc = calculateLoan(10000, 600, 21);
  const b2Schedule = generateWeeklySchedule(b2Id, getPastDate(22), 600, 21);
  // Mark all 21 weeks paid (Fully Paid borrower)
  b2Schedule.forEach((p) => {
    p.status = 'paid';
    p.paid_date = p.due_date;
    p.paid_amount = 600;
  });

  const b3Id = 'b-lakshmi-devi-103';
  const b3Calc = calculateLoan(20000, 1200, 21);
  const b3Schedule = generateWeeklySchedule(b3Id, getPastDate(4), 1200, 21);
  b3Schedule.forEach((p, idx) => {
    if (idx < 3) {
      p.status = 'paid';
      p.paid_date = p.due_date;
      p.paid_amount = 1200;
    } else if (idx === 3) {
      p.status = 'partial';
      p.paid_date = p.due_date;
      p.paid_amount = 600; // paid 600 out of 1200
      p.notes = 'Paid half this week; remaining balance next Monday';
    }
  });

  const b4Id = 'b-suresh-reddy-104';
  const b4Calc = calculateLoan(10000, 600, 21);
  const b4Schedule = generateWeeklySchedule(b4Id, getPastDate(12), 600, 21);
  b4Schedule.forEach((p, idx) => {
    if (idx < 9) {
      p.status = 'paid';
      p.paid_date = p.due_date;
      p.paid_amount = 600;
    } else if (idx === 9) {
      p.status = 'defaulted';
      p.notes = 'Phone switched off on collection round';
    } else if (idx === 10) {
      p.status = 'pending';
    }
  });

  const b5Id = 'b-anjaneyulu-105';
  const b5Calc = calculateLoan(50000, 3000, 20);
  const b5Schedule = generateWeeklySchedule(b5Id, getPastDate(2), 3000, 20);
  b5Schedule.forEach((p, idx) => {
    if (idx < 2) {
      p.status = 'paid';
      p.paid_date = p.due_date;
      p.paid_amount = 3000;
    }
  });

  return [
    {
      id: b1Id,
      user_id: userId,
      name: 'Ravi Kumar (రవి కుమార్)',
      date: getPastDate(8),
      mobile_number: '9848022338',
      city_name: 'Guntur (గుంటూరు)',
      surity: 'Srinivas Rao (శ్రీనివాస రావు)',
      amount: 10000,
      weekly_amount: 600,
      duration_weeks: 21,
      total_amount: b1Calc.totalAmount,
      interest_amount: b1Calc.interestAmount,
      created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
      payments: b1Schedule,
    },
    {
      id: b2Id,
      user_id: userId,
      name: 'Venkat Rao (వెంకట్ రావు)',
      date: getPastDate(22),
      mobile_number: '9849155667',
      city_name: 'Vijayawada (విజయవాడ)',
      surity: 'K. Balakrishna (బాలకృష్ణ)',
      amount: 10000,
      weekly_amount: 600,
      duration_weeks: 21,
      total_amount: b2Calc.totalAmount,
      interest_amount: b2Calc.interestAmount,
      created_at: new Date(Date.now() - 150 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
      payments: b2Schedule,
    },
    {
      id: b3Id,
      user_id: userId,
      name: 'Lakshmi Devi (లక్ష్మీ దేవి)',
      date: getPastDate(4),
      mobile_number: '9440188990',
      city_name: 'Tenali (తెనాలి)',
      surity: 'Subba Rao (సుబ్బారావు)',
      amount: 20000,
      weekly_amount: 1200,
      duration_weeks: 21,
      total_amount: b3Calc.totalAmount,
      interest_amount: b3Calc.interestAmount,
      created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
      payments: b3Schedule,
    },
    {
      id: b4Id,
      user_id: userId,
      name: 'Suresh Reddy (సురేష్ రెడ్డి)',
      date: getPastDate(12),
      mobile_number: '9701455661',
      city_name: 'Ongole (ఒంగోలు)',
      surity: 'M. Narayana (నారాయణ)',
      amount: 10000,
      weekly_amount: 600,
      duration_weeks: 21,
      total_amount: b4Calc.totalAmount,
      interest_amount: b4Calc.interestAmount,
      created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
      payments: b4Schedule,
    },
    {
      id: b5Id,
      user_id: userId,
      name: 'Anjaneyulu (ఆంజనేయులు)',
      date: getPastDate(2),
      mobile_number: '9989012345',
      city_name: 'Eluru (ఏలూరు)',
      surity: 'P. Nageswara Rao (నాగేశ్వర రావు)',
      amount: 50000,
      weekly_amount: 3000,
      duration_weeks: 20,
      total_amount: b5Calc.totalAmount,
      interest_amount: b5Calc.interestAmount,
      created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
      payments: b5Schedule,
    },
  ];
}

export function getCurrentUser(): UserProfile {
  if (typeof window === 'undefined') {
    return {
      id: 'admin-manikanta',
      email: 'manikanta17834@gmail.com',
      name: 'Manikanta (మాణికంఠ)',
      business_name: 'Manikanta Weekly Finance',
      phone: '7036929246',
      is_demo: false,
    };
  }
  const raw = localStorage.getItem(USER_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed.id === 'admin-manikanta' && parsed.business_name !== 'Manikanta Weekly Finance') {
        parsed.business_name = 'Manikanta Weekly Finance';
        localStorage.setItem(USER_KEY, JSON.stringify(parsed));
      }
      return parsed;
    } catch {
      // fallback
    }
  }
  const defaultUser: UserProfile = {
    id: 'admin-manikanta',
    email: 'manikanta17834@gmail.com',
    name: 'Manikanta (మాణికంఠ)',
    business_name: 'Manikanta Weekly Finance',
    phone: '7036929246',
    is_demo: false,
  };
  localStorage.setItem(USER_KEY, JSON.stringify(defaultUser));
  return defaultUser;
}

export function setCurrentUser(user: UserProfile | null) {
  if (typeof window === 'undefined') return;
  if (!user) {
    localStorage.removeItem(USER_KEY);
  } else {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function getBorrowers(): Borrower[] {
  if (typeof window === 'undefined') return [];
  const user = getCurrentUser();
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Borrower[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {
      console.error('Failed to parse stored borrowers', e);
    }
  }

  // Seed default dataset
  const seeds = getInitialSeedBorrowers(user.id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seeds));
  return seeds;
}

export function saveBorrowers(borrowers: Borrower[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(borrowers));
}

export function addBorrower(data: {
  name: string;
  date: string;
  mobile_number: string;
  city_name: string;
  surity: string;
  amount: number;
  weekly_amount: number;
  duration_weeks: number;
}): Borrower {
  const user = getCurrentUser();
  const id = `b-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const calc = calculateLoan(data.amount, data.weekly_amount, data.duration_weeks);
  const schedule = generateWeeklySchedule(id, data.date, data.weekly_amount, data.duration_weeks);

  const newBorrower: Borrower = {
    id,
    user_id: user.id,
    name: data.name.trim(),
    date: data.date,
    mobile_number: data.mobile_number.trim(),
    city_name: data.city_name.trim(),
    surity: data.surity.trim(),
    amount: data.amount,
    weekly_amount: data.weekly_amount,
    duration_weeks: data.duration_weeks,
    total_amount: calc.totalAmount,
    interest_amount: calc.interestAmount,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    payments: schedule,
  };

  const list = getBorrowers();
  const updated = [newBorrower, ...list];
  saveBorrowers(updated);

  // Background sync if Supabase is active
  if (isSupabaseConfigured && supabase) {
    Promise.resolve(supabase.from('borrowers').insert({
      id: newBorrower.id,
      user_id: newBorrower.user_id,
      name: newBorrower.name,
      date: newBorrower.date,
      mobile_number: newBorrower.mobile_number,
      city_name: newBorrower.city_name,
      surity: newBorrower.surity,
      amount: newBorrower.amount,
      weekly_amount: newBorrower.weekly_amount,
      duration_weeks: newBorrower.duration_weeks,
      total_amount: newBorrower.total_amount,
      interest_amount: newBorrower.interest_amount,
    })).then(() => {}, (err) => console.error(err));
  }

  return newBorrower;
}

export function updateBorrower(borrowerId: string, updates: Partial<Borrower>): Borrower | null {
  const list = getBorrowers();
  const idx = list.findIndex((b) => b.id === borrowerId);
  if (idx === -1) return null;

  const current = list[idx];
  // If financial amounts changed, recalculate total and interest
  let totalAmount = current.total_amount;
  let interestAmount = current.interest_amount;
  const p = updates.amount !== undefined ? updates.amount : current.amount;
  const w = updates.weekly_amount !== undefined ? updates.weekly_amount : current.weekly_amount;
  const d = updates.duration_weeks !== undefined ? updates.duration_weeks : current.duration_weeks;
  const startDate = updates.date !== undefined ? updates.date : current.date;

  if (updates.amount !== undefined || updates.weekly_amount !== undefined || updates.duration_weeks !== undefined) {
    const calc = calculateLoan(p, w, d);
    totalAmount = calc.totalAmount;
    interestAmount = calc.interestAmount;
  }

  // Adjust payment schedule if duration, weekly amount or start date changed
  let payments = current.payments ? [...current.payments] : [];
  if (updates.duration_weeks !== undefined || updates.weekly_amount !== undefined || updates.date !== undefined) {
    const freshSchedule = generateWeeklySchedule(borrowerId, startDate, w, d);
    payments = freshSchedule.map((freshItem, i) => {
      const existing = current.payments?.[i];
      if (existing) {
        return {
          ...freshItem,
          status: existing.status,
          paid_date: existing.paid_date,
          paid_amount: existing.status === 'paid' ? w : existing.paid_amount,
          notes: existing.notes,
        };
      }
      return freshItem;
    });
  }

  const updatedItem: Borrower = {
    ...current,
    ...updates,
    amount: p,
    weekly_amount: w,
    duration_weeks: d,
    date: startDate,
    total_amount: totalAmount,
    interest_amount: interestAmount,
    payments,
    updated_at: new Date().toISOString(),
  };

  list[idx] = updatedItem;
  saveBorrowers(list);
  return updatedItem;
}

export function deleteBorrower(borrowerId: string): boolean {
  const list = getBorrowers();
  const filtered = list.filter((b) => b.id !== borrowerId);
  if (filtered.length === list.length) return false;
  saveBorrowers(filtered);
  return true;
}

export function updateWeeklyPayment(
  borrowerId: string,
  weekNumber: number,
  status: PaymentStatus,
  paidDate?: string | null,
  paidAmount?: number | null,
  notes?: string
): { borrower: Borrower; payment: WeeklyPayment } | null {
  const list = getBorrowers();
  const bIndex = list.findIndex((b) => b.id === borrowerId);
  if (bIndex === -1) return null;

  const borrower = list[bIndex];
  const payments = borrower.payments ? [...borrower.payments] : [];
  const pIndex = payments.findIndex((p) => p.week_number === weekNumber);

  const defaultPaidDate = status === 'paid' || status === 'partial'
    ? (paidDate || new Date().toISOString().split('T')[0])
    : null;

  const calculatedPaidAmount = status === 'paid'
    ? borrower.weekly_amount
    : status === 'partial'
      ? (paidAmount !== undefined && paidAmount !== null ? Number(paidAmount) : borrower.weekly_amount / 2)
      : null;

  let targetPayment: WeeklyPayment;

  if (pIndex >= 0) {
    targetPayment = {
      ...payments[pIndex],
      status,
      paid_date: defaultPaidDate,
      paid_amount: calculatedPaidAmount,
      notes: notes !== undefined ? notes : payments[pIndex].notes,
      updated_at: new Date().toISOString(),
    };
    payments[pIndex] = targetPayment;
  } else {
    targetPayment = {
      id: `${borrowerId}-w${weekNumber}`,
      borrower_id: borrowerId,
      week_number: weekNumber,
      due_date: new Date().toISOString().split('T')[0],
      amount_due: borrower.weekly_amount,
      status,
      paid_date: defaultPaidDate,
      paid_amount: calculatedPaidAmount,
      notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    payments.push(targetPayment);
  }

  const updatedBorrower: Borrower = {
    ...borrower,
    payments,
    updated_at: new Date().toISOString(),
  };

  list[bIndex] = updatedBorrower;
  saveBorrowers(list);

  return { borrower: updatedBorrower, payment: targetPayment };
}

export function calculateDashboardStats(borrowers: Borrower[]): DashboardStats {
  let totalActiveLoans = 0;
  let totalCompletedLoans = 0;
  let totalPrincipalDisbursed = 0;
  let totalExpectedCollection = 0;
  let totalInterestEarned = 0;
  let totalCollectedSoFar = 0;
  let thisWeekDueCount = 0;
  let thisWeekDueAmount = 0;

  const today = new Date();
  const next7Days = new Date(today);
  next7Days.setDate(next7Days.getDate() + 7);

  borrowers.forEach((b) => {
    const progress = getBorrowerProgress(b);
    totalPrincipalDisbursed += b.amount;
    totalExpectedCollection += b.total_amount;
    totalInterestEarned += b.interest_amount;
    totalCollectedSoFar += progress.collected;

    if (progress.isFullyPaid) {
      totalCompletedLoans++;
    } else {
      totalActiveLoans++;
    }

    // Check payments due this week
    const currentWeekPayments = (b.payments || []).filter((p) => {
      if (p.status === 'paid') return false;
      const due = new Date(p.due_date);
      return due <= next7Days;
    });

    if (currentWeekPayments.length > 0) {
      thisWeekDueCount++;
      currentWeekPayments.forEach((p) => {
        thisWeekDueAmount += (p.amount_due - (p.paid_amount || 0));
      });
    }
  });

  const totalPendingBalance = Math.max(0, totalExpectedCollection - totalCollectedSoFar);
  const collectionRatePercentage = totalExpectedCollection > 0
    ? Math.round((totalCollectedSoFar / totalExpectedCollection) * 100)
    : 0;

  return {
    totalActiveLoans,
    totalCompletedLoans,
    totalPrincipalDisbursed,
    totalExpectedCollection,
    totalInterestEarned,
    totalCollectedSoFar,
    totalPendingBalance,
    thisWeekDueCount,
    thisWeekDueAmount,
    collectionRatePercentage,
  };
}

export function resetToSeedData(): Borrower[] {
  const user = getCurrentUser();
  const seeds = getInitialSeedBorrowers(user.id);
  saveBorrowers(seeds);
  return seeds;
}
