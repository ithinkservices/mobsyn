export type PapelUsuario = 
  | 'administrador' 
  | 'vendedor' 
  | 'projetista' 
  | 'producao' 
  | 'montador' 
  | 'financeiro';

export interface CertificadoIcpBrasilConfig {
  emitidoPara: string;
  cnpjTitular: string;
  autoridadeCertificadora: string;
  numeroSerie: string;
  validadeAte: string;
  tipoCertificado: 'A1' | 'A3';
  statusCertificado: 'valido' | 'expirado' | 'pendente';
}

export interface Empresa {
  id: string;
  nomeFantasia: string;
  razaoSocial: string;
  cnpj: string;
  inscricaoEstadual?: string;
  telefone: string;
  email: string;
  cidade: string;
  uf: string;
  enderecoCompleto?: string;
  margemMinimaAceitavel?: number; // Margem líquida mínima permitida em % (ex: 22.0)
  taxaCustoCapitalMensal?: number; // Taxa de desconto para cálculo de VPL em % a.m. (ex: 1.8)
  aliquotaImpostoPadrao?: number; // Alíquota de impostos (Simples/Lucro Presumido) em % (ex: 6.5)
  comissaoPadraoVendedor?: number; // Comissão do vendedor em % (ex: 3.5)
  comissaoPadraoRT?: number; // Comissão do arquiteto/parceiro indicador em % (ex: 5.0)
  // Configurações de Contratos e Numeração
  reiniciarNumeracaoAno?: boolean; // Se true, reinicia #0001 a cada ano
  proximoNumeroContrato?: number; // Contador sequencial por empresa
  modeloContratoTextoPadrao?: string; // Texto base personalizável com cláusulas
  certificadoIcpBrasilConfig?: CertificadoIcpBrasilConfig;
  // SLAs Padrão da Fábrica e Ciclo de Entrega (em dias úteis/corridos)
  slaConfigPadrao?: {
    diasMedidas: number; // ex: 3 dias
    diasRevisao: number; // ex: 2 dias
    diasPromobProjeto: number; // ex: 5 dias
    diasProducao: number; // ex: 20 dias
    diasMontagem: number; // ex: 5 dias
  };
  createdAt: string;
  updatedAt: string;
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  papel: PapelUsuario;
  avatarUrl?: string;
  telefone?: string;
  empresasIds: string[];
  empresaAtivaId: string;
  cargoDescricao?: string;
  createdAt: string;
  permissoes?: Record<string, boolean>;
}

export type OrigemLead = 
  | 'instagram' 
  | 'indicacao' 
  | 'loja_fisica' 
  | 'site' 
  | 'arquiteto' 
  | 'google' 
  | 'whatsapp'
  | 'outro';

export type StatusCliente = 
  | 'novo' 
  | 'em_atendimento' 
  | 'orcamento_enviado' 
  | 'fechado' 
  | 'perdido';

export interface EnderecoCliente {
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
}

export interface Cliente {
  id: string;
  empresaId: string;
  nome: string;
  email: string;
  telefone: string;
  whatsapp?: string;
  cpfCnpj: string;
  endereco: EnderecoCliente;
  origemLead: OrigemLead;
  status: StatusCliente;
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
}

export type EtapaFunil = 
  | 'contato_inicial' 
  | 'briefing_medicao' 
  | 'projeto_3d' 
  | 'apresentacao_orcamento' 
  | 'negociacao' 
  | 'fechado_ganho' 
  | 'perdido';

export type ScoreLead = 'quente' | 'morno' | 'frio';

export type TipoCondicaoPagamento = 
  | 'a_vista_pix' 
  | 'cartao_credito' 
  | 'boleto_parcelado' 
  | 'entrada_parcelas' 
  | 'personalizado';

export interface ItemParcelaFluxo {
  numero: number;
  diasAposFechamento: number;
  percentual: number;
  valorBruto: number;
  taxaDescontoAplicada: number; // Taxa de desconto acumulada até o vencimento
  valorPresente: number; // Valor presente líquido da parcela
}

