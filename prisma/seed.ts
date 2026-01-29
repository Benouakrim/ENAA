import dotenv from 'dotenv';
import path from 'path';
import { PrismaNeonHttp } from '@prisma/adapter-neon';
import { PrismaClient, ServiceCategory, PriceRange } from "@prisma/client";

// Load .env.local for Next.js projects
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
// Also try .env as fallback
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set in environment variables');
}

// For Prisma 7 with Neon HTTP, pass the connection string and empty options
const adapter = new PrismaNeonHttp(connectionString, {});
const prisma = new PrismaClient({ adapter });

// =====================
// HELPER DATA
// =====================

const regions = [
  "Île-de-France",
  "Provence-Alpes-Côte d'Azur",
  "Auvergne-Rhône-Alpes",
  "Nouvelle-Aquitaine",
  "Occitanie",
  "Bretagne",
  "Hauts-de-France",
  "Grand Est",
  "Normandie",
  "Pays de la Loire",
];

const cities: Record<string, string[]> = {
  "Île-de-France": ["Paris", "Versailles", "Fontainebleau", "Saint-Denis"],
  "Provence-Alpes-Côte d'Azur": ["Marseille", "Nice", "Cannes", "Aix-en-Provence"],
  "Auvergne-Rhône-Alpes": ["Lyon", "Grenoble", "Annecy", "Chambéry"],
  "Nouvelle-Aquitaine": ["Bordeaux", "Biarritz", "La Rochelle", "Arcachon"],
  "Occitanie": ["Toulouse", "Montpellier", "Perpignan", "Nîmes"],
  "Bretagne": ["Rennes", "Saint-Malo", "Brest", "Vannes"],
  "Hauts-de-France": ["Lille", "Amiens", "Dunkerque", "Arras"],
  "Grand Est": ["Strasbourg", "Metz", "Nancy", "Reims"],
  "Normandie": ["Rouen", "Caen", "Deauville", "Le Havre"],
  "Pays de la Loire": ["Nantes", "Angers", "Le Mans", "La Baule"],
};

const eventTypes = [
  "Mariage",
  "Anniversaire",
  "Corporatif",
  "Soirée Privée",
  "Baptême/Communion",
  "Remise de diplômes",
  "Baby Shower",
  "Fiançailles",
];

const styles = [
  "Bohème",
  "Champêtre",
  "Moderne",
  "Luxe",
  "Minimaliste",
  "Romantique",
  "Vintage",
  "Tropical",
  "Classique",
  "Industriel",
];

// =====================
// HELPER FUNCTIONS
// =====================

function getRandomItems<T>(array: T[], min: number, max: number): T[] {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function getRandomPrice(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function getPriceRange(price: number): PriceRange {
  if (price < 500) return "BUDGET";
  if (price < 1500) return "STANDARD";
  if (price < 4000) return "PREMIUM";
  return "LUXE";
}

function generatePhone(): string {
  return `+33 ${getRandomPrice(1, 9)} ${getRandomPrice(10, 99)} ${getRandomPrice(10, 99)} ${getRandomPrice(10, 99)} ${getRandomPrice(10, 99)}`;
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z]/g, "").substring(0, 15);
}

function generateAvailabilityDates(serviceId: string): Array<{ serviceId: string; date: Date; available: boolean }> {
  const dates: Array<{ serviceId: string; date: Date; available: boolean }> = [];
  const today = new Date();
  
  // Reduced to 14 days to speed up seeding (Neon HTTP doesn't support createMany)
  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    // 70% chance of being available
    dates.push({
      serviceId,
      date,
      available: Math.random() > 0.3,
    });
  }
  return dates;
}

// =====================
// SERVICE DATA BY CATEGORY
// =====================

const venueData = [
  { title: "Château de Versailles - Orangerie", description: "Magnifique orangerie au cœur des jardins de Versailles. Un cadre royal pour vos événements les plus prestigieux avec vue sur les jardins à la française.", metadata: { venueType: "Château", capacity: 300, amenities: ["Parking", "Jardin", "Cuisine équipée", "PMR"] } },
  { title: "Domaine des Cèdres", description: "Élégant domaine provençal entouré de cèdres centenaires. Parfait pour les mariages champêtres dans le sud de la France.", metadata: { venueType: "Domaine", capacity: 200, amenities: ["Parking", "Jardin", "Piscine", "Hébergement"] } },
  { title: "La Villa Ephrussi de Rothschild", description: "Villa de rêve sur la Côte d'Azur avec jardins thématiques. Un lieu d'exception entre Nice et Monaco.", metadata: { venueType: "Villa", capacity: 150, amenities: ["Jardin", "Vue mer", "Terrasse"] } },
  { title: "Le Moulin de la Galette", description: "Moulin historique au cœur de Montmartre. Ambiance bohème parisienne garantie pour vos soirées.", metadata: { venueType: "Restaurant", capacity: 80, amenities: ["Cuisine", "Terrasse", "WiFi"] } },
  { title: "Château de Chantilly", description: "Château majestueux au nord de Paris avec ses écuries et son parc. Idéal pour des mariages grandioses.", metadata: { venueType: "Château", capacity: 400, amenities: ["Parking", "Jardin", "Hébergement", "PMR"] } },
  { title: "La Ferme du Grand Chemin", description: "Ferme rénovée en Normandie avec poutres apparentes et charme rustique. Parfait pour les événements authentiques.", metadata: { venueType: "Ferme", capacity: 120, amenities: ["Parking", "Jardin", "Cuisine équipée"] } },
  { title: "Rooftop Parisian Sky", description: "Vue panoramique sur Paris et la Tour Eiffel. Le spot urbain par excellence pour des soirées mémorables.", metadata: { venueType: "Rooftop", capacity: 100, amenities: ["Vue panoramique", "Bar", "Climatisation"] } },
  { title: "Hôtel Negresco - Salon Royal", description: "Le mythique palace de la Promenade des Anglais. Luxe et raffinement à la française.", metadata: { venueType: "Hôtel", capacity: 250, amenities: ["Parking", "Restaurant", "Hébergement", "PMR"] } },
  { title: "Manoir de la Bretèche", description: "Manoir breton avec vue sur l'océan. Alliance parfaite entre tradition et nature sauvage.", metadata: { venueType: "Manoir", capacity: 180, amenities: ["Parking", "Jardin", "Vue mer"] } },
  { title: "Salle des Fêtes Belle Époque", description: "Grande salle Art Déco entièrement rénovée. Capacité importante pour les grands événements.", metadata: { venueType: "Salle des fêtes", capacity: 500, amenities: ["Parking", "Cuisine", "PMR", "Climatisation"] } },
  { title: "Villa Médicis Lyon", description: "Demeure de charme avec jardin italien au cœur de Lyon. Atmosphère intimiste garantie.", metadata: { venueType: "Villa", capacity: 100, amenities: ["Jardin", "Parking", "Cuisine"] } },
  { title: "Château de Chambord - Salle des Gardes", description: "Dans le plus grand château de la Loire. Un décor Renaissance pour des événements royaux.", metadata: { venueType: "Château", capacity: 350, amenities: ["Parking", "Jardin", "Visite guidée"] } },
  { title: "Domaine Saint-Paul de Mausole", description: "Ancien monastère en Provence où Van Gogh a séjourné. Lieu artistique et paisible.", metadata: { venueType: "Domaine", capacity: 150, amenities: ["Jardin", "Parking", "Chapelle"] } },
  { title: "La Grande Maison Bordeaux", description: "Maison de maître au cœur des vignobles bordelais. Gastronomie et œnologie au programme.", metadata: { venueType: "Villa", capacity: 80, amenities: ["Cave à vin", "Cuisine", "Jardin"] } },
  { title: "Hôtel du Palais Biarritz", description: "Palais impérial face à l'océan Atlantique. Luxe et élégance basque.", metadata: { venueType: "Hôtel", capacity: 300, amenities: ["Vue mer", "Spa", "Restaurant", "Parking"] } },
  { title: "Ferme de Gally", description: "Corps de ferme authentique aux portes de Paris. Esprit campagne à deux pas de la ville.", metadata: { venueType: "Ferme", capacity: 200, amenities: ["Parking", "Jardin", "Animaux"] } },
  { title: "Rooftop Marseille Vieux Port", description: "Terrasse avec vue imprenable sur le Vieux Port et Notre-Dame de la Garde.", metadata: { venueType: "Rooftop", capacity: 120, amenities: ["Vue panoramique", "Bar", "Terrasse"] } },
  { title: "Château Frontenac Toulouse", description: "Château gascon avec parc arboré. Convivialité du Sud-Ouest pour vos célébrations.", metadata: { venueType: "Château", capacity: 250, amenities: ["Parking", "Jardin", "Hébergement"] } },
  { title: "L'Orangerie du Parc de Bagatelle", description: "Écrin de verdure au cœur du Bois de Boulogne. Romance parisienne assurée.", metadata: { venueType: "Domaine", capacity: 150, amenities: ["Jardin", "Parking", "Terrasse"] } },
  { title: "Domaine de la Côte d'Opale", description: "Domaine avec vue sur la mer du Nord. Charme nordique et grandes espaces.", metadata: { venueType: "Domaine", capacity: 180, amenities: ["Parking", "Jardin", "Vue mer", "Hébergement"] } },
];

