"use server"
import { createClient } from "@/lib/supabase/server"
import { OrcamentoSchema, CategoriaSchema } from "@/lib/validations/cotacao"
import { revalidatePath } from "next/cache"
import { periodoAtual } from "@/lib/utils"
import { z } from "zod"
import { IS_DEMO, DEMO_CATEGORIAS, DEMO_USUARIOS, DEMO_ORCAMENTO } from "@/lib/demo-data"

export async function definirOrcamento(data: z.infer<typeof OrcamentoSchema>) {
  if (IS_DEMO) return { success: true }

  const parsed = OrcamentoSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.flatten() }

  const supabase = createClient()
  const { data: existente } = await supabase.from("orcamento").select("id").eq("periodo", parsed.data.periodo).maybeSingle()

  if (existente) {
    const { error } = await supabase.from("orcamento").update({ total: parsed.data.total }).eq("id", existente.id)
    if (error) return { error: error.message }
  } else {
    const { error } = await supabase.from("orcamento").insert({ total: parsed.data.total, periodo: parsed.data.periodo })
    if (error) return { error: error.message }
  }

  revalidatePath("/")
  revalidatePath("/configuracoes")
  return { success: true }
}

export async function buscarOrcamentoAtual() {
  if (IS_DEMO) return DEMO_ORCAMENTO

  const supabase = createClient()
  const periodo = periodoAtual()
  const { data } = await supabase.from("orcamento").select("*").eq("periodo", periodo).maybeSingle()
  return data
}

export async function criarCategoria(data: z.infer<typeof CategoriaSchema>) {
  if (IS_DEMO) return { success: true }

  const parsed = CategoriaSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.flatten() }

  const supabase = createClient()
  const { error } = await supabase.from("categorias").insert({ nome: parsed.data.nome })
  if (error) return { error: error.message }

  revalidatePath("/configuracoes")
  revalidatePath("/gastos")
  return { success: true }
}

export async function editarCategoria(id: string, nome: string) {
  if (IS_DEMO) return { success: true }

  const supabase = createClient()
  const { error } = await supabase.from("categorias").update({ nome }).eq("id", id)
  if (error) return { error: error.message }

  revalidatePath("/configuracoes")
  revalidatePath("/gastos")
  return { success: true }
}

export async function excluirCategoria(id: string) {
  if (IS_DEMO) return { success: true }

  const supabase = createClient()
  const { error } = await supabase.from("categorias").delete().eq("id", id)
  if (error) return { error: error.message }

  revalidatePath("/configuracoes")
  return { success: true }
}

export async function buscarTodosUsuarios() {
  if (IS_DEMO) return DEMO_USUARIOS

  const supabase = createClient()
  const { data } = await supabase.from("usuarios").select("*").order("nome")
  return data ?? []
}

export async function buscarTodasCategorias() {
  if (IS_DEMO) return DEMO_CATEGORIAS

  const supabase = createClient()
  const { data } = await supabase.from("categorias").select("*").order("nome")
  return data ?? []
}
