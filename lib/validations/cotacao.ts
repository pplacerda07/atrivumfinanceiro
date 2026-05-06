import { z } from "zod"

export const CotacaoSchema = z.object({
  gastoId: z.string().uuid("Gasto inválido"),
  fornecedor: z.string().min(2, "Nome do fornecedor é obrigatório"),
  valor: z.coerce.number().positive("Valor deve ser positivo"),
  dataCotacao: z.string().min(1, "Data é obrigatória"),
  prazo: z.string().optional(),
  observacoes: z.string().optional(),
})

export type CotacaoInput = z.infer<typeof CotacaoSchema>

export const OrcamentoSchema = z.object({
  total: z.coerce.number().positive("Orçamento deve ser positivo"),
  periodo: z.string().regex(/^\d{4}-\d{2}$/, "Período deve estar no formato AAAA-MM"),
})

export type OrcamentoInput = z.infer<typeof OrcamentoSchema>

export const CategoriaSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
})

export type CategoriaInput = z.infer<typeof CategoriaSchema>
