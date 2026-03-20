/**
 * Update category_translations with full editorial SEO content
 * from the original WordPress site (scraped-content.json).
 *
 * Usage:
 *   NEXT_PUBLIC_SUPABASE_URL=https://tmwxushartfhwgawixqz.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=<key> \
 *   npx tsx scripts/update-editorial-content.ts
 */
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
if (!supabaseUrl || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ─── Editorial content per category (from scraped WordPress data) ───

interface EditorialEntry {
  slug: string
  locales: Record<string, string> // locale -> full editorial description
}

function buildFrEditorial(
  categoryName: string,
  categoryNamePlural: string,
  specificContent?: string
): string {
  const parts = [
    `Découvrez des ${categoryNamePlural} sélectionnés par les chefs et sommeliers des restaurants gastronomiques étoilés. Une sélection par des professionnels crédibles et légitimes pour vous permettre de trouver votre ${categoryName} préféré.`,
    `Nous vous guidons vers les offres commerciales et promotionnelles les plus intéressantes en ligne. Vous pouvez acheter les meilleurs ${categoryNamePlural} en toute confiance grâce à un référentiel fiable et impartial.`,
    `Bestwine \u2022 Online référence les ${categoryNamePlural} présents sur la carte des vins et dans les caves des restaurants gastronomiques les plus connus et reconnus à travers le monde.`,
    `Le référentiel des meilleurs ${categoryNamePlural} est mis à jour quotidiennement en intégrant de nouvelles références qui proviennent des cartes des vins des restaurants gastronomiques.`,
    `Les chefs et sommeliers des restaurants gastronomiques sont les garants de l'excellence de la gastronomie en proposant les meilleurs produits, mets et boissons dans leurs restaurants.`,
  ]
  if (specificContent) {
    parts.push(specificContent)
  }
  return parts.join('\n\n')
}

function buildEnEditorial(
  categoryNamePlural: string,
  specificContent?: string
): string {
  const parts = [
    `Discover ${categoryNamePlural} selected by the chefs and sommeliers of Michelin-starred gourmet restaurants. A selection by credible and legitimate professionals to help you find your preferred reference.`,
    `We guide you to the most attractive commercial and promotional offers online. You can buy the best ${categoryNamePlural} with confidence through a reliable and impartial reference guide.`,
    `Bestwine \u2022 Online references the ${categoryNamePlural} found on the wine lists and in the cellars of the most renowned gourmet restaurants worldwide.`,
    `The reference guide for the best ${categoryNamePlural} is updated daily with new references from the wine lists of gourmet restaurants.`,
    `The chefs and sommeliers of gourmet restaurants are the guarantors of gastronomic excellence, offering the finest products, dishes, and beverages in their restaurants.`,
  ]
  if (specificContent) {
    parts.push(specificContent)
  }
  return parts.join('\n\n')
}

const editorialData: EditorialEntry[] = [
  {
    slug: 'whisky',
    locales: {
      fr: buildFrEditorial('whisky', 'whiskys',
        `Je suis un amateur de whisky et je ne me définirais jamais comme un expert de cette boisson alcoolisée. Je ne me positionne aucunement comme conseiller. Je laisse la place pour cela à l'expertise des chefs et sommeliers gastronomiques qui sélectionnent les meilleurs whiskys pour les caves de leurs restaurants étoilés.`
      ),
      'en-us': buildEnEditorial('whiskies',
        `I am a whisky enthusiast and would never define myself as an expert on this spirit. I do not position myself as an adviser. I leave that to the expertise of gourmet chefs and sommeliers who select the finest whiskies for the cellars of their Michelin-starred restaurants.`
      ),
      'en-gb': buildEnEditorial('whiskies',
        `I am a whisky enthusiast and would never define myself as an expert on this spirit. I do not position myself as an adviser. I leave that to the expertise of gourmet chefs and sommeliers who select the finest whiskies for the cellars of their Michelin-starred restaurants.`
      ),
    },
  },
  {
    slug: 'vin-rouge',
    locales: {
      fr: buildFrEditorial('vin rouge', 'vins rouges',
        `Les vins rouges référencés proviennent des plus grands terroirs : Bordeaux, Bourgogne, Vallée du Rhône, mais aussi d'Italie, d'Espagne et du Nouveau Monde. Chaque référence a été identifiée sur les cartes des restaurants étoilés Michelin les plus prestigieux, de Clos des Sens à The Fat Duck.`
      ),
      'en-us': buildEnEditorial('red wines',
        `The referenced red wines come from the greatest terroirs: Bordeaux, Burgundy, Rhône Valley, as well as Italy, Spain, and the New World. Each reference has been identified on the wine lists of the most prestigious Michelin-starred restaurants, from Clos des Sens to The Fat Duck.`
      ),
      'en-gb': buildEnEditorial('red wines',
        `The referenced red wines come from the greatest terroirs: Bordeaux, Burgundy, Rhône Valley, as well as Italy, Spain, and the New World. Each reference has been identified on the wine lists of the most prestigious Michelin-starred restaurants, from Clos des Sens to The Fat Duck.`
      ),
    },
  },
  {
    slug: 'champagne',
    locales: {
      fr: buildFrEditorial('champagne', 'champagnes',
        `La production du champagne suit un processus rigoureux en plusieurs étapes : les vendanges, le pressurage, la fermentation, la mise en bouteille, la maturation sur lattes, le dégorgement et l'ajout de la liqueur de dosage. Chaque maison de champagne apporte sa signature unique à travers ce processus ancestral.\n\nLe champagne se déguste idéalement dans une flûte, à une température de 6 à 8°C. L'appréciation passe par l'ouverture maîtrisée de la bouteille, le service délicat, la découverte des arômes et une consommation modérée.\n\nParmi les maisons les plus référencées dans les restaurants étoilés : Krug, Salon, Dom Pérignon, Louis Roederer, Bollinger, Jacques Selosse, Egly-Ouriet et Billecart-Salmon.`
      ),
      'en-us': buildEnEditorial('champagnes',
        `Champagne production follows a rigorous multi-step process: grape harvesting, pressing, fermentation, bottling, maturation on laths, disgorging, and dosage addition. Each champagne house brings its unique signature through this ancestral process.\n\nChampagne is ideally served in a flute at 6-8°C. The experience involves the controlled opening of the bottle, delicate pouring, aroma appreciation, and moderate consumption.\n\nAmong the most referenced houses in starred restaurants: Krug, Salon, Dom Pérignon, Louis Roederer, Bollinger, Jacques Selosse, Egly-Ouriet, and Billecart-Salmon.`
      ),
      'en-gb': buildEnEditorial('champagnes',
        `Champagne production follows a rigorous multi-step process: grape harvesting, pressing, fermentation, bottling, maturation on laths, disgorging, and dosage addition. Each champagne house brings its unique signature through this ancestral process.\n\nChampagne is ideally served in a flute at 6-8°C. The experience involves the controlled opening of the bottle, delicate pouring, aroma appreciation, and moderate consumption.\n\nAmong the most referenced houses in starred restaurants: Krug, Salon, Dom Pérignon, Louis Roederer, Bollinger, Jacques Selosse, Egly-Ouriet, and Billecart-Salmon.`
      ),
    },
  },
  {
    slug: 'cognac',
    locales: {
      fr: buildFrEditorial('cognac', 'cognacs',
        `Le cognac est une eau-de-vie de vin protégée par une Appellation d'origine contrôlée (AOC). Sa production est exclusivement française, dans la région géographique de la Charente et de la Charente-Maritime, avec des portions de la Dordogne. L'UNESCO a reconnu le savoir-faire du cognac comme patrimoine culturel immatériel en 2020.\n\nLa classification des cognacs se fait par âge : XO (minimum 10 ans en fût de chêne), VSOP (minimum 5 ans en fût de chêne), VS (minimum 2 ans en fût de chêne). Les crus de cognac sont hiérarchisés : Grande Champagne, Petite Champagne, Fine Champagne, Borderies, Fins Bois, Bons Bois et Bois ordinaires.\n\nLes cognacs les plus référencés dans les restaurants étoilés sont Hennessy XO, Martell XO, Courvoisier XO et Frapin XO, présents dans les caves de restaurants comme Beaumanière, The Dorchester, Core by Clare Smyth et The Fat Duck.`
      ),
      'en-us': buildEnEditorial('cognacs',
        `Cognac is a wine-based eau-de-vie protected by an Appellation d'Origine Contrôlée (AOC). Its production is exclusively French, in the Charente and Charente-Maritime regions, with portions of Dordogne. UNESCO recognized cognac-making as intangible cultural heritage in 2020.\n\nCognacs are classified by age: XO (minimum 10 years in oak), VSOP (minimum 5 years in oak), VS (minimum 2 years in oak). Cognac crus are ranked: Grande Champagne, Petite Champagne, Fine Champagne, Borderies, Fins Bois, Bons Bois, and Bois Ordinaires.\n\nThe most referenced cognacs in starred restaurants are Hennessy XO, Martell XO, Courvoisier XO, and Frapin XO, found in the cellars of restaurants such as Beaumanière, The Dorchester, Core by Clare Smyth, and The Fat Duck.`
      ),
      'en-gb': buildEnEditorial('cognacs',
        `Cognac is a wine-based eau-de-vie protected by an Appellation d'Origine Contrôlée (AOC). Its production is exclusively French, in the Charente and Charente-Maritime regions, with portions of Dordogne. UNESCO recognised cognac-making as intangible cultural heritage in 2020.\n\nCognacs are classified by age: XO (minimum 10 years in oak), VSOP (minimum 5 years in oak), VS (minimum 2 years in oak). Cognac crus are ranked: Grande Champagne, Petite Champagne, Fine Champagne, Borderies, Fins Bois, Bons Bois, and Bois Ordinaires.\n\nThe most referenced cognacs in starred restaurants are Hennessy XO, Martell XO, Courvoisier XO, and Frapin XO, found in the cellars of restaurants such as Beaumanière, The Dorchester, Core by Clare Smyth, and The Fat Duck.`
      ),
    },
  },
  {
    slug: 'rhum',
    locales: {
      fr: buildFrEditorial('rhum', 'rhums',
        `Le monde du rhum est riche et diversifié, avec des catégories allant du rhum blanc au rhum ambré, du rhum vieux au rhum agricole, en passant par le rhum arrangé. Les origines géographiques sont tout aussi variées : Cuba, Martinique, Jamaïque, Guatemala, Trinidad & Tobago, Guadeloupe et bien d'autres.\n\nLes rhums les plus référencés dans les restaurants étoilés sont le Rhum Zacapa (Guatemala), le Rhum J.M. Cuvée 1845 (Martinique) et le Rhum Caroni (Trinidad & Tobago), présents dans les caves de restaurants comme Clos des Sens, Beaumanière et The Dorchester.`
      ),
      'en-us': buildEnEditorial('rums',
        `The world of rum is rich and diverse, with categories ranging from white rum to amber rum, aged rum to agricultural rum, and arranged rum. Geographic origins are equally varied: Cuba, Martinique, Jamaica, Guatemala, Trinidad & Tobago, Guadeloupe, and many others.\n\nThe most referenced rums in starred restaurants are Rhum Zacapa (Guatemala), Rhum J.M. Cuvée 1845 (Martinique), and Rhum Caroni (Trinidad & Tobago), found in the cellars of restaurants such as Clos des Sens, Beaumanière, and The Dorchester.`
      ),
      'en-gb': buildEnEditorial('rums',
        `The world of rum is rich and diverse, with categories ranging from white rum to amber rum, aged rum to agricultural rum, and arranged rum. Geographic origins are equally varied: Cuba, Martinique, Jamaica, Guatemala, Trinidad & Tobago, Guadeloupe, and many others.\n\nThe most referenced rums in starred restaurants are Rhum Zacapa (Guatemala), Rhum J.M. Cuvée 1845 (Martinique), and Rhum Caroni (Trinidad & Tobago), found in the cellars of restaurants such as Clos des Sens, Beaumanière, and The Dorchester.`
      ),
    },
  },
  {
    slug: 'gin',
    locales: {
      fr: buildFrEditorial('gin', 'gins',
        `Le gin trouve ses origines aux Pays-Bas au XVIIe siècle, avec une distinction entre le genièvre et le London Dry Gin. Aujourd'hui, le gin est principalement servi en apéritif sous forme de cocktails (gin tonic) dans les restaurants gastronomiques. Il est rarement servi pur, mais peut être utilisé occasionnellement comme digestif ou en cuisine pour des sauces.\n\nLes gins les plus référencés dans les restaurants étoilés sont Tanqueray Ten (Écosse), Hendrick's (Écosse), Monkey 47 (Allemagne) et Bombay Sapphire (Angleterre), présents dans les caves de restaurants comme Clos des Sens, Yannick Alléno, Beaumanière, Core by Clare Smyth et The Dorchester.`
      ),
      'en-us': buildEnEditorial('gins',
        `Gin originated in the 17th-century Netherlands, with a distinction between genever and London Dry Gin styles. Today, gin is primarily served as an aperitif in cocktails (gin and tonic) at gourmet restaurants. It is rarely served neat but may occasionally be used as a digestif or in cooking for sauces.\n\nThe most referenced gins in starred restaurants are Tanqueray Ten (Scotland), Hendrick's (Scotland), Monkey 47 (Germany), and Bombay Sapphire (England), found in the cellars of restaurants such as Clos des Sens, Yannick Alléno, Beaumanière, Core by Clare Smyth, and The Dorchester.`
      ),
      'en-gb': buildEnEditorial('gins',
        `Gin originated in the 17th-century Netherlands, with a distinction between genever and London Dry Gin styles. Today, gin is primarily served as an aperitif in cocktails (gin and tonic) at gourmet restaurants. It is rarely served neat but may occasionally be used as a digestif or in cooking for sauces.\n\nThe most referenced gins in starred restaurants are Tanqueray Ten (Scotland), Hendrick's (Scotland), Monkey 47 (Germany), and Bombay Sapphire (England), found in the cellars of restaurants such as Clos des Sens, Yannick Alléno, Beaumanière, Core by Clare Smyth, and The Dorchester.`
      ),
    },
  },
  {
    slug: 'vin-blanc',
    locales: {
      fr: buildFrEditorial('vin blanc', 'vins blancs',
        `Les vins blancs référencés proviennent des plus beaux terroirs de France et du monde : Savoie, Alsace, Bourgogne, Bordeaux, Vallée du Rhône, Provence, mais aussi d'Italie et d'ailleurs. Les domaines les plus présents incluent Domaine Weinbach, Domaine Robert Denogent, Domaine Etienne Sauzet et Château de Fargues.\n\nCes vins blancs d'exception sont présents sur les cartes de restaurants étoilés tels que Clos des Sens, Beaumanière, La Bouitte, La Prieuré et Caprice.`
      ),
      'en-us': buildEnEditorial('white wines',
        `The referenced white wines come from the most beautiful terroirs of France and the world: Savoie, Alsace, Burgundy, Bordeaux, Rhône Valley, Provence, as well as Italy and beyond. The most frequently featured estates include Domaine Weinbach, Domaine Robert Denogent, Domaine Etienne Sauzet, and Château de Fargues.\n\nThese exceptional white wines are featured on the wine lists of starred restaurants such as Clos des Sens, Beaumanière, La Bouitte, La Prieuré, and Caprice.`
      ),
      'en-gb': buildEnEditorial('white wines',
        `The referenced white wines come from the most beautiful terroirs of France and the world: Savoie, Alsace, Burgundy, Bordeaux, Rhône Valley, Provence, as well as Italy and beyond. The most frequently featured estates include Domaine Weinbach, Domaine Robert Denogent, Domaine Etienne Sauzet, and Château de Fargues.\n\nThese exceptional white wines are featured on the wine lists of starred restaurants such as Clos des Sens, Beaumanière, La Bouitte, La Prieuré, and Caprice.`
      ),
    },
  },
  {
    slug: 'vodka',
    locales: {
      fr: buildFrEditorial('vodka', 'vodkas',
        `Les vodkas les plus référencées dans les restaurants étoilés sont Grey Goose (France), Stolichnaya Elit (Russie), Belvédère (Pologne) et Absolut (Suède). D'autres marques notables incluent Beluga Noble, Wyborowa Exquisite, Haku et Snow Léopard.\n\nBestwine \u2022 Online s'engage à référencer les meilleures vodkas et à vous guider vers les offres commerciales en ligne les plus attractives pour que vous puissiez les acheter au meilleur prix.`
      ),
      'en-us': buildEnEditorial('vodkas',
        `The most referenced vodkas in starred restaurants are Grey Goose (France), Stolichnaya Elit (Russia), Belvédère (Poland), and Absolut (Sweden). Other notable brands include Beluga Noble, Wyborowa Exquisite, Haku, and Snow Leopard.\n\nBestwine \u2022 Online is committed to referencing the best vodkas and guiding you to the most attractive online offers so you can buy them at the best price.`
      ),
      'en-gb': buildEnEditorial('vodkas',
        `The most referenced vodkas in starred restaurants are Grey Goose (France), Stolichnaya Elit (Russia), Belvédère (Poland), and Absolut (Sweden). Other notable brands include Beluga Noble, Wyborowa Exquisite, Haku, and Snow Leopard.\n\nBestwine \u2022 Online is committed to referencing the best vodkas and guiding you to the most attractive online offers so you can buy them at the best price.`
      ),
    },
  },
  {
    slug: 'scotch',
    locales: {
      fr: buildFrEditorial('scotch', 'scotchs',
        `L'Écosse est une terre de whisky avec des traces historiques remontant à 1494. Plus de 10 000 personnes sont directement employées dans l'industrie du whisky écossais. Les régions de production incluent les Highlands, le Speyside, Islay, les Lowlands et les îles.\n\nLes scotchs les plus référencés dans les restaurants étoilés sont Talisker (Skye), Macallan Fine Oak (Speyside), Glenkichie (Lowlands) et Johnnie Walker Gold Label (Highland).`
      ),
      'en-us': buildEnEditorial('Scotch whiskies',
        `Scotland is a land of whisky with historical traces dating to 1494. Over 10,000 people are directly employed in the Scottish whisky industry. Production regions include the Highlands, Speyside, Islay, the Lowlands, and the Islands.\n\nThe most referenced Scotch whiskies in starred restaurants are Talisker (Skye), Macallan Fine Oak (Speyside), Glenkichie (Lowlands), and Johnnie Walker Gold Label (Highland).`
      ),
      'en-gb': buildEnEditorial('Scotch whiskies',
        `Scotland is a land of whisky with historical traces dating to 1494. Over 10,000 people are directly employed in the Scottish whisky industry. Production regions include the Highlands, Speyside, Islay, the Lowlands, and the Islands.\n\nThe most referenced Scotch whiskies in starred restaurants are Talisker (Skye), Macallan Fine Oak (Speyside), Glenkichie (Lowlands), and Johnnie Walker Gold Label (Highland).`
      ),
    },
  },
  {
    slug: 'bourbon',
    locales: {
      fr: buildFrEditorial('bourbon', 'bourbons',
        `Le bourbon tire son nom du comté de Bourbon dans le Kentucky, où sa production a débuté vers les années 1730. Sa composition doit inclure un minimum de 51% de maïs, il est vieilli en fûts de chêne neufs carbonisés, avec un taux d'alcool inférieur à 80% volume.\n\nLes bourbons référencés dans les restaurants étoilés incluent Elijah Craig, Blanton's, Buffalo Trace, Four Roses, Jim Beam, Knob Creek, Maker's Mark, Woodford Reserve et Wild Turkey.`
      ),
      'en-us': buildEnEditorial('bourbons',
        `Bourbon originated from Bourbon County in Kentucky, with production beginning around the 1730s. Its composition must include a minimum of 51% corn, aged in charred new oak barrels, with alcohol content below 80% volume.\n\nBourbons referenced in starred restaurants include Elijah Craig, Blanton's, Buffalo Trace, Four Roses, Jim Beam, Knob Creek, Maker's Mark, Woodford Reserve, and Wild Turkey.`
      ),
      'en-gb': buildEnEditorial('bourbons',
        `Bourbon originated from Bourbon County in Kentucky, with production beginning around the 1730s. Its composition must include a minimum of 51% corn, aged in charred new oak barrels, with alcohol content below 80% volume.\n\nBourbons referenced in starred restaurants include Elijah Craig, Blanton's, Buffalo Trace, Four Roses, Jim Beam, Knob Creek, Maker's Mark, Woodford Reserve, and Wild Turkey.`
      ),
    },
  },
  {
    slug: 'rhum-martiniquais',
    locales: {
      fr: buildFrEditorial('rhum martiniquais', 'rhums martiniquais',
        `La Martinique produit 85% de rhum agricole. La distinction fondamentale est entre le rhum agricole (jus de canne fermenté) et le rhum traditionnel (à base de mélasse). Le rhum martiniquais bénéficie du label AOC Martinique, garantie de qualité et d'authenticité.\n\nLes marques majeures de rhum martiniquais incluent Clément, Saint-James, Neisson, Depaz, La Mauny, Trois Rivières et Duquesne. Les rhums les plus référencés dans les restaurants étoilés sont Rivière Bel'Air La Favorite, JM Cuvée 1845 et Neisson Bio.`
      ),
      'en-us': buildEnEditorial('Martinique rums',
        `Martinique produces 85% agricultural rum. The fundamental distinction is between rhum agricole (fermented cane juice) and traditional rum (molasses-based). Martinique rum benefits from the AOC Martinique label, a guarantee of quality and authenticity.\n\nMajor Martinique rum brands include Clément, Saint-James, Neisson, Depaz, La Mauny, Trois Rivières, and Duquesne. The most referenced rums in starred restaurants are Rivière Bel'Air La Favorite, JM Cuvée 1845, and Neisson Bio.`
      ),
      'en-gb': buildEnEditorial('Martinique rums',
        `Martinique produces 85% agricultural rum. The fundamental distinction is between rhum agricole (fermented cane juice) and traditional rum (molasses-based). Martinique rum benefits from the AOC Martinique label, a guarantee of quality and authenticity.\n\nMajor Martinique rum brands include Clément, Saint-James, Neisson, Depaz, La Mauny, Trois Rivières, and Duquesne. The most referenced rums in starred restaurants are Rivière Bel'Air La Favorite, JM Cuvée 1845, and Neisson Bio.`
      ),
    },
  },
  {
    slug: 'vin-rose',
    locales: {
      fr: buildFrEditorial('vin rosé', 'vins rosés',
        `Les vins rosés référencés proviennent principalement de Provence et du sud de la France. Les domaines les plus présents sur les cartes des restaurants étoilés sont Domaine Tempier (Bandol) et Château d'Esclans (Côtes de Provence).\n\nCes vins rosés d'exception sont présents sur les cartes de restaurants étoilés tels que La Prieuré, The Dorchester, Odette, Beaumanière, The Fat Duck, Geranium, L'Atelier de Joël Robuchon et Quince.`
      ),
      'en-us': buildEnEditorial('rosé wines',
        `The referenced rosé wines come primarily from Provence and the south of France. The most frequently featured estates on starred restaurant wine lists are Domaine Tempier (Bandol) and Château d'Esclans (Côtes de Provence).\n\nThese exceptional rosé wines are featured on the wine lists of starred restaurants such as La Prieuré, The Dorchester, Odette, Beaumanière, The Fat Duck, Geranium, L'Atelier de Joël Robuchon, and Quince.`
      ),
      'en-gb': buildEnEditorial('rosé wines',
        `The referenced rosé wines come primarily from Provence and the south of France. The most frequently featured estates on starred restaurant wine lists are Domaine Tempier (Bandol) and Château d'Esclans (Côtes de Provence).\n\nThese exceptional rosé wines are featured on the wine lists of starred restaurants such as La Prieuré, The Dorchester, Odette, Beaumanière, The Fat Duck, Geranium, L'Atelier de Joël Robuchon, and Quince.`
      ),
    },
  },
]

async function main() {
  console.log('Fetching categories...')
  const { data: categories, error: catErr } = await supabase
    .from('categories')
    .select('id, slug')

  if (catErr || !categories) {
    console.error('Failed to fetch categories:', catErr?.message)
    process.exit(1)
  }

  console.log(`Found ${categories.length} categories`)

  let updated = 0
  let errors = 0

  for (const entry of editorialData) {
    const cat = categories.find((c) => c.slug === entry.slug)
    if (!cat) {
      console.warn(`Category "${entry.slug}" not found in DB — skipping`)
      continue
    }

    for (const [locale, description] of Object.entries(entry.locales)) {
      // Try update first
      const { data: existing } = await supabase
        .from('category_translations')
        .select('id')
        .eq('category_id', cat.id)
        .eq('locale', locale)
        .single()

      if (existing) {
        const { error } = await supabase
          .from('category_translations')
          .update({ description })
          .eq('id', existing.id)

        if (error) {
          console.error(`  ERROR updating ${entry.slug}/${locale}:`, error.message)
          errors++
        } else {
          console.log(`  Updated ${entry.slug}/${locale}`)
          updated++
        }
      } else {
        console.warn(`  No translation row for ${entry.slug}/${locale} — skipping`)
      }
    }
  }

  console.log(`\nDone: ${updated} updated, ${errors} errors`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
