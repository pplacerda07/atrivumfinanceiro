import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Sidebar } from "@/components/layout/Sidebar"
import { BarraResumoFinanceiro } from "@/components/layout/BarraResumoFinanceiro"
import { buscarDadosDashboard } from "@/server/queries/dashboard"
import { IS_DEMO } from "@/lib/demo-data"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  if (!IS_DEMO) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")
  }

  const dados = await buscarDadosDashboard()

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <BarraResumoFinanceiro
          orcamentoTotal={dados.orcamentoTotal}
          gastoTotal={dados.gastoTotal}
          saldoDisponivel={dados.saldoDisponivel}
        />
        {IS_DEMO && (
          <div className="flex items-center justify-center gap-2 bg-amber-400 px-4 py-1.5 text-xs font-semibold text-amber-900">
            ⚡ Modo Demo ativo — dados simulados. Configure o Supabase para usar dados reais.
          </div>
        )}
        <main className="flex-1 overflow-auto bg-slate-50 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
