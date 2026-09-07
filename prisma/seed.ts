import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { deriveCheckinCode } from "../src/lib/checkin";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});
const prisma = new PrismaClient({ adapter });

const u = (id: string, w = 1600) =>
  `https://images.unsplash.com/${id}?q=80&w=${w}&auto=format&fit=crop`;

// Kandariya Mahadeva Temple, Khajuraho — Wikimedia Commons, CC BY-SA 4.0
const KHAJURAHO =
  "https://commons.wikimedia.org/wiki/Special:FilePath/Kandariya%20Mahadeva%20Temple,%20Khajuraho,%20Madhya%20Pradesh.jpg?width=1600";

// ---------------------------------------------------------------- Destinations

const destinations = [
  {
    featured: true,
  slug: "leh-ladakh",
    name: "Leh, Ladakh",
    hindiName: "लेह, लद्दाख़",
    region: "Ladakh",
    tagline: "Where the sky meets the earth",
    story:
      "High passes, deep blue lakes and monasteries perched on ridgelines. Ladakh is India at its most cinematic — and its most fragile. Tourists doubled in a decade, and the lake shores and mountain trails now carry the weight of that love.",
    image: u("photo-1545324418-cc1a3fa10c00", 1200),
    imageAlt: "Snow peaks rising over a high-altitude lake in Ladakh",
    heroImage: u("photo-1506905925346-21bda4d32df4", 2400),
    coordinates: "34.1526,77.5771",
    mapX: 0.3,
    mapY: 0.12,
    bestSeason: "May – September",
    knownFor: JSON.stringify(["Pangong Tso", "Nubra Valley", "Magnetic Hill", "Monasteries"]),
    needsCare:
      "High-altitude lakes and camping grounds collect plastic and litter faster than they can decompose at 4,300 m.",
    careImage: u("photo-1519681393784-d120267933ba", 1200),
  },
  {
    featured: true,
  slug: "varanasi",
    name: "Varanasi",
    hindiName: "वाराणसी",
    region: "Uttar Pradesh",
    tagline: "The city that time forgot to age",
    story:
      "Ghats stacked with centuries, morning aarti smoke rising over the Ganga, alleyways older than most nations. Varanasi is India's soul — and its ghats, walked by a million feet a year, need constant care.",
    image: u("photo-1566837945700-30057527ade0", 1200),
    imageAlt: "Boats on the Ganga at sunrise with Varanasi ghats behind",
    heroImage: u("photo-1566837945700-30057527ade0", 2400),
    coordinates: "25.3176,82.9739",
    mapX: 0.58,
    mapY: 0.34,
    bestSeason: "October – March",
    knownFor: JSON.stringify(["Ganga Aarti", "Assi & Dashashwamedh Ghats", "Kashi Vishwanath", "Silk weaves"]),
    needsCare:
      "Ghat steps and riverbanks gather floral offerings, plastics and silt that must be cleared daily to keep the river alive.",
    careImage: u("photo-1583417319070-4a69db38a482", 1200),
  },
  {
    featured: true,
  slug: "hampi",
    name: "Hampi",
    hindiName: "हम्पी",
    region: "Karnataka",
    tagline: "A kingdom of boulders and gods",
    story:
      "The capital of the Vijayanagara empire lies scattered across a lunar landscape of granite boulders. Ruins the size of cathedrals, carved chariots, and a river that has watched empires rise and fall.",
    image: u("photo-1590050752117-238cb0fb12b1", 1200),
    imageAlt: "Stone chariot and temple ruins at Hampi",
    heroImage: u("photo-1590050752117-238cb0fb12b1", 2400),
    coordinates: "15.3350,76.4600",
    mapX: 0.42,
    mapY: 0.68,
    bestSeason: "November – February",
    knownFor: JSON.stringify(["Virupaksha Temple", "Stone Chariot", "Matanga Hill", "Hippie Island"]),
    needsCare:
      "A UNESCO site walked by hundreds of thousands yearly — litter along boulder trails and monument precincts is a growing threat.",
    careImage: u("photo-1501785888041-af3ef285b470", 1200),
  },
  {
    featured: true,
  slug: "alleppey",
    name: "Alleppey",
    hindiName: "आलप्पुड़ा",
    region: "Kerala",
    tagline: "The Venice of the East",
    story:
      "A lattice of canals, lagoons and paddy fields where life happens on water. Houseboats glide past toddy shops and churches, and the backwaters quietly carry the story of Kerala.",
    image: u("photo-1476514525535-07fb3b4ae5f1", 1200),
    imageAlt: "A canoe drifting through Kerala backwaters at dusk",
    heroImage: u("photo-1476514525535-07fb3b4ae5f1", 2400),
    coordinates: "9.4981,76.3388",
    mapX: 0.44,
    mapY: 0.78,
    bestSeason: "November – February",
    knownFor: JSON.stringify(["Houseboats", "Canals", "Vembanad Lake", "Village life"]),
    needsCare:
      "Canals choke on water hyacinth and plastic; the backwater ecosystem that tourism depends on needs active clearing.",
    careImage: u("photo-1501785888041-af3ef285b470", 1200),
  },
  {
    slug: "munnar",
    name: "Munnar",
    hindiName: "मुन्नार",
    region: "Kerala",
    tagline: "Three rivers, a thousand hills",
    story:
      "Tea plantations roll over green hills in endless corduroy rows. Mist arrives without warning. Munnar is Kerala's high country — and its trails are eroding under the footfall of a million trekkers.",
    image: u("photo-1441974231531-c6227db76b6e", 1200),
    imageAlt: "Misty green hills and tea estates of Munnar",
    heroImage: u("photo-1441974231531-c6227db76b6e", 2400),
    coordinates: "10.0889,77.0595",
    mapX: 0.46,
    mapY: 0.8,
    bestSeason: "September – May",
    knownFor: JSON.stringify(["Tea estates", "Eravikulam Park", "Top Station", "Shola forests"]),
    needsCare:
      "Trekking trails through shola forests and tea hills erode and collect waste; native forest patches need restoration.",
    careImage: u("photo-1441974231531-c6227db76b6e", 1200),
  },
  {
    slug: "gokarna",
    name: "Gokarna",
    hindiName: "गोकर्ण",
    region: "Karnataka",
    tagline: "Where Goa began, and never ended",
    story:
      "A pilgrim town with beaches that outlasted the hype. Om Beach's twin bays, the cliff trails, the coconut groves — Gokarna is what coastal India felt like before the crowds found it. Keep it that way.",
    image: u("photo-1507525428034-b723cf961d3e", 1200),
    imageAlt: "Golden sand and palms at a Gokarna beach",
    heroImage: u("photo-1507525428034-b723cf961d3e", 2400),
    coordinates: "14.5477,74.3186",
    mapX: 0.3,
    mapY: 0.7,
    bestSeason: "October – March",
    knownFor: JSON.stringify(["Om Beach", "Half Moon Beach", "Shiva temple", "Cliff treks"]),
    needsCare:
      "Monsoon pushes plastics and fishing waste onto beaches; the cliff trails between coves carry seasonal litter.",
    careImage: u("photo-1506929562872-bb421503ef21", 1200),
  },
  {
    slug: "jaisalmer",
    name: "Jaisalmer",
    hindiName: "जैसलमेर",
    region: "Rajasthan",
    tagline: "The golden city in the Thar",
    story:
      "A living fort of carved sandstone rises from the desert like a mirage. Camel safaris cross dunes that change shape every night, and the desert stars put on a show no city can match.",
    image: u("photo-1533750349088-cd871a92f312", 1200),
    imageAlt: "Golden sand dunes at sunset near Jaisalmer",
    heroImage: u("photo-1533750349088-cd871a92f312", 2400),
    coordinates: "26.9157,70.9083",
    mapX: 0.16,
    mapY: 0.38,
    bestSeason: "October – February",
    knownFor: JSON.stringify(["Jaisalmer Fort", "Sam Sand Dunes", "Camel safaris", "Havelis"]),
    needsCare:
      "Desert camping leaves plastics in the dunes that take decades to degrade; the dune ecosystem needs a lighter footprint.",
    careImage: u("photo-1509316785289-025f5b846b35", 1200),
  },
  {
    slug: "rishikesh",
    name: "Rishikesh",
    hindiName: "ऋषिकेश",
    region: "Uttarakhand",
    tagline: "Where the Ganga leaves the mountains",
    story:
      "Rafts, ashrams and the sound of the Ganga running fast and clear. Rishikesh is the world's yoga capital and India's adventure town — the riverbanks here are loved hard.",
    image: u("photo-1508672019048-805c876b67e2", 1200),
    imageAlt: "The Ganga rushing through the foothills near Rishikesh",
    heroImage: u("photo-1508672019048-805c876b67e2", 2400),
    coordinates: "30.0869,78.2676",
    mapX: 0.47,
    mapY: 0.24,
    bestSeason: "September – June",
    knownFor: JSON.stringify(["Rafting", "Laxman Jhula", "Yoga ashrams", "Triveni Ghat"]),
    needsCare:
      "Rafting beaches and ghats accumulate plastic between monsoon flushes; riverbank seva mornings keep the Ganga alive.",
    careImage: u("photo-1501785888041-af3ef285b470", 1200),
  },
  {
    slug: "khajuraho",
    name: "Khajuraho",
    hindiName: "खजुराहो",
    region: "Madhya Pradesh",
    tagline: "Sculpture that froze a thousand years",
    story:
      "Erotic, celestial, and impossibly detailed: the Chandela temples of Khajuraho are a gallery of medieval Indian life carved in sandstone — dancers, lovers, warriors and gods sharing the same wall.",
    image: KHAJURAHO,
    imageAlt: "Carved sandstone temple towers at Khajuraho",
    heroImage: KHAJURAHO,
    coordinates: "24.8318,79.9199",
    mapX: 0.5,
    mapY: 0.42,
    bestSeason: "October – March",
    knownFor: JSON.stringify(["Western temples", "Kandariya Mahadeva", "Light & sound show", "Sculpture detail"]),
    needsCare:
      "The temple precincts need daily litter sweeps and shade-tree care to host visitors without degrading the site.",
    careImage: KHAJURAHO,
  },
  {
    slug: "kaziranga",
    name: "Kaziranga",
    hindiName: "काज़ीरंगा",
    region: "Assam",
    tagline: "Where the one-horned rhino still roams",
    story:
      "Tall elephant grass, flooded meadows and the Brahmaputra's braids. Kaziranga is one of the last great grasslands of Asia, home to two-thirds of the world's one-horned rhinos.",
    image: u("photo-1472214103451-9374bd1c798e", 1200),
    imageAlt: "Golden grassland at dawn in Kaziranga",
    heroImage: u("photo-1472214103451-9374bd1c798e", 2400),
    coordinates: "26.5775,93.1711",
    mapX: 0.82,
    mapY: 0.32,
    bestSeason: "November – April",
    knownFor: JSON.stringify(["One-horned rhino", "Elephant safaris", "Birdlife", "Grasslands"]),
    needsCare:
      "Buffer villages and park edges need plastic-free corridors; seasonal flooding pushes waste into the grasslands.",
    careImage: u("photo-1441974231531-c6227db76b6e", 1200),
  },
  {
    slug: "meghalaya",
    name: "Meghalaya",
    hindiName: "मेघालय",
    region: "Meghalaya",
    tagline: "The abode of clouds",
    story:
      "The wettest place on earth, where rivers run underground, waterfalls drop out of mist, and living root bridges — grown, not built — have carried people across gorges for five hundred years.",
    image: u("photo-1470071459604-3b5ec3a7fe05", 1200),
    imageAlt: "Mist over the rain-soaked hills of Meghalaya",
    heroImage: u("photo-1470071459604-3b5ec3a7fe05", 2400),
    coordinates: "25.3004,91.6990",
    mapX: 0.85,
    mapY: 0.4,
    bestSeason: "October – April",
    knownFor: JSON.stringify(["Living root bridges", "Cherrapunji", "Nohkalikai Falls", "Caves"]),
    needsCare:
      "The trek to the root bridges sees thousands of feet weekly; trails and stream banks need erosion and litter care.",
    careImage: u("photo-1470071459604-3b5ec3a7fe05", 1200),
  },
  {
    slug: "coorg",
    name: "Coorg",
    hindiName: "कोडगु",
    region: "Karnataka",
    tagline: "Scotland of the south, in coffee and mist",
    story:
      "Coffee estates spill down green valleys, pepper vines climb silver oak, and the Kaveri begins as a spring you can step across. Coorg is slow travel with a monsoon soundtrack.",
    image: u("photo-1500534314209-a25ddb2bd429", 1200),
    imageAlt: "Misty green hills and estates of Coorg",
    heroImage: u("photo-1500534314209-a25ddb2bd429", 2400),
    coordinates: "12.4244,75.7382",
    mapX: 0.4,
    mapY: 0.66,
    bestSeason: "October – March",
    knownFor: JSON.stringify(["Coffee estates", "Abbey Falls", "Brahmagiri trek", "Kaveri origin"]),
    needsCare:
      "Forest trails and stream banks in estate country collect trekking waste; native shola patches need replanting.",
    careImage: u("photo-1500534314209-a25ddb2bd429", 1200),
  },
  {
    featured: true,
    slug: "agra",
    name: "Agra",
    hindiName: "आगरा",
    region: "Uttar Pradesh",
    tagline: "The poetry of marble at dawn",
    story:
      "One building made the world measure love in marble. Agra carries the Taj Mahal and the weight of its own fame — millions of footsteps a year through a garden built for quiet. The city is learning to hold that love without losing itself.",
    image: u("photo-1564507592333-c60657eea523", 1200),
    imageAlt: "The Taj Mahal in soft morning light",
    heroImage: u("photo-1564507592333-c60657eea523", 2400),
    coordinates: "27.1767,78.0081",
    mapX: 0.5,
    mapY: 0.3,
    bestSeason: "October – March",
    knownFor: JSON.stringify(["Taj Mahal", "Agra Fort", "Fatehpur Sikri", "Mughlai food"]),
    needsCare:
      "The Taj precinct alone hosts millions of visitors yearly — its gardens, the Yamuna bank and the monument forecourts need daily litter sweeps and shade-tree care.",
    careImage: u("photo-1524492412937-b28074a5d7da", 1200),
  },
  {
    slug: "udaipur",
    name: "Udaipur",
    hindiName: "उदयपुर",
    region: "Rajasthan",
    tagline: "City of lakes and white palaces",
    story:
      "Built around a lake that never runs dry, Udaipur is Rajasthan's most romantic accident — palaces floating on water, havelis the colour of sand, and hills that hold the city like a cupped hand.",
    image: u("photo-1524230572899-a752b3835840", 1200),
    imageAlt: "Palaces and ghats along Lake Pichola in Udaipur",
    heroImage: u("photo-1524230572899-a752b3835840", 2400),
    coordinates: "24.5854,73.7125",
    mapX: 0.28,
    mapY: 0.47,
    bestSeason: "September – March",
    knownFor: JSON.stringify(["Lake Pichola", "City Palace", "Jag Mandir", "Old city lanes"]),
    needsCare:
      "Lake Pichola's banks and the old city's lanes collect festival plastics and litter; the lake that defines the city needs its caretakers.",
    careImage: u("photo-1524230572899-a752b3835840", 1200),
  },
  {
    slug: "darjeeling",
    name: "Darjeeling",
    hindiName: "दार्जिलिंग",
    region: "West Bengal",
    tagline: "Tea gardens under Kanchenjunga",
    story:
      "A hill town that smells of first-flush tea and woodsmoke. The toy train threads through cloud, Kanchenjunga appears at dawn like a rumour made real, and the tea gardens roll down into the valley.",
    image: u("photo-1622308644420-b20142dc993c", 1200),
    imageAlt: "Tea gardens and misty hills around Darjeeling",
    heroImage: u("photo-1622308644420-b20142dc993c", 2400),
    coordinates: "27.0360,88.2627",
    mapX: 0.78,
    mapY: 0.29,
    bestSeason: "October – December, March – May",
    knownFor: JSON.stringify(["Kanchenjunga views", "Toy train", "Tea estates", "Tiger Hill"]),
    needsCare:
      "Toy-train corridors and tea-garden trails carry heavy footfall; litter and trail erosion need seasonal restoration crews.",
    careImage: u("photo-1622308644420-b20142dc993c", 1200),
  },
  {
    featured: true,
    slug: "goa",
    name: "Goa",
    hindiName: "गोवा",
    region: "Goa",
    tagline: "Slow sunsets, older churches",
    story:
      "Goa is less a place than a tempo — palm shadows over laterite churches, fish curry lunches that outlast the tide, beaches that taught India to slow down. It asks only that you leave the sand as you found it.",
    image: u("photo-1512343879784-a960bf40e7f2", 1200),
    imageAlt: "Golden sands and palms along a Goa beach",
    heroImage: u("photo-1512343879784-a960bf40e7f2", 2400),
    coordinates: "15.2993,74.1240",
    mapX: 0.34,
    mapY: 0.61,
    bestSeason: "November – February",
    knownFor: JSON.stringify(["North beaches", "Old Goa churches", "Portuguese quarters", "River cruises"]),
    needsCare:
      "Monsoon pushes plastic onto the beaches tourism lives on, and heritage church precincts need gentle daily care.",
    careImage: u("photo-1506929562872-bb421503ef21", 1200),
  },
];

