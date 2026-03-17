-- supabase/rls.sql
-- Row Level Security — public read via anon key, writes via service role only

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE drinks ENABLE ROW LEVEL SECURITY;
ALTER TABLE drink_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE wine_list_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE redirects ENABLE ROW LEVEL SECURITY;

-- Public SELECT for anon (read-only for everyone)
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read category_translations" ON category_translations FOR SELECT USING (true);
CREATE POLICY "Public read drinks" ON drinks FOR SELECT USING (true);
CREATE POLICY "Public read drink_translations" ON drink_translations FOR SELECT USING (true);
CREATE POLICY "Public read restaurants" ON restaurants FOR SELECT USING (true);
CREATE POLICY "Public read restaurant_translations" ON restaurant_translations FOR SELECT USING (true);
CREATE POLICY "Public read wine_list_entries" ON wine_list_entries FOR SELECT USING (true);
CREATE POLICY "Public read redirects" ON redirects FOR SELECT USING (true);

-- No INSERT/UPDATE/DELETE for anon — only service role bypasses RLS
-- (service_role key bypasses RLS by default in Supabase)
