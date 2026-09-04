import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Globe,
  Lock,
  Mail,
  Phone,
  Shield,
  ShieldCheck,
  Sparkles,
  User,
  Zap,
} from 'lucide-react';
import React, { useState } from 'react';
import { useI18n } from '../../lib/i18nContext';
import {
  ADMIN_MASTER_USER,
  getRegisteredUsers,
  registerNewUser,
  setCurrentUser,
} from '../../lib/storage';
import { UserProfile } from '../../types';
import { LiquidMetalLogo } from '../brand/LiquidMetalLogo';

interface LoginPageProps {
  onLoginSuccess: (user: UserProfile) => void;
  onNavigateHome: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onNavigateHome,
}) => {
  const { language, toggleLanguage, t } = useI18n();
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'forgot'>('signin');

  // Form fields
  const [identifier, setIdentifier] = useState(''); // Email or Phone
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Status states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Admin Master Credentials
  const ADMIN_EMAIL = ADMIN_MASTER_USER.email;
  const ADMIN_PHONE = ADMIN_MASTER_USER.phone || '7036929246';
  const ADMIN_PASS = 'Mani234&';

  // Quick 1-click Demo / Admin Login
  const handleDemoLogin = () => {
    setLoading(true);
    setErrorMsg(null);
    setTimeout(() => {
      setCurrentUser(ADMIN_MASTER_USER);
      setLoading(false);
      onLoginSuccess(ADMIN_MASTER_USER);
    }, 450);
  };

  const handleFillAdminCredentials = () => {
    setIdentifier(ADMIN_EMAIL);
    setPassword(ADMIN_PASS);
    setErrorMsg(null);
    setSuccessMsg(
      language === 'te'
        ? 'అడ్మిన్ వివరాలు నింపబడ్డాయి! లాగిన్ క్లిక్ చేయండి.'
        : 'Admin credentials loaded! Click Sign In to proceed.'
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    setTimeout(() => {
      setLoading(false);

      if (authMode === 'forgot') {
        if (!identifier) {
          setErrorMsg('Please enter your email or mobile number.');
          return;
        }
        setSuccessMsg(
          language === 'te'
            ? 'పాస్‌వర్డ్ రీసెట్ లింక్ మీ ఈమెయిల్ / మొబైల్‌కు పంపబడింది.'
            : 'Password reset link sent to your registered email / phone.'
        );
        return;
      }

      if (authMode === 'signup') {
        if (!fullName.trim()) {
          setErrorMsg('Please enter your full name.');
          return;
        }
        if (!identifier.trim() || !password) {
          setErrorMsg('Please enter both email/phone and password.');
          return;
        }

        const newUser = registerNewUser({
          name: fullName.trim(),
          email: identifier.includes('@') ? identifier.trim() : `${identifier.trim().replace(/\D/g, '')}@vaddivault.com`,
          business_name: businessName.trim() || `${fullName.trim()}'s Finance Ledger`,
          phone: phone.trim() || (!identifier.includes('@') ? identifier.trim() : ''),
          password: password,
        });

        setCurrentUser(newUser);
        onLoginSuccess(newUser);
        return;
      }

      // Sign In mode
      const trimmedIdent = identifier.trim().toLowerCase();
      const cleanPhone = identifier.replace(/[^0-9]/g, '');

      if (!trimmedIdent || !password) {
        setErrorMsg('Please enter your credentials.');
        return;
      }

      // Check if logging in with designated Admin Credentials
      if (
        (trimmedIdent === ADMIN_EMAIL.toLowerCase() || (cleanPhone && cleanPhone === ADMIN_PHONE)) &&
        password === ADMIN_PASS
      ) {
        setCurrentUser(ADMIN_MASTER_USER);
        onLoginSuccess(ADMIN_MASTER_USER);
        return;
      }

      // Check registered users in persistent storage registry
      const users = getRegisteredUsers();
      const matched = users.find(
        (u) =>
          u.email.toLowerCase() === trimmedIdent ||
          (cleanPhone && u.phone && u.phone.replace(/\D/g, '') === cleanPhone)
      );

      if (matched) {
        if (matched.password && matched.password !== password) {
          setErrorMsg(
            language === 'te'
              ? 'తప్పు పాస్‌వర్డ్. దయచేసి మళ్ళీ ప్రయత్నించండి.'
              : 'Incorrect password for this account. Please try again.'
          );
          return;
        }
        const userProfile: UserProfile = {
          id: matched.id,
          email: matched.email,
          name: matched.name,
          business_name: matched.business_name,
          phone: matched.phone,
          is_demo: false,
        };
        setCurrentUser(userProfile);
        onLoginSuccess(userProfile);
        return;
      }

      // If user is signing in with a new email/phone and valid password, create their account seamlessly
      const autoUser = registerNewUser({
        name: identifier.includes('@') ? identifier.split('@')[0] : `Lender ${cleanPhone.slice(-4) || 'Account'}`,
        email: identifier.includes('@') ? identifier.trim() : `${cleanPhone}@vaddivault.com`,
        phone: cleanPhone || '',
        password: password,
      });

      setCurrentUser(autoUser);
      onLoginSuccess(autoUser);
    }, 500);
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#020d0c] text-[#e0e7e6] py-10 px-4 sm:px-6 lg:px-8 flex flex-col justify-center relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-gradient-to-b from-emerald-600/10 via-amber-500/5 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Info & Value Proposition (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/70 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>21-Week Gold Standard Ledger</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#e0e7e6] leading-tight">
              {language === 'te' ? (
                <>
                  మీ ఫైనాన్స్ లెక్కలు, <br />
                  <span className="bg-gradient-to-r from-emerald-300 via-amber-300 to-emerald-400 bg-clip-text text-transparent">
                    100% పక్కా & సురక్షితం.
                  </span>
                </>
              ) : (
                <>
                  Lender Portal for <br />
                  <span className="bg-gradient-to-r from-emerald-300 via-amber-300 to-emerald-400 bg-clip-text text-transparent">
                    21-Week Micro-Finance
                  </span>
                </>
              )}
            </h1>
            <p className="text-sm text-[#8ba39e] leading-relaxed">
              {language === 'te'
                ? 'రూ. 10,000 అసలుకు 21 వారాల పాటు వారం వారం రూ. 600 కలెక్షన్ లెక్కలు, బకాయిల రిమైండర్లు మరియు వాట్సాప్ రశీదుల వాల్ట్.'
                : 'Manage weekly collections, real-time overdue alerts, auto-calculated interest ledgers, and WhatsApp receipts in one vault.'}
            </p>
          </div>

          {/* Value Highlights */}
          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#041513] border border-[#10332e]">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#e0e7e6]">
                  {language === 'te' ? 'జీరో నోట్‌బుక్ తప్పులు' : 'Zero Notebook Calculation Errors'}
                </h4>
                <p className="text-[11px] text-[#8ba39e]">
                  {language === 'te'
                    ? '21 వారాల చక్రం ఆటోమేటిక్ గణన మరియు ప్రిన్సిపల్ రిటర్న్.'
                    : 'Fixed 21-week math automatically computes ROI and pending balances.'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#041513] border border-[#10332e]">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 text-amber-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#e0e7e6]">
                  {language === 'te' ? 'క్లౌడ్ రక్షణ & గోప్యత' : 'Cloud Backup & Offline Mode'}
                </h4>
                <p className="text-[11px] text-[#8ba39e]">
                  {language === 'te'
                    ? 'మీ డేటా సురక్షితం. ఇంటర్నెట్ లేకపోయినా పనిచేస్తుంది.'
                    : 'Local browser storage with turnkey Supabase PostgreSQL sync.'}
                </p>
              </div>
            </div>
          </div>

          {/* Back Home Link */}
          <div className="pt-2">
            <button
              onClick={onNavigateHome}
              className="text-xs font-semibold text-[#8ba39e] hover:text-amber-300 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span>← {language === 'te' ? 'హోమ్ పేజీకి తిరిగి వెళ్లండి' : 'Back to Home'}</span>
            </button>
          </div>
        </div>

        {/* Right Auth Form Card (7 Cols) */}
        <div className="lg:col-span-7">
          <div className="bg-[#061d1a] border border-[#10332e] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 backdrop-blur-xl relative">
            
            {/* Header / Logo in Form */}
            <div className="flex items-center justify-between border-b border-[#10332e] pb-4">
              <LiquidMetalLogo size="md" showText={true} />
              
              {/* Language Switch */}
              <button
                type="button"
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#041513] border border-[#10332e] hover:border-amber-500/40 text-xs font-semibold text-[#8ba39e] hover:text-[#e0e7e6] transition-all cursor-pointer"
                title="Toggle Language"
              >
                <Globe className="w-3.5 h-3.5 text-amber-400" />
                <span>{language === 'en' ? 'తెలుగు (TE)' : 'English (EN)'}</span>
              </button>
            </div>

            {/* Admin Master Credentials Quick Access Box */}
            <div className="p-3.5 rounded-2xl bg-[#041513] border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  <span>Admin Credentials:</span>
                </div>
                <div className="text-[11px] text-[#8ba39e] font-mono">
                  <span className="text-[#e0e7e6] font-semibold">manikanta17834@gmail.com</span> / <span className="text-[#e0e7e6] font-semibold">7036929246</span>
                </div>
                <div className="text-[11px] text-[#8ba39e] font-mono">
                  Password: <span className="text-amber-300 font-bold tracking-wider">Mani234&</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleFillAdminCredentials}
                className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Auto-Fill</span>
              </button>
            </div>

            {/* Auth Mode Tabs */}
            <div className="grid grid-cols-2 p-1 bg-[#041513] rounded-2xl border border-[#10332e]">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  authMode === 'signin'
                    ? 'bg-gradient-to-r from-emerald-500 via-emerald-400 to-amber-400 text-slate-950 shadow-md'
                    : 'text-[#8ba39e] hover:text-[#e0e7e6]'
                }`}
              >
                {language === 'te' ? 'లాగిన్ (Sign In)' : 'Sign In'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  authMode === 'signup'
                    ? 'bg-gradient-to-r from-emerald-500 via-emerald-400 to-amber-400 text-slate-950 shadow-md'
                    : 'text-[#8ba39e] hover:text-[#e0e7e6]'
                }`}
              >
                {language === 'te' ? 'నమోదు (Create Account)' : 'Create Account'}
              </button>
            </div>

            {/* Messages */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Extra fields for sign up */}
              {authMode === 'signup' && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#8ba39e]">
                      {language === 'te' ? 'మీ పూర్తి పేరు (Lender Name)' : 'Full Name'}
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#8ba39e] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Manikanta Rao"
                        className="w-full bg-[#041513] border border-[#10332e] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-[#e0e7e6] focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all placeholder:text-[#4b635e]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#8ba39e]">
                      {language === 'te' ? 'సంస్థ / షాపు పేరు (Business Name)' : 'Business / Firm Name (Optional)'}
                    </label>
                    <div className="relative">
                      <Shield className="w-4 h-4 text-[#8ba39e] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="e.g. Sri Venkateswara Weekly Finance"
                        className="w-full bg-[#041513] border border-[#10332e] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-[#e0e7e6] focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all placeholder:text-[#4b635e]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#8ba39e]">
                      {language === 'te' ? 'మొబైల్ నంబర్ (Mobile)' : 'Mobile Phone Number'}
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-[#8ba39e] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="9848022338"
                        className="w-full bg-[#041513] border border-[#10332e] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-[#e0e7e6] focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all placeholder:text-[#4b635e]"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Email / Mobile Identifier */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#8ba39e]">
                  {authMode === 'signup'
                    ? (language === 'te' ? 'ఈమెయిల్ చిరునామా (Email)' : 'Email Address')
                    : (language === 'te' ? 'ఈమెయిల్ లేదా మొబైల్ నంబర్' : 'Email Address or Mobile Number')}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8ba39e] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="manikanta17834@gmail.com or 7036929246"
                    className="w-full bg-[#041513] border border-[#10332e] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-[#e0e7e6] focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all placeholder:text-[#4b635e]"
                  />
                </div>
              </div>

              {/* Password Field */}
              {authMode !== 'forgot' && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[#8ba39e]">
                      {language === 'te' ? 'పాస్‌వర్డ్ (Password)' : 'Password'}
                    </label>
                    {authMode === 'signin' && (
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('forgot');
                          setErrorMsg(null);
                        }}
                        className="text-[11px] text-amber-400 hover:underline cursor-pointer"
                      >
                        {language === 'te' ? 'పాస్‌వర్డ్ మర్చిపోయారా?' : 'Forgot Password?'}
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#8ba39e] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#041513] border border-[#10332e] rounded-xl pl-9 pr-10 py-2.5 text-xs text-[#e0e7e6] focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all placeholder:text-[#4b635e]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8ba39e] hover:text-[#e0e7e6] cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Remember Me Toggle */}
              {authMode === 'signin' && (
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-[#8ba39e]">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded bg-[#041513] border-[#10332e] text-emerald-500 focus:ring-emerald-400"
                    />
                    <span>{language === 'te' ? 'ఈ పరికరంలో నన్ను గుర్తుంచుకో' : 'Remember this device'}</span>
                  </label>
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-amber-400 text-slate-950 font-extrabold text-xs shadow-xl shadow-emerald-500/10 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : authMode === 'signup' ? (
                  <>
                    <span>{language === 'te' ? 'ఖాతా తెరవండి & వాల్ట్ ప్రారంభించండి' : 'Register & Create Vault'}</span>
                    <ArrowRight className="w-4 h-4 text-slate-950" />
                  </>
                ) : authMode === 'forgot' ? (
                  <span>{language === 'te' ? 'రీసెట్ లింక్ పంపండి' : 'Send Password Reset Link'}</span>
                ) : (
                  <>
                    <span>{language === 'te' ? 'వాల్ట్ లోకి లాగిన్ అవ్వండి' : 'Sign In to Vaddi Vault'}</span>
                    <ArrowRight className="w-4 h-4 text-slate-950" />
                  </>
                )}
              </button>
            </form>

            {/* Demo Fast Login Option */}
            <div className="pt-3 border-t border-[#10332e] space-y-3 text-center">
              <button
                type="button"
                onClick={handleDemoLogin}
                className="w-full py-2.5 rounded-xl bg-[#041513] hover:bg-[#0a2924] text-amber-300 text-xs font-bold border border-amber-500/30 hover:border-amber-400 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {language === 'te'
                    ? '⚡ తక్షణ డెమో యాక్సెస్ (శ్రీ వెంకటేశ్వర ఫైనాన్స్)'
                    : '⚡ 1-Click Instant Demo (Sample Ledger)'}
                </span>
              </button>

              <p className="text-[11px] text-[#8ba39e]">
                {authMode === 'signin' ? (
                  <span>
                    {language === 'te' ? 'ఖాతా లేదా?' : "Don't have an account?"}{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('signup');
                        setErrorMsg(null);
                      }}
                      className="text-emerald-400 font-bold hover:underline cursor-pointer"
                    >
                      {language === 'te' ? 'నమోదు చేసుకోండి' : 'Sign Up Free'}
                    </button>
                  </span>
                ) : (
                  <span>
                    {language === 'te' ? 'ఇప్పటికే ఖాతా ఉందా?' : 'Already have an account?'}{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('signin');
                        setErrorMsg(null);
                      }}
                      className="text-amber-400 font-bold hover:underline cursor-pointer"
                    >
                      {language === 'te' ? 'లాగిన్ అవ్వండి' : 'Sign In'}
                    </button>
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
