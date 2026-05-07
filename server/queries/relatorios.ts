import { createClient } from "@/lib/supabase/server"
import type { GastoComRelacoes, ResumoRelatorio, RelatorioFiltros } from "@/types"

export async function buscarDadosRelatorio(filtros: RelatorioFiltros): Promise<{
  gastos: GastoComRelacoes[]
  resumo: ResumoRelatorio
}> {
  const supabase = await createClient()

  let query = supabase
    .from("gastos")
    .select(`
      *,
      categoria:categorias(id, nome),
      responsavel:usuarios(id, nome, email, perfil),
      comprovantes(*),
      cotacoes(*)
    `)
    .gte("data", filtros.dataInicio)
    .lte("data", filtros.dataFim)
    .order("data", { ascending: false })

  if (filtros.categoriaId) query = query.eq("categoria_id", filtros.categoriaId)
  if (filtros.responsavelId) query = query.eq("responsavel_id", filtros.responsavelId)

  const { data, error } = await query
  if (error) throw new Error(error.message)

  const gastos = (data ?? []) as GastoComRelacoes[]
  const totalGastos = gastos.reduce((sum, g) => sum + g.valor, 0)

  const mapCategoria = new Map<string, { categoria: string; total: number; count: number }>()
  for (const g of gastos) {
    const nome = g.categoria?.nome ?? "Sem categoria"
    const atual = mapCategoria.get(nome) ?? { categoria: nome, total: 0, count: 0 }
    mapCategoria.set(nome, { ...atual, total: atual.total + g.valor, count: atual.count + 1 })
  }

  return {
    gastos,
    resumo: {
      totalGastos,
      totalPorCategoria: Array.from(mapCategoria.values()),
      numComprovantes: gastos.reduce((sum, g) => sum + g.comprovantes.length, 0),
      numCotacoes: gastos.reduce((sum, g) => sum + g.cotacoes.length, 0),
      gastosSemdComprovante: gastos.filter((g) => g.comprovantes.length === 0),
    },
  }
}

export async function buscarLogExportacoes() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("log_exportacoes")
    .select("*, usuario:usuarios(nome, email)")
    .order("criado_em", { ascending: false })
    .limit(50)
  return data ?? []
}
