import { prisma } from "@/lib/prisma";

/** Stable human-friendly check-in code for an event, e.g. "RIVER-4821". */
export function deriveCheckinCode(slug: string, title: string): string {
  const words = title.toLowerCase().replace(/[^a-z0-9 ]/g, "").split(/\s+/).filter(Boolean);
  const prefix = (words[0] ?? slug.slice(0, 4)).slice(0, 6).toUpperCase();
  let hash = 0;
  for (let i = 0; i < slug.length; i++) hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  const digits = String(hash % 10000).padStart(4, "0");
  return `${prefix}-${digits}`;
}

/** Which stamp an event at this destination awards on verified check-in. */
export function stampCodeForDestination(slug: string): string {
  switch (slug) {
    case "rishikesh":
    case "varanasi":
    case "alleppey":
      return "JAL-MITRA";
    case "leh-ladakh":
      return "SHIKHAR";
    case "munnar":
    case "meghalaya":
    case "kaziranga":
    case "coorg":
      return "VAN-RAKSHAK";
    case "gokarna":
    case "jaisalmer":
      return "SAGAR-MITRA";
    default:
      return "RAKSHAK";
  }
}

export type AwardedStamp = { code: string; name: string; nameHindi: string | null; icon: string; color: string | null; tier: number };

/**
 * Award stamps for a verified attendance:
 * - the destination's stamp (e.g. Jal Mitra for river events)
 * - Prabhat when the event starts before 8am
 * - Rakshak for the traveller's very first verified contribution
 * - Setu after three verified contributions in total
 */
export async function awardStamps(
  userId: string,
  destinationSlug: string,
  eventStartTime: string,
  priorAttendanceCount: number,
): Promise<AwardedStamp[]> {
  const awarded: AwardedStamp[] = [];

  const owned = await prisma.userStamp.findMany({
    where: { userId },
    select: { stamp: { select: { code: true } } },
  });
  const ownedCodes = new Set(owned.map((o) => o.stamp.code));
  const codes = new Set<string>([stampCodeForDestination(destinationSlug)]);

  if (priorAttendanceCount === 0) codes.add("RAKSHAK");
  if (eventStartTime < "08:00") codes.add("PRABHAT");
  if (priorAttendanceCount + 1 >= 3) codes.add("SETU");

  for (const code of codes) {
    if (ownedCodes.has(code)) continue;
    const stamp = await prisma.stamp.findUnique({ where: { code } });
    if (!stamp) continue;
    await prisma.userStamp.create({ data: { userId, stampId: stamp.id } });
    awarded.push({
      code: stamp.code,
      name: stamp.name,
      nameHindi: stamp.nameHindi,
      icon: stamp.icon,
      color: stamp.color,
      tier: stamp.tier,
    });
  }

  return awarded;
}

/** Whether check-in is currently open for an event (event day + 24h grace). */
export function checkinWindowOpen(eventDate: Date): boolean {
  const start = new Date(eventDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(eventDate);
  end.setDate(end.getDate() + 1);
  end.setHours(23, 59, 59, 999);
  const now = new Date();
  return now >= start && now <= end;
}