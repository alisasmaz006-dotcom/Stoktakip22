import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Branch, BranchSettings } from '../types';
import { useAuth } from './AuthContext';
import * as api from '../utils/api';

interface BranchContextType {
  branches: Branch[];
  activeBranch: Branch | null;
  activeBranchId: string | null;
  branchSettings: BranchSettings | null;
  setActiveBranch: (branch: Branch) => void;
  // Owner için: 'all' | 'single' — 'all' seçilince tüm şubeler gösterilir
  viewMode: 'all' | 'single';
  setViewMode: (mode: 'all' | 'single') => void;
  refreshBranchSettings: () => Promise<void>;
}

const BranchContext = createContext<BranchContextType | null>(null);

export function BranchProvider({ children }: { children: ReactNode }) {
  const { currentUser, isOwner } = useAuth();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [activeBranch, setActiveBranchState] = useState<Branch | null>(null);
  const [branchSettings, setBranchSettings] = useState<BranchSettings | null>(null);
  const [viewMode, setViewMode] = useState<'all' | 'single'>('single');

  // Şubeleri yükle
  useEffect(() => {
    if (!currentUser) return;
    api.getBranches().then(bs => {
      setBranches(bs);
      if (!isOwner && currentUser.branchId) {
        // Çalışan: sadece kendi şubesi
        const myBranch = bs.find(b => b.id === currentUser.branchId) || null;
        setActiveBranchState(myBranch);
      } else if (isOwner) {
        // Owner: son seçilen şubeyi hatırla, yoksa ilk şubeyi seç
        const savedId = localStorage.getItem('activeBranchId');
        const savedBranch = savedId ? bs.find(b => b.id === savedId) : null;
        setActiveBranchState(savedBranch || bs[0] || null);
        const savedMode = localStorage.getItem('viewMode') as 'all' | 'single' | null;
        if (savedMode) setViewMode(savedMode);
      }
    });
  }, [currentUser, isOwner]);

  // Şube ayarlarını yükle
  useEffect(() => {
    if (activeBranch) {
      api.getBranchSettings(activeBranch.id).then(setBranchSettings);
    }
  }, [activeBranch]);

  const setActiveBranch = (branch: Branch) => {
    setActiveBranchState(branch);
    localStorage.setItem('activeBranchId', branch.id);
  };

  const handleSetViewMode = (mode: 'all' | 'single') => {
    setViewMode(mode);
    localStorage.setItem('viewMode', mode);
  };

  const refreshBranchSettings = async () => {
    if (activeBranch) {
      const settings = await api.getBranchSettings(activeBranch.id);
      setBranchSettings(settings);
    }
  };

  const activeBranchId = viewMode === 'all' ? null : (activeBranch?.id || null);

  return (
    <BranchContext.Provider value={{
      branches, activeBranch, activeBranchId, branchSettings,
      setActiveBranch, viewMode, setViewMode: handleSetViewMode,
      refreshBranchSettings,
    }}>
      {children}
    </BranchContext.Provider>
  );
}

export function useBranch() {
  const ctx = useContext(BranchContext);
  if (!ctx) throw new Error('useBranch must be used within BranchProvider');
  return ctx;
}
