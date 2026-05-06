"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTransition, useState } from "react"
import { useRouter } from "next/navigation"
import { GastoSchema, type GastoInput } from "@/lib/validations/gasto"
import { criarGasto, criarGastoForçado, editarGasto } from "@/server/actions/gastos"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { formatarMoeda } from "@/lib/utils"
import { AlertTriangle, Loader2 } from "lucide-react"
import type { Categoria, Usuario, Gasto } from "@/types"
import { useToast } from "@/hooks/use-toast"

interface GastoFormProps {
  categorias: Categoria[]
  usuarios: Usuario[]
  gastoExistente?: Gasto
}

export function GastoForm({ categorias, usuarios, gastoExistente }: GastoFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [alertaSaldo, setAlertaSaldo] = useState<{ saldo: number; valor: number } | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<GastoInput>({
    resolver: zodResolver(GastoSchema),
    defaultValues: gastoExistente
      ? {
          data: gastoExistente.data,
          descricao: gastoExistente.descricao,
          valor: gastoExistente.valor,
          categoriaId: gastoExistente.categoria_id,
          responsavelId: gastoExistente.responsavel_id,
        }
      : { data: new Date().toISOString().split("T")[0] },
  })

  const onSubmit = (data: GastoInput) => {
    startTransition(async () => {
      const res = gastoExistente
        ? await editarGasto(gastoExistente.id, data)
        : await criarGasto(data)

      if (res?.error === "saldo_insuficiente") {
        setAlertaSaldo({ saldo: (res as any).saldoDisponivel, valor: (res as any).valorGasto })
        return
      }

      if (res?.error) {
        toast({ title: "Erro", description: String(res.error), variant: "destructive" })
        return
      }

      toast({ title: "Sucesso!", description: gastoExistente ? "Gasto atualizado." : "Gasto registrado.", variant: "success" as any })
      router.push("/gastos")
    })
  }

  const onConfirmarExtrapolacao = () => {
    const data = watch()
    startTransition(async () => {
      const res = await criarGastoForçado(data)
      if (res?.error) {
        toast({ title: "Erro", description: String(res.error), variant: "destructive" })
        return
      }
      setAlertaSaldo(null)
      toast({ title: "Gasto registrado", description: "Orçamento excedido confirmado pelo gestor." })
      router.push("/gastos")
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {alertaSaldo && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Saldo insuficiente</AlertTitle>
          <AlertDescription className="space-y-3">
            <p>
              O valor deste gasto ({formatarMoeda(alertaSaldo.valor)}) é maior que o saldo
              disponível ({formatarMoeda(alertaSaldo.saldo)}). Deseja prosseguir mesmo assim?
            </p>
            <div className="flex gap-2">
              <Button type="button" variant="destructive" size="sm" onClick={onConfirmarExtrapolacao} disabled={isPending}>
                Confirmar e registrar
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setAlertaSaldo(null)}>
                Cancelar
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="data">Data *</Label>
          <Input id="data" type="date" {...register("data")} />
          {errors.data && <p className="text-xs text-destructive">{errors.data.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="valor">Valor (R$) *</Label>
          <Input id="valor" type="number" step="0.01" min="0" placeholder="0,00" {...register("valor")} />
          {errors.valor && <p className="text-xs text-destructive">{errors.valor.message}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="descricao">Descrição do material/serviço *</Label>
        <Textarea id="descricao" placeholder="Ex: Reagente X para experimento Y..." rows={2} {...register("descricao")} />
        {errors.descricao && <p className="text-xs text-destructive">{errors.descricao.message}</p>}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Categoria *</Label>
          <Select
            defaultValue={gastoExistente?.categoria_id}
            onValueChange={(v) => setValue("categoriaId", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {categorias.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.categoriaId && <p className="text-xs text-destructive">{errors.categoriaId.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label>Responsável *</Label>
          <Select
            defaultValue={gastoExistente?.responsavel_id}
            onValueChange={(v) => setValue("responsavelId", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o responsável" />
            </SelectTrigger>
            <SelectContent>
              {usuarios.map((u) => (
                <SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.responsavelId && <p className="text-xs text-destructive">{errors.responsavelId.message}</p>}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {gastoExistente ? "Salvar alterações" : "Registrar gasto"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
