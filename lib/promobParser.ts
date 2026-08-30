// Parser Especializado para Exportações Promob (XML e TXT)
// Compatível com Promob Cut Pro, Promob Plus, Promob Studio e Promob Builder

export interface ItemPromobParsed {
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

export interface ResultadoParsePromob {
  sucesso: boolean;
  arquivoNome: string;
  formato: 'xml' | 'txt';
  tamanhoBytes: number;
  ambientes: string[];
  totalItens: number;
  totalPecas: number;
  custoTotal: number;
  itens: ItemPromobParsed[];
  rawContent: string;
  mensagem?: string;
}

// Exemplos realistas de arquivos de exportação do Promob para testes imediatos
export const EXEMPLO_PROMOB_XML = `<?xml version="1.0" encoding="utf-8"?>
<PROMOB_EXPORTACAO_ORCAMENTO VERSAO="2026.1" GERADO_EM="2026-08-16T10:00:00" SOFTWARE="Promob Plus Professional">
  <PROJETO NOME="Residencial Alpha - Apto 802">
    <CLIENTE NOME="Cliente Promob" />
    <AMBIENTES>
      <AMBIENTE ID="AMB_01" NOME="Cozinha Gourmet">
        <ITENS>
          <ITEM CODIGO="CX-BAL-01" DESCRICAO="Módulo Balcão Pia 2 Portas" LARGURA="1200" ALTURA="860" PROFUNDIDADE="580" MATERIAL="MDF 18mm Branco Tx" ACABAMENTO="Fita PVC 1.0mm" QUANTIDADE="1" CUSTO_UNITARIO="485.50" />
          <ITEM CODIGO="CX-AER-02" DESCRICAO="Armário Aéreo Basculante Vidro Reflecta" LARGURA="1200" ALTURA="420" PROFUNDIDADE="350" MATERIAL="MDF 18mm Louro Freijó" ACABAMENTO="Fita PVC 1.0mm + Perfil Alumínio" QUANTIDADE="2" CUSTO_UNITARIO="380.00" />
          <ITEM CODIGO="CX-TOR-03" DESCRICAO="Torre Quente Forno + Micro-ondas" LARGURA="700" ALTURA="2200" PROFUNDIDADE="600" MATERIAL="MDF 18mm Louro Freijó" ACABAMENTO="Fita PVC 1.0mm" QUANTIDADE="1" CUSTO_UNITARIO="720.00" />
          <ITEM CODIGO="CX-ILH-04" DESCRICAO="Balcão Ilha Central com Gavetões" LARGURA="1600" ALTURA="900" PROFUNDIDADE="800" MATERIAL="MDF 18mm Grafite Matt" ACABAMENTO="Fita PVC 1.0mm" QUANTIDADE="1" CUSTO_UNITARIO="890.00" />
          <ITEM CODIGO="PN-RIP-05" DESCRICAO="Painel Ripado Revestimento Ilha" LARGURA="1600" ALTURA="880" PROFUNDIDADE="25" MATERIAL="MDF 15mm Louro Freijó" ACABAMENTO="Ripas 30mm Usinadas" QUANTIDADE="1" CUSTO_UNITARIO="310.00" />
        </ITENS>
      </AMBIENTE>
      <AMBIENTE ID="AMB_02" NOME="Dormitório &amp; Closet Master">
        <ITENS>
          <ITEM CODIGO="ARM-CLS-01" DESCRICAO="Módulo Closet Cabideiro Duplo Iluminado" LARGURA="1000" ALTURA="2400" PROFUNDIDADE="560" MATERIAL="MDF 18mm Carvalho Hanover" ACABAMENTO="Fita PVC 1.0mm + Perfil LED" QUANTIDADE="2" CUSTO_UNITARIO="640.00" />
          <ITEM CODIGO="ARM-CLS-02" DESCRICAO="Módulo Gaveteiro Closet 4 Gavetas com Corrediça Oculta" LARGURA="800" ALTURA="900" PROFUNDIDADE="520" MATERIAL="MDF 18mm Carvalho Hanover" ACABAMENTO="Fita PVC 1.0mm" QUANTIDADE="2" CUSTO_UNITARIO="430.00" />
          <ITEM CODIGO="CAM-CAB-03" DESCRICAO="Painel Cabeceira Cama King com Frisos" LARGURA="2800" ALTURA="1300" PROFUNDIDADE="36" MATERIAL="MDF 18mm Areia Matt" ACABAMENTO="Fita PVC 1.0mm" QUANTIDADE="1" CUSTO_UNITARIO="590.00" />
          <ITEM CODIGO="CRI-SUS-04" DESCRICAO="Mesa de Cabeceira Suspensa 1 Gaveta" LARGURA="550" ALTURA="250" PROFUNDIDADE="400" MATERIAL="MDF 18mm Areia Matt" ACABAMENTO="Fita PVC 1.0mm" QUANTIDADE="2" CUSTO_UNITARIO="165.00" />
        </ITENS>
      </AMBIENTE>
    </AMBIENTES>
  </PROJETO>
</PROMOB_EXPORTACAO_ORCAMENTO>`;

export const EXEMPLO_PROMOB_TXT = `# RELATORIO DE MATERIAIS E PECAS PROMOB CUT PRO
# EXPORTADO EM: 16/08/2026 10:15:32
# SOFTWARE: Promob Cut Pro v2026
# AMBIENTE;CODIGO;DESCRICAO;LARGURA_MM;ALTURA_MM;PROFUNDIDADE_MM;MATERIAL;ACABAMENTO;QUANTIDADE;CUSTO_UNITARIO
Sala de Estar & Home;HOM-PN-01;Painel Home Theater Ripado com Passa-Fios;2600;2400;50;MDF 18mm Nogueira Cadiz;Ripas 45mm;1;850.00
Sala de Estar & Home;HOM-RAC-02;Rack Suspenso 3 Portas Basculantes;2600;350;450;MDF 18mm Cinza Sagrado;Fita PVC 1.0mm;1;620.00
Sala de Estar & Home;HOM-EST-03;Prateleira Superior com Iluminação LED;2000;50;250;MDF 25mm Nogueira Cadiz;Fita PVC 1.0mm;1;190.00
Banheiro Suíte;BAN-GAV-01;Gabinete Suspenso para Cuba Esculpida;1100;550;500;MDF 18mm Naval Branco;Fita PVC 1.0mm;1;410.00
Banheiro Suíte;BAN-ESP-02;Espelheira com Armário Oculto;1100;800;150;MDF 15mm Branco Tx;Vidro Espelho 4mm;1;280.00
Área de Serviço;LAV-ARM-01;Armário Aéreo para Lavanderia 2 Portas;1000;750;350;MDF 18mm Branco Tx;Fita PVC 0.45mm;1;340.00
Área de Serviço;LAV-BAL-02;Balcão Inferior com Tulha Aramada;600;850;600;MDF 18mm Branco Tx;Fita PVC 0.45mm;1;380.00`;

/**
 * Função principal de parsing de arquivos Promob (XML ou TXT)
 */
export function parseArquivoPromob(conteudo: string, nomeArquivo: string = 'exportacao_promob.xml'): ResultadoParsePromob {
  const tamanhoBytes = new Blob([conteudo]).size;
  const isXml = nomeArquivo.toLowerCase().endsWith('.xml') || conteudo.trim().startsWith('<');

  if (isXml) {
    return parsePromobXml(conteudo, nomeArquivo, tamanhoBytes);
  } else {
    return parsePromobTxt(conteudo, nomeArquivo, tamanhoBytes);
  }
}

/**
 * Helper para extrair atributos ou texto de nós de forma resiliente
 */
function getAttrOrTag(element: Element, ...keys: string[]): string {
  for (const k of keys) {
    // 1. Tentar atributo exato
    if (element.hasAttribute(k)) {
      return element.getAttribute(k) || '';
    }
    // 2. Tentar atributo case-insensitive
    for (let i = 0; i < element.attributes.length; i++) {
      if (element.attributes[i].name.toLowerCase() === k.toLowerCase()) {
        return element.attributes[i].value;
      }
    }
    // 3. Tentar tag filha
    const child = element.getElementsByTagName(k)[0] || 
                  Array.from(element.children).find(c => c.tagName.toLowerCase() === k.toLowerCase());
    if (child && child.textContent) {
      return child.textContent.trim();
    }
  }
  return '';
}

function parseNumberClean(val: string | number | undefined | null, defaultVal: number = 0): number {
  if (val === undefined || val === null) return defaultVal;
  if (typeof val === 'number') return isNaN(val) ? defaultVal : val;
  const cleaned = String(val)
    .replace(/[R$\s]/g, '')
    .replace(',', '.');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? defaultVal : parsed;
}

/**
 * Parser de XML do Promob
 */
export function parsePromobXml(xmlStr: string, nomeArquivo: string, tamanhoBytes: number): ResultadoParsePromob {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlStr, 'text/xml');

