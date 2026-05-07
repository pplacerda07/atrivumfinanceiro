import { NextRequest, NextResponse } from "next/server"
import { renderToBuffer } from "@react-pdf/renderer"
import React from "react"
import { createClient } from "@/lib/supabase/server"
import { RelatorioPDF } from "@/lib/pdf"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const inicio = searchParams.get("inicio")!
  const fim = searchParams.get("fim")!

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  const [{ data: gastos, error }, orcamentoRes] = await Promise.all([
    supabase
      .from("gastos")
      .select(`
        *,
        categoria:categorias(id, nome),
        responsavel:usuarios(id, nome, email, perfil),
        comprovantes(*),
        cotacoes(*)
      `)
      .gte("data", inicio)
      .lte("data", fim)
      .order("data", { ascending: false }),
    supabase
      .from("orcamento")
      .select("total")
      .order("criado_em", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const buffer = await renderToBuffer(
    React.createElement(RelatorioPDF, {
      gastos: (gastos ?? []) as any,
      periodo: { inicio, fim },
      orcamentoTotal: orcamentoRes.data?.total ?? 0,
    }) as React.ReactElement<any>
  )

  await supabase.from("log_exportacoes").insert({
    usuario_id: user.id,
    periodo_inicio: inicio,
    periodo_fim: fim,
    formato: "pdf",
  })

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="relatorio-${inicio}-${fim}.pdf"`,
    },
  })
}
