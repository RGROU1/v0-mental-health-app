-- Adicionar campo para escolha de dias de monitoramento
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS monitoring_days INTEGER DEFAULT 14;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS monitoring_start_date DATE;

-- Atualizar sistema de moedas para recompensa diária
ALTER TABLE daily_check_ins ADD COLUMN IF NOT EXISTS reward_claimed BOOLEAN DEFAULT FALSE;

-- Criar tabela para rastrear jogos desbloqueados
CREATE TABLE IF NOT EXISTS unlocked_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  game_id TEXT NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  points_required INTEGER NOT NULL,
  UNIQUE(user_id, game_id)
);

-- Habilitar RLS para unlocked_games
ALTER TABLE unlocked_games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own unlocked games"
  ON unlocked_games FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own unlocked games"
  ON unlocked_games FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Criar tabela para sequência de check-in
CREATE TABLE IF NOT EXISTS check_in_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  check_in_date DATE NOT NULL,
  current_section TEXT NOT NULL,
  sections_completed TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, check_in_date)
);

ALTER TABLE check_in_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own check-in progress"
  ON check_in_progress FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