const catererData = [
  { title: "Maison Lenôtre", description: "Traiteur de prestige depuis 1957. Gastronomie française d'excellence pour vos événements les plus raffinés.", metadata: { cuisineTypes: ["Française", "Gastronomique"], services: ["Buffet", "Service à table", "Cocktail"], minGuests: 30, maxGuests: 500 } },
  { title: "Potel et Chabot", description: "L'art de recevoir à la française. Créations culinaires sur-mesure pour mariages et réceptions.", metadata: { cuisineTypes: ["Française", "Fusion"], services: ["Service à table", "Cocktail"], minGuests: 50, maxGuests: 400 } },
  { title: "Les Délices d'Orient", description: "Spécialiste de la cuisine orientale et méditerranéenne. Mezzés, tajines et pâtisseries maison.", metadata: { cuisineTypes: ["Orientale", "Méditerranéenne"], services: ["Buffet", "Service à table"], minGuests: 20, maxGuests: 300 } },
  { title: "La Table de Provence", description: "Saveurs du Sud avec produits locaux et de saison. Cuisine provençale authentique.", metadata: { cuisineTypes: ["Provençale", "Méditerranéenne"], services: ["Buffet", "Service à table", "Food truck"], minGuests: 15, maxGuests: 200 } },
  { title: "Traiteur Bio Nature", description: "100% bio et local. Cuisine créative respectueuse de l'environnement.", metadata: { cuisineTypes: ["Bio", "Végétarienne"], services: ["Buffet", "Cocktail"], minGuests: 10, maxGuests: 150 } },
  { title: "Asian Fusion Events", description: "Voyage culinaire entre Asie et Europe. Sushis, dim sum et plats fusion.", metadata: { cuisineTypes: ["Asiatique", "Fusion"], services: ["Buffet", "Live cooking"], minGuests: 20, maxGuests: 250 } },
  { title: "Le Comptoir Italien", description: "Antipasti, pasta et dolce vita. La vraie cuisine italienne pour vos fêtes.", metadata: { cuisineTypes: ["Italienne"], services: ["Buffet", "Service à table"], minGuests: 20, maxGuests: 200 } },
  { title: "Gastronome & Co", description: "Cuisine gastronomique moderne. Menu dégustation et accords mets-vins.", metadata: { cuisineTypes: ["Gastronomique", "Française"], services: ["Service à table"], minGuests: 30, maxGuests: 100 } },
  { title: "Street Food Factory", description: "Food trucks et stands gourmands. Cuisine de rue revisitée pour événements décontractés.", metadata: { cuisineTypes: ["Street food", "International"], services: ["Food truck", "Stands"], minGuests: 50, maxGuests: 500 } },
  { title: "Végétal Gourmet", description: "Traiteur 100% végétarien et végan. Prouver que le végétal peut être festif.", metadata: { cuisineTypes: ["Végétarienne", "Végan"], services: ["Buffet", "Cocktail"], minGuests: 15, maxGuests: 200 } },
  { title: "Mer & Terroir", description: "Spécialiste fruits de mer et produits du terroir. Du plateau royal aux huîtres minute.", metadata: { cuisineTypes: ["Fruits de mer", "Terroir"], services: ["Buffet", "Bar à huîtres"], minGuests: 20, maxGuests: 300 } },
  { title: "La Maison du Couscous", description: "Couscous royal, méchoui et pâtisseries orientales. Générosité et authenticité.", metadata: { cuisineTypes: ["Orientale", "Marocaine"], services: ["Buffet", "Service à table"], minGuests: 30, maxGuests: 400 } },
  { title: "Buffet Express Pro", description: "Service traiteur efficace et abordable pour entreprises et particuliers.", metadata: { cuisineTypes: ["Française", "International"], services: ["Buffet", "Cocktail"], minGuests: 10, maxGuests: 500 } },
  { title: "Chef à Domicile Paris", description: "Expérience gastronomique à domicile. Votre chef privé pour la soirée.", metadata: { cuisineTypes: ["Gastronomique", "Sur-mesure"], services: ["Chef à domicile"], minGuests: 6, maxGuests: 30 } },
  { title: "Les Saveurs du Monde", description: "Tour du monde culinaire. Du Mexique au Japon en passant par l'Inde.", metadata: { cuisineTypes: ["International", "Fusion"], services: ["Buffet", "Stands"], minGuests: 30, maxGuests: 400 } },
  { title: "Bouchées Doubles", description: "Finger food créatif et élégant. Parfait pour cocktails et vernissages.", metadata: { cuisineTypes: ["Finger food", "Créative"], services: ["Cocktail", "Buffet"], minGuests: 20, maxGuests: 200 } },
  { title: "Traiteur des Halles", description: "Produits frais des Halles. Cuisine traditionnelle française généreuse.", metadata: { cuisineTypes: ["Française", "Traditionnelle"], services: ["Buffet", "Service à table"], minGuests: 25, maxGuests: 300 } },
  { title: "Le Petit Chef Bordelais", description: "Cuisine du Sud-Ouest et vins de Bordeaux. Foie gras, canard et convivialité.", metadata: { cuisineTypes: ["Sud-Ouest", "Française"], services: ["Service à table", "Buffet"], minGuests: 20, maxGuests: 150 } },
  { title: "Sushi & Events", description: "Bar à sushi pour vos événements. Préparation live par nos sushi masters.", metadata: { cuisineTypes: ["Japonaise", "Asiatique"], services: ["Live cooking", "Buffet"], minGuests: 15, maxGuests: 200 } },
  { title: "BBQ Master Traiteur", description: "Spécialiste du barbecue américain. Ribs, pulled pork et ambiance conviviale.", metadata: { cuisineTypes: ["BBQ", "Américaine"], services: ["Food truck", "Buffet"], minGuests: 30, maxGuests: 300 } },
];

const photographerData = [
  { title: "Studio Lumière Paris", description: "Photographe de mariage haut de gamme. Style documentaire et émotionnel pour capturer l'essence de votre jour J.", metadata: { style: ["Reportage", "Artistique"], packages: ["Demi-journée", "Journée complète", "Week-end"] } },
  { title: "Art Photo Events", description: "Approche artistique et créative. Photos qui racontent votre histoire avec élégance.", metadata: { style: ["Artistique", "Fashion"], packages: ["Journée complète", "Prénuptial inclus"] } },
  { title: "Objectif Émotion", description: "Spécialiste des moments spontanés. Reportage authentique et naturel.", metadata: { style: ["Reportage", "Lifestyle"], packages: ["2 heures", "Demi-journée", "Journée complète"] } },
  { title: "Flash & Style", description: "Photographie mode et lifestyle pour événements chic. Retouches professionnelles incluses.", metadata: { style: ["Fashion", "Studio"], packages: ["Demi-journée", "Journée complète"] } },
  { title: "Drone Vision Sud", description: "Prises de vue aériennes spectaculaires. Vue d'ensemble unique de votre lieu.", metadata: { style: ["Drone", "Reportage"], packages: ["2 heures", "Demi-journée"] } },
  { title: "Classic Portrait Studio", description: "Portraits classiques et intemporels. L'élégance traditionnelle au service de vos souvenirs.", metadata: { style: ["Classique", "Studio"], packages: ["Demi-journée", "Journée complète"] } },
  { title: "Instant Bohème", description: "Style bohème et naturel. Photos lumineuses en extérieur, couchers de soleil garantis.", metadata: { style: ["Lifestyle", "Artistique"], packages: ["Journée complète", "Prénuptial inclus"] } },
  { title: "Photo Reporter Lyon", description: "Approche journalistique pour mariages et événements. Chaque instant compte.", metadata: { style: ["Reportage"], packages: ["Journée complète", "Week-end"] } },
  { title: "Studio Black & White", description: "Maître du noir et blanc. Portraits artistiques intemporels.", metadata: { style: ["Artistique", "Classique"], packages: ["Demi-journée", "Journée complète"] } },
  { title: "Photographie Fine Art", description: "Tirages d'art et albums premium. Pour ceux qui veulent de vraies œuvres.", metadata: { style: ["Fine Art", "Artistique"], packages: ["Journée complète", "Album premium"] } },
  { title: "Family Shot Pro", description: "Spécialiste photos de famille et groupe. Animations photo pour petits et grands.", metadata: { style: ["Lifestyle", "Studio"], packages: ["2 heures", "Demi-journée"] } },
  { title: "Corporate Images", description: "Photographie événementielle corporate. Qualité pro pour séminaires et conférences.", metadata: { style: ["Corporate", "Reportage"], packages: ["Demi-journée", "Journée complète"] } },
  { title: "Love Stories Photography", description: "Couples et mariages romantiques. Séances engagement et trash the dress.", metadata: { style: ["Romantique", "Lifestyle"], packages: ["Prénuptial inclus", "Journée complète"] } },
  { title: "Studio Polaroid Vintage", description: "Photos instantanées style vintage. Animation originale pour vos invités.", metadata: { style: ["Vintage", "Fun"], packages: ["2 heures", "Soirée"] } },
  { title: "360 Photo Experience", description: "Cabine photo 360° et bullet time. L'expérience photo high-tech.", metadata: { style: ["High-tech", "Fun"], packages: ["2 heures", "Soirée complète"] } },
  { title: "Nature & Event Photo", description: "Mariages en extérieur et nature. Forêts, plages et montagnes.", metadata: { style: ["Nature", "Reportage"], packages: ["Journée complète", "Week-end"] } },
  { title: "Studio Mariage Provence", description: "Photographe provençal. Lumière du sud et décors méditerranéens.", metadata: { style: ["Lifestyle", "Artistique"], packages: ["Journée complète", "Prénuptial inclus"] } },
  { title: "Urban Wedding Shots", description: "Mariages urbains et citadins. Architecture et street style.", metadata: { style: ["Urban", "Street"], packages: ["Demi-journée", "Journée complète"] } },
  { title: "Photographe Évasion", description: "Mariages destination et voyages. Séances photo à l'étranger.", metadata: { style: ["Destination", "Lifestyle"], packages: ["Week-end", "Voyage"] } },
  { title: "Studio Petit Bonheur", description: "Photographe accessible et sympathique. Qualité pro à prix doux.", metadata: { style: ["Reportage", "Lifestyle"], packages: ["2 heures", "Demi-journée", "Journée complète"] } },
];

