// ==============================================================================
// MOTOR DE DIFF & COMPARAÇÃO DE REVISÕES DE PROJETO (PROMOB & SKETCHUP)
// ==============================================================================

import { 
  ItemOrcamentoOriginal, 
  ItemOrcamento, 
  ItemDiffComparacao, 
  ResumoDiffRevisao,
  TipoAlteracaoItemDiff 
} from '@/types/database';

export interface ItemGenericoParaDiff {
  codigo: string;
  descricao: string;
  ambiente: string;
  larguraMm: number;
  alturaMm: number;
  profundidadeMm: number;
  material?: string;
  acabamento?: string;
  quantidade: number;
  custoUnitario: number;
  custoTotal: number;
  precoVenda?: number;
}

/**
 * Normaliza qualquer formato de item (ItemOrcamento, ItemOrcamentoOriginal ou objeto similar)
 * para a interface genérica de comparação.
 */
export function normalizarItemParaDiff(item: ItemOrcamento | ItemOrcamentoOriginal | any): ItemGenericoParaDiff {
  const larguraMm = item.medidas?.larguraMm ?? item.larguraMm ?? 0;
  const alturaMm = item.medidas?.alturaMm ?? item.alturaMm ?? 0;
  const profundidadeMm = item.medidas?.profundidadeMm ?? item.profundidadeMm ?? 0;
  const quantidade = item.quantidade ?? 1;
  const custoUnitario = item.custoUnitario ?? 0;
  const custoTotal = item.custoTotal ?? (custoUnitario * quantidade);

  return {
    codigo: (item.codigo || 'SEM-CODIGO').trim(),
    descricao: (item.descricao || 'Item sem descrição').trim(),
    ambiente: (item.ambiente || 'Geral').trim(),
    larguraMm: Math.round(Number(larguraMm) || 0),
    alturaMm: Math.round(Number(alturaMm) || 0),
    profundidadeMm: Math.round(Number(profundidadeMm) || 0),
    material: item.material || 'MDF 18mm',
    acabamento: item.acabamento || '',
    quantidade: Math.max(1, Number(quantidade) || 1),
    custoUnitario: Number(custoUnitario) || 0,
    custoTotal: Number(custoTotal) || (Number(custoUnitario) * Number(quantidade)),
    precoVenda: item.precoVenda,
  };
}

/**
 * Cria uma chave única estável para pareamento de peças entre revisões.
 * Combina Ambiente e Código para evitar colisões entre cômodos diferentes.
 */
function gerarChavePareamento(item: ItemGenericoParaDiff, indiceOcorrencia: number = 0): string {
  const amb = item.ambiente.toLowerCase().replace(/\s+/g, '_');
  const cod = item.codigo.toUpperCase().replace(/\s+/g, '');
  return `${amb}::${cod}::${indiceOcorrencia}`;
}

/**
 * Executa o cálculo determinístico de Diff entre a lista de itens Original (Base)
 * e a lista de itens Revisada (Nova versão após medição ou alteração).
 */
