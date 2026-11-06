import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // Defesa em profundidade: validação redundante no nível de Route Handler
  const secret = req.headers.get("x-webhook-secret");
  const expected = process.env.WEBHOOK_SECRET;

  if (!expected || secret !== expected) {
    return NextResponse.json(
      { error: "Acesso não autorizado: segredo do webhook inválido." },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Webhook autenticado e recebido com sucesso!",
    timestamp: new Date().toISOString(),
  });
}

