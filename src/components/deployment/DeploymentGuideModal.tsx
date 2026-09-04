import {
  Check,
  Code2,
  Copy,
  Database,
  ExternalLink,
  Globe,
  Layers,
  Server,
  Shield,
  Sparkles,
  Terminal,
  X
} from 'lucide-react';
import React, { useState } from 'react';

interface DeploymentGuideModalProps {
  onClose: () => void;
}

export const DeploymentGuideModal: React.FC<DeploymentGuideModalProps> = ({ onClose }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const sqlMigration = `-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Payment Status Enum
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'defaulted', 'partial');

-- 3. Borrowers Table
CREATE TABLE public.borrowers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    mobile_number VARCHAR(20) NOT NULL,
    city_name VARCHAR(100) NOT NULL,
    surity VARCHAR(255) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    weekly_amount NUMERIC(12, 2) NOT NULL,
    duration_weeks INT NOT NULL DEFAULT 21,
    total_amount NUMERIC(12, 2) NOT NULL,
    interest_amount NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Weekly Payments Table
CREATE TABLE public.weekly_payments (
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

-- 5. Auto 21-Week Schedule Generator Trigger
CREATE OR REPLACE FUNCTION public.handle_new_borrower_schedule()
RETURNS TRIGGER AS $$
DECLARE
    i INT;
BEGIN
    FOR i IN 1..NEW.duration_weeks LOOP
        INSERT INTO public.weekly_payments (
            borrower_id, week_number, due_date, amount_due, status
        ) VALUES (
            NEW.id, i, NEW.date + (i * 7), NEW.weekly_amount, 'pending'
        );
    END LOOP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_borrower_created
    AFTER INSERT ON public.borrowers
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_borrower_schedule();

-- 6. Enable RLS
ALTER TABLE public.borrowers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own borrowers"
    ON public.borrowers FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage payments of their borrowers"
    ON public.weekly_payments FOR ALL
    USING (EXISTS (SELECT 1 FROM public.borrowers b WHERE b.id = weekly_payments.borrower_id AND b.user_id = auth.uid()));`;

  const envConfig = `# Environment Variables for Vercel / Next.js
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret-key`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-3xl bg-[#061d1a] border border-[#10332e] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#10332e] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#e0e7e6]">
                Supabase & Vercel Production Deployment Guide
              </h3>
              <p className="text-xs text-[#8ba39e]">
                Turnkey PostgreSQL schema migration, Row-Level Security, and environment setup
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#0a2924] text-[#8ba39e] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: Supabase Setup */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs">
                1
              </span>
              <span>Supabase PostgreSQL Schema & RLS Policies</span>
            </h4>

            <button
              onClick={() => copyToClipboard(sqlMigration, 'sql')}
              className="px-2.5 py-1 rounded-lg bg-[#041513] hover:bg-[#0a2924] border border-[#10332e] text-[11px] font-bold text-amber-300 flex items-center gap-1 cursor-pointer"
            >
              {copiedSection === 'sql' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSection === 'sql' ? 'Copied SQL!' : 'Copy SQL Script'}</span>
            </button>
          </div>

          <div className="bg-[#041513] p-4 rounded-2xl border border-[#10332e] font-mono text-[11px] text-[#e0e7e6] overflow-x-auto max-h-48">
            <pre>{sqlMigration}</pre>
          </div>
          <p className="text-xs text-[#8ba39e]">
            Paste this in your Supabase project's <strong>SQL Editor</strong> and click <strong>Run</strong>. It sets up tables, triggers, and user-isolated RLS.
          </p>
        </div>

        {/* Step 2: Environment Variables */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">
                2
              </span>
              <span>Vercel Environment Variables (.env)</span>
            </h4>

            <button
              onClick={() => copyToClipboard(envConfig, 'env')}
              className="px-2.5 py-1 rounded-lg bg-[#041513] hover:bg-[#0a2924] border border-[#10332e] text-[11px] font-bold text-emerald-300 flex items-center gap-1 cursor-pointer"
            >
              {copiedSection === 'env' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSection === 'env' ? 'Copied Env!' : 'Copy Env Vars'}</span>
            </button>
          </div>

          <div className="bg-[#041513] p-4 rounded-2xl border border-[#10332e] font-mono text-[11px] text-emerald-300">
            <pre>{envConfig}</pre>
          </div>
          <p className="text-xs text-[#8ba39e]">
            Add these inside your <strong>Vercel Project Settings → Environment Variables</strong>.
          </p>
        </div>

        {/* Step 3: Deploy to Vercel */}
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#e0e7e6] block">Ready for 1-Click Git Push to Vercel</span>
            <span className="text-[11px] text-[#8ba39e]">
              Compatible with Vercel Edge & Node.js Serverless runtime
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-amber-400 text-slate-950 font-bold text-xs shadow cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
