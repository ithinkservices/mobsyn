'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  ShieldAlert, Plus, CheckCircle2, Clock, Wrench, User, Calendar, X, 
  AlertCircle, Image as ImageIcon, ArrowRight, ArrowLeft, Trash2, Check,
  FileText, Sparkles, Filter, Phone, MapPin
} from 'lucide-react';
import { TicketAssistencia, StatusChamadoAssistente, PrioridadeChamado } from '@/types/database';

const KANBAN_COLUMNS: { id: StatusChamadoAssistente; label: string; color: string; bg: string; border: string }[] = [
  { id: 'aberto', label: 'Aberto', color: 'text-amber-400', bg: 'bg-amber-950/30', border: 'border-amber-800/50' },
  { id: 'triagem', label: 'Triagem', color: 'text-blue-400', bg: 'bg-blue-950/30', border: 'border-blue-800/50' },
  { id: 'agendado', label: 'Agendado', color: 'text-purple-400', bg: 'bg-purple-950/30', border: 'border-purple-800/50' },
  { id: 'em_execucao', label: 'Em Execução', color: 'text-cyan-400', bg: 'bg-cyan-950/30', border: 'border-cyan-800/50' },
  { id: 'resolvido', label: 'Resolvido', color: 'text-emerald-400', bg: 'bg-emerald-950/30', border: 'border-emerald-800/50' },
];

