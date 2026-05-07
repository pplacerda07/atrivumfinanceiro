"use server"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { IS_DEMO } from "@/lib/demo-data"

export async function salvarComprovante(gastoId: string, path: string, tipo: string) {
  if (IS_DEMO) return { success: true }

  const supabase = await createClient()
  const { data: urlData } = supabase.storage.from("crm-financeiro").getPublicUrl(path)

  const { error } = await supabase.from("comprovantes").insert({
    gasto_id: gastoId,
    arquivo: urlData.publicUrl,
    tipo,
  })

  if (error) return { error: error.message }
  revalidatePath(`/gastos/${gastoId}`)
  return { success: true }
}

export async function excluirComprovante(id: string, gastoId: string) {
  if (IS_DEMO) return { success: true }

  const supabase = await createClient()
  const { error } = await supabase.from("comprovantes").delete().eq("id", id)
  if (error) return { error: error.message }

  revalidatePath(`/gastos/${gastoId}`)
  return { success: true }
}
