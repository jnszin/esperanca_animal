import { z } from "zod";
import { ModalidadeVoluntariado, StatusVoluntario } from "@prisma/client";

export const voluntarioInscricaoSchema = z.object({
  modalidade: z.nativeEnum(ModalidadeVoluntariado),
  nome: z
    .string()
    .trim()
    .min(3, "Informe seu nome completo (mínimo 3 caracteres)")
    .max(120, "Nome muito longo"),
  whatsapp: z
    .string()
    .trim()
    .min(10, "Informe um telefone/WhatsApp válido com DDD")
    .max(25, "Telefone inválido"),
  municipio: z
    .string()
    .trim()
    .min(2, "Informe o seu município")
    .max(100, "Nome do município muito longo"),
  disponibilidade: z
    .string()
    .trim()
    .min(3, "Informe sua disponibilidade de dias ou horários")
    .max(200, "Texto de disponibilidade muito longo"),
  descricao: z
    .string()
    .trim()
    .min(10, "Explique rapidamente como deseja ajudar (mínimo 10 caracteres)")
    .max(2000, "Descrição muito longa"),
  aceitouTermosLGPD: z
    .boolean()
    .refine(
      (val) => val === true,
      "Você deve aceitar o termo de contato e LGPD para enviar seu cadastro"
    ),
});

export const atualizarStatusVoluntarioSchema = z.object({
  id: z.string().min(1, "ID não informado"),
  status: z.nativeEnum(StatusVoluntario),
  observacaoEquipe: z
    .string()
    .trim()
    .max(1000, "Observação muito longa")
    .optional(),
});

export type VoluntarioInscricaoInput = z.infer<
  typeof voluntarioInscricaoSchema
>;
export type AtualizarStatusVoluntarioInput = z.infer<
  typeof atualizarStatusVoluntarioSchema
>;

