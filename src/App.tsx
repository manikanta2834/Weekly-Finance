import {
  ArrowRight,
  BookOpen,
  Calculator as CalcIcon,
  CheckCircle2,
  ChevronDown,
  Coins,
  Database,
  FileSpreadsheet,
  Globe,
  Home,
  Landmark,
  Layers,
  LogIn,
  LogOut,
  Plus,
  RefreshCw,
  Sparkles,
  User,
  Users
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { AuthModal } from './components/auth/AuthModal';
import { LoginPage } from './components/auth/LoginPage';
import { LiquidMetalLogo } from './components/brand/LiquidMetalLogo';
import { StandaloneCalculator } from './components/calculator/StandaloneCalculator';
import { ConfirmModal } from './components/common/ConfirmModal';
import { AddLoanModal } from './components/dashboard/AddLoanModal';
import { BorrowerDetailModal } from './components/dashboard/BorrowerDetailModal';
import { BorrowersTable } from './components/dashboard/BorrowersTable';
import { DashboardStatsBar } from './components/dashboard/DashboardStatsBar';
import { TodaysCollectionWidget } from './components/dashboard/TodaysCollectionWidget';
import { DeploymentGuideModal } from './components/deployment/DeploymentGuideModal';
import { LandingPage } from './components/landing/LandingPage';
import {
  addBorrower,
  calculateDashboardStats,
  deleteBorrower,
  getBorrowers,
  getCurrentUser,
  resetToSeedData,
  setCurrentUser,
  updateBorrower,
  updateWeeklyPayment
} from './lib/storage';
import { useI18n } from './lib/i18nContext';
import { useAppRouter } from './lib/useAppRouter';
import { ActiveView, Borrower, PaymentStatus, UserProfile } from './types';

export default function App() {
  const { language, toggleLanguage, t } = useI18n();

  // User State
  const [currentUser, setUserState] = useState<UserProfile>(() => getCurrentUser());
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Data state
  const [borrowers, setBorrowers] = useState<Borrower[]>(() => getBorrowers());

  // URL Hash & History Navigation Router (Handles phone physical/gesture back button)
  const {
    activeView,
    navigateToView,
    selectedBorrower,
    openBorrowerDetail,
    closeBorrowerDetail,
    isAddModalOpen,
    editingBorrower,
    openAddLoanModal,
    closeAddLoanModal,
    isDeployModalOpen,
    openDeployModal,
    closeDeployModal,
    isAuthModalOpen,
    openAuthModal,
    closeAuthModal,
  } = useAppRouter(borrowers);

  // Pre-selected parameters when opening Add Loan from Calculator
  const [prefilledTerms, setPrefilledTerms] = useState<{
    amount: number;
    weeklyAmount: number;
    durationWeeks: number;
  } | null>(null);

  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const stats = calculateDashboardStats(borrowers);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync data refresh
  const refreshData = () => {
    const list = getBorrowers();
    setBorrowers(list);
  };

  // CRUD Handlers
  const handleSaveBorrower = (data: {
    name: string;
    date: string;
    mobile_number: string;
    city_name: string;
    surity: string;
    amount: number;
    weekly_amount: number;
    duration_weeks: number;
  }) => {
    if (editingBorrower) {
      updateBorrower(editingBorrower.id, data);
      refreshData();
      showToast(t('toast.loanUpdated') || 'Borrower updated successfully');
      closeAddLoanModal();
      openBorrowerDetail(editingBorrower.id);
    } else {
      const newB = addBorrower(data);
      refreshData();
      showToast(t('toast.loanAdded'));
      closeAddLoanModal();
      openBorrowerDetail(newB.id);
    }
  };

  const handleEditBorrower = (borrower: Borrower) => {
    setPrefilledTerms(null);
    openAddLoanModal(borrower.id);
  };

  const handleUpdatePayment = (
    weekNumber: number,
    status: PaymentStatus,
    paidDate?: string | null,
    paidAmount?: number | null,
    notes?: string
  ) => {
    if (!selectedBorrower) return;
    updateWeeklyPayment(
      selectedBorrower.id,
      weekNumber,
      status,
      paidDate,
      paidAmount,
      notes
    );
    refreshData();
    showToast(t('toast.paymentUpdated'));
  };

  const handleQuickMarkPaid = (borrowerId: string, weekNumber: number) => {
    updateWeeklyPayment(
      borrowerId,
      weekNumber,
      'paid',
      new Date().toISOString().split('T')[0]
    );
    refreshData();
    showToast(t('toast.paymentUpdated'));
  };

  const handleDeleteBorrower = (borrowerId: string) => {
    deleteBorrower(borrowerId);
    if (selectedBorrower?.id === borrowerId) {
      closeBorrowerDetail();
    }
    refreshData();
    showToast(t('toast.deleted'));
  };

  const handleResetDemoData = () => {
    setIsResetConfirmOpen(true);
  };

  const handleAddLoanFromCalc = (data: {
    amount: number;
    weeklyAmount: number;
    durationWeeks: number;
  }) => {
    setPrefilledTerms(data);
    openAddLoanModal();
  };

  return (
    <div className="min-h-screen bg-[#020d0c] text-[#e0e7e6] flex flex-col font-['Plus_Jakarta_Sans']">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-gradient-to-r from-emerald-500 to-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-2xl shadow-2xl animate-fade-in flex items-center gap-2 text-xs border border-emerald-400/30">
          <CheckCircle2 className="w-4 h-4 text-slate-950" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Top Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#020d0c]/95 border-b border-[#10332e] shadow-lg shadow-black/40">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Logo & Brand */}
          <button
            onClick={() => navigateToView('landing')}
            className="flex items-center text-left cursor-pointer focus:outline-none shrink-0"
            title="Vaddi Vault Home"
          >
            <LiquidMetalLogo size="sm" showText={true} />
          </button>

          {/* Center Navigation Views (Desktop >= md) */}
          <nav className="hidden md:flex items-center gap-1 bg-[#041513] p-1.5 rounded-2xl border border-[#10332e] text-xs">
            <button
              onClick={() => navigateToView('landing')}
              className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeView === 'landing'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 shadow-sm font-bold'
                  : 'text-[#8ba39e] hover:text-[#e0e7e6] hover:bg-[#0a2924]'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>{t('nav.landing')}</span>
            </button>

            <button
              onClick={() => navigateToView('dashboard')}
              className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeView === 'dashboard'
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 text-slate-950 shadow-sm font-bold'
                  : 'text-[#8ba39e] hover:text-[#e0e7e6] hover:bg-[#0a2924]'
              }`}
            >
              <Landmark className="w-3.5 h-3.5" />
              <span>{t('nav.dashboard')}</span>
            </button>

            <button
              onClick={() => navigateToView('calculator')}
              className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeView === 'calculator'
                  ? 'bg-gradient-to-r from-amber-500 to-emerald-400 text-slate-950 shadow-sm font-bold'
                  : 'text-[#8ba39e] hover:text-[#e0e7e6] hover:bg-[#0a2924]'
              }`}
            >
              <CalcIcon className="w-3.5 h-3.5" />
              <span>{t('nav.calculator')}</span>
            </button>

            <button
              onClick={() => navigateToView('login')}
              className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeView === 'login'
                  ? 'bg-gradient-to-r from-emerald-500 via-emerald-400 to-amber-400 text-slate-950 shadow-sm font-bold'
                  : 'text-[#8ba39e] hover:text-[#e0e7e6] hover:bg-[#0a2924]'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{language === 'te' ? 'లాగిన్ (Login)' : 'Login'}</span>
            </button>

            <button
              onClick={openDeployModal}
              className="px-3.5 py-1.5 rounded-xl font-semibold text-emerald-400 hover:bg-[#0a2924] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Database className="w-3.5 h-3.5" />
              <span>SQL / Vercel</span>
            </button>
          </nav>

          {/* Right Action Icons & Controls */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Language Switcher Persistent Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-[#061d1a] border border-[#10332e] hover:border-emerald-500/50 text-[11px] sm:text-xs font-semibold text-[#e0e7e6] hover:text-amber-300 transition-all shadow-sm cursor-pointer"
              title="Toggle English / తెలుగు"
            >
              <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 shrink-0" />
              <span className="font-medium">{language === 'en' ? 'తెలుగు' : 'English'}</span>
            </button>

            {/* Reset Demo Data Button (Desktop Only) */}
            <button
              onClick={handleResetDemoData}
              className="p-2 rounded-xl bg-[#061d1a] hover:bg-[#0a2924] border border-[#10332e] text-[#8ba39e] hover:text-amber-300 transition-colors hidden sm:flex cursor-pointer"
              title="Reset sample ledger data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* User Profile / Account Dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-1.5 sm:gap-2 p-1 sm:px-3 sm:py-1.5 rounded-xl bg-[#061d1a] border border-[#10332e] hover:border-emerald-500/40 text-xs font-medium text-[#e0e7e6] hover:text-white transition-all cursor-pointer"
                title="Account Settings"
              >
                <div className="w-7 h-7 sm:w-6 sm:h-6 rounded-full bg-gradient-to-tr from-emerald-600 to-amber-400 text-slate-950 flex items-center justify-center font-black text-xs sm:text-[11px] shadow-sm shrink-0">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="hidden xl:inline max-w-[110px] truncate">{currentUser.name}</span>
                <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#8ba39e] hidden sm:block" />
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#061d1a] border border-[#10332e] shadow-2xl p-3 z-50 space-y-2 animate-fade-in">
                  <div className="p-2 rounded-xl bg-[#041513] border border-[#10332e]">
                    <div className="text-xs font-bold text-[#e0e7e6] truncate">{currentUser.name}</div>
                    <div className="text-[11px] text-[#8ba39e] truncate">{currentUser.email}</div>
                    {currentUser.business_name && (
                      <div className="text-[10px] text-amber-400 mt-1 font-medium truncate">
                        {currentUser.business_name}
                      </div>
                    )}
                  </div>

                  <div className="pt-1 space-y-1">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        navigateToView('login');
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-[#e0e7e6] hover:bg-[#0a2924] flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogIn className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{language === 'te' ? 'ఖాతా మార్చండి / లాగిన్' : 'Switch Account / Login'}</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        handleResetDemoData();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-[#8ba39e] hover:text-[#e0e7e6] hover:bg-[#0a2924] flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                      <span>{language === 'te' ? 'డెమో డేటా రీసెట్' : 'Reset Demo Ledger'}</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        const guestUser: UserProfile = {
                          id: `guest-${Date.now()}`,
                          email: 'guest@vaddivault.com',
                          name: 'Guest Lender',
                          is_demo: true,
                        };
                        setUserState(guestUser);
                        setCurrentUser(guestUser);
                        navigateToView('login');
                        showToast('Signed out of vault.');
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/40 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{language === 'te' ? 'లాగ్ అవుట్' : 'Sign Out'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Add Loan Primary Button */}
            <button
              onClick={() => {
                setPrefilledTerms(null);
                openAddLoanModal();
              }}
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-amber-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 text-slate-950" />
              <span className="hidden sm:inline">{t('nav.addLoan')}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main View Router */}
      <div className="flex-1 pb-24 md:pb-8">
        {activeView === 'landing' && (
          <LandingPage
            onOpenDashboard={() => navigateToView('dashboard')}
            onOpenAddLoan={() => {
              navigateToView('dashboard');
              openAddLoanModal();
            }}
            onOpenLogin={() => navigateToView('login')}
            onOpenCalculator={() => navigateToView('calculator')}
          />
        )}

        {activeView === 'login' && (
          <LoginPage
            onLoginSuccess={(user) => {
              setUserState(user);
              setCurrentUser(user);
              navigateToView('dashboard');
              showToast(language === 'te' ? `స్వాగతం, ${user.name}` : `Welcome back, ${user.name}`);
            }}
            onNavigateHome={() => navigateToView('landing')}
          />
        )}

        {activeView === 'dashboard' && (
          <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8 animate-fade-in">
            {/* Dashboard Header Title */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div>
                <h1 className="text-xl sm:text-3xl font-black text-white flex items-center gap-2 sm:gap-2.5">
                  <Landmark className="w-6 h-6 sm:w-7 sm:h-7 text-amber-400 shrink-0" />
                  <span>{t('dashboard.title')}</span>
                </h1>
                <p className="text-[11px] sm:text-sm text-slate-400 mt-0.5 sm:mt-1">
                  {t('dashboard.subtitle')} • 21-Week Micro-Finance Ledger
                </p>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => {
                    setPrefilledTerms(null);
                    openAddLoanModal();
                  }}
                  className="w-full sm:w-auto justify-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-500 text-slate-950 font-bold text-xs shadow-lg flex items-center gap-2 hover:scale-105 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-slate-950" />
                  <span>{t('nav.addLoan')}</span>
                </button>
              </div>
            </div>

            {/* Stats Metric Cards Bar */}
            <DashboardStatsBar stats={stats} />

            {/* Today's Collection Queue Widget */}
            <TodaysCollectionWidget
              borrowers={borrowers}
              onQuickMarkPaid={handleQuickMarkPaid}
              onSelectBorrower={(b) => openBorrowerDetail(b.id)}
            />

            {/* Borrowers Master Table */}
            <BorrowersTable
              borrowers={borrowers}
              onSelectBorrower={(b) => openBorrowerDetail(b.id)}
              onEditBorrower={handleEditBorrower}
              onDeleteBorrower={handleDeleteBorrower}
              onAddNewLoan={() => {
                setPrefilledTerms(null);
                openAddLoanModal();
              }}
            />
          </main>
        )}

        {activeView === 'calculator' && (
          <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 animate-fade-in">
            <StandaloneCalculator onAddLoanFromCalc={handleAddLoanFromCalc} />
          </main>
        )}
      </div>

      {/* Native Mobile Bottom Navigation Bar (Fixed for phones < md) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#041513]/95 backdrop-blur-xl border-t border-[#10332e] py-1.5 px-2 flex items-center justify-around shadow-[0_-8px_25px_rgba(0,0,0,0.7)]">
        <button
          onClick={() => navigateToView('landing')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            activeView === 'landing' ? 'text-amber-300 font-bold bg-[#0a2924]' : 'text-[#8ba39e] hover:text-[#e0e7e6]'
          }`}
        >
          <Home className="w-4 h-4 mb-0.5" />
          <span className="text-[10px]">{t('nav.landing')}</span>
        </button>

        <button
          onClick={() => navigateToView('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            activeView === 'dashboard' ? 'text-emerald-300 font-bold bg-[#0a2924]' : 'text-[#8ba39e] hover:text-[#e0e7e6]'
          }`}
        >
          <Landmark className="w-4 h-4 mb-0.5" />
          <span className="text-[10px]">{t('nav.dashboard')}</span>
        </button>

        <button
          onClick={() => navigateToView('calculator')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            activeView === 'calculator' ? 'text-amber-300 font-bold bg-[#0a2924]' : 'text-[#8ba39e] hover:text-[#e0e7e6]'
          }`}
        >
          <CalcIcon className="w-4 h-4 mb-0.5" />
          <span className="text-[10px]">{t('nav.calculator')}</span>
        </button>

        <button
          onClick={() => navigateToView('login')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            activeView === 'login' ? 'text-emerald-300 font-bold bg-[#0a2924]' : 'text-[#8ba39e] hover:text-[#e0e7e6]'
          }`}
        >
          <LogIn className="w-4 h-4 mb-0.5" />
          <span className="text-[10px]">Login</span>
        </button>

        <button
          onClick={openDeployModal}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-emerald-400 hover:text-emerald-300 transition-all cursor-pointer"
        >
          <Database className="w-4 h-4 mb-0.5" />
          <span className="text-[10px]">SQL / Cloud</span>
        </button>
      </nav>

      {/* 3D Flippable Borrower Detail Modal */}
      {selectedBorrower && (
        <BorrowerDetailModal
          borrower={selectedBorrower}
          onClose={closeBorrowerDetail}
          onUpdatePayment={handleUpdatePayment}
          onEditBorrower={handleEditBorrower}
          onDeleteBorrower={(id) => handleDeleteBorrower(id)}
        />
      )}

      {/* Add / Edit Loan Modal */}
      {isAddModalOpen && (
        <AddLoanModal
          onClose={() => {
            setPrefilledTerms(null);
            closeAddLoanModal();
          }}
          onSubmit={handleSaveBorrower}
          editingBorrower={
            editingBorrower
              ? editingBorrower
              : prefilledTerms
                ? ({
                    amount: prefilledTerms.amount,
                    weekly_amount: prefilledTerms.weeklyAmount,
                    duration_weeks: prefilledTerms.durationWeeks,
                  } as any)
                : null
          }
        />
      )}

      {/* Reset Demo Data In-App Confirmation Modal */}
      <ConfirmModal
        isOpen={isResetConfirmOpen}
        title="Reset Demo Data"
        message="Are you sure you want to reset all borrowers and collection records back to the fresh demo dataset? Any custom loans created will be replaced with the sample borrowers."
        confirmText="Reset to Sample Data"
        cancelText="Cancel"
        isDangerous={false}
        onConfirm={() => {
          resetToSeedData();
          refreshData();
          closeBorrowerDetail();
          showToast('Reset to demo dataset successfully.');
          setIsResetConfirmOpen(false);
        }}
        onCancel={() => setIsResetConfirmOpen(false)}
      />

      {/* Auth Modal */}
      {isAuthModalOpen && (
        <AuthModal
          onClose={closeAuthModal}
          onLoginSuccess={(user) => {
            setUserState(user);
            setCurrentUser(user);
            showToast(`Signed in as ${user.name}`);
            closeAuthModal();
          }}
        />
      )}

      {/* Deployment & SQL Modal */}
      {isDeployModalOpen && (
        <DeploymentGuideModal onClose={closeDeployModal} />
      )}
    </div>
  );
}
