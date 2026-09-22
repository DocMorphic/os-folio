import type { Metadata } from "next";
import { WorldPage } from "@/components/WorldPage";

export const metadata: Metadata = {
  title: "V2 | Dharmay Dave",
  description: "A little world on the water. Explore Dharmay's work, photographs, and story.",
};

export default function V2() {
  return <WorldPage />;
}
