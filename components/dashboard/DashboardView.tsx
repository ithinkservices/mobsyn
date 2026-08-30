'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { PAPEL_LABELS } from '@/lib/navigation';
import { 
  Users, 
  FileText, 
  DollarSign, 
  Box, 
  Wrench, 
  Building2, 
  TrendingUp, 
  Layers, 
  Calendar, 
  ArrowUpRight, 
  Database,
  CheckCircle2,
  Clock,
  Sparkles,
  Smartphone,
  ShieldCheck,
  ChevronRight,
  FolderOpen,
  Plus,
  ArrowRight,
  Percent,
  Cpu,
  Boxes,
  Compass
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { 
    currentUser, 
    empresaAtiva, 
    clientes, 
    negocios, 
    projetos, 
    contratos, 
    itensOrcamento,
    usuarios,
    empresas,
    setAbaAtiva 
  } = useApp();

  if (!currentUser || !empresaAtiva) return null;

  const roleInfo = PAPEL_LABELS[currentUser.papel];
  const isMontador = currentUser.papel === 'montador';

  // Calculations
  const totalLeads = negocios.length;
  const contratosEmProducao = contratos.filter(c => c.statusAssinatura === 'assinado' || c.statusAssinatura === 'em_producao').length;
  const faturamentoEstimado = contratos.reduce((acc, c) => acc + (c.valorTotal || 0), 0);
  const projetosAtivos = projetos.length;
  const ticketMedio = contratos.length > 0 ? faturamentoEstimado / contratos.length : 0;

  // Contagem por Etapa do Funil CRM (baseada em negócios)
  const countNegociosNovo = negocios.filter(n => n.etapaFunil === 'contato_inicial').length;
  const countNegociosAtendimento = negocios.filter(n => n.etapaFunil === 'briefing_medicao' || n.etapaFunil === 'projeto_3d').length;
  const countNegociosOrcamento = negocios.filter(n => n.etapaFunil === 'apresentacao_orcamento' || n.etapaFunil === 'negociacao').length;
  const countNegociosFechado = negocios.filter(n => n.etapaFunil === 'fechado_ganho').length;
  const countNegociosPerdido = negocios.filter(n => n.etapaFunil === 'perdido').length;

  return (
    <div id="dashboard-view" className="space-y-6 sm:space-y-8">
      
      {/* Welcome Greeting Banner */}
      <div className="bg-gradient-to-r from-cyan-600 via-indigo-600 to-indigo-700 text-white rounded-2xl p-4 sm:p-5 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none -mr-16 -mt-16" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-medium text-cyan-100 border border-white/20">
              <Sparkles className="w-3 h-3 text-cyan-300 animate-pulse" />
              <span>Sessão Ativa • MobPlan ERP</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              Olá, {currentUser.nome}! 👋
            </h1>
            <p className="text-xs text-cyan-100/90 max-w-xl">
              Gerencie leads no CRM, projetos 3D e acompanhe a produção da fábrica em tempo real.
            </p>
          </div>
          <div className="bg-black/20 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-white/10 flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-cyan-200 font-bold text-sm">
              {currentUser.nome.charAt(0)}
            </div>
            <div>
              <div className="text-[11px] font-semibold text-cyan-200">{empresaAtiva.nomeFantasia}</div>
              <div className="text-xs font-bold text-white">{roleInfo.label}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Banner / Executive Welcome */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-5 sm:p-7 shadow-xs relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-72 h-72 bg-gradient-to-bl from-cyan-500/10 via-indigo-500/5 to-transparent rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-600 dark:text-cyan-400 mb-1">
              <Building2 className="w-3.5 h-3.5" />
              <span>{empresaAtiva.nomeFantasia}</span>
              <span className="text-zinc-300 dark:text-zinc-700">•</span>
              <span className="font-mono text-zinc-500">{empresaAtiva.cnpj}</span>
              <span className="text-zinc-300 dark:text-zinc-700">•</span>
              <span className="text-zinc-500">{empresaAtiva.cidade}/{empresaAtiva.uf}</span>
            </div>

            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Painel de Gestão & Operação
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl leading-relaxed">
              Visão consolidada para lojas e fábricas de móveis sob medida. Da captação de leads à montagem final em campo.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 shadow-2xs ${roleInfo.bg}`}>
              <ShieldCheck className="w-4 h-4" />
              <span>{roleInfo.label}</span>
            </div>

            {isMontador && (
              <div className="px-3 py-1.5 rounded-xl bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 text-xs font-bold flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5" />
                <span>Modo Smartphone Ativo</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Action Shortcut Ribbon */}
        <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mr-1">
            Atalhos Rápidos:
          </span>
          <button
            onClick={() => setAbaAtiva('crm')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-cyan-500 hover:text-white text-zinc-700 dark:text-zinc-300 font-semibold transition-all cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Lead CRM</span>
          </button>
          <button
            onClick={() => setAbaAtiva('projetos')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-indigo-500 hover:text-white text-zinc-700 dark:text-zinc-300 font-semibold transition-all cursor-pointer shadow-2xs"
          >
            <Box className="w-3.5 h-3.5" />
            <span>Importar 3D Promob</span>
          </button>
          <button
            onClick={() => setAbaAtiva('contratos')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-emerald-500 hover:text-white text-zinc-700 dark:text-zinc-300 font-semibold transition-all cursor-pointer shadow-2xs"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Emitir Contrato #N/ANO</span>
          </button>
          <button
            onClick={() => setAbaAtiva('montagem')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-teal-500 hover:text-white text-zinc-700 dark:text-zinc-300 font-semibold transition-all cursor-pointer shadow-2xs"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Ordens de Montagem</span>
          </button>
        </div>
      </div>

      {/* Main KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Card 1: Leads no Funil */}
        <div 
          id="card-leads-no-funil"
          onClick={() => setAbaAtiva('crm')}
          className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-cyan-500/60 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Leads no Funil (CRM)
              </span>
              <div className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-800/60 group-hover:scale-105 transition-transform">
                <Users className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                {totalLeads} <span className="text-xs font-normal text-zinc-400">contatos</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-mono">
                  +12% este mês
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs font-bold text-cyan-600 dark:text-cyan-400">
            <span>Abrir Funil de Vendas</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </div>

        {/* Card 2: Contratos em Produção */}
        <div 
          id="card-contratos-em-producao"
          onClick={() => setAbaAtiva('contratos')}
          className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-emerald-500/60 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Contratos em Produção
              </span>
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/60 group-hover:scale-105 transition-transform">
                <FileText className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                {contratosEmProducao} <span className="text-xs font-normal text-zinc-400">ativos</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Corte, usinagem & montagem</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <span>Acompanhar Contratos</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </div>

        {/* Card 3: Faturamento Total */}
        <div 
          id="card-faturamento-do-mes"
          onClick={() => setAbaAtiva('financeiro')}
          className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-teal-500/60 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Volume em Contratos
              </span>
              <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 border border-teal-100 dark:border-teal-800/60 group-hover:scale-105 transition-transform">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight font-mono">
                {faturamentoEstimado > 0 
                  ? faturamentoEstimado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                  : 'R$ 0,00'}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                <TrendingUp className="w-3.5 h-3.5 text-teal-500" />
                <span>Ticket Médio: {ticketMedio.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs font-bold text-teal-600 dark:text-teal-400">
            <span>Ver Fluxo Financeiro</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </div>

        {/* Card 4: Projetos 3D */}
        <div 
          onClick={() => setAbaAtiva('projetos')}
          className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-indigo-500/60 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Projetos 3D & Orçamentos
              </span>
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/60 group-hover:scale-105 transition-transform">
                <Box className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                {projetosAtivos} <span className="text-xs font-normal text-zinc-400">projetos</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-mono">
                  {itensOrcamento.length} itens orçados
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400">
            <span>Abrir Detalhamento 3D</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </div>

      </div>

      {/* Operational Process Flow (Horizontal Process Step Pipeline) */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
              Pipeline Integrado do Ciclo de Marcenaria
            </h2>
            <p className="text-xs text-zinc-500">
              Visão macro da esteira: cada módulo opera sincronizado com os dados centrais
            </p>
          </div>
          <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/60">
            6 Fases Ativas
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          
          <div onClick={() => setAbaAtiva('crm')} className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 hover:border-cyan-500/50 cursor-pointer transition-all">
            <div className="text-[10px] font-mono font-bold text-cyan-600 dark:text-cyan-400">01. CAPTAÇÃO</div>
            <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-1">CRM & Funil</div>
            <div className="text-[11px] text-zinc-400 mt-0.5">{negocios.length} leads ativos</div>
          </div>

          <div onClick={() => setAbaAtiva('whatsapp')} className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 hover:border-emerald-500/50 cursor-pointer transition-all">
            <div className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">02. CONTATO</div>
            <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-1">WhatsApp Web</div>
            <div className="text-[11px] text-zinc-400 mt-0.5">Atendimento ágil</div>
          </div>

          <div onClick={() => setAbaAtiva('projetos')} className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 hover:border-indigo-500/50 cursor-pointer transition-all">
            <div className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400">03. PROJETOS</div>
            <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-1">3D & Margem</div>
            <div className="text-[11px] text-zinc-400 mt-0.5">Promob / SketchUp</div>
          </div>

          <div onClick={() => setAbaAtiva('contratos')} className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 hover:border-amber-500/50 cursor-pointer transition-all">
            <div className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400">04. FECHAMENTO</div>
            <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-1">Contrato #N/ANO</div>
            <div className="text-[11px] text-zinc-400 mt-0.5">{contratos.length} gerados</div>
          </div>

          <div onClick={() => setAbaAtiva('producao')} className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 hover:border-rose-500/50 cursor-pointer transition-all">
            <div className="text-[10px] font-mono font-bold text-rose-600 dark:text-rose-400">05. FÁBRICA</div>
            <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-1">Corte CNC & Borda</div>
            <div className="text-[11px] text-zinc-400 mt-0.5">Esteira industrial</div>
          </div>

          <div onClick={() => setAbaAtiva('montagem')} className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 hover:border-teal-500/50 cursor-pointer transition-all">
            <div className="text-[10px] font-mono font-bold text-teal-600 dark:text-teal-400">06. CAMPO</div>
            <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-1">Montagem Mobile</div>
            <div className="text-[11px] text-zinc-400 mt-0.5">Checklist & Sign</div>
          </div>

        </div>
      </div>

      {/* CRM Funnel Phase Summary Widget */}
      <div 
        onClick={() => setAbaAtiva('crm')}
        className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-cyan-500/50 rounded-3xl p-5 sm:p-7 shadow-xs cursor-pointer transition-all group"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800 gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
                Resumo do Funil de Clientes por Fase (CRM)
              </h2>
              <p className="text-xs text-zinc-500">
                Acompanhe o volume de clientes em cada etapa do atendimento comercial em tempo real
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-600 dark:text-cyan-400 group-hover:translate-x-1 transition-transform">
            <span>Abrir CRM Completo</span>
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-5">
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/70 dark:border-zinc-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-500">
              <span>Novos Leads</span>
              <span className="w-2 h-2 rounded-full bg-blue-500" />
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-zinc-900 dark:text-white font-mono">{countNegociosNovo}</span>
              <span className="text-[11px] text-zinc-400">cadastros</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/70 dark:border-zinc-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-500">
              <span>Em Atendimento</span>
              <span className="w-2 h-2 rounded-full bg-cyan-500" />
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-zinc-900 dark:text-white font-mono">{countNegociosAtendimento}</span>
              <span className="text-[11px] text-zinc-400">em diálogo</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/70 dark:border-zinc-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-500">
              <span>Orçamento Enviado</span>
              <span className="w-2 h-2 rounded-full bg-amber-500" />
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-zinc-900 dark:text-white font-mono">{countNegociosOrcamento}</span>
              <span className="text-[11px] text-zinc-400">propostas</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/70 dark:border-zinc-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-500">
              <span>Fechados (Ganho)</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-zinc-900 dark:text-white font-mono">{countNegociosFechado}</span>
              <span className="text-[11px] text-zinc-400">convertidos</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/70 dark:border-zinc-800 flex flex-col justify-between col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-500">
              <span>Perdidos / Arquivados</span>
              <span className="w-2 h-2 rounded-full bg-rose-500" />
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-zinc-900 dark:text-white font-mono">{countNegociosPerdido}</span>
              <span className="text-[11px] text-zinc-400">encerrados</span>
            </div>
          </div>
        </div>
      </div>

      {/* Model Schema Relational Architecture */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800 gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white">
                Estrutura de Entidades Relacionais (Multi-Tenant)
              </h3>
              <p className="text-xs text-zinc-500">
                7 tabelas relacionais com isolamento total por empresaId e regras de integridade
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 px-3 py-1 rounded-full self-start sm:self-auto">
            ✓ 7 Tabelas Operacionais
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-5">
          
          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                1. empresas
              </span>
              <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-cyan-100 dark:bg-cyan-900/60 text-cyan-700 dark:text-cyan-300 font-mono">
                {empresas.length} registros
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
              id, nomeFantasia, razaoSocial, cnpj, telefone, email, endereco, created_at
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                2. usuarios
              </span>
              <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-cyan-100 dark:bg-cyan-900/60 text-cyan-700 dark:text-cyan-300 font-mono">
                {usuarios.length} membros
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
              id, nome, email, papel (admin, vendedor, projetista, montador, etc.), empresasIds
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                3. clientes
              </span>
              <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-cyan-100 dark:bg-cyan-900/60 text-cyan-700 dark:text-cyan-300 font-mono">
                {clientes.length} na unidade
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
              id, empresaId, nome, contato, whatsapp, cpfCnpj, endereco, origemLead
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                4. negocios
              </span>
              <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-cyan-100 dark:bg-cyan-900/60 text-cyan-700 dark:text-cyan-300 font-mono">
                {negocios.length} no funil
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
              id, empresaId, clienteId, titulo, etapaFunil, valorEstimado, scoreLead
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                5. projetos
              </span>
              <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-cyan-100 dark:bg-cyan-900/60 text-cyan-700 dark:text-cyan-300 font-mono">
                {projetos.length} 3D modelados
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
              id, empresaId, negocioId, softwareOrigem (Promob/SketchUp), versao, status
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                6. contratos
              </span>
              <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-cyan-100 dark:bg-cyan-900/60 text-cyan-700 dark:text-cyan-300 font-mono">
                {contratos.length} contratos
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
              id, empresaId, negocioId, numeroContrato (#N/ANO), valorTotal, statusAssinatura
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 md:col-span-2 lg:col-span-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                7. itens_orcamento
              </span>
              <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-cyan-100 dark:bg-cyan-900/60 text-cyan-700 dark:text-cyan-300 font-mono">
                {itensOrcamento.length} itens cadastrados
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
              id, empresaId, projetoId, codigo, descricao, medidas (L x A x P em mm), material, acabamento, custoUnitario, precoVenda, margemLucro
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};
