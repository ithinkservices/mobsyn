'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Empresa, 
  Usuario, 
  Cliente, 
  Negocio, 
  Projeto, 
  Contrato, 
  ItemOrcamento, 
  OrdemProducao,
  EtapaProducao,
  EtapaWorkflowProducao,
  RadarPrazosContrato,
  TipoMarcoRadar,
  PapelUsuario,
  WhatsAppMessage,
  WhatsAppConversation,
  WhatsAppMetaConfig,
  SnapshotVersaoOriginalPromob,
  SnapshotVersaoOriginalSketchUp,
  SketchUp3DSceneData,
  ItemOrcamentoOriginal,
  VersaoHistoricoProjeto,
  RevisaoPendenteProjeto,
  SoftwareOrigem,
  InstalacaoAgendada,
  ContaReceber,
  ContaPagar,
  ComissaoRegistro,
  NotaFiscalDocumento,
  TipoNotaFiscal,
  NivelVendedor,
  TicketAssistencia,
  MaterialEstoque,
  RegraPrecificacao,
  StatusCompraMaterial,
  OrigemMaterial
} from '@/types/database';
import { 
  INITIAL_EMPRESAS, 
  INITIAL_USUARIOS, 
  INITIAL_CLIENTES, 
  INITIAL_NEGOCIOS, 
  INITIAL_PROJETOS, 
  INITIAL_CONTRATOS, 
  INITIAL_ITENS_ORCAMENTO,
  INITIAL_ORDENS_PRODUCAO,
  INITIAL_RADARES_PRAZOS,
  INITIAL_WHATSAPP_MESSAGES,
  INITIAL_META_CONFIG,
  INITIAL_INSTALACOES,
  INITIAL_CONTAS_RECEBER,
  INITIAL_CONTAS_PAGAR,
  INITIAL_COMISSOES,
  INITIAL_NOTAS_FISCAIS,
  INITIAL_TICKETS,
  INITIAL_ESTOQUE,
  INITIAL_REGRA_PRECIFICACAO
} from '@/lib/mockData';
import {
  gerarOrdemProducaoDeContrato,
  gerarRadarPrazosInicial,
  avancarEstagioWorkflowProducao,
  concluirMarcoRadarPrazos
} from '@/lib/productionEngine';

interface AppContextType {
  // Auth & Session
  currentUser: Usuario | null;
  isAuthenticated: boolean;
  login: (email: string, papel?: PapelUsuario) => boolean;
  logout: () => void;
  setQuickRole: (papel: PapelUsuario) => void;
  
  // Multi-empresa
  empresas: Empresa[];
  empresaAtiva: Empresa | null;
  trocarEmpresaAtiva: (empresaId: string) => void;
  criarEmpresa: (dados: Omit<Empresa, 'id' | 'createdAt' | 'updatedAt'>) => Empresa;
  editarEmpresa: (id: string, dados: Partial<Empresa>) => void;

  // Usuários
  usuarios: Usuario[];
  criarUsuario: (dados: Omit<Usuario, 'id' | 'createdAt'>) => Usuario;
  editarUsuario: (id: string, dados: Partial<Usuario>) => void;

  // Clientes
  clientes: Cliente[];
  criarCliente: (dados: Omit<Cliente, 'id' | 'empresaId' | 'createdAt' | 'updatedAt'>) => Cliente;
  editarCliente: (id: string, dados: Partial<Cliente>) => void;
  excluirCliente: (id: string) => void;

  // Negócios / Deals
  negocios: Negocio[];
  criarNegocio: (dados: Omit<Negocio, 'id' | 'empresaId' | 'createdAt' | 'updatedAt'>) => Negocio;
  editarNegocio: (id: string, dados: Partial<Negocio>) => void;
  excluirNegocio: (id: string) => void;

  // Projetos
  projetos: Projeto[];
  criarProjeto: (dados: Omit<Projeto, 'id' | 'empresaId' | 'createdAt' | 'updatedAt'>) => Projeto;
  editarProjeto: (id: string, dados: Partial<Projeto>) => void;
  excluirProjeto: (id: string) => void;

  // Contratos
  contratos: Contrato[];
  criarContrato: (dados: Omit<Contrato, 'id' | 'empresaId' | 'createdAt' | 'updatedAt'>) => Contrato;
  editarContrato: (id: string, dados: Partial<Contrato>) => void;
  excluirContrato: (id: string) => void;

  // Itens de Orçamento
  itensOrcamento: ItemOrcamento[];
  criarItemOrcamento: (dados: Omit<ItemOrcamento, 'id' | 'empresaId' | 'createdAt'>) => ItemOrcamento;
  editarItemOrcamento: (id: string, dados: Partial<ItemOrcamento>) => void;
  excluirItemOrcamento: (id: string) => void;

  // Estoque & Precificação
  estoque: MaterialEstoque[];
  regraPrecificacao: RegraPrecificacao;
  adicionarMaterial: (dados: Omit<MaterialEstoque, 'id' | 'empresaId' | 'ultimaAtualizacao'>) => MaterialEstoque;
  atualizarMaterial: (id: string, dados: Partial<MaterialEstoque>) => void;
  excluirMaterial: (id: string) => void;
  atualizarStatusCompraMaterial: (id: string, status: StatusCompraMaterial, incrementarEstoqueQtd?: number) => void;
  gerarListaCompraProjetoParaEstoque: (projetoId: string) => MaterialEstoque[];
  atualizarRegraPrecificacao: (dados: Partial<RegraPrecificacao>) => void;
  recalcularPrecosOrcamentos: () => void;
  importarProjetoPromob: (negocioId: string, parsed: {
    arquivoNome: string;
    formato: 'xml' | 'txt';
    tamanhoBytes?: number;
    totalItens: number;
    totalPecas: number;
    custoTotal: number;
    ambientes: string[];
    itens: {
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
      custoTotal: number;
    }[];
    rawContent: string;
  }, valorVendaSugerido?: number) => { projeto: Projeto; novosItens: ItemOrcamento[] };
  reverterParaVersaoOriginalPromob: (projetoId: string) => boolean;

  importarProjetoSketchUp: (negocioId: string, parsed: {
    arquivoNome: string;
    formato: 'skp' | 'json' | 'csv_opencutlist' | 'txt_opencutlist';
    conversorUtilizado: 'ruby_extension_json' | 'skp_converter_bridge' | 'manual_upload' | 'opencutlist_sketchup_parser';
    tamanhoBytes?: number;
    totalComponentes: number;
    totalInstancias: number;
    custoTotal: number;
    ambientes: string[];
    itens: (ItemOrcamentoOriginal & { 
      posicao3d?: { x: number; y: number; z: number }; 
      cor3d?: string;
      isFerragem?: boolean;
      fitaBordaMetros?: number;
      espessuraMm?: number;
      categoria?: string;
    })[];
    scene3d: SketchUp3DSceneData;
    rawContent?: string;
  }, valorVendaSugerido?: number) => { projeto: Projeto; novosItens: ItemOrcamento[] };
  reverterParaVersaoOriginalSketchUp: (projetoId: string) => boolean;

  // Revisões de Projeto & Diff
  iniciarRevisaoProjeto: (projetoId: string, dadosRevisao: {
    arquivoNome: string;
    softwareOrigem: SoftwareOrigem;
    motivo: string;
    custoTotal: number;
    totalPecas: number;
    ambientes: string[];
    itens: (ItemOrcamentoOriginal & { posicao3d?: { x: number; y: number; z: number }; cor3d?: string })[];
    modelo3dDados?: SketchUp3DSceneData;
    rawContent?: string;
  }) => void;
  aprovarRevisaoProjeto: (projetoId: string, motivoRevisao: string, novoValorVendaSugerido?: number) => boolean;
  cancelarRevisaoProjeto: (projetoId: string) => void;
  restaurarVersaoHistorico: (projetoId: string, versaoId: string) => boolean;

  // Produção & Chão de Fábrica (7 Estágios)
  ordensProducao: OrdemProducao[];
  criarOrdemProducao: (dados: Omit<OrdemProducao, 'id' | 'empresaId' | 'createdAt' | 'updatedAt'>) => OrdemProducao;
  editarOrdemProducao: (id: string, dados: Partial<OrdemProducao>) => void;
  avancarEtapaProducao: (id: string, responsavelConclusaoNome?: string, observacaoConclusao?: string, proximoResponsavelNome?: string) => { opAtualizada: OrdemProducao; mensagemNotificacao: string } | null;
  excluirOrdemProducao: (id: string) => void;

  // Radar de Prazos (6 Marcos do Ciclo & SLAs)
  radaresPrazos: RadarPrazosContrato[];
  criarRadarPrazos: (dados: Omit<RadarPrazosContrato, 'id' | 'createdAt' | 'updatedAt'>) => RadarPrazosContrato;
  editarRadarPrazos: (id: string, dados: Partial<RadarPrazosContrato>) => void;
  concluirMarcoRadar: (radarId: string, tipoMarco: TipoMarcoRadar, responsavelNome: string, observacoes?: string) => void;

  // WhatsApp & Atendimento Integrado
  mensagensWhatsApp: WhatsAppMessage[];
  conversasWhatsApp: WhatsAppConversation[];
  totalMensagensNaoLidas: number;
  metaConfig: WhatsAppMetaConfig;
  conversaAtivaTelefone: string | null;
  setConversaAtivaTelefone: (telefone: string | null) => void;
  enviarMensagemWhatsApp: (telefone: string, texto: string, clienteId?: string, negocioId?: string) => Promise<boolean>;
  receberMensagemWhatsApp: (telefone: string, texto: string, autorNome?: string) => { message: WhatsAppMessage; cliente: Cliente; negocio: Negocio };
  marcarConversaComoLida: (telefone: string) => void;
  atualizarMetaConfig: (dados: Partial<WhatsAppMetaConfig>) => void;
  abrirConversaWhatsApp: (telefoneOuClienteId: string) => void;

  // Navegação
  abaAtiva: string;
  setAbaAtiva: (aba: string) => void;
  isMobileDrawerOpen: boolean;
  setIsMobileDrawerOpen: (open: boolean) => void;

  // Portal do Montador & Instalações
  instalacoes: InstalacaoAgendada[];
  criarInstalacao: (dados: Omit<InstalacaoAgendada, 'id' | 'createdAt' | 'updatedAt'>) => InstalacaoAgendada;
  editarInstalacao: (id: string, dados: Partial<InstalacaoAgendada>) => void;
  fazerCheckInInstalacao: (id: string) => Promise<{ success: boolean; lat?: number; lng?: number; message: string }>;
  adicionarFotoInstalacao: (id: string, url: string, tipo: 'antes' | 'durante' | 'depois', autorNome: string) => void;
  atualizarChecklistInstalacao: (id: string, itemChecklistId: string, concluido: boolean) => void;
  finalizarInstalacao: (id: string, assinatura: { nomeCliente: string; cpfCliente?: string; aceiteTermo: boolean; assinaturaUrl?: string }) => void;

  // Módulo Financeiro, DRE & Fiscal
  contasReceber: ContaReceber[];
  criarContaReceber: (dados: Omit<ContaReceber, 'id' | 'empresaId'>) => ContaReceber;
  atualizarContaReceber: (id: string, dados: Partial<ContaReceber>) => void;
  pagarContaReceber: (id: string, dataPagamento?: string) => void;
  aplicarTaxaCartaoReceber: (id: string, taxaPercentual: number) => void;

  contasPagar: ContaPagar[];
  criarContaPagar: (dados: Omit<ContaPagar, 'id' | 'empresaId'>) => ContaPagar;
  atualizarContaPagar: (id: string, dados: Partial<ContaPagar>) => void;
  pagarContaPagar: (id: string, dataPagamento?: string) => void;

  comissoes: ComissaoRegistro[];
  criarComissao: (dados: Omit<ComissaoRegistro, 'id' | 'empresaId'>) => ComissaoRegistro;
  pagarComissao: (id: string) => void;

  notasFiscais: NotaFiscalDocumento[];
  emitirNotaFiscal: (contratoId: string, tipo: TipoNotaFiscal) => Promise<{ success: boolean; message: string; nf: NotaFiscalDocumento }>;

