-- Tabela de Usuários (estendendo auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  email TEXT,
  plan TEXT DEFAULT 'PRATA',
  daily_offers_count INTEGER DEFAULT 0,
  last_offer_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabela de Ofertas
CREATE TABLE public.offers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  type TEXT DEFAULT 'oferta',
  status TEXT DEFAULT 'execucao',
  full_response TEXT,
  youtube_links TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

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

-- Função para resetar contador diário (pode ser chamada via Cron ou Edge Function)
CREATE OR REPLACE FUNCTION reset_daily_limits() RETURNS void AS $$
BEGIN
  UPDATE public.profiles SET daily_offers_count = 0 WHERE last_offer_date < CURRENT_DATE;
  UPDATE public.profiles SET last_offer_date = CURRENT_DATE WHERE last_offer_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;
