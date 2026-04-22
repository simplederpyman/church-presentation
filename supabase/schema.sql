-- Church Presentation System - Database Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE user_role AS ENUM ('admin', 'operator');
CREATE TYPE slide_type AS ENUM ('song', 'verse', 'announcement', 'blank');

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'operator',
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS songs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  lyrics TEXT NOT NULL,
  artist TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS verses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS presentations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS presentation_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  presentation_id UUID NOT NULL REFERENCES presentations(id) ON DELETE CASCADE,
  type slide_type NOT NULL,
  content_id UUID,
  order_index INTEGER NOT NULL DEFAULT 0,
  custom_content TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_presentation_items_presentation_id ON presentation_items(presentation_id);
CREATE INDEX IF NOT EXISTS idx_presentation_items_order ON presentation_items(presentation_id, order_index);

CREATE TABLE IF NOT EXISTS live_state (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  presentation_id UUID REFERENCES presentations(id) ON DELETE CASCADE,
  current_item_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_live_state_presentation ON live_state(presentation_id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, display_name)
  VALUES (NEW.id, 'operator', NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE verses ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE presentations ENABLE ROW LEVEL SECURITY;
ALTER TABLE presentation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "songs_all" ON songs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "verses_all" ON verses FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "announcements_all" ON announcements FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "presentations_all" ON presentations FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "presentation_items_all" ON presentation_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "live_state_all" ON live_state FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE live_state;
