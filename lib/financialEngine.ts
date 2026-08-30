// ==============================================================================
// MOTOR FINANCEIRO DE NEGOCIAÇÃO, VPL, DRE & PREVISÃO DE MARGEM AO VIVO
// ==============================================================================

import { 
  SimulacaoNegociacao, 
  TipoCondicaoPagamento, 
  ItemParcelaFluxo, 
  Empresa,
  RenderProAmbienteItem,
  ApresentacaoPropostaData 
} from '@/types/database';

export interface ParametrosCalculoNegociacao {
  valorVendaBruto: number;
  descontoPercentual?: number;
  descontoReais?: number;
  custoProjeto: number;
  condicaoPagamento: TipoCondicaoPagamento;
  numeroParcelas?: number;
  percentualEntrada?: number; // Para entrada + parcelas (ex: 40)
  taxaMeioPagamentoCustom?: number;
  aliquotaImpostoPercent?: number;
  temParceiroRT?: boolean;
  nomeParceiroRT?: string;
  comissaoRTPercent?: number;
  comissaoVendedorPercent?: number;
  taxaDescontoCapitalMensal?: number; // Custo de capital da empresa (ex: 1.8% a.m.)
  margemMinimaEmpresa?: number; // Ex: 22.0%
}

// Tabela de taxas de operadoras de cartão padrão de mercado (MDR + Antecipação)
export const TABELA_TAXAS_CARTAO_PADRAO: Record<number, number> = {
  1: 2.39,   // À vista crédito
  2: 4.49,
  3: 5.29,
  4: 6.19,
  5: 6.99,
  6: 7.89,
  7: 8.99,
  8: 9.79,
  9: 10.59,
  10: 11.49,
  11: 12.29,
  12: 12.99,
  18: 16.89,
  24: 21.49,
};

/**
 * Retorna a taxa estimada do meio de pagamento conforme a forma e parcelamento
 */
export function obterTaxaMeioPagamentoPadrao(
  condicao: TipoCondicaoPagamento, 
  parcelas: number = 1
): number {
  switch (condicao) {
    case 'a_vista_pix':
      return 0.0; // PIX / TED sem taxa de intermediação
    case 'cartao_credito': {
      if (TABELA_TAXAS_CARTAO_PADRAO[parcelas]) {
        return TABELA_TAXAS_CARTAO_PADRAO[parcelas];
      }
      if (parcelas <= 1) return 2.39;
      if (parcelas <= 6) return 7.89;
      if (parcelas <= 12) return 12.99;
      return 18.50;
    }
    case 'boleto_parcelado':
      return 1.80; // Custo médio de emissão e custódia bancária
    case 'entrada_parcelas':
      return 0.90; // Misto de PIX na entrada + boleto/transferência
    case 'personalizado':
      return 1.50;
    default:
      return 0.0;
  }
}

/**
 * Calcula a DRE completa e o VPL em tempo real da negociação
 */
