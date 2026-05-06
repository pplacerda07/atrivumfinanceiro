"use client"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import type { Categoria, Usuario } from "@/types"

interface Props {
  categorias: Categoria[]
  usuarios: Usuario[]
}

export function FiltrosGastoClient({ categorias, usuarios }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const atualizarFiltro = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value && value !== "todos") {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.push(`/gastos?${params.toString()}`)
    },
    [router, searchParams]
  )

  const limparFiltros = () => router.push("/gastos")
  const temFiltros = searchParams.toString() !== ""

  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium flex items-center gap-2">
          <Search className="h-4 w-4" /> Filtros
        </h2>
        {temFiltros && (
          <Button variant="ghost" size="sm" onClick={limparFiltros} className="text-muted-foreground">
            <X className="mr-1 h-3.5 w-3.5" /> Limpar filtros
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <div className="space-y-1">
          <Label className="text-xs">Data início</Label>
          <Input
            type="date"
            defaultValue={searchParams.get("dataInicio") ?? ""}
            onChange={(e) => atualizarFiltro("dataInicio", e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Data fim</Label>
          <Input
            type="date"
            defaultValue={searchParams.get("dataFim") ?? ""}
            onChange={(e) => atualizarFiltro("dataFim", e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Categoria</Label>
          <Select
            defaultValue={searchParams.get("categoriaId") ?? "todos"}
            onValueChange={(v) => atualizarFiltro("categoriaId", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas as categorias</SelectItem>
              {categorias.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Responsável</Label>
          <Select
            defaultValue={searchParams.get("responsavelId") ?? "todos"}
            onValueChange={(v) => atualizarFiltro("responsavelId", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os responsáveis</SelectItem>
              {usuarios.map((u) => (
                <SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Comprovante</Label>
          <Select
            defaultValue={searchParams.get("statusComprovante") ?? "todos"}
            onValueChange={(v) => atualizarFiltro("statusComprovante", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="comprovado">✅ Comprovado</SelectItem>
              <SelectItem value="pendente">⚠️ Pendente</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Cotações</Label>
          <Select
            defaultValue={searchParams.get("statusCotacao") ?? "todos"}
            onValueChange={(v) => atualizarFiltro("statusCotacao", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="completa">3 cotações</SelectItem>
              <SelectItem value="incompleta">Incompletas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
