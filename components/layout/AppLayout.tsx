'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileBottomNav } from '@/components/layout/MobileNav';
import { DashboardView } from '@/components/dashboard/DashboardView';
import { CrmView } from '@/components/modules/CrmView';
import { ProjetosView } from '@/components/modules/ProjetosView';
import { ContratosView } from '@/components/modules/ContratosView';
import { ProducaoView } from '@/components/modules/ProducaoView';
import { EstoqueView } from '@/components/modules/EstoqueView';
import { MontagemView } from '@/components/modules/MontagemView';
import { WhatsappView } from '@/components/modules/WhatsappView';
import { FinanceiroView } from '@/components/modules/FinanceiroView';
import { PosVendaView } from '@/components/modules/PosVendaView';
import { ConfiguracoesView } from '@/components/modules/ConfiguracoesView';
import { CopilotoChatPanel } from '@/components/ai/CopilotoChatPanel';

export const AppLayout: React.FC = () => {
  const { abaAtiva } = useApp();

  const renderActiveModule = () => {
    switch (abaAtiva) {
      case 'dashboard':
        return <DashboardView />;
      case 'crm':
        return <CrmView />;
      case 'projetos':
        return <ProjetosView />;
      case 'contratos':
        return <ContratosView />;
      case 'producao':
        return <ProducaoView />;
      case 'estoque':
        return <EstoqueView />;
      case 'montagem':
        return <MontagemView />;
      case 'whatsapp':
        return <WhatsappView />;
      case 'financeiro':
        return <FinanceiroView />;
      case 'pos-venda':
        return <PosVendaView />;
      case 'configuracoes':
        return <ConfiguracoesView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900/40 dark:bg-zinc-950 flex flex-col lg:flex-row font-sans text-zinc-900 dark:text-zinc-100 antialiased selection:bg-cyan-500 selection:text-white">
      {/* Dynamic Sidebar with role-based filtering */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden pb-16 lg:pb-0">
        <Navbar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderActiveModule()}
        </main>

        {/* Mobile Navigation for field installers and on-the-go access */}
        <MobileBottomNav />

        {/* Global AI Copilot Assistant */}
        <CopilotoChatPanel />
      </div>
    </div>
  );
};
