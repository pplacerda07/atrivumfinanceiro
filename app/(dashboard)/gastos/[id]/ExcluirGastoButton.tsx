"use client"
import { useTransition, useState } from "react"
import { Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog"
import { excluirGasto } from "@/server/actions/gastos"
import { useToast } from "@/hooks/use-toast"

export function ExcluirGastoButton({ gastoId }: { gastoId: string }) {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)

  const handleExcluir = () => {
    startTransition(async () => {
      const res = await excluirGasto(gastoId)
      if (res?.error) {
        toast({ title: "Erro", description: res.error, variant: "destructive" })
        setOpen(false)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="mr-2 h-4 w-4" /> Excluir
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir gasto</DialogTitle>
          <DialogDescription>
            Esta ação não pode ser desfeita. O gasto, seus comprovantes e cotações serão removidos permanentemente.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="destructive" onClick={handleExcluir} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Excluir permanentemente
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
