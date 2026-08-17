import { Metadata } from "next"

import AboutStory from "@modules/about/components/about-story"

export const metadata: Metadata = {
  title: "Rreth nesh | YCO",
  description:
    "Njihuni me historinë, vlerat dhe mënyrën se si YCO përzgjedh produkte të ndershme për kujdesin ndaj vetes dhe planetit.",
}

export default function AboutPage() {
  return <AboutStory />
}
