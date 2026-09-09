import { Metadata } from "next"

import OurDifference from "@modules/about/components/our-difference"

export const metadata: Metadata = {
  title: "Diferenca jonë | YCO",
  description:
    "Çfarë e ndan YCO nga pjesa tjetër: përbërës organikë, paketim i riciklueshëm dhe formula pa mikroplastikë, sulfate apo përbërës me origjinë shtazore.",
}

export default function OurDifferencePage() {
  return <OurDifference />
}
