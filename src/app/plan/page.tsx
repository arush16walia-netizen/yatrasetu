import { redirect } from "next/navigation";

/** Plan lives in My Yatra — this alias keeps old links working. */
export default function PlanPage() {
  redirect("/itinerary");
}
