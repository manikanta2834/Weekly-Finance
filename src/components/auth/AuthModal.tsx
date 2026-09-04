import {
  ArrowRight,
  CheckCircle2,
  KeyRound,
  Lock,
  Mail,
  Shield,
  Sparkles,
  User,
  X
} from 'lucide-react';
import React, { useState } from 'react';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import { UserProfile } from '../../types';
import { LiquidMetalLogo } from '../brand/LiquidMetalLogo';

interface AuthModalProps {
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  initialMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  onClose,
  onLoginSuccess,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleDemoLogin = () => {
    const adminUser: UserProfile = {
      id: 'admin-manikanta',
      email: 'manikanta17834@gmail.com',
      name: 'Manikanta (మాణికంఠ)',
      business_name: 'Manikanta Weekly Finance',
      phone: '7036929246',
      is_demo: false,
    };
    onLoginSuccess(adminUser);
    onClose();
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    // If Supabase is active, handle real auth
    if (isSupabaseConfigured && supabase) {
      try {
        if (mode === 'signup') {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: name,
                business_name: businessName,
              },
            },
          });
          if (error) throw error;
          if (data.user) {
            onLoginSuccess({
              id: data.user.id,
              email: data.user.email || email,
              name: name || 'Lender',
              business_name: businessName,
              is_demo: false,
            });
            onClose();
          }
        } else if (mode === 'login') {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) throw error;
          if (data.user) {
            onLoginSuccess({
              id: data.user.id,
              email: data.user.email || email,
              name: data.user.user_metadata?.full_name || 'Lender',
              business_name: data.user.user_metadata?.business_name,
              is_demo: false,
            });
            onClose();
          }
        } else if (mode === 'forgot') {
          const { error } = await supabase.auth.resetPasswordForEmail(email);
          if (error) throw error;
          setSuccessMsg('Password reset instructions sent to your email.');
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Authentication failed. Please check credentials.');
      } finally {
        setLoading(false);
      }
    } else {
      // Local fallback mode
      setTimeout(() => {
        setLoading(false);
        const user: UserProfile = {
          id: `usr-${Date.now()}`,
          email,
          name: name || email.split('@')[0] || 'Lender',
          business_name: businessName || 'Weekly Finance Vault',
          is_demo: true,
        };
        onLoginSuccess(user);
        onClose();
      }, 500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-[#061d1a] border border-[#10332e] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[#0a2924] text-[#8ba39e] hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Centerpiece Liquid Metal Logo */}
        <div className="flex flex-col items-center text-center space-y-2 pt-2">
          <LiquidMetalLogo size="lg" showText={false} />
          <h3 className="text-xl font-black text-[#e0e7e6] font-['Plus_Jakarta_Sans']">
            {mode === 'signup'
              ? 'Create Lender Account'
              : mode === 'forgot'
                ? 'Reset Vault Password'
                : 'Welcome to Vaddi Vault'}
          </h3>
          <p className="text-xs text-[#8ba39e]">
            {mode === 'signup'
              ? 'Start recording weekly collections and interest ledgers'
              : 'Secure 21-week finance tracking platform'}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-300">
            {successMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleAuthSubmit} className="space-y-4">
          {mode === 'signup' && (
            <>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#8ba39e]">Your Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#8ba39e] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Manikanta Rao"
                    className="w-full bg-[#041513] border border-[#10332e] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-[#e0e7e6] focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#8ba39e]">Business / Firm Name (optional)</label>
                <div className="relative">
                  <Shield className="w-4 h-4 text-[#8ba39e] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Sri Venkateswara Finance"
                    className="w-full bg-[#041513] border border-[#10332e] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-[#e0e7e6] focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#8ba39e]">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#8ba39e] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="lender@example.com"
                className="w-full bg-[#041513] border border-[#10332e] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-[#e0e7e6] focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#8ba39e]">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[11px] text-amber-400 hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8ba39e] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#041513] border border-[#10332e] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-[#e0e7e6] focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-amber-400 text-slate-950 font-extrabold text-xs shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : mode === 'signup' ? (
              <>
                <span>Register & Create Vault</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </>
            ) : mode === 'forgot' ? (
              <span>Send Password Reset</span>
            ) : (
              <>
                <span>Sign In to Vault</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </>
            )}
          </button>
        </form>

        {/* Demo Fast Login Option */}
        <div className="pt-2 border-t border-[#10332e] space-y-3 text-center">
          <button
            type="button"
            onClick={handleDemoLogin}
            className="w-full py-2.5 rounded-xl bg-[#041513] hover:bg-[#0a2924] text-amber-300 text-xs font-bold border border-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Instant Access with Demo Data</span>
          </button>

          <div className="text-xs text-[#8ba39e]">
            {mode === 'login' ? (
              <span>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-emerald-400 font-bold hover:underline ml-1 cursor-pointer"
                >
                  Sign Up
                </button>
              </span>
            ) : (
              <span>
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-amber-400 font-bold hover:underline ml-1 cursor-pointer"
                >
                  Sign In
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
