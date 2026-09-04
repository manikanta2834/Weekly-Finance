-- Vaddi Vault (వడ్డీ Vault) - Master PostgreSQL / Supabase Migration
-- Schema for Borrowers and 21-Week / 20-Week Payment Ledger with Row-Level Security (RLS)

-- 1. Create extension for UUIDs if not already present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create custom enum type for payment status
DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'defaulted', 'partial');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Borrowers Table
CREATE TABLE IF NOT EXISTS public.borrowers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    mobile_number VARCHAR(20) NOT NULL,
    city_name VARCHAR(100) NOT NULL,
    surity VARCHAR(255) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    weekly_amount NUMERIC(12, 2) NOT NULL CHECK (weekly_amount > 0),
    duration_weeks INT NOT NULL DEFAULT 21 CHECK (duration_weeks > 0),
    total_amount NUMERIC(12, 2) NOT NULL,
    interest_amount NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Weekly Payments Table
CREATE TABLE IF NOT EXISTS public.weekly_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    borrower_id UUID NOT NULL REFERENCES public.borrowers(id) ON DELETE CASCADE,
    week_number INT NOT NULL,
    due_date DATE NOT NULL,
    amount_due NUMERIC(12, 2) NOT NULL,
    status payment_status NOT NULL DEFAULT 'pending',
    paid_date DATE,
    paid_amount NUMERIC(12, 2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_borrower_week UNIQUE(borrower_id, week_number)
);

-- 5. Indexes for fast dashboard lookups
CREATE INDEX IF NOT EXISTS idx_borrowers_user_id ON public.borrowers(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_payments_borrower_id ON public.weekly_payments(borrower_id);
CREATE INDEX IF NOT EXISTS idx_weekly_payments_due_date ON public.weekly_payments(due_date);
CREATE INDEX IF NOT EXISTS idx_weekly_payments_status ON public.weekly_payments(status);

-- 6. Trigger to automatically generate duration_weeks slots upon inserting a borrower
CREATE OR REPLACE FUNCTION public.handle_new_borrower_schedule()
RETURNS TRIGGER AS $$
DECLARE
    i INT;
    v_due_date DATE;
BEGIN
    FOR i IN 1..NEW.duration_weeks LOOP
        v_due_date := NEW.date + (i * 7);
        INSERT INTO public.weekly_payments (
            borrower_id,
            week_number,
            due_date,
            amount_due,
            status,
            paid_date,
            paid_amount
        ) VALUES (
            NEW.id,
            i,
            v_due_date,
            NEW.weekly_amount,
            'pending',
            NULL,
            NULL
        );
    END LOOP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_borrower_created ON public.borrowers;
CREATE TRIGGER on_borrower_created
    AFTER INSERT ON public.borrowers
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_borrower_schedule();

-- 7. Enable Row Level Security (RLS)
ALTER TABLE public.borrowers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_payments ENABLE ROW LEVEL SECURITY;

-- 8. RLS Policies for borrowers
CREATE POLICY "Users can view their own borrowers"
    ON public.borrowers FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own borrowers"
    ON public.borrowers FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own borrowers"
    ON public.borrowers FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own borrowers"
    ON public.borrowers FOR DELETE
    USING (auth.uid() = user_id);

-- 9. RLS Policies for weekly_payments (scoped through borrower ownership)
CREATE POLICY "Users can view payments of their borrowers"
    ON public.weekly_payments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.borrowers b
            WHERE b.id = weekly_payments.borrower_id
            AND b.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert payments of their borrowers"
    ON public.weekly_payments FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.borrowers b
            WHERE b.id = weekly_payments.borrower_id
            AND b.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update payments of their borrowers"
    ON public.weekly_payments FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.borrowers b
            WHERE b.id = weekly_payments.borrower_id
            AND b.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete payments of their borrowers"
    ON public.weekly_payments FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.borrowers b
            WHERE b.id = weekly_payments.borrower_id
            AND b.user_id = auth.uid()
        )
    );
