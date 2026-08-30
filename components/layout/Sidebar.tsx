'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { NAVIGATION_ITEMS, PAPEL_LABELS } from '@/lib/navigation';
import { 
  LayoutDashboard, 
  Kanban, 
  MessageSquare, 
  Box, 
  FileText, 
  Factory, 
  Wrench, 
  DollarSign, 
  ShieldAlert, 
  Settings,
  Layers,
  ChevronRight,
  Sparkles,
  Smartphone,
  Building2,
  Briefcase,
  WrenchIcon,
  PieChart,
  Package
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard,
  Kanban,
  MessageSquare,
  Box,
  FileText,
  Factory,
  Wrench,
  DollarSign,
  ShieldAlert,
  Settings,
  Package,
};

export const Sidebar: React.FC = () => {
  const { currentUser, empresaAtiva, abaAtiva, setAbaAtiva, isMobileDrawerOpen, setIsMobileDrawerOpen, totalMensagensNaoLidas } = useApp();

  if (!currentUser) return null;

  // Filtra itens permitidos para o papel do usuário e permissões customizadas
  const allowedNavItems = NAVIGATION_ITEMS.filter((item) => {
    if (currentUser.permissoes && typeof currentUser.permissoes[item.id] === 'boolean') {
      return currentUser.permissoes[item.id];
    }
    return item.allowedRoles.includes(currentUser.papel);
  });

  const roleInfo = PAPEL_LABELS[currentUser.papel];
  const isMontador = currentUser.papel === 'montador';

  const handleNavClick = (id: string) => {
    setAbaAtiva(id);
    setIsMobileDrawerOpen(false);
  };

  // Group items into logical sections
  const comercialIds = ['crm', 'whatsapp', 'projetos', 'contratos'];
  const operacaoIds = ['producao', 'estoque', 'montagem', 'pos-venda'];
  const gestaoIds = ['financeiro', 'configuracoes'];

  const dashboardItems = allowedNavItems.filter(i => i.id === 'dashboard');
  const comercialItems = allowedNavItems.filter(i => comercialIds.includes(i.id));
  const operacaoItems = allowedNavItems.filter(i => operacaoIds.includes(i.id));
  const gestaoItems = allowedNavItems.filter(i => gestaoIds.includes(i.id));

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isMobileDrawerOpen && (
        <div
          onClick={() => setIsMobileDrawerOpen(false)}
          className="fixed inset-0 bg-zinc-950/70 z-40 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-68 bg-zinc-950 border-r border-zinc-800/80 text-zinc-200 flex flex-col justify-between transition-transform duration-200 ease-out shadow-xl lg:shadow-none ${
          isMobileDrawerOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand & Header */}
        <div className="flex flex-col h-full overflow-hidden">
          <div className="h-16 px-5 border-b border-zinc-800/80 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-0.5 shadow-md shadow-cyan-950/50 flex items-center justify-center">
                <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center text-cyan-400">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-white tracking-tight">MobPlan</span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 rounded">
                    ERP
                  </span>
                </div>
                <div className="text-[10px] text-zinc-500 font-medium tracking-tight">MÓVEIS SOB MEDIDA</div>
              </div>
            </div>
          </div>

          {/* Active Unit Badge */}
          <div className="px-4 py-2.5 bg-zinc-900/60 border-b border-zinc-800/60 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <Building2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="text-[11px] font-semibold text-zinc-300 truncate">
                {empresaAtiva?.nomeFantasia || 'Arte & Forma Móveis'}
              </span>
            </div>
            <span className="text-[9px] font-mono px-1.5 py-0.5 bg-zinc-800 text-zinc-400 rounded shrink-0">
              {empresaAtiva?.uf || 'SP'}
            </span>
          </div>

          {/* Role Status Banner */}
          <div className="px-4 py-2.5 border-b border-zinc-800/80 bg-zinc-900/40 shrink-0">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">
                Perfil Ativo
              </span>
              {isMontador && (
                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-cyan-300 bg-cyan-950/80 border border-cyan-800/60 px-1.5 py-0.2 rounded-full">
                  <Smartphone className="w-2.5 h-2.5" />
                  Campo
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-zinc-200 truncate">
                {roleInfo.label}
              </span>
            </div>
          </div>

          {/* Navigation Section with Categories */}
          <nav className="flex-1 p-3 space-y-5 overflow-y-auto">
            {/* Dashboard / Visão Geral */}
            {dashboardItems.length > 0 && (
              <div className="space-y-1">
                {dashboardItems.map((item) => {
                  const Icon = ICON_MAP[item.iconName] || LayoutDashboard;
                  const isActive = abaAtiva === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all duration-150 group cursor-pointer ${
                        isActive
                          ? 'bg-gradient-to-r from-zinc-800 to-zinc-800/90 text-white font-semibold shadow-sm border border-zinc-700/80'
                          : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/80 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-cyan-400' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isActive ? 'text-cyan-400 opacity-100' : 'text-zinc-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5'}`} />
                    </button>
                  );
                })}
              </div>
            )}

            {/* Comercial */}
            {comercialItems.length > 0 && (
              <div className="space-y-1">
                <div className="px-3 pb-1 text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase className="w-3 h-3 text-cyan-500" />
                  <span>Comercial & Vendas</span>
                </div>
                {comercialItems.map((item) => {
                  const Icon = ICON_MAP[item.iconName] || LayoutDashboard;
                  const isActive = abaAtiva === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all duration-150 group cursor-pointer ${
                        isActive
                          ? 'bg-gradient-to-r from-zinc-800 to-zinc-800/90 text-white font-semibold shadow-sm border border-zinc-700/80'
                          : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/80 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-cyan-400' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {item.id === 'whatsapp' && totalMensagensNaoLidas > 0 ? (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            {totalMensagensNaoLidas}
                          </span>
                        ) : item.badge ? (
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                            isActive ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                          }`}>
                            {item.badge}
                          </span>
                        ) : null}
                        <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isActive ? 'text-cyan-400 opacity-100' : 'text-zinc-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5'}`} />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Operação & Fábrica */}
            {operacaoItems.length > 0 && (
              <div className="space-y-1">
                <div className="px-3 pb-1 text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                  <WrenchIcon className="w-3 h-3 text-amber-500" />
                  <span>Fábrica & Montagem</span>
                </div>
                {operacaoItems.map((item) => {
                  const Icon = ICON_MAP[item.iconName] || LayoutDashboard;
                  const isActive = abaAtiva === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all duration-150 group cursor-pointer ${
                        isActive
                          ? 'bg-gradient-to-r from-zinc-800 to-zinc-800/90 text-white font-semibold shadow-sm border border-zinc-700/80'
                          : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/80 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-cyan-400' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {item.badge && (
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                            isActive ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                        <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isActive ? 'text-cyan-400 opacity-100' : 'text-zinc-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5'}`} />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Gestão */}
            {gestaoItems.length > 0 && (
              <div className="space-y-1">
                <div className="px-3 pb-1 text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                  <PieChart className="w-3 h-3 text-emerald-500" />
                  <span>Gestão & Ajustes</span>
                </div>
                {gestaoItems.map((item) => {
                  const Icon = ICON_MAP[item.iconName] || LayoutDashboard;
                  const isActive = abaAtiva === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all duration-150 group cursor-pointer ${
                        isActive
                          ? 'bg-gradient-to-r from-zinc-800 to-zinc-800/90 text-white font-semibold shadow-sm border border-zinc-700/80'
                          : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/80 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-cyan-400' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isActive ? 'text-cyan-400 opacity-100' : 'text-zinc-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5'}`} />
                    </button>
                  );
                })}
              </div>
            )}
          </nav>
        </div>

        {/* Footer Info / Process Indicator */}
        <div className="p-3 border-t border-zinc-800/80 bg-zinc-950 shrink-0">
          <div className="rounded-xl p-2.5 bg-zinc-900/60 border border-zinc-800/60 space-y-1">
            <div className="flex items-center gap-1.5 text-cyan-400 text-[11px] font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ciclo de Marcenaria</span>
            </div>
            <p className="text-[10px] text-zinc-400 leading-relaxed truncate">
              CRM ➔ 3D ➔ Orçamento ➔ Fábrica ➔ Montagem
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
