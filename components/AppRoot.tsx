'use client';

import React from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import { LoginView } from '@/components/auth/LoginView';
import { AppLayout } from '@/components/layout/AppLayout';

function MainApp() {
  const { isAuthenticated } = useApp();

  if (!isAuthenticated) {
    return <LoginView />;
  }

  return <AppLayout />;
}

export function AppRoot() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}

export default AppRoot;
