
-- جدول غرف لعبة المحقق
CREATE TABLE detective_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code text UNIQUE NOT NULL,
  store_owner_id uuid,
  host_device_id text NOT NULL,
  difficulty text DEFAULT 'medium',
  theme text DEFAULT 'random',
  phase text DEFAULT 'waiting',
  game_data jsonb,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '2 hours')
);

-- جدول لاعبي الغرفة
CREATE TABLE detective_players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES detective_rooms(id) ON DELETE CASCADE NOT NULL,
  player_name text NOT NULL,
  device_id text NOT NULL,
  player_index integer,
  has_voted boolean DEFAULT false,
  vote_target text,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(room_id, device_id)
);

-- RLS
ALTER TABLE detective_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE detective_players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create rooms" ON detective_rooms FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can view rooms" ON detective_rooms FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can update rooms" ON detective_rooms FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Anyone can delete expired rooms" ON detective_rooms FOR DELETE TO anon, authenticated USING (expires_at < now());

CREATE POLICY "Anyone can join rooms" ON detective_players FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can view players" ON detective_players FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can update votes" ON detective_players FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Anyone can leave rooms" ON detective_players FOR DELETE TO anon, authenticated USING (true);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE detective_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE detective_players;