// ---------------------------------------------------------------- Stays

const stays = [
  { name: "The Himalayan Hermitage", dest: "leh-ladakh", price: 4200, rating: 4.8, eco: true, tags: ["Mountain view", "Wood-fired warmth", "Local staff"], image: u("photo-1506905925346-21bda4d32df4", 1200), desc: "A warm, wood-fired lodge at the edge of Leh town with the Stok range framed in every window." },
  { name: "Nubra Valley Camp", dest: "leh-ladakh", price: 3500, rating: 4.6, eco: false, tags: ["Desert camp", "Stargazing", "Bonfire"], image: u("photo-1519681393784-d120267933ba", 1200), desc: "A stargazer's camp on the Nubra sand flats, with bonfires and Bactrian camels at dawn." },
  { name: "Ganga View Homestay", dest: "varanasi", price: 2800, rating: 4.7, eco: true, tags: ["Ghat view", "Family-run", "Home-cooked"], image: u("photo-1566837945700-30057527ade0", 1200), desc: "Three generations of a Banarasi family, a balcony over the ghats, and breakfast that never ends." },
  { name: "Banares Boutique", dest: "varanasi", price: 5200, rating: 4.5, eco: false, tags: ["Heritage building", "Roof terrace", "Silk district"], image: u("photo-1548013146-72479768bada", 1200), desc: "A restored 19th-century merchant house in the silk district with a rooftop that owns the skyline." },
  { name: "Backwater Haven Houseboat", dest: "alleppey", price: 6800, rating: 4.9, eco: true, tags: ["Private houseboat", "Sunset cruise", "Kerala meals"], image: u("photo-1476514525535-07fb3b4ae5f1", 1200), desc: "A hand-built kettuvallam with two decks, a chef, and a route chosen by the tide." },
  { name: "Kerala Cocoon", dest: "alleppey", price: 3900, rating: 4.6, eco: true, tags: ["Canal side", "Cycling", "Zero-plastic"], image: u("photo-1501785888041-af3ef285b470", 1200), desc: "A zero-plastic canal-side stay where bicycles are the fleet and breakfast is toddy-shop style." },
  { name: "Tea Estate Bungalow", dest: "munnar", price: 4800, rating: 4.8, eco: true, tags: ["Estate stay", "Tea tasting", "Fireplace"], image: u("photo-1441974231531-c6227db76b6e", 1200), desc: "A planter's bungalow inside a working tea estate, with mist on the lawn by 6 am." },
  { name: "Boulder Breeze Guesthouse", dest: "hampi", price: 1600, rating: 4.4, eco: false, tags: ["Budget", "Rooftop hammocks", "Boulder view"], image: u("photo-1501785888041-af3ef285b470", 1200), desc: "Hammocks, banana-leaf meals and a rooftop that faces the boulder field head-on." },
  { name: "Virupaksha Courtyard", dest: "hampi", price: 2400, rating: 4.5, eco: false, tags: ["Temple lane", "Heritage rooms", "Courtyard dining"], image: u("photo-1590050752117-238cb0fb12b1", 1200), desc: "A courtyard guesthouse on the temple lane — the stone chariot is your morning walk." },
  { name: "Sea Shell Beach Stay", dest: "gokarna", price: 2100, rating: 4.3, eco: true, tags: ["Beachfront", "Ocean breeze", "Plastic-free"], image: u("photo-1507525428034-b723cf961d3e", 1200), desc: "Plastic-free beach huts on the sand, solar showers, and the sound of the Arabian Sea." },
  { name: "Fort View Haveli", dest: "jaisalmer", price: 3200, rating: 4.7, eco: false, tags: ["Fort view", "Sandstone haveli", "Rooftop dinner"], image: u("photo-1533750349088-cd871a92f312", 1200), desc: "A carved-sandstone haveli whose rooftop looks straight at the fort as it catches fire at sunset." },
  { name: "Dune Camp Jaal", dest: "jaisalmer", price: 2900, rating: 4.4, eco: true, tags: ["Desert camp", "Camel ride", "Solar power"], image: u("photo-1509316785289-025f5b846b35", 1200), desc: "A solar-powered desert camp where the evening programme is the sky." },
  { name: "River Song Ashram Stay", dest: "rishikesh", price: 2600, rating: 4.6, eco: true, tags: ["Ganga front", "Yoga", "Satvik meals"], image: u("photo-1508672019048-805c876b67e2", 1200), desc: "A Ganga-front ashram stay with sunrise yoga and satvik food, five minutes from the rapids." },
  { name: "Temple Lane Hotel", dest: "khajuraho", price: 3100, rating: 4.5, eco: false, tags: ["Temple walking distance", "Pool", "Garden"], image: KHAJURAHO, desc: "A garden hotel a short walk from the western temples, with a pool for the heat of noon." },
  { name: "Rhino Grass Lodge", dest: "kaziranga", price: 3800, rating: 4.7, eco: true, tags: ["Park edge", "Safari desk", "Local guides"], image: u("photo-1472214103451-9374bd1c798e", 1200), desc: "A park-edge lodge run with the village team — safaris led by local naturalists only." },
  { name: "Cloud House Homestay", dest: "meghalaya", price: 2500, rating: 4.6, eco: true, tags: ["Village stay", "Waterfall walks", "Home-cooked"], image: u("photo-1470071459604-3b5ec3a7fe05", 1200), desc: "A Khasi village homestay above the clouds, where dinner is cooked over the family hearth." },
];

