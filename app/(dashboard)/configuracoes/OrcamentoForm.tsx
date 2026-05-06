"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTransition } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { OrcamentoSchema, type OrcamentoInput } from "@/lib/validations/cotacao"
import { definirOrcamento } from "@/server/actions/orcamento"
import { periodoAtual, formatarMoeda } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import type { Orcamento } from "@/types"

interface Props {
  orcamentoAtual: Orcamento | null
}

export function OrcamentoForm({ orcamentoAtual }: Props) {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  const { register, handleSubmit, formState: { errors } } = useForm<OrcamentoInput>({
    resolver: zodResolver(OrcamentoSchema),
    defaultValues: {
      total: orcamentoAtual?.total ?? 0,
      periodo: periodoAtual(),
    },
  })

  const onSubmit = (data: OrcamentoInput) => {
    startTransition(async () => {
      const res = await definirOrcamento(data)
      if (res?.error) {
        toast({ title: "Erro", description: String(res.error), variant: "destructive" })
        return
      }
      toast({ title: "Orçamento atualizado!" })
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-md">
      {orcamentoAtual && (
        <div className="rounded-lg border bg-muted/50 px-4 py-3">
          <p className="text-xs text-muted-foreground">Orçamento atual</p>
          <p className="text-xl font-bold">{formatarMoeda(orcamentoAtual.total)}</p>
          <p className="text-xs text-muted-foreground">Período: {orcamentoAtual.periodo}</p>
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="total">Orçamento Total (R$)</Label>
        <Input id="total" type="number" step="0.01" min="0" placeholder="Ex: 50000.00" {...register("total")} />
        {errors.total && <p className="text-xs text-destructive">{errors.total.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="periodo">Período (AAAA-MM)</Label>
        <Input id="periodo" placeholder="2026-05" {...register("periodo")} />
        {errors.periodo && <p className="text-xs text-destructive">{errors.periodo.message}</p>}
        <p className="text-xs text-muted-foreground">Formato: AAAA-MM (ex: 2026-05)</p>
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Salvar orçamento
      </Button>
    </form>
  )
}