    const parserError = xmlDoc.getElementsByTagName('parsererror');
    if (parserError.length > 0) {
      // Fallback para parse via Regex em caso de XML malformado
      return parsePromobXmlRegexFallback(xmlStr, nomeArquivo, tamanhoBytes);
    }

    const itens: ItemPromobParsed[] = [];
    const ambientesSet = new Set<string>();

    // 1. Abordagem por Ambientes aninhados <AMBIENTE> -> <ITEM> ou <PECA>
    const ambienteNodes = Array.from(xmlDoc.querySelectorAll('AMBIENTE, Ambiente, Room, AMBIENTES > AMBIENTE'));

    if (ambienteNodes.length > 0) {
      for (const ambNode of ambienteNodes) {
        const ambNome = getAttrOrTag(ambNode, 'NOME', 'Nome', 'DESCRICAO', 'Descricao', 'ID', 'Name') || 'Ambiente Geral';
        ambientesSet.add(ambNome);

        const itemNodes = Array.from(ambNode.querySelectorAll('ITEM, Item, PECA, Peca, MODULO, Modulo, COMPONENTE, Componente'));
        for (const it of itemNodes) {
          const itemParsed = extractItemFromXmlNode(it, ambNome);
          if (itemParsed) {
            itens.push(itemParsed);
          }
        }
      }
    }

