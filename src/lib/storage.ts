import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import crypto from "crypto";

// Inicializa o cliente compatível com S3 para o Cloudflare R2
const r2Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ACCOUNT_ID
    ? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
    : "https://auto.r2.cloudflarestorage.com",
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

export interface UploadResult {
  url: string;
  keyStorage: string;
}

export type StorageFolder = "animais" | "chamados" | "campanhas";

/**
 * Processa a imagem bruta no backend usando Sharp:
 * - Redimensiona para limite máximo de 1600px de largura/altura
 * - Converte para .webp com qualidade 80
 * - Faz upload direto para o Cloudflare R2
 * - NENHUM arquivo é salvo em disco local na VPS
 */
export async function uploadImageToR2(
  fileBuffer: Buffer,
  folder: StorageFolder,
  originalFilename?: string
): Promise<UploadResult> {
  const bucketName = process.env.R2_BUCKET_NAME || "esperanca-animal";
  const publicUrlBase = (process.env.R2_PUBLIC_URL || "").replace(/\/$/, "");

  // 1. Processamento e Otimização com Sharp
  const webpBuffer = await sharp(fileBuffer)
    .resize(1600, 1600, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 80, effort: 4 })
    .toBuffer();

  // 2. Geração de chave única (UUIDv4)
  const fileHash = crypto.randomUUID();
  const keyStorage = `${folder}/${fileHash}.webp`;

  // Salvaguarda: Se as chaves R2 não estiverem no .env, não quebra a requisição do usuário
  if (!process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
    console.warn(`[R2_UPLOAD_DEV_MOCK] Credenciais R2 ausentes no .env. Simulando upload para: ${keyStorage}`);
    return {
      url: `https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&q=80&w=800`,
      keyStorage: `dev-mock/${keyStorage}`,
    };
  }

  // 3. Despacho para o Cloudflare R2
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: keyStorage,
    Body: webpBuffer,
    ContentType: "image/webp",
    Metadata: {
      originalName: originalFilename ? encodeURIComponent(originalFilename) : "foto.webp",
      uploadedAt: new Date().toISOString(),
    },
  });

  await r2Client.send(command);

  // 4. URL pública para servir via CDN
  const url = publicUrlBase
    ? `${publicUrlBase}/${keyStorage}`
    : `https://${bucketName}.r2.dev/${keyStorage}`;

  return {
    url,
    keyStorage,
  };
}

/**
 * Remove um arquivo do Cloudflare R2 através da sua keyStorage.
 */
export async function deleteImageFromR2(keyStorage: string): Promise<boolean> {
  const bucketName = process.env.R2_BUCKET_NAME || "esperanca-animal";

  try {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: keyStorage,
    });

    await r2Client.send(command);
    return true;
  } catch (error) {
    console.error(`[R2_DELETE_ERROR] Falha ao excluir arquivo "${keyStorage}":`, error);
    return false;
  }
}

