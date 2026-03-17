-- supabase/seed.sql
-- Seed data for local development and testing

-- Categories
INSERT INTO categories (slug, parent_id, sort_order) VALUES
  ('whisky', NULL, 1),
  ('vin-rouge', NULL, 2),
  ('vin-blanc', NULL, 3),
  ('champagne', NULL, 4),
  ('cognac', NULL, 5),
  ('rhum', NULL, 6),
  ('bourbon', 1, 7),
  ('scotch-whisky', 1, 8),
  ('jura', 3, 9)
ON CONFLICT (slug) DO NOTHING;

-- Category translations (FR + EN-US sample)
INSERT INTO category_translations (category_id, locale, name, description, meta_title, meta_description)
SELECT c.id, 'fr', 'Whisky', 'Les meilleurs whiskies à la carte des restaurants étoilés Michelin.',
  'Whisky : les meilleures bouteilles à la carte des restaurants étoilés',
  'Découvrez les meilleurs whiskies référencés à la carte des restaurants gastronomiques étoilés Michelin.'
FROM categories c WHERE c.slug = 'whisky'
ON CONFLICT (category_id, locale) DO NOTHING;

INSERT INTO category_translations (category_id, locale, name, description, meta_title, meta_description)
SELECT c.id, 'en-us', 'Whisky', 'The finest whiskies on Michelin-starred restaurant wine lists.',
  'Whisky: the best bottles on Michelin-starred restaurant menus',
  'Discover the finest whiskies featured on Michelin-starred gastronomic restaurant wine lists.'
FROM categories c WHERE c.slug = 'whisky'
ON CONFLICT (category_id, locale) DO NOTHING;

-- FR translations for remaining categories
INSERT INTO category_translations (category_id, locale, name, description, meta_title, meta_description)
SELECT c.id, 'fr', 'Vin rouge', 'Les meilleurs vins rouges à la carte des restaurants étoilés Michelin.',
  'Vin rouge : les meilleures bouteilles à la carte des restaurants étoilés',
  'Découvrez les meilleurs vins rouges référencés à la carte des grands restaurants gastronomiques étoilés Michelin.'
FROM categories c WHERE c.slug = 'vin-rouge'
ON CONFLICT (category_id, locale) DO NOTHING;

INSERT INTO category_translations (category_id, locale, name, description, meta_title, meta_description)
SELECT c.id, 'fr', 'Vin blanc', 'Les meilleurs vins blancs à la carte des restaurants étoilés Michelin.',
  'Vin blanc : les meilleures bouteilles à la carte des restaurants étoilés',
  'Découvrez les meilleurs vins blancs référencés à la carte des grands restaurants gastronomiques étoilés Michelin.'
FROM categories c WHERE c.slug = 'vin-blanc'
ON CONFLICT (category_id, locale) DO NOTHING;

INSERT INTO category_translations (category_id, locale, name, description, meta_title, meta_description)
SELECT c.id, 'fr', 'Champagne', 'Les meilleurs champagnes à la carte des restaurants étoilés Michelin.',
  'Champagne : les meilleures cuvées à la carte des restaurants étoilés',
  'Découvrez les meilleurs champagnes référencés à la carte des grands restaurants gastronomiques étoilés Michelin.'
FROM categories c WHERE c.slug = 'champagne'
ON CONFLICT (category_id, locale) DO NOTHING;

INSERT INTO category_translations (category_id, locale, name, description, meta_title, meta_description)
SELECT c.id, 'fr', 'Cognac', 'Les meilleurs cognacs à la carte des restaurants étoilés Michelin.',
  'Cognac : les meilleures bouteilles à la carte des restaurants étoilés',
  'Découvrez les meilleurs cognacs référencés à la carte des grands restaurants gastronomiques étoilés Michelin.'
FROM categories c WHERE c.slug = 'cognac'
ON CONFLICT (category_id, locale) DO NOTHING;

INSERT INTO category_translations (category_id, locale, name, description, meta_title, meta_description)
SELECT c.id, 'fr', 'Rhum', 'Les meilleurs rhums à la carte des restaurants étoilés Michelin.',
  'Rhum : les meilleures bouteilles à la carte des restaurants étoilés',
  'Découvrez les meilleurs rhums référencés à la carte des grands restaurants gastronomiques étoilés Michelin.'
FROM categories c WHERE c.slug = 'rhum'
ON CONFLICT (category_id, locale) DO NOTHING;

-- Sample restaurant
INSERT INTO restaurants (name, slug, country, city, michelin_stars) VALUES
  ('Le Jules Verne', 'le-jules-verne', 'France', 'Paris', 1)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO restaurant_translations (restaurant_id, locale, description, wine_list_critique, meta_title, meta_description)
SELECT r.id, 'fr',
  'Le Jules Verne, niché au deuxième étage de la Tour Eiffel, offre une expérience gastronomique unique avec une vue imprenable sur Paris.',
  'La carte des vins du Jules Verne est une ode à la Bourgogne et à Bordeaux, avec une sélection de millésimes exceptionnels soigneusement sélectionnés par le chef sommelier. On y découvre des raretés comme des Pétrus en magnum et des Romanée-Conti des grandes années, témoignant d''une vision audacieuse et d''une maîtrise parfaite de la Loire.',
  'Carte des vins du Restaurant Le Jules Verne — Paris | Bestwine',
  'Découvrez la carte des vins du restaurant étoilé Le Jules Verne à Paris : sélection, prix et critique par nos sommeliers experts.'
FROM restaurants r WHERE r.slug = 'le-jules-verne'
ON CONFLICT (restaurant_id, locale) DO NOTHING;

-- Sample drinks
INSERT INTO drinks (category_id, name, producer, vintage, country, region, appellation, slug)
SELECT c.id, 'Macallan 18 ans Sherry Oak', 'The Macallan', 2004, 'Scotland', 'Speyside', NULL,
  'macallan-18-ans-sherry-oak-2004'
FROM categories c WHERE c.slug = 'scotch-whisky'
ON CONFLICT (slug) DO NOTHING;

-- Wine list entry
INSERT INTO wine_list_entries (restaurant_id, drink_id, price, price_currency, year_on_list)
SELECT r.id, d.id, 180.00, 'EUR', 2024
FROM restaurants r, drinks d
WHERE r.slug = 'le-jules-verne' AND d.slug = 'macallan-18-ans-sherry-oak-2004'
ON CONFLICT (restaurant_id, drink_id, year_on_list) DO NOTHING;
