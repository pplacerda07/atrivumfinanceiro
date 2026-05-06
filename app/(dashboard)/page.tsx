import Link from "next/link"
import { Plus, FileDown, ClipboardList, TrendingUp, TrendingDown, Wallet, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { GraficoGastosPorCategoria } from "@/components/financeiro/GraficoGastosPorCategoria"
import { AlertaSaldo } from "@/components/financeiro/AlertaSaldo"
import { buscarDadosDashboard } from "@/server/queries/dashboard"
import { formatarMoeda, formatarData } from "@/lib/utils"

export default async function DashboardPage() {
  const dados = await buscarDadosDashboard()
  const percentualRestante = 100 - dados.percentualUtilizado

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Visão geral das finanças do laboratório</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/gastos/novo">
              <Plus className="mr-2 h-4 w-4" /> Novo Gasto
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/relatorios">
              <FileDown className="mr-2 h-4 w-4" /> Exportar
            </Link>
          </Button>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Orçamento Total</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatarMoeda(dados.orcamentoTotal)}</div>
            <p className="text-xs text-muted-foreground">Período atual</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Gasto</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatarMoeda(dados.gastoTotal)}</div>
            <div className="mt-1">
              <Progress
                value={dados.percentualUtilizado}
                className="h-1.5"
                indicatorClassName={
                  dados.percentualUtilizado >= 100 ? "bg-red-500" :
                  dados.percentualUtilizado >= 80 ? "bg-orange-500" : "bg-primary"
                }
              />
              <p className="mt-1 text-xs text-muted-foreground">{dados.percentualUtilizado}% utilizado</p>
            </div>
          </CardContent>
        </Card>

        <Card className={dados.alertaSaldo ? "border-orange-300 bg-orange-50" : ""}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Saldo Disponível</CardTitle>
            {dados.alertaSaldo
              ? <AlertTriangle className="h-4 w-4 text-orange-500" />
              : <TrendingUp className="h-4 w-4 text-emerald-500" />
            }
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${dados.saldoDisponivel < 0 ? "text-red-600" : dados.alertaSaldo ? "text-orange-600" : "text-emerald-600"}`}>
              {formatarMoeda(dados.saldoDisponivel)}
            </div>
            <p className="text-xs text-muted-foreground">{percentualRestante}% restante</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Gráfico */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">Gastos por Categoria</CardTitle>
            <CardDescription>Distribuição das despesas no período atual</CardDescription>
          </CardHeader>
          <CardContent>
            <GraficoGastosPorCategoria dados={dados.gastosPorCategoria} />
          </CardContent>
        </Card>

        {/* Alertas */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Alertas</CardTitle>
          </CardHeader>
          <CardContent>
            <AlertaSaldo alertas={dados.alertas} />
          </CardContent>
        </Card>
      </div>

      {/* Últimos gastos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Últimos Gastos</CardTitle>
            <CardDescription>5 registros mais recentes</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/gastos">
              <ClipboardList className="mr-2 h-4 w-4" /> Ver todos
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {dados.ultimosGastos.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nenhum gasto registrado. <Link href="/gastos/novo" className="text-primary underline">Adicionar primeiro gasto</Link>
            </p>
          ) : (
            <div className="space-y-3">
              {dados.ultimosGastos.map((gasto) => (
                <Link
                  key={gasto.id}
                  href={`/gastos/${gasto.id}`}
                  className="flex items-center justify-between rounded-lg border px-4 py-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">
                      {gasto.categoria?.nome?.charAt(0) ?? "?"}
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-none">{gasto.descricao}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {gasto.categoria?.nome} · {formatarData(gasto.data)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={gasto.comprovantes.length > 0 ? "success" : "warning"} className="text-xs">
                      {gasto.comprovantes.length > 0 ? "✓ Comprovado" : "⚠ Pendente"}
                    </Badge>
                    <span className="font-semibold tabular-nums">{formatarMoeda(gasto.valor)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
