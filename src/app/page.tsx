import { Hero } from "@/components/home/hero";
import { Problem } from "@/components/home/problem";
import { Idea } from "@/components/home/idea";
import { Discover } from "@/components/home/discover";
import { Events } from "@/components/home/events";
import { ImpactJourney } from "@/components/home/impact";
import { Verification } from "@/components/home/verification";
import { Rewards } from "@/components/home/rewards";
import { Passport } from "@/components/home/passport";
import { CoreLoop } from "@/components/home/loop";
import { FinalCTA } from "@/components/home/final-cta";
import { getDestinations, getUpcomingEvents, getStamps, getRewards } from "@/lib/queries";

export default async function Home() {
  const [destinations, events, stamps, rewards] = await Promise.all([
    getDestinations(6),
    getUpcomingEvents(3),
    getStamps(),
    getRewards(),
  ]);

  return (
    <>
      <Hero destinations={destinations} />
      <Problem />
      <Idea />
      <Discover destinations={destinations} />
      <Events events={events} />
      <ImpactJourney />
      <Verification />
      <Rewards stamps={stamps} rewards={rewards} />
      <Passport />
      <CoreLoop />
      <FinalCTA />
    </>
  );
}