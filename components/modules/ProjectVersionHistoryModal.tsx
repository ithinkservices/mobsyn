'use client';

import React, { useState } from 'react';
import { 
  X, 
  History, 
  FileDiff, 
  RotateCcw, 
  Check, 
  Calendar, 
  User, 
  Building2, 
  FileText, 
  Layers, 
  ArrowRight,
  ShieldCheck,
  Eye,
  Sparkles,
  Tag
} from 'lucide-react';
import { Projeto, VersaoHistoricoProjeto, ItemOrcamentoOriginal, SoftwareOrigem } from '@/types/database';

interface ProjectVersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  projeto: Projeto;
  onCompararVersoes?: (versaoA: VersaoHistoricoProjeto | { tagVersao: string; itensSnapshot: ItemOrcamentoOriginal[] }, versaoB: VersaoHistoricoProjeto | { tagVersao: string; itensSnapshot: ItemOrcamentoOriginal[] }) => void;
  onCompararVersaoComAtual?: (versaoHistorica: { versao: string; itens: ItemOrcamentoOriginal[]; softwareOrigem?: SoftwareOrigem }) => void;
  onRestaurarVersao: (versaoId: string) => void;
}

export const ProjectVersionHistoryModal: React.FC<ProjectVersionHistoryModalProps> = ({
  isOpen,
  onClose,
  projeto,
  onCompararVersoes,
  onCompararVersaoComAtual,
  onRestaurarVersao,
}) => {
  const [versaoSelecionadaId, setVersaoSelecionadaId] = useState<string | null>(null);

  if (!isOpen) return null;

  const historico = projeto.historicoVersoes || [];
  const versaoSelecionada = historico.find(v => v.id === versaoSelecionadaId) || historico[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Cabeçalho */}
        <div className="p-4 sm:px-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/80 dark:bg-zinc-950/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shadow-xs">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>Histórico de Revisões do Projeto</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                  {historico.length + 1} Versões Registradas
                </span>
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                {projeto.nomeAmbiente} • Versão Atual Oficial: <span className="font-bold text-cyan-600 dark:text-cyan-400">{projeto.versao}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo: Lista de Versões à Esquerda + Detalhes da Versão à Direita */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-zinc-200 dark:divide-zinc-800">
          
          {/* Coluna 1: Timeline de Versões */}
          <div className="p-4 space-y-3 bg-zinc-50/50 dark:bg-zinc-950/30 overflow-y-auto">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
              Timeline de Engenharia
            </span>

            {/* Versão Atual Oficial */}
            <div className="p-3.5 rounded-xl border border-cyan-500/40 bg-cyan-500/5 dark:bg-cyan-950/20 space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-black text-cyan-600 dark:text-cyan-400">
                  {projeto.versao}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-cyan-500 text-white font-bold text-[9px] uppercase tracking-wider">
                  OFICIAL ATUAL
                </span>
              </div>
              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                {projeto.nomeAmbiente}
              </p>
              <div className="text-[11px] text-zinc-500 font-mono flex items-center justify-between pt-1">
                <span>Custo: {projeto.custoTotalPromob?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                <span className="text-[10px] text-zinc-400">Última alteração</span>
              </div>
            </div>

            {/* Versões Anteriores do Histórico */}
            {historico.length === 0 ? (
              <div className="p-4 text-center text-xs text-zinc-400 bg-white dark:bg-zinc-900 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
                Nenhuma revisão anterior registrada para este projeto ainda.
              </div>
            ) : (
              historico.map((versao) => {
                const isSelected = versaoSelecionada?.id === versao.id;
                return (
                  <div
                    key={versao.id}
                    onClick={() => setVersaoSelecionadaId(versao.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                      isSelected
                        ? 'border-zinc-400 dark:border-zinc-500 bg-white dark:bg-zinc-900 shadow-xs'
                        : 'border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 hover:bg-white dark:hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200">
                        {versao.tagVersao}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        {new Date(versao.dataCriacao).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    
                    <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 truncate">
                      {versao.nomeVersao}
                    </p>

                    {versao.motivoRevisao && (
                      <p className="text-[10px] text-zinc-400 italic truncate">
                        &quot;{versao.motivoRevisao}&quot;
                      </p>
                    )}

                    <div className="text-[11px] font-mono text-zinc-500 flex justify-between pt-1 border-t border-zinc-100 dark:border-zinc-800">
                      <span>Custo: {versao.custoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                      <span>{versao.totalPecas} peças</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Coluna 2 e 3: Detalhamento da Versão Selecionada */}
          <div className="md:col-span-2 p-4 sm:p-6 space-y-4 overflow-y-auto bg-white dark:bg-zinc-900">
            {versaoSelecionada ? (
              <div className="space-y-4">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-mono font-bold text-xs">
                        {versaoSelecionada.tagVersao}
                      </span>
                      <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                        {versaoSelecionada.nomeVersao}
                      </h4>
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(versaoSelecionada.dataCriacao).toLocaleString('pt-BR')}</span>
                      <span>•</span>
                      <span>Arquivo: {versaoSelecionada.arquivoNome}</span>
                    </p>
                  </div>

                  {/* Botões de Ação na Versão */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (onCompararVersaoComAtual) {
                          onCompararVersaoComAtual({
                            versao: versaoSelecionada.tagVersao,
                            itens: versaoSelecionada.itensSnapshot,
                            softwareOrigem: versaoSelecionada.softwareOrigem
                          });
                          onClose();
                        } else if (onCompararVersoes) {
                          onCompararVersoes(
                            versaoSelecionada,
                            {
                              tagVersao: projeto.versao,
                              itensSnapshot: (projeto.snapshotOriginalSketchUp?.itensOriginais || projeto.snapshotOriginal?.itensOriginais || [])
                            }
                          );
                          onClose();
                        }
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <FileDiff className="w-4 h-4" />
                      <span>Comparar com Versão Oficial</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Deseja restaurar a versão ${versaoSelecionada.tagVersao} como a versão oficial do projeto?`)) {
                          onRestaurarVersao(versaoSelecionada.id);
                          onClose();
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restaurar Esta Versão</span>
                    </button>
                  </div>
                </div>

                {/* Motivo Registrado */}
                {versaoSelecionada.motivoRevisao && (
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-0.5">
                      Motivo / Justificativa da Revisão:
                    </span>
                    <p className="text-zinc-800 dark:text-zinc-200 font-medium">
                      {versaoSelecionada.motivoRevisao}
                    </p>
                  </div>
                )}

                {/* Métricas Rápidas */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase block mb-0.5">Custo Fabril</span>
                    <span className="text-sm font-bold font-mono text-zinc-900 dark:text-zinc-100">
                      {versaoSelecionada.custoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase block mb-0.5">Total de Peças</span>
                    <span className="text-sm font-bold font-mono text-zinc-900 dark:text-zinc-100">
                      {versaoSelecionada.totalPecas} peças
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase block mb-0.5">Ambientes</span>
                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate block">
                      {versaoSelecionada.ambientes.join(', ')}
                    </span>
                  </div>
                </div>

                {/* Amostra de Peças Registradas no Snapshot */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
                    Peças Arquivadas nesta Versão ({versaoSelecionada.itensSnapshot.length} itens):
                  </span>
                  
                  <div className="max-h-56 overflow-y-auto space-y-1.5 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2 bg-zinc-50/50 dark:bg-zinc-950/50 text-xs font-mono">
                    {versaoSelecionada.itensSnapshot.map((it, idx) => (
                      <div key={idx} className="p-2 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between gap-2">
                        <div className="truncate">
                          <span className="font-bold text-cyan-600 dark:text-cyan-400 mr-2">{it.codigo}</span>
                          <span className="text-zinc-800 dark:text-zinc-200">{it.descricao}</span>
                        </div>
                        <div className="text-zinc-500 shrink-0">
                          {it.larguraMm}×{it.alturaMm}×{it.profundidadeMm} mm • {it.quantidade} un
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <div className="p-8 text-center text-zinc-400 text-xs">
                Selecione uma versão ao lado para inspecionar os detalhes.
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
