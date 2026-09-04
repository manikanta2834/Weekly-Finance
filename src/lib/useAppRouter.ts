import { useEffect, useRef, useState } from 'react';
import { ActiveView, Borrower } from '../types';

interface RouterState {
  view: ActiveView;
  selectedBorrowerId: string | null;
  isAddModalOpen: boolean;
  editingBorrowerId: string | null;
  isDeployModalOpen: boolean;
  isAuthModalOpen: boolean;
}

export function useAppRouter(borrowers: Borrower[]) {
  // Parse hash to state
  const parseHash = (hash: string): RouterState => {
    const clean = hash.replace(/^#\/?/, '');
    
    // Default state
    const state: RouterState = {
      view: 'landing',
      selectedBorrowerId: null,
      isAddModalOpen: false,
      editingBorrowerId: null,
      isDeployModalOpen: false,
      isAuthModalOpen: false,
    };

    if (!clean || clean === 'landing') {
      state.view = 'landing';
      return state;
    }

    if (clean === 'dashboard') {
      state.view = 'dashboard';
      return state;
    }

    if (clean === 'calculator') {
      state.view = 'calculator';
      return state;
    }

    if (clean === 'login') {
      state.view = 'login';
      return state;
    }

    if (clean === 'add-loan') {
      state.view = 'dashboard';
      state.isAddModalOpen = true;
      return state;
    }

    if (clean === 'sql-cloud' || clean === 'deploy') {
      state.isDeployModalOpen = true;
      return state;
    }

    if (clean === 'auth') {
      state.isAuthModalOpen = true;
      return state;
    }

    if (clean.startsWith('borrower/')) {
      const id = clean.replace('borrower/', '');
      state.view = 'dashboard';
      state.selectedBorrowerId = id;
      return state;
    }

    if (clean.startsWith('edit-loan/')) {
      const id = clean.replace('edit-loan/', '');
      state.view = 'dashboard';
      state.isAddModalOpen = true;
      state.editingBorrowerId = id;
      return state;
    }

    return state;
  };

  const [activeView, setActiveView] = useState<ActiveView>(() => {
    const initial = parseHash(window.location.hash);
    return initial.view;
  });

  const [selectedBorrowerId, setSelectedBorrowerId] = useState<string | null>(() => {
    const initial = parseHash(window.location.hash);
    return initial.selectedBorrowerId;
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(() => {
    const initial = parseHash(window.location.hash);
    return initial.isAddModalOpen;
  });

  const [editingBorrowerId, setEditingBorrowerId] = useState<string | null>(() => {
    const initial = parseHash(window.location.hash);
    return initial.editingBorrowerId;
  });

  const [isDeployModalOpen, setIsDeployModalOpen] = useState<boolean>(() => {
    const initial = parseHash(window.location.hash);
    return initial.isDeployModalOpen;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(() => {
    const initial = parseHash(window.location.hash);
    return initial.isAuthModalOpen;
  });

  // Track if a navigation is from popstate to avoid pushing duplicate entries
  const isPopStateNav = useRef(false);

  // Initialize history baseline so phone back never drops out of app on first action
  useEffect(() => {
    if (!window.location.hash) {
      window.history.replaceState({ view: 'landing' }, '', '#landing');
    }
  }, []);

  // Listen to Phone / Browser Back and Forward Button
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      isPopStateNav.current = true;
      const parsed = parseHash(window.location.hash);
      
      setActiveView(parsed.view);
      setSelectedBorrowerId(parsed.selectedBorrowerId);
      setIsAddModalOpen(parsed.isAddModalOpen);
      setEditingBorrowerId(parsed.editingBorrowerId);
      setIsDeployModalOpen(parsed.isDeployModalOpen);
      setIsAuthModalOpen(parsed.isAuthModalOpen);

      setTimeout(() => {
        isPopStateNav.current = false;
      }, 50);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Navigate to a main view
  const navigateToView = (view: ActiveView) => {
    setActiveView(view);
    setSelectedBorrowerId(null);
    setIsAddModalOpen(false);
    setEditingBorrowerId(null);
    setIsDeployModalOpen(false);
    setIsAuthModalOpen(false);

    if (!isPopStateNav.current) {
      const targetHash = `#${view}`;
      if (window.location.hash !== targetHash) {
        window.history.pushState({ view }, '', targetHash);
      }
    }
  };

  // Open Borrower detail ledger modal
  const openBorrowerDetail = (borrowerId: string) => {
    setSelectedBorrowerId(borrowerId);
    if (!isPopStateNav.current) {
      window.history.pushState({ view: activeView, modal: 'borrower', id: borrowerId }, '', `#borrower/${borrowerId}`);
    }
  };

  // Close Borrower detail modal
  const closeBorrowerDetail = () => {
    if (window.location.hash.startsWith('#borrower/')) {
      window.history.back();
    } else {
      setSelectedBorrowerId(null);
    }
  };

  // Open Add / Edit Loan Modal
  const openAddLoanModal = (editId?: string | null) => {
    setIsAddModalOpen(true);
    setEditingBorrowerId(editId || null);
    if (!isPopStateNav.current) {
      const hash = editId ? `#edit-loan/${editId}` : '#add-loan';
      window.history.pushState({ view: activeView, modal: 'addLoan', editId }, '', hash);
    }
  };

  // Close Add / Edit Loan Modal
  const closeAddLoanModal = () => {
    if (window.location.hash === '#add-loan' || window.location.hash.startsWith('#edit-loan/')) {
      window.history.back();
    } else {
      setIsAddModalOpen(false);
      setEditingBorrowerId(null);
    }
  };

  // Open Deploy / SQL Guide Modal
  const openDeployModal = () => {
    setIsDeployModalOpen(true);
    if (!isPopStateNav.current) {
      window.history.pushState({ view: activeView, modal: 'deploy' }, '', '#sql-cloud');
    }
  };

  // Close Deploy Modal
  const closeDeployModal = () => {
    if (window.location.hash === '#sql-cloud' || window.location.hash === '#deploy') {
      window.history.back();
    } else {
      setIsDeployModalOpen(false);
    }
  };

  // Open Auth Modal
  const openAuthModal = () => {
    setIsAuthModalOpen(true);
    if (!isPopStateNav.current) {
      window.history.pushState({ view: activeView, modal: 'auth' }, '', '#auth');
    }
  };

  // Close Auth Modal
  const closeAuthModal = () => {
    if (window.location.hash === '#auth') {
      window.history.back();
    } else {
      setIsAuthModalOpen(false);
    }
  };

  // Find active borrower object if selected
  const selectedBorrower = borrowers.find((b) => b.id === selectedBorrowerId) || null;
  const editingBorrower = borrowers.find((b) => b.id === editingBorrowerId) || null;

  return {
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
  };
}