    // 2. Se não encontrou por ambiente aninhado, busca todos os <ITEM> / <PECA> da raiz
    if (itens.length === 0) {
      const allItemNodes = Array.from(xmlDoc.querySelectorAll('ITEM, Item, PECA, Peca, MODULO, Modulo, MATERIAL, Material'));
      for (const it of allItemNodes) {
        const ambNome = getAttrOrTag(it, 'AMBIENTE', 'Ambiente', 'ROOM', 'Room', 'LOCAL', 'Local') || 'Geral';
        ambientesSet.add(ambNome);
        const itemParsed = extractItemFromXmlNode(it, ambNome);
        if (itemParsed) {
          itens.push(itemParsed);
        }
      }
    }

    // Se ainda vazio, tenta fallback por regex
    if (itens.length === 0) {
      return parsePromobXmlRegexFallback(xmlStr, nomeArquivo, tamanhoBytes);
    }

    const custoTotal = Number(itens.reduce((acc, item) => acc + item.custoTotal, 0).toFixed(2));
    const totalPecas = itens.reduce((acc, item) => acc + item.quantidade, 0);

    return {
      sucesso: true,
      arquivoNome: nomeArquivo,
      formato: 'xml',
      tamanhoBytes,
      ambientes: Array.from(ambientesSet),
      totalItens: itens.length,
      totalPecas,
      custoTotal,
      itens,
      rawContent: xmlStr,
    };
  } catch (error) {
    console.warn('Erro no DOMParser do Promob XML, tentando fallback regex:', error);
    return parsePromobXmlRegexFallback(xmlStr, nomeArquivo, tamanhoBytes);
  }
}

