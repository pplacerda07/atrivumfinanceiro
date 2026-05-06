# Arquitetura Técnica — CRM Financeiro Laboratório
**Stack:** Next.js 14 · Supabase · Vercel  
**Versão:** 1.0 | 2026

---

## 1. Stack Tecnológica

| Camada | Tecnologia | Versão |
|---|---|---|
| Framework | Next.js (App Router) | 14+ |
| Linguagem | TypeScript | 5+ |
| Banco de dados | Supabase (PostgreSQL) | — |
| Acesso ao banco | `@supabase/supabase-js` | 2+ |
| Autenticação | Supabase Auth | nativo |
| Storage de arquivos | Supabase Storage | nativo |
| Estilização | Tailwind CSS | 3+ |
| Componentes UI | shadcn/ui | — |
| Gráficos | Recharts | 2+ |
| Validação de forms | Zod + React Hook Form | — |
| Export PDF | @react-pdf/renderer | — |
| Export Excel | SheetJS (xlsx) | — |
| Deploy | Vercel | — |

---

## 2. Estrutura de Pastas

```
/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   │
│   ├── (dashboard)/                  # rotas protegidas
│   │   ├── layout.tsx                # sidebar + barra de saldo global
│   │   ├── page.tsx                  # dashboard (TELA-01)
│   │   ├── gastos/
│   │   │   ├── page.tsx              # lista de gastos (TELA-02)
│   │   │   ├── novo/
│   │   │   │   └── page.tsx          # cadastro de gasto (TELA-03)
│   │   │   └── [id]/
│   │   │       └── page.tsx          # detalhe do gasto (TELA-04)
│   │   ├── cotacoes/
│   │   │   └── [gastoId]/
│   │   │       └── page.tsx          # comparador de cotações (TELA-05)
│   │   ├── relatorios/
│   │   │   └── page.tsx              # prestação de contas (TELA-08)
│   │   └── configuracoes/
│   │       └── page.tsx              # categorias e orçamento (TELA-09)
│   │
│   └── api/
│       ├── relatorios/
│       │   ├── pdf/route.ts          # gera e retorna PDF
│       │   └── excel/route.ts        # gera e retorna .xlsx
│       └── uploads/
│           └── signed-url/route.ts   # gera URL assinada pro Supabase Storage
│
├── components/
│   ├── ui/                           # shadcn/ui (Button, Input, Modal, etc.)
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   └── BarraResumoFinanceiro.tsx # saldo + orçamento sempre visível
│   └── financeiro/                   # componentes de domínio
│       ├── GastoTabela.tsx
│       ├── GastoForm.tsx
│       ├── CotacaoComparador.tsx
│       ├── ComprovanteUpload.tsx
│       ├── GraficoGastosPorCategoria.tsx
│       └── AlertaSaldo.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 # cliente browser (componentes client-side)
│   │   └── server.ts                 # cliente server (Server Components + Actions)
│   ├── validations/
│   │   ├── gasto.ts                  # schema Zod do formulário de gasto
│   │   └── cotacao.ts                # schema Zod do formulário de cotação
│   ├── pdf.ts                        # lógica de geração do relatório PDF
│   └── excel.ts                      # lógica de geração do relatório Excel
│
├── server/
│   ├── actions/                      # Server Actions — mutações
│   │   ├── gastos.ts
│   │   ├── cotacoes.ts
│   │   ├── comprovantes.ts
│   │   └── orcamento.ts
│   └── queries/                      # funções de leitura — usadas em Server Components
│       ├── gastos.ts
│       ├── dashboard.ts
│       └── relatorios.ts
│
└── types/
    └── index.ts                      # tipos globais (Gasto, Cotacao, Comprovante, etc.)
```

---

## 3. Configuração do Supabase Client

Dois clientes separados — um para o browser, outro para o servidor. Nunca misturar.

```ts
// lib/supabase/client.ts
// Usado em Client Components ("use client")
import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

```ts
// lib/supabase/server.ts
// Usado em Server Components e Server Actions
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export function createClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
        set: (name, value, options) => cookieStore.set(name, value, options),
        remove: (name, options) => cookieStore.delete({ name, ...options }),
      },
    }
  )
}
```

---

## 4. Variáveis de Ambiente

```bash
# .env.local

