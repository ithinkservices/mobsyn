// ==============================================================================
// ENDPOINT: /api/sketchup/convert
// Converte arquivos SketchUp (.skp) ou JSON da extensão Ruby em dados
// estruturados de marcenaria (Lista de Peças + Cena 3D para Three.js)
// ==============================================================================
// 
// ARQUITETURA DO PIPELINE SKETCHUP:
// 
// 1. FLUXO A: JSON INTERMEDIÁRIO (Ruby API Extension)
//    - O projetista executa o plugin 'Marcenaria ERP Export' dentro do SketchUp
//    - O plugin gera um arquivo .json com a hierarquia de componentes, instâncias,
//      dimensões em mm, posições espaciais (X, Y, Z) e materiais
//    - O endpoint recebe esse JSON diretamente e faz o parsing imediato de alta precisão.
//
// 2. FLUXO B: ARQUIVO BINÁRIO .SKP (Converter Bridge / Cloud Service)
//    - O arquivo binário .skp (formato proprietário da Trimble) é enviado via multipart/form-data
//    - O endpoint está estruturado para orquestrar chamadas a serviços externos de conversão
//      (ex: Trimble Connect API, Aspose.3D Cloud, Hoops Exchange ou microserviço dedicado C++/Python)
//    - O backend extrai a geometria 3D, gera os metadados dos componentes e retorna a cena pronta.
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { 
  parseSketchUpJson, 
  parseSketchUpBinarySkp, 
  ResultadoParseSketchUp 
} from '@/lib/sketchupParser';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';

    let resultado: ResultadoParseSketchUp;

    // Caso 1: Upload multipart/form-data (arquivo .skp ou .json selecionado pelo usuário)
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      const jsonPayload = formData.get('jsonPayload') as string | null;

      if (jsonPayload) {
        resultado = parseSketchUpJson(jsonPayload, 'projeto_sketchup.json');
      } else if (file) {
        const fileName = file.name;
        const fileExt = fileName.split('.').pop()?.toLowerCase();
        const fileBytes = await file.arrayBuffer();

        if (fileExt === 'json') {
          const textContent = new TextDecoder('utf-8').decode(fileBytes);
          resultado = parseSketchUpJson(textContent, fileName);
        } else if (fileExt === 'skp') {
          /*
           * NOTA DE INTEGRAÇÃO EXTERNA:
           * Para conectar um serviço de conversão real de .skp para glTF/JSON,
           * insira a chamada HTTP para o seu microsserviço ou API externa aqui:
           * 
           * const response = await fetch(process.env.SKP_CONVERSION_SERVICE_URL, {
           *   method: 'POST',
           *   body: fileBytes,
           *   headers: { 'Authorization': `Bearer ${process.env.SKP_CONVERSION_KEY}` }
           * });
           * const dadosConvertidos = await response.json();
           */
          const textPreview = new TextDecoder('utf-8', { fatal: false }).decode(fileBytes.slice(0, 4096));
          resultado = parseSketchUpBinarySkp(textPreview, fileName, file.size);
        } else {
          return NextResponse.json(
            { sucesso: false, mensagem: 'Formato não suportado. Envie arquivos .skp ou .json do SketchUp.' },
            { status: 400 }
          );
        }
      } else {
        return NextResponse.json(
          { sucesso: false, mensagem: 'Nenhum arquivo ou payload enviado no formulário.' },
          { status: 400 }
        );
      }
    } 
    // Caso 2: Payload JSON direto
    else {
      const body = await req.json();
      if (body.jsonContent) {
        resultado = parseSketchUpJson(
          typeof body.jsonContent === 'string' ? body.jsonContent : JSON.stringify(body.jsonContent), 
          body.fileName || 'sketchup_export.json'
        );
      } else if (body.skpBase64) {
        resultado = parseSketchUpBinarySkp(body.skpBase64, body.fileName || 'projeto.skp', body.fileSize || 0);
      } else {
        return NextResponse.json(
          { sucesso: false, mensagem: 'Corpo da requisição inválido. Envie { jsonContent } ou { skpBase64 }.' },
          { status: 400 }
        );
      }
    }

    if (!resultado.sucesso) {
      return NextResponse.json(resultado, { status: 422 });
    }

    return NextResponse.json(resultado);
  } catch (error: any) {
    console.error('Erro na API de conversão SketchUp:', error);
    return NextResponse.json(
      { 
        sucesso: false, 
        mensagem: `Erro interno no servidor ao processar projeto SketchUp: ${error?.message || 'Erro desconhecido'}` 
      },
      { status: 500 }
    );
  }
}
