import { TrendingDown, Wallet, AlertTriangle } from "lucide-react"
import { formatarMoeda, calcularPercentual, getCorSaldo } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface BarraResumoFinanceiroProps {
  orcamentoTotal: number
  gastoTotal: number
  saldoDisponivel: number
}

export function BarraResumoFinanceiro({
  orcamentoTotal,
  gastoTotal,
  saldoDisponivel,
}: BarraResumoFinanceiroProps) {
  const percentualGasto = calcularPercentual(gastoTotal, orcamentoTotal)
  const percentualRestante = 100 - percentualGasto
  const corSaldo = getCorSaldo(percentualRestante)
  const critico = percentualRestante <= 20 && orcamentoTotal > 0

  return (
    <div className="border-b bg-card px-6 py-3">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Orçamento</span>
          <span className="text-sm font-semibold">{formatarMoeda(orcamentoTotal)}</span>
        </div>

        <div className="flex items-center gap-2">
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Gasto</span>
          <span className="text-sm font-semibold">{formatarMoeda(gastoTotal)}</span>
        </div>

        <div className="flex items-center gap-2">
          {critico && <AlertTriangle className="h-4 w-4 text-orange-500" />}
          <span className="text-xs text-muted-foreground">Saldo</span>
          <span className={cn("text-sm font-bold", corSaldo)}>
            {formatarMoeda(saldoDisponivel)}
          </span>
        </div>

        <div className="flex flex-1 items-center gap-2 max-w-xs">
          <Progress
            value={percentualGasto}
            className="h-2 flex-1"
            indicatorClassName={cn(
              percentualGasto >= 100 ? "bg-red-500" :
              percentualGasto >= 80 ? "bg-orange-500" :
              percentualGasto >= 60 ? "bg-yellow-500" : "bg-primary"
            )}
          />
          <span className="text-xs text-muted-foreground w-10 text-right">{percentualGasto}%</span>
        </div>
      </div>
    </div>
  )
}
