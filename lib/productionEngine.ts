import { 
  Contrato, 
  Empresa, 
  Cliente, 
  Projeto, 
  Negocio, 
  OrdemProducao, 
  EtapaWorkflowProducao, 
  RadarPrazosContrato, 
  MarcoRadarItem, 
  TipoMarcoRadar, 
  StatusAlertaSla,
  HistoricoTransicaoWorkflow
} from '@/types/database';

// ============================================================================
// 1. CONFIGURAÇÃO DOS 7 ESTÁGIOS DO WORKFLOW INDUSTRIAL
// ============================================================================
export interface EstagioWorkflowMeta {
  id: EtapaWorkflowProducao;
  ordem: number;
  label: string;
  nomeCurto: string;
  descricao: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  responsavelPadraoCargo: string;
  checklistPadrao: string[];
}

export const ESTAGIOS_WORKFLOW_PRODUCAO: EstagioWorkflowMeta[] = [
  {
    id: 'fila_producao',
    ordem: 1,
    label: '1. Fila de Produção',
    nomeCurto: 'Fila PCP',
    descricao: 'Aguardando liberação de corte, separação de chapas MDF e ferragens.',
    badgeBg: 'bg-zinc-800',
    badgeText: 'text-zinc-300',
    borderColor: 'border-zinc-700',
    responsavelPadraoCargo: 'Programador PCP',
    checklistPadrao: [
      'Validação de medidas com projeto 3D aprovado',
      'Verificação de estoque de chapas MDF e fitas',
      'Separação de kit de ferragens e corrediças',
      'Liberação da ordem de produção para o chão de fábrica'
    ]
  },
  {
    id: 'corte',
    ordem: 2,
    label: '2. Corte & Seccionamento',
    nomeCurto: 'Corte CNC',
    descricao: 'Execução do plano de corte otimizado em seccionadora / nesting CNC.',
    badgeBg: 'bg-cyan-950/80',
    badgeText: 'text-cyan-400',
    borderColor: 'border-cyan-500/60',
    responsavelPadraoCargo: 'Operador de Seccionadora / CNC',
    checklistPadrao: [
      'Carregamento do arquivo .gcode / plano de corte',
      'Corte de todas as chapas do lote',
      'Etiquetagem de identificação de todas as peças cortadas',
      'Conferência do esquadro e medidas amostrais'
    ]
  },
  {
    id: 'usinagem',
    ordem: 3,
    label: '3. Usinagem & Furação',
    nomeCurto: 'Usinagem CNC',
    descricao: 'Furação de cavilhas, minifix, dobradiças e ranhuras de fundo.',
    badgeBg: 'bg-indigo-950/80',
    badgeText: 'text-indigo-400',
    borderColor: 'border-indigo-500/60',
    responsavelPadraoCargo: 'Operador de Centro de Usinagem',
    checklistPadrao: [
      'Furação para dispositivos de montagem (Minifix/VB)',
      'Furação de dobradiças nas portas',
      'Ranhura para fundo de 6mm',
      'Inspeção dimensional de furos'
    ]
  },
  {
    id: 'acabamento',
    ordem: 4,
    label: '4. Bordas & Acabamento',
    nomeCurto: 'Coladeira & Bordas',
    descricao: 'Colagem de fitas de borda ABS, refilamento, raspagem e limpeza.',
    badgeBg: 'bg-amber-950/80',
    badgeText: 'text-amber-400',
    borderColor: 'border-amber-500/60',
    responsavelPadraoCargo: 'Operador de Coladeira de Borda',
    checklistPadrao: [
      'Aplicação de fita de borda ABS nos topos indicados',
      'Refilo e polimento das bordas',
      'Limpeza de excesso de cola PUR/EVA',
      'Lixamento e inspeção tátil das superfícies'
    ]
  },
  {
    id: 'montagem_componentes',
    ordem: 5,
    label: '5. Montagem de Componentes',
    nomeCurto: 'Pré-Montagem',
    descricao: 'Montagem prévia de gavetas, trilhos, amortecedores e aramados.',
    badgeBg: 'bg-purple-950/80',
    badgeText: 'text-purple-400',
    borderColor: 'border-purple-500/60',
    responsavelPadraoCargo: 'Montador Industrial',
    checklistPadrao: [
      'Montagem e esquadrejamento de gavetas',
      'Fixação de corrediças telescópicas/invisíveis',
      'Instalação de perfil puxador / gola',
      'Teste de funcionamento de corrediças e pistões'
    ]
  },
  {
    id: 'embalagem',
    ordem: 6,
    label: '6. Embalagem & Volumes',
    nomeCurto: 'Embalagem',
    descricao: 'Proteção com cantoneiras, plástico bolha, papelão e etiquetagem.',
    badgeBg: 'bg-emerald-950/80',
    badgeText: 'text-emerald-400',
    borderColor: 'border-emerald-500/60',
    responsavelPadraoCargo: 'Conferente de Embalagem',
    checklistPadrao: [
      'Aplicação de cantoneiras plásticas nos cantos',
      'Envolvimento com plástico bolha e filme stretch',
      'Etiquetagem com nome do cliente, ambiente e volume (ex: Vol 1/8)',
      'Inclusão do saquinho de ferragens de instalação'
    ]
  },
  {
    id: 'pronto_expedicao',
    ordem: 7,
    label: '7. Pronto para Expedição',
    nomeCurto: 'Expedição / Carga',
    descricao: 'Paletizado, romaneio conferido e pronto para carregamento.',
    badgeBg: 'bg-teal-950/80',
    badgeText: 'text-teal-400',
    borderColor: 'border-teal-500/60',
    responsavelPadraoCargo: 'Supervisor de Logística & Expedição',
    checklistPadrao: [
      'Conferência física de 100% dos volumes contra o romaneio',
      'Organização no box de saída / doca',
      'Emissão da Ordem de Carga e Transporte',
      'Agendamento confirmado com a equipe de montagem externa'
    ]
  }
];

