'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  Bot, 
  User, 
  ExternalLink, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  RefreshCw,
  HelpCircle,
  MessageSquare
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export const CopilotoChatPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg_welcome',
      role: 'model',
      text: 'Olá! Sou o **Copiloto de IA do MobPlan**. Estou conectado em tempo real aos dados da sua marcenaria (CRM, contratos, produção, radar de prazos, financeiro e WhatsApp).\n\nComo posso ajudar na gestão da sua operação hoje?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const msgCounter = useRef(10);
  const { 
    empresaAtiva, 
    clientes, 
    negocios, 
    projetos, 
    contratos, 
    ordensProducao, 
    radaresPrazos, 
    contasReceber, 
    contasPagar, 
    ticketsAssistenca, 
    conversasWhatsApp,
    setAbaAtiva
  } = useApp();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const quickPrompts = [
    "Quais contratos estão atrasados no Radar?",
    "Quais negócios estão parados no funil do CRM?",
    "Qual é o balanço financeiro (Receber vs Pagar)?",
    "Existem chamados de assistência urgente?"
  ];

  const handleSend = async (textToSend?: string) => {
    const promptText = textToSend || input;
    if (!promptText.trim() || loading) return;

    msgCounter.current += 1;
    const userMsg: Message = {
      id: `usr_${msgCounter.current}`,
      role: 'user',
      text: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    // Preparar Snapshot de Contexto (RAG)
    const contextData = {
      empresa: empresaAtiva?.nomeFantasia || 'Empresa Padrão',
      estatisticasGerais: {
        totalClientes: clientes.length,
        totalNegocios: negocios.length,
        totalContratos: contratos.length,
        totalOrdensProducao: ordensProducao.length,
        totalChamadosAssistenca: ticketsAssistenca.length,
      },
      negocios: negocios.map(n => ({
        id: n.id,
        titulo: n.titulo,
        etapaFunil: n.etapaFunil,
        valorEstimado: n.valorEstimado,
        scoreLead: n.scoreLead,
        atualizadoEm: n.updatedAt
      })),
      contratos: contratos.map(c => ({
        id: c.id,
        numeroContrato: c.numeroContrato,
        valorTotal: c.valorTotal,
        statusAssinatura: c.statusAssinatura,
        dataPrevistaEntrega: c.dataPrevistaEntrega,
        prazoEntregaDias: c.prazoEntregaDias
      })),
      ordensProducao: ordensProducao.map(op => ({
        id: op.id,
        numeroOP: op.numeroOP,
        etapaAtual: op.etapaAtual,
        totalPecas: op.totalPecas,
        dataPrevisaoEntrega: op.dataPrevisaoEntrega
      })),
      radarPrazos: radaresPrazos.map(r => ({
        contratoId: r.contratoId,
        numeroContrato: r.numeroContrato,
        cliente: r.clienteNome,
        statusGeralAlerta: r.statusGeralAlerta,
        marcos: r.marcos.map(m => ({ nome: m.nome, statusMarco: m.statusMarco, dataLimite: m.dataLimitePrevista }))
      })),
      financeiro: {
        contasReceber: contasReceber.map(cr => ({ cliente: cr.clienteNome, valor: cr.valorLiquido, vencimento: cr.dataVencimento, status: cr.status })),
        contasPagar: contasPagar.map(cp => ({ descricao: cp.descricao, valor: cp.valor, vencimento: cp.dataVencimento, status: cp.status }))
      },
      assistencia: ticketsAssistenca.map(t => ({ contrato: t.contratoNumero, cliente: t.clienteNome, status: t.status, prioridade: t.prioridade, descricao: t.descricao })),
      whatsapp: conversasWhatsApp.map(cw => ({ telefone: cw.telefone, contato: cw.nomeContato, ultimaMsg: cw.ultimaMensagem, naoLidas: cw.naoLidasCount }))
    };

    // Histórico recente para o chat
    const history = messages.slice(-6).map(m => ({ role: m.role, text: m.text }));

    try {
      const res = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptText, contextData, history })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao consultar IA.');
      }

      msgCounter.current += 1;
      const modelMsg: Message = {
        id: `ai_${msgCounter.current}`,
        role: 'model',
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, modelMsg]);
    } catch (err: any) {
      msgCounter.current += 1;
      const errorMsg: Message = {
        id: `err_${msgCounter.current}`,
        role: 'model',
        text: `⚠️ **Erro de Comunicação**: ${err.message || 'Não foi possível conectar com o serviço de IA. Verifique a chave GEMINI_API_KEY nas configurações.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  // Parser para tags [Navegar: modulo]
  const renderMessageContent = (text: string) => {
    // Procurar por tags [Navegar: modulo]
    const navRegex = /\[Navegar:\s*([a-zA-Z-]+)\]/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = navRegex.exec(text)) !== null) {
      const matchIndex = match.index;
      if (matchIndex > lastIndex) {
        parts.push(text.substring(lastIndex, matchIndex));
      }
      const modulo = match[1].toLowerCase();
      const labels: Record<string, string> = {
        'crm': 'Abrir CRM & Funil',
        'contratos': 'Abrir Contratos',
        'projetos': 'Abrir Projetos',
        'producao': 'Abrir Produção',
        'montagem': 'Abrir Montagem',
        'whatsapp': 'Abrir WhatsApp',
        'financeiro': 'Abrir Financeiro',
        'pos-venda': 'Abrir Pós-Venda',
        'dashboard': 'Abrir Dashboard'
      };
      const label = labels[modulo] || `Abrir ${modulo}`;

      parts.push(
        <button
          key={`nav_${matchIndex}`}
          onClick={() => {
            setAbaAtiva(modulo);
            setIsOpen(false);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 my-1 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-medium rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          {label}
        </button>
      );
      lastIndex = navRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return (
      <div className="whitespace-pre-wrap leading-relaxed text-sm">
        {parts.length > 0 ? parts : text}
      </div>
    );
  };

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 ring-4 ring-cyan-500/20"
          title="Abrir Copiloto de IA"
        >
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full animate-pulse" />
          <Sparkles className="w-6 h-6 text-white group-hover:rotate-12 transition-transform duration-300" />
        </button>
      </div>

      {/* Slide-over Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col">
              
              {/* Header */}
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-gradient-to-r from-cyan-900/10 to-blue-900/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-zinc-900 dark:text-zinc-100 text-base flex items-center gap-2">
                      Copiloto IA MobPlan
                      <span className="text-[10px] bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 px-2 py-0.5 rounded-full font-medium border border-cyan-500/20">
                        Gemini 2.5
                      </span>
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Empresa: <span className="font-medium text-zinc-700 dark:text-zinc-300">{empresaAtiva?.nomeFantasia || 'Principal'}</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Prompt Chips */}
              <div className="px-4 py-3 bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto flex gap-2 shrink-0 scrollbar-none">
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(prompt)}
                    className="whitespace-nowrap px-3 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full text-xs text-zinc-600 dark:text-zinc-300 hover:border-cyan-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors shadow-xs"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      msg.role === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-cyan-600 text-white'
                    }`}>
                      {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>

                    <div className={`max-w-[82%] rounded-2xl px-4 py-3 shadow-xs ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 border border-zinc-200/60 dark:border-zinc-700/60 rounded-tl-none'
                    }`}>
                      {msg.role === 'user' ? (
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                      ) : (
                        renderMessageContent(msg.text)
                      )}
                      <span className={`block text-[10px] mt-1.5 text-right ${
                        msg.role === 'user' ? 'text-blue-200' : 'text-zinc-400'
                      }`}>
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-cyan-600 text-white flex items-center justify-center">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-zinc-100 dark:bg-zinc-800 rounded-2xl rounded-tl-none px-4 py-3 border border-zinc-200 dark:border-zinc-700 flex items-center gap-2">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" />
                      <span className="text-xs text-zinc-500 ml-1">Analisando dados da marcenaria...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Pergunte sobre contratos, leads, DRE ou prazos..."
                    className="flex-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="p-2.5 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white rounded-xl transition-colors cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
                <p className="text-[10px] text-center text-zinc-400 mt-2">
                  O Copiloto utiliza Gemini IA com contexto de dados RAG da empresa ativa.
                </p>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
};
