import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CotacaoComparador } from "@/components/financeiro/CotacaoComparador"
import { ComprovanteUpload } from "@/components/financeiro/ComprovanteUpload"
import { buscarGastoPorId } from "@/server/queries/gastos"
import { formatarData, formatarDataHora, formatarMoeda } from "@/lib/utils"
import { ExcluirGastoButton } from "./ExcluirGastoButton"

interface Props {
  params: Promise<{ id: string }>
}

export default async function DetalheGastoPage({ params }: Props) {
  const { id } = await params
  const gasto = await buscarGastoPorId(id)
  if (!gasto) notFound()

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/gastos"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{gasto.descricao}</h1>
            <p className="text-sm text-muted-foreground">
              {formatarData(gasto.data)} · {gasto.categoria?.nome}
            </p>
          </div>
        </div>

        {!gasto.bloqueado && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/gastos/${gasto.id}/editar`}>
                Editar
              </Link>
            </Button>
            <ExcluirGastoButton gastoId={gasto.id} />
          </div>
        )}
      </div>

      {gasto.bloqueado && (
        <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
          🔒 Este gasto está bloqueado pois foi incluído em um relatório exportado.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Informações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Valor</p>
              <p className="text-2xl font-bold">{formatarMoeda(gasto.valor)}</p>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Data</p>
                <p className="text-sm">{formatarData(gasto.data)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Categoria</p>
                <Badge variant="secondary">{gasto.categoria?.nome}</Badge>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Responsável</p>
                <p className="text-sm">{gasto.responsavel?.nome}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Status</p>
                <Badge variant={gasto.comprovantes.length > 0 ? "success" : "warning"}>
                  {gasto.comprovantes.length > 0 ? "✅ Comprovado" : "⚠️ Pendente"}
                </Badge>
              </div>
            </div>
            <Separator />
            <div>
              <p className="text-xs font-medium text-muted-foreground">Registrado em</p>
              <p className="text-xs text-muted-foreground">{formatarDataHora(gasto.criado_em)}</p>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <ComprovanteUpload
                gastoId={gasto.id}
                comprovantes={gasto.comprovantes}
                bloqueado={gasto.bloqueado}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <CotacaoComparador
                gastoId={gasto.id}
                cotacoes={gasto.cotacoes}
                bloqueado={gasto.bloqueado}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
