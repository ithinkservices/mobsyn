// Parser Especializado para OpenCutList (OCL) do SketchUp
// Processa listas de peças, chapas MDF/HDF, fitas de borda, ferragens e cores exportadas pelo OpenCutList (.csv / .txt)

import { ItemOrcamentoOriginal, SketchUp3DComponent, SketchUp3DSceneData } from '@/types/database';

export interface OpenCutListPecaRow {
  numero: string;
  designacao: string;
  quantidade: number;
  comprimentoBrutoMm: number;
  larguraBrutaMm: number;
  espessuraBrutaMm: number;
  comprimentoFinalMm: number;
  larguraFinalMm: number;
  espessuraFinalMm: number;
  areaFinalM2: number;
  tipoMaterial: string;
  nomeMaterial: string;
  materialFormatado: string;
  categoriaMaterial: 'mdf_caixaria' | 'mdf_branco' | 'mdf_frentes' | 'fundo_hdf' | 'ferragem_puxador' | 'ferragem_dobradica' | 'ferragem_geral' | 'madeira_geral';
  descricaoMaterial?: string;
  urlMaterial?: string;
  nomesInstancia?: string;
  descricao?: string;
  bordaC1?: string;
  bordaC2?: string;
  bordaL1?: string;
  bordaL2?: string;
  totalBordasMetros: number;
  frente?: string;
  verso?: string;
  etiquetas?: string;
  corHex: string;
  custoUnitarioEstimado: number;
  custoTotalEstimado: number;
  isFerragem: boolean;
}

export interface ResumoOpenCutList {
  totalPecasMadeira: number;
  totalFerragens: number;
  totalItens: number;
  areaTotalM2: number;
  totalBordasMetros: number;
  custoTotal: number;
  materiaisAgrupados: {
    nome: string;
    cor: string;
    espessuraMm: number;
    quantidadePecas: number;
    areaM2: number;
    chapasEstimadas: number; // base chapa 2.75 x 1.83 (5.03 m²) com 15% perda
    categoria: string;
  }[];
  ferragensAgrupadas: {
    nome: string;
    quantidade: number;
    custoUnitario: number;
    custoTotal: number;
  }[];
}

export interface ResultadoParseOpenCutList {
  sucesso: boolean;
  arquivoNome: string;
  formato: 'csv_opencutlist' | 'txt_opencutlist';
  conversorUtilizado: 'opencutlist_sketchup_parser';
  tamanhoBytes?: number;
  ambientes: string[];
  totalComponentes: number;
  totalInstancias: number;
  custoTotal: number;
  itens: (ItemOrcamentoOriginal & { 
    posicao3d?: { x: number; y: number; z: number }; 
    cor3d?: string; 
    isFerragem?: boolean;
    fitaBordaMetros?: number;
    espessuraMm?: number;
    categoria?: string;
  })[];
  scene3d: SketchUp3DSceneData;
  resumoFabricacao: ResumoOpenCutList;
  rawContent?: string;
  mensagem?: string;
}

/**
 * Exemplo real enviado pelo usuário via OpenCutList do SketchUp
 */
