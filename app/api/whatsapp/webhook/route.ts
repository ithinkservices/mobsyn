import { NextRequest, NextResponse } from 'next/server';

/**
 * Meta WhatsApp Cloud API Webhook
 * 
 * GET: Verificação do Webhook pela Meta (hub.challenge)
 * POST: Recebimento de mensagens em tempo real do WhatsApp
 */

// GET handler para verificação de webhook da Meta
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'mobplan_marcenaria_verify_secret_2026';

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('[WhatsApp Webhook] Verificação efetuada com sucesso pela Meta.');
    return new NextResponse(challenge, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  return NextResponse.json(
    { error: 'Token de verificação inválido ou parâmetro incorreto' },
    { status: 403 }
  );
}

// POST handler para eventos e mensagens recebidas
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validação da estrutura de payload da Meta Cloud API
    if (body.object === 'whatsapp_business_account') {
      const entries = body.entry || [];

      for (const entry of entries) {
        const changes = entry.changes || [];

        for (const change of changes) {
          const value = change.value;
          if (value && value.messages) {
            const contacts = value.contacts || [];
            const messages = value.messages;

            for (const message of messages) {
              const fromNumber = message.from; // e.g., "5511981223344"
              const messageId = message.id;
              const timestamp = message.timestamp;
              const contactInfo = contacts.find((c: any) => c.wa_id === fromNumber);
              const senderName = contactInfo?.profile?.name || `WhatsApp ${fromNumber}`;

              let messageText = '';
              let mediaType: 'imagem' | 'documento' | 'audio' | undefined;
              let mediaUrl: string | undefined;

              if (message.type === 'text') {
                messageText = message.text?.body || '';
              } else if (message.type === 'image') {
                messageText = message.image?.caption || '[Foto enviada pelo cliente]';
                mediaType = 'imagem';
                mediaUrl = message.image?.id;
              } else if (message.type === 'document') {
                messageText = message.document?.filename ? `[Documento: ${message.document.filename}]` : '[Documento anexo]';
                mediaType = 'documento';
              } else if (message.type === 'audio' || message.type === 'voice') {
                messageText = '[Mensagem de áudio]';
                mediaType = 'audio';
              } else {
                messageText = `[Mensagem formato ${message.type}]`;
              }

              console.log(`[WhatsApp Webhook] Mensagem recebida de ${senderName} (${fromNumber}): "${messageText}" [ID: ${messageId}]`);
            }
          }

          // Tratamento de confirmações de entrega / leitura (status updates)
          if (value && value.statuses) {
            for (const status of value.statuses) {
              console.log(`[WhatsApp Webhook] Status atualizado para mensagem ${status.id}: ${status.status}`);
            }
          }
        }
      }

      return NextResponse.json({ status: 'EVENT_RECEIVED' }, { status: 200 });
    }

    return NextResponse.json({ error: 'Payload não reconhecido' }, { status: 404 });
  } catch (error: any) {
    console.error('[WhatsApp Webhook] Erro ao processar webhook:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar webhook', details: error.message },
      { status: 500 }
    );
  }
}
