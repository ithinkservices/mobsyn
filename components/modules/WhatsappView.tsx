'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  MessageSquare, 
  Send, 
  Phone, 
  User, 
  Clock, 
  CheckCheck, 
  Check, 
  Paperclip, 
  Search, 
  Plus, 
  Settings2, 
  ExternalLink, 
  Kanban, 
  Flame, 
  Sparkles,
  ShieldCheck, 
  Info, 
  X, 
  Copy, 
  PhoneCall, 
  RefreshCw,
  FileText,
  Image as ImageIcon,
  HelpCircle,
  TrendingUp,
  SlidersHorizontal,
  CheckCircle2
} from 'lucide-react';
import { ETAPAS_FUNIL_LABELS } from '@/lib/navigation';
import { EtapaFunil } from '@/types/database';

export const WhatsappView: React.FC = () => {
  const { 
    currentUser,
    clientes, 
    negocios, 
    contratos,
    ordensProducao,
    contasReceber,
    mensagensWhatsApp, 
    conversasWhatsApp, 
    totalMensagensNaoLidas,
    conversaAtivaTelefone,
    setConversaAtivaTelefone,
    enviarMensagemWhatsApp,
    receberMensagemWhatsApp,
    marcarConversaComoLida,
    metaConfig,
    atualizarMetaConfig,
    setAbaAtiva
  } = useApp();

  const [busca, setBusca] = useState('');
  const [filtroAba, setFiltroAba] = useState<'todas' | 'nao_lidas' | 'leads'>('todas');
  const [mensagemTexto, setMensagemTexto] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSuggestingReply, setIsSuggestingReply] = useState(false);
  const [isSimuladorModalOpen, setIsSimuladorModalOpen] = useState(false);
  const [isMetaModalOpen, setIsMetaModalOpen] = useState(false);
  const [copiadoWebhook, setCopiadoWebhook] = useState(false);

  const handleSuggestReply = async () => {
    if (!activeConversa) return;
    setIsSuggestingReply(true);
    try {
      const cli = clienteVinculado;
      const neg = negocioVinculado;
      const con = contratos.find(c => c.negocioId === neg?.id);
      const prod = ordensProducao.find(p => p.negocioId === neg?.id);
      const fin = contasReceber.filter(t => t.clienteNome && cli?.nome && t.clienteNome.toLowerCase() === cli.nome.toLowerCase());

      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'whatsapp-suggestion',
          payload: {
            cliente: cli,
            etapaFunil: neg?.etapaFunil,
            mensagens: mensagensDaConversa,
            contrato: con,
            producao: prod,
            financeiro: fin
          }
        })
      });
      const data = await res.json();
      if (data.suggestedMessage) {
        setMensagemTexto(data.suggestedMessage);
      }
    } catch (err) {
      console.error("Erro ao sugerir resposta via IA:", err);
    } finally {
      setIsSuggestingReply(false);
    }
  };

  // Estados para simular nova mensagem recebida (Lead ou Cliente)
  const [simuladorTelefone, setSimuladorTelefone] = useState('(11) 98765-4321');
  const [simuladorNome, setSimuladorNome] = useState('Mariana Siqueira (Novo Lead)');
  const [simuladorTexto, setSimuladorTexto] = useState('Olá! Gostaria de um orçamento para armários de cozinha planejada no bairro Moema.');

  // Form de configuração da Meta API
  const [metaForm, setMetaForm] = useState({
    phoneNumberId: metaConfig.phoneNumberId || '',
    wabaId: metaConfig.wabaId || '',
    accessToken: metaConfig.accessToken || '',
    verifyToken: metaConfig.verifyToken || 'mobplan_marcenaria_verify_secret_2026',
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Seleciona primeira conversa se nenhuma estiver ativa
  useEffect(() => {
    if (!conversaAtivaTelefone && conversasWhatsApp.length > 0) {
      setConversaAtivaTelefone(conversasWhatsApp[0].telefone);
      marcarConversaComoLida(conversasWhatsApp[0].telefone);
    }
  }, [conversaAtivaTelefone, conversasWhatsApp, setConversaAtivaTelefone, marcarConversaComoLida]);

  // Conversa ativa atual
  const activeConversa = conversasWhatsApp.find(c => c.telefone === conversaAtivaTelefone) || conversasWhatsApp[0] || null;

  // Auto-scroll para a última mensagem
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagensWhatsApp, activeConversa]);

  // Se mudar a conversa ativa, marcar mensagens como lidas
  const handleSelecionarConversa = (telefone: string) => {
    setConversaAtivaTelefone(telefone);
    marcarConversaComoLida(telefone);
  };

  // Mensagens da conversa atual
  const mensagensDaConversa = activeConversa
    ? mensagensWhatsApp.filter(m => {
        const norm1 = m.telefone.replace(/\D/g, '');
        const norm2 = activeConversa.telefone.replace(/\D/g, '');
        return norm1 === norm2 || (norm1.length >= 8 && norm2.length >= 8 && (norm1.endsWith(norm2) || norm2.endsWith(norm1)));
      }).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    : [];

  // Cliente e Negócio vinculados
  const clienteVinculado = activeConversa?.clienteId 
    ? clientes.find(c => c.id === activeConversa.clienteId)
    : clientes.find(c => c.telefone === activeConversa?.telefone || c.whatsapp === activeConversa?.telefone);

  const negocioVinculado = clienteVinculado 
    ? negocios.find(n => n.clienteId === clienteVinculado.id)
    : (activeConversa?.negocioId ? negocios.find(n => n.id === activeConversa.negocioId) : undefined);

  // Filtragem de conversas na lista lateral
  const conversasFiltradas = conversasWhatsApp.filter(c => {
    const termo = busca.toLowerCase().trim();
    const matchBusca = !termo || 
      c.nomeContato.toLowerCase().includes(termo) || 
      c.telefone.includes(termo) || 
      c.ultimaMensagem.toLowerCase().includes(termo);

    if (!matchBusca) return false;

    if (filtroAba === 'nao_lidas') {
      return c.naoLidasCount > 0;
    }
    if (filtroAba === 'leads') {
      return c.etapaFunil === 'contato_inicial' || c.etapaFunil === 'briefing_medicao';
    }
    return true;
  });

  // Modelos Rápidos de Mensagens da Marcenaria (Templates)
  const QUICK_TEMPLATES = [
    {
      titulo: '📐 Visita Técnica',
      texto: `Olá ${activeConversa?.nomeContato?.split(' ')[0] || ''}! Nosso técnico projetista está com a rota aberta para sua região. Podemos confirmar a visita para medição técnica e alinhamento dos pontos elétricos/hidráulicos nesta semana?`
    },
    {
      titulo: '🖥️ Projeto 3D Promob',
      texto: `Olá! Seu projeto 3D executivo com renderização realista já está concluído. Gostaria de agendar uma apresentação presencial no showroom ou via videoconferência para vermos os acabamentos?`
    },
    {
      titulo: '📑 Proposta & Orçamento',
      texto: `Olá! Acabamos de disponibilizar sua proposta comercial detalhada com especificações de MDF 18mm, ferragens com amortecimento Blum e condições de pagamento em até 24x.`
    },
    {
      titulo: '🚚 Entrega & Montagem',
      texto: `Olá! Seus móveis já passaram pelo controle de qualidade da fábrica e foram embalados. Podemos confirmar o início da montagem na sua residência para a próxima segunda-feira?`
    }
  ];

  // Envio de mensagem
  const handleEnviarMensagem = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!mensagemTexto.trim() || !activeConversa) return;

    const texto = mensagemTexto.trim();
    setMensagemTexto('');
    setIsSending(true);

    try {
      await enviarMensagemWhatsApp(
        activeConversa.telefone,
        texto,
        clienteVinculado?.id,
        negocioVinculado?.id
      );
    } finally {
      setIsSending(false);
    }
  };

  // Simular Mensagem Recebida (Testa criação automática de lead e CRM)
  const handleExecutarSimulacao = () => {
    if (!simuladorTelefone.trim() || !simuladorTexto.trim()) return;

    const resultado = receberMensagemWhatsApp(
      simuladorTelefone.trim(),
      simuladorTexto.trim(),
      simuladorNome.trim() || undefined
    );

    setConversaAtivaTelefone(resultado.message.telefone);
    setIsSimuladorModalOpen(false);
  };

  // Salvar Configurações da Meta Cloud API
  const handleSalvarMetaConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const conectado = !!(metaForm.phoneNumberId && metaForm.accessToken);
    atualizarMetaConfig({
      ...metaForm,
      status: conectado ? 'conectado' : 'pendente_configuracao',
    });
    setIsMetaModalOpen(false);
  };

  const handleCopiarWebhook = () => {
    const host = typeof window !== 'undefined' ? window.location.origin : '';
    const webhookUrlCompleta = `${host}/api/whatsapp/webhook`;
    navigator.clipboard.writeText(webhookUrlCompleta);
    setCopiadoWebhook(true);
    setTimeout(() => setCopiadoWebhook(false), 2500);
  };

  return (
    <div id="whatsapp-module-container" className="space-y-4">
      
      {/* Header com Status da Conexão e Ações Rápidas */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WHATSAPP CRM INBOX</span>
            </span>
            <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
              metaConfig.status === 'conectado'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${metaConfig.status === 'conectado' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              {metaConfig.status === 'conectado' ? 'Meta Cloud API Conectada' : 'Modo Simulador & Sandbox Ativo'}
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900 dark:text-white mt-1 flex items-center gap-2">
            Atendimento WhatsApp Integrado ao CRM
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Mensagens recebidas de números desconhecidos criam automaticamente um novo lead no funil de vendas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Botão para simular mensagem de novo lead */}
          <button
            id="btn-simular-mensagem-whatsapp"
            onClick={() => setIsSimuladorModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Simular Novo Lead</span>
          </button>

          {/* Botão de Configurações da Meta API */}
          <button
            id="btn-configurar-meta-whatsapp"
            onClick={() => setIsMetaModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold transition-all cursor-pointer"
          >
            <Settings2 className="w-3.5 h-3.5 text-zinc-400" />
            <span>Configuração API</span>
          </button>
        </div>
      </div>

      {/* Caixa de Entrada (WhatsApp Web Style) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-sm min-h-[640px] max-h-[750px]">
        
        {/* Coluna Esquerda: Lista de Conversas (4 colunas) */}
        <div className="lg:col-span-4 border-r border-zinc-200 dark:border-zinc-800 flex flex-col bg-zinc-50/40 dark:bg-zinc-900/60">
          
          {/* Barra de Busca */}
          <div className="p-3 border-b border-zinc-200/80 dark:border-zinc-800/80 space-y-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por cliente, telefone ou mensagem..."
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-cyan-500 transition-colors"
              />
              {busca && (
                <button 
                  onClick={() => setBusca('')}
                  className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-zinc-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filtros em Abas */}
            <div className="flex items-center gap-1 text-[11px] font-semibold bg-zinc-200/50 dark:bg-zinc-800/50 p-1 rounded-xl">
              <button
                onClick={() => setFiltroAba('todas')}
                className={`flex-1 py-1 px-2 rounded-lg text-center transition-all cursor-pointer ${
                  filtroAba === 'todas'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-2xs font-bold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                Todas ({conversasWhatsApp.length})
              </button>
              <button
                onClick={() => setFiltroAba('nao_lidas')}
                className={`flex-1 py-1 px-2 rounded-lg text-center transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  filtroAba === 'nao_lidas'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-2xs font-bold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <span>Não Lidas</span>
                {totalMensagensNaoLidas > 0 && (
                  <span className="w-4 h-4 rounded-full bg-emerald-500 text-zinc-950 font-extrabold text-[9px] flex items-center justify-center">
                    {totalMensagensNaoLidas}
                  </span>
                )}
              </button>
              <button
                onClick={() => setFiltroAba('leads')}
                className={`flex-1 py-1 px-2 rounded-lg text-center transition-all cursor-pointer ${
                  filtroAba === 'leads'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-2xs font-bold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                Leads CRM
              </button>
            </div>
          </div>

          {/* Lista de Conversas com Scroll Minimalista */}
          <div className="overflow-y-auto flex-1 divide-y divide-zinc-100 dark:divide-zinc-800/60">
            {conversasFiltradas.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-500 dark:text-zinc-400">
                Nenhuma conversa encontrada com os filtros atuais.
              </div>
            ) : (
              conversasFiltradas.map((conv) => {
                const isSelected = activeConversa?.telefone === conv.telefone;
                const dateObj = new Date(conv.ultimaMensagemTimestamp);
                const timeFormatted = isNaN(dateObj.getTime())
                  ? ''
                  : dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

                const etapaLabel = conv.etapaFunil ? ETAPAS_FUNIL_LABELS[conv.etapaFunil]?.label : undefined;

                return (
                  <div
                    key={conv.id}
                    id={`conversation-item-${conv.telefone}`}
                    onClick={() => handleSelecionarConversa(conv.telefone)}
                    className={`p-3.5 flex items-start gap-3 cursor-pointer transition-all duration-150 ${
                      isSelected 
                        ? 'bg-zinc-100 dark:bg-zinc-800/90 border-l-4 border-emerald-500 shadow-2xs' 
                        : 'hover:bg-zinc-100/60 dark:hover:bg-zinc-800/40'
                    }`}
                  >
                    {/* Avatar com badge */}
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-700 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                        {conv.nomeContato.charAt(0).toUpperCase()}
                      </div>
                      {conv.naoLidasCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-900 animate-pulse" />
                      )}
                    </div>

                    {/* Informações da conversa */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-xs font-bold truncate ${isSelected ? 'text-zinc-900 dark:text-white' : 'text-zinc-800 dark:text-zinc-200'}`}>
                          {conv.nomeContato}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-mono shrink-0">
                          {timeFormatted}
                        </span>
                      </div>

                      {/* Subtítulo: Deal CRM e Etapa se houver */}
                      {etapaLabel && (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-800/50 truncate max-w-[150px]">
                            {etapaLabel}
                          </span>
                          {conv.scoreLead === 'quente' && (
                            <span className="text-[9px] font-bold text-rose-400 flex items-center gap-0.5">
                              <Flame className="w-2.5 h-2.5 fill-rose-400" />
                              Quente
                            </span>
                          )}
                        </div>
                      )}

                      {/* Snippet da última mensagem */}
                      <div className="flex items-center justify-between gap-2 mt-1">
                        <p className={`text-[11px] truncate flex-1 ${conv.naoLidasCount > 0 ? 'font-bold text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 dark:text-zinc-400'}`}>
                          {conv.ultimaMensagemDirecao === 'saida' && (
                            <span className="text-zinc-400 font-normal mr-1">Você:</span>
                          )}
                          {conv.ultimaMensagem}
                        </p>
                        
                        {conv.naoLidasCount > 0 && (
                          <span className="min-w-[18px] h-[18px] px-1 bg-emerald-500 text-zinc-950 font-extrabold text-[10px] rounded-full flex items-center justify-center shrink-0">
                            {conv.naoLidasCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Coluna Direita: Tela de Chat (8 colunas) */}
        <div className="lg:col-span-8 flex flex-col justify-between bg-zinc-50/20 dark:bg-zinc-950/40 relative">
          
          {activeConversa ? (
            <>
              {/* Top Bar do Chat */}
              <div className="p-3.5 sm:px-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-white dark:bg-zinc-900/90 backdrop-blur-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-700 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                    {activeConversa.nomeContato.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white truncate">
                        {activeConversa.nomeContato}
                      </h2>
                      {clienteVinculado && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 hidden sm:inline-block">
                          CRM Lead
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-mono mt-0.5">
                      <span className="text-emerald-500 flex items-center gap-1 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {activeConversa.telefone}
                      </span>
                      {negocioVinculado && (
                        <span className="text-zinc-400 hidden md:inline truncate">
                          • {negocioVinculado.titulo} ({ETAPAS_FUNIL_LABELS[negocioVinculado.etapaFunil]?.label})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Ações Rápidas do Top Bar (Link para CRM) */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    id="btn-abrir-negocio-crm"
                    onClick={() => setAbaAtiva('crm')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-cyan-950/80 hover:text-cyan-400 border border-zinc-200 dark:border-zinc-700/80 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-all cursor-pointer"
                    title="Ver no CRM Funil"
                  >
                    <Kanban className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Ver no CRM</span>
                  </button>
                </div>
              </div>

              {/* Área de Mensagens do Chat com Scroll Suave */}
              <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 max-h-[calc(100vh-380px)] min-h-[360px]">
                
                {/* Header de Segurança e Conexão */}
                <div className="flex justify-center">
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400 bg-white/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 rounded-xl max-w-md text-center flex items-center gap-1.5 shadow-2xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Mensagens sincronizadas em tempo real com a Cloud API oficial e banco de dados do MobPlan.</span>
                  </div>
                </div>

                {mensagensDaConversa.length === 0 ? (
                  <div className="text-center py-12 text-xs text-zinc-400">
                    Nenhuma mensagem enviada ou recebida nesta conversa ainda.
                  </div>
                ) : (
                  mensagensDaConversa.map((msg) => {
                    const isSaida = msg.direcao === 'saida';
                    const dateObj = new Date(msg.timestamp);
                    const horaFormatada = isNaN(dateObj.getTime())
                      ? ''
                      : dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

                    return (
                      <div 
                        key={msg.id} 
                        className={`flex ${isSaida ? 'justify-end' : 'justify-start'} animate-in fade-in duration-150`}
                      >
                        <div 
                          className={`max-w-[85%] sm:max-w-md rounded-2xl p-3.5 text-xs shadow-xs space-y-1 ${
                            isSaida 
                              ? 'bg-cyan-600 text-white rounded-br-none' 
                              : 'bg-white dark:bg-zinc-850 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-750 rounded-bl-none'
                          }`}
                        >
                          {/* Nome do autor se aplicável */}
                          {msg.autorNome && !isSaida && (
                            <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mb-0.5">
                              {msg.autorNome}
                            </div>
                          )}

                          {/* Conteúdo da Mensagem */}
                          <div className="leading-relaxed whitespace-pre-line text-[12px]">
                            {msg.texto}
                          </div>

                          {/* Footer da Bolha: Hora + Status Check */}
                          <div className={`text-[10px] flex items-center justify-end gap-1 pt-0.5 font-mono ${
                            isSaida ? 'text-cyan-200' : 'text-zinc-400'
                          }`}>
                            <span>{horaFormatada}</span>
                            {isSaida && (
                              <CheckCheck className="w-3.5 h-3.5 text-cyan-200" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Modelos Rápidos de Atendimento de Marcenaria (Templates) */}
              <div className="p-2 sm:px-4 bg-white/90 dark:bg-zinc-900/90 border-t border-zinc-200/80 dark:border-zinc-800/80">
                
                {/* Botão Sugerir Resposta IA */}
                <div className="pb-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleSuggestReply}
                    disabled={isSuggestingReply}
                    className="px-3 py-1 rounded-xl bg-cyan-600/10 hover:bg-cyan-600/20 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
                    <span>{isSuggestingReply ? 'Gerando sugestão...' : 'Sugerir Resposta (IA)'}</span>
                  </button>
                  <span className="text-[10px] text-zinc-400">A IA gera a sugestão, mas você edita antes de enviar</span>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-none">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider whitespace-nowrap pl-1 pr-1">
                    Modelos Rápidos:
                  </span>
                  {QUICK_TEMPLATES.map((tmpl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setMensagemTexto(tmpl.texto)}
                      className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-cyan-950 hover:text-cyan-400 hover:border-cyan-800/80 transition-colors border border-zinc-200 dark:border-zinc-700/60 cursor-pointer font-medium text-[11px]"
                    >
                      {tmpl.titulo}
                    </button>
                  ))}
                </div>

                {/* Input de Mensagem & Botão de Envio */}
                <form onSubmit={handleEnviarMensagem} className="pt-2 flex items-center gap-2">
                  <input
                    id="input-whatsapp-mensagem"
                    type="text"
                    value={mensagemTexto}
                    onChange={(e) => setMensagemTexto(e.target.value)}
                    placeholder={`Escreva uma mensagem para ${activeConversa.nomeContato}...`}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-cyan-500 transition-colors"
                  />

                  <button
                    id="btn-enviar-mensagem-whatsapp"
                    type="submit"
                    disabled={!mensagemTexto.trim() || isSending}
                    className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Enviar</span>
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center text-zinc-400 space-y-3">
              <MessageSquare className="w-12 h-12 text-zinc-500 opacity-40 stroke-1" />
              <h3 className="text-sm font-bold text-zinc-300">Nenhuma conversa selecionada</h3>
              <p className="text-xs text-zinc-500 max-w-sm">
                Selecione uma conversa ao lado para abrir o histórico de atendimento ou clique em &quot;Simular Novo Lead&quot; para receber uma mensagem de teste.
              </p>
            </div>
          )}

        </div>

      </div>

      {/* MODAL 1: Simulação de Recebimento de Mensagem (Geração Automática de Lead no CRM) */}
      {isSimuladorModalOpen && (
        <div className="fixed inset-0 bg-zinc-950/80 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl p-5 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    Simulador de Entrada de Mensagem WhatsApp
                  </h3>
                  <span className="text-[11px] text-zinc-500">
                    Testa a captura automática e criação de novo lead no CRM
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setIsSimuladorModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Número do Remetente (WhatsApp)
                </label>
                <input
                  type="text"
                  value={simuladorTelefone}
                  onChange={(e) => setSimuladorTelefone(e.target.value)}
                  placeholder="ex: (11) 98765-4321"
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 font-mono focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[10px] text-zinc-500 mt-1 block">
                  Se este número for novo, o MobPlan criará um cliente e negócio automaticamente na coluna &quot;Novo Lead&quot; do CRM.
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Nome do Contato (Opcional - Perfil WhatsApp)
                </label>
                <input
                  type="text"
                  value={simuladorNome}
                  onChange={(e) => setSimuladorNome(e.target.value)}
                  placeholder="ex: Mariana Siqueira"
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Texto da Mensagem Recebida
                </label>
                <textarea
                  rows={3}
                  value={simuladorTexto}
                  onChange={(e) => setSimuladorTexto(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Botões de Cenários Rápidos de Teste */}
              <div className="pt-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                  Cenários Rápidos de Teste:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSimuladorTelefone('(11) 94433-2211');
                      setSimuladorNome('Carlos Eduardo (Arquiteto)');
                      setSimuladorTexto('Olá MobPlan! Sou arquiteto e tenho um projeto de 180m² na Vila Madalena para cotar com vocês.');
                    }}
                    className="p-2 text-left rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-700/60 border border-zinc-200 dark:border-zinc-700 text-[11px] text-zinc-700 dark:text-zinc-300 transition-colors"
                  >
                    <span className="font-bold block text-cyan-400">Arquiteto Parceiro</span>
                    <span className="text-[10px] text-zinc-500 truncate block">Projeto 180m² Vila Madalena</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSimuladorTelefone('(11) 98122-3344'); // Número da Mariana Drummond (já no CRM)
                      setSimuladorNome('Mariana Drummond');
                      setSimuladorTexto('Oi Juliana! Conseguem adiantar a medição técnica para esta quinta-feira às 14h?');
                    }}
                    className="p-2 text-left rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-700/60 border border-zinc-200 dark:border-zinc-700 text-[11px] text-zinc-700 dark:text-zinc-300 transition-colors"
                  >
                    <span className="font-bold block text-emerald-400">Cliente Existente</span>
                    <span className="text-[10px] text-zinc-500 truncate block">Mariana (Cozinha Bela Cintra)</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setIsSimuladorModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleExecutarSimulacao}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Disparar Mensagem Recebida</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: Configuração da Meta Cloud API (WhatsApp Business Oficial) */}
      {isMetaModalOpen && (
        <div className="fixed inset-0 bg-zinc-950/80 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl p-5 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center">
                  <Settings2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    Configuração da Meta WhatsApp Cloud API
                  </h3>
                  <span className="text-[11px] text-zinc-500">
                    Credenciais para conexão direta com o WhatsApp Business Oficial da marcenaria
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setIsMetaModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSalvarMetaConfig} className="space-y-3.5">
              
              {/* Webhook URL & Verify Token (Para cadastrar no painel da Meta Developers) */}
              <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-2">
                <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 block">
                  1. Configuração do Webhook no Meta for Developers
                </span>
                
                <div className="space-y-1.5">
                  <div className="text-[10px] text-zinc-400">URL do Webhook (Endpoint do MobPlan):</div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={typeof window !== 'undefined' ? `${window.location.origin}/api/whatsapp/webhook` : '/api/whatsapp/webhook'}
                      className="flex-1 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs font-mono text-zinc-700 dark:text-zinc-300"
                    />
                    <button
                      type="button"
                      onClick={handleCopiarWebhook}
                      className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      {copiadoWebhook ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiadoWebhook ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="text-[10px] text-zinc-400">Token de Verificação (Verify Token):</div>
                  <input
                    type="text"
                    value={metaForm.verifyToken}
                    onChange={(e) => setMetaForm({ ...metaForm, verifyToken: e.target.value })}
                    className="w-full px-3 py-1.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs font-mono text-zinc-700 dark:text-zinc-300"
                  />
                </div>
              </div>

              {/* Credenciais da Meta Cloud API */}
              <div className="space-y-3">
                <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 block">
                  2. Credenciais de Acesso da Meta
                </span>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    Phone Number ID
                  </label>
                  <input
                    type="text"
                    value={metaForm.phoneNumberId}
                    onChange={(e) => setMetaForm({ ...metaForm, phoneNumberId: e.target.value })}
                    placeholder="ex: 104598234509823"
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    WhatsApp Business Account ID (WABA ID)
                  </label>
                  <input
                    type="text"
                    value={metaForm.wabaId}
                    onChange={(e) => setMetaForm({ ...metaForm, wabaId: e.target.value })}
                    placeholder="ex: 109823749823749"
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    Permanent Access Token (Bearer)
                  </label>
                  <input
                    type="password"
                    value={metaForm.accessToken}
                    onChange={(e) => setMetaForm({ ...metaForm, accessToken: e.target.value })}
                    placeholder="EAA..."
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="p-2.5 bg-cyan-950/40 border border-cyan-800/40 rounded-xl text-[11px] text-cyan-300 flex items-start gap-2">
                <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  Mesmo sem as chaves da Meta preenchidas neste momento, o sistema opera 100% funcional com envio simulado, criação automática de leads no CRM e sincronização de histórico.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsMetaModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  Fechar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Salvar Configurações
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