  // Assistência Técnica & Pós-Venda
  ticketsAssistenca: TicketAssistencia[];
  criarChamadoAssistencia: (dados: Omit<TicketAssistencia, 'id' | 'empresaId' | 'createdAt' | 'updatedAt'>) => TicketAssistencia;
  editarChamadoAssistencia: (id: string, dados: Partial<TicketAssistencia>) => void;
  excluirChamadoAssistencia: (id: string) => void;
  zerarSistema: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  EMPRESAS: 'mobplan_empresas_v2',
  USUARIOS: 'mobplan_usuarios_v2',
  CURRENT_USER: 'mobplan_currentUser_v2',
  ACTIVE_EMPRESA_ID: 'mobplan_activeEmpresaId_v2',
  CLIENTES: 'mobplan_clientes_v2',
  NEGOCIOS: 'mobplan_negocios_v2',
  PROJETOS: 'mobplan_projetos_v2',
  CONTRATOS: 'mobplan_contratos_v2',
  ITENS_ORCAMENTO: 'mobplan_itensOrcamento_v2',
  WHATSAPP_MESSAGES: 'mobplan_whatsappMessages_v2',
  META_CONFIG: 'mobplan_metaConfig_v2',
  ORDENS_PRODUCAO: 'mobplan_ordensProducao_v2',
  RADARES_PRAZOS: 'mobplan_radaresPrazos_v2',
  INSTALACOES: 'mobplan_instalacoes_v2',
  CONTAS_RECEBER: 'mobplan_contasReceber_v2',
  CONTAS_PAGAR: 'mobplan_contasPagar_v2',
  COMISSOES: 'mobplan_comissoes_v2',
  NOTAS_FISCAIS: 'mobplan_notasFiscais_v2',
  TICKETS_ASSISTENCIA: 'mobplan_ticketsAssistencia_v2',
  ESTOQUE: 'mobplan_estoque_v2',
  REGRA_PRECIFICACAO: 'mobplan_regraPrecificacao_v2',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isStorageLoaded, setIsStorageLoaded] = useState(false);
  const [empresas, setEmpresas] = useState<Empresa[]>(INITIAL_EMPRESAS);
  const [usuarios, setUsuarios] = useState<Usuario[]>(INITIAL_USUARIOS);
  const [currentUser, setCurrentUser] = useState<Usuario | null>(INITIAL_USUARIOS[0]);
  const [activeEmpresaId, setActiveEmpresaId] = useState<string>('emp_01');
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [negocios, setNegocios] = useState<Negocio[]>([]);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [itensOrcamento, setItensOrcamento] = useState<ItemOrcamento[]>([]);
  const [estoque, setEstoque] = useState<MaterialEstoque[]>(INITIAL_ESTOQUE);
  const [regraPrecificacao, setRegraPrecificacao] = useState<RegraPrecificacao>(INITIAL_REGRA_PRECIFICACAO);
  const [ordensProducao, setOrdensProducao] = useState<OrdemProducao[]>([]);
  const [radaresPrazos, setRadaresPrazos] = useState<RadarPrazosContrato[]>([]);
  const [instalacoes, setInstalacoes] = useState<InstalacaoAgendada[]>([]);
  const [contasReceber, setContasReceber] = useState<ContaReceber[]>([]);
  const [contasPagar, setContasPagar] = useState<ContaPagar[]>([]);
  const [comissoes, setComissoes] = useState<ComissaoRegistro[]>([]);
  const [notasFiscais, setNotasFiscais] = useState<NotaFiscalDocumento[]>([]);
  const [ticketsAssistenca, setTicketsAssistenca] = useState<TicketAssistencia[]>([]);
  const [mensagensWhatsApp, setMensagensWhatsApp] = useState<WhatsAppMessage[]>([]);
  const [metaConfig, setMetaConfig] = useState<WhatsAppMetaConfig>(INITIAL_META_CONFIG);
  const [conversaAtivaTelefone, setConversaAtivaTelefone] = useState<string | null>(null);
  const [abaAtiva, setAbaAtiva] = useState<string>('dashboard');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);

  // 1. Carregar do localStorage na montagem (evita hydration mismatch entre servidor e cliente)
  useEffect(() => {
    queueMicrotask(() => {
      try {
        const storedEmpresas = localStorage.getItem(STORAGE_KEYS.EMPRESAS);
        if (storedEmpresas) setEmpresas(JSON.parse(storedEmpresas));

        const storedUsuarios = localStorage.getItem(STORAGE_KEYS.USUARIOS);
        if (storedUsuarios) setUsuarios(JSON.parse(storedUsuarios));

        const storedCurrentUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
        if (storedCurrentUser) {
          const usr = JSON.parse(storedCurrentUser);
          setCurrentUser(usr);
          if (usr?.papel === 'montador') {
            setAbaAtiva('montagem');
          }
        }

        const storedActiveEmpresaId = localStorage.getItem(STORAGE_KEYS.ACTIVE_EMPRESA_ID);
        if (storedActiveEmpresaId) setActiveEmpresaId(storedActiveEmpresaId);

        const storedClientes = localStorage.getItem(STORAGE_KEYS.CLIENTES);
        if (storedClientes) setClientes(JSON.parse(storedClientes));

        const storedNegocios = localStorage.getItem(STORAGE_KEYS.NEGOCIOS);
        if (storedNegocios) setNegocios(JSON.parse(storedNegocios));

        const storedProjetos = localStorage.getItem(STORAGE_KEYS.PROJETOS);
        if (storedProjetos) setProjetos(JSON.parse(storedProjetos));

        const storedContratos = localStorage.getItem(STORAGE_KEYS.CONTRATOS);
        if (storedContratos) setContratos(JSON.parse(storedContratos));

        const storedItensOrcamento = localStorage.getItem(STORAGE_KEYS.ITENS_ORCAMENTO);
        if (storedItensOrcamento) setItensOrcamento(JSON.parse(storedItensOrcamento));

        const storedOrdensProducao = localStorage.getItem(STORAGE_KEYS.ORDENS_PRODUCAO);
        if (storedOrdensProducao) setOrdensProducao(JSON.parse(storedOrdensProducao));

        const storedRadaresPrazos = localStorage.getItem(STORAGE_KEYS.RADARES_PRAZOS);
        if (storedRadaresPrazos) setRadaresPrazos(JSON.parse(storedRadaresPrazos));

        const storedInstalacoes = localStorage.getItem(STORAGE_KEYS.INSTALACOES);
        if (storedInstalacoes) setInstalacoes(JSON.parse(storedInstalacoes));

        const storedContasReceber = localStorage.getItem(STORAGE_KEYS.CONTAS_RECEBER);
        if (storedContasReceber) setContasReceber(JSON.parse(storedContasReceber));

        const storedContasPagar = localStorage.getItem(STORAGE_KEYS.CONTAS_PAGAR);
        if (storedContasPagar) setContasPagar(JSON.parse(storedContasPagar));

        const storedComissoes = localStorage.getItem(STORAGE_KEYS.COMISSOES);
        if (storedComissoes) setComissoes(JSON.parse(storedComissoes));

        const storedNotasFiscais = localStorage.getItem(STORAGE_KEYS.NOTAS_FISCAIS);
        if (storedNotasFiscais) setNotasFiscais(JSON.parse(storedNotasFiscais));

        const storedTickets = localStorage.getItem(STORAGE_KEYS.TICKETS_ASSISTENCIA);
        if (storedTickets) setTicketsAssistenca(JSON.parse(storedTickets));

        const storedWhatsApp = localStorage.getItem(STORAGE_KEYS.WHATSAPP_MESSAGES);
        if (storedWhatsApp) setMensagensWhatsApp(JSON.parse(storedWhatsApp));

        const storedMetaConfig = localStorage.getItem(STORAGE_KEYS.META_CONFIG);
        if (storedMetaConfig) setMetaConfig(JSON.parse(storedMetaConfig));

        const storedEstoque = localStorage.getItem(STORAGE_KEYS.ESTOQUE);
        if (storedEstoque) setEstoque(JSON.parse(storedEstoque));

        const storedRegra = localStorage.getItem(STORAGE_KEYS.REGRA_PRECIFICACAO);
        if (storedRegra) setRegraPrecificacao(JSON.parse(storedRegra));
      } catch (e) {
        console.warn('Erro ao carregar dados do armazenamento local:', e);
      } finally {
        setIsStorageLoaded(true);
      }
    });
  }, []);

  // 2. Salvar alterações no localStorage apenas APÓS o carregamento inicial
  useEffect(() => {
    if (!isStorageLoaded || typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.EMPRESAS, JSON.stringify(empresas));
      localStorage.setItem(STORAGE_KEYS.USUARIOS, JSON.stringify(usuarios));
      localStorage.setItem(STORAGE_KEYS.ACTIVE_EMPRESA_ID, activeEmpresaId);
      if (currentUser) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      }
      localStorage.setItem(STORAGE_KEYS.CLIENTES, JSON.stringify(clientes));
      localStorage.setItem(STORAGE_KEYS.NEGOCIOS, JSON.stringify(negocios));
      localStorage.setItem(STORAGE_KEYS.PROJETOS, JSON.stringify(projetos));
      localStorage.setItem(STORAGE_KEYS.CONTRATOS, JSON.stringify(contratos));
      localStorage.setItem(STORAGE_KEYS.ITENS_ORCAMENTO, JSON.stringify(itensOrcamento));
      localStorage.setItem(STORAGE_KEYS.ORDENS_PRODUCAO, JSON.stringify(ordensProducao));
      localStorage.setItem(STORAGE_KEYS.RADARES_PRAZOS, JSON.stringify(radaresPrazos));
      localStorage.setItem(STORAGE_KEYS.INSTALACOES, JSON.stringify(instalacoes));
      localStorage.setItem(STORAGE_KEYS.CONTAS_RECEBER, JSON.stringify(contasReceber));
      localStorage.setItem(STORAGE_KEYS.CONTAS_PAGAR, JSON.stringify(contasPagar));
      localStorage.setItem(STORAGE_KEYS.COMISSOES, JSON.stringify(comissoes));
      localStorage.setItem(STORAGE_KEYS.NOTAS_FISCAIS, JSON.stringify(notasFiscais));
      localStorage.setItem(STORAGE_KEYS.TICKETS_ASSISTENCIA, JSON.stringify(ticketsAssistenca));
      localStorage.setItem(STORAGE_KEYS.WHATSAPP_MESSAGES, JSON.stringify(mensagensWhatsApp));
      localStorage.setItem(STORAGE_KEYS.META_CONFIG, JSON.stringify(metaConfig));
      localStorage.setItem(STORAGE_KEYS.ESTOQUE, JSON.stringify(estoque));
      localStorage.setItem(STORAGE_KEYS.REGRA_PRECIFICACAO, JSON.stringify(regraPrecificacao));
    } catch (e) {
      console.warn('Erro ao persistir dados locais:', e);
    }
  }, [isStorageLoaded, empresas, usuarios, currentUser, activeEmpresaId, clientes, negocios, projetos, contratos, itensOrcamento, ordensProducao, radaresPrazos, instalacoes, contasReceber, contasPagar, comissoes, notasFiscais, ticketsAssistenca, mensagensWhatsApp, metaConfig, estoque, regraPrecificacao]);

  const empresaAtiva = empresas.find(e => e.id === activeEmpresaId) || empresas[0] || null;

  // Funções de Autenticação
  const login = (email: string, papel?: PapelUsuario): boolean => {
    let found = usuarios.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!found) {
      // Criar usuário dinâmico se for novo login
      const novo: Usuario = {
        id: `usr_${Date.now()}`,
        nome: email.split('@')[0].replace('.', ' ').toUpperCase(),
        email: email,
        papel: papel || 'administrador',
        empresasIds: [activeEmpresaId || 'emp_01'],
        empresaAtivaId: activeEmpresaId || 'emp_01',
        createdAt: new Date().toISOString(),
      };
      setUsuarios(prev => [...prev, novo]);
      setCurrentUser(novo);
      if (novo.papel === 'montador') {
        setAbaAtiva('montagem');
      }
      return true;
    }
    setCurrentUser(found);
    if (found.empresaAtivaId) {
      setActiveEmpresaId(found.empresaAtivaId);
    }
    if (found.papel === 'montador' || papel === 'montador') {
      setAbaAtiva('montagem');
    }
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const setQuickRole = (papel: PapelUsuario) => {
    const userWithRole = usuarios.find(u => u.papel === papel);
    if (userWithRole) {
      setCurrentUser(userWithRole);
      if (userWithRole.empresaAtivaId) {
        setActiveEmpresaId(userWithRole.empresaAtivaId);
      }
    } else if (currentUser) {
      const updatedUser = { ...currentUser, papel };
      setCurrentUser(updatedUser);
      setUsuarios(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    }
    if (papel === 'montador') {
      setAbaAtiva('montagem');
    }
  };

  // Instalações & Portal do Montador Methods
  const criarInstalacao = (dados: Omit<InstalacaoAgendada, 'id' | 'createdAt' | 'updatedAt'>): InstalacaoAgendada => {
    const nova: InstalacaoAgendada = {
      ...dados,
      id: `inst_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setInstalacoes(prev => [nova, ...prev]);
    return nova;
  };

  const editarInstalacao = (id: string, dados: Partial<InstalacaoAgendada>) => {
    setInstalacoes(prev => prev.map(i => i.id === id ? { ...i, ...dados, updatedAt: new Date().toISOString() } : i));
  };

  const fazerCheckInInstalacao = async (id: string): Promise<{ success: boolean; lat?: number; lng?: number; message: string }> => {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const horario = new Date().toISOString();
            
            setInstalacoes(prev => prev.map(inst => {
              if (inst.id === id) {
                return {
                  ...inst,
                  status: 'em_andamento',
                  checkInLat: lat,
                  checkInLng: lng,
                  checkInHorario: horario,
                  updatedAt: horario
                };
              }
              return inst;
            }));

            resolve({ success: true, lat, lng, message: `Check-in realizado com sucesso via GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})!` });
          },
          (error) => {
            const lat = -23.5505;
            const lng = -46.6333;
            const horario = new Date().toISOString();

            setInstalacoes(prev => prev.map(inst => {
              if (inst.id === id) {
                return {
                  ...inst,
                  status: 'em_andamento',
                  checkInLat: lat,
                  checkInLng: lng,
                  checkInHorario: horario,
                  updatedAt: horario
                };
              }
              return inst;
            }));

            resolve({ success: true, lat, lng, message: `Check-in registrado com coordenadas padrão (${error.message})` });
          },
          { timeout: 10000, enableHighAccuracy: true }
        );
      } else {
        const lat = -23.5505;
        const lng = -46.6333;
        const horario = new Date().toISOString();

        setInstalacoes(prev => prev.map(inst => {
          if (inst.id === id) {
            return {
              ...inst,
              status: 'em_andamento',
              checkInLat: lat,
              checkInLng: lng,
              checkInHorario: horario,
              updatedAt: horario
            };
          }
          return inst;
        }));
        resolve({ success: true, lat, lng, message: 'Check-in realizado com sucesso!' });
      }
    });
  };

  const adicionarFotoInstalacao = (id: string, url: string, tipo: 'antes' | 'durante' | 'depois', autorNome: string) => {
    setInstalacoes(prev => prev.map(inst => {
      if (inst.id === id) {
        const novaFoto = {
          id: `foto_${Date.now()}`,
          url,
          tipo,
          timestamp: new Date().toISOString(),
          autorNome
        };
        return {
          ...inst,
          fotos: [...inst.fotos, novaFoto],
          updatedAt: new Date().toISOString()
        };
      }
      return inst;
    }));
  };

  const atualizarChecklistInstalacao = (id: string, itemChecklistId: string, concluido: boolean) => {
    setInstalacoes(prev => prev.map(inst => {
      if (inst.id === id) {
        const novoChecklist = inst.checklist.map(item => item.id === itemChecklistId ? { ...item, concluido } : item);
        return {
          ...inst,
          checklist: novoChecklist,
          updatedAt: new Date().toISOString()
        };
      }
      return inst;
    }));
  };

  const finalizarInstalacao = (id: string, assinatura: { nomeCliente: string; cpfCliente?: string; aceiteTermo: boolean; assinaturaUrl?: string }) => {
    const agora = new Date().toISOString();
    let contratoIdRelacionado = '';

    setInstalacoes(prev => prev.map(inst => {
      if (inst.id === id) {
        contratoIdRelacionado = inst.contratoId;
        return {
          ...inst,
          status: 'concluida',
          assinaturaCliente: {
            ...assinatura,
            dataHora: agora
          },
          updatedAt: agora
        };
      }
      return inst;
    }));

    // Atualizar Radar de Prazos automaticamente (marcos 'montagem' e 'concluido')
    if (contratoIdRelacionado) {
      const radarAlvo = radaresPrazos.find(r => r.contratoId === contratoIdRelacionado);
      if (radarAlvo) {
        let radarAtualizado = radarAlvo;
        const marcoMontagem = radarAtualizado.marcos.find(m => m.tipo === 'montagem');
        if (marcoMontagem && marcoMontagem.statusMarco !== 'concluido') {
          radarAtualizado = concluirMarcoRadarPrazos({
            radar: radarAtualizado,
            tipoMarcoConcluido: 'montagem',
            responsavelNome: currentUser?.nome || 'Equipe de Montagem',
            observacoes: `Instalação concluída e assinada pelo cliente ${assinatura.nomeCliente}.`
          });
        }
        const marcoConcluido = radarAtualizado.marcos.find(m => m.tipo === 'concluido');
        if (marcoConcluido && marcoConcluido.statusMarco !== 'concluido') {
          radarAtualizado = concluirMarcoRadarPrazos({
            radar: radarAtualizado,
            tipoMarcoConcluido: 'concluido',
            responsavelNome: currentUser?.nome || 'Gestão',
            observacoes: 'Vistoria final e termo de aceite emitidos com sucesso.'
          });
        }

        setRadaresPrazos(prev => prev.map(r => r.id === radarAtualizado.id ? radarAtualizado : r));
      }
    }
  };

  // Módulo Financeiro & Fiscal Methods
  const criarContaReceber = (dados: Omit<ContaReceber, 'id' | 'empresaId'>): ContaReceber => {
    const nova: ContaReceber = {
      ...dados,
      id: `cr_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      empresaId: activeEmpresaId,
    };
    setContasReceber(prev => [nova, ...prev]);
    return nova;
  };

  const atualizarContaReceber = (id: string, dados: Partial<ContaReceber>) => {
    setContasReceber(prev => prev.map(c => c.id === id ? { ...c, ...dados } : c));
  };

  const pagarContaReceber = (id: string, dataPagamento?: string) => {
    const dataPag = dataPagamento || new Date().toISOString();
    setContasReceber(prev => prev.map(c => c.id === id ? { ...c, status: 'pago', dataPagamento: dataPag } : c));
  };

  const aplicarTaxaCartaoReceber = (id: string, taxaPercentual: number) => {
    setContasReceber(prev => prev.map(c => {
      if (c.id === id) {
        const taxaValor = Number((c.valorOriginal * (taxaPercentual / 100)).toFixed(2));
        const liquido = Number((c.valorOriginal - taxaValor).toFixed(2));
        return {
          ...c,
          taxaCartaoPercentual: taxaPercentual,
          valorTaxaCartao: taxaValor,
          valorLiquido: liquido
        };
      }
      return c;
    }));
  };

  const criarContaPagar = (dados: Omit<ContaPagar, 'id' | 'empresaId'>): ContaPagar => {
    const nova: ContaPagar = {
      ...dados,
      id: `cp_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      empresaId: activeEmpresaId,
    };
    setContasPagar(prev => [nova, ...prev]);
    return nova;
  };

  const atualizarContaPagar = (id: string, dados: Partial<ContaPagar>) => {
    setContasPagar(prev => prev.map(c => c.id === id ? { ...c, ...dados } : c));
  };

  const pagarContaPagar = (id: string, dataPagamento?: string) => {
    const dataPag = dataPagamento || new Date().toISOString();
    setContasPagar(prev => prev.map(c => c.id === id ? { ...c, status: 'pago', dataPagamento: dataPag } : c));
  };

  const criarComissao = (dados: Omit<ComissaoRegistro, 'id' | 'empresaId'>): ComissaoRegistro => {
    const nova: ComissaoRegistro = {
      ...dados,
      id: `com_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      empresaId: activeEmpresaId,
    };
    setComissoes(prev => [nova, ...prev]);
    return nova;
  };

  const pagarComissao = (id: string) => {
    setComissoes(prev => prev.map(c => c.id === id ? { ...c, status: 'pago' } : c));
  };

  const emitirNotaFiscal = async (contratoId: string, tipo: TipoNotaFiscal): Promise<{ success: boolean; message: string; nf: NotaFiscalDocumento }> => {
    const contrato = contratos.find(c => c.id === contratoId);
    const empresa = empresas.find(e => e.id === activeEmpresaId);

    if (!contrato || !empresa) {
      return { success: false, message: 'Contrato ou empresa não encontrados.', nf: {} as any };
    }

    const numeroAleatorio = String(Math.floor(100000 + Math.random() * 900000));
    const chaveAleatoria = '3526' + String(Math.floor(10000000000000000000000000000000000000000000 + Math.random() * 90000000000000000000000000000000000000000000));
    const agora = new Date().toISOString();

    const novaNF: NotaFiscalDocumento = {
      id: `nf_${Date.now()}`,
      empresaId: activeEmpresaId,
      contratoId: contrato.id,
      numeroContrato: contrato.numeroContrato,
      tipo,
      status: 'autorizada',
      numeroNota: numeroAleatorio,
      chaveAcesso: chaveAleatoria,
      valor: contrato.valorTotal,
      emitidoEm: agora,
      provedorIntegracao: 'Focus NFe / eNotas API v2 (Produção SEFAZ-SP via Certificado A1)',
      xmlUrl: `https://api.focusnfe.com.br/v2/nfes/${chaveAleatoria}.xml`,
      pdfUrl: `https://api.focusnfe.com.br/v2/nfes/${chaveAleatoria}.pdf`
    };

    setNotasFiscais(prev => [novaNF, ...prev.filter(n => n.contratoId !== contratoId || n.tipo !== tipo)]);
    return { success: true, message: `Nota Fiscal (${tipo === 'nfe_produto' ? 'NF-e Produto' : 'NFS-e Serviço'}) autorizada com sucesso pela SEFAZ!`, nf: novaNF };
  };

  const ticketsAssistencaFiltrados = ticketsAssistenca.filter(t => t.empresaId === activeEmpresaId);

  const criarChamadoAssistencia = (dados: Omit<TicketAssistencia, 'id' | 'empresaId' | 'createdAt' | 'updatedAt'>): TicketAssistencia => {
    const novo: TicketAssistencia = {
      ...dados,
      id: `ast_${Date.now()}`,
      empresaId: activeEmpresaId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTicketsAssistenca(prev => [novo, ...prev]);
    return novo;
  };

  const editarChamadoAssistencia = (id: string, dados: Partial<TicketAssistencia>) => {
    setTicketsAssistenca(prev => prev.map(t => {
      if (t.id === id) {
        const atualizado = { ...t, ...dados, updatedAt: new Date().toISOString() };
        if (dados.status === 'resolvido' && t.status !== 'resolvido' && !atualizado.dataResolucao) {
          atualizado.dataResolucao = new Date().toISOString();
        }
        return atualizado;
      }
      return t;
    }));
  };

  const excluirChamadoAssistencia = (id: string) => {
    setTicketsAssistenca(prev => prev.filter(t => t.id !== id));
  };

  // Multi-empresa CRUD
  const trocarEmpresaAtiva = (empresaId: string) => {
    const target = empresas.find(e => e.id === empresaId);
    if (target) {
      setActiveEmpresaId(empresaId);
      if (currentUser) {
        setCurrentUser(prev => prev ? { ...prev, empresaAtivaId: empresaId } : null);
      }
    }
  };

  const criarEmpresa = (dados: Omit<Empresa, 'id' | 'createdAt' | 'updatedAt'>): Empresa => {
    const novaEmpresa: Empresa = {
      ...dados,
      id: `emp_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEmpresas(prev => [...prev, novaEmpresa]);
    setActiveEmpresaId(novaEmpresa.id);
    if (currentUser) {
      setCurrentUser(prev => prev ? {
        ...prev,
        empresasIds: [...prev.empresasIds, novaEmpresa.id],
        empresaAtivaId: novaEmpresa.id,
      } : null);
    }
    return novaEmpresa;
  };

  const editarEmpresa = (id: string, dados: Partial<Empresa>) => {
    setEmpresas(prev => prev.map(e => e.id === id ? { ...e, ...dados, updatedAt: new Date().toISOString() } : e));
  };

  // Usuários CRUD
  const criarUsuario = (dados: Omit<Usuario, 'id' | 'createdAt'>): Usuario => {
    const novoUsuario: Usuario = {
      ...dados,
      id: `usr_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setUsuarios(prev => [...prev, novoUsuario]);
    return novoUsuario;
  };

  const editarUsuario = (id: string, dados: Partial<Usuario>) => {
    setUsuarios(prev => prev.map(u => u.id === id ? { ...u, ...dados } : u));
    if (currentUser && currentUser.id === id) {
      setCurrentUser(prev => prev ? { ...prev, ...dados } : null);
    }
  };

  // Clientes CRUD
  const criarCliente = (dados: Omit<Cliente, 'id' | 'empresaId' | 'createdAt' | 'updatedAt'>): Cliente => {
    const novoCliente: Cliente = {
      ...dados,
      id: `cli_${Date.now()}`,
      empresaId: activeEmpresaId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setClientes(prev => [novoCliente, ...prev]);
    return novoCliente;
  };

  const editarCliente = (id: string, dados: Partial<Cliente>) => {
    setClientes(prev => prev.map(c => c.id === id ? { ...c, ...dados, updatedAt: new Date().toISOString() } : c));
  };

  const removerDadosVinculadosCliente = (clienteId: string) => {
    const negocioIds = negocios.filter(n => n.clienteId === clienteId).map(n => n.id);
    const projetoIds = projetos.filter(p => p.clienteId === clienteId || (p.negocioId && negocioIds.includes(p.negocioId))).map(p => p.id);
    const contratoIds = contratos.filter(c => c.clienteId === clienteId || (c.negocioId && negocioIds.includes(c.negocioId))).map(c => c.id);

    setClientes(prev => prev.filter(c => c.id !== clienteId));
    setNegocios(prev => prev.filter(n => n.clienteId !== clienteId));
    setProjetos(prev => prev.filter(p => p.clienteId !== clienteId && (!p.negocioId || !negocioIds.includes(p.negocioId))));
    setContratos(prev => prev.filter(c => c.clienteId !== clienteId && (!c.negocioId || !negocioIds.includes(c.negocioId))));
    setItensOrcamento(prev => prev.filter(io => !io.projetoId || !projetoIds.includes(io.projetoId)));
    setOrdensProducao(prev => prev.filter(op => (!op.projetoId || !projetoIds.includes(op.projetoId)) && (!op.contratoId || !contratoIds.includes(op.contratoId))));
    setRadaresPrazos(prev => prev.filter(rp => !rp.contratoId || !contratoIds.includes(rp.contratoId)));
    setInstalacoes(prev => prev.filter(inst => inst.clienteId !== clienteId && (!inst.contratoId || !contratoIds.includes(inst.contratoId))));
    setContasReceber(prev => prev.filter(cr => !cr.contratoId || !contratoIds.includes(cr.contratoId)));
    setContasPagar(prev => prev.filter(cp => !cp.contratoId || !contratoIds.includes(cp.contratoId)));
    setComissoes(prev => prev.filter(com => !com.contratoId || !contratoIds.includes(com.contratoId)));
    setNotasFiscais(prev => prev.filter(nf => !nf.contratoId || !contratoIds.includes(nf.contratoId)));
    setTicketsAssistenca(prev => prev.filter(t => t.clienteId !== clienteId && (!t.contratoId || !contratoIds.includes(t.contratoId))));
    setMensagensWhatsApp(prev => prev.map(m => m.clienteId === clienteId ? { ...m, clienteId: undefined, negocioId: undefined } : m));
  };

  const excluirCliente = (id: string) => {
    removerDadosVinculadosCliente(id);
  };

  // Negócios CRUD
  const criarNegocio = (dados: Omit<Negocio, 'id' | 'empresaId' | 'createdAt' | 'updatedAt'>): Negocio => {
    const novoNegocio: Negocio = {
      ...dados,
      id: `neg_${Date.now()}`,
      empresaId: activeEmpresaId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNegocios(prev => [novoNegocio, ...prev]);
    return novoNegocio;
  };

  const editarNegocio = (id: string, dados: Partial<Negocio>) => {
    setNegocios(prev => prev.map(n => n.id === id ? { ...n, ...dados, updatedAt: new Date().toISOString() } : n));

    // Se o negócio foi Fechado (Ganho), automatiza Contrato, status do Cliente e Ordem de Produção (Chão de Fábrica)
    if (dados.etapaFunil === 'fechado_ganho') {
      const targetNegocio = negocios.find(n => n.id === id);
      if (targetNegocio) {
        // 1. Atualiza status do cliente para 'fechado'
        setClientes(prev => prev.map(c => c.id === targetNegocio.clienteId ? { ...c, status: 'fechado', updatedAt: new Date().toISOString() } : c));

        // 2. Garante existência do Contrato
        let existingCtr = contratos.find(c => c.negocioId === id);
        let ctrId = existingCtr?.id;
        if (!existingCtr) {
          const anoAtual = new Date().getFullYear();
          const count = contratos.filter(c => c.empresaId === activeEmpresaId).length + 1;
          const numFormatado = `#${String(count).padStart(4, '0')}/${anoAtual}`;
          const novoContrato: Contrato = {
            id: `ctr_${Date.now()}`,
            empresaId: activeEmpresaId,
            negocioId: id,
            clienteId: targetNegocio.clienteId,
            numeroContrato: numFormatado,
            valorTotal: targetNegocio.valorEstimado || 55000,
            condicoesPagamento: 'Entrada de 40% + 3x boletos bancários pós-medição fina',
            statusAssinatura: 'assinado',
            dataAssinatura: new Date().toISOString().slice(0, 10),
            prazoEntregaDias: 45,
            dataPrevistaEntrega: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setContratos(prev => [novoContrato, ...prev]);
          ctrId = novoContrato.id;
          existingCtr = novoContrato;
        }

        // 3. Cria automaticamente a Ordem de Produção (Chão de Fábrica - Etapa: Corte)
        const existingOP = ordensProducao.find(op => op.negocioId === id);
        if (!existingOP) {
          const prjAssoc = projetos.find(p => p.negocioId === id);
          const pecasAssoc = itensOrcamento.filter(i => i.projetoId === prjAssoc?.id);
          const pecasContagem = pecasAssoc.length > 0
            ? pecasAssoc.reduce((acc, itm) => acc + (itm.quantidade * 5), 0)
            : 38;
          const chapasContagem = Math.max(3, Math.ceil(pecasContagem / 7));

          const novaOP: OrdemProducao = {
            id: `op_${Date.now()}`,
            empresaId: activeEmpresaId,
            negocioId: id,
            clienteId: targetNegocio.clienteId,
            contratoId: ctrId,
            projetoId: prjAssoc?.id,
            numeroOP: `OP-${existingCtr?.numeroContrato || `#${Date.now().toString().slice(-4)}/2026`}`,
            titulo: targetNegocio.titulo,
            etapaAtual: 'corte', // Inicia no Chão de Fábrica (Corte e Seccionamento)
            prazoDias: existingCtr?.prazoEntregaDias || 45,
            dataInicio: new Date().toISOString().slice(0, 10),
            dataPrevisaoEntrega: new Date(Date.now() + (existingCtr?.prazoEntregaDias || 45) * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
            totalPecas: pecasContagem,
            totalChapasMdf: chapasContagem,
            observacoes: prjAssoc 
              ? `Importado do projeto 3D ${prjAssoc.softwareOrigem.toUpperCase()}: ${prjAssoc.nomeAmbiente}. Liberado para plano de corte e usinagem CNC.` 
              : 'Projeto aprovado pelo cliente. Ordem de produção liberada para corte.',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          setOrdensProducao(prev => [novaOP, ...prev]);
        }
      }
    }
  };

  const excluirNegocio = (id: string) => {
    const neg = negocios.find(n => n.id === id);
    if (neg && neg.clienteId) {
      removerDadosVinculadosCliente(neg.clienteId);
    } else {
      setNegocios(prev => prev.filter(n => n.id !== id));
      setProjetos(prev => prev.filter(p => p.negocioId !== id));
      setContratos(prev => prev.filter(c => c.negocioId !== id));
    }
  };

  // Projetos CRUD
  const criarProjeto = (dados: Omit<Projeto, 'id' | 'empresaId' | 'createdAt' | 'updatedAt'>): Projeto => {
    const novoProjeto: Projeto = {
      ...dados,
      id: `prj_${Date.now()}`,
      empresaId: activeEmpresaId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProjetos(prev => [novoProjeto, ...prev]);
    return novoProjeto;
  };

  const editarProjeto = (id: string, dados: Partial<Projeto>) => {
    setProjetos(prev => prev.map(p => p.id === id ? { ...p, ...dados, updatedAt: new Date().toISOString() } : p));
  };

  const excluirProjeto = (id: string) => {
    setProjetos(prev => prev.filter(p => p.id !== id));
    setItensOrcamento(prev => prev.filter(io => io.projetoId !== id));
    setOrdensProducao(prev => prev.filter(op => op.projetoId !== id));
  };

  // Contratos CRUD
  const criarContrato = (dados: Omit<Contrato, 'id' | 'empresaId' | 'createdAt' | 'updatedAt'>): Contrato => {
    const anoAtual = new Date().getFullYear();
    const count = contratos.filter(c => c.empresaId === activeEmpresaId).length + 1;
    const numFormatado = `#${String(count).padStart(4, '0')}/${anoAtual}`;

    const novoContrato: Contrato = {
      ...dados,
      id: `ctr_${Date.now()}`,
      empresaId: activeEmpresaId,
      numeroContrato: dados.numeroContrato || numFormatado,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setContratos(prev => [novoContrato, ...prev]);

    // GERAÇÃO AUTOMÁTICA DA ORDEM DE PRODUÇÃO (7 ESTÁGIOS) E RADAR DE PRAZOS (6 MARCOS)
    try {
      const emp = empresas.find(e => e.id === activeEmpresaId);
      const cli = clientes.find(c => c.id === novoContrato.clienteId);
      const proj = novoContrato.projetoId ? projetos.find(p => p.id === novoContrato.projetoId) : undefined;
      const itensProj = novoContrato.projetoId ? itensOrcamento.filter(i => i.projetoId === novoContrato.projetoId) : [];

      if (emp && cli) {
        // 1. Cria OP automática
        const novaOP = gerarOrdemProducaoDeContrato({
          contrato: novoContrato,
          cliente: cli,
          empresa: emp,
          projeto: proj,
        });
        setOrdensProducao(prev => [novaOP, ...prev]);

        // 2. Cria Radar de Prazos automático
        const novoRadar = gerarRadarPrazosInicial({
          contrato: novoContrato,
          cliente: cli,
          empresa: emp,
          projeto: proj,
        });
        setRadaresPrazos(prev => [novoRadar, ...prev]);

        // 3. Contas a Receber automáticas (30% ato, 70% saldo em boleto/cartão)
        const valorAto = Number((novoContrato.valorTotal * 0.3).toFixed(2));
        const valorSaldo = Number((novoContrato.valorTotal * 0.7).toFixed(2));

        const cr1: ContaReceber = {
          id: `cr_${Date.now()}_1`,
          empresaId: activeEmpresaId,
          contratoId: novoContrato.id,
          numeroContrato: novoContrato.numeroContrato,
          clienteNome: cli.nome,
          valorOriginal: valorAto,
          taxaCartaoPercentual: 0,
          valorTaxaCartao: 0,
          valorLiquido: valorAto,
          dataVencimento: new Date().toISOString(),
          status: 'pago',
          dataPagamento: new Date().toISOString(),
          formaPagamento: 'PIX à Vista (Ato do Contrato)',
          numeroParcela: 1,
          totalParcelas: 2
        };

        const cr2: ContaReceber = {
          id: `cr_${Date.now()}_2`,
          empresaId: activeEmpresaId,
          contratoId: novoContrato.id,
          numeroContrato: novoContrato.numeroContrato,
          clienteNome: cli.nome,
          valorOriginal: valorSaldo,
          taxaCartaoPercentual: 0,
          valorTaxaCartao: 0,
          valorLiquido: valorSaldo,
          dataVencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'pendente',
          formaPagamento: 'Boleto Bancário (Pós-Instalação)',
          numeroParcela: 2,
          totalParcelas: 2
        };
        setContasReceber(prev => [cr1, cr2, ...prev]);

        // 4. Comissões automáticas (4.5% Vendedora)
        const comVendedor: ComissaoRegistro = {
          id: `com_${Date.now()}_v`,
          empresaId: activeEmpresaId,
          contratoId: novoContrato.id,
          numeroContrato: novoContrato.numeroContrato,
          beneficiarioNome: 'Juliana Mendes (Vendedora Ouro)',
          tipoBeneficiario: 'vendedor',
          nivelVendedor: 'ouro',
          valorBaseVPL: novoContrato.valorTotal,
          percentualComissao: 4.5,
          valorComissao: Number((novoContrato.valorTotal * 0.045).toFixed(2)),
          status: 'pendente',
          dataVencimento: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
        };
        setComissoes(prev => [comVendedor, ...prev]);

        // 5. Nota Fiscal Rascunho
        const novaNF: NotaFiscalDocumento = {
          id: `nf_${Date.now()}`,
          empresaId: activeEmpresaId,
          contratoId: novoContrato.id,
          numeroContrato: novoContrato.numeroContrato,
          tipo: 'nfe_produto',
          status: 'rascunho',
          valor: novoContrato.valorTotal,
          provedorIntegracao: 'Focus NFe / eNotas API v2 (Pronto para Emissão)'
        };
        setNotasFiscais(prev => [novaNF, ...prev]);
      }
    } catch (err) {
      console.warn('Erro ao gerar OP/Radar automático:', err);
    }

    return novoContrato;
  };

  const editarContrato = (id: string, dados: Partial<Contrato>) => {
    setContratos(prev => prev.map(c => c.id === id ? { ...c, ...dados, updatedAt: new Date().toISOString() } : c));
  };

  const excluirContrato = (id: string) => {
    setContratos(prev => prev.filter(c => c.id !== id));
    setOrdensProducao(prev => prev.filter(op => op.contratoId !== id));
    setRadaresPrazos(prev => prev.filter(rp => rp.contratoId !== id));
  };

  // Itens de Orçamento CRUD
  const criarItemOrcamento = (dados: Omit<ItemOrcamento, 'id' | 'empresaId' | 'createdAt'>): ItemOrcamento => {
    const margem = dados.precoVenda > 0 
      ? Number((((dados.precoVenda - dados.custoUnitario) / dados.precoVenda) * 100).toFixed(1))
      : 0;

    const novoItem: ItemOrcamento = {
      ...dados,
      id: `itm_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      empresaId: activeEmpresaId,
      margemLucroPercent: margem,
      createdAt: new Date().toISOString(),
    };
    setItensOrcamento(prev => [...prev, novoItem]);
    return novoItem;
  };

  const editarItemOrcamento = (id: string, dados: Partial<ItemOrcamento>) => {
    setItensOrcamento(prev => prev.map(i => {
      if (i.id === id) {
        const custo = dados.custoUnitario !== undefined ? dados.custoUnitario : i.custoUnitario;
        const venda = dados.precoVenda !== undefined ? dados.precoVenda : i.precoVenda;
        const margem = venda > 0 ? Number((((venda - custo) / venda) * 100).toFixed(1)) : 0;
        return { ...i, ...dados, margemLucroPercent: margem };
      }
      return i;
    }));
  };

  const excluirItemOrcamento = (id: string) => {
    setItensOrcamento(prev => prev.filter(i => i.id !== id));
  };

  // Estoque & Precificação Handlers
  const adicionarMaterial = (dados: Omit<MaterialEstoque, 'id' | 'empresaId' | 'ultimaAtualizacao'>): MaterialEstoque => {
    const novo: MaterialEstoque = {
      ...dados,
      id: `mat_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      empresaId: activeEmpresaId,
      ultimaAtualizacao: new Date().toISOString()
    };
    setEstoque(prev => [novo, ...prev]);
    return novo;
  };

  const atualizarMaterial = (id: string, dados: Partial<MaterialEstoque>) => {
    setEstoque(prev => prev.map(m => m.id === id ? { ...m, ...dados, ultimaAtualizacao: new Date().toISOString() } : m));
  };

  const excluirMaterial = (id: string) => {
    setEstoque(prev => prev.filter(m => m.id !== id));
  };

  const atualizarStatusCompraMaterial = (id: string, status: StatusCompraMaterial, incrementarEstoqueQtd?: number) => {
    setEstoque(prev => prev.map(m => {
      if (m.id === id) {
        const novoSaldo = (status === 'em_estoque' && incrementarEstoqueQtd) 
          ? (m.quantidadeEstoque + incrementarEstoqueQtd) 
          : m.quantidadeEstoque;
        return {
          ...m,
          statusCompra: status,
          quantidadeEstoque: novoSaldo,
          ultimaAtualizacao: new Date().toISOString()
        };
      }
      return m;
    }));
  };

  const gerarListaCompraProjetoParaEstoque = (projetoId: string): MaterialEstoque[] => {
    const proj = projetos.find(p => p.id === projetoId);
    if (!proj) return [];
    const cliente = clientes.find(c => c.id === proj.clienteId);
    const itensDoProjeto = itensOrcamento.filter(i => i.projetoId === projetoId);

    const novosMateriais: MaterialEstoque[] = itensDoProjeto.map((item, idx) => {
      let categoria: MaterialEstoque['categoria'] = 'chapa_mdf';
      let unidade: MaterialEstoque['unidade'] = 'chapa';
      const descLower = (item.descricao || '').toLowerCase();
      const matLower = (item.material || '').toLowerCase();

      if (descLower.includes('fita') || matLower.includes('borda') || descLower.includes('borda')) {
        categoria = 'fita_borda';
        unidade = 'metro';
      } else if (descLower.includes('dobradica') || descLower.includes('corredica') || descLower.includes('puxador') || descLower.includes('parafuso') || descLower.includes('calco') || descLower.includes('articulador')) {
        categoria = 'ferragem';
        unidade = 'peca';
      } else if (descLower.includes('led') || descLower.includes('cola') || descLower.includes('perfil') || descLower.includes('amortecedor')) {
        categoria = 'insumo';
        unidade = 'peca';
      }

      return {
        id: `mat_proj_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 7)}`,
        empresaId: activeEmpresaId,
        codigo: item.codigo || `INS-${Math.floor(1000 + Math.random() * 9000)}`,
        nome: item.descricao || `${item.material} ${item.acabamento || ''}`.trim(),
        categoria,
        unidade,
        quantidadeEstoque: 0,
        quantidadeNecessaria: item.quantidade || 1,
        estoqueMinimo: 0,
        custoUnitario: item.custoUnitario || 50,
        precoVendaSugerido: (item.custoUnitario || 50) * 2.2,
        fornecedor: 'Leo Madeiras / Fornecedor Padrão',
        origemTipo: 'projeto_cliente',
        clienteId: proj.clienteId,
        clienteNome: cliente?.nome || 'Cliente do Projeto',
        projetoId: proj.id,
        projetoNome: proj.nomeAmbiente,
        statusCompra: 'necessario',
        dataNecessidade: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        observacoes: `Gerado a partir do projeto ${proj.nomeAmbiente} (${proj.softwareOrigem || 'CAD'})`,
        ultimaAtualizacao: new Date().toISOString()
      };
    });

    setEstoque(prev => [...novosMateriais, ...prev]);
    return novosMateriais;
  };

  const atualizarRegraPrecificacao = (dados: Partial<RegraPrecificacao>) => {
    setRegraPrecificacao(prev => ({ ...prev, ...dados }));
  };

  const recalcularPrecosOrcamentos = () => {
    setItensOrcamento(prev => prev.map(item => {
      const novoPreco = Math.round((item.custoUnitario * regraPrecificacao.markupPadrao) * 100) / 100;
      const margem = novoPreco > 0 ? Number((((novoPreco - item.custoUnitario) / novoPreco) * 100).toFixed(1)) : 0;
      return {
        ...item,
        precoVenda: novoPreco,
        margemLucroPercent: margem
      };
    }));

    setProjetos(prev => prev.map(proj => {
      const itensProj = itensOrcamento.filter(i => i.projetoId === proj.id);
      const novoTotal = itensProj.reduce((acc, i) => acc + (i.precoVenda * i.quantidade), 0);
      if (novoTotal > 0) {
        return {
          ...proj,
          valorVendaDefinido: novoTotal
        };
      }
      return proj;
    }));

    setContratos(prev => prev.map(ctr => {
      const projAssoc = projetos.find(p => p.id === ctr.projetoId);
      if (projAssoc && projAssoc.valorVendaDefinido) {
        return {
          ...ctr,
          valorTotal: projAssoc.valorVendaDefinido,
          valorEntrada: Math.round(projAssoc.valorVendaDefinido * 0.4 * 100) / 100
        };
      }
      return ctr;
    }));
  };

  // Importação e Snapshot de Projeto Promob
  const importarProjetoPromob = (
    negocioId: string,
    parsed: {
      arquivoNome: string;
      formato: 'xml' | 'txt';
      tamanhoBytes?: number;
      totalItens: number;
      totalPecas: number;
      custoTotal: number;
      ambientes: string[];
      itens: {
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
        custoTotal: number;
      }[];
      rawContent: string;
    },
    valorVendaSugerido?: number
  ): { projeto: Projeto; novosItens: ItemOrcamento[] } => {
    const negocio = negocios.find(n => n.id === negocioId);
    const clienteId = negocio?.clienteId;
    const nomeAmbientePrincipal = parsed.ambientes.length === 1 
      ? parsed.ambientes[0] 
      : `${parsed.ambientes.length} Ambientes (${parsed.ambientes.slice(0, 2).join(', ')}${parsed.ambientes.length > 2 ? '...' : ''})`;

    const snapshot: SnapshotVersaoOriginalPromob = {
      id: `snap_${Date.now()}`,
      dataImportacao: new Date().toISOString(),
      arquivoNome: parsed.arquivoNome,
      formato: parsed.formato,
      tamanhoBytes: parsed.tamanhoBytes,
      totalItens: parsed.totalItens,
      totalPecas: parsed.totalPecas,
      custoTotalOriginal: parsed.custoTotal,
      ambientesDetectados: parsed.ambientes,
      itensOriginais: parsed.itens.map(it => ({
        codigo: it.codigo,
        descricao: it.descricao,
        ambiente: it.ambiente,
        larguraMm: it.larguraMm,
        alturaMm: it.alturaMm,
        profundidadeMm: it.profundidadeMm,
        material: it.material,
        acabamento: it.acabamento,
        quantidade: it.quantidade,
        custoUnitario: it.custoUnitario,
        custoTotal: it.custoTotal,
      })),
      rawContent: parsed.rawContent,
    };

    // Preço de venda padrão sugerido se não especificado (ex: markup 2.2x custo)
    const valorVendaFinal = valorVendaSugerido !== undefined 
      ? valorVendaSugerido 
      : (negocio?.valorEstimado && negocio.valorEstimado > 0 ? negocio.valorEstimado : Number((parsed.custoTotal * 2.2).toFixed(2)));

    // Verifica se já existe um projeto para este negócio
    const projetoExistente = projetos.find(p => p.negocioId === negocioId);
    let projetoSalvo: Projeto;

    if (projetoExistente) {
      projetoSalvo = {
        ...projetoExistente,
        nomeAmbiente: nomeAmbientePrincipal || projetoExistente.nomeAmbiente,
        softwareOrigem: 'promob',
        arquivoNome: parsed.arquivoNome,
        versao: 'v1.0 (Promob Importado)',
        statusProjeto: 'aguardando_aprovacao',
        custoTotalPromob: parsed.custoTotal,
        valorCalculado: valorVendaFinal,
        valorVendaDefinido: valorVendaFinal,
        snapshotOriginal: snapshot,
        updatedAt: new Date().toISOString(),
      };
      setProjetos(prev => prev.map(p => p.id === projetoExistente.id ? projetoSalvo : p));
    } else {
      projetoSalvo = {
        id: `prj_${Date.now()}`,
        empresaId: activeEmpresaId,
        negocioId: negocioId,
        clienteId: clienteId,
        nomeAmbiente: nomeAmbientePrincipal,
        softwareOrigem: 'promob',
        arquivoNome: parsed.arquivoNome,
        versao: 'v1.0 (Promob Importado)',
        statusProjeto: 'aguardando_aprovacao',
        custoTotalPromob: parsed.custoTotal,
        valorCalculado: valorVendaFinal,
        valorVendaDefinido: valorVendaFinal,
        snapshotOriginal: snapshot,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setProjetos(prev => [projetoSalvo, ...prev]);
    }

    // Gera os itens de orçamento editáveis vinculados a este projeto
    const novosItens: ItemOrcamento[] = parsed.itens.map((it, idx) => {
      // Distribui o preço de venda proporcionalmente ao custo
      const fatorMarkup = parsed.custoTotal > 0 ? (valorVendaFinal / parsed.custoTotal) : 2.2;
      const precoVendaItem = Number((it.custoUnitario * fatorMarkup).toFixed(2));
      const margem = precoVendaItem > 0 
        ? Number((((precoVendaItem - it.custoUnitario) / precoVendaItem) * 100).toFixed(1))
        : 0;

      return {
        id: `itm_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 7)}`,
        empresaId: activeEmpresaId,
        projetoId: projetoSalvo.id,
        codigo: it.codigo,
        descricao: it.descricao,
        ambiente: it.ambiente,
        medidas: {
          larguraMm: it.larguraMm,
          alturaMm: it.alturaMm,
          profundidadeMm: it.profundidadeMm,
        },
        material: it.material,
        acabamento: it.acabamento,
        quantidade: it.quantidade,
        custoUnitario: it.custoUnitario,
        precoVenda: precoVendaItem,
        margemLucroPercent: margem,
        createdAt: new Date().toISOString(),
      };
    });

    // Remove itens anteriores do mesmo projeto e adiciona os novos
    setItensOrcamento(prev => [
      ...prev.filter(i => i.projetoId !== projetoSalvo.id),
      ...novosItens,
    ]);

    // Atualiza o valor estimado do negócio no CRM se for maior que zero
    if (valorVendaFinal > 0) {
      editarNegocio(negocioId, { valorEstimado: valorVendaFinal });
    }

    return { projeto: projetoSalvo, novosItens };
  };

  // Reverte para a versão original do Promob descartando edições manuais
  const reverterParaVersaoOriginalPromob = (projetoId: string): boolean => {
    const proj = projetos.find(p => p.id === projetoId);
    if (!proj || !proj.snapshotOriginal) return false;

    const snap = proj.snapshotOriginal;
    const valorVendaFinal = proj.valorVendaDefinido || proj.valorCalculado || Number((snap.custoTotalOriginal * 2.2).toFixed(2));

    const novosItens: ItemOrcamento[] = snap.itensOriginais.map((it, idx) => {
      const fatorMarkup = snap.custoTotalOriginal > 0 ? (valorVendaFinal / snap.custoTotalOriginal) : 2.2;
      const precoVendaItem = Number((it.custoUnitario * fatorMarkup).toFixed(2));
      const margem = precoVendaItem > 0 
        ? Number((((precoVendaItem - it.custoUnitario) / precoVendaItem) * 100).toFixed(1))
        : 0;

      return {
        id: `itm_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 7)}`,
        empresaId: activeEmpresaId,
        projetoId: proj.id,
        codigo: it.codigo,
        descricao: it.descricao,
        ambiente: it.ambiente,
        medidas: {
          larguraMm: it.larguraMm,
          alturaMm: it.alturaMm,
          profundidadeMm: it.profundidadeMm,
        },
        material: it.material,
        acabamento: it.acabamento,
        quantidade: it.quantidade,
        custoUnitario: it.custoUnitario,
        precoVenda: precoVendaItem,
        margemLucroPercent: margem,
        createdAt: new Date().toISOString(),
      };
    });

    setItensOrcamento(prev => [
      ...prev.filter(i => i.projetoId !== proj.id),
      ...novosItens,
    ]);

    editarProjeto(proj.id, {
      custoTotalPromob: snap.custoTotalOriginal,
      versao: `${proj.versao} (Revertido p/ Original)`,
    });

    return true;
  };

  // Importação e Snapshot de Projeto SketchUp / OpenCutList (.skp, Ruby JSON, CSV OpenCutList)
  const importarProjetoSketchUp = (
    negocioId: string,
    parsed: {
      arquivoNome: string;
      formato: 'skp' | 'json' | 'csv_opencutlist' | 'txt_opencutlist';
      conversorUtilizado: 'ruby_extension_json' | 'skp_converter_bridge' | 'manual_upload' | 'opencutlist_sketchup_parser';
      tamanhoBytes?: number;
      totalComponentes: number;
      totalInstancias: number;
      custoTotal: number;
      ambientes: string[];
      itens: (ItemOrcamentoOriginal & { 
        posicao3d?: { x: number; y: number; z: number }; 
        cor3d?: string;
        isFerragem?: boolean;
        fitaBordaMetros?: number;
        espessuraMm?: number;
        categoria?: string;
      })[];
      scene3d: SketchUp3DSceneData;
      rawContent?: string;
    },
    valorVendaSugerido?: number
  ): { projeto: Projeto; novosItens: ItemOrcamento[] } => {
    const negocio = negocios.find(n => n.id === negocioId);
    const clienteId = negocio?.clienteId;
    const nomeAmbientePrincipal = parsed.ambientes.length === 1 
      ? parsed.ambientes[0] 
      : `${parsed.ambientes.length} Ambientes (${parsed.ambientes.slice(0, 2).join(', ')}${parsed.ambientes.length > 2 ? '...' : ''})`;

    const isOcl = parsed.conversorUtilizado === 'opencutlist_sketchup_parser' || parsed.formato === 'csv_opencutlist';
    const softwareOrigem: SoftwareOrigem = isOcl ? 'opencutlist' : 'sketchup';

    const snapshot: SnapshotVersaoOriginalSketchUp = {
      id: `snap_skp_${Date.now()}`,
      dataImportacao: new Date().toISOString(),
      arquivoNome: parsed.arquivoNome,
      formato: parsed.formato === 'txt_opencutlist' ? 'csv_opencutlist' : parsed.formato,
      conversorUtilizado: parsed.conversorUtilizado,
      tamanhoBytes: parsed.tamanhoBytes,
      totalComponentes: parsed.totalComponentes,
      totalInstancias: parsed.totalInstancias,
      custoTotalOriginal: parsed.custoTotal,
      ambientesDetectados: parsed.ambientes,
      itensOriginais: parsed.itens.map(it => ({
        codigo: it.codigo,
        descricao: it.descricao,
        ambiente: it.ambiente,
        larguraMm: it.larguraMm,
        alturaMm: it.alturaMm,
        profundidadeMm: it.profundidadeMm,
        material: it.material,
        acabamento: it.acabamento,
        quantidade: it.quantidade,
        custoUnitario: it.custoUnitario,
        custoTotal: it.custoTotal,
      })),
      rawContent: parsed.rawContent,
      scene3d: parsed.scene3d,
    };

    const valorVendaFinal = valorVendaSugerido !== undefined 
      ? valorVendaSugerido 
      : (negocio?.valorEstimado && negocio.valorEstimado > 0 ? negocio.valorEstimado : Number((parsed.custoTotal * 2.2).toFixed(2)));

    const projetoExistente = projetos.find(p => p.negocioId === negocioId);
    let projetoSalvo: Projeto;

    const rotuloVersao = isOcl ? 'OpenCutList OCL (SketchUp)' : `SketchUp 3D ${parsed.formato.toUpperCase()}`;

    if (projetoExistente) {
      projetoSalvo = {
        ...projetoExistente,
        nomeAmbiente: nomeAmbientePrincipal || projetoExistente.nomeAmbiente,
        softwareOrigem,
        arquivoNome: parsed.arquivoNome,
        versao: `v1.0 (${rotuloVersao})`,
        statusProjeto: 'aguardando_aprovacao',
        custoTotalPromob: parsed.custoTotal,
        valorCalculado: valorVendaFinal,
        valorVendaDefinido: valorVendaFinal,
        modelo3dDados: parsed.scene3d,
        snapshotOriginalSketchUp: snapshot,
        updatedAt: new Date().toISOString(),
      };
      setProjetos(prev => prev.map(p => p.id === projetoExistente.id ? projetoSalvo : p));
    } else {
      projetoSalvo = {
        id: `prj_skp_${Date.now()}`,
        empresaId: activeEmpresaId,
        negocioId: negocioId,
        clienteId: clienteId,
        nomeAmbiente: nomeAmbientePrincipal,
        softwareOrigem,
        arquivoNome: parsed.arquivoNome,
        versao: `v1.0 (${rotuloVersao})`,
        statusProjeto: 'aguardando_aprovacao',
        custoTotalPromob: parsed.custoTotal,
        valorCalculado: valorVendaFinal,
        valorVendaDefinido: valorVendaFinal,
        modelo3dDados: parsed.scene3d,
        snapshotOriginalSketchUp: snapshot,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setProjetos(prev => [projetoSalvo, ...prev]);
    }

    const novosItens: ItemOrcamento[] = parsed.itens.map((it, idx) => {
      const fatorMarkup = parsed.custoTotal > 0 ? (valorVendaFinal / parsed.custoTotal) : 2.2;
      const precoVendaItem = Number((it.custoUnitario * fatorMarkup).toFixed(2));
      const margem = precoVendaItem > 0 
        ? Number((((precoVendaItem - it.custoUnitario) / precoVendaItem) * 100).toFixed(1))
        : 0;

      return {
        id: `itm_skp_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 7)}`,
        empresaId: activeEmpresaId,
        projetoId: projetoSalvo.id,
        codigo: it.codigo,
        descricao: it.descricao,
        ambiente: it.ambiente,
        medidas: {
          larguraMm: it.larguraMm,
          alturaMm: it.alturaMm,
          profundidadeMm: it.profundidadeMm,
        },
        material: it.material,
        acabamento: it.acabamento,
        quantidade: it.quantidade,
        custoUnitario: it.custoUnitario,
        precoVenda: precoVendaItem,
        margemLucroPercent: margem,
        createdAt: new Date().toISOString(),
      };
    });

    setItensOrcamento(prev => [
      ...prev.filter(i => i.projetoId !== projetoSalvo.id),
      ...novosItens,
    ]);

    if (valorVendaFinal > 0) {
      editarNegocio(negocioId, { valorEstimado: valorVendaFinal });
    }

    return { projeto: projetoSalvo, novosItens };
  };

  // Reverte projeto para o snapshot original do SketchUp
  const reverterParaVersaoOriginalSketchUp = (projetoId: string): boolean => {
    const proj = projetos.find(p => p.id === projetoId);
    if (!proj || !proj.snapshotOriginalSketchUp) return false;

    const snap = proj.snapshotOriginalSketchUp;
    const valorVendaFinal = proj.valorVendaDefinido || proj.valorCalculado || Number((snap.custoTotalOriginal * 2.2).toFixed(2));

    const novosItens: ItemOrcamento[] = snap.itensOriginais.map((it, idx) => {
      const fatorMarkup = snap.custoTotalOriginal > 0 ? (valorVendaFinal / snap.custoTotalOriginal) : 2.2;
      const precoVendaItem = Number((it.custoUnitario * fatorMarkup).toFixed(2));
      const margem = precoVendaItem > 0 
        ? Number((((precoVendaItem - it.custoUnitario) / precoVendaItem) * 100).toFixed(1))
        : 0;

      return {
        id: `itm_skp_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 7)}`,
        empresaId: activeEmpresaId,
        projetoId: proj.id,
        codigo: it.codigo,
        descricao: it.descricao,
        ambiente: it.ambiente,
        medidas: {
          larguraMm: it.larguraMm,
          alturaMm: it.alturaMm,
          profundidadeMm: it.profundidadeMm,
        },
        material: it.material,
        acabamento: it.acabamento,
        quantidade: it.quantidade,
        custoUnitario: it.custoUnitario,
        precoVenda: precoVendaItem,
        margemLucroPercent: margem,
        createdAt: new Date().toISOString(),
      };
    });

    setItensOrcamento(prev => [
      ...prev.filter(i => i.projetoId !== proj.id),
      ...novosItens,
    ]);

    editarProjeto(proj.id, {
      custoTotalPromob: snap.custoTotalOriginal,
      modelo3dDados: snap.scene3d,
      versao: `${proj.versao} (Revertido p/ Original SketchUp)`,
    });

    return true;
  };

  // Inicia uma revisão pendente (quando o usuário faz upload de novo arquivo e quer comparar antes de oficializar)
  const iniciarRevisaoProjeto = (projetoId: string, dadosRevisao: {
    arquivoNome: string;
    softwareOrigem: SoftwareOrigem;
    motivo: string;
    custoTotal: number;
    totalPecas: number;
    ambientes: string[];
    itens: (ItemOrcamentoOriginal & { posicao3d?: { x: number; y: number; z: number }; cor3d?: string })[];
    modelo3dDados?: SketchUp3DSceneData;
    rawContent?: string;
  }) => {
    const revisaoPendente: RevisaoPendenteProjeto = {
      id: `rev_${Date.now()}`,
      projetoId,
      dataUpload: new Date().toISOString(),
      motivo: dadosRevisao.motivo,
      arquivoNome: dadosRevisao.arquivoNome,
      softwareOrigem: dadosRevisao.softwareOrigem,
      custoTotal: dadosRevisao.custoTotal,
      totalPecas: dadosRevisao.totalPecas,
      ambientes: dadosRevisao.ambientes,
      itens: dadosRevisao.itens,
      modelo3dDados: dadosRevisao.modelo3dDados,
      rawContent: dadosRevisao.rawContent,
    };

    setProjetos(prev => prev.map(p => p.id === projetoId ? { ...p, revisaoPendente } : p));
  };

  // Cancela a revisão pendente descartando o rascunho
  const cancelarRevisaoProjeto = (projetoId: string) => {
    setProjetos(prev => prev.map(p => p.id === projetoId ? { ...p, revisaoPendente: undefined } : p));
  };

  // Aprova a revisão tornando-a a versão OFICIAL do projeto e arquivando a versão anterior no histórico imutável
  const aprovarRevisaoProjeto = (projetoId: string, motivoRevisao: string, novoValorVendaSugerido?: number): boolean => {
    const proj = projetos.find(p => p.id === projetoId);
    if (!proj) return false;

    const revisao = proj.revisaoPendente;
    if (!revisao) return false;

    const itensAtuais = itensOrcamento.filter(i => i.projetoId === proj.id);
    const totalPecasAnterior = itensAtuais.reduce((acc, i) => acc + i.quantidade, 0);
    const custoAnterior = proj.custoTotalPromob || itensAtuais.reduce((acc, i) => acc + (i.custoUnitario * i.quantidade), 0);

    // 1. Cria o registro histórico da versão anterior
    const historicoAtual = proj.historicoVersoes || [];
    const numeroVersaoAnterior = historicoAtual.length + 1;
    
    const versaoArquivada: VersaoHistoricoProjeto = {
      id: `ver_hist_${Date.now()}`,
      projetoId: proj.id,
      numeroVersao: numeroVersaoAnterior,
      tagVersao: proj.versao,
      nomeVersao: `${proj.versao} (${proj.softwareOrigem.toUpperCase()})`,
      motivoRevisao: proj.observacoesTecnicas || 'Versão anterior aprovada',
      arquivoNome: proj.arquivoNome || 'projeto_anterior',
      softwareOrigem: proj.softwareOrigem,
      dataCriacao: proj.updatedAt || proj.createdAt,
      isOficial: false,
      custoTotal: custoAnterior,
      valorVendaSugerido: proj.valorVendaDefinido || proj.valorCalculado,
      totalPecas: totalPecasAnterior,
      totalItens: itensAtuais.length,
      ambientes: Array.from(new Set(itensAtuais.map(i => i.ambiente || 'Geral'))),
      itensSnapshot: itensAtuais.map(i => ({
        codigo: i.codigo,
        descricao: i.descricao,
        ambiente: i.ambiente,
        larguraMm: i.medidas.larguraMm,
        alturaMm: i.medidas.alturaMm,
        profundidadeMm: i.medidas.profundidadeMm,
        material: i.material,
        acabamento: i.acabamento,
        quantidade: i.quantidade,
        custoUnitario: i.custoUnitario,
        custoTotal: i.custoUnitario * i.quantidade,
      })),
      modelo3dDados: proj.modelo3dDados,
      observacoes: proj.observacoesTecnicas,
    };

    // 2. Calcula nova tag de versão (ex: v1.0 -> v2.0 (Pós-Medição))
    const proximoNumero = numeroVersaoAnterior + 1;
    const novaTagVersao = `v${proximoNumero}.0 (Pós-Medição)`;

    const valorVendaFinal = novoValorVendaSugerido !== undefined 
      ? novoValorVendaSugerido 
      : (proj.valorVendaDefinido && proj.custoTotalPromob && proj.custoTotalPromob > 0)
        ? Number(((proj.valorVendaDefinido / proj.custoTotalPromob) * revisao.custoTotal).toFixed(2))
        : Number((revisao.custoTotal * 2.2).toFixed(2));

    // 3. Atualiza os itens de orçamento no banco de dados para a nova versão
    const novosItens: ItemOrcamento[] = revisao.itens.map((it, idx) => {
      const fatorMarkup = revisao.custoTotal > 0 ? (valorVendaFinal / revisao.custoTotal) : 2.2;
      const precoVendaItem = Number((it.custoUnitario * fatorMarkup).toFixed(2));
      const margem = precoVendaItem > 0 
        ? Number((((precoVendaItem - it.custoUnitario) / precoVendaItem) * 100).toFixed(1))
        : 0;

      return {
        id: `itm_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 7)}`,
        empresaId: activeEmpresaId,
        projetoId: proj.id,
        codigo: it.codigo,
        descricao: it.descricao,
        ambiente: it.ambiente,
        medidas: {
          larguraMm: it.larguraMm,
          alturaMm: it.alturaMm,
          profundidadeMm: it.profundidadeMm,
        },
        material: it.material,
        acabamento: it.acabamento,
        quantidade: it.quantidade,
        custoUnitario: it.custoUnitario,
        precoVenda: precoVendaItem,
        margemLucroPercent: margem,
        createdAt: new Date().toISOString(),
      };
    });

    setItensOrcamento(prev => [
      ...prev.filter(i => i.projetoId !== proj.id),
      ...novosItens,
    ]);

    // 4. Atualiza o projeto
    const projetoAtualizado: Projeto = {
      ...proj,
      softwareOrigem: revisao.softwareOrigem,
      arquivoNome: revisao.arquivoNome,
      versao: novaTagVersao,
      statusProjeto: 'aguardando_aprovacao',
      observacoesTecnicas: motivoRevisao,
      custoTotalPromob: revisao.custoTotal,
      valorCalculado: valorVendaFinal,
      valorVendaDefinido: valorVendaFinal,
      modelo3dDados: revisao.modelo3dDados || proj.modelo3dDados,
      historicoVersoes: [versaoArquivada, ...historicoAtual],
      revisaoPendente: undefined,
      updatedAt: new Date().toISOString(),
    };

    setProjetos(prev => prev.map(p => p.id === proj.id ? projetoAtualizado : p));

    // 5. Atualiza o negócio no CRM
    if (proj.negocioId && valorVendaFinal > 0) {
      editarNegocio(proj.negocioId, { valorEstimado: valorVendaFinal });
    }

    return true;
  };

  // Restaura uma versão anterior do histórico
  const restaurarVersaoHistorico = (projetoId: string, versaoId: string): boolean => {
    const proj = projetos.find(p => p.id === projetoId);
    if (!proj || !proj.historicoVersoes) return false;

    const versaoAlvo = proj.historicoVersoes.find(v => v.id === versaoId);
    if (!versaoAlvo) return false;

    const valorVendaFinal = versaoAlvo.valorVendaSugerido || proj.valorVendaDefinido || Number((versaoAlvo.custoTotal * 2.2).toFixed(2));

    const novosItens: ItemOrcamento[] = versaoAlvo.itensSnapshot.map((it, idx) => {
      const fatorMarkup = versaoAlvo.custoTotal > 0 ? (valorVendaFinal / versaoAlvo.custoTotal) : 2.2;
      const precoVendaItem = Number((it.custoUnitario * fatorMarkup).toFixed(2));
      const margem = precoVendaItem > 0 
        ? Number((((precoVendaItem - it.custoUnitario) / precoVendaItem) * 100).toFixed(1))
        : 0;

      return {
        id: `itm_rst_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 7)}`,
        empresaId: activeEmpresaId,
        projetoId: proj.id,
        codigo: it.codigo,
        descricao: it.descricao,
        ambiente: it.ambiente,
        medidas: {
          larguraMm: it.larguraMm,
          alturaMm: it.alturaMm,
          profundidadeMm: it.profundidadeMm,
        },
        material: it.material,
        acabamento: it.acabamento,
        quantidade: it.quantidade,
        custoUnitario: it.custoUnitario,
        precoVenda: precoVendaItem,
        margemLucroPercent: margem,
        createdAt: new Date().toISOString(),
      };
    });

    setItensOrcamento(prev => [
      ...prev.filter(i => i.projetoId !== proj.id),
      ...novosItens,
    ]);

    editarProjeto(proj.id, {
      versao: `${versaoAlvo.tagVersao} (Restaurada)`,
      custoTotalPromob: versaoAlvo.custoTotal,
      valorCalculado: valorVendaFinal,
      valorVendaDefinido: valorVendaFinal,
      modelo3dDados: versaoAlvo.modelo3dDados || proj.modelo3dDados,
      observacoesTecnicas: `Restaurado para a versão ${versaoAlvo.tagVersao}`,
    });

    return true;
  };

  // Produção CRUD & Pipeline Industrial
  const criarOrdemProducao = (dados: Omit<OrdemProducao, 'id' | 'empresaId' | 'createdAt' | 'updatedAt'>): OrdemProducao => {
    const novaOP: OrdemProducao = {
      ...dados,
      id: `op_${Date.now()}`,
      empresaId: activeEmpresaId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setOrdensProducao(prev => [novaOP, ...prev]);
    return novaOP;
  };

  const editarOrdemProducao = (id: string, dados: Partial<OrdemProducao>) => {
    setOrdensProducao(prev => prev.map(op => op.id === id ? { ...op, ...dados, updatedAt: new Date().toISOString() } : op));
  };

  const avancarEtapaProducao = (
    id: string,
    responsavelConclusaoNome?: string,
    observacaoConclusao?: string,
    proximoResponsavelNome?: string
  ): { opAtualizada: OrdemProducao; mensagemNotificacao: string } | null => {
    const op = ordensProducao.find(o => o.id === id);
    if (!op) return null;

    const responsavel = responsavelConclusaoNome || currentUser?.nome || 'Operador da Linha';
    const { opAtualizada, mensagemNotificacao } = avancarEstagioWorkflowProducao({
      ordemProducao: op,
      responsavelConclusaoNome: responsavel,
      observacaoConclusao,
      proximoResponsavelNome,
    });

    setOrdensProducao(prev => prev.map(o => o.id === id ? opAtualizada : o));
    return { opAtualizada, mensagemNotificacao };
  };

  const excluirOrdemProducao = (id: string) => {
    setOrdensProducao(prev => prev.filter(op => op.id !== id));
  };

  // Radar de Prazos CRUD & Avanço de Marcos
  const criarRadarPrazos = (dados: Omit<RadarPrazosContrato, 'id' | 'createdAt' | 'updatedAt'>): RadarPrazosContrato => {
    const novoRadar: RadarPrazosContrato = {
      ...dados,
      id: `rad_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setRadaresPrazos(prev => [novoRadar, ...prev]);
    return novoRadar;
  };

  const editarRadarPrazos = (id: string, dados: Partial<RadarPrazosContrato>) => {
    setRadaresPrazos(prev => prev.map(r => r.id === id ? { ...r, ...dados, updatedAt: new Date().toISOString() } : r));
  };

  const concluirMarcoRadar = (
    radarId: string,
    tipoMarco: TipoMarcoRadar,
    responsavelNome: string,
    observacoes?: string
  ) => {
    setRadaresPrazos(prev => prev.map(radar => {
      if (radar.id !== radarId) return radar;
      return concluirMarcoRadarPrazos({
        radar,
        tipoMarcoConcluido: tipoMarco,
        responsavelNome,
        observacoes
      });
    }));
  };

  // Helper para comparação de números de telefone
  const normalizePhone = (p: string) => p.replace(/\D/g, '');
  const phonesMatch = (p1: string, p2: string) => {
    const n1 = normalizePhone(p1);
    const n2 = normalizePhone(p2);
    if (!n1 || !n2) return false;
    if (n1 === n2) return true;
    if (n1.length >= 8 && n2.length >= 8) {
      return n1.slice(-8) === n2.slice(-8);
    }
    return false;
  };

  // WhatsApp Operations & Auto CRM Lead Generation
  const receberMensagemWhatsApp = (
    telefone: string,
    texto: string,
    autorNome?: string
  ): { message: WhatsAppMessage; cliente: Cliente; negocio: Negocio } => {
    // 1. Procura se cliente já existe no CRM
    let clienteAlvo = clientes.find(c => 
      (c.whatsapp && phonesMatch(c.whatsapp, telefone)) || 
      (c.telefone && phonesMatch(c.telefone, telefone))
    );

    let negocioAlvo: Negocio | undefined;

    // 2. Se NÃO existe no CRM, cria automaticamente o cliente e o negócio na coluna "contato_inicial" (Novo Lead)
    if (!clienteAlvo) {
      const nomeFormatado = autorNome?.trim() || `Lead WhatsApp (${telefone})`;
      const novoClienteId = `cli_${Date.now()}`;
      
      const novoCliente: Cliente = {
        id: novoClienteId,
        empresaId: activeEmpresaId,
        nome: nomeFormatado,
        email: '',
        telefone: telefone,
        whatsapp: telefone,
        cpfCnpj: '',
        origemLead: 'whatsapp',
        status: 'novo',
        endereco: {
          logradouro: '',
          numero: '',
          bairro: '',
          cidade: empresaAtiva?.cidade || 'São Paulo',
          uf: empresaAtiva?.uf || 'SP',
          cep: '',
        },
        observacoes: `Lead capturado automaticamente via WhatsApp em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}.`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const novoNegocio: Negocio = {
        id: `neg_${Date.now()}`,
        empresaId: activeEmpresaId,
        clienteId: novoClienteId,
        titulo: `Atendimento WhatsApp - ${nomeFormatado}`,
        etapaFunil: 'contato_inicial', // Coluna Novo Lead
        valorEstimado: 0,
        scoreLead: 'morno',
        responsavelId: currentUser?.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      clienteAlvo = novoCliente;
      negocioAlvo = novoNegocio;

      // Adiciona ao CRM imediatamente
      setClientes(prev => [novoCliente, ...prev]);
      setNegocios(prev => [novoNegocio, ...prev]);
    } else {
      // Cliente já existe, busca negócio associado
      negocioAlvo = negocios.find(n => n.clienteId === clienteAlvo!.id);
      if (!negocioAlvo) {
        const novoNegocio: Negocio = {
          id: `neg_${Date.now()}`,
          empresaId: activeEmpresaId,
          clienteId: clienteAlvo.id,
          titulo: `Interesse WhatsApp - ${clienteAlvo.nome}`,
          etapaFunil: 'contato_inicial',
          valorEstimado: 0,
          scoreLead: 'quente',
          responsavelId: currentUser?.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        negocioAlvo = novoNegocio;
        setNegocios(prev => [novoNegocio, ...prev]);
      }
    }

    // 3. Cria a mensagem de entrada
    const novaMensagem: WhatsAppMessage = {
      id: `wmsg_${Date.now()}`,
      empresaId: activeEmpresaId,
      telefone: telefone,
      clienteId: clienteAlvo.id,
      negocioId: negocioAlvo?.id,
      direcao: 'entrada',
      texto: texto,
      timestamp: new Date().toISOString(),
      status: 'entregue',
      lida: false,
      autorNome: autorNome || clienteAlvo.nome,
    };

    setMensagensWhatsApp(prev => [...prev, novaMensagem]);

    return {
      message: novaMensagem,
      cliente: clienteAlvo,
      negocio: negocioAlvo!,
    };
  };

  const enviarMensagemWhatsApp = async (
    telefone: string,
    texto: string,
    clienteId?: string,
    negocioId?: string
  ): Promise<boolean> => {
    if (!texto.trim()) return false;

    // Encontra cliente associado se não passado
    const cli = clienteId 
      ? clientes.find(c => c.id === clienteId)
      : clientes.find(c => phonesMatch(c.whatsapp || c.telefone, telefone));

    const neg = negocioId
      ? negocios.find(n => n.id === negocioId)
      : (cli ? negocios.find(n => n.clienteId === cli.id) : undefined);

    const novaMensagem: WhatsAppMessage = {
      id: `wmsg_${Date.now()}`,
      empresaId: activeEmpresaId,
      telefone: telefone,
      clienteId: cli?.id,
      negocioId: neg?.id,
      direcao: 'saida',
      texto: texto,
      timestamp: new Date().toISOString(),
      status: 'enviada',
      lida: true,
      autorNome: currentUser?.nome || 'Consultor MobPlan',
    };

    setMensagensWhatsApp(prev => [...prev, novaMensagem]);

    // Tenta disparar pela API da Meta (em background)
    try {
      fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telefone,
          texto,
          clienteId: cli?.id,
        }),
      }).catch(err => console.warn('[WhatsApp] Envio local persistido com sucesso.', err));
    } catch (e) {
      console.warn(e);
    }

    return true;
  };

  const marcarConversaComoLida = (telefone: string) => {
    setMensagensWhatsApp(prev =>
      prev.map(m => {
        if (phonesMatch(m.telefone, telefone) && !m.lida) {
          return { ...m, lida: true, status: 'lida' };
        }
        return m;
      })
    );
  };

  const atualizarMetaConfig = (dados: Partial<WhatsAppMetaConfig>) => {
    setMetaConfig(prev => ({ ...prev, ...dados }));
  };

  const abrirConversaWhatsApp = (telefoneOuClienteId: string) => {
    let fone = telefoneOuClienteId;
    const cli = clientes.find(c => c.id === telefoneOuClienteId);
    if (cli) {
      fone = cli.whatsapp || cli.telefone;
    }
    setConversaAtivaTelefone(fone);
    marcarConversaComoLida(fone);
    setAbaAtiva('whatsapp');
  };

  // Construção e agregação de conversas dinâmicas
  const mensagensFiltradas = mensagensWhatsApp.filter(m => !m.empresaId || m.empresaId === activeEmpresaId);

  // Mapeia conversas agrupadas por número de telefone
  const conversasMap = new Map<string, WhatsAppConversation>();

  mensagensFiltradas.forEach(msg => {
    const key = normalizePhone(msg.telefone);
    const existing = conversasMap.get(key);

    const cli = msg.clienteId 
      ? clientes.find(c => c.id === msg.clienteId)
      : clientes.find(c => phonesMatch(c.whatsapp || c.telefone, msg.telefone));

    const neg = cli ? negocios.find(n => n.clienteId === cli.id) : undefined;
    const nomeContato = cli?.nome || msg.autorNome || `Contato (${msg.telefone})`;

    if (!existing) {
      conversasMap.set(key, {
        id: `conv_${key}`,
        empresaId: activeEmpresaId,
        telefone: msg.telefone,
        clienteId: cli?.id,
        negocioId: neg?.id,
        nomeContato: nomeContato,
        ultimaMensagem: msg.texto,
        ultimaMensagemTimestamp: msg.timestamp,
        ultimaMensagemDirecao: msg.direcao,
        naoLidasCount: (!msg.lida && msg.direcao === 'entrada') ? 1 : 0,
        scoreLead: neg?.scoreLead,
        etapaFunil: neg?.etapaFunil,
      });
    } else {
      // Atualiza para a mais recente se o timestamp for maior
      if (new Date(msg.timestamp) > new Date(existing.ultimaMensagemTimestamp)) {
        existing.ultimaMensagem = msg.texto;
        existing.ultimaMensagemTimestamp = msg.timestamp;
        existing.ultimaMensagemDirecao = msg.direcao;
      }
      if (!msg.lida && msg.direcao === 'entrada') {
        existing.naoLidasCount += 1;
      }
      if (cli && !existing.clienteId) {
        existing.clienteId = cli.id;
        existing.nomeContato = cli.nome;
      }
      if (neg) {
        existing.negocioId = neg.id;
        existing.scoreLead = neg.scoreLead;
        existing.etapaFunil = neg.etapaFunil;
      }
    }
  });

  // Também garante que todos os clientes cadastrados tenham um canal na lista de WhatsApp
  clientes.filter(c => c.empresaId === activeEmpresaId).forEach(c => {
    const fone = c.whatsapp || c.telefone;
    if (fone) {
      const key = normalizePhone(fone);
      if (!conversasMap.has(key)) {
        const neg = negocios.find(n => n.clienteId === c.id);
        conversasMap.set(key, {
          id: `conv_${key}`,
          empresaId: activeEmpresaId,
          telefone: fone,
          clienteId: c.id,
          negocioId: neg?.id,
          nomeContato: c.nome,
          ultimaMensagem: 'Conversa iniciada. Envie um modelo ou mensagem.',
          ultimaMensagemTimestamp: c.createdAt,
          ultimaMensagemDirecao: 'saida',
          naoLidasCount: 0,
          scoreLead: neg?.scoreLead,
          etapaFunil: neg?.etapaFunil,
        });
      }
    }
  });

  const conversasWhatsApp = Array.from(conversasMap.values()).sort((a, b) => {
    // Não lidas no topo, depois ordenadas por data da última mensagem
    if (a.naoLidasCount > 0 && b.naoLidasCount === 0) return -1;
    if (b.naoLidasCount > 0 && a.naoLidasCount === 0) return 1;
    return new Date(b.ultimaMensagemTimestamp).getTime() - new Date(a.ultimaMensagemTimestamp).getTime();
  });

  const totalMensagensNaoLidas = conversasWhatsApp.reduce((acc, c) => acc + c.naoLidasCount, 0);

  const zerarSistema = () => {
    setClientes([]);
    setNegocios([]);
    setProjetos([]);
    setContratos([]);
    setItensOrcamento([]);
    setOrdensProducao([]);
    setRadaresPrazos([]);
    setInstalacoes([]);
    setContasReceber([]);
    setContasPagar([]);
    setComissoes([]);
    setNotasFiscais([]);
    setTicketsAssistenca([]);
    setMensagensWhatsApp([]);

    Object.values(STORAGE_KEYS).forEach((key) => {
      if (
        key !== STORAGE_KEYS.CURRENT_USER &&
        key !== STORAGE_KEYS.USUARIOS &&
        key !== STORAGE_KEYS.EMPRESAS &&
        key !== STORAGE_KEYS.ACTIVE_EMPRESA_ID
      ) {
        localStorage.removeItem(key);
      }
    });
  };

  // Filtra dados pela empresa ativa
  const clientesFiltrados = clientes.filter(c => c.empresaId === activeEmpresaId);
  const negociosFiltrados = negocios.filter(n => n.empresaId === activeEmpresaId);
  const projetosFiltrados = projetos.filter(p => p.empresaId === activeEmpresaId);
  const contratosFiltrados = contratos.filter(c => c.empresaId === activeEmpresaId);
  const itensOrcamentoFiltrados = itensOrcamento.filter(i => i.empresaId === activeEmpresaId);
  const ordensProducaoFiltradas = ordensProducao.filter(op => op.empresaId === activeEmpresaId);
  const radaresPrazosFiltrados = radaresPrazos.filter(r => r.empresaId === activeEmpresaId);
  const contasReceberFiltradas = contasReceber.filter(c => c.empresaId === activeEmpresaId);
  const contasPagarFiltradas = contasPagar.filter(c => c.empresaId === activeEmpresaId);
  const comissoesFiltradas = comissoes.filter(c => c.empresaId === activeEmpresaId);
  const notasFiscaisFiltradas = notasFiscais.filter(n => n.empresaId === activeEmpresaId);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        login,
        logout,
        setQuickRole,
        empresas,
        empresaAtiva,
        trocarEmpresaAtiva,
        criarEmpresa,
        editarEmpresa,
        usuarios,
        criarUsuario,
        editarUsuario,
        clientes: clientesFiltrados,
        criarCliente,
        editarCliente,
        excluirCliente,
        negocios: negociosFiltrados,
        criarNegocio,
        editarNegocio,
        excluirNegocio,
        projetos: projetosFiltrados,
        criarProjeto,
        editarProjeto,
        excluirProjeto,
        contratos: contratosFiltrados,
        criarContrato,
        editarContrato,
        excluirContrato,
        itensOrcamento: itensOrcamentoFiltrados,
        criarItemOrcamento,
        editarItemOrcamento,
        excluirItemOrcamento,
        estoque: estoque.filter(e => e.empresaId === activeEmpresaId),
        regraPrecificacao,
        adicionarMaterial,
        atualizarMaterial,
        excluirMaterial,
        atualizarStatusCompraMaterial,
        gerarListaCompraProjetoParaEstoque,
        atualizarRegraPrecificacao,
        recalcularPrecosOrcamentos,
        importarProjetoPromob,
        reverterParaVersaoOriginalPromob,
        importarProjetoSketchUp,
        reverterParaVersaoOriginalSketchUp,
        iniciarRevisaoProjeto,
        aprovarRevisaoProjeto,
        cancelarRevisaoProjeto,
        restaurarVersaoHistorico,
        ordensProducao: ordensProducaoFiltradas,
        criarOrdemProducao,
        editarOrdemProducao,
        avancarEtapaProducao,
        excluirOrdemProducao,
        radaresPrazos: radaresPrazosFiltrados,
        criarRadarPrazos,
        editarRadarPrazos,
        concluirMarcoRadar,
        instalacoes: instalacoes.filter(i => i.empresaId === activeEmpresaId),
        criarInstalacao,
        editarInstalacao,
        fazerCheckInInstalacao,
        adicionarFotoInstalacao,
        atualizarChecklistInstalacao,
        finalizarInstalacao,
        contasReceber: contasReceberFiltradas,
        criarContaReceber,
        atualizarContaReceber,
        pagarContaReceber,
        aplicarTaxaCartaoReceber,
        contasPagar: contasPagarFiltradas,
        criarContaPagar,
        atualizarContaPagar,
        pagarContaPagar,
        comissoes: comissoesFiltradas,
        criarComissao,
        pagarComissao,
        notasFiscais: notasFiscaisFiltradas,
        emitirNotaFiscal,
        ticketsAssistenca: ticketsAssistencaFiltrados,
        criarChamadoAssistencia,
        editarChamadoAssistencia,
        excluirChamadoAssistencia,
        mensagensWhatsApp: mensagensFiltradas,
        conversasWhatsApp,
        totalMensagensNaoLidas,
        metaConfig,
        conversaAtivaTelefone,
        setConversaAtivaTelefone,
        enviarMensagemWhatsApp,
        receberMensagemWhatsApp,
        marcarConversaComoLida,
        atualizarMetaConfig,
        abrirConversaWhatsApp,
        abaAtiva,
        setAbaAtiva,
        isMobileDrawerOpen,
        setIsMobileDrawerOpen,
        zerarSistema,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp deve ser usado dentro de um AppProvider');
  }
  return context;
};
