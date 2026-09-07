import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

/**
 * Release-candidate probe: rotating-QR check-in + Swachh Yatra litter reports
 * + /plan alias + navbar SSR. Exercises real HTTP entry points against a
 * running dev server, then removes every row it created so the demo ledger
 * stays pristine.
 *
 * Usage: RC_BASE=http://127.0.0.1:64010 npx tsx scripts/rc-check.ts
 */

const BASE = process.env.RC_BASE ?? "http://127.0.0.1:64010";
const PASSWORD = "seva@2026";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./prisma/dev.db" });
const prisma = new PrismaClient({ adapter });

let failures = 0;
function check(name: string, ok: boolean, detail = "") {
  const mark = ok ? "PASS" : "FAIL";
  if (!ok) failures++;
  console.log(`${mark}  ${name}${detail ? ` — ${detail}` : ""}`);
}

/** Assert one response against a status + optional body predicate. */
function row(name: string, status: number, body: unknown, want: { status: number; ok?: (b: any) => boolean }) {
  const ok = status === want.status && (want.ok?.(body) ?? true);
  check(name, ok, `status ${status} ${JSON.stringify(body)}`);
}

async function login(email: string): Promise<string> {
  const jar: string[] = [];
  const r1 = await fetch(`${BASE}/api/auth/csrf`);
  const { csrfToken } = (await r1.json()) as { csrfToken: string };
  jar.push(...(r1.headers.getSetCookie?.() ?? []));
  const r2 = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Cookie: jar.map((c) => c.split(";")[0]).join("; ") },
    body: new URLSearchParams({ csrfToken, email, password: PASSWORD, callbackUrl: `${BASE}/`, json: "true" }),
    redirect: "manual",
  });
  jar.push(...(r2.headers.getSetCookie?.() ?? []));
  return jar.map((c) => c.split(";")[0]).join("; ");
}

const post = (cookie: string, body: unknown) =>
  ({ method: "POST", headers: { "Content-Type": "application/json", Cookie: cookie }, body: JSON.stringify(body) }) as const;