export function calcularSimulacaoNegociacao(
  params: ParametrosCalculoNegociacao
): SimulacaoNegociacao {
  const {
    valorVendaBruto,
    custoProjeto,
    condicaoPagamento,
    numeroParcelas = condicaoPagamento === 'a_vista_pix' ? 1 : 6,
    percentualEntrada = 30,
    aliquotaImpostoPercent = 6.5,
    temParceiroRT = false,
    nomeParceiroRT = '',
    comissaoRTPercent = 5.0,
    comissaoVendedorPercent = 4.0,
    taxaDescontoCapitalMensal = 1.8,
    margemMinimaEmpresa = 22.0,
  } = params;

  // 1. Cálculo do Desconto e Valor de Venda Final
  let descontoReais = 0;
  let descontoPercentual = 0;

  if (params.descontoReais !== undefined && params.descontoReais > 0) {
    descontoReais = params.descontoReais;
    descontoPercentual = valorVendaBruto > 0 ? (descontoReais / valorVendaBruto) * 100 : 0;
  } else if (params.descontoPercentual !== undefined && params.descontoPercentual > 0) {
    descontoPercentual = params.descontoPercentual;
    descontoReais = (valorVendaBruto * descontoPercentual) / 100;
  }

  const valorVendaFinal = Math.max(0, valorVendaBruto - descontoReais);

  // 2. Taxa do Meio de Pagamento
  const taxaMeioPagamentoPercent = params.taxaMeioPagamentoCustom !== undefined 
    ? params.taxaMeioPagamentoCustom 
    : obterTaxaMeioPagamentoPadrao(condicaoPagamento, numeroParcelas);

  const valorTaxaMeioPagamento = Number(((valorVendaFinal * taxaMeioPagamentoPercent) / 100).toFixed(2));

  // 3. Geração do Fluxo de Parcelas e Cálculo do VPL (Valor Presente Líquido)
  const parcelasFluxo: ItemParcelaFluxo[] = [];
  const taxaMensalDecimal = taxaDescontoCapitalMensal / 100;
  // Taxa diária equivalente: (1 + i_mensal)^(1/30) - 1
  const taxaDiariaDecimal = Math.pow(1 + taxaMensalDecimal, 1 / 30) - 1;

  let somaValorPresenteBruto = 0;

  if (condicaoPagamento === 'a_vista_pix' || numeroParcelas === 1) {
    parcelasFluxo.push({
      numero: 1,
      diasAposFechamento: 0,
      percentual: 100,
      valorBruto: valorVendaFinal,
      taxaDescontoAplicada: 0,
      valorPresente: valorVendaFinal,
    });
    somaValorPresenteBruto = valorVendaFinal;
  } else if (condicaoPagamento === 'entrada_parcelas') {
    // Entrada no dia 0 + restante dividido em parcelas mensais (30, 60, 90...)
    const valorEntrada = (valorVendaFinal * percentualEntrada) / 100;
    const saldoRestante = valorVendaFinal - valorEntrada;
    const qtdParcelasRestantes = Math.max(1, numeroParcelas - 1);
    const valorParcela = saldoRestante / qtdParcelasRestantes;
    const percentualParcela = (100 - percentualEntrada) / qtdParcelasRestantes;

    // Entrada
    parcelasFluxo.push({
      numero: 1,
      diasAposFechamento: 0,
      percentual: percentualEntrada,
      valorBruto: Number(valorEntrada.toFixed(2)),
      taxaDescontoAplicada: 0,
      valorPresente: Number(valorEntrada.toFixed(2)),
    });
    somaValorPresenteBruto += valorEntrada;

    // Demais parcelas
    for (let i = 1; i <= qtdParcelasRestantes; i++) {
      const dias = i * 30;
      const fatorDesconto = Math.pow(1 + taxaDiariaDecimal, dias);
      const vplParcela = valorParcela / fatorDesconto;
      const taxaDescontoAcumulada = ((valorParcela - vplParcela) / valorParcela) * 100;

      parcelasFluxo.push({
        numero: i + 1,
        diasAposFechamento: dias,
        percentual: Number(percentualParcela.toFixed(2)),
        valorBruto: Number(valorParcela.toFixed(2)),
        taxaDescontoAplicada: Number(taxaDescontoAcumulada.toFixed(2)),
        valorPresente: Number(vplParcela.toFixed(2)),
      });
      somaValorPresenteBruto += vplParcela;
    }
  } else {
    // Parcelas iguais em 30, 60, 90, 120... dias
    const valorParcela = valorVendaFinal / numeroParcelas;
    const percentualParcela = 100 / numeroParcelas;

    for (let i = 1; i <= numeroParcelas; i++) {
      // Se for cartão antecipado pelo adquirente, a empresa recebe antes, mas paga MDR
      // Se for boleto/financiamento, o recebimento ocorre a cada 30 dias
      const dias = condicaoPagamento === 'cartao_credito' ? Math.min(30, (i - 1) * 30) : (i * 30);
      const fatorDesconto = dias === 0 ? 1 : Math.pow(1 + taxaDiariaDecimal, dias);
      const vplParcela = valorParcela / fatorDesconto;
      const taxaDescontoAcumulada = ((valorParcela - vplParcela) / valorParcela) * 100;

      parcelasFluxo.push({
        numero: i,
        diasAposFechamento: dias,
        percentual: Number(percentualParcela.toFixed(2)),
        valorBruto: Number(valorParcela.toFixed(2)),
        taxaDescontoAplicada: Number(taxaDescontoAcumulada.toFixed(2)),
        valorPresente: Number(vplParcela.toFixed(2)),
      });
      somaValorPresenteBruto += vplParcela;
    }
  }

  // O VPL Real deduz o custo do meio de pagamento do fluxo a valor presente
  const valorPresenteLiquidoVPL = Number(Math.max(0, somaValorPresenteBruto - valorTaxaMeioPagamento).toFixed(2));

  // 4. Impostos (sobre o faturamento nominal da nota)
  const valorImposto = Number(((valorVendaFinal * aliquotaImpostoPercent) / 100).toFixed(2));

  // 5. Comissões (Calculadas sobre o VPL / Valor Líquido Real)
  const baseCalculoComissao = valorPresenteLiquidoVPL;

  const valorComissaoVendedor = Number(((baseCalculoComissao * comissaoVendedorPercent) / 100).toFixed(2));

  const valorComissaoRT = temParceiroRT 
    ? Number(((baseCalculoComissao * comissaoRTPercent) / 100).toFixed(2)) 
    : 0;

  // 6. Margens e DRE
  // Margem Bruta = Venda Final - Custo Projeto
  const margemBrutaReais = Number((valorVendaFinal - custoProjeto).toFixed(2));
  const margemBrutaPercent = valorVendaFinal > 0 
    ? Number(((margemBrutaReais / valorVendaFinal) * 100).toFixed(2)) 
    : 0;

  // Margem Líquida Real = VPL - Impostos - Comissão Vendedor - Comissão RT - Custo Fabril
  const margemLiquidaReais = Number(
    (valorPresenteLiquidoVPL - valorImposto - valorComissaoVendedor - valorComissaoRT - custoProjeto).toFixed(2)
  );

  const margemLiquidaPercent = valorVendaFinal > 0 
    ? Number(((margemLiquidaReais / valorVendaFinal) * 100).toFixed(2)) 
    : 0;

  // Markup Efetivo
  const markup = custoProjeto > 0 
    ? Number((valorVendaFinal / custoProjeto).toFixed(2)) 
    : 0;

  // 7. Verificação da Trava de Margem Mínima
  const margemAprovada = margemLiquidaPercent >= margemMinimaEmpresa;
  let motivoBloqueio: string | undefined = undefined;

  if (!margemAprovada) {
    const diferencaPercent = (margemMinimaEmpresa - margemLiquidaPercent).toFixed(1);
    motivoBloqueio = `A margem líquida de ${margemLiquidaPercent}% está ${diferencaPercent}% abaixo da margem mínima exigida (${margemMinimaEmpresa}%). Aumente o valor de venda ou reduza descontos/prazos para liberar o fechamento.`;
  }

  return {
    valorVendaBruto,
    descontoPercentual: Number(descontoPercentual.toFixed(2)),
    descontoReais: Number(descontoReais.toFixed(2)),
    valorVendaFinal,
    custoProjeto,
    condicaoPagamento,
    numeroParcelas,
    taxaMeioPagamentoPercent: Number(taxaMeioPagamentoPercent.toFixed(2)),
    valorTaxaMeioPagamento,
    aliquotaImpostoPercent,
    valorImposto,
    temParceiroRT,
    nomeParceiroRT,
    comissaoRTPercent,
    valorComissaoRT,
    comissaoVendedorPercent,
    valorComissaoVendedor,
    taxaDescontoCapitalMensal,
    valorPresenteLiquidoVPL,
    markup,
    margemBrutaReais,
    margemBrutaPercent,
    margemLiquidaReais,
    margemLiquidaPercent,
    margemMinimaEmpresa,
    margemAprovada,
    motivoBloqueio,
    parcelasFluxo,
    dataCalculo: new Date().toISOString(),
  };
}

