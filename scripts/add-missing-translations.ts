/**
 * Adds missing locale translations for categories, restaurants, and drinks.
 * Uses FR translation as base and translates name/meta fields for each locale.
 *
 * Usage: npx tsx scripts/add-missing-translations.ts
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

// Load .env.local manually (no dotenv dependency)
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const envPath = resolve(__dirname, '..', '.env.local')
try {
  const envContent = readFileSync(envPath, 'utf8')
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx)
    const val = trimmed.slice(eqIdx + 1)
    if (!process.env[key]) process.env[key] = val
  }
} catch {
  // .env.local not found — rely on existing env vars
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tmwxushartfhwgawixqz.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!SUPABASE_KEY) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY in environment. Set it in .env.local or export it.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const ALL_LOCALES = ['fr', 'en-us', 'en-gb', 'es', 'de', 'it', 'pt', 'zh', 'ja', 'ru', 'ar'] as const
type Locale = typeof ALL_LOCALES[number]

// ── Static translation map for category names ──
// We translate the slug-based product name (not the full SEO title) into each locale.
// This avoids needing an external translation API.

const LOCALE_LABELS: Record<Locale, { best: string; at: string; gastronomic: string; starred: string; buy: string; selected: string; chefs: string; sommeliers: string }> = {
  'fr':    { best: 'Meilleur', at: 'à la carte des', gastronomic: 'restaurants gastronomiques', starred: 'étoilés', buy: 'acheter', selected: 'sélectionnés par les', chefs: 'chefs', sommeliers: 'sommeliers' },
  'en-us': { best: 'Best', at: 'on the menu of', gastronomic: 'fine dining restaurants', starred: 'Michelin-starred', buy: 'buy', selected: 'selected by', chefs: 'chefs', sommeliers: 'sommeliers' },
  'en-gb': { best: 'Best', at: 'on the menu of', gastronomic: 'fine dining restaurants', starred: 'Michelin-starred', buy: 'buy', selected: 'selected by', chefs: 'chefs', sommeliers: 'sommeliers' },
  'es':    { best: 'Mejor', at: 'en la carta de los', gastronomic: 'restaurantes gastronómicos', starred: 'con estrellas', buy: 'comprar', selected: 'seleccionados por los', chefs: 'chefs', sommeliers: 'sommeliers' },
  'de':    { best: 'Bester', at: 'auf der Karte der', gastronomic: 'Gourmet-Restaurants', starred: 'Sterne-Restaurants', buy: 'kaufen', selected: 'ausgewählt von', chefs: 'Köchen', sommeliers: 'Sommeliers' },
  'it':    { best: 'Migliore', at: 'nel menu dei', gastronomic: 'ristoranti gastronomici', starred: 'stellati', buy: 'acquistare', selected: 'selezionati dai', chefs: 'chef', sommeliers: 'sommelier' },
  'pt':    { best: 'Melhor', at: 'no cardápio dos', gastronomic: 'restaurantes gastronômicos', starred: 'estrelados', buy: 'comprar', selected: 'selecionados pelos', chefs: 'chefs', sommeliers: 'sommeliers' },
  'zh':    { best: '最佳', at: '在', gastronomic: '美食餐厅', starred: '星级', buy: '购买', selected: '精选自', chefs: '主厨', sommeliers: '侍酒师' },
  'ja':    { best: '最高の', at: '', gastronomic: '高級レストラン', starred: '星付き', buy: '購入', selected: 'が厳選した', chefs: 'シェフ', sommeliers: 'ソムリエ' },
  'ru':    { best: 'Лучший', at: 'в меню', gastronomic: 'гастрономических ресторанов', starred: 'звёздных', buy: 'купить', selected: 'отобранные', chefs: 'шеф-поварами', sommeliers: 'сомелье' },
  'ar':    { best: 'أفضل', at: 'في قائمة', gastronomic: 'المطاعم الفاخرة', starred: 'الحائزة على نجوم', buy: 'شراء', selected: 'مختارة من قبل', chefs: 'الطهاة', sommeliers: 'الساقي' },
}

// Drink/product name translations (slug → locale → translated name)
const SLUG_TRANSLATIONS: Record<string, Record<string, string>> = {
  'champagne':       { de: 'Champagner', it: 'Champagne', pt: 'Champanhe', zh: '香槟', ja: 'シャンパン', ru: 'Шампанское', ar: 'شمبانيا' },
  'vin-rouge':       { de: 'Rotwein', it: 'Vino rosso', pt: 'Vinho tinto', zh: '红葡萄酒', ja: '赤ワイン', ru: 'Красное вино', ar: 'نبيذ أحمر' },
  'vin-blanc':       { de: 'Weißwein', it: 'Vino bianco', pt: 'Vinho branco', zh: '白葡萄酒', ja: '白ワイン', ru: 'Белое вино', ar: 'نبيذ أبيض' },
  'vin-rose':        { de: 'Roséwein', it: 'Vino rosato', pt: 'Vinho rosé', zh: '桃红葡萄酒', ja: 'ロゼワイン', ru: 'Розовое вино', ar: 'نبيذ وردي' },
  'whisky':          { de: 'Whisky', it: 'Whisky', pt: 'Whisky', zh: '威士忌', ja: 'ウイスキー', ru: 'Виски', ar: 'ويسكي' },
  'cognac':          { de: 'Cognac', it: 'Cognac', pt: 'Conhaque', zh: '干邑', ja: 'コニャック', ru: 'Коньяк', ar: 'كونياك' },
  'rhum':            { de: 'Rum', it: 'Rum', pt: 'Rum', zh: '朗姆酒', ja: 'ラム', ru: 'Ром', ar: 'رم' },
  'gin':             { de: 'Gin', it: 'Gin', pt: 'Gin', zh: '杜松子酒', ja: 'ジン', ru: 'Джин', ar: 'جن' },
  'vodka':           { de: 'Wodka', it: 'Vodka', pt: 'Vodka', zh: '伏特加', ja: 'ウォッカ', ru: 'Водка', ar: 'فودكا' },
  'tequila':         { de: 'Tequila', it: 'Tequila', pt: 'Tequila', zh: '龙舌兰', ja: 'テキーラ', ru: 'Текила', ar: 'تكيلا' },
  'sake':            { de: 'Sake', it: 'Sake', pt: 'Saquê', zh: '清酒', ja: '日本酒', ru: 'Саке', ar: 'ساكي' },
  'biere':           { de: 'Bier', it: 'Birra', pt: 'Cerveja', zh: '啤酒', ja: 'ビール', ru: 'Пиво', ar: 'بيرة' },
  'cidre':           { de: 'Apfelwein', it: 'Sidro', pt: 'Cidra', zh: '苹果酒', ja: 'シードル', ru: 'Сидр', ar: 'سيدر' },
  'prosecco':        { de: 'Prosecco', it: 'Prosecco', pt: 'Prosecco', zh: '普罗塞克', ja: 'プロセッコ', ru: 'Просекко', ar: 'بروسيكو' },
  'cremant':         { de: 'Crémant', it: 'Crémant', pt: 'Crémant', zh: '克雷芒', ja: 'クレマン', ru: 'Креман', ar: 'كريمان' },
  'porto':           { de: 'Portwein', it: 'Porto', pt: 'Vinho do Porto', zh: '波特酒', ja: 'ポートワイン', ru: 'Портвейн', ar: 'بورتو' },
  'armagnac':        { de: 'Armagnac', it: 'Armagnac', pt: 'Armagnac', zh: '雅马邑', ja: 'アルマニャック', ru: 'Арманьяк', ar: 'أرمانياك' },
  'calvados':        { de: 'Calvados', it: 'Calvados', pt: 'Calvados', zh: '卡尔瓦多斯', ja: 'カルヴァドス', ru: 'Кальвадос', ar: 'كالفادوس' },
  'mezcal':          { de: 'Mezcal', it: 'Mezcal', pt: 'Mezcal', zh: '梅斯卡尔', ja: 'メスカル', ru: 'Мескаль', ar: 'ميزكال' },
  'pastis':          { de: 'Pastis', it: 'Pastis', pt: 'Pastis', zh: '茴香酒', ja: 'パスティス', ru: 'Пастис', ar: 'باستيس' },
  'vermouth':        { de: 'Wermut', it: 'Vermouth', pt: 'Vermute', zh: '味美思', ja: 'ベルモット', ru: 'Вермут', ar: 'فيرموت' },
  'liqueurs':        { de: 'Likör', it: 'Liquori', pt: 'Licor', zh: '利口酒', ja: 'リキュール', ru: 'Ликёр', ar: 'ليكيور' },
  'liqueur':         { de: 'Likör', it: 'Liquore', pt: 'Licor', zh: '利口酒', ja: 'リキュール', ru: 'Ликёр', ar: 'ليكيور' },
  'grappa':          { de: 'Grappa', it: 'Grappa', pt: 'Grappa', zh: '格拉巴', ja: 'グラッパ', ru: 'Граппа', ar: 'غرابا' },
  'brandy':          { de: 'Brandy', it: 'Brandy', pt: 'Brandy', zh: '白兰地', ja: 'ブランデー', ru: 'Бренди', ar: 'براندي' },
  'eau-de-vie':      { de: 'Obstbrand', it: 'Acquavite', pt: 'Aguardente', zh: '生命之水', ja: 'オー・ド・ヴィ', ru: 'О-де-ви', ar: 'ماء الحياة' },
  'bourbon':         { de: 'Bourbon', it: 'Bourbon', pt: 'Bourbon', zh: '波本威士忌', ja: 'バーボン', ru: 'Бурбон', ar: 'بوربون' },
  'scotch':          { de: 'Scotch', it: 'Scotch', pt: 'Scotch', zh: '苏格兰威士忌', ja: 'スコッチ', ru: 'Скотч', ar: 'سكوتش' },
  'scotch-whisky':   { de: 'Scotch Whisky', it: 'Scotch Whisky', pt: 'Scotch Whisky', zh: '苏格兰威士忌', ja: 'スコッチウイスキー', ru: 'Скотч виски', ar: 'سكوتش ويسكي' },
  'vin-jaune':       { de: 'Vin Jaune', it: 'Vino giallo', pt: 'Vinho amarelo', zh: '黄葡萄酒', ja: 'ヴァン・ジョーヌ', ru: 'Жёлтое вино', ar: 'نبيذ أصفر' },
  'vin-orange':      { de: 'Orangewein', it: 'Vino arancione', pt: 'Vinho laranja', zh: '橙葡萄酒', ja: 'オレンジワイン', ru: 'Оранжевое вино', ar: 'نبيذ برتقالي' },
  'bitter':          { de: 'Bitter', it: 'Bitter', pt: 'Bitter', zh: '苦味酒', ja: 'ビター', ru: 'Биттер', ar: 'بيتر' },
  'digestif':        { de: 'Digestif', it: 'Digestivo', pt: 'Digestivo', zh: '消化酒', ja: 'ディジェスティフ', ru: 'Дижестив', ar: 'هضمي' },
  'cava':            { de: 'Cava', it: 'Cava', pt: 'Cava', zh: '卡瓦', ja: 'カバ', ru: 'Кава', ar: 'كافا' },
  'sambuca':         { de: 'Sambuca', it: 'Sambuca', pt: 'Sambuca', zh: '三布卡', ja: 'サンブーカ', ru: 'Самбука', ar: 'سامبوكا' },
  'amaretto':        { de: 'Amaretto', it: 'Amaretto', pt: 'Amaretto', zh: '杏仁酒', ja: 'アマレット', ru: 'Амаретто', ar: 'أماريتو' },
  'aquavit':         { de: 'Aquavit', it: 'Acquavite', pt: 'Aquavit', zh: '阿夸维特', ja: 'アクアビット', ru: 'Аквавит', ar: 'أكوافيت' },
  'chartreuse':      { de: 'Chartreuse', it: 'Chartreuse', pt: 'Chartreuse', zh: '查特酒', ja: 'シャルトリューズ', ru: 'Шартрёз', ar: 'شارتروز' },
  'ouzo':            { de: 'Ouzo', it: 'Ouzo', pt: 'Ouzo', zh: '乌佐酒', ja: 'ウーゾ', ru: 'Узо', ar: 'أوزو' },
  'marsala':         { de: 'Marsala', it: 'Marsala', pt: 'Marsala', zh: '马沙拉', ja: 'マルサラ', ru: 'Марсала', ar: 'مارسالا' },
  'pisco':           { de: 'Pisco', it: 'Pisco', pt: 'Pisco', zh: '皮斯科', ja: 'ピスコ', ru: 'Писко', ar: 'بيسكو' },
  'cachaca':         { de: 'Cachaça', it: 'Cachaça', pt: 'Cachaça', zh: '卡夏萨', ja: 'カシャッサ', ru: 'Кашаса', ar: 'كاشاسا' },
  'kirsch':          { de: 'Kirschwasser', it: 'Kirsch', pt: 'Kirsch', zh: '樱桃白兰地', ja: 'キルシュ', ru: 'Кирш', ar: 'كيرش' },
  'schnaps':         { de: 'Schnaps', it: 'Schnaps', pt: 'Schnaps', zh: '烈酒', ja: 'シュナップス', ru: 'Шнапс', ar: 'شنابس' },
  'arak':            { de: 'Arak', it: 'Arak', pt: 'Arak', zh: '亚力酒', ja: 'アラック', ru: 'Арак', ar: 'عرق' },
  'raki':            { de: 'Raki', it: 'Raki', pt: 'Raki', zh: '拉基酒', ja: 'ラク', ru: 'Раки', ar: 'عرق' },
  'hydromel':        { de: 'Met', it: 'Idromele', pt: 'Hidromel', zh: '蜂蜜酒', ja: '蜂蜜酒', ru: 'Медовуха', ar: 'شراب العسل' },
  'chouchen':        { de: 'Chouchen', it: 'Chouchen', pt: 'Chouchen', zh: '舒甜酒', ja: 'シュシェン', ru: 'Шушен', ar: 'شوشن' },
  'mousseux':        { de: 'Schaumwein', it: 'Spumante', pt: 'Espumante', zh: '起泡酒', ja: 'スパークリングワイン', ru: 'Игристое вино', ar: 'نبيذ فوار' },
}

function getProductName(slug: string, locale: Locale): string {
  // If we have a direct translation, use it
  if (SLUG_TRANSLATIONS[slug]?.[locale]) {
    return SLUG_TRANSLATIONS[slug][locale]
  }
  // For sub-categories or unknown slugs, capitalize the slug
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function generateMetaTitle(productName: string, locale: Locale): string {
  const l = LOCALE_LABELS[locale]
  switch (locale) {
    case 'fr':    return `${l.best} ${productName} ${l.at} ${l.gastronomic} !`
    case 'zh':    return `${l.starred}${l.gastronomic}的${l.best}${productName}`
    case 'ja':    return `${l.starred}${l.gastronomic}の${l.best}${productName}`
    case 'ar':    return `${l.best} ${productName} ${l.at} ${l.gastronomic} ${l.starred}`
    default:      return `${l.best} ${productName} ${l.at} ${l.starred} ${l.gastronomic}`
  }
}

function generateMetaDescription(productName: string, locale: Locale): string {
  const l = LOCALE_LABELS[locale]
  switch (locale) {
    case 'fr':    return `${l.best}s ${productName.toLowerCase()} ${l.selected} ${l.chefs} et ${l.sommeliers} ${l.at} ${l.gastronomic} ${l.starred} !`
    case 'zh':    return `由${l.starred}${l.gastronomic}的${l.chefs}和${l.sommeliers}${l.selected}的${l.best}${productName}`
    case 'ja':    return `${l.starred}${l.gastronomic}の${l.chefs}と${l.sommeliers}${l.selected}${l.best}${productName}`
    case 'ar':    return `${l.best} ${productName} ${l.selected} ${l.chefs} و${l.sommeliers} ${l.at} ${l.gastronomic} ${l.starred}`
    default:      return `${l.best} ${productName.toLowerCase()} ${l.selected} ${l.chefs} and ${l.sommeliers} ${l.at} ${l.starred} ${l.gastronomic}`
  }
}

function generateCategoryName(productName: string, locale: Locale): string {
  const l = LOCALE_LABELS[locale]
  switch (locale) {
    case 'fr':    return `Liste des meilleurs ${productName.toLowerCase()} ${l.at} ${l.gastronomic} ${l.starred}`
    case 'zh':    return `${l.starred}${l.gastronomic}的${l.best}${productName}列表`
    case 'ja':    return `${l.starred}${l.gastronomic}の${l.best}${productName}リスト`
    case 'ar':    return `قائمة ${l.best} ${productName} ${l.at} ${l.gastronomic} ${l.starred}`
    case 'de':    return `Liste der besten ${productName} ${l.at} ${l.starred}`
    case 'it':    return `Lista dei migliori ${productName.toLowerCase()} ${l.at} ${l.gastronomic} ${l.starred}`
    case 'pt':    return `Lista dos melhores ${productName.toLowerCase()} ${l.at} ${l.gastronomic} ${l.starred}`
    case 'es':    return `Lista de los mejores ${productName.toLowerCase()} ${l.at} ${l.gastronomic} ${l.starred}`
    default:      return `Best ${productName} ${l.at} ${l.starred} ${l.gastronomic}`
  }
}

// ── Restaurant meta generation ──

function generateRestaurantMetaTitle(restaurantName: string, locale: Locale): string {
  switch (locale) {
    case 'fr':    return `Restaurant ${restaurantName} - Carte des vins et spiritueux`
    case 'en-us': case 'en-gb': return `${restaurantName} Restaurant - Wine and spirits list`
    case 'es':    return `Restaurante ${restaurantName} - Carta de vinos y licores`
    case 'de':    return `Restaurant ${restaurantName} - Wein- und Spirituosenkarte`
    case 'it':    return `Ristorante ${restaurantName} - Carta dei vini e liquori`
    case 'pt':    return `Restaurante ${restaurantName} - Carta de vinhos e destilados`
    case 'zh':    return `${restaurantName}餐厅 - 葡萄酒和烈酒菜单`
    case 'ja':    return `${restaurantName}レストラン - ワイン・スピリッツリスト`
    case 'ru':    return `Ресторан ${restaurantName} - Винная и коктейльная карта`
    case 'ar':    return `مطعم ${restaurantName} - قائمة النبيذ والمشروبات`
    default:      return `${restaurantName} - Wine list`
  }
}

function generateRestaurantMetaDesc(restaurantName: string, locale: Locale): string {
  switch (locale) {
    case 'fr':    return `Découvrez la carte des vins et spiritueux du restaurant ${restaurantName}. Sélection de grands crus et spiritueux d'exception.`
    case 'en-us': case 'en-gb': return `Discover the wine and spirits list of ${restaurantName} restaurant. A selection of fine wines and exceptional spirits.`
    case 'es':    return `Descubra la carta de vinos y licores del restaurante ${restaurantName}. Selección de grandes vinos y licores excepcionales.`
    case 'de':    return `Entdecken Sie die Wein- und Spirituosenkarte des Restaurants ${restaurantName}. Eine Auswahl edler Weine und Spirituosen.`
    case 'it':    return `Scopri la carta dei vini e liquori del ristorante ${restaurantName}. Selezione di grandi vini e liquori eccezionali.`
    case 'pt':    return `Descubra a carta de vinhos e destilados do restaurante ${restaurantName}. Seleção de grandes vinhos e destilados excepcionais.`
    case 'zh':    return `探索${restaurantName}餐厅的葡萄酒和烈酒菜单。精选优质葡萄酒和卓越烈酒。`
    case 'ja':    return `${restaurantName}レストランのワイン・スピリッツリストをご覧ください。厳選されたワインとスピリッツ。`
    case 'ru':    return `Откройте для себя винную карту ресторана ${restaurantName}. Подборка лучших вин и спиртных напитков.`
    case 'ar':    return `اكتشف قائمة النبيذ والمشروبات في مطعم ${restaurantName}. مجموعة مختارة من أفضل النبيذ والمشروبات.`
    default:      return `Wine and spirits list of ${restaurantName}.`
  }
}

// ── Drink meta generation ──

function generateDrinkMetaTitle(drinkName: string, locale: Locale): string {
  switch (locale) {
    case 'fr':    return `${drinkName} - Avis et prix`
    case 'en-us': case 'en-gb': return `${drinkName} - Review and price`
    case 'es':    return `${drinkName} - Opinión y precio`
    case 'de':    return `${drinkName} - Bewertung und Preis`
    case 'it':    return `${drinkName} - Recensione e prezzo`
    case 'pt':    return `${drinkName} - Avaliação e preço`
    case 'zh':    return `${drinkName} - 评价与价格`
    case 'ja':    return `${drinkName} - レビューと価格`
    case 'ru':    return `${drinkName} - Отзыв и цена`
    case 'ar':    return `${drinkName} - مراجعة وسعر`
    default:      return `${drinkName}`
  }
}

function generateDrinkMetaDesc(drinkName: string, locale: Locale): string {
  switch (locale) {
    case 'fr':    return `Découvrez ${drinkName}, sélectionné par les sommeliers des restaurants gastronomiques étoilés. Avis, prix et où le trouver.`
    case 'en-us': case 'en-gb': return `Discover ${drinkName}, selected by sommeliers at Michelin-starred restaurants. Reviews, price and where to find it.`
    case 'es':    return `Descubre ${drinkName}, seleccionado por los sommeliers de restaurantes gastronómicos con estrellas. Opiniones, precio y dónde encontrarlo.`
    case 'de':    return `Entdecken Sie ${drinkName}, ausgewählt von Sommeliers der Sterne-Restaurants. Bewertungen, Preis und Bezugsquellen.`
    case 'it':    return `Scopri ${drinkName}, selezionato dai sommelier dei ristoranti stellati. Recensioni, prezzo e dove trovarlo.`
    case 'pt':    return `Descubra ${drinkName}, selecionado pelos sommeliers dos restaurantes estrelados. Avaliações, preço e onde encontrar.`
    case 'zh':    return `探索${drinkName}，由星级餐厅侍酒师精选。评价、价格及购买渠道。`
    case 'ja':    return `${drinkName}を発見。星付きレストランのソムリエが厳選。レビュー、価格、購入先。`
    case 'ru':    return `Откройте ${drinkName}, отобранный сомелье звёздных ресторанов. Отзывы, цена и где купить.`
    case 'ar':    return `اكتشف ${drinkName}، مختار من قبل ساقي المطاعم الحائزة على نجوم. مراجعات، سعر وأين تجده.`
    default:      return `${drinkName} - selected by top sommeliers.`
  }
}

// ── Main logic ──

async function fetchAll<T>(table: string, select: string): Promise<T[]> {
  const results: T[] = []
  let from = 0
  const pageSize = 1000
  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select(select)
      .range(from, from + pageSize - 1)
    if (error) throw new Error(`Error fetching ${table}: ${error.message}`)
    if (!data || data.length === 0) break
    results.push(...(data as T[]))
    if (data.length < pageSize) break
    from += pageSize
  }
  return results
}

async function addMissingCategoryTranslations() {
  console.log('\n=== CATEGORY TRANSLATIONS ===')

  const categories = await fetchAll<{ id: number; slug: string }>('categories', 'id,slug')
  console.log(`Found ${categories.length} categories`)

  const existingTranslations = await fetchAll<{ category_id: number; locale: string }>('category_translations', 'category_id,locale')

  // Build a set of existing (category_id, locale) pairs
  const existingSet = new Set(existingTranslations.map(t => `${t.category_id}:${t.locale}`))

  const toInsert: Array<{
    category_id: number
    locale: string
    name: string
    meta_title: string
    meta_description: string
  }> = []

  for (const cat of categories) {
    for (const locale of ALL_LOCALES) {
      if (existingSet.has(`${cat.id}:${locale}`)) continue

      const productName = getProductName(cat.slug, locale)
      toInsert.push({
        category_id: cat.id,
        locale,
        name: generateCategoryName(productName, locale),
        meta_title: generateMetaTitle(productName, locale),
        meta_description: generateMetaDescription(productName, locale),
      })
    }
  }

  console.log(`Missing translations to insert: ${toInsert.length}`)

  if (toInsert.length > 0) {
    // Insert in batches of 500
    const batchSize = 500
    let inserted = 0
    for (let i = 0; i < toInsert.length; i += batchSize) {
      const batch = toInsert.slice(i, i + batchSize)
      const { error } = await supabase.from('category_translations').insert(batch)
      if (error) {
        console.error(`Error inserting category batch at ${i}: ${error.message}`)
      } else {
        inserted += batch.length
      }
    }
    console.log(`Inserted ${inserted} category translations`)
  }

  // Summary per locale
  const countPerLocale: Record<string, number> = {}
  for (const row of toInsert) {
    countPerLocale[row.locale] = (countPerLocale[row.locale] || 0) + 1
  }
  console.log('Per locale:', countPerLocale)
}

async function addMissingRestaurantTranslations() {
  console.log('\n=== RESTAURANT TRANSLATIONS ===')

  const restaurants = await fetchAll<{ id: number; name: string }>('restaurants', 'id,name')
  console.log(`Found ${restaurants.length} restaurants`)

  const existingTranslations = await fetchAll<{ restaurant_id: number; locale: string }>('restaurant_translations', 'restaurant_id,locale')
  const existingSet = new Set(existingTranslations.map(t => `${t.restaurant_id}:${t.locale}`))

  const toInsert: Array<{
    restaurant_id: number
    locale: string
    meta_title: string
    meta_description: string
  }> = []

  for (const rest of restaurants) {
    for (const locale of ALL_LOCALES) {
      if (existingSet.has(`${rest.id}:${locale}`)) continue

      toInsert.push({
        restaurant_id: rest.id,
        locale,
        meta_title: generateRestaurantMetaTitle(rest.name, locale),
        meta_description: generateRestaurantMetaDesc(rest.name, locale),
      })
    }
  }

  console.log(`Missing translations to insert: ${toInsert.length}`)

  if (toInsert.length > 0) {
    const batchSize = 500
    let inserted = 0
    for (let i = 0; i < toInsert.length; i += batchSize) {
      const batch = toInsert.slice(i, i + batchSize)
      const { error } = await supabase.from('restaurant_translations').insert(batch)
      if (error) {
        console.error(`Error inserting restaurant batch at ${i}: ${error.message}`)
      } else {
        inserted += batch.length
      }
    }
    console.log(`Inserted ${inserted} restaurant translations`)
  }

  const countPerLocale: Record<string, number> = {}
  for (const row of toInsert) {
    countPerLocale[row.locale] = (countPerLocale[row.locale] || 0) + 1
  }
  console.log('Per locale:', countPerLocale)
}

async function addMissingDrinkTranslations() {
  console.log('\n=== DRINK TRANSLATIONS ===')

  const drinks = await fetchAll<{ id: number; name: string }>('drinks', 'id,name')
  console.log(`Found ${drinks.length} drinks`)

  const existingTranslations = await fetchAll<{ drink_id: number; locale: string }>('drink_translations', 'drink_id,locale')
  const existingSet = new Set(existingTranslations.map(t => `${t.drink_id}:${t.locale}`))

  const toInsert: Array<{
    drink_id: number
    locale: string
    meta_title: string
    meta_description: string
  }> = []

  for (const drink of drinks) {
    for (const locale of ALL_LOCALES) {
      if (existingSet.has(`${drink.id}:${locale}`)) continue

      toInsert.push({
        drink_id: drink.id,
        locale,
        meta_title: generateDrinkMetaTitle(drink.name, locale),
        meta_description: generateDrinkMetaDesc(drink.name, locale),
      })
    }
  }

  console.log(`Missing translations to insert: ${toInsert.length}`)

  if (toInsert.length > 0) {
    const batchSize = 500
    let inserted = 0
    for (let i = 0; i < toInsert.length; i += batchSize) {
      const batch = toInsert.slice(i, i + batchSize)
      const { error } = await supabase.from('drink_translations').insert(batch)
      if (error) {
        console.error(`Error inserting drink batch at ${i}: ${error.message}`)
      } else {
        inserted += batch.length
      }
    }
    console.log(`Inserted ${inserted} drink translations`)
  }

  const countPerLocale: Record<string, number> = {}
  for (const row of toInsert) {
    countPerLocale[row.locale] = (countPerLocale[row.locale] || 0) + 1
  }
  console.log('Per locale:', countPerLocale)
}

async function main() {
  console.log('Starting translation migration...')
  console.log(`Target locales: ${ALL_LOCALES.join(', ')}`)

  await addMissingCategoryTranslations()
  await addMissingRestaurantTranslations()
  await addMissingDrinkTranslations()

  console.log('\n=== DONE ===')
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
