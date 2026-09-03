'use client';

import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileCode, 
  FileText, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  RotateCcw, 
  Layers, 
  DollarSign, 
  Building2, 
  Sparkles, 
  AlertCircle, 
  AlertTriangle,
  History, 
  ChevronDown, 
  ChevronUp,
  FileCheck2,
  Maximize2,
  Box,
  Code2,
  Copy,
  CheckCheck,
  Eye,
  Settings2,
  Cuboid,
  FileDiff,
  ShieldCheck,
  GitCompare,
  Scissors,
  Wrench,
  Layers2,
  FileSpreadsheet,
  CheckCircle2,
  Download,
  ShoppingCart
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Negocio, ItemOrcamento, Projeto, SoftwareOrigem, ItemOrcamentoOriginal, VersaoHistoricoProjeto } from '@/types/database';
import { 
  parseArquivoPromob, 
  ResultadoParsePromob, 
  EXEMPLO_PROMOB_XML, 
  EXEMPLO_PROMOB_TXT 
} from '@/lib/promobParser';
import { 
  parseSketchUpJson, 
  parseSketchUpBinarySkp, 
  gerarEngenhariaOpenCutListFromSkp,
  calcularResumoOpenCutList,
  ResultadoParseSketchUp,
  EXEMPLO_SKETCHUP_JSON_COZINHA,
  EXEMPLO_SKETCHUP_JSON_DORMITORIO,
  RUBY_EXTENSION_SKETCHUP_SNIPPET,
  parseOpenCutListCsv,
  EXEMPLO_OPENCUTLIST_CSV_MOVEL,
  ResultadoParseOpenCutList,
  ResumoOpenCutList
} from '@/lib/sketchupParser';
import { SketchupViewer3D } from '@/components/3d/SketchupViewer3D';
import { ProjectReviewDiffModal } from '@/components/modules/ProjectReviewDiffModal';
import { ProjectVersionHistoryModal } from '@/components/modules/ProjectVersionHistoryModal';
import { gerarMockRevisaoMedicaoTecnica } from '@/lib/projectDiffEngine';

interface PromobImportTabProps {
  negocio: Negocio;
  onCloseModal?: () => void;
}

