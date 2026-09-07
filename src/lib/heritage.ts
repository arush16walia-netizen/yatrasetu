import "server-only";

/**
 * Heritage storyteller: a curated index of Indian heritage sites with
 * deep content resolved live from the Wikipedia REST API (keyless, free).
 * A failed Wikipedia fetch degrades to the curated blurb — the page never breaks.
 */

export type HeritageSite = {
  slug: string;
  name: string;
  hindiName: string;
  city: string;
  state: string;
  era: string;
  /** Our own words — always rendered, even offline from Wikipedia. */
  blurb: string;
  wikiTitle: string; // exact article title for the REST summary API
  destinationSlug: string | null; // link into Explore where a Yatra Setu destination exists
};

export const HERITAGE_SITES: HeritageSite[] = [
  {
    slug: "hampi",
    name: "Hampi",
    hindiName: "हम्पी",
    city: "Hampi",
    state: "Karnataka",
    era: "14th–16th century · Vijayanagara",
    blurb:
      "The boulder-strewn capital of Vijayanagara, once among the world's largest cities. Its temple quarters and market streets still hold the scale of an empire that traded in diamonds.",
    wikiTitle: "Hampi",
    destinationSlug: null,
  },
  {
    slug: "ajanta-caves",
    name: "Ajanta Caves",
    hindiName: "अजंता गुफाएँ",
    city: "Aurangabad",
    state: "Maharashtra",
    era: "2nd century BCE – 6th century CE",
    blurb:
      "Thirty rock-cut prayer halls and monasteries cut into a horseshoe gorge, holding the finest surviving murals of ancient India — painted by lamplight, two thousand years ago.",
    wikiTitle: "Ajanta Caves",
    destinationSlug: null,
  },
  {
    slug: "konark-sun-temple",
    name: "Konark Sun Temple",
    hindiName: "कोणार्क सूर्य मंदिर",
    city: "Konark",
    state: "Odisha",
    era: "13th century · Eastern Ganga",
    blurb:
      "A colossal solar chariot carved from khondalite stone — twenty-four wheels and seven horses frozen mid-pull. Each wheel doubles as a working sundial.",
    wikiTitle: "Konark Sun Temple",
    destinationSlug: null,
  },
  {
    slug: "qutub-minar",
    name: "Qutub Minar",
    hindiName: "क़ुतुब मीनार",
    city: "Delhi",
    state: "Delhi",
    era: "12th–13th century",
    blurb:
      "The tallest brick minaret on earth, rising 73 metres over the Quwwat-ul-Islam mosque and the rust-still Iron Pillar that has not corroded in sixteen centuries.",
    wikiTitle: "Qutb Minar",
    destinationSlug: null,
  },
  {
    slug: "meenakshi-temple",
    name: "Meenakshi Temple",
    hindiName: "मीनाक्षी मंदिर",
    city: "Madurai",
    state: "Tamil Nadu",
    era: "Current form 17th century · Nayak",
    blurb:
      "A walled temple-city around the goddess Meenakshi, crowned by fourteen painted gateway towers — the southern gopuram rises fifty metres in a riot of sculpture.",
    wikiTitle: "Meenakshi Temple",
    destinationSlug: null,
  },
  {
    slug: "taj-mahal",
    name: "Taj Mahal",
    hindiName: "ताज महल",
    city: "Agra",
    state: "Uttar Pradesh",
    era: "17th century · Mughal",
    blurb:
      "Shah Jahan's marble mausoleum for Mumtaz Mahal — pietra dura inlay, a perfect charbagh, and a dome that changes colour with the light of the Yamuna's day.",
    wikiTitle: "Taj Mahal",
    destinationSlug: null,
  },
  {
    slug: "ellora-caves",
    name: "Ellora Caves",
    hindiName: "एलोरा गुफाएँ",
    city: "Aurangabad",
    state: "Maharashtra",
    era: "6th–10th century",
    blurb:
      "Thirty-four caves dug by Buddhist, Hindu and Jain communities side by side — including the Kailasa temple, carved top-down from a single basalt cliff.",
    wikiTitle: "Ellora Caves",
    destinationSlug: null,
  },
  {
    slug: "khajuraho",
    name: "Khajuraho Temples",
    hindiName: "खजुराहो",
    city: "Chhatarpur",
    state: "Madhya Pradesh",
    era: "10th–11th century · Chandela",
    blurb:
      "A thousand years old and famous for much more than its celebrated sculpture — the temples are a masterclass in nagara architecture, aligned to monsoon light.",
    wikiTitle: "Khajuraho Group of Monuments",
    destinationSlug: null,
  },
];

export function heritageSite(slug: string): HeritageSite | undefined {
  return HERITAGE_SITES.find((s) => s.slug === slug);
}

export type HeritageDetail = {
  site: HeritageSite;
  /** Wikipedia summary, or null when the API is unreachable. */
  wiki: { extract: string; articleUrl: string } | null;
};

/** Wikipedia REST summary, cached a day; degrades to null (UI falls back to our blurb). */
export async function heritageDetail(site: HeritageSite): Promise<HeritageDetail> {
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(site.wikiTitle)}?redirect=true`,
      { next: { revalidate: 86_400 }, headers: { Accept: "application/json" } },
    );
    if (!res.ok) throw new Error(String(res.status));
    const data = (await res.json()) as { extract?: string; content_urls?: { desktop?: { page?: string } } };
    const extract = data.extract?.trim();
    if (!extract) throw new Error("empty extract");
    return { site, wiki: { extract, articleUrl: data.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${site.wikiTitle}` } };
  } catch {
    return { site, wiki: null };
  }
}