// ============================================================================
// 2. CONFIGURAÇÃO DOS 6 MARCOS DO RADAR DE PRAZOS
// ============================================================================
export interface MarcoRadarMeta {
  tipo: TipoMarcoRadar;
  ordem: number;
  nome: string;
  descricao: string;
  slaDiasPadrao: number;
  responsavelSugerido: string;
}

export const MARCOS_RADAR_PADRAO: MarcoRadarMeta[] = [
  {
    tipo: 'medidas',
    ordem: 1,
    nome: 'Medição Fina no Local',
    descricao: 'Conferência milimétrica in-loco de paredes, pontos hidráulicos e elétricos.',
    slaDiasPadrao: 3,
    responsavelSugerido: 'Técnico de Medição'
  },
  {
    tipo: 'revisao',
    ordem: 2,
    nome: 'Revisão Técnica & Detalhes',
    descricao: 'Compatibilização de medidas com o projeto executivo e alinhamento de detalhes.',
    slaDiasPadrao: 2,
    responsavelSugerido: 'Projetista / Arquiteto'
  },
  {
    tipo: 'promob_projeto',
    ordem: 3,
    nome: 'Engenharia Promob / Projeto 3D',
    descricao: 'Geração dos arquivos executivos, planos de corte e aprovação final.',
    slaDiasPadrao: 5,
    responsavelSugerido: 'Engenheiro de Produto / Promob'
  },
  {
    tipo: 'producao',
    ordem: 4,
    nome: 'Produção Fabril (Chão de Fábrica)',
    descricao: 'Corte, usinagem, fita de borda, montagem de gavetas e embalagem na fábrica.',
    slaDiasPadrao: 20,
    responsavelSugerido: 'Gerente Industrial / Fábrica'
  },
  {
    tipo: 'montagem',
    ordem: 5,
    nome: 'Montagem no Cliente',
    descricao: 'Instalação física dos móveis sob medida na residência ou obra do cliente.',
    slaDiasPadrao: 5,
    responsavelSugerido: 'Líder de Montagem em Campo'
  },
  {
    tipo: 'concluido',
    ordem: 6,
    nome: 'Concluído (Vistoria & Aceite)',
    descricao: 'Vistoria de qualidade final, entrega das chaves e assinatura do termo de aceite.',
    slaDiasPadrao: 1,
    responsavelSugerido: 'Consultor de Vendas / Pós-Venda'
  }
];