function extractItemFromXmlNode(itNode: Element, defaultAmbiente: string): ItemPromobParsed | null {
  const descricao = getAttrOrTag(itNode, 'DESCRICAO', 'Descricao', 'DESCRIPTION', 'Description', 'NOME', 'Nome', 'TEXTO', 'Texto');
  if (!descricao && !itNode.getAttribute('CODIGO')) return null;

  const codigo = getAttrOrTag(itNode, 'CODIGO', 'Codigo', 'ID', 'Id', 'REFERENCE', 'Reference', 'ITEM_CODE') || `PRM-${Math.floor(1000 + Math.random() * 9000)}`;
  const ambiente = getAttrOrTag(itNode, 'AMBIENTE', 'Ambiente', 'ROOM', 'Room') || defaultAmbiente;
  
  const larguraMm = parseNumberClean(getAttrOrTag(itNode, 'LARGURA', 'Largura', 'WIDTH', 'Width', 'COMPRIMENTO', 'Comprimento', 'X', 'x'), 0);
  const alturaMm = parseNumberClean(getAttrOrTag(itNode, 'ALTURA', 'Altura', 'HEIGHT', 'Height', 'Y', 'y'), 0);
  const profundidadeMm = parseNumberClean(getAttrOrTag(itNode, 'PROFUNDIDADE', 'Profundidade', 'DEPTH', 'Depth', 'ESPESSURA', 'Espessura', 'Z', 'z'), 0);
  
  const material = getAttrOrTag(itNode, 'MATERIAL', 'Material', 'COR', 'Cor', 'CHAPA', 'Chapa', 'PAINEL', 'Painel') || 'MDF 18mm Padrão';
  const acabamento = getAttrOrTag(itNode, 'ACABAMENTO', 'Acabamento', 'FITA_BORDA', 'FitaBorda', 'BORDA', 'Borda', 'FINISH') || 'Fita PVC 1.0mm';
  
  const quantidade = Math.max(1, Math.round(parseNumberClean(getAttrOrTag(itNode, 'QUANTIDADE', 'Quantidade', 'QTD', 'Qtd', 'QUANTITY', 'Quantity', 'COUNT'), 1)));
  
  let custoUnitario = parseNumberClean(getAttrOrTag(itNode, 'CUSTO_UNITARIO', 'CustoUnitario', 'CUSTO', 'Custo', 'UNIT_COST', 'VALOR_CUSTO', 'PRECO_CUSTO'), 0);
  
  // Se custo não vier preenchido no XML, calcula uma estimativa baseada nas dimensões (área de MDF + ferragem)
  if (custoUnitario === 0) {
    const areaM2 = (larguraMm * alturaMm) / 1000000;
    custoUnitario = Math.max(85, Number((areaM2 * 140 + 65).toFixed(2)));
  }

  const custoTotal = Number((custoUnitario * quantidade).toFixed(2));

  return {
    codigo,
    descricao: descricao || 'Item Promob',
    ambiente,
    larguraMm,
    alturaMm,
    profundidadeMm,
    material,
    acabamento,
    quantidade,
    custoUnitario,
    custoTotal,
  };
}

/**
 * Fallback via Regex para XMLs do Promob com encoding especial
 */
