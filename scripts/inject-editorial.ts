/**
 * Inject FULL verbatim WordPress editorial content into category_translations.
 *
 * Usage:
 *   NEXT_PUBLIC_SUPABASE_URL=<your-url> \
 *   SUPABASE_SERVICE_ROLE_KEY=<your-key> \
 *   npx tsx scripts/inject-editorial.ts
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

// ─── Full verbatim editorial content per category ───

interface EditorialEntry {
  slug: string
  locale: string
  description: string
}

const editorialData: EditorialEntry[] = [
  // ════════════════════════════════════════════
  // WHISKY (FR)
  // ════════════════════════════════════════════
  {
    slug: 'whisky',
    locale: 'fr',
    description: `Bestwine \u2022 Online vous fait découvrir les meilleurs whiskys à la carte des restaurants gastronomiques renommés et récompensés. Des whiskys sélectionnés par les plus grands chefs et sommeliers. Trouvez un excellent whisky au meilleur rapport qualité/prix avec Bestwine \u2022 Online !

## Trouvez les meilleurs whiskys

Découvrez des whiskys sélectionnés par les chefs et sommeliers des restaurants gastronomiques étoilés. Une sélection par des professionnels crédibles et légitimes pour vous permettre de trouver votre whisky préféré.

## Achetez les meilleurs whiskys

Nous vous guidons vers les offres commerciales et promotionnelles les plus intéressantes en ligne. Vous pouvez acheter les meilleurs whiskys en toute confiance grâce à un référentiel fiable et impartial.

## Le meilleur whisky par Bestwine \u2022 Online

Le whisky ou whiskey est le nom générique d'un ensemble d'eaux-de-vie fabriquées par distillation de céréales maltées ou non maltées. Le whisky serait d'origine écossaise ou irlandaise selon la légende. Les origines du whisky varient selon les sources. Le whisky a ensuite été exporté vers le Nouveau Monde (notamment aux États-Unis et au Canada). Depuis le début du XXe siècle, des distilleries se sont développées au Japon, puis dans le reste du monde plus récemment. Le whisky est donc une boisson dont la production est mondiale.

Que l'on soit simple amateur ou expert en whisky, il peut être judicieux de s'inspirer des professionnels les plus légitimes pour obtenir des suggestions et propositions de whiskys.

Bestwine \u2022 Online pour permettre au plus grand nombre de trouver et d'acheter les meilleurs whiskys c'est donc posé la question suivante. Comment distinguer les meilleurs whiskys ? Cette interrogation ne possède pas de réponse exacte. En effet, il s'avère impossible de désigner une référence de whisky comme étant la meilleure.

Pour définir les valeurs sûres en matière de whiskys, il est judicieux de se demander « qui sont les professionnels les plus légitimes et fiables pour sélectionner les meilleurs whiskys ? ». La réponse à cette question est simple. Il s'agit des chefs et sommeliers des restaurants gastronomiques les plus prestigieux.

Bestwine \u2022 Online met en lumière l'excellence de la gastronomie internationale en partageant aux consommateurs la carte des vins et donc les whiskys des restaurants gastronomiques connus et reconnus.

## Le meilleur whisky à la carte des restaurants gastronomiques

C'est au sein d'enseignes de la restauration connues et reconnues comme références en matière de goût et de qualité pour les mets et boissons alcoolisées qu'opèrent les chefs et sommeliers. Au sein de ces enseignes, se côtoient les professionnels les plus expérimentés, les plus talentueux et les plus exigeants. La carte des vins, le bar et la cave d'un restaurant gastronomique est donc une vitrine du standing de l'enseigne.

Les restaurants gastronomiques sont donc logiquement susceptibles de proposer sur leur carte des vins les whiskys d'exception.

## Le meilleur whisky selon les chefs et sommeliers

Au sein d'un restaurant gastronomique, un chef se doit de proposer les menus et plats les plus créatifs et les plus qualitatifs. Certains grands chefs cuisinent notamment avec du whisky. Pour leur part, les sommeliers se doivent de proposer les vins et spiritueux les plus adaptés en fonction des mets servis.

Ensemble, les chefs et sommeliers des restaurants gastronomiques se concertent pour enrichir leur carte des vins avec les whiskys les plus qualitatifs. Formant une équipe complémentaire, les chefs et sommeliers sont en quête perpétuelle pour découvrir de nouvelles bouteilles aussi originales soient elles.

## Les meilleurs whiskys à la table des restaurants gastronomiques étoilés

Le prestige de la restauration gastronomique se juge par ce qui est servi dans l'assiette et dans le verre. L'attribution des étoiles par Le Guide Michelin repose sur des critères identiques afin de garantir la cohérence de la sélection des meilleurs restaurants.

Les étoiles du Guide Michelin peuvent permettre de classer la carte des vins des restaurants :
- 3 étoiles indiquent qu'il s'agit « d'une cuisine, de vins et whiskys remarquables qui valent le voyage ».
- 2 étoiles désignent « une table, de vins et whiskys excellents qui méritent un détour ».
- 1 étoile signale « une très bonne table et de très bons vins et whiskys dans sa catégorie ».

## Pour un bon whisky pas cher !

Je suis un amateur de whisky et je ne me définirais jamais comme un expert de cette boisson alcoolisée. Je ne me positionne aucunement comme conseiller. Je laisse la place pour cela à l'expertise des chefs et sommeliers gastronomiques qui sont en mesure de suggérer, proposer et sélectionner des whiskys haut de gamme. Pour ma part, j'aime tout simplement déguster un bon whisky à prix abordable.

Personnellement, j'ai pu goûter les meilleurs whiskys lorsque je me suis fait conseiller par un sommelier dans des restaurants gastronomiques. C'est pour cela que j'ai créé Bestwine \u2022 Online.

Gwendal, créateur de Bestwine \u2022 Online… Et amateur de bon whisky.`,
  },

  // ════════════════════════════════════════════
  // CHAMPAGNE (FR)
  // ════════════════════════════════════════════
  {
    slug: 'champagne',
    locale: 'fr',
    description: `Bestwine \u2022 Online vous fait découvrir les meilleurs champagnes à la carte des restaurants gastronomiques renommés et récompensés. Des champagnes sélectionnés par les plus grands chefs et sommeliers. Trouvez un excellent champagne au meilleur rapport qualité/prix avec Bestwine \u2022 Online !

## Trouvez les meilleurs champagnes

Découvrez des champagnes sélectionnés par les chefs et sommeliers des restaurants gastronomiques étoilés. Une sélection par des professionnels crédibles et légitimes pour vous permettre de trouver votre champagne préféré.

## Achetez les meilleurs champagnes

Nous vous guidons vers les offres commerciales et promotionnelles les plus intéressantes en ligne. Vous pouvez acheter les meilleurs champagnes en toute confiance grâce à un référentiel fiable et impartial.

## Le meilleur champagne par Bestwine \u2022 Online

Le champagne est un vin effervescent français protégé par une appellation d'origine contrôlée (AOC). Sa production suit un processus rigoureux en plusieurs étapes essentielles qui confèrent au champagne son caractère unique et ses bulles fines.

## La production du champagne

La production du champagne suit un processus ancestral en plusieurs étapes :
- **Les vendanges** : la récolte des raisins, principalement Chardonnay, Pinot Noir et Pinot Meunier.
- **Le pressurage** : l'extraction délicate du jus des raisins récoltés.
- **La fermentation** : la transformation du moût en vin de base.
- **La mise en bouteille** : l'ajout de la liqueur de tirage pour la prise de mousse.
- **La maturation** : le vieillissement sur lattes en cave pendant plusieurs mois voire plusieurs années.
- **Le dégorgement** : l'expulsion du dépôt de levures accumulé dans le col de la bouteille.
- **Le dosage** : l'ajout de la liqueur d'expédition qui détermine le style du champagne (brut, extra-brut, demi-sec).

## Comment déguster le champagne

Le champagne se déguste idéalement dans une flûte, à une température comprise entre 6 et 8°C. L'appréciation du champagne passe par l'ouverture maîtrisée de la bouteille, le service délicat, la découverte des arômes et une consommation modérée.

Parmi les maisons les plus référencées dans les restaurants étoilés : Krug, Salon, Dom Pérignon, Louis Roederer, Bollinger, Jacques Selosse, Egly-Ouriet et Billecart-Salmon.

## Le meilleur champagne selon les chefs et sommeliers

Au sein d'un restaurant gastronomique, le champagne occupe une place de choix. Les sommeliers sélectionnent les cuvées les plus prestigieuses pour accompagner les mets les plus raffinés. Les chefs et sommeliers des restaurants gastronomiques se concertent pour enrichir leur carte des vins avec les champagnes les plus qualitatifs.

Bestwine \u2022 Online met en lumière l'excellence de la gastronomie internationale en partageant aux consommateurs la carte des vins et donc les champagnes des restaurants gastronomiques connus et reconnus.

Gwendal, créateur de Bestwine \u2022 Online… Et amateur de bon champagne.`,
  },

  // ════════════════════════════════════════════
  // COGNAC (FR)
  // ════════════════════════════════════════════
  {
    slug: 'cognac',
    locale: 'fr',
    description: `Bestwine \u2022 Online vous fait découvrir les meilleurs cognacs à la carte des restaurants gastronomiques renommés et récompensés. Des cognacs sélectionnés par les plus grands chefs et sommeliers. Trouvez un excellent cognac au meilleur rapport qualité/prix avec Bestwine \u2022 Online !

## Trouvez les meilleurs cognacs

Découvrez des cognacs sélectionnés par les chefs et sommeliers des restaurants gastronomiques étoilés. Une sélection par des professionnels crédibles et légitimes pour vous permettre de trouver votre cognac préféré.

## Achetez les meilleurs cognacs

Nous vous guidons vers les offres commerciales et promotionnelles les plus intéressantes en ligne. Vous pouvez acheter les meilleurs cognacs en toute confiance grâce à un référentiel fiable et impartial.

## Le meilleur cognac par Bestwine \u2022 Online

Le cognac est une eau-de-vie de vin protégée par une Appellation d'Origine Contrôlée (AOC). Sa production est exclusivement réalisée en France, dans la région délimitée de la Charente et de la Charente-Maritime, avec des portions limitrophes de la Dordogne et des Deux-Sèvres. L'UNESCO a reconnu le savoir-faire artisanal lié à la production du cognac comme patrimoine culturel immatériel.

## La classification des cognacs

La classification des cognacs repose sur la durée de vieillissement en fût de chêne :
- **XO (Extra Old)** : minimum 10 ans de vieillissement en fût de chêne. Les cognacs XO offrent une complexité aromatique exceptionnelle.
- **VSOP (Very Superior Old Pale)** : minimum 5 ans de vieillissement en fût de chêne. Les cognacs VSOP présentent un bel équilibre entre puissance et finesse.
- **VS (Very Special)** : minimum 2 ans de vieillissement en fût de chêne. Les cognacs VS sont les plus jeunes et les plus vifs.

## Les crus de cognac

Les crus de cognac sont hiérarchisés selon la qualité de leur terroir :
- **Grande Champagne** : le cru le plus prestigieux, produisant les eaux-de-vie les plus fines et les plus aptes au vieillissement.
- **Petite Champagne** : des eaux-de-vie proches de la Grande Champagne, avec une grande finesse.
- **Fine Champagne** : assemblage de Grande et Petite Champagne, avec au minimum 50% de Grande Champagne.
- **Borderies** : le plus petit cru, produisant des eaux-de-vie rondes et parfumées.
- **Fins Bois** : le cru le plus étendu, avec des eaux-de-vie fruités qui vieillissent rapidement.
- **Bons Bois** : des eaux-de-vie plus rustiques, utilisées principalement en assemblage.

## Le meilleur cognac selon les chefs et sommeliers

Les cognacs les plus référencés dans les restaurants étoilés sont Hennessy XO, Martell XO, Courvoisier XO et Frapin XO, présents dans les caves de restaurants comme Beaumanière, The Dorchester, Core by Clare Smyth et The Fat Duck.

Bestwine \u2022 Online met en lumière l'excellence de la gastronomie internationale en partageant aux consommateurs la carte des vins et donc les cognacs des restaurants gastronomiques connus et reconnus.

Gwendal, créateur de Bestwine \u2022 Online… Et amateur de bon cognac.`,
  },

  // ════════════════════════════════════════════
  // RHUM (FR)
  // ════════════════════════════════════════════
  {
    slug: 'rhum',
    locale: 'fr',
    description: `Bestwine \u2022 Online vous fait découvrir les meilleurs rhums à la carte des restaurants gastronomiques renommés et récompensés. Des rhums sélectionnés par les plus grands chefs et sommeliers. Trouvez un excellent rhum au meilleur rapport qualité/prix avec Bestwine \u2022 Online !

## Trouvez les meilleurs rhums

Découvrez des rhums sélectionnés par les chefs et sommeliers des restaurants gastronomiques étoilés. Une sélection par des professionnels crédibles et légitimes pour vous permettre de trouver votre rhum préféré.

## Achetez les meilleurs rhums

Nous vous guidons vers les offres commerciales et promotionnelles les plus intéressantes en ligne. Vous pouvez acheter les meilleurs rhums en toute confiance grâce à un référentiel fiable et impartial.

## Le meilleur rhum par Bestwine \u2022 Online

Le rhum est une eau-de-vie produite à partir de la canne à sucre. Le monde du rhum est riche et diversifié, avec des catégories allant du rhum blanc au rhum ambré, du rhum vieux au rhum agricole, en passant par le rhum arrangé. Les origines géographiques sont tout aussi variées : Cuba, Martinique, Jamaïque, Guatemala, Trinidad & Tobago, Guadeloupe et bien d'autres territoires tropicaux.

## Les différents types de rhum

Le rhum se décline en plusieurs catégories distinctes :
- **Rhum blanc** : non vieilli ou vieilli brièvement, idéal pour les cocktails et la mixologie.
- **Rhum ambré** : vieilli quelques mois en fût, offrant une palette aromatique intermédiaire.
- **Rhum vieux** : vieilli plusieurs années en fût de chêne, développant des arômes complexes de vanille, de bois et d'épices.
- **Rhum agricole** : produit à partir du vesou (jus de canne frais fermenté), offrant des notes herbacées et florales distinctives.
- **Rhum traditionnel** : produit à partir de mélasse, le sous-produit de la production de sucre.
- **Rhum arrangé** : rhum dans lequel ont macéré des fruits, des épices ou des plantes aromatiques.

## Le meilleur rhum selon les chefs et sommeliers

Les rhums les plus référencés dans les restaurants étoilés sont le Rhum Zacapa (Guatemala), le Rhum J.M. Cuvée 1845 (Martinique) et le Rhum Caroni (Trinidad & Tobago), présents dans les caves de restaurants comme Clos des Sens, Beaumanière et The Dorchester.

Bestwine \u2022 Online met en lumière l'excellence de la gastronomie internationale en partageant aux consommateurs la carte des vins et donc les rhums des restaurants gastronomiques connus et reconnus.

Gwendal, créateur de Bestwine \u2022 Online… Et amateur de bon rhum.`,
  },

  // ════════════════════════════════════════════
  // GIN (FR)
  // ════════════════════════════════════════════
  {
    slug: 'gin',
    locale: 'fr',
    description: `Bestwine \u2022 Online vous fait découvrir les meilleurs gins à la carte des restaurants gastronomiques renommés et récompensés. Des gins sélectionnés par les plus grands chefs et sommeliers. Trouvez un excellent gin au meilleur rapport qualité/prix avec Bestwine \u2022 Online !

## Trouvez les meilleurs gins

Découvrez des gins sélectionnés par les chefs et sommeliers des restaurants gastronomiques étoilés. Une sélection par des professionnels crédibles et légitimes pour vous permettre de trouver votre gin préféré.

## Achetez les meilleurs gins

Nous vous guidons vers les offres commerciales et promotionnelles les plus intéressantes en ligne. Vous pouvez acheter les meilleurs gins en toute confiance grâce à un référentiel fiable et impartial.

## Le meilleur gin par Bestwine \u2022 Online

Le gin trouve ses origines aux Pays-Bas au XVIIe siècle. À l'origine, le genièvre (jenever en néerlandais) était une boisson médicinale distillée à base de baies de genévrier. C'est lors des guerres anglo-néerlandaises que les soldats anglais découvrirent cette boisson et la rapportèrent en Angleterre, où elle évolua pour devenir le gin que nous connaissons aujourd'hui.

## Genièvre vs London Dry Gin

La distinction entre le genièvre et le London Dry Gin est fondamentale dans l'histoire du gin :
- **Le genièvre** (jenever) est le style originel néerlandais et belge, à base de malt de céréales redistillé avec des baies de genévrier. Il possède une texture plus riche et maltée.
- **Le London Dry Gin** est le style britannique moderne, plus sec et plus léger, où les botaniques (genévrier, coriandre, angélique, agrumes) sont distillées avec un alcool neutre de grain. Aucun sucre ni arôme artificiel n'est ajouté après distillation.

Aujourd'hui, le gin est principalement servi en apéritif sous forme de cocktails (gin tonic) dans les restaurants gastronomiques. Il est rarement servi pur, mais peut être utilisé occasionnellement comme digestif ou en cuisine pour des sauces.

## Le meilleur gin selon les chefs et sommeliers

Les gins les plus référencés dans les restaurants étoilés sont Tanqueray Ten (Écosse), Hendrick's (Écosse), Monkey 47 (Allemagne) et Bombay Sapphire (Angleterre), présents dans les caves de restaurants comme Clos des Sens, Yannick Alléno, Beaumanière, Core by Clare Smyth et The Dorchester.

Bestwine \u2022 Online met en lumière l'excellence de la gastronomie internationale en partageant aux consommateurs la carte des vins et donc les gins des restaurants gastronomiques connus et reconnus.

Gwendal, créateur de Bestwine \u2022 Online… Et amateur de bon gin.`,
  },

  // ════════════════════════════════════════════
  // VODKA (FR)
  // ════════════════════════════════════════════
  {
    slug: 'vodka',
    locale: 'fr',
    description: `Bestwine \u2022 Online vous fait découvrir les meilleures vodkas à la carte des restaurants gastronomiques renommés et récompensés. Des vodkas sélectionnées par les plus grands chefs et sommeliers. Trouvez une excellente vodka au meilleur rapport qualité/prix avec Bestwine \u2022 Online !

## Trouvez les meilleures vodkas

Découvrez des vodkas sélectionnées par les chefs et sommeliers des restaurants gastronomiques étoilés. Une sélection par des professionnels crédibles et légitimes pour vous permettre de trouver votre vodka préférée.

## Achetez les meilleures vodkas

Nous vous guidons vers les offres commerciales et promotionnelles les plus intéressantes en ligne. Vous pouvez acheter les meilleures vodkas en toute confiance grâce à un référentiel fiable et impartial.

## La meilleure vodka par Bestwine \u2022 Online

La vodka est une eau-de-vie incolore et généralement inodore, obtenue par distillation de céréales (blé, seigle) ou de pommes de terre. Originaire d'Europe de l'Est (Pologne et Russie se disputent sa paternité), la vodka est devenue l'un des spiritueux les plus consommés au monde. Sa pureté et sa neutralité en font une base idéale pour les cocktails, mais les vodkas premium se dégustent également pures, glacées.

## Les meilleures vodkas selon les chefs et sommeliers

Les vodkas les plus référencées dans les restaurants étoilés sont Grey Goose (France), Stolichnaya Elit (Russie), Belvédère (Pologne) et Absolut (Suède). D'autres marques notables incluent Beluga Noble, Wyborowa Exquisite, Haku et Snow Léopard.

Bestwine \u2022 Online s'engage à référencer les meilleures vodkas et à vous guider vers les offres commerciales en ligne les plus attractives pour que vous puissiez les acheter au meilleur prix.

Bestwine \u2022 Online met en lumière l'excellence de la gastronomie internationale en partageant aux consommateurs la carte des vins et donc les vodkas des restaurants gastronomiques connus et reconnus.

Gwendal, créateur de Bestwine \u2022 Online… Et amateur de bonne vodka.`,
  },

  // ════════════════════════════════════════════
  // VIN ROUGE (FR)
  // ════════════════════════════════════════════
  {
    slug: 'vin-rouge',
    locale: 'fr',
    description: `Bestwine \u2022 Online vous fait découvrir les meilleurs vins rouges à la carte des restaurants gastronomiques renommés et récompensés. Des vins rouges sélectionnés par les plus grands chefs et sommeliers. Trouvez un excellent vin rouge au meilleur rapport qualité/prix avec Bestwine \u2022 Online !

## Trouvez les meilleurs vins rouges

Découvrez des vins rouges sélectionnés par les chefs et sommeliers des restaurants gastronomiques étoilés. Une sélection par des professionnels crédibles et légitimes pour vous permettre de trouver votre vin rouge préféré.

## Achetez les meilleurs vins rouges

Nous vous guidons vers les offres commerciales et promotionnelles les plus intéressantes en ligne. Vous pouvez acheter les meilleurs vins rouges en toute confiance grâce à un référentiel fiable et impartial.

## Le meilleur vin rouge par Bestwine \u2022 Online

Les vins rouges référencés proviennent des plus grands terroirs : Bordeaux, Bourgogne, Vallée du Rhône, mais aussi d'Italie, d'Espagne et du Nouveau Monde. Chaque référence a été identifiée sur les cartes des restaurants étoilés Michelin les plus prestigieux, de Clos des Sens à The Fat Duck.

Que l'on soit simple amateur ou expert en vin rouge, il peut être judicieux de s'inspirer des professionnels les plus légitimes pour obtenir des suggestions et propositions de vins rouges d'exception.

## Les meilleurs vins rouges à la carte des restaurants gastronomiques

C'est au sein d'enseignes de la restauration connues et reconnues comme références en matière de goût et de qualité que les sommeliers composent des cartes des vins exceptionnelles. Les vins rouges y occupent une place centrale, avec des appellations prestigieuses telles que Pomerol, Saint-Émilion, Pauillac, Gevrey-Chambertin, Châteauneuf-du-Pape et Barolo.

Les restaurants gastronomiques étoilés sont les vitrines des meilleurs vins rouges du monde, sélectionnés avec soin par des sommeliers passionnés et exigeants.

## Le meilleur vin rouge selon les chefs et sommeliers

Au sein d'un restaurant gastronomique, le vin rouge est l'accompagnement par excellence des mets les plus raffinés. Les sommeliers sélectionnent des crus d'exception pour sublimer chaque plat. Des domaines comme Romanée-Conti, Pétrus, Château Margaux, Sassicaia et Opus One figurent parmi les références les plus prisées.

Bestwine \u2022 Online met en lumière l'excellence de la gastronomie internationale en partageant aux consommateurs la carte des vins et donc les vins rouges des restaurants gastronomiques connus et reconnus.

Gwendal, créateur de Bestwine \u2022 Online… Et amateur de bon vin rouge.`,
  },

  // ════════════════════════════════════════════
  // VIN BLANC (FR)
  // ════════════════════════════════════════════
  {
    slug: 'vin-blanc',
    locale: 'fr',
    description: `Bestwine \u2022 Online vous fait découvrir les meilleurs vins blancs à la carte des restaurants gastronomiques renommés et récompensés. Des vins blancs sélectionnés par les plus grands chefs et sommeliers. Trouvez un excellent vin blanc au meilleur rapport qualité/prix avec Bestwine \u2022 Online !

## Trouvez les meilleurs vins blancs

Découvrez des vins blancs sélectionnés par les chefs et sommeliers des restaurants gastronomiques étoilés. Une sélection par des professionnels crédibles et légitimes pour vous permettre de trouver votre vin blanc préféré.

## Achetez les meilleurs vins blancs

Nous vous guidons vers les offres commerciales et promotionnelles les plus intéressantes en ligne. Vous pouvez acheter les meilleurs vins blancs en toute confiance grâce à un référentiel fiable et impartial.

## Le meilleur vin blanc par Bestwine \u2022 Online

Les vins blancs référencés proviennent des plus beaux terroirs de France et du monde : Savoie, Alsace, Bourgogne, Bordeaux, Vallée du Rhône, Provence, mais aussi d'Italie et d'ailleurs. Les domaines les plus présents incluent Domaine Weinbach, Domaine Robert Denogent, Domaine Etienne Sauzet et Château de Fargues.

## Notre sélection mensuelle de vins blancs

Chaque mois, Bestwine \u2022 Online met en avant une sélection de vins blancs d'exception identifiés sur les cartes des restaurants gastronomiques étoilés. Cette sélection mensuelle permet de découvrir de nouvelles références et de suivre les tendances de la sommellerie gastronomique.

Les vins blancs sélectionnés couvrent une large palette de styles : des blancs secs et minéraux de Chablis aux grands crus de Meursault, des Rieslings alsaciens aux Sauternes liquoreux, en passant par les blancs italiens et les Sauvignon Blanc du Nouveau Monde.

## Le meilleur vin blanc selon les chefs et sommeliers

Ces vins blancs d'exception sont présents sur les cartes de restaurants étoilés tels que Clos des Sens, Beaumanière, La Bouitte, La Prieuré et Caprice. Les sommeliers de ces établissements prestigieux sélectionnent les cuvées les plus remarquables pour accompagner les créations culinaires de leurs chefs.

Bestwine \u2022 Online met en lumière l'excellence de la gastronomie internationale en partageant aux consommateurs la carte des vins et donc les vins blancs des restaurants gastronomiques connus et reconnus.

Gwendal, créateur de Bestwine \u2022 Online… Et amateur de bon vin blanc.`,
  },

  // ════════════════════════════════════════════
  // VIN ROSE (FR)
  // ════════════════════════════════════════════
  {
    slug: 'vin-rose',
    locale: 'fr',
    description: `Bestwine \u2022 Online vous fait découvrir les meilleurs vins rosés à la carte des restaurants gastronomiques renommés et récompensés. Des vins rosés sélectionnés par les plus grands chefs et sommeliers. Trouvez un excellent vin rosé au meilleur rapport qualité/prix avec Bestwine \u2022 Online !

## Trouvez les meilleurs vins rosés

Découvrez des vins rosés sélectionnés par les chefs et sommeliers des restaurants gastronomiques étoilés. Une sélection par des professionnels crédibles et légitimes pour vous permettre de trouver votre vin rosé préféré.

## Achetez les meilleurs vins rosés

Nous vous guidons vers les offres commerciales et promotionnelles les plus intéressantes en ligne. Vous pouvez acheter les meilleurs vins rosés en toute confiance grâce à un référentiel fiable et impartial.

## Le meilleur vin rosé par Bestwine \u2022 Online

Les vins rosés référencés proviennent principalement de Provence et du sud de la France. Les vins rosés ont longtemps été considérés comme des vins d'été sans prétention, mais les domaines d'exception ont prouvé que le rosé pouvait atteindre des sommets de qualité et de complexité.

## Domaine Tempier

Le **Domaine Tempier** (Bandol) est l'un des domaines les plus emblématiques du rosé de prestige. Situé dans l'appellation Bandol en Provence, le Domaine Tempier produit des rosés de caractère à base de Mourvèdre, offrant une structure et une complexité rarement atteintes pour un vin rosé. Ses cuvées sont régulièrement présentes sur les cartes des plus grands restaurants étoilés.

## Château d'Esclans

Le **Château d'Esclans** (Côtes de Provence) a révolutionné le monde du rosé premium avec ses cuvées emblématiques. Situé au cœur de la Provence, le domaine produit des rosés d'une élégance remarquable, dont le célèbre Whispering Angel et le Garrus, considéré comme l'un des rosés les plus chers et les plus prestigieux au monde.

## Le meilleur vin rosé selon les chefs et sommeliers

Ces vins rosés d'exception sont présents sur les cartes de restaurants étoilés tels que La Prieuré, The Dorchester, Odette, Beaumanière, The Fat Duck, Geranium, L'Atelier de Joël Robuchon et Quince. Les sommeliers de ces établissements sélectionnent les rosés les plus raffinés pour accompagner les mets les plus délicats.

Bestwine \u2022 Online met en lumière l'excellence de la gastronomie internationale en partageant aux consommateurs la carte des vins et donc les vins rosés des restaurants gastronomiques connus et reconnus.

Gwendal, créateur de Bestwine \u2022 Online… Et amateur de bon vin rosé.`,
  },

  // ════════════════════════════════════════════
  // SCOTCH (FR)
  // ════════════════════════════════════════════
  {
    slug: 'scotch',
    locale: 'fr',
    description: `Bestwine \u2022 Online vous fait découvrir les meilleurs scotchs à la carte des restaurants gastronomiques renommés et récompensés. Des scotchs sélectionnés par les plus grands chefs et sommeliers. Trouvez un excellent scotch au meilleur rapport qualité/prix avec Bestwine \u2022 Online !

## Trouvez les meilleurs scotchs

Découvrez des scotchs sélectionnés par les chefs et sommeliers des restaurants gastronomiques étoilés. Une sélection par des professionnels crédibles et légitimes pour vous permettre de trouver votre scotch préféré.

## Achetez les meilleurs scotchs

Nous vous guidons vers les offres commerciales et promotionnelles les plus intéressantes en ligne. Vous pouvez acheter les meilleurs scotchs en toute confiance grâce à un référentiel fiable et impartial.

## Le meilleur scotch par Bestwine \u2022 Online

L'Écosse est une terre de whisky avec des traces historiques remontant à 1494, date à laquelle le moine John Cor a reçu une commande royale pour distiller de l'aqua vitae. Depuis cette époque, le whisky écossais est devenu l'un des spiritueux les plus respectés et les plus exportés au monde.

## L'industrie du scotch whisky

L'industrie du whisky écossais est un pilier économique majeur. Plus de 10 000 personnes sont directement employées dans l'industrie du whisky écossais, et des dizaines de milliers d'autres emplois indirects en dépendent. L'Écosse compte plus de 130 distilleries actives réparties dans cinq grandes régions de production : les Highlands, le Speyside, Islay, les Lowlands et les îles (Islands).

Chaque région produit des whiskys au caractère distinct :
- **Highlands** : une grande diversité de styles, des whiskys doux et fruités aux expressions tourbées et maritimes.
- **Speyside** : la région la plus concentrée en distilleries, produisant des whiskys élégants, fruités et souvent miellés.
- **Islay** : réputée pour ses whiskys intensément tourbés, fumés et iodés.
- **Lowlands** : des whiskys légers, floraux et délicats, souvent triple-distillés.
- **Islands** : des whiskys maritimes avec une influence saline et des notes de tourbe variable.

## Le meilleur scotch selon les chefs et sommeliers

Les scotchs les plus référencés dans les restaurants étoilés sont Talisker (Skye), Macallan Fine Oak (Speyside), Glenkichie (Lowlands) et Johnnie Walker Gold Label (Highland). Ces références d'exception sont présentes dans les caves des plus grands restaurants gastronomiques du monde.

Bestwine \u2022 Online met en lumière l'excellence de la gastronomie internationale en partageant aux consommateurs la carte des vins et donc les scotchs des restaurants gastronomiques connus et reconnus.

Gwendal, créateur de Bestwine \u2022 Online… Et amateur de bon scotch.`,
  },

  // ════════════════════════════════════════════
  // BOURBON (FR)
  // ════════════════════════════════════════════
  {
    slug: 'bourbon',
    locale: 'fr',
    description: `Bestwine \u2022 Online vous fait découvrir les meilleurs bourbons à la carte des restaurants gastronomiques renommés et récompensés. Des bourbons sélectionnés par les plus grands chefs et sommeliers. Trouvez un excellent bourbon au meilleur rapport qualité/prix avec Bestwine \u2022 Online !

## Trouvez les meilleurs bourbons

Découvrez des bourbons sélectionnés par les chefs et sommeliers des restaurants gastronomiques étoilés. Une sélection par des professionnels crédibles et légitimes pour vous permettre de trouver votre bourbon préféré.

## Achetez les meilleurs bourbons

Nous vous guidons vers les offres commerciales et promotionnelles les plus intéressantes en ligne. Vous pouvez acheter les meilleurs bourbons en toute confiance grâce à un référentiel fiable et impartial.

## Le meilleur bourbon par Bestwine \u2022 Online

Le bourbon tire son nom du comté de Bourbon dans le Kentucky, où sa production a débuté vers les années 1730. Le bourbon est le whisky américain par excellence, ancré dans l'histoire et la culture des États-Unis. Pour être qualifié de bourbon, un whisky doit respecter des règles strictes définies par la loi fédérale américaine.

## La définition du bourbon

Le bourbon répond à des critères précis :
- **Composition** : un minimum de 51% de maïs (corn) dans le mash bill, le reste étant généralement du seigle, du blé ou de l'orge maltée.
- **Vieillissement** : vieilli exclusivement en fûts de chêne neufs carbonisés (charred new oak barrels), ce qui lui confère ses arômes caractéristiques de vanille, de caramel et de bois grillé.
- **Distillation** : distillé à un taux d'alcool inférieur à 80% volume.
- **Mise en fût** : entré en fût à un taux ne dépassant pas 62,5% volume.
- **Embouteillage** : embouteillé à un minimum de 40% volume (80 proof).

## Comment déguster le bourbon

Le bourbon se déguste de multiples façons : pur (neat), avec quelques gouttes d'eau, sur glace (on the rocks), ou en cocktails classiques comme le Old Fashioned, le Manhattan ou le Mint Julep. Les bourbons premium et single barrel se savourent idéalement purs ou avec un trait d'eau pour libérer leurs arômes complexes.

## Le meilleur bourbon selon les chefs et sommeliers

Les bourbons référencés dans les restaurants étoilés incluent Elijah Craig, Blanton's, Buffalo Trace, Four Roses, Jim Beam, Knob Creek, Maker's Mark, Woodford Reserve et Wild Turkey. Ces références sont sélectionnées par les sommeliers les plus exigeants pour enrichir la carte des spiritueux de leurs établissements.

Bestwine \u2022 Online met en lumière l'excellence de la gastronomie internationale en partageant aux consommateurs la carte des vins et donc les bourbons des restaurants gastronomiques connus et reconnus.

Gwendal, créateur de Bestwine \u2022 Online… Et amateur de bon bourbon.`,
  },

  // ════════════════════════════════════════════
  // RHUM MARTINIQUAIS (FR)
  // ════════════════════════════════════════════
  {
    slug: 'rhum-martiniquais',
    locale: 'fr',
    description: `Bestwine \u2022 Online vous fait découvrir les meilleurs rhums martiniquais à la carte des restaurants gastronomiques renommés et récompensés. Des rhums martiniquais sélectionnés par les plus grands chefs et sommeliers. Trouvez un excellent rhum martiniquais au meilleur rapport qualité/prix avec Bestwine \u2022 Online !

## Trouvez les meilleurs rhums martiniquais

Découvrez des rhums martiniquais sélectionnés par les chefs et sommeliers des restaurants gastronomiques étoilés. Une sélection par des professionnels crédibles et légitimes pour vous permettre de trouver votre rhum martiniquais préféré.

## Achetez les meilleurs rhums martiniquais

Nous vous guidons vers les offres commerciales et promotionnelles les plus intéressantes en ligne. Vous pouvez acheter les meilleurs rhums martiniquais en toute confiance grâce à un référentiel fiable et impartial.

## Le meilleur rhum martiniquais par Bestwine \u2022 Online

La Martinique occupe une place unique dans le monde du rhum. L'île produit 85% de rhum agricole, ce qui en fait le premier producteur mondial de ce type de rhum d'exception. Le rhum martiniquais bénéficie depuis 1996 du label AOC (Appellation d'Origine Contrôlée) Martinique, une distinction rare pour un spiritueux et la seule AOC pour le rhum au monde.

## Le rhum agricole et le vesou

La distinction fondamentale du rhum martiniquais réside dans sa matière première. Contrairement au rhum traditionnel produit à partir de mélasse (sous-produit de la fabrication du sucre), le rhum agricole est distillé à partir du vesou, le jus frais de canne à sucre obtenu par broyage. Le vesou confère au rhum agricole ses arômes distinctifs : des notes herbacées, florales et fruitées qui reflètent le terroir martiniquais.

L'AOC Martinique impose des règles strictes : les variétés de canne autorisées, les zones de production, les méthodes de distillation en colonne créole, et les conditions de vieillissement. Cette rigueur garantit l'authenticité et la qualité exceptionnelle du rhum martiniquais.

## Les grandes marques de rhum martiniquais

Les marques majeures de rhum martiniquais incluent Clément, Saint-James, Neisson, Depaz, La Mauny, Trois Rivières et Duquesne. Chaque distillerie apporte sa signature unique, influencée par son terroir, ses méthodes de distillation et ses conditions de vieillissement.

## Le meilleur rhum martiniquais selon les chefs et sommeliers

Les rhums les plus référencés dans les restaurants étoilés sont Rivière Bel'Air La Favorite, JM Cuvée 1845 et Neisson Bio. Ces rhums d'exception sont sélectionnés par les sommeliers les plus exigeants pour enrichir la carte des spiritueux de leurs établissements gastronomiques.

Bestwine \u2022 Online met en lumière l'excellence de la gastronomie internationale en partageant aux consommateurs la carte des vins et donc les rhums martiniquais des restaurants gastronomiques connus et reconnus.

Gwendal, créateur de Bestwine \u2022 Online… Et amateur de bon rhum martiniquais.`,
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
  let skipped = 0
  let errors = 0

  for (const entry of editorialData) {
    const cat = categories.find((c) => c.slug === entry.slug)
    if (!cat) {
      console.warn(`Category "${entry.slug}" not found in DB -- skipping`)
      skipped++
      continue
    }

    // Try update
    const { data: existing } = await supabase
      .from('category_translations')
      .select('id')
      .eq('category_id', cat.id)
      .eq('locale', entry.locale)
      .single()

    if (existing) {
      const { error } = await supabase
        .from('category_translations')
        .update({ description: entry.description })
        .eq('id', existing.id)

      if (error) {
        console.error(`  ERROR updating ${entry.slug}/${entry.locale}:`, error.message)
        errors++
      } else {
        const wordCount = entry.description.split(/\s+/).length
        console.log(`  Updated ${entry.slug}/${entry.locale} (${wordCount} words)`)
        updated++
      }
    } else {
      console.warn(`  No translation row for ${entry.slug}/${entry.locale} -- skipping`)
      skipped++
    }
  }

  console.log(`\nDone: ${updated} updated, ${skipped} skipped, ${errors} errors`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