# Supabase — chaves públicas (podem aparecer no browser)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...

# Supabase — service role (NUNCA expor no cliente, só server-side)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

As mesmas variáveis devem ser cadastradas no painel da Vercel em **Settings → Environment Variables**.

---

## 5. Autenticação — Supabase Auth

O Supabase Auth cuida de sessão, tokens e refresh automaticamente via cookies.

### Proteção de rotas

```ts
// app/(dashboard)/layout.tsx
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  )
}
```

### Login

```ts
// server/actions/auth.ts
"use server"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function login(email: string, password: string) {
  const supabase = createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: error.message }
  redirect("/")
}

export async function logout() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect("/login")
}
```

---

## 6. Padrão de Acesso ao Banco

Sem ORM. Consultas usando o **Supabase client diretamente** com TypeScript.

### Queries de leitura (Server Components)

```ts
// server/queries/gastos.ts
import { createClient } from "@/lib/supabase/server"

export async function buscarGastos(filtros?: {
  categoriaId?: string
  responsavelId?: string
  dataInicio?: string
  dataFim?: string
}) {
  const supabase = createClient()

  let query = supabase
    .from("gastos")
    .select(`
      *,
      categoria:categorias(id, nome),
      responsavel:usuarios(id, nome),
      comprovantes(id, arquivo, tipo),
      cotacoes(id, fornecedor, valor, aprovada)
    `)
    .order("data", { ascending: false })

  if (filtros?.categoriaId)
    query = query.eq("categoria_id", filtros.categoriaId)
  if (filtros?.dataInicio)
    query = query.gte("data", filtros.dataInicio)
  if (filtros?.dataFim)
    query = query.lte("data", filtros.dataFim)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data
}

export async function buscarGastoPorId(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("gastos")
    .select(`
      *,
      categoria:categorias(id, nome),
      responsavel:usuarios(id, nome),
      comprovantes(*),
      cotacoes(*)
    `)
    .eq("id", id)
    .single()

  if (error) throw new Error(error.message)
  return data
}
```

### Server Actions (mutações)

```ts
// server/actions/gastos.ts
"use server"
import { createClient } from "@/lib/supabase/server"
import { GastoSchema } from "@/lib/validations/gasto"
import { revalidatePath } from "next/cache"
import { z } from "zod"

export async function criarGasto(data: z.infer<typeof GastoSchema>) {
  const parsed = GastoSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.flatten() }

  const supabase = createClient()
  const { error } = await supabase.from("gastos").insert({
    data: parsed.data.data,
    descricao: parsed.data.descricao,
    valor: parsed.data.valor,
    categoria_id: parsed.data.categoriaId,
    responsavel_id: parsed.data.responsavelId,
  })

  if (error) return { error: error.message }

  revalidatePath("/gastos")
  return { success: true }
}
```

---

## 7. Upload de Comprovantes — Supabase Storage

O upload é feito **diretamente do browser para o Supabase Storage** usando URL pré-assinada. Isso evita o limite de 4.5 MB da Vercel para Server Actions.

### Fluxo

```
Browser → pede URL assinada → API Route (Vercel)
                                      ↓
                            Supabase gera URL assinada
                                      ↓
Browser → faz upload direto para Supabase Storage com a URL
                                      ↓
Browser → chama Server Action para salvar a URL no banco
```

### API Route — gera URL assinada

```ts
// app/api/uploads/signed-url/route.ts
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const { gastoId, fileName, contentType } = await req.json()
  const supabase = createRouteHandlerClient({ cookies })

  const path = `comprovantes/${gastoId}/${Date.now()}-${fileName}`
  const { data, error } = await supabase.storage
    .from("crm-financeiro")
    .createSignedUploadUrl(path)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ signedUrl: data.signedUrl, path })
}
```

### Server Action — salva URL no banco após upload

