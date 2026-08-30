import { NextRequest, NextResponse } from 'next/server';

/**
 * Meta WhatsApp Cloud API - Envio de Mensagens
 * 
 * POST /api/whatsapp/send
 * Body: { telefone: string, texto: string, clienteId?: string }
 */
export async function POST(req: NextRequest) {
  try {
    const { telefone, texto, clienteId } = await req.json();

    if (!telefone || !texto) {
      return NextResponse.json(
        { error: 'Parâmetros "telefone" e "texto" são obrigatórios.' },
        { status: 400 }
      );
    }

    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

    // Formata o número (mantém apenas dígitos)
    const cleanedNumber = telefone.replace(/\D/g, '');
    const recipientPhone = cleanedNumber.startsWith('55') ? cleanedNumber : `55${cleanedNumber}`;

    // Se as credenciais da Meta estiverem configuradas, faz a requisição real
    if (phoneNumberId && accessToken && !accessToken.includes('MY_WHATSAPP_ACCESS_TOKEN')) {
      const metaUrl = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;
      
      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: recipientPhone,
        type: 'text',
        text: {
          preview_url: true,
          body: texto,
        },
      };

      const response = await fetch(metaUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        console.warn('[WhatsApp Send API] Erro retornado pela Meta API:', data);
        return NextResponse.json(
          { 
            success: false, 
            error: data.error?.message || 'Falha ao enviar via Meta Cloud API',
            mode: 'meta_api_error',
            details: data,
            fallbackMessageId: `msg_${Date.now()}`
          }, 
          { status: 200 } // Retorna 200 com status de fallback para manter UX fluida
        );
      }

      const metaMessageId = data.messages?.[0]?.id;
      return NextResponse.json({
        success: true,
        mode: 'meta_cloud_api',
        metaMessageId,
        recipient: recipientPhone,
        timestamp: new Date().toISOString(),
      });
    }

    // Modo de demonstração / fallback local ativo quando credenciais ainda não foram informadas
    return NextResponse.json({
      success: true,
      mode: 'simulated_local',
      metaMessageId: `wamid.HBgL${Date.now()}`,
      recipient: recipientPhone,
      info: 'Mensagem enviada com sucesso em modo de demonstração. Para envio em tempo real via Meta, configure WHATSAPP_PHONE_NUMBER_ID e WHATSAPP_ACCESS_TOKEN.',
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('[WhatsApp Send API] Erro ao disparar mensagem:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor ao disparar mensagem.', details: error.message },
      { status: 500 }
    );
  }
}