// ============================================================================
// 3. CÁLCULO DE STATUS SLA (SEMÁFORO: VERDE / AMARELO / VERMELHO)
// ============================================================================
export interface CalculoSlaResultado {
  statusAlerta: StatusAlertaSla;
  statusMarco: 'pendente' | 'em_andamento' | 'concluido' | 'atrasado';
  diasRestantes: number;
  percentualTempoDecorrido: number;
  textoExplicativo: string;
}

export function calcularStatusSlaMarco(
  marco: {
    dataInicioPrevista: string;
    dataLimitePrevista: string;
    dataConclusaoReal?: string;
    slaDias: number;
  },
  dataReferencia: Date = new Date()
): CalculoSlaResultado {
  // Se o marco já foi concluído
  if (marco.dataConclusaoReal) {
    const dataConclusao = new Date(marco.dataConclusaoReal);
    const dataLimite = new Date(marco.dataLimitePrevista);
    const concluidoNoPrazo = dataConclusao.getTime() <= dataLimite.getTime() + 86400000; // tolerância final do dia

    return {
      statusAlerta: concluidoNoPrazo ? 'verde' : 'vermelho',
      statusMarco: 'concluido',
      diasRestantes: 0,
      percentualTempoDecorrido: 100,
      textoExplicativo: concluidoNoPrazo 
        ? `Concluído dentro do prazo em ${dataConclusao.toLocaleDateString('pt-BR')}`
        : `Concluído com atraso em ${dataConclusao.toLocaleDateString('pt-BR')}`
    };
  }

  const inicio = new Date(marco.dataInicioPrevista).getTime();
  const limite = new Date(marco.dataLimitePrevista).getTime();
  const agora = dataReferencia.getTime();

  // Dias restantes até a data limite
  const milissegundosRestantes = limite - agora;
  const diasRestantes = Math.ceil(milissegundosRestantes / (1000 * 60 * 60 * 24));

  // Percentual decorrido do tempo total do SLA
  const tempoTotalMs = Math.max(1, limite - inicio);
  const tempoPassadoMs = Math.max(0, agora - inicio);
  const percentualTempoDecorrido = Math.min(100, Math.max(0, Math.round((tempoPassadoMs / tempoTotalMs) * 100)));

  // Regra do Semáforo:
  // 1. Vermelho: se agora > limite (atrasado)
  if (diasRestantes < 0) {
    const diasAtraso = Math.abs(diasRestantes);
    return {
      statusAlerta: 'vermelho',
      statusMarco: 'atrasado',
      diasRestantes,
      percentualTempoDecorrido: 100,
      textoExplicativo: `Atrasado há ${diasAtraso} ${diasAtraso === 1 ? 'dia' : 'dias'}! Exige ação imediata.`
    };
  }

  // 2. Amarelo: se restam <= 20% do prazo ou faltam 2 dias ou menos
  if (percentualTempoDecorrido >= 80 || diasRestantes <= 2) {
    return {
      statusAlerta: 'amarelo',
      statusMarco: 'em_andamento',
      diasRestantes,
      percentualTempoDecorrido,
      textoExplicativo: `Atenção: resta(m) apenas ${diasRestantes} ${diasRestantes === 1 ? 'dia' : 'dias'} para vencer o SLA (${100 - percentualTempoDecorrido}% do prazo).`
    };
  }

  // 3. Verde: dentro do prazo seguro
  return {
    statusAlerta: 'verde',
    statusMarco: 'em_andamento',
    diasRestantes,
    percentualTempoDecorrido,
    textoExplicativo: `No prazo normal: faltam ${diasRestantes} ${diasRestantes === 1 ? 'dia' : 'dias'} (${percentualTempoDecorrido}% decorrido).`
  };
}

