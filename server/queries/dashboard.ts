import { createClient } from "@/lib/supabase/server"
import type { DashboardData, Alerta, GastoComRelacoes } from "@/types"
import { periodoAtual } from "@/lib/utils"
import { IS_DEMO, getDemoDashboard } from "@/lib/demo-data"

export async function buscarDadosDashboard(): Promise<DashboardData> {
  if (IS_DEMO) return getDemoDashboard()

  const supabase = createClient()
  const periodo = periodoAtual()
  const [ano, mes] = periodo.split("-")
  const dataInicio = `${ano}-${mes}-01`
  const dataFim = `${ano}-${mes}-31`

  const [orcamentoRes, gastosRes] = await Promise.all([
    supabase.from("orcamento").select("*").eq("periodo", periodo).maybeSingle(),
    supabase
      .from("gastos")
      .select(`*, categoria:categorias(id, nome), responsavel:usuarios(id, nome, email, perfil), comprovantes(id, arquivo, tipo, criado_em), cotacoes(id, fornecedor, valor, aprovada)`)
      .gte("data", dataInicio).lte("data", dataFim).order("data", { ascending: false }),
  ])

  const orcamentoTotal = orcamentoRes.data?.total ?? 0
  const gastos = (gastosRes.data ?? []) as GastoComRelacoes[]
  const gastoTotal = gastos.reduce((sum, g) => sum + g.valor, 0)
  const saldoDisponivel = orcamentoTotal - gastoTotal
  const percentualUtilizado = orcamentoTotal > 0 ? Math.round((gastoTotal / orcamentoTotal) * 100) : 0
  const percentualRestante = 100 - percentualUtilizado
  const alertaSaldo = percentualRestante <= 20 && orcamentoTotal > 0

  const mapCategoria = new Map<string, { nome: string; total: number; count: number }>()
  for (const g of gastos) {
    const nome = g.categoria?.nome ?? "Sem categoria"
    const atual = mapCategoria.get(nome) ?? { nome, total: 0, count: 0 }
    mapCategoria.set(nome, { nome, total: atual.total + g.valor, count: atual.count + 1 })
  }

  const alertas: Alerta[] = []
  if (alertaSaldo)
    alertas.push({ tipo: "saldo_critico", mensagem: `Saldo disponível crítico: apenas ${percentualRestante}% do orçamento restante` })

  const semComprovante = gastos.filter((g) => g.comprovantes.length === 0)
  if (semComprovante.length > 0)
    alertas.push({ tipo: "sem_comprovante", mensagem: `${semComprovante.length} gasto(s) sem comprovante` })

  const cotacaoIncompleta = gastos.filter((g) => g.cotacoes.length > 0 && g.cotacoes.length < 3)
  if (cotacaoIncompleta.length > 0)
    alertas.push({ tipo: "cotacao_incompleta", mensagem: `${cotacaoIncompleta.length} gasto(s) com cotações incompletas (menos de 3)` })

  return {
    orcamentoTotal, gastoTotal, saldoDisponivel, percentualUtilizado, alertaSaldo,
    ultimosGastos: gastos.slice(0, 5),
    gastosPorCategoria: Array.from(mapCategoria.values()),
    alertas,
  }
}
