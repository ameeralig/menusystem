
-- Create impostor_rooms table
CREATE TABLE public.impostor_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_code TEXT NOT NULL,
  host_device_id TEXT NOT NULL,
  store_owner_id UUID,
  phase TEXT DEFAULT 'waiting',
  game_mode TEXT DEFAULT 'hints',
  round_duration INTEGER DEFAULT 60,
  secret_word TEXT,
  impostor_index INTEGER,
  category TEXT DEFAULT 'funny',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '2 hours')
);

-- Create impostor_players table
CREATE TABLE public.impostor_players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.impostor_rooms(id) ON DELETE CASCADE,
  player_name TEXT NOT NULL,
  device_id TEXT NOT NULL,
  player_index INTEGER,
  has_voted BOOLEAN DEFAULT false,
  vote_target TEXT,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.impostor_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impostor_players ENABLE ROW LEVEL SECURITY;

-- RLS policies for impostor_rooms
CREATE POLICY "Anyone can view rooms" ON public.impostor_rooms FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can create rooms" ON public.impostor_rooms FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can update rooms" ON public.impostor_rooms FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Anyone can delete expired rooms" ON public.impostor_rooms FOR DELETE TO anon, authenticated USING (expires_at < now());

-- RLS policies for impostor_players
CREATE POLICY "Anyone can view players" ON public.impostor_players FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can join rooms" ON public.impostor_players FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can update votes" ON public.impostor_players FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Anyone can leave rooms" ON public.impostor_players FOR DELETE TO anon, authenticated USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.impostor_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.impostor_players;
