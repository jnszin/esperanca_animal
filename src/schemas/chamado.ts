import { z } from "zod";
import { Especie, NivelUrgencia } from "@prisma/client";

export const chamadoSchema = z.object({
  // Dados do Solicitante
  nomeSolicitante: z
    .string()
    .min(3, "Nome deve ter pelo menos 3 caracteres")
    .max(120, "Nome muito longo"),
  whatsapp: z
    .string()
    .min(10, "WhatsApp inválido (informe DDD + número)")
    .max(20, "WhatsApp inválido"),
  podeDarLarTemporario: z.boolean().default(false),
  aceitouTermosLGPD: z
    .boolean()
    .refine((val) => val === true, "Você deve aceitar os termos de consentimento e LGPD"),

  // Dados da Ocorrência
  especie: z.nativeEnum(Especie),
  nivelUrgencia: z.nativeEnum(NivelUrgencia),
  descricaoSituacao: z
    .string()
    .min(10, "Por favor, descreva a situação com mais detalhes (mínimo 10 caracteres)")
    .max(2000, "Descrição muito longa (máximo 2000 caracteres)"),
  enderecoOcorrencia: z
    .string()
    .min(5, "Informe o endereço ou rua aproximada onde o animal foi visto")
    .max(255, "Endereço muito longo"),
  pontoReferencia: z.string().max(255, "Ponto de referência muito longo").optional(),
  bairro: z.string().min(2, "Informe o bairro").max(100, "Bairro muito longo"),
  cidade: z.string().min(2, "Informe a cidade").max(100, "Cidade muito longa"),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
});

export type ChamadoInput = z.infer<typeof chamadoSchema>;
