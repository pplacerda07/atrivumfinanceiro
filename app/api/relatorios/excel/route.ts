import { NextRequest, NextResponse } from "next/server"
import * as XLSX from "xlsx"
import { createClient } from "@/lib/supabase/server"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const inicio = searchParams.get("inicio")!
  const fim = searchParams.get("fim")!

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  const { data: gastos, error } = await supabase
    .from("gastos")
    .select(`
      *,
      categoria:categorias(nome),
      responsavel:usuarios(nome),
      comprovantes(id),
      cotacoes(id, fornecedor, valor, aprovada)
    `)
    .gte("data", inicio)
    .lte("data", fim)
    .order("data", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const linhasGastos = (gastos ?? []).map((g) => ({
    Data: g.data,
    "Descrição": g.descricao,
    Categoria: g.categoria?.nome ?? "",
    Responsável: g.responsavel?.nome ?? "",
    "Valor (R$)": g.valor,
    Comprovantes: g.comprovantes.length,
    "Cotações": g.cotacoes.length,
    "Cotação Aprovada": g.cotacoes.find((c: any) => c.aprovada)?.fornecedor ?? "—",
  }))

  const linhasCotacoes = (gastos ?? []).flatMap((g) =>
    g.cotacoes.map((c: any) => ({
      "Gasto": g.descricao,
      Fornecedor: c.fornecedor,
      "Valor Cotado (R$)": c.valor,
      "Aprovada": c.aprovada ? "Sim" : "Não",
    }))
  )

  const wb = XLSX.utils.book_new()

  const wsGastos = XLSX.utils.json_to_sheet(linhasGastos)
  wsGastos["!cols"] = [
    { wch: 12 }, { wch: 35 }, { wch: 20 }, { wch: 20 },
    { wch: 15 }, { wch: 14 }, { wch: 10 }, { wch: 20 },
  ]
  XLSX.utils.book_append_sheet(wb, wsGastos, "Gastos")

  if (linhasCotacoes.length > 0) {
    const wsCotacoes = XLSX.utils.json_to_sheet(linhasCotacoes)
    XLSX.utils.book_append_sheet(wb, wsCotacoes, "Cotações")
  }

  // Resumo
  const total = (gastos ?? []).reduce((s, g) => s + g.valor, 0)
  const linhasResumo = [
    { Campo: "Período início", Valor: inicio },
    { Campo: "Período fim", Valor: fim },
    { Campo: "Total de gastos", Valor: `R$ ${total.toFixed(2)}` },
    { Campo: "Nº de registros", Valor: gastos?.length ?? 0 },
    { Campo: "Gerado em", Valor: new Date().toISOString() },
  ]
  const wsResumo = XLSX.utils.json_to_sheet(linhasResumo)
  XLSX.utils.book_append_sheet(wb, wsResumo, "Resumo")

  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" })

  await supabase.from("log_exportacoes").insert({
    usuario_id: user.id,
    periodo_inicio: inicio,
    periodo_fim: fim,
    formato: "xlsx",
  })

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="relatorio-${inicio}-${fim}.xlsx"`,
    },
  })
}