// ---------------------------------------------------------------- Itineraries

const itineraries = [
  {
    dest: "leh-ladakh",
    title: "Ladakh in Six Days",
    days: 6,
    bestFor: "First-timers chasing high passes and lakes",
    summary: "Pangong, Nubra and the monasteries — with one morning given back to the lakes that made the trip possible.",
    image: u("photo-1506905925346-21bda4d32df4", 1200),
    stops: [
      { day: 1, title: "Arrive & acclimatise", description: "Land in Leh, rest, short walk around the old town and its stupas." },
      { day: 2, title: "Monasteries of the ridge", description: "Thiksey, Hemis and the cliff-top Shey palace in a full day of culture." },
      { day: 3, title: "Pangong shore, given back", description: "Drive to Pangong Tso; join the morning shoreline cleanup before the day-trippers arrive.", giveBack: "2 hours · Pangong Shoreline Cleanup" },
      { day: 4, title: "Nubra Valley sands", description: "Cross Khardung La to the sand dunes of Nubra and the double-humped Bactrian camels." },
      { day: 5, title: "Leh market & sunset fort", description: "Barter for pashmina, climb to Leh Palace for golden hour." },
      { day: 6, title: "Fly out", description: "Breakfast with a view of the Stok range, then home." },
    ],
  },
  {
    dest: "varanasi",
    title: "The Ganga Circuit",
    days: 5,
    bestFor: "Spiritual seekers & first-time India",
    summary: "Five days between Varanasi and Rishikesh — aarti, rafting, and a riverbank seva morning on the Ganga.",
    image: u("photo-1566837945700-30057527ade0", 1200),
    stops: [
      { day: 1, title: "First light on the ghats", description: "Subah-e-Banaras: a dawn boat ride past burning ghats, bathing ghats and a city waking up." },
      { day: 2, title: "Old city on foot", description: "Alleys, silk looms, kachori shops and the Kashi Vishwanath corridor." },
      { day: 3, title: "Ganga seva morning", description: "Join the ghat restoration crew at 6 am — clearing floral offerings and plastics from the steps.", giveBack: "2 hours · Ganga Ghat Restoration" },
      { day: 4, title: "Fly to Rishikesh", description: "Evening aarti at Triveni Ghat with the river running loud beside you." },
      { day: 5, title: "Raft the Ganga", description: "Morning rapids, then a farewell lunch by the river." },
    ],
  },
  {
    dest: "alleppey",
    title: "Backwaters & Tea Hills",
    days: 6,
    bestFor: "Slow travellers who want both water and mountains",
    summary: "Houseboats, canals and village life, then up into the tea hills of Munnar — with a canal cleanup in between.",
    image: u("photo-1476514525535-07fb3b4ae5f1", 1200),
    stops: [
      { day: 1, title: "Cochin, old port", description: "Chinese nets, Jewish quarter, spice markets." },
      { day: 2, title: "Houseboat night", description: "Drift the backwaters; dinner cooked on board." },
      { day: 3, title: "Canal cleanup morning", description: "Harvest water hyacinth and plastics from the canals before they choke the waterways.", giveBack: "3 hours · Backwater Canal Cleanup" },
      { day: 4, title: "Drive to Munnar", description: "Climbing through spice gardens and cardamom estates." },
      { day: 5, title: "Tea hills & shola trails", description: "Eravikulam and the misty ridge walks." },
      { day: 6, title: "Trail restoration", description: "Morning on the trail crew, then afternoon tea tasting.", giveBack: "2 hours · Tea Hills Trail Restoration" },
    ],
  },
  {
    dest: "hampi",
    title: "Hampi in Three Days",
    days: 3,
    bestFor: "History buffs & photographers",
    summary: "The ruined capital of an empire, at boulder-scale. Three unhurried days among the stones.",
    image: u("photo-1590050752117-238cb0fb12b1", 1200),
    stops: [
      { day: 1, title: "The sacred centre", description: "Virupaksha, the stone chariot, and the 1,000-pillar hall." },
      { day: 2, title: "Boulder trail care", description: "Early-morning trail cleanup across the boulder field, then Matanga Hill at sunset.", giveBack: "2 hours · Hampi Boulders Trail Care" },
      { day: 3, title: "Across the river", description: "The hippie side, banana plantations and hidden temples." },
    ],
  },
  {
    dest: "jaisalmer",
    title: "Desert Forts & Dunes",
    days: 4,
    bestFor: "Camel people & star gazers",
    summary: "A living fort, a haveli trail, and a night in the Thar that ends with a dune cleanup at dawn.",
    image: u("photo-1533750349088-cd871a92f312", 1200),
    stops: [
      { day: 1, title: "The golden fort", description: "Inside the living fort — lanes, temples and rooftop views." },
      { day: 2, title: "Havelis of Patwon", description: "Sandstone filigree at its finest, then sunset at Gadisar Lake." },
      { day: 3, title: "Into the Thar", description: "Camel safari to Sam Sand Dunes; sleep under a billion stars." },
      { day: 4, title: "Dawn dune cleanup", description: "Collect the camp's plastics before the desert wind buries them for good.", giveBack: "1.5 hours · Desert Dune Cleanup" },
    ],
  },
  {
    dest: "gokarna",
    title: "Coastal Seva & Silence",
    days: 4,
    bestFor: "Beach walkers who want to give back",
    summary: "Coves, cliff trails and long swims — with a beach sweep at Om Beach to keep the sand sacred.",
    image: u("photo-1507525428034-b723cf961d3e", 1200),
    stops: [
      { day: 1, title: "Arrive & temple town", description: "Shiva temple, main beach, fresh fish by the harbour." },
      { day: 2, title: "Cove to cove", description: "The cliff trail from Gokarna to Om Beach and Half Moon." },
      { day: 3, title: "Om Beach sweep", description: "Monsoon plastics, collected before sunrise while the tide is low.", giveBack: "2 hours · Om Beach Plastic Sweep" },
      { day: 4, title: "Slow morning", description: "One last swim, one last coconut, then onward." },
    ],
  },
  {
    dest: "kaziranga",
    title: "Northeast Wilds",
    days: 5,
    bestFor: "Wildlife lovers going beyond the safari",
    summary: "Rhinos at dawn, the wettest place on earth, and a living root bridge older than your country.",
    image: u("photo-1472214103451-9374bd1c798e", 1200),
    stops: [
      { day: 1, title: "Arrive at the park", description: "Afternoon jeep safari into the grasslands." },
      { day: 2, title: "Rhinos at dawn", description: "Elephant safari, then the interpretation centre." },
      { day: 3, title: "Eco-restoration day", description: "Buffer-zone cleanup and native planting with the village team.", giveBack: "3 hours · Kaziranga Eco-Restoration" },
      { day: 4, title: "Fly to Meghalaya", description: "Drive to Cherrapunji through clouds." },
      { day: 5, title: "Root bridges", description: "The 3,000-step trek down to Nongriat's living bridges." },
    ],
  },
];

