'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { SoftwareOrigem, ItemOrcamento } from '@/types/database';
import { 
  Box, 
  Plus, 
  Layers, 
  FileCode, 
  CheckCircle2, 
  Trash2, 
  X,
  FileSpreadsheet,
  Cpu,
  Sliders,
  TrendingUp,
  Boxes,
  Upload,
  Sparkles,
  ArrowRight,
  Calculator,
  Percent,
  Coins,
  ChevronRight
} from 'lucide-react';

interface PresetProjeto {
  id: string;
  nome: string;
  software: SoftwareOrigem;
  arquivo: string;
  descricao: string;
  itens: Omit<ItemOrcamento, 'id' | 'empresaId' | 'projetoId' | 'createdAt'>[];
}

const PRESET_PROJETOS: PresetProjeto[] = [
  {
    id: 'preset_cozinha',
    nome: 'Cozinha Gourmet com Ilha & Torre Quente',
    software: 'promob',
    arquivo: 'Cozinha_Gourmet_Ilha_v2.promob',
    descricao: 'Cozinha modulada com gavetões tandembox, torre quente, portas reflecta e nichos em Louro Freijó.',
    itens: [
      {
        codigo: 'TOR-01',
        descricao: 'Torre Quente p/ Forno e Microondas 2 Portas',
        ambiente: 'Cozinha Gourmet',
        medidas: { larguraMm: 700, alturaMm: 2400, profundidadeMm: 600 },
        material: 'MDF 18mm Louro Freijó / Grafite',
        acabamento: 'Borda ABS 1mm',
        quantidade: 1,
        custoUnitario: 1450,
        precoVenda: 3480,
        margemLucroPercent: 58.3
      },
      {
        codigo: 'ILH-01',
        descricao: 'Ilha Central com 4 Gavetões Amortecidos',
        ambiente: 'Cozinha Gourmet',
        medidas: { larguraMm: 1800, alturaMm: 900, profundidadeMm: 900 },
        material: 'MDF 18mm Grafite Matt Ultra',
        acabamento: 'Borda ABS 2mm Usinada 45°',
        quantidade: 1,
        custoUnitario: 2600,
        precoVenda: 6500,
        margemLucroPercent: 60.0
      },
      {
        codigo: 'ARM-SUP',
        descricao: 'Armário Aéreo com Porta Perfil Alumínio e Vidro Reflecta',
        ambiente: 'Cozinha Gourmet',
        medidas: { larguraMm: 1600, alturaMm: 700, profundidadeMm: 380 },
        material: 'Perfil Alumínio Preto + Vidro Reflecta Bronze',
        acabamento: 'Pistão a Gás e Fita LED Embutida',
        quantidade: 1,
        custoUnitario: 1980,
        precoVenda: 4950,
        margemLucroPercent: 60.0
      },
      {
        codigo: 'BAL-PIA',
        descricao: 'Balcão da Pia com Divisor de Talheres e Lixeira Inox',
        ambiente: 'Cozinha Gourmet',
        medidas: { larguraMm: 1500, alturaMm: 860, profundidadeMm: 580 },
        material: 'MDF 18mm Branco Hidrófugo (Resistente à Água)',
        acabamento: 'Borda PUR Impermeável',
        quantidade: 1,
        custoUnitario: 1850,
        precoVenda: 4440,
        margemLucroPercent: 58.3
      },
    ]
  },
  {
    id: 'preset_closet',
    nome: 'Dormitório Casal com Closet & Painel Ripado',
    software: 'sketchup',
    arquivo: 'Suite_Master_Closet_Ripado.skp',
    descricao: 'Closet planejado com cabideiros iluminados, sapateira corrediça e painel de cabeceira ripado.',
    itens: [
      {
        codigo: 'CLS-01',
        descricao: 'Módulo Closet Cabideiro Duplo com LED Integrado',
        ambiente: 'Suíte Master',
        medidas: { larguraMm: 1200, alturaMm: 2600, profundidadeMm: 580 },
        material: 'MDF 18mm Gianduia Trama',
        acabamento: 'Borda ABS 1mm com canal LED',
        quantidade: 2,
        custoUnitario: 1380,
        precoVenda: 3450,
        margemLucroPercent: 60.0
      },
      {
        codigo: 'SAP-01',
        descricao: 'Sapateira Telescópica 8 Prateleiras Inclinadas',
        ambiente: 'Suíte Master',
        medidas: { larguraMm: 600, alturaMm: 2600, profundidadeMm: 580 },
        material: 'MDF 18mm Gianduia',
        acabamento: 'Corrediça Oculta com Amortecedor',
        quantidade: 1,
        custoUnitario: 1120,
        precoVenda: 2800,
        margemLucroPercent: 60.0
      },
      {
        codigo: 'PNL-RIP',
        descricao: 'Painel de Cabeceira Ripado com Mesas de Cabeceira Suspensas',
        ambiente: 'Suíte Master',
        medidas: { larguraMm: 2800, alturaMm: 1400, profundidadeMm: 45 },
        material: 'MDF 18mm Carvalho Natural Ripado CNC',
        acabamento: 'Acabamento acetinado mate',
        quantidade: 1,
        custoUnitario: 1650,
        precoVenda: 4125,
        margemLucroPercent: 60.0
      },
    ]
  }
];