const djData = [
  { title: "DJ Max Events", description: "DJ professionnel depuis 15 ans. Mix éclectique pour faire danser tous vos invités de 7 à 77 ans.", metadata: { musicStyles: ["Pop", "RnB", "Années 80-90"], equipment: ["Sono professionnelle", "Éclairage LED", "Micro sans fil"] } },
  { title: "Oriental Vibes DJ", description: "Spécialiste musique orientale et mariages mixtes. Du Raï au Chaabi en passant par le Dabké.", metadata: { musicStyles: ["Oriental", "Raï", "Chaabi"], equipment: ["Sono", "Éclairage", "Derbouka"] } },
  { title: "Electro Club Paris", description: "DJ de club pour soirées électro et house. Ambiance Ibiza garantie.", metadata: { musicStyles: ["Électro", "House", "Techno"], equipment: ["Sono professionnelle", "Laser", "Machine à fumée"] } },
  { title: "Latino Heat DJ", description: "Salsa, bachata, reggaeton. Faites chauffer la piste avec les rythmes latinos.", metadata: { musicStyles: ["Latino", "Salsa", "Reggaeton"], equipment: ["Sono", "Éclairage LED"] } },
  { title: "Rétro Music Factory", description: "Spécialiste années 80, 90 et 2000. Nostalgie et tubes qui font lever les bras.", metadata: { musicStyles: ["Années 80-90", "Pop", "Disco"], equipment: ["Sono", "Éclairage rétro"] } },
  { title: "DJ Pop & Hits", description: "Les tubes du moment et les classiques. Playlist personnalisée selon vos goûts.", metadata: { musicStyles: ["Pop", "Hits", "Charts"], equipment: ["Sono professionnelle", "Éclairage LED"] } },
  { title: "Wedding Sound System", description: "Prestation complète mariage. De la cérémonie à la fin de soirée.", metadata: { musicStyles: ["Variété", "Pop", "Classique"], equipment: ["Sono", "Éclairage", "Micro cérémonie"] } },
  { title: "Urban Beat DJ", description: "Hip-hop, RnB et afrobeat. Pour les soirées urbaines et branchées.", metadata: { musicStyles: ["Hip-Hop", "RnB", "Afrobeat"], equipment: ["Sono", "Éclairage LED", "Écrans LED"] } },
  { title: "DJ Rock'n'Roll", description: "Du rock des années 60 au rock actuel. Pour les amateurs de guitares.", metadata: { musicStyles: ["Rock", "Rock'n'Roll", "Pop rock"], equipment: ["Sono puissante", "Éclairage"] } },
  { title: "Sunset Lounge DJ", description: "Ambiance lounge et chill. Parfait pour cocktails et apéros.", metadata: { musicStyles: ["Lounge", "Chill", "Jazz"], equipment: ["Sono", "Éclairage tamisé"] } },
  { title: "DJ Animation Plus", description: "Animation musicale et jeux. Karaoké, quiz musical et défis danse.", metadata: { musicStyles: ["Variété", "Pop", "Kids"], equipment: ["Sono", "Micro", "Karaoké"] } },
  { title: "Sound Pro Events", description: "Ingénieur son professionnel. Qualité audio irréprochable pour tous lieux.", metadata: { musicStyles: ["Tous styles"], equipment: ["Sono haut de gamme", "Mixage live"] } },
  { title: "Mix Master Lyon", description: "DJ lyonnais polyvalent. Du classique au moderne avec professionnalisme.", metadata: { musicStyles: ["Pop", "Électro", "Variété"], equipment: ["Sono", "Éclairage LED"] } },
  { title: "Club Factory DJ", description: "Expérience club à votre événement. Éclairages et effets spectaculaires.", metadata: { musicStyles: ["House", "Électro", "Dance"], equipment: ["Sono club", "Laser", "Machine à fumée", "Écrans LED"] } },
  { title: "DJ Acoustic Live", description: "Mix live avec musiciens. Saxophone, percussions et DJ pour plus d'émotion.", metadata: { musicStyles: ["Jazz", "Soul", "Pop"], equipment: ["Sono", "Instruments live"] } },
  { title: "Kids Party DJ", description: "Animation musicale pour enfants. Jeux, danses et hits pour les petits.", metadata: { musicStyles: ["Kids", "Disney", "Pop enfant"], equipment: ["Sono adaptée", "Micro", "Accessoires fun"] } },
  { title: "Corporate Sound DJ", description: "DJ pour événements corporate. Discret et professionnel.", metadata: { musicStyles: ["Lounge", "Jazz", "Pop soft"], equipment: ["Sono discrète", "Éclairage soft"] } },
  { title: "Multicultural Beats", description: "Musiques du monde entier. Parfait pour mariages internationaux.", metadata: { musicStyles: ["World", "Oriental", "Latino", "Afro"], equipment: ["Sono", "Éclairage LED"] } },
  { title: "DJ Premium Select", description: "Service VIP et discret. Les plus grandes soirées privées.", metadata: { musicStyles: ["House", "Lounge", "Hits"], equipment: ["Sono premium", "Éclairage design"] } },
  { title: "Beach Party Sound", description: "Ambiance plage et summer vibes. House, tropical et soleil.", metadata: { musicStyles: ["Tropical", "House", "Reggae"], equipment: ["Sono étanche", "Éclairage LED"] } },
];

const decoratorData = [
  { title: "L'Atelier Déco Luxe", description: "Scénographie haut de gamme pour événements d'exception. Du concept à la réalisation.", metadata: { styles: ["Luxe", "Moderne"], services: ["Scénographie", "Mobilier", "Éclairage"] } },
  { title: "Champêtre & Chic", description: "Décoration rustique raffinée. Bois, lin et touches dorées pour un style campagne élégant.", metadata: { styles: ["Champêtre", "Chic"], services: ["Décoration florale", "Mobilier", "Textile"] } },
  { title: "Bohème Spirit Déco", description: "Esprit bohème et nature. Macramé, pampa et couleurs douces.", metadata: { styles: ["Bohème", "Nature"], services: ["Macramé", "Compositions florales", "Tapis"] } },
  { title: "Modern Event Design", description: "Design contemporain et épuré. Lignes pures et matériaux nobles.", metadata: { styles: ["Moderne", "Minimaliste"], services: ["Mobilier design", "Éclairage", "Signalétique"] } },
  { title: "Romantique Paris", description: "Décoration romantique et féérique. Roses, bougies et voilages.", metadata: { styles: ["Romantique", "Féérique"], services: ["Bougies", "Voilages", "Décoration florale"] } },
  { title: "Vintage Wedding Déco", description: "Ambiance rétro chic. Vaisselle ancienne et mobilier chiné.", metadata: { styles: ["Vintage", "Rétro"], services: ["Vaisselle vintage", "Mobilier chiné", "Accessoires"] } },
  { title: "Tropical Paradise Déco", description: "Exotisme et couleurs vives. Monstera, flamants et ambiance îles.", metadata: { styles: ["Tropical", "Coloré"], services: ["Plantes exotiques", "Décor tropical", "Éclairage"] } },
  { title: "Gold & Glitter Events", description: "Décoration luxueuse et brillante. Or, cristal et strass.", metadata: { styles: ["Luxe", "Glamour"], services: ["Décor doré", "Cristal", "Éclairage"] } },
  { title: "Nature Brute Scénographie", description: "Matériaux bruts et naturels. Pierre, bois et végétal.", metadata: { styles: ["Nature", "Brut"], services: ["Bois", "Pierre", "Végétal"] } },
  { title: "Oriental Dreams Déco", description: "Décoration orientale raffinée. Lanternes, tapis et couleurs chaudes.", metadata: { styles: ["Oriental", "Traditionnel"], services: ["Lanternes", "Tapis", "Coussins"] } },
  { title: "Industrial Loft Design", description: "Style industriel revisité. Métal, béton et touches végétales.", metadata: { styles: ["Industriel", "Loft"], services: ["Métal", "Mobilier industriel", "Végétal"] } },
  { title: "Pastel & Doux", description: "Décoration tout en douceur. Tons pastels et textures moelleuses.", metadata: { styles: ["Pastel", "Doux"], services: ["Textile", "Ballons", "Décoration légère"] } },
  { title: "Black & White Events", description: "Élégance monochrome. Noir, blanc et contrastes graphiques.", metadata: { styles: ["Moderne", "Graphique"], services: ["Décor noir et blanc", "Signalétique", "Éclairage"] } },
  { title: "Garden Party Déco", description: "Ambiance jardin anglais. Arches fleuries et buffets champêtres.", metadata: { styles: ["Champêtre", "Garden party"], services: ["Arches florales", "Mobilier jardin", "Guirlandes"] } },
  { title: "Art Déco Revival", description: "Style années 20 revisité. Géométrie et glamour gatsby.", metadata: { styles: ["Art Déco", "Gatsby"], services: ["Décor géométrique", "Or", "Plumes"] } },
  { title: "Scandinavian Touch", description: "Design scandinave épuré. Bois clair, blanc et hygge.", metadata: { styles: ["Scandinave", "Minimaliste"], services: ["Bois clair", "Textile cosy", "Bougies"] } },
  { title: "Méditerranée Déco", description: "Ambiance sud et soleil. Oliviers, lavande et bleu méditerranéen.", metadata: { styles: ["Méditerranéen", "Provençal"], services: ["Oliviers", "Lavande", "Céramique"] } },
  { title: "Fairy Tale Decorations", description: "Décors de conte de fées. Magie et enchantement pour petits et grands.", metadata: { styles: ["Féérique", "Fantaisie"], services: ["Décor féérique", "Éclairage magique", "Accessoires"] } },
  { title: "Corporate Chic Design", description: "Décoration événementielle corporate. Élégance professionnelle.", metadata: { styles: ["Corporate", "Chic"], services: ["Signalétique", "Mobilier", "Éclairage"] } },
  { title: "DIY Box Déco", description: "Kit décoration à faire soi-même. Économique et personnalisable.", metadata: { styles: ["DIY", "Personnalisé"], services: ["Kit complet", "Tutoriel", "Livraison"] } },
];