// ---------------------------------------------------------------- Restoration events (all future-dated)

const events = [
  {
    title: "Pangong Shoreline Cleanup",
    dest: "leh-ladakh",
    date: "2026-10-17T00:00:00.000Z",
    startTime: "06:30",
    endTime: "10:00",
    meetingPoint: "Pangong Tso, Spangmik village parking",
    description:
      "Before the day-trippers arrive, we walk the Spangmik shoreline collecting plastics and camping litter left at 4,300 m. Breakfast with a lake view after.",
    whatToBring: "Gloves (provided), warm layers, water bottle, sun protection",
    capacity: 40,
    organizerName: "Sonam Dorje · Ladakh Eco Collective",
    image: u("photo-1519681393784-d120267933ba", 1200),
    status: "OPEN",
  },
  {
    title: "Riverbank Seva Morning",
    dest: "rishikesh",
    date: "2026-10-11T00:00:00.000Z",
    startTime: "06:30",
    endTime: "09:30",
    meetingPoint: "Triveni Ghat, by the rafting point",
    description:
      "Rafting beaches and ghats collect plastics between monsoon flushes. A calm morning of collection, sorting and chai with the river crew.",
    whatToBring: "Old clothes, water bottle; gloves and bags provided",
    capacity: 70,
    organizerName: "Neha Rawat · Friends of the Ganga",
    image: u("photo-1508672019048-805c876b67e2", 1200),
    status: "OPEN",
  },
  {
    title: "Ganga Ghat Restoration Morning",
    dest: "varanasi",
    date: "2026-10-25T00:00:00.000Z",
    startTime: "06:00",
    endTime: "09:00",
    meetingPoint: "Assi Ghat steps, near the banyan tree",
    description:
      "Together with the ghat seva crew, clear floral offerings, plastics and silt from the Assi steps before the day's crowds. End with prasad and chai.",
    whatToBring: "Comfortable footwear that can get wet; everything else provided",
    capacity: 60,
    organizerName: "Pankaj Kumar · Assi Ghat Seva Samiti",
    image: u("photo-1566837945700-30057527ade0", 1200),
    status: "OPEN",
  },
  {
    title: "Hampi Boulders Trail Care",
    dest: "hampi",
    date: "2026-10-31T00:00:00.000Z",
    startTime: "07:00",
    endTime: "10:30",
    meetingPoint: "Virupaksha Temple east gate",
    description:
      "The boulder trails around the temple complex carry a season of litter. We sweep the main circuit before the heat builds, then walk to Matanga Hill.",
    whatToBring: "Hat, sunscreen, 1L water; collection gear provided",
    capacity: 35,
    organizerName: "Raghav Acharya · Hampi Heritage Trust",
    image: u("photo-1590050752117-238cb0fb12b1", 1200),
    status: "OPEN",
  },
  {
    title: "Backwater Canal Cleanup",
    dest: "alleppey",
    date: "2026-11-07T00:00:00.000Z",
    startTime: "08:00",
    endTime: "12:00",
    meetingPoint: "Alleppey boat jetty, ticket counter 2",
    description:
      "Water hyacinth and plastic clog the canals tourism depends on. Crews of canoes harvest the weed and net the plastic — village lunch included after.",
    whatToBring: "Sunscreen, hat, change of clothes; life jackets provided",
    capacity: 30,
    organizerName: "Lakshmi Pillai · Backwater Care Collective",
    image: u("photo-1476514525535-07fb3b4ae5f1", 1200),
    status: "OPEN",
  },
  {
    title: "Tea Hills Trail Restoration",
    dest: "munnar",
    date: "2026-11-21T00:00:00.000Z",
    startTime: "08:00",
    endTime: "12:00",
    meetingPoint: "Munnar town, Top Station road bus stop",
    description:
      "Eroding trails and litter in the shola forest edges. We lay erosion mats, clear drains and plant native saplings — then celebrate with estate tea.",
    whatToBring: "Sturdy shoes, gloves, water; planting tools provided",
    capacity: 40,
    organizerName: "Kannan Iyer · Green Munnar Initiative",
    image: u("photo-1441974231531-c6227db76b6e", 1200),
    status: "OPEN",
  },
  {
    title: "Om Beach Plastic Sweep",
    dest: "gokarna",
    date: "2026-11-14T00:00:00.000Z",
    startTime: "07:30",
    endTime: "10:30",
    meetingPoint: "Om Beach viewpoint stairs",
    description:
      "Monsoon pushes plastics and fishing waste onto the sand. A sunrise sweep of Om and Half Moon beaches, sorted and recycled with the local crew.",
    whatToBring: "Gloves (provided), sun protection, water, reef-safe sunscreen",
    capacity: 50,
    organizerName: "Divya Shetty · Clean Coast Gokarna",
    image: u("photo-1507525428034-b723cf961d3e", 1200),
    status: "OPEN",
  },
  {
    title: "Desert Dune Cleanup at Dusk",
    dest: "jaisalmer",
    date: "2026-11-28T00:00:00.000Z",
    startTime: "16:30",
    endTime: "19:00",
    meetingPoint: "Sam Sand Dunes entry gate",
    description:
      "Camp plastics buried in the dunes degrade over decades. We walk the dune lines before sunset, then stay for the stars and a desert dinner.",
    whatToBring: "Closed shoes, scarf for the wind, water bottle",
    capacity: 60,
    organizerName: "Firoz Khan · Thar Guardians",
    image: u("photo-1533750349088-cd871a92f312", 1200),
    status: "OPEN",
  },
  {
    title: "Living Root Bridge Trail Care",
    dest: "meghalaya",
    date: "2026-11-15T00:00:00.000Z",
    startTime: "08:00",
    endTime: "13:00",
    meetingPoint: "Nongriat village entrance, Tyrna",
    description:
      "The 3,000-step descent to Nongriat's living bridges carries thousands of feet weekly. We clear stream banks and trail litter, then swim below the falls.",
    whatToBring: "Trekking shoes, change of clothes, lunch; bags provided",
    capacity: 25,
    organizerName: "Bandashisha Lyngdoh · Khasi Hills Trust",
    image: u("photo-1470071459604-3b5ec3a7fe05", 1200),
    status: "OPEN",
  },
  {
    title: "Kaziranga Eco-Restoration Day",
    dest: "kaziranga",
    date: "2026-10-18T00:00:00.000Z",
    startTime: "07:00",
    endTime: "11:00",
    meetingPoint: "Kaziranga park entrance, Kohora",
    description:
      "Buffer-zone cleanup and native grassland planting with the village team — the edge of the park is where conservation is won or lost.",
    whatToBring: "Long sleeves, hat, water; saplings and tools provided",
    capacity: 45,
    organizerName: "Bhaskar Gogoi · Kaziranga Village Collective",
    image: u("photo-1472214103451-9374bd1c798e", 1200),
    status: "OPEN",
  },
  {
    title: "Khajuraho Temple Precinct Sweep",
    dest: "khajuraho",
    date: "2026-11-01T00:00:00.000Z",
    startTime: "08:00",
    endTime: "11:00",
    meetingPoint: "Western group of temples, ticket gate",
    description:
      "A quiet morning keeping the temple gardens and walkways pristine — litter sweep, shade-tree watering and heritage-walk guidance practice.",
    whatToBring: "Comfortable shoes, water; gloves and bags provided",
    capacity: 40,
    organizerName: "Meera Shukla · Khajuraho Kala Samiti",
    image: KHAJURAHO,
    status: "OPEN",
  },
  {
    title: "Coorg Stream & Trail Care",
    dest: "coorg",
    date: "2026-11-08T00:00:00.000Z",
    startTime: "08:30",
    endTime: "12:00",
    meetingPoint: "Madikeri fort entrance",
    description:
      "Stream banks and estate trails in coffee country need a seasonal sweep, and the shola edges need new saplings. Estate lunch to close.",
    whatToBring: "Sturdy shoes, gloves, water; tools provided",
    capacity: 35,
    organizerName: "Appachu Kuttappa · Kodagu Green Brigade",
    image: u("photo-1500534314209-a25ddb2bd429", 1200),
    status: "OPEN",
  },
];

