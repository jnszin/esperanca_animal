import { z } from "zod";
import { TipoMoradia } from "@prisma/client";

export const adocaoSchema = z.object({
  animalId: z.string().min(1, "O animal a ser adotado deve ser selecionado."),
  
  // Dados do Adotante (LGPD)
  nomeAdotante: z
    .string()
    .min(3, "O nome completo deve ter pelo menos 3 caracteres.")
    .trim(),
  cpf: z
    .string()
    .min(11, "CPF deve ter 11 dígitos.")
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => v.length === 11, "Informe um CPF válido."),
  email: z
    .string()
    .email("Informe um e-mail válido.")
    .toLowerCase()
    .trim(),
  whatsapp: z
    .string()
    .min(10, "Informe um WhatsApp com DDD válido.")
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => v.length >= 10 && v.length <= 13, "Número de WhatsApp inválido."),
  dataNascimento: z
    .string()
    .min(1, "Informe a data de nascimento.")
    .refine((dateStr) => {
      const birth = new Date(dateStr);
      const today = new Date();
      const age = today.getFullYear() - birth.getFullYear();
      return age >= 18;
    }, "O adotante deve ser maior de 18 anos."),
  cep: z
    .string()
    .min(8, "CEP deve ter 8 dígitos.")
    .transform((v) => v.replace(/\D/g, "")),
  enderecoCompleto: z
    .string()
    .min(5, "Informe o endereço com número e complemento."),
  bairro: z.string().min(2, "Informe o bairro."),
  cidade: z.string().min(2, "Informe a cidade."),
  estado: z.string().default("ES"),

  // Respostas da Pré-Triagem
  tipoMoradia: z.nativeEnum(TipoMoradia),
  imovelProprio: z.boolean(),
  proprietarioPermite: z.boolean().default(true),
  todosConcordam: z.boolean(),
  possuiOutrosAnimais: z.boolean(),
  detalhesOutrosAnimais: z.string().optional().nullable(),
  horasAnimalSozinho: z.coerce
    .number()
    .min(0, "Mínimo 0 horas.")
    .max(24, "Máximo 24 horas."),
  cienteCustosMensais: z
    .boolean()
    .refine((v) => v === true, "É necessário confirmar ciência dos custos mensais."),
  motivoAdocao: z
    .string()
    .min(15, "Conte um pouco mais sobre o motivo da adoção (mínimo 15 caracteres)."),
  aceitouTermosLGPD: z
    .boolean()
    .refine((v) => v === true, "É necessário concordar com os termos de consentimento (LGPD)."),
});

export type AdocaoFormData = z.infer<typeof adocaoSchema>;
