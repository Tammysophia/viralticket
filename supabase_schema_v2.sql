-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABELA DE PERFIS (Profiles)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  plan TEXT DEFAULT 'PRATA', -- PRATA (3/dia), OURO (Ilimitado), ADMIN
  daily_offers_count INTEGER DEFAULT 0,
  last_offer_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. TABELA DE OFERTAS (Offers)
CREATE TABLE public.offers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'pendente', -- pendente, execucao, modelando, concluido
  type TEXT DEFAULT 'oferta', -- oferta, modelagem, recuperacao, traducao
  agent TEXT, -- sophia, sofia, manual
  full_response TEXT, -- Conteúdo gerado pela IA (Markdown)
  youtube_links TEXT[], -- Links de referência
  source_url TEXT, -- URL da página de vendas modelada (se houver)
  metadata JSONB DEFAULT '{}'::jsonb, -- Dados extras (idioma, país, etc)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. TABELA DE AGENTES (Custom Agents - Opcional para Admin)
CREATE TABLE public.ai_agents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  system_prompt TEXT,
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. SEGURANÇA (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_agents ENABLE ROW LEVEL SECURITY;

-- Políticas para Profiles
CREATE POLICY "Usuários podem ver seu próprio perfil" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Políticas para Ofertas
CREATE POLICY "Usuários podem ver suas próprias ofertas" ON public.offers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias ofertas" ON public.offers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias ofertas" ON public.offers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias ofertas" ON public.offers
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para Agentes (Público para leitura)
CREATE POLICY "Todos podem ver agentes ativos" ON public.ai_agents
  FOR SELECT USING (is_active = true);

-- 5. FUNÇÕES E TRIGGERS
-- Função para atualizar o updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_offers_updated_at BEFORE UPDATE ON public.offers FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Função para resetar limites diários
CREATE OR REPLACE FUNCTION reset_daily_limits() RETURNS void AS $$
BEGIN
  UPDATE public.profiles SET daily_offers_count = 0 WHERE last_offer_date < CURRENT_DATE;
  UPDATE public.profiles SET last_offer_date = CURRENT_DATE WHERE last_offer_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;