const floristData = [
  { title: "Fleurs d'Exception Paris", description: "Haute couture florale. Créations uniques pour mariages prestigieux.", metadata: { styles: ["Luxe", "Haute couture"], services: ["Bouquet mariée", "Décor cérémonie", "Centres de table"] } },
  { title: "La Rose Sauvage", description: "Fleurs sauvages et naturelles. Bouquets champêtres et compositions bohèmes.", metadata: { styles: ["Champêtre", "Bohème"], services: ["Bouquet mariée", "Boutonnières", "Arches florales"] } },
  { title: "Atelier Floral Design", description: "Design floral contemporain. Formes géométriques et couleurs vives.", metadata: { styles: ["Moderne", "Design"], services: ["Compositions sur mesure", "Installations", "Centres de table"] } },
  { title: "Les Jardins de Marie", description: "Fleuriste de tradition. Roses anglaises et pivoines de saison.", metadata: { styles: ["Classique", "Romantique"], services: ["Bouquet mariée", "Décor église", "Boutonnières"] } },
  { title: "Tropical Bloom", description: "Fleurs exotiques et tropicales. Orchidées, proteas et monstera.", metadata: { styles: ["Tropical", "Exotique"], services: ["Compositions exotiques", "Bouquet mariée", "Décor"] } },
  { title: "Eco Fleurs Bio", description: "Fleurs bio et locales. Fleuriste éco-responsable et de saison.", metadata: { styles: ["Bio", "Local"], services: ["Bouquet de saison", "Compositions naturelles"] } },
  { title: "Pivoine & Compagnie", description: "Spécialiste des pivoines et roses de jardin. Romantisme garanti.", metadata: { styles: ["Romantique", "Classique"], services: ["Bouquet mariée", "Décor romantique", "Centres de table"] } },
  { title: "Fleurs de Style", description: "Tendances florales actuelles. Du minimaliste au maximaliste.", metadata: { styles: ["Tendance", "Moderne"], services: ["Tous types de compositions", "Consultation style"] } },
  { title: "L'Atelier des Roses", description: "Expert en roses sous toutes ses formes. Du bouquet à l'arche monumentale.", metadata: { styles: ["Classique", "Luxe"], services: ["Bouquet mariée", "Arches", "Décor complet"] } },
  { title: "Fleurs des Champs", description: "Bouquets champêtres et naturels. L'esprit prairie à votre événement.", metadata: { styles: ["Champêtre", "Naturel"], services: ["Bouquet champêtre", "Mason jars", "Décor rustique"] } },
  { title: "Orchidée Prestige", description: "Orchidées et fleurs précieuses. Élégance et sophistication.", metadata: { styles: ["Luxe", "Élégant"], services: ["Compositions d'orchidées", "Décor prestige"] } },
  { title: "Pampa & Co", description: "Spécialiste fleurs séchées et pampa. Tendance et durable.", metadata: { styles: ["Bohème", "Séché"], services: ["Compositions séchées", "Arches pampa", "Décor durable"] } },
  { title: "Fleuriste du Marché", description: "Fleurs fraîches du marché. Qualité et prix abordable.", metadata: { styles: ["Frais", "Simple"], services: ["Bouquets simples", "Centres de table"] } },
  { title: "Art Floral Prestige", description: "Créations artistiques florales. Chaque composition est une œuvre.", metadata: { styles: ["Artistique", "Unique"], services: ["Créations sur mesure", "Installations artistiques"] } },
  { title: "Les Fleurs de Provence", description: "Lavande, olivier et fleurs méditerranéennes. L'esprit du sud.", metadata: { styles: ["Provençal", "Méditerranéen"], services: ["Compositions provençales", "Décor mariage"] } },
  { title: "Urban Jungle Fleurs", description: "Végétalisation et plantes vertes. Jungle urbaine pour vos events.", metadata: { styles: ["Jungle", "Végétal"], services: ["Mur végétal", "Plantes", "Compositions vertes"] } },
  { title: "Blanc Pur Floral", description: "Spécialiste des compositions tout en blanc. Pureté et élégance.", metadata: { styles: ["Blanc", "Épuré"], services: ["Bouquet blanc", "Décor immaculé"] } },
  { title: "Rainbow Flowers", description: "Couleurs vives et joyeuses. Pour des événements festifs et colorés.", metadata: { styles: ["Coloré", "Festif"], services: ["Compositions colorées", "Décor festif"] } },
  { title: "Fleurs & Sens", description: "Fleurs parfumées et sensorielles. L'odorat au service de vos émotions.", metadata: { styles: ["Parfumé", "Sensoriel"], services: ["Bouquets parfumés", "Ambiance olfactive"] } },
  { title: "Le Jardin Enchanté", description: "Créations féériques et poétiques. Des fleurs qui racontent des histoires.", metadata: { styles: ["Féérique", "Poétique"], services: ["Créations uniques", "Décor enchanté"] } },
];