/**
 * Calcula o valor de venda necessário para atingir exatamente a margem líquida desejada
 */
export function calcularValorVendaParaMargemAlvo(
  custoProjeto: number,
  margemAlvoPercent: number,
  condicaoPagamento: TipoCondicaoPagamento = 'a_vista_pix',
  parcelas: number = 1,
  aliquotaImpostoPercent: number = 6.5,
  comissaoVendedorPercent: number = 4.0,
  temParceiroRT: boolean = false,
  comissaoRTPercent: number = 5.0
): number {
  if (custoProjeto <= 0) return 0;

  const taxaMeio = obterTaxaMeioPagamentoPadrao(condicaoPagamento, parcelas) / 100;
  const taxaImposto = aliquotaImpostoPercent / 100;
  const taxaVend = comissaoVendedorPercent / 100;
  const taxaRT = temParceiroRT ? (comissaoRTPercent / 100) : 0;
  const margemAlvo = margemAlvoPercent / 100;

  // Fórmula aproximada de Markup divisor:
  // Preço = Custo / (1 - MargemAlvo - Imposto - TaxaMeio - ComissaoVend - ComissaoRT)
  const divisor = 1 - margemAlvo - taxaImposto - taxaMeio - taxaVend - taxaRT;

  if (divisor <= 0.1) {
    return Number((custoProjeto * 2.5).toFixed(2));
  }

  return Number((custoProjeto / divisor).toFixed(2));
}