export function calcularDiffRevisaoProjeto(
  itensOriginaisRaw: (ItemOrcamento | ItemOrcamentoOriginal)[],
  itensRevisadosRaw: (ItemOrcamento | ItemOrcamentoOriginal)[]
): {
  itensDiff: ItemDiffComparacao[];
  resumo: ResumoDiffRevisao;
  itensPorAmbiente: Record<string, ItemDiffComparacao[]>;
} {
  const originais = (itensOriginaisRaw || []).map(normalizarItemParaDiff);
  const revisados = (itensRevisadosRaw || []).map(normalizarItemParaDiff);

  // Mapeamento das ocorrências originais para pareamento preciso
  const contagemCodigosOriginais = new Map<string, number>();
  const mapOriginais = new Map<string, ItemGenericoParaDiff>();

  originais.forEach((item) => {
    const baseKey = `${item.ambiente.toLowerCase()}::${item.codigo.toUpperCase()}`;
    const count = contagemCodigosOriginais.get(baseKey) || 0;
    const key = `${baseKey}::${count}`;
    contagemCodigosOriginais.set(baseKey, count + 1);
    mapOriginais.set(key, item);
  });

  const contagemCodigosRevisados = new Map<string, number>();
  const chavesRevisadasUsadas = new Set<string>();
  const itensDiff: ItemDiffComparacao[] = [];

  let totalPecasOriginal = 0;
  let totalPecasRevisado = 0;
  let custoTotalOriginal = 0;
  let custoTotalRevisado = 0;

  originais.forEach(it => {
    totalPecasOriginal += it.quantidade;
    custoTotalOriginal += it.custoTotal;
  });

  revisados.forEach(it => {
    totalPecasRevisado += it.quantidade;
    custoTotalRevisado += it.custoTotal;
  });

  // 1. Processar todos os itens da Nova Versão (Detecta Modificados, Inalterados e Adicionados)
  revisados.forEach((itemRevisado) => {
    const baseKey = `${itemRevisado.ambiente.toLowerCase()}::${itemRevisado.codigo.toUpperCase()}`;
    const count = contagemCodigosRevisados.get(baseKey) || 0;
    const key = `${baseKey}::${count}`;
    contagemCodigosRevisados.set(baseKey, count + 1);
    chavesRevisadasUsadas.add(key);

    const itemOriginal = mapOriginais.get(key);

    if (!itemOriginal) {
      // Peça Adicionada
      itensDiff.push({
        codigo: itemRevisado.codigo,
        descricao: itemRevisado.descricao,
        ambiente: itemRevisado.ambiente,
        tipo: 'adicionado',
        itemRevisado: { ...itemRevisado },
        diferencasDetalhadas: {
          dimensaoAlterada: false,
          quantidadeAlterada: false,
          custoAlterado: false,
          materialAlterado: false,
          diffQuantidade: itemRevisado.quantidade,
          diffCustoTotal: itemRevisado.custoTotal,
          descricaoAlteracoes: ['Nova peça inserida no projeto'],
        },
      });
    } else {
      // Comparação detalhada entre Original e Revisado
      const diffLargura = itemRevisado.larguraMm - itemOriginal.larguraMm;
      const diffAltura = itemRevisado.alturaMm - itemOriginal.alturaMm;
      const diffProf = itemRevisado.profundidadeMm - itemOriginal.profundidadeMm;
      const diffQtd = itemRevisado.quantidade - itemOriginal.quantidade;
      const diffCusto = itemRevisado.custoTotal - itemOriginal.custoTotal;

      const dimensaoAlterada = diffLargura !== 0 || diffAltura !== 0 || diffProf !== 0;
      const quantidadeAlterada = diffQtd !== 0;
      const custoAlterado = Math.abs(diffCusto) > 0.01;
      const materialAlterado = (itemRevisado.material || '') !== (itemOriginal.material || '');

      const alteracoesTextuais: string[] = [];

      if (dimensaoAlterada) {
        const partesDim: string[] = [];
        if (diffLargura !== 0) partesDim.push(`Largura: ${itemOriginal.larguraMm} → ${itemRevisado.larguraMm}mm (${diffLargura > 0 ? '+' : ''}${diffLargura}mm)`);
        if (diffAltura !== 0) partesDim.push(`Altura: ${itemOriginal.alturaMm} → ${itemRevisado.alturaMm}mm (${diffAltura > 0 ? '+' : ''}${diffAltura}mm)`);
        if (diffProf !== 0) partesDim.push(`Prof: ${itemOriginal.profundidadeMm} → ${itemRevisado.profundidadeMm}mm (${diffProf > 0 ? '+' : ''}${diffProf}mm)`);
        alteracoesTextuais.push(`Dimensões ajustadas: ${partesDim.join(', ')}`);
      }

      if (quantidadeAlterada) {
        alteracoesTextuais.push(`Quantidade: ${itemOriginal.quantidade} → ${itemRevisado.quantidade} (${diffQtd > 0 ? '+' : ''}${diffQtd})`);
      }

      if (materialAlterado) {
        alteracoesTextuais.push(`Material: "${itemOriginal.material}" → "${itemRevisado.material}"`);
      }

      if (custoAlterado) {
        alteracoesTextuais.push(`Custo Total: R$ ${itemOriginal.custoTotal.toFixed(2)} → R$ ${itemRevisado.custoTotal.toFixed(2)} (${diffCusto > 0 ? '+' : ''}R$ ${diffCusto.toFixed(2)})`);
      }

      const isModificado = dimensaoAlterada || quantidadeAlterada || custoAlterado || materialAlterado;
      const tipo: TipoAlteracaoItemDiff = isModificado ? 'modificado' : 'inalterado';

      itensDiff.push({
        codigo: itemRevisado.codigo,
        descricao: itemRevisado.descricao,
        ambiente: itemRevisado.ambiente,
        tipo,
        itemOriginal: { ...itemOriginal },
        itemRevisado: { ...itemRevisado },
        diferencasDetalhadas: {
          dimensaoAlterada,
          quantidadeAlterada,
          custoAlterado,
          materialAlterado,
          diffLarguraMm: diffLargura,
          diffAlturaMm: diffAltura,
          diffProfundidadeMm: diffProf,
          diffQuantidade: diffQtd,
          diffCustoTotal: diffCusto,
          descricaoAlteracoes: isModificado ? alteracoesTextuais : ['Sem alterações geométricas ou comerciais'],
        },
      });
    }
  });

  // 2. Processar itens removidos (Estavam na Original mas não estão na Revisada)
  mapOriginais.forEach((itemOriginal, key) => {
    if (!chavesRevisadasUsadas.has(key)) {
      itensDiff.push({
        codigo: itemOriginal.codigo,
        descricao: itemOriginal.descricao,
        ambiente: itemOriginal.ambiente,
        tipo: 'removido',
        itemOriginal: { ...itemOriginal },
        diferencasDetalhadas: {
          dimensaoAlterada: false,
          quantidadeAlterada: false,
          custoAlterado: false,
          materialAlterado: false,
          diffQuantidade: -itemOriginal.quantidade,
          diffCustoTotal: -itemOriginal.custoTotal,
          descricaoAlteracoes: ['Peça removida / excluída na revisão'],
        },
      });
    }
  });

  // 3. Contabilização do Resumo
  let itensAdicionados = 0;
  let itensRemovidos = 0;
  let itensModificados = 0;
  let itensInalterados = 0;

  itensDiff.forEach((item) => {
    if (item.tipo === 'adicionado') itensAdicionados++;
    else if (item.tipo === 'removido') itensRemovidos++;
    else if (item.tipo === 'modificado') itensModificados++;
    else if (item.tipo === 'inalterado') itensInalterados++;
  });

  const variacaoCustoReais = Number((custoTotalRevisado - custoTotalOriginal).toFixed(2));
  const variacaoCustoPercent = custoTotalOriginal > 0 
    ? Number(((variacaoCustoReais / custoTotalOriginal) * 100).toFixed(2))
    : 0;

  const resumo: ResumoDiffRevisao = {
    totalItensOriginal: originais.length,
    totalItensRevisado: revisados.length,
    totalPecasOriginal,
    totalPecasRevisado,
    custoTotalOriginal: Number(custoTotalOriginal.toFixed(2)),
    custoTotalRevisado: Number(custoTotalRevisado.toFixed(2)),
    variacaoCustoReais,
    variacaoCustoPercent,
    itensAdicionados,
    itensRemovidos,
    itensModificados,
    itensInalterados,
  };

  // Agrupamento por ambiente
  const itensPorAmbiente: Record<string, ItemDiffComparacao[]> = {};
  itensDiff.forEach((item) => {
    const amb = item.ambiente || 'Geral';
    if (!itensPorAmbiente[amb]) itensPorAmbiente[amb] = [];
    itensPorAmbiente[amb].push(item);
  });

  return {
    itensDiff,
    resumo,
    itensPorAmbiente,
  };
}

