'use client';

import React from 'react';
import { AuthProvider } from '../context/AuthContext';
import { LgpdConsentBanner } from './LgpdConsentBanner';

export const ClientProviders: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <AuthProvider>
      {children}
      <LgpdConsentBanner />
    </AuthProvider>
  );
};
