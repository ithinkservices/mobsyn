'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { EtapaWorkflowProducao, OrdemProducao } from '@/types/database';
import { ESTAGIOS_WORKFLOW_PRODUCAO } from '@/lib/productionEngine';
import { RadarPrazosView } from './RadarPrazosView';
import { 
  Factory, 
  CheckCircle2, 
  Clock, 
  Layers, 
  ChevronRight, 
  PackageCheck, 
  Cpu, 
  Disc3, 
  AlertCircle,
  Plus,
  Boxes,
  FileCheck2,
  Calendar,
  Search,
  UserCheck,
  ArrowRight,
  ShieldCheck,
  Check,
  FileText,
  Wrench,
  Scissors,
  Package,
  Truck
} from 'lucide-react';

export const ProducaoView: React.FC = () => {
  const { 
    ordensProducao, 
    contratos, 
    projetos, 
    negocios, 
    clientes, 
    avancarEtapaProducao, 
    currentUser 
  } = useApp();

  const [abaSubAtiva, setAbaSubAtiva] = useState<'workflow' | 'radar'>('workflow');
  const [busca, setBusca] = useState('');

  const producaoScrollRef = React.useRef<HTMLDivElement>(null);
  const [isProducaoDragging, setIsProducaoDragging] = useState(false);
  const [producaoStartX, setProducaoStartX] = useState(0);
  const [producaoScrollLeft, setProducaoScrollLeft] = useState(0);

  const handleProducaoMouseDown = (e: React.MouseEvent) => {
    setIsProducaoDragging(true);
    setProducaoStartX(e.pageX - (producaoScrollRef.current?.offsetLeft || 0));
    setProducaoScrollLeft(producaoScrollRef.current?.scrollLeft || 0);
  };

  const handleProducaoMouseLeave = () => {
    setIsProducaoDragging(false);
  };

  const handleProducaoMouseUp = () => {
    setIsProducaoDragging(false);
  };

  const handleProducaoMouseMove = (e: React.MouseEvent) => {
    if (!isProducaoDragging) return;
    e.preventDefault();
    const x = e.pageX - (producaoScrollRef.current?.offsetLeft || 0);
    const walk = (x - producaoStartX) * 1.5;
    if (producaoScrollRef.current) {
      producaoScrollRef.current.scrollLeft = producaoScrollLeft - walk;
    }
  };
  const [modalAvancar, setModalAvancar] = useState<{
    op: OrdemProducao;
    estagioAtualMeta: typeof ESTAGIOS_WORKFLOW_PRODUCAO[0];
    proximoEstagioMeta?: typeof ESTAGIOS_WORKFLOW_PRODUCAO[0];
  } | null>(null);

  const [responsavelConclusao, setResponsavelConclusao] = useState(currentUser?.nome || '');
  const [observacaoConclusao, setObservacaoConclusao] = useState('');
  const [proximoResponsavel, setProximoResponsavel] = useState('');

  // Mapeamento de ícones para os 7 estágios industriais
  const iconesEstagios: Record<EtapaWorkflowProducao, React.ComponentType<{ className?: string }>> = {
    fila_producao: Clock,
    corte: Scissors,
    usinagem: Cpu,
    acabamento: Wrench,
    montagem_componentes: Layers,
    embalagem: Package,
    pronto_expedicao: Truck,
  };

  const totalOPsAtivas = ordensProducao.filter(op => (op.etapaAtual || 'fila_producao') !== 'pronto_expedicao').length;
  const totalPecasProducao = ordensProducao.reduce((acc, op) => acc + (op.totalPecas || 0), 0);
  const totalChapasProducao = ordensProducao.reduce((acc, op) => acc + (op.totalChapasMdf || 0), 0);

  const handleAbrirModalAvancar = (op: OrdemProducao) => {
    const idx = ESTAGIOS_WORKFLOW_PRODUCAO.findIndex(e => e.id === (op.etapaAtual || 'fila_producao'));
    const estagioAtualMeta = ESTAGIOS_WORKFLOW_PRODUCAO[idx];
    const proximoEstagioMeta = idx >= 0 && idx < ESTAGIOS_WORKFLOW_PRODUCAO.length - 1 ? ESTAGIOS_WORKFLOW_PRODUCAO[idx + 1] : undefined;

    setModalAvancar({ op, estagioAtualMeta, proximoEstagioMeta });
    setResponsavelConclusao(currentUser?.nome || 'Operador da Linha');
    setObservacaoConclusao('');
    setProximoResponsavel('');
  };

  const handleConfirmarAvanco = () => {
    if (!modalAvancar) return;
    avancarEtapaProducao(
      modalAvancar.op.id,
      responsavelConclusao.trim() || undefined,
      observacaoConclusao.trim() || undefined,
      proximoResponsavel.trim() || undefined
    );
    setModalAvancar(null);
  };

  return (
    <div id="producao-module-view" className="space-y-6">
      
      {/* Header com Abas de Navegação */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-800/60 flex items-center gap-1.5">
              <Factory className="w-3.5 h-3.5" />
              <span>CHÃO DE FÁBRICA & ESTEIRA INDUSTRIAL</span>
            </span>
            <span className="text-xs text-zinc-400">•</span>
            <span className="text-xs font-semibold text-zinc-400">
              Ordens Ativas: <strong className="text-zinc-200">{totalOPsAtivas}</strong>
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white mt-1">
            Produção & Radar de Prazos
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Gerencie o workflow industrial em 7 estágios e o radar de prazos com semáforo de SLA.
          </p>
        </div>

        {/* Alternância de Abas Superiores */}
        <div className="flex items-center bg-zinc-900 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => setAbaSubAtiva('workflow')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              abaSubAtiva === 'workflow'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Factory className="w-4 h-4" />
            <span>Workflow 7 Estágios</span>
          </button>
          <button
            onClick={() => setAbaSubAtiva('radar')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              abaSubAtiva === 'radar'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Radar de Prazos (SLA)</span>
          </button>
        </div>
      </div>

      {/* Conteúdo da Aba: Workflow de 7 Estágios */}
      {abaSubAtiva === 'workflow' && (
        <div className="space-y-6">
          {/* Métricas e Busca */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/40 p-3 rounded-2xl border border-zinc-800/80">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Buscar OP, contrato ou cliente..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-zinc-900 border border-zinc-700/80 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5 bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-800">
                <span className="text-zinc-400">Total Peças:</span>
                <span className="font-bold text-cyan-400 font-mono">{totalPecasProducao} un</span>
              </div>
              <div className="flex items-center gap-1.5 bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-800">
                <span className="text-zinc-400">Chapas MDF:</span>
                <span className="font-bold text-amber-400 font-mono">{totalChapasProducao} chapas</span>
              </div>
            </div>
          </div>

          {/* Kanban Board de 7 Estágios (Horizontal Scrollável) */}
          <div 
            ref={producaoScrollRef}
            onMouseDown={handleProducaoMouseDown}
            onMouseLeave={handleProducaoMouseLeave}
            onMouseUp={handleProducaoMouseUp}
            onMouseMove={handleProducaoMouseMove}
            className="flex gap-4 overflow-x-auto pb-4 pt-1 w-full items-start scroll-smooth no-scrollbar cursor-grab active:cursor-grabbing select-none"
          >
            {ESTAGIOS_WORKFLOW_PRODUCAO.map((estagio, idx) => {
              const Icon = iconesEstagios[estagio.id] || Factory;
              const opsDaEtapa = ordensProducao.filter(op => {
                const etapaMatch = (op.etapaAtual || 'fila_producao') === estagio.id;
                if (!busca) return etapaMatch;
                const cli = clientes.find(c => c.id === op.clienteId);
                const ctr = contratos.find(c => c.id === op.contratoId);
                const query = busca.toLowerCase();
                return etapaMatch && (
                  op.numeroOP.toLowerCase().includes(query) ||
                  (ctr?.numeroContrato && ctr.numeroContrato.toLowerCase().includes(query)) ||
                  (cli?.nome && cli.nome.toLowerCase().includes(query))
                );
              });

              return (
                <div
                  key={estagio.id}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-3.5 space-y-3 shadow-xs flex flex-col justify-between min-h-[500px] w-72 shrink-0"
                >
                  <div className="space-y-3">
                    {/* Header da Coluna */}
                    <div className="flex items-center justify-between pb-2.5 border-b border-zinc-100 dark:border-zinc-800">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-zinc-800 text-cyan-400 border border-zinc-700/60">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-zinc-800 dark:text-zinc-100 block">
                            {idx + 1}. {estagio.label}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border bg-cyan-950/60 text-cyan-400 border-cyan-800/60">
                        {opsDaEtapa.length}
                      </span>
                    </div>

                    {/* Cards de OP na Coluna */}
                    <div className="space-y-2.5">
                      {opsDaEtapa.map((op) => {
                        const cli = clientes.find(c => c.id === op.clienteId);
                        const ctr = contratos.find(c => c.id === op.contratoId);

                        return (
                          <div
                            key={op.id}
                            className="p-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 rounded-xl space-y-2.5 text-xs hover:border-cyan-500/40 transition-all shadow-xs"
                          >
                            <div className="flex items-center justify-between font-mono">
                              <span className="font-bold text-cyan-400">{op.numeroOP}</span>
                              <span className="text-[10px] text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700">
                                {ctr?.numeroContrato || 'Contrato'}
                              </span>
                            </div>

                            <div>
                              <div className="font-semibold text-zinc-800 dark:text-zinc-100 truncate text-xs">
                                {cli?.nome || 'Cliente'}
                              </div>
                              <div className="text-[11px] text-zinc-400 truncate mt-0.5">
                                {op.titulo || 'Móveis Planejados'}
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-1.5 text-[10px] text-zinc-400 border-t border-zinc-200 dark:border-zinc-700/60 font-mono">
                              <span className="flex items-center gap-1">
                                <Boxes className="w-3 h-3 text-cyan-400" />
                                <strong>{op.totalPecas || 0}</strong> pçs
                              </span>
                              <span className="flex items-center gap-1 text-zinc-300">
                                <Clock className="w-3 h-3 text-amber-400" />
                                {op.prazoDias || 15}d
                              </span>
                            </div>

                            {/* Responsável Atual se houver */}
                            {op.responsavelAtualNome && (
                              <div className="text-[10px] text-zinc-400 bg-zinc-900/60 px-2 py-1 rounded border border-zinc-800 flex items-center gap-1">
                                <UserCheck className="w-3 h-3 text-emerald-400" />
                                <span className="truncate">{op.responsavelAtualNome}</span>
                              </div>
                            )}

                            {/* Botão Avançar Estágio com Passagem de Bastão */}
                            {estagio.id !== 'pronto_expedicao' && (
                              <button
                                onClick={() => handleAbrirModalAvancar(op)}
                                className="w-full mt-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/60 text-cyan-300 text-[11px] font-bold transition-colors cursor-pointer"
                              >
                                <span>Avançar Fase</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        );
                      })}

                      {opsDaEtapa.length === 0 && (
                        <div className="p-4 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl text-[11px] text-zinc-500">
                          Nenhum lote.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 text-[10px] text-zinc-400 text-center font-mono">
                    Fase {estagio.ordem} de 7
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Conteúdo da Aba: Radar de Prazos */}
      {abaSubAtiva === 'radar' && (
        <RadarPrazosView />
      )}

      {/* Modal de Avanço de Estágio & Passagem de Bastão */}
      {modalAvancar && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 max-w-md w-full space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800">
                  <ArrowRight className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Avançar no Workflow Industrial
                  </h3>
                  <p className="text-xs text-cyan-400 font-medium">
                    OP: {modalAvancar.op.numeroOP} • De: <strong>{modalAvancar.estagioAtualMeta.label}</strong>
                    {modalAvancar.proximoEstagioMeta && (
                      <> Para: <strong className="text-emerald-400">{modalAvancar.proximoEstagioMeta.label}</strong></>
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 font-semibold mb-1">
                  Responsável pela Conclusão (Quem está liberando):
                </label>
                <input
                  type="text"
                  value={responsavelConclusao}
                  onChange={(e) => setResponsavelConclusao(e.target.value)}
                  placeholder="Ex: Carlos Operador CNC"
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1">
                  Próximo Responsável / Setor (Passagem de Bastão):
                </label>
                <input
                  type="text"
                  value={proximoResponsavel}
                  onChange={(e) => setProximoResponsavel(e.target.value)}
                  placeholder="Ex: Equipe de Montagem / João Acabamento"
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1">
                  Observações de Qualidade (Opcional):
                </label>
                <textarea
                  value={observacaoConclusao}
                  onChange={(e) => setObservacaoConclusao(e.target.value)}
                  placeholder="Ex: Lote conferido sem avarias, chapas cortadas conforme projeto..."
                  rows={3}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setModalAvancar(null)}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmarAvanco}
                className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm shadow-cyan-900/50"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Avançar Estágio</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
