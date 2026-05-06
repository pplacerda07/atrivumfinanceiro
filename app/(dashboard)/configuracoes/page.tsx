import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { buscarTodasCategorias, buscarTodosUsuarios, buscarOrcamentoAtual } from "@/server/actions/orcamento"
import { OrcamentoForm } from "./OrcamentoForm"
import { CategoriasManager } from "./CategoriasManager"
import { periodoAtual } from "@/lib/utils"

export default async function ConfiguracoesPage() {
  const [categorias, usuarios, orcamento] = await Promise.all([
    buscarTodasCategorias(),
    buscarTodosUsuarios(),
    buscarOrcamentoAtual(),
  ])

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
        <p className="text-sm text-muted-foreground">Gerencie orçamento, categorias e usuários</p>
      </div>

      <Tabs defaultValue="orcamento">
        <TabsList>
          <TabsTrigger value="orcamento">Orçamento</TabsTrigger>
          <TabsTrigger value="categorias">Categorias</TabsTrigger>
          <TabsTrigger value="usuarios">Usuários</TabsTrigger>
        </TabsList>

        <TabsContent value="orcamento" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Orçamento do Laboratório</CardTitle>
              <CardDescription>
                Configure o orçamento total para o período atual ({periodoAtual()}).
                O sistema calculará o saldo disponível com base neste valor.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OrcamentoForm orcamentoAtual={orcamento} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categorias" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Categorias de Gasto</CardTitle>
              <CardDescription>
                Gerencie as categorias usadas para classificar as despesas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CategoriasManager categorias={categorias} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usuarios" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Usuários Cadastrados</CardTitle>
              <CardDescription>
                Membros com acesso ao sistema. Novos usuários são cadastrados via Supabase Auth.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {usuarios.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">Nenhum usuário cadastrado.</p>
              ) : (
                <div className="space-y-2">
                  {usuarios.map((u) => (
                    <div key={u.id} className="flex items-center justify-between rounded-lg border px-4 py-3">
                      <div>
                        <p className="text-sm font-medium">{u.nome}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                      <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium capitalize">
                        {u.perfil}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