export const ProjetosView: React.FC = () => {
  const { 
    projetos, 
    itensOrcamento, 
    negocios, 
    criarProjeto, 
    editarProjeto,
    excluirProjeto, 
    criarItemOrcamento, 
    excluirItemOrcamento,
    editarNegocio,
    setAbaAtiva
  } = useApp();

  const [selectedProjetoId, setSelectedProjetoId] = useState<string>(projetos[0]?.id || '');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);
  
  // Markup Simulator state
  const [markupMultiplier, setMarkupMultiplier] = useState<number>(2.4); // Multiplicador padrão 2.4x
  const [simulandoUpload, setSimulandoUpload] = useState<boolean>(false);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');

  // Form item state
  const [itemCodigo, setItemCodigo] = useState('');
  const [itemDescricao, setItemDescricao] = useState('');
  const [largura, setLargura] = useState(800);
  const [altura, setAltura] = useState(720);
  const [profundidade, setProfundidade] = useState(550);
  const [material, setMaterial] = useState('MDF 18mm Louro Freijó');
  const [acabamento, setAcabamento] = useState('Fita de borda PVC 1mm');
  const [custo, setCusto] = useState(650);

  const activeProject = projetos.find(p => p.id === selectedProjetoId) || projetos[0];
  const activeItems = itensOrcamento.filter(i => i.projetoId === activeProject?.id);

  // Cálculos de custos diretos
  const totalCustoInsumos = activeItems.reduce((acc, i) => acc + (i.custoUnitario * i.quantidade), 0);
  const totalVendaCalculada = Math.round(totalCustoInsumos * markupMultiplier);
  const margemLucroBrutoPercent = totalVendaCalculada > 0 
    ? Number((((totalVendaCalculada - totalCustoInsumos) / totalVendaCalculada) * 100).toFixed(1))
    : 0;

  // Importar Preset ou Arquivo 3D
  const handleImportPreset = (preset: PresetProjeto) => {
    const targetNegocio = negocios.find(n => n.id === activeProject?.negocioId) || negocios[0];

    const newPrj = criarProjeto({
      negocioId: targetNegocio?.id || 'neg_default',
      nomeAmbiente: preset.nome,
      softwareOrigem: preset.software,
      arquivoNome: preset.arquivo,
      versao: 'v2.1',
      statusProjeto: 'aguardando_aprovacao',
      valorCalculado: 0,
    });

    // Injeta as peças e módulos calculados
    preset.itens.forEach(item => {
      criarItemOrcamento({
        projetoId: newPrj.id,
        codigo: item.codigo,
        descricao: item.descricao,
        ambiente: preset.nome,
        medidas: item.medidas,
        material: item.material,
        acabamento: item.acabamento,
        quantidade: item.quantidade,
        custoUnitario: item.custoUnitario,
        precoVenda: Math.round(item.custoUnitario * markupMultiplier),
        margemLucroPercent: margemLucroBrutoPercent,
      });
    });

    setSelectedProjetoId(newPrj.id);
    setIsImportModalOpen(false);
  };

  // Simular Upload de arquivo customizado Promob / SketchUp
  const handleCustomFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSimulandoUpload(true);
    setUploadedFileName(file.name);

    setTimeout(() => {
      const isSkp = file.name.endsWith('.skp');
      const software: SoftwareOrigem = isSkp ? 'sketchup' : 'promob';
      const ambienteNome = file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " ");

      const targetNegocio = negocios.find(n => n.id === activeProject?.negocioId) || negocios[0];

      const newPrj = criarProjeto({
        negocioId: targetNegocio?.id || 'neg_default',
        nomeAmbiente: ambienteNome,
        softwareOrigem: software,
        arquivoNome: file.name,
        versao: 'v1.0',
        statusProjeto: 'aguardando_aprovacao',
        valorCalculado: 0,
      });

      // Gera lista de peças extraída da engenharia 3D
      const pecasGeradas = [
        {
          codigo: 'MOD-LATERAIS',
          descricao: `Laterais Estruturais MDF 18mm (${ambienteNome})`,
          medidas: { larguraMm: 580, alturaMm: 2200, profundidadeMm: 18 },
          material: 'MDF 18mm Branco Tx',
          acabamento: 'Borda PVC 1mm',
          quantidade: 4,
          custoUnitario: 320,
        },
        {
          codigo: 'MOD-PORTAS',
          descricao: `Portas de Giro com Amortecimento (${ambienteNome})`,
          medidas: { larguraMm: 450, alturaMm: 2160, profundidadeMm: 18 },
          material: 'MDF 18mm Amadeirado',
          acabamento: 'Borda PVC 2mm',
          quantidade: 4,
          custoUnitario: 410,
        },
        {
          codigo: 'MOD-PRATELEIRAS',
          descricao: `Prateleiras Móveis c/ Suporte Invisível (${ambienteNome})`,
          medidas: { larguraMm: 864, alturaMm: 18, profundidadeMm: 550 },
          material: 'MDF 18mm Branco Tx',
          acabamento: 'Borda 4 Lados 1mm',
          quantidade: 6,
          custoUnitario: 110,
        }
      ];

      pecasGeradas.forEach(p => {
        criarItemOrcamento({
          projetoId: newPrj.id,
          codigo: p.codigo,
          descricao: p.descricao,
          ambiente: ambienteNome,
          medidas: p.medidas,
          material: p.material,
          acabamento: p.acabamento,
          quantidade: p.quantidade,
          custoUnitario: p.custoUnitario,
          precoVenda: Math.round(p.custoUnitario * markupMultiplier),
          margemLucroPercent: margemLucroBrutoPercent,
        });
      });

      setSelectedProjetoId(newPrj.id);
      setSimulandoUpload(false);
      setIsImportModalOpen(false);
    }, 800);
  };

  const handleCreateManualItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject || !itemDescricao) return;

    const precoVendaCalculado = Math.round(custo * markupMultiplier);

    criarItemOrcamento({
      projetoId: activeProject.id,
      codigo: itemCodigo || `MOD-${Math.floor(Math.random() * 900 + 100)}`,
      descricao: itemDescricao,
      ambiente: activeProject.nomeAmbiente,
      medidas: {
        larguraMm: Number(largura),
        alturaMm: Number(altura),
        profundidadeMm: Number(profundidade),
      },
      material,
      acabamento,
      quantidade: 1,
      custoUnitario: Number(custo),
      precoVenda: precoVendaCalculado,
      margemLucroPercent: margemLucroBrutoPercent,
    });

    setIsNewItemModalOpen(false);
    setItemDescricao('');
    setItemCodigo('');
  };

  // Sincroniza o valor de venda calculado com o Negócio no CRM e avança para a etapa de Orçamento
  const handleSincronizarComCrm = () => {
    if (!activeProject) return;
    editarProjeto(activeProject.id, { valorCalculado: totalVendaCalculada, statusProjeto: 'aprovado_cliente' });
    
    if (activeProject.negocioId) {
      editarNegocio(activeProject.negocioId, {
        valorEstimado: totalVendaCalculada,
        etapaFunil: 'apresentacao_orcamento' // Avança no funil
      });
    }

    setAbaAtiva('crm');
  };

  return (
    <div id="projetos-view" className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-800/60 flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5" />
              <span>ENGENHARIA CAD/BIM & ORÇAMENTAÇÃO</span>
            </span>
            <span className="text-xs text-zinc-400">•</span>
            <span className="text-xs font-semibold text-zinc-400">
              Ambientes: <strong className="text-zinc-200">{projetos.length}</strong>
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white mt-1">
            Importador 3D (Promob / SketchUp) & Markup
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Importe seu arquivo 3D para extrair automaticamente a lista de peças, aplicar Markup de marcenaria e gerar o orçamento executivo.
          </p>
        </div>

        {/* Botão de Importação 3D */}
        <button
          id="btn-importar-3d"
          onClick={() => setIsImportModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md cursor-pointer self-start sm:self-auto transition-all"
        >
          <Upload className="w-4 h-4" />
          <span>Importar Projeto Promob / SketchUp</span>
        </button>
      </div>

      {/* Main Grid: Projects List + Markup & Parts Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Projects Selector List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Projetos 3D Importados ({projetos.length})
            </span>
          </div>

          <div className="space-y-2.5">
            {projetos.map((p) => {
              const isSelected = p.id === activeProject?.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedProjetoId(p.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-zinc-900 border-cyan-500/80 shadow-md ring-1 ring-cyan-500/30'
                      : 'bg-white dark:bg-zinc-900/60 border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono uppercase ${
                        p.softwareOrigem === 'promob'
                          ? 'bg-rose-950/60 text-rose-400 border border-rose-800/60'
                          : 'bg-red-950/60 text-red-400 border border-red-800/60'
                      }`}>
                        {p.softwareOrigem}
                      </span>
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-100 truncate">
                        {p.nomeAmbiente}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        excluirProjeto(p.id);
                      }}
                      className="text-zinc-400 hover:text-rose-500 p-0.5 cursor-pointer transition-colors"
                      title="Excluir ambiente"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-2.5 font-mono">
                    <span className="truncate max-w-[180px]">{p.arquivoNome}</span>
                    <span className="font-bold text-cyan-400 px-1.5 py-0.2 rounded bg-cyan-950/40 border border-cyan-800/40">
                      {p.versao}
                    </span>
                  </div>
                </div>
              );
            })}

            {projetos.length === 0 && (
              <div className="p-8 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs text-zinc-400">
                Nenhum projeto 3D cadastrado. Clique no botão acima para importar.
              </div>
            )}
          </div>
        </div>

        {/* Right: Markup Engine + Parts List */}
        <div className="lg:col-span-8 space-y-5">
          {activeProject ? (
            <div className="space-y-5">
              
              {/* Painel de Markup e Formação de Preço */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800 gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Calculator className="w-4 h-4 text-cyan-400" />
                      <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                        Motor de Markup & Precificação
                      </h2>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Ajuste o multiplicador de Markup para calcular automaticamente o preço de venda e margem líquida.
                    </p>
                  </div>

                  <button
                    onClick={handleSincronizarComCrm}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
                  >
                    <span>Salvar & Avançar no CRM</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Slider de Markup */}
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-700/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-200">
                      Multiplicador de Markup
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-mono font-bold text-cyan-400">
                        {markupMultiplier.toFixed(2)}x
                      </span>
                      <span className="text-[11px] text-zinc-400 font-mono">
                        (Margem Bruta: {margemLucroBrutoPercent}%)
                      </span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min="1.5"
                    max="3.5"
                    step="0.05"
                    value={markupMultiplier}
                    onChange={(e) => setMarkupMultiplier(Number(e.target.value))}
                    className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />

                  <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                    <span>1.50x (Margem 33%)</span>
                    <span>2.00x (Margem 50%)</span>
                    <span>2.50x (Margem 60%)</span>
                    <span>3.00x (Margem 66%)</span>
                    <span>3.50x (Margem 71%)</span>
                  </div>
                </div>

                {/* Resumo Financeiro da Composição */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <span className="text-zinc-400 block text-[11px] font-semibold">Custo Direto Fabril</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100 font-mono text-base">
                      {totalCustoInsumos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>

                  <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <span className="text-zinc-400 block text-[11px] font-semibold">Preço Sugerido (com Markup)</span>
                    <span className="font-bold text-emerald-400 font-mono text-base">
                      {totalVendaCalculada.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>

                  <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <span className="text-zinc-400 block text-[11px] font-semibold">Lucro Bruto Estimado</span>
                    <span className="font-bold text-cyan-400 font-mono text-base">
                      {(totalVendaCalculada - totalCustoInsumos).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Lista Detalhada de Peças e Módulos (L x A x P em mm) */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                      Lista de Peças & Módulos Extraídos ({activeItems.length})
                    </h3>
                    <span className="text-[11px] text-zinc-400">
                      Ambiente: <strong>{activeProject.nomeAmbiente}</strong> • Origem: <strong className="uppercase">{activeProject.softwareOrigem}</strong>
                    </span>
                  </div>

                  <button
                    id="btn-adicionar-peca"
                    onClick={() => setIsNewItemModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar Peça</span>
                  </button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-50 dark:bg-zinc-800/80 text-zinc-400 font-semibold border-b border-zinc-200 dark:border-zinc-800 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="px-3 py-2.5">Código</th>
                        <th className="px-3 py-2.5">Módulo / Peça</th>
                        <th className="px-3 py-2.5">Medidas (L × A × P)</th>
                        <th className="px-3 py-2.5">Material & Acabamento</th>
                        <th className="px-3 py-2.5">Custo Unitário</th>
                        <th className="px-3 py-2.5">Venda Sugerida</th>
                        <th className="px-3 py-2.5 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                      {activeItems.map((item) => {
                        const vendaCalculadaItem = Math.round(item.custoUnitario * markupMultiplier);
                        return (
                          <tr key={item.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40">
                            <td className="px-3 py-2.5 font-mono text-cyan-400 font-bold text-[11px]">
                              {item.codigo}
                            </td>
                            <td className="px-3 py-2.5 font-semibold text-zinc-800 dark:text-zinc-200">
                              {item.descricao}
                            </td>
                            <td className="px-3 py-2.5 font-mono text-zinc-600 dark:text-zinc-300">
                              {item.medidas.larguraMm} × {item.medidas.alturaMm} × {item.medidas.profundidadeMm} mm
                            </td>
                            <td className="px-3 py-2.5 text-zinc-400 text-[11px]">
                              {item.material} • {item.acabamento}
                            </td>
                            <td className="px-3 py-2.5 font-mono text-zinc-600 dark:text-zinc-300">
                              {item.custoUnitario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </td>
                            <td className="px-3 py-2.5 font-mono font-bold text-emerald-400">
                              {vendaCalculadaItem.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </td>
                            <td className="px-3 py-2.5 text-right">
                              <button
                                onClick={() => excluirItemOrcamento(item.id)}
                                className="text-zinc-400 hover:text-rose-500 p-1 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}

                      {activeItems.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-3 py-8 text-center text-zinc-400">
                            Nenhuma peça catalogada para este projeto ainda.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          ) : (
            <div className="p-12 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl text-zinc-400 text-xs">
              Selecione um projeto ao lado para ver os itens de orçamento e Markup.
            </div>
          )}
        </div>

      </div>

      {/* Modal Importador 3D Promob & SketchUp */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-zinc-950/70 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 w-full max-w-xl shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                  Importador de Projetos 3D (Promob / SketchUp)
                </h3>
              </div>
              <button onClick={() => setIsImportModalOpen(false)} className="text-zinc-400 hover:text-zinc-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dropzone de Upload Real / Simulado */}
            <div className="relative border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-cyan-500 dark:hover:border-cyan-500 rounded-2xl p-6 text-center space-y-2 transition-colors cursor-pointer bg-zinc-50 dark:bg-zinc-800/40">
              <input
                type="file"
                accept=".promob,.skp,.xml,.csv"
                onChange={handleCustomFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="p-3 bg-cyan-950/60 border border-cyan-800/60 rounded-full w-12 h-12 flex items-center justify-center mx-auto text-cyan-400">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  {simulandoUpload ? `Processando arquivo ${uploadedFileName}...` : 'Arraste seu arquivo .promob, .skp ou .xml aqui'}
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Ou clique para selecionar do seu computador (Promob Cut Pro / SketchUp 3D)
                </p>
              </div>
            </div>

            {/* Biblioteca de Presets de Arquitetura */}
            <div className="space-y-3">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                Ou importe um modelo padrão pré-configurado:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PRESET_PROJETOS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleImportPreset(preset)}
                    className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 hover:border-cyan-500 text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded uppercase ${
                        preset.software === 'promob' ? 'bg-rose-950/60 text-rose-400 border border-rose-800/60' : 'bg-red-950/60 text-red-400 border border-red-800/60'
                      }`}>
                        {preset.software}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        {preset.itens.length} módulos
                      </span>
                    </div>

                    <div className="font-bold text-xs text-zinc-900 dark:text-zinc-100 mt-2 group-hover:text-cyan-400 transition-colors">
                      {preset.nome}
                    </div>

                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
                      {preset.descricao}
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Modal Adicionar Peça / Item Manual */}
      {isNewItemModalOpen && (
        <div className="fixed inset-0 bg-zinc-950/70 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                Adicionar Peça / Módulo ao Orçamento
              </h3>
              <button onClick={() => setIsNewItemModalOpen(false)} className="text-zinc-400 hover:text-zinc-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManualItem} className="space-y-3.5 mt-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Código
                  </label>
                  <input
                    type="text"
                    value={itemCodigo}
                    onChange={(e) => setItemCodigo(e.target.value)}
                    placeholder="ARM-01"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-mono"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Descrição do Módulo *
                  </label>
                  <input
                    type="text"
                    required
                    value={itemDescricao}
                    onChange={(e) => setItemDescricao(e.target.value)}
                    placeholder="Ex: Armário Superior 2 Portas Basculantes"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Medidas em Milímetros (L × A × P)
                </label>
                <div className="grid grid-cols-3 gap-2 font-mono">
                  <input
                    type="number"
                    value={largura}
                    onChange={(e) => setLargura(Number(e.target.value))}
                    placeholder="Largura mm"
                    className="px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                  />
                  <input
                    type="number"
                    value={altura}
                    onChange={(e) => setAltura(Number(e.target.value))}
                    placeholder="Altura mm"
                    className="px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                  />
                  <input
                    type="number"
                    value={profundidade}
                    onChange={(e) => setProfundidade(Number(e.target.value))}
                    placeholder="Prof mm"
                    className="px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Custo Fabril Direto (R$)
                  </label>
                  <input
                    type="number"
                    value={custo}
                    onChange={(e) => setCusto(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Markup Aplicado
                  </label>
                  <div className="w-full px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-cyan-400 font-mono font-bold">
                    {markupMultiplier.toFixed(2)}x = {(custo * markupMultiplier).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </div>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsNewItemModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold cursor-pointer transition-colors"
                >
                  Salvar Peça
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
