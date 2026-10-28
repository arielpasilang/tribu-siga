import AdventuresList from "../../src/components/adventures-list"
import { getExpeditions } from "../../src/lib/content"

export const revalidate = 60

export const metadata = {
  title: "Hikes & Milestone",
  description:
    "The Tribu Siga logbook — every climb, training day, and milestone since January 2017.",
}

export default async function AdventuresPage() {
  const adventures = await getExpeditions()
  return <AdventuresList adventures={adventures} />
}
