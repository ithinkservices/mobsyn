'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { NAVIGATION_ITEMS } from '@/lib/navigation';
import { 
  LayoutDashboard, 
  Kanban, 
  Box, 
  FileText, 
  Wrench, 
  ShieldAlert, 
  MessageSquare,
  Factory,
  DollarSign,
  Settings
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard,
  Kanban,
  Box,
  FileText,
  Wrench,
  ShieldAlert,
  MessageSquare,
  Factory,
  DollarSign,
  Settings
};

export const MobileBottomNav: React.FC = () => {
  const { currentUser, abaAtiva, setAbaAtiva, totalMensagensNaoLidas } = useApp();

  if (!currentUser) return null;

  // Filtra até 4-5 itens mais prioritários para mobile de acordo com o papel
  const allowedItems = NAVIGATION_ITEMS.filter((item) =>
    item.allowedRoles.includes(currentUser.papel) && item.isMobileQuickAction
  ).slice(0, 5);

  if (allowedItems.length === 0) return null;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-zinc-950/95 border-t border-zinc-800/80 backdrop-blur-md px-3 py-2 flex items-center justify-around">
      {allowedItems.map((item) => {
        const Icon = ICON_MAP[item.iconName] || LayoutDashboard;
        const isActive = abaAtiva === item.id;
        const isWhatsapp = item.id === 'whatsapp';

        return (
          <button
            key={item.id}
            id={`mobile-nav-${item.id}`}
            onClick={() => setAbaAtiva(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
              isActive
                ? 'text-cyan-400 font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-400 stroke-[2.2]' : 'text-zinc-400'}`} />
              {isWhatsapp && totalMensagensNaoLidas > 0 ? (
                <span className="absolute -top-1.5 -right-2 px-1 min-w-[15px] h-[15px] rounded-full bg-emerald-500 text-zinc-950 font-bold text-[9px] flex items-center justify-center">
                  {totalMensagensNaoLidas}
                </span>
              ) : item.badge ? (
                <span className="absolute -top-1 -right-2 w-2 h-2 rounded-full bg-cyan-400" />
              ) : null}
            </div>
            <span className="text-[10px] mt-1 tracking-tight truncate max-w-[70px]">
              {item.shortLabel || item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
