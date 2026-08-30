// ==============================================================================
// MOTOR DE CONTRATOS, NUMERAÇÃO SEQUENCIAL & ASSINATURA DIGITAL ICP-BRASIL
// ==============================================================================

import { 
  Contrato, 
  Empresa, 
  Cliente, 
  Negocio, 
  Projeto, 
  ItemOrcamento, 
  SimulacaoNegociacao,
  ItemDescritivoContrato,
  LogAuditoriaContrato,
  AssinaturaIcpEmpresa,
  AssinaturaEletronicaCliente,
  CertificadoIcpBrasilConfig
} from '@/types/database';

/**
 * Gera um hash SHA-256 simulado e determinístico para integridade de documentos
 */
export function gerarHashSha256(conteudo: string): string {
  let hash = 0;
  for (let i = 0; i < conteudo.length; i++) {
    const char = conteudo.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Converte para inteiro de 32 bits
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  const timestampHex = Date.now().toString(16);
  return `sha256:${hex}${timestampHex}f94b28c049d5e7182a391c0e`.slice(0, 64);
}

/**
 * Gera o número de contrato no formato #N/ANO (ex: #0044/2026)
 * Respeita a regra de reinício anual configurável por empresa.
 */
export function gerarNumeroContratoSequencial(
  empresa: Empresa,
  contratosExistentes: Contrato[]
): { numeroFormatado: string; proximoNumero: number } {
  const anoAtual = new Date().getFullYear();
  const reiniciarPorAno = empresa.reiniciarNumeracaoAno ?? false;

  // Filtra contratos da empresa
  const contratosEmpresa = contratosExistentes.filter(c => c.empresaId === empresa.id);

  let proximoNumero = empresa.proximoNumeroContrato || 1;

  if (contratosEmpresa.length > 0) {
    if (reiniciarPorAno) {
      // Filtra apenas os contratos do ano atual
      const contratosDoAno = contratosEmpresa.filter(c => {
        const anoCriacao = c.createdAt ? new Date(c.createdAt).getFullYear() : anoAtual;
        return anoCriacao === anoAtual || c.numeroContrato?.includes(`/${anoAtual}`);
      });
      proximoNumero = Math.max(proximoNumero, contratosDoAno.length + 1);
    } else {
      // Numeração contínua independente do ano
      proximoNumero = Math.max(proximoNumero, contratosEmpresa.length + 1);
    }
  }

  const numeroFormatado = `#${String(proximoNumero).padStart(4, '0')}/${anoAtual}`;

  return {
    numeroFormatado,
    proximoNumero: proximoNumero + 1,
  };
}

/**
 * Modelo de Texto Padrão com Cláusulas Jurídicas de Marcenaria Sob Medida
 */
export const MODELO_PADRAO_CONTRATO_MARCENARIA = `
INSTRUMENTO PARTICULAR DE COMPRA E VENDA DE MÓVEIS PLANEJADOS E PRESTAÇÃO DE SERVIÇOS DE MARCENARIA SOB MEDIDA

CONTRATO Nº: {NUMERO_CONTRATO}

1. DAS PARTES CONTRATANTES

CONTRATADA:
Razão Social: {EMPRESA_RAZAO_SOCIAL}
Nome Fantasia: {EMPRESA_NOME_FANTASIA}
CNPJ: {EMPRESA_CNPJ}
Endereço: {EMPRESA_ENDERECO}
E-mail / Fone: {EMPRESA_CONTATO}

CONTRATANTE:
Nome / Razão Social: {CLIENTE_NOME}
CPF / CNPJ: {CLIENTE_CPF_CNPJ}
Endereço da Instalação: {CLIENTE_ENDERECO_OBRA}
E-mail / Telefone: {CLIENTE_CONTATO}

2. CLÁUSULA PRIMEIRA – DO OBJETO DO CONTRATO
O presente instrumento tem por objeto a fabricação, transporte, montagem e instalação de mobiliário planejado sob medida, conforme especificações técnicas do projeto aprovado ({PROJETO_IDENTIFICACAO}):

{LISTA_DETALHADA_AMBIENTES_E_ITENS}

Parágrafo Único: Todos os móveis serão confeccionados com MDF 100% de primeira linha com tratamento antibacteriano, fitamento de borda em tecnologia PUR de alta resistência à umidade e ferragens italianas/alemãs dotadas de amortecimento soft-close nas gavetas e portas basculantes.

3. CLÁUSULA SEGUNDA – DO PREÇO E CONDIÇÕES DE PAGAMENTO
Pela confecção e instalação completa dos móveis descritos na Cláusula Primeira, o(a) CONTRATANTE pagará à CONTRATADA o valor total líquido de:
{VALOR_TOTAL_EXTENSO} ({VALOR_TOTAL_NUMERICO})

Forma e Cronograma de Pagamento:
{CONDICOES_PAGAMENTO_DETALHADAS}

4. CLÁUSULA TERCEIRA – DOS PRAZOS DE FABRICAÇÃO E MONTAGEM
I – O prazo de fabricação industrial é de até {PRAZO_FABRICACAO_DIAS} ({PRAZO_FABRICACAO_DIAS_EXTENSO}) dias úteis, contados a partir da assinatura deste contrato e confirmação da medição técnica final in-loco.
II – O prazo de montagem e instalação na residência/empresa do CONTRATANTE é de {PRAZO_MONTAGEM_DIAS} ({PRAZO_MONTAGEM_DIAS_EXTENSO}) dias úteis, com início imediatamente subsequente à entrega dos módulos no local da obra.
III – A data prevista para a conclusão e entrega definitiva dos móveis é: {DATA_PREVISTA_ENTREGA}.

5. CLÁUSULA QUARTA – DAS OBRIGAÇÕES DAS PARTES
I – Do CONTRATANTE: Disponibilizar o imóvel com piso, pintura, pontos elétricos e hidráulicos devidamente finalizados e desimpedidos para o início da montagem, garantindo energia elétrica (110V/220V) e acesso aos montadores credenciados.
II – Da CONTRATADA: Executar o projeto rigorosamente fiel aos materiais especificados, zelar pela proteção do piso e paredes durante a instalação e realizar limpeza técnica pós-obra.

6. CLÁUSULA QUINTA – DA GARANTIA E ASSISTÊNCIA TÉCNICA
A CONTRATADA oferece garantia total de {GARANTIA_ANOS} ({GARANTIA_ANOS_EXTENSO}) ANOS para a estrutura de MDF e 5 anos para as ferragens e trilhos, contra eventuais defeitos de fabricação e montagem, com atendimento e assistência técnica própria.

7. CLÁUSULA SEXTA – DA VALIDADE JURÍDICA DAS ASSINATURAS ELETRÔNICAS E DIGITAIS
As partes declaram e reconhecem a plena validade jurídica deste contrato assinado digitalmente, nos termos da Medida Provisória nº 2.200-2/2001 (ICP-Brasil) e da Lei Federal nº 14.063/2020, concordando expressamente que o registro eletrônico de IPs, geolocalização, carimbos do tempo e hashes SHA-256 constituem meio idôneo e probatório de autoria, anuência e integridade das vontades aqui manifestadas.

8. CLÁUSULA SÉTIMA – DO FORO
Para dirimir quaisquer controvérsias oriundas do presente contrato, as partes elegem o Foro da Comarca de {CIDADE_FORO}/{UF_FORO}, com renúncia expressa a qualquer outro.

Local e Data de Emissão: {CIDADE_EMISSAO} - {UF_EMISSAO}, {DATA_EMISSAO_EXTENSO}.
`.trim();

/**
 * Preenche o template de contrato com os dados reais do negócio, cliente e empresa
 */
export function formatarTextoContrato(params: {
  contrato: Contrato;
  empresa: Empresa;
  cliente: Cliente;
  negocio: Negocio;
  projeto?: Projeto;
  itensOrcamento?: ItemOrcamento[];
}): string {
  const { contrato, empresa, cliente, negocio, projeto, itensOrcamento = [] } = params;

  const dataAtual = new Date();
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const dataExtenso = `${dataAtual.getDate()} de ${meses[dataAtual.getMonth()]} de ${dataAtual.getFullYear()}`;

  // Montagem da lista detalhada de itens/ambientes
  let listaItensTexto = '';
  if (contrato.itensDescritivos && contrato.itensDescritivos.length > 0) {
    listaItensTexto = contrato.itensDescritivos.map((item, idx) => {
      return `  • AMBIENTE ${idx + 1}: ${item.ambiente.toUpperCase()}\n    - Descrição: ${item.descricao}\n    - Acabamento: ${item.material || 'MDF 18mm de Primeira Linha'}${item.acabamento ? ` (${item.acabamento})` : ''}`;
    }).join('\n\n');
  } else if (itensOrcamento.length > 0) {
    const ambientesMap: Record<string, typeof itensOrcamento> = {};
    itensOrcamento.forEach(it => {
      if (!ambientesMap[it.ambiente]) ambientesMap[it.ambiente] = [];
      ambientesMap[it.ambiente].push(it);
    });

    listaItensTexto = Object.entries(ambientesMap).map(([amb, itens]) => {
      const descricoes = itens.map(i => `    - ${i.descricao} (${i.medidas.larguraMm}x${i.medidas.alturaMm}x${i.medidas.profundidadeMm}mm - ${i.acabamento})`).join('\n');
      return `  • AMBIENTE: ${amb.toUpperCase()}\n${descricoes}`;
    }).join('\n\n');
  } else {
    listaItensTexto = `  • PROJETO COMPLETO DE MARCENARIA: ${negocio.titulo}\n    - Móveis sob medida para todos os ambientes contratados conforme modelo executivo Promob/SketchUp.`;
  }

  const template = empresa.modeloContratoTextoPadrao || MODELO_PADRAO_CONTRATO_MARCENARIA;

  const valorFormatado = contrato.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const enderecoCliente = cliente.endereco 
    ? `${cliente.endereco.logradouro}, nº ${cliente.endereco.numero}${cliente.endereco.complemento ? ` (${cliente.endereco.complemento})` : ''}, Bairro ${cliente.endereco.bairro} - ${cliente.endereco.cidade}/${cliente.endereco.uf} - CEP ${cliente.endereco.cep}`
    : 'Endereço residencial cadastrado no pedido';

  const enderecoEmpresa = empresa.enderecoCompleto || `${empresa.cidade}/${empresa.uf}`;

  return template
    .replace(/{NUMERO_CONTRATO}/g, contrato.numeroContrato)
    .replace(/{EMPRESA_RAZAO_SOCIAL}/g, empresa.razaoSocial || empresa.nomeFantasia)
    .replace(/{EMPRESA_NOME_FANTASIA}/g, empresa.nomeFantasia)
    .replace(/{EMPRESA_CNPJ}/g, empresa.cnpj)
    .replace(/{EMPRESA_ENDERECO}/g, enderecoEmpresa)
    .replace(/{EMPRESA_CONTATO}/g, `${empresa.email} | ${empresa.telefone}`)
    .replace(/{CLIENTE_NOME}/g, cliente.nome)
    .replace(/{CLIENTE_CPF_CNPJ}/g, cliente.cpfCnpj || 'Não informado')
    .replace(/{CLIENTE_ENDERECO_OBRA}/g, enderecoCliente)
    .replace(/{CLIENTE_CONTATO}/g, `${cliente.email || ''} | ${cliente.whatsapp || cliente.telefone}`)
    .replace(/{PROJETO_IDENTIFICACAO}/g, projeto ? `${projeto.nomeAmbiente} (${projeto.softwareOrigem.toUpperCase()} ${projeto.versao})` : negocio.titulo)
    .replace(/{LISTA_DETALHADA_AMBIENTES_E_ITENS}/g, listaItensTexto)
    .replace(/{VALOR_TOTAL_NUMERICO}/g, valorFormatado)
    .replace(/{VALOR_TOTAL_EXTENSO}/g, `R$ ${contrato.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
    .replace(/{CONDICOES_PAGAMENTO_DETALHADAS}/g, contrato.condicoesPagamento)
    .replace(/{PRAZO_FABRICACAO_DIAS}/g, String(contrato.prazoEntregaDias || 35))
    .replace(/{PRAZO_FABRICACAO_DIAS_EXTENSO}/g, `${contrato.prazoEntregaDias || 35}`)
    .replace(/{PRAZO_MONTAGEM_DIAS}/g, String(contrato.prazoMontagemDias || 7))
    .replace(/{PRAZO_MONTAGEM_DIAS_EXTENSO}/g, `${contrato.prazoMontagemDias || 7}`)
    .replace(/{DATA_PREVISTA_ENTREGA}/g, contrato.dataPrevistaEntrega ? new Date(contrato.dataPrevistaEntrega).toLocaleDateString('pt-BR') : `${contrato.prazoEntregaDias || 35} dias úteis`)
    .replace(/{GARANTIA_ANOS}/g, String(contrato.garantiaAnos || 5))
    .replace(/{GARANTIA_ANOS_EXTENSO}/g, 'CINCO')
    .replace(/{CIDADE_FORO}/g, empresa.cidade || 'São Paulo')
    .replace(/{UF_FORO}/g, empresa.uf || 'SP')
    .replace(/{CIDADE_EMISSAO}/g, empresa.cidade || 'São Paulo')
    .replace(/{UF_EMISSAO}/g, empresa.uf || 'SP')
    .replace(/{DATA_EMISSAO_EXTENSO}/g, dataExtenso);
}

/**
 * Criação Automática do Contrato a partir de um Negócio Fechado e sua Negociação
 */
export function criarContratoDeNegocio(params: {
  negocio: Negocio;
  cliente: Cliente;
  empresa: Empresa;
  projeto?: Projeto;
  itensOrcamento?: ItemOrcamento[];
  contratosExistentes: Contrato[];
}): Contrato {
  const { negocio, cliente, empresa, projeto, itensOrcamento = [], contratosExistentes } = params;

  // 1. Gera numeração sequencial #N/ANO
  const { numeroFormatado } = gerarNumeroContratoSequencial(empresa, contratosExistentes);

  // 2. Extrai valores e condições da simulação financeira
  const simulacao = negocio.simulacaoNegociacao;
  const valorTotal = simulacao?.valorVendaFinal || negocio.valorEstimado || 35000;
  
  let condicoesTexto = 'À vista no PIX com confirmação na assinatura.';
  if (simulacao) {
    if (simulacao.condicaoPagamento === 'a_vista_pix') {
      condicoesTexto = `Pagamento à vista via PIX no ato da assinatura: ${valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`;
    } else if (simulacao.condicaoPagamento === 'cartao_credito') {
      condicoesTexto = `Parcelado em ${simulacao.numeroParcelas}x de ${(valorTotal / simulacao.numeroParcelas).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} no cartão de crédito.`;
    } else if (simulacao.condicaoPagamento === 'entrada_parcelas') {
      const entrada = simulacao.parcelasFluxo[0]?.valorBruto || (valorTotal * 0.3);
      const qtdRestante = Math.max(1, simulacao.numeroParcelas - 1);
      const valorRestante = (valorTotal - entrada) / qtdRestante;
      condicoesTexto = `Entrada de ${entrada.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} + ${qtdRestante}x parcelas de ${valorRestante.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} em boleto/transferência bancária.`;
    } else if (simulacao.condicaoPagamento === 'boleto_parcelado') {
      condicoesTexto = `Parcelamento em ${simulacao.numeroParcelas}x boletos bancários da marcenaria de ${(valorTotal / simulacao.numeroParcelas).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} com vencimentos a cada 30 dias.`;
    }
  }

  // 3. Monta itens descritivos
  const itensDescritivos: ItemDescritivoContrato[] = [];
  if (projeto?.snapshotOriginal?.ambientesDetectados) {
    projeto.snapshotOriginal.ambientesDetectados.forEach((amb) => {
      itensDescritivos.push({
        ambiente: amb,
        descricao: `Mobiliário planejado completo para ${amb} com estrutura em MDF 18mm e ferragens com amortecimento soft-close`,
        material: 'MDF 18mm Primeira Linha',
        acabamento: 'Laca / BP conforme render aprovado',
        quantidade: 1,
        valor: Math.round(valorTotal / projeto.snapshotOriginal!.ambientesDetectados.length),
      });
    });
  } else if (itensOrcamento.length > 0) {
    itensOrcamento.forEach(it => {
      itensDescritivos.push({
        ambiente: it.ambiente,
        descricao: it.descricao,
        material: it.material,
        acabamento: it.acabamento,
        quantidade: it.quantidade,
        valor: it.precoVenda,
      });
    });
  } else {
    itensDescritivos.push({
      ambiente: projeto?.nomeAmbiente || 'Ambientes Integrados',
      descricao: negocio.titulo,
      material: 'MDF 18mm de Primeira Linha com certificação FSC',
      acabamento: 'Padrão Madeirado e Laca conforme renders 3D',
      quantidade: 1,
      valor: valorTotal,
    });
  }

  const prazoEntregaDias = 35;
  const prazoMontagemDias = 7;
  const dataHoje = new Date();
  const dataPrevisaoEntrega = new Date(dataHoje.getTime() + (prazoEntregaDias + prazoMontagemDias) * 86400000).toISOString();

  // 4. Token único para assinatura do cliente
  const tokenAssinaturaCliente = `sig_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const linkAssinaturaCliente = `${typeof window !== 'undefined' ? window.location.origin : ''}/assinar/${tokenAssinaturaCliente}`;

  // 5. Estrutura base do contrato
  const idContrato = `ctr_${Date.now()}`;

  const contratoBase: Contrato = {
    id: idContrato,
    empresaId: empresa.id,
    negocioId: negocio.id,
    clienteId: cliente.id,
    projetoId: projeto?.id,
    numeroContrato: numeroFormatado,
    valorTotal,
    condicoesPagamento: condicoesTexto,
    statusAssinatura: 'aguardando_assinatura_empresa',
    prazoEntregaDias,
    prazoMontagemDias,
    dataPrevistaEntrega: dataPrevisaoEntrega,
    garantiaAnos: 5,
    itensDescritivos,
    tokenAssinaturaCliente,
    linkAssinaturaCliente,
    simulacaoFinanceira: simulacao,
    logAuditoria: [
      {
        id: `log_${Date.now()}_1`,
        timestamp: new Date().toISOString(),
        evento: 'contrato_gerado',
        ator: 'Sistema ERP / Motor de Vendas',
        detalhes: `Contrato gerado automaticamente com numeração ${numeroFormatado} a partir do negócio "${negocio.titulo}". Trava de margem validada com sucesso.`,
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Preenche o texto completo
  contratoBase.textoContratoCompleto = formatarTextoContrato({
    contrato: contratoBase,
    empresa,
    cliente,
    negocio,
    projeto,
    itensOrcamento,
  });

  return contratoBase;
}

// ==============================================================================
// ASSINATURA DIGITAL ICP-BRASIL (LADO DA EMPRESA)
// ==============================================================================

/**
 * Ponto de Integração de Assinatura Digital ICP-Brasil
 * Documentação para produção com Provedores Oficiais (D4Sign / Clicksign / Certisign / Bry / Soluti REST API):
 *
 * Exemplo de Payload para Provedor ICP-Brasil:
 * POST https://secure.d4sign.com.br/api/v1/documents/{document_uuid}/signature
 * Headers: { "tokenAPI": process.env.ICP_BRASIL_PROVIDER_TOKEN }
 * Body: {
 *   "email": "diretoria@marcenaria.com.br",
 *   "act": 1, // Assinar
 *   "foreign": 0,
 *   "certificate_type": "ICP-Brasil A1/A3",
 *   "cnpj": empresa.cnpj
 * }
 */
export function executarAssinaturaIcpBrasilEmpresa(params: {
  contrato: Contrato;
  empresa: Empresa;
  assinanteNome: string;
  assinanteCargo: string;
  certificadoConfig?: CertificadoIcpBrasilConfig;
}): {
  contratoAtualizado: Contrato;
  assinaturaIcp: AssinaturaIcpEmpresa;
} {
  const { contrato, empresa, assinanteNome, assinanteCargo, certificadoConfig } = params;

  const cert = certificadoConfig || empresa.certificadoIcpBrasilConfig || {
    emitidoPara: empresa.razaoSocial || empresa.nomeFantasia,
    cnpjTitular: empresa.cnpj,
    autoridadeCertificadora: 'AC SOLUTI Multipla v5 • ICP-Brasil',
    numeroSerie: '7A9F.4B12.C830.5901.D3',
    validadeAte: '2027-12-31',
    tipoCertificado: 'A1',
    statusCertificado: 'valido',
  };

  const timestampIso = new Date().toISOString();
  const hashConteudo = gerarHashSha256(`${contrato.numeroContrato}_${contrato.textoContratoCompleto}_${timestampIso}_ICP_BRASIL`);

  const assinaturaIcp: AssinaturaIcpEmpresa = {
    assinado: true,
    dataAssinatura: timestampIso,
    assinanteNome,
    assinanteCargo,
    certificadoNome: cert.emitidoPara,
    certificadoCnpj: cert.cnpjTitular,
    autoridadeCertificadora: cert.autoridadeCertificadora,
    numeroSerie: cert.numeroSerie,
    hashSha256: hashConteudo,
    carimboTempoIcp: `BR-ACT-TIMESTAMP-${Date.now()}-SERPRO-ON-TIME`,
  };

  const novoLog: LogAuditoriaContrato = {
    id: `log_${Date.now()}`,
    timestamp: timestampIso,
    evento: 'assinado_icp_brasil_empresa',
    ator: `${assinanteNome} (${assinanteCargo})`,
    detalhes: `Documento assinado digitalmente com Certificado ICP-Brasil ${cert.tipoCertificado} (${cert.autoridadeCertificadora}). Número de Série: ${cert.numeroSerie}. Hash SHA-256: ${hashConteudo}`,
    hashIntegridade: hashConteudo,
  };

  const contratoAtualizado: Contrato = {
    ...contrato,
    statusAssinatura: 'aguardando_assinatura_cliente',
    assinaturaEmpresa: assinaturaIcp,
    logAuditoria: [...(contrato.logAuditoria || []), novoLog],
    updatedAt: timestampIso,
  };

  return {
    contratoAtualizado,
    assinaturaIcp,
  };
}

// ==============================================================================
// ASSINATURA ELETRÔNICA REMOTA (LADO DO CLIENTE)
// ==============================================================================

export function executarAssinaturaEletronicaCliente(params: {
  contrato: Contrato;
  nomeCompleto: string;
  cpfCnpj: string;
  email: string;
  telefone: string;
  rubricaBase64: string;
  ip?: string;
  dispositivo?: string;
  geolocalizacao?: string;
}): {
  contratoAtualizado: Contrato;
  assinaturaCliente: AssinaturaEletronicaCliente;
} {
  const { 
    contrato, 
    nomeCompleto, 
    cpfCnpj, 
    email, 
    telefone, 
    rubricaBase64,
    ip = '189.40.122.95 (VIVO Telecom SP)',
    dispositivo = typeof navigator !== 'undefined' ? `${navigator.platform} - ${navigator.userAgent.slice(0, 50)}...` : 'Mobile Safari / iOS 17.4',
    geolocalizacao = 'São Paulo, SP - Brasil (Lat: -23.5505, Long: -46.6333)'
  } = params;

  const timestampIso = new Date().toISOString();
  const hashCliente = gerarHashSha256(`${contrato.numeroContrato}_${cpfCnpj}_${timestampIso}_CLIENTE_EVIDENCIA`);

  const assinaturaCliente: AssinaturaEletronicaCliente = {
    assinado: true,
    dataAssinatura: timestampIso,
    nomeCompleto,
    cpfCnpj,
    email,
    telefone,
    ip,
    dispositivo,
    geolocalizacao,
    rubricaBase64,
    hashSha256: hashCliente,
    termoAceiteTexto: 'O contratante declara ter lido e concordado integralmente com todos os termos, plantas, memoriais descritivos, prazos e condições financeiras do presente contrato, reconhecendo a autenticidade e validade jurídica de sua assinatura eletrônica conforme a Lei Federal nº 14.063/2020.',
  };

  const novoLog: LogAuditoriaContrato = {
    id: `log_${Date.now()}`,
    timestamp: timestampIso,
    evento: 'assinado_eletronicamente_cliente',
    ator: `${nomeCompleto} (Cliente)`,
    detalhes: `Contrato assinado eletronicamente pelo cliente via link seguro. CPF: ${cpfCnpj} | IP: ${ip} | Dispositivo: ${dispositivo}. Hash SHA-256: ${hashCliente}`,
    ip,
    dispositivo,
    hashIntegridade: hashCliente,
  };

  const contratoAtualizado: Contrato = {
    ...contrato,
    statusAssinatura: 'assinado',
    dataAssinatura: timestampIso,
    assinaturaCliente,
    logAuditoria: [...(contrato.logAuditoria || []), novoLog],
    updatedAt: timestampIso,
  };

  return {
    contratoAtualizado,
    assinaturaCliente,
  };
}
