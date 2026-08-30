import { MaterialEstoque } from '@/types/database';

export interface ItemProjetoParaEstoque {
  descricao: string;
  material?: string;
  acabamento?: string;
  ambiente?: string;
  larguraMm?: number;
  alturaMm?: number;
  profundidadeMm?: number;
  quantidade: number;
  custoUnitario?: number;
}

/**
 * Analisa as peças de um projeto importado (Promob/SketchUp/Manual) e gera
 * automaticamente os insumos e a lista de compras para o Cliente no Estoque.
 */
export function gerarListaMateriaisDoProjeto(params: {
  empresaId: string;
  clienteId: string;
  clienteNome: string;
  projetoId: string;
  projetoNome: string;
  itens: ItemProjetoParaEstoque[];
}): MaterialEstoque[] {
  const { empresaId, clienteId, clienteNome, projetoId, projetoNome, itens } = params;
  const materiaisGerados: MaterialEstoque[] = [];
  const timestamp = new Date().toISOString();

  // 1. Agrupamento de Chapas MDF por padrão/espessura
  const mapChapasMDF: Record<string, { areaM2: number; custoUnit: number; exemploNome: string }> = {};
  let totalPerimetroFitaMetros = 0;
  let totalPortas = 0;
  let totalGavetas = 0;
  let totalModulos = 0;

  itens.forEach(item => {
    const descLower = (item.descricao || '').toLowerCase();
    const matLower = (item.material || '').toLowerCase();
    const acabLower = (item.acabamento || '').toLowerCase();
    const qtd = item.quantidade || 1;

    // Detectar dimensões
    const larg = item.larguraMm || 600;
    const alt = item.alturaMm || 700;
    const areaM2 = ((larg * alt) / 1_000_000) * qtd;

    // Identificar tipo de chapa MDF
    let nomeChapa = 'MDF Branco TX 18mm 2F';
    let custoChapa = 210;

    if (matLower.includes('freijo') || acabLower.includes('freijo') || descLower.includes('freijo')) {
      nomeChapa = 'MDF Louro Freijó 18mm 2F';
      custoChapa = 320;
    } else if (matLower.includes('carvalho') || acabLower.includes('carvalho') || descLower.includes('carvalho')) {
      nomeChapa = 'MDF Carvalho Hanover 18mm';
      custoChapa = 310;
    } else if (matLower.includes('grafite') || matLower.includes('cinza') || acabLower.includes('grafite')) {
      nomeChapa = 'MDF Grafite Matt 18mm';
      custoChapa = 280;
    } else if (matLower.includes('ripado') || descLower.includes('ripado')) {
      nomeChapa = 'MDF Painel Ripado Amadeirado 15mm';
      custoChapa = 340;
    } else if (descLower.includes('fundo') || matLower.includes('6mm') || (item.profundidadeMm && item.profundidadeMm <= 6)) {
      nomeChapa = 'MDF Branco TX 6mm (Fundo)';
      custoChapa = 115;
    } else if (matLower.includes('15mm') || descLower.includes('15mm')) {
      nomeChapa = 'MDF Branco TX 15mm 2F';
      custoChapa = 185;
    } else if (item.material && item.material.trim().length > 2) {
      nomeChapa = `MDF ${item.material} 18mm`;
      custoChapa = 250;
    }

    if (!mapChapasMDF[nomeChapa]) {
      mapChapasMDF[nomeChapa] = { areaM2: 0, custoUnit: custoChapa, exemploNome: nomeChapa };
    }
    mapChapasMDF[nomeChapa].areaM2 += areaM2;

    // Calcular perímetro de fita de borda (aprox 70% dos 4 lados das peças recebem fita)
    const perimetroPecaMetros = (((larg + alt) * 2) / 1000) * 0.75 * qtd;
    totalPerimetroFitaMetros += perimetroPecaMetros;

    // Contabilizar ferragens por tipo de peça
    if (descLower.includes('porta') || descLower.includes('frente') || descLower.includes('basculante')) {
      totalPortas += qtd;
    } else if (descLower.includes('gaveta') || descLower.includes('gaveteiro') || descLower.includes('corredica')) {
      totalGavetas += qtd;
    } else if (descLower.includes('armario') || descLower.includes('balcao') || descLower.includes('modulo') || descLower.includes('nicho')) {
      totalModulos += qtd;
    }
  });

  // Se não detectou módulos específicos, estima pelo volume de itens
  if (totalModulos === 0) totalModulos = Math.max(1, Math.ceil(itens.length / 4));
  if (totalPortas === 0) totalPortas = Math.max(2, Math.ceil(totalModulos * 1.5));
  if (totalGavetas === 0) totalGavetas = Math.max(1, Math.ceil(totalModulos * 0.8));

  let counter = 1;

  // A) Gerar Chapas MDF calculadas com aproveitamento (4.2m² úteis por chapa 2.75x1.83)
  Object.entries(mapChapasMDF).forEach(([nomeChapa, info]) => {
    const numChapas = Math.max(1, Math.ceil(info.areaM2 / 4.2));
    materiaisGerados.push({
      id: `mat_cli_${Date.now()}_${counter}_${Math.random().toString(36).substring(2, 6)}`,
      empresaId,
      codigo: `CHP-${clienteId.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase() || 'CLI'}-${String(counter).padStart(2, '0')}`,
      nome: `${nomeChapa} [Cliente: ${clienteNome}]`,
      categoria: 'chapa_mdf',
      unidade: 'chapa',
      quantidadeEstoque: 0,
      quantidadeNecessaria: numChapas,
      estoqueMinimo: 0,
      custoUnitario: info.custoUnit,
      precoVendaSugerido: Number((info.custoUnit * 2.2).toFixed(2)),
      fornecedor: 'Leo Madeiras / Berneck / Duratex',
      ultimaAtualizacao: timestamp,
      origemTipo: 'projeto_cliente',
      clienteId,
      clienteNome,
      projetoId,
      projetoNome,
      statusCompra: 'necessario',
      observacoes: `Estimativa para o projeto ${projetoNome} (${info.areaM2.toFixed(1)} m² de corte líquido)`,
      dataNecessidade: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
    counter++;
  });

  // B) Gerar Fita de Borda em Metros
  const metrosFita = Math.max(20, Math.ceil(totalPerimetroFitaMetros));
  materiaisGerados.push({
    id: `mat_cli_${Date.now()}_${counter}_${Math.random().toString(36).substring(2, 6)}`,
    empresaId,
    codigo: `FIT-${clienteId.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase() || 'CLI'}-${String(counter).padStart(2, '0')}`,
    nome: `Fita de Borda PVC 22x1mm (Projeto: ${projetoNome})`,
    categoria: 'fita_borda',
    unidade: 'metro',
    quantidadeEstoque: 0,
    quantidadeNecessaria: metrosFita,
    estoqueMinimo: 0,
    custoUnitario: 1.85,
    precoVendaSugerido: 4.10,
    fornecedor: 'Proadec / Rehau',
    ultimaAtualizacao: timestamp,
    origemTipo: 'projeto_cliente',
    clienteId,
    clienteNome,
    projetoId,
    projetoNome,
    statusCompra: 'necessario',
    observacoes: `Total de ${metrosFita} metros lineares para acabamento de topos`,
    dataNecessidade: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });
  counter++;

  // C) Dobradiças com amortecimento (2 a 3 por porta)
  const qtdDobradicas = totalPortas * 2;
  materiaisGerados.push({
    id: `mat_cli_${Date.now()}_${counter}_${Math.random().toString(36).substring(2, 6)}`,
    empresaId,
    codigo: `DOB-${clienteId.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase() || 'CLI'}-${String(counter).padStart(2, '0')}`,
    nome: `Dobradiça Reta 35mm c/ Amortecedor Slow [${clienteNome}]`,
    categoria: 'ferragem',
    unidade: 'peca',
    quantidadeEstoque: 0,
    quantidadeNecessaria: qtdDobradicas,
    estoqueMinimo: 0,
    custoUnitario: 8.50,
    precoVendaSugerido: 18.70,
    fornecedor: 'FGV TN / Hafele / Blum',
    ultimaAtualizacao: timestamp,
    origemTipo: 'projeto_cliente',
    clienteId,
    clienteNome,
    projetoId,
    projetoNome,
    statusCompra: 'necessario',
    observacoes: `${qtdDobradicas} un para ${totalPortas} portas do projeto`,
    dataNecessidade: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });
  counter++;

  // D) Corrediças Telescópicas para gavetas
  if (totalGavetas > 0) {
    materiaisGerados.push({
      id: `mat_cli_${Date.now()}_${counter}_${Math.random().toString(36).substring(2, 6)}`,
      empresaId,
      codigo: `COR-${clienteId.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase() || 'CLI'}-${String(counter).padStart(2, '0')}`,
      nome: `Corrediça Telescópica 450mm Extração Total [${clienteNome}]`,
      categoria: 'ferragem',
      unidade: 'peca',
      quantidadeEstoque: 0,
      quantidadeNecessaria: totalGavetas,
      estoqueMinimo: 0,
      custoUnitario: 32.00,
      precoVendaSugerido: 70.40,
      fornecedor: 'FGV TN / Metalinox',
      ultimaAtualizacao: timestamp,
      origemTipo: 'projeto_cliente',
      clienteId,
      clienteNome,
      projetoId,
      projetoNome,
      statusCompra: 'necessario',
      observacoes: `${totalGavetas} pares de corrediça para gaveteiros`,
      dataNecessidade: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
    counter++;
  }

  // E) Insumos estruturais de montagem e fixação
  materiaisGerados.push({
    id: `mat_cli_${Date.now()}_${counter}_${Math.random().toString(36).substring(2, 6)}`,
    empresaId,
    codigo: `PAR-${clienteId.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase() || 'CLI'}-${String(counter).padStart(2, '0')}`,
    nome: `Kit Parafusos Estruturais (4.0x40 e 3.5x16) + Cantoneiras [${clienteNome}]`,
    categoria: 'insumo',
    unidade: 'peca',
    quantidadeEstoque: 0,
    quantidadeNecessaria: Math.max(1, totalModulos),
    estoqueMinimo: 0,
    custoUnitario: 28.00,
    precoVendaSugerido: 61.60,
    fornecedor: 'Ciser / Jomarca / Leo Madeiras',
    ultimaAtualizacao: timestamp,
    origemTipo: 'projeto_cliente',
    clienteId,
    clienteNome,
    projetoId,
    projetoNome,
    statusCompra: 'necessario',
    observacoes: `Kit de montagem para ${totalModulos} módulos estruturais`,
    dataNecessidade: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  return materiaisGerados;
}
