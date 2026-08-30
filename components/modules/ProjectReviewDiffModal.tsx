'use client';

import React, { useState, useMemo } from 'react';
import { 
  X, 
  Check, 
  AlertTriangle, 
  PlusCircle, 
  MinusCircle, 
  FileDiff, 
  ArrowRight, 
  Layers, 
  TrendingUp, 
  TrendingDown, 
  Maximize2, 
  Columns, 
  List, 
  Search, 
  Filter, 
  Building2, 
  DollarSign, 
  Calendar, 
  FileCheck, 
  History,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { 
  ItemOrcamentoOriginal, 
  ItemOrcamento, 
  Projeto, 
  TipoAlteracaoItemDiff,
  ItemDiffComparacao,
  VersaoHistoricoProjeto,
  SoftwareOrigem
} from '@/types/database';
import { calcularDiffRevisaoProjeto } from '@/lib/projectDiffEngine';

interface ProjectReviewDiffModalProps {
  isOpen: boolean;
  onClose: () => void;
  projeto?: Projeto;
  nomeVersaoBase?: string;
  itensBase: (ItemOrcamento | ItemOrcamentoOriginal)[];
  nomeVersaoNova?: string;
  itensNovaRevisao: (ItemOrcamento | ItemOrcamentoOriginal)[];
  motivoSugerido?: string;
  motivoRevisaoSugerido?: string;
  arquivoNome?: string;
  arquivoNovaRevisaoNome?: string;
  softwareOrigem?: SoftwareOrigem;
  onAprovar?: (motivo: string, novoValorVenda?: number) => void;
  onAprovarRevisao?: (motivo: string, novoValorVenda?: number) => void;
  onDescartar?: () => void;
  onDescartarRevisao?: () => void;
  modoApenasVisualizacao?: boolean;
}

export const ProjectReviewDiffModal: React.FC<ProjectReviewDiffModalProps> = ({
  isOpen,
  onClose,
  projeto,
  nomeVersaoBase = 'Versão Oficial Atual',
  itensBase,
  nomeVersaoNova = 'Nova Revisão (Pós-Medição)',
  itensNovaRevisao,
  motivoSugerido,
  motivoRevisaoSugerido = motivoSugerido || 'Ajuste pós medição técnica in-loco',
  arquivoNome,
  arquivoNovaRevisaoNome = arquivoNome,
  softwareOrigem = projeto?.softwareOrigem || 'promob',
  onAprovar,
  onAprovarRevisao = onAprovar,
  onDescartar,
  onDescartarRevisao = onDescartar,
  modoApenasVisualizacao = false,
}) => {
  const [viewMode, setViewMode] = useState<'unified' | 'split'>('unified');
  const [filtroTipo, setFiltroTipo] = useState<TipoAlteracaoItemDiff | 'todos'>('todos');
  const [filtroAmbiente, setFiltroAmbiente] = useState<string>('todos');
  const [buscaTexto, setBuscaTexto] = useState('');
  
  const [motivoInput, setMotivoInput] = useState(motivoRevisaoSugerido);
  const [novoValorVendaInput, setNovoValorVendaInput] = useState<string>(() => {
    if (projeto?.valorVendaDefinido) return String(projeto.valorVendaDefinido);
    return '0';
  });

  // Cálculo do Diff através do motor especializado
  const { itensDiff, resumo, itensPorAmbiente } = useMemo(() => {
    return calcularDiffRevisaoProjeto(itensBase, itensNovaRevisao);
  }, [itensBase, itensNovaRevisao]);

  // Lista de ambientes únicos
  const listaAmbientes = useMemo(() => {
    return Array.from(new Set(itensDiff.map(i => i.ambiente || 'Geral')));
  }, [itensDiff]);

  // Filtros aplicados
  const itensFiltrados = useMemo(() => {
    return itensDiff.filter(item => {
      if (filtroTipo !== 'todos' && item.tipo !== filtroTipo) return false;
      if (filtroAmbiente !== 'todos' && item.ambiente !== filtroAmbiente) return false;
      if (buscaTexto.trim()) {
        const query = buscaTexto.toLowerCase();
        const matchCod = item.codigo.toLowerCase().includes(query);
        const matchDesc = item.descricao.toLowerCase().includes(query);
        const matchAmb = item.ambiente.toLowerCase().includes(query);
        const matchMat = (item.itemRevisado?.material || item.itemOriginal?.material || '').toLowerCase().includes(query);
        if (!matchCod && !matchDesc && !matchAmb && !matchMat) return false;
      }
      return true;
    });
  }, [itensDiff, filtroTipo, filtroAmbiente, buscaTexto]);

  if (!isOpen) return null;

  const isAumentoCusto = resumo.variacaoCustoReais > 0;
  const isReducaoCusto = resumo.variacaoCustoReais < 0;

  const handleAprovar = () => {
    if (onAprovarRevisao) {
      const valorVendaNum = parseFloat(novoValorVendaInput.replace(/\./g, '').replace(',', '.')) || undefined;
      onAprovarRevisao(motivoInput || 'Revisão aprovada após medição', valorVendaNum);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-6xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* ========================================================================= */}
        {/* 1. CABEÇALHO DO MODAL COM IDENTIFICAÇÃO E STATUS                         */}
        {/* ========================================================================= */}
        <div className="p-4 sm:px-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/80 dark:bg-zinc-950/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shadow-xs">
              <FileDiff className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  Comparação de Revisão Técnica (Diff de Engenharia)
                </h3>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                  softwareOrigem === 'sketchup' 
                    ? 'bg-cyan-500/10 text-cyan-600 border border-cyan-500/30' 
                    : 'bg-amber-500/10 text-amber-600 border border-amber-500/30'
                }`}>
                  {softwareOrigem === 'sketchup' ? 'SketchUp 3D' : 'Promob XML/TXT'}
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                Comparando: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{nomeVersaoBase}</span> <ArrowRight className="w-3 h-3 inline text-zinc-400 mx-1" /> <span className="font-semibold text-cyan-600 dark:text-cyan-400">{nomeVersaoNova}</span>
                {arquivoNovaRevisaoNome && <span className="text-zinc-400 font-mono text-[11px]"> ({arquivoNovaRevisaoNome})</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. RESUMO DE VARIAÇÃO FINANCEIRA E DE PEÇAS NO TOPO                       */}
        {/* ========================================================================= */}
        <div className="p-4 sm:px-6 bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 text-white border-b border-zinc-800 shrink-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            
            {/* Custo Base */}
            <div className="p-3 bg-zinc-800/60 border border-zinc-700/60 rounded-xl">
              <span className="text-[10px] font-bold uppercase text-zinc-400 block mb-0.5">
                Custo Versão Original
              </span>
              <span className="text-base sm:text-lg font-black font-mono text-zinc-200">
                {resumo.custoTotalOriginal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
              <span className="text-[10px] text-zinc-400 block mt-0.5">
                {resumo.totalPecasOriginal} peças • {resumo.totalItensOriginal} itens
              </span>
            </div>

            {/* Custo Revisado */}
            <div className="p-3 bg-zinc-800/60 border border-zinc-700/60 rounded-xl">
              <span className="text-[10px] font-bold uppercase text-cyan-400 block mb-0.5">
                Custo Versão Revisada
              </span>
              <span className="text-base sm:text-lg font-black font-mono text-cyan-300">
                {resumo.custoTotalRevisado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
              <span className="text-[10px] text-zinc-400 block mt-0.5">
                {resumo.totalPecasRevisado} peças • {resumo.totalItensRevisado} itens
              </span>
            </div>

            {/* Variação Total (R$ e %) */}
            <div className={`p-3 rounded-xl border col-span-2 sm:col-span-2 flex items-center justify-between ${
              isAumentoCusto 
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' 
                : isReducaoCusto 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-zinc-800/60 border-zinc-700/60 text-zinc-300'
            }`}>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider block mb-0.5 opacity-80">
                  Impacto Financeiro da Revisão
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl sm:text-2xl font-black font-mono">
                    {resumo.variacaoCustoReais > 0 ? '+' : ''}{resumo.variacaoCustoReais.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                  <span className="text-xs sm:text-sm font-bold font-mono px-2 py-0.5 rounded-md bg-black/30">
                    {resumo.variacaoCustoPercent > 0 ? '+' : ''}{resumo.variacaoCustoPercent}%
                  </span>
                </div>
                <p className="text-[11px] opacity-80 mt-0.5">
                  {isAumentoCusto && 'Acréscimo de custo devido a ampliações ou acréscimo de peças.'}
                  {isReducaoCusto && 'Economia de custo obtida com ajustes de medidas ou otimizações.'}
                  {!isAumentoCusto && !isReducaoCusto && 'Custo total fabril permaneceu idêntico.'}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-black/30 shrink-0 hidden sm:block">
                {isAumentoCusto ? <TrendingUp className="w-6 h-6 text-amber-400" /> : <TrendingDown className="w-6 h-6 text-emerald-400" />}
              </div>
            </div>

          </div>

          {/* Cards de Contagem por Categoria */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-zinc-800 text-xs">
            <button
              type="button"
              onClick={() => setFiltroTipo(filtroTipo === 'adicionado' ? 'todos' : 'adicionado')}
              className={`p-2 rounded-lg flex items-center justify-between transition-all cursor-pointer ${
                filtroTipo === 'adicionado'
                  ? 'bg-emerald-500/30 border border-emerald-400 text-emerald-200 font-bold'
                  : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20'
              }`}
            >
              <span className="flex items-center gap-1.5 text-[11px]">
                <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Adicionadas</span>
              </span>
              <span className="font-mono font-black text-sm">{resumo.itensAdicionados}</span>
            </button>

            <button
              type="button"
              onClick={() => setFiltroTipo(filtroTipo === 'removido' ? 'todos' : 'removido')}
              className={`p-2 rounded-lg flex items-center justify-between transition-all cursor-pointer ${
                filtroTipo === 'removido'
                  ? 'bg-rose-500/30 border border-rose-400 text-rose-200 font-bold'
                  : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20'
              }`}
            >
              <span className="flex items-center gap-1.5 text-[11px]">
                <MinusCircle className="w-3.5 h-3.5 text-rose-400" />
                <span>Removidas</span>
              </span>
              <span className="font-mono font-black text-sm">{resumo.itensRemovidos}</span>
            </button>

            <button
              type="button"
              onClick={() => setFiltroTipo(filtroTipo === 'modificado' ? 'todos' : 'modificado')}
              className={`p-2 rounded-lg flex items-center justify-between transition-all cursor-pointer ${
                filtroTipo === 'modificado'
                  ? 'bg-amber-500/30 border border-amber-400 text-amber-200 font-bold'
                  : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20'
              }`}
            >
              <span className="flex items-center gap-1.5 text-[11px]">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Alteradas</span>
              </span>
              <span className="font-mono font-black text-sm">{resumo.itensModificados}</span>
            </button>

            <button
              type="button"
              onClick={() => setFiltroTipo(filtroTipo === 'inalterado' ? 'todos' : 'inalterado')}
              className={`p-2 rounded-lg flex items-center justify-between transition-all cursor-pointer ${
                filtroTipo === 'inalterado'
                  ? 'bg-zinc-700 border border-zinc-400 text-zinc-100 font-bold'
                  : 'bg-zinc-800/80 hover:bg-zinc-800 text-zinc-400 border border-zinc-700/60'
              }`}
            >
              <span className="flex items-center gap-1.5 text-[11px]">
                <FileCheck className="w-3.5 h-3.5 text-zinc-400" />
                <span>Inalteradas</span>
              </span>
              <span className="font-mono font-black text-sm">{resumo.itensInalterados}</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. BARRA DE FERRAMENTAS & FILTROS                                         */}
        {/* ========================================================================= */}
        <div className="p-3 sm:px-6 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          
          {/* Busca e Filtros de Ambiente */}
          <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
            <div className="relative flex-1 max-w-xs">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Buscar por código, descrição ou material..."
                value={buscaTexto}
                onChange={(e) => setBuscaTexto(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-zinc-100 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:border-cyan-500 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            {listaAmbientes.length > 1 && (
              <select
                value={filtroAmbiente}
                onChange={(e) => setFiltroAmbiente(e.target.value)}
                className="px-3 py-1.5 text-xs bg-zinc-100 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value="todos">Todos os Ambientes ({listaAmbientes.length})</option>
                {listaAmbientes.map(amb => (
                  <option key={amb} value={amb}>{amb}</option>
                ))}
              </select>
            )}

            {filtroTipo !== 'todos' && (
              <button
                type="button"
                onClick={() => setFiltroTipo('todos')}
                className="text-[11px] font-semibold text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                <span>Limpar filtro</span>
              </button>
            )}
          </div>

          {/* Alternador de Modo de Visualização: Lista Unificada vs Lado a Lado */}
          <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('unified')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'unified'
                  ? 'bg-white dark:bg-zinc-900 text-cyan-600 dark:text-cyan-400 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Lista Unificada</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('split')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'split'
                  ? 'bg-white dark:bg-zinc-900 text-cyan-600 dark:text-cyan-400 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Lado a Lado (Split)</span>
            </button>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* 4. CONTEÚDO PRINCIPAL: TABELA/LISTA DO DIFF COM CÓDIGO DE CORES           */}
        {/* ========================================================================= */}
        <div className="flex-1 overflow-y-auto p-4 sm:px-6 space-y-3">
          
          {itensFiltrados.length === 0 ? (
            <div className="p-12 text-center bg-zinc-50 dark:bg-zinc-950/40 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 space-y-2">
              <FileDiff className="w-8 h-8 text-zinc-400 mx-auto opacity-50" />
              <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
                Nenhuma peça encontrada para os filtros selecionados.
              </p>
            </div>
          ) : viewMode === 'unified' ? (
            /* ===================================================================== */
            /* MODO UNIFICADO: Lista detalhada linha a linha                          */
            /* ===================================================================== */
            <div className="space-y-2.5">
              {itensFiltrados.map((item, idx) => {
                const isAdd = item.tipo === 'adicionado';
                const isRem = item.tipo === 'removido';
                const isMod = item.tipo === 'modificado';
                const isInalt = item.tipo === 'inalterado';

                return (
                  <div
                    key={`${item.codigo}_${idx}`}
                    className={`p-3.5 rounded-2xl border transition-all text-xs ${
                      isAdd
                        ? 'bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-500/40 hover:border-emerald-500'
                        : isRem
                          ? 'bg-rose-500/5 dark:bg-rose-950/20 border-rose-500/40 hover:border-rose-500 opacity-80'
                          : isMod
                            ? 'bg-amber-500/5 dark:bg-amber-950/20 border-amber-500/40 hover:border-amber-500'
                            : 'bg-zinc-50/70 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      
                      {/* Identificação da Peça e Badge */}
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Badge de Status da Alteração */}
                          {isAdd && (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-white font-bold text-[10px] tracking-wider uppercase inline-flex items-center gap-1 shadow-2xs">
                              <PlusCircle className="w-3 h-3" />
                              Adicionada
                            </span>
                          )}
                          {isRem && (
                            <span className="px-2 py-0.5 rounded-md bg-rose-500 text-white font-bold text-[10px] tracking-wider uppercase inline-flex items-center gap-1 shadow-2xs">
                              <MinusCircle className="w-3 h-3" />
                              Removida
                            </span>
                          )}
                          {isMod && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white font-bold text-[10px] tracking-wider uppercase inline-flex items-center gap-1 shadow-2xs">
                              <AlertTriangle className="w-3 h-3" />
                              Alterada
                            </span>
                          )}
                          {isInalt && (
                            <span className="px-2 py-0.5 rounded-md bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold text-[10px] uppercase inline-flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              Inalterada
                            </span>
                          )}

                          <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100 text-xs">
                            {item.codigo}
                          </span>

                          <span className="text-[10px] font-semibold px-2 py-0.2 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                            {item.ambiente}
                          </span>
                        </div>

                        <h4 className={`font-bold text-sm ${isRem ? 'line-through text-zinc-400 dark:text-zinc-500' : 'text-zinc-900 dark:text-zinc-100'}`}>
                          {item.descricao}
                        </h4>

                        {/* Detalhamento das Diferenças (Amarelo) */}
                        {isMod && item.diferencasDetalhadas.descricaoAlteracoes.length > 0 && (
                          <div className="mt-1.5 p-2 bg-amber-500/10 rounded-xl border border-amber-500/20 space-y-1">
                            {item.diferencasDetalhadas.descricaoAlteracoes.map((alt, aIdx) => (
                              <div key={aIdx} className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                                <span>{alt}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Tabela Comparativa de Medidas, Quantidade e Custo */}
                      <div className="sm:text-right shrink-0 font-mono text-xs space-y-1 bg-white/60 dark:bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60">
                        {isMod ? (
                          <>
                            <div className="flex items-center justify-between sm:justify-end gap-3">
                              <span className="text-zinc-400 text-[10px]">Dimensões (L×A×P):</span>
                              <span className="text-zinc-500 line-through text-[11px]">
                                {item.itemOriginal?.larguraMm}×{item.itemOriginal?.alturaMm}×{item.itemOriginal?.profundidadeMm}
                              </span>
                              <ArrowRight className="w-3 h-3 text-amber-500" />
                              <span className="font-bold text-zinc-900 dark:text-zinc-100">
                                {item.itemRevisado?.larguraMm}×{item.itemRevisado?.alturaMm}×{item.itemRevisado?.profundidadeMm} mm
                              </span>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-3">
                              <span className="text-zinc-400 text-[10px]">Qtd & Custo Total:</span>
                              <span className="text-zinc-500 line-through text-[11px]">
                                {item.itemOriginal?.quantidade} un ({item.itemOriginal?.custoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})
                              </span>
                              <ArrowRight className="w-3 h-3 text-amber-500" />
                              <span className="font-bold text-amber-600 dark:text-amber-400">
                                {item.itemRevisado?.quantidade} un ({item.itemRevisado?.custoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})
                              </span>
                            </div>
                          </>
                        ) : isAdd ? (
                          <>
                            <div className="text-emerald-600 dark:text-emerald-400 font-bold">
                              {item.itemRevisado?.larguraMm}×{item.itemRevisado?.alturaMm}×{item.itemRevisado?.profundidadeMm} mm
                            </div>
                            <div className="text-zinc-700 dark:text-zinc-300 font-bold">
                              +{item.itemRevisado?.quantidade} un • {item.itemRevisado?.custoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </div>
                          </>
                        ) : isRem ? (
                          <>
                            <div className="text-rose-600 dark:text-rose-400 font-semibold line-through">
                              {item.itemOriginal?.larguraMm}×{item.itemOriginal?.alturaMm}×{item.itemOriginal?.profundidadeMm} mm
                            </div>
                            <div className="text-rose-600 dark:text-rose-400 font-bold">
                              -{item.itemOriginal?.quantidade} un • -{item.itemOriginal?.custoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="text-zinc-600 dark:text-zinc-400">
                              {item.itemRevisado?.larguraMm}×{item.itemRevisado?.alturaMm}×{item.itemRevisado?.profundidadeMm} mm
                            </div>
                            <div className="text-zinc-600 dark:text-zinc-400">
                              {item.itemRevisado?.quantidade} un • {item.itemRevisado?.custoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </div>
                          </>
                        )}
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ===================================================================== */
            /* MODO SPLIT: Lado a Lado (Original vs Revisado)                         */
            /* ===================================================================== */
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs font-bold text-zinc-500 uppercase tracking-wider px-2">
                <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-400" />
                  <span>Versão Anterior ({nomeVersaoBase})</span>
                </div>
                <div className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                  <span>Versão Revisada ({nomeVersaoNova})</span>
                </div>
              </div>

              {itensFiltrados.map((item, idx) => {
                const isAdd = item.tipo === 'adicionado';
                const isRem = item.tipo === 'removido';
                const isMod = item.tipo === 'modificado';

                return (
                  <div 
                    key={`split_${item.codigo}_${idx}`}
                    className={`grid grid-cols-2 gap-3 p-3 rounded-2xl border text-xs ${
                      isAdd
                        ? 'border-emerald-500/40 bg-emerald-500/5'
                        : isRem
                          ? 'border-rose-500/40 bg-rose-500/5'
                          : isMod
                            ? 'border-amber-500/40 bg-amber-500/5'
                            : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50'
                    }`}
                  >
                    {/* Coluna Esquerda: Versão Original */}
                    <div className="p-2.5 rounded-xl bg-white/70 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 space-y-1">
                      {item.itemOriginal ? (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-zinc-700 dark:text-zinc-300">{item.itemOriginal.codigo}</span>
                            <span className="text-[10px] text-zinc-400">{item.itemOriginal.ambiente}</span>
                          </div>
                          <p className={`font-semibold ${isRem ? 'line-through text-rose-500' : 'text-zinc-800 dark:text-zinc-200'}`}>
                            {item.itemOriginal.descricao}
                          </p>
                          <div className="font-mono text-[11px] text-zinc-500 pt-1 border-t border-zinc-100 dark:border-zinc-800 flex justify-between">
                            <span>{item.itemOriginal.larguraMm}×{item.itemOriginal.alturaMm}×{item.itemOriginal.profundidadeMm} mm</span>
                            <span className="font-bold">{item.itemOriginal.quantidade} un • {item.itemOriginal.custoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                          </div>
                        </>
                      ) : (
                        <div className="h-full flex items-center justify-center text-zinc-400 italic text-[11px]">
                          (Não existia na versão anterior)
                        </div>
                      )}
                    </div>

                    {/* Coluna Direita: Versão Revisada */}
                    <div className="p-2.5 rounded-xl bg-white/70 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 space-y-1">
                      {item.itemRevisado ? (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">{item.itemRevisado.codigo}</span>
                            <span className="text-[10px] text-zinc-400">{item.itemRevisado.ambiente}</span>
                          </div>
                          <p className="font-bold text-zinc-900 dark:text-zinc-100">
                            {item.itemRevisado.descricao}
                          </p>
                          <div className="font-mono text-[11px] pt-1 border-t border-zinc-100 dark:border-zinc-800 flex justify-between">
                            <span className={item.diferencasDetalhadas.dimensaoAlterada ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-zinc-500'}>
                              {item.itemRevisado.larguraMm}×{item.itemRevisado.alturaMm}×{item.itemRevisado.profundidadeMm} mm
                            </span>
                            <span className="font-bold text-zinc-900 dark:text-zinc-100">
                              {item.itemRevisado.quantidade} un • {item.itemRevisado.custoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="h-full flex items-center justify-center text-rose-500 font-semibold italic text-[11px]">
                          (Removido nesta revisão)
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* ========================================================================= */}
        {/* 5. RODAPÉ DE AÇÃO: APROVAÇÃO DA REVISÃO OU DESCARTE                       */}
        {/* ========================================================================= */}
        <div className="p-4 sm:px-6 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          
          {!modoApenasVisualizacao ? (
            <>
              {/* Motivo da Revisão e Preço de Venda */}
              <div className="w-full sm:w-auto flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase text-zinc-500 block mb-1">
                    Motivo / Observação da Revisão:
                  </label>
                  <input
                    type="text"
                    value={motivoInput}
                    onChange={(e) => setMotivoInput(e.target.value)}
                    placeholder="Ex: Ajuste após medição técnica in-loco..."
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-zinc-500 block mb-1">
                    Valor de Venda do Negócio (CRM):
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={novoValorVendaInput}
                      onChange={(e) => setNovoValorVendaInput(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs font-bold bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                {onDescartarRevisao && (
                  <button
                    type="button"
                    onClick={() => {
                      onDescartarRevisao();
                      onClose();
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    Descartar Revisão
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleAprovar}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Aprovar Revisão como Versão Oficial</span>
                </button>
              </div>
            </>
          ) : (
            <div className="w-full flex items-center justify-between">
              <span className="text-xs text-zinc-500 font-semibold flex items-center gap-1.5">
                <History className="w-4 h-4 text-cyan-500" />
                Modo de auditoria e inspeção histórica de versões.
              </span>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