export interface SimulacaoNegociacao {
  valorVendaBruto: number;
  descontoPercentual: number;
  descontoReais: number;
  valorVendaFinal: number;
  custoProjeto: number;
  condicaoPagamento: TipoCondicaoPagamento;
  numeroParcelas: number;
  taxaMeioPagamentoPercent: number; // Taxa de máquina ou boleto
  valorTaxaMeioPagamento: number;
  aliquotaImpostoPercent: number; // Impostos da empresa (ex: 6.5%)
  valorImposto: number;
  temParceiroRT: boolean;
  nomeParceiroRT?: string;
  comissaoRTPercent: number; // RT do Arquiteto/Indicador
  valorComissaoRT: number; // Valor da RT calculada sobre o VPL
  comissaoVendedorPercent: number; // Comissão do Vendedor
  valorComissaoVendedor: number;
  taxaDescontoCapitalMensal: number; // Custo de capital da empresa (ex: 1.8% a.m.)
  valorPresenteLiquidoVPL: number; // VPL real considerando tempo e taxas
  markup: number; // Multiplicador de venda sobre custo
  margemBrutaReais: number;
  margemBrutaPercent: number;
  margemLiquidaReais: number;
  margemLiquidaPercent: number;
  margemMinimaEmpresa: number;
  margemAprovada: boolean; // Se margemLiquidaPercent >= margemMinimaEmpresa
  motivoBloqueio?: string;
  parcelasFluxo: ItemParcelaFluxo[];
  dataCalculo: string;
}

export interface RenderProAmbienteItem {
  id: string;
  url: string;
  titulo: string;
  ambiente: string;
  descricao?: string;
  principal?: boolean;
}

export interface ApresentacaoPropostaData {
  id: string;
  negocioId: string;
  tituloApresentacao: string;
  subtitulo?: string;
  renders: RenderProAmbienteItem[];
  diferenciais: string[];
  prazosDiasFabricacao: number;
  prazosDiasMontagem: number;
  garantiaAnos: number;
  condicoesExibicao: {
    mostrarValorAVista: boolean;
    mostrarParcelado: boolean;
    opcoesParcelamentoTexto?: string;
    observacoesComerciais?: string;
  };
  statusProposta: 'rascunho' | 'apresentada' | 'aceita' | 'recusada';
  dataApresentacao?: string;
  dataAceite?: string;
}