const videographerData = [
  { title: "Film Wedding Paris", description: "Vidéaste de mariage cinématographique. Des films qui ressemblent à des courts-métrages.", metadata: { style: ["Cinématique", "Artistique"], packages: ["Teaser", "Film complet", "Same day edit"] } },
  { title: "Emotion Capture Films", description: "Capturer les émotions en mouvement. Vidéos naturelles et touchantes.", metadata: { style: ["Émotion", "Documentaire"], packages: ["Film complet", "Highlights"] } },
  { title: "Drone Video Pro", description: "Prises de vue aériennes 4K. Perspectives uniques sur votre événement.", metadata: { style: ["Drone", "Aérien"], packages: ["Drone add-on", "Film avec drone"] } },
  { title: "Studio Love Story", description: "Films romantiques pour mariages. Musique sur mesure incluse.", metadata: { style: ["Romantique", "Musical"], packages: ["Clip romantique", "Film journée"] } },
  { title: "Corporate Video Events", description: "Vidéo événementielle corporate. Captations et aftermovies professionnels.", metadata: { style: ["Corporate", "Pro"], packages: ["Captation live", "Aftermovie", "Interviews"] } },
  { title: "Vintage Film Studio", description: "Style Super 8 et vintage. Grain de film authentique.", metadata: { style: ["Vintage", "Rétro"], packages: ["Super 8", "Film vintage"] } },
  { title: "Fast Edit Productions", description: "Same day edit et montage rapide. Votre film prêt le soir même.", metadata: { style: ["Rapide", "Dynamique"], packages: ["Same day edit", "Highlights express"] } },
  { title: "Artistic Motion Pictures", description: "Films artistiques et créatifs. Chaque vidéo est une œuvre d'art.", metadata: { style: ["Artistique", "Créatif"], packages: ["Court-métrage", "Film d'auteur"] } },
  { title: "Multicam Events", description: "Captation multi-caméras. Couverture complète de votre événement.", metadata: { style: ["Multi-caméras", "Complet"], packages: ["2 caméras", "3+ caméras"] } },
  { title: "Teaser Masters", description: "Spécialiste des teasers percutants. 2-3 minutes d'émotions concentrées.", metadata: { style: ["Teaser", "Dynamique"], packages: ["Teaser 2min", "Teaser + highlights"] } },
  { title: "Documentary Wedding", description: "Approche documentaire pour mariages. Authenticité et spontanéité.", metadata: { style: ["Documentaire", "Authentique"], packages: ["Documentaire complet", "Highlights"] } },
  { title: "Clip Mariage Musical", description: "Clips mariages sur musique. Chorégraphie et mise en scène.", metadata: { style: ["Musical", "Clip"], packages: ["Clip musical", "Making-of"] } },
  { title: "Video 360 Experience", description: "Vidéo 360° et réalité virtuelle. Revivez votre événement en immersion.", metadata: { style: ["360°", "VR"], packages: ["Vidéo 360", "Expérience VR"] } },
  { title: "Destination Film Co", description: "Vidéaste pour mariages destination. Du Maroc à la Thaïlande.", metadata: { style: ["Destination", "Voyage"], packages: ["Film destination", "Travel video"] } },
  { title: "Black & White Cinema", description: "Films en noir et blanc. Élégance intemporelle.", metadata: { style: ["Noir et blanc", "Classique"], packages: ["Film N&B", "Mixte couleur/N&B"] } },
  { title: "Social Media Videos", description: "Contenu optimisé réseaux sociaux. Stories, Reels et TikTok.", metadata: { style: ["Social media", "Vertical"], packages: ["Pack réseaux", "Stories", "Reels"] } },
  { title: "Wedding Short Films", description: "Courts-métrages de mariage. Narration cinématographique.", metadata: { style: ["Court-métrage", "Narratif"], packages: ["Court-métrage 10min", "Mini film 5min"] } },
  { title: "Budget Video Express", description: "Vidéo de qualité à prix accessible. Essentiel et efficace.", metadata: { style: ["Simple", "Efficace"], packages: ["Highlights 3min", "Film simple"] } },
  { title: "Luxury Wedding Films", description: "Production haut de gamme. Équipe complète et rendu cinéma.", metadata: { style: ["Luxe", "Cinéma"], packages: ["Production luxe", "Équipe complète"] } },
  { title: "Nature Wedding Video", description: "Spécialiste mariages en extérieur. Lumière naturelle et paysages.", metadata: { style: ["Nature", "Extérieur"], packages: ["Film nature", "Golden hour"] } },
];

const makeupData = [
  { title: "Glamour Beauty Artist", description: "Maquillage glamour et sophistiqué. Regard intense et teint parfait.", metadata: { services: ["Maquillage mariée", "Essai", "Retouches"], styles: ["Glamour", "Sophistiqué"] } },
  { title: "Natural Beauty Studio", description: "Beauté naturelle sublimée. Maquillage léger et lumineux.", metadata: { services: ["Maquillage naturel", "Essai", "Accompagnement"], styles: ["Naturel", "Lumineux"] } },
  { title: "Oriental Beauty Art", description: "Spécialiste maquillage oriental. Yeux de biche et teint doré.", metadata: { services: ["Maquillage oriental", "Henné", "Essai"], styles: ["Oriental", "Libanais"] } },
  { title: "Bridal Hair & Makeup", description: "Coiffure et maquillage mariée. Service complet le jour J.", metadata: { services: ["Maquillage", "Coiffure", "Essai complet"], styles: ["Classique", "Romantique"] } },
  { title: "Celebrity Makeup Artist", description: "Maquilleur des stars. Techniques professionnelles du cinéma.", metadata: { services: ["Maquillage HD", "Contouring", "Essai"], styles: ["Célébrité", "HD"] } },
  { title: "Vintage Beauty Look", description: "Maquillage rétro et vintage. Des années 20 aux années 60.", metadata: { services: ["Maquillage vintage", "Coiffure rétro"], styles: ["Vintage", "Pin-up"] } },
  { title: "Bohème Beauty", description: "Look bohème et naturel. Tresses et maquillage solaire.", metadata: { services: ["Maquillage bohème", "Tresses", "Fleurs"], styles: ["Bohème", "Festival"] } },
  { title: "Airbrush Pro Makeup", description: "Maquillage airbrush professionnel. Tenue longue durée garantie.", metadata: { services: ["Airbrush", "Maquillage longue tenue"], styles: ["Pro", "Longue durée"] } },
  { title: "Ethnic Beauty Expert", description: "Expert peaux mates et foncées. Maquillage adapté à toutes les carnations.", metadata: { services: ["Maquillage peau mate", "Essai personnalisé"], styles: ["Ethnique", "Adapté"] } },
  { title: "Minimal Chic Beauty", description: "Less is more. Maquillage minimaliste et chic.", metadata: { services: ["Maquillage minimaliste", "Soins peau"], styles: ["Minimaliste", "Chic"] } },
  { title: "Glitter & Glow Artist", description: "Paillettes et glow. Maquillage festif et brillant.", metadata: { services: ["Maquillage paillettes", "Body painting"], styles: ["Festif", "Brillant"] } },
  { title: "Bridal Beauty Team", description: "Équipe complète pour mariée et cortège. Plusieurs artistes disponibles.", metadata: { services: ["Équipe", "Mariée + cortège", "Essais"], styles: ["Varié", "Coordonné"] } },
  { title: "Men's Grooming Studio", description: "Soins et mise en beauté pour hommes. Marié impeccable.", metadata: { services: ["Grooming", "Coiffure homme", "Soins"], styles: ["Masculin", "Soigné"] } },
  { title: "Lash & Brow Expert", description: "Spécialiste regard. Extensions cils et restructuration sourcils.", metadata: { services: ["Extensions cils", "Microblading", "Restructuration"], styles: ["Regard", "Précision"] } },
  { title: "SFX & Creative Makeup", description: "Maquillage créatif et effets spéciaux. Pour événements thématiques.", metadata: { services: ["SFX", "Maquillage créatif", "Body art"], styles: ["Créatif", "SFX"] } },
  { title: "Quick Beauty Touch", description: "Maquillage express en 30 minutes. Efficace et professionnel.", metadata: { services: ["Maquillage express", "Retouches"], styles: ["Rapide", "Efficace"] } },
  { title: "Luxury Beauty Lounge", description: "Expérience beauté haut de gamme. Produits premium et champagne.", metadata: { services: ["Expérience luxe", "Produits premium", "Champagne"], styles: ["Luxe", "VIP"] } },
  { title: "Teen Beauty Artist", description: "Maquillage adapté aux adolescentes. Naturel et adapté à l'âge.", metadata: { services: ["Maquillage ado", "Conseils beauté"], styles: ["Jeune", "Frais"] } },
  { title: "Photo-Ready Makeup", description: "Maquillage optimisé pour la photo. Pas de flash back garanti.", metadata: { services: ["Maquillage photo", "Anti flash back"], styles: ["Photo-ready", "HD"] } },
  { title: "Mobile Beauty Service", description: "Maquillage à domicile partout en France. On vient à vous.", metadata: { services: ["À domicile", "Mobile", "Équipe"], styles: ["Flexible", "Pratique"] } },
];

