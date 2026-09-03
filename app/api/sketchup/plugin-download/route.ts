import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'mobsyn_exporter.rbz');

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Extensão não encontrada.' }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/x-zip-compressed',
        'Content-Disposition': 'attachment; filename="mobsyn_exporter.rbz"',
        'Content-Length': String(fileBuffer.length),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Erro ao baixar extensão.' }, { status: 500 });
  }
}
