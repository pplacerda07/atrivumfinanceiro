"use client"
import Link from "next/link"
import { Eye, Pencil, FileText, Image, CheckCircle2, AlertCircle, ClipboardCheck } from "lucide-react"
import {
  Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatarData, formatarMoeda } from "@/lib/utils"
import type { GastoComRelacoes } from "@/types"

interface GastoTabelaProps {
  gastos: GastoComRelacoes[]
}

function StatusComprovante({ comprovantes }: { comprovantes: GastoComRelacoes["comprovantes"] }) {
  if (comprovantes.length > 0) {
    return (
      <div className="flex items-center gap-1">
        {comprovantes[0].tipo === "pdf"
          ? <FileText className="h-3.5 w-3.5 text-red-500" />
          : <Image className="h-3.5 w-3.5 text-blue-500" />
        }
        <Badge variant="success">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          {comprovantes.length} comprov.
        </Badge>
      </div>
    )
  }
  return (
    <Badge variant="warning">
      <AlertCircle className="mr-1 h-3 w-3" />
      Pendente
    </Badge>
  )
}

function StatusCotacoes({ cotacoes }: { cotacoes: GastoComRelacoes["cotacoes"] }) {
  const n = cotacoes.length
  if (n === 0) return <span className="text-xs text-muted-foreground">—</span>
  return (
    <div className="flex items-center gap-1">
      <ClipboardCheck className={`h-3.5 w-3.5 ${n >= 3 ? "text-emerald-500" : "text-amber-500"}`} />
      <span className="text-xs font-medium">{n}/3</span>
    </div>
  )
}

export function GastoTabela({ gastos }: GastoTabelaProps) {
  const total = gastos.reduce((sum, g) => sum + g.valor, 0)

  if (gastos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Receipt className="mb-3 h-12 w-12 opacity-30" />
        <p className="text-sm">Nenhum gasto encontrado</p>
        <p className="text-xs">Adicione um novo gasto para começar</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Data</TableHead>
          <TableHead>Descrição</TableHead>
          <TableHead>Categoria</TableHead>
          <TableHead>Responsável</TableHead>
          <TableHead className="text-right">Valor</TableHead>
          <TableHead>Comprovante</TableHead>
          <TableHead>Cotações</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {gastos.map((gasto) => (
          <TableRow key={gasto.id} className={gasto.bloqueado ? "opacity-70" : ""}>
            <TableCell className="text-sm whitespace-nowrap">
              {formatarData(gasto.data)}
            </TableCell>
            <TableCell>
              <div>
                <p className="text-sm font-medium leading-none">{gasto.descricao}</p>
                {gasto.bloqueado && (
                  <span className="text-xs text-muted-foreground">🔒 Exportado</span>
                )}
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="secondary">{gasto.categoria?.nome ?? "—"}</Badge>
            </TableCell>
            <TableCell className="text-sm">{gasto.responsavel?.nome ?? "—"}</TableCell>
            <TableCell className="text-right font-medium tabular-nums">
              {formatarMoeda(gasto.valor)}
            </TableCell>
            <TableCell>
              <StatusComprovante comprovantes={gasto.comprovantes} />
            </TableCell>
            <TableCell>
              <StatusCotacoes cotacoes={gasto.cotacoes} />
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-1">
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/gastos/${gasto.id}`}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
                {!gasto.bloqueado && (
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/gastos/${gasto.id}/editar`}>
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={4} className="font-medium">Total ({gastos.length} registros)</TableCell>
          <TableCell className="text-right font-bold tabular-nums">
            {formatarMoeda(total)}
          </TableCell>
          <TableCell colSpan={3} />
        </TableRow>
      </TableFooter>
    </Table>
  )
}

function Receipt({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
}
