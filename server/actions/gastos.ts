"use server"
import { createClient } from "@/lib/supabase/server"
import { GastoSchema } from "@/lib/validations/gasto"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"
import { IS_DEMO } from "@/lib/demo-data"

export async function criarGasto(data: z.infer<typeof GastoSchema>) {
  if (IS_DEMO) return { success: true }

  const parsed = GastoSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.flatten() }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Não autenticado" }

  const orcamentoRes = await supabase.from("orcamento").select("total").order("criado_em", { ascending: false }).limit(1).maybeSingle()
  const gastosRes = await supabase.from("gastos").select("valor")
  const orcamentoTotal = orcamentoRes.data?.total ?? 0
  const gastoTotal = (gastosRes.data ?? []).reduce((sum: number, g: { valor: number }) => sum + g.valor, 0)
  const saldoDisponivel = orcamentoTotal - gastoTotal

  if (saldoDisponivel < parsed.data.valor && orcamentoTotal > 0) {
    return { error: "saldo_insuficiente", saldoDisponivel, valorGasto: parsed.data.valor }
  }

  const { error } = await supabase.from("gastos").insert({
    data: parsed.data.data, descricao: parsed.data.descricao, valor: parsed.data.valor,
    categoria_id: parsed.data.categoriaId, responsavel_id: parsed.data.responsavelId,
  })

  if (error) return { error: error.message }
  revalidatePath("/gastos")
  revalidatePath("/")
  return { success: true }
}

export async function criarGastoForçado(data: z.infer<typeof GastoSchema>) {
  if (IS_DEMO) return { success: true }

  const parsed = GastoSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.flatten() }

  const supabase = createClient()
  const { error } = await supabase.from("gastos").insert({
    data: parsed.data.data, descricao: parsed.data.descricao, valor: parsed.data.valor,
    categoria_id: parsed.data.categoriaId, responsavel_id: parsed.data.responsavelId,
  })

  if (error) return { error: error.message }
  revalidatePath("/gastos")
  revalidatePath("/")
  return { success: true }
}

export async function editarGasto(id: string, data: z.infer<typeof GastoSchema>) {
  if (IS_DEMO) return { success: true }

  const parsed = GastoSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.flatten() }

  const supabase = createClient()
  const { data: gasto } = await supabase.from("gastos").select("bloqueado").eq("id", id).single()
  if (gasto?.bloqueado) return { error: "Este gasto está bloqueado pois consta em um relatório exportado." }

  const { error } = await supabase.from("gastos").update({
    data: parsed.data.data, descricao: parsed.data.descricao, valor: parsed.data.valor,
    categoria_id: parsed.data.categoriaId, responsavel_id: parsed.data.responsavelId,
  }).eq("id", id)

  if (error) return { error: error.message }
  revalidatePath("/gastos")
  revalidatePath(`/gastos/${id}`)
  revalidatePath("/")
  return { success: true }
}

export async function excluirGasto(id: string) {
  if (IS_DEMO) redirect("/gastos")

  const supabase = createClient()
  const { data: gasto } = await supabase.from("gastos").select("bloqueado").eq("id", id).single()
  if (gasto?.bloqueado) return { error: "Este gasto está bloqueado pois consta em um relatório exportado." }

  const { error } = await supabase.from("gastos").delete().eq("id", id)
  if (error) return { error: error.message }

  revalidatePath("/gastos")
  revalidatePath("/")
  redirect("/gastos")
}

export async function bloquearGastos(ids: string[]) {
  if (IS_DEMO) return { success: true }

  const supabase = createClient()
  const { error } = await supabase.from("gastos").update({ bloqueado: true }).in("id", ids)
  if (error) return { error: error.message }
  revalidatePath("/gastos")
  return { success: true }
}
