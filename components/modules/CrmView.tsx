'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Cliente, Negocio, EtapaFunil, ScoreLead, OrigemLead, SimulacaoNegociacao } from '@/types/database';
import { PromobImportTab } from './PromobImportTab';
import { NegotiationForecastPanel } from './NegotiationForecastPanel';
import { RenderProPresentationModal } from './RenderProPresentationModal';
import { criarContratoDeNegocio } from '@/lib/contractEngine';
import { 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  Building2, 
  DollarSign, 
  Flame, 
  Tag, 
  Trash2, 
  Edit3, 
  X, 
  CheckCircle2, 
  Calendar, 
  MessageSquare, 
  ArrowRight, 
  TrendingUp, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft,
  Filter,
  Send,
  FileCode,
  Layers,
  UploadCloud,
  Eye,
  CreditCard,
  Lock,
  Unlock,
  ShieldCheck,
  ShieldAlert,
  Receipt,
  FileSignature,
  ClipboardList,
  GripVertical,
  AlertTriangle
} from 'lucide-react';

const BRIEFING_CATEGORIAS = [
  {
    titulo: '1. Cômodos & Ambientes',
    itens: [
      { id: 'amb_coz', label: 'Cozinha (Ilha, torre quente, bancadas)' },
      { id: 'amb_closet', label: 'Closet / Dormitório com roupeiros' },
      { id: 'amb_banho', label: 'Banheiros / Lavabos (Gabinetes e espelhos)' },
      { id: 'amb_living', label: 'Living / Painel TV / Home Theater / Adega' },
      { id: 'amb_servico', label: 'Área de Serviço / Despensa / Roupeiro técnico' },
      { id: 'amb_escritorio', label: 'Home Office / Estante / Boiserie / Painéis' }
    ]
  },
  {
    titulo: '2. Eletrodomésticos & Equipamentos',
    itens: [
      { id: 'ele_geladeira', label: 'Geladeira (Side by Side / French Door / Embutida)' },
      { id: 'ele_forno_micro', label: 'Forno elétrico e Micro-ondas (Embutir)' },
      { id: 'ele_cook_coifa', label: 'Cooktop (Indução/Gás) e Coifa (Ilha/Parede)' },
      { id: 'ele_lavadora', label: 'Lava-louças e Lavadora/Secadora' },
      { id: 'ele_adega_cervejeira', label: 'Adega climatizada / Cervejeira / Cervejeira embutida' },
      { id: 'ele_tv', label: 'TV (Polegadas e rotação/suporte)' }
    ]
  },
  {
    titulo: '3. Ferragens & Movimentação',
    itens: [
      { id: 'fer_dobradica', label: 'Dobradiças slow-motion (Blum / Hettich)' },
      { id: 'fer_corredica', label: 'Corrediças invisíveis slow-motion / touch-load' },
      { id: 'fer_basculante', label: 'Basculantes (Aventos HF / HK / HL)' },
      { id: 'fer_gaveta', label: 'Gavetões metálicos (Metalbox / Legrabox)' },
      { id: 'fer_iluminacao', label: 'Iluminação LED embutida com perfil e sensor' }
    ]
  },
  {
    titulo: '4. Materiais & Acabamentos',
    itens: [
      { id: 'mat_mdf', label: 'Padrão de MDF (Madeirado texturizado, Liso)' },
      { id: 'mat_laca', label: 'Laca (Fosca ou Brilho de alto padrão)' },
      { id: 'mat_vidro', label: 'Vidros (Reflecta bronze/fumê, Canelado, Acidato)' },
      { id: 'mat_perfil', label: 'Perfis de alumínio (Gold, Preto, Champagne, Cobre)' },
      { id: 'mat_puxador', label: 'Puxadores (Cava fresada, Perfil embutido, Ponto)' }
    ]
  },
  {
    titulo: '5. Infraestrutura & Prazos',
    itens: [
      { id: 'inf_paredes', label: 'Paredes verificadas (Alvenaria / Drywall com reforço estrutural)' },
      { id: 'inf_pontos', label: 'Pontos de elétrica, hidráulica e gás conferidos no local' },
      { id: 'inf_esquadro', label: 'Nivelamento de piso e esquadro das paredes' },
      { id: 'inf_prazo', label: 'Prazo desejado de entrega e mudança do cliente' },
      { id: 'inf_orcamento', label: 'Expectativa de investimento / Faixa de orçamento alinhada' }
    ]
  }
];

const ETAPAS: { id: EtapaFunil; label: string; color: string }[] = [
  { id: 'contato_inicial', label: 'Contato Inicial', color: 'border-zinc-300 dark:border-zinc-700' },
  { id: 'briefing_medicao', label: 'Briefing / Medição', color: 'border-blue-400' },
  { id: 'projeto_3d', label: 'Projeto 3D', color: 'border-indigo-400' },
  { id: 'apresentacao_orcamento', label: 'Apres. Orçamento', color: 'border-amber-400' },
  { id: 'negociacao', label: 'Negociação', color: 'border-orange-400' },
  { id: 'fechado_ganho', label: 'Fechado (Ganho)', color: 'border-emerald-500' },
];