export const PosVendaView: React.FC = () => {
  const { 
    ticketsAssistenca, 
    criarChamadoAssistencia, 
    editarChamadoAssistencia, 
    excluirChamadoAssistencia,
    contratos, 
    clientes, 
    usuarios 
  } = useApp();

  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [selectedTicketForDetail, setSelectedTicketForDetail] = useState<TicketAssistencia | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [filtroBusca, setFiltroBusca] = useState<string>('');

  const assistenciaScrollRef = React.useRef<HTMLDivElement>(null);
  const [isAssistenciaDragging, setIsAssistenciaDragging] = useState(false);
  const [assistenciaStartX, setAssistenciaStartX] = useState(0);
  const [assistenciaScrollLeft, setAssistenciaScrollLeft] = useState(0);

  const handleAssistenciaMouseDown = (e: React.MouseEvent) => {
    setIsAssistenciaDragging(true);
    setAssistenciaStartX(e.pageX - (assistenciaScrollRef.current?.offsetLeft || 0));
    setAssistenciaScrollLeft(assistenciaScrollRef.current?.scrollLeft || 0);
  };

  const handleAssistenciaMouseLeave = () => {
    setIsAssistenciaDragging(false);
  };

  const handleAssistenciaMouseUp = () => {
    setIsAssistenciaDragging(false);
  };

  const handleAssistenciaMouseMove = (e: React.MouseEvent) => {
    if (!isAssistenciaDragging) return;
    e.preventDefault();
    const x = e.pageX - (assistenciaScrollRef.current?.offsetLeft || 0);
    const walk = (x - assistenciaStartX) * 1.5;
    if (assistenciaScrollRef.current) {
      assistenciaScrollRef.current.scrollLeft = assistenciaScrollLeft - walk;
    }
  };

  // Form states for new ticket
  const [contratoIdForm, setContratoIdForm] = useState(contratos[0]?.id || '');
  const [descricaoForm, setDescricaoForm] = useState('');
  const [prioridadeForm, setPrioridadeForm] = useState<PrioridadeChamado>('normal');
  const [fotoUrlForm, setFotoUrlForm] = useState('');
  const [tecnicoForm, setTecnicoForm] = useState('Rodrigo Barbosa');
  const [dataAgendadaForm, setDataAgendadaForm] = useState('');

  // Calculate Average Resolution Time (Tempo Médio de Resolução - TMR) in days
  const resolvidos = ticketsAssistenca.filter(t => t.status === 'resolvido' && t.dataResolucao && t.dataAbertura);
  let somaDias = 0;
  resolvidos.forEach(t => {
    const abertura = new Date(t.dataAbertura).getTime();
    const resolucao = new Date(t.dataResolucao!).getTime();
    const diffDias = (resolucao - abertura) / (1000 * 60 * 60 * 24);
    if (diffDias >= 0) somaDias += diffDias;
  });
  const tempoMedioResolucao = resolvidos.length > 0 ? (somaDias / resolvidos.length).toFixed(1) : '3.2';

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!descricaoForm || !contratoIdForm) return;

    const contratoTarget = contratos.find(c => c.id === contratoIdForm);
    const clienteTarget = clientes.find(c => c.id === contratoTarget?.clienteId);

    const novo = criarChamadoAssistencia({
      contratoId: contratoIdForm,
      contratoNumero: contratoTarget?.numeroContrato || '#0042/2026',
      clienteId: clienteTarget?.id || contratoTarget?.clienteId || 'cli_01',
      clienteNome: clienteTarget?.nome || 'Cliente Consumidor',
      descricao: descricaoForm,
      fotos: fotoUrlForm ? [fotoUrlForm] : ['https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80'],
      prioridade: prioridadeForm,
      status: 'aberto',
      tecnicoResponsavel: tecnicoForm || undefined,
      dataAgendada: dataAgendadaForm || undefined,
      dataAbertura: new Date().toISOString().split('T')[0],
      dataResolucao: null,
      historico: [
        {
          id: `h_${Date.now()}`,
          timestamp: new Date().toISOString(),
          ator: 'Equipe Interna / Portal',
          acao: 'Chamado de assistência técnica aberto.'
        }
      ]
    });

    setIsNewTicketOpen(false);
    setDescricaoForm('');
    setFotoUrlForm('');
    setDataAgendadaForm('');
  };

  const mudarStatusKanban = (ticketId: string, novoStatus: StatusChamadoAssistente) => {
    const ticketTarget = ticketsAssistenca.find(t => t.id === ticketId);
    if (!ticketTarget) return;

    const histAtual = ticketTarget.historico || [];
    const novoHistorico = [
      ...histAtual,
      {
        id: `h_${new Date().getTime()}`,
        timestamp: new Date().toISOString(),
        ator: 'Gestor / Operador',
        acao: `Status alterado de [${ticketTarget.status.toUpperCase()}] para [${novoStatus.toUpperCase()}]`
      }
    ];

    editarChamadoAssistencia(ticketId, {
      status: novoStatus,
      historico: novoHistorico
    });
  };

  const ticketsFiltrados = ticketsAssistenca.filter(t => {
    const matchStatus = filtroStatus === 'todos' || t.status === filtroStatus;
    const matchBusca = t.clienteNome.toLowerCase().includes(filtroBusca.toLowerCase()) ||
                       t.contratoNumero.toLowerCase().includes(filtroBusca.toLowerCase()) ||
                       t.descricao.toLowerCase().includes(filtroBusca.toLowerCase());
    return matchStatus && matchBusca;
  });

  return (
    <div id="pos-venda-view" className="space-y-6">
      
      {/* Header & KPIs */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-800/60 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>PÓS-VENDA & GARANTIAS</span>
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
              SLA Ativo
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white mt-1">
            Assistência Técnica & Kanban de Chamados
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Gestão de chamados em garantia, agendamentos de montadores e histórico unificado por contrato.
          </p>
        </div>

        <button
          onClick={() => setIsNewTicketOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-sm cursor-pointer self-start lg:self-auto transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Abrir Novo Chamado</span>
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Chamados Abertos</p>
            <h4 className="text-xl font-bold text-amber-500 mt-1">
              {ticketsAssistenca.filter(t => t.status === 'aberto' || t.status === 'triagem').length}
            </h4>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Em Execução / Agendados</p>
            <h4 className="text-xl font-bold text-cyan-400 mt-1">
              {ticketsAssistenca.filter(t => t.status === 'agendado' || t.status === 'em_execucao').length}
            </h4>
          </div>
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400">
            <Wrench className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Tempo Médio de Resolução</p>
            <h4 className="text-xl font-bold text-emerald-400 mt-1">
              {tempoMedioResolucao} <span className="text-xs font-normal text-zinc-400">dias úteis</span>
            </h4>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Resolvidos (Este Mês)</p>
            <h4 className="text-xl font-bold text-zinc-900 dark:text-white mt-1">
              {ticketsAssistenca.filter(t => t.status === 'resolvido').length}
            </h4>
          </div>
          <div className="p-3 rounded-xl bg-zinc-500/10 text-zinc-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Filter className="w-4 h-4 text-zinc-400 ml-2" />
          <input
            type="text"
            placeholder="Buscar por cliente, contrato ou problema..."
            value={filtroBusca}
            onChange={(e) => setFiltroBusca(e.target.value)}
            className="w-full bg-transparent border-none text-xs text-zinc-900 dark:text-white focus:outline-none placeholder:text-zinc-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['todos', 'aberto', 'triagem', 'agendado', 'em_execucao', 'resolvido'].map(st => (
            <button
              key={st}
              onClick={() => setFiltroStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-colors cursor-pointer whitespace-nowrap ${
                filtroStatus === st 
                  ? 'bg-cyan-600 text-white shadow-xs' 
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              {st === 'todos' ? 'Todos' : st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Kanban Pipeline Board */}
      <div 
        ref={assistenciaScrollRef}
        onMouseDown={handleAssistenciaMouseDown}
        onMouseLeave={handleAssistenciaMouseLeave}
        onMouseUp={handleAssistenciaMouseUp}
        onMouseMove={handleAssistenciaMouseMove}
        className="flex gap-4 overflow-x-auto pb-4 pt-1 w-full items-start scroll-smooth no-scrollbar cursor-grab active:cursor-grabbing select-none"
      >
        {KANBAN_COLUMNS.map(col => {
          const colTickets = ticketsFiltrados.filter(t => t.status === col.id);

          return (
            <div 
              key={col.id}
              className={`rounded-2xl p-3.5 bg-zinc-50 dark:bg-zinc-900/60 border ${col.border} space-y-3 min-h-[500px] flex flex-col w-72 shrink-0`}
            >
              <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${col.color.replace('text-', 'bg-')}`} />
                  <h3 className={`text-xs font-bold uppercase tracking-wider ${col.color}`}>
                    {col.label}
                  </h3>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  {colTickets.length}
                </span>
              </div>

              <div className="space-y-3 flex-1">
                {colTickets.map(t => (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTicketForDetail(t)}
                    className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs hover:border-cyan-500/50 transition-all cursor-pointer space-y-2.5 group"
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-cyan-600 dark:text-cyan-400 border border-zinc-200 dark:border-zinc-700">
                        {t.contratoNumero}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        t.prioridade === 'urgente' ? 'bg-red-950 text-red-400 border border-red-800' :
                        t.prioridade === 'alta' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                        'bg-zinc-800 text-zinc-300'
                      }`}>
                        {t.prioridade.toUpperCase()}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-white line-clamp-1">
                        {t.clienteNome}
                      </h4>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1">
                        {t.descricao}
                      </p>
                    </div>

                    {t.fotos && t.fotos.length > 0 && (
                      <div className="relative h-20 w-full rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800">
                        <img 
                          src={t.fotos[0]} 
                          alt="Anexo" 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-zinc-950/70 text-[9px] text-white font-mono">
                          📸 {t.fotos.length} foto(s)
                        </span>
                      </div>
                    )}

                    <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-400">
                      <div className="flex items-center gap-1 truncate max-w-[120px]">
                        <User className="w-3 h-3 text-cyan-400" />
                        <span className="truncate">{t.tecnicoResponsavel || 'Não designado'}</span>
                      </div>
                      {t.dataAgendada && (
                        <div className="flex items-center gap-1 font-mono text-purple-400">
                          <Calendar className="w-3 h-3" />
                          <span>{t.dataAgendada.split('-').reverse().join('/')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {colTickets.length === 0 && (
                  <div className="h-32 flex items-center justify-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-400 text-xs italic">
                    Nenhum chamado
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Novo Chamado */}
      {isNewTicketOpen && (
        <div className="fixed inset-0 bg-zinc-950/70 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                    Abrir Chamado de Assistência Técnica
                  </h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Vincule a um contrato existente (mesmo concluído)
                  </p>
                </div>
              </div>
              <button onClick={() => setIsNewTicketOpen(false)} className="text-zinc-400 hover:text-zinc-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Contrato de Referência *
                </label>
                <select
                  value={contratoIdForm}
                  onChange={(e) => setContratoIdForm(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                >
                  {contratos.map(c => {
                    const cli = clientes.find(cl => cl.id === c.clienteId);
                    return (
                      <option key={c.id} value={c.id}>
                        {c.numeroContrato} - {cli?.nome || 'Cliente'} (Status: {c.statusAssinatura})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Prioridade
                  </label>
                  <select
                    value={prioridadeForm}
                    onChange={(e) => setPrioridadeForm(e.target.value as PrioridadeChamado)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="baixa">Baixa</option>
                    <option value="normal">Normal</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Técnico Responsável
                  </label>
                  <input
                    type="text"
                    value={tecnicoForm}
                    onChange={(e) => setTecnicoForm(e.target.value)}
                    placeholder="Ex: Rodrigo Barbosa"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Data Agendada para Visita / Visita Técnica
                </label>
                <input
                  type="date"
                  value={dataAgendadaForm}
                  onChange={(e) => setDataAgendadaForm(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Descrição Detalhada do Problema *
                </label>
                <textarea
                  required
                  rows={3}
                  value={descricaoForm}
                  onChange={(e) => setDescricaoForm(e.target.value)}
                  placeholder="Ex: Amortecedor da porta basculante solto e fita LED queimada no balcão..."
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  URL da Foto do Problema (Opcional)
                </label>
                <input
                  type="url"
                  value={fotoUrlForm}
                  onChange={(e) => setFotoUrlForm(e.target.value)}
                  placeholder="https://images.unsplash.com/... (ou deixe em branco)"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsNewTicketOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-700 text-zinc-300 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold cursor-pointer transition-colors"
                >
                  Registrar Chamado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Detalhes e Gestão do Chamado */}
      {selectedTicketForDetail && (
        <div className="fixed inset-0 bg-zinc-950/70 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 w-full max-w-2xl shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-800">
                    Chamado {selectedTicketForDetail.id} • {selectedTicketForDetail.contratoNumero}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    selectedTicketForDetail.status === 'resolvido' ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'
                  }`}>
                    {selectedTicketForDetail.status.replace('_', ' ')}
                  </span>
                </div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white mt-1">
                  {selectedTicketForDetail.clienteNome}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedTicketForDetail(null)} 
                className="text-zinc-400 hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 space-y-1">
                  <p className="text-[11px] font-semibold text-zinc-400">Descrição do Problema:</p>
                  <p className="text-zinc-800 dark:text-zinc-200">{selectedTicketForDetail.descricao}</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60">
                    <p className="text-[11px] font-semibold text-zinc-400">Técnico Responsável:</p>
                    <p className="font-bold text-zinc-900 dark:text-white mt-0.5">
                      {selectedTicketForDetail.tecnicoResponsavel || 'Não designado'}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60">
                    <p className="text-[11px] font-semibold text-zinc-400">Data Agendada:</p>
                    <p className="font-bold text-purple-400 font-mono mt-0.5">
                      {selectedTicketForDetail.dataAgendada ? selectedTicketForDetail.dataAgendada.split('-').reverse().join('/') : 'A definir'}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Avançar Etapa (Pipeline Kanban)
                  </label>
                  <div className="grid grid-cols-5 gap-1">
                    {KANBAN_COLUMNS.map(col => (
                      <button
                        key={col.id}
                        onClick={() => {
                          mudarStatusKanban(selectedTicketForDetail.id, col.id);
                          setSelectedTicketForDetail(prev => prev ? { ...prev, status: col.id } : null);
                        }}
                        className={`p-2 rounded-lg text-[10px] font-bold text-center cursor-pointer transition-all ${
                          selectedTicketForDetail.status === col.id 
                            ? 'bg-cyan-600 text-white shadow-xs' 
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                        }`}
                      >
                        {col.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  Histórico do Chamado
                </p>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {selectedTicketForDetail.historico?.map((h, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 text-[11px] space-y-1">
                      <div className="flex items-center justify-between text-zinc-400 font-mono text-[10px]">
                        <span>{h.ator}</span>
                        <span>{new Date(h.timestamp).toLocaleString('pt-BR')}</span>
                      </div>
                      <p className="text-zinc-700 dark:text-zinc-300">{h.acao}</p>
                    </div>
                  ))}
                </div>

                {selectedTicketForDetail.fotos && selectedTicketForDetail.fotos.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-zinc-900 dark:text-white mb-1.5">Foto Anexada</p>
                    <div className="relative h-32 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700">
                      <img 
                        src={selectedTicketForDetail.fotos[0]} 
                        alt="Anexo" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <button
                onClick={() => {
                  if (confirm('Tem certeza que deseja excluir este chamado de assistência?')) {
                    excluirChamadoAssistencia(selectedTicketForDetail.id);
                    setSelectedTicketForDetail(null);
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-400 text-xs font-semibold cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir Chamado</span>
              </button>

              <button
                onClick={() => setSelectedTicketForDetail(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