export interface Negocio {
  id: string;
  empresaId: string;
  clienteId: string;
  titulo: string;
  etapaFunil: EtapaFunil;
  valorEstimado: number;
  scoreLead: ScoreLead;
  aiScore?: number; // Score calculado por IA (0-100)
  aiSuggestedNextStep?: string; // Próximo passo sugerido por IA
  responsavelId?: string;
  motivoPerda?: string;
  dataPrevisaoFechamento?: string;
  simulacaoNegociacao?: SimulacaoNegociacao;
  apresentacaoProposta?: ApresentacaoPropostaData;
  briefingData?: {
    checked?: Record<string, boolean>;
    materiais?: {
      caixaMdf?: string;
      caixaMarca?: string;
      portasMdf?: string;
      portasMarca?: string;
      acabamentoGeral?: string;
      puxador?: string;
    };
    medidasEletros?: Array<{
      id: string;
      ambiente: string;
      equipamento: string;
      largura: string;
      altura: string;
      profundidade: string;
      observacao: string;
    }>;
    customItens?: Array<{
      id: string;
      categoria: string;
      label: string;
      checked: boolean;
    }>;
    notas?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export type SoftwareOrigem = 'promob' | 'sketchup' | 'opencutlist' | 'manual';

export type StatusProjeto = 
  | 'rascunho' 
  | 'em_modelagem' 
  | 'aguardando_aprovacao' 
  | 'aprovado_cliente' 
  | 'em_revisao' 
  | 'reprovado';

export interface ItemOrcamentoOriginal {
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
}

export interface SnapshotVersaoOriginalPromob {
  id: string;
  dataImportacao: string;
  arquivoNome: string;
  formato: 'xml' | 'txt';
  tamanhoBytes?: number;
  totalItens: number;
  totalPecas: number;
  custoTotalOriginal: number;
  ambientesDetectados: string[];
  itensOriginais: ItemOrcamentoOriginal[];
  rawContent?: string;
}

export interface SketchUp3DComponent {
  id: string;
  codigo: string;
  nome: string;
  ambiente: string;
  dimensoes: {
    larguraMm: number;
    alturaMm: number;
    profundidadeMm: number;
  };
  posicao: {
    x: number;
    y: number;
    z: number;
  };
  rotacao?: {
    x: number;
    y: number;
    z: number;
  };
  cor?: string;
  material?: string;
  tipo?: 'modulo_baixo' | 'modulo_alto' | 'torre' | 'painel' | 'tampo' | 'gaveteiro' | 'outro';
}

export interface SketchUp3DSceneData {
  components: SketchUp3DComponent[];
  boundingBox?: {
    min: [number, number, number];
    max: [number, number, number];
  };
  ambienteNome?: string;
  dimensoesGerais?: {
    larguraTotalMm: number;
    alturaTotalMm: number;
    profundidadeTotalMm: number;
  };
}

export interface SnapshotVersaoOriginalSketchUp {
  id: string;
  dataImportacao: string;
  arquivoNome: string;
  formato: 'skp' | 'json' | 'csv_opencutlist';
  conversorUtilizado: 'ruby_extension_json' | 'skp_converter_bridge' | 'manual_upload' | 'opencutlist_sketchup_parser';
  tamanhoBytes?: number;
  totalComponentes: number;
  totalInstancias: number;
  custoTotalOriginal: number;
  ambientesDetectados: string[];
  itensOriginais: ItemOrcamentoOriginal[];
  rawContent?: string;
  scene3d?: SketchUp3DSceneData;
}

export type TipoAlteracaoItemDiff = 'adicionado' | 'removido' | 'modificado' | 'inalterado';

export interface ItemDiffComparacao {
  codigo: string;
  descricao: string;
  ambiente: string;
  tipo: TipoAlteracaoItemDiff;
  itemOriginal?: {
    codigo?: string;
    descricao?: string;
    ambiente?: string;
    larguraMm: number;
    alturaMm: number;
    profundidadeMm: number;
    quantidade: number;
    material?: string;
    acabamento?: string;
    custoUnitario: number;
    custoTotal: number;
    precoVenda?: number;
  };
  itemRevisado?: {
    codigo?: string;
    descricao?: string;
    ambiente?: string;
    larguraMm: number;
    alturaMm: number;
    profundidadeMm: number;
    quantidade: number;
    material?: string;
    acabamento?: string;
    custoUnitario: number;
    custoTotal: number;
    precoVenda?: number;
  };
  diferencasDetalhadas: {
    dimensaoAlterada: boolean;
    quantidadeAlterada: boolean;
    custoAlterado: boolean;
    materialAlterado: boolean;
    diffLarguraMm?: number;
    diffAlturaMm?: number;
    diffProfundidadeMm?: number;
    diffQuantidade?: number;
    diffCustoTotal?: number;
    descricaoAlteracoes: string[];
  };
}

export interface ResumoDiffRevisao {
  totalItensOriginal: number;
  totalItensRevisado: number;
  totalPecasOriginal: number;
  totalPecasRevisado: number;
  custoTotalOriginal: number;
  custoTotalRevisado: number;
  variacaoCustoReais: number;
  variacaoCustoPercent: number;
  itensAdicionados: number;
  itensRemovidos: number;
  itensModificados: number;
  itensInalterados: number;
}

export interface VersaoHistoricoProjeto {
  id: string;
  projetoId: string;
  numeroVersao: number; // 1, 2, 3...
  tagVersao: string; // "v1.0", "v2.0"
  nomeVersao: string; // "v1.0 - Orçamento Inicial", "v2.0 - Pós-Medição Técnica"
  motivoRevisao?: string; // "Ajuste após medição técnica in-loco"
  arquivoNome: string;
  softwareOrigem: SoftwareOrigem;
  dataCriacao: string;
  autorNome?: string;
  isOficial: boolean;
  custoTotal: number;
  valorVendaSugerido?: number;
  totalPecas: number;
  totalItens: number;
  ambientes: string[];
  itensSnapshot: ItemOrcamentoOriginal[];
  modelo3dDados?: SketchUp3DSceneData;
  observacoes?: string;
}

export interface RevisaoPendenteProjeto {
  id: string;
  projetoId: string;
  dataUpload: string;
  motivo: string;
  arquivoNome: string;
  softwareOrigem: SoftwareOrigem;
  custoTotal: number;
  totalPecas: number;
  ambientes: string[];
  itens: (ItemOrcamentoOriginal & { posicao3d?: { x: number; y: number; z: number }; cor3d?: string })[];
  modelo3dDados?: SketchUp3DSceneData;
  rawContent?: string;
}

export interface Projeto {
  id: string;
  empresaId: string;
  negocioId: string;
  clienteId?: string;
  nomeAmbiente: string;
  softwareOrigem: SoftwareOrigem;
  arquivoNome?: string;
  versao: string;
  statusProjeto: StatusProjeto;
  observacoesTecnicas?: string;
  renderUrl?: string;
  modelo3dUrl?: string;
  modelo3dDados?: SketchUp3DSceneData;
  valorCalculado?: number;
  custoTotalPromob?: number;
  valorVendaDefinido?: number;
  snapshotOriginal?: SnapshotVersaoOriginalPromob;
  snapshotOriginalSketchUp?: SnapshotVersaoOriginalSketchUp;
  historicoVersoes?: VersaoHistoricoProjeto[];
  revisaoPendente?: RevisaoPendenteProjeto;
  createdAt: string;
  updatedAt: string;
}

export type StatusContrato = 
  | 'rascunho' 
  | 'aguardando_assinatura_empresa' 
  | 'aguardando_assinatura_cliente' 
  | 'assinado' 
  | 'em_producao' 
  | 'entregue' 
  | 'cancelado';

export interface LogAuditoriaContrato {
  id: string;
  timestamp: string;
  evento: string; // ex: 'contrato_gerado', 'assinado_icp_brasil_empresa', 'link_visualizado_cliente', 'assinado_eletronicamente_cliente'
  ator: string; // Nome do usuário ou 'Cliente (Remoto)'
  detalhes: string;
  ip?: string;
  dispositivo?: string;
  hashIntegridade?: string;
}

export interface AssinaturaIcpEmpresa {
  assinado: boolean;
  dataAssinatura?: string;
  assinanteNome?: string;
  assinanteCargo?: string;
  certificadoNome?: string;
  certificadoCnpj?: string;
  autoridadeCertificadora?: string;
  numeroSerie?: string;
  hashSha256?: string;
  carimboTempoIcp?: string;
}

export interface AssinaturaEletronicaCliente {
  assinado: boolean;
  dataAssinatura?: string;
  nomeCompleto?: string;
  cpfCnpj?: string;
  email?: string;
  telefone?: string;
  ip?: string;
  dispositivo?: string;
  geolocalizacao?: string;
  rubricaBase64?: string; // Desenho da assinatura capturado em canvas
  hashSha256?: string;
  termoAceiteTexto?: string;
}

export interface ItemDescritivoContrato {
  ambiente: string;
  descricao: string;
  material?: string;
  acabamento?: string;
  quantidade?: number;
  valor?: number;
}

export interface Contrato {
  id: string;
  empresaId: string;
  negocioId: string;
  clienteId?: string;
  projetoId?: string;
  numeroContrato: string; // Formato #N/ANO ex: #0042/2026
  valorTotal: number;
  valorEntrada?: number;
  condicoesPagamento: string;
  statusAssinatura: StatusContrato;
  dataAssinatura?: string;
  prazoEntregaDias: number; // Prazo de fabricação/entrega (ex: 35 a 45 dias)
  prazoMontagemDias?: number; // Prazo de montagem in-loco (ex: 7 dias)
  dataPrevistaEntrega?: string;
  dataPrevistaMontagem?: string;
  garantiaAnos?: number;
  itensDescritivos?: ItemDescritivoContrato[];
  textoContratoCompleto?: string;
  
  // Assinatura Digital ICP-Brasil (Empresa)
  assinaturaEmpresa?: AssinaturaIcpEmpresa;

  // Assinatura Eletrônica Remota (Cliente)
  assinaturaCliente?: AssinaturaEletronicaCliente;
  tokenAssinaturaCliente?: string; // Token seguro para link público de assinatura
  linkAssinaturaCliente?: string;

  // Trilha de Auditoria Jurídica
  logAuditoria?: LogAuditoriaContrato[];

  // Simulação Financeira Associada
  simulacaoFinanceira?: SimulacaoNegociacao;

  arquivoContratoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedidasMovel {
  larguraMm: number;
  alturaMm: number;
  profundidadeMm: number;
}

export interface ItemOrcamento {
  id: string;
  empresaId: string;
  projetoId: string;
  codigo: string;
  descricao: string;
  ambiente: string;
  medidas: MedidasMovel;
  material: string;
  acabamento: string;
  quantidade: number;
  custoUnitario: number;
  precoVenda: number;
  margemLucroPercent?: number;
  createdAt: string;
}

// Produção Industrial & Chão de Fábrica (7 Estágios do Workflow)
export type EtapaWorkflowProducao = 
  | 'fila_producao'         // 1. Fila de Produção (Aguardando liberação de corte)
  | 'corte'                 // 2. Corte (Plano de corte CNC / Seccionadora / Nesting)
  | 'usinagem'              // 3. Usinagem (Furações, ranhuras, cavilhas, CNC)
  | 'acabamento'            // 4. Acabamento (Fita de borda ABS, refilo, lixamento)
  | 'montagem_componentes'  // 5. Montagem de Componentes (Gavetas, corrediças, dobradiças)
  | 'embalagem'             // 6. Embalagem (Cantoneiras, plástico bolha, etiquetagem)
  | 'pronto_expedicao';     // 7. Pronto para Expedição (Paletizado p/ transporte)

// Compatibilidade de tipo
export type EtapaProducao = EtapaWorkflowProducao | 'furacao' | 'borda' | 'concluido';

export interface HistoricoTransicaoWorkflow {
  id: string;
  etapa: EtapaWorkflowProducao;
  dataEntrada: string;
  dataConclusao?: string;
  responsavelNome?: string;
  responsavelId?: string;
  proximoResponsavelNome?: string;
  proximoResponsavelId?: string;
  observacoes?: string;
  checklistConcluido?: boolean;
}

export interface OrdemProducao {
  id: string;
  empresaId: string;
  negocioId: string;
  clienteId: string;
  clienteNome?: string;
  contratoId?: string;
  numeroContrato?: string; // Formato #N/ANO ex: #0042/2026
  projetoId?: string;
  numeroOP: string; // Formato ex: OP-#0042/2026
  titulo: string;
  etapaAtual: EtapaWorkflowProducao;
  prioridade?: 'normal' | 'alta' | 'urgente';
  prazoDias: number;
  dataInicio: string;
  dataPrevisaoEntrega: string;
  totalPecas: number;
  totalChapasMdf?: number;
  ambientes?: string[];
  responsavelAtualNome?: string;
  responsavelAtualId?: string;
  historicoTransicoes?: HistoricoTransicaoWorkflow[];
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
}

// Radar de Prazos (6 Marcos do Ciclo Completo de Entrega)
export type TipoMarcoRadar = 
  | 'medidas'          // 1. Medidas (Medição fina no local)
  | 'revisao'          // 2. Revisão (Revisão técnica e aprovação de detalhes)
  | 'promob_projeto'   // 3. Promob/Projeto (Engenharia de detalhamento 3D)
  | 'producao'         // 4. Produção (Chão de fábrica e esteira industrial)
  | 'montagem'         // 5. Montagem (Montagem in-loco na obra/residência)
  | 'concluido';       // 6. Concluído (Vistoria final e termo de aceite)

export type StatusAlertaSla = 'verde' | 'amarelo' | 'vermelho';

export interface MarcoRadarItem {
  tipo: TipoMarcoRadar;
  nome: string;
  descricao: string;
  slaDias: number;
  dataInicioPrevista: string;
  dataLimitePrevista: string;
  dataConclusaoReal?: string;
  statusMarco: 'pendente' | 'em_andamento' | 'concluido' | 'atrasado';
  statusAlerta: StatusAlertaSla;
  diasRestantes?: number;
  percentualTempoDecorrido?: number; // 0-100%
  responsavelNome?: string;
  observacoes?: string;
}

export interface RadarPrazosContrato {
  id: string;
  empresaId: string;
  contratoId: string;
  numeroContrato: string;
  clienteId?: string;
  clienteNome: string;
  tituloProjeto: string;
  valorContrato: number;
  dataAssinaturaContrato: string;
  dataPrevisaoEntregaFinal: string;
  dataConclusaoFinalReal?: string;
  marcoAtual: TipoMarcoRadar;
  statusGeralAlerta: StatusAlertaSla;
  marcos: MarcoRadarItem[];
  diasTotaisSla: number;
  diasDecorridosTotais: number;
  createdAt: string;
  updatedAt: string;
}

// WhatsApp Integration Types
export type WhatsAppDirecao = 'entrada' | 'saida';
export type WhatsAppStatusMensagem = 'enviada' | 'entregue' | 'lida' | 'falha';

export interface WhatsAppMessage {
  id: string;
  empresaId: string;
  telefone: string;
  clienteId?: string;
  negocioId?: string;
  direcao: WhatsAppDirecao;
  texto: string;
  timestamp: string;
  status: WhatsAppStatusMensagem;
  lida: boolean;
  metaMessageId?: string;
  midiaUrl?: string;
  midiaTipo?: 'imagem' | 'documento' | 'audio';
  autorNome?: string;
}

export interface WhatsAppConversation {
  id: string;
  empresaId: string;
  telefone: string;
  clienteId?: string;
  negocioId?: string;
  nomeContato: string;
  ultimaMensagem: string;
  ultimaMensagemTimestamp: string;
  ultimaMensagemDirecao: WhatsAppDirecao;
  naoLidasCount: number;
  scoreLead?: ScoreLead;
  etapaFunil?: EtapaFunil;
}

export interface WhatsAppMetaConfig {
  phoneNumberId: string;
  wabaId: string;
  accessToken: string;
  verifyToken: string;
  webhookUrl: string;
  status: 'conectado' | 'desconectado' | 'pendente_configuracao';
}

// Portal do Montador & Gestão de Instalações
export type StatusInstalacao = 'agendada' | 'em_deslocamento' | 'em_andamento' | 'concluida' | 'cancelada';

export interface FotoInstalacao {
  id: string;
  url: string;
  tipo: 'antes' | 'durante' | 'depois';
  timestamp: string;
  autorNome: string;
}

export interface ChecklistItemInstalacao {
  id: string;
  titulo: string;
  concluido: boolean;
  categoria?: string;
}

export interface AssinaturaInstalacao {
  nomeCliente: string;
  cpfCliente?: string;
  dataHora: string;
  aceiteTermo: boolean;
  assinaturaUrl?: string;
}

export interface InstalacaoAgendada {
  id: string;
  empresaId: string;
  contratoId: string;
  numeroContrato: string;
  clienteId: string;
  clienteNome: string;
  enderecoInstalacao: EnderecoCliente;
  dataHoraAgendamento: string;
  montadorId: string;
  montadorNome: string;
  status: StatusInstalacao;
  checkInLat?: number;
  checkInLng?: number;
  checkInHorario?: string;
  fotos: FotoInstalacao[];
  checklist: ChecklistItemInstalacao[];
  assinaturaCliente?: AssinaturaInstalacao;
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContaReceber {
  id: string;
  empresaId: string;
  contratoId: string;
  numeroContrato: string;
  clienteNome: string;
  valorOriginal: number;
  taxaCartaoPercentual: number;
  valorTaxaCartao: number;
  valorLiquido: number;
  dataVencimento: string;
  dataPagamento?: string;
  status: 'pendente' | 'pago' | 'atrasado' | 'cancelado';
  formaPagamento: string;
  numeroParcela: number;
  totalParcelas: number;
}

export type CategoriaContaPagar = 'fornecedores' | 'insumos' | 'impostos' | 'despesas_fixas' | 'comissoes' | 'outros';

export interface ContaPagar {
  id: string;
  empresaId: string;
  descricao: string;
  categoria: CategoriaContaPagar;
  valor: number;
  dataVencimento: string;
  dataPagamento?: string;
  status: 'pendente' | 'pago' | 'atrasado';
  favorecido: string;
  contratoId?: string;
}

export type NivelVendedor = 'bronze' | 'prata' | 'ouro';

export interface ComissaoRegistro {
  id: string;
  empresaId: string;
  contratoId: string;
  numeroContrato: string;
  beneficiarioNome: string;
  tipoBeneficiario: 'vendedor' | 'parceiro_rt';
  nivelVendedor?: NivelVendedor;
  valorBaseVPL: number;
  percentualComissao: number;
  valorComissao: number;
  status: 'pendente' | 'pago';
  dataVencimento: string;
}

export interface DREContrato {
  contratoId: string;
  numeroContrato: string;
  clienteNome: string;
  valorVenda: number;
  custoProjetoPromob: number;
  impostos: number;
  taxaCartao: number;
  comissoesVendedor: number;
  comissoesParceiroRT: number;
  outrosCustos: number;
  lucroLiquido: number;
  margemLucroPercentual: number;
  mesAno: string; // Ex: '2026-02'
}

export type TipoNotaFiscal = 'nfe_produto' | 'nfse_servico';
export type StatusNotaFiscal = 'rascunho' | 'autorizada' | 'cancelada' | 'erro_sefaz';

export interface NotaFiscalDocumento {
  id: string;
  empresaId: string;
  contratoId: string;
  numeroContrato: string;
  tipo: TipoNotaFiscal;
  status: StatusNotaFiscal;
  numeroNota?: string;
  chaveAcesso?: string;
  valor: number;
  emitidoEm?: string;
  provedorIntegracao: string; // Ex: 'Focus NFe / eNotas API'
  xmlUrl?: string;
  pdfUrl?: string;
}

// Configurações e definições de permissão por papel
export interface MenuOption {
  id: string;
  label: string;
  iconName: string;
  papeisPermitidos: PapelUsuario[];
  badge?: string;
  mobilePriority?: boolean; // Para montador no smartphone
}

export type OrigemMaterial = 'almoxarifado_geral' | 'projeto_cliente';
export type StatusCompraMaterial = 'em_estoque' | 'necessario' | 'cotado' | 'comprado' | 'pedido_feito' | 'recebido' | 'consumido';

export interface MaterialEstoque {
  id: string;
  empresaId: string;
  codigo: string;
  nome: string;
  categoria: 'chapa_mdf' | 'fita_borda' | 'ferragem' | 'insumo' | 'outro';
  unidade: 'chapa' | 'm2' | 'metro' | 'peca' | 'kg' | 'l';
  quantidadeEstoque: number;
  quantidadeNecessaria?: number;
  estoqueMinimo: number;
  custoUnitario: number;
  precoVendaSugerido: number;
  fornecedor: string;
  origemTipo?: OrigemMaterial;
  clienteId?: string;
  clienteNome?: string;
  projetoId?: string;
  projetoNome?: string;
  statusCompra?: StatusCompraMaterial;
  dataNecessidade?: string;
  observacoes?: string;
  ultimaAtualizacao: string;
}

export interface RegraPrecificacao {
  id: string;
  empresaId: string;
  markupPadrao: number;
  margemLucroMinima: number;
  custoM2Corte: number;
  custoMetroFita: number;
  fatorFerragens: number;
}

// Assistência Técnica & Pós-Venda (Garantia)
export type StatusChamadoAssistente = 'aberto' | 'triagem' | 'agendado' | 'em_execucao' | 'resolvido';
export type PrioridadeChamado = 'baixa' | 'normal' | 'alta' | 'urgente';

export interface HistoricoChamadoAssistente {
  id: string;
  timestamp: string;
  ator: string;
  acao: string;
}

export interface TicketAssistencia {
  id: string;
  empresaId: string;
  contratoId: string;
  contratoNumero: string;
  clienteId: string;
  clienteNome: string;
  descricao: string;
  fotos: string[]; // URLs or base64
  prioridade: PrioridadeChamado;
  status: StatusChamadoAssistente;
  tecnicoResponsavel?: string;
  dataAgendada?: string;
  dataAbertura: string;
  dataResolucao?: string | null;
  historico: HistoricoChamadoAssistente[];
  createdAt: string;
  updatedAt: string;
}
