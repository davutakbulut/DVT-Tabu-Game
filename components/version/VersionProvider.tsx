'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { versionService, VersionCheckResult, CURRENT_CLIENT_VERSION } from '@/lib/versionService';
import { UpdateModal } from '@/components/version/UpdateModal';
import { VersionBanner } from '@/components/version/VersionBanner';

interface VersionContextType {
  currentVersion: string;
  updateInfo: VersionCheckResult | null;
  checkNow: (force?: boolean) => Promise<VersionCheckResult>;
  openUpdateModal: () => void;
  closeUpdateModal: () => void;
}

const VersionContext = createContext<VersionContextType>({
  currentVersion: CURRENT_CLIENT_VERSION,
  updateInfo: null,
  checkNow: async () => ({} as any),
  openUpdateModal: () => {},
  closeUpdateModal: () => {},
});

export const useVersion = () => useContext(VersionContext);

export const VersionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [updateInfo, setUpdateInfo] = useState<VersionCheckResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);

  const performCheck = async (force = false) => {
    try {
      const res = await versionService.checkForUpdates(force);
      setUpdateInfo(res);

      if (res.hasUpdate) {
        if (res.isMandatory) {
          setIsModalOpen(true);
        }
      }
      return res;
    } catch {
      return {} as VersionCheckResult;
    }
  };

  useEffect(() => {
    // 1. Initial check
    performCheck(false);

    // 2. Window focus check
    const onFocus = () => performCheck(false);
    window.addEventListener('focus', onFocus);

    // 3. Periodic timer check (every 5 mins)
    const interval = setInterval(() => performCheck(false), 5 * 60 * 1000);

    return () => {
      window.removeEventListener('focus', onFocus);
      clearInterval(interval);
    };
  }, []);

  return (
    <VersionContext.Provider
      value={{
        currentVersion: CURRENT_CLIENT_VERSION,
        updateInfo,
        checkNow: (force = true) => performCheck(force),
        openUpdateModal: () => setIsModalOpen(true),
        closeUpdateModal: () => setIsModalOpen(false),
      }}
    >
      {children}

      {/* Optional update top banner */}
      {updateInfo && updateInfo.hasUpdate && !updateInfo.isMandatory && !isBannerDismissed && !isModalOpen && (
        <VersionBanner
          updateInfo={updateInfo}
          onOpenDetails={() => setIsModalOpen(true)}
          onDismiss={() => setIsBannerDismissed(true)}
        />
      )}

      {/* Force or detailed update modal */}
      {updateInfo && (
        <UpdateModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          updateInfo={updateInfo}
        />
      )}
    </VersionContext.Provider>
  );
};
