'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { PAPEL_LABELS } from '@/lib/navigation';
import { PapelUsuario } from '@/types/database';
import { 
  Building2, 
  ChevronDown, 
  LogOut, 
  Menu, 
  Bell, 
  Check, 
  Plus, 
  UserCheck, 
  Sparkles,
  Smartphone,
  ShieldAlert,
  Layers,
  ArrowRight,
  Shield,
  MessageSquare
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    currentUser, 
    empresaAtiva, 
    empresas, 
    trocarEmpresaAtiva, 
    logout, 
    setQuickRole,
    isMobileDrawerOpen, 
    setIsMobileDrawerOpen,
    totalMensagensNaoLidas,
    setAbaAtiva
  } = useApp();

  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  if (!currentUser) return null;

  const roleInfo = PAPEL_LABELS[currentUser.papel];
  const allRoles: PapelUsuario[] = ['administrador', 'vendedor', 'projetista', 'producao', 'montador', 'financeiro'];

  return (
    <header className="h-16 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
      
      {/* Left: Mobile Toggle & Multi-Empresa Selector */}
      <div className="flex items-center gap-3">
        <button
          id="btn-toggle-mobile-menu"
          onClick={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
          className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 lg:hidden cursor-pointer"
          aria-label="Abrir Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Company Selector Dropdown (Multi-empresa) */}
        <div className="relative">
          <button
            id="btn-empresa-dropdown"
            onClick={() => {
              setIsCompanyDropdownOpen(!isCompanyDropdownOpen);
              setIsRoleDropdownOpen(false);
              setIsUserMenuOpen(false);
            }}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-cyan-500/50 bg-zinc-50 dark:bg-zinc-900 transition-all text-left group cursor-pointer shadow-2xs"
          >
            <div className="p-1 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <Building2 className="w-3.5 h-3.5" />
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate max-w-[170px]">
                  {empresaAtiva?.nomeFantasia || 'Arte & Forma'}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono font-medium">
                  {empresaAtiva?.uf || 'SP'}
                </span>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono block -mt-0.5">
                {empresaAtiva?.cnpj ? empresaAtiva.cnpj.slice(0, 10) + '...' : '00.000...'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-200 transition-transform ml-0.5" />
          </button>

          {/* Multi-Company Dropdown Menu */}
          {isCompanyDropdownOpen && (
            <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Empresas Vinculadas (Multi-CNPJ)
                </span>
                <span className="text-[11px] text-zinc-500">
                  Os dados e fluxos operacionais são isolados por CNPJ
                </span>
              </div>

              <div className="space-y-1 py-1.5">
                {empresas.map((emp) => {
                  const isActive = emp.id === empresaAtiva?.id;
                  return (
                    <button
                      key={emp.id}
                      id={`select-empresa-${emp.id}`}
                      onClick={() => {
                        trocarEmpresaAtiva(emp.id);
                        setIsCompanyDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 font-medium border border-cyan-500/20'
                          : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-200'
                      }`}
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <div className="text-xs font-bold truncate">{emp.nomeFantasia}</div>
                        <div className="text-[11px] text-zinc-400 font-mono truncate">{emp.cnpj} • {emp.cidade}/{emp.uf}</div>
                      </div>
                      {isActive && <Check className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: Role Switcher Pill & User Avatar */}
      <div className="flex items-center gap-2.5">
        
        {/* WhatsApp Quick Inbox Button */}
        <button
          id="btn-navbar-whatsapp-inbox"
          onClick={() => setAbaAtiva('whatsapp')}
          title="Atendimento WhatsApp"
          className="relative p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-850 transition-colors cursor-pointer flex items-center justify-center"
        >
          <MessageSquare className="w-4 h-4 text-emerald-500" />
          {totalMensagensNaoLidas > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 bg-emerald-500 text-zinc-950 font-extrabold text-[10px] rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-950 shadow-xs animate-pulse">
              {totalMensagensNaoLidas}
            </span>
          )}
        </button>

        {/* Quick Role Tester Switcher */}
        <div className="relative">
          <button
            id="btn-role-switcher"
            onClick={() => {
              setIsRoleDropdownOpen(!isRoleDropdownOpen);
              setIsCompanyDropdownOpen(false);
              setIsUserMenuOpen(false);
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer shadow-2xs ${roleInfo.bg}`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span className="hidden md:inline text-zinc-500 dark:text-zinc-400">Papel:</span>
            <span className="font-bold">{roleInfo.label}</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-70" />
          </button>

          {isRoleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">
                  Simular Permissões de Usuário
                </span>
                <span className="text-[11px] text-zinc-500">
                  Alterne para verificar a interface e regras de cada perfil operacional:
                </span>
              </div>

              <div className="space-y-1.5 py-2">
                {allRoles.map((r) => {
                  const info = PAPEL_LABELS[r];
                  const isSelected = currentUser.papel === r;
                  return (
                    <button
                      key={r}
                      id={`switch-to-role-${r}`}
                      onClick={() => {
                        setQuickRole(r);
                        setIsRoleDropdownOpen(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-cyan-500/80 bg-cyan-500/10 text-cyan-900 dark:text-cyan-200' 
                          : 'border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800/80'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          {info.label}
                        </span>
                        {isSelected && (
                          <span className="text-[9px] px-2 py-0.2 rounded-full bg-cyan-600 text-white font-bold">
                            Ativo
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-tight">
                        {info.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Logout */}
        <div className="relative">
          <button
            id="btn-user-profile-menu"
            onClick={() => {
              setIsUserMenuOpen(!isUserMenuOpen);
              setIsCompanyDropdownOpen(false);
              setIsRoleDropdownOpen(false);
            }}
            className="flex items-center gap-2 p-1 pl-2 rounded-full border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors cursor-pointer bg-zinc-50 dark:bg-zinc-900"
          >
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-200 hidden sm:inline">
              {currentUser.nome.split(' ')[0]}
            </span>
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-600 to-teal-500 text-white flex items-center justify-center font-bold text-xs shadow-inner">
              {currentUser.nome.charAt(0)}
            </div>
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800">
                <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                  {currentUser.nome}
                </div>
                <div className="text-[11px] text-zinc-400 truncate">{currentUser.email}</div>
                <div className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 mt-1 uppercase font-semibold">
                  {currentUser.papel}
                </div>
              </div>

              <div className="py-1">
                <button
                  id="btn-logout"
                  onClick={() => {
                    logout();
                    setIsUserMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sair do Sistema</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
