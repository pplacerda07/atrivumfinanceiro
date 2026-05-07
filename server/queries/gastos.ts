import { createClient } from "@/lib/supabase/server"
import type { FiltrosGasto, GastoComRelacoes } from "@/types"
import { IS_DEMO, DEMO_GASTOS } from "@/lib/demo-data"

export async function buscarGastos(filtros?: FiltrosGasto): Promise<GastoComRelacoes[]> {
  if (IS_DEMO) {
    let gastos = [...DEMO_GASTOS]
    if (filtros?.categoriaId) gastos = gastos.filter((g) => g.categoria_id === filtros.categoriaId)
    if (filtros?.responsavelId) gastos = gastos.filter((g) => g.responsavel_id === filtros.responsavelId)
    if (filtros?.dataInicio) gastos = gastos.filter((g) => g.data >= filtros.dataInicio!)
    if (filtros?.dataFim) gastos = gastos.filter((g) => g.data <= filtros.dataFim!)
    if (filtros?.statusComprovante === "comprovado") gastos = gastos.filter((g) => g.comprovantes.length > 0)
    if (filtros?.statusComprovante === "pendente") gastos = gastos.filter((g) => g.comprovantes.length === 0)
    if (filtros?.statusCotacao === "completa") gastos = gastos.filter((g) => g.cotacoes.length >= 3)
    if (filtros?.statusCotacao === "incompleta") gastos = gastos.filter((g) => g.cotacoes.length < 3)
    return gastos
  }

  const supabase = await createClient()
  let query = supabase
    .from("gastos")
    .select(`*, categoria:categorias(id, nome), responsavel:usuarios(id, nome, email, perfil), comprovantes(id, arquivo, tipo, criado_em), cotacoes(id, fornecedor, valor, aprovada, data_cotacao, prazo, observacoes, arquivo)`)
    .order("data", { ascending: false })

  if (filtros?.categoriaId) query = query.eq("categoria_id", filtros.categoriaId)
  if (filtros?.responsavelId) query = query.eq("responsavel_id", filtros.responsavelId)
  if (filtros?.dataInicio) query = query.gte("data", filtros.dataInicio)
  if (filtros?.dataFim) query = query.lte("data", filtros.dataFim)

  const { data, error } = await query
  if (error) throw new Error(error.message)

  let gastos = (data ?? []) as GastoComRelacoes[]
  if (filtros?.statusComprovante === "comprovado") gastos = gastos.filter((g) => g.comprovantes.length > 0)
  if (filtros?.statusComprovante === "pendente") gastos = gastos.filter((g) => g.comprovantes.length === 0)
  if (filtros?.statusCotacao === "completa") gastos = gastos.filter((g) => g.cotacoes.length >= 3)
  if (filtros?.statusCotacao === "incompleta") gastos = gastos.filter((g) => g.cotacoes.length < 3)
  return gastos
}

export async function buscarGastoPorId(id: string): Promise<GastoComRelacoes | null> {
  if (IS_DEMO) return DEMO_GASTOS.find((g) => g.id === id) ?? null

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("gastos")
    .select(`*, categoria:categorias(id, nome), responsavel:usuarios(id, nome, email, perfil), comprovantes(*), cotacoes(*)`)
    .eq("id", id)
    .single()

  if (error) return null
  return data as GastoComRelacoes
}