function parsePromobXmlRegexFallback(xmlStr: string, nomeArquivo: string, tamanhoBytes: number): ResultadoParsePromob {
  const itens: ItemPromobParsed[] = [];
  const ambientesSet = new Set<string>();

  // Procura padrões de tags <ITEM ... /> ou <PECA ... />
  const tagRegex = /<(?:ITEM|PECA|MODULO|MATERIAL)\s+([^>]+)>/gi;
  let match;

  while ((match = tagRegex.exec(xmlStr)) !== null) {
    const attrsStr = match[1];
    const getAttr = (key: string): string => {
      const r = new RegExp(`${key}="([^"]*)"`, 'i');
      const m = attrsStr.match(r);
      return m ? m[1] : '';
    };

    const descricao = getAttr('DESCRICAO') || getAttr('NOME') || getAttr('DESCRIPTION');
    if (!descricao) continue;

    const codigo = getAttr('CODIGO') || getAttr('ID') || `PRM-${Math.floor(1000 + Math.random() * 9000)}`;
    const ambiente = getAttr('AMBIENTE') || 'Cozinha & Planejados';
    ambientesSet.add(ambiente);

    const larguraMm = parseNumberClean(getAttr('LARGURA') || getAttr('WIDTH'), 800);
    const alturaMm = parseNumberClean(getAttr('ALTURA') || getAttr('HEIGHT'), 700);
    const profundidadeMm = parseNumberClean(getAttr('PROFUNDIDADE') || getAttr('DEPTH'), 550);
    const material = getAttr('MATERIAL') || getAttr('COR') || 'MDF 18mm Padrão';
    const acabamento = getAttr('ACABAMENTO') || getAttr('FITA_BORDA') || 'Fita PVC 1mm';
    const quantidade = Math.max(1, Math.round(parseNumberClean(getAttr('QUANTIDADE') || getAttr('QTD'), 1)));
    
    let custoUnitario = parseNumberClean(getAttr('CUSTO_UNITARIO') || getAttr('CUSTO'), 0);
    if (custoUnitario === 0) {
      custoUnitario = 320.00;
    }
    const custoTotal = Number((custoUnitario * quantidade).toFixed(2));

    itens.push({
      codigo,
      descricao,
      ambiente,
      larguraMm,
      alturaMm,
      profundidadeMm,
      material,
      acabamento,
      quantidade,
      custoUnitario,
      custoTotal,
    });
  }

  if (ambientesSet.size === 0) {
    ambientesSet.add('Ambiente Geral');
  }

  const custoTotal = Number(itens.reduce((acc, item) => acc + item.custoTotal, 0).toFixed(2));
  const totalPecas = itens.reduce((acc, item) => acc + item.quantidade, 0);

  return {
    sucesso: itens.length > 0,
    arquivoNome: nomeArquivo,
    formato: 'xml',
    tamanhoBytes,
    ambientes: Array.from(ambientesSet),
    totalItens: itens.length,
    totalPecas,
    custoTotal,
    itens,
    rawContent: xmlStr,
  };
}

/**
 * Parser de Arquivo TXT / CSV exportado pelo Promob Cut / Promob Plus
 */
