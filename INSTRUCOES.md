# CRM Financeiro — Instruções de Setup

## 1. Instalar dependências

```bash
cd atrivm_financeiro
npm install
```

## 2. Configurar Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Vá em **SQL Editor** e execute o conteúdo de `supabase/schema.sql`
3. Vá em **Storage** → crie um bucket chamado `crm-financeiro` (privado)
4. Configure as políticas de Storage:
   - `INSERT`: usuário autenticado pode fazer upload
   - `SELECT`: usuário autenticado pode visualizar

## 3. Variáveis de ambiente

Copie o arquivo e preencha com suas chaves:

```bash
cp .env.local.example .env.local
```

Preencha com os valores do painel Supabase (**Settings → API**):

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

## 4. Rodar localmente

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

## 5. Deploy na Vercel

1. Suba o projeto para o GitHub
2. Importe o repositório na [Vercel](https://vercel.com)
3. Configure as variáveis de ambiente no painel Vercel (**Settings → Environment Variables**)
4. Deploy automático!

## Checklist de deploy

- [ ] Supabase criado e schema executado
- [ ] Bucket `crm-financeiro` criado no Storage
- [ ] RLS ativado em todas as tabelas
- [ ] `.env.local` preenchido (local) / Variáveis na Vercel (produção)
- [ ] `npm run build` sem erros

## Estrutura de telas

| Rota | Tela |
|---|---|
| `/login` | Login |
| `/` | Dashboard principal |
| `/gastos` | Lista de gastos com filtros |
| `/gastos/novo` | Cadastrar novo gasto |
| `/gastos/[id]` | Detalhe do gasto + comprovantes + cotações |
| `/gastos/[id]/editar` | Editar gasto |
| `/relatorios` | Prestação de contas + exportação PDF/Excel |
| `/configuracoes` | Orçamento, categorias, usuários |
