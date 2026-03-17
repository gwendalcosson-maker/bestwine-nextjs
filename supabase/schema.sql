-- supabase/schema.sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories (wine types, spirits, etc.)
CREATE TABLE IF NOT EXISTS categories (
  id          SERIAL PRIMARY KEY,
  slug        VARCHAR(100) NOT NULL UNIQUE,
  parent_id   INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Category translations (one row per category × locale)
CREATE TABLE IF NOT EXISTS category_translations (
  id               SERIAL PRIMARY KEY,
  category_id      INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  locale           VARCHAR(10) NOT NULL,
  name             VARCHAR(200) NOT NULL,
  description      TEXT,
  meta_title       VARCHAR(200),
  meta_description VARCHAR(300),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(category_id, locale)
);

-- Drinks (wine bottles, spirits)
CREATE TABLE IF NOT EXISTS drinks (
  id           SERIAL PRIMARY KEY,
  category_id  INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name         VARCHAR(300) NOT NULL,
  producer     VARCHAR(200),
  vintage      SMALLINT CHECK (vintage IS NULL OR (vintage >= 1800 AND vintage <= 2100)),
  country      VARCHAR(100),
  region       VARCHAR(100),
  appellation  VARCHAR(200),
  slug         VARCHAR(400) NOT NULL UNIQUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Drink translations (descriptions, tasting notes per locale)
CREATE TABLE IF NOT EXISTS drink_translations (
  id               SERIAL PRIMARY KEY,
  drink_id         INTEGER NOT NULL REFERENCES drinks(id) ON DELETE CASCADE,
  locale           VARCHAR(10) NOT NULL,
  description      TEXT,
  tasting_notes    TEXT,
  meta_title       VARCHAR(200),
  meta_description VARCHAR(300),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(drink_id, locale)
);

-- Restaurants (Michelin-starred)
CREATE TABLE IF NOT EXISTS restaurants (
  id             SERIAL PRIMARY KEY,
  name           VARCHAR(300) NOT NULL,
  slug           VARCHAR(400) NOT NULL UNIQUE,
  country        VARCHAR(100),
  city           VARCHAR(100),
  michelin_stars INTEGER NOT NULL DEFAULT 1 CHECK (michelin_stars BETWEEN 1 AND 3),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Restaurant translations (editorial description + wine list critique per locale)
CREATE TABLE IF NOT EXISTS restaurant_translations (
  id                SERIAL PRIMARY KEY,
  restaurant_id     INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  locale            VARCHAR(10) NOT NULL,
  description       TEXT,
  wine_list_critique TEXT,
  meta_title        VARCHAR(200),
  meta_description  VARCHAR(300),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(restaurant_id, locale)
);

-- Wine list entries (drink × restaurant with optional price)
CREATE TABLE IF NOT EXISTS wine_list_entries (
  id             SERIAL PRIMARY KEY,
  restaurant_id  INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  drink_id       INTEGER NOT NULL REFERENCES drinks(id) ON DELETE CASCADE,
  price          DECIMAL(10,2),
  price_currency VARCHAR(3),
  year_on_list   SMALLINT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(restaurant_id, drink_id, year_on_list)
);

-- 301 redirects (old WordPress URLs → new URLs)
CREATE TABLE IF NOT EXISTS redirects (
  id          SERIAL PRIMARY KEY,
  from_path   VARCHAR(500) NOT NULL UNIQUE,
  to_path     VARCHAR(500) NOT NULL,
  status_code INTEGER NOT NULL DEFAULT 301 CHECK (status_code IN (301, 302)),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_drinks_category ON drinks(category_id);
CREATE INDEX IF NOT EXISTS idx_drinks_slug ON drinks(slug);
CREATE INDEX IF NOT EXISTS idx_drinks_vintage ON drinks(vintage);
CREATE INDEX IF NOT EXISTS idx_drink_translations_locale ON drink_translations(drink_id, locale);
CREATE INDEX IF NOT EXISTS idx_category_translations_locale ON category_translations(category_id, locale);
CREATE INDEX IF NOT EXISTS idx_restaurant_translations_locale ON restaurant_translations(restaurant_id, locale);
CREATE INDEX IF NOT EXISTS idx_wine_list_entries_restaurant ON wine_list_entries(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_wine_list_entries_drink ON wine_list_entries(drink_id);
CREATE INDEX IF NOT EXISTS idx_redirects_from_path ON redirects(from_path);