export function parsePromobTxt(txtStr: string, nomeArquivo: string, tamanhoBytes: number): ResultadoParsePromob {
  const lines = txtStr.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  const itens: ItemPromobParsed[] = [];
  const ambientesSet = new Set<string>();

  let ambienteAtual = 'Ambiente Principal';

  // Descobre o delimitador (; ou \t ou , ou |)
  let delimiter = ';';
  const sampleLine = lines.find(l => !l.startsWith('#') && !l.startsWith('//') && !l.startsWith('['));
  if (sampleLine) {
    if (sampleLine.includes('\t')) delimiter = '\t';
    else if (sampleLine.includes(';')) delimiter = ';';
    else if (sampleLine.includes('|')) delimiter = '|';
    else if (sampleLine.includes(',')) delimiter = ',';
  }

  for (const line of lines) {
    // Ignora comentários
    if (line.startsWith('#') || line.startsWith('//')) {
      continue;
    }

    // Detecta mudança de bloco de ambiente como [Ambiente: Cozinha]
    const ambienteHeaderMatch = line.match(/^\[(?:Ambiente:?\s*)?([^\]]+)\]/i);
    if (ambienteHeaderMatch) {
      ambienteAtual = ambienteHeaderMatch[1].trim();
      ambientesSet.add(ambienteAtual);
      continue;
    }

    const cols = line.split(delimiter).map(c => c.trim().replace(/^["']|["']$/g, ''));
    if (cols.length < 3) continue;

    // Ignora linhas de cabeçalho comuns
    const col0Lower = cols[0].toLowerCase();
    if (col0Lower === 'ambiente' || col0Lower === 'codigo' || col0Lower === 'código' || col0Lower === 'item' || col0Lower === 'descricao' || col0Lower === 'descrição') {
      continue;
    }

    let ambiente = ambienteAtual;
    let codigo = '';
    let descricao = '';
    let larguraMm = 0;
    let alturaMm = 0;
    let profundidadeMm = 0;
    let material = 'MDF 18mm';
    let acabamento = 'Fita PVC 1mm';
    let quantidade = 1;
    let custoUnitario = 0;

    // Padrão 1: 10 colunas (Ambiente; Código; Descrição; Largura; Altura; Profundidade; Material; Acabamento; Qtd; Custo)
    if (cols.length >= 8) {
      // Se a primeira coluna não for numérica, provavelmente é o Ambiente ou Código
      if (isNaN(parseFloat(cols[0])) && cols.length >= 9) {
        ambiente = cols[0] || ambienteAtual;
        codigo = cols[1];
        descricao = cols[2];
        larguraMm = parseNumberClean(cols[3], 0);
        alturaMm = parseNumberClean(cols[4], 0);
        profundidadeMm = parseNumberClean(cols[5], 0);
        material = cols[6] || material;
        acabamento = cols[7] || acabamento;
        quantidade = Math.max(1, Math.round(parseNumberClean(cols[8], 1)));
        custoUnitario = parseNumberClean(cols[9], 0);
      } else {
        codigo = cols[0];
        descricao = cols[1];
        larguraMm = parseNumberClean(cols[2], 0);
        alturaMm = parseNumberClean(cols[3], 0);
        profundidadeMm = parseNumberClean(cols[4], 0);
        material = cols[5] || material;
        acabamento = cols[6] || acabamento;
        quantidade = Math.max(1, Math.round(parseNumberClean(cols[7], 1)));
        custoUnitario = parseNumberClean(cols[8], 0);
      }
    } else {
      // Padrão simplificado
      codigo = cols[0];
      descricao = cols[1];
      quantidade = Math.max(1, Math.round(parseNumberClean(cols[2], 1)));
      custoUnitario = parseNumberClean(cols[3], 0);
    }

    if (!descricao) continue;

    if (!codigo) {
      codigo = `PRM-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    if (custoUnitario === 0) {
      const areaM2 = (larguraMm * alturaMm) / 1000000;
      custoUnitario = Math.max(90, Number((areaM2 * 135 + 75).toFixed(2)));
    }

    ambientesSet.add(ambiente);
    const custoTotal = Number((custoUnitario * quantidade).toFixed(2));

    itens.push({
      codigo,
      descricao,
      ambiente,
      larguraMm,
      alturaMm,
      profundidadeMm,
      material,
      acabamento,
      quantidade,
      custoUnitario,
      custoTotal,
    });
  }

  if (ambientesSet.size === 0) {
    ambientesSet.add('Ambiente Geral');
  }

  const custoTotal = Number(itens.reduce((acc, item) => acc + item.custoTotal, 0).toFixed(2));
  const totalPecas = itens.reduce((acc, item) => acc + item.quantidade, 0);

  return {
    sucesso: itens.length > 0,
    arquivoNome: nomeArquivo,
    formato: 'txt',
    tamanhoBytes,
    ambientes: Array.from(ambientesSet),
    totalItens: itens.length,
    totalPecas,
    custoTotal,
    itens,
    rawContent: txtStr,
  };
}
