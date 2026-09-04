/**
 * Vaddi Vault - Master Calculation Engine
 * 
 * Single Source of Truth for all financial & loan calculations.
 * Exact formula:
 *   total_amount = weekly_amount * duration_weeks
 *   interest_amount = total_amount - principal_amount
 */

import { Borrower, LoanCalculation, WeeklyPayment } from '../types';

/**
 * Calculates loan totals, interest gain, and ROI percentage.
 */
export function calculateLoan(
  principalAmount: number,
  weeklyAmount: number,
  durationWeeks: number
): LoanCalculation {
  const p = Math.max(0, Number(principalAmount) || 0);
  const w = Math.max(0, Number(weeklyAmount) || 0);
  const weeks = Math.max(1, Math.round(Number(durationWeeks) || 21));

  const totalAmount = w * weeks;
  const interestAmount = totalAmount - p;
  const roiPercentage = p > 0 ? (interestAmount / p) * 100 : 0;
  const weeklyInterestGain = weeks > 0 ? interestAmount / weeks : 0;

  return {
    principalAmount: p,
    weeklyAmount: w,
    durationWeeks: weeks,
    totalAmount,
    interestAmount,
    roiPercentage,
    weeklyInterestGain,
  };
}

/**
 * Generates the full schedule of weekly payments for a given start date.
 */
export function generateWeeklySchedule(
  borrowerId: string,
  startDateStr: string,
  weeklyAmount: number,
  durationWeeks: number
): WeeklyPayment[] {
  const schedule: WeeklyPayment[] = [];
  const baseDate = new Date(startDateStr);
  const validBaseDate = isNaN(baseDate.getTime()) ? new Date() : baseDate;

  for (let week = 1; week <= durationWeeks; week++) {
    const dueDate = new Date(validBaseDate);
    dueDate.setDate(dueDate.getDate() + (week * 7));

    schedule.push({
      id: `${borrowerId}-w${week}`,
      borrower_id: borrowerId,
      week_number: week,
      due_date: dueDate.toISOString().split('T')[0],
      amount_due: weeklyAmount,
      status: 'pending',
      paid_date: null,
      paid_amount: null,
    });
  }

  return schedule;
}

/**
 * Computes progress summary for a borrower's payments
 */
export function getBorrowerProgress(borrower: Borrower) {
  const payments = borrower.payments || [];
  const duration = borrower.duration_weeks || 21;
  const totalAmount = borrower.total_amount;

  let collected = 0;
  let paidWeeksCount = 0;
  let defaultedWeeksCount = 0;
  let partialWeeksCount = 0;
  let pendingWeeksCount = 0;

  payments.forEach((p) => {
    if (p.status === 'paid') {
      collected += (p.paid_amount ?? p.amount_due);
      paidWeeksCount++;
    } else if (p.status === 'partial') {
      collected += (p.paid_amount ?? 0);
      partialWeeksCount++;
    } else if (p.status === 'defaulted') {
      defaultedWeeksCount++;
    } else {
      pendingWeeksCount++;
    }
  });

  const remaining = Math.max(0, totalAmount - collected);
  const percentage = totalAmount > 0 ? Math.min(100, Math.round((collected / totalAmount) * 100)) : 0;
  const isFullyPaid = paidWeeksCount >= duration || collected >= totalAmount;

  // Find next upcoming due week
  const nextPending = payments.find((p) => p.status === 'pending' || p.status === 'partial');

  return {
    collected,
    remaining,
    paidWeeksCount,
    defaultedWeeksCount,
    partialWeeksCount,
    pendingWeeksCount,
    percentage,
    isFullyPaid,
    nextDueDate: nextPending?.due_date || null,
    nextDueWeek: nextPending?.week_number || null,
  };
}

/**
 * Format any number to Indian Rupee (INR) standard: ₹10,000, ₹1,20,000
 */
export function formatINR(val: number): string {
  if (isNaN(val) || val === null || val === undefined) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val);
}

/**
 * Format date to clean readable format
 */
export function formatDate(dateStr: string, locale: 'en' | 'te' = 'en'): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString(locale === 'te' ? 'te-IN' : 'en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Self-verification test to guarantee formula accuracy
 */
export function runCalculatorUnitTests(): boolean {
  // Test case from handwritten note:
  // ₹10,000 principal, ₹600 weekly, 21 weeks -> Total: ₹12,600, Interest: ₹2,600
  const result1 = calculateLoan(10000, 600, 21);
  const passed1 = result1.totalAmount === 12600 && result1.interestAmount === 2600;

  // Test case 20 weeks:
  // ₹10,000 principal, ₹600 weekly, 20 weeks -> Total: ₹12,000, Interest: ₹2,000
  const result2 = calculateLoan(10000, 600, 20);
  const passed2 = result2.totalAmount === 12000 && result2.interestAmount === 2000;

  return passed1 && passed2;
}
