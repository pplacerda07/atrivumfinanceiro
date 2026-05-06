import { AlertTriangle, TrendingDown, Info, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { Alerta } from "@/types"

interface AlertaSaldoProps {
  alertas: Alerta[]
}

const iconePorTipo = {
  saldo_critico: AlertTriangle,
  sem_comprovante: Info,
  cotacao_incompleta: Info,
  orcamento_excedido: TrendingDown,
}

const variantePorTipo: Record<Alerta["tipo"], "warning" | "destructive" | "info"> = {
  saldo_critico: "warning",
  sem_comprovante: "info",
  cotacao_incompleta: "info",
  orcamento_excedido: "destructive",
}

const tituloPorTipo: Record<Alerta["tipo"], string> = {
  saldo_critico: "Saldo Crítico",
  sem_comprovante: "Comprovantes Pendentes",
  cotacao_incompleta: "Cotações Incompletas",
  orcamento_excedido: "Orçamento Excedido",
}

export function AlertaSaldo({ alertas }: AlertaSaldoProps) {
  if (alertas.length === 0) {
    return (
      <Alert variant="success">
        <CheckCircle2 className="h-4 w-4" />
        <AlertTitle>Tudo em ordem</AlertTitle>
        <AlertDescription>Nenhum alerta financeiro no momento.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-2">
      {alertas.map((alerta, i) => {
        const Icone = iconePorTipo[alerta.tipo]
        return (
          <Alert key={i} variant={variantePorTipo[alerta.tipo]}>
            <Icone className="h-4 w-4" />
            <AlertTitle>{tituloPorTipo[alerta.tipo]}</AlertTitle>
            <AlertDescription>{alerta.mensagem}</AlertDescription>
          </Alert>
        )
      })}
    </div>
  )
}
