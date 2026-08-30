'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { TipoMarcoRadar, RadarPrazosContrato, MarcoRadarItem } from '@/types/database';
import { 
  MARCOS_RADAR_PADRAO, 
  gerarRadarPrazosInicial 
} from '@/lib/productionEngine';
import { 
  Ruler, 
  FileSearch, 
  DraftingCompass, 
  Factory, 
  Hammer, 
  CheckCircle2, 
  Clock, 
  Search, 
  ShieldAlert, 
  FileText, 
  Check, 
  CalendarCheck
} from 'lucide-react';

interface RadarPrazosViewProps {
  contratoIdFiltro?: string;
  somenteVisualizacao?: boolean;
}

export const RadarPrazosView: React.FC<RadarPrazosViewProps> = ({ 
  contratoIdFiltro,
  somenteVisualizacao = false 
}) => {
  const { 
    radaresPrazos, 
    contratos, 
    clientes, 
    projetos, 
    empresaAtiva, 
    concluirMarcoRadar, 
    currentUser 
  } = useApp();

  const [busca, setBusca] = useState('');
  const [filtroSemaforo, setFiltroSemaforo] = useState<'todos' | 'verde' | 'amarelo' | 'vermelho'>('todos');
  const [modalConcluirMarco, setModalConcluirMarco] = useState<{
    radarId: string;
    tipoMarco: TipoMarcoRadar;
    tituloMarco: string;
    responsavelSugestao: string;
  } | null>(null);

  const [responsavelInput, setResponsavelInput] = useState('');
  const [obsInput, setObsInput] = useState('');

  // Ícones dinâmicos dos 6 marcos
  const iconesMarcos: Record<TipoMarcoRadar, React.ComponentType<{ className?: string }>> = {
    medidas: Ruler,
    revisao: FileSearch,
    promob_projeto: DraftingCompass,
    producao: Factory,
    montagem: Hammer,
    concluido: CheckCircle2,
  };

  // Garante que todo contrato assinado tenha seu radar gerado na visualização
  const contratosComRadar: { radar: RadarPrazosContrato; contrato: any; cliente: any; projeto: any }[] = [];

  contratos.forEach(ctr => {
    if (contratoIdFiltro && ctr.id !== contratoIdFiltro) return;

    let rad = radaresPrazos.find(r => r.contratoId === ctr.id);
    const cli = clientes.find(c => c.id === ctr.clienteId);
    const proj = ctr.projetoId ? projetos.find(p => p.id === ctr.projetoId) : undefined;

    // Se o radar não existe na lista persistida, gera em tempo real para exibir
    if (!rad && empresaAtiva && cli) {
      rad = gerarRadarPrazosInicial({
        contrato: ctr,
        cliente: cli,
        empresa: empresaAtiva,
        projeto: proj,
      });
    }

    if (rad) {
      contratosComRadar.push({
        radar: rad,
        contrato: ctr,
        cliente: cli,
        projeto: proj,
      });
    }
  });

  // Filtros de busca e semáforo
  const radaresFiltrados = contratosComRadar.filter(item => {
    const { radar, contrato, cliente } = item;
    const matchBusca = 
      (contrato?.numeroContrato?.toLowerCase().includes(busca.toLowerCase())) ||
      (cliente?.nome?.toLowerCase().includes(busca.toLowerCase())) ||
      (contrato?.titulo?.toLowerCase().includes(busca.toLowerCase()));

    if (!matchBusca) return false;

    if (filtroSemaforo !== 'todos') {
      return radar.statusGeralAlerta === filtroSemaforo;
    }

    return true;
  });

  // Contadores estatísticos para o painel de semáforo executivo
  const totalVerdes = contratosComRadar.filter(c => c.radar.statusGeralAlerta === 'verde').length;
  const totalAmarelos = contratosComRadar.filter(c => c.radar.statusGeralAlerta === 'amarelo').length;
  const totalVermelhos = contratosComRadar.filter(c => c.radar.statusGeralAlerta === 'vermelho').length;

  const handleAbrirModalConcluir = (radarId: string, marco: MarcoRadarItem) => {
    setModalConcluirMarco({
      radarId,
      tipoMarco: marco.tipo,
      tituloMarco: marco.nome,
      responsavelSugestao: marco.responsavelNome || currentUser?.nome || '',
    });
    setResponsavelInput(marco.responsavelNome || currentUser?.nome || '');
    setObsInput('');
  };

  const handleSalvarConclusaoMarco = () => {
    if (!modalConcluirMarco) return;
    concluirMarcoRadar(
      modalConcluirMarco.radarId,
      modalConcluirMarco.tipoMarco,
      responsavelInput.trim() || 'Responsável Técnico',
      obsInput.trim() || undefined
    );
    setModalConcluirMarco(null);
  };

  return (
    <div className="space-y-6" id="radar-prazos-container">
      {/* Header do Radar de Prazos */}
      {!contratoIdFiltro && (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>RADAR DE PRAZOS & SLA DOS 6 MARCOS</span>
              </span>
              <span className="text-xs text-zinc-400">•</span>
              <span className="text-xs text-zinc-400">
                Monitoramento contínuo de ponta a ponta
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white mt-1">
              Radar de Entregas & Semáforo de Produção
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
              Acompanhe os 6 marcos de cada contrato (Medidas, Revisão, Promob, Produção, Montagem e Concluído) com alertas visuais por SLA.
            </p>
          </div>

          {/* Cards de Semáforo Executivo */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <button
              onClick={() => setFiltroSemaforo(filtroSemaforo === 'verde' ? 'todos' : 'verde')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                filtroSemaforo === 'verde'
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/20'
                  : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:border-emerald-800/60'
              }`}
            >
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
              <div>
                <span className="text-[10px] text-zinc-400 block leading-tight">No Prazo</span>
                <span className="font-bold text-emerald-400 font-mono text-xs sm:text-sm">{totalVerdes} contratos</span>
              </div>
            </button>

            <button
              onClick={() => setFiltroSemaforo(filtroSemaforo === 'amarelo' ? 'todos' : 'amarelo')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                filtroSemaforo === 'amarelo'
                  ? 'bg-amber-950/80 border-amber-500 text-amber-300 ring-2 ring-amber-500/20'
                  : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:border-amber-800/60'
              }`}
            >
              <div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
              <div>
                <span className="text-[10px] text-zinc-400 block leading-tight">Risco & Alerta</span>
                <span className="font-bold text-amber-400 font-mono text-xs sm:text-sm">{totalAmarelos} atenção</span>
              </div>
            </button>

            <button
              onClick={() => setFiltroSemaforo(filtroSemaforo === 'vermelho' ? 'todos' : 'vermelho')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                filtroSemaforo === 'vermelho'
                  ? 'bg-red-950/80 border-red-500 text-red-300 ring-2 ring-red-500/20'
                  : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:border-red-800/60'
              }`}
            >
              <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
              <div>
                <span className="text-[10px] text-zinc-400 block leading-tight">Atrasado</span>
                <span className="font-bold text-red-400 font-mono text-xs sm:text-sm">{totalVermelhos} gargalos</span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Barra de Filtros */}
      {!contratoIdFiltro && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/40 p-3 rounded-xl border border-zinc-800/80">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Buscar por contrato, cliente ou ambiente..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-zinc-900 border border-zinc-700/80 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span>Exibindo <strong>{radaresFiltrados.length}</strong> de {contratosComRadar.length} contratos</span>
            {filtroSemaforo !== 'todos' && (
              <button
                onClick={() => setFiltroSemaforo('todos')}
                className="text-[11px] text-cyan-400 hover:underline cursor-pointer"
              >
                Limpar filtro
              </button>
            )}
          </div>
        </div>
      )}

      {/* Lista de Cards de Radar dos Contratos */}
      <div className="space-y-4">
        {radaresFiltrados.map(({ radar, contrato, cliente, projeto }) => {
          const semaforoConfig = {
            verde: {
              badge: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60',
              label: 'Cronograma em Dia',
              border: 'border-emerald-500/30',
              bgLight: 'bg-emerald-500/5',
              dot: 'bg-emerald-500',
            },
            amarelo: {
              badge: 'bg-amber-950/60 text-amber-400 border-amber-800/60',
              label: 'Atenção aos Prazos',
              border: 'border-amber-500/40',
              bgLight: 'bg-amber-500/5',
              dot: 'bg-amber-500',
            },
            vermelho: {
              badge: 'bg-red-950/60 text-red-400 border-red-800/60',
              label: 'Gargalo Crítico / Atraso',
              border: 'border-red-500/50',
              bgLight: 'bg-red-500/5',
              dot: 'bg-red-500',
            },
          }[radar.statusGeralAlerta];

          const marcosConcluidosCount = radar.marcos.filter(m => m.statusMarco === 'concluido').length;
          const progressoPercent = Math.round((marcosConcluidosCount / radar.marcos.length) * 100);

          return (
            <div
              key={radar.id}
              className={`bg-zinc-900 border ${semaforoConfig.border} rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm transition-all hover:border-zinc-700`}
            >
              {/* Header do Contrato no Radar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-zinc-800">
                <div className="flex items-start sm:items-center gap-3">
                  <div className={`p-2.5 rounded-xl bg-zinc-800/80 border border-zinc-700/60`}>
                    <FileText className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-white font-mono">
                        {contrato.numeroContrato}
                      </span>
                      <span className="text-xs text-zinc-400">•</span>
                      <span className="text-xs font-semibold text-zinc-200">
                        {cliente?.nome || 'Cliente'}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${semaforoConfig.badge} flex items-center gap-1`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${semaforoConfig.dot}`} />
                        <span>{semaforoConfig.label}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1 flex-wrap">
                      <span>{contrato.titulo || 'Móveis Planejados Sob Medida'}</span>
                      <span>•</span>
                      <span>Assinado em: <strong>{new Date(contrato.createdAt).toLocaleDateString('pt-BR')}</strong></span>
                      <span>•</span>
                      <span>Entrega Prevista: <strong className="text-zinc-200">{contrato.dataPrevistaEntrega ? new Date(contrato.dataPrevistaEntrega).toLocaleDateString('pt-BR') : `${contrato.prazoEntregaDias || 35} dias`}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Progresso Geral */}
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-400 uppercase font-mono block">Progresso do Ciclo</span>
                    <span className="text-xs font-bold text-white font-mono">
                      {marcosConcluidosCount} de {radar.marcos.length} marcos ({progressoPercent}%)
                    </span>
                  </div>
                  <div className="w-20 bg-zinc-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        radar.statusGeralAlerta === 'vermelho' ? 'bg-red-500' : radar.statusGeralAlerta === 'amarelo' ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${progressoPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Linha dos 6 Marcos Industriais */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                {radar.marcos.map((marco, idx) => {
                  const Icon = iconesMarcos[marco.tipo] || CheckCircle2;
                  const isConcluido = marco.statusMarco === 'concluido';
                  const isAtrasado = marco.statusMarco === 'atrasado';

                  const statusStyles = {
                    concluido: {
                      border: 'border-emerald-700/50 bg-emerald-950/20',
                      iconBg: 'bg-emerald-950/80 text-emerald-400 border-emerald-800',
                      badge: 'bg-emerald-950 text-emerald-300 border-emerald-800',
                      badgeLabel: 'Concluído',
                    },
                    em_andamento: {
                      border: 'border-cyan-700/50 bg-cyan-950/20',
                      iconBg: 'bg-cyan-950/80 text-cyan-400 border-cyan-800',
                      badge: 'bg-cyan-950 text-cyan-300 border-cyan-800',
                      badgeLabel: 'Em Execução',
                    },
                    atrasado: {
                      border: 'border-red-700/60 bg-red-950/30',
                      iconBg: 'bg-red-950/80 text-red-400 border-red-800',
                      badge: 'bg-red-950 text-red-300 border-red-800',
                      badgeLabel: 'SLA Estourado',
                    },
                    pendente: {
                      border: 'border-zinc-800 bg-zinc-900/60 opacity-60',
                      iconBg: 'bg-zinc-800 text-zinc-500 border-zinc-700',
                      badge: 'bg-zinc-800 text-zinc-400 border-zinc-700',
                      badgeLabel: 'Aguardando',
                    },
                  }[marco.statusMarco] || {
                    border: 'border-zinc-800 bg-zinc-900/60',
                    iconBg: 'bg-zinc-800 text-zinc-400 border-zinc-700',
                    badge: 'bg-zinc-800 text-zinc-400 border-zinc-700',
                    badgeLabel: 'Pendente',
                  };

                  return (
                    <div
                      key={marco.tipo}
                      className={`relative p-3 rounded-xl border ${statusStyles.border} flex flex-col justify-between space-y-2.5 transition-all`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono font-bold text-zinc-400">
                            #{idx + 1}
                          </span>
                          <div className={`p-1.5 rounded-lg border ${statusStyles.iconBg}`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                        </div>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${statusStyles.badge}`}>
                          {statusStyles.badgeLabel}
                        </span>
                      </div>

                      <div>
                        <span className="text-xs font-bold text-zinc-100 block leading-tight">
                          {marco.nome}
                        </span>
                        <span className="text-[10px] text-zinc-400 mt-0.5 block">
                          SLA Padrão: <strong>{marco.slaDias} dias</strong>
                        </span>
                      </div>

                      <div className="text-[10px] space-y-0.5 border-t border-zinc-800/80 pt-1.5">
                        <div className="flex items-center justify-between text-zinc-400">
                          <span>Limite:</span>
                          <span className="font-mono text-zinc-300">
                            {new Date(marco.dataLimitePrevista).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                          </span>
                        </div>

                        {marco.dataConclusaoReal ? (
                          <div className="flex items-center justify-between text-emerald-400 font-medium">
                            <span>Concluído:</span>
                            <span className="font-mono">
                              {new Date(marco.dataConclusaoReal).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between text-zinc-400">
                            <span>Restantes:</span>
                            <span className={`font-mono font-bold ${isAtrasado ? 'text-red-400' : 'text-zinc-300'}`}>
                              {marco.diasRestantes ?? marco.slaDias}d
                            </span>
                          </div>
                        )}

                        {marco.responsavelNome && (
                          <div className="text-[9px] text-zinc-400 truncate pt-0.5">
                            Resp: <span className="text-zinc-300 font-medium">{marco.responsavelNome}</span>
                          </div>
                        )}
                      </div>

                      {!somenteVisualizacao && (
                        <div>
                          {isConcluido ? (
                            <div className="w-full py-1 text-center text-[10px] font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 rounded-lg flex items-center justify-center gap-1">
                              <Check className="w-3 h-3" />
                              <span>Finalizado</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleAbrirModalConcluir(radar.id, marco)}
                              className="w-full py-1 text-center text-[10px] font-bold text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/60 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1"
                            >
                              <CalendarCheck className="w-3 h-3" />
                              <span>Concluir Marco</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {radar.statusGeralAlerta === 'vermelho' && (
                <div className="flex items-center gap-2 p-2.5 bg-red-950/30 border border-red-800/50 rounded-xl text-xs text-red-300">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
                  <span>
                    <strong>Atenção Industrial:</strong> Este contrato possui marcos com tempo superior ao SLA estipulado. Verifique a fila do chão de fábrica ou liberação técnica do projeto.
                  </span>
                </div>
              )}
            </div>
          );
        })}

        {radaresFiltrados.length === 0 && (
          <div className="p-12 text-center bg-zinc-900/40 border border-dashed border-zinc-800 rounded-2xl space-y-3">
            <Clock className="w-10 h-10 text-zinc-600 mx-auto" />
            <div className="text-sm font-semibold text-zinc-300">
              Nenhum radar de prazo encontrado
            </div>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Quando um negócio é fechado e o contrato é gerado, o radar com os 6 marcos é criado automaticamente.
            </p>
          </div>
        )}
      </div>

      {modalConcluirMarco && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 max-w-md w-full space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Concluir Marco de Produção
                  </h3>
                  <p className="text-xs text-cyan-400 font-medium">
                    {modalConcluirMarco.tituloMarco}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 font-semibold mb-1">
                  Nome do Responsável Técnico:
                </label>
                <input
                  type="text"
                  value={responsavelInput}
                  onChange={(e) => setResponsavelInput(e.target.value)}
                  placeholder="Ex: Carlos Medidor / Marcelo Marceneiro"
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1">
                  Observações / Laudo de Conclusão (Opcional):
                </label>
                <textarea
                  value={obsInput}
                  onChange={(e) => setObsInput(e.target.value)}
                  placeholder="Ex: Medidas confirmadas no local com folga de 20mm para fechamento..."
                  rows={3}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setModalConcluirMarco(null)}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSalvarConclusaoMarco}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm shadow-emerald-900/50"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Confirmar Conclusão</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