// ---------------------------------------------------------------- Stamps & rewards

const stamps = [
  { code: "RAKSHAK", name: "Rakshak", nameHindi: "रक्षक", description: "Your first verified contribution to a place you visited.", icon: "ShieldCheck", color: "#E65100", tier: 1 },
  { code: "JAL-MITRA", name: "Jal Mitra", nameHindi: "जल मित्र", description: "Gave back to a river, lake or backwater.", icon: "Waves", color: "#00695C", tier: 2 },
  { code: "SHIKHAR", name: "Shikhar", nameHindi: "शिखर", description: "Restored a place above 3,000 metres.", icon: "Mountain", color: "#546E7A", tier: 2 },
  { code: "VAN-RAKSHAK", name: "Van Rakhshak", nameHindi: "वन रक्षक", description: "Cared for a forest, trail or tea-country hillside.", icon: "Trees", color: "#2E7D32", tier: 2 },
  { code: "SAGAR-MITRA", name: "Sagar Mitra", nameHindi: "सागर मित्र", description: "Cleaned a coastline or dune field.", icon: "Anchor", color: "#1565C0", tier: 2 },
  { code: "PRABHAT", name: "Prabhat", nameHindi: "प्रभात", description: "Showed up before sunrise to serve a place.", icon: "Sunrise", color: "#C44400", tier: 2 },
  { code: "SETU", name: "Setu", nameHindi: "सेतु", description: "Three verified contributions. You are the bridge.", icon: "Link2", color: "#6D4C41", tier: 3 },
];