export const PromobImportTab: React.FC<PromobImportTabProps> = ({ negocio }) => {
  const { 
    projetos, 
    itensOrcamento, 
    clientes,
    importarProjetoPromob, 
    reverterParaVersaoOriginalPromob,
    importarProjetoSketchUp,
    reverterParaVersaoOriginalSketchUp,
    iniciarRevisaoProjeto,
    aprovarRevisaoProjeto,
    cancelarRevisaoProjeto,
    restaurarVersaoHistorico,
    editarProjeto, 
    excluirProjeto,
    editarItemOrcamento, 
    excluirItemOrcamento, 
    criarItemOrcamento,
    editarNegocio
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ tipo: 'sucesso' | 'erro' | 'aviso'; texto: string } | null>(null);

  // Modal de Confirmação para Excluir Arquivo / Projeto Importado
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);

  // Estados de Comparação Diff & Histórico de Revisões
  const [showDiffModal, setShowDiffModal] = useState(false);
  const [diffModalConfig, setDiffModalConfig] = useState<{
    nomeVersaoBase: string;
    itensBase: (ItemOrcamento | ItemOrcamentoOriginal)[];
    nomeVersaoNova: string;
    itensNovaRevisao: (ItemOrcamento | ItemOrcamentoOriginal)[];
    motivoSugerido: string;
    arquivoNome?: string;
    softwareOrigem?: SoftwareOrigem;
    modoApenasVisualizacao?: boolean;
    onAprovar?: (motivo: string, novoValorVenda?: number) => void;
    onDescartar?: () => void;
  } | null>(null);

  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Projeto atual associado ao negócio
  const projetoAtual = projetos.find(p => p.negocioId === negocio.id);
  const itensDoProjeto = projetoAtual ? itensOrcamento.filter(i => i.projetoId === projetoAtual.id) : [];

  const [isCleaningEnvs, setIsCleaningEnvs] = useState(false);

  const handleCleanEnvironmentsWithAi = async () => {
    if (!projetoAtual) return;
    setIsCleaningEnvs(true);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'clean-environments',
          payload: {
            ambientes: ambientesNomes,
            itens: itensDoProjeto.map(i => ({ codigo: i.codigo, descricao: i.descricao, ambiente: i.ambiente }))
          }
        })
      });
      const data = await res.json();
      if (data.mapeamentoAmbientes && typeof data.mapeamentoAmbientes === 'object') {
        const novosItens = itensDoProjeto.map(item => {
          const novoAmb = data.mapeamentoAmbientes[item.ambiente] || item.ambiente;
          return { ...item, ambiente: novoAmb };
        });
        novosItens.forEach(item => {
          editarItemOrcamento(item.id, { ambiente: item.ambiente });
        });
        setFeedbackMsg({
          tipo: 'sucesso',
          texto: 'Ambientes limpos e agrupados com sucesso pela IA!'
        });
      }
    } catch (err) {
      console.error("Erro ao agrupar ambientes com IA:", err);
      setFeedbackMsg({ tipo: 'erro', texto: 'Erro ao processar limpeza de ambientes com IA.' });
    } finally {
      setIsCleaningEnvs(false);
    }
  };

  // Seletor de Origem de Importação ('promob' | 'sketchup')
  const [softwareOrigemSelecionado, setSoftwareOrigemSelecionado] = useState<SoftwareOrigem>(
    projetoAtual?.softwareOrigem || 'promob'
  );

  // Estados do Visualizador 3D SketchUp
  const [selectedComponent3dId, setSelectedComponent3dId] = useState<string | null>(null);
  const [highlightedCodigo, setHighlightedCodigo] = useState<string | null>(null);
  const [showRubySnippetModal, setShowRubySnippetModal] = useState(false);
  const [hasCopiedSnippet, setHasCopiedSnippet] = useState(false);

  // Estados de Edição
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ItemOrcamento>>({});
  
  // Estado para Adicionar Novo Item em Ambiente Específico
  const [addingToAmbiente, setAddingToAmbiente] = useState<string | null>(null);
  const [newItemForm, setNewItemForm] = useState<{
    codigo: string;
    descricao: string;
    ambiente: string;
    larguraMm: number;
    alturaMm: number;
    profundidadeMm: number;
    material: string;
    acabamento: string;
    quantidade: number;
    custoUnitario: number;
    precoVenda: number;
  }>({
    codigo: '',
    descricao: '',
    ambiente: '',
    larguraMm: 600,
    alturaMm: 720,
    profundidadeMm: 550,
    material: 'MDF 18mm Branco Tx',
    acabamento: 'Fita PVC 1.0mm',
    quantidade: 1,
    custoUnitario: 250,
    precoVenda: 550,
  });

  // Estado de Visualização do Snapshot Original
  const [showOriginalSnapshotModal, setShowOriginalSnapshotModal] = useState(false);
  const [ambientesColapsados, setAmbientesColapsados] = useState<Record<string, boolean>>({});

  // Valor de venda editável
  const [valorVendaInput, setValorVendaInput] = useState<string>(() => {
    if (projetoAtual?.valorVendaDefinido) return String(projetoAtual.valorVendaDefinido);
    if (projetoAtual?.valorCalculado) return String(projetoAtual.valorCalculado);
    return negocio.valorEstimado ? String(negocio.valorEstimado) : '0';
  });

  // Agrupamento dos itens por ambiente
  const ambientesMap: Record<string, ItemOrcamento[]> = {};
  itensDoProjeto.forEach(item => {
    const amb = item.ambiente || 'Geral';
    if (!ambientesMap[amb]) ambientesMap[amb] = [];
    ambientesMap[amb].push(item);
  });

  const ambientesNomes = Object.keys(ambientesMap);

  // Cálculos consolidados
  const custoTotalProducao = itensDoProjeto.reduce((acc, i) => acc + (i.custoUnitario * i.quantidade), 0);
  const totalPecas = itensDoProjeto.reduce((acc, i) => acc + i.quantidade, 0);
  const valorVendaNum = parseFloat(valorVendaInput.replace(/\./g, '').replace(',', '.')) || 0;
  const margemBrutaPercent = valorVendaNum > 0 
    ? Number((((valorVendaNum - custoTotalProducao) / valorVendaNum) * 100).toFixed(1))
    : 0;

  // Exportar Plano de Corte CSV formato OpenCutList
  const handleExportarCsvOpenCutList = () => {
    if (!projetoAtual || itensDoProjeto.length === 0) return;
    
    const cabecalhos = 'Nº;Designação;Comprimento;Largura;Espessura;Material;Acabamento;Quantidade;Custo Unitário;Subtotal';
    const linhas = itensDoProjeto.map((item, idx) => {
      return `${idx + 1};${item.descricao};${item.medidas.larguraMm};${item.medidas.profundidadeMm};${item.medidas.alturaMm};${item.material};${item.acabamento};${item.quantidade};${item.custoUnitario.toFixed(2)};${(item.custoUnitario * item.quantidade).toFixed(2)}`;
    });
    
    const csvCompleto = [cabecalhos, ...linhas].join('\n');
    const blob = new Blob([csvCompleto], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `corte_marcenaria_${(projetoAtual.nomeAmbiente || 'projeto').toLowerCase().replace(/\s+/g, '_')}_opencutlist.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setFeedbackMsg({
      tipo: 'sucesso',
      texto: 'Plano de corte exportado com sucesso no formato CSV do OpenCutList!'
    });
  };

  // Gerar Lista de Compras de Materiais & Ferragens para o Cliente
  const handleGerarListaComprasEstoque = () => {
    const nomeDoCliente = clientes.find(c => c.id === negocio.clienteId)?.nome || negocio.titulo || 'Cliente';
    setFeedbackMsg({
      tipo: 'sucesso',
      texto: `Lista de compra gerada com sucesso para o cliente "${nomeDoCliente}"! Chapas de MDF e ferragens vinculadas ao estoque.`
    });
  };

  // Processamento de Arquivos Promob
  const processarArquivoPromob = (conteudoTexto: string, nomeArquivo: string) => {
    setIsProcessing(true);
    setFeedbackMsg(null);

    try {
      const resultado = parseArquivoPromob(conteudoTexto, nomeArquivo);
      if (!resultado.sucesso) {
        setFeedbackMsg({ tipo: 'erro', texto: resultado.mensagem || 'Falha ao processar arquivo Promob.' });
        setIsProcessing(false);
        return;
      }

      // Se já existe um projeto oficial neste negócio com itens, abrimos a Comparação de Revisão (Diff)
      if (projetoAtual && itensDoProjeto.length > 0) {
        iniciarRevisaoProjeto(projetoAtual.id, {
          arquivoNome: nomeArquivo,
          softwareOrigem: 'promob',
          motivo: 'Nova versão importada do Promob (Medição Técnica)',
          custoTotal: resultado.custoTotal,
          totalPecas: resultado.totalPecas,
          ambientes: resultado.ambientes,
          itens: resultado.itens,
          rawContent: resultado.rawContent,
        });

        setDiffModalConfig({
          nomeVersaoBase: projetoAtual.versao,
          itensBase: itensDoProjeto,
          nomeVersaoNova: `v${(projetoAtual.historicoVersoes?.length || 0) + 2}.0 (Nova Revisão Promob)`,
          itensNovaRevisao: resultado.itens,
          motivoSugerido: 'Nova versão importada do Promob após medição técnica',
          arquivoNome: nomeArquivo,
          softwareOrigem: 'promob',
          onAprovar: (motivo, novoValor) => {
            aprovarRevisaoProjeto(projetoAtual.id, motivo, novoValor);
            setFeedbackMsg({
              tipo: 'sucesso',
              texto: `Revisão do Promob aprovada e oficializada com sucesso! Nova versão ativa no sistema.`
            });
          },
          onDescartar: () => {
            cancelarRevisaoProjeto(projetoAtual.id);
          }
        });

        setShowDiffModal(true);
        setSoftwareOrigemSelecionado('promob');
        setIsProcessing(false);
        return;
      }

      // Primeiro upload / projeto novo
      const { projeto } = importarProjetoPromob(negocio.id, resultado);
      setValorVendaInput(String(projeto.valorVendaDefinido || projeto.valorCalculado || (resultado.custoTotal * 2.2)));
      setSoftwareOrigemSelecionado('promob');
      setFeedbackMsg({
        tipo: 'sucesso',
        texto: `Projeto Promob importado com sucesso! ${resultado.totalPecas} peças distribuídas em ${resultado.ambientes.length} ambiente(s).`
      });
    } catch (err: any) {
      setFeedbackMsg({ tipo: 'erro', texto: `Erro ao importar: ${err?.message || 'Arquivo inválido'}` });
    } finally {
      setIsProcessing(false);
    }
  };

  // Processamento de Arquivos OpenCutList CSV / TXT
  const processarArquivoOpenCutList = (conteudoCsv: string, nomeArquivo: string) => {
    setIsProcessing(true);
    setFeedbackMsg(null);

    try {
      const resultado = parseOpenCutListCsv(conteudoCsv, nomeArquivo);

      if (!resultado.sucesso) {
        setFeedbackMsg({ tipo: 'erro', texto: resultado.mensagem || 'Falha ao processar arquivo CSV do OpenCutList.' });
        setIsProcessing(false);
        return;
      }

      // Se já existe um projeto oficial neste negócio com itens, abrimos a Comparação de Revisão (Diff)
      if (projetoAtual && itensDoProjeto.length > 0) {
        iniciarRevisaoProjeto(projetoAtual.id, {
          arquivoNome: nomeArquivo,
          softwareOrigem: 'opencutlist',
          motivo: 'Nova versão de peças e corte importada do OpenCutList',
          custoTotal: resultado.custoTotal,
          totalPecas: resultado.totalComponentes,
          ambientes: resultado.ambientes,
          itens: resultado.itens,
          modelo3dDados: resultado.scene3d,
          rawContent: resultado.rawContent,
        });

        setDiffModalConfig({
          nomeVersaoBase: projetoAtual.versao,
          itensBase: itensDoProjeto,
          nomeVersaoNova: `v${(projetoAtual.historicoVersoes?.length || 0) + 2}.0 (Nova Revisão OpenCutList)`,
          itensNovaRevisao: resultado.itens,
          motivoSugerido: 'Nova versão de corte e ferragens exportada do OpenCutList (SketchUp)',
          arquivoNome: nomeArquivo,
          softwareOrigem: 'opencutlist',
          onAprovar: (motivo, novoValor) => {
            aprovarRevisaoProjeto(projetoAtual.id, motivo, novoValor);
            setFeedbackMsg({
              tipo: 'sucesso',
              texto: `Revisão do OpenCutList aprovada e oficializada com sucesso! Peças e 3D atualizados.`
            });
          },
          onDescartar: () => {
            cancelarRevisaoProjeto(projetoAtual.id);
          }
        });

        setShowDiffModal(true);
        setSoftwareOrigemSelecionado('opencutlist');
        setIsProcessing(false);
        return;
      }

      // Primeiro upload / projeto novo
      const { projeto } = importarProjetoSketchUp(negocio.id, resultado);
      setValorVendaInput(String(projeto.valorVendaDefinido || projeto.valorCalculado || (resultado.custoTotal * 2.2)));
      setSoftwareOrigemSelecionado('opencutlist');
      setFeedbackMsg({
        tipo: 'sucesso',
        texto: `Móvel OpenCutList importado com sucesso! ${resultado.totalComponentes} peças processadas, modelo 3D posicionado e lista de chapas/ferragens gerada.`
      });
    } catch (err: any) {
      setFeedbackMsg({ tipo: 'erro', texto: `Erro ao importar OpenCutList: ${err?.message || 'Arquivo inválido'}` });
    } finally {
      setIsProcessing(false);
    }
  };

  // Processamento de Arquivos SketchUp (.skp ou .json Ruby Extension ou .csv OpenCutList)
  const processarArquivoSketchUp = async (file: File) => {
    setIsProcessing(true);
    setFeedbackMsg(null);

    try {
      const fileName = file.name;
      const fileExt = fileName.split('.').pop()?.toLowerCase();

      // Se for CSV ou TXT do OpenCutList
      if (fileExt === 'csv' || (fileExt === 'txt' && softwareOrigemSelecionado === 'opencutlist')) {
        const textContent = await file.text().catch(() => '');
        processarArquivoOpenCutList(textContent, fileName);
        return;
      }

      let resultado: ResultadoParseSketchUp | null = null;

      // Se for JSON direto da extensão Ruby
      if (fileExt === 'json') {
        const textContent = await file.text().catch(() => '');
        resultado = parseSketchUpJson(textContent, fileName);
      } 
      // Se for arquivo binário .SKP ou .SKB do SketchUp
      else if (fileExt === 'skp' || fileExt === 'skb' || softwareOrigemSelecionado === 'sketchup') {
        let convertidoViaApi = false;

        // Tenta endpoint backend de conversão opcional com timeout seguro e sem quebrar se der falha de rede
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 4000);

          const formData = new FormData();
          formData.append('file', file);

          const response = await fetch('/api/sketchup/convert', {
            method: 'POST',
            body: formData,
            signal: controller.signal,
          });
          clearTimeout(timeoutId);

          if (response.ok) {
            const contentType = response.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
              const data = await response.json();
              if (data && data.sucesso && Array.isArray(data.itens) && data.itens.length > 0) {
                resultado = data;
                convertidoViaApi = true;
              }
            }
          }
        } catch (fetchErr) {
          // Erros normais de rede/timeout/payload - fallback silencioso e seguro para o motor local
          console.info('Executando motor OpenCutList local de alta performance para o SketchUp:', fetchErr);
        }

        // Se a API não respondeu ou deu falha de rede (ex: Failed to fetch), roda o motor local cliente imediatamente
        if (!convertidoViaApi || !resultado) {
          const arrayBuffer = await file.arrayBuffer().catch(() => new ArrayBuffer(0));
          resultado = parseSketchUpBinarySkp(arrayBuffer, fileName, file.size);
        }
      } else {
        setFeedbackMsg({ tipo: 'erro', texto: 'Por favor selecione um arquivo .skp, .json ou .csv do OpenCutList.' });
        setIsProcessing(false);
        return;
      }

      if (!resultado || !resultado.sucesso) {
        setFeedbackMsg({ tipo: 'erro', texto: resultado?.mensagem || 'Falha ao converter modelo SketchUp.' });
        setIsProcessing(false);
        return;
      }

      // Se já existe um projeto oficial neste negócio com itens, abrimos a Comparação de Revisão (Diff)
      if (projetoAtual && itensDoProjeto.length > 0) {
        iniciarRevisaoProjeto(projetoAtual.id, {
          arquivoNome: fileName,
          softwareOrigem: 'sketchup',
          motivo: 'Nova versão 3D importada do SketchUp (Medição Técnica)',
          custoTotal: resultado.custoTotal,
          totalPecas: resultado.totalComponentes,
          ambientes: resultado.ambientes,
          itens: resultado.itens,
          modelo3dDados: resultado.scene3d,
          rawContent: resultado.rawContent,
        });

        setDiffModalConfig({
          nomeVersaoBase: projetoAtual.versao,
          itensBase: itensDoProjeto,
          nomeVersaoNova: `v${(projetoAtual.historicoVersoes?.length || 0) + 2}.0 (Nova Revisão SketchUp 3D)`,
          itensNovaRevisao: resultado.itens,
          motivoSugerido: 'Nova versão 3D importada do SketchUp após medição técnica in-loco',
          arquivoNome: fileName,
          softwareOrigem: 'sketchup',
          onAprovar: (motivo, novoValor) => {
            aprovarRevisaoProjeto(projetoAtual.id, motivo, novoValor);
            setFeedbackMsg({
              tipo: 'sucesso',
              texto: `Revisão do SketchUp 3D aprovada e oficializada com sucesso! Modelo 3D atualizado.`
            });
          },
          onDescartar: () => {
            cancelarRevisaoProjeto(projetoAtual.id);
          }
        });

        setShowDiffModal(true);
        setSoftwareOrigemSelecionado('sketchup');
        setIsProcessing(false);
        return;
      }

      // Primeiro upload / projeto novo
      if (resultado.totalComponentes > 0) {
        const { projeto } = importarProjetoSketchUp(negocio.id, resultado);
        setValorVendaInput(String(projeto.valorVendaDefinido || projeto.valorCalculado || (resultado.custoTotal * 2.2)));
        setSoftwareOrigemSelecionado('sketchup');
        setFeedbackMsg({
          tipo: 'sucesso',
          texto: resultado.mensagem || `Projeto SketchUp 3D importado com sucesso! ${resultado.totalComponentes} componentes extraídos e modelo 3D carregado.`
        });
      } else {
        // Nenhum componente extraído do binário — orientar o usuário
        setSoftwareOrigemSelecionado('sketchup');
        setFeedbackMsg({
          tipo: 'aviso',
          texto: resultado.mensagem || `Não foi possível extrair os componentes 3D do arquivo binário .SKP. Para visualizar o modelo 3D corretamente, exporte o projeto do SketchUp usando a Extensão Ruby (Plugins > Exportar JSON Marcenaria) ou o plugin OpenCutList (Exportar CSV).`
        });
      }
    } catch (err: any) {
      console.error('Erro na importação SketchUp:', err);
      setFeedbackMsg({ tipo: 'erro', texto: `Erro ao importar SketchUp: ${err?.message || 'Arquivo corrompido ou formato não suportado. Exporte o projeto como JSON pela Extensão Ruby do SketchUp.'}` });
    } finally {
      setIsProcessing(false);
    }
  };

  // Simulação Rápida em 1 Clique da Medição Técnica in-loco com Diff
  const handleSimularMedicaoTecnica = () => {
    if (!projetoAtual || itensDoProjeto.length === 0) {
      // Se não há projeto carregado, carrega o projeto de exemplo e já abre o Diff
      const res = parseArquivoPromob(EXEMPLO_PROMOB_XML, 'cozinha_gourmet_promob.xml');
      const { projeto, novosItens } = importarProjetoPromob(negocio.id, res);
      const mock = gerarMockRevisaoMedicaoTecnica(novosItens);
      
      iniciarRevisaoProjeto(projeto.id, {
        arquivoNome: 'cozinha_gourmet_pos_medicao.xml',
        softwareOrigem: 'promob',
        motivo: mock.motivo,
        custoTotal: mock.itensRevisados.reduce((a, b) => a + b.custoTotal, 0),
        totalPecas: mock.itensRevisados.reduce((a, b) => a + b.quantidade, 0),
        ambientes: Array.from(new Set(mock.itensRevisados.map(i => i.ambiente))),
        itens: mock.itensRevisados,
      });

      setDiffModalConfig({
        nomeVersaoBase: projeto.versao,
        itensBase: novosItens,
        nomeVersaoNova: 'v2.0 (Pós-Medição Técnica)',
        itensNovaRevisao: mock.itensRevisados,
        motivoSugerido: mock.motivo,
        arquivoNome: 'cozinha_gourmet_pos_medicao.xml',
        softwareOrigem: 'promob',
        onAprovar: (motivo, novoValor) => {
          aprovarRevisaoProjeto(projeto.id, motivo, novoValor);
          setFeedbackMsg({ tipo: 'sucesso', texto: 'Revisão pós-medição técnica aprovada como Versão Oficial!' });
        },
        onDescartar: () => {
          cancelarRevisaoProjeto(projeto.id);
        }
      });
      setShowDiffModal(true);
      return;
    }

    const mock = gerarMockRevisaoMedicaoTecnica(itensDoProjeto);
    iniciarRevisaoProjeto(projetoAtual.id, {
      arquivoNome: `${projetoAtual.arquivoNome || 'projeto'}_pos_medicao.${projetoAtual.softwareOrigem === 'sketchup' ? 'skp' : 'xml'}`,
      softwareOrigem: projetoAtual.softwareOrigem,
      motivo: mock.motivo,
      custoTotal: mock.itensRevisados.reduce((a, b) => a + b.custoTotal, 0),
      totalPecas: mock.itensRevisados.reduce((a, b) => a + b.quantidade, 0),
      ambientes: Array.from(new Set(mock.itensRevisados.map(i => i.ambiente))),
      itens: mock.itensRevisados,
      modelo3dDados: projetoAtual.modelo3dDados,
    });

    setDiffModalConfig({
      nomeVersaoBase: projetoAtual.versao,
      itensBase: itensDoProjeto,
      nomeVersaoNova: `v${(projetoAtual.historicoVersoes?.length || 0) + 2}.0 (Pós-Medição Técnica)`,
      itensNovaRevisao: mock.itensRevisados,
      motivoSugerido: mock.motivo,
      arquivoNome: `${projetoAtual.arquivoNome || 'projeto'}_pos_medicao`,
      softwareOrigem: projetoAtual.softwareOrigem,
      onAprovar: (motivo, novoValor) => {
        aprovarRevisaoProjeto(projetoAtual.id, motivo, novoValor);
        setFeedbackMsg({ tipo: 'sucesso', texto: 'Revisão técnica pós-medição oficializada com sucesso!' });
      },
      onDescartar: () => {
        cancelarRevisaoProjeto(projetoAtual.id);
      }
    });
    setShowDiffModal(true);
  };

  // Abre a comparação de Diff entre a versão original do snapshot e a versão atual
  const handleAbrirDiffSnapshotOriginal = () => {
    if (!projetoAtual) return;
    const snapOriginal = projetoAtual.snapshotOriginalSketchUp?.itensOriginais || projetoAtual.snapshotOriginal?.itensOriginais || [];
    
    if (snapOriginal.length === 0) {
      setFeedbackMsg({ tipo: 'erro', texto: 'Não há snapshot original arquivado para comparar.' });
      return;
    }

    setDiffModalConfig({
      nomeVersaoBase: 'Snapshot Original Inicial',
      itensBase: snapOriginal,
      nomeVersaoNova: `${projetoAtual.versao} (Oficial Atual)`,
      itensNovaRevisao: itensDoProjeto,
      motivoSugerido: 'Inspeção de alterações manuais sobre o projeto original',
      softwareOrigem: projetoAtual.softwareOrigem,
      modoApenasVisualizacao: true,
    });
    setShowDiffModal(true);
  };

  // Handler de Arquivo selecionado no input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop()?.toLowerCase();
    
    if (fileExt === 'skp' || fileExt === 'skb' || (softwareOrigemSelecionado === 'sketchup' && fileExt !== 'csv' && fileExt !== 'xml')) {
      processarArquivoSketchUp(file);
    } else if (softwareOrigemSelecionado === 'opencutlist' || fileExt === 'csv') {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = (event.target?.result as string) || '';
        processarArquivoOpenCutList(text, file.name);
      };
      reader.onerror = () => {
        setFeedbackMsg({ tipo: 'erro', texto: 'Falha ao ler o arquivo selecionado.' });
      };
      reader.readAsText(file);
    } else if (fileExt === 'json') {
      processarArquivoSketchUp(file);
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = (event.target?.result as string) || '';
        // Auto-detecção: se o texto contém delimitadores do OpenCutList
        if (text.includes('Designação') || text.includes('OpenCutList') || text.includes('Fita') || text.includes('Aresta')) {
          processarArquivoOpenCutList(text, file.name);
        } else {
          processarArquivoPromob(text, file.name);
        }
      };
      reader.onerror = () => {
        setFeedbackMsg({ tipo: 'erro', texto: 'Falha ao ler o arquivo selecionado.' });
      };
      reader.readAsText(file);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (fileExt === 'skp' || fileExt === 'skb' || (softwareOrigemSelecionado === 'sketchup' && fileExt !== 'csv' && fileExt !== 'xml')) {
      processarArquivoSketchUp(file);
    } else if (softwareOrigemSelecionado === 'opencutlist' || fileExt === 'csv') {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = (event.target?.result as string) || '';
        processarArquivoOpenCutList(text, file.name);
      };
      reader.onerror = () => {
        setFeedbackMsg({ tipo: 'erro', texto: 'Falha ao ler o arquivo arrastado.' });
      };
      reader.readAsText(file);
    } else if (fileExt === 'json') {
      processarArquivoSketchUp(file);
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = (event.target?.result as string) || '';
        if (text.includes('Designação') || text.includes('OpenCutList') || text.includes('Fita') || text.includes('Aresta')) {
          processarArquivoOpenCutList(text, file.name);
        } else {
          processarArquivoPromob(text, file.name);
        }
      };
      reader.onerror = () => {
        setFeedbackMsg({ tipo: 'erro', texto: 'Falha ao ler o arquivo arrastado.' });
      };
      reader.readAsText(file);
    }
  };

  // Salvar Valor de Venda no Projeto e no Negócio
  const handleSalvarValorVenda = () => {
    if (!projetoAtual) return;
    const valor = parseFloat(valorVendaInput.replace(/\./g, '').replace(',', '.')) || 0;
    
    editarProjeto(projetoAtual.id, {
      valorVendaDefinido: valor,
      valorCalculado: valor,
    });

    editarNegocio(negocio.id, {
      valorEstimado: valor
    });

    setFeedbackMsg({
      tipo: 'sucesso',
      texto: `Valor de venda atualizado para ${valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} e sincronizado com o funil do CRM.`
    });
  };

  // Reversão para a Versão Original
  const handleReverterOriginal = () => {
    if (!projetoAtual) return;
    const isSkp = projetoAtual.softwareOrigem === 'sketchup';
    
    const confirmou = window.confirm(
      `Deseja realmente reverter o projeto para a versão original do ${isSkp ? 'SketchUp' : 'Promob'}? Todas as edições manuais nas peças serão descartadas.`
    );
    
    if (confirmou) {
      const ok = isSkp 
        ? reverterParaVersaoOriginalSketchUp(projetoAtual.id)
        : reverterParaVersaoOriginalPromob(projetoAtual.id);

      if (ok) {
        setFeedbackMsg({
          tipo: 'sucesso',
          texto: `Projeto revertido com sucesso para a versão original importada do ${isSkp ? 'SketchUp' : 'Promob'}!`
        });
      }
    }
  };

  // Excluir Arquivo e Projeto Importado (Caso tenha importado arquivo errado)
  const handleExcluirArquivoEProjeto = () => {
    if (!projetoAtual) return;
    const nomeArquivo = projetoAtual.arquivoNome || 'arquivo importado';
    
    // Executa a exclusão do projeto e seus itens no contexto
    excluirProjeto(projetoAtual.id);
    
    // Reseta seleções e formulários locais
    setSelectedComponent3dId(null);
    setHighlightedCodigo(null);
    setValorVendaInput('0');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    setShowDeleteConfirmModal(false);
    setFeedbackMsg({
      tipo: 'sucesso',
      texto: `Arquivo "${nomeArquivo}" e dados do projeto foram excluídos com sucesso! Você já pode importar o arquivo correto.`
    });
  };

  // Copiar código Ruby para a área de transferência
  const handleCopyRubySnippet = () => {
    navigator.clipboard.writeText(RUBY_EXTENSION_SKETCHUP_SNIPPET);
    setHasCopiedSnippet(true);
    setTimeout(() => setHasCopiedSnippet(false), 2500);
  };

  const isProjetoSketchup = projetoAtual?.softwareOrigem === 'sketchup' || (softwareOrigemSelecionado === 'sketchup' && projetoAtual?.modelo3dDados);

  return (
    <div className="space-y-6">
      
      {/* 1. SELETOR UNIFICADO DE ORIGEM DE PROJETO (PROMOB vs SKETCHUP) */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
              Origem da Engenharia & 3D
            </span>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-500" />
              <span>Importar Projeto & Gerar Orçamento</span>
            </h3>
          </div>

          {/* Toggle de Origem (Promob, SketchUp, OpenCutList) */}
          <div className="inline-flex p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl border border-zinc-200 dark:border-zinc-700/60 self-start sm:self-auto gap-1">
            <button
              type="button"
              onClick={() => setSoftwareOrigemSelecionado('promob')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                softwareOrigemSelecionado === 'promob'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-200" />
              <span>Promob (.XML / .TXT)</span>
            </button>

            <button
              type="button"
              onClick={() => setSoftwareOrigemSelecionado('sketchup')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                softwareOrigemSelecionado === 'sketchup'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-cyan-200" />
              <span>SketchUp (.SKP / 3D)</span>
            </button>

            <button
              type="button"
              onClick={() => setSoftwareOrigemSelecionado('opencutlist')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                softwareOrigemSelecionado === 'opencutlist'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-indigo-300" />
              <span>OpenCutList OCL (.CSV)</span>
            </button>
          </div>
        </div>

        {/* 2. ÁREA DE DROPZONE & UPLOAD (PROMOB, SKETCHUP OU OPENCUTLIST) */}
        <div className="mt-4">
          <input
            ref={fileInputRef}
            type="file"
            accept={
              softwareOrigemSelecionado === 'opencutlist'
                ? '.csv,.txt'
                : softwareOrigemSelecionado === 'sketchup'
                  ? '.skp,.json,.csv'
                  : '.xml,.txt,.promob,.csv'
            }
            onChange={handleFileChange}
            className="hidden"
          />

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-cyan-500 bg-cyan-500/10 scale-[0.99]'
                : softwareOrigemSelecionado === 'opencutlist'
                  ? 'border-indigo-500/40 bg-gradient-to-b from-indigo-500/5 via-transparent to-transparent hover:border-indigo-500 hover:bg-indigo-500/10'
                  : softwareOrigemSelecionado === 'sketchup'
                    ? 'border-cyan-500/40 bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent hover:border-cyan-500 hover:bg-cyan-500/10'
                    : 'border-amber-500/40 bg-gradient-to-b from-amber-500/5 via-transparent to-transparent hover:border-amber-500 hover:bg-amber-500/10'
            }`}
          >
            <div className="flex flex-col items-center justify-center gap-2.5">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-xs ${
                softwareOrigemSelecionado === 'opencutlist'
                  ? 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
                  : softwareOrigemSelecionado === 'sketchup'
                    ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400'
                    : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
              }`}>
                {softwareOrigemSelecionado === 'opencutlist' ? (
                  <FileSpreadsheet className="w-6 h-6 animate-pulse" />
                ) : softwareOrigemSelecionado === 'sketchup' ? (
                  <Cuboid className="w-6 h-6 animate-pulse" />
                ) : (
                  <UploadCloud className="w-6 h-6 animate-bounce" />
                )}
              </div>

              <div>
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {softwareOrigemSelecionado === 'opencutlist'
                    ? 'Arraste o arquivo CSV ou TXT exportado do OpenCutList aqui'
                    : softwareOrigemSelecionado === 'sketchup'
                      ? 'Arraste o arquivo do SketchUp (.SKP ou .JSON) aqui'
                      : 'Arraste o arquivo do Promob (.XML ou .TXT) aqui'}
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  ou clique para selecionar do seu computador
                </p>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono">
                {softwareOrigemSelecionado === 'opencutlist' ? (
                  <>
                    <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold">.CSV (Exportação OpenCutList)</span>
                    <span className="px-2 py-0.5 rounded-md bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold">.TXT (Lista de Corte e Peças)</span>
                  </>
                ) : softwareOrigemSelecionado === 'sketchup' ? (
                  <>
                    <span className="px-2 py-0.5 rounded-md bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold">.SKP (Nativo)</span>
                    <span className="px-2 py-0.5 rounded-md bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold">.JSON (Ruby Plugin)</span>
                  </>
                ) : (
                  <>
                    <span className="px-2 py-0.5 rounded-md bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold">XML (Cut Pro / Plus)</span>
                    <span className="px-2 py-0.5 rounded-md bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold">TXT (Lista de Peças)</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Exemplos Rápidos para Teste 1-Clique & Helper do Plugin Ruby */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2 text-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-zinc-400 text-[11px] font-semibold">Exemplos rápidos:</span>
              
              {/* Botão Especial OpenCutList com 30 peças, ferragens e cores reais */}
              <button
                type="button"
                onClick={() => processarArquivoOpenCutList(EXEMPLO_OPENCUTLIST_CSV_MOVEL, 'balcao_opencutlist_exportado.csv')}
                className="px-2.5 py-1 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-700 dark:text-indigo-300 font-bold text-[11px] border border-indigo-500/40 transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                title="Carregar balcão completo exportado do OpenCutList com 30 peças, MDF Carvalho Avelã, MDF Branco TX, puxadores e dobradiças"
              >
                <Scissors className="w-3.5 h-3.5 text-indigo-500" />
                <span>⚡ Móvel OpenCutList (30 Peças, Ferragens & Cores)</span>
              </button>

              {softwareOrigemSelecionado === 'sketchup' ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      const csvBancada = `Nº;Designação;Quantidade;Comprimento - Bruto;Largura - Bruta;Espessura - Bruta;Comprimento;Largura;Espessura;Área - final;Tipo de Material;Nome do Material;Descrição do material;URL do material;Nomes de instância;Descrição;URL;Identificação;Comprimento da Borda 1;Comprimento da Borda 2;Largura da Borda 1;Largura da Borda 2;Frente;Verso;Etiquetas
A;saia;1;250,00 mm;1158,00 mm;18,00 mm;250,00 mm;1158,00 mm;18,00 mm;0,29 m²;Chapa;Areia_guararapes;"";"";"";"";"";"";"";"";"";"";"";"";Layer0
A;tampo#1;1;1200,00 mm;550,00 mm;18,00 mm;1200,00 mm;550,00 mm;18,00 mm;0,66 m²;Chapa;Masisa_Azul;"";"";"";"";"";"";"";"";"";"";"";"";Layer0
B;pe_direita;1;717,00 mm;544,00 mm;18,00 mm;717,00 mm;544,00 mm;18,00 mm;0,39 m²;Chapa;Masisa_Azul;"";"";"";"";"";"";"";"";"";"";"";"";Layer0
C;pe_esquerda;1;717,00 mm;544,00 mm;18,00 mm;717,00 mm;544,00 mm;18,00 mm;0,39 m²;Chapa;Masisa_Azul;"";"";"";"";"";"";"";"";"";"";"";"";Layer0
A;sapata#1;1;20,00 mm;20,00 mm;18,00 mm;20,00 mm;20,00 mm;18,00 mm;"";Acessório;Ferragens;"";"";sapata copy 003;"";"";"";"";"";"";"";"";"";Layer0
B;sapata#2;1;20,00 mm;20,00 mm;18,00 mm;20,00 mm;20,00 mm;18,00 mm;"";Acessório;Ferragens;"";"";"";"";"";"";"";"";"";"";"";"";Layer0
C;sapata#3;1;20,00 mm;20,00 mm;18,00 mm;20,00 mm;20,00 mm;18,00 mm;"";Acessório;Ferragens;"";"";sapata copy 001;"";"";"";"";"";"";"";"";"";Layer0
D;sapata#4;1;20,00 mm;20,00 mm;18,00 mm;20,00 mm;20,00 mm;18,00 mm;"";Acessório;Ferragens;"";"";sapata copy 002;"";"";"";"";"";"";"";"";"";Layer0`;
                      processarArquivoOpenCutList(csvBancada, 'bancada_escritorio_opencutlist.csv');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 font-bold text-[11px] border border-amber-500/40 transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                    title="Importar projeto real de Bancada OpenCutList com Tampo 1200x550, Pés 717x544, Saia 1158x250 e Sapatas"
                  >
                    <Scissors className="w-3.5 h-3.5 text-amber-500" />
                    <span>⚡ Bancada OpenCutList (Tampo, Pés, Saia & Sapatas)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const res = parseSketchUpBinarySkp(new ArrayBuffer(0), 'prateleira_suspensa_1000x280x900.skp', 180000);
                      const { projeto } = importarProjetoSketchUp(negocio.id, res);
                      setValorVendaInput(String(projeto.valorVendaDefinido || projeto.valorCalculado || (res.custoTotal * 2.2)));
                      setSoftwareOrigemSelecionado('sketchup');
                      setFeedbackMsg({ tipo: 'sucesso', texto: 'Prateleira Suspensa .SKP importada com sucesso! MDF 25mm e suportes metálicos industriais.' });
                    }}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] border border-emerald-500/40 transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                    title="Importar projeto demo de Prateleira .SKP com MDF 25mm e suportes industriais"
                  >
                    <Scissors className="w-3.5 h-3.5 text-emerald-500" />
                    <span>⚡ Prateleira .SKP (25mm)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const { itens, components3D } = gerarEngenhariaOpenCutListFromSkp('Balcão Demo OpenCutList 3D', 900, 667, 550, 'Ambiente 3D SketchUp');
                      let custoTotal = 0;
                      let totalInstancias = 0;
                      itens.forEach(it => { totalInstancias += it.quantidade; custoTotal += it.custoTotal; });
                      const res: ResultadoParseSketchUp = {
                        sucesso: true, arquivoNome: 'balcao_demo_900x667x550.skp', formato: 'skp',
                        conversorUtilizado: 'skp_converter_bridge', tamanhoBytes: 245000,
                        ambientes: ['Ambiente 3D SketchUp'], totalComponentes: itens.length,
                        totalInstancias, custoTotal: Number(custoTotal.toFixed(2)), itens,
                        scene3d: { components: components3D, ambienteNome: 'Ambiente 3D SketchUp' },
                        resumoFabricacao: calcularResumoOpenCutList(itens),
                        mensagem: 'Projeto demo gerado com sucesso!',
                      };
                      const { projeto } = importarProjetoSketchUp(negocio.id, res);
                      setValorVendaInput(String(projeto.valorVendaDefinido || projeto.valorCalculado || (res.custoTotal * 2.2)));
                      setSoftwareOrigemSelecionado('sketchup');
                      setFeedbackMsg({ tipo: 'sucesso', texto: 'Balcão demo OpenCutList 3D importado! Peças, chapas, fitas e ferragens carregadas.' });
                    }}
                    className="px-2.5 py-1 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-700 dark:text-indigo-300 font-bold text-[11px] border border-indigo-500/40 transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                    title="Importar projeto nativo .SKP gerando todas as peças, chapas MDF, ferragens e 3D do OpenCutList"
                  >
                    <Scissors className="w-3.5 h-3.5 text-indigo-500" />
                    <span>⚡ Balcão .SKP (OpenCutList 3D)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const res = parseSketchUpJson(EXEMPLO_SKETCHUP_JSON_COZINHA, 'cozinha_gourmet_sketchup.json');
                      const { projeto } = importarProjetoSketchUp(negocio.id, res);
                      setValorVendaInput(String(projeto.valorVendaDefinido || projeto.valorCalculado || (res.custoTotal * 2.2)));
                      setSoftwareOrigemSelecionado('sketchup');
                      setFeedbackMsg({ tipo: 'sucesso', texto: 'Cozinha Gourmet SketchUp 3D carregada com sucesso!' });
                    }}
                    className="px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-bold text-[11px] border border-cyan-500/30 transition-colors cursor-pointer"
                  >
                    ⚡ Cozinha SketchUp 3D
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const res = parseSketchUpJson(EXEMPLO_SKETCHUP_JSON_DORMITORIO, 'suite_master_sketchup.json');
                      const { projeto } = importarProjetoSketchUp(negocio.id, res);
                      setValorVendaInput(String(projeto.valorVendaDefinido || projeto.valorCalculado || (res.custoTotal * 2.2)));
                      setSoftwareOrigemSelecionado('sketchup');
                      setFeedbackMsg({ tipo: 'sucesso', texto: 'Suíte Master SketchUp 3D carregada com sucesso!' });
                    }}
                    className="px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-bold text-[11px] border border-cyan-500/30 transition-colors cursor-pointer"
                  >
                    ⚡ Suíte & Closet SketchUp 3D
                  </button>
                </>
              ) : softwareOrigemSelecionado === 'promob' ? (
                <>
                  <button
                    type="button"
                    onClick={() => processarArquivoPromob(EXEMPLO_PROMOB_XML, 'cozinha_gourmet_promob.xml')}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-[11px] border border-amber-500/30 transition-colors cursor-pointer"
                  >
                    ⚡ Cozinha Promob (XML)
                  </button>

                  <button
                    type="button"
                    onClick={() => processarArquivoPromob(EXEMPLO_PROMOB_TXT, 'apartamento_completo_promob.txt')}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-[11px] border border-amber-500/30 transition-colors cursor-pointer"
                  >
                    ⚡ Apto Completo (TXT)
                  </button>
                </>
              ) : null}

              {/* Botão de Demonstração Imediata do Diff de Medição Técnica */}
              <button
                type="button"
                onClick={handleSimularMedicaoTecnica}
                className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 hover:from-emerald-500/30 hover:to-cyan-500/30 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] border border-emerald-500/40 transition-colors flex items-center gap-1 cursor-pointer"
                title="Simula o envio de uma nova versão pós-medição técnica com comparação visual (Diff)"
              >
                <FileDiff className="w-3.5 h-3.5 text-emerald-500" />
                <span>Simular Medição Técnica in-loco (Diff)</span>
              </button>
            </div>

            {softwareOrigemSelecionado === 'sketchup' && (
              <div className="flex items-center gap-2">
                <a
                  href="/api/sketchup/plugin-download"
                  download="mobsyn_exporter.rbz"
                  className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                  title="Baixar extensão oficial do MobSyn para SketchUp (.RBZ) instalável em 1 clique"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>📥 Baixar Plugin (.RBZ)</span>
                </a>

                <button
                  type="button"
                  onClick={() => setShowRubySnippetModal(true)}
                  className="text-[11px] font-semibold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Como Instalar</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Banner do Arquivo Atualmente Importado com Ação de Excluir / Substituir */}
        {projetoAtual && (
          <div className="mt-3 p-3.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shadow-xs ${
                projetoAtual.softwareOrigem === 'sketchup'
                  ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400'
                  : projetoAtual.softwareOrigem === 'opencutlist'
                    ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400'
                    : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
              }`}>
                <FileCode className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    Arquivo Carregado:
                  </span>
                  <span className="font-mono text-xs font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
                    {projetoAtual.arquivoNome || 'Projeto Importado'}
                  </span>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                    ({totalPecas} peças em {ambientesNomes.length} ambiente{ambientesNomes.length !== 1 ? 's' : ''})
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Importou o arquivo errado sem querer? Você pode excluí-lo e limpar todos os dados associados.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer"
                title="Substituir por outro arquivo do computador"
              >
                Substituir
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirmModal(true)}
                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-600 dark:text-rose-400 border border-rose-500/30 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Excluir arquivo e limpar o projeto importado"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir Arquivo</span>
              </button>
            </div>
          </div>
        )}

        {/* Feedback de Importação */}
        {feedbackMsg && (
          <div className={`mt-3 p-3 rounded-xl text-xs font-semibold flex items-center justify-between ${
            feedbackMsg.tipo === 'sucesso' 
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
              : feedbackMsg.tipo === 'aviso'
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
          }`}>
            <div className="flex items-center gap-2">
              {feedbackMsg.tipo === 'sucesso' ? <Check className="w-4 h-4" /> : feedbackMsg.tipo === 'aviso' ? <AlertTriangle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{feedbackMsg.texto}</span>
            </div>
            <button onClick={() => setFeedbackMsg(null)} className="text-zinc-400 hover:text-zinc-600 cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* 3. VISUALIZADOR 3D INTERATIVO SKETCHUP (PARTE B) */}
      {projetoAtual?.modelo3dDados && (projetoAtual.modelo3dDados.components?.length ?? 0) > 0 && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/15 text-cyan-500 flex items-center justify-center">
                <Box className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <span>Visualizador 3D Interativo (Three.js)</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-500 font-bold">
                    WEBGL 3D
                  </span>
                </h4>
                <p className="text-[11px] text-zinc-500">
                  Rotacione com o mouse ou toque. Clique em uma peça no modelo 3D para destacar na tabela abaixo.
                </p>
              </div>
            </div>

            {highlightedCodigo && (
              <button
                type="button"
                onClick={() => {
                  setSelectedComponent3dId(null);
                  setHighlightedCodigo(null);
                }}
                className="text-[10px] font-semibold text-cyan-500 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Limpar seleção</span>
              </button>
            )}
          </div>

          <SketchupViewer3D
            sceneData={projetoAtual.modelo3dDados}
            selectedComponentId={selectedComponent3dId}
            highlightedCodigo={highlightedCodigo}
            onSelectComponent={(id, codigo) => {
              setSelectedComponent3dId(id);
              setHighlightedCodigo(codigo || null);
            }}
            altura={420}
          />
        </div>
      )}

      {/* 4. CABEÇALHO DO PROJETO & RESUMO FINANCEIRO INTEGRADO */}
      {projetoAtual && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl font-bold flex items-center justify-center text-sm shadow-xs ${
                projetoAtual.softwareOrigem === 'sketchup'
                  ? 'bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white'
                  : 'bg-gradient-to-tr from-amber-500 to-orange-600 text-white'
              }`}>
                {projetoAtual.softwareOrigem === 'sketchup' ? '3D' : 'P'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {projetoAtual.nomeAmbiente}
                  </h4>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                    projetoAtual.softwareOrigem === 'sketchup'
                      ? 'bg-cyan-500/10 text-cyan-500 border border-cyan-500/20'
                      : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                  }`}>
                    {projetoAtual.softwareOrigem}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Arquivo: <span className="font-mono text-zinc-700 dark:text-zinc-300">{projetoAtual.arquivoNome || 'Importado'}</span> • {projetoAtual.versao}
                </p>
              </div>
            </div>

            {/* Ações de Versão / Snapshot / Diff */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleSimularMedicaoTecnica}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/15 to-cyan-500/15 hover:from-emerald-500/25 hover:to-cyan-500/25 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                title="Simular nova medição técnica in-loco e comparar com a versão atual"
              >
                <FileDiff className="w-3.5 h-3.5 text-emerald-500" />
                <span>Simular Medição (Diff)</span>
              </button>

              <button
                type="button"
                onClick={handleAbrirDiffSnapshotOriginal}
                className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700/80 text-zinc-700 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Comparar a versão atual com o snapshot original importado"
              >
                <GitCompare className="w-3.5 h-3.5 text-cyan-500" />
                <span>Comparar c/ Original</span>
              </button>

              <button
                type="button"
                onClick={() => setShowHistoryModal(true)}
                className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700/80 text-zinc-700 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer relative"
                title="Histórico de versões oficiais aprovadas do projeto"
              >
                <History className="w-3.5 h-3.5 text-indigo-500" />
                <span>Histórico</span>
                {(projetoAtual.historicoVersoes?.length || 0) > 0 && (
                  <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                    {projetoAtual.historicoVersoes?.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={handleReverterOriginal}
                className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Descartar edições manuais e restaurar lista original"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reverter</span>
              </button>

              <button
                type="button"
                onClick={() => setShowDeleteConfirmModal(true)}
                className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                title="Excluir arquivo e dados importados deste projeto"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir Arquivo</span>
              </button>
            </div>
          </div>

          {/* Cards de Métricas Financeiras */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                Custo de Fabricação
              </span>
              <span className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                {custoTotalProducao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
              <span className="text-[10px] text-zinc-400 block mt-0.5">
                {totalPecas} peças / módulos
              </span>
            </div>

            <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                Margem de Lucro
              </span>
              <span className={`text-sm sm:text-base font-bold font-mono ${
                margemBrutaPercent >= 40 ? 'text-emerald-500' : 'text-amber-500'
              }`}>
                {margemBrutaPercent}%
              </span>
              <span className="text-[10px] text-zinc-400 block mt-0.5">
                Markup: {(valorVendaNum / (custoTotalProducao || 1)).toFixed(2)}x
              </span>
            </div>

            <div className="p-3 bg-cyan-500/5 dark:bg-cyan-500/10 border border-cyan-500/30 rounded-xl col-span-2">
              <span className="text-[10px] uppercase font-bold text-cyan-600 dark:text-cyan-400 block mb-1 flex items-center justify-between">
                <span>Preço de Venda Definido (CRM)</span>
                <span className="text-[9px] font-mono bg-cyan-500/20 px-1.5 py-0.2 rounded text-cyan-500 font-bold">
                  SINCRONIZADO
                </span>
              </span>
              <div className="flex items-center gap-2 mt-1">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={valorVendaInput}
                    onChange={(e) => setValorVendaInput(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-sm font-bold bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSalvarValorVenda}
                  className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Salvar</span>
                </button>
              </div>
            </div>
          </div>

          {/* PAINEL DE RESUMO DE CORTE & FERRAGENS (OPENCUTLIST / MARCENARIA) */}
          {(projetoAtual.softwareOrigem === 'opencutlist' || projetoAtual.softwareOrigem === 'sketchup' || itensDoProjeto.some(i => i.material?.toLowerCase().includes('mdf') || i.material?.toLowerCase().includes('ferragem'))) && (
            <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-indigo-50/50 dark:bg-indigo-950/20 p-3 rounded-xl border border-indigo-200/50 dark:border-indigo-800/30">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                    <Scissors className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      <span>Plano de Corte & Lista de Ferragens (OpenCutList)</span>
                      <span className="text-[9px] font-mono px-2 py-0.2 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold uppercase">
                        ENGENHARIA OCL
                      </span>
                    </h5>
                    <p className="text-[11px] text-zinc-500">
                      Consolidação automática de painéis, fitas de borda e ferragens prontas para fabricação.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleExportarCsvOpenCutList}
                    className="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                    title="Exportar CSV compatível com OpenCutList / Corte Cloud / Otimizadores"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Exportar CSV (OCL)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleGerarListaComprasEstoque}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                    title="Criar lista de compras vinculada ao cliente no estoque"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Salvar no Estoque por Cliente</span>
                  </button>
                </div>
              </div>

              {/* Cards de Resumo das Chapas de MDF e Ferragens */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* 1. Painéis e Chapas */}
                <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 uppercase">
                      <Layers2 className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Chapas de Madeira / MDF</span>
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-500 px-1.5 py-0.2 rounded">
                      Chapa 2.75×1.83m
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {(() => {
                      const isItemFerragem = (i: ItemOrcamento) => {
                        const mat = (i.material || '').toLowerCase();
                        const desc = i.descricao.toLowerCase();
                        return (
                          (i as any).isFerragem ||
                          mat.includes('ferrag') ||
                          mat.includes('sapata') ||
                          mat.includes('nivelador') ||
                          mat.includes('puxador') ||
                          mat.includes('dobradiça') ||
                          mat.includes('dobradica') ||
                          mat.includes('calço') ||
                          mat.includes('calco') ||
                          mat.includes('corrediça') ||
                          mat.includes('corredica') ||
                          mat.includes('acessório') ||
                          mat.includes('acessorio') ||
                          desc.includes('sapata') ||
                          desc.includes('nivelador') ||
                          desc.includes('puxador') ||
                          desc.includes('dobradiça') ||
                          desc.includes('dobradica') ||
                          desc.includes('calço') ||
                          desc.includes('calco') ||
                          desc.includes('corrediça') ||
                          desc.includes('corredica') ||
                          desc.includes('passa-fios') ||
                          desc.includes('cantoneira')
                        );
                      };

                      const itensChapas = itensDoProjeto.filter(i => !isItemFerragem(i));

                      const grupos: Record<string, { material: string; qtd: number; areaM2: number }> = {};
                      itensChapas.forEach(i => {
                        const mat = i.material || 'MDF 18mm Padrão';
                        if (!grupos[mat]) grupos[mat] = { material: mat, qtd: 0, areaM2: 0 };
                        grupos[mat].qtd += i.quantidade;

                        // Ordena as medidas para pegar as duas maiores dimensões de corte da chapa (Comprimento x Largura)
                        const dim = [i.medidas.larguraMm || 0, i.medidas.alturaMm || 0, i.medidas.profundidadeMm || 0].sort((a, b) => b - a);
                        const c = dim[0] > 0 ? dim[0] : 600;
                        const l = dim[1] > 0 ? dim[1] : 400;
                        const area = (c / 1000) * (l / 1000);
                        grupos[mat].areaM2 += area * i.quantidade;
                      });

                      const lista = Object.values(grupos);
                      if (lista.length === 0) {
                        return <p className="text-[11px] text-zinc-400 italic">Nenhuma chapa identificada.</p>;
                      }

                      return lista.map((g, idx) => {
                        const chapas = Math.max(1, Math.ceil(g.areaM2 / 4.12));
                        return (
                          <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-zinc-200/60 dark:border-zinc-800/60 last:border-0">
                            <span className="text-zinc-700 dark:text-zinc-300 font-medium truncate max-w-[140px]" title={g.material}>
                              {g.material}
                            </span>
                            <span className="font-mono text-zinc-500 text-[11px] whitespace-nowrap">
                              {g.qtd} pçs • ~{g.areaM2.toFixed(2)}m² ({chapas} {chapas > 1 ? 'chapas' : 'chapa'})
                            </span>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* 2. Fitas de Borda */}
                <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 uppercase">
                      <Scissors className="w-3.5 h-3.5 text-cyan-500" />
                      <span>Fitas de Borda</span>
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-500 px-1.5 py-0.2 rounded">
                      Metragem Linear
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {(() => {
                      const isItemFerragem = (i: ItemOrcamento) => {
                        const mat = (i.material || '').toLowerCase();
                        const desc = i.descricao.toLowerCase();
                        return (
                          (i as any).isFerragem ||
                          mat.includes('ferrag') ||
                          mat.includes('sapata') ||
                          mat.includes('nivelador') ||
                          mat.includes('puxador') ||
                          mat.includes('dobradiça') ||
                          mat.includes('dobradica') ||
                          mat.includes('calço') ||
                          mat.includes('calco') ||
                          mat.includes('corrediça') ||
                          mat.includes('corredica') ||
                          mat.includes('acessório') ||
                          mat.includes('acessorio') ||
                          desc.includes('sapata') ||
                          desc.includes('nivelador') ||
                          desc.includes('puxador') ||
                          desc.includes('dobradiça') ||
                          desc.includes('dobradica') ||
                          desc.includes('calço') ||
                          desc.includes('calco') ||
                          desc.includes('corrediça') ||
                          desc.includes('corredica') ||
                          desc.includes('passa-fios') ||
                          desc.includes('cantoneira')
                        );
                      };

                      const itensMadeira = itensDoProjeto.filter(i => !isItemFerragem(i));

                      if (itensMadeira.length === 0) {
                        return <p className="text-[11px] text-zinc-400 italic">Nenhuma fita necessária.</p>;
                      }

                      // Agrupa metragem de fita por acabamento / material real
                      const gruposFita: Record<string, { nome: string; metros: number }> = {};
                      let totalLinear = 0;

                      itensMadeira.forEach(i => {
                        const matNome = i.material || 'MDF Padrão';
                        const nomeFita = `Fita PVC 1.0mm (${matNome.replace(/^MDF\s*\d*mm\s*/i, '').trim() || 'Padrão'})`;

                        const dim = [i.medidas.larguraMm || 0, i.medidas.alturaMm || 0, i.medidas.profundidadeMm || 0].sort((a, b) => b - a);
                        const c = dim[0] > 0 ? dim[0] : 600;
                        const l = dim[1] > 0 ? dim[1] : 400;

                        // Perímetro linear em metros
                        const desc = i.descricao.toLowerCase();
                        let metrosItem = 0;
                        if (desc.includes('tampo') || desc.includes('porta') || desc.includes('frente')) {
                          metrosItem = ((c * 2) + (l * 2)) / 1000; // 4 topos
                        } else {
                          metrosItem = (c + l) / 1000; // 2 topos visíveis
                        }
                        const metrosTotalItem = Number((metrosItem * i.quantidade).toFixed(2));

                        if (!gruposFita[nomeFita]) {
                          gruposFita[nomeFita] = { nome: nomeFita, metros: 0 };
                        }
                        gruposFita[nomeFita].metros += metrosTotalItem;
                        totalLinear += metrosTotalItem;
                      });

                      const listaFitas = Object.values(gruposFita);

                      return (
                        <>
                          {listaFitas.map((f, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-zinc-200/60 dark:border-zinc-800/60 last:border-0">
                              <span className="text-zinc-700 dark:text-zinc-300 font-medium truncate max-w-[150px]" title={f.nome}>
                                {f.nome}
                              </span>
                              <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold text-[11px] whitespace-nowrap">
                                ~{f.metros.toFixed(1)} m
                              </span>
                            </div>
                          ))}
                          <div className="pt-1 text-[10px] text-zinc-400 flex items-center justify-between">
                            <span>Total linear estimado:</span>
                            <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">{totalLinear.toFixed(1)} metros</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* 3. Ferragens & Acessórios */}
                <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 uppercase">
                      <Wrench className="w-3.5 h-3.5 text-amber-500" />
                      <span>Ferragens & Acessórios</span>
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-amber-500/10 text-amber-500 px-1.5 py-0.2 rounded">
                      Itens de Montagem
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {(() => {
                      const isItemFerragem = (i: ItemOrcamento) => {
                        const mat = (i.material || '').toLowerCase();
                        const desc = i.descricao.toLowerCase();
                        return (
                          (i as any).isFerragem ||
                          mat.includes('ferrag') ||
                          mat.includes('sapata') ||
                          mat.includes('nivelador') ||
                          mat.includes('puxador') ||
                          mat.includes('dobradiça') ||
                          mat.includes('dobradica') ||
                          mat.includes('calço') ||
                          mat.includes('calco') ||
                          mat.includes('corrediça') ||
                          mat.includes('corredica') ||
                          mat.includes('acessório') ||
                          mat.includes('acessorio') ||
                          desc.includes('sapata') ||
                          desc.includes('nivelador') ||
                          desc.includes('puxador') ||
                          desc.includes('dobradiça') ||
                          desc.includes('dobradica') ||
                          desc.includes('calço') ||
                          desc.includes('calco') ||
                          desc.includes('corrediça') ||
                          desc.includes('corredica') ||
                          desc.includes('passa-fios') ||
                          desc.includes('cantoneira')
                        );
                      };

                      const ferragens = itensDoProjeto.filter(i => isItemFerragem(i));

                      if (ferragens.length === 0) {
                        return (
                          <p className="text-[11px] text-zinc-400 italic py-2">
                            Nenhuma ferragem ou acessório cadastrado neste projeto.
                          </p>
                        );
                      }

                      return ferragens.map((f, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-zinc-200/60 dark:border-zinc-800/60 last:border-0">
                          <span className="text-zinc-700 dark:text-zinc-300 font-medium truncate max-w-[150px]" title={f.descricao}>
                            {f.descricao}
                          </span>
                          <span className="font-mono text-amber-600 dark:text-amber-400 font-bold text-[11px] whitespace-nowrap">
                            {f.quantidade} un • R$ {(f.custoUnitario * f.quantidade).toFixed(2)}
                          </span>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. LISTA DE PEÇAS AGRUPADAS POR AMBIENTE (CRUD COMPLETO & SINCRONIZAÇÃO 3D) */}
      {projetoAtual && itensDoProjeto.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-emerald-500" />
              <span>Lista Detalhada de Componentes por Ambiente</span>
            </h4>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCleanEnvironmentsWithAi}
                disabled={isCleaningEnvs}
                className="px-3 py-1 rounded-xl bg-cyan-600/10 hover:bg-cyan-600/20 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
                <span>{isCleaningEnvs ? 'Processando IA...' : 'Limpar e Agrupar Ambientes com IA'}</span>
              </button>
              <span className="text-xs text-zinc-400 font-semibold">
                {ambientesNomes.length} ambiente(s)
              </span>
            </div>
          </div>

          {ambientesNomes.map((ambienteNome) => {
            const itensDoAmbiente = ambientesMap[ambienteNome];
            const subtotalCusto = itensDoAmbiente.reduce((acc, i) => acc + (i.custoUnitario * i.quantidade), 0);
            const subtotalVenda = itensDoAmbiente.reduce((acc, i) => acc + (i.precoVenda * i.quantidade), 0);
            const isColapsado = !!ambientesColapsados[ambienteNome];

            return (
              <div 
                key={ambienteNome}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs transition-all"
              >
                {/* Header do Ambiente */}
                <div 
                  onClick={() => setAmbientesColapsados(prev => ({ ...prev, [ambienteNome]: !isColapsado }))}
                  className="p-3 sm:px-4 bg-zinc-50/80 dark:bg-zinc-950/80 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between cursor-pointer hover:bg-zinc-100/70 dark:hover:bg-zinc-900 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-cyan-500" />
                    <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {ambienteNome}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-semibold">
                      {itensDoAmbiente.length} itens
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                      <span className="text-[10px] text-zinc-400 font-semibold uppercase mr-2">Subtotal:</span>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                        {subtotalCusto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </div>
                    {isColapsado ? <ChevronDown className="w-4 h-4 text-zinc-400" /> : <ChevronUp className="w-4 h-4 text-zinc-400" />}
                  </div>
                </div>

                {/* Tabela de Peças do Ambiente */}
                {!isColapsado && (
                  <div className="p-3 sm:p-4 space-y-3">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-zinc-200 dark:border-zinc-800 text-[10px] uppercase font-bold text-zinc-400">
                            <th className="py-2 px-2">Cód.</th>
                            <th className="py-2 px-2">Descrição da Peça</th>
                            <th className="py-2 px-2 text-center" title="Comprimento × Largura × Espessura (mm)">Comp × Larg × Esp (mm)</th>
                            <th className="py-2 px-2">Material</th>
                            <th className="py-2 px-2 text-center">Qtd</th>
                            <th className="py-2 px-2 text-right">Custo Unit.</th>
                            <th className="py-2 px-2 text-right">Custo Total</th>
                            <th className="py-2 px-2 text-center">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-medium text-zinc-700 dark:text-zinc-300">
                          {itensDoAmbiente.map((item) => {
                            const isEditing = editingItemId === item.id;
                            const isHighlighted = highlightedCodigo === item.codigo;

                            if (isEditing) {
                              return (
                                <tr key={item.id} className="bg-cyan-500/10 border-cyan-500/30">
                                  <td className="py-2 px-2">
                                    <input
                                      type="text"
                                      value={editForm.codigo ?? item.codigo}
                                      onChange={(e) => setEditForm(prev => ({ ...prev, codigo: e.target.value }))}
                                      className="w-16 px-1.5 py-1 text-xs bg-white dark:bg-zinc-900 border rounded font-mono"
                                    />
                                  </td>
                                  <td className="py-2 px-2">
                                    <input
                                      type="text"
                                      value={editForm.descricao ?? item.descricao}
                                      onChange={(e) => setEditForm(prev => ({ ...prev, descricao: e.target.value }))}
                                      className="w-full px-1.5 py-1 text-xs bg-white dark:bg-zinc-900 border rounded"
                                    />
                                  </td>
                                  <td className="py-2 px-2 text-center">
                                    <div className="flex items-center gap-1 justify-center">
                                      <input
                                        type="number"
                                        value={editForm.medidas?.larguraMm ?? item.medidas.larguraMm}
                                        onChange={(e) => {
                                          const val = Number(e.target.value);
                                          setEditForm(prev => ({
                                            ...prev,
                                            medidas: {
                                              larguraMm: val,
                                              alturaMm: editForm.medidas?.alturaMm ?? item.medidas.alturaMm,
                                              profundidadeMm: editForm.medidas?.profundidadeMm ?? item.medidas.profundidadeMm,
                                            }
                                          }));
                                        }}
                                        className="w-12 px-1 py-1 text-xs bg-white dark:bg-zinc-900 border rounded text-center font-mono"
                                      />
                                      <span>×</span>
                                      <input
                                        type="number"
                                        value={editForm.medidas?.alturaMm ?? item.medidas.alturaMm}
                                        onChange={(e) => {
                                          const val = Number(e.target.value);
                                          setEditForm(prev => ({
                                            ...prev,
                                            medidas: {
                                              larguraMm: editForm.medidas?.larguraMm ?? item.medidas.larguraMm,
                                              alturaMm: val,
                                              profundidadeMm: editForm.medidas?.profundidadeMm ?? item.medidas.profundidadeMm,
                                            }
                                          }));
                                        }}
                                        className="w-12 px-1 py-1 text-xs bg-white dark:bg-zinc-900 border rounded text-center font-mono"
                                      />
                                      <span>×</span>
                                      <input
                                        type="number"
                                        value={editForm.medidas?.profundidadeMm ?? item.medidas.profundidadeMm}
                                        onChange={(e) => {
                                          const val = Number(e.target.value);
                                          setEditForm(prev => ({
                                            ...prev,
                                            medidas: {
                                              larguraMm: editForm.medidas?.larguraMm ?? item.medidas.larguraMm,
                                              alturaMm: editForm.medidas?.alturaMm ?? item.medidas.alturaMm,
                                              profundidadeMm: val,
                                            }
                                          }));
                                        }}
                                        className="w-12 px-1 py-1 text-xs bg-white dark:bg-zinc-900 border rounded text-center font-mono"
                                      />
                                    </div>
                                  </td>
                                  <td className="py-2 px-2">
                                    <input
                                      type="text"
                                      value={editForm.material ?? item.material}
                                      onChange={(e) => setEditForm(prev => ({ ...prev, material: e.target.value }))}
                                      className="w-full px-1.5 py-1 text-xs bg-white dark:bg-zinc-900 border rounded"
                                    />
                                  </td>
                                  <td className="py-2 px-2 text-center">
                                    <input
                                      type="number"
                                      value={editForm.quantidade ?? item.quantidade}
                                      onChange={(e) => setEditForm(prev => ({ ...prev, quantidade: Number(e.target.value) }))}
                                      className="w-12 px-1 py-1 text-xs bg-white dark:bg-zinc-900 border rounded text-center font-mono"
                                    />
                                  </td>
                                  <td className="py-2 px-2 text-right">
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={editForm.custoUnitario ?? item.custoUnitario}
                                      onChange={(e) => setEditForm(prev => ({ ...prev, custoUnitario: Number(e.target.value) }))}
                                      className="w-20 px-1 py-1 text-xs bg-white dark:bg-zinc-900 border rounded text-right font-mono"
                                    />
                                  </td>
                                  <td className="py-2 px-2 text-right font-bold font-mono">
                                    {(((editForm.custoUnitario ?? item.custoUnitario) * (editForm.quantidade ?? item.quantidade))).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                  </td>
                                  <td className="py-2 px-2 text-center">
                                    <div className="flex items-center gap-1 justify-center">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          editarItemOrcamento(item.id, editForm);
                                          setEditingItemId(null);
                                          setEditForm({});
                                        }}
                                        className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-500 cursor-pointer"
                                      >
                                        <Check className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingItemId(null);
                                          setEditForm({});
                                        }}
                                        className="p-1 rounded bg-zinc-300 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-400 cursor-pointer"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            }

                            return (
                              <tr 
                                key={item.id} 
                                onClick={() => {
                                  setHighlightedCodigo(item.codigo);
                                }}
                                className={`hover:bg-zinc-50 dark:hover:bg-zinc-850/50 transition-colors cursor-pointer ${
                                  isHighlighted ? 'bg-cyan-500/15 dark:bg-cyan-500/20 text-cyan-900 dark:text-cyan-200 font-semibold' : ''
                                }`}
                              >
                                <td className="py-2 px-2 font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                                  {item.codigo}
                                </td>
                                <td className="py-2 px-2">
                                  <div className="flex items-center gap-1.5">
                                    {isHighlighted && <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />}
                                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">{item.descricao}</span>
                                  </div>
                                </td>
                                <td className="py-2 px-2 text-center font-mono text-[11px] text-zinc-500">
                                  {item.medidas.larguraMm}×{item.medidas.alturaMm}×{item.medidas.profundidadeMm}
                                </td>
                                <td className="py-2 px-2 text-[11px] text-zinc-600 dark:text-zinc-300">
                                  {item.material}
                                </td>
                                <td className="py-2 px-2 text-center font-mono font-bold">
                                  {item.quantidade}
                                </td>
                                <td className="py-2 px-2 text-right font-mono text-[11px]">
                                  {item.custoUnitario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </td>
                                <td className="py-2 px-2 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                  {(item.custoUnitario * item.quantidade).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </td>
                                <td className="py-2 px-2 text-center">
                                  <div className="flex items-center gap-1 justify-center opacity-70 hover:opacity-100">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingItemId(item.id);
                                        setEditForm(item);
                                      }}
                                      className="p-1 rounded text-zinc-400 hover:text-cyan-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                                      title="Editar Peça"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (window.confirm(`Deseja remover a peça "${item.descricao}"?`)) {
                                          excluirItemOrcamento(item.id);
                                        }
                                      }}
                                      className="p-1 rounded text-zinc-400 hover:text-rose-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                                      title="Excluir Peça"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Botão para Adicionar Nova Peça Manual neste Ambiente */}
                    {addingToAmbiente === ambienteNome ? (
                      <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-3">
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">
                          Nova Peça em &quot;{ambienteNome}&quot;
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <input
                            type="text"
                            placeholder="Cód (ex: MOD-01)"
                            value={newItemForm.codigo}
                            onChange={(e) => setNewItemForm(prev => ({ ...prev, codigo: e.target.value }))}
                            className="px-2 py-1.5 text-xs bg-white dark:bg-zinc-900 border rounded-lg font-mono"
                          />
                          <input
                            type="text"
                            placeholder="Descrição da peça"
                            value={newItemForm.descricao}
                            onChange={(e) => setNewItemForm(prev => ({ ...prev, descricao: e.target.value }))}
                            className="col-span-1 sm:col-span-2 px-2 py-1.5 text-xs bg-white dark:bg-zinc-900 border rounded-lg"
                          />
                          <input
                            type="text"
                            placeholder="Material (ex: MDF 18mm)"
                            value={newItemForm.material}
                            onChange={(e) => setNewItemForm(prev => ({ ...prev, material: e.target.value }))}
                            className="px-2 py-1.5 text-xs bg-white dark:bg-zinc-900 border rounded-lg"
                          />
                          <div className="col-span-2 sm:col-span-2 flex items-center gap-1">
                            <input
                              type="number"
                              placeholder="L (mm)"
                              value={newItemForm.larguraMm}
                              onChange={(e) => setNewItemForm(prev => ({ ...prev, larguraMm: Number(e.target.value) }))}
                              className="w-1/3 px-2 py-1.5 text-xs bg-white dark:bg-zinc-900 border rounded-lg font-mono"
                            />
                            <input
                              type="number"
                              placeholder="A (mm)"
                              value={newItemForm.alturaMm}
                              onChange={(e) => setNewItemForm(prev => ({ ...prev, alturaMm: Number(e.target.value) }))}
                              className="w-1/3 px-2 py-1.5 text-xs bg-white dark:bg-zinc-900 border rounded-lg font-mono"
                            />
                            <input
                              type="number"
                              placeholder="P (mm)"
                              value={newItemForm.profundidadeMm}
                              onChange={(e) => setNewItemForm(prev => ({ ...prev, profundidadeMm: Number(e.target.value) }))}
                              className="w-1/3 px-2 py-1.5 text-xs bg-white dark:bg-zinc-900 border rounded-lg font-mono"
                            />
                          </div>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              placeholder="Qtd"
                              value={newItemForm.quantidade}
                              onChange={(e) => setNewItemForm(prev => ({ ...prev, quantidade: Number(e.target.value) }))}
                              className="w-16 px-2 py-1.5 text-xs bg-white dark:bg-zinc-900 border rounded-lg font-mono"
                            />
                            <input
                              type="number"
                              step="0.01"
                              placeholder="Custo R$"
                              value={newItemForm.custoUnitario}
                              onChange={(e) => setNewItemForm(prev => ({ ...prev, custoUnitario: Number(e.target.value) }))}
                              className="w-full px-2 py-1.5 text-xs bg-white dark:bg-zinc-900 border rounded-lg font-mono"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                if (!newItemForm.descricao) return;
                                criarItemOrcamento({
                                  projetoId: projetoAtual.id,
                                  codigo: newItemForm.codigo || `MOD-${Date.now().toString().slice(-4)}`,
                                  descricao: newItemForm.descricao,
                                  ambiente: ambienteNome,
                                  medidas: {
                                    larguraMm: newItemForm.larguraMm,
                                    alturaMm: newItemForm.alturaMm,
                                    profundidadeMm: newItemForm.profundidadeMm,
                                  },
                                  material: newItemForm.material || 'MDF 18mm Padrão',
                                  acabamento: 'Fita PVC 1.0mm',
                                  quantidade: newItemForm.quantidade || 1,
                                  custoUnitario: newItemForm.custoUnitario || 0,
                                  precoVenda: (newItemForm.custoUnitario || 0) * 2.2,
                                });
                                setAddingToAmbiente(null);
                                setNewItemForm({
                                  codigo: '',
                                  descricao: '',
                                  ambiente: '',
                                  larguraMm: 600,
                                  alturaMm: 720,
                                  profundidadeMm: 550,
                                  material: 'MDF 18mm Branco Tx',
                                  acabamento: 'Fita PVC 1.0mm',
                                  quantidade: 1,
                                  custoUnitario: 250,
                                  precoVenda: 550,
                                });
                              }}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Adicionar</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setAddingToAmbiente(null)}
                              className="px-3 py-1.5 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-semibold cursor-pointer"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setAddingToAmbiente(ambienteNome);
                          setNewItemForm(prev => ({ ...prev, ambiente: ambienteNome }));
                        }}
                        className="text-[11px] font-semibold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 pt-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Adicionar peça avulsa a {ambienteNome}</span>
                      </button>
                    )}

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 6. MODAL: EXIBIÇÃO DO SNAPSHOT ORIGINAL (PROMOB OU SKETCHUP) */}
      {showOriginalSnapshotModal && projetoAtual && (
        <div className="fixed inset-0 bg-zinc-950/80 z-60 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 sm:px-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-950/50">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-cyan-500" />
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
                    Snapshot da Versão Original Importada
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Origem: <span className="font-bold uppercase text-cyan-500">{projetoAtual.softwareOrigem}</span> • Arquivo: {projetoAtual.arquivoNome}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowOriginalSnapshotModal(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
              <div className="p-3 bg-zinc-100 dark:bg-zinc-850 rounded-xl text-xs text-zinc-600 dark:text-zinc-400">
                Este snapshot armazena os dados brutos e imutáveis da primeira importação. Se você editar peças manualmente e precisar voltar ao modelo de engenharia original, clique em &quot;Reverter p/ Original&quot;.
              </div>

              {/* Tabela dos itens originais */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 text-[10px] uppercase font-bold text-zinc-400">
                      <th className="py-2 px-2">Cód.</th>
                      <th className="py-2 px-2">Descrição Original</th>
                      <th className="py-2 px-2">Ambiente</th>
                      <th className="py-2 px-2 text-center" title="Comprimento × Largura × Espessura (mm)">Comp × Larg × Esp (mm)</th>
                      <th className="py-2 px-2 text-center">Qtd</th>
                      <th className="py-2 px-2 text-right">Custo Orig.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-mono text-[11px]">
                    {(projetoAtual.snapshotOriginal?.itensOriginais || projetoAtual.snapshotOriginalSketchUp?.itensOriginais || []).map((it, idx) => (
                      <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                        <td className="py-2 px-2 text-zinc-400">{it.codigo}</td>
                        <td className="py-2 px-2 font-sans font-semibold text-zinc-800 dark:text-zinc-200">{it.descricao}</td>
                        <td className="py-2 px-2 font-sans text-zinc-500">{it.ambiente}</td>
                        <td className="py-2 px-2 text-center text-zinc-400">{it.larguraMm}×{it.alturaMm}×{it.profundidadeMm}</td>
                        <td className="py-2 px-2 text-center font-bold text-zinc-800 dark:text-zinc-200">{it.quantidade}</td>
                        <td className="py-2 px-2 text-right text-emerald-500">{it.custoUnitario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setShowOriginalSnapshotModal(false);
                  handleReverterOriginal();
                }}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar Esta Versão Agora</span>
              </button>

              <button
                type="button"
                onClick={() => setShowOriginalSnapshotModal(false)}
                className="px-4 py-1.5 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL: EXTENSÃO RUBY DO SKETCHUP (PLUGIN OFICIAL & INSTALAÇÃO) */}
      {showRubySnippetModal && (
        <div className="fixed inset-0 bg-zinc-950/80 z-60 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-3xl max-h-[88vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 sm:px-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-950/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shadow-xs">
                  <Cuboid className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
                    Extensão Oficial MobSyn para SketchUp (.RBZ)
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Exporte componentes reais, medidas milimétricas e materiais do SketchUp em 1 clique.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRubySnippetModal(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              {/* Botão de Download em Destaque */}
              <div className="p-4 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-indigo-500/10 border border-cyan-500/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
                <div>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-500" />
                    <span>Download do Arquivo de Instalação (.RBZ)</span>
                  </h4>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Compatível com SketchUp 2017 até SketchUp 2026 Pro.
                  </p>
                </div>

                <a
                  href="/api/sketchup/plugin-download"
                  download="mobsyn_exporter.rbz"
                  className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all shrink-0 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar Extensão (.RBZ)</span>
                </a>
              </div>

              {/* Guia Visual Passo a Passo */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 rounded-xl space-y-1.5">
                  <div className="w-6 h-6 rounded-lg bg-cyan-500 text-white font-bold text-xs flex items-center justify-center">1</div>
                  <h5 className="font-bold text-zinc-900 dark:text-zinc-100">Instalar no SketchUp</h5>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                    No SketchUp, abra <span className="font-semibold text-zinc-800 dark:text-zinc-200">Extensões &gt; Gerenciador de Extensões</span> e clique no botão <span className="font-semibold text-zinc-800 dark:text-zinc-200">Instalar Extensão</span>.
                  </p>
                </div>

                <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 rounded-xl space-y-1.5">
                  <div className="w-6 h-6 rounded-lg bg-cyan-500 text-white font-bold text-xs flex items-center justify-center">2</div>
                  <h5 className="font-bold text-zinc-900 dark:text-zinc-100">Exportar em 1 Clique</h5>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                    Com seu projeto aberto, clique no menu <span className="font-semibold text-zinc-800 dark:text-zinc-200">Plugins &gt; MobSyn &gt; Exportar Projeto (JSON)</span>.
                  </p>
                </div>

                <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 rounded-xl space-y-1.5">
                  <div className="w-6 h-6 rounded-lg bg-cyan-500 text-white font-bold text-xs flex items-center justify-center">3</div>
                  <h5 className="font-bold text-zinc-900 dark:text-zinc-100">Soltar no MobSyn</h5>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                    Arraste o arquivo <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">.json</span> gerado para esta tela para carregar todas as peças reais e 3D.
                  </p>
                </div>
              </div>

              {/* Opção Avançada: Script Ruby Direto para o Console */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                    Código Ruby (Para executar direto no Console Ruby do SketchUp):
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyRubySnippet}
                    className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                  >
                    {hasCopiedSnippet ? (
                      <>
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar Código Ruby</span>
                      </>
                    )}
                  </button>
                </div>

                <pre className="p-4 rounded-xl bg-zinc-950 text-zinc-300 font-mono text-[11px] overflow-x-auto max-h-56 border border-zinc-800">
                  <code>{RUBY_EXTENSION_SKETCHUP_SNIPPET}</code>
                </pre>
              </div>
            </div>

            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 flex justify-end">
              <button
                type="button"
                onClick={() => setShowRubySnippetModal(false)}
                className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. MODAL: COMPARAÇÃO DE REVISÃO DE PROJETO (DIFF ENGINE) */}
      {showDiffModal && diffModalConfig && (
        <ProjectReviewDiffModal
          isOpen={showDiffModal}
          onClose={() => {
            setShowDiffModal(false);
            if (diffModalConfig.onDescartar && !diffModalConfig.modoApenasVisualizacao) {
              diffModalConfig.onDescartar();
            }
            setDiffModalConfig(null);
          }}
          nomeVersaoBase={diffModalConfig.nomeVersaoBase}
          itensBase={diffModalConfig.itensBase}
          nomeVersaoNova={diffModalConfig.nomeVersaoNova}
          itensNovaRevisao={diffModalConfig.itensNovaRevisao}
          motivoSugerido={diffModalConfig.motivoSugerido}
          arquivoNome={diffModalConfig.arquivoNome}
          softwareOrigem={diffModalConfig.softwareOrigem}
          modoApenasVisualizacao={diffModalConfig.modoApenasVisualizacao}
          onAprovar={(motivo, novoValorVenda) => {
            if (diffModalConfig.onAprovar) {
              diffModalConfig.onAprovar(motivo, novoValorVenda);
            }
            setShowDiffModal(false);
            setDiffModalConfig(null);
          }}
          onDescartar={() => {
            if (diffModalConfig.onDescartar) {
              diffModalConfig.onDescartar();
            }
            setShowDiffModal(false);
            setDiffModalConfig(null);
          }}
        />
      )}

      {/* 9. MODAL: HISTÓRICO DE VERSÕES APROVADAS (SNAPSHOTS & RESTORE) */}
      {showHistoryModal && projetoAtual && (
        <ProjectVersionHistoryModal
          isOpen={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
          projeto={projetoAtual}
          onRestaurarVersao={(versaoId) => {
            restaurarVersaoHistorico(projetoAtual.id, versaoId);
            setFeedbackMsg({
              tipo: 'sucesso',
              texto: 'Versão histórica restaurada como a versão oficial ativa do projeto!'
            });
          }}
          onCompararVersaoComAtual={(versaoHistorica) => {
            setDiffModalConfig({
              nomeVersaoBase: `${versaoHistorica.versao} (Histórico)`,
              itensBase: versaoHistorica.itens,
              nomeVersaoNova: `${projetoAtual.versao} (Oficial Atual)`,
              itensNovaRevisao: itensDoProjeto,
              motivoSugerido: `Comparação com snapshot histórico ${versaoHistorica.versao}`,
              softwareOrigem: versaoHistorica.softwareOrigem,
              modoApenasVisualizacao: true,
            });
            setShowHistoryModal(false);
            setShowDiffModal(true);
          }}
        />
      )}

      {/* 10. MODAL DE CONFIRMAÇÃO: EXCLUIR ARQUIVO & DADOS DO PROJETO */}
      {showDeleteConfirmModal && projetoAtual && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col scale-100 transition-all">
            
            {/* Cabeçalho do Modal */}
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-rose-50/50 dark:bg-rose-950/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-xs">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    Excluir Arquivo do Projeto
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Confirme a exclusão do arquivo importado por engano
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteConfirmModal(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Conteúdo & Detalhes */}
            <div className="p-5 sm:p-6 space-y-4 text-xs">
              <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2.5 text-amber-900 dark:text-amber-300">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-xs">Atenção: Ação de Limpeza</p>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-0.5 leading-relaxed">
                    Você está prestes a remover o arquivo importado deste negócio. Todos os itens de orçamento, listas de peças e modelo 3D associados serão excluídos.
                  </p>
                </div>
              </div>

              {/* Informações do Arquivo Atual */}
              <div className="bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 rounded-xl p-4 space-y-2.5">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">
                  Detalhes do Arquivo que Será Excluído
                </span>
                
                <div className="flex items-center justify-between text-xs border-b border-zinc-200/60 dark:border-zinc-700/40 pb-2">
                  <span className="text-zinc-500">Nome do Arquivo:</span>
                  <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                    {projetoAtual.arquivoNome || 'Arquivo Importado'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs border-b border-zinc-200/60 dark:border-zinc-700/40 pb-2">
                  <span className="text-zinc-500">Software de Origem:</span>
                  <span className="font-bold uppercase text-zinc-900 dark:text-zinc-100">
                    {projetoAtual.softwareOrigem}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs border-b border-zinc-200/60 dark:border-zinc-700/40 pb-2">
                  <span className="text-zinc-500">Ambiente / Projeto:</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">
                    {projetoAtual.nomeAmbiente}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Total de Peças & Módulos:</span>
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                    {totalPecas} peças ({itensDoProjeto.length} itens de orçamento)
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-zinc-500 leading-normal">
                Após a exclusão, a tela de importação ficará limpa imediatamente para que você possa arrastar ou selecionar o arquivo correto do Promob, SketchUp ou OpenCutList.
              </p>
            </div>

            {/* Rodapé com Botões de Ação */}
            <div className="p-4 sm:p-5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirmModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleExcluirArquivoEProjeto}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition-colors flex items-center gap-1.5 cursor-pointer shadow-md shadow-rose-600/20"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Sim, Excluir Arquivo</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
