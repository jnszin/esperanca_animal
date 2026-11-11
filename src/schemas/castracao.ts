import { z } from "zod";
import {
  Especie,
  Sexo,
  StatusSolicitacaoServico,
  TipoServicoPet,
} from "@prisma/client";

export const castracaoSchema = z.object({
  // Serviço Solicitado
  tipoServico: z.nativeEnum(TipoServicoPet),

  // Dados do Tutor
  nomeTutor: z
    .string()
    .trim()
    .min(3, "Informe o nome completo do tutor (mínimo 3 caracteres)")
    .max(120, "Nome do tutor muito longo"),
  whatsapp: z
    .string()
    .trim()
    .min(10, "WhatsApp inválido (informe DDD + número)")
    .max(25, "WhatsApp inválido"),
  aceitouTermosLGPD: z
    .boolean()
    .refine(
      (val) => val === true,
      "Você deve concordar com os termos de contato e LGPD para enviar o cadastro"
    ),

  // Endereço & Município
  endereco: z
    .string()
    .trim()
    .min(5, "Informe o endereço completo (rua e número)")
    .max(255, "Endereço muito longo"),
  bairro: z
    .string()
    .trim()
    .min(2, "Informe o bairro")
    .max(100, "Nome do bairro muito longo"),
  municipio: z
    .string()
    .trim()
    .min(2, "O município é obrigatório")
    .max(100, "Nome do município muito longo"),

  // Dados do Pet
  nomePet: z
    .string()
    .trim()
    .min(2, "Informe o nome do pet")
    .max(80, "Nome do pet muito longo"),
  especie: z.nativeEnum(Especie),
  sexo: z.nativeEnum(Sexo),
  pesoKg: z
    .number({ message: "Informe o peso aproximado do pet em kg" })
    .min(0.2, "Peso mínimo válido é 0,2 kg")
    .max(120, "Peso máximo permitido é 120 kg"),
  idadeEstimada: z
    .string()
    .trim()
    .max(60, "Idade estimada muito longa")
    .optional(),
  observacoesSaude: z
    .string()
    .trim()
    .max(1000, "Observações muito longas (máximo 1000 caracteres)")
    .optional(),
});

export const atualizarStatusCastracaoSchema = z.object({
  id: z.string().min(1, "ID da solicitação não informado"),
  status: z.nativeEnum(StatusSolicitacaoServico),
  avisoStatus: z
    .string()
    .trim()
    .max(1000, "Aviso muito longo")
    .optional(),
  dataAgendamento: z.string().optional().nullable(),
  localAtendimento: z
    .string()
    .trim()
    .max(200, "Local muito longo")
    .optional()
    .nullable(),
});

export type CastracaoInput = z.infer<typeof castracaoSchema>;
export type AtualizarStatusCastracaoInput = z.infer<
  typeof atualizarStatusCastracaoSchema
>;

