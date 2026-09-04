import { calculateLoan, generateWeeklySchedule, getBorrowerProgress, runCalculatorUnitTests } from './calculator';

/**
 * Self-contained unit tests for Vaddi Vault business logic.
 */
export function executeCalculatorUnitTests(): { allPassed: boolean; logs: string[] } {
  const logs: string[] = [];
  let allPassed = true;

  const assert = (condition: boolean, description: string) => {
    if (condition) {
      logs.push(`PASS: ${description}`);
    } else {
      logs.push(`FAIL: ${description}`);
      allPassed = false;
    }
  };

  // Test 1: Exact handwritten note formula (₹10,000 -> ₹12,600 in 21 wks @ ₹600/wk)
  const test1 = calculateLoan(10000, 600, 21);
  assert(test1.totalAmount === 12600, 'Test 1: ₹600 * 21 = ₹12,600 total');
  assert(test1.interestAmount === 2600, 'Test 1: ₹12,600 - ₹10,000 = ₹2,600 interest');
  assert(test1.roiPercentage === 26, 'Test 1: ROI is exactly 26%');

  // Test 2: Alternative 20-week cycle
  const test2 = calculateLoan(10000, 600, 20);
  assert(test2.totalAmount === 12000, 'Test 2: ₹600 * 20 = ₹12,000 total');
  assert(test2.interestAmount === 2000, 'Test 2: ₹12,000 - ₹10,000 = ₹2,000 interest');

  // Test 3: 21-week schedule generation
  const schedule = generateWeeklySchedule('b-test', '2026-01-01', 600, 21);
  assert(schedule.length === 21, 'Test 3: Exactly 21 week slots generated');
  assert(schedule[0].week_number === 1, 'Test 3: First week is #1');
  assert(schedule[20].week_number === 21, 'Test 3: Last week is #21');

  // Test 4: Single-source-of-truth verification check
  assert(runCalculatorUnitTests() === true, 'Test 4: runCalculatorUnitTests() returned true');

  return { allPassed, logs };
}