export const EXEMPLO_OPENCUTLIST_CSV_MOVEL = `Nº;Designação;Quantidade;Comprimento - Bruto;Largura - Bruta;Espessura - Bruta;Comprimento;Largura;Espessura;Área - final;Tipo de Material;Nome do Material;Descrição do material;URL do material;Nomes de instância;Descrição;URL;Identificação;Comprimento da Borda 1;Comprimento da Borda 2;Largura da Borda 1;Largura da Borda 2;Frente;Verso;Etiquetas
A;calco_dobradica_direita#1;1;65,00 mm;51,00 mm;18,00 mm;65,00 mm;51,00 mm;18,00 mm;"";Indefinido;<LightGray>;"";"";calco_dobradica_direita copy 001;"";"";"";"";"";"";"";"";"";Layer0
B;calco_dobradica_direita#2;1;65,00 mm;51,00 mm;18,00 mm;65,00 mm;51,00 mm;18,00 mm;"";Indefinido;<LightGray>;"";"";"";"";"";"";"";"";"";"";"";"";Layer0
C;calco_dobradica_esquerda#1;1;65,00 mm;51,00 mm;18,00 mm;65,00 mm;51,00 mm;18,00 mm;"";Indefinido;<LightGray>;"";"";calco_dobradica_esquerda copy 001;"";"";"";"";"";"";"";"";"";Layer0
D;calco_dobradica_esquerda#2;1;65,00 mm;51,00 mm;18,00 mm;65,00 mm;51,00 mm;18,00 mm;"";Indefinido;<LightGray>;"";"";"";"";"";"";"";"";"";"";"";"";Layer0
A;puxador_alca#1;1;128,00 mm;25,00 mm;10,00 mm;128,00 mm;25,00 mm;10,00 mm;"";Indefinido;Metal_Aluminum_Anodized;"";"";puxador_alca copy 001;"";"";"";"";"";"";"";"";"";Layer0
B;puxador_alca#2;1;128,00 mm;25,00 mm;10,00 mm;128,00 mm;25,00 mm;10,00 mm;"";Indefinido;Metal_Aluminum_Anodized;"";"";"";"";"";"";"";"";"";"";"";"";Layer0
C;puxador_alca_gavetas#1;1;128,00 mm;25,00 mm;10,00 mm;128,00 mm;25,00 mm;10,00 mm;"";Indefinido;Metal_Aluminum_Anodized;"";"";"";"";"";"";"";"";"";"";"";"";Layer0
D;puxador_alca_gavetas_b#1;1;128,00 mm;25,00 mm;10,00 mm;128,00 mm;25,00 mm;10,00 mm;"";Indefinido;Metal_Aluminum_Anodized;"";"";"";"";"";"";"";"";"";"";"";"";Layer0
A;lateral_direita_gaveta;1;510,00 mm;125,00 mm;18,00 mm;510,00 mm;125,00 mm;18,00 mm;"";Indefinido;branco;"";"";"";"";"";"";"";"";"";"";"";"";Layer0
B;lateral_direita_gaveta_b;1;510,00 mm;125,00 mm;18,00 mm;510,00 mm;125,00 mm;18,00 mm;"";Indefinido;branco;"";"";"";"";"";"";"";"";"";"";"";"";Layer0
C;lateral_esquerda_gaveta;1;510,00 mm;125,00 mm;18,00 mm;510,00 mm;125,00 mm;18,00 mm;"";Indefinido;branco;"";"";"";"";"";"";"";"";"";"";"";"";Layer0
D;lateral_esquerda_gaveta_b;1;510,00 mm;125,00 mm;18,00 mm;510,00 mm;125,00 mm;18,00 mm;"";Indefinido;branco;"";"";"";"";"";"";"";"";"";"";"";"";Layer0
E;contra_frente_gaveta;1;360,00 mm;120,00 mm;18,00 mm;360,00 mm;120,00 mm;18,00 mm;"";Indefinido;branco;"";"";"";"";"";"";"";"";"";"";"";"";Layer0
F;contra_frente_gaveta_b;1;360,00 mm;120,00 mm;18,00 mm;360,00 mm;120,00 mm;18,00 mm;"";Indefinido;branco;"";"";"";"";"";"";"";"";"";"";"";"";Layer0
G;contra_fundo_gaveta;1;360,00 mm;120,00 mm;18,00 mm;360,00 mm;120,00 mm;18,00 mm;"";Indefinido;branco;"";"";"";"";"";"";"";"";"";"";"";"";Layer0
H;contra_fundo_gaveta_b;1;360,00 mm;120,00 mm;18,00 mm;360,00 mm;120,00 mm;18,00 mm;"";Indefinido;branco;"";"";"";"";"";"";"";"";"";"";"";"";Layer0
I;travessa_traseira;1;900,00 mm;90,00 mm;15,00 mm;900,00 mm;90,00 mm;15,00 mm;"";Indefinido;branco;"";"";"";"";"";"";"";"";"";"";"";"";Layer0
A;base;1;900,00 mm;550,00 mm;18,00 mm;900,00 mm;550,00 mm;18,00 mm;"";Indefinido;carvalho_avela_duratex;"";"";"";"";"";"";"";"";"";"";"";"";Layer0
B;lateral_direita;1;667,00 mm;550,00 mm;18,00 mm;667,00 mm;550,00 mm;18,00 mm;"";Indefinido;carvalho_avela_duratex;"";"";"";"";"";"";"";"";"";"";"";"";Layer0
C;lateral_esquerda;1;667,00 mm;550,00 mm;18,00 mm;667,00 mm;550,00 mm;18,00 mm;"";Indefinido;carvalho_avela_duratex;"";"";"";"";"";"";"";"";"";"";"";"";Layer0
D;divisoria_estrutural;1;667,00 mm;528,30 mm;18,00 mm;667,00 mm;528,30 mm;18,00 mm;"";Indefinido;carvalho_avela_duratex;"";"";"";"";"";"";"";"";"";"";"";"";Layer0
A;travessa_dianteira;1;900,00 mm;70,00 mm;15,00 mm;900,00 mm;70,00 mm;15,00 mm;"";Indefinido;Material;"";"";"";"";"";"";"";"";"";"";"";"";Layer0
B;prateleira;1;488,30 mm;423,00 mm;15,00 mm;488,30 mm;423,00 mm;15,00 mm;"";Indefinido;Material;"";"";"";"";"";"";"";"";"";"";"";"";Layer0
C;prateleira_2;1;488,30 mm;423,00 mm;15,00 mm;488,30 mm;423,00 mm;15,00 mm;"";Indefinido;Material;"";"";"";"";"";"";"";"";"";"";"";"";Layer0
D;fundo;1;879,00 mm;682,00 mm;6,00 mm;879,00 mm;682,00 mm;6,00 mm;"";Indefinido;Material;"";"";"";"";"";"";"";"";"";"";"";"";Layer0
E;fundo_gaveta;1;489,00 mm;375,00 mm;6,00 mm;489,00 mm;375,00 mm;6,00 mm;"";Indefinido;Material;"";"";"";"";"";"";"";"";"";"";"";"";Layer0
F;fundo_gaveta_b;1;489,00 mm;375,00 mm;6,00 mm;489,00 mm;375,00 mm;6,00 mm;"";Indefinido;Material;"";"";"";"";"";"";"";"";"";"";"";"";Layer0
A;porta_direita;1;513,00 mm;444,00 mm;18,00 mm;513,00 mm;444,00 mm;18,00 mm;"";Indefinido;TURGdGV4dHVyYTE2ODE4MjI4Njg0NTc=;"";"";"";"";"";"";"";"";"";"";"";"";Layer0
B;porta_esquerda;1;513,00 mm;444,00 mm;18,00 mm;513,00 mm;444,00 mm;18,00 mm;"";Indefinido;TURGdGV4dHVyYTE2ODE4MjI4Njg0NTc=;"";"";"";"";"";"";"";"";"";"";"";"";Layer0
C;frente_gaveta;1;444,00 mm;137,00 mm;18,00 mm;444,00 mm;137,00 mm;18,00 mm;"";Indefinido;TURGdGV4dHVyYTE2ODE4MjI4Njg0NTc=;"";"";"";"";"";"";"";"";"";"";"";"";Layer0
D;frente_gaveta_b;1;444,00 mm;137,00 mm;18,00 mm;444,00 mm;137,00 mm;18,00 mm;"";Indefinido;TURGdGV4dHVyYTE2ODE4MjI4Njg0NTc=;"";"";"";"";"";"";"";"";"";"";"";"";Layer0`;