const rewards = [
  { code: "HOMESTAY-WELCOME", title: "Homestay Welcome", description: "15% off your first night at any partner homestay on Yatra Setu.", partner: "Yatra Setu Stays Network", type: "discount", value: "15% off", costStamps: 1, image: u("photo-1506905925346-21bda4d32df4", 800) },
  { code: "HERITAGE-WALK", title: "Free Heritage Walk", description: "A guided heritage walk in Varanasi, Hampi or Jaisalmer, on us.", partner: "Heritage India Walks", type: "freebie", value: "Free walk", costStamps: 1, image: u("photo-1524230572899-a752b3835840", 800) },
  { code: "VILLAGE-LUNCH", title: "Village Lunch for Two", description: "Organic village lunch for two at a participating community kitchen.", partner: "Community Kitchens", type: "coupon", value: "Free lunch", costStamps: 2, image: u("photo-1504674900247-0877df9cc836", 800) },
  { code: "RAFTING-ADDON", title: "Rafting Add-On", description: "Free river-rafting add-on with any itinerary that passes through Rishikesh.", partner: "Ganga Adventures", type: "freebie", value: "Free rafting", costStamps: 2, image: u("photo-1508672019048-805c876b67e2", 800) },
  { code: "ITINERARY-1000", title: "₹1000 Itinerary Credit", description: "₹1,000 off any curated Yatra Setu itinerary, anywhere in India.", partner: "Yatra Setu Travel", type: "discount", value: "₹1000 off", costStamps: 3, image: u("photo-1500534314209-a25ddb2bd429", 800) },
  { code: "STAY-PLUS", title: "Stay Plus — Free Night", description: "One free night after any 3-night stay at an eco partner property.", partner: "EcoStay Collective", type: "freebie", value: "Free night", costStamps: 4, image: u("photo-1520250497591-112f2f40a3f4", 800) },
];

