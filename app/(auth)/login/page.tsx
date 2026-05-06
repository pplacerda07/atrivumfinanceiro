"use client"
import { useState, useTransition } from "react"
import Link from "next/link"
import { FlaskConical, Loader2, Eye, EyeOff, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { login } from "@/server/actions/auth"

const IS_DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === "true"

export default function LoginPage() {
  const [isPending, startTransition] = useTransition()
  const [erro, setErro] = useState("")
  const [mostrarSenha, setMostrarSenha] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const email = form.get("email") as string
    const senha = form.get("senha") as string

    setErro("")
    startTransition(async () => {
      const res = await login(email, senha)
      if (res?.error) setErro(res.error)
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg">
            <FlaskConical className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Atrivm</h1>
            <p className="text-sm text-muted-foreground">CRM Financeiro — Laboratório</p>
          </div>
        </div>

        {IS_DEMO && (
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-center space-y-3">
            <p className="text-sm font-medium text-amber-800">⚡ Modo Demo disponível</p>
            <p className="text-xs text-amber-700">Explore o sistema com dados simulados sem precisar de conta.</p>
            <Button asChild className="w-full bg-amber-500 hover:bg-amber-600 text-white">
              <Link href="/">
                <Zap className="mr-2 h-4 w-4" />
                Entrar no modo demo
              </Link>
            </Button>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Entrar com sua conta</CardTitle>
            <CardDescription>Acesse com e-mail e senha cadastrados no Supabase</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {erro && (
                <Alert variant="destructive">
                  <AlertDescription>{erro}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" name="email" type="email" placeholder="seu@email.com" required autoComplete="email" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="senha">Senha</Label>
                <div className="relative">
                  <Input
                    id="senha" name="senha"
                    type={mostrarSenha ? "text" : "password"}
                    placeholder="••••••••" required autoComplete="current-password" className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setMostrarSenha((v) => !v)}
                  >
                    {mostrarSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Entrar
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
