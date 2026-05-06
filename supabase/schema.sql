-- ============================================================
-- CRM Financeiro — Laboratório Atrivm
-- Schema SQL para o Supabase
-- Cole no SQL Editor do painel Supabase e execute
-- ============================================================

-- Categorias de gasto
CREATE TABLE IF NOT EXISTS categorias (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome        TEXT NOT NULL UNIQUE,
  criado_em   TIMESTAMPTZ DEFAULT now()
);

-- Usuários (espelha o Supabase Auth)
CREATE TABLE IF NOT EXISTS usuarios (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome        TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  perfil      TEXT NOT NULL DEFAULT 'pesquisador'
                CHECK (perfil IN ('pesquisador', 'gestor', 'coordenador')),
  criado_em   TIMESTAMPTZ DEFAULT now()
);

-- Orçamento do laboratório (por período AAAA-MM)
CREATE TABLE IF NOT EXISTS orcamento (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  total       NUMERIC(12, 2) NOT NULL CHECK (total >= 0),
  periodo     TEXT NOT NULL,
  criado_em   TIMESTAMPTZ DEFAULT now(),
  UNIQUE (periodo)
);

-- Gastos
CREATE TABLE IF NOT EXISTS gastos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data            DATE NOT NULL,
  descricao       TEXT NOT NULL,
  valor           NUMERIC(12, 2) NOT NULL CHECK (valor > 0),
  categoria_id    UUID NOT NULL REFERENCES categorias(id),
  responsavel_id  UUID NOT NULL REFERENCES usuarios(id),
  bloqueado       BOOLEAN NOT NULL DEFAULT false,
  criado_em       TIMESTAMPTZ DEFAULT now()
);

-- Comprovantes vinculados a gastos
CREATE TABLE IF NOT EXISTS comprovantes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gasto_id    UUID NOT NULL REFERENCES gastos(id) ON DELETE CASCADE,
  arquivo     TEXT NOT NULL,
  tipo        TEXT NOT NULL CHECK (tipo IN ('pdf', 'jpg', 'png')),
  criado_em   TIMESTAMPTZ DEFAULT now()
);

-- Cotações (máx. 3 por gasto, fornecedor único por gasto — RN-05)
CREATE TABLE IF NOT EXISTS cotacoes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gasto_id      UUID NOT NULL REFERENCES gastos(id) ON DELETE CASCADE,
  fornecedor    TEXT NOT NULL,
  valor         NUMERIC(12, 2) NOT NULL CHECK (valor > 0),
  data_cotacao  DATE NOT NULL,
  prazo         TEXT,
  observacoes   TEXT,
  arquivo       TEXT,
  aprovada      BOOLEAN NOT NULL DEFAULT false,
  criado_em     TIMESTAMPTZ DEFAULT now(),
  UNIQUE (gasto_id, fornecedor)
);

-- Log de exportações de relatórios (RN-06: manter por 5 anos)
CREATE TABLE IF NOT EXISTS log_exportacoes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id    UUID NOT NULL REFERENCES usuarios(id),
  periodo_inicio DATE NOT NULL,
  periodo_fim    DATE NOT NULL,
  formato       TEXT NOT NULL CHECK (formato IN ('pdf', 'xlsx')),
  criado_em     TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- Dados iniciais
-- ============================================================

INSERT INTO categorias (nome) VALUES
  ('Material de consumo'),
  ('Equipamento'),
  ('Serviço'),
  ('Outros')
ON CONFLICT (nome) DO NOTHING;

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

ALTER TABLE gastos          ENABLE ROW LEVEL SECURITY;
ALTER TABLE comprovantes    ENABLE ROW LEVEL SECURITY;
ALTER TABLE cotacoes        ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias      ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios        ENABLE ROW LEVEL SECURITY;
ALTER TABLE orcamento       ENABLE ROW LEVEL SECURITY;
ALTER TABLE log_exportacoes ENABLE ROW LEVEL SECURITY;

-- Políticas: usuário autenticado acessa tudo
CREATE POLICY "acesso_autenticado_gastos" ON gastos
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "acesso_autenticado_comprovantes" ON comprovantes
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "acesso_autenticado_cotacoes" ON cotacoes
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "acesso_autenticado_categorias" ON categorias
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "acesso_autenticado_usuarios" ON usuarios
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "acesso_autenticado_orcamento" ON orcamento
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "acesso_autenticado_log" ON log_exportacoes
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- Trigger: criar perfil de usuário automaticamente
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (id, nome, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Storage: criar bucket para comprovantes e cotações
-- (execute separadamente no painel Storage ou via API)
-- ============================================================

-- INSERT INTO storage.buckets (id, name, public) VALUES ('crm-financeiro', 'crm-financeiro', false);
-- CREATE POLICY "upload_autenticado" ON storage.objects FOR INSERT WITH CHECK (auth.role() = 'authenticated');
-- CREATE POLICY "leitura_autenticada" ON storage.objects FOR SELECT USING (auth.role() = 'authenticated');
