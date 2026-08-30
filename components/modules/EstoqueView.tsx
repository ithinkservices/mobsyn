'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { MaterialEstoque, StatusCompraMaterial, OrigemMaterial } from '@/types/database';
import { 
  Package, 
  Plus, 
  Search, 
  AlertTriangle, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Layers, 
  Boxes, 
  TrendingDown, 
  Building,
  User,
  FolderKanban,
  ShoppingCart,
  Share2,
  Check,
  Clock,
  RefreshCw,
  FileText,
  Copy,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export const EstoqueView: React.FC = () => {
  const { 
    estoque, 
    clientes,
    projetos,
    adicionarMaterial, 
    atualizarMaterial, 
    excluirMaterial,
    atualizarStatusCompraMaterial,
    gerarListaCompraProjetoParaEstoque
  } = useApp();

  // Estados de navegação e filtros
  const [origemFiltro, setOrigemFiltro] = useState<'todos' | 'almoxarifado_geral' | 'projeto_cliente'>('todos');
  const [clienteFiltroId, setClienteFiltroId] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('todos');
  const [statusCompraFiltro, setStatusCompraFiltro] = useState<string>('todos');
  const [apenasBaixoEstoque, setApenasBaixoEstoque] = useState(false);

  // Estados de Modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [selectedProjetoIdForSync, setSelectedProjetoIdForSync] = useState<string>('');
  const [editingMaterial, setEditingMaterial] = useState<MaterialEstoque | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState(false);

  // Form State
  const [origemTipo, setOrigemTipo] = useState<OrigemMaterial>('almoxarifado_geral');
  const [clienteId, setClienteId] = useState('');
  const [projetoId, setProjetoId] = useState('');
  const [codigo, setCodigo] = useState('');
  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState<MaterialEstoque['categoria']>('chapa_mdf');
  const [unidade, setUnidade] = useState<MaterialEstoque['unidade']>('chapa');
  const [quantidadeEstoque, setQuantidadeEstoque] = useState('0');
  const [quantidadeNecessaria, setQuantidadeNecessaria] = useState('1');
  const [estoqueMinimo, setEstoqueMinimo] = useState('0');
  const [custoUnitario, setCustoUnitario] = useState('220');
  const [fornecedor, setFornecedor] = useState('Leo Madeiras / Fornecedor Padrão');
  const [statusCompra, setStatusCompra] = useState<StatusCompraMaterial>('necessario');
  const [dataNecessidade, setDataNecessidade] = useState('');
  const [observacoes, setObservacoes] = useState('');

  // Filtragem dos itens de estoque
  const filteredEstoque = estoque.filter(item => {
    // Filtro por origem (Geral vs Cliente)
    if (origemFiltro === 'almoxarifado_geral') {
      if (item.origemTipo === 'projeto_cliente') return false;
    } else if (origemFiltro === 'projeto_cliente') {
      if (item.origemTipo !== 'projeto_cliente') return false;
    }

    // Filtro por Cliente Específico
    if (clienteFiltroId !== 'todos' && item.clienteId !== clienteFiltroId) {
      return false;
    }

    // Filtro por Categoria
    if (categoriaFiltro !== 'todos' && item.categoria !== categoriaFiltro) {
      return false;
    }

    // Filtro por Status de Compra
    if (statusCompraFiltro !== 'todos' && (item.statusCompra || 'em_estoque') !== statusCompraFiltro) {
      return false;
    }

    // Filtro de Estoque Baixo
    if (apenasBaixoEstoque) {
      const saldo = item.quantidadeEstoque;
      const min = item.estoqueMinimo;
      if (saldo > min) return false;
    }

    // Busca textual
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchNome = (item.nome || '').toLowerCase().includes(term);
      const matchCod = (item.codigo || '').toLowerCase().includes(term);
      const matchForn = (item.fornecedor || '').toLowerCase().includes(term);
      const matchCli = (item.clienteNome || '').toLowerCase().includes(term);
      const matchProj = (item.projetoNome || '').toLowerCase().includes(term);
      return matchNome || matchCod || matchForn || matchCli || matchProj;
    }

    return true;
  });

  const showFeedback = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const handleOpenModal = (item?: MaterialEstoque) => {
    if (item) {
      setEditingMaterial(item);
      setOrigemTipo(item.origemTipo || (item.clienteId ? 'projeto_cliente' : 'almoxarifado_geral'));
      setClienteId(item.clienteId || '');
      setProjetoId(item.projetoId || '');
      setCodigo(item.codigo);
      setNome(item.nome);
      setCategoria(item.categoria);
      setUnidade(item.unidade);
      setQuantidadeEstoque(item.quantidadeEstoque.toString());
      setQuantidadeNecessaria((item.quantidadeNecessaria || 1).toString());
      setEstoqueMinimo(item.estoqueMinimo.toString());
      setCustoUnitario(item.custoUnitario.toString());
      setFornecedor(item.fornecedor);
      setStatusCompra(item.statusCompra || 'necessario');
      setDataNecessidade(item.dataNecessidade || '');
      setObservacoes(item.observacoes || '');
    } else {
      setEditingMaterial(null);
      setOrigemTipo(origemFiltro === 'projeto_cliente' ? 'projeto_cliente' : 'almoxarifado_geral');
      setClienteId(clienteFiltroId !== 'todos' ? clienteFiltroId : (clientes[0]?.id || ''));
      setProjetoId('');
      setCodigo(`MAT-${Math.floor(1000 + Math.random() * 9000)}`);
      setNome('');
      setCategoria('chapa_mdf');
      setUnidade('chapa');
      setQuantidadeEstoque('0');
      setQuantidadeNecessaria('2');
      setEstoqueMinimo('0');
      setCustoUnitario('220');
      setFornecedor('Leo Madeiras / Fornecedor Padrão');
      setStatusCompra('necessario');
      setDataNecessidade(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
      setObservacoes('');
    }
    setIsModalOpen(true);
  };

  const handleSaveMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;

    const custo = parseFloat(custoUnitario) || 0;
    const qtdEstoque = parseFloat(quantidadeEstoque) || 0;
    const qtdNecessaria = parseFloat(quantidadeNecessaria) || 1;
    const min = parseFloat(estoqueMinimo) || 0;

    const selectedCliente = clientes.find(c => c.id === clienteId);
    const selectedProjeto = projetos.find(p => p.id === projetoId);

    const dadosMaterial = {
      codigo,
      nome,
      categoria,
      unidade,
      quantidadeEstoque: qtdEstoque,
      quantidadeNecessaria: origemTipo === 'projeto_cliente' ? qtdNecessaria : undefined,
      estoqueMinimo: min,
      custoUnitario: custo,
      precoVendaSugerido: custo * 2.2,
      fornecedor,
      origemTipo,
      clienteId: origemTipo === 'projeto_cliente' ? clienteId : undefined,
      clienteNome: origemTipo === 'projeto_cliente' ? (selectedCliente?.nome || 'Cliente Selecionado') : undefined,
      projetoId: origemTipo === 'projeto_cliente' ? (projetoId || undefined) : undefined,
      projetoNome: origemTipo === 'projeto_cliente' ? (selectedProjeto?.nomeAmbiente || undefined) : undefined,
      statusCompra: origemTipo === 'projeto_cliente' ? statusCompra : 'em_estoque',
      dataNecessidade: origemTipo === 'projeto_cliente' ? dataNecessidade : undefined,
      observacoes
    };

    if (editingMaterial) {
      atualizarMaterial(editingMaterial.id, dadosMaterial);
      showFeedback('Material atualizado com sucesso no estoque!');
    } else {
      adicionarMaterial(dadosMaterial);
      showFeedback('Novo material salvo com sucesso no estoque!');
    }

    setIsModalOpen(false);
  };

  const handleSyncProjeto = () => {
    if (!selectedProjetoIdForSync) return;
    const gerados = gerarListaCompraProjetoParaEstoque(selectedProjetoIdForSync);
    setIsSyncModalOpen(false);
    setSelectedProjetoIdForSync('');
    setOrigemFiltro('projeto_cliente');
    showFeedback(`${gerados.length} materiais gerados e enviados para a lista de compras do estoque!`);
  };

  // Gerar texto formatado da Lista de Compras do Cliente selecionado para envio / cópia
  const handleCopiarListaCliente = () => {
    const itensCliente = filteredEstoque.filter(i => i.origemTipo === 'projeto_cliente');
    if (itensCliente.length === 0) {
      showFeedback('Nenhum item na lista de compras para copiar.');
      return;
    }

    const nomeCli = clienteFiltroId !== 'todos' 
      ? (clientes.find(c => c.id === clienteFiltroId)?.nome || 'Cliente') 
      : 'Projetos de Clientes';

    let texto = `📋 *LISTA DE COMPRAS DE MATERIAIS / PROJETO*\n`;
    texto += `👤 *Cliente:* ${nomeCli}\n`;
    texto += `📅 *Data:* ${new Date().toLocaleDateString('pt-BR')}\n\n`;
    texto += `*Itens Necessários:*\n`;

    let totalEstimado = 0;

    itensCliente.forEach((it, idx) => {
      const qtd = it.quantidadeNecessaria || it.quantidadeEstoque || 1;
      const subtotal = qtd * it.custoUnitario;
      totalEstimado += subtotal;
      const statusText = it.statusCompra === 'comprado' || it.statusCompra === 'em_estoque' ? '✅ Recebido' : '⏳ Pendente Compra';
      texto += `${idx + 1}. *${it.nome}*\n   - Qtd: ${qtd} ${it.unidade}\n   - Fornecedor Sugerido: ${it.fornecedor}\n   - Custo Est.: ${formatCurrency(it.custoUnitario)} (Total: ${formatCurrency(subtotal)})\n   - Status: ${statusText}\n\n`;
    });

    texto += `💰 *Custo Total Estimado de Insumos:* ${formatCurrency(totalEstimado)}\n`;
    texto += `_Gerado automaticamente pelo Sistema de Marcenaria_`;

    navigator.clipboard.writeText(texto).then(() => {
      setCopiedText(true);
      showFeedback('Lista de compras copiada para a área de transferência! Pode colar no WhatsApp do fornecedor.');
      setTimeout(() => setCopiedText(false), 3000);
    });
  };

  // Métricas calculadas
  const materiaisCliente = estoque.filter(i => i.origemTipo === 'projeto_cliente');
  const materiaisGerais = estoque.filter(i => i.origemTipo !== 'projeto_cliente');
  
  const totalValorAlmoxarifado = materiaisGerais.reduce((acc, item) => acc + (item.quantidadeEstoque * item.custoUnitario), 0);
  const totalValorDemandasPendentes = materiaisCliente
    .filter(i => i.statusCompra === 'necessario' || i.statusCompra === 'cotado')
    .reduce((acc, item) => acc + ((item.quantidadeNecessaria || 1) * item.custoUnitario), 0);
  
  const itensAbaixoMinimo = materiaisGerais.filter(item => item.quantidadeEstoque <= item.estoqueMinimo).length;
  const totalDemandasPendentes = materiaisCliente.filter(i => i.statusCompra === 'necessario' || i.statusCompra === 'cotado').length;

  const getCategoriaBadge = (cat: MaterialEstoque['categoria']) => {
    switch (cat) {
      case 'chapa_mdf':
        return { label: 'Chapa MDF', bg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800' };
      case 'fita_borda':
        return { label: 'Fita Borda', bg: 'bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800' };
      case 'ferragem':
        return { label: 'Ferragem', bg: 'bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800' };
      case 'insumo':
        return { label: 'Insumo/LED', bg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' };
      default:
        return { label: 'Outro', bg: 'bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700' };
    }
  };

  const getStatusCompraBadge = (status?: StatusCompraMaterial) => {
    switch (status) {
      case 'necessario':
        return { label: 'Comprar Urgente', icon: ShoppingCart, bg: 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-300 dark:border-amber-800' };
      case 'cotado':
        return { label: 'Em Cotação', icon: Clock, bg: 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border-blue-300 dark:border-blue-800' };
      case 'comprado':
        return { label: 'Comprado / A Caminho', icon: Check, bg: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800' };
      case 'em_estoque':
        return { label: 'Em Estoque / Recebido', icon: CheckCircle2, bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800' };
      case 'consumido':
        return { label: 'Consumido na Produção', icon: Package, bg: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700' };
      default:
        return { label: 'Disponível', icon: CheckCircle2, bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800' };
    }
  };

  // Dados do cliente selecionado no filtro (se houver)
  const clienteSelecionadoObj = clientes.find(c => c.id === clienteFiltroId);
  const materiaisDoClienteSelecionado = clienteFiltroId !== 'todos'
    ? estoque.filter(i => i.clienteId === clienteFiltroId)
    : [];

  return (
    <div className="space-y-6">
      {/* Header Principal */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
            <Package className="w-4 h-4" /> Almoxarifado & Compras por Cliente
          </div>
          <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white mt-1">Estoque & Listas de Compras de Materiais</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-3xl">
            Gerencie o estoque geral da marcenaria e as listas de compras automáticas geradas por cliente ao importar projetos do Promob ou SketchUp.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsSyncModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-semibold border border-zinc-300 dark:border-zinc-700 transition-all cursor-pointer shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-cyan-500" /> Gerar Lista de Projeto
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-cyan-950/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Novo Material
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl flex items-center gap-3 text-emerald-800 dark:text-emerald-200 text-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
            <span>Almoxarifado Geral</span>
            <Boxes className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-2xl font-extrabold text-zinc-900 dark:text-white font-mono mt-2">{formatCurrency(totalValorAlmoxarifado)}</div>
          <div className="text-[11px] text-zinc-400 mt-1">{materiaisGerais.length} insumos de estoque base</div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
            <span>Demandas por Cliente</span>
            <User className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono mt-2">{materiaisCliente.length} itens</div>
          <div className="text-[11px] text-zinc-400 mt-1">Vinculados a projetos e clientes</div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
            <span>Compras Pendentes</span>
            <ShoppingCart className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-mono mt-2">{totalDemandasPendentes} pendentes</div>
          <div className="text-[11px] text-zinc-400 mt-1">{formatCurrency(totalValorDemandasPendentes)} estimado</div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
            <span>Estoque Crítico / Baixo</span>
            <TrendingDown className={`w-4 h-4 ${itensAbaixoMinimo > 0 ? 'text-rose-500' : 'text-zinc-400'}`} />
          </div>
          <div className={`text-2xl font-extrabold font-mono mt-2 ${itensAbaixoMinimo > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-zinc-900 dark:text-white'}`}>
            {itensAbaixoMinimo} {itensAbaixoMinimo === 1 ? 'item' : 'itens'}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">Abaixo do mínimo de segurança</div>
        </div>
      </div>

      {/* Tabs de Seleção de Modo (Geral vs Por Cliente) */}
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
        <button
          onClick={() => setOrigemFiltro('todos')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            origemFiltro === 'todos'
              ? 'bg-cyan-600 text-white shadow-sm'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" /> Todos os Materiais ({estoque.length})
        </button>

        <button
          onClick={() => setOrigemFiltro('projeto_cliente')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            origemFiltro === 'projeto_cliente'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <User className="w-3.5 h-3.5" /> Materiais por Cliente / Listas de Compra ({materiaisCliente.length})
        </button>

        <button
          onClick={() => setOrigemFiltro('almoxarifado_geral')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            origemFiltro === 'almoxarifado_geral'
              ? 'bg-zinc-800 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <Building className="w-3.5 h-3.5" /> Almoxarifado Geral da Fábrica ({materiaisGerais.length})
        </button>
      </div>

      {/* Card de Resumo do Cliente Selecionado (Quando filtrado por cliente) */}
      {clienteFiltroId !== 'todos' && clienteSelecionadoObj && (
        <div className="bg-gradient-to-r from-indigo-50/80 to-cyan-50/80 dark:from-indigo-950/40 dark:to-cyan-950/40 p-5 rounded-2xl border border-indigo-200 dark:border-indigo-800/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
              {clienteSelecionadoObj.nome.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">{clienteSelecionadoObj.nome}</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                  {materiaisDoClienteSelecionado.length} materiais cadastrados
                </span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                Telefone/WhatsApp: {clienteSelecionadoObj.whatsapp || clienteSelecionadoObj.telefone} • {clienteSelecionadoObj.email}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleCopiarListaCliente}
              className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Share2 className="w-3.5 h-3.5" />}
              {copiedText ? 'Copiado p/ Cotação!' : 'Exportar Lista p/ Cotação'}
            </button>
            <button
              onClick={() => {
                // Marcar todos os itens desse cliente como comprados
                materiaisDoClienteSelecionado.forEach(m => {
                  if (m.statusCompra === 'necessario' || m.statusCompra === 'cotado') {
                    atualizarStatusCompraMaterial(m.id, 'em_estoque', m.quantidadeNecessaria || m.quantidadeEstoque || 1);
                  }
                });
                showFeedback(`Todos os materiais de ${clienteSelecionadoObj.nome} foram marcados como recebidos no estoque!`);
              }}
              className="flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Receber Todos no Estoque
            </button>
          </div>
        </div>
      )}

      {/* Tabela de Estoque e Lista de Compras */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        {/* Barra de Filtros */}
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar insumo, código, cliente ou projeto..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-cyan-500 w-64 md:w-80"
              />
            </div>

            {/* Filtro por Cliente */}
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-zinc-400" />
              <select
                value={clienteFiltroId}
                onChange={e => setClienteFiltroId(e.target.value)}
                className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-cyan-500"
              >
                <option value="todos">Todos os Clientes</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>
                    Cliente: {c.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por Categoria */}
            <select
              value={categoriaFiltro}
              onChange={e => setCategoriaFiltro(e.target.value)}
              className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-cyan-500"
            >
              <option value="todos">Todas Categorias</option>
              <option value="chapa_mdf">Chapas MDF</option>
              <option value="fita_borda">Fitas de Borda</option>
              <option value="ferragem">Ferragens</option>
              <option value="insumo">Insumos & LEDs</option>
            </select>

            {/* Filtro por Status de Compra */}
            <select
              value={statusCompraFiltro}
              onChange={e => setStatusCompraFiltro(e.target.value)}
              className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-cyan-500"
            >
              <option value="todos">Todos os Status</option>
              <option value="necessario">Necessário Comprar</option>
              <option value="cotado">Em Cotação</option>
              <option value="comprado">Comprado</option>
              <option value="em_estoque">Em Estoque / Recebido</option>
              <option value="consumido">Consumido</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setApenasBaixoEstoque(!apenasBaixoEstoque)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                apenasBaixoEstoque
                  ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                  : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Abaixo do Mínimo
            </button>
          </div>
        </div>

        {/* Listagem */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-800/50 text-[11px] font-mono text-zinc-500 uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800">
                <th className="py-3 px-4">Material / Insumo</th>
                <th className="py-3 px-4">Destino / Cliente</th>
                <th className="py-3 px-4">Categoria</th>
                <th className="py-3 px-4 text-center">Status / Compra</th>
                <th className="py-3 px-4 text-right">Qtd. Necessária</th>
                <th className="py-3 px-4 text-right">Saldo Físico</th>
                <th className="py-3 px-4 text-right">Custo Unit.</th>
                <th className="py-3 px-4 text-right">Total Est.</th>
                <th className="py-3 px-4">Fornecedor</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-xs">
              {filteredEstoque.map(item => {
                const isCliente = item.origemTipo === 'projeto_cliente' || !!item.clienteId;
                const catBadge = getCategoriaBadge(item.categoria);
                const statusBadge = getStatusCompraBadge(item.statusCompra);
                const StatusIcon = statusBadge.icon;
                const isBaixo = item.quantidadeEstoque <= item.estoqueMinimo;
                const qtdCalc = isCliente ? (item.quantidadeNecessaria || 1) : item.quantidadeEstoque;
                const valorTotalItem = qtdCalc * item.custoUnitario;

                return (
                  <tr key={item.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition-colors">
                    {/* Material & Código */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-bold text-zinc-900 dark:text-white">{item.nome}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-[10px] text-zinc-400">{item.codigo}</span>
                        {item.observacoes && (
                          <span className="text-[10px] text-zinc-500 italic truncate max-w-[180px]" title={item.observacoes}>
                            • {item.observacoes}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Origem / Cliente */}
                    <td className="py-3.5 px-4">
                      {isCliente ? (
                        <div>
                          <div className="flex items-center gap-1.5 font-bold text-indigo-600 dark:text-indigo-400">
                            <User className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate max-w-[140px]">{item.clienteNome || 'Cliente'}</span>
                          </div>
                          {item.projetoNome && (
                            <div className="flex items-center gap-1 text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                              <FolderKanban className="w-3 h-3 shrink-0" />
                              <span className="truncate max-w-[140px]">{item.projetoNome}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium text-[11px]">
                          <Building className="w-3 h-3 text-zinc-500" />
                          Almoxarifado Geral
                        </div>
                      )}
                    </td>

                    {/* Categoria */}
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${catBadge.bg}`}>
                        {catBadge.label}
                      </span>
                    </td>

                    {/* Status de Compra Interativo */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex flex-col items-center gap-1">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge.bg}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusBadge.label}
                        </span>

                        {isCliente && (
                          <div className="flex items-center gap-1 mt-1">
                            {item.statusCompra !== 'em_estoque' && (
                              <button
                                onClick={() => {
                                  atualizarStatusCompraMaterial(item.id, 'em_estoque', item.quantidadeNecessaria || 1);
                                  showFeedback(`Material "${item.nome}" recebido no estoque!`);
                                }}
                                className="px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 rounded text-[9px] font-bold border border-emerald-300 dark:border-emerald-800 cursor-pointer"
                                title="Marcar como Recebido no Estoque"
                              >
                                + Chegou
                              </button>
                            )}
                            {item.statusCompra === 'necessario' && (
                              <button
                                onClick={() => {
                                  atualizarStatusCompraMaterial(item.id, 'cotado');
                                  showFeedback(`Status alterado para Cotado.`);
                                }}
                                className="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300 rounded text-[9px] font-bold border border-blue-300 dark:border-blue-800 cursor-pointer"
                                title="Marcar como Em Cotação"
                              >
                                Cotar
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Quantidade Necessária (Demanda do Projeto) */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold">
                      {isCliente ? (
                        <div className="text-indigo-600 dark:text-indigo-400">
                          {item.quantidadeNecessaria || 1} {item.unidade}
                        </div>
                      ) : (
                        <span className="text-zinc-400">-</span>
                      )}
                    </td>

                    {/* Saldo Físico em Estoque */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold">
                      <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg ${isBaixo && !isCliente ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800' : 'text-zinc-900 dark:text-zinc-100'}`}>
                        {isBaixo && !isCliente && <AlertTriangle className="w-3 h-3" />}
                        {item.quantidadeEstoque} {item.unidade}
                      </div>
                    </td>

                    {/* Custo Unitário */}
                    <td className="py-3.5 px-4 text-right font-mono text-zinc-700 dark:text-zinc-300">
                      {formatCurrency(item.custoUnitario)}
                    </td>

                    {/* Valor Total */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(valorTotalItem)}
                    </td>

                    {/* Fornecedor */}
                    <td className="py-3.5 px-4 text-zinc-600 dark:text-zinc-400">
                      <div className="flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span className="truncate max-w-[130px]">{item.fornecedor}</span>
                      </div>
                    </td>

                    {/* Ações */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenModal(item)}
                          className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-cyan-500 hover:text-white transition-all cursor-pointer"
                          title="Editar Material"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Deseja remover o material "${item.nome}"?`)) {
                              excluirMaterial(item.id);
                              showFeedback('Material removido do estoque.');
                            }
                          }}
                          className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-rose-500 hover:text-white transition-all cursor-pointer"
                          title="Excluir Material"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredEstoque.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-zinc-400 text-sm">
                    <Package className="w-8 h-8 mx-auto text-zinc-300 dark:text-zinc-600 mb-2" />
                    Nenhum material encontrado no estoque com os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Gerar Lista de Compras a partir de Projeto Existente */}
      {isSyncModalOpen && (
        <div className="fixed inset-0 z-50 bg-zinc-950/70 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-lg w-full p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
              <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400">
                <Sparkles className="w-5 h-5" />
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Gerar Lista de Compras do Projeto</h3>
              </div>
              <button
                onClick={() => setIsSyncModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Selecione um projeto de marcenaria existente. O sistema analisará as peças, dimensões e acabamentos, calculando automaticamente as chapas de MDF, fitas de borda e ferragens necessárias vinculadas ao Cliente no Estoque.
            </p>

            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                Projeto / Ambiente do Cliente *
              </label>
              <select
                value={selectedProjetoIdForSync}
                onChange={e => setSelectedProjetoIdForSync(e.target.value)}
                className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-white focus:outline-cyan-500"
              >
                <option value="">-- Selecione um Projeto --</option>
                {projetos.map(proj => {
                  const cliente = clientes.find(c => c.id === proj.clienteId);
                  return (
                    <option key={proj.id} value={proj.id}>
                      {proj.nomeAmbiente} • Cliente: {cliente?.nome || 'Sem cliente'} ({proj.softwareOrigem.toUpperCase()})
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setIsSyncModalOpen(false)}
                className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-semibold hover:bg-zinc-200 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={!selectedProjetoIdForSync}
                onClick={handleSyncProjeto}
                className="px-5 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md cursor-pointer flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" /> Calcular & Gerar no Estoque
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add/Edit Material */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-zinc-950/70 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-xl w-full p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                {editingMaterial ? 'Editar Insumo / Material' : 'Cadastrar Material no Estoque'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMaterial} className="space-y-4">
              {/* Seleção de Origem / Destino */}
              <div className="bg-zinc-50 dark:bg-zinc-800/60 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 space-y-2">
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Tipo de Destino do Material *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setOrigemTipo('almoxarifado_geral')}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      origemTipo === 'almoxarifado_geral'
                        ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-zinc-900 dark:border-white shadow-xs'
                        : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
                    }`}
                  >
                    <Building className="w-3.5 h-3.5" /> Almoxarifado Geral
                  </button>

                  <button
                    type="button"
                    onClick={() => setOrigemTipo('projeto_cliente')}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      origemTipo === 'projeto_cliente'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" /> Vincular a um Cliente
                  </button>
                </div>

                {/* Se for vinculado ao Cliente */}
                {origemTipo === 'projeto_cliente' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                        Cliente Responsável *
                      </label>
                      <select
                        required
                        value={clienteId}
                        onChange={e => setClienteId(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-indigo-500"
                      >
                        <option value="">Selecione o Cliente</option>
                        {clientes.map(c => (
                          <option key={c.id} value={c.id}>{c.nome}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                        Projeto / Ambiente (Opcional)
                      </label>
                      <select
                        value={projetoId}
                        onChange={e => setProjetoId(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-indigo-500"
                      >
                        <option value="">Selecione o Projeto</option>
                        {projetos
                          .filter(p => !clienteId || p.clienteId === clienteId)
                          .map(p => (
                            <option key={p.id} value={p.id}>{p.nomeAmbiente}</option>
                          ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Nome do Material / Descrição *
                </label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  placeholder="Ex: MDF Louro Freijó 18mm 2 Faces"
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-white focus:outline-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">Código / SKU</label>
                  <input
                    type="text"
                    value={codigo}
                    onChange={e => setCodigo(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-mono text-zinc-900 dark:text-white focus:outline-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">Categoria</label>
                  <select
                    value={categoria}
                    onChange={e => setCategoria(e.target.value as MaterialEstoque['categoria'])}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-white focus:outline-cyan-500"
                  >
                    <option value="chapa_mdf">Chapa MDF</option>
                    <option value="fita_borda">Fita de Borda</option>
                    <option value="ferragem">Ferragem</option>
                    <option value="insumo">Insumo & LED</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">Unidade</label>
                  <select
                    value={unidade}
                    onChange={e => setUnidade(e.target.value as MaterialEstoque['unidade'])}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-white focus:outline-cyan-500"
                  >
                    <option value="chapa">Chapa</option>
                    <option value="m2">m²</option>
                    <option value="metro">Metro (m)</option>
                    <option value="peca">Peça</option>
                    <option value="kg">Kg</option>
                    <option value="l">Litro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    {origemTipo === 'projeto_cliente' ? 'Qtd. Necessária' : 'Qtd. Estoque'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={origemTipo === 'projeto_cliente' ? quantidadeNecessaria : quantidadeEstoque}
                    onChange={e => origemTipo === 'projeto_cliente' ? setQuantidadeNecessaria(e.target.value) : setQuantidadeEstoque(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-mono text-zinc-900 dark:text-white focus:outline-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    {origemTipo === 'projeto_cliente' ? 'Saldo Físico' : 'Estoque Mínimo'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={origemTipo === 'projeto_cliente' ? quantidadeEstoque : estoqueMinimo}
                    onChange={e => origemTipo === 'projeto_cliente' ? setQuantidadeEstoque(e.target.value) : setEstoqueMinimo(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-mono text-zinc-900 dark:text-white focus:outline-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    Custo Unitário (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={custoUnitario}
                    onChange={e => setCustoUnitario(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-mono text-zinc-900 dark:text-white focus:outline-cyan-500"
                  />
                </div>

                {origemTipo === 'projeto_cliente' ? (
                  <div>
                    <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                      Status da Compra
                    </label>
                    <select
                      value={statusCompra}
                      onChange={e => setStatusCompra(e.target.value as StatusCompraMaterial)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-white focus:outline-cyan-500"
                    >
                      <option value="necessario">Necessário Comprar</option>
                      <option value="cotado">Em Cotação</option>
                      <option value="comprado">Comprado (Aguardando)</option>
                      <option value="em_estoque">Em Estoque / Recebido</option>
                      <option value="consumido">Consumido na Produção</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                      Fornecedor
                    </label>
                    <input
                      type="text"
                      value={fornecedor}
                      onChange={e => setFornecedor(e.target.value)}
                      placeholder="Ex: Leo Madeiras SP"
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-white focus:outline-cyan-500"
                    />
                  </div>
                )}
              </div>

              {origemTipo === 'projeto_cliente' && (
                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    Fornecedor Sugerido
                  </label>
                  <input
                    type="text"
                    value={fornecedor}
                    onChange={e => setFornecedor(e.target.value)}
                    placeholder="Ex: Leo Madeiras / Berneck"
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-white focus:outline-cyan-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Observações / Detalhes das Peças
                </label>
                <textarea
                  rows={2}
                  value={observacoes}
                  onChange={e => setObservacoes(e.target.value)}
                  placeholder="Ex: 4 chapas calculadas para frentes da ilha e gavetas"
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-semibold hover:bg-zinc-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-semibold shadow-md cursor-pointer"
                >
                  Salvar no Estoque
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