async function main() {
  console.log("🌱 Seeding Yatra Setu…");

  // Demo accounts (V2): admin verifies leaders, the lead creates events,
  // the traveller is the demo login for the whole product loop.
  const demoPassword = await bcrypt.hash("seva@2026", 10);
  await prisma.user.upsert({
    where: { email: "admin@yatrasetu.in" },
    update: { role: "ADMIN" },
    create: {
      name: "Yatra Setu Admin",
      email: "admin@yatrasetu.in",
      passwordHash: demoPassword,
      role: "ADMIN",
      bio: "Platform steward — verifies community leads and keeps the ledger honest.",
      city: "New Delhi",
    },
  });
  await prisma.user.upsert({
    where: { email: "meera@yatrasetu.in" },
    update: {},
    create: {
      name: "Meera Iyer",
      email: "meera@yatrasetu.in",
      passwordHash: demoPassword,
      role: "TRAVELLER",
      bio: "Slow traveller. Backwaters, tea hills and every shoreline cleanup on the way.",
      city: "Kochi",
      homeRegion: "Kerala",
    },
  });

  // Community lead organizer
  const organizer = await prisma.user.upsert({
    where: { email: "community@yatrasetu.in" },
    update: { isOrganizer: true, role: "LEADER" },
    create: {
      name: "Aarav Mehta",
      email: "community@yatrasetu.in",
      passwordHash: demoPassword,
      role: "LEADER",
      isOrganizer: true,
      bio: "Community lead connecting travellers with restoration crews across India.",
      city: "Bengaluru",
    },
  });

  for (const d of destinations) {
    await prisma.destination.upsert({
      where: { slug: d.slug },
      update: d,
      create: d,
    });
  }
  console.log(`  · ${destinations.length} destinations`);

  for (const s of stays) {
    const dest = await prisma.destination.findUniqueOrThrow({ where: { slug: s.dest } });
    const data = {
      name: s.name,
      description: s.desc,
      image: s.image,
      pricePerNight: s.price,
      rating: s.rating,
      amenityTags: JSON.stringify(s.tags),
      ecoBadge: s.eco,
      destinationId: dest.id,
    };
    await prisma.stay.upsert({
      where: { id: `${s.name}-${dest.id}` },
      update: data,
      create: data,
    });
  }
  console.log(`  · ${stays.length} stays`);

  for (const it of itineraries) {
    const dest = await prisma.destination.findUniqueOrThrow({ where: { slug: it.dest } });
    const existing = await prisma.itinerary.findFirst({ where: { title: it.title } });
    if (existing) {
      await prisma.itineraryStop.deleteMany({ where: { itineraryId: existing.id } });
      await prisma.itinerary.delete({ where: { id: existing.id } });
    }
    const created = await prisma.itinerary.create({
      data: {
        title: it.title,
        destinationId: dest.id,
        durationDays: it.days,
        summary: it.summary,
        image: it.image,
        bestFor: it.bestFor,
        stops: {
          create: it.stops.map((st) => ({ day: st.day, title: st.title, description: st.description, giveBack: st.giveBack })),
        },
      },
    });
    void created;
  }
  console.log(`  · ${itineraries.length} itineraries`);

  for (const e of events) {
    const dest = await prisma.destination.findUniqueOrThrow({ where: { slug: e.dest } });
    const slug = e.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const data = {
      title: e.title,
      slug,
      destinationId: dest.id,
      date: new Date(e.date),
      startTime: e.startTime,
      endTime: e.endTime,
      meetingPoint: e.meetingPoint,
      description: e.description,
      whatToBring: e.whatToBring,
      capacity: e.capacity,
      organizerName: e.organizerName,
      organizerId: organizer.id,
      image: e.image,
      status: e.status,
      checkinCode: deriveCheckinCode(slug, e.title),
    };
    await prisma.restorationEvent.upsert({
      where: { slug: data.slug },
      update: data,
      create: data,
    });
  }
  console.log(`  · ${events.length} restoration events`);

  for (const s of stamps) {
    await prisma.stamp.upsert({ where: { code: s.code }, update: s, create: s });
  }
  console.log(`  · ${stamps.length} stamps`);

  for (const r of rewards) {
    await prisma.reward.upsert({ where: { code: r.code }, update: r, create: r });
  }
  console.log(`  · ${rewards.length} rewards`);

  // Spot reports ("trending spot alerts") — anonymous, so no user link.
  const spotReports = [
    {
      spotName: "Baga Beach",
      region: "Goa",
      category: "OVERCROWDING",
      description:
        "Weekend crowds have outgrown the shore — lifeline markers buried under rented beds and the bins overflow by noon.",
      status: "VERIFIED",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
    },
    {
      spotName: "Marine Drive promenade",
      region: "Mumbai, Maharashtra",
      category: "WASTE",
      description:
        "Food-stall waste piling along the seawall after the evening rush; the municipal bins aren't being lifted on time.",
      status: "OPEN",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 7),
    },
    {
      spotName: "Elephant Falls approach",
      region: "Shillong, Meghalaya",
      category: "DAMAGE",
      description:
        "Footpath railings loosened by landslide-season footfall; several steps below the viewpoint are cracked.",
      status: "OPEN",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26),
    },
    {
      spotName: "Hawa Mahal courtyard",
      region: "Jaipur, Rajasthan",
      category: "OVERCROWDING",
      description:
        "Reported last month during the weekend surge — extra ticketing lanes have since eased it.",
      status: "RESOLVED",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 31),
    },
  ];
  for (const r of spotReports) {
    const existing = await prisma.spotReport.findFirst({
      where: { spotName: r.spotName, category: r.category },
    });
    if (!existing) await prisma.spotReport.create({ data: r });
  }
  console.log(`  · ${spotReports.length} spot reports`);

  // Backfill service points from verified contributions (100 per check-in) —
  // keeps points honest with the ledger after the V2 migration.
  const users = await prisma.user.findMany({
    select: { id: true, _count: { select: { attendances: true } } },
  });
  for (const u of users) {
    const points = u._count.attendances * 100;
    if (points > 0) {
      await prisma.user.update({ where: { id: u.id }, data: { points } });
    }
  }
  console.log(`  · service points backfilled for ${users.length} users`);

  console.log("✅ Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());