"use client"
import { useState, useTransition } from "react"
import { Plus, Pencil, Trash2, Loader2, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { criarCategoria, editarCategoria, excluirCategoria } from "@/server/actions/orcamento"
import { useToast } from "@/hooks/use-toast"
import type { Categoria } from "@/types"

const CATEGORIAS_PADRAO = ["Material de consumo", "Equipamento", "Serviço", "Outros"]

interface Props {
  categorias: Categoria[]
}

export function CategoriasManager({ categorias }: Props) {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [novoNome, setNovoNome] = useState("")
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [editandoNome, setEditandoNome] = useState("")

  const handleCriar = () => {
    if (!novoNome.trim()) return
    startTransition(async () => {
      const res = await criarCategoria({ nome: novoNome.trim() })
      if (res?.error) {
        toast({ title: "Erro", description: String(res.error), variant: "destructive" })
        return
      }
      toast({ title: "Categoria criada!" })
      setNovoNome("")
    })
  }

  const handleEditar = (id: string) => {
    startTransition(async () => {
      const res = await editarCategoria(id, editandoNome.trim())
      if (res?.error) {
        toast({ title: "Erro", description: String(res.error), variant: "destructive" })
        return
      }
      toast({ title: "Categoria atualizada!" })
      setEditandoId(null)
    })
  }

  const handleExcluir = (id: string) => {
    startTransition(async () => {
      const res = await excluirCategoria(id)
      if (res?.error) {
        toast({ title: "Erro", description: res.error, variant: "destructive" })
        return
      }
      toast({ title: "Categoria removida" })
    })
  }

  return (
    <div className="space-y-4 max-w-md">
      <div className="flex gap-2">
        <Input
          placeholder="Nome da nova categoria"
          value={novoNome}
          onChange={(e) => setNovoNome(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCriar()}
        />
        <Button onClick={handleCriar} disabled={isPending || !novoNome.trim()}>
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        </Button>
      </div>

      <div className="space-y-2">
        {categorias.map((cat) => {
          const isPadrao = CATEGORIAS_PADRAO.includes(cat.nome)
          return (
            <div key={cat.id} className="flex items-center justify-between rounded-lg border px-4 py-2.5">
              {editandoId === cat.id ? (
                <div className="flex flex-1 items-center gap-2">
                  <Input
                    value={editandoNome}
                    onChange={(e) => setEditandoNome(e.target.value)}
                    className="h-8"
                    autoFocus
                  />
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-600" onClick={() => handleEditar(cat.id)} disabled={isPending}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditandoId(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{cat.nome}</span>
                    {isPadrao && <Badge variant="secondary" className="text-xs">Padrão</Badge>}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => { setEditandoId(cat.id); setEditandoNome(cat.nome) }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive hover:bg-destructive/10"
                      onClick={() => handleExcluir(cat.id)}
                      disabled={isPending}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
