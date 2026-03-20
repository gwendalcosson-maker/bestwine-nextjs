/**
 * populate-content.ts
 * Populates Supabase with all real content from scraped bestwine.online data.
 * Run: npx tsx scripts/populate-content.ts
 * Idempotent — safe to run multiple times (uses upserts).
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

async function lookupCategoryId(slug: string): Promise<number> {
  const { data, error } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', slug)
    .single()
  if (error || !data) throw new Error(`Category not found: ${slug}`)
  return data.id
}

async function lookupRestaurantId(slug: string): Promise<number | null> {
  const { data } = await supabase
    .from('restaurants')
    .select('id')
    .eq('slug', slug)
    .single()
  return data?.id ?? null
}

async function lookupDrinkId(slug: string): Promise<number | null> {
  const { data } = await supabase
    .from('drinks')
    .select('id')
    .eq('slug', slug)
    .single()
  return data?.id ?? null
}

// ---------------------------------------------------------------------------
// 1. Categories — ensure all exist (including subcategories and new ones)
// ---------------------------------------------------------------------------

const CATEGORIES = [
  { slug: 'whisky', parent: null, sort: 1 },
  { slug: 'vin-rouge', parent: null, sort: 2 },
  { slug: 'vin-blanc', parent: null, sort: 3 },
  { slug: 'champagne', parent: null, sort: 4 },
  { slug: 'cognac', parent: null, sort: 5 },
  { slug: 'rhum', parent: null, sort: 6 },
  { slug: 'gin', parent: null, sort: 7 },
  { slug: 'vodka', parent: null, sort: 8 },
  { slug: 'vin-rose', parent: null, sort: 9 },
  // whisky subcategories
  { slug: 'scotch', parent: 'whisky', sort: 10 },
  { slug: 'japonais', parent: 'whisky', sort: 11 },
  { slug: 'bourbon', parent: 'whisky', sort: 12 },
  { slug: 'irlandais', parent: 'whisky', sort: 13 },
  { slug: 'canadien', parent: 'whisky', sort: 14 },
]

async function ensureCategories() {
  console.log('--- Step 1: Ensure categories ---')
  // First, insert top-level categories
  for (const cat of CATEGORIES.filter(c => !c.parent)) {
    const { error } = await supabase
      .from('categories')
      .upsert({ slug: cat.slug, parent_id: null, sort_order: cat.sort }, { onConflict: 'slug' })
    if (error) console.error(`  Category ${cat.slug}: ${error.message}`)
  }
  // Then subcategories
  for (const cat of CATEGORIES.filter(c => c.parent)) {
    const parentId = await lookupCategoryId(cat.parent!)
    const { error } = await supabase
      .from('categories')
      .upsert({ slug: cat.slug, parent_id: parentId, sort_order: cat.sort }, { onConflict: 'slug' })
    if (error) console.error(`  Category ${cat.slug}: ${error.message}`)
  }
  // Remove legacy scotch-whisky/jura if they exist, or just leave them
  console.log(`  Inserted/updated ${CATEGORIES.length} categories`)
}

// ---------------------------------------------------------------------------
// 2. Restaurants
// ---------------------------------------------------------------------------

interface RestaurantDef {
  name: string; slug: string; country: string; city: string; stars: number
}

const RESTAURANTS: RestaurantDef[] = [
  { name: 'Clos des Sens', slug: 'clos-des-sens', country: 'France', city: 'Annecy', stars: 2 },
  { name: 'Odette', slug: 'odette', country: 'Singapore', city: 'Singapore', stars: 3 },
  { name: 'Core by Clare Smyth', slug: 'core-by-clare-smyth', country: 'United Kingdom', city: 'London', stars: 2 },
  { name: 'Beaumanière', slug: 'beaumaniere', country: 'France', city: 'Les Baux-de-Provence', stars: 2 },
  { name: 'Yannick Alléno', slug: 'yannick-alleno', country: 'France', city: 'Paris', stars: 3 },
  { name: 'The Dorchester', slug: 'the-dorchester', country: 'United Kingdom', city: 'London', stars: 3 },
  { name: 'The Fat Duck', slug: 'the-fat-duck', country: 'United Kingdom', city: 'Bray', stars: 3 },
  { name: 'La Prieuré', slug: 'la-prieure', country: 'France', city: 'Villeneuve-lès-Avignon', stars: 1 },
  { name: 'La Bouitte', slug: 'la-bouitte', country: 'France', city: 'Saint-Martin-de-Belleville', stars: 3 },
  { name: 'Le Calandre', slug: 'le-calandre', country: 'Italy', city: 'Rubano', stars: 3 },
  { name: 'Rutz', slug: 'rutz', country: 'Germany', city: 'Berlin', stars: 2 },
  { name: 'Frederikshøj', slug: 'frederikshoj', country: 'Denmark', city: 'Aarhus', stars: 2 },
  { name: 'Cheval Blanc by Peter Knogl', slug: 'cheval-blanc-by-peter-knogl', country: 'Switzerland', city: 'Basel', stars: 2 },
  { name: 'Quince', slug: 'quince', country: 'USA', city: 'San Francisco', stars: 3 },
  { name: 'Caprice', slug: 'caprice', country: 'Hong Kong', city: 'Hong Kong', stars: 2 },
  { name: 'Loiseau Rive Gauche', slug: 'loiseau-rive-gauche', country: 'France', city: 'Paris', stars: 1 },
  { name: 'Geranium', slug: 'geranium', country: 'Denmark', city: 'Copenhagen', stars: 3 },
  { name: 'The Connaught', slug: 'the-connaught', country: 'United Kingdom', city: 'London', stars: 2 },
  { name: "L'Atelier de Joël Robuchon", slug: 'latelier-de-joel-robuchon', country: 'France', city: 'Paris', stars: 2 },
  { name: 'Otto e Mezzo', slug: 'otto-e-mezzo', country: 'Hong Kong', city: 'Hong Kong', stars: 3 },
  { name: 'Le Jules Verne', slug: 'le-jules-verne', country: 'France', city: 'Paris', stars: 1 },
]

async function insertRestaurants() {
  console.log('--- Step 2: Insert restaurants ---')
  let count = 0
  for (const r of RESTAURANTS) {
    const { error } = await supabase
      .from('restaurants')
      .upsert(
        { name: r.name, slug: r.slug, country: r.country, city: r.city, michelin_stars: r.stars },
        { onConflict: 'slug' }
      )
    if (error) { console.error(`  Restaurant ${r.name}: ${error.message}`); continue }
    count++
  }
  console.log(`  Upserted ${count} restaurants`)
}

// ---------------------------------------------------------------------------
// 3. Restaurant translations
// ---------------------------------------------------------------------------

interface RestaurantTranslation {
  slug: string
  fr: { description: string; wine_list_critique: string }
  en: { description: string; wine_list_critique: string }
}

const RESTAURANT_TRANSLATIONS: RestaurantTranslation[] = [
  {
    slug: 'clos-des-sens',
    fr: {
      description: "Le Clos des Sens, niché dans les hauteurs d'Annecy-le-Vieux, est un écrin gastronomique doublement étoilé où le chef Laurent Petit sublime les produits lacustres et alpins. Une cuisine de terroir d'exception, ancrée dans la nature savoyarde.",
      wine_list_critique: "La carte des vins du Clos des Sens témoigne d'un attachement profond aux vignobles savoyards et jurassiens, avec des pépites rares de Chignin-Bergeron et de Roussette. Les grandes appellations bourguignonnes et rhodaniennes complètent une sélection d'une cohérence remarquable."
    },
    en: {
      description: "Clos des Sens, nestled in the heights of Annecy-le-Vieux, is a two-Michelin-starred gastronomic sanctuary where Chef Laurent Petit elevates lakeside and alpine produce. Exceptional terroir cuisine deeply rooted in the Savoyard landscape.",
      wine_list_critique: "The wine list at Clos des Sens reveals a deep commitment to Savoyard and Jura vineyards, featuring rare gems of Chignin-Bergeron and Roussette. Grand Burgundy and Rhône appellations complement a selection of remarkable coherence."
    }
  },
  {
    slug: 'odette',
    fr: {
      description: "Odette, au cœur du National Gallery de Singapour, est un restaurant trois étoiles orchestré par le chef Julien Royer. Sa cuisine franco-asiatique d'une finesse absolue célèbre les produits d'exception avec une sensibilité artistique rare.",
      wine_list_critique: "La cave d'Odette est un trésor cosmopolite, mêlant grands crus bordelais et bourguignons à des sélections pointues du Nouveau Monde. Le sommelier propose des accords audacieux qui magnifient la cuisine fusion du chef Royer."
    },
    en: {
      description: "Odette, set within Singapore's National Gallery, is a three-Michelin-starred restaurant led by Chef Julien Royer. His Franco-Asian cuisine of absolute finesse celebrates exceptional produce with rare artistic sensitivity.",
      wine_list_critique: "Odette's cellar is a cosmopolitan treasure, blending grand Bordeaux and Burgundy crus with astute New World selections. The sommelier offers bold pairings that elevate Chef Royer's fusion cuisine to new heights."
    }
  },
  {
    slug: 'core-by-clare-smyth',
    fr: {
      description: "Core by Clare Smyth, à Notting Hill, est le restaurant doublement étoilé de la première femme chef à obtenir trois étoiles au Royaume-Uni. Sa cuisine britannique contemporaine magnifie les produits insulaires avec une précision et une élégance remarquables.",
      wine_list_critique: "La carte des vins de Core équilibre avec brio les classiques français et les découvertes britanniques émergentes. Les champagnes de vignerons côtoient de grands bourgognes, révélant un travail de sélection minutieux et passionné."
    },
    en: {
      description: "Core by Clare Smyth, in Notting Hill, is the two-Michelin-starred restaurant of the first female chef to hold three stars in the UK. Her contemporary British cuisine elevates island produce with remarkable precision and elegance.",
      wine_list_critique: "Core's wine list brilliantly balances French classics with emerging British discoveries. Grower champagnes sit alongside grand Burgundies, revealing meticulous and passionate curation."
    }
  },
  {
    slug: 'beaumaniere',
    fr: {
      description: "La Baumanière, aux pieds des Baux-de-Provence, est une institution doublement étoilée depuis 1954. Dans un cadre provençal d'exception, le chef Glenn Viel propose une cuisine méditerranéenne d'une justesse et d'une profondeur remarquables.",
      wine_list_critique: "La cave de Baumanière est un monument patrimonial, riche de millésimes anciens de Châteauneuf-du-Pape et de Bandol. Les vins de Provence y tiennent une place d'honneur, avec des verticales impressionnantes et des raretés introuvables ailleurs."
    },
    en: {
      description: "Baumanière, at the foot of Les Baux-de-Provence, has been a two-Michelin-starred institution since 1954. In an exceptional Provençal setting, Chef Glenn Viel delivers Mediterranean cuisine of remarkable precision and depth.",
      wine_list_critique: "Baumanière's cellar is a heritage monument, rich with aged Châteauneuf-du-Pape and Bandol vintages. Provençal wines hold pride of place, with impressive verticals and rarities found nowhere else."
    }
  },
  {
    slug: 'yannick-alleno',
    fr: {
      description: "Yannick Alléno, au Pavillon Ledoyen sur les Champs-Élysées, est un temple de la haute gastronomie triplement étoilé. Le chef y développe sa cuisine moderne autour des sauces et des extractions, repoussant les limites du goût avec une maîtrise absolue.",
      wine_list_critique: "La carte des vins du Ledoyen est monumentale, avec plus de 3 000 références couvrant tous les grands terroirs français. Les verticales de premiers et grands crus bourguignons y sont exceptionnelles, complétées par une sélection de spiritueux d'une rare profondeur."
    },
    en: {
      description: "Yannick Alléno, at Pavillon Ledoyen on the Champs-Élysées, is a three-Michelin-starred temple of haute gastronomy. The chef develops his modern cuisine around sauces and extractions, pushing the boundaries of flavour with absolute mastery.",
      wine_list_critique: "Ledoyen's wine list is monumental, with over 3,000 references spanning every great French terroir. The verticals of premier and grand cru Burgundies are exceptional, complemented by a spirits selection of rare depth."
    }
  },
  {
    slug: 'the-dorchester',
    fr: {
      description: "Alain Ducasse at The Dorchester, dans le quartier de Mayfair à Londres, est un restaurant triplement étoilé offrant la quintessence de la cuisine française. Le cadre Art déco et le service impeccable accompagnent une expérience gastronomique inoubliable.",
      wine_list_critique: "La carte des vins du Dorchester est un livre de référence, avec une profondeur exceptionnelle en Bordeaux et Bourgogne. Les millésimes rares de Pétrus et de la Romanée-Conti côtoient une sélection rigoureuse de spiritueux fins, cognacs et whiskies d'exception."
    },
    en: {
      description: "Alain Ducasse at The Dorchester, in London's Mayfair, is a three-Michelin-starred restaurant delivering the quintessence of French cuisine. The Art Deco setting and impeccable service accompany an unforgettable gastronomic experience.",
      wine_list_critique: "The Dorchester's wine list is a reference book, with exceptional depth in Bordeaux and Burgundy. Rare vintages of Pétrus and Romanée-Conti sit alongside a rigorous selection of fine spirits, cognacs, and exceptional whiskies."
    }
  },
  {
    slug: 'the-fat-duck',
    fr: {
      description: "The Fat Duck, à Bray, est le restaurant triplement étoilé du chef Heston Blumenthal, pionnier de la cuisine moléculaire. Chaque plat est une aventure multisensorielle, mêlant science, nostalgie et créativité dans un voyage gastronomique unique au monde.",
      wine_list_critique: "La carte des vins du Fat Duck surprend par son éclectisme audacieux. Des vins de dessert rares aux grands crus classés, la sélection est pensée pour accompagner l'expérience multisensorielle du chef Blumenthal, avec des accords inattendus et mémorables."
    },
    en: {
      description: "The Fat Duck, in Bray, is Chef Heston Blumenthal's three-Michelin-starred restaurant and pioneer of molecular gastronomy. Each dish is a multisensory adventure, blending science, nostalgia, and creativity in a gastronomic journey unique in the world.",
      wine_list_critique: "The Fat Duck's wine list surprises with its bold eclecticism. From rare dessert wines to grand crus classés, the selection is designed to accompany Chef Blumenthal's multisensory experience, with unexpected and memorable pairings."
    }
  },
  {
    slug: 'la-prieure',
    fr: {
      description: "Le Prieuré, à Villeneuve-lès-Avignon, est un restaurant étoilé installé dans un ancien prieuré du XIVe siècle. Le chef y compose une cuisine provençale raffinée, sublimée par les herbes du jardin et les produits du terroir avignonnais.",
      wine_list_critique: "La carte des vins du Prieuré est un hymne à la vallée du Rhône, avec des sélections remarquables de Châteauneuf-du-Pape, Gigondas et Tavel. Les rosés de Provence y sont particulièrement bien représentés, offrant des accords parfaits avec la cuisine solaire du chef."
    },
    en: {
      description: "Le Prieuré, in Villeneuve-lès-Avignon, is a Michelin-starred restaurant set within a 14th-century priory. The chef composes refined Provençal cuisine, elevated by garden herbs and the finest Avignon terroir produce.",
      wine_list_critique: "Le Prieuré's wine list is a hymn to the Rhône Valley, with remarkable selections of Châteauneuf-du-Pape, Gigondas, and Tavel. Provençal rosés are particularly well represented, offering perfect pairings with the chef's sun-drenched cuisine."
    }
  },
  {
    slug: 'la-bouitte',
    fr: {
      description: "La Bouitte, à Saint-Martin-de-Belleville au cœur des Alpes, est un restaurant triplement étoilé tenu par la famille Meilleur. Une cuisine montagnarde d'exception qui puise dans les ressources alpines avec une inventivité et une générosité remarquables.",
      wine_list_critique: "La cave de La Bouitte est un joyau alpin, avec une profondeur remarquable en vins de Savoie et du Jura. Les grands bourgognes blancs y côtoient des raretés jurassiennes, composant une carte d'une authenticité et d'une pertinence exemplaires."
    },
    en: {
      description: "La Bouitte, in Saint-Martin-de-Belleville in the heart of the Alps, is a three-Michelin-starred restaurant run by the Meilleur family. Exceptional mountain cuisine drawing from alpine resources with remarkable inventiveness and generosity.",
      wine_list_critique: "La Bouitte's cellar is an alpine jewel, with remarkable depth in Savoyard and Jura wines. Grand white Burgundies sit alongside Jura rarities, composing a list of exemplary authenticity and relevance."
    }
  },
  {
    slug: 'le-calandre',
    fr: {
      description: "Le Calandre, à Rubano près de Padoue, est le restaurant triplement étoilé du chef Massimiliano Alajmo, le plus jeune chef à avoir obtenu trois étoiles en Italie. Sa cuisine vénitienne contemporaine est un modèle d'élégance et de créativité.",
      wine_list_critique: "La carte des vins du Calandre est une encyclopédie des grands vins italiens, des Amarone aux Barolo, enrichie de sélections françaises pointues. Le travail sur les vins vénitiens et les grappas artisanales témoigne d'un ancrage territorial remarquable."
    },
    en: {
      description: "Le Calandre, in Rubano near Padua, is the three-Michelin-starred restaurant of Chef Massimiliano Alajmo, the youngest chef to earn three stars in Italy. His contemporary Venetian cuisine is a model of elegance and creativity.",
      wine_list_critique: "Le Calandre's wine list is an encyclopedia of great Italian wines, from Amarone to Barolo, enriched with astute French selections. The focus on Venetian wines and artisanal grappas reflects remarkable territorial commitment."
    }
  },
  {
    slug: 'rutz',
    fr: {
      description: "Rutz, à Berlin-Mitte, est un restaurant doublement étoilé où le chef Marco Müller propose une cuisine germanique d'avant-garde. Les produits locaux de Brandebourg sont transformés avec une technique irréprochable et une sensibilité artistique saisissante.",
      wine_list_critique: "La carte des vins du Rutz est l'une des plus belles d'Allemagne, avec une collection extraordinaire de Rieslings secs et de Spätburgunder. Les vins autrichiens et français complètent une sélection d'une intelligence et d'une profondeur rares."
    },
    en: {
      description: "Rutz, in Berlin-Mitte, is a two-Michelin-starred restaurant where Chef Marco Müller offers avant-garde Germanic cuisine. Local Brandenburg produce is transformed with impeccable technique and striking artistic sensibility.",
      wine_list_critique: "Rutz's wine list is one of the finest in Germany, with an extraordinary collection of dry Rieslings and Spätburgunder. Austrian and French wines complete a selection of rare intelligence and depth."
    }
  },
  {
    slug: 'frederikshoj',
    fr: {
      description: "Frederikshøj, à Aarhus, est un restaurant doublement étoilé dirigé par le chef Wassim Hallal. Sa cuisine nordique moderne allie les traditions danoises aux influences françaises, créant des plats d'une élégance et d'une précision remarquables.",
      wine_list_critique: "La carte des vins de Frederikshøj surprend par la qualité de sa sélection de champagnes de vignerons et de bourgognes. Les vins naturels scandinaves émergents y trouvent leur place aux côtés des grandes maisons, témoignant d'une curiosité œnologique exemplaire."
    },
    en: {
      description: "Frederikshøj, in Aarhus, is a two-Michelin-starred restaurant led by Chef Wassim Hallal. His modern Nordic cuisine blends Danish traditions with French influences, creating dishes of remarkable elegance and precision.",
      wine_list_critique: "Frederikshøj's wine list impresses with its quality selection of grower champagnes and Burgundies. Emerging Scandinavian natural wines find their place alongside grand maisons, reflecting exemplary oenological curiosity."
    }
  },
  {
    slug: 'cheval-blanc-by-peter-knogl',
    fr: {
      description: "Cheval Blanc by Peter Knogl, au Grand Hotel Les Trois Rois à Bâle, est un restaurant doublement étoilé. Le chef y propose une cuisine méditerranéenne raffinée avec des influences suisses, dans un cadre historique surplombant le Rhin.",
      wine_list_critique: "La carte des vins du Cheval Blanc est un pont entre les vignobles suisses, alsaciens et les grands terroirs bordelais. Les Chasselas du Valais et les Pinots Noirs bâlois y brillent aux côtés des premiers crus classés, dans une sélection d'une harmonie parfaite."
    },
    en: {
      description: "Cheval Blanc by Peter Knogl, at the Grand Hotel Les Trois Rois in Basel, is a two-Michelin-starred restaurant. The chef presents refined Mediterranean cuisine with Swiss influences, in a historic setting overlooking the Rhine.",
      wine_list_critique: "Cheval Blanc's wine list bridges Swiss, Alsatian, and grand Bordeaux vineyards. Valais Chasselas and Basel Pinot Noirs shine alongside premiers crus classés, in a selection of perfect harmony."
    }
  },
  {
    slug: 'quince',
    fr: {
      description: "Quince, à San Francisco, est un restaurant triplement étoilé du chef Michael Tusk. Sa cuisine italo-californienne célèbre les produits de sa propre ferme avec une sophistication et une pureté qui en font l'une des meilleures tables de la côte ouest.",
      wine_list_critique: "La carte des vins de Quince est un hommage aux vignobles californiens et italiens, avec des verticales impressionnantes de Barolo et de Napa Cabernet. Les vins de la Sonoma Valley et les Brunello di Montalcino y côtoient des raretés bourguignonnes."
    },
    en: {
      description: "Quince, in San Francisco, is Chef Michael Tusk's three-Michelin-starred restaurant. His Italo-Californian cuisine celebrates produce from his own farm with a sophistication and purity that makes it one of the West Coast's finest tables.",
      wine_list_critique: "Quince's wine list is a tribute to Californian and Italian vineyards, with impressive verticals of Barolo and Napa Cabernet. Sonoma Valley wines and Brunello di Montalcino sit alongside rare Burgundies."
    }
  },
  {
    slug: 'caprice',
    fr: {
      description: "Caprice, au Four Seasons de Hong Kong, est un restaurant doublement étoilé proposant une cuisine française contemporaine d'une élégance absolue. La vue spectaculaire sur le port de Victoria accompagne une expérience gastronomique mémorable.",
      wine_list_critique: "La cave de Caprice est l'une des plus impressionnantes d'Asie, avec une collection monumentale de grands crus bordelais et bourguignons. Les champagnes millésimés et les vins du Rhône complètent une sélection digne des plus grandes tables parisiennes."
    },
    en: {
      description: "Caprice, at the Four Seasons Hong Kong, is a two-Michelin-starred restaurant offering contemporary French cuisine of absolute elegance. The spectacular Victoria Harbour view accompanies a memorable gastronomic experience.",
      wine_list_critique: "Caprice's cellar is one of the most impressive in Asia, with a monumental collection of grand Bordeaux and Burgundy crus. Vintage champagnes and Rhône wines complete a selection worthy of Paris's greatest tables."
    }
  },
  {
    slug: 'loiseau-rive-gauche',
    fr: {
      description: "Loiseau Rive Gauche, sur la rive gauche parisienne, est un restaurant étoilé perpétuant l'héritage de Bernard Loiseau. Une cuisine bourguignonne moderne, précise et généreuse, dans un cadre élégant et chaleureux.",
      wine_list_critique: "La carte des vins de Loiseau Rive Gauche est naturellement dominée par la Bourgogne, avec des sélections pointues de Chablis, Meursault et Gevrey-Chambertin. Les spiritueux, notamment les bourbons américains, révèlent une ouverture d'esprit bienvenue."
    },
    en: {
      description: "Loiseau Rive Gauche, on the Parisian Left Bank, is a Michelin-starred restaurant perpetuating Bernard Loiseau's legacy. Modern Burgundian cuisine, precise and generous, in an elegant and warm setting.",
      wine_list_critique: "Loiseau Rive Gauche's wine list is naturally dominated by Burgundy, with astute selections of Chablis, Meursault, and Gevrey-Chambertin. The spirits, notably American bourbons, reveal a welcome open-mindedness."
    }
  },
  {
    slug: 'geranium',
    fr: {
      description: "Geranium, à Copenhague, est un restaurant triplement étoilé du chef Rasmus Kofoed. Sa cuisine nordique végétale est un chef-d'œuvre d'inventivité, puisant dans les saisons scandinaves pour créer des plats d'une beauté et d'une saveur incomparables.",
      wine_list_critique: "La carte des vins de Geranium privilégie les vins biodynamiques et naturels, avec une sélection remarquable de domaines français et scandinaves émergents. Les accords avec la cuisine végétale du chef Kofoed sont d'une justesse et d'une créativité exceptionnelles."
    },
    en: {
      description: "Geranium, in Copenhagen, is Chef Rasmus Kofoed's three-Michelin-starred restaurant. His plant-based Nordic cuisine is a masterpiece of inventiveness, drawing from Scandinavian seasons to create dishes of incomparable beauty and flavour.",
      wine_list_critique: "Geranium's wine list favours biodynamic and natural wines, with a remarkable selection of French and emerging Scandinavian estates. The pairings with Chef Kofoed's plant-based cuisine are of exceptional precision and creativity."
    }
  },
  {
    slug: 'the-connaught',
    fr: {
      description: "Hélène Darroze at The Connaught, dans le quartier de Mayfair à Londres, est un restaurant doublement étoilé. La chef y propose une cuisine du Sud-Ouest français réinventée avec finesse, dans un cadre feutré d'une élégance toute britannique.",
      wine_list_critique: "La carte des vins du Connaught fait la part belle aux appellations du Sud-Ouest et de Bordeaux, avec des Madiran et des Saint-Émilion remarquables. Les armagnacs et les vins de dessert pyrénéens complètent une sélection d'une cohérence géographique exemplaire."
    },
    en: {
      description: "Hélène Darroze at The Connaught, in London's Mayfair, is a two-Michelin-starred restaurant. The chef presents a reinvented South-West French cuisine with finesse, in a hushed setting of quintessential British elegance.",
      wine_list_critique: "The Connaught's wine list showcases South-West and Bordeaux appellations, with remarkable Madiran and Saint-Émilion selections. Armagnacs and Pyrenean dessert wines complete a selection of exemplary geographical coherence."
    }
  },
  {
    slug: 'latelier-de-joel-robuchon',
    fr: {
      description: "L'Atelier de Joël Robuchon, à Paris, est un restaurant doublement étoilé où l'héritage du « Chef du Siècle » perdure. Sa cuisine française d'une précision absolue est servie au comptoir dans une atmosphère intimiste et théâtrale.",
      wine_list_critique: "La carte des vins de l'Atelier Robuchon est un modèle d'exhaustivité française, avec une profondeur remarquable en Bordeaux, Bourgogne et Champagne. Les petits producteurs y côtoient les grandes maisons dans une sélection qui reflète l'exigence légendaire de Robuchon."
    },
    en: {
      description: "L'Atelier de Joël Robuchon, in Paris, is a two-Michelin-starred restaurant where the legacy of the 'Chef of the Century' endures. French cuisine of absolute precision served at the counter in an intimate and theatrical atmosphere.",
      wine_list_critique: "L'Atelier Robuchon's wine list is a model of French comprehensiveness, with remarkable depth in Bordeaux, Burgundy, and Champagne. Small producers sit alongside grand maisons in a selection reflecting Robuchon's legendary exacting standards."
    }
  },
  {
    slug: 'otto-e-mezzo',
    fr: {
      description: "Otto e Mezzo Bombana, à Hong Kong, est un restaurant triplement étoilé du chef Umberto Bombana, surnommé le « Roi de la truffe blanche ». Sa cuisine italienne d'exception transporte la grande tradition gastronomique transalpine au cœur de l'Asie.",
      wine_list_critique: "La carte des vins d'Otto e Mezzo est une ode à l'Italie, avec des collections vertigineuses de Barolo, Barbaresco et Super Toscans. Les verticales de Sassicaia et d'Ornellaia y sont légendaires, complétées par une sélection de champagnes d'une grande finesse."
    },
    en: {
      description: "Otto e Mezzo Bombana, in Hong Kong, is Chef Umberto Bombana's three-Michelin-starred restaurant, known as the 'King of White Truffle.' His exceptional Italian cuisine brings the great transalpine gastronomic tradition to the heart of Asia.",
      wine_list_critique: "Otto e Mezzo's wine list is an ode to Italy, with dizzying collections of Barolo, Barbaresco, and Super Tuscans. The Sassicaia and Ornellaia verticals are legendary, complemented by a champagne selection of great finesse."
    }
  },
  {
    slug: 'le-jules-verne',
    fr: {
      description: "Le Jules Verne, niché au deuxième étage de la Tour Eiffel, offre une expérience gastronomique unique avec une vue imprenable sur Paris. Une cuisine française d'altitude, élégante et aérienne, signée par un chef d'exception.",
      wine_list_critique: "La carte des vins du Jules Verne est une ode à la Bourgogne et à Bordeaux, avec une sélection de millésimes exceptionnels soigneusement sélectionnés par le chef sommelier. On y découvre des raretés comme des Pétrus en magnum et des Romanée-Conti des grandes années."
    },
    en: {
      description: "Le Jules Verne, perched on the second floor of the Eiffel Tower, offers a unique gastronomic experience with breathtaking views of Paris. Elevated French cuisine, elegant and ethereal, crafted by an exceptional chef.",
      wine_list_critique: "Le Jules Verne's wine list is an ode to Burgundy and Bordeaux, with exceptional vintages carefully curated by the head sommelier. Rarities such as Pétrus magnums and great-year Romanée-Conti await discovery."
    }
  },
]

async function insertRestaurantTranslations() {
  console.log('--- Step 3: Insert restaurant translations ---')
  let count = 0
  for (const rt of RESTAURANT_TRANSLATIONS) {
    const rid = await lookupRestaurantId(rt.slug)
    if (!rid) { console.error(`  Restaurant not found: ${rt.slug}`); continue }

    // FR
    const { error: frErr } = await supabase
      .from('restaurant_translations')
      .upsert({
        restaurant_id: rid,
        locale: 'fr',
        description: rt.fr.description,
        wine_list_critique: rt.fr.wine_list_critique,
        meta_title: `Carte des vins du Restaurant ${RESTAURANTS.find(r => r.slug === rt.slug)!.name} — ${RESTAURANTS.find(r => r.slug === rt.slug)!.city} | Bestwine`,
        meta_description: `Découvrez la carte des vins du restaurant étoilé ${RESTAURANTS.find(r => r.slug === rt.slug)!.name} à ${RESTAURANTS.find(r => r.slug === rt.slug)!.city} : sélection, critique et références par nos sommeliers experts.`,
      }, { onConflict: 'restaurant_id,locale' })
    if (frErr) console.error(`  FR ${rt.slug}: ${frErr.message}`)
    else count++

    // EN-US
    const r = RESTAURANTS.find(r => r.slug === rt.slug)!
    const { error: enErr } = await supabase
      .from('restaurant_translations')
      .upsert({
        restaurant_id: rid,
        locale: 'en-us',
        description: rt.en.description,
        wine_list_critique: rt.en.wine_list_critique,
        meta_title: `Wine List of ${r.name} — ${r.city} | Bestwine`,
        meta_description: `Discover the wine list of Michelin-starred ${r.name} in ${r.city}: selection, review, and references by our expert sommeliers.`,
      }, { onConflict: 'restaurant_id,locale' })
    if (enErr) console.error(`  EN ${rt.slug}: ${enErr.message}`)
    else count++
  }
  console.log(`  Upserted ${count} restaurant translations`)
}

// ---------------------------------------------------------------------------
// 4. Drinks
// ---------------------------------------------------------------------------

interface DrinkDef {
  name: string
  slug: string
  category_slug: string
  producer?: string
  vintage?: number
  country: string
  region?: string
  appellation?: string
  fr_tasting: string
  en_tasting: string
}

const DRINKS: DrinkDef[] = [
  // ---- WHISKY: Scotch ----
  {
    name: 'Talisker 10 Years', slug: 'talisker-10-years', category_slug: 'scotch',
    producer: 'Talisker', country: 'Scotland', region: 'Isle of Skye',
    fr_tasting: "Nez maritime intense de sel marin et de fumée de tourbe. Bouche puissante aux notes de poivre noir, d'algues et de miel, avec une finale longue et chaleureuse.",
    en_tasting: "Intensely maritime nose of sea salt and peat smoke. Powerful palate with notes of black pepper, seaweed, and honey, finishing long and warm."
  },
  {
    name: 'Macallan Fine Oak 12', slug: 'macallan-fine-oak-12', category_slug: 'scotch',
    producer: 'The Macallan', country: 'Scotland', region: 'Speyside',
    fr_tasting: "Nez délicat de vanille, de noix de coco et de fruits secs. Bouche soyeuse aux notes de miel d'acacia, de pêche blanche et de chêne fin, avec une finale élégante et équilibrée.",
    en_tasting: "Delicate nose of vanilla, coconut, and dried fruits. Silky palate with notes of acacia honey, white peach, and fine oak, finishing elegant and balanced."
  },
  {
    name: 'Highland Park 18', slug: 'highland-park-18', category_slug: 'scotch',
    producer: 'Highland Park', country: 'Scotland', region: 'Orkney',
    fr_tasting: "Nez complexe de bruyère, de miel et de tourbe douce. Bouche ronde et chaleureuse, mêlant le caramel beurre salé, les épices douces et une fumée subtile. Finale longue et harmonieuse.",
    en_tasting: "Complex nose of heather, honey, and gentle peat. Round, warm palate blending salted butter caramel, sweet spices, and subtle smoke. Long, harmonious finish."
  },
  {
    name: 'Laphroaig 10', slug: 'laphroaig-10', category_slug: 'scotch',
    producer: 'Laphroaig', country: 'Scotland', region: 'Islay',
    fr_tasting: "Nez puissamment tourbé, iodé et médicinal. Bouche intense aux notes de goudron, d'algue et de sel, relevée par une douceur inattendue de vanille. Finale longue et fumée.",
    en_tasting: "Powerfully peated, iodine and medicinal nose. Intense palate of tar, seaweed, and salt, lifted by an unexpected sweetness of vanilla. Long, smoky finish."
  },
  {
    name: 'Bowmore', slug: 'bowmore', category_slug: 'scotch',
    producer: 'Bowmore', country: 'Scotland', region: 'Islay',
    fr_tasting: "Nez marin aux accents de tourbe délicate et de chocolat noir. Bouche ronde, fumée et fruitée, avec des notes de miel et de citron. Finale douce et saline.",
    en_tasting: "Marine nose with delicate peat and dark chocolate accents. Round, smoky and fruity palate with notes of honey and lemon. Gentle, saline finish."
  },
  {
    name: 'Caol Ila', slug: 'caol-ila', category_slug: 'scotch',
    producer: 'Caol Ila', country: 'Scotland', region: 'Islay',
    fr_tasting: "Nez frais et fumé, aux notes d'huile d'olive et de citron vert. Bouche légère pour un Islay, avec une tourbe élégante, des fruits verts et une finale nette et citronnée.",
    en_tasting: "Fresh, smoky nose with olive oil and lime notes. Light for an Islay, with elegant peat, green fruits, and a crisp, citrusy finish."
  },
  {
    name: 'Lagavulin', slug: 'lagavulin', category_slug: 'scotch',
    producer: 'Lagavulin', country: 'Scotland', region: 'Islay',
    fr_tasting: "Nez profond de tourbe, de fruits secs et de caramel fumé. Bouche riche et complexe, aux notes de réglisse, de chêne toasté et d'iode. Finale interminable et enveloppante.",
    en_tasting: "Deep nose of peat, dried fruits, and smoky caramel. Rich, complex palate with liquorice, toasted oak, and iodine. Endless, enveloping finish."
  },
  {
    name: 'Ardbeg', slug: 'ardbeg', category_slug: 'scotch',
    producer: 'Ardbeg', country: 'Scotland', region: 'Islay',
    fr_tasting: "Nez explosif de tourbe, de goudron et de citron. Bouche intense et huileuse, avec des notes de café, de chocolat amer et de fumée. Finale longue, poivrée et maritime.",
    en_tasting: "Explosive nose of peat, tar, and lemon. Intense, oily palate with coffee, bitter chocolate, and smoke. Long, peppery, maritime finish."
  },
  {
    name: 'Glenmorangie', slug: 'glenmorangie', category_slug: 'scotch',
    producer: 'Glenmorangie', country: 'Scotland', region: 'Highland',
    fr_tasting: "Nez floral et fruité, aux notes de pêche, de vanille et d'amande. Bouche douce et crémeuse, avec des arômes de miel, de citron et d'épices. Finale élégante et délicate.",
    en_tasting: "Floral, fruity nose with peach, vanilla, and almond notes. Smooth, creamy palate with honey, lemon, and spice aromas. Elegant, delicate finish."
  },
  {
    name: 'Dalmore', slug: 'dalmore', category_slug: 'scotch',
    producer: 'Dalmore', country: 'Scotland', region: 'Highland',
    fr_tasting: "Nez opulent de marmelade d'orange, de chocolat et de cuir. Bouche riche et soyeuse, aux notes de fruits confits, de cannelle et de chêne. Finale longue et chaleureuse.",
    en_tasting: "Opulent nose of orange marmalade, chocolate, and leather. Rich, silky palate with candied fruit, cinnamon, and oak. Long, warm finish."
  },
  {
    name: 'Glenkichie 12', slug: 'glenkichie-12', category_slug: 'scotch',
    producer: 'Glenkinchie', country: 'Scotland', region: 'Lowlands',
    fr_tasting: "Nez léger et herbacé, aux notes de fleurs blanches et de céréales. Bouche douce et fraîche, avec des arômes de miel, de beurre et de citron. Finale courte et rafraîchissante.",
    en_tasting: "Light, herbaceous nose with white flowers and cereal notes. Soft, fresh palate with honey, butter, and lemon aromas. Short, refreshing finish."
  },
  {
    name: 'Johnnie Walker Gold Label 15', slug: 'johnnie-walker-gold-label-15', category_slug: 'scotch',
    producer: 'Johnnie Walker', country: 'Scotland',
    fr_tasting: "Nez crémeux de miel, de vanille et de fruits tropicaux. Bouche soyeuse et délicate, avec des notes de bois de santal, de poire et de fumée légère. Finale douce et persistante.",
    en_tasting: "Creamy nose of honey, vanilla, and tropical fruits. Silky, delicate palate with sandalwood, pear, and light smoke. Gentle, lingering finish."
  },
  {
    name: 'Arran 18', slug: 'arran-18', category_slug: 'scotch',
    producer: 'Arran', country: 'Scotland',
    fr_tasting: "Nez complexe de fruits mûrs, de cannelle et de chêne. Bouche généreuse aux notes de toffee, de gingembre et de raisins secs. Finale longue et épicée, d'une belle profondeur.",
    en_tasting: "Complex nose of ripe fruits, cinnamon, and oak. Generous palate with toffee, ginger, and raisin notes. Long, spiced finish of fine depth."
  },
  {
    name: 'Cragganmore 12', slug: 'cragganmore-12', category_slug: 'scotch',
    producer: 'Cragganmore', country: 'Scotland', region: 'Speyside',
    fr_tasting: "Nez délicat de fleurs sauvages, de malt et de noisette. Bouche moyenne et complexe, aux notes de fumée douce, d'herbes aromatiques et de miel. Finale équilibrée et subtile.",
    en_tasting: "Delicate nose of wildflowers, malt, and hazelnut. Medium-bodied, complex palate with gentle smoke, aromatic herbs, and honey. Balanced, subtle finish."
  },
  // ---- WHISKY: Japonais ----
  {
    name: 'Hibiki 17 Years', slug: 'hibiki-17-years', category_slug: 'japonais',
    producer: 'Suntory', country: 'Japan',
    fr_tasting: "Nez d'une finesse exquise, mêlant rose, prunier japonais et miel de Mizunara. Bouche d'une harmonie parfaite, aux notes de chocolat blanc, d'agrumes confits et de bois de santal. Finale longue et soyeuse.",
    en_tasting: "Exquisitely refined nose blending rose, Japanese plum, and Mizunara honey. Perfectly harmonious palate with white chocolate, candied citrus, and sandalwood. Long, silky finish."
  },
  {
    name: 'Nikka Taketsuru 17', slug: 'nikka-taketsuru-17', category_slug: 'japonais',
    producer: 'Nikka', country: 'Japan',
    fr_tasting: "Nez riche de fruits noirs, de tourbe légère et de caramel. Bouche ample et complexe, aux notes de sherry, de pruneaux et de fumée douce. Finale longue, fruitée et épicée.",
    en_tasting: "Rich nose of dark fruits, light peat, and caramel. Full, complex palate with sherry, prune, and gentle smoke notes. Long, fruity, spiced finish."
  },
  {
    name: 'Yamazaki 18', slug: 'yamazaki-18', category_slug: 'japonais',
    producer: 'Suntory', country: 'Japan',
    fr_tasting: "Nez profond de fruits rouges mûrs, de chocolat noir et de bois de Mizunara. Bouche somptueuse, aux notes de raisins de Corinthe, de cannelle et de chêne toasté. Finale interminable et veloutée.",
    en_tasting: "Deep nose of ripe red fruits, dark chocolate, and Mizunara wood. Sumptuous palate with Corinthian raisin, cinnamon, and toasted oak. Endless, velvety finish."
  },
  // ---- WHISKY: Bourbon ----
  {
    name: 'Elijah Craig 12', slug: 'elijah-craig-12', category_slug: 'bourbon',
    producer: 'Elijah Craig', country: 'USA', region: 'Kentucky',
    fr_tasting: "Nez chaleureux de vanille, de caramel et de maïs grillé. Bouche ronde et épicée, avec des notes de noix, de chêne fumé et de miel. Finale longue et boisée.",
    en_tasting: "Warm nose of vanilla, caramel, and toasted corn. Round, spiced palate with walnut, smoked oak, and honey. Long, woody finish."
  },
  {
    name: "Blanton's", slug: 'blantons', category_slug: 'bourbon',
    producer: "Blanton's", country: 'USA', region: 'Kentucky',
    fr_tasting: "Nez élégant de caramel beurre salé, de vanille et d'orange. Bouche riche et soyeuse, aux notes de miel, de noix de muscade et de chêne doux. Finale longue et chaleureuse.",
    en_tasting: "Elegant nose of salted butter caramel, vanilla, and orange. Rich, silky palate with honey, nutmeg, and gentle oak. Long, warm finish."
  },
  {
    name: 'Buffalo Trace', slug: 'buffalo-trace', category_slug: 'bourbon',
    producer: 'Buffalo Trace', country: 'USA', region: 'Kentucky',
    fr_tasting: "Nez doux de vanille, de cassonade et de fruits rouges. Bouche équilibrée aux notes de caramel, de menthe et de chêne toasté. Finale moyenne, douce et épicée.",
    en_tasting: "Gentle nose of vanilla, brown sugar, and red fruits. Balanced palate with caramel, mint, and toasted oak. Medium-length finish, smooth and spiced."
  },
  {
    name: 'Four Roses', slug: 'four-roses', category_slug: 'bourbon',
    producer: 'Four Roses', country: 'USA', region: 'Kentucky',
    fr_tasting: "Nez floral et fruité, de poire et d'épices douces. Bouche légère et élégante, aux notes de miel, de vanille et de baies. Finale délicate et rafraîchissante.",
    en_tasting: "Floral, fruity nose of pear and sweet spices. Light, elegant palate with honey, vanilla, and berry notes. Delicate, refreshing finish."
  },
  {
    name: "Maker's Mark", slug: 'makers-mark', category_slug: 'bourbon',
    producer: "Maker's Mark", country: 'USA', region: 'Kentucky',
    fr_tasting: "Nez gourmand de caramel, de vanille et de blé rouge. Bouche douce et ronde, aux notes de fruits rouges, de boisé léger et de caramel au beurre. Finale chaleureuse et veloutée.",
    en_tasting: "Inviting nose of caramel, vanilla, and red wheat. Smooth, round palate with red fruits, light wood, and butter caramel. Warm, velvety finish."
  },
  {
    name: 'Bulleit', slug: 'bulleit', category_slug: 'bourbon',
    producer: 'Bulleit', country: 'USA', region: 'Kentucky',
    fr_tasting: "Nez épicé de seigle, de chêne et de vanille. Bouche sèche et complexe, aux notes de cannelle, de poivre noir et de caramel. Finale longue, épicée et boisée.",
    en_tasting: "Spicy nose of rye, oak, and vanilla. Dry, complex palate with cinnamon, black pepper, and caramel. Long, spiced, woody finish."
  },
  {
    name: 'Woodford Reserve', slug: 'woodford-reserve', category_slug: 'bourbon',
    producer: 'Woodford Reserve', country: 'USA', region: 'Kentucky',
    fr_tasting: "Nez élaboré de vanille crémeuse, de chocolat au lait et d'épices. Bouche riche et structurée, aux notes de cerise noire, de tabac et de chêne toasté. Finale persistante et raffinée.",
    en_tasting: "Elaborate nose of creamy vanilla, milk chocolate, and spices. Rich, structured palate with black cherry, tobacco, and toasted oak. Lingering, refined finish."
  },
  {
    name: "Jack Daniel's", slug: 'jack-daniels', category_slug: 'bourbon',
    producer: "Jack Daniel's", country: 'USA', region: 'Tennessee',
    fr_tasting: "Nez caractéristique de banane, de caramel et de charbon d'érable. Bouche douce et accessible, aux notes de vanille, de noisette et de fumée légère. Finale courte et suave.",
    en_tasting: "Characteristic nose of banana, caramel, and maple charcoal. Smooth, approachable palate with vanilla, hazelnut, and light smoke. Short, suave finish."
  },
  // ---- WHISKY: Irlandais ----
  {
    name: 'Bushmills', slug: 'bushmills', category_slug: 'irlandais',
    producer: 'Bushmills', country: 'Ireland',
    fr_tasting: "Nez frais de miel, de vanille et de pomme verte. Bouche légère et douce, aux notes de céréales, de fruits blancs et de bois léger. Finale courte et agréable.",
    en_tasting: "Fresh nose of honey, vanilla, and green apple. Light, gentle palate with cereal, white fruit, and light wood notes. Short, pleasant finish."
  },
  {
    name: 'Jameson', slug: 'jameson', category_slug: 'irlandais',
    producer: 'Jameson', country: 'Ireland',
    fr_tasting: "Nez doux de céréales, de vanille et de noisette. Bouche souple et ronde, aux notes de sherry léger, d'épices douces et de miel. Finale courte, douce et maltée.",
    en_tasting: "Gentle nose of cereal, vanilla, and hazelnut. Supple, round palate with light sherry, sweet spices, and honey. Short, smooth, malty finish."
  },
  {
    name: 'Redbreast', slug: 'redbreast', category_slug: 'irlandais',
    producer: 'Redbreast', country: 'Ireland',
    fr_tasting: "Nez complexe de fruits rouges, de sherry et de beurre. Bouche opulente aux notes de fruits secs, de crème brûlée et d'épices. Finale longue, riche et soyeuse, typiquement pot still.",
    en_tasting: "Complex nose of red fruits, sherry, and butter. Opulent palate with dried fruit, crème brûlée, and spice. Long, rich, silky finish, distinctively pot still."
  },
  // ---- WHISKY: Canadien ----
  {
    name: 'Canadian Club', slug: 'canadian-club', category_slug: 'canadien',
    producer: 'Canadian Club', country: 'Canada',
    fr_tasting: "Nez léger de vanille, de seigle et de bois doux. Bouche souple et fraîche, aux notes de caramel, de pomme et de céréales. Finale courte et facile.",
    en_tasting: "Light nose of vanilla, rye, and soft wood. Supple, fresh palate with caramel, apple, and cereal. Short, easy finish."
  },
  {
    name: 'Crown Royal', slug: 'crown-royal', category_slug: 'canadien',
    producer: 'Crown Royal', country: 'Canada',
    fr_tasting: "Nez doux de vanille, de pêche et de seigle. Bouche crémeuse et élégante, aux notes d'érable, de noix et de caramel. Finale moyenne, douce et veloutée.",
    en_tasting: "Gentle nose of vanilla, peach, and rye. Creamy, elegant palate with maple, walnut, and caramel. Medium-length, smooth, velvety finish."
  },

  // ---- VIN ROUGE ----
  {
    name: 'Château Montrose 2011', slug: 'chateau-montrose-2011', category_slug: 'vin-rouge',
    producer: 'Château Montrose', vintage: 2011, country: 'France', region: 'Bordeaux', appellation: 'Saint-Estèphe',
    fr_tasting: "Robe grenat profond. Nez intense de cassis, de graphite et de cèdre. Bouche puissante et structurée, aux tanins fermes et soyeux, avec des notes de mûre, de réglisse et d'épices. Finale longue et minérale.",
    en_tasting: "Deep garnet robe. Intense nose of blackcurrant, graphite, and cedar. Powerful, structured palate with firm, silky tannins, notes of blackberry, liquorice, and spices. Long, mineral finish."
  },
  {
    name: 'Château de Beaucastel 2017', slug: 'chateau-de-beaucastel-2017', category_slug: 'vin-rouge',
    producer: 'Château de Beaucastel', vintage: 2017, country: 'France', region: 'Côtes du Rhône', appellation: 'Châteauneuf-du-Pape',
    fr_tasting: "Robe rubis foncé. Nez complexe de garrigue, de fruits noirs et d'épices orientales. Bouche ample et généreuse, aux tanins fondus, avec des notes de cerise noire, de cuir et de thym. Finale longue et chaleureuse.",
    en_tasting: "Dark ruby robe. Complex nose of garrigue, dark fruits, and oriental spices. Full, generous palate with melted tannins, notes of black cherry, leather, and thyme. Long, warm finish."
  },
  {
    name: "Château Cos d'Estournel 2014", slug: 'chateau-cos-destournel-2014', category_slug: 'vin-rouge',
    producer: "Château Cos d'Estournel", vintage: 2014, country: 'France', region: 'Bordeaux', appellation: 'Médoc',
    fr_tasting: "Robe pourpre intense. Nez expressif de fruits noirs, de violette et de bois de cèdre. Bouche élégante et racée, aux tanins fins, avec des notes de myrtille, de tabac et de graphite. Finale précise et persistante.",
    en_tasting: "Intense purple robe. Expressive nose of dark fruits, violet, and cedarwood. Elegant, racy palate with fine tannins, notes of blueberry, tobacco, and graphite. Precise, persistent finish."
  },
  {
    name: 'Château Cheval Blanc 2006', slug: 'chateau-cheval-blanc-2006', category_slug: 'vin-rouge',
    producer: 'Château Cheval Blanc', vintage: 2006, country: 'France', region: 'Bordeaux', appellation: 'Saint-Émilion',
    fr_tasting: "Robe grenat aux reflets tuilés. Nez évolué de truffe, de fruits confits et de cuir fin. Bouche soyeuse et mature, aux tanins fondus, avec des notes de cerise kirschée, de tabac et de sous-bois. Finale longue et harmonieuse.",
    en_tasting: "Garnet robe with tawny reflections. Evolved nose of truffle, candied fruits, and fine leather. Silky, mature palate with melted tannins, notes of kirsch cherry, tobacco, and forest floor. Long, harmonious finish."
  },
  {
    name: 'Pétrus 2007', slug: 'petrus-2007', category_slug: 'vin-rouge',
    producer: 'Pétrus', vintage: 2007, country: 'France', region: 'Bordeaux', appellation: 'Pomerol',
    fr_tasting: "Robe grenat sombre et profonde. Nez envoûtant de truffe noire, de cerise burlat et de violette. Bouche d'une richesse inouïe, veloutée et concentrée, aux tanins d'une finesse exceptionnelle. Finale interminable, mêlant réglisse, chocolat et minéralité.",
    en_tasting: "Dark, deep garnet robe. Bewitching nose of black truffle, Burlat cherry, and violet. Palate of extraordinary richness, velvety and concentrated, with tannins of exceptional finesse. Endless finish blending liquorice, chocolate, and minerality."
  },
  {
    name: 'Clos du Mont-Olivet 2011', slug: 'clos-du-mont-olivet-2011', category_slug: 'vin-rouge',
    producer: 'Clos du Mont-Olivet', vintage: 2011, country: 'France', region: 'Côtes du Rhône', appellation: 'Châteauneuf-du-Pape',
    fr_tasting: "Robe rubis brillant. Nez gourmand de cerise, de framboise et de garrigue. Bouche ronde et fraîche, aux tanins souples, avec des notes de thym, de lavande et de poivre. Finale élégante et digeste.",
    en_tasting: "Brilliant ruby robe. Inviting nose of cherry, raspberry, and garrigue. Round, fresh palate with supple tannins, notes of thyme, lavender, and pepper. Elegant, digestible finish."
  },
  {
    name: 'Château Mouton Rothschild 2011', slug: 'chateau-mouton-rothschild-2011', category_slug: 'vin-rouge',
    producer: 'Château Mouton Rothschild', vintage: 2011, country: 'France', region: 'Bordeaux', appellation: 'Pauillac',
    fr_tasting: "Robe pourpre dense. Nez noble de cassis, de cèdre et de havane. Bouche puissante et sculpturale, aux tanins fermes et enrobés, avec des notes de mûre, de graphite et d'épices. Finale majestueuse et interminable.",
    en_tasting: "Dense purple robe. Noble nose of blackcurrant, cedar, and Havana. Powerful, sculptural palate with firm, coated tannins, notes of blackberry, graphite, and spices. Majestic, endless finish."
  },
  {
    name: 'Clos Rougeard Les Poyeux 2015', slug: 'clos-rougeard-les-poyeux-2015', category_slug: 'vin-rouge',
    producer: 'Clos Rougeard', vintage: 2015, country: 'France', region: 'Loire', appellation: 'Saumur-Champigny',
    fr_tasting: "Robe rubis profond. Nez d'une pureté rare, de fruits rouges frais, de tuffeau et de fleurs. Bouche ciselée et précise, aux tanins d'une finesse cristalline, avec une minéralité vibrante. Finale longue et aérienne, d'une élégance absolue.",
    en_tasting: "Deep ruby robe. Nose of rare purity — fresh red fruits, tuffeau, and flowers. Chiselled, precise palate with crystalline tannins and vibrant minerality. Long, ethereal finish of absolute elegance."
  },
  {
    name: 'Domaine Alain Graillot 2017', slug: 'domaine-alain-graillot-2017', category_slug: 'vin-rouge',
    producer: 'Domaine Alain Graillot', vintage: 2017, country: 'France', region: 'Côtes du Rhône', appellation: 'Crozes-Hermitage',
    fr_tasting: "Robe violacée intense. Nez expressif de cassis, de violette et de poivre. Bouche charnue et épicée, aux tanins souples, avec des notes de mûre, d'olive noire et de réglisse. Finale fraîche et poivrée.",
    en_tasting: "Intense violet-tinged robe. Expressive nose of blackcurrant, violet, and pepper. Fleshy, spiced palate with supple tannins, notes of blackberry, black olive, and liquorice. Fresh, peppery finish."
  },

  // ---- CHAMPAGNE ----
  {
    name: 'Krug Grande Cuvée', slug: 'krug-grande-cuvee', category_slug: 'champagne',
    producer: 'Krug', country: 'France', region: 'Champagne', appellation: 'Reims',
    fr_tasting: "Nez d'une richesse incomparable, mêlant brioche toastée, noisette et agrumes confits. Bouche d'une ampleur majestueuse, aux bulles d'une finesse extrême, avec des notes de miel, d'amande grillée et de fruits blancs. Finale interminable et complexe.",
    en_tasting: "Nose of incomparable richness, blending toasted brioche, hazelnut, and candied citrus. Palate of majestic amplitude with supremely fine bubbles, notes of honey, toasted almond, and white fruits. Endless, complex finish."
  },
  {
    name: 'Champagne Salon', slug: 'champagne-salon', category_slug: 'champagne',
    producer: 'Salon', country: 'France', region: 'Champagne', appellation: 'Le Mesnil-sur-Oger',
    fr_tasting: "Nez minéral et cristallin, aux notes de silex, de citron vert et de craie. Bouche d'une pureté absolue, tendue et saline, avec des bulles d'une finesse laser. Finale interminable, citronnée et crayeuse, d'une élégance supérieure.",
    en_tasting: "Mineral, crystalline nose with flint, lime, and chalk notes. Palate of absolute purity, taut and saline, with laser-fine bubbles. Endless finish, lemony and chalky, of superior elegance."
  },
  {
    name: 'Dom Pérignon', slug: 'dom-perignon', category_slug: 'champagne',
    producer: 'Dom Pérignon', country: 'France', region: 'Champagne', appellation: 'Épernay',
    fr_tasting: "Nez complexe de brioche, de fleur blanche et d'amande. Bouche ample et crémeuse, aux bulles fines et persistantes, avec des notes de pêche blanche, de miel et de noisette. Finale longue et harmonieuse.",
    en_tasting: "Complex nose of brioche, white flowers, and almond. Full, creamy palate with fine, persistent bubbles, notes of white peach, honey, and hazelnut. Long, harmonious finish."
  },
  {
    name: 'Louis Roederer', slug: 'louis-roederer', category_slug: 'champagne',
    producer: 'Louis Roederer', country: 'France', region: 'Champagne', appellation: 'Reims',
    fr_tasting: "Nez fin de pomme golden, de pâtisserie et de fleurs blanches. Bouche élégante et équilibrée, aux bulles délicates, avec des notes de poire, de miel d'acacia et de brioche. Finale fraîche et raffinée.",
    en_tasting: "Refined nose of golden apple, pastry, and white flowers. Elegant, balanced palate with delicate bubbles, notes of pear, acacia honey, and brioche. Fresh, refined finish."
  },
  {
    name: 'Veuve Clicquot', slug: 'veuve-clicquot', category_slug: 'champagne',
    producer: 'Veuve Clicquot', country: 'France', region: 'Champagne', appellation: 'Reims',
    fr_tasting: "Nez franc de fruits jaunes, de brioche et de biscuit. Bouche généreuse et équilibrée, aux bulles vives, avec des notes de pêche, de vanille et de pain grillé. Finale nette et gourmande.",
    en_tasting: "Frank nose of yellow fruits, brioche, and biscuit. Generous, balanced palate with lively bubbles, notes of peach, vanilla, and toasted bread. Clean, indulgent finish."
  },
  {
    name: 'Agrapart & Fils', slug: 'agrapart-et-fils', category_slug: 'champagne',
    producer: 'Agrapart & Fils', country: 'France', region: 'Champagne', appellation: 'Avize',
    fr_tasting: "Nez pur et minéral, de craie, de citron et de fleur de vigne. Bouche tendue et vibrante, aux bulles d'une finesse remarquable, avec une salinité et une fraîcheur qui rappellent le terroir Grand Cru d'Avize. Finale longue et crayeuse.",
    en_tasting: "Pure, mineral nose of chalk, lemon, and vine flower. Taut, vibrant palate with remarkably fine bubbles, a salinity and freshness recalling the Grand Cru terroir of Avize. Long, chalky finish."
  },
  {
    name: 'Billecart-Salmon', slug: 'billecart-salmon', category_slug: 'champagne',
    producer: 'Billecart-Salmon', country: 'France', region: 'Champagne',
    fr_tasting: "Nez délicat de petits fruits rouges, de pamplemousse rose et de brioche. Bouche aérienne et raffinée, d'une fraîcheur exemplaire, avec des bulles d'une finesse soyeuse. Finale élégante et persistante.",
    en_tasting: "Delicate nose of small red berries, pink grapefruit, and brioche. Airy, refined palate of exemplary freshness with silky-fine bubbles. Elegant, persistent finish."
  },
  {
    name: 'Bollinger', slug: 'bollinger', category_slug: 'champagne',
    producer: 'Bollinger', country: 'France', region: 'Champagne', appellation: 'Aÿ',
    fr_tasting: "Nez généreux de pomme cuite, de noisette et de pain grillé. Bouche puissante et vineuse, aux bulles crémeuses, avec des notes de poire, de brioche et d'épices douces. Finale longue, chaleureuse et complexe.",
    en_tasting: "Generous nose of baked apple, hazelnut, and toast. Powerful, vinous palate with creamy bubbles, notes of pear, brioche, and sweet spices. Long, warm, complex finish."
  },
  {
    name: 'Ruinart', slug: 'ruinart', category_slug: 'champagne',
    producer: 'Ruinart', country: 'France', region: 'Champagne',
    fr_tasting: "Nez frais et fruité, de pêche blanche, de fleurs d'acacia et d'amande. Bouche ronde et harmonieuse, aux bulles fines et élégantes, avec des notes de fruits blancs et de miel. Finale douce et rafraîchissante.",
    en_tasting: "Fresh, fruity nose of white peach, acacia blossom, and almond. Round, harmonious palate with fine, elegant bubbles, notes of white fruits and honey. Gentle, refreshing finish."
  },
  {
    name: 'Taittinger', slug: 'taittinger', category_slug: 'champagne',
    producer: 'Taittinger', country: 'France', region: 'Champagne',
    fr_tasting: "Nez subtil de fruits blancs, de fleurs et de brioche légère. Bouche élégante et aérienne, aux bulles fines et persistantes, avec des notes d'agrumes, de miel et de noisette. Finale fraîche et délicate.",
    en_tasting: "Subtle nose of white fruits, flowers, and light brioche. Elegant, airy palate with fine, persistent bubbles, notes of citrus, honey, and hazelnut. Fresh, delicate finish."
  },

  // ---- COGNAC ----
  {
    name: 'Hennessy XO', slug: 'hennessy-xo', category_slug: 'cognac',
    producer: 'Hennessy', country: 'France', region: 'Poitou-Charentes', appellation: 'Cognac',
    fr_tasting: "Nez opulent de fruits confits, d'épices et de cuir fin. Bouche riche et onctueuse, aux notes de chocolat noir, de cannelle et de noix. Finale longue et chaleureuse, d'une complexité remarquable.",
    en_tasting: "Opulent nose of candied fruits, spices, and fine leather. Rich, unctuous palate with dark chocolate, cinnamon, and walnut notes. Long, warm finish of remarkable complexity."
  },
  {
    name: 'Martell XO', slug: 'martell-xo', category_slug: 'cognac',
    producer: 'Martell', country: 'France', region: 'Poitou-Charentes', appellation: 'Cognac',
    fr_tasting: "Nez fin et floral, de jasmin, d'abricot sec et de noisette. Bouche élégante et satinée, aux notes de figue, de pruneaux et de bois de santal. Finale longue et soyeuse, d'une grande finesse.",
    en_tasting: "Fine, floral nose of jasmine, dried apricot, and hazelnut. Elegant, satiny palate with fig, prune, and sandalwood notes. Long, silky finish of great finesse."
  },
  {
    name: 'Courvoisier XO', slug: 'courvoisier-xo', category_slug: 'cognac',
    producer: 'Courvoisier', country: 'France', region: 'Poitou-Charentes', appellation: 'Cognac',
    fr_tasting: "Nez complexe d'iris, de fruits mûrs et de chêne. Bouche ronde et généreuse, aux notes de crème brûlée, d'orange confite et de tabac blond. Finale persistante et veloutée.",
    en_tasting: "Complex nose of iris, ripe fruits, and oak. Round, generous palate with crème brûlée, candied orange, and blond tobacco. Persistent, velvety finish."
  },
  {
    name: 'Frapin XO', slug: 'frapin-xo', category_slug: 'cognac',
    producer: 'Frapin', country: 'France', region: 'Poitou-Charentes', appellation: 'Grande Champagne',
    fr_tasting: "Nez pur et racé, de rancio, de fruits secs et de vanille bourbon. Bouche d'une grande élégance, aux notes de noisette, de miel et de bois précieux. Finale longue et minérale, typique de la Grande Champagne.",
    en_tasting: "Pure, refined nose of rancio, dried fruits, and bourbon vanilla. Palate of great elegance with hazelnut, honey, and precious wood. Long, mineral finish typical of Grande Champagne."
  },
  {
    name: 'Vallein Tercinier XO', slug: 'vallein-tercinier-xo', category_slug: 'cognac',
    producer: 'Vallein Tercinier', country: 'France', region: 'Poitou-Charentes', appellation: 'Fine Champagne',
    fr_tasting: "Nez subtil et floral, de tilleul, de fruits blancs et de rancio délicat. Bouche fine et aérienne, aux notes de miel, de poire et d'amande. Finale longue et florale, d'une délicatesse rare.",
    en_tasting: "Subtle, floral nose of linden, white fruits, and delicate rancio. Fine, airy palate with honey, pear, and almond notes. Long, floral finish of rare delicacy."
  },
  {
    name: 'Delamain XO', slug: 'delamain-xo', category_slug: 'cognac',
    producer: 'Delamain', country: 'France', region: 'Poitou-Charentes', appellation: 'Grande Champagne',
    fr_tasting: "Nez profond de pruneaux, de rancio et de bois de noyer. Bouche somptueuse et veloutée, aux notes de cacao, de figues séchées et de vanille. Finale interminable et complexe, d'une noblesse rare.",
    en_tasting: "Deep nose of prunes, rancio, and walnut wood. Sumptuous, velvety palate with cacao, dried figs, and vanilla. Endless, complex finish of rare nobility."
  },
  {
    name: 'Hine Antique XO', slug: 'hine-antique-xo', category_slug: 'cognac',
    producer: 'Hine', country: 'France', region: 'Poitou-Charentes', appellation: 'Grande Champagne',
    fr_tasting: "Nez élégant de fleurs séchées, de miel et de jasmin. Bouche raffinée et précise, aux notes de fruits confits, de noisette et de chêne fin. Finale longue et florale, d'une grâce exceptionnelle.",
    en_tasting: "Elegant nose of dried flowers, honey, and jasmine. Refined, precise palate with candied fruit, hazelnut, and fine oak. Long, floral finish of exceptional grace."
  },
  {
    name: 'Rémy Martin XO', slug: 'remy-martin-xo', category_slug: 'cognac',
    producer: 'Rémy Martin', country: 'France', region: 'Poitou-Charentes', appellation: 'Fine Champagne',
    fr_tasting: "Nez chaleureux de fruits confits, de cannelle et de noisette grillée. Bouche ample et ronde, aux notes de pruneaux, de chêne toasté et de miel. Finale longue, boisée et épicée.",
    en_tasting: "Warm nose of candied fruits, cinnamon, and toasted hazelnut. Full, round palate with prune, toasted oak, and honey. Long, woody, spiced finish."
  },

  // ---- RHUM ----
  {
    name: 'Zacapa 23', slug: 'zacapa-23', category_slug: 'rhum',
    producer: 'Ron Zacapa', country: 'Guatemala',
    fr_tasting: "Nez gourmand de caramel, de vanille et de cacao. Bouche onctueuse et douce, aux notes de miel, de fruits tropicaux et de cannelle. Finale longue et veloutée, d'une douceur enveloppante.",
    en_tasting: "Inviting nose of caramel, vanilla, and cacao. Unctuous, smooth palate with honey, tropical fruit, and cinnamon. Long, velvety finish of enveloping sweetness."
  },
  {
    name: 'J.M. Cuvée 1845', slug: 'jm-cuvee-1845', category_slug: 'rhum',
    producer: 'Rhum J.M.', country: 'France', region: 'Martinique',
    fr_tasting: "Nez intense et végétal, de canne fraîche, de poivre blanc et de vanille. Bouche puissante et structurée, aux notes d'épices, de fruits tropicaux et de bois. Finale longue, épicée et caractéristique du terroir martiniquais.",
    en_tasting: "Intense, vegetal nose of fresh cane, white pepper, and vanilla. Powerful, structured palate with spice, tropical fruit, and wood notes. Long, spicy finish characteristic of Martinique terroir."
  },
  {
    name: 'Caroni No Smoking 1998', slug: 'caroni-no-smoking-1998', category_slug: 'rhum',
    producer: 'Caroni', vintage: 1998, country: 'Trinidad and Tobago',
    fr_tasting: "Nez légendaire de goudron, de caoutchouc brûlé et de réglisse noire. Bouche d'une puissance brute, aux notes de pétrole, de mélasse et d'épices sombres. Finale interminable et sauvage, culte parmi les amateurs.",
    en_tasting: "Legendary nose of tar, burnt rubber, and black liquorice. Palate of raw power with petroleum, molasses, and dark spice notes. Endless, untamed finish, cult among connoisseurs."
  },
  {
    name: 'Appleton 21', slug: 'appleton-21', category_slug: 'rhum',
    producer: 'Appleton Estate', country: 'Jamaica',
    fr_tasting: "Nez riche de vanille, d'orange et de café. Bouche opulente et complexe, aux notes de cacao, de noix de muscade et de fruits tropicaux. Finale longue et épicée, avec une douceur jamaïcaine caractéristique.",
    en_tasting: "Rich nose of vanilla, orange, and coffee. Opulent, complex palate with cacao, nutmeg, and tropical fruit. Long, spiced finish with characteristic Jamaican sweetness."
  },
  {
    name: 'El Dorado 15', slug: 'el-dorado-15', category_slug: 'rhum',
    producer: 'El Dorado', country: 'Guyana',
    fr_tasting: "Nez intense de mélasse, de caramel et de fruits noirs. Bouche riche et sucrée, aux notes de vanille, de réglisse et de noix de coco. Finale longue et chaleureuse, empreinte de douceur guyanaise.",
    en_tasting: "Intense nose of molasses, caramel, and dark fruits. Rich, sweet palate with vanilla, liquorice, and coconut. Long, warm finish imbued with Guyanese sweetness."
  },
  {
    name: 'Diplomatico Reserva Exclusiva', slug: 'diplomatico-reserva-exclusiva', category_slug: 'rhum',
    producer: 'Diplomático', country: 'Venezuela',
    fr_tasting: "Nez gourmand de panela, de vanille et de banane flambée. Bouche ronde et suave, aux notes de caramel, de fruits confits et de cacao. Finale douce et persistante, d'une gourmandise irrésistible.",
    en_tasting: "Inviting nose of panela, vanilla, and flambéed banana. Round, suave palate with caramel, candied fruit, and cacao. Sweet, persistent finish of irresistible indulgence."
  },
  {
    name: 'Neisson Bio', slug: 'neisson-bio', category_slug: 'rhum',
    producer: 'Neisson', country: 'France', region: 'Martinique',
    fr_tasting: "Nez frais et herbacé, de canne à sucre, de citron vert et de menthe. Bouche vive et pure, aux notes de poivre blanc, de fruits tropicaux et de fleur de canne. Finale nette et rafraîchissante, fidèle au terroir du Carbet.",
    en_tasting: "Fresh, herbaceous nose of sugar cane, lime, and mint. Lively, pure palate with white pepper, tropical fruit, and cane flower. Clean, refreshing finish faithful to Le Carbet terroir."
  },
  {
    name: "La Favorite Rivière Bel'Air", slug: 'la-favorite-riviere-belair', category_slug: 'rhum',
    producer: 'La Favorite', country: 'France', region: 'Martinique',
    fr_tasting: "Nez intense et minéral, de canne broyée, de fruits de la passion et de poivre. Bouche puissante et structurée, aux notes d'agrumes, de vanille et de réglisse. Finale longue et épicée, d'une grande authenticité.",
    en_tasting: "Intense, mineral nose of crushed cane, passion fruit, and pepper. Powerful, structured palate with citrus, vanilla, and liquorice. Long, spiced finish of great authenticity."
  },
  {
    name: 'Clément Très Vieux XO', slug: 'clement-tres-vieux-xo', category_slug: 'rhum',
    producer: 'Clément', country: 'France', region: 'Martinique',
    fr_tasting: "Nez complexe de bois précieux, de fruits confits et de vanille. Bouche ronde et élégante, aux notes de cacao, de tabac et de raisins secs. Finale longue et boisée, d'une belle maturité.",
    en_tasting: "Complex nose of precious wood, candied fruits, and vanilla. Round, elegant palate with cacao, tobacco, and raisin notes. Long, woody finish of fine maturity."
  },

  // ---- GIN ----
  {
    name: 'Tanqueray Ten', slug: 'tanqueray-ten', category_slug: 'gin',
    producer: 'Tanqueray', country: 'United Kingdom', region: 'Scotland',
    fr_tasting: "Nez frais et citronné, de pamplemousse blanc, de camomille et de genièvre. Bouche ample et élégante, aux notes d'agrumes frais, de coriandre et de poivre blanc. Finale longue et rafraîchissante.",
    en_tasting: "Fresh, citrusy nose of white grapefruit, chamomile, and juniper. Full, elegant palate with fresh citrus, coriander, and white pepper. Long, refreshing finish."
  },
  {
    name: "Hendrick's", slug: 'hendricks', category_slug: 'gin',
    producer: "Hendrick's", country: 'United Kingdom', region: 'Scotland',
    fr_tasting: "Nez floral et original, de concombre, de rose et de genièvre subtil. Bouche douce et soyeuse, aux notes de pétales de rose, de concombre frais et d'agrumes. Finale élégante et parfumée, d'une singularité rare.",
    en_tasting: "Floral, original nose of cucumber, rose, and subtle juniper. Soft, silky palate with rose petal, fresh cucumber, and citrus. Elegant, perfumed finish of rare singularity."
  },
  {
    name: 'Monkey 47', slug: 'monkey-47', category_slug: 'gin',
    producer: 'Monkey 47', country: 'Germany', region: 'Black Forest',
    fr_tasting: "Nez complexe et botanique, de baies sauvages, d'airelles et de 47 botaniques. Bouche intense et structurée, aux notes de genièvre, de poivre et de fleurs de la Forêt-Noire. Finale longue, épicée et boisée.",
    en_tasting: "Complex, botanical nose of wild berries, lingonberry, and 47 botanicals. Intense, structured palate with juniper, pepper, and Black Forest flowers. Long, spiced, woody finish."
  },
  {
    name: 'Bombay Sapphire', slug: 'bombay-sapphire', category_slug: 'gin',
    producer: 'Bombay Sapphire', country: 'United Kingdom', region: 'England',
    fr_tasting: "Nez léger et floral, de genièvre, d'amande et de coriandre. Bouche douce et équilibrée, aux notes d'agrumes, de réglisse et d'angélique. Finale fraîche et nette.",
    en_tasting: "Light, floral nose of juniper, almond, and coriander. Gentle, balanced palate with citrus, liquorice, and angelica. Fresh, clean finish."
  },
  {
    name: 'East London Liquor Co.', slug: 'east-london-liquor-co', category_slug: 'gin',
    producer: 'East London Liquor Co.', country: 'United Kingdom', region: 'England',
    fr_tasting: "Nez moderne et herbacé, de genièvre prononcé et de cardamome. Bouche sèche et structurée, aux notes de poivre cubèbe, de citron et de racine d'iris. Finale longue et épicée, artisanale et authentique.",
    en_tasting: "Modern, herbaceous nose with pronounced juniper and cardamom. Dry, structured palate with cubeb pepper, lemon, and iris root. Long, spiced finish, artisanal and authentic."
  },
  {
    name: 'Copperhead', slug: 'copperhead', category_slug: 'gin',
    producer: 'Copperhead', country: 'Belgium',
    fr_tasting: "Nez original d'angélique, de cardamome et de coriandre. Bouche douce et épicée, aux notes de genièvre délicat, d'agrumes et de poivre. Finale moyenne et harmonieuse, avec une touche médicinale élégante.",
    en_tasting: "Original nose of angelica, cardamom, and coriander. Gentle, spiced palate with delicate juniper, citrus, and pepper. Medium, harmonious finish with an elegant medicinal touch."
  },

  // ---- VODKA ----
  {
    name: 'Grey Goose', slug: 'grey-goose', category_slug: 'vodka',
    producer: 'Grey Goose', country: 'France',
    fr_tasting: "Nez pur et délicat, de blé tendre, d'amande et de fleur blanche. Bouche soyeuse et onctueuse, aux notes de citron, de poivre blanc et de pâtisserie fine. Finale douce et élégante.",
    en_tasting: "Pure, delicate nose of soft wheat, almond, and white flowers. Silky, unctuous palate with lemon, white pepper, and fine pastry. Smooth, elegant finish."
  },
  {
    name: 'Stolichnaya Elit', slug: 'stolichnaya-elit', category_slug: 'vodka',
    producer: 'Stolichnaya', country: 'Russia',
    fr_tasting: "Nez minéral et net, de blé, de réglisse et d'herbe fraîche. Bouche huileuse et pure, aux notes de poivre blanc, de pain de seigle et de minéralité. Finale longue, nette et cristalline.",
    en_tasting: "Mineral, clean nose of wheat, liquorice, and fresh grass. Oily, pure palate with white pepper, rye bread, and minerality. Long, clean, crystalline finish."
  },
  {
    name: 'Belvédère', slug: 'belvedere', category_slug: 'vodka',
    producer: 'Belvédère', country: 'Poland',
    fr_tasting: "Nez frais et vanillé, de seigle, de crème et d'amande. Bouche ronde et veloutée, aux notes de vanille, de poivre blanc et de noisette. Finale douce et persistante.",
    en_tasting: "Fresh, vanilla nose of rye, cream, and almond. Round, velvety palate with vanilla, white pepper, and hazelnut. Gentle, lingering finish."
  },
  {
    name: 'Absolut', slug: 'absolut', category_slug: 'vodka',
    producer: 'Absolut', country: 'Sweden',
    fr_tasting: "Nez net et céréalier, de blé et de fruits secs. Bouche douce et ronde, aux notes de pain frais, de citron et de poivre léger. Finale courte et propre.",
    en_tasting: "Clean, cereal nose of wheat and dried fruits. Smooth, round palate with fresh bread, lemon, and light pepper. Short, clean finish."
  },

  // ---- VIN BLANC ----
  {
    name: 'Domaine Dupraz Montracul 2016', slug: 'domaine-dupraz-montracul-2016', category_slug: 'vin-blanc',
    producer: 'Domaine Dupraz', vintage: 2016, country: 'France', region: 'Savoie', appellation: 'Jongieux',
    fr_tasting: "Robe or pâle. Nez délicat de fleurs blanches, de noisette et de silex. Bouche vive et minérale, aux notes de pomme verte, de miel et de pierre à fusil. Finale longue et saline, typique des terroirs savoyards.",
    en_tasting: "Pale gold robe. Delicate nose of white flowers, hazelnut, and flint. Lively, mineral palate with green apple, honey, and gunflint. Long, saline finish typical of Savoyard terroirs."
  },
  {
    name: 'Château de la Mar Le Golliat 2012', slug: 'chateau-de-la-mar-le-golliat-2012', category_slug: 'vin-blanc',
    producer: 'Château de la Mar', vintage: 2012, country: 'France', region: 'Savoie', appellation: 'Jongieux',
    fr_tasting: "Robe dorée. Nez évolué de miel, de coing et de noisette torréfiée. Bouche ronde et complexe, aux notes de fruits jaunes confits, de beurre et de minéralité. Finale longue et persistante, d'une belle maturité.",
    en_tasting: "Golden robe. Evolved nose of honey, quince, and toasted hazelnut. Round, complex palate with candied yellow fruits, butter, and minerality. Long, persistent finish of fine maturity."
  },
  {
    name: 'Domaine Weinbach Gewurztraminer 2002', slug: 'domaine-weinbach-gewurztraminer-2002', category_slug: 'vin-blanc',
    producer: 'Domaine Weinbach', vintage: 2002, country: 'France', region: 'Alsace', appellation: 'Gewurztraminer',
    fr_tasting: "Robe or intense. Nez envoûtant de rose, de litchi et d'épices orientales. Bouche opulente et exotique, aux notes de fruits de la passion, de miel et de gingembre confit. Finale longue et aromatique, d'une richesse incomparable.",
    en_tasting: "Intense gold robe. Bewitching nose of rose, lychee, and oriental spices. Opulent, exotic palate with passion fruit, honey, and candied ginger. Long, aromatic finish of incomparable richness."
  },
  {
    name: 'Château de Fargues Sauternes 2001', slug: 'chateau-de-fargues-sauternes-2001', category_slug: 'vin-blanc',
    producer: 'Château de Fargues', vintage: 2001, country: 'France', region: 'Bordeaux', appellation: 'Sauternes',
    fr_tasting: "Robe ambrée lumineuse. Nez somptueux de miel d'acacia, d'abricot confit et de safran. Bouche liquoreuse et concentrée, d'une pureté cristalline, avec des notes de crème brûlée et d'écorce d'orange. Finale interminable et botrytisée.",
    en_tasting: "Luminous amber robe. Sumptuous nose of acacia honey, candied apricot, and saffron. Luscious, concentrated palate of crystalline purity, with crème brûlée and orange peel notes. Endless, botrytized finish."
  },
  {
    name: 'Domaine Robert Denogent Pouilly-Fuissé 2017', slug: 'domaine-robert-denogent-pouilly-fuisse-2017', category_slug: 'vin-blanc',
    producer: 'Domaine Robert Denogent', vintage: 2017, country: 'France', region: 'Bourgogne', appellation: 'Pouilly-Fuissé',
    fr_tasting: "Robe or pâle. Nez pur de fruits blancs, de beurre frais et de pierre calcaire. Bouche ample et minérale, aux notes de poire, de noisette et de miel. Finale longue et tendue, d'une élégance bourguignonne exemplaire.",
    en_tasting: "Pale gold robe. Pure nose of white fruits, fresh butter, and limestone. Full, mineral palate with pear, hazelnut, and honey. Long, taut finish of exemplary Burgundian elegance."
  },
  {
    name: 'Domaine Etienne Sauzet Chardonnay 2014', slug: 'domaine-etienne-sauzet-chardonnay-2014', category_slug: 'vin-blanc',
    producer: 'Domaine Etienne Sauzet', vintage: 2014, country: 'France', region: 'Bourgogne', appellation: 'Puligny-Montrachet',
    fr_tasting: "Robe or brillant. Nez raffiné de fleurs blanches, de citron et de beurre noisette. Bouche ciselée et élégante, aux notes de pêche blanche, d'amande et de minéralité crayeuse. Finale longue et racée, digne des grands Puligny.",
    en_tasting: "Brilliant gold robe. Refined nose of white flowers, lemon, and brown butter. Chiselled, elegant palate with white peach, almond, and chalky minerality. Long, racy finish worthy of great Puligny."
  },
  {
    name: 'Château Simone Palette 2017', slug: 'chateau-simone-palette-2017', category_slug: 'vin-blanc',
    producer: 'Château Simone', vintage: 2017, country: 'France', region: 'Provence', appellation: 'Palette',
    fr_tasting: "Robe dorée profonde. Nez complexe de cire d'abeille, de tilleul et de fruits à noyau. Bouche ample et texturée, aux notes de miel, d'amande et de garrigue. Finale longue et solaire, unique en Provence.",
    en_tasting: "Deep golden robe. Complex nose of beeswax, linden, and stone fruit. Full, textured palate with honey, almond, and garrigue. Long, sun-drenched finish, unique in Provence."
  },

  // ---- VIN ROSÉ ----
  {
    name: 'Domaine Tempier Bandol', slug: 'domaine-tempier-bandol', category_slug: 'vin-rose',
    producer: 'Domaine Tempier', country: 'France', region: 'Provence', appellation: 'Bandol',
    fr_tasting: "Robe saumon profond. Nez expressif de pêche de vigne, de garrigue et d'épices. Bouche ample et structurée pour un rosé, aux notes de fruits rouges, de thym et de minéralité saline. Finale longue et gastronomique.",
    en_tasting: "Deep salmon robe. Expressive nose of vine peach, garrigue, and spices. Full, structured palate for a rosé, with red fruit, thyme, and saline minerality. Long, gastronomic finish."
  },
  {
    name: "Château d'Esclans Garrus", slug: 'chateau-desclans-garrus', category_slug: 'vin-rose',
    producer: "Château d'Esclans", country: 'France', region: 'Provence', appellation: 'Côtes de Provence',
    fr_tasting: "Robe rose pâle aux reflets cuivrés. Nez complexe de pêche blanche, de fleur d'oranger et de bois de rose. Bouche d'une ampleur rare pour un rosé, crémeuse et élégante, avec des notes de fruits blancs et de vanille subtile. Finale interminable et somptueuse.",
    en_tasting: "Pale pink robe with coppery reflections. Complex nose of white peach, orange blossom, and rosewood. Palate of rare amplitude for a rosé, creamy and elegant, with white fruit and subtle vanilla. Endless, sumptuous finish."
  },
]

async function insertDrinks() {
  console.log('--- Step 4: Insert drinks ---')
  let count = 0
  const categoryCache: Record<string, number> = {}

  for (const d of DRINKS) {
    if (!categoryCache[d.category_slug]) {
      categoryCache[d.category_slug] = await lookupCategoryId(d.category_slug)
    }
    const catId = categoryCache[d.category_slug]

    const { error } = await supabase
      .from('drinks')
      .upsert({
        category_id: catId,
        name: d.name,
        producer: d.producer ?? null,
        vintage: d.vintage ?? null,
        country: d.country,
        region: d.region ?? null,
        appellation: d.appellation ?? null,
        slug: d.slug,
      }, { onConflict: 'slug' })
    if (error) { console.error(`  Drink ${d.name}: ${error.message}`); continue }
    count++
  }
  console.log(`  Upserted ${count} drinks`)
}

// ---------------------------------------------------------------------------
// 5. Drink translations (FR + EN-US)
// ---------------------------------------------------------------------------

async function insertDrinkTranslations() {
  console.log('--- Step 5: Insert drink translations ---')
  let count = 0

  for (const d of DRINKS) {
    const drinkId = await lookupDrinkId(d.slug)
    if (!drinkId) { console.error(`  Drink not found: ${d.slug}`); continue }

    // FR
    const { error: frErr } = await supabase
      .from('drink_translations')
      .upsert({
        drink_id: drinkId,
        locale: 'fr',
        description: d.fr_tasting,
        tasting_notes: d.fr_tasting,
        meta_title: `${d.name} — Avis et notes de dégustation | Bestwine`,
        meta_description: `Découvrez ${d.name} : notes de dégustation, avis d'experts et restaurants étoilés qui le proposent sur leur carte.`,
      }, { onConflict: 'drink_id,locale' })
    if (frErr) console.error(`  FR ${d.slug}: ${frErr.message}`)
    else count++

    // EN-US
    const { error: enErr } = await supabase
      .from('drink_translations')
      .upsert({
        drink_id: drinkId,
        locale: 'en-us',
        description: d.en_tasting,
        tasting_notes: d.en_tasting,
        meta_title: `${d.name} — Tasting Notes & Reviews | Bestwine`,
        meta_description: `Discover ${d.name}: expert tasting notes, reviews, and Michelin-starred restaurants featuring it on their wine list.`,
      }, { onConflict: 'drink_id,locale' })
    if (enErr) console.error(`  EN ${d.slug}: ${enErr.message}`)
    else count++
  }
  console.log(`  Upserted ${count} drink translations`)
}

// ---------------------------------------------------------------------------
// 6. Wine list entries (drink × restaurant)
// ---------------------------------------------------------------------------

interface WineListLink {
  drink_slug: string
  restaurant_slug: string
}

// Map restaurant name variants from scraped data to our slugs
const RESTAURANT_NAME_TO_SLUG: Record<string, string> = {
  'Clos des Sens': 'clos-des-sens',
  'Clos Des Sens': 'clos-des-sens',
  'Odette': 'odette',
  'Core by Clare Smith': 'core-by-clare-smyth',
  'Core by Clare Smyth': 'core-by-clare-smyth',
  'Beaumanière': 'beaumaniere',
  'Yannick Alléno': 'yannick-alleno',
  'The Dorchester': 'the-dorchester',
  'Alain Ducasse at The Dorchester': 'the-dorchester',
  'The Fat Duck': 'the-fat-duck',
  'La Prieuré': 'la-prieure',
  'La Bouitte': 'la-bouitte',
  'Le Calandre': 'le-calandre',
  'Rutz': 'rutz',
  'Frederikshoj': 'frederikshoj',
  'Frederikshøj': 'frederikshoj',
  'Cheval Blanc by Peter Knogl': 'cheval-blanc-by-peter-knogl',
  'Quince': 'quince',
  'Caprice': 'caprice',
  'Loiseau Rive Gauche': 'loiseau-rive-gauche',
  'Geranium': 'geranium',
  'Connaught': 'the-connaught',
  'The Connaught': 'the-connaught',
  "L'Atelier de Joël Robuchon": 'latelier-de-joel-robuchon',
  'Otto e Mezzo': 'otto-e-mezzo',
  'Le Jules Verne': 'le-jules-verne',
}

// Wine list entries from scraped data
const WINE_LIST_LINKS: WineListLink[] = [
  // Whisky links from scraped data
  { drink_slug: 'nikka-taketsuru-17', restaurant_slug: 'clos-des-sens' },
  { drink_slug: 'nikka-taketsuru-17', restaurant_slug: 'odette' },
  { drink_slug: 'elijah-craig-12', restaurant_slug: 'odette' },
  { drink_slug: 'elijah-craig-12', restaurant_slug: 'core-by-clare-smyth' },
  { drink_slug: 'talisker-10-years', restaurant_slug: 'clos-des-sens' },
  { drink_slug: 'talisker-10-years', restaurant_slug: 'odette' },
  { drink_slug: 'talisker-10-years', restaurant_slug: 'core-by-clare-smyth' },
  { drink_slug: 'talisker-10-years', restaurant_slug: 'beaumaniere' },
  { drink_slug: 'hibiki-17-years', restaurant_slug: 'yannick-alleno' },
  { drink_slug: 'hibiki-17-years', restaurant_slug: 'core-by-clare-smyth' },
  { drink_slug: 'hibiki-17-years', restaurant_slug: 'beaumaniere' },
  { drink_slug: 'hibiki-17-years', restaurant_slug: 'the-dorchester' },
  { drink_slug: 'yamazaki-18', restaurant_slug: 'yannick-alleno' },
  { drink_slug: 'yamazaki-18', restaurant_slug: 'core-by-clare-smyth' },
  { drink_slug: 'yamazaki-18', restaurant_slug: 'the-dorchester' },
  { drink_slug: 'laphroaig-10', restaurant_slug: 'odette' },
  { drink_slug: 'laphroaig-10', restaurant_slug: 'core-by-clare-smyth' },
  { drink_slug: 'laphroaig-10', restaurant_slug: 'the-dorchester' },
  { drink_slug: 'macallan-fine-oak-12', restaurant_slug: 'odette' },
  { drink_slug: 'macallan-fine-oak-12', restaurant_slug: 'core-by-clare-smyth' },
  { drink_slug: 'macallan-fine-oak-12', restaurant_slug: 'the-dorchester' },
  { drink_slug: 'macallan-fine-oak-12', restaurant_slug: 'the-fat-duck' },
  { drink_slug: 'highland-park-18', restaurant_slug: 'core-by-clare-smyth' },
  { drink_slug: 'highland-park-18', restaurant_slug: 'the-fat-duck' },

  // Vin rouge links from scraped data
  { drink_slug: 'chateau-montrose-2011', restaurant_slug: 'clos-des-sens' },
  { drink_slug: 'chateau-de-beaucastel-2017', restaurant_slug: 'la-prieure' },
  { drink_slug: 'chateau-cos-destournel-2014', restaurant_slug: 'la-bouitte' },
  { drink_slug: 'chateau-cheval-blanc-2006', restaurant_slug: 'the-fat-duck' },
  { drink_slug: 'petrus-2007', restaurant_slug: 'the-dorchester' },
  { drink_slug: 'clos-du-mont-olivet-2011', restaurant_slug: 'beaumaniere' },
  { drink_slug: 'chateau-mouton-rothschild-2011', restaurant_slug: 'cheval-blanc-by-peter-knogl' },
  { drink_slug: 'clos-rougeard-les-poyeux-2015', restaurant_slug: 'quince' },
  { drink_slug: 'domaine-alain-graillot-2017', restaurant_slug: 'caprice' },

  // Cognac links from scraped data
  { drink_slug: 'vallein-tercinier-xo', restaurant_slug: 'clos-des-sens' },
  { drink_slug: 'delamain-xo', restaurant_slug: 'the-fat-duck' },
  { drink_slug: 'hine-antique-xo', restaurant_slug: 'the-dorchester' },
  { drink_slug: 'remy-martin-xo', restaurant_slug: 'the-dorchester' },
  { drink_slug: 'frapin-xo', restaurant_slug: 'the-dorchester' },
  { drink_slug: 'hennessy-xo', restaurant_slug: 'core-by-clare-smyth' },

  // Vin blanc links from scraped data
  { drink_slug: 'domaine-dupraz-montracul-2016', restaurant_slug: 'clos-des-sens' },
  { drink_slug: 'chateau-de-la-mar-le-golliat-2012', restaurant_slug: 'clos-des-sens' },
  { drink_slug: 'domaine-weinbach-gewurztraminer-2002', restaurant_slug: 'beaumaniere' },
  { drink_slug: 'chateau-de-fargues-sauternes-2001', restaurant_slug: 'beaumaniere' },
  { drink_slug: 'domaine-robert-denogent-pouilly-fuisse-2017', restaurant_slug: 'la-bouitte' },
  { drink_slug: 'domaine-etienne-sauzet-chardonnay-2014', restaurant_slug: 'la-bouitte' },
  { drink_slug: 'chateau-simone-palette-2017', restaurant_slug: 'la-prieure' },

  // Vin rosé links from scraped data
  { drink_slug: 'domaine-tempier-bandol', restaurant_slug: 'la-prieure' },
  { drink_slug: 'domaine-tempier-bandol', restaurant_slug: 'the-dorchester' },
  { drink_slug: 'domaine-tempier-bandol', restaurant_slug: 'odette' },
  { drink_slug: 'domaine-tempier-bandol', restaurant_slug: 'beaumaniere' },
  { drink_slug: 'chateau-desclans-garrus', restaurant_slug: 'the-fat-duck' },
  { drink_slug: 'chateau-desclans-garrus', restaurant_slug: 'geranium' },
  { drink_slug: 'chateau-desclans-garrus', restaurant_slug: 'the-connaught' },

  // Bourbon from scraped data
  { drink_slug: 'elijah-craig-12', restaurant_slug: 'loiseau-rive-gauche' },
]

async function insertWineListEntries() {
  console.log('--- Step 6: Insert wine list entries ---')
  let count = 0
  const drinkCache: Record<string, number | null> = {}
  const restaurantCache: Record<string, number | null> = {}

  for (const link of WINE_LIST_LINKS) {
    if (!(link.drink_slug in drinkCache)) {
      drinkCache[link.drink_slug] = await lookupDrinkId(link.drink_slug)
    }
    if (!(link.restaurant_slug in restaurantCache)) {
      restaurantCache[link.restaurant_slug] = await lookupRestaurantId(link.restaurant_slug)
    }

    const drinkId = drinkCache[link.drink_slug]
    const restaurantId = restaurantCache[link.restaurant_slug]

    if (!drinkId) { console.error(`  Drink not found: ${link.drink_slug}`); continue }
    if (!restaurantId) { console.error(`  Restaurant not found: ${link.restaurant_slug}`); continue }

    const { error } = await supabase
      .from('wine_list_entries')
      .upsert({
        restaurant_id: restaurantId,
        drink_id: drinkId,
        price: null,
        price_currency: null,
        year_on_list: 2024,
      }, { onConflict: 'restaurant_id,drink_id,year_on_list' })
    if (error) { console.error(`  WLE ${link.drink_slug} @ ${link.restaurant_slug}: ${error.message}`); continue }
    count++
  }
  console.log(`  Upserted ${count} wine list entries`)
}

// ---------------------------------------------------------------------------
// 7. Category translations — real editorial content + all 11 locales
// ---------------------------------------------------------------------------

interface CategoryEditorial {
  slug: string
  fr: { name: string; description: string; meta_title: string; meta_description: string }
  'en-us': { name: string; description: string; meta_title: string; meta_description: string }
  'en-gb': { name: string; description: string; meta_title: string; meta_description: string }
  es: { name: string; description: string; meta_title: string; meta_description: string }
  de: { name: string; description: string; meta_title: string; meta_description: string }
  it: { name: string; description: string; meta_title: string; meta_description: string }
  pt: { name: string; description: string; meta_title: string; meta_description: string }
  zh: { name: string; description: string; meta_title: string; meta_description: string }
  ja: { name: string; description: string; meta_title: string; meta_description: string }
  ru: { name: string; description: string; meta_title: string; meta_description: string }
  ar: { name: string; description: string; meta_title: string; meta_description: string }
}

const CATEGORY_EDITORIAL: CategoryEditorial[] = [
  {
    slug: 'whisky',
    fr: {
      name: 'Whisky',
      description: "Découvrez des whiskys sélectionnés par les chefs et sommeliers des restaurants gastronomiques étoilés. Une sélection par des professionnels crédibles et légitimes pour vous permettre de trouver votre whisky préféré. Bestwine référence les whiskys présents sur la carte des vins et dans les caves des restaurants gastronomiques les plus connus et reconnus à travers le monde.",
      meta_title: "Meilleur whisky à la carte des restaurants gastronomiques étoilés !",
      meta_description: "Meilleurs whiskys sélectionnés par les chefs et sommeliers à la carte des restaurants gastronomiques étoilés."
    },
    'en-us': {
      name: 'Whisky',
      description: "Discover whiskies selected by chefs and sommeliers of Michelin-starred gastronomic restaurants. A selection by credible, legitimate professionals to help you find your favourite whisky. Bestwine references whiskies featured on the wine lists and in the cellars of the world's most renowned gastronomic restaurants.",
      meta_title: "Best Whisky on Michelin-Starred Restaurant Menus!",
      meta_description: "Best whiskies selected by chefs and sommeliers on Michelin-starred gastronomic restaurant menus."
    },
    'en-gb': {
      name: 'Whisky',
      description: "Discover whiskies selected by chefs and sommeliers of Michelin-starred gastronomic restaurants. A curated selection by credible professionals to help you find your favourite whisky.",
      meta_title: "Best Whisky on Michelin-Starred Restaurant Menus!",
      meta_description: "Finest whiskies selected by chefs and sommeliers at Michelin-starred gastronomic restaurants."
    },
    es: {
      name: 'Whisky',
      description: "Descubra whiskys seleccionados por chefs y sommeliers de restaurantes gastronómicos con estrellas Michelin. Una selección realizada por profesionales acreditados para ayudarle a encontrar su whisky favorito.",
      meta_title: "Mejor whisky en los restaurantes gastronómicos con estrellas Michelin",
      meta_description: "Los mejores whiskys seleccionados por chefs y sommeliers en restaurantes gastronómicos con estrellas Michelin."
    },
    de: {
      name: 'Whisky',
      description: "Entdecken Sie Whiskys, die von Köchen und Sommeliers der mit Michelin-Sternen ausgezeichneten Restaurants ausgewählt wurden. Eine Auswahl von anerkannten Fachleuten, um Ihren Lieblingswhisky zu finden.",
      meta_title: "Bester Whisky auf den Karten der Michelin-Sterne-Restaurants!",
      meta_description: "Die besten Whiskys, ausgewählt von Köchen und Sommeliers der Michelin-Sterne-Restaurants."
    },
    it: {
      name: 'Whisky',
      description: "Scoprite i whisky selezionati dagli chef e sommelier dei ristoranti gastronomici stellati Michelin. Una selezione curata da professionisti riconosciuti per aiutarvi a trovare il vostro whisky preferito.",
      meta_title: "Miglior whisky nei menu dei ristoranti stellati Michelin!",
      meta_description: "I migliori whisky selezionati da chef e sommelier nei ristoranti gastronomici stellati Michelin."
    },
    pt: {
      name: 'Whisky',
      description: "Descubra whiskies selecionados por chefs e sommeliers de restaurantes gastronômicos com estrelas Michelin. Uma seleção por profissionais reconhecidos para ajudá-lo a encontrar o seu whisky favorito.",
      meta_title: "Melhor whisky nos menus dos restaurantes com estrelas Michelin!",
      meta_description: "Os melhores whiskies selecionados por chefs e sommeliers em restaurantes gastronômicos com estrelas Michelin."
    },
    zh: {
      name: '威士忌',
      description: "探索由米其林星级美食餐厅的主厨和侍酒师精选的威士忌。由可靠的专业人士精心挑选，帮助您找到心仪的威士忌。",
      meta_title: "米其林星级餐厅菜单上的最佳威士忌！",
      meta_description: "由米其林星级美食餐厅的主厨和侍酒师精选的最佳威士忌。"
    },
    ja: {
      name: 'ウイスキー',
      description: "ミシュラン星付きレストランのシェフとソムリエが厳選したウイスキーをご紹介します。信頼できるプロフェッショナルによるセレクションで、お気に入りのウイスキーを見つけてください。",
      meta_title: "ミシュラン星付きレストランの最高のウイスキー！",
      meta_description: "ミシュラン星付きレストランのシェフとソムリエが厳選した最高のウイスキー。"
    },
    ru: {
      name: 'Виски',
      description: "Откройте для себя виски, отобранные шеф-поварами и сомелье ресторанов высокой кухни, отмеченных звёздами Мишлен. Подборка от признанных профессионалов поможет вам найти ваш любимый виски.",
      meta_title: "Лучший виски в меню ресторанов со звёздами Мишлен!",
      meta_description: "Лучшие виски, отобранные шеф-поварами и сомелье ресторанов высокой кухни со звёздами Мишлен."
    },
    ar: {
      name: 'ويسكي',
      description: "اكتشف أنواع الويسكي المختارة من قبل الطهاة والساقيين في المطاعم الحائزة على نجوم ميشلان. مجموعة مختارة من محترفين معتمدين لمساعدتك في العثور على الويسكي المفضل لديك.",
      meta_title: "أفضل ويسكي في قوائم مطاعم ميشلان المميزة بالنجوم!",
      meta_description: "أفضل أنواع الويسكي المختارة من قبل الطهاة والساقيين في مطاعم ميشلان المميزة بالنجوم."
    },
  },
  {
    slug: 'vin-rouge',
    fr: {
      name: 'Vin rouge',
      description: "Découvrez les meilleurs vins rouges sélectionnés par les chefs et sommeliers des restaurants gastronomiques étoilés. Des grands crus bordelais aux appellations rhodaniennes, une sélection d'excellence pour les amateurs exigeants.",
      meta_title: "Meilleur vin rouge à la carte des restaurants gastronomiques étoilés !",
      meta_description: "Meilleurs vins rouges sélectionnés par les chefs et sommeliers à la carte des restaurants gastronomiques étoilés."
    },
    'en-us': { name: 'Red Wine', description: "Discover the finest red wines selected by chefs and sommeliers of Michelin-starred restaurants. From grand Bordeaux crus to Rhône appellations, a selection of excellence for discerning enthusiasts.", meta_title: "Best Red Wine on Michelin-Starred Restaurant Menus!", meta_description: "Best red wines selected by chefs and sommeliers on Michelin-starred gastronomic restaurant menus." },
    'en-gb': { name: 'Red Wine', description: "Discover the finest red wines curated by chefs and sommeliers of Michelin-starred restaurants. From grand Bordeaux crus to Rhône appellations, a selection of excellence.", meta_title: "Best Red Wine on Michelin-Starred Restaurant Menus!", meta_description: "Finest red wines selected by chefs and sommeliers at Michelin-starred restaurants." },
    es: { name: 'Vino tinto', description: "Descubra los mejores vinos tintos seleccionados por chefs y sommeliers de restaurantes con estrellas Michelin. De los grandes crus de Burdeos a las denominaciones del Ródano.", meta_title: "Mejor vino tinto en restaurantes con estrellas Michelin", meta_description: "Los mejores vinos tintos seleccionados por chefs y sommeliers en restaurantes con estrellas Michelin." },
    de: { name: 'Rotwein', description: "Entdecken Sie die besten Rotweine, ausgewählt von Köchen und Sommeliers der Michelin-Sterne-Restaurants. Von großen Bordeaux-Crus bis zu Rhône-Appellationen.", meta_title: "Bester Rotwein auf den Karten der Michelin-Sterne-Restaurants!", meta_description: "Die besten Rotweine, ausgewählt von Köchen und Sommeliers der Michelin-Sterne-Restaurants." },
    it: { name: 'Vino rosso', description: "Scoprite i migliori vini rossi selezionati dagli chef e sommelier dei ristoranti stellati Michelin. Dai grandi crus di Bordeaux alle denominazioni del Rodano.", meta_title: "Miglior vino rosso nei ristoranti stellati Michelin!", meta_description: "I migliori vini rossi selezionati da chef e sommelier nei ristoranti stellati Michelin." },
    pt: { name: 'Vinho tinto', description: "Descubra os melhores vinhos tintos selecionados por chefs e sommeliers de restaurantes com estrelas Michelin. Dos grandes crus de Bordeaux às denominações do Ródano.", meta_title: "Melhor vinho tinto nos restaurantes com estrelas Michelin!", meta_description: "Os melhores vinhos tintos selecionados por chefs e sommeliers em restaurantes com estrelas Michelin." },
    zh: { name: '红葡萄酒', description: "探索由米其林星级餐厅的主厨和侍酒师精选的最佳红葡萄酒。从波尔多名庄到罗纳河谷产区，为挑剔的鉴赏家提供卓越之选。", meta_title: "米其林星级餐厅的最佳红葡萄酒！", meta_description: "由米其林星级餐厅的主厨和侍酒师精选的最佳红葡萄酒。" },
    ja: { name: '赤ワイン', description: "ミシュラン星付きレストランのシェフとソムリエが厳選した最高の赤ワインをご紹介します。ボルドーのグラン・クリュからローヌのアペラシオンまで。", meta_title: "ミシュラン星付きレストランの最高の赤ワイン！", meta_description: "ミシュラン星付きレストランのシェフとソムリエが厳選した最高の赤ワイン。" },
    ru: { name: 'Красное вино', description: "Откройте лучшие красные вина, отобранные шеф-поварами и сомелье ресторанов со звёздами Мишлен. От великих крю Бордо до аппелласьонов Роны.", meta_title: "Лучшее красное вино в ресторанах со звёздами Мишлен!", meta_description: "Лучшие красные вина, отобранные шеф-поварами и сомелье ресторанов со звёздами Мишлен." },
    ar: { name: 'نبيذ أحمر', description: "اكتشف أفضل أنواع النبيذ الأحمر المختارة من قبل الطهاة والساقيين في مطاعم ميشلان. من كبار النبيذ في بوردو إلى تسميات الرون.", meta_title: "أفضل نبيذ أحمر في مطاعم ميشلان!", meta_description: "أفضل أنواع النبيذ الأحمر المختارة من قبل الطهاة والساقيين في مطاعم ميشلان." },
  },
  {
    slug: 'champagne',
    fr: {
      name: 'Champagne',
      description: "Découvrez les meilleurs champagnes sélectionnés par les chefs et sommeliers des restaurants gastronomiques étoilés. Des grandes maisons aux vignerons indépendants, une sélection effervescente d'excellence.",
      meta_title: "Meilleur champagne à la carte des restaurants gastronomiques !",
      meta_description: "Meilleurs champagnes sélectionnés par les chefs et sommeliers à la carte des restaurants gastronomiques étoilés."
    },
    'en-us': { name: 'Champagne', description: "Discover the finest champagnes selected by chefs and sommeliers of Michelin-starred restaurants. From grand maisons to independent growers, a sparkling selection of excellence.", meta_title: "Best Champagne on Michelin-Starred Restaurant Menus!", meta_description: "Best champagnes selected by chefs and sommeliers on Michelin-starred restaurant menus." },
    'en-gb': { name: 'Champagne', description: "Discover the finest champagnes curated by chefs and sommeliers of Michelin-starred restaurants. From grand maisons to grower champagnes.", meta_title: "Best Champagne on Michelin-Starred Restaurant Menus!", meta_description: "Finest champagnes selected by chefs and sommeliers at Michelin-starred restaurants." },
    es: { name: 'Champán', description: "Descubra los mejores champanes seleccionados por chefs y sommeliers de restaurantes con estrellas Michelin. De las grandes casas a los viticultores independientes.", meta_title: "Mejor champán en restaurantes con estrellas Michelin", meta_description: "Los mejores champanes seleccionados por chefs y sommeliers en restaurantes con estrellas Michelin." },
    de: { name: 'Champagner', description: "Entdecken Sie die besten Champagner, ausgewählt von Köchen und Sommeliers der Michelin-Sterne-Restaurants. Von großen Häusern bis zu unabhängigen Winzern.", meta_title: "Bester Champagner auf den Karten der Michelin-Sterne-Restaurants!", meta_description: "Die besten Champagner, ausgewählt von Köchen und Sommeliers der Michelin-Sterne-Restaurants." },
    it: { name: 'Champagne', description: "Scoprite i migliori champagne selezionati dagli chef e sommelier dei ristoranti stellati Michelin. Dalle grandi maison ai vignaioli indipendenti.", meta_title: "Miglior champagne nei ristoranti stellati Michelin!", meta_description: "I migliori champagne selezionati da chef e sommelier nei ristoranti stellati Michelin." },
    pt: { name: 'Champanhe', description: "Descubra os melhores champanhes selecionados por chefs e sommeliers de restaurantes com estrelas Michelin. Das grandes maisons aos viticultores independentes.", meta_title: "Melhor champanhe nos restaurantes com estrelas Michelin!", meta_description: "Os melhores champanhes selecionados por chefs e sommeliers em restaurantes com estrelas Michelin." },
    zh: { name: '香槟', description: "探索由米其林星级餐厅的主厨和侍酒师精选的最佳香槟。从知名酒庄到独立酿酒师，一系列卓越的起泡酒选择。", meta_title: "米其林星级餐厅的最佳香槟！", meta_description: "由米其林星级餐厅的主厨和侍酒师精选的最佳香槟。" },
    ja: { name: 'シャンパン', description: "ミシュラン星付きレストランのシェフとソムリエが厳選した最高のシャンパンをご紹介します。グランメゾンから独立した生産者まで。", meta_title: "ミシュラン星付きレストランの最高のシャンパン！", meta_description: "ミシュラン星付きレストランのシェフとソムリエが厳選した最高のシャンパン。" },
    ru: { name: 'Шампанское', description: "Откройте лучшие шампанские, отобранные шеф-поварами и сомелье ресторанов со звёздами Мишлен. От великих домов до независимых виноделов.", meta_title: "Лучшее шампанское в ресторанах со звёздами Мишлен!", meta_description: "Лучшие шампанские, отобранные шеф-поварами и сомелье ресторанов со звёздами Мишлен." },
    ar: { name: 'شمبانيا', description: "اكتشف أفضل أنواع الشمبانيا المختارة من قبل الطهاة والساقيين في مطاعم ميشلان. من الدور الكبرى إلى صانعي النبيذ المستقلين.", meta_title: "أفضل شمبانيا في مطاعم ميشلان!", meta_description: "أفضل أنواع الشمبانيا المختارة من قبل الطهاة والساقيين في مطاعم ميشلان." },
  },
  {
    slug: 'cognac',
    fr: {
      name: 'Cognac',
      description: "Le cognac est une eau-de-vie de vin protégée par une Appellation d'origine contrôlée (AOC). Découvrez les meilleurs cognacs sélectionnés par les chefs et sommeliers des restaurants gastronomiques étoilés, de la Grande Champagne aux Fins Bois.",
      meta_title: "Meilleur cognac à la carte des restaurants gastronomiques !",
      meta_description: "Meilleurs cognacs sélectionnés par les chefs et sommeliers à la carte des restaurants gastronomiques étoilés."
    },
    'en-us': { name: 'Cognac', description: "Cognac is a wine brandy protected by an Appellation d'Origine Contrôlée (AOC). Discover the finest cognacs selected by chefs and sommeliers of Michelin-starred restaurants, from Grande Champagne to Fins Bois.", meta_title: "Best Cognac on Michelin-Starred Restaurant Menus!", meta_description: "Best cognacs selected by chefs and sommeliers on Michelin-starred restaurant menus." },
    'en-gb': { name: 'Cognac', description: "Cognac is a wine brandy protected by AOC status. Discover the finest cognacs curated by chefs and sommeliers of Michelin-starred restaurants.", meta_title: "Best Cognac on Michelin-Starred Restaurant Menus!", meta_description: "Finest cognacs selected by chefs and sommeliers at Michelin-starred restaurants." },
    es: { name: 'Coñac', description: "El coñac es un aguardiente de vino protegido por Denominación de Origen Controlada. Descubra los mejores coñacs seleccionados por chefs y sommeliers de restaurantes con estrellas Michelin.", meta_title: "Mejor coñac en restaurantes con estrellas Michelin", meta_description: "Los mejores coñacs seleccionados por chefs y sommeliers en restaurantes con estrellas Michelin." },
    de: { name: 'Cognac', description: "Cognac ist ein Weinbrand, geschützt durch eine kontrollierte Herkunftsbezeichnung. Entdecken Sie die besten Cognacs, ausgewählt von Köchen und Sommeliers der Michelin-Sterne-Restaurants.", meta_title: "Bester Cognac auf den Karten der Michelin-Sterne-Restaurants!", meta_description: "Die besten Cognacs, ausgewählt von Köchen und Sommeliers der Michelin-Sterne-Restaurants." },
    it: { name: 'Cognac', description: "Il cognac è un'acquavite di vino protetta da Denominazione di Origine Controllata. Scoprite i migliori cognac selezionati dagli chef e sommelier dei ristoranti stellati Michelin.", meta_title: "Miglior cognac nei ristoranti stellati Michelin!", meta_description: "I migliori cognac selezionati da chef e sommelier nei ristoranti stellati Michelin." },
    pt: { name: 'Conhaque', description: "O conhaque é uma aguardente de vinho protegida por Denominação de Origem Controlada. Descubra os melhores conhaques selecionados por chefs e sommeliers de restaurantes com estrelas Michelin.", meta_title: "Melhor conhaque nos restaurantes com estrelas Michelin!", meta_description: "Os melhores conhaques selecionados por chefs e sommeliers em restaurantes com estrelas Michelin." },
    zh: { name: '干邑', description: "干邑是一种受原产地命名控制保护的葡萄酒白兰地。探索由米其林星级餐厅的主厨和侍酒师精选的最佳干邑。", meta_title: "米其林星级餐厅的最佳干邑！", meta_description: "由米其林星级餐厅的主厨和侍酒师精选的最佳干邑。" },
    ja: { name: 'コニャック', description: "コニャックはAOC（原産地統制呼称）によって保護されたワインのブランデーです。ミシュラン星付きレストランのシェフとソムリエが厳選した最高のコニャックをご紹介します。", meta_title: "ミシュラン星付きレストランの最高のコニャック！", meta_description: "ミシュラン星付きレストランのシェフとソムリエが厳選した最高のコニャック。" },
    ru: { name: 'Коньяк', description: "Коньяк — виноградный бренди, защищённый контролируемым наименованием по происхождению. Откройте лучшие коньяки, отобранные шеф-поварами и сомелье ресторанов со звёздами Мишлен.", meta_title: "Лучший коньяк в ресторанах со звёздами Мишлен!", meta_description: "Лучшие коньяки, отобранные шеф-поварами и сомелье ресторанов со звёздами Мишлен." },
    ar: { name: 'كونياك', description: "الكونياك هو براندي النبيذ المحمي بتسمية المنشأ المراقبة. اكتشف أفضل أنواع الكونياك المختارة من قبل الطهاة والساقيين في مطاعم ميشلان.", meta_title: "أفضل كونياك في مطاعم ميشلان!", meta_description: "أفضل أنواع الكونياك المختارة من قبل الطهاة والساقيين في مطاعم ميشلان." },
  },
  {
    slug: 'rhum',
    fr: {
      name: 'Rhum',
      description: "Découvrez les meilleurs rhums sélectionnés par les chefs et sommeliers des restaurants gastronomiques étoilés. Du rhum agricole martiniquais aux rhums de mélasse des Caraïbes, une sélection d'exception.",
      meta_title: "Meilleur rhum à la carte des restaurants gastronomiques étoilés !",
      meta_description: "Meilleurs rhums sélectionnés par les chefs et sommeliers à la carte des restaurants gastronomiques étoilés."
    },
    'en-us': { name: 'Rum', description: "Discover the finest rums selected by chefs and sommeliers of Michelin-starred restaurants. From Martinique agricole to Caribbean molasses rums, an exceptional selection.", meta_title: "Best Rum on Michelin-Starred Restaurant Menus!", meta_description: "Best rums selected by chefs and sommeliers on Michelin-starred restaurant menus." },
    'en-gb': { name: 'Rum', description: "Discover the finest rums curated by chefs and sommeliers of Michelin-starred restaurants. From agricole to molasses-based styles.", meta_title: "Best Rum on Michelin-Starred Restaurant Menus!", meta_description: "Finest rums selected by chefs and sommeliers at Michelin-starred restaurants." },
    es: { name: 'Ron', description: "Descubra los mejores rones seleccionados por chefs y sommeliers de restaurantes con estrellas Michelin. Del ron agrícola de Martinica a los rones del Caribe.", meta_title: "Mejor ron en restaurantes con estrellas Michelin", meta_description: "Los mejores rones seleccionados por chefs y sommeliers en restaurantes con estrellas Michelin." },
    de: { name: 'Rum', description: "Entdecken Sie die besten Rums, ausgewählt von Köchen und Sommeliers der Michelin-Sterne-Restaurants. Vom Rhum Agricole aus Martinique bis zum karibischen Melasse-Rum.", meta_title: "Bester Rum auf den Karten der Michelin-Sterne-Restaurants!", meta_description: "Die besten Rums, ausgewählt von Köchen und Sommeliers der Michelin-Sterne-Restaurants." },
    it: { name: 'Rum', description: "Scoprite i migliori rum selezionati dagli chef e sommelier dei ristoranti stellati Michelin. Dal rum agricole della Martinica ai rum caraibici.", meta_title: "Miglior rum nei ristoranti stellati Michelin!", meta_description: "I migliori rum selezionati da chef e sommelier nei ristoranti stellati Michelin." },
    pt: { name: 'Rum', description: "Descubra os melhores runs selecionados por chefs e sommeliers de restaurantes com estrelas Michelin. Do rum agrícola da Martinica aos runs do Caribe.", meta_title: "Melhor rum nos restaurantes com estrelas Michelin!", meta_description: "Os melhores runs selecionados por chefs e sommeliers em restaurantes com estrelas Michelin." },
    zh: { name: '朗姆酒', description: "探索由米其林星级餐厅的主厨和侍酒师精选的最佳朗姆酒。从马提尼克甘蔗朗姆酒到加勒比糖蜜朗姆酒。", meta_title: "米其林星级餐厅的最佳朗姆酒！", meta_description: "由米其林星级餐厅的主厨和侍酒师精选的最佳朗姆酒。" },
    ja: { name: 'ラム', description: "ミシュラン星付きレストランのシェフとソムリエが厳選した最高のラム酒をご紹介します。マルティニークのアグリコールからカリブ海のモラセスラムまで。", meta_title: "ミシュラン星付きレストランの最高のラム！", meta_description: "ミシュラン星付きレストランのシェフとソムリエが厳選した最高のラム。" },
    ru: { name: 'Ром', description: "Откройте лучшие ромы, отобранные шеф-поварами и сомелье ресторанов со звёздами Мишлен. От агриколь Мартиники до карибских мелассовых ромов.", meta_title: "Лучший ром в ресторанах со звёздами Мишлен!", meta_description: "Лучшие ромы, отобранные шеф-поварами и сомелье ресторанов со звёздами Мишлен." },
    ar: { name: 'روم', description: "اكتشف أفضل أنواع الروم المختارة من قبل الطهاة والساقيين في مطاعم ميشلان. من روم المارتينيك الزراعي إلى روم الكاريبي.", meta_title: "أفضل روم في مطاعم ميشلان!", meta_description: "أفضل أنواع الروم المختارة من قبل الطهاة والساقيين في مطاعم ميشلان." },
  },
  {
    slug: 'gin',
    fr: {
      name: 'Gin',
      description: "Découvrez les meilleurs gins sélectionnés par les chefs et sommeliers des restaurants gastronomiques étoilés. Du London Dry classique aux gins contemporains artisanaux, une sélection botanique d'exception.",
      meta_title: "Meilleur gin à la carte des restaurants gastronomiques étoilés !",
      meta_description: "Meilleurs gins sélectionnés par les chefs et sommeliers à la carte des restaurants gastronomiques étoilés."
    },
    'en-us': { name: 'Gin', description: "Discover the finest gins selected by chefs and sommeliers of Michelin-starred restaurants. From classic London Dry to contemporary craft gins, an exceptional botanical selection.", meta_title: "Best Gin on Michelin-Starred Restaurant Menus!", meta_description: "Best gins selected by chefs and sommeliers on Michelin-starred restaurant menus." },
    'en-gb': { name: 'Gin', description: "Discover the finest gins curated by chefs and sommeliers of Michelin-starred restaurants. From London Dry to contemporary craft.", meta_title: "Best Gin on Michelin-Starred Restaurant Menus!", meta_description: "Finest gins selected by chefs and sommeliers at Michelin-starred restaurants." },
    es: { name: 'Ginebra', description: "Descubra las mejores ginebras seleccionadas por chefs y sommeliers de restaurantes con estrellas Michelin. Del London Dry clásico a las ginebras artesanales contemporáneas.", meta_title: "Mejor ginebra en restaurantes con estrellas Michelin", meta_description: "Las mejores ginebras seleccionadas por chefs y sommeliers en restaurantes con estrellas Michelin." },
    de: { name: 'Gin', description: "Entdecken Sie die besten Gins, ausgewählt von Köchen und Sommeliers der Michelin-Sterne-Restaurants. Vom klassischen London Dry bis zum handwerklichen Craft Gin.", meta_title: "Bester Gin auf den Karten der Michelin-Sterne-Restaurants!", meta_description: "Die besten Gins, ausgewählt von Köchen und Sommeliers der Michelin-Sterne-Restaurants." },
    it: { name: 'Gin', description: "Scoprite i migliori gin selezionati dagli chef e sommelier dei ristoranti stellati Michelin. Dal London Dry classico ai gin artigianali contemporanei.", meta_title: "Miglior gin nei ristoranti stellati Michelin!", meta_description: "I migliori gin selezionati da chef e sommelier nei ristoranti stellati Michelin." },
    pt: { name: 'Gin', description: "Descubra os melhores gins selecionados por chefs e sommeliers de restaurantes com estrelas Michelin. Do London Dry clássico aos gins artesanais contemporâneos.", meta_title: "Melhor gin nos restaurantes com estrelas Michelin!", meta_description: "Os melhores gins selecionados por chefs e sommeliers em restaurantes com estrelas Michelin." },
    zh: { name: '金酒', description: "探索由米其林星级餐厅的主厨和侍酒师精选的最佳金酒。从经典的伦敦干金到当代手工金酒。", meta_title: "米其林星级餐厅的最佳金酒！", meta_description: "由米其林星级餐厅的主厨和侍酒师精选的最佳金酒。" },
    ja: { name: 'ジン', description: "ミシュラン星付きレストランのシェフとソムリエが厳選した最高のジンをご紹介します。クラシックなロンドン・ドライから現代のクラフトジンまで。", meta_title: "ミシュラン星付きレストランの最高のジン！", meta_description: "ミシュラン星付きレストランのシェフとソムリエが厳選した最高のジン。" },
    ru: { name: 'Джин', description: "Откройте лучшие джины, отобранные шеф-поварами и сомелье ресторанов со звёздами Мишлен. От классического London Dry до современных крафтовых джинов.", meta_title: "Лучший джин в ресторанах со звёздами Мишлен!", meta_description: "Лучшие джины, отобранные шеф-поварами и сомелье ресторанов со звёздами Мишлен." },
    ar: { name: 'جن', description: "اكتشف أفضل أنواع الجن المختارة من قبل الطهاة والساقيين في مطاعم ميشلان. من الجن الجاف الكلاسيكي إلى الجن الحرفي المعاصر.", meta_title: "أفضل جن في مطاعم ميشلان!", meta_description: "أفضل أنواع الجن المختارة من قبل الطهاة والساقيين في مطاعم ميشلان." },
  },
  {
    slug: 'vodka',
    fr: {
      name: 'Vodka',
      description: "Découvrez les meilleures vodkas sélectionnées par les chefs et sommeliers des restaurants gastronomiques étoilés. De la France à la Pologne en passant par la Russie, une sélection cristalline d'excellence.",
      meta_title: "Meilleure vodka à la carte des restaurants gastronomiques !",
      meta_description: "Meilleures vodkas sélectionnées par les chefs et sommeliers à la carte des restaurants gastronomiques étoilés."
    },
    'en-us': { name: 'Vodka', description: "Discover the finest vodkas selected by chefs and sommeliers of Michelin-starred restaurants. From France to Poland to Russia, a crystalline selection of excellence.", meta_title: "Best Vodka on Michelin-Starred Restaurant Menus!", meta_description: "Best vodkas selected by chefs and sommeliers on Michelin-starred restaurant menus." },
    'en-gb': { name: 'Vodka', description: "Discover the finest vodkas curated by chefs and sommeliers of Michelin-starred restaurants. From France to Poland to Russia.", meta_title: "Best Vodka on Michelin-Starred Restaurant Menus!", meta_description: "Finest vodkas selected by chefs and sommeliers at Michelin-starred restaurants." },
    es: { name: 'Vodka', description: "Descubra las mejores vodkas seleccionadas por chefs y sommeliers de restaurantes con estrellas Michelin. De Francia a Polonia pasando por Rusia.", meta_title: "Mejor vodka en restaurantes con estrellas Michelin", meta_description: "Las mejores vodkas seleccionadas por chefs y sommeliers en restaurantes con estrellas Michelin." },
    de: { name: 'Wodka', description: "Entdecken Sie die besten Wodkas, ausgewählt von Köchen und Sommeliers der Michelin-Sterne-Restaurants. Von Frankreich über Polen bis Russland.", meta_title: "Bester Wodka auf den Karten der Michelin-Sterne-Restaurants!", meta_description: "Die besten Wodkas, ausgewählt von Köchen und Sommeliers der Michelin-Sterne-Restaurants." },
    it: { name: 'Vodka', description: "Scoprite le migliori vodke selezionate dagli chef e sommelier dei ristoranti stellati Michelin. Dalla Francia alla Polonia alla Russia.", meta_title: "Miglior vodka nei ristoranti stellati Michelin!", meta_description: "Le migliori vodke selezionate da chef e sommelier nei ristoranti stellati Michelin." },
    pt: { name: 'Vodca', description: "Descubra as melhores vodcas selecionadas por chefs e sommeliers de restaurantes com estrelas Michelin. Da França à Polônia passando pela Rússia.", meta_title: "Melhor vodca nos restaurantes com estrelas Michelin!", meta_description: "As melhores vodcas selecionadas por chefs e sommeliers em restaurantes com estrelas Michelin." },
    zh: { name: '伏特加', description: "探索由米其林星级餐厅的主厨和侍酒师精选的最佳伏特加。从法国到波兰再到俄罗斯。", meta_title: "米其林星级餐厅的最佳伏特加！", meta_description: "由米其林星级餐厅的主厨和侍酒师精选的最佳伏特加。" },
    ja: { name: 'ウォッカ', description: "ミシュラン星付きレストランのシェフとソムリエが厳選した最高のウォッカをご紹介します。フランスからポーランド、ロシアまで。", meta_title: "ミシュラン星付きレストランの最高のウォッカ！", meta_description: "ミシュラン星付きレストランのシェフとソムリエが厳選した最高のウォッカ。" },
    ru: { name: 'Водка', description: "Откройте лучшие водки, отобранные шеф-поварами и сомелье ресторанов со звёздами Мишлен. От Франции до Польши и России.", meta_title: "Лучшая водка в ресторанах со звёздами Мишлен!", meta_description: "Лучшие водки, отобранные шеф-поварами и сомелье ресторанов со звёздами Мишлен." },
    ar: { name: 'فودكا', description: "اكتشف أفضل أنواع الفودكا المختارة من قبل الطهاة والساقيين في مطاعم ميشلان. من فرنسا إلى بولندا وروسيا.", meta_title: "أفضل فودكا في مطاعم ميشلان!", meta_description: "أفضل أنواع الفودكا المختارة من قبل الطهاة والساقيين في مطاعم ميشلان." },
  },
  {
    slug: 'vin-blanc',
    fr: {
      name: 'Vin blanc',
      description: "Découvrez les meilleurs vins blancs sélectionnés par les chefs et sommeliers des restaurants gastronomiques étoilés. De la Bourgogne à l'Alsace, de la Savoie à la Provence, une sélection raffinée.",
      meta_title: "Meilleur vin blanc à la carte des restaurants gastronomiques étoilés !",
      meta_description: "Meilleurs vins blancs sélectionnés par les chefs et sommeliers à la carte des restaurants gastronomiques étoilés."
    },
    'en-us': { name: 'White Wine', description: "Discover the finest white wines selected by chefs and sommeliers of Michelin-starred restaurants. From Burgundy to Alsace, Savoy to Provence, a refined selection.", meta_title: "Best White Wine on Michelin-Starred Restaurant Menus!", meta_description: "Best white wines selected by chefs and sommeliers on Michelin-starred restaurant menus." },
    'en-gb': { name: 'White Wine', description: "Discover the finest white wines curated by chefs and sommeliers of Michelin-starred restaurants. From Burgundy to Alsace and beyond.", meta_title: "Best White Wine on Michelin-Starred Restaurant Menus!", meta_description: "Finest white wines selected by chefs and sommeliers at Michelin-starred restaurants." },
    es: { name: 'Vino blanco', description: "Descubra los mejores vinos blancos seleccionados por chefs y sommeliers de restaurantes con estrellas Michelin. De Borgoña a Alsacia, de Saboya a Provenza.", meta_title: "Mejor vino blanco en restaurantes con estrellas Michelin", meta_description: "Los mejores vinos blancos seleccionados por chefs y sommeliers en restaurantes con estrellas Michelin." },
    de: { name: 'Weißwein', description: "Entdecken Sie die besten Weißweine, ausgewählt von Köchen und Sommeliers der Michelin-Sterne-Restaurants. Vom Burgund bis zum Elsass, von Savoyen bis zur Provence.", meta_title: "Bester Weißwein auf den Karten der Michelin-Sterne-Restaurants!", meta_description: "Die besten Weißweine, ausgewählt von Köchen und Sommeliers der Michelin-Sterne-Restaurants." },
    it: { name: 'Vino bianco', description: "Scoprite i migliori vini bianchi selezionati dagli chef e sommelier dei ristoranti stellati Michelin. Dalla Borgogna all'Alsazia, dalla Savoia alla Provenza.", meta_title: "Miglior vino bianco nei ristoranti stellati Michelin!", meta_description: "I migliori vini bianchi selezionati da chef e sommelier nei ristoranti stellati Michelin." },
    pt: { name: 'Vinho branco', description: "Descubra os melhores vinhos brancos selecionados por chefs e sommeliers de restaurantes com estrelas Michelin. Da Borgonha à Alsácia, de Saboia à Provença.", meta_title: "Melhor vinho branco nos restaurantes com estrelas Michelin!", meta_description: "Os melhores vinhos brancos selecionados por chefs e sommeliers em restaurantes com estrelas Michelin." },
    zh: { name: '白葡萄酒', description: "探索由米其林星级餐厅的主厨和侍酒师精选的最佳白葡萄酒。从勃艮第到阿尔萨斯，从萨瓦到普罗旺斯。", meta_title: "米其林星级餐厅的最佳白葡萄酒！", meta_description: "由米其林星级餐厅的主厨和侍酒师精选的最佳白葡萄酒。" },
    ja: { name: '白ワイン', description: "ミシュラン星付きレストランのシェフとソムリエが厳選した最高の白ワインをご紹介します。ブルゴーニュからアルザス、サヴォワからプロヴァンスまで。", meta_title: "ミシュラン星付きレストランの最高の白ワイン！", meta_description: "ミシュラン星付きレストランのシェフとソムリエが厳選した最高の白ワイン。" },
    ru: { name: 'Белое вино', description: "Откройте лучшие белые вина, отобранные шеф-поварами и сомелье ресторанов со звёздами Мишлен. От Бургундии до Эльзаса, от Савойи до Прованса.", meta_title: "Лучшее белое вино в ресторанах со звёздами Мишлен!", meta_description: "Лучшие белые вина, отобранные шеф-поварами и сомелье ресторанов со звёздами Мишлен." },
    ar: { name: 'نبيذ أبيض', description: "اكتشف أفضل أنواع النبيذ الأبيض المختارة من قبل الطهاة والساقيين في مطاعم ميشلان. من بورغندي إلى الألزاس ومن سافوا إلى بروفانس.", meta_title: "أفضل نبيذ أبيض في مطاعم ميشلان!", meta_description: "أفضل أنواع النبيذ الأبيض المختارة من قبل الطهاة والساقيين في مطاعم ميشلان." },
  },
  {
    slug: 'vin-rose',
    fr: {
      name: 'Vin rosé',
      description: "Découvrez les meilleurs vins rosés sélectionnés par les chefs et sommeliers des restaurants gastronomiques étoilés. Du Bandol au Côtes de Provence, une sélection solaire d'exception.",
      meta_title: "Meilleur vin rosé à la carte des restaurants gastronomiques étoilés !",
      meta_description: "Meilleurs vins rosés sélectionnés par les chefs et sommeliers à la carte des restaurants gastronomiques étoilés."
    },
    'en-us': { name: 'Rosé Wine', description: "Discover the finest rosé wines selected by chefs and sommeliers of Michelin-starred restaurants. From Bandol to Côtes de Provence, a sun-drenched selection of excellence.", meta_title: "Best Rosé Wine on Michelin-Starred Restaurant Menus!", meta_description: "Best rosé wines selected by chefs and sommeliers on Michelin-starred restaurant menus." },
    'en-gb': { name: 'Rosé Wine', description: "Discover the finest rosé wines curated by chefs and sommeliers of Michelin-starred restaurants. From Bandol to Côtes de Provence.", meta_title: "Best Rosé Wine on Michelin-Starred Restaurant Menus!", meta_description: "Finest rosé wines selected by chefs and sommeliers at Michelin-starred restaurants." },
    es: { name: 'Vino rosado', description: "Descubra los mejores vinos rosados seleccionados por chefs y sommeliers de restaurantes con estrellas Michelin. De Bandol a Côtes de Provence.", meta_title: "Mejor vino rosado en restaurantes con estrellas Michelin", meta_description: "Los mejores vinos rosados seleccionados por chefs y sommeliers en restaurantes con estrellas Michelin." },
    de: { name: 'Roséwein', description: "Entdecken Sie die besten Roséweine, ausgewählt von Köchen und Sommeliers der Michelin-Sterne-Restaurants. Von Bandol bis Côtes de Provence.", meta_title: "Bester Roséwein auf den Karten der Michelin-Sterne-Restaurants!", meta_description: "Die besten Roséweine, ausgewählt von Köchen und Sommeliers der Michelin-Sterne-Restaurants." },
    it: { name: 'Vino rosato', description: "Scoprite i migliori vini rosati selezionati dagli chef e sommelier dei ristoranti stellati Michelin. Da Bandol alla Côtes de Provence.", meta_title: "Miglior vino rosato nei ristoranti stellati Michelin!", meta_description: "I migliori vini rosati selezionati da chef e sommelier nei ristoranti stellati Michelin." },
    pt: { name: 'Vinho rosé', description: "Descubra os melhores vinhos rosés selecionados por chefs e sommeliers de restaurantes com estrelas Michelin. De Bandol a Côtes de Provence.", meta_title: "Melhor vinho rosé nos restaurantes com estrelas Michelin!", meta_description: "Os melhores vinhos rosés selecionados por chefs e sommeliers em restaurantes com estrelas Michelin." },
    zh: { name: '桃红葡萄酒', description: "探索由米其林星级餐厅的主厨和侍酒师精选的最佳桃红葡萄酒。从邦多尔到普罗旺斯海岸。", meta_title: "米其林星级餐厅的最佳桃红葡萄酒！", meta_description: "由米其林星级餐厅的主厨和侍酒师精选的最佳桃红葡萄酒。" },
    ja: { name: 'ロゼワイン', description: "ミシュラン星付きレストランのシェフとソムリエが厳選した最高のロゼワインをご紹介します。バンドールからコート・ド・プロヴァンスまで。", meta_title: "ミシュラン星付きレストランの最高のロゼワイン！", meta_description: "ミシュラン星付きレストランのシェフとソムリエが厳選した最高のロゼワイン。" },
    ru: { name: 'Розовое вино', description: "Откройте лучшие розовые вина, отобранные шеф-поварами и сомелье ресторанов со звёздами Мишлен. От Бандоль до Кот-де-Прованс.", meta_title: "Лучшее розовое вино в ресторанах со звёздами Мишлен!", meta_description: "Лучшие розовые вина, отобранные шеф-поварами и сомелье ресторанов со звёздами Мишлен." },
    ar: { name: 'نبيذ وردي', description: "اكتشف أفضل أنواع النبيذ الوردي المختارة من قبل الطهاة والساقيين في مطاعم ميشلان. من باندول إلى كوت دو بروفانس.", meta_title: "أفضل نبيذ وردي في مطاعم ميشلان!", meta_description: "أفضل أنواع النبيذ الوردي المختارة من قبل الطهاة والساقيين في مطاعم ميشلان." },
  },
]

const LOCALES = ['fr', 'en-us', 'en-gb', 'es', 'de', 'it', 'pt', 'zh', 'ja', 'ru', 'ar'] as const

async function updateCategoryTranslations() {
  console.log('--- Step 7: Update category translations ---')
  let count = 0

  for (const cat of CATEGORY_EDITORIAL) {
    const catId = await lookupCategoryId(cat.slug)

    for (const locale of LOCALES) {
      const t = cat[locale]
      if (!t) continue

      const { error } = await supabase
        .from('category_translations')
        .upsert({
          category_id: catId,
          locale,
          name: t.name,
          description: t.description,
          meta_title: t.meta_title,
          meta_description: t.meta_description,
        }, { onConflict: 'category_id,locale' })
      if (error) console.error(`  Cat ${cat.slug}/${locale}: ${error.message}`)
      else count++
    }
  }
  console.log(`  Upserted ${count} category translations`)
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('=== Bestwine Content Population Script ===')
  console.log(`Started at ${new Date().toISOString()}\n`)

  try {
    await ensureCategories()
    await insertRestaurants()
    await insertRestaurantTranslations()
    await insertDrinks()
    await insertDrinkTranslations()
    await insertWineListEntries()
    await updateCategoryTranslations()

    console.log('\n=== Summary ===')
    console.log(`Restaurants: ${RESTAURANTS.length}`)
    console.log(`Restaurant translations: ${RESTAURANT_TRANSLATIONS.length * 2} (FR + EN-US)`)
    console.log(`Drinks: ${DRINKS.length}`)
    console.log(`Drink translations: ${DRINKS.length * 2} (FR + EN-US)`)
    console.log(`Wine list entries: ${WINE_LIST_LINKS.length}`)
    console.log(`Category translations: ${CATEGORY_EDITORIAL.length} categories × ${LOCALES.length} locales = ${CATEGORY_EDITORIAL.length * LOCALES.length}`)
    console.log(`\nCompleted at ${new Date().toISOString()}`)
  } catch (err) {
    console.error('Fatal error:', err)
    process.exit(1)
  }
}

main()
