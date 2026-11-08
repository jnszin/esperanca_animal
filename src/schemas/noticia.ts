import { z } from "zod";

export const noticiaSchema = z.object({
  titulo: z
    .string()
    .min(5, "Título deve ter pelo menos 5 caracteres")
    .max(150, "Título muito longo (máximo 150 caracteres)")
    .trim(),
  subtitulo: z
    .string()
    .max(300, "Subtítulo muito longo (máximo 300 caracteres)")
    .trim()
    .optional()
    .nullable(),
  conteudo: z
    .string()
    .min(20, "O conteúdo da matéria deve ter pelo menos 20 caracteres")
    .max(15000, "Conteúdo muito extenso"),
  categoria: z
    .string()
    .min(2, "Selecione uma categoria")
    .max(50)
    .default("Projetos & Resgates"),
  publicado: z.boolean().default(true),
  tempoLeituraMin: z
    .number({ message: "Informe o tempo estimado de leitura em minutos" })
    .min(1, "Mínimo 1 minuto")
    .max(60, "Máximo 60 minutos")
    .default(2),
  autorNome: z
    .string()
    .min(2, "Nome do autor deve ter pelo menos 2 caracteres")
    .max(100)
    .default("Equipe Esperança Animal"),
});

export type NoticiaInput = z.infer<typeof noticiaSchema>;

