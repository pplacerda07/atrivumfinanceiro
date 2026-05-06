import { z } from "zod"

export const GastoSchema = z.object({
  data: z.string().min(1, "Data é obrigatória"),
  descricao: z.string().min(3, "Descrição deve ter pelo menos 3 caracteres"),
  valor: z.coerce.number().positive("Valor deve ser positivo"),
  categoriaId: z.string().uuid("Categoria inválida"),
  responsavelId: z.string().uuid("Responsável inválido"),
})

export type GastoInput = z.infer<typeof GastoSchema>