```ts
// server/actions/comprovantes.ts
"use server"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function salvarComprovante(gastoId: string, path: string, tipo: string) {
  const supabase = createClient()

  const { data: urlData } = supabase.storage
    .from("crm-financeiro")
    .getPublicUrl(path)

  const { error } = await supabase.from("comprovantes").insert({
    gasto_id: gastoId,
    arquivo: urlData.publicUrl,
    tipo,
  })

  if (error) return { error: error.message }

  revalidatePath(`/gastos/${gastoId}`)
  return { success: true }
}
```

---

## 8. Schema do Banco (SQL — Supabase)

Cole no **SQL Editor** do Supabase para criar as tabelas.

```sql
-- Categorias de gasto
CREATE TABLE categorias (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome        TEXT NOT NULL UNIQUE,
  criado_em   TIMESTAMPTZ DEFAULT now()
);

-- Usuários (espelha o Supabase Auth)
CREATE TABLE usuarios (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome        TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  perfil      TEXT NOT NULL DEFAULT 'pesquisador' CHECK (perfil IN ('pesquisador', 'gestor', 'coordenador')),
  criado_em   TIMESTAMPTZ DEFAULT now()
);

-- Orçamento do laboratório
CREATE TABLE orcamento (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  total       NUMERIC(12, 2) NOT NULL,
  periodo     TEXT NOT NULL,             -- ex: "2026-01"
  criado_em   TIMESTAMPTZ DEFAULT now()
);

-- Gastos
CREATE TABLE gastos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data            DATE NOT NULL,
  descricao       TEXT NOT NULL,
  valor           NUMERIC(12, 2) NOT NULL,
  categoria_id    UUID NOT NULL REFERENCES categorias(id),
  responsavel_id  UUID NOT NULL REFERENCES usuarios(id),
  bloqueado       BOOLEAN DEFAULT false,  -- true após exportação de relatório
  criado_em       TIMESTAMPTZ DEFAULT now()
);

-- Comprovantes vinculados a gastos
CREATE TABLE comprovantes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gasto_id    UUID NOT NULL REFERENCES gastos(id) ON DELETE CASCADE,
  arquivo     TEXT NOT NULL,    -- URL pública no Supabase Storage
  tipo        TEXT NOT NULL,    -- 'pdf' | 'jpg' | 'png'
  criado_em   TIMESTAMPTZ DEFAULT now()
);

-- Cotações (máx. 3 por gasto)
CREATE TABLE cotacoes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gasto_id      UUID NOT NULL REFERENCES gastos(id) ON DELETE CASCADE,
  fornecedor    TEXT NOT NULL,
  valor         NUMERIC(12, 2) NOT NULL,
  data_cotacao  DATE NOT NULL,
  prazo         TEXT,
  observacoes   TEXT,
  arquivo       TEXT,       -- URL do orçamento em PDF/imagem
  aprovada      BOOLEAN DEFAULT false,
  criado_em     TIMESTAMPTZ DEFAULT now(),
  UNIQUE (gasto_id, fornecedor)   -- RN-05: fornecedor único por gasto
);

-- Log de exportações de relatórios
CREATE TABLE log_exportacoes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id    UUID NOT NULL REFERENCES usuarios(id),
  periodo_inicio DATE NOT NULL,
  periodo_fim    DATE NOT NULL,
  formato       TEXT NOT NULL CHECK (formato IN ('pdf', 'xlsx')),
  criado_em     TIMESTAMPTZ DEFAULT now()
);

-- Categorias padrão iniciais
INSERT INTO categorias (nome) VALUES
  ('Material de consumo'),
  ('Equipamento'),
  ('Serviço'),
  ('Outros');
```

### Row Level Security (RLS)

Ative no Supabase para que usuários só vejam dados do próprio laboratório:

```sql
-- Habilitar RLS em todas as tabelas sensíveis
ALTER TABLE gastos ENABLE ROW LEVEL SECURITY;
ALTER TABLE comprovantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE cotacoes ENABLE ROW LEVEL SECURITY;

-- Política básica: usuário autenticado acessa tudo (ajuste por perfil se necessário)
CREATE POLICY "acesso autenticado" ON gastos
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "acesso autenticado" ON comprovantes
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "acesso autenticado" ON cotacoes
  FOR ALL USING (auth.role() = 'authenticated');
```

