import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { IS_DEMO, getDemoResumoRelatorio } from "@/lib/demo-data"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const inicio = searchParams.get("inicio")!
  const fim = searchParams.get("fim")!

  if (IS_DEMO) {
    return NextResponse.json(getDemoResumoRelatorio(inicio, fim))
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  const { data: gastos, error } = await supabase
    .from("gastos")
    .select(`*, categoria:categorias(id, nome), responsavel:usuarios(id, nome), comprovantes(*), cotacoes(*)`)
    .gte("data", inicio).lte("data", fim).order("data", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const totalGastos = (gastos ?? []).reduce((sum, g) => sum + g.valor, 0)
  const mapCategoria = new Map<string, { categoria: string; total: number; count: number }>()
  for (const g of gastos ?? []) {
    const nome = g.categoria?.nome ?? "Sem categoria"
    const atual = mapCategoria.get(nome) ?? { categoria: nome, total: 0, count: 0 }
    mapCategoria.set(nome, { ...atual, total: atual.total + g.valor, count: atual.count + 1 })
  }

  return NextResponse.json({
    gastos,
    resumo: {
      totalGastos,
      totalPorCategoria: Array.from(mapCategoria.values()),
      numComprovantes: (gastos ?? []).reduce((sum, g) => sum + g.comprovantes.length, 0),
      numCotacoes: (gastos ?? []).reduce((sum, g) => sum + g.cotacoes.length, 0),
      gastosSemdComprovante: (gastos ?? []).filter((g) => g.comprovantes.length === 0),
    },
  })
}
