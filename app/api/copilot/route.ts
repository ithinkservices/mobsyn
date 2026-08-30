import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

// PONTO DE CONFIGURAÇÃO DA CHAVE DE API DA IA (GEMINI)
// A chave é injetada de forma segura no servidor através de process.env.GEMINI_API_KEY.
// Certifique-se de configurar GEMINI_API_KEY no painel de segredos/variáveis de ambiente do projeto.

export async function POST(req: NextRequest) {
  try {
    const { prompt, contextData, history } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { 
          error: "A chave GEMINI_API_KEY não está configurada no servidor. Por favor, configure a chave de API nas configurações do ambiente para habilitar o Copiloto de IA." 
        },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `
Você é o Copiloto de IA oficial do MobPlan ERP, um sistema especialista em gestão para Marcenarias e Lojas de Móveis Planejados de Alto Padrão.
Você possui acesso de leitura em tempo real a todos os dados da empresa ativa fornecidos no contexto JSON abaixo.

DIRETRIZES DE RAG E RESPOSTA:
1. RIGOR DE DADOS: NUNCA invente números, prazos, valores financeiros ou nomes de clientes. Utilize exclusivamente os dados presentes no contexto JSON da empresa.
2. SE UM DADO NÃO EXISTIR: Informe com clareza que o registro não foi localizado nos dados atuais.
3. LINGUAGEM: Responda em Português do Brasil (PT-BR) com tom profissional, executivo, cortês e prestativo.
4. PROATIVIDADE: Aponte gargalos operacionais relevantes (ex: contratos atrasados no radar de prazos, negócios parados no funil de vendas, contas a receber vencidas, chamados de assistência pendentes, leads sem retorno há mais de 3 dias).
5. NAVEGAÇÃO INTERATIVA: Quando o usuário demonstrar interesse em visualizar um setor ou item, inclua ao final da resposta uma tag de navegação no formato exato [Navegar: modulo_id] onde modulo_id pode ser: 'crm', 'contratos', 'projetos', 'producao', 'montagem', 'whatsapp', 'financeiro', 'pos-venda', ou 'dashboard'.

DADOS DA EMPRESA EM TEMPO REAL (CONTEXTO RAG):
${JSON.stringify(contextData, null, 2)}
    `;

    const contents = [];
    if (history && Array.isArray(history)) {
      for (const h of history) {
        contents.push({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }]
        });
      }
    }
    contents.push({
      role: 'user',
      parts: [{ text: prompt }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.3,
      }
    });

    const text = response.text || "Sem resposta gerada pelo modelo.";

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("Erro na API do Copiloto:", error);
    return NextResponse.json(
      { error: error.message || "Erro interno ao comunicar com o modelo de IA." },
      { status: 500 }
    );
  }
}