---

## 9. Geração de Relatórios

### PDF — via API Route

```ts
// app/api/relatorios/pdf/route.ts
import { NextRequest, NextResponse } from "next/server"
import { renderToBuffer } from "@react-pdf/renderer"
import { RelatorioPDF } from "@/lib/pdf"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const inicio = searchParams.get("inicio")!
  const fim = searchParams.get("fim")!

  const supabase = createRouteHandlerClient({ cookies })
  const { data: gastos } = await supabase
    .from("gastos")
    .select("*, categoria:categorias(*), comprovantes(*), cotacoes(*)")
    .gte("data", inicio)
    .lte("data", fim)

  const buffer = await renderToBuffer(<RelatorioPDF gastos={gastos ?? []} periodo={{ inicio, fim }} />)

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="relatorio-${inicio}-${fim}.pdf"`,
    },
  })
}
```

### Excel — via API Route

```ts
// app/api/relatorios/excel/route.ts
import { NextRequest, NextResponse } from "next/server"
import * as XLSX from "xlsx"

export async function GET(req: NextRequest) {
  // ... buscar gastos no Supabase igual ao PDF

  const linhas = gastos.map((g) => ({
    Data: g.data,
    Descrição: g.descricao,
    Categoria: g.categoria.nome,
    Responsável: g.responsavel.nome,
    "Valor (R$)": g.valor,
    Comprovantes: g.comprovantes.length,
    Cotações: g.cotacoes.length,
  }))

  const ws = XLSX.utils.json_to_sheet(linhas)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Gastos")
  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" })

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="relatorio.xlsx"`,
    },
  })
}
```

---

## 10. Deploy — Vercel + Supabase

### Checklist de deploy

```
[ ] Repositório no GitHub conectado à Vercel
[ ] Variáveis de ambiente cadastradas na Vercel (Settings → Env Vars)
[ ] Bucket "crm-financeiro" criado no Supabase Storage (público ou privado com signed URLs)
[ ] RLS ativado nas tabelas do Supabase
[ ] SQL do schema executado no SQL Editor do Supabase
[ ] Domínio customizado configurado na Vercel (opcional)
```

### Limites importantes no plano gratuito

| Serviço | Limite free | Solução se ultrapassar |
|---|---|---|
| Vercel | 100 GB bandwidth/mês | Upgrade Vercel Pro (~$20/mês) |
| Supabase banco | 500 MB | Upgrade Supabase Pro (~$25/mês) |
| Supabase Storage | 1 GB | Upgrade ou limpar arquivos antigos |
| Vercel Function timeout | 10s | Geração de PDF/Excel pesada → mover para Supabase Edge Functions |

---

## 11. Decisões de Arquitetura

| Decisão | Escolha | Motivo |
|---|---|---|
| Acesso ao banco | Supabase Client direto | Sem ORM — simples, direto, suficiente para o escopo |
| Autenticação | Supabase Auth | Nativo, zero config, gerencia sessão via cookies automaticamente |
| Upload de arquivos | Supabase Storage + signed URL | Evita limite de 4.5 MB da Vercel em Server Actions |
| Mutações | Server Actions | Sem API Route extra — formulários integrados com Next.js |
| Leitura de dados | Queries em Server Components | Sem fetch client-side desnecessário, dados chegam prontos na página |
| Relatórios | API Routes dedicadas | PDF e Excel são pesados — melhor em route handler separado do que em Server Action |

---

## 12. O que NÃO usar nesse projeto

| Tecnologia | Motivo para evitar |
|---|---|
| Redux / Zustand | Dados vêm de Server Components — estado global não é necessário |
| React Query / SWR | Desnecessário com Server Components + `revalidatePath` |
| tRPC | Server Actions cobrem o mesmo caso com menos setup |
| Prisma / Drizzle | Supabase client direto é suficiente para esse escopo |
| Docker | Vercel gerencia o runtime — Docker só adicionaria complexidade |

---

*Documento de arquitetura técnica — CRM Financeiro Laboratório v1.0*