import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { GastoForm } from "@/components/financeiro/GastoForm"
import { buscarGastoPorId } from "@/server/queries/gastos"
import { buscarTodasCategorias, buscarTodosUsuarios } from "@/server/actions/orcamento"

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditarGastoPage({ params }: Props) {
  const { id } = await params

  const [gasto, categorias, usuarios] = await Promise.all([
    buscarGastoPorId(id),
    buscarTodasCategorias(),
    buscarTodosUsuarios(),
  ])

  if (!gasto) notFound()
  if (gasto.bloqueado) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-lg font-semibold">🔒 Gasto bloqueado</p>
        <p className="text-muted-foreground text-sm">Este gasto consta em um relatório exportado e não pode ser editado.</p>
        <Button asChild variant="outline"><Link href={`/gastos/${gasto.id}`}>Voltar</Link></Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/gastos/${id}`}><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Editar Gasto</h1>
          <p className="text-sm text-muted-foreground">{gasto.descricao}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Editar dados</CardTitle>
          <CardDescription>Altere as informações do gasto abaixo.</CardDescription>
        </CardHeader>
        <CardContent>
          <GastoForm categorias={categorias} usuarios={usuarios} gastoExistente={gasto} />
        </CardContent>
      </Card>
    </div>
  )
}
