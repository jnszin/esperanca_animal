import { z } from "zod";
import { Especie, Porte, Sexo, StatusAnimal } from "@prisma/client";

export const animalSchema = z.object({
  nome: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(80, "Nome muito longo")
    .trim(),
  especie: z.nativeEnum(Especie),
  raca: z.string().min(2, "Informe a raça ou SRD").max(80).default("SRD (Sem Raça Definida)"),
  porte: z.nativeEnum(Porte),
  sexo: z.nativeEnum(Sexo),
  idadeEstimadaMeses: z
    .number({ message: "Informe a idade estimada em meses" })
    .min(1, "Idade mínima de 1 mês")
    .max(300, "Idade máxima de 300 meses"),
  pesoKg: z
    .number()
    .positive("Peso deve ser maior que zero")
    .max(120, "Peso muito alto")
    .nullable()
    .optional(),
  
  // Saúde e Comportamento
  castrado: z.boolean().default(false),
  vacinado: z.boolean().default(false),
  vermifugado: z.boolean().default(false),
  necessidadesEspeciais: z.boolean().default(false),
  descricaoSaude: z.string().max(1000).optional(),
  temperamento: z.array(z.string()).default([]),
  exigeTelaProtecao: z.boolean().default(false),

  historia: z
    .string()
    .min(10, "Conte um pouco sobre a história do animal (mínimo 10 caracteres)")
    .max(4000, "História muito longa"),
  status: z.nativeEnum(StatusAnimal).default(StatusAnimal.DISPONIVEL),
  destaqueVitrine: z.boolean().default(false),
  chamadoOrigemId: z.string().optional().nullable(),
});

export type AnimalInput = z.infer<typeof animalSchema>;