/**
 * Converte strings numéricas como "65,00 mm", "528,30 mm", "18.00" para number (float)
 */
export function parseMedidaMm(str: string | undefined): number {
  if (!str) return 0;
  const limpa = str.replace(/mm/gi, '').replace(/\s+/g, '').trim();
  // Se contiver vírgula como decimal
  const normalizada = limpa.replace(/\./g, '').replace(',', '.');
  const num = parseFloat(normalizada);
  return isNaN(num) ? 0 : Number(num.toFixed(2));
}

/**
 * Classificador inteligente de materiais e custos do OpenCutList
 */
export function classificarMaterialOpenCutList(
  designacaoRaw: string,
  nomeMaterialRaw: string,
  espessuraMm: number = 18,
  tipoMaterialRaw?: string
): {
  materialFormatado: string;
  categoria: OpenCutListPecaRow['categoriaMaterial'];
  corHex: string;
  isFerragem: boolean;
  custoUnitarioEstimado: number;
} {
  const pecaLower = (designacaoRaw || '').toLowerCase();
  const matLower = (nomeMaterialRaw || '').toLowerCase();
  const tipoLower = (tipoMaterialRaw || '').toLowerCase();

  // 1. Sapatas, Pés Niveladores e Acessórios
  if (
    pecaLower.includes('sapata') || 
    pecaLower.includes('nivelador') ||
    (tipoLower.includes('acessório') || tipoLower.includes('acessorio')) && matLower.includes('ferrag')
  ) {
    return {
      materialFormatado: 'Sapata Niveladora 20x20mm (Ferragens)',
      categoria: 'ferragem_geral',
      corHex: '#334155',
      isFerragem: true,
      custoUnitarioEstimado: 4.50
    };
  }

  // 2. Ferragens: Calços, Dobradiças, Puxadores, Parafusos, Corrediças
  if (
    pecaLower.includes('calco') || 
    pecaLower.includes('dobradica') || 
    pecaLower.includes('puxador') || 
    pecaLower.includes('corredica') ||
    matLower.includes('aluminum') || 
    matLower.includes('lightgray') || 
    matLower.includes('metal') ||
    tipoLower.includes('acessório') ||
    tipoLower.includes('acessorio') ||
    matLower === 'ferragens'
  ) {
    if (pecaLower.includes('puxador') || matLower.includes('aluminum')) {
      return {
        materialFormatado: 'Puxador Alça Alumínio Anodizado 128mm',
        categoria: 'ferragem_puxador',
        corHex: '#94a3b8',
        isFerragem: true,
        custoUnitarioEstimado: 24.50
      };
    }
    if (pecaLower.includes('calco') || pecaLower.includes('dobradica')) {
      return {
        materialFormatado: 'Calço / Dobradiça Reta 35mm com Amortecedor',
        categoria: 'ferragem_dobradica',
        corHex: '#cbd5e1',
        isFerragem: true,
        custoUnitarioEstimado: 18.90
      };
    }
    return {
      materialFormatado: 'Ferragem / Acessório Especial',
      categoria: 'ferragem_geral',
      corHex: '#94a3b8',
      isFerragem: true,
      custoUnitarioEstimado: 15.00
    };
  }

  // 3. Materiais Madeirados e Cores Específicas do OpenCutList
  if (matLower.includes('areia') || matLower.includes('guararapes')) {
    return {
      materialFormatado: `MDF ${espessuraMm || 18}mm Areia Guararapes`,
      categoria: 'mdf_caixaria',
      corHex: '#d9cdb8', // Tom areia suave Guararapes
      isFerragem: false,
      custoUnitarioEstimado: 78.00
    };
  }

  if (matLower.includes('masisa') || matLower.includes('azul') || matLower.includes('blue')) {
    return {
      materialFormatado: `MDF ${espessuraMm || 18}mm Masisa Azul Real`,
      categoria: 'mdf_frentes',
      corHex: '#2563eb', // Tom azul elegante Masisa
      isFerragem: false,
      custoUnitarioEstimado: 92.00
    };
  }

  if (
    matLower.includes('carvalho') || 
    matLower.includes('avela') || 
    matLower.includes('duratex') || 
    matLower.includes('freijo') ||
    matLower.includes('louro')
  ) {
    const nomeLimpo = nomeMaterialRaw.replace(/_/g, ' ').trim();
    return {
      materialFormatado: `MDF ${espessuraMm || 18}mm ${nomeLimpo}`,
      categoria: 'mdf_caixaria',
      corHex: '#9c683b', // Carvalho Avelã / Freijó quente elegante
      isFerragem: false,
      custoUnitarioEstimado: 85.00
    };
  }

  if (matLower.includes('grafite') || matLower.includes('chumbo')) {
    return {
      materialFormatado: `MDF ${espessuraMm || 18}mm Grafite Matt`,
      categoria: 'mdf_frentes',
      corHex: '#334155',
      isFerragem: false,
      custoUnitarioEstimado: 88.00
    };
  }

  // 4. Gavetas e Travessas Brancas
  if (
    matLower.includes('branco') || 
    (pecaLower.includes('gaveta') && !pecaLower.includes('frente')) ||
    pecaLower.includes('contra_')
  ) {
    return {
      materialFormatado: `MDF ${espessuraMm || 18}mm Branco TX`,
      categoria: 'mdf_branco',
      corHex: '#f1f5f9',
      isFerragem: false,
      custoUnitarioEstimado: 55.00
    };
  }

  // 5. Fundos HDF / MDF 6mm
  if (
    espessuraMm <= 8 || 
    pecaLower.includes('fundo')
  ) {
    return {
      materialFormatado: 'HDF 6mm Revestido 1 Face',
      categoria: 'fundo_hdf',
      corHex: '#e2e8f0',
      isFerragem: false,
      custoUnitarioEstimado: 32.00
    };
  }

  // 6. Nome de Material Customizado no SketchUp
  if (nomeMaterialRaw && nomeMaterialRaw !== 'Indefinido' && !nomeMaterialRaw.startsWith('<')) {
    const nomeFormatado = nomeMaterialRaw.replace(/[_-]/g, ' ').trim();
    return {
      materialFormatado: `MDF ${espessuraMm || 18}mm ${nomeFormatado}`,
      categoria: espessuraMm >= 25 ? 'mdf_caixaria' : 'madeira_geral',
      corHex: '#8b5a2b',
      isFerragem: false,
      custoUnitarioEstimado: 75.00
    };
  }

  // 7. Padrão Geral MDF
  return {
    materialFormatado: `MDF ${espessuraMm || 18}mm Padrão`,
    categoria: 'madeira_geral',
    corHex: '#855838',
    isFerragem: false,
    custoUnitarioEstimado: 65.00
  };
}

