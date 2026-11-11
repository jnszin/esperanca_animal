import { z } from "zod";
import {
  FormaEntregaAjuda,
  StatusOfertaAjuda,
  TipoAjudaONG,
} from "@prisma/client";

export const ofertaAjudaSchema = z.object({
  tipoAjuda: z.nativeEnum(TipoAjudaONG),
  formaEntrega: z.nativeEnum(FormaEntregaAjuda).default("A_COMBINAR"),
  nomeDoador: z
    .string()
    .trim()
    .min(3, "Informe seu nome completo (mínimo 3 caracteres)")
    .max(120, "Nome muito longo"),
  whatsapp: z
    .string()
    .trim()
    .min(10, "Informe um WhatsApp válido com DDD")
    .max(25, "WhatsApp inválido"),
  municipio: z
    .string()
    .trim()
    .min(2, "Informe o seu município")
    .max(100, "Nome do município muito longo"),
  bairro: z.string().trim().max(100, "Nome do bairro muito longo").optional(),
  mensagem: z
    .string()
    .trim()
    .min(10, "Conte rapidamente como consegue ajudar (mínimo 10 caracteres)")
    .max(2000, "Mensagem muito longa"),
  aceitouTermosLGPD: z
    .boolean()
    .refine(
      (val) => val === true,
      "Você deve aceitar o termo de contato e LGPD para enviar"
    ),
});

export const atualizarStatusAjudaSchema = z.object({
  id: z.string().min(1, "ID não informado"),
  status: z.nativeEnum(StatusOfertaAjuda),
  observacaoEquipe: z
    .string()
    .trim()
    .max(1000, "Observação muito longa")
    .optional(),
});

export type OfertaAjudaInput = z.infer<typeof ofertaAjudaSchema>;
export type AtualizarStatusAjudaInput = z.infer<
  typeof atualizarStatusAjudaSchema
>;