export const CrmView: React.FC = () => {
  const { 
    clientes, 
    negocios, 
    projetos,
    contratos,
    criarContrato,
    criarCliente, 
    criarNegocio, 
    editarNegocio, 
    excluirCliente, 
    excluirNegocio, 
    empresaAtiva, 
    setAbaAtiva,
    mensagensWhatsApp,
    enviarMensagemWhatsApp,
    abrirConversaWhatsApp,
    ticketsAssistenca
  } = useApp();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const [selectedNegocioModal, setSelectedNegocioModal] = useState<Negocio | null>(null);
  const [modalAbaAtiva, setModalAbaAtiva] = useState<'geral' | 'projeto' | 'previsao' | 'assistencia' | 'briefing'>('geral');
  const [isRenderProModalOpen, setIsRenderProModalOpen] = useState<boolean>(false);
  const [negocioParaRenderPro, setNegocioParaRenderPro] = useState<Negocio | null>(null);
  const [viewMode, setViewMode] = useState<'funil' | 'lista'>('funil');
  const [selectedBriefingNegocioId, setSelectedBriefingNegocioId] = useState<string>('');
  const [filtroScore, setFiltroScore] = useState<string>('todos');
  const [quickWhatsAppReply, setQuickWhatsAppReply] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);

  // Drag and Drop & Modals State
  const [draggedNegocioId, setDraggedNegocioId] = useState<string | null>(null);
  const [dragOverStageId, setDragOverStageId] = useState<EtapaFunil | null>(null);
  const [clienteParaExcluir, setClienteParaExcluir] = useState<Cliente | null>(null);
  const [negocioParaExcluir, setNegocioParaExcluir] = useState<Negocio | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  const kanbanScrollRef = React.useRef<HTMLDivElement>(null);

  const scrollKanban = (direction: 'left' | 'right') => {
    if (kanbanScrollRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      kanbanScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Form states
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [cidade, setCidade] = useState(empresaAtiva?.cidade || 'São Paulo');
  const [bairro, setBairro] = useState('');
  const [origem, setOrigem] = useState<OrigemLead>('instagram');
  const [tituloNegocio, setTituloNegocio] = useState('');
  const [valor, setValor] = useState('');
  const [score, setScore] = useState<ScoreLead>('quente');
  const [etapa, setEtapa] = useState<EtapaFunil>('contato_inicial');

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome) return;

    const novoCliente = criarCliente({
      nome,
      email: email || `${nome.toLowerCase().replace(/\s+/g, '.')}@email.com`,
      telefone: telefone || '(11) 98765-4321',
      whatsapp: telefone || '(11) 98765-4321',
      cpfCnpj: '000.000.000-00',
      origemLead: origem,
      status: 'novo',
      endereco: {
        logradouro: 'Rua Principal',
        numero: '100',
        bairro: bairro || 'Jardins',
        cidade: cidade || 'São Paulo',
        uf: 'SP',
        cep: '01400-000',
      },
    });

    if (tituloNegocio) {
      criarNegocio({
        clienteId: novoCliente.id,
        titulo: tituloNegocio,
        etapaFunil: etapa,
        valorEstimado: Number(valor) || 0,
        scoreLead: score,
      });
    }

    setIsNewLeadModalOpen(false);
    setNome('');
    setTelefone('');
    setEmail('');
    setTituloNegocio('');
    setValor('');
  };

  const [isAnalyzingAiId, setIsAnalyzingAiId] = useState<string | null>(null);

  const handleRunAiAnalysis = async (neg: Negocio) => {
    setIsAnalyzingAiId(neg.id);
    try {
      const cli = clientes.find(c => c.id === neg.clienteId);
      const mClient = mensagensWhatsApp.filter(m => {
        const mNorm = m.telefone.replace(/\D/g, '');
        const cFone = (cli?.whatsapp || cli?.telefone || '').replace(/\D/g, '');
        return m.clienteId === cli?.id || (cFone && mNorm && (cFone === mNorm || cFone.endsWith(mNorm) || mNorm.endsWith(cFone)));
      });

      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'crm-analysis',
          payload: { negocio: neg, cliente: cli, mensagensWhatsApp: mClient }
        })
      });
      const data = await res.json();
      if (data.aiScore !== undefined) {
        editarNegocio(neg.id, {
          aiScore: Number(data.aiScore),
          aiSuggestedNextStep: data.aiSuggestedNextStep
        });
      }
    } catch (err) {
      console.error("Erro ao analisar lead com IA:", err);
    } finally {
      setIsAnalyzingAiId(null);
    }
  };

  const handleAvancarEtapa = (negocio: Negocio) => {
    const etapasOrdem: EtapaFunil[] = ['contato_inicial', 'briefing_medicao', 'projeto_3d', 'apresentacao_orcamento', 'negociacao', 'fechado_ganho'];
    const currentIndex = etapasOrdem.indexOf(negocio.etapaFunil);
    if (currentIndex < etapasOrdem.length - 1) {
      const proximaEtapa = etapasOrdem[currentIndex + 1];
      editarNegocio(negocio.id, { etapaFunil: proximaEtapa });
    }
  };

  const handleRecuarEtapa = (negocio: Negocio) => {
    const etapasOrdem: EtapaFunil[] = ['contato_inicial', 'briefing_medicao', 'projeto_3d', 'apresentacao_orcamento', 'negociacao', 'fechado_ganho'];
    const currentIndex = etapasOrdem.indexOf(negocio.etapaFunil);
    if (currentIndex > 0) {
      const etapaAnterior = etapasOrdem[currentIndex - 1];
      editarNegocio(negocio.id, { etapaFunil: etapaAnterior });
    }
  };

  const filteredClientes = clientes.filter(c => 
    c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.telefone.includes(searchTerm)
  );

  const totalPipelineValor = negocios.reduce((acc, n) => acc + (n.valorEstimado || 0), 0);

  return (
    <div id="crm-view" className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-800/60">
              PIPELINE DE VENDAS
            </span>
            <span className="text-xs text-zinc-400">•</span>
            <span className="text-xs font-semibold text-zinc-400">
              Pipeline Total: <strong className="text-emerald-400 font-mono">{totalPipelineValor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white mt-1">
            CRM de Clientes & Oportunidades
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Gestão de funil de vendas, medição técnica e qualificação de clientes de alto padrão.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold">
            <button
              onClick={() => setViewMode('funil')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'funil' 
                  ? 'bg-white dark:bg-zinc-800 text-cyan-600 dark:text-cyan-400 shadow-2xs' 
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              Funil Kanban
            </button>
            <button
              onClick={() => setViewMode('lista')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'lista' 
                  ? 'bg-white dark:bg-zinc-800 text-cyan-600 dark:text-cyan-400 shadow-2xs' 
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              Lista ({clientes.length})
            </button>
          </div>

          <button
            id="btn-novo-lead"
            onClick={() => setIsNewLeadModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-sm cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Lead / Negócio</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar with Kanban Scroll Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por cliente, telefone, projeto..."
            className="w-full pl-10 pr-4 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 text-xs text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end overflow-x-auto text-xs">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Temperatura:
            </span>
            {['todos', 'quente', 'morno', 'frio'].map((sc) => (
              <button
                key={sc}
                onClick={() => setFiltroScore(sc)}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer capitalize ${
                  filtroScore === sc
                    ? 'bg-zinc-800 text-cyan-400 border border-zinc-700'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                }`}
              >
                {sc}
              </button>
            ))}
          </div>

          {viewMode === 'funil' && (
            <div className="flex items-center gap-1 pl-2 border-l border-zinc-200 dark:border-zinc-800 shrink-0">
              <button
                type="button"
                onClick={() => scrollKanban('left')}
                className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
                title="Rolar etapas para a esquerda"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollKanban('right')}
                className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
                title="Rolar etapas para a direita"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Kanban View (Colunas Lado a Lado com Drag and Drop Fluido) */}
      {viewMode === 'funil' && (
        <div 
          ref={kanbanScrollRef}
          className="flex gap-4 overflow-x-auto pb-4 pt-1 w-full items-start scroll-smooth"
        >
          {ETAPAS.map((etapaCol, index) => {
            const negociosNaEtapa = negocios
              .filter(n => n.etapaFunil === etapaCol.id)
              .filter(n => filtroScore === 'todos' || n.scoreLead === filtroScore);
            
            const totalValor = negociosNaEtapa.reduce((acc, n) => acc + (n.valorEstimado || 0), 0);
            const isColumnDropActive = dragOverStageId === etapaCol.id;

            return (
              <div
                key={etapaCol.id}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  if (dragOverStageId !== etapaCol.id) {
                    setDragOverStageId(etapaCol.id);
                  }
                }}
                onDragEnter={(e) => {
                  e.preventDefault();
                  if (dragOverStageId !== etapaCol.id) {
                    setDragOverStageId(etapaCol.id);
                  }
                }}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    if (dragOverStageId === etapaCol.id) {
                      setDragOverStageId(null);
                    }
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const droppedId = e.dataTransfer.getData('text/plain') || draggedNegocioId;
                  if (droppedId) {
                    const targetNeg = negocios.find(n => n.id === droppedId);
                    if (targetNeg && targetNeg.etapaFunil !== etapaCol.id) {
                      editarNegocio(droppedId, { etapaFunil: etapaCol.id });
                      showToast(`"${targetNeg.titulo}" movido para "${etapaCol.label}" com sucesso!`);
                    }
                  }
                  setDraggedNegocioId(null);
                  setDragOverStageId(null);
                }}
                className={`w-80 shrink-0 bg-zinc-50/90 dark:bg-zinc-900/80 border rounded-2xl p-3.5 flex flex-col shadow-2xs transition-all ${
                  isColumnDropActive
                    ? 'border-cyan-500 ring-2 ring-cyan-500/40 bg-cyan-500/5 dark:bg-cyan-950/30'
                    : 'border-zinc-200/90 dark:border-zinc-800/90 hover:border-zinc-700/80'
                }`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-zinc-200/80 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${etapaCol.id === 'fechado_ganho' ? 'bg-emerald-400 animate-pulse' : 'bg-cyan-400'}`} />
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                      {etapaCol.label}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono">
                    {negociosNaEtapa.length}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-zinc-500 mb-3 px-1 font-mono">
                  <span className="text-[10px] uppercase font-sans text-zinc-400">Total:</span>
                  <span className="font-semibold text-zinc-300">
                    {totalValor > 0 ? totalValor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00'}
                  </span>
                </div>

                {isColumnDropActive && (
                  <div className="mb-2 py-2 px-3 border border-dashed border-cyan-500 rounded-xl bg-cyan-500/10 text-cyan-400 text-[11px] font-bold text-center flex items-center justify-center gap-1.5 animate-pulse">
                    <span>Solte para mover para {etapaCol.label}</span>
                  </div>
                )}

                {/* Cards List */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-320px)] pr-1">
                  {negociosNaEtapa.map((neg) => {
                    const cli = clientes.find(c => c.id === neg.clienteId);
                    const isDraggingThis = draggedNegocioId === neg.id;

                    return (
                      <div
                        key={neg.id}
                        draggable={true}
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', neg.id);
                          e.dataTransfer.effectAllowed = 'move';
                          setDraggedNegocioId(neg.id);
                        }}
                        onDragEnd={() => {
                          setDraggedNegocioId(null);
                          setDragOverStageId(null);
                        }}
                        className={`p-3.5 bg-white dark:bg-zinc-800/90 border rounded-xl shadow-2xs transition-all space-y-2.5 group cursor-grab active:cursor-grabbing ${
                          isDraggingThis 
                            ? 'opacity-40 border-dashed border-cyan-500 scale-[0.98]' 
                            : 'border-zinc-200/80 dark:border-zinc-700/80 hover:border-cyan-500/60 hover:shadow-xs'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1.5">
                          <div className="flex items-start gap-1.5 flex-1 min-w-0">
                            <GripVertical className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5 opacity-60 group-hover:opacity-100" />
                            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-snug truncate">
                              {neg.titulo}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setNegocioParaExcluir(neg);
                            }}
                            className="text-zinc-400 hover:text-rose-500 transition-colors p-1 rounded hover:bg-rose-500/10 cursor-pointer opacity-70 group-hover:opacity-100"
                            title="Excluir negócio e cliente"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {cli && (
                          <div className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50 p-2 rounded-lg border border-zinc-100 dark:border-zinc-800/60">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedNegocioModal(neg);
                                setModalAbaAtiva(neg.etapaFunil === 'briefing_medicao' ? 'briefing' : 'geral');
                              }}
                              className="font-semibold text-zinc-700 dark:text-zinc-200 truncate hover:text-cyan-400 text-left cursor-pointer"
                            >
                              {cli.nome}
                            </button>
                            <button
                              type="button"
                              onClick={() => abrirConversaWhatsApp(cli.whatsapp || cli.telefone)}
                              className="text-emerald-500 hover:text-emerald-400 transition-colors p-1 rounded hover:bg-emerald-950/40 cursor-pointer"
                              title="Abrir no WhatsApp"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        {/* Indicador de Projeto Promob & Previsão */}
                        <div className="space-y-1">
                          {(() => {
                            const proj = projetos.find(p => p.negocioId === neg.id);
                            if (proj) {
                              return (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedNegocioModal(neg);
                                    setModalAbaAtiva('projeto');
                                  }}
                                  className="w-full py-1 px-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-cyan-700 dark:text-cyan-300 text-[10px] font-bold flex items-center justify-between transition-colors cursor-pointer"
                                >
                                  <span className="flex items-center gap-1">
                                    <Layers className="w-3 h-3 text-cyan-500" />
                                    <span className="truncate">{proj.nomeAmbiente}</span>
                                  </span>
                                  <span className="font-mono text-[9px] bg-cyan-500/20 px-1 py-0.2 rounded">
                                    {proj.softwareOrigem.toUpperCase()}
                                  </span>
                                </button>
                              );
                            }
                            return (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedNegocioModal(neg);
                                  setModalAbaAtiva('projeto');
                                }}
                                className="w-full py-1 px-2 rounded-lg bg-zinc-100 dark:bg-zinc-800/60 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-[10px] font-semibold flex items-center justify-center gap-1 border border-dashed border-zinc-300 dark:border-zinc-700 transition-colors cursor-pointer"
                              >
                                <FileCode className="w-3 h-3 text-zinc-400" />
                                <span>+ Importar Promob</span>
                              </button>
                            );
                          })()}

                          {/* Ações Rápidas: Previsão de Margem e Render Pro */}
                          <div className="grid grid-cols-2 gap-1 pt-0.5">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedNegocioModal(neg);
                                setModalAbaAtiva('previsao');
                              }}
                              className="py-1 px-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                              title="Calcular Margem e VPL ao Vivo"
                            >
                              <Eye className="w-3 h-3 text-emerald-500" />
                              <span>Previsão</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setNegocioParaRenderPro(neg);
                                setIsRenderProModalOpen(true);
                              }}
                              className="py-1 px-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                              title="Abrir Apresentação Comercial Render Pro"
                            >
                              <Sparkles className="w-3 h-3 text-indigo-500" />
                              <span>Render Pro</span>
                            </button>
                          </div>

                          {/* Briefing Marcenaria Direct Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedNegocioModal(neg);
                              setModalAbaAtiva('briefing');
                            }}
                            className="w-full py-1 px-2 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold flex items-center justify-between transition-all cursor-pointer"
                            title="Abrir Briefing & Checklist de Medição"
                          >
                            <span className="flex items-center gap-1.5">
                              <ClipboardList className="w-3.5 h-3.5 text-indigo-500" />
                              <span>Briefing Marcenaria</span>
                            </span>
                            <span className="font-mono text-[9px] bg-indigo-500/20 px-1.5 py-0.2 rounded text-indigo-600 dark:text-indigo-300">
                              {Object.values(neg.briefingData?.checked || {}).filter(Boolean).length}/26
                            </span>
                          </button>
                        </div>

                        {/* AI Score & Suggested Next Step */}
                        <div className="p-2 rounded-xl bg-cyan-500/5 dark:bg-cyan-500/10 border border-cyan-500/20 space-y-1">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-cyan-500" />
                              Score IA: {neg.aiScore !== undefined ? `${neg.aiScore}/100` : 'Pendente'}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRunAiAnalysis(neg);
                              }}
                              disabled={isAnalyzingAiId === neg.id}
                              className="px-2 py-0.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[9px] cursor-pointer disabled:opacity-50"
                            >
                              {isAnalyzingAiId === neg.id ? 'Analisando...' : 'Atualizar IA'}
                            </button>
                          </div>
                          {neg.aiSuggestedNextStep && (
                            <p className="text-[10px] text-zinc-600 dark:text-zinc-300 font-medium leading-tight">
                              💡 Próximo passo: <span className="italic">{neg.aiSuggestedNextStep}</span>
                            </p>
                          )}
                        </div>

                        {/* Valor & Status */}
                        <div 
                          onClick={() => {
                            setSelectedNegocioModal(neg);
                            setModalAbaAtiva(neg.etapaFunil === 'briefing_medicao' ? 'briefing' : 'geral');
                          }}
                          className="flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-700/60 text-[11px] cursor-pointer"
                        >
                          <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-xs">
                            {neg.valorEstimado ? neg.valorEstimado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'A calcular'}
                          </span>
                          <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                            neg.scoreLead === 'quente' 
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' 
                              : neg.scoreLead === 'morno'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                              : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                          }`}>
                            {neg.scoreLead}
                          </span>
                        </div>

                        {/* Seletor Rápido de Etapa + Botões Avançar/Voltar */}
                        <div className="space-y-1.5 pt-1">
                          <div className="flex items-center gap-1 text-[10px]">
                            <select
                              value={neg.etapaFunil}
                              onChange={(e) => {
                                const novaEtapa = e.target.value as EtapaFunil;
                                editarNegocio(neg.id, { etapaFunil: novaEtapa });
                                showToast(`Etapa alterada para "${ETAPAS.find(et => et.id === novaEtapa)?.label}"`);
                              }}
                              className="w-full px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-[10px] font-semibold text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
                            >
                              {ETAPAS.map((et) => (
                                <option key={et.id} value={et.id}>
                                  Mudar para: {et.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {index > 0 && (
                              <button
                                type="button"
                                onClick={() => handleRecuarEtapa(neg)}
                                className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-700/60 hover:bg-zinc-200 dark:hover:bg-zinc-600 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
                                title="Voltar etapa anterior"
                              >
                                <ChevronLeft className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {etapaCol.id !== 'fechado_ganho' ? (
                              <button
                                type="button"
                                onClick={() => handleAvancarEtapa(neg)}
                                className="flex-1 py-1.5 px-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-700/60 hover:bg-cyan-600 hover:text-white text-zinc-700 dark:text-zinc-200 text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                              >
                                <span>Avançar Etapa</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <div className="flex-1 py-1 px-2 rounded-lg bg-emerald-950/40 text-emerald-400 border border-emerald-800/50 text-[10px] font-bold flex items-center justify-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Venda Conquistada</span>
                              </div>
                            )}
                          </div>
                        </div>

                      </div>
                    );
                  })}

                  {negociosNaEtapa.length === 0 && (
                    <div className="py-8 text-center text-[11px] text-zinc-500 border border-dashed border-zinc-200 dark:border-zinc-800/80 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/30">
                      Arraste um lead para cá ou crie um novo
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === 'lista' && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200/80 dark:border-zinc-800 text-zinc-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Contato</th>
                  <th className="px-4 py-3">Localização</th>
                  <th className="px-4 py-3">Origem</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                {filteredClientes.map((c) => (
                  <tr key={c.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="px-4 py-3 font-semibold text-zinc-800 dark:text-zinc-100">
                      {c.nome}
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">
                      <div>{c.telefone}</div>
                      <div className="text-[11px] text-zinc-400">{c.email}</div>
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">
                      {c.endereco?.bairro || 'Jardins'}, {c.endereco?.cidade || 'SP'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="capitalize px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-[11px] font-mono">
                        {c.origemLead}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="capitalize px-2 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 text-[11px] font-bold">
                        {c.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setClienteParaExcluir(c)}
                        className="text-zinc-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Excluir cliente e dados vinculados"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}



      {/* Modal Novo Lead */}
      {isNewLeadModalOpen && (
        <div className="fixed inset-0 bg-zinc-950/70 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                Cadastrar Novo Lead & Oportunidade
              </h3>
              <button onClick={() => setIsNewLeadModalOpen(false)} className="text-zinc-400 hover:text-zinc-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Nome Completo do Cliente *
                </label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Beatriz Albuquerque"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Telefone / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="(11) 98765-4321"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Origem do Lead
                  </label>
                  <select
                    value={origem}
                    onChange={(e) => setOrigem(e.target.value as OrigemLead)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="instagram">Instagram</option>
                    <option value="indicacao">Indicação</option>
                    <option value="loja_fisica">Loja Física</option>
                    <option value="arquiteto">Arquiteto / Parceria</option>
                    <option value="google">Google</option>
                    <option value="site">Site / Formulário</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Título do Negócio / Ambientes
                </label>
                <input
                  type="text"
                  value={tituloNegocio}
                  onChange={(e) => setTituloNegocio(e.target.value)}
                  placeholder="Ex: Cozinha Integrada + Área Gourmet"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Valor Estimado (R$)
                  </label>
                  <input
                    type="number"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    placeholder="Opcional (ex: 0 ou em branco)"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Temperatura do Lead
                  </label>
                  <select
                    value={score}
                    onChange={(e) => setScore(e.target.value as ScoreLead)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="quente">Quente (Decisão Imediata)</option>
                    <option value="morno">Morno (Em cotação)</option>
                    <option value="frio">Frio (Início de obra)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsNewLeadModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold cursor-pointer transition-colors"
                >
                  Salvar Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Detalhes do Negócio / Lead & Projeto Promob & Histórico de WhatsApp */}
      {selectedNegocioModal && (() => {
        const clienteAtual = clientes.find(c => c.id === selectedNegocioModal.clienteId);
        const foneCliente = clienteAtual?.whatsapp || clienteAtual?.telefone || '';
        const normFone = foneCliente.replace(/\D/g, '');
        const projetoAssociado = projetos.find(p => p.negocioId === selectedNegocioModal.id);
        
        const mensagensCliente = mensagensWhatsApp.filter(m => {
          const mNorm = m.telefone.replace(/\D/g, '');
          return (m.clienteId && m.clienteId === clienteAtual?.id) ||
                 (normFone && mNorm && (normFone === mNorm || (normFone.length >= 8 && mNorm.length >= 8 && (normFone.endsWith(mNorm) || mNorm.endsWith(normFone)))));
        }).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

        const handleSendQuickReply = async (e: React.FormEvent) => {
          e.preventDefault();
          if (!quickWhatsAppReply.trim() || !foneCliente) return;

          const texto = quickWhatsAppReply.trim();
          setQuickWhatsAppReply('');
          setIsSendingReply(true);
          try {
            await enviarMensagemWhatsApp(foneCliente, texto, clienteAtual?.id, selectedNegocioModal.id);
          } finally {
            setIsSendingReply(false);
          }
        };

        return (
          <div className="fixed inset-0 bg-zinc-950/80 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs animate-in fade-in duration-150">
            <div className={`bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full ${
              modalAbaAtiva === 'projeto' || modalAbaAtiva === 'previsao' ? 'max-w-5xl' : 'max-w-2xl'
            } overflow-hidden shadow-2xl flex flex-col max-h-[92vh] transition-all duration-200`}>
              
              {/* Header do Modal */}
              <div className="p-4 sm:px-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/60 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                      {clienteAtual ? clienteAtual.nome.charAt(0) : 'N'}
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <span>{selectedNegocioModal.titulo}</span>
                        {projetoAssociado && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
                            PROMOB CONECTADO
                          </span>
                        )}
                        {selectedNegocioModal.simulacaoNegociacao && (
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                            selectedNegocioModal.simulacaoNegociacao.margemAprovada
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                              : 'bg-rose-500/10 text-rose-500 border border-rose-500/30'
                          }`}>
                            Margem: {selectedNegocioModal.simulacaoNegociacao.margemLiquidaPercent}%
                          </span>
                        )}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5">
                        <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                          {clienteAtual?.nome || 'Lead s/ cliente'}
                        </span>
                        {clienteAtual?.origemLead && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 capitalize">
                            Origem: {clienteAtual.origemLead}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setNegocioParaRenderPro(selectedNegocioModal);
                        setIsRenderProModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Render Pro</span>
                    </button>

                    <button
                      onClick={() => setSelectedNegocioModal(null)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Abas do Modal */}
                <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pt-1 -mb-3 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setModalAbaAtiva('geral')}
                    className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
                      modalAbaAtiva === 'geral'
                        ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                        : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Visão Geral & WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setModalAbaAtiva('projeto')}
                    className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
                      modalAbaAtiva === 'projeto'
                        ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                        : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                    }`}
                  >
                    <FileCode className="w-3.5 h-3.5" />
                    <span>Projeto & Orçamento Promob</span>
                    {projetoAssociado?.custoTotalPromob ? (
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-500 font-mono font-bold">
                        {projetoAssociado.custoTotalPromob.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    ) : (
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-500 font-bold">
                        Importar
                      </span>
                    )}
                  </button>

                  {/* ABA: Previsão & Margem ao Vivo */}
                  <button
                    type="button"
                    onClick={() => setModalAbaAtiva('previsao')}
                    className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
                      modalAbaAtiva === 'previsao'
                        ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                        : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Previsão & Margem ao Vivo</span>
                    {selectedNegocioModal.simulacaoNegociacao?.margemLiquidaPercent ? (
                      <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                        selectedNegocioModal.simulacaoNegociacao.margemAprovada
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {selectedNegocioModal.simulacaoNegociacao.margemLiquidaPercent}%
                      </span>
                    ) : (
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-400 font-mono font-bold">
                        VPL / DRE
                      </span>
                    )}
                  </button>

                  {/* ABA: Briefing Marcenaria */}
                  <button
                    type="button"
                    onClick={() => setModalAbaAtiva('briefing')}
                    className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
                      modalAbaAtiva === 'briefing'
                        ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                        : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                    }`}
                  >
                    <ClipboardList className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Briefing Marcenaria</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-indigo-500/10 text-indigo-400 font-mono font-bold">
                      {Object.values(selectedNegocioModal.briefingData?.checked || {}).filter(Boolean).length}/26
                    </span>
                  </button>

                  {/* ABA: Assistência Técnica & Garantia */}
                  <button
                    type="button"
                    onClick={() => setModalAbaAtiva('assistencia')}
                    className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
                      modalAbaAtiva === 'assistencia'
                        ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                        : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                    }`}
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                    <span>Assistência & Garantia</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-400 font-mono font-bold">
                      {ticketsAssistenca.filter(t => t.clienteId === clienteAtual?.id).length}
                    </span>
                  </button>
                </div>
              </div>

              {/* Corpo do Modal: Alterna entre Geral, Projeto Promob, Briefing, Previsão de Margem e Assistência */}
              <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
                
                {modalAbaAtiva === 'projeto' ? (
                  <PromobImportTab negocio={selectedNegocioModal} />
                ) : modalAbaAtiva === 'briefing' ? (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-zinc-200 dark:border-zinc-800">
                      <div>
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                          <ClipboardList className="w-4 h-4 text-indigo-500" />
                          <span>Briefing Técnico & Comercial para Marcenaria de Alto Padrão</span>
                        </h4>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          Checklist de medição in-loco, especificação exata de materiais (marcas/padrões) e medidas de eletrodomésticos.
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/25">
                          {Object.values(selectedNegocioModal.briefingData?.checked || {}).filter(Boolean).length} / 26 Itens Checados
                        </span>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {/* BLOCO 1: ESPECIFICAÇÃO DE MATERIAIS & MARCAS */}
                      <div className="p-4 rounded-xl bg-indigo-500/5 dark:bg-indigo-950/20 border border-indigo-500/20 space-y-3">
                        <h5 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                          <span>🎨 Padrões, Marcas & Acabamentos do Projeto</span>
                        </h5>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          Ex: Cor da caixa (Cerejeira natural marca Berneck), Portas (MDF Areia marca Guararapes), etc.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          <div>
                            <label className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 block mb-1">
                              Caixa / Corpo (MDF/BP/Laca) & Marca
                            </label>
                            <input
                              type="text"
                              value={selectedNegocioModal.briefingData?.materiais?.caixaMdf || ''}
                              placeholder="Ex: Cerejeira Natural - Berneck"
                              onChange={(e) => {
                                const mats = { ...(selectedNegocioModal.briefingData?.materiais || {}), caixaMdf: e.target.value };
                                const updatedBriefing = { ...(selectedNegocioModal.briefingData || {}), materiais: mats };
                                const updatedNegocio = { ...selectedNegocioModal, briefingData: updatedBriefing };
                                setSelectedNegocioModal(updatedNegocio);
                                editarNegocio(selectedNegocioModal.id, { briefingData: updatedBriefing });
                              }}
                              className="w-full text-xs px-3 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 block mb-1">
                              Portas / Frentes & Marca
                            </label>
                            <input
                              type="text"
                              value={selectedNegocioModal.briefingData?.materiais?.portasMdf || ''}
                              placeholder="Ex: MDF Areia / Laca - Guararapes"
                              onChange={(e) => {
                                const mats = { ...(selectedNegocioModal.briefingData?.materiais || {}), portasMdf: e.target.value };
                                const updatedBriefing = { ...(selectedNegocioModal.briefingData || {}), materiais: mats };
                                const updatedNegocio = { ...selectedNegocioModal, briefingData: updatedBriefing };
                                setSelectedNegocioModal(updatedNegocio);
                                editarNegocio(selectedNegocioModal.id, { briefingData: updatedBriefing });
                              }}
                              className="w-full text-xs px-3 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 block mb-1">
                              Acabamento Geral & Puxadores / Perfis
                            </label>
                            <input
                              type="text"
                              value={selectedNegocioModal.briefingData?.materiais?.acabamentoGeral || ''}
                              placeholder="Ex: Puxador Cava / Perfil Ouro Gold"
                              onChange={(e) => {
                                const mats = { ...(selectedNegocioModal.briefingData?.materiais || {}), acabamentoGeral: e.target.value };
                                const updatedBriefing = { ...(selectedNegocioModal.briefingData || {}), materiais: mats };
                                const updatedNegocio = { ...selectedNegocioModal, briefingData: updatedBriefing };
                                setSelectedNegocioModal(updatedNegocio);
                                editarNegocio(selectedNegocioModal.id, { briefingData: updatedBriefing });
                              }}
                              className="w-full text-xs px-3 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* BLOCO 2: MEDIDAS DE ELETRODOMÉSTICOS & EQUIPAMENTOS */}
                      <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                              ⚡ Medidas de Eletrodomésticos & Embutidos
                            </h5>
                            <p className="text-[11px] text-zinc-500">
                              Registre largura, altura e profundidade de geladeiras, fornos, cooktops, adegas por ambiente.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const eletrosAtuais = selectedNegocioModal.briefingData?.medidasEletros || [];
                              const novoEletro = {
                                id: Math.random().toString(36).substring(2, 9),
                                ambiente: 'Cozinha',
                                equipamento: 'Forno Elétrico de Embutir',
                                largura: '',
                                altura: '',
                                profundidade: '',
                                observacao: ''
                              };
                              const novasMedidas = [...eletrosAtuais, novoEletro];
                              const updatedBriefing = { ...(selectedNegocioModal.briefingData || {}), medidasEletros: novasMedidas };
                              const updatedNegocio = { ...selectedNegocioModal, briefingData: updatedBriefing };
                              setSelectedNegocioModal(updatedNegocio);
                              editarNegocio(selectedNegocioModal.id, { briefingData: updatedBriefing });
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold cursor-pointer transition-colors"
                          >
                            + Adicionar Eletro
                          </button>
                        </div>

                        <div className="space-y-2 pt-1">
                          {(selectedNegocioModal.briefingData?.medidasEletros || []).map((eletro, idx) => (
                            <div key={eletro.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 items-center">
                              <div className="sm:col-span-2">
                                <input
                                  type="text"
                                  value={eletro.ambiente}
                                  placeholder="Ambiente (ex: Cozinha)"
                                  onChange={(e) => {
                                    const list = [...(selectedNegocioModal.briefingData?.medidasEletros || [])];
                                    list[idx].ambiente = e.target.value;
                                    const updatedBriefing = { ...(selectedNegocioModal.briefingData || {}), medidasEletros: list };
                                    setSelectedNegocioModal({ ...selectedNegocioModal, briefingData: updatedBriefing });
                                    editarNegocio(selectedNegocioModal.id, { briefingData: updatedBriefing });
                                  }}
                                  className="w-full text-xs px-2 py-1 rounded bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                                />
                              </div>
                              <div className="sm:col-span-3">
                                <input
                                  type="text"
                                  value={eletro.equipamento}
                                  placeholder="Equipamento (ex: Geladeira Side by Side)"
                                  onChange={(e) => {
                                    const list = [...(selectedNegocioModal.briefingData?.medidasEletros || [])];
                                    list[idx].equipamento = e.target.value;
                                    const updatedBriefing = { ...(selectedNegocioModal.briefingData || {}), medidasEletros: list };
                                    setSelectedNegocioModal({ ...selectedNegocioModal, briefingData: updatedBriefing });
                                    editarNegocio(selectedNegocioModal.id, { briefingData: updatedBriefing });
                                  }}
                                  className="w-full text-xs px-2 py-1 rounded bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                                />
                              </div>
                              <div className="sm:col-span-1">
                                <input
                                  type="text"
                                  value={eletro.largura}
                                  placeholder="Larg (cm)"
                                  onChange={(e) => {
                                    const list = [...(selectedNegocioModal.briefingData?.medidasEletros || [])];
                                    list[idx].largura = e.target.value;
                                    const updatedBriefing = { ...(selectedNegocioModal.briefingData || {}), medidasEletros: list };
                                    setSelectedNegocioModal({ ...selectedNegocioModal, briefingData: updatedBriefing });
                                    editarNegocio(selectedNegocioModal.id, { briefingData: updatedBriefing });
                                  }}
                                  className="w-full text-xs px-2 py-1 rounded bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-center font-mono"
                                />
                              </div>
                              <div className="sm:col-span-1">
                                <input
                                  type="text"
                                  value={eletro.altura}
                                  placeholder="Alt (cm)"
                                  onChange={(e) => {
                                    const list = [...(selectedNegocioModal.briefingData?.medidasEletros || [])];
                                    list[idx].altura = e.target.value;
                                    const updatedBriefing = { ...(selectedNegocioModal.briefingData || {}), medidasEletros: list };
                                    setSelectedNegocioModal({ ...selectedNegocioModal, briefingData: updatedBriefing });
                                    editarNegocio(selectedNegocioModal.id, { briefingData: updatedBriefing });
                                  }}
                                  className="w-full text-xs px-2 py-1 rounded bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-center font-mono"
                                />
                              </div>
                              <div className="sm:col-span-1">
                                <input
                                  type="text"
                                  value={eletro.profundidade}
                                  placeholder="Prof (cm)"
                                  onChange={(e) => {
                                    const list = [...(selectedNegocioModal.briefingData?.medidasEletros || [])];
                                    list[idx].profundidade = e.target.value;
                                    const updatedBriefing = { ...(selectedNegocioModal.briefingData || {}), medidasEletros: list };
                                    setSelectedNegocioModal({ ...selectedNegocioModal, briefingData: updatedBriefing });
                                    editarNegocio(selectedNegocioModal.id, { briefingData: updatedBriefing });
                                  }}
                                  className="w-full text-xs px-2 py-1 rounded bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-center font-mono"
                                />
                              </div>
                              <div className="sm:col-span-3">
                                <input
                                  type="text"
                                  value={eletro.observacao}
                                  placeholder="Obs (ex: Tomada 220V atrás)"
                                  onChange={(e) => {
                                    const list = [...(selectedNegocioModal.briefingData?.medidasEletros || [])];
                                    list[idx].observacao = e.target.value;
                                    const updatedBriefing = { ...(selectedNegocioModal.briefingData || {}), medidasEletros: list };
                                    setSelectedNegocioModal({ ...selectedNegocioModal, briefingData: updatedBriefing });
                                    editarNegocio(selectedNegocioModal.id, { briefingData: updatedBriefing });
                                  }}
                                  className="w-full text-xs px-2 py-1 rounded bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                                />
                              </div>
                              <div className="sm:col-span-1 text-right">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const list = (selectedNegocioModal.briefingData?.medidasEletros || []).filter((_, i) => i !== idx);
                                    const updatedBriefing = { ...(selectedNegocioModal.briefingData || {}), medidasEletros: list };
                                    setSelectedNegocioModal({ ...selectedNegocioModal, briefingData: updatedBriefing });
                                    editarNegocio(selectedNegocioModal.id, { briefingData: updatedBriefing });
                                  }}
                                  className="text-red-500 hover:text-red-700 text-xs font-bold px-2 py-1 cursor-pointer"
                                  title="Remover"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          ))}
                          {(!selectedNegocioModal.briefingData?.medidasEletros || selectedNegocioModal.briefingData.medidasEletros.length === 0) && (
                            <p className="text-xs text-zinc-500 text-center py-3 italic">
                              Nenhum eletrodoméstico cadastrado. Clique no botão acima para adicionar.
                            </p>
                          )}
                        </div>
                      </div>

                      {/* BLOCO 3: CHECKLIST PADRÃO & ITENS DINÂMICOS */}
                      {BRIEFING_CATEGORIAS.map((cat, catIdx) => (
                        <div key={catIdx} className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-3">
                          <h5 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                            {cat.titulo}
                          </h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {cat.itens.map(item => {
                              const isChecked = !!selectedNegocioModal.briefingData?.checked?.[item.id];
                              return (
                                <label 
                                  key={item.id}
                                  className={`flex items-start gap-2.5 p-2 rounded-lg border transition-all cursor-pointer ${
                                    isChecked 
                                      ? 'bg-indigo-500/10 border-indigo-500/40 text-zinc-900 dark:text-zinc-100 font-medium' 
                                      : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => {
                                      const newChecked = {
                                        ...(selectedNegocioModal.briefingData?.checked || {}),
                                        [item.id]: e.target.checked
                                      };
                                      const updatedBriefing = {
                                        ...(selectedNegocioModal.briefingData || {}),
                                        checked: newChecked
                                      };
                                      const updatedNegocio = {
                                        ...selectedNegocioModal,
                                        briefingData: updatedBriefing
                                      };
                                      setSelectedNegocioModal(updatedNegocio);
                                      editarNegocio(selectedNegocioModal.id, { briefingData: updatedBriefing });
                                    }}
                                    className="mt-0.5 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                                  />
                                  <span className="text-xs leading-snug">{item.label}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      ))}

                      {/* Itens Personalizados / Dinâmicos Adicionados pelo Usuário */}
                      <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                            ✨ Itens Personalizados Adicionados ao Checklist
                          </h5>
                        </div>
                        <div className="space-y-2">
                          {(selectedNegocioModal.briefingData?.customItens || []).map((custom, idx) => (
                            <label
                              key={custom.id}
                              className={`flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer ${
                                custom.checked
                                  ? 'bg-indigo-500/10 border-indigo-500/40 text-zinc-900 dark:text-zinc-100 font-medium'
                                  : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <input
                                  type="checkbox"
                                  checked={custom.checked}
                                  onChange={(e) => {
                                    const list = [...(selectedNegocioModal.briefingData?.customItens || [])];
                                    list[idx].checked = e.target.checked;
                                    const updatedBriefing = { ...(selectedNegocioModal.briefingData || {}), customItens: list };
                                    setSelectedNegocioModal({ ...selectedNegocioModal, briefingData: updatedBriefing });
                                    editarNegocio(selectedNegocioModal.id, { briefingData: updatedBriefing });
                                  }}
                                  className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="text-xs">{custom.label}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const list = (selectedNegocioModal.briefingData?.customItens || []).filter((_, i) => i !== idx);
                                  const updatedBriefing = { ...(selectedNegocioModal.briefingData || {}), customItens: list };
                                  setSelectedNegocioModal({ ...selectedNegocioModal, briefingData: updatedBriefing });
                                  editarNegocio(selectedNegocioModal.id, { briefingData: updatedBriefing });
                                }}
                                className="text-red-500 hover:text-red-700 text-xs font-bold px-2 cursor-pointer"
                              >
                                ✕
                              </button>
                            </label>
                          ))}
                        </div>
                        {/* Input para adicionar novo item */}
                        <div className="flex gap-2 pt-2">
                          <input
                            type="text"
                            id="novo_item_briefing_input"
                            placeholder="Adicionar novo item personalizado ao checklist..."
                            className="flex-1 text-xs px-3 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const inputEl = e.currentTarget;
                                const val = inputEl.value.trim();
                                if (!val) return;
                                const customList = selectedNegocioModal.briefingData?.customItens || [];
                                const newItem = { id: Math.random().toString(36).substring(2, 9), categoria: 'Geral', label: val, checked: false };
                                const updatedBriefing = { ...(selectedNegocioModal.briefingData || {}), customItens: [...customList, newItem] };
                                setSelectedNegocioModal({ ...selectedNegocioModal, briefingData: updatedBriefing });
                                editarNegocio(selectedNegocioModal.id, { briefingData: updatedBriefing });
                                inputEl.value = '';
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const inputEl = document.getElementById('novo_item_briefing_input') as HTMLInputElement;
                              if (!inputEl) return;
                              const val = inputEl.value.trim();
                              if (!val) return;
                              const customList = selectedNegocioModal.briefingData?.customItens || [];
                              const newItem = { id: Math.random().toString(36).substring(2, 9), categoria: 'Geral', label: val, checked: false };
                              const updatedBriefing = { ...(selectedNegocioModal.briefingData || {}), customItens: [...customList, newItem] };
                              setSelectedNegocioModal({ ...selectedNegocioModal, briefingData: updatedBriefing });
                              editarNegocio(selectedNegocioModal.id, { briefingData: updatedBriefing });
                              inputEl.value = '';
                            }}
                            className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer transition-colors"
                          >
                            + Adicionar Item
                          </button>
                        </div>
                      </div>

                      {/* Observações e Anotações Livres do Briefing */}
                      <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 block">
                          Observações Especiais, Medidas Brutas & Comentários do Cliente
                        </label>
                        <textarea
                          rows={4}
                          value={selectedNegocioModal.briefingData?.notas || ''}
                          placeholder="Digite observações sobre o pé-direito, desníveis de piso, observações do cliente sobre acabamentos específicos, tomadas e pontos hidráulicos..."
                          onChange={(e) => {
                            const newNotas = e.target.value;
                            const updatedBriefing = {
                              ...(selectedNegocioModal.briefingData || {}),
                              notas: newNotas
                            };
                            const updatedNegocio = {
                              ...selectedNegocioModal,
                              briefingData: updatedBriefing
                            };
                            setSelectedNegocioModal(updatedNegocio);
                            editarNegocio(selectedNegocioModal.id, { briefingData: updatedBriefing });
                          }}
                          className="w-full text-xs p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                ) : modalAbaAtiva === 'previsao' ? (
                  <NegotiationForecastPanel
                    negocio={selectedNegocioModal}
                    projeto={projetoAssociado}
                    empresaAtiva={empresaAtiva}
                    onSalvarNegociacao={(simulacao: SimulacaoNegociacao) => {
                      editarNegocio(selectedNegocioModal.id, {
                        valorEstimado: simulacao.valorVendaFinal,
                        simulacaoNegociacao: simulacao,
                      });
                      setSelectedNegocioModal(prev => prev ? {
                        ...prev,
                        valorEstimado: simulacao.valorVendaFinal,
                        simulacaoNegociacao: simulacao,
                      } : null);
                    }}
                    onFecharNegocioGanho={() => {
                      if (!empresaAtiva) return;
                      const cli = clientes.find(c => c.id === selectedNegocioModal.clienteId) || clientes[0];

                      // 1. Gera o Contrato automaticamente com numeração #N/ANO e cláusulas jurídicas
                      const novoContrato = criarContratoDeNegocio({
                        negocio: selectedNegocioModal,
                        cliente: cli,
                        empresa: empresaAtiva,
                        projeto: projetoAssociado,
                        contratosExistentes: contratos,
                      });

                      criarContrato(novoContrato);

                      // 2. Atualiza o status do negócio para Fechado (Ganho)
                      editarNegocio(selectedNegocioModal.id, {
                        etapaFunil: 'fechado_ganho',
                      });
                      setSelectedNegocioModal(prev => prev ? {
                        ...prev,
                        etapaFunil: 'fechado_ganho',
                      } : null);

                      // 3. Notifica e abre a tela de Contratos para assinatura ICP-Brasil
                      setSelectedNegocioModal(null);
                      setAbaAtiva('contratos');
                    }}
                    onAbrirRenderPro={() => {
                      setNegocioParaRenderPro(selectedNegocioModal);
                      setIsRenderProModalOpen(true);
                    }}
                    onAtualizarValorVenda={(novoValor: number) => {
                      editarNegocio(selectedNegocioModal.id, { valorEstimado: novoValor });
                    }}
                  />
                ) : modalAbaAtiva === 'assistencia' ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4 text-amber-500" />
                        <span>Histórico de Assistência Técnica & Pós-Venda para {clienteAtual?.nome}</span>
                      </h4>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedNegocioModal(null);
                          setAbaAtiva('pos-venda');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Abrir Novo Chamado no Pós-Venda</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {ticketsAssistenca
                        .filter(t => t.clienteId === clienteAtual?.id || t.clienteNome === clienteAtual?.nome)
                        .map(t => (
                          <div key={t.id} className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
                                Chamado {t.id} • Status: {t.status.toUpperCase()}
                              </span>
                              <span className="text-[10px] text-zinc-400 font-mono">
                                Aberto em: {t.dataAbertura} {t.contratoNumero ? `(Contrato ${t.contratoNumero})` : ''}
                              </span>
                            </div>
                            <p className="text-zinc-800 dark:text-zinc-200">{t.descricao}</p>
                            <div className="flex items-center justify-between pt-2 border-t border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-400">
                              <span>Técnico Responsável: <strong className="text-zinc-200">{t.tecnicoResponsavel || 'Não designado'}</strong></span>
                              <span>Data Agendada: <strong className="text-purple-400">{t.dataAgendada || 'A definir'}</strong></span>
                            </div>
                          </div>
                        ))}

                      {ticketsAssistenca.filter(t => t.clienteId === clienteAtual?.id || t.clienteNome === clienteAtual?.nome).length === 0 && (
                        <div className="p-8 text-center border border-dashed border-zinc-300 dark:border-zinc-800 rounded-xl text-zinc-400 text-xs">
                          Nenhum chamado de assistência técnica registrado para este cliente. O histórico de pós-venda ficará visível aqui e na tela do contrato.
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    {/* 1. Detalhes do Negócio & Etapa Funil */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                          Valor Estimado
                        </span>
                        <span className="text-sm sm:text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                          {selectedNegocioModal.valorEstimado ? selectedNegocioModal.valorEstimado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00'}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                          Etapa no Funil
                        </span>
                        <select
                          value={selectedNegocioModal.etapaFunil}
                          onChange={(e) => {
                            const novaEtapa = e.target.value as EtapaFunil;
                            editarNegocio(selectedNegocioModal.id, { etapaFunil: novaEtapa });
                            setSelectedNegocioModal({ ...selectedNegocioModal, etapaFunil: novaEtapa });
                          }}
                          className="w-full text-xs font-semibold py-1 px-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-cyan-500"
                        >
                          {ETAPAS.map((et) => (
                            <option key={et.id} value={et.id}>{et.label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                          Temperatura
                        </span>
                        <select
                          value={selectedNegocioModal.scoreLead}
                          onChange={(e) => {
                            const novoScore = e.target.value as ScoreLead;
                            editarNegocio(selectedNegocioModal.id, { scoreLead: novoScore });
                            setSelectedNegocioModal({ ...selectedNegocioModal, scoreLead: novoScore });
                          }}
                          className="w-full text-xs font-semibold py-1 px-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-cyan-500"
                        >
                          <option value="quente">🔥 Quente</option>
                          <option value="morno">⚡ Morno</option>
                          <option value="frio">❄️ Frio</option>
                        </select>
                      </div>
                    </div>

                    {/* Banner de atalho para o Promob caso ainda não tenha importado */}
                    {!projetoAssociado && (
                      <div 
                        onClick={() => setModalAbaAtiva('projeto')}
                        className="p-3.5 bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-transparent border border-cyan-500/30 rounded-xl flex items-center justify-between cursor-pointer hover:border-cyan-500 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-500 flex items-center justify-center">
                            <UploadCloud className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                              Importar Projeto do Promob (XML / TXT)
                            </p>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                              Gere a lista de peças e orçamento por ambiente automaticamente com 1 clique.
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-cyan-500 flex items-center gap-1">
                          <span>Acessar</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    )}

                    {/* 2. Histórico de Conversas no WhatsApp */}
                    <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-2xs">
                      
                      {/* Top Bar da Seção WhatsApp */}
                      <div className="p-3 bg-emerald-950/20 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                            Histórico WhatsApp com {clienteAtual?.nome || 'Contato'}
                          </span>
                        </div>

                        {foneCliente && (
                          <button
                            onClick={() => {
                              setSelectedNegocioModal(null);
                              abrirConversaWhatsApp(foneCliente);
                            }}
                            className="text-[11px] text-emerald-500 hover:text-emerald-400 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                          >
                            <span>Abrir Atendimento Completo</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      {/* Mensagens do Histórico */}
                      <div className="p-4 bg-zinc-50/50 dark:bg-zinc-950/50 max-h-56 overflow-y-auto space-y-2.5">
                        {mensagensCliente.length === 0 ? (
                          <div className="text-center py-6 text-xs text-zinc-400">
                            Nenhuma mensagem trocada com este cliente no WhatsApp ainda.
                          </div>
                        ) : (
                          mensagensCliente.map((msg) => {
                            const isSaida = msg.direcao === 'saida';
                            const hora = new Date(msg.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                            return (
                              <div key={msg.id} className={`flex ${isSaida ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-xl p-2.5 text-xs space-y-0.5 shadow-2xs ${
                                  isSaida 
                                    ? 'bg-cyan-600 text-white rounded-br-none' 
                                    : 'bg-white dark:bg-zinc-850 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 rounded-bl-none'
                                }`}>
                                  <p className="leading-snug text-[11px]">{msg.texto}</p>
                                  <div className={`text-[9px] text-right font-mono flex items-center justify-end gap-1 ${isSaida ? 'text-cyan-200' : 'text-zinc-400'}`}>
                                    <span>{hora}</span>
                                    {isSaida && <CheckCircle2 className="w-2.5 h-2.5 text-cyan-200" />}
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Envio de Resposta Rápida pelo CRM */}
                      <form onSubmit={handleSendQuickReply} className="p-2.5 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
                        <input
                          type="text"
                          value={quickWhatsAppReply}
                          onChange={(e) => setQuickWhatsAppReply(e.target.value)}
                          placeholder={foneCliente ? `Responder para ${foneCliente}...` : 'Cadastre um telefone para responder via WhatsApp...'}
                          disabled={!foneCliente || isSendingReply}
                          className="flex-1 px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-cyan-500 disabled:opacity-50"
                        />
                        <button
                          type="submit"
                          disabled={!quickWhatsAppReply.trim() || !foneCliente || isSendingReply}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                        >
                          <Send className="w-3 h-3" />
                          <span>Enviar</span>
                        </button>
                      </form>

                    </div>
                  </>
                )}

              </div>

              {/* Footer do Modal */}
              <div className="p-3.5 sm:px-6 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setNegocioParaExcluir(selectedNegocioModal);
                  }}
                  className="text-xs text-rose-500 hover:text-rose-400 font-semibold flex items-center gap-1.5 p-1 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Excluir Lead & Cliente</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedNegocioModal(null)}
                    className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    Fechar
                  </button>
                  {modalAbaAtiva === 'geral' && foneCliente && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedNegocioModal(null);
                        abrirConversaWhatsApp(foneCliente);
                      }}
                      className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Abrir Chat WhatsApp</span>
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>
        );
      })()}

      {/* MODAL DE CONFIRMAÇÃO: Excluir Cliente */}
      {clienteParaExcluir && (
        <div className="fixed inset-0 bg-zinc-950/75 z-60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1 flex-1">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                  Excluir Cliente Definitivamente?
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Tem certeza que deseja excluir o cliente <strong className="text-zinc-800 dark:text-zinc-200">{clienteParaExcluir.nome}</strong>?
                </p>
              </div>
            </div>

            <div className="p-3 bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/20 rounded-xl text-[11px] text-rose-600 dark:text-rose-300 space-y-1">
              <p className="font-semibold">Esta ação removerá em cascata:</p>
              <ul className="list-disc list-inside space-y-0.5 text-zinc-600 dark:text-zinc-400">
                <li>Negócios e leads do funil CRM</li>
                <li>Projetos técnicos e lista de corte</li>
                <li>Orçamentos, itens e previsões</li>
                <li>Contratos, radar de prazos e OPs</li>
                <li>Histórico de mensagens do WhatsApp</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setClienteParaExcluir(null)}
                className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  const nome = clienteParaExcluir.nome;
                  excluirCliente(clienteParaExcluir.id);
                  setClienteParaExcluir(null);
                  showToast(`Cliente "${nome}" e registros associados foram excluídos.`);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md cursor-pointer transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Sim, Excluir Cliente</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO: Excluir Lead / Negócio */}
      {negocioParaExcluir && (
        <div className="fixed inset-0 bg-zinc-950/75 z-60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1 flex-1">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                  Excluir Lead / Oportunidade?
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Deseja excluir a oportunidade <strong className="text-zinc-800 dark:text-zinc-200">&quot;{negocioParaExcluir.titulo}&quot;</strong>?
                </p>
              </div>
            </div>

            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/60 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700">
              O lead será removido do funil de vendas e todos os projetos e propostas atrelados a ele serão cancelados.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setNegocioParaExcluir(null)}
                className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  const titulo = negocioParaExcluir.titulo;
                  excluirNegocio(negocioParaExcluir.id);
                  if (selectedNegocioModal?.id === negocioParaExcluir.id) {
                    setSelectedNegocioModal(null);
                  }
                  setNegocioParaExcluir(null);
                  showToast(`Lead "${titulo}" excluído com sucesso.`);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md cursor-pointer transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Sim, Excluir Lead</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST FEEDBACK NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-70 flex items-center gap-2 px-4 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-2xl shadow-2xl border border-zinc-800 dark:border-zinc-200 text-xs font-semibold animate-bounce-short">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 text-zinc-400 hover:text-white dark:hover:text-zinc-900 p-0.5 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* MODAL: Apresentação Comercial Render Pro (3D e Galeria para o Cliente Final) */}
      {isRenderProModalOpen && negocioParaRenderPro && (
        <RenderProPresentationModal
          isOpen={isRenderProModalOpen}
          negocio={negocioParaRenderPro}
          cliente={clientes.find(c => c.id === negocioParaRenderPro.clienteId)}
          projeto={projetos.find(p => p.negocioId === negocioParaRenderPro.id)}
          empresaAtiva={empresaAtiva}
          onClose={() => {
            setIsRenderProModalOpen(false);
            setNegocioParaRenderPro(null);
          }}
          onAprovarPropostaComCliente={() => {
            editarNegocio(negocioParaRenderPro.id, {
              etapaFunil: 'fechado_ganho',
            });
            setIsRenderProModalOpen(false);
            setNegocioParaRenderPro(null);
          }}
          onEnviarWhatsApp={(texto: string) => {
            const cli = clientes.find(c => c.id === negocioParaRenderPro.clienteId);
            const fone = cli?.whatsapp || cli?.telefone;
            if (fone) {
              enviarMensagemWhatsApp(fone, texto, cli?.id, negocioParaRenderPro.id);
            }
          }}
        />
      )}

    </div>
  );
};
