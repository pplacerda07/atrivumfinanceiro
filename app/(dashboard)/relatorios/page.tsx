"use client"
import { useState, useTransition } from "react"
import { FileDown, FileSpreadsheet, AlertTriangle, Loader2, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { formatarMoeda } from "@/lib/utils"

export default function RelatoriosPage() {
  const hoje = new Date()
  const primeiroDia = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-01`
  const ultimoDia = hoje.toISOString().split("T")[0]

  const [dataInicio, setDataInicio] = useState(primeiroDia)
  const [dataFim, setDataFim] = useState(ultimoDia)
  const [preview, setPreview] = useState<any>(null)
  const [isPending, startTransition] = useTransition()
  const [gerandoPDF, setGerandoPDF] = useState(false)
  const [gerandoExcel, setGerandoExcel] = useState(false)

  const buscarPreview = () => {
    startTransition(async () => {
      const res = await fetch(`/api/relatorios/preview?inicio=${dataInicio}&fim=${dataFim}`)
      const data = await res.json()
      setPreview(data)
    })
  }

  const exportarPDF = async () => {
    setGerandoPDF(true)
    try {
      const url = `/api/relatorios/pdf?inicio=${dataInicio}&fim=${dataFim}`
      const res = await fetch(url)
      const blob = await res.blob()
      const a = document.createElement("a")
      a.href = URL.createObjectURL(blob)
      a.download = `relatorio-${dataInicio}-${dataFim}.pdf`
      a.click()
    } finally {
      setGerandoPDF(false)
    }
  }

  const exportarExcel = async () => {
    setGerandoExcel(true)
    try {
      const url = `/api/relatorios/excel?inicio=${dataInicio}&fim=${dataFim}`
      const res = await fetch(url)
      const blob = await res.blob()
      const a = document.createElement("a")
      a.href = URL.createObjectURL(blob)
      a.download = `relatorio-${dataInicio}-${dataFim}.xlsx`
      a.click()
    } finally {
      setGerandoExcel(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Prestação de Contas</h1>
        <p className="text-sm text-muted-foreground">Gere relatórios financeiros em PDF ou Excel</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">1. Selecionar período</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-1.5">
              <Label>Data início</Label>
              <Input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Data fim</Label>
              <Input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
            </div>
            <Button onClick={buscarPreview} disabled={isPending} variant="outline">
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Pré-visualizar resumo
            </Button>
          </div>
        </CardContent>
      </Card>

      {preview && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">2. Resumo do período</CardTitle>
              <CardDescription>{dataInicio} → {dataFim}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-4 mb-6">
                <div className="rounded-lg border p-4">
                  <p className="text-xs text-muted-foreground">Total de Gastos</p>
                  <p className="text-xl font-bold">{formatarMoeda(preview.resumo?.totalGastos ?? 0)}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-xs text-muted-foreground">Nº de Registros</p>
                  <p className="text-xl font-bold">{preview.gastos?.length ?? 0}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-xs text-muted-foreground">Comprovantes</p>
                  <p className="text-xl font-bold">{preview.resumo?.numComprovantes ?? 0}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-xs text-muted-foreground">Cotações</p>
                  <p className="text-xl font-bold">{preview.resumo?.numCotacoes ?? 0}</p>
                </div>
              </div>

              {preview.resumo?.totalPorCategoria?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Por categoria:</p>
                  <div className="space-y-1">
                    {preview.resumo.totalPorCategoria.map((cat: any) => (
                      <div key={cat.categoria} className="flex items-center justify-between rounded px-3 py-2 bg-muted/50">
                        <span className="text-sm">{cat.categoria}</span>
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary">{cat.count} item(s)</Badge>
                          <span className="text-sm font-semibold tabular-nums">{formatarMoeda(cat.total)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {preview.resumo?.gastosSemdComprovante?.length > 0 && (
            <Alert variant="warning">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Atenção: gastos sem comprovante</AlertTitle>
              <AlertDescription>
                {preview.resumo.gastosSemdComprovante.length} gasto(s) sem comprovante serão incluídos no relatório.
                Recomenda-se anexar os comprovantes antes de exportar.
                <ul className="mt-2 space-y-1">
                  {preview.resumo.gastosSemdComprovante.slice(0, 5).map((g: any) => (
                    <li key={g.id} className="text-xs">• {g.descricao} — {formatarMoeda(g.valor)}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {preview.resumo?.gastosSemdComprovante?.length === 0 && (
            <Alert variant="success">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Tudo certo!</AlertTitle>
              <AlertDescription>Todos os gastos possuem comprovantes.</AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">3. Exportar relatório</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Button onClick={exportarPDF} disabled={gerandoPDF || gerandoExcel} className="gap-2">
                  {gerandoPDF
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <FileDown className="h-4 w-4" />
                  }
                  Exportar PDF
                </Button>
                <Button onClick={exportarExcel} variant="outline" disabled={gerandoExcel || gerandoPDF} className="gap-2">
                  {gerandoExcel
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <FileSpreadsheet className="h-4 w-4" />
                  }
                  Exportar Excel (.xlsx)
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
