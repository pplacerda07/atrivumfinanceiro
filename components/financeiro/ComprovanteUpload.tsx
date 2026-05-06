"use client"
import { useState, useRef, useTransition } from "react"
import { Upload, FileText, ImageIcon, X, Loader2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { salvarComprovante, excluirComprovante } from "@/server/actions/comprovantes"
import { useToast } from "@/hooks/use-toast"
import type { Comprovante } from "@/types"

interface ComprovanteUploadProps {
  gastoId: string
  comprovantes: Comprovante[]
  bloqueado?: boolean
}

export function ComprovanteUpload({ gastoId, comprovantes, bloqueado }: ComprovanteUploadProps) {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const tipo = file.name.endsWith(".pdf") ? "pdf" : file.name.endsWith(".png") ? "png" : "jpg"
    const extensoesValidas = ["pdf", "jpg", "jpeg", "png"]
    const ext = file.name.split(".").pop()?.toLowerCase()
    if (!ext || !extensoesValidas.includes(ext)) {
      toast({ title: "Formato inválido", description: "Use PDF, JPG ou PNG.", variant: "destructive" })
      return
    }

    setUploading(true)
    try {
      const res = await fetch("/api/uploads/signed-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gastoId, fileName: file.name, contentType: file.type }),
      })
      const { signedUrl, path, error } = await res.json()
      if (error) throw new Error(error)

      const uploadRes = await fetch(signedUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      })
      if (!uploadRes.ok) throw new Error("Falha no upload")

      startTransition(async () => {
        const saveRes = await salvarComprovante(gastoId, path, tipo)
        if (saveRes?.error) {
          toast({ title: "Erro ao salvar", description: saveRes.error, variant: "destructive" })
        } else {
          toast({ title: "Comprovante anexado!" })
        }
      })
    } catch (err: any) {
      toast({ title: "Erro no upload", description: err.message, variant: "destructive" })
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  const handleExcluir = (id: string) => {
    startTransition(async () => {
      const res = await excluirComprovante(id, gastoId)
      if (res?.error) {
        toast({ title: "Erro", description: res.error, variant: "destructive" })
      } else {
        toast({ title: "Comprovante removido" })
      }
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Comprovantes</h3>
        <Badge variant={comprovantes.length > 0 ? "success" : "warning"}>
          {comprovantes.length} arquivo(s)
        </Badge>
      </div>

      {comprovantes.length > 0 && (
        <div className="space-y-2">
          {comprovantes.map((comp) => (
            <div key={comp.id} className="flex items-center justify-between rounded-md border px-3 py-2">
              <div className="flex items-center gap-2">
                {comp.tipo === "pdf"
                  ? <FileText className="h-4 w-4 text-red-500" />
                  : <ImageIcon className="h-4 w-4 text-blue-500" />
                }
                <span className="text-sm font-medium uppercase">{comp.tipo}</span>
                <Badge variant="secondary" className="text-xs">
                  {comp.tipo.toUpperCase()}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={comp.arquivo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
                {!bloqueado && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-destructive hover:bg-destructive/10"
                    onClick={() => handleExcluir(comp.id)}
                    disabled={isPending}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!bloqueado && (
        <div>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full border-dashed"
            onClick={() => inputRef.current?.click()}
            disabled={uploading || isPending}
          >
            {uploading || isPending
              ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              : <Upload className="mr-2 h-4 w-4" />
            }
            {uploading ? "Enviando..." : "Anexar comprovante (PDF / JPG / PNG)"}
          </Button>
        </div>
      )}
    </div>
  )
}