const plannerData = [
  { title: "Perfect Day Planners", description: "Organisation complète de A à Z. Votre mariage parfait sans stress.", metadata: { services: ["Organisation complète", "Coordination jour J", "Budget management"] } },
  { title: "Coordination Jour J", description: "Coordination le jour de l'événement uniquement. Vous planifiez, on exécute.", metadata: { services: ["Coordination jour J", "Timing", "Gestion prestataires"] } },
  { title: "Wedding Designer Paris", description: "Design et scénographie de mariage. Concept créatif sur mesure.", metadata: { services: ["Design", "Scénographie", "Direction artistique"] } },
  { title: "Destination Wedding Expert", description: "Spécialiste mariages à l'étranger. Maroc, Italie, Grèce et plus.", metadata: { services: ["Destination", "Logistique internationale", "Organisation complète"] } },
  { title: "Budget Wedding Planner", description: "Beaux mariages avec petit budget. Optimisation et bons plans.", metadata: { services: ["Optimisation budget", "Bons plans", "Négociation"] } },
  { title: "Luxury Event Planners", description: "Événements luxe et prestige. Sans limite de budget.", metadata: { services: ["Luxe", "Sur mesure", "Prestataires premium"] } },
  { title: "Multicultural Wedding Co", description: "Expert mariages multiculturels. Fusion des traditions.", metadata: { services: ["Mariage mixte", "Traditions", "2 cérémonies"] } },
  { title: "Last Minute Weddings", description: "Organisation express en moins de 3 mois. On relève le défi.", metadata: { services: ["Organisation express", "Stress-free", "Efficacité"] } },
  { title: "Eco Wedding Planner", description: "Mariages éco-responsables. Local, bio et zéro déchet.", metadata: { services: ["Éco-responsable", "Local", "Zéro déchet"] } },
  { title: "Château Wedding Specialist", description: "Expert mariages en château. Réseau exclusif de domaines.", metadata: { services: ["Châteaux", "Lieux d'exception", "Organisation"] } },
  { title: "Intimate Wedding Co", description: "Spécialiste des petits mariages. 50 invités max, qualité max.", metadata: { services: ["Mariage intime", "Élopement", "Micro wedding"] } },
  { title: "Grand Wedding Productions", description: "Mariages XXL de plus de 300 invités. Logistique impeccable.", metadata: { services: ["Grand mariage", "Logistique", "Équipe nombreuse"] } },
  { title: "Same-Sex Wedding Planners", description: "Célébration de l'amour pour tous. Mariages LGBT friendly.", metadata: { services: ["Mariage LGBT", "Inclusif", "Personnalisé"] } },
  { title: "Religious Wedding Expert", description: "Expert cérémonies religieuses. Catholique, juif, musulman, etc.", metadata: { services: ["Cérémonie religieuse", "Traditions", "Coordination"] } },
  { title: "Beach & Outdoor Weddings", description: "Mariages en extérieur et plage. Plan B météo inclus.", metadata: { services: ["Mariage plage", "Extérieur", "Plan B"] } },
  { title: "Winter Wedding Magic", description: "Mariages d'hiver féeriques. Neige, montagne et chalet.", metadata: { services: ["Mariage hiver", "Montagne", "Chalet"] } },
  { title: "Corporate Event Planners", description: "Organisation événements corporate. Séminaires, galas, lancements.", metadata: { services: ["Corporate", "Séminaire", "Gala", "Team building"] } },
  { title: "Birthday & Party Planner", description: "Anniversaires et fêtes privées. De 1 à 100 ans.", metadata: { services: ["Anniversaire", "Fête privée", "Thématique"] } },
  { title: "Month-Of Coordinator", description: "Prise en main le dernier mois. Finalisation et coordination.", metadata: { services: ["Dernier mois", "Finalisation", "Coordination"] } },
  { title: "Virtual Wedding Planner", description: "Accompagnement à distance. Visio et outils collaboratifs.", metadata: { services: ["À distance", "Visio", "Outils en ligne"] } },
];

const patisserieData = [
  { title: "Cake Design Paris", description: "Wedding cakes sur mesure. Décoration artistique et goût exceptionnel.", metadata: { specialties: ["Wedding cake", "Cake design", "Sur mesure"] } },
  { title: "Pièce Montée Tradition", description: "Pièces montées traditionnelles. Choux, nougatine et caramel.", metadata: { specialties: ["Pièce montée", "Choux", "Tradition"] } },
  { title: "Macarons & Cie", description: "Pyramides de macarons et mignardises. Couleurs personnalisées.", metadata: { specialties: ["Macarons", "Pyramide", "Mignardises"] } },
  { title: "Naked Cake Studio", description: "Naked cakes et semi-naked. Tendance et naturel.", metadata: { specialties: ["Naked cake", "Semi-naked", "Fleurs fraîches"] } },
  { title: "Vegan & Gluten Free Cakes", description: "Pâtisserie sans gluten et vegan. Gourmandise pour tous.", metadata: { specialties: ["Végan", "Sans gluten", "Allergies"] } },
  { title: "Oriental Sweets", description: "Pâtisseries orientales. Baklava, cornes de gazelle et plus.", metadata: { specialties: ["Oriental", "Baklava", "Traditionnel"] } },
  { title: "Cupcake Factory", description: "Cupcakes personnalisés par centaines. Towers et présentations.", metadata: { specialties: ["Cupcakes", "Tower", "Mini desserts"] } },
  { title: "Chocolate Wedding Expert", description: "Fontaines et sculptures en chocolat. Paradis des chocoholics.", metadata: { specialties: ["Chocolat", "Fontaine", "Sculpture"] } },
  { title: "French Pastry Atelier", description: "Pâtisserie française classique. Éclairs, tartes et entremets.", metadata: { specialties: ["Éclairs", "Tartes", "Entremets"] } },
  { title: "Donut Wedding Bar", description: "Murs de donuts et bars sucrés. Fun et instagram-friendly.", metadata: { specialties: ["Donuts", "Bar sucré", "Fun"] } },
  { title: "Luxury Dessert Tables", description: "Sweet tables luxueuses. Candy bar et desserts à profusion.", metadata: { specialties: ["Sweet table", "Candy bar", "Luxe"] } },
  { title: "Cheese Cake Specialist", description: "Cheesecakes de toutes sortes. Alternative gourmande.", metadata: { specialties: ["Cheesecake", "Varié", "Américain"] } },
  { title: "Mini Desserts Traiteur", description: "Verrines et mini desserts. Parfait pour cocktails.", metadata: { specialties: ["Verrines", "Mini desserts", "Cocktail"] } },
  { title: "Artisan Glacier Events", description: "Glaces et sorbets artisanaux. Bar à glaces pour l'été.", metadata: { specialties: ["Glaces", "Sorbets", "Bar à glaces"] } },
  { title: "Royal Icing Cakes", description: "Gâteaux en pâte à sucre. Décors 3D et personnages.", metadata: { specialties: ["Pâte à sucre", "3D", "Personnages"] } },
  { title: "Crêpes & Gaufres Events", description: "Stands crêpes et gaufres. Animation gourmande.", metadata: { specialties: ["Crêpes", "Gaufres", "Animation"] } },
  { title: "Bio Pâtisserie", description: "Ingrédients 100% bio et locaux. Gourmandise responsable.", metadata: { specialties: ["Bio", "Local", "Naturel"] } },
  { title: "Kids Birthday Cakes", description: "Gâteaux d'anniversaire enfants. Super-héros et princesses.", metadata: { specialties: ["Enfants", "Thématique", "Personnages"] } },
  { title: "Modern Geometric Cakes", description: "Gâteaux géométriques et modernes. Design contemporain.", metadata: { specialties: ["Géométrique", "Moderne", "Design"] } },
  { title: "Tower Profiteroles", description: "Tours de profiteroles géantes. Classique et généreux.", metadata: { specialties: ["Profiteroles", "Tour", "Classique"] } },
];

const transportData = [
  { title: "Limousine VIP Service", description: "Limousines et berlines de luxe. Chauffeur en costume.", metadata: { vehicleTypes: ["Limousine", "Berline luxe"], services: ["Chauffeur", "Champagne", "Décoration"] } },
  { title: "Vintage Cars Collection", description: "Voitures de collection années 50-70. Citroën DS, Rolls-Royce, etc.", metadata: { vehicleTypes: ["Voiture collection", "Vintage"], services: ["Avec chauffeur", "Photos"] } },
  { title: "Prestige Sports Cars", description: "Ferrari, Porsche, Lamborghini. Arrivée remarquée garantie.", metadata: { vehicleTypes: ["Supercar", "Sports"], services: ["Location", "Avec chauffeur"] } },
  { title: "Horse & Carriage", description: "Calèches et attelages. Arrivée romantique et traditionnelle.", metadata: { vehicleTypes: ["Calèche", "Attelage"], services: ["Décoration", "Cocher en costume"] } },
  { title: "Wedding Bus Company", description: "Bus et minibus pour invités. Transport groupé pratique.", metadata: { vehicleTypes: ["Bus", "Minibus"], services: ["Navette", "Déco possible"] } },
  { title: "Combi VW Vintage", description: "Combi Volkswagen rétro. Esprit bohème et road trip.", metadata: { vehicleTypes: ["Combi VW", "Van vintage"], services: ["Décoration", "Photos"] } },
  { title: "Motorcycle Escort", description: "Escorte moto pour cortège. Harley Davidson et customs.", metadata: { vehicleTypes: ["Moto", "Harley"], services: ["Escorte", "Side-car mariés"] } },
  { title: "Eco Electric Fleet", description: "Véhicules 100% électriques. Tesla, BMW i, etc.", metadata: { vehicleTypes: ["Tesla", "Électrique"], services: ["Chauffeur", "Silencieux", "Écolo"] } },
  { title: "Bateau Seine Paris", description: "Transport en bateau sur la Seine. Arrivée spectaculaire.", metadata: { vehicleTypes: ["Bateau", "Yacht"], services: ["Champagne", "Vue Paris"] } },
  { title: "Helicopter Luxury", description: "Transferts en hélicoptère. Pour mariages d'exception.", metadata: { vehicleTypes: ["Hélicoptère"], services: ["Transfert", "Vue aérienne", "Photos"] } },
  { title: "2CV Dolce Vita", description: "Flotte de 2CV colorées. Convoi joyeux et photogénique.", metadata: { vehicleTypes: ["2CV", "Coccinelle"], services: ["Convoi", "Décoration", "Photos"] } },
  { title: "American Dream Cars", description: "Muscle cars américaines. Mustang, Camaro, Corvette.", metadata: { vehicleTypes: ["Mustang", "Camaro", "Américaine"], services: ["Location", "Chauffeur optionnel"] } },
  { title: "Royal Rolls-Royce", description: "Rolls-Royce pour occasions royales. Phantom et Ghost.", metadata: { vehicleTypes: ["Rolls-Royce", "Bentley"], services: ["Chauffeur", "Red carpet"] } },
  { title: "Vélos & Triporteurs", description: "Vélos décorés et triporteurs. Écolo et original.", metadata: { vehicleTypes: ["Vélo", "Triporteur"], services: ["Décoration", "Cortège fun"] } },
  { title: "London Taxi Service", description: "Taxis londoniens noirs. British style garanti.", metadata: { vehicleTypes: ["Taxi londonien", "Black cab"], services: ["Avec chauffeur", "Décoration UK"] } },
  { title: "Van Aménagé VIP", description: "Mercedes Vito et Sprinter VIP. Confort pour groupe.", metadata: { vehicleTypes: ["Mercedes Vito", "Sprinter"], services: ["VIP", "Groupe", "Confort"] } },
  { title: "Tracteur Champêtre", description: "Tracteur vintage et remorque décorée. Pour mariages champêtres.", metadata: { vehicleTypes: ["Tracteur", "Remorque"], services: ["Décoration", "Photos champêtres"] } },
  { title: "Scooter Vespa Italian", description: "Vespas et scooters italiens. Dolce vita à la française.", metadata: { vehicleTypes: ["Vespa", "Scooter"], services: ["Photos", "Couple uniquement"] } },
  { title: "Navette Shuttle Pro", description: "Service navette professionnel. Gare, aéroport, lieux.", metadata: { vehicleTypes: ["Navette", "Van"], services: ["Navette", "Timing précis"] } },
  { title: "Jet Privé Events", description: "Transferts en jet privé. Luxe ultime.", metadata: { vehicleTypes: ["Jet privé"], services: ["Transfert", "Champagne", "VIP"] } },
];