async function main() {
  // ---------- A. anonymous access gates (table: behavior → expected status)
  const planRes = await fetch(`${BASE}/plan`, { redirect: "manual" });
  check("/plan redirects to My Yatra", [301, 302, 303, 307, 308].includes(planRes.status) && (planRes.headers.get("location") ?? "").includes("/itinerary"), `status ${planRes.status} → ${planRes.headers.get("location")}`);

  const gateRows: [string, Promise<Response>, number][] = [
    ["qr-token rejects anonymous callers", fetch(`${BASE}/api/events/bogus-id/qr-token`), 401],
    [
      "litter API rejects anonymous callers",
      fetch(`${BASE}/api/report-litter`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" }),
      401,
    ],
    ["/report-litter gates on sign-in", fetch(`${BASE}/report-litter`, { redirect: "manual" }), 307],
  ];
  for (const [name, p, status] of gateRows) {
    const res = await p;
    check(name, res.status === status || (name.startsWith("/report") && res.status === 302), `status ${res.status}`);
  }

  // ---------- B. snapshot + login + SSR
  const meera = await prisma.user.findUniqueOrThrow({ where: { email: "meera@yatrasetu.in" }, select: { id: true, points: true } });
  const stampsBefore = await prisma.userStamp.findMany({ where: { userId: meera.id }, select: { id: true } });

  const meeraCookie = await login("meera@yatrasetu.in");
  const session = (await fetch(`${BASE}/api/auth/session`, { headers: { Cookie: meeraCookie } }).then((r) => r.json())) as { user?: unknown };
  check("demo traveller signs in", Boolean(session.user));

  const home = await fetch(`${BASE}/`, { headers: { Cookie: meeraCookie } });
  // Dropdown items + mobile overlay mount client-side; SSR must contain the
  // always-rendered nav labels without crashing.
  check(
    "homepage SSRs with dropdown navbar",
    home.status === 200 && (await home.text()).includes("Start Your Yatra"),
    `status ${home.status}`,
  );

  // ---------- B2. flagship pages serve their real content (public)
  const pageRows: [string, Promise<Response>, string[]][] = [
    ["heritage index serves all 8 sites", fetch(`${BASE}/heritage`), ["Hampi", "Ajanta Caves", "Konark"]],
    [
      "heritage detail narrates + falls back to curated blurb",
      fetch(`${BASE}/heritage/hampi`),
      ["Listen to this story", "Vijayanagara", "Wikipedia"],
    ],
    ["phrasebook serves all 6 regions + taboos", fetch(`${BASE}/phrasebook`), ["Julley", "Khamma Ghani", "Dev borem korum", "Eco-etiquette"]],
    ["offline pass serves dialers + caching shell", fetch(`${BASE}/offline-pass`), ["Emergency dialers", "tel:112", "tel:1078"]],
  ];
  for (const [name, p, needles] of pageRows) {
    const res = await p;
    const html = await res.text();
    check(name, res.status === 200 && needles.every((n) => html.includes(n)), `status ${res.status}${res.status === 200 ? "" : ` — missing: ${needles.filter((n) => !html.includes(n)).join(", ")}`}`);
  }

  // ---------- C. litter reporter (valid + boundary)
  const litterRes = await fetch(`${BASE}/api/report-litter`, post(meeraCookie, {
    spotName: "RC probe trail dump", region: "Test Region", category: "PLASTIC", volume: "MODERATE",
    latitude: 25.3004, longitude: 91.699, hasPhoto: false,
  }));
  const litter = (await litterRes.json()) as { ticketCode?: string; pointsAwarded?: number };
  row(
    "litter report files + awards +50", litterRes.status, litter,
    { status: 201, ok: (b) => b.pointsAwarded === 50 && /^SW-\d{4}-[A-Z0-9]{4}$/.test(b.ticketCode) },
  );

  const invalidRows: [string, unknown, number][] = [
    ["litter API rejects invalid category", { spotName: "RC probe bad", category: "NUCLEAR", volume: "LIGHT" }, 422],
    ["litter API rejects out-of-range latitude", { spotName: "RC probe bad", category: "PLASTIC", volume: "LIGHT", latitude: 95 }, 422],
  ];
  for (const [name, body, status] of invalidRows) {
    const res = await fetch(`${BASE}/api/report-litter`, post(meeraCookie, body));
    row(name, res.status, undefined, { status });
  }

  check("/report-litter renders signed-in", (await fetch(`${BASE}/report-litter`, { headers: { Cookie: meeraCookie } })).status === 200);

  // ---------- D. rotating QR loop
  const leaderCookie = await login("community@yatrasetu.in");
  const leaderSession = (await fetch(`${BASE}/api/auth/session`, { headers: { Cookie: leaderCookie } }).then((r) => r.json())) as { user?: unknown };
  check("demo leader signs in", Boolean(leaderSession.user));

  // Event must be strictly future (create validates) but on TODAY in server-local
  // time — check-in opens on the event day, and now+2h can cross local midnight (IST evening).
  const plus30 = new Date(Date.now() + 30 * 60_000);
  const date =
    plus30.getDate() === new Date().getDate()
      ? plus30.toISOString()
      : new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 23, 59).toISOString();

  async function createEvent(title: string): Promise<{ id: string; slug: string }> {
    const res = await fetch(`${BASE}/api/events/create`, post(leaderCookie, {
      title, destinationSlug: "rishikesh", description: "Probe event — deleted by the probe afterwards.",
      date, startTime: "06:00", meetingPoint: "Probe meeting point", capacity: 10,
    }));
    if (!res.ok) throw new Error(`create failed ${res.status}: ${await res.text()}`);
    const { event } = (await res.json()) as { event: { slug: string } };
    // No public list route — resolve the id from the ledger; RSVP/check-in still go over HTTP.
    return prisma.restorationEvent.findUniqueOrThrow({ where: { slug: event.slug }, select: { id: true, slug: true } });
  }

  const ev1 = await createEvent("RC Probe Rotating Check");
  const ev2 = await createEvent("RC Probe Static Fallback");

  for (const ev of [ev1, ev2]) {
    const res = await fetch(`${BASE}/api/events/${ev.id}/rsvp`, { method: "POST", headers: { Cookie: meeraCookie } });
    check(`RSVP accepted for ${ev.slug.slice(0, 20)}`, res.status === 200 || res.status === 201, `status ${res.status}`);
  }

  // The static check-in code is only visible on the board — read it through the real UI.
  async function boardCode(slug: string): Promise<string> {
    const html = await (await fetch(`${BASE}/events/${slug}/board`, { headers: { Cookie: meeraCookie } })).text();
    const match = html.match(/[A-Z0-9]{1,6}-\d{4}/);
    if (!match) throw new Error(`no check-in code found on board for ${slug}`);
    return match[0];
  }

  const code1 = await boardCode(ev1.slug);
  const tokenRes = await fetch(`${BASE}/api/events/${ev1.id}/qr-token`, { headers: { Cookie: meeraCookie } });
  const token = (await tokenRes.json()) as { token?: string; expiresIn?: number };
  row(
    "qr-token issues a rotating token", tokenRes.status, token,
    { status: 200, ok: (b) => /^[A-Z0-9]{8}$/.test(b.token ?? "") && (b.expiresIn ?? 0) <= 15 },
  );

  // Check-in variants: behavior → expected status + shape.
  const checkin = (ev: { id: string }, body: unknown) => fetch(`${BASE}/api/events/${ev.id}/checkin`, post(meeraCookie, body));
  const variantRows: [string, Promise<Response>, { status: number; ok?: (b: any) => boolean }][] = [
    [
      "CODE.TOKEN check-in verifies + awards 100 pts",
      checkin(ev1, { code: `${code1}.${token.token}`, latitude: 30.0869, longitude: 78.2676 }),
      { status: 200, ok: (b) => b.pointsAwarded === 100 && b.attendance?.method === "rotating-qr" && b.attendance?.geoVerified === true },
    ],
    ["duplicate check-in rejected", checkin(ev1, { code: `${code1}.${token.token}` }), { status: 409 }],
    [
      "forged/expired token rejected",
      checkin(ev2, { code: `${await boardCode(ev2.slug)}.AAAAAAAA` }),
      { status: 403, ok: (b) => String(b.error).toLowerCase().includes("expired") },
    ],
    [
      "check-in far outside the 200m geofence rejected",
      checkin(ev2, { code: await boardCode(ev2.slug), latitude: 28.6139, longitude: 77.209 }),
      { status: 403, ok: (b) => String(b.error).includes("km from the meeting point") },
    ],
    [
      "static printed code still works (fallback)",
      checkin(ev2, { code: await boardCode(ev2.slug) }),
      { status: 200, ok: (b) => b.attendance?.method === "code" && b.attendance?.geoVerified === false },
    ],
  ];
  for (const [name, p, want] of variantRows) {
    const res = await p;
    row(name, res.status, await res.json(), want);
  }

  const board = await fetch(`${BASE}/events/${ev1.slug}/board`, { headers: { Cookie: meeraCookie } });
  check("board renders rotating QR countdown", board.status === 200 && (await board.text()).includes("rotates in"), `status ${board.status}`);

  // ---------- E. cleanup — restore the ledger to its pre-probe state
  const rsvpIds = await prisma.eventRSVP.findMany({ where: { event: { slug: { in: [ev1.slug, ev2.slug] } } }, select: { id: true } });
  const rsvpIdList = rsvpIds.map((r) => r.id);
  await prisma.attendanceRecord.deleteMany({ where: { rsvpId: { in: rsvpIdList } } });
  await prisma.eventRSVP.deleteMany({ where: { id: { in: rsvpIdList } } });
  await prisma.restorationEvent.deleteMany({ where: { slug: { in: [ev1.slug, ev2.slug] } } });
  if (litter.ticketCode) await prisma.litterReport.deleteMany({ where: { ticketCode: litter.ticketCode } });

  const newStamps = (await prisma.userStamp.findMany({ where: { userId: meera.id }, select: { id: true } })).filter(
    (s) => !stampsBefore.some((b) => b.id === s.id),
  );
  if (newStamps.length) await prisma.userStamp.deleteMany({ where: { id: { in: newStamps.map((s) => s.id) } } });
  await prisma.user.update({ where: { id: meera.id }, data: { points: meera.points } });

  console.log(`\ncleanup: probe events, RSVPs, attendance, litter report, ${newStamps.length} stamps removed; points restored to ${meera.points}`);
  console.log(failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
  await prisma.$disconnect();
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(async (err) => {
  console.error("PROBE CRASHED:", err);
  await prisma.$disconnect();
  process.exit(2);
});
