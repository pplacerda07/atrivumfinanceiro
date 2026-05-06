"use client"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Trash2, CheckCircle2, Trophy, Loader2, Paperclip } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { formatarMoeda, formatarData } from "@/lib/utils"
import { criarCotacao, aprovarCotacao, excluirCotacao } from "@/server/actions/cotacoes"
import { CotacaoSchema, type CotacaoInput } from "@/lib/validations/cotacao"
import { useToast } from "@/hooks/use-toast"
import type { Cotacao } from "@/types"

interface CotacaoComparadorProps {
  gastoId: string
  cotacoes: Cotacao[]
  bloqueado?: boolean
}

export function CotacaoComparador({ gastoId, cotacoes, bloqueado }: CotacaoComparadorProps) {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [dialogOpen, setDialogOpen] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CotacaoInput>({
    resolver: zodResolver(CotacaoSchema),
    defaultValues: { gastoId, dataCotacao: new Date().toISOString().split("T")[0] },
  })

  const menorValor = cotacoes.length > 0 ? Math.min(...cotacoes.map((c) => c.valor)) : null
  const maiorValor = cotacoes.length > 0 ? Math.max(...cotacoes.map((c) => c.valor)) : null

  const onSubmit = (data: CotacaoInput) => {
    startTransition(async () => {
      const res = await criarCotacao(data)
      if (res?.error) {
        toast({ title: "Erro", description: String(res.error), variant: "destructive" })
        return
      }
      toast({ title: "Cotação adicionada!" })
      reset({ gastoId, dataCotacao: new Date().toISOString().split("T")[0] })
      setDialogOpen(false)
    })
  }

  const handleAprovar = (cotacaoId: string) => {
    startTransition(async () => {
      const res = await aprovarCotacao(cotacaoId, gastoId)
      if (res?.error) {
        toast({ title: "Erro", description: res.error, variant: "destructive" })
        return
      }
      toast({ title: "Cotação aprovada!" })
    })
  }

  const handleExcluir = (cotacaoId: string) => {
    startTransition(async () => {
      const res = await excluirCotacao(cotacaoId, gastoId)
      if (res?.error) {
        toast({ title: "Erro", description: res.error, variant: "destructive" })
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">Cotações</h3>
          <Badge variant={cotacoes.length >= 3 ? "success" : "warning"}>
            {cotacoes.length}/3
          </Badge>
        </div>
        {!bloqueado && cotacoes.length < 3 && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="mr-1 h-4 w-4" /> Adicionar cotação
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Cotação</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <input type="hidden" {...register("gastoId")} />
                <div className="space-y-1.5">
                  <Label>Fornecedor *</Label>
                  <Input placeholder="Nome do fornecedor" {...register("fornecedor")} />
                  {errors.fornecedor && <p className="text-xs text-destructive">{errors.fornecedor.message}</p>}
                </div>
                <div className="grid gap-4 grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Valor (R$) *</Label>
                    <Input type="number" step="0.01" min="0" {...register("valor")} />
                    {errors.valor && <p className="text-xs text-destructive">{errors.valor.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Data da cotação *</Label>
                    <Input type="date" {...register("dataCotacao")} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Prazo de entrega</Label>
                  <Input placeholder="Ex: 5 dias úteis" {...register("prazo")} />
                </div>
                <div className="space-y-1.5">
                  <Label>Observações</Label>
                  <Textarea rows={2} {...register("observacoes")} />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Salvar cotação
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {cotacoes.length < 3 && (
        <Alert variant="warning">
          <AlertDescription>
            Compras devem ter 3 cotações de fornecedores distintos. Faltam {3 - cotacoes.length} cotação(ões).
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {cotacoes.map((cotacao, idx) => {
          const isMenor = cotacao.valor === menorValor && cotacoes.length > 1
          const isMaior = cotacao.valor === maiorValor && cotacoes.length > 1 && menorValor !== maiorValor
          return (
            <Card key={cotacao.id} className={cotacao.aprovada ? "border-2 border-emerald-500" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{cotacao.fornecedor}</CardTitle>
                  <div className="flex gap-1 shrink-0">
                    {isMenor && <Badge variant="success" className="text-xs">Menor</Badge>}
                    {isMaior && <Badge variant="danger" className="text-xs">Maior</Badge>}
                    {cotacao.aprovada && (
                      <Badge variant="success" className="gap-1 text-xs">
                        <CheckCircle2 className="h-3 w-3" /> Aprovada
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Valor</span>
                  <span className="font-bold text-lg">{formatarMoeda(cotacao.valor)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Data</span>
                  <span>{formatarData(cotacao.data_cotacao)}</span>
                </div>
                {cotacao.prazo && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Prazo</span>
                    <span>{cotacao.prazo}</span>
                  </div>
                )}
                {cotacao.observacoes && (
                  <p className="text-xs text-muted-foreground border-t pt-2">{cotacao.observacoes}</p>
                )}
                {cotacao.arquivo && (
                  <a
                    href={cotacao.arquivo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <Paperclip className="h-3 w-3" /> Ver orçamento
                  </a>
                )}

                {!bloqueado && (
                  <div className="flex gap-2 pt-2 border-t">
                    {!cotacao.aprovada && (
                      <Button
                        size="sm"
                        variant="success"
                        className="flex-1 text-xs"
                        onClick={() => handleAprovar(cotacao.id)}
                        disabled={isPending}
                      >
                        <Trophy className="mr-1 h-3 w-3" />
                        Aprovar
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:bg-destructive hover:text-white"
                      onClick={() => handleExcluir(cotacao.id)}
                      disabled={isPending}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}

        {Array.from({ length: Math.max(0, 3 - cotacoes.length) }).map((_, i) => (
          <Card key={`empty-${i}`} className="border-dashed opacity-50">
            <CardContent className="flex h-full min-h-[160px] items-center justify-center">
              <p className="text-sm text-muted-foreground">Cotação {cotacoes.length + i + 1}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {cotacoes.length > 1 && menorValor !== null && (
        <div className="rounded-lg bg-muted px-4 py-2 text-sm">
          <span className="font-medium">Menor valor:</span>{" "}
          {cotacoes.find((c) => c.valor === menorValor)?.fornecedor} —{" "}
          <span className="font-bold text-emerald-600">{formatarMoeda(menorValor)}</span>
        </div>
      )}
    </div>
  )
}
