import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GastoForm } from "@/components/financeiro/GastoForm"
import { buscarTodasCategorias, buscarTodosUsuarios } from "@/server/actions/orcamento"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function NovoGastoPage() {
  const [categorias, usuarios] = await Promise.all([
    buscarTodasCategorias(),
    buscarTodosUsuarios(),
  ])

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/gastos"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Novo Gasto</h1>
          <p className="text-sm text-muted-foreground">Registre uma nova despesa do laboratório</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do gasto</CardTitle>
          <CardDescription>
            Preencha as informações sobre a despesa realizada. Após salvar, você poderá
            anexar comprovantes e registrar cotações.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GastoForm categorias={categorias} usuarios={usuarios} />
        </CardContent>
      </Card>
    </div>
  )
}