const animatorData = [
  { title: "DJ Animation Party", description: "DJ avec animations et jeux. Ambiance garantie toute la soirée.", metadata: { animationTypes: ["DJ", "Jeux", "Animations"], duration: ["Soirée complète"] } },
  { title: "Magicien Close-Up", description: "Magie de proximité pendant le cocktail. Émerveillement des invités.", metadata: { animationTypes: ["Magie", "Close-up"], duration: ["1h", "2h", "3h"] } },
  { title: "Photobooth Deluxe", description: "Photobooth avec accessoires et impressions illimitées.", metadata: { animationTypes: ["Photobooth", "Props", "Impressions"], duration: ["3h", "Soirée"] } },
  { title: "Karaoké Party", description: "Karaoké avec écran géant et catalogue 50 000 titres.", metadata: { animationTypes: ["Karaoké", "Écran", "Micro"], duration: ["2h", "3h", "Soirée"] } },
  { title: "Caricaturiste Events", description: "Caricatures en direct de vos invités. Souvenir original.", metadata: { animationTypes: ["Caricature", "Dessin"], duration: ["2h", "3h", "4h"] } },
  { title: "Casino Animation", description: "Tables de casino avec croupiers. Poker, blackjack, roulette.", metadata: { animationTypes: ["Casino", "Poker", "Roulette"], duration: ["3h", "Soirée"] } },
  { title: "Feu d'Artifice Pro", description: "Spectacles pyrotechniques sur mesure. Finale magique.", metadata: { animationTypes: ["Feu d'artifice", "Pyrotechnie"], duration: ["5min", "10min", "15min"] } },
  { title: "Danseurs & Shows", description: "Spectacles de danse. Salsa, orientale, hip-hop, classique.", metadata: { animationTypes: ["Danse", "Show", "Spectacle"], duration: ["15min", "30min", "1h"] } },
  { title: "Musiciens Live", description: "Groupes et musiciens pour cérémonie et cocktail.", metadata: { animationTypes: ["Musique live", "Groupe", "Solo"], duration: ["1h", "2h", "Soirée"] } },
  { title: "Kids Entertainment", description: "Animation enfants. Maquillage, jeux, châteaux gonflables.", metadata: { animationTypes: ["Enfants", "Maquillage", "Jeux"], duration: ["2h", "3h", "Journée"] } },
  { title: "Quiz & Jeux TV", description: "Quiz interactifs style TV. Buzzers et écran géant.", metadata: { animationTypes: ["Quiz", "Jeux TV", "Interactif"], duration: ["1h", "2h"] } },
  { title: "Barman Flair Show", description: "Barmen acrobatiques et cocktails spectaculaires.", metadata: { animationTypes: ["Flair bartending", "Cocktails", "Show"], duration: ["2h", "3h", "Soirée"] } },
  { title: "Portrait Minute", description: "Portraits dessinés ou peints en quelques minutes.", metadata: { animationTypes: ["Portrait", "Dessin", "Peinture"], duration: ["2h", "3h", "4h"] } },
  { title: "Tatouage Éphémère", description: "Tatouages temporaires et paillettes. Fun et coloré.", metadata: { animationTypes: ["Tatouage éphémère", "Paillettes"], duration: ["2h", "3h"] } },
  { title: "Escape Game Mobile", description: "Escape game déplacé à votre événement.", metadata: { animationTypes: ["Escape game", "Énigmes"], duration: ["Sessions de 30min"] } },
  { title: "Orchestre Jazz", description: "Jazz band pour ambiance sophistiquée.", metadata: { animationTypes: ["Jazz", "Orchestre", "Musique live"], duration: ["1h", "2h", "Soirée"] } },
  { title: "Spectacle Cabaret", description: "Danseuses et spectacle style cabaret parisien.", metadata: { animationTypes: ["Cabaret", "French cancan", "Show"], duration: ["20min", "45min"] } },
  { title: "Flashmob Organisation", description: "Création et exécution de flashmobs surprises.", metadata: { animationTypes: ["Flashmob", "Danse", "Surprise"], duration: ["5min performance"] } },
  { title: "Mentaliste Show", description: "Spectacle de mentalisme et lecture de pensées.", metadata: { animationTypes: ["Mentalisme", "Mind reading"], duration: ["30min", "1h"] } },
  { title: "Photo 360 & Slow Motion", description: "Cabine photo 360 degrés et slow motion.", metadata: { animationTypes: ["Photo 360", "Slow motion", "Vidéo"], duration: ["3h", "Soirée"] } },
];

// =====================
// SEED FUNCTIONS
// =====================

async function seedVendorsAndServices() {
  const allServices: Array<{
    data: Array<{ title: string; description: string; metadata: Record<string, unknown> }>;
    category: ServiceCategory;
    priceType: string;
    priceMultiplier: number;
    images: string[];
  }> = [
    { data: venueData, category: "VENUE", priceType: "fixed", priceMultiplier: 1, images: [
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800",
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800",
      "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800",
    ]},
    { data: catererData, category: "CATERER", priceType: "per_person", priceMultiplier: 0.1, images: [
      "https://images.unsplash.com/photo-1555244162-803834f70033?w=800",
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800",
    ]},
    { data: photographerData, category: "PHOTOGRAPHER", priceType: "fixed", priceMultiplier: 0.5, images: [
      "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800",
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800",
      "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800",
    ]},
    { data: djData, category: "DJ", priceType: "fixed", priceMultiplier: 0.4, images: [
      "https://images.unsplash.com/photo-1571266028243-d220c6a4ec2c?w=800",
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800",
      "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800",
    ]},
    { data: decoratorData, category: "DECORATOR", priceType: "fixed", priceMultiplier: 0.6, images: [
      "https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800",
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800",
    ]},
    { data: floristData, category: "FLORIST", priceType: "fixed", priceMultiplier: 0.3, images: [
      "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=800",
      "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=800",
      "https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=800",
    ]},
    { data: videographerData, category: "VIDEOGRAPHER", priceType: "fixed", priceMultiplier: 0.6, images: [
      "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800",
      "https://images.unsplash.com/photo-1579165466741-7f35e4755660?w=800",
      "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800",
    ]},
    { data: makeupData, category: "MAKEUP", priceType: "fixed", priceMultiplier: 0.2, images: [
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800",
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800",
      "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800",
    ]},
    { data: plannerData, category: "PLANNER", priceType: "fixed", priceMultiplier: 0.8, images: [
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800",
      "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800",
      "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800",
    ]},
    { data: patisserieData, category: "PATISSERIE", priceType: "fixed", priceMultiplier: 0.25, images: [
      "https://images.unsplash.com/photo-1535141192574-5d4897c12f4f?w=800",
      "https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=800",
      "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800",
    ]},
    { data: transportData, category: "TRANSPORT", priceType: "fixed", priceMultiplier: 0.35, images: [
      "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800",
      "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800",
    ]},
    { data: animatorData, category: "ANIMATOR", priceType: "per_hour", priceMultiplier: 0.15, images: [
      "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800",
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800",
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800",
    ]},
  ];

  let totalServices = 0;
  let totalVendors = 0;

  for (const serviceType of allServices) {
    for (let i = 0; i < serviceType.data.length; i++) {
      const item = serviceType.data[i];
      const region = regions[i % regions.length];
      const city = cities[region][i % 4];
      
      // Create a vendor profile for each service
      const vendorId = `vendor_${serviceType.category.toLowerCase()}_${i + 1}`;
      const companyName = item.title.split(" - ")[0];
      
      // Create vendor user (using create since we cleared the database)
      await prisma.user.create({
        data: {
          id: vendorId,
          email: `${slugify(companyName)}@example.com`,
          role: "VENDOR",
          firstName: "Propriétaire",
          lastName: companyName,
          phone: generatePhone(),
          city,
          onboardingCompleted: true,
          wizardCompleted: true,
        },
      });

      const vendorProfile = await prisma.vendorProfile.create({
        data: {
          userId: vendorId,
          companyName,
          description: item.description,
          city,
          region,
          verified: Math.random() > 0.3,
          featured: i < 3,
          yearFounded: getRandomPrice(1990, 2022),
          teamSize: ["1-5", "5-10", "10-20", "20+"][Math.floor(Math.random() * 4)],
          travelRadius: getRandomPrice(20, 200),
          responseTime: ["< 1h", "< 24h", "< 48h"][Math.floor(Math.random() * 3)],
          rating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
          reviewCount: getRandomPrice(5, 200),
          phone: generatePhone(),
          email: `contact@${slugify(companyName)}.fr`,
          website: `https://www.${slugify(companyName)}.fr`,
          instagram: `@${slugify(companyName)}`,
        },
      });

      totalVendors++;

      // Create service listing
      const basePrice = getRandomPrice(200, 2000) * serviceType.priceMultiplier;
      const price = Math.round(basePrice / 10) * 10; // Round to nearest 10
      const priceMax = Math.round((price + price * (Math.random() * 0.5 + 0.3)) / 10) * 10;

      const service = await prisma.serviceListing.create({
        data: {
          vendorId: vendorProfile.id,
          title: item.title,
          description: item.description,
          category: serviceType.category,
          city,
          region,
          priceType: serviceType.priceType,
          price,
          priceMax,
          priceRange: getPriceRange(price),
          metadata: item.metadata as object,
          eventTypes: getRandomItems(eventTypes, 3, 6),
          styles: getRandomItems(styles, 2, 4),
          amenities: (item.metadata as { amenities?: string[] }).amenities || [],
          images: serviceType.images,
          minCapacity: (item.metadata as { minGuests?: number }).minGuests || null,
          maxCapacity: (item.metadata as { capacity?: number; maxGuests?: number }).capacity || 
                       (item.metadata as { maxGuests?: number }).maxGuests || null,
          active: true,
          featured: i < 5,
          verified: Math.random() > 0.3,
          rating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
          reviewCount: getRandomPrice(5, 150),
          viewCount: getRandomPrice(100, 5000),
          bookingCount: getRandomPrice(10, 200),
        },
      });

      // Create availability for next 90 days - use individual creates since createMany uses transactions
      const availabilityData = generateAvailabilityDates(service.id);
      for (const avail of availabilityData) {
        await prisma.serviceAvailability.create({
          data: avail,
        });
      }

      totalServices++;
    }
    console.log(`✅ Seeded 20 ${serviceType.category.toLowerCase()} services`);
  }

  console.log(`\n📊 Created ${totalVendors} vendor profiles and ${totalServices} service listings`);
}