/**
 * Mapeia dimensões 3D exatas (nos eixos X=Largura, Y=Altura, Z=Profundidade) e posições espaciais
 * para montar o móvel real perfeitamente alinhado conforme o projeto SketchUp / OpenCutList
 */
function calcularDimensoesEPosicao3DOpenCutList(
  peca: OpenCutListPecaRow,
  index: number
): {
  dimensoes: { larguraMm: number; alturaMm: number; profundidadeMm: number };
  posicao: { x: number; y: number; z: number };
  corHex: string;
  tipo: SketchUp3DComponent['tipo'];
} {
  const pName = peca.designacao.toLowerCase();
  const c = peca.comprimentoFinalMm;
  const l = peca.larguraFinalMm;
  const th = peca.espessuraFinalMm;

  // A. TAMPO DE MESA / BANCADA (ex: tampo#1 1200x550x18)
  if (pName.includes('tampo') || pName.includes('mesa_tampo') || pName === 'mesa') {
    const largTampo = Math.max(c, l);
    const profTampo = Math.min(c, l);
    return {
      dimensoes: { larguraMm: largTampo, alturaMm: th, profundidadeMm: profTampo },
      posicao: { x: 0, y: 720 + (th / 2), z: 0 },
      corHex: peca.corHex || '#2563eb',
      tipo: 'tampo',
    };
  }

  // B. PÉS DE BANCADA / ESCRIVANINHA (ex: pe_esquerda, pe_direita 717x544x18)
  if (pName.includes('pe_') || pName.includes('pé_') || (pName.includes('pe') && (pName.includes('dir') || pName.includes('esq')))) {
    const isEsq = pName.includes('esquerda') || pName.includes('esq');
    const altPe = Math.max(c, l);
    const profPe = Math.min(c, l);
    const posX = isEsq ? -580 : 580;
    return {
      dimensoes: { larguraMm: th, alturaMm: altPe, profundidadeMm: profPe },
      posicao: { x: posX, y: altPe / 2, z: 0 },
      corHex: peca.corHex || '#2563eb',
      tipo: 'modulo_baixo',
    };
  }

  // C. SAIA / PAINEL TRASEIRO DE AMARRAÇÃO (ex: saia 1158x250x18)
  if (pName.includes('saia') || pName.includes('amarra') || pName.includes('painel_traseiro')) {
    const largSaia = Math.max(c, l);
    const altSaia = Math.min(c, l);
    return {
      dimensoes: { larguraMm: largSaia, alturaMm: altSaia, profundidadeMm: th },
      posicao: { x: 0, y: 720 - (altSaia / 2), z: -230 },
      corHex: peca.corHex || '#d9cdb8',
      tipo: 'modulo_baixo',
    };
  }

  // D. SAPATAS NIVELADORAS (ex: sapata#1, sapata#2 20x20x18)
  if (pName.includes('sapata') || pName.includes('nivelador')) {
    const isDir = pName.includes('2') || pName.includes('4') || pName.includes('dir');
    const isFrente = pName.includes('3') || pName.includes('4') || pName.includes('frente');
    return {
      dimensoes: { larguraMm: c, alturaMm: th, profundidadeMm: l },
      posicao: { 
        x: isDir ? 580 : -580, 
        y: th / 2, 
        z: isFrente ? 220 : -220 
      },
      corHex: '#334155',
      tipo: 'outro',
    };
  }

  // 1. BASE INFERIOR DE BALCÃO (900 x 550 x 18 mm)
  if (pName.includes('base') && !pName.includes('gaveta')) {
    return {
      dimensoes: { larguraMm: Math.max(c, l), alturaMm: th, profundidadeMm: Math.min(c, l) },
      posicao: { x: 0, y: th / 2, z: 0 },
      corHex: peca.corHex || '#7c4a27',
      tipo: 'modulo_baixo',
    };
  }

  // 2. LATERAL ESQUERDA DE BALCÃO (667 x 550 x 18 mm)
  if (pName.includes('lateral_esquerda') && !pName.includes('gaveta')) {
    const alturaMovel = Math.max(c, l);
    const profMovel = Math.min(c, l);
    return {
      dimensoes: { larguraMm: th, alturaMm: alturaMovel, profundidadeMm: profMovel },
      posicao: { x: -450 + (th / 2), y: alturaMovel / 2, z: 0 },
      corHex: peca.corHex || '#7c4a27',
      tipo: 'modulo_baixo',
    };
  }

  // 3. LATERAL DIREITA DE BALCÃO (667 x 550 x 18 mm)
  if (pName.includes('lateral_direita') && !pName.includes('gaveta')) {
    const alturaMovel = Math.max(c, l);
    const profMovel = Math.min(c, l);
    return {
      dimensoes: { larguraMm: th, alturaMm: alturaMovel, profundidadeMm: profMovel },
      posicao: { x: 450 - (th / 2), y: alturaMovel / 2, z: 0 },
      corHex: peca.corHex || '#7c4a27',
      tipo: 'modulo_baixo',
    };
  }

  // 4. DIVISÓRIA ESTRUTURAL CENTRAL (667 x 528.3 x 18 mm)
  if (pName.includes('divisoria')) {
    const alturaDiv = Math.max(c, l) - 18;
    const profDiv = Math.min(c, l);
    return {
      dimensoes: { larguraMm: th, alturaMm: alturaDiv, profundidadeMm: profDiv },
      posicao: { x: 0, y: 18 + (alturaDiv / 2), z: -10.85 },
      corHex: peca.corHex || '#7c4a27',
      tipo: 'modulo_baixo',
    };
  }

  // 5. TRAVESSA DIANTEIRA SUPERIOR (900 x 70 x 15 mm)
  if (pName.includes('travessa_dianteira') || pName.includes('travessa_frontal')) {
    return {
      dimensoes: { larguraMm: Math.max(c, l), alturaMm: th, profundidadeMm: Math.min(c, l) },
      posicao: { x: 0, y: 667 - (th / 2), z: 275 - 35 },
      corHex: '#cbd5e1',
      tipo: 'modulo_baixo',
    };
  }

  // 6. TRAVESSA TRASEIRA SUPERIOR (900 x 90 x 15 mm)
  if (pName.includes('travessa_traseira')) {
    return {
      dimensoes: { larguraMm: Math.max(c, l), alturaMm: th, profundidadeMm: Math.min(c, l) },
      posicao: { x: 0, y: 667 - (th / 2), z: -275 + 45 },
      corHex: '#cbd5e1',
      tipo: 'modulo_baixo',
    };
  }

  // 7. FUNDO TRASEIRO DO MÓVEL (879 x 682 x 6 mm)
  if (pName === 'fundo' || pName.includes('fundo_chapa') || pName.includes('fundo_traseiro')) {
    return {
      dimensoes: { larguraMm: Math.max(c, l), alturaMm: Math.min(c, l), profundidadeMm: th || 6 },
      posicao: { x: 0, y: 333.5, z: -275 + 3 },
      corHex: '#e2e8f0',
      tipo: 'painel',
    };
  }

  // 8. PRATELEIRAS REGULÁVEIS (488.3 x 423 x 15 mm)
  if (pName.includes('prateleira')) {
    const isDir = pName.includes('2') || pName.includes('_b') || pName.includes('dir');
    const largPrat = Math.min(c, l);
    const profPrat = Math.max(c, l);
    return {
      dimensoes: { larguraMm: largPrat, alturaMm: th || 15, profundidadeMm: profPrat },
      posicao: { x: isDir ? 220.5 : -220.5, y: 230, z: -10 },
      corHex: '#f1f5f9',
      tipo: 'modulo_baixo',
    };
  }

  // 9. FRENTES DE GAVETA SUPERIORES (444 x 137 x 18 mm)
  if (pName.includes('frente_gaveta')) {
    const isDir = pName.includes('_b') || pName.includes('dir') || pName.includes('2');
    const largFrente = Math.max(c, l);
    const altFrente = Math.min(c, l);
    return {
      dimensoes: { larguraMm: largFrente, alturaMm: altFrente, profundidadeMm: th || 18 },
      posicao: { x: isDir ? 223 : -223, y: 580, z: 275 + 9 },
      corHex: '#d7cbbe',
      tipo: 'gaveteiro',
    };
  }

  // 10. PORTAS INFERIORES (513 x 444 x 18 mm)
  if (pName.includes('porta')) {
    const isDir = pName.includes('direita') || pName.includes('dir') || pName.includes('_b') || pName.includes('2');
    const altPorta = Math.max(c, l);
    const largPorta = Math.min(c, l);
    return {
      dimensoes: { larguraMm: largPorta, alturaMm: altPorta, profundidadeMm: th || 18 },
      posicao: { x: isDir ? 223 : -223, y: 18 + (altPorta / 2), z: 275 + 9 },
      corHex: '#d7cbbe',
      tipo: 'modulo_baixo',
    };
  }

  // 11. PUXADORES HORIZONTAIS DAS GAVETAS
  if (pName.includes('puxador') && pName.includes('gaveta')) {
    const isDir = pName.includes('_b') || pName.includes('2') || pName.includes('dir');
    return {
      dimensoes: { larguraMm: 128, alturaMm: 14, profundidadeMm: 22 },
      posicao: { x: isDir ? 223 : -223, y: 580, z: 284 + 14 },
      corHex: '#475569',
      tipo: 'outro',
    };
  }

  // 12. PUXADORES VERTICAIS DAS PORTAS
  if (pName.includes('puxador')) {
    const isDir = pName.includes('2') || pName.includes('dir') || pName.includes('direita');
    return {
      dimensoes: { larguraMm: 14, alturaMm: 128, profundidadeMm: 22 },
      posicao: { x: isDir ? 45 : -45, y: 470, z: 284 + 14 },
      corHex: '#475569',
      tipo: 'outro',
    };
  }

  // 13. GAVETAS INTERNAS: Laterais
  if (pName.includes('lateral_') && pName.includes('gaveta')) {
    const isDirMovel = pName.includes('_b') || pName.includes('2');
    const isLateralEsq = pName.includes('esquerda');
    const posX = isDirMovel 
      ? (isLateralEsq ? 36 : 405)
      : (isLateralEsq ? -405 : -36);
    return {
      dimensoes: { larguraMm: th || 18, alturaMm: Math.min(c, l), profundidadeMm: Math.max(c, l) },
      posicao: { x: posX, y: 575, z: 10 },
      corHex: '#f1f5f9',
      tipo: 'gaveteiro',
    };
  }

  // 14. GAVETAS INTERNAS: Contra-Frente e Contra-Fundo
  if (pName.includes('contra_frente') || pName.includes('contra_fundo')) {
    const isDirMovel = pName.includes('_b') || pName.includes('2');
    const isFrente = pName.includes('contra_frente');
    return {
      dimensoes: { larguraMm: Math.max(c, l), alturaMm: Math.min(c, l), profundidadeMm: th || 18 },
      posicao: { x: isDirMovel ? 220.5 : -220.5, y: 575, z: isFrente ? 245 : -235 },
      corHex: '#f1f5f9',
      tipo: 'gaveteiro',
    };
  }

  // 15. GAVETAS INTERNAS: Fundo Gaveta
  if (pName.includes('fundo_gaveta')) {
    const isDirMovel = pName.includes('_b') || pName.includes('2');
    return {
      dimensoes: { larguraMm: Math.min(c, l), alturaMm: th || 6, profundidadeMm: Math.max(c, l) },
      posicao: { x: isDirMovel ? 220.5 : -220.5, y: 520, z: 5 },
      corHex: '#e2e8f0',
      tipo: 'gaveteiro',
    };
  }

  // 16. CALÇOS E DOBRADIÇAS
  if (pName.includes('calco') || pName.includes('dobradica')) {
    const isDir = pName.includes('direita') || pName.includes('dir');
    const isInf = pName.includes('#1') || pName.includes('1') || pName.includes('inf');
    return {
      dimensoes: { larguraMm: 65, alturaMm: 51, profundidadeMm: 18 },
      posicao: { x: isDir ? 430 : -430, y: isInf ? 100 : 450, z: 240 },
      corHex: '#cbd5e1',
      tipo: 'outro',
    };
  }

  // Fallback inteligente baseado em proporções
  const dimX = Math.max(c, l);
  const dimY = Math.min(c, l);
  const dimZ = th || 18;

  return {
    dimensoes: { larguraMm: dimX, alturaMm: dimY, profundidadeMm: dimZ },
    posicao: { x: (index - 5) * 60, y: 350, z: 0 },
    corHex: peca.corHex || '#7c4a27',
    tipo: 'outro',
  };
}

