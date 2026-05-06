"use server"
import { createClient } from "@/lib/supabase/server"
import { CotacaoSchema } from "@/lib/validations/cotacao"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { IS_DEMO } from "@/lib/demo-data"

export async function criarCotacao(data: z.infer<typeof CotacaoSchema>) {
  if (IS_DEMO) return { success: true }

  const parsed = CotacaoSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.flatten() }

  const supabase = createClient()
  const { count } = await supabase.from("cotacoes").select("id", { count: "exact" }).eq("gasto_id", parsed.data.gastoId)
  if ((count ?? 0) >= 3) return { error: "Este gasto já possui 3 cotações (máximo permitido)." }

  const { data: existente } = await supabase.from("cotacoes").select("id").eq("gasto_id", parsed.data.gastoId).eq("fornecedor", parsed.data.fornecedor).maybeSingle()
  if (existente) return { error: "Já existe uma cotação deste fornecedor para este gasto." }

  const { error } = await supabase.from("cotacoes").insert({
    gasto_id: parsed.data.gastoId, fornecedor: parsed.data.fornecedor,
    valor: parsed.data.valor, data_cotacao: parsed.data.dataCotacao,
    prazo: parsed.data.prazo ?? null, observacoes: parsed.data.observacoes ?? null,
  })

  if (error) return { error: error.message }
  revalidatePath(`/gastos/${parsed.data.gastoId}`)
  revalidatePath(`/cotacoes/${parsed.data.gastoId}`)
  return { success: true }
}

export async function aprovarCotacao(cotacaoId: string, gastoId: string) {
  if (IS_DEMO) return { success: true }

  const supabase = createClient()
  await supabase.from("cotacoes").update({ aprovada: false }).eq("gasto_id", gastoId)
  const { error } = await supabase.from("cotacoes").update({ aprovada: true }).eq("id", cotacaoId)
  if (error) return { error: error.message }

  revalidatePath(`/cotacoes/${gastoId}`)
  revalidatePath(`/gastos/${gastoId}`)
  return { success: true }
}

export async function excluirCotacao(id: string, gastoId: string) {
  if (IS_DEMO) return { success: true }

  const supabase = createClient()
  const { error } = await supabase.from("cotacoes").delete().eq("id", id)
  if (error) return { error: error.message }

  revalidatePath(`/cotacoes/${gastoId}`)
  revalidatePath(`/gastos/${gastoId}`)
  return { success: true }
}

export async function salvarArquivoCotacao(cotacaoId: string, gastoId: string, path: string) {
  if (IS_DEMO) return { success: true }

  const supabase = createClient()
  const { data: urlData } = supabase.storage.from("crm-financeiro").getPublicUrl(path)
  const { error } = await supabase.from("cotacoes").update({ arquivo: urlData.publicUrl }).eq("id", cotacaoId)
  if (error) return { error: error.message }

  revalidatePath(`/cotacoes/${gastoId}`)
  return { success: true }
}