// ==============================================================================
// RENDERS EM ALTA RESOLUÇÃO E TEMPLATES DE APRESENTAÇÃO "RENDER PRO"
// ==============================================================================

export const RENDERS_PADRAO_ALTA_QUALIDADE: RenderProAmbienteItem[] = [
  {
    id: 'rnd_cozinha_gourmet',
    url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=1600&auto=format&fit=crop',
    titulo: 'Cozinha Gourmet Integrada',
    ambiente: 'Cozinha & Gourmet',
    descricao: 'Acabamento em MDF Louro Freijó com perfil puxador cava oculta e iluminação LED embutida 3000K.',
    principal: true,
  },
  {
    id: 'rnd_suite_master',
    url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=1600&auto=format&fit=crop',
    titulo: 'Dormitório Suíte Master',
    ambiente: 'Suíte Master',
    descricao: 'Painel ripado sob medida, cabeceira estofada e mesas laterais suspensas com amortecimento soft-close.',
  },
  {
    id: 'rnd_living_tv',
    url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1600&auto=format&fit=crop',
    titulo: 'Living & Home Theater',
    ambiente: 'Sala de Estar',
    descricao: 'Painel de TV em lâmina natural com nicho iluminado e rack suspenso com gavetas telescópicas.',
  },
  {
    id: 'rnd_closet_luxo',
    url: 'https://images.unsplash.com/photo-1558997519-83ea9252def8?q=80&w=1600&auto=format&fit=crop',
    titulo: 'Closet Planejado Iluminado',
    ambiente: 'Closet',
    descricao: 'Portas em perfil de alumínio preto com vidro reflecta fumê e prateleiras com fita LED integrada.',
  },
  {
    id: 'rnd_banheiro_gourmet',
    url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1600&auto=format&fit=crop',
    titulo: 'Gabinete Banheiro Master',
    ambiente: 'Banheiro',
    descricao: 'MDF Naval Ultra resistente à umidade com gavetões com divisores acrílicos organizadores.',
  },
];

export const DIFERENCIAIS_PADRAO_MARCENARIA: string[] = [
  'MDF 100% Primeira Linha com certificação de sustentabilidade FSC',
  'Bordas coladas com tecnologia de Poliuretano PUR (resistência superior à umidade)',
  'Ferragens italianas e alemãs com amortecimento Soft-Close testadas para 100.000 ciclos',
  'Usinagem e furação milimétrica industrial direta do Promob / SketchUp CNC',
  'Garantia de 5 anos de fábrica contra defeitos de fabricação e assistência técnica própria',
  'Equipe própria e uniformizada de montadores especialistas com limpeza pós-obra',
];

/**
 * Cria os dados padrão para apresentação de uma proposta
 */
export function criarApresentacaoPropostaPadrao(
  negocioId: string,
  titulo: string,
  valorVenda: number
): ApresentacaoPropostaData {
  return {
    id: `prop_${Date.now()}`,
    negocioId,
    tituloApresentacao: `Proposta Comercial de Alto Padrão - ${titulo}`,
    subtitulo: 'Projeto de Marcenaria Sob Medida & Arquitetura de Interiores',
    renders: RENDERS_PADRAO_ALTA_QUALIDADE,
    diferenciais: DIFERENCIAIS_PADRAO_MARCENARIA,
    prazosDiasFabricacao: 35,
    prazosDiasMontagem: 7,
    garantiaAnos: 5,
    condicoesExibicao: {
      mostrarValorAVista: true,
      mostrarParcelado: true,
      opcoesParcelamentoTexto: `À vista no PIX com 5% de desconto especial ou parcelado em até 12x no cartão de crédito / boleto bancário da marcenaria.`,
      observacoesComerciais: `Proposta válida por 10 dias corridos. Inclui transporte, içamento e montagem completa no local.`,
    },
    statusProposta: 'apresentada',
    dataApresentacao: new Date().toISOString(),
  };
}