// ============================================================================
// 4. GERAÇÃO AUTOMÁTICA DE RADAR DE PRAZOS A PARTIR DO CONTRATO
// ============================================================================
export function gerarRadarPrazosInicial(params: {
  contrato: Contrato;
  cliente: Cliente;
  empresa: Empresa;
  projeto?: Projeto;
  negocio?: Negocio;
}): RadarPrazosContrato {
  const { contrato, cliente, empresa, negocio } = params;

  // SLAs configurados na empresa ou valores padrão
  const slas = {
    medidas: empresa.slaConfigPadrao?.diasMedidas ?? 3,
    revisao: empresa.slaConfigPadrao?.diasRevisao ?? 2,
    promob_projeto: empresa.slaConfigPadrao?.diasPromobProjeto ?? 5,
    producao: empresa.slaConfigPadrao?.diasProducao ?? (contrato.prazoEntregaDias ? Math.max(15, contrato.prazoEntregaDias - 15) : 20),
    montagem: empresa.slaConfigPadrao?.diasMontagem ?? (contrato.prazoMontagemDias ?? 5),
    concluido: 1,
  };

  const dataBase = contrato.dataAssinatura ? new Date(contrato.dataAssinatura) : new Date();
  let dataCursor = new Date(dataBase);

  const marcos: MarcoRadarItem[] = MARCOS_RADAR_PADRAO.map((meta, index) => {
    const slaDias = slas[meta.tipo] || meta.slaDiasPadrao;
    const dataInicioPrevista = new Date(dataCursor).toISOString();
    
    // Incrementa dias úteis/corridos
    const dataLimite = new Date(dataCursor.getTime() + slaDias * 86400000);
    const dataLimitePrevista = dataLimite.toISOString();

    // Avança o cursor para o próximo marco
    dataCursor = dataLimite;

    // O primeiro marco (medidas) começa 'em_andamento', os demais 'pendente'
    const statusMarco = index === 0 ? 'em_andamento' : 'pendente';
    
    const calculoSla = calcularStatusSlaMarco({
      dataInicioPrevista,
      dataLimitePrevista,
      slaDias,
    });

    return {
      tipo: meta.tipo,
      nome: meta.nome,
      descricao: meta.descricao,
      slaDias,
      dataInicioPrevista,
      dataLimitePrevista,
      statusMarco,
      statusAlerta: calculoSla.statusAlerta,
      diasRestantes: calculoSla.diasRestantes,
      percentualTempoDecorrido: calculoSla.percentualTempoDecorrido,
      responsavelNome: meta.responsavelSugerido,
    };
  });

  const diasTotaisSla = Object.values(slas).reduce((acc, d) => acc + d, 0);
  const dataPrevisaoEntregaFinal = dataCursor.toISOString();

  // Status geral do radar (se algum marco ativo estiver vermelho, geral fica vermelho)
  const statusGeralAlerta: StatusAlertaSla = marcos.some(m => m.statusAlerta === 'vermelho')
    ? 'vermelho'
    : (marcos.some(m => m.statusAlerta === 'amarelo') ? 'amarelo' : 'verde');

  return {
    id: `rdr_${contrato.id}`,
    empresaId: empresa.id,
    contratoId: contrato.id,
    numeroContrato: contrato.numeroContrato,
    clienteId: cliente.id,
    clienteNome: cliente.nome,
    tituloProjeto: negocio?.titulo || `Móveis Planejados - ${cliente.nome}`,
    valorContrato: contrato.valorTotal,
    dataAssinaturaContrato: contrato.dataAssinatura || new Date().toISOString(),
    dataPrevisaoEntregaFinal,
    marcoAtual: 'medidas',
    statusGeralAlerta,
    marcos,
    diasTotaisSla,
    diasDecorridosTotais: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// ============================================================================
// 5. GERAÇÃO AUTOMÁTICA DE ORDEM DE PRODUÇÃO (7 ESTÁGIOS) A PARTIR DO CONTRATO
// ============================================================================
export function gerarOrdemProducaoDeContrato(params: {
  contrato: Contrato;
  cliente: Cliente;
  empresa: Empresa;
  projeto?: Projeto;
  negocio?: Negocio;
}): OrdemProducao {
  const { contrato, cliente, empresa, projeto, negocio } = params;

  const totalPecas = projeto?.snapshotOriginal?.totalPecas || 38;
  const totalChapasMdf = Math.ceil(totalPecas / 6) || 7;
  const ambientes = projeto?.snapshotOriginal?.ambientesDetectados || (contrato.itensDescritivos?.map(i => i.ambiente) || ['Cozinha Gourmet', 'Suíte Master']);

  const historicoTransicoes: HistoricoTransicaoWorkflow[] = [
    {
      id: `trans_${Date.now()}_1`,
      etapa: 'fila_producao',
      dataEntrada: new Date().toISOString(),
      responsavelNome: 'Sistema ERP PCP',
      observacoes: `Ordem de Produção gerada automaticamente a partir da assinatura do contrato ${contrato.numeroContrato}.`,
      checklistConcluido: false
    }
  ];

  return {
    id: `op_${contrato.id.replace('ctr_', '')}`,
    empresaId: empresa.id,
    negocioId: contrato.negocioId,
    clienteId: cliente.id,
    clienteNome: cliente.nome,
    contratoId: contrato.id,
    numeroContrato: contrato.numeroContrato,
    projetoId: projeto?.id,
    numeroOP: `OP-${contrato.numeroContrato}`,
    titulo: negocio?.titulo || `Produção Sob Medida - ${cliente.nome}`,
    etapaAtual: 'fila_producao',
    prioridade: 'normal',
    prazoDias: contrato.prazoEntregaDias || 35,
    dataInicio: new Date().toISOString(),
    dataPrevisaoEntrega: contrato.dataPrevistaEntrega || new Date(Date.now() + 35 * 86400000).toISOString(),
    totalPecas,
    totalChapasMdf,
    ambientes,
    responsavelAtualNome: 'Programador PCP',
    historicoTransicoes,
    observacoes: `Contrato assinado em ${contrato.dataAssinatura || new Date().toLocaleDateString('pt-BR')}. Fabricar conforme especificação técnica.`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// ============================================================================
// 6. AVANÇO AUTOMÁTICO DE ESTÁGIO NO WORKFLOW COM NOTIFICAÇÃO DO PRÓXIMO RESPONSÁVEL
// ============================================================================
export interface ResultadoAvancoWorkflow {
  opAtualizada: OrdemProducao;
  etapaAnterior: EtapaWorkflowProducao;
  novaEtapa: EtapaWorkflowProducao;
  proximoResponsavel: string;
  mensagemNotificacao: string;
  concluidoTotalmente: boolean;
}

export function avancarEstagioWorkflowProducao(params: {
  ordemProducao: OrdemProducao;
  responsavelConclusaoNome: string;
  responsavelConclusaoId?: string;
  observacaoConclusao?: string;
  proximoResponsavelNome?: string;
}): ResultadoAvancoWorkflow {
  const { 
    ordemProducao, 
    responsavelConclusaoNome, 
    responsavelConclusaoId, 
    observacaoConclusao, 
    proximoResponsavelNome 
  } = params;

  const listaEstagios: EtapaWorkflowProducao[] = [
    'fila_producao',
    'corte',
    'usinagem',
    'acabamento',
    'montagem_componentes',
    'embalagem',
    'pronto_expedicao'
  ];

  const indexAtual = listaEstagios.indexOf(ordemProducao.etapaAtual);
  const etapaAnterior = ordemProducao.etapaAtual;
  const isUltimaEtapa = indexAtual >= listaEstagios.length - 1;

  const novaEtapa: EtapaWorkflowProducao = isUltimaEtapa 
    ? 'pronto_expedicao' 
    : listaEstagios[indexAtual + 1];

  const metaNovaEtapa = ESTAGIOS_WORKFLOW_PRODUCAO.find(e => e.id === novaEtapa)!;
  const proximoResponsavel = proximoResponsavelNome || metaNovaEtapa.responsavelPadraoCargo;

  const agoraIso = new Date().toISOString();

  // Fecha o histórico anterior
  const historicoAnterior = [...(ordemProducao.historicoTransicoes || [])];
  if (historicoAnterior.length > 0) {
    const ultimo = historicoAnterior[historicoAnterior.length - 1];
    ultimo.dataConclusao = agoraIso;
    ultimo.responsavelNome = responsavelConclusaoNome;
    ultimo.responsavelId = responsavelConclusaoId;
    ultimo.proximoResponsavelNome = proximoResponsavel;
    ultimo.observacoes = observacaoConclusao || ultimo.observacoes;
    ultimo.checklistConcluido = true;
  }

  // Abre o novo registro no histórico
  if (!isUltimaEtapa) {
    historicoAnterior.push({
      id: `trans_${Date.now()}_${indexAtual + 2}`,
      etapa: novaEtapa,
      dataEntrada: agoraIso,
      responsavelNome: proximoResponsavel,
      observacoes: `Fase iniciada. Aguardando execução de ${metaNovaEtapa.nomeCurto}.`,
      checklistConcluido: false
    });
  }

  const opAtualizada: OrdemProducao = {
    ...ordemProducao,
    etapaAtual: novaEtapa,
    responsavelAtualNome: proximoResponsavel,
    historicoTransicoes: historicoAnterior,
    updatedAt: agoraIso,
  };

  const mensagemNotificacao = isUltimaEtapa
    ? `🎉 Lote ${ordemProducao.numeroOP} (${ordemProducao.clienteNome}) finalizado em Pronto para Expedição!`
    : `🔔 O lote ${ordemProducao.numeroOP} avançou para [${metaNovaEtapa.label}]. Notificado: ${proximoResponsavel}.`;

  return {
    opAtualizada,
    etapaAnterior,
    novaEtapa,
    proximoResponsavel,
    mensagemNotificacao,
    concluidoTotalmente: isUltimaEtapa
  };
}

// ============================================================================
// 7. CONCLUIR MARCO NO RADAR DE PRAZOS E RECALCULAR PRÓXIMOS MARCOS
// ============================================================================
export function concluirMarcoRadarPrazos(params: {
  radar: RadarPrazosContrato;
  tipoMarcoConcluido: TipoMarcoRadar;
  responsavelNome: string;
  dataConclusaoIso?: string;
  observacoes?: string;
}): RadarPrazosContrato {
  const { radar, tipoMarcoConcluido, responsavelNome, dataConclusaoIso, observacoes } = params;

  const dataConclusaoReal = dataConclusaoIso || new Date().toISOString();
  const indexMarco = radar.marcos.findIndex(m => m.tipo === tipoMarcoConcluido);
  
  if (indexMarco === -1) return radar;

  const novosMarcos = radar.marcos.map((marco, i) => {
    if (i === indexMarco) {
      const calculoSla = calcularStatusSlaMarco({
        dataInicioPrevista: marco.dataInicioPrevista,
        dataLimitePrevista: marco.dataLimitePrevista,
        dataConclusaoReal,
        slaDias: marco.slaDias
      });

      return {
        ...marco,
        dataConclusaoReal,
        statusMarco: 'concluido' as const,
        statusAlerta: calculoSla.statusAlerta,
        diasRestantes: 0,
        percentualTempoDecorrido: 100,
        responsavelNome,
        observacoes: observacoes || marco.observacoes
      };
    }

    // Se é o próximo marco imediatamente a seguir, coloca em 'em_andamento'
    if (i === indexMarco + 1) {
      const novaDataInicio = dataConclusaoReal;
      const dataLimite = new Date(new Date(novaDataInicio).getTime() + marco.slaDias * 86400000).toISOString();
      
      const calculoSla = calcularStatusSlaMarco({
        dataInicioPrevista: novaDataInicio,
        dataLimitePrevista: dataLimite,
        slaDias: marco.slaDias
      });

      return {
        ...marco,
        dataInicioPrevista: novaDataInicio,
        dataLimitePrevista: dataLimite,
        statusMarco: 'em_andamento' as const,
        statusAlerta: calculoSla.statusAlerta,
        diasRestantes: calculoSla.diasRestantes,
        percentualTempoDecorrido: calculoSla.percentualTempoDecorrido
      };
    }

    return marco;
  });

  const proximoMarcoIndex = indexMarco + 1;
  const isUltimoMarco = proximoMarcoIndex >= radar.marcos.length;
  const novoMarcoAtual = isUltimoMarco ? 'concluido' : radar.marcos[proximoMarcoIndex].tipo;

  const statusGeralAlerta: StatusAlertaSla = novosMarcos.some(m => m.statusAlerta === 'vermelho' && m.statusMarco !== 'concluido')
    ? 'vermelho'
    : (novosMarcos.some(m => m.statusAlerta === 'amarelo' && m.statusMarco !== 'concluido') ? 'amarelo' : 'verde');

  return {
    ...radar,
    marcoAtual: novoMarcoAtual,
    statusGeralAlerta,
    marcos: novosMarcos,
    dataConclusaoFinalReal: isUltimoMarco ? dataConclusaoReal : undefined,
    updatedAt: new Date().toISOString()
  };
}
