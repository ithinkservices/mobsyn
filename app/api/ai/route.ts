import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { action, payload } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
    }

    if (action === 'crm-analysis') {
      const prompt = `Analise este negócio de marcenaria planejada e retorne estritamente um JSON válido com exatamente estas chaves:
      {
        "aiScore": número inteiro de 0 a 100 baseado no tempo desde o último contato, etapa do funil, valor do negócio, e histórico de WhatsApp,
        "aiSuggestedNextStep": "uma recomendação comercial curta e prática de próximo passo (ex: Ligar para agendar fechamento, Enviar orçamento revisado com desconto, etc)"
      }
      Dados do Negócio e Contexto:
      ${JSON.stringify(payload)}
      Retorne APENAS o JSON válido, sem blocos de código markdown ou texto adicional.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      let text = response.text || "{}";
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const jsonResult = JSON.parse(text);
      return NextResponse.json(jsonResult);
    }

    if (action === 'whatsapp-suggestion') {
      const prompt = `Atue como um gerente comercial sênior de uma marcenaria de alto padrão.
      Escreva uma sugestão de mensagem profissional, calorosa e comercial para o vendedor enviar via WhatsApp para o cliente.
      Considere o histórico de conversas, etapa do funil, prazos e situação financeira.
      Retorne estritamente um JSON válido com exatamente esta chave:
      {
        "suggestedMessage": "o texto completo da mensagem sugerida pronta para envio"
      }
      Dados contextuais:
      ${JSON.stringify(payload)}
      Retorne APENAS o JSON válido, sem blocos de código markdown ou texto adicional.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      let text = response.text || "{}";
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const jsonResult = JSON.parse(text);
      return NextResponse.json(jsonResult);
    }

    if (action === 'clean-environments') {
      const prompt = `Você é um especialista em importação de projetos de marcenaria (Promob/SketchUp).
      Os nomes abaixo são identificadores técnicos ou de camadas do arquivo CAD original.
      Transforme cada um em um nome comercial limpo, legível e padronizado em português (ex: "Cozinha", "Dormitório Casal", "Closet", "Banheiro Suíte", "Home Theater", "Área de Serviço").
      Retorne estritamente um JSON válido com exatamente esta estrutura:
      {
        "environments": [ { "original": "...", "cleaned": "..." } ]
      }
      Ambientes originais:
      ${JSON.stringify(payload.rawEnvironments)}
      Retorne APENAS o JSON válido, sem blocos de código markdown ou texto adicional.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      let text = response.text || "{}";
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const jsonResult = JSON.parse(text);
      return NextResponse.json(jsonResult);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("AI API Error:", err);
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