async function seedSamplePacks() {
  // Get some vendors with multiple services
  const vendors = await prisma.vendorProfile.findMany({
    take: 5,
    include: {
      services: true,
    },
  });

  // For each vendor with services, create a pack
  let packCount = 0;
  for (const vendor of vendors) {
    if (vendor.services.length >= 1) {
      const services = vendor.services.slice(0, Math.min(3, vendor.services.length));
      const originalPrice = services.reduce((sum, s) => sum + s.price, 0);
      const discountPercent = getRandomPrice(10, 25);
      const discountedPrice = originalPrice * (1 - discountPercent / 100);

      // Create pack without nested items to avoid transaction
      const pack = await prisma.pack.create({
        data: {
          vendorId: vendor.id,
          name: `Pack ${vendor.companyName}`,
          description: `Profitez de nos services combinés avec une réduction de ${discountPercent}% ! Inclus: ${services.map(s => s.title).join(", ")}.`,
          originalPrice,
          discountedPrice,
          discountPercent,
          active: true,
          images: services[0]?.images || [],
        },
      });

      // Create pack items separately
      for (const service of services) {
        await prisma.packItem.create({
          data: {
            packId: pack.id,
            serviceId: service.id,
          },
        });
      }
      packCount++;
    }
  }

  console.log(`✅ Created ${packCount} sample packs`);
}

async function seedSampleDeals() {
  // Create some deals
  const deals = [
    {
      name: "Réduction Été 2026",
      description: "15% de réduction sur toutes les réservations d'été",
      discountType: "percentage",
      discountValue: 15,
      code: "SUMMER2026",
      validFrom: new Date("2026-06-01"),
      validUntil: new Date("2026-08-31"),
    },
    {
      name: "Early Bird Mariage",
      description: "Réservez 6 mois à l'avance et économisez 10%",
      discountType: "percentage",
      discountValue: 10,
      code: "EARLYBIRD",
      validFrom: new Date("2026-01-01"),
      validUntil: new Date("2026-12-31"),
    },
    {
      name: "Première Réservation",
      description: "50€ offerts pour votre première réservation",
      discountType: "fixed",
      discountValue: 50,
      code: "BIENVENUE50",
      validFrom: new Date("2026-01-01"),
      validUntil: new Date("2026-12-31"),
      minPurchase: 200,
    },
  ];

  for (const deal of deals) {
    await prisma.deal.create({ data: deal });
  }

  console.log(`✅ Created ${deals.length} sample deals`);
}

async function seedSampleReviews() {
  // Get some services
  const services = await prisma.serviceListing.findMany({ take: 50 });
  
  const reviewTexts = [
    { rating: 5, title: "Parfait !", comment: "Service impeccable, je recommande vivement. Tout était parfait du début à la fin." },
    { rating: 5, title: "Exceptionnel", comment: "Une prestation de qualité exceptionnelle. L'équipe est professionnelle et à l'écoute." },
    { rating: 4, title: "Très bien", comment: "Très satisfait de la prestation. Quelques petits détails à améliorer mais globalement excellent." },
    { rating: 4, title: "Recommandé", comment: "Bon rapport qualité-prix. Le service était à la hauteur de nos attentes." },
    { rating: 5, title: "Au-delà des attentes", comment: "Ils ont dépassé toutes nos attentes. Un grand merci pour avoir rendu notre journée magique." },
    { rating: 3, title: "Correct", comment: "Prestation correcte sans plus. Le service de base était bon mais manquait de personnalisation." },
    { rating: 5, title: "Coup de cœur", comment: "Un vrai coup de cœur ! Créatifs, réactifs et tellement professionnels. Merci !" },
    { rating: 4, title: "Très professionnel", comment: "Équipe très professionnelle. Communication fluide et résultat à la hauteur." },
  ];

  let reviewCount = 0;
  for (const service of services) {
    // Create 2-5 reviews per service
    const numReviews = getRandomPrice(2, 5);
    for (let i = 0; i < numReviews; i++) {
      const review = reviewTexts[Math.floor(Math.random() * reviewTexts.length)];
      const reviewerId = `reviewer_${reviewCount + 1}`;
      
      // Create a client user for the review (using create since we cleared the database)
      await prisma.user.create({
        data: {
          id: reviewerId,
          email: `client${reviewCount + 1}@example.com`,
          role: "CLIENT",
          firstName: ["Marie", "Pierre", "Sophie", "Jean", "Emma", "Lucas", "Léa", "Hugo"][reviewCount % 8],
          lastName: ["Martin", "Bernard", "Dubois", "Thomas", "Robert", "Richard", "Petit", "Durand"][reviewCount % 8],
          city: cities[regions[reviewCount % 10]][reviewCount % 4],
        },
      });

      await prisma.review.create({
        data: {
          serviceId: service.id,
          userId: reviewerId,
          rating: review.rating,
          title: review.title,
          comment: review.comment,
          approved: true,
          vendorResponse: Math.random() > 0.5 ? "Merci beaucoup pour votre avis ! Ce fut un plaisir de travailler avec vous." : null,
          vendorRespondedAt: Math.random() > 0.5 ? new Date() : null,
        },
      });
      reviewCount++;
    }
  }

  console.log(`✅ Created ${reviewCount} sample reviews`);
}

async function main() {
  console.log("🌱 Starting database seed...\n");
  
  // Clear existing data in correct order (respecting foreign keys)
  console.log("🗑️  Clearing existing data...");
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.review.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.bookingItem.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.serviceAvailability.deleteMany();
  await prisma.vendorAvailability.deleteMany();
  await prisma.packItem.deleteMany();
  await prisma.pack.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.serviceListing.deleteMany();
  await prisma.vendorProfile.deleteMany();
  await prisma.user.deleteMany();
  console.log("✅ Cleared existing data\n");
  
  // Seed all data
  await seedVendorsAndServices();
  await seedSamplePacks();
  await seedSampleDeals();
  await seedSampleReviews();
  
  console.log("\n🎉 Database seeding completed successfully!");
  console.log("\n📋 Summary:");
  console.log("   - 240 service listings (20 per category × 12 categories)");
  console.log("   - 240 vendor profiles");
  console.log("   - ~21,600 availability slots (90 days × 240 services)");
  console.log("   - Sample packs, deals, and reviews");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