/**
 * Parser Principal de CSV / TXT do OpenCutList (OCL) do SketchUp
 */
export function parseOpenCutListCsv(csvContent: string, nomeArquivo: string = 'plano_corte_opencutlist.csv'): ResultadoParseOpenCutList {
  try {
    if (!csvContent || csvContent.trim().length === 0) {
      throw new Error('O arquivo CSV do OpenCutList está vazio.');
    }

    const lines = csvContent
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(l => l.length > 0);

    if (lines.length <= 1) {
      throw new Error('Formato do OpenCutList inválido ou sem dados de peças.');
    }

    // Detecta o delimitador (; ou , ou tab)
    const headerLine = lines[0];
    const delimiter = headerLine.includes(';') ? ';' : headerLine.includes('\t') ? '\t' : ',';
    const headerCols = headerLine.split(delimiter).map(c => c.replace(/^["']|["']$/g, '').trim().toLowerCase());

    // Mapeamento dinâmico de índices das colunas do OpenCutList
    const colIndex = {
      numero: headerCols.findIndex(c => c.includes('nº') || c.includes('num') || c.includes('item')),
      designacao: headerCols.findIndex(c => c.includes('designação') || c.includes('designacao') || c.includes('peça') || c.includes('peca') || c.includes('nome')),
      quantidade: headerCols.findIndex(c => c.includes('quantidade') || c.includes('qtd') || c.includes('qty')),
      comprimentoBruto: headerCols.findIndex(c => c.includes('comprimento - bruto') || c.includes('comp bruto')),
      larguraBruta: headerCols.findIndex(c => c.includes('largura - bruta') || c.includes('larg bruta')),
      espessuraBruta: headerCols.findIndex(c => c.includes('espessura - bruta') || c.includes('esp bruta')),
      comprimento: headerCols.findIndex(c => c === 'comprimento' || c.includes('length')),
      largura: headerCols.findIndex(c => c === 'largura' || c.includes('width')),
      espessura: headerCols.findIndex(c => c === 'espessura' || c.includes('thickness')),
      areaFinal: headerCols.findIndex(c => c.includes('área') || c.includes('area')),
      tipoMaterial: headerCols.findIndex(c => c.includes('tipo de material') || c.includes('material type') || c.includes('tipo')),
      nomeMaterial: headerCols.findIndex(c => c.includes('nome do material') || c.includes('material name') || c === 'material'),
      descricaoMaterial: headerCols.findIndex(c => c.includes('descrição do material') || c.includes('descricao material')),
      instancia: headerCols.findIndex(c => c.includes('nomes de instância') || c.includes('instancia')),
      descricao: headerCols.findIndex(c => c === 'descrição' || c === 'descricao'),
      bordaC1: headerCols.findIndex(c => c.includes('comprimento da borda 1') || c.includes('borda c1')),
      bordaC2: headerCols.findIndex(c => c.includes('comprimento da borda 2') || c.includes('borda c2')),
      bordaL1: headerCols.findIndex(c => c.includes('largura da borda 1') || c.includes('borda l1')),
      bordaL2: headerCols.findIndex(c => c.includes('largura da borda 2') || c.includes('borda l2')),
      etiquetas: headerCols.findIndex(c => c.includes('etiquetas') || c.includes('tags') || c.includes('layer')),
    };

    const pecas: OpenCutListPecaRow[] = [];
    const componentes3D: SketchUp3DComponent[] = [];
    const itensResultado: ResultadoParseOpenCutList['itens'] = [];
    const ambientesSet = new Set<string>();

    let totalInstanciasAcumuladas = 0;
    let custoTotalAcumulado = 0;
    let areaTotalM2Acumulada = 0;
    let totalBordasMetrosAcumulado = 0;
    let countMadeira = 0;
    let countFerragens = 0;

    const materiaisMap = new Map<string, {
      nome: string;
      cor: string;
      espessuraMm: number;
      quantidadePecas: number;
      areaM2: number;
      categoria: string;
    }>();

    const ferragensMap = new Map<string, {
      nome: string;
      quantidade: number;
      custoUnitario: number;
      custoTotal: number;
    }>();

    // Nome base do ambiente a partir do arquivo
    const nomeLimpoArquivo = nomeArquivo
      .replace(/\.(csv|txt|skp|json)$/i, '')
      .replace(/[_-]/g, ' ')
      .replace(/plano corte|opencutlist|export/gi, '')
      .trim();
    const ambientePadrao = nomeLimpoArquivo.length >= 3 ? nomeLimpoArquivo : 'Bancada / Escritório';

    // Processar cada linha do CSV
    for (let i = 1; i < lines.length; i++) {
      const lineStr = lines[i];
      if (!lineStr.trim()) continue;

      const cols = lineStr.split(delimiter).map(c => c.replace(/^["']|["']$/g, '').trim());

      const numVal = colIndex.numero >= 0 ? cols[colIndex.numero] : String(i);
      const desigVal = colIndex.designacao >= 0 ? cols[colIndex.designacao] : cols[1] || `Peça ${i}`;
      const qtdVal = colIndex.quantidade >= 0 ? parseInt(cols[colIndex.quantidade], 10) || 1 : 1;
      
      const compBruto = colIndex.comprimentoBruto >= 0 ? parseMedidaMm(cols[colIndex.comprimentoBruto]) : 0;
      const largBruta = colIndex.larguraBruta >= 0 ? parseMedidaMm(cols[colIndex.larguraBruta]) : 0;
      const espBruta = colIndex.espessuraBruta >= 0 ? parseMedidaMm(cols[colIndex.espessuraBruta]) : 0;

      const compFinal = colIndex.comprimento >= 0 ? parseMedidaMm(cols[colIndex.comprimento]) : (compBruto || 600);
      const largFinal = colIndex.largura >= 0 ? parseMedidaMm(cols[colIndex.largura]) : (largBruta || 400);
      const espFinal = colIndex.espessura >= 0 ? parseMedidaMm(cols[colIndex.espessura]) : (espBruta || 18);

      const tipoMatRaw = colIndex.tipoMaterial >= 0 ? cols[colIndex.tipoMaterial] : '';
      const matRaw = colIndex.nomeMaterial >= 0 ? cols[colIndex.nomeMaterial] : (cols[11] || 'MDF Padrão');
      const etiquetaRaw = colIndex.etiquetas >= 0 ? cols[colIndex.etiquetas] : '';

      const ambiente = etiquetaRaw && etiquetaRaw !== 'Layer0' && etiquetaRaw !== 'Untagged' 
        ? etiquetaRaw 
        : ambientePadrao;
      ambientesSet.add(ambiente);

      // Classificação inteligente de material
      const classif = classificarMaterialOpenCutList(desigVal, matRaw, espFinal, tipoMatRaw);

      // Para chapas de marcenaria, comprimento é a maior dimensão, largura a menor
      const compCorte = classif.isFerragem ? compFinal : Math.max(compFinal, largFinal);
      const largCorte = classif.isFerragem ? largFinal : Math.min(compFinal, largFinal);

      const areaM2Item = Number(((compCorte * largCorte) / 1000000).toFixed(4));
      const areaTotalItem = Number((areaM2Item * qtdVal).toFixed(4));

      // Cálculo de fita de borda
      const bC1 = colIndex.bordaC1 >= 0 ? cols[colIndex.bordaC1] : '';
      const bC2 = colIndex.bordaC2 >= 0 ? cols[colIndex.bordaC2] : '';
      const bL1 = colIndex.bordaL1 >= 0 ? cols[colIndex.bordaL1] : '';
      const bL2 = colIndex.bordaL2 >= 0 ? cols[colIndex.bordaL2] : '';

      let bordasMetros = 0;
      if (bC1) bordasMetros += compCorte / 1000;
      if (bC2) bordasMetros += compCorte / 1000;
      if (bL1) bordasMetros += largCorte / 1000;
      if (bL2) bordasMetros += largCorte / 1000;

      // Se não especificado no CSV mas for peça externa, estima fitas de borda nos topos visíveis
      if (bordasMetros === 0 && !classif.isFerragem) {
        if (desigVal.toLowerCase().includes('tampo') || desigVal.toLowerCase().includes('porta') || desigVal.toLowerCase().includes('frente')) {
          bordasMetros = ((compCorte * 2) + (largCorte * 2)) / 1000; // 4 lados
        } else if (desigVal.toLowerCase().includes('pe') || desigVal.toLowerCase().includes('lateral') || desigVal.toLowerCase().includes('saia')) {
          bordasMetros = (compCorte + largCorte) / 1000; // 2 lados visíveis
        }
      }

      const totalBordaItem = Number((bordasMetros * qtdVal).toFixed(2));
      totalBordasMetrosAcumulado += totalBordaItem;

      // Custo Real Calculado
      let custoUnitario = classif.custoUnitarioEstimado;
      if (!classif.isFerragem) {
        const custoM2Base = espFinal === 6 ? 45 : espFinal === 15 ? 75 : 95;
        const custoFitaMetro = 3.50;
        custoUnitario = Number((areaM2Item * custoM2Base + bordasMetros * custoFitaMetro + 12).toFixed(2));
      }
      const custoTotalItem = Number((custoUnitario * qtdVal).toFixed(2));

      custoTotalAcumulado += custoTotalItem;
      totalInstanciasAcumuladas += qtdVal;

      if (classif.isFerragem) {
        countFerragens += qtdVal;
        const currF = ferragensMap.get(classif.materialFormatado) || {
          nome: classif.materialFormatado,
          quantidade: 0,
          custoUnitario,
          custoTotal: 0
        };
        currF.quantidade += qtdVal;
        currF.custoTotal = Number((currF.custoTotal + custoTotalItem).toFixed(2));
        ferragensMap.set(classif.materialFormatado, currF);
      } else {
        countMadeira += qtdVal;
        areaTotalM2Acumulada += areaTotalItem;
        const currM = materiaisMap.get(classif.materialFormatado) || {
          nome: classif.materialFormatado,
          cor: classif.corHex,
          espessuraMm: espFinal,
          quantidadePecas: 0,
          areaM2: 0,
          categoria: classif.categoria
        };
        currM.quantidadePecas += qtdVal;
        currM.areaM2 = Number((currM.areaM2 + areaTotalItem).toFixed(3));
        materiaisMap.set(classif.materialFormatado, currM);
      }

      const pecaRow: OpenCutListPecaRow = {
        numero: numVal,
        designacao: desigVal,
        quantidade: qtdVal,
        comprimentoBrutoMm: compBruto || compFinal,
        larguraBrutaMm: largBruta || largFinal,
        espessuraBrutaMm: espBruta || espFinal,
        comprimentoFinalMm: compFinal,
        larguraFinalMm: largFinal,
        espessuraFinalMm: espFinal,
        areaFinalM2: areaM2Item,
        tipoMaterial: tipoMatRaw || (classif.isFerragem ? 'Acessório' : 'Chapa'),
        nomeMaterial: matRaw,
        materialFormatado: classif.materialFormatado,
        categoriaMaterial: classif.categoria,
        totalBordasMetros: totalBordaItem,
        corHex: classif.corHex,
        custoUnitarioEstimado: custoUnitario,
        custoTotalEstimado: custoTotalItem,
        isFerragem: classif.isFerragem
      };
      pecas.push(pecaRow);

      // Calcular Dimensões e Posição 3D Paramétrica do Móvel
      const geom3d = calcularDimensoesEPosicao3DOpenCutList(pecaRow, i);
      const codigoUnico = `OCL-${String(i).padStart(3, '0')}`;

      // Formata descrição limpa (ex: "tampo#1" -> "Tampo 1", "pe_direita" -> "Pé Direito", "saia" -> "Saia")
      const descricaoFormatada = desigVal
        .replace(/_/g, ' ')
        .replace(/#/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase())
        .trim();

      componentes3D.push({
        id: `ocl_comp_${i}_${Date.now()}`,
        codigo: codigoUnico,
        nome: descricaoFormatada,
        ambiente,
        dimensoes: geom3d.dimensoes,
        posicao: geom3d.posicao,
        cor: geom3d.corHex || classif.corHex,
        material: classif.materialFormatado,
        tipo: geom3d.tipo
      });

      itensResultado.push({
        codigo: codigoUnico,
        descricao: descricaoFormatada,
        ambiente,
        larguraMm: compCorte,
        alturaMm: largCorte,
        profundidadeMm: espFinal,
        material: classif.materialFormatado,
        acabamento: classif.isFerragem ? 'Niquelado / Aço Polímero' : (totalBordaItem > 0 ? `Fita PVC 1.0mm (${totalBordaItem}m)` : 'Fita PVC 1.0mm'),
        quantidade: qtdVal,
        custoUnitario,
        custoTotal: custoTotalItem,
        posicao3d: geom3d.posicao,
        cor3d: geom3d.corHex || classif.corHex,
        isFerragem: classif.isFerragem,
        fitaBordaMetros: totalBordaItem,
        espessuraMm: espFinal,
        categoria: classif.categoria
      });
    }

    const materiaisAgrupados = Array.from(materiaisMap.values()).map(m => {
      const areaUtilChapa = 5.03 * 0.82;
      const chapasEstimadas = Math.max(1, Math.ceil(m.areaM2 / areaUtilChapa));
      return {
        ...m,
        chapasEstimadas
      };
    });

    const ferragensAgrupadas = Array.from(ferragensMap.values());
    const ambientes = Array.from(ambientesSet);
    if (ambientes.length === 0) ambientes.push(ambientePadrao);

    const resumoFabricacao: ResumoOpenCutList = {
      totalPecasMadeira: countMadeira,
      totalFerragens: countFerragens,
      totalItens: totalInstanciasAcumuladas,
      areaTotalM2: Number(areaTotalM2Acumulada.toFixed(3)),
      totalBordasMetros: Number(totalBordasMetrosAcumulado.toFixed(2)),
      custoTotal: Number(custoTotalAcumulado.toFixed(2)),
      materiaisAgrupados,
      ferragensAgrupadas
    };

    return {
      sucesso: true,
      arquivoNome: nomeArquivo,
      formato: 'csv_opencutlist',
      conversorUtilizado: 'opencutlist_sketchup_parser',
      tamanhoBytes: csvContent.length,
      ambientes,
      totalComponentes: itensResultado.length,
      totalInstancias: totalInstanciasAcumuladas,
      custoTotal: Number(custoTotalAcumulado.toFixed(2)),
      itens: itensResultado,
      scene3d: {
        components: componentes3D,
        ambienteNome: ambientes[0],
      },
      resumoFabricacao,
      rawContent: csvContent,
      mensagem: `Importação do OpenCutList concluída! ${itensResultado.length} peças processadas com sucesso.`,
    };
  } catch (err: any) {
    return {
      sucesso: false,
      arquivoNome: nomeArquivo,
      formato: 'csv_opencutlist',
      conversorUtilizado: 'opencutlist_sketchup_parser',
      ambientes: [],
      totalComponentes: 0,
      totalInstancias: 0,
      custoTotal: 0,
      itens: [],
      scene3d: { components: [] },
      resumoFabricacao: {
        totalPecasMadeira: 0,
        totalFerragens: 0,
        totalItens: 0,
        areaTotalM2: 0,
        totalBordasMetros: 0,
        custoTotal: 0,
        materiaisAgrupados: [],
        ferragensAgrupadas: [],
      },
      mensagem: `Falha ao ler arquivo CSV do OpenCutList: ${err?.message || 'Arquivo inválido'}`,
    };
  }
}