/**
 * Mock generator para simular uma revisão com medição técnica in-loco (para demonstração imediata em 1 clique)
 */
export function gerarMockRevisaoMedicaoTecnica(itensAtuais: (ItemOrcamento | ItemOrcamentoOriginal)[]): {
  itensRevisados: ItemOrcamentoOriginal[];
  motivo: string;
} {
  const norm = itensAtuais.map(normalizarItemParaDiff);
  const revisados: ItemOrcamentoOriginal[] = [];

  norm.forEach((it, idx) => {
    // Caso 1: Item 1 tem redução de 30mm na largura para ajuste de prumo de alvenaria
    if (idx === 0) {
      revisados.push({
        codigo: it.codigo,
        descricao: `${it.descricao} (Ajuste Fino de Parede)`,
        ambiente: it.ambiente,
        larguraMm: Math.max(100, it.larguraMm - 35),
        alturaMm: it.alturaMm,
        profundidadeMm: it.profundidadeMm,
        material: it.material || 'MDF 18mm',
        acabamento: it.acabamento || 'Fita 1.0mm',
        quantidade: it.quantidade,
        custoUnitario: Number((it.custoUnitario * 0.98).toFixed(2)),
        custoTotal: Number((it.custoUnitario * 0.98 * it.quantidade).toFixed(2)),
      });
    } 
    // Caso 2: Remove o último item se houver mais de 3 itens
    else if (idx === norm.length - 1 && norm.length > 3) {
      // Não adiciona (simula remoção de peça conflitante com hidráulica/elétrica)
    }
    // Caso 3: Modifica a altura do segundo item para compatibilização de teto de gesso rebaixado
    else if (idx === 1) {
      revisados.push({
        codigo: it.codigo,
        descricao: it.descricao,
        ambiente: it.ambiente,
        larguraMm: it.larguraMm,
        alturaMm: Math.max(100, it.alturaMm - 50),
        profundidadeMm: it.profundidadeMm,
        material: it.material || 'MDF 18mm',
        acabamento: it.acabamento || 'Fita 1.0mm',
        quantidade: it.quantidade,
        custoUnitario: it.custoUnitario,
        custoTotal: it.custoTotal,
      });
    }
    // Caso 4: Mantém inalterado
    else {
      revisados.push({
        codigo: it.codigo,
        descricao: it.descricao,
        ambiente: it.ambiente,
        larguraMm: it.larguraMm,
        alturaMm: it.alturaMm,
        profundidadeMm: it.profundidadeMm,
        material: it.material || 'MDF 18mm',
        acabamento: it.acabamento || 'Fita 1.0mm',
        quantidade: it.quantidade,
        custoUnitario: it.custoUnitario,
        custoTotal: it.custoTotal,
      });
    }
  });

  // Adiciona 1 nova peça (ex: Fechamento Superior de Acabamento em Gesso / Perfil de LED)
  const ambPrincipal = norm[0]?.ambiente || 'Cozinha';
  revisados.push({
    codigo: `FECH-SUP-${Math.floor(100 + Math.random() * 900)}`,
    descricao: 'Painel de Fechamento Superior e Testeira de Gesso com Fita LED Embutida',
    ambiente: ambPrincipal,
    larguraMm: 2400,
    alturaMm: 120,
    profundidadeMm: 18,
    material: 'MDF 18mm com Perfil Alumínio LED',
    acabamento: 'Laca Acetinada',
    quantidade: 1,
    custoUnitario: 380,
    custoTotal: 380,
  });

  return {
    itensRevisados: revisados,
    motivo: 'Ajuste pós medição técnica in-loco (desconto de 35mm em alvenaria e adição de fechamento de gesso com LED)',
  };
}
