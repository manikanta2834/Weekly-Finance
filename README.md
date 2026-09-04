# Vaddi Vault (వడ్డీ Vault) — Weekly Collection Tracker & Interest Calculator

> **Tagline:** "Track Weekly Collections. From ₹10,000 to ₹12,600 in 21 Weeks."
> **Brand Identity:** Warm liquid-metal chrome coin with Indian Rupee (₹) engraving and 21 radial collection notches.

---

## 1. Exact Business Logic (Single Source of Truth)

All loan computations strictly adhere to the business rules:
- **Principal Amount (`amount`)**: Money lent (e.g., ₹10,000).
- **Weekly Collection (`weekly_amount`)**: Fixed cash collected per week (e.g., ₹600).
- **Duration (`duration_weeks`)**: Number of weeks the cycle runs (default 21 or 20).
- **Total Amount (`total_amount`)**: `weekly_amount × duration_weeks` (e.g., ₹600 × 21 = ₹12,600).
- **Interest Amount (`interest_amount`)**: `total_amount − amount` (e.g., ₹12,600 − ₹10,000 = ₹2,600 pure profit).

Implemented in `/src/lib/calculator.ts` and tested in `/src/lib/calculator.test.ts`.

---

## 2. Bilingual Support (English / Telugu)
- Full localization with persistent language toggle (EN / తె).
- Status labels:
  - **Pending** → *పెండింగ్లో*
  - **Paid** → *చెల్లించబడింది*
  - **Defaulted** → *చెల్లించలేదు*
  - **Partial** → *పాక్షికం*
- Auto-formatted Indian currency: `₹10,000`, `₹12,600`.
- WhatsApp reminders in English and Telugu.

---

## 3. Database Schema (Supabase PostgreSQL)

Migration file: `/supabase/migrations/001_initial_schema.sql`

Includes:
1. `borrowers` table with UUID primary keys, user isolation foreign keys, and financial fields.
2. `weekly_payments` table with `week_number`, `due_date`, `status` (`pending`, `paid`, `defaulted`, `partial`), `paid_date`, and `paid_amount`.
3. Auto-trigger `handle_new_borrower_schedule()` generating 21/20 weekly payment rows upon loan creation.
4. Row-Level Security (RLS) policies ensuring lenders only access their own records.

---

## 4. Vercel Deployment Checklist

1. **Connect Git Repository** to Vercel.
2. **Configure Environment Variables** in Vercel project settings:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   ```
3. **Run Supabase Migration**: Paste `/supabase/migrations/001_initial_schema.sql` in Supabase SQL editor and execute.
4. **Deploy**: Build command `vite build` or standard Next.js build.
