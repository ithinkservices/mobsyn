'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { useApp } from '@/context/AppContext';
import { 
  Contrato, 
  StatusContrato, 
  Cliente, 
  Negocio, 
  Projeto 
} from '@/types/database';
import { 
  FileText, 
  Plus, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Calendar, 
  Trash2, 
  X,
  FileCheck,
  Send,
  AlertCircle,
  Key,
  ShieldCheck,
  ShieldAlert,
  Share2,
  Printer,
  Copy,
  PenTool,
  ArrowRight,
  Factory,
  Receipt,
  Truck,
  Headphones,
  Search,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Check,
  Building2,
  User,
  Hash,
  Award
} from 'lucide-react';
import { IcpBrasilSignatureModal } from './IcpBrasilSignatureModal';
import { ClientSignatureModal } from './ClientSignatureModal';
import { criarContratoDeNegocio } from '@/lib/contractEngine';

export const ContratosView: React.FC = () => {
  const { 
    contratos, 
    clientes, 
    negocios, 
    projetos, 
    empresaAtiva, 
    currentUser,
    criarContrato, 
    editarContrato, 
    excluirContrato,
    editarNegocio,
    setAbaAtiva,
    enviarMensagemWhatsApp,
    ticketsAssistenca,
    criarChamadoAssistencia
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [contratoSelecionadoId, setContratoSelecionadoId] = useState<string>(() => {
    return contratos[0]?.id || '';
  });

  const [abaInternaContrato, setAbaInternaContrato] = useState<'documento' | 'auditoria' | 'hub_operacoes' | 'assistencia'>('documento');
  const [isContratoTicketModalOpen, setIsContratoTicketModalOpen] = useState(false);
  const [ticketDescContrato, setTicketDescContrato] = useState('');
  const [ticketPrioridadeContrato, setTicketPrioridadeContrato] = useState<'normal' | 'alta' | 'urgente'>('normal');

  // Modais de Assinatura
  const [isIcpModalOpen, setIsIcpModalOpen] = useState(false);
  const [isClientSigModalOpen, setIsClientSigModalOpen] = useState(false);
  const [isNewContractModalOpen, setIsNewContractModalOpen] = useState(false);
  const [linkCopiado, setLinkCopiado] = useState(false);

  // Form Novo Contrato Manual
  const [novoNegocioId, setNovoNegocioId] = useState(negocios[0]?.id || '');
  const [novoValor, setNovoValor] = useState('35000');
  const [novasCondicoes, setNovasCondicoes] = useState('Entrada 30% no PIX + 4x boletos bancários da marcenaria');
  const [novoPrazo, setNovoPrazo] = useState(35);

  // Contrato Selecionado
  const contratoAtivo = useMemo(() => {
    return contratos.find(c => c.id === contratoSelecionadoId) || contratos[0] || null;
  }, [contratos, contratoSelecionadoId]);

  const clienteDoContrato = useMemo(() => {
    if (!contratoAtivo) return undefined;
    return clientes.find(c => c.id === contratoAtivo.clienteId);
  }, [clientes, contratoAtivo]);

  const negocioDoContrato = useMemo(() => {
    if (!contratoAtivo) return undefined;
    return negocios.find(n => n.id === contratoAtivo.negocioId);
  }, [negocios, contratoAtivo]);

  const projetoDoContrato = useMemo(() => {
    if (!contratoAtivo) return undefined;
    return projetos.find(p => p.id === contratoAtivo.projetoId || p.negocioId === contratoAtivo.negocioId);
  }, [projetos, contratoAtivo]);

  // Filtros de Lista
  const contratosFiltrados = useMemo(() => {
    return contratos.filter(c => {
      const cli = clientes.find(client => client.id === c.clienteId);
      const matchSearch = 
        c.numeroContrato.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cli?.nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.condicoesPagamento || '').toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchSearch) return false;

      if (filtroStatus === 'todos') return true;
      if (filtroStatus === 'aguardando_empresa') return c.statusAssinatura === 'aguardando_assinatura_empresa';
      if (filtroStatus === 'aguardando_cliente') return c.statusAssinatura === 'aguardando_assinatura_cliente';
      if (filtroStatus === 'assinado') return c.statusAssinatura === 'assinado' || c.statusAssinatura === 'em_producao';
      return c.statusAssinatura === filtroStatus;
    });
  }, [contratos, clientes, searchTerm, filtroStatus]);

  // Copiar link de assinatura remota do cliente
  const handleCopiarLinkAssinatura = () => {
    if (!contratoAtivo) return;
    const link = contratoAtivo.linkAssinaturaCliente || `${window.location.origin}/assinar/${contratoAtivo.id}`;
    navigator.clipboard.writeText(link);
    setLinkCopiado(true);
    setTimeout(() => setLinkCopiado(false), 3000);
  };

  // Enviar link via WhatsApp
  const handleEnviarLinkWhatsApp = () => {
    if (!contratoAtivo || !clienteDoContrato) return;
    const link = contratoAtivo.linkAssinaturaCliente || `${window.location.origin}/assinar/${contratoAtivo.id}`;
    const texto = `Olá *${clienteDoContrato.nome}*, tudo bem? 📋\n\nSeu contrato de compra e venda de móveis planejados (*${contratoAtivo.numeroContrato}*) está pronto para assinatura digital com validade jurídica.\n\n👉 *Acesse o link seguro para assinar:* ${link}\n\nQualquer dúvida, estamos à disposição!`;
    const fone = clienteDoContrato.whatsapp || clienteDoContrato.telefone;
    if (fone) {
      enviarMensagemWhatsApp(fone, texto, clienteDoContrato.id, contratoAtivo.negocioId);
    }
  };

  // Callback de atualização de contrato
  const handleContratoAtualizado = (contratoAtualizado: Contrato) => {
    editarContrato(contratoAtualizado.id, contratoAtualizado);
    // Se foi assinado, atualiza o negócio no CRM para fechado_ganho
    if (contratoAtualizado.statusAssinatura === 'assinado' && contratoAtualizado.negocioId) {
      editarNegocio(contratoAtualizado.negocioId, {
        etapaFunil: 'fechado_ganho',
      });
    }
  };

  const handleCriarContratoManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresaAtiva) return;

    const neg = negocios.find(n => n.id === novoNegocioId) || negocios[0];
    const cli = clientes.find(c => c.id === neg?.clienteId) || clientes[0];

    const novo = criarContratoDeNegocio({
      negocio: neg,
      cliente: cli,
      empresa: empresaAtiva,
      projeto: projetos.find(p => p.negocioId === neg?.id),
      contratosExistentes: contratos,
    });

    novo.valorTotal = Number(novoValor) || novo.valorTotal;
    novo.condicoesPagamento = novasCondicoes;
    novo.prazoEntregaDias = Number(novoPrazo) || 35;

    criarContrato(novo);
    setContratoSelecionadoId(novo.id);
    setIsNewContractModalOpen(false);
  };

  const getStatusBadge = (st: StatusContrato) => {
    switch (st) {
      case 'assinado':
      case 'em_producao':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Assinado (Válido)</span>
          </span>
        );
      case 'aguardando_assinatura_cliente':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-500 border border-cyan-500/30 text-[10px] font-bold flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Aguardando Cliente</span>
          </span>
        );
      case 'aguardando_assinatura_empresa':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/30 text-[10px] font-bold flex items-center gap-1">
            <Key className="w-3 h-3" />
            <span>Pendente ICP-Brasil</span>
          </span>
        );
      case 'rascunho':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-zinc-500/10 text-zinc-400 border border-zinc-500/30 text-[10px] font-bold">
            Rascunho
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-zinc-500/10 text-zinc-400 border border-zinc-500/30 text-[10px] font-bold">
            {st}
          </span>
        );
    }
  };

  return (
    <div id="contratos-hub-view" className="space-y-6 animate-in fade-in duration-200">
      
      {/* ========================================================================= */}
      {/* 1. HEADER DO MÓDULO DE CONTRATOS                                          */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
              FECHAMENTO JURÍDICO & HUB OPERACIONAL
            </span>
            <span className="text-xs text-zinc-400">•</span>
            <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">
              {empresaAtiva?.nomeFantasia || 'Marcenaria'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight mt-1">
            Contratos & Assinatura Digital ICP-Brasil
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Registro central que conecta Vendas ao PCP de Produção, Contas a Receber, Montagem e Pós-Venda.
          </p>
        </div>

        {/* Botão Novo Contrato */}
        <button
          type="button"
          onClick={() => setIsNewContractModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-cyan-500/20 transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Contrato</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 2. GRADE PRINCIPAL: LISTA À ESQUERDA (4 colunas) + DETALHE À DIREITA (8)   */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ======================================================================= */}
        {/* COLUNA ESQUERDA: LISTA DE CONTRATOS COM BUSCA E FILTROS                */}
        {/* ======================================================================= */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Caixa de Busca & Filtros de Status */}
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Buscar contrato (#N/ANO, cliente)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Abas de Filtro */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] font-bold text-zinc-500 scrollbar-none">
              {[
                { id: 'todos', label: 'Todos' },
                { id: 'aguardando_empresa', label: 'Pendente ICP' },
                { id: 'aguardando_cliente', label: 'Aguard. Cliente' },
                { id: 'assinado', label: 'Assinados' },
              ].map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFiltroStatus(f.id)}
                  className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                    filtroStatus === f.id
                      ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-black'
                      : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cards dos Contratos na Lista */}
          <div className="space-y-2.5 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
            {contratosFiltrados.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-400 text-xs">
                Nenhum contrato encontrado com os filtros selecionados.
              </div>
            ) : (
              contratosFiltrados.map((c) => {
                const isSelected = contratoAtivo?.id === c.id;
                const cli = clientes.find(cl => cl.id === c.clienteId);
                const neg = negocios.find(n => n.id === c.negocioId);

                return (
                  <div
                    key={c.id}
                    onClick={() => setContratoSelecionadoId(c.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                      isSelected
                        ? 'bg-cyan-500/5 dark:bg-cyan-950/20 border-cyan-500 shadow-md ring-1 ring-cyan-500/30'
                        : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-mono font-black text-sm text-zinc-900 dark:text-zinc-100 block">
                          {c.numeroContrato}
                        </span>
                        <span className="font-bold text-xs text-zinc-700 dark:text-zinc-300 block truncate max-w-[200px]">
                          {cli?.nome || 'Cliente não identificado'}
                        </span>
                      </div>
                      {getStatusBadge(c.statusAssinatura)}
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-100 dark:border-zinc-800/80">
                      <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">
                        {c.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                      <span className="text-[11px] text-zinc-400">
                        {c.prazoEntregaDias} dias úteis
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* ======================================================================= */}
        {/* COLUNA DIREITA: HUB CENTRAL DO CONTRATO SELECIONADO                     */}
        {/* ======================================================================= */}
        <div className="lg:col-span-8 space-y-5">
          
          {contratoAtivo ? (
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-md space-y-6">
              
              {/* Header do Contrato Ativo */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-200 dark:border-zinc-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl sm:text-2xl font-black font-mono text-zinc-900 dark:text-zinc-100">
                      {contratoAtivo.numeroContrato}
                    </span>
                    {getStatusBadge(contratoAtivo.statusAssinatura)}
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Cliente: <strong className="text-zinc-800 dark:text-zinc-200">{clienteDoContrato?.nome || 'Cliente'}</strong> • CPF/CNPJ: <span className="font-mono">{clienteDoContrato?.cpfCnpj || 'Não informado'}</span>
                  </p>
                </div>

                {/* Ações no Topo do Contrato */}
                <div className="flex items-center gap-2 flex-wrap">
                  
                  {/* Botão Assinar ICP-Brasil (se pendente) */}
                  {!contratoAtivo.assinaturaEmpresa?.assinado && (
                    <button
                      type="button"
                      onClick={() => setIsIcpModalOpen(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Key className="w-3.5 h-3.5" />
                      <span>Assinar com ICP-Brasil</span>
                    </button>
                  )}

                  {/* Botão Assinar como Cliente (Simulação/Tablet) */}
                  {!contratoAtivo.assinaturaCliente?.assinado && (
                    <button
                      type="button"
                      onClick={() => setIsClientSigModalOpen(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <PenTool className="w-3.5 h-3.5" />
                      <span>Assinar no Tablet</span>
                    </button>
                  )}

                  {/* Botão Copiar Link */}
                  <button
                    type="button"
                    onClick={handleCopiarLinkAssinatura}
                    className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                    title="Copiar link de assinatura remota para o cliente"
                  >
                    {linkCopiado ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>

                  {/* Botão WhatsApp */}
                  <button
                    type="button"
                    onClick={handleEnviarLinkWhatsApp}
                    className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/30 transition-colors cursor-pointer"
                    title="Enviar link de assinatura via WhatsApp"
                  >
                    <Send className="w-4 h-4" />
                  </button>

                  {/* Botão Imprimir */}
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                    title="Imprimir contrato em PDF"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Cards de Destaque Financeiro & Prazos */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block">Valor Total Fechado</span>
                  <span className="text-lg font-black font-mono text-cyan-600 dark:text-cyan-400 block mt-0.5">
                    {contratoAtivo.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block">Prazo de Fabricação</span>
                  <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200 block mt-0.5">
                    {contratoAtivo.prazoEntregaDias} dias úteis
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block">Montagem In-Loco</span>
                  <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200 block mt-0.5">
                    {contratoAtivo.prazoMontagemDias || 7} dias úteis
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block">Garantia Fabril</span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 block mt-0.5">
                    {contratoAtivo.garantiaAnos || 5} Anos
                  </span>
                </div>
              </div>

              {/* Abas Internas: Documento / Auditoria / Hub Operações */}
              <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-1">
                <button
                  type="button"
                  onClick={() => setAbaInternaContrato('documento')}
                  className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
                    abaInternaContrato === 'documento'
                      ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                      : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Documento Oficial & PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAbaInternaContrato('hub_operacoes')}
                  className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
                    abaInternaContrato === 'hub_operacoes'
                      ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                      : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  <Factory className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Hub de Operações Subsequentes</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold">
                    PCP / Fin. / Montagem
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setAbaInternaContrato('auditoria')}
                  className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
                    abaInternaContrato === 'auditoria'
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Trilha de Auditoria & Hashes</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAbaInternaContrato('assistencia')}
                  className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
                    abaInternaContrato === 'assistencia'
                      ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                      : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                  <span>Assistência Técnica & Garantia</span>
                </button>
              </div>

              {/* ================================================================= */}
              {/* ABA 1: DOCUMENTO OFICIAL & PDF FORMATADO                          */}
              {/* ================================================================= */}
              {abaInternaContrato === 'documento' && (
                <div className="space-y-6">
                  
                  {/* Visualizador de Contrato Formatado com Cláusulas */}
                  <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 font-serif text-zinc-800 dark:text-zinc-200 leading-relaxed text-xs shadow-inner max-h-[500px] overflow-y-auto space-y-4">
                    <div className="text-center pb-4 border-b border-zinc-300 dark:border-zinc-800 font-sans">
                      <h2 className="text-base font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                        {empresaAtiva?.razaoSocial || 'MARCENARIA & INTERIORES LTDA'}
                      </h2>
                      <p className="text-[11px] text-zinc-500">
                        CNPJ: {empresaAtiva?.cnpj || '00.000.000/0001-00'} • {empresaAtiva?.enderecoCompleto || 'São Paulo - SP'}
                      </p>
                      <span className="text-xs font-bold font-mono text-cyan-600 dark:text-cyan-400 mt-2 block">
                        INSTRUMENTO DE COMPRA E VENDA DE MÓVEIS PLANEJADOS • CONTRATO {contratoAtivo.numeroContrato}
                      </span>
                    </div>

                    <pre className="whitespace-pre-wrap font-sans text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                      {contratoAtivo.textoContratoCompleto}
                    </pre>

                    {/* Selos de Assinatura no Rodapé do Documento */}
                    <div className="pt-6 border-t border-zinc-300 dark:border-zinc-800 grid grid-cols-1 md:grid-cols-2 gap-4 font-sans text-xs">
                      
                      {/* Selo Empresa (ICP-Brasil) */}
                      <div className={`p-3.5 rounded-xl border ${
                        contratoAtivo.assinaturaEmpresa?.assinado
                          ? 'bg-emerald-500/5 border-emerald-500/30'
                          : 'bg-zinc-100 dark:bg-zinc-900 border-dashed border-zinc-300 dark:border-zinc-700'
                      }`}>
                        {contratoAtivo.assinaturaEmpresa?.assinado ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                              <ShieldCheck className="w-4 h-4" />
                              <span>Assinado Digitalmente via ICP-Brasil</span>
                            </div>
                            <p className="text-[11px] text-zinc-700 dark:text-zinc-300 font-bold">
                              {contratoAtivo.assinaturaEmpresa.assinanteNome} ({contratoAtivo.assinaturaEmpresa.assinanteCargo})
                            </p>
                            <p className="text-[10px] text-zinc-500 font-mono">
                              {contratoAtivo.assinaturaEmpresa.autoridadeCertificadora} • Data: {new Date(contratoAtivo.assinaturaEmpresa.dataAssinatura!).toLocaleString('pt-BR')}
                            </p>
                            <p className="text-[9px] text-zinc-400 font-mono truncate">
                              Hash: {contratoAtivo.assinaturaEmpresa.hashSha256}
                            </p>
                          </div>
                        ) : (
                          <div className="text-center py-3 text-zinc-400 space-y-1">
                            <Key className="w-5 h-5 mx-auto opacity-40" />
                            <span className="text-[11px] font-bold block">Pendente Assinatura da Empresa</span>
                            <button
                              type="button"
                              onClick={() => setIsIcpModalOpen(true)}
                              className="text-[10px] text-cyan-500 font-bold hover:underline cursor-pointer"
                            >
                              Clique para assinar com ICP-Brasil
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Selo Cliente (Eletrônica / Rubrica) */}
                      <div className={`p-3.5 rounded-xl border ${
                        contratoAtivo.assinaturaCliente?.assinado
                          ? 'bg-cyan-500/5 border-cyan-500/30'
                          : 'bg-zinc-100 dark:bg-zinc-900 border-dashed border-zinc-300 dark:border-zinc-700'
                      }`}>
                        {contratoAtivo.assinaturaCliente?.assinado ? (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400 font-bold text-[11px]">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Assinado Eletronicamente pelo Cliente</span>
                              </div>
                              {contratoAtivo.assinaturaCliente.rubricaBase64 && (
                                <div className="h-6 w-20 relative bg-white dark:bg-zinc-800 rounded border border-zinc-300 dark:border-zinc-700 overflow-hidden">
                                  <Image
                                    src={contratoAtivo.assinaturaCliente.rubricaBase64}
                                    alt="Rubrica do Cliente"
                                    fill
                                    className="object-contain"
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                              )}
                            </div>
                            <p className="text-[11px] text-zinc-700 dark:text-zinc-300 font-bold">
                              {contratoAtivo.assinaturaCliente.nomeCompleto} (CPF: {contratoAtivo.assinaturaCliente.cpfCnpj})
                            </p>
                            <p className="text-[10px] text-zinc-500 font-mono">
                              IP: {contratoAtivo.assinaturaCliente.ip} • Data: {new Date(contratoAtivo.assinaturaCliente.dataAssinatura!).toLocaleString('pt-BR')}
                            </p>
                            <p className="text-[9px] text-zinc-400 font-mono truncate">
                              Hash: {contratoAtivo.assinaturaCliente.hashSha256}
                            </p>
                          </div>
                        ) : (
                          <div className="text-center py-3 text-zinc-400 space-y-1">
                            <PenTool className="w-5 h-5 mx-auto opacity-40" />
                            <span className="text-[11px] font-bold block">Pendente Assinatura do Cliente</span>
                            <button
                              type="button"
                              onClick={handleCopiarLinkAssinatura}
                              className="text-[10px] text-cyan-500 font-bold hover:underline cursor-pointer"
                            >
                              Copiar ou enviar link para o cliente
                            </button>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>

                </div>
              )}

              {/* ================================================================= */}
              {/* ABA 2: HUB DE OPERAÇÕES SUBSEQUENTES (PCP, FINANCEIRO, MONTAGEM)   */}
              {/* ================================================================= */}
              {abaInternaContrato === 'hub_operacoes' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300">
                    <span className="font-bold block text-sm mb-0.5">
                      Contrato Oficial como Registro Central da Marcenaria
                    </span>
                    Este contrato é a chave mestra de rastreabilidade. A partir dele, todos os módulos subsequentes são alimentados e integrados automaticamente.
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* 1. Módulo de Produção / PCP */}
                    <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-3 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                            <Factory className="w-4 h-4 text-emerald-500" />
                            <span>1. Ordem de Produção / PCP</span>
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                            OP-{contratoAtivo.numeroContrato}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400">
                          Geração automática do plano de corte, furação CNC e fitamento de borda PUR dos ambientes aprovados.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setAbaAtiva('producao')}
                        className="w-full py-2.5 px-3 rounded-xl bg-white dark:bg-zinc-800 hover:bg-emerald-600 hover:text-white border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                      >
                        <span>Acessar Chão de Fábrica & PCP</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* 2. Módulo Financeiro & Contas a Receber */}
                    <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-3 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                            <Receipt className="w-4 h-4 text-cyan-500" />
                            <span>2. Financeiro & Contas a Receber</span>
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-bold">
                            DRE & Boletos
                          </span>
                        </div>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400">
                          Fluxo de parcelas contratadas ({contratoAtivo.condicoesPagamento}), emissão de boletos e conciliação bancária.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setAbaAtiva('financeiro')}
                        className="w-full py-2.5 px-3 rounded-xl bg-white dark:bg-zinc-800 hover:bg-cyan-600 hover:text-white border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                      >
                        <span>Acessar Contas a Receber</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* 3. Módulo de Montagem in-loco */}
                    <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-3 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                            <Truck className="w-4 h-4 text-amber-500" />
                            <span>3. Expedição & Montagem na Obra</span>
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold">
                            {contratoAtivo.prazoMontagemDias || 7} Dias
                          </span>
                        </div>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400">
                          Escala dos montadores de campo, conferência por QR Code na entrega e Termo de Vistoria de Entrega com o cliente.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setAbaAtiva('montagem')}
                        className="w-full py-2.5 px-3 rounded-xl bg-white dark:bg-zinc-800 hover:bg-amber-600 hover:text-white border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                      >
                        <span>Acessar Cronograma de Montagem</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* 4. Módulo de Pós-Venda & Garantia */}
                    <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-3 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                            <Headphones className="w-4 h-4 text-indigo-500" />
                            <span>4. Pós-Venda & Garantia de 5 Anos</span>
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 font-bold">
                            Garantia 5 Anos
                          </span>
                        </div>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400">
                          Abertura de chamados de assistência técnica vinculados a este contrato, histórico de manutenções e pesquisa NPS.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setAbaAtiva('pos-venda')}
                        className="w-full py-2.5 px-3 rounded-xl bg-white dark:bg-zinc-800 hover:bg-indigo-600 hover:text-white border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                      >
                        <span>Acessar Pós-Venda & Chamados</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                </div>
              )}

              {/* ================================================================= */}
              {/* ABA 3: TRILHA DE AUDITORIA & HASHES CRIPTOGRÁFICOS                */}
              {/* ================================================================= */}
              {abaInternaContrato === 'auditoria' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-indigo-500" />
                      <span>Log de Auditoria Jurídica & Validação Criptográfica</span>
                    </span>
                    <span className="text-[11px] font-mono text-zinc-400">
                      Total de Eventos: {contratoAtivo.logAuditoria?.length || 1}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {(contratoAtivo.logAuditoria || []).map((log, idx) => (
                      <div
                        key={log.id || idx}
                        className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span>{log.ator}</span>
                          </span>
                          <span className="font-mono text-[10px] text-zinc-400">
                            {new Date(log.timestamp).toLocaleString('pt-BR')}
                          </span>
                        </div>

                        <p className="text-zinc-600 dark:text-zinc-300 text-[11px]">
                          {log.detalhes}
                        </p>

                        {log.hashIntegridade && (
                          <div className="pt-1 text-[9px] font-mono text-zinc-400 truncate">
                            SHA-256: {log.hashIntegridade}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ================================================================= */}
              {/* ABA 4: ASSISTÊNCIA TÉCNICA & GARANTIA                             */}
              {/* ================================================================= */}
              {abaInternaContrato === 'assistencia' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-amber-500" />
                      <span>Chamados de Assistência Técnica & Garantia</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsContratoTicketModalOpen(true)}
                      className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Abrir Chamado p/ Este Contrato</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {ticketsAssistenca
                      .filter(t => t.contratoId === contratoAtivo.id || t.contratoNumero === contratoAtivo.numeroContrato)
                      .map(t => (
                        <div key={t.id} className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
                              Chamado {t.id} • Status: {t.status.toUpperCase()}
                            </span>
                            <span className="text-[10px] text-zinc-400 font-mono">
                              Aberto em: {t.dataAbertura}
                            </span>
                          </div>
                          <p className="text-zinc-800 dark:text-zinc-200">{t.descricao}</p>
                          <div className="flex items-center justify-between pt-2 border-t border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-400">
                            <span>Técnico: <strong className="text-zinc-200">{t.tecnicoResponsavel || 'Não designado'}</strong></span>
                            <span>Agendado: <strong className="text-purple-400">{t.dataAgendada || 'A definir'}</strong></span>
                          </div>
                        </div>
                      ))}

                    {ticketsAssistenca.filter(t => t.contratoId === contratoAtivo.id || t.contratoNumero === contratoAtivo.numeroContrato).length === 0 && (
                      <div className="p-8 text-center border border-dashed border-zinc-300 dark:border-zinc-800 rounded-xl text-zinc-400 text-xs">
                        Nenhum chamado de assistência técnica registrado para este contrato. (Mesmo em contratos concluídos, você pode abrir chamados de garantia a qualquer momento).
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="p-12 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl text-zinc-400 text-xs">
              Selecione um contrato na lista ao lado para visualizar os detalhes.
            </div>
          )}

        </div>

      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: ASSINATURA DIGITAL ICP-BRASIL DA EMPRESA                         */}
      {/* ========================================================================= */}
      {isIcpModalOpen && contratoAtivo && empresaAtiva && (
        <IcpBrasilSignatureModal
          isOpen={isIcpModalOpen}
          onClose={() => setIsIcpModalOpen(false)}
          contrato={contratoAtivo}
          empresa={empresaAtiva}
          currentUser={currentUser}
          onAssinaturaConcluida={handleContratoAtualizado}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ASSINATURA ELETRÔNICA REMOTA DO CLIENTE (COM CANVAS DE RUBRICA)  */}
      {/* ========================================================================= */}
      {isClientSigModalOpen && contratoAtivo && (
        <ClientSignatureModal
          isOpen={isClientSigModalOpen}
          onClose={() => setIsClientSigModalOpen(false)}
          contrato={contratoAtivo}
          cliente={clienteDoContrato}
          empresa={empresaAtiva}
          onAssinaturaConcluida={handleContratoAtualizado}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: NOVO CONTRATO MANUAL                                             */}
      {/* ========================================================================= */}
      {isNewContractModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                Novo Contrato de Marcenaria
              </h3>
              <button
                type="button"
                onClick={() => setIsNewContractModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCriarContratoManual} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-zinc-700 dark:text-zinc-300 font-bold mb-1">
                  Vincular ao Negócio / Proposta *
                </label>
                <select
                  value={novoNegocioId}
                  onChange={(e) => setNovoNegocioId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                >
                  {negocios.map(n => {
                    const c = clientes.find(cli => cli.id === n.clienteId);
                    return (
                      <option key={n.id} value={n.id}>
                        {n.titulo} ({c?.nome || 'Cliente'}) - {n.valorEstimado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-zinc-700 dark:text-zinc-300 font-bold mb-1">
                  Valor Total do Contrato (R$) *
                </label>
                <input
                  type="number"
                  required
                  value={novoValor}
                  onChange={(e) => setNovoValor(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-zinc-700 dark:text-zinc-300 font-bold mb-1">
                  Condições de Pagamento *
                </label>
                <input
                  type="text"
                  required
                  value={novasCondicoes}
                  onChange={(e) => setNovasCondicoes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-zinc-700 dark:text-zinc-300 font-bold mb-1">
                  Prazo de Fabricação (Dias Úteis)
                </label>
                <input
                  type="number"
                  value={novoPrazo}
                  onChange={(e) => setNovoPrazo(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsNewContractModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-zinc-500 hover:text-zinc-700 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold cursor-pointer"
                >
                  Gerar Contrato #N/ANO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Novo Chamado para o Contrato Ativo */}
      {isContratoTicketModalOpen && contratoAtivo && (
        <div className="fixed inset-0 bg-zinc-950/70 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                Novo Chamado • Contrato {contratoAtivo.numeroContrato}
              </h3>
              <button onClick={() => setIsContratoTicketModalOpen(false)} className="text-zinc-400 hover:text-zinc-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (!ticketDescContrato) return;
              criarChamadoAssistencia({
                contratoId: contratoAtivo.id,
                contratoNumero: contratoAtivo.numeroContrato,
                clienteId: contratoAtivo.clienteId || '',
                clienteNome: clienteDoContrato?.nome || 'Cliente',
                descricao: ticketDescContrato,
                fotos: ['https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80'],
                prioridade: ticketPrioridadeContrato,
                status: 'aberto',
                tecnicoResponsavel: 'Rodrigo Barbosa',
                dataAbertura: new Date().toISOString().split('T')[0],
                dataResolucao: null,
                historico: [
                  {
                    id: `h_${Date.now()}`,
                    timestamp: new Date().toISOString(),
                    ator: clienteDoContrato?.nome || 'Cliente / Contrato',
                    acao: 'Chamado aberto diretamente pela tela do contrato.'
                  }
                ]
              });
              setTicketDescContrato('');
              setIsContratoTicketModalOpen(false);
            }} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Prioridade
                </label>
                <select
                  value={ticketPrioridadeContrato}
                  onChange={(e) => setTicketPrioridadeContrato(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                >
                  <option value="normal">Normal</option>
                  <option value="alta">Alta</option>
                  <option value="urgente">Urgente</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Descrição do Problema / Solicitação de Garantia *
                </label>
                <textarea
                  required
                  rows={3}
                  value={ticketDescContrato}
                  onChange={(e) => setTicketDescContrato(e.target.value)}
                  placeholder="Ex: Regulagem de porta ou troca de componente..."
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsContratoTicketModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-700 text-zinc-300 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold cursor-pointer"
                >
                  Abrir Chamado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
