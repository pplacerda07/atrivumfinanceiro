import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GastoTabela } from "@/components/financeiro/GastoTabela"
import { buscarGastos } from "@/server/queries/gastos"
import { buscarTodasCategorias, buscarTodosUsuarios } from "@/server/actions/orcamento"
import type { FiltrosGasto } from "@/types"
import { FiltrosGastoClient } from "./FiltrosGastoClient"

interface Props {
  searchParams: Promise<{
    categoriaId?: string
    responsavelId?: string
    dataInicio?: string
    dataFim?: string
    statusComprovante?: string
    statusCotacao?: string
  }>
}

export default async function GastosPage({ searchParams }: Props) {
  const sp = await searchParams

  const filtros: FiltrosGasto = {
    categoriaId: sp.categoriaId,
    responsavelId: sp.responsavelId,
    dataInicio: sp.dataInicio,
    dataFim: sp.dataFim,
    statusComprovante: sp.statusComprovante as any,
    statusCotacao: sp.statusCotacao as any,
  }

  const [gastos, categorias, usuarios] = await Promise.all([
    buscarGastos(filtros),
    buscarTodasCategorias(),
    buscarTodosUsuarios(),
  ])

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gastos</h1>
          <p className="text-sm text-muted-foreground">Gerencie todas as despesas do laboratório</p>
        </div>
        <Button asChild>
          <Link href="/gastos/novo">
            <Plus className="mr-2 h-4 w-4" /> Novo Gasto
          </Link>
        </Button>
      </div>

      <FiltrosGastoClient categorias={categorias} usuarios={usuarios} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {gastos.length} registro(s) encontrado(s)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <GastoTabela gastos={gastos} />
        </CardContent>
      </Card>
    </div>
  )
}
