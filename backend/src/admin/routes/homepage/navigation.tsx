import {
  Button,
  Container,
  Heading,
  Label,
  Switch,
  Text,
  toast,
} from "@medusajs/ui"
import { useEffect, useState } from "react"
import { sdk } from "../../lib/client"

export default function NavigationSection({
  showDiscounts,
  onSaved,
}: {
  showDiscounts: boolean
  onSaved: () => void
}) {
  const [enabled, setEnabled] = useState(showDiscounts)
  const [pending, setPending] = useState(false)
  useEffect(() => setEnabled(showDiscounts), [showDiscounts])

  async function save() {
    setPending(true)
    try {
      const result = await sdk.client.fetch<{ revalidated: boolean }>(
        "/admin/homepage",
        {
          method: "POST",
          body: { navigation: { show_discounts: enabled } },
        }
      )
      if (result.revalidated) toast.success("Offer visibility saved")
      else
        toast.warning(
          "Offer visibility saved. Storefront cache refresh is pending."
        )
      onSaved()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save offer visibility"
      )
    } finally {
      setPending(false)
    }
  }

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <Heading level="h2">Oferta</Heading>
        <Text size="small" className="text-ui-fg-subtle">
          Show or hide the Oferta link in desktop and mobile navigation and
          the homepage offers carousel. The carousel appears when discounted
          products are available.
        </Text>
      </div>
      <div className="flex flex-col gap-4 px-6 py-4">
        <div className="flex items-center gap-3">
          <Switch
            id="show-discounts"
            checked={enabled}
            onCheckedChange={setEnabled}
            disabled={pending}
          />
          <Label htmlFor="show-discounts">
            Show offers link and homepage section
          </Label>
        </div>
        <div>
          <Button
            size="small"
            onClick={save}
            disabled={pending}
            isLoading={pending}
          >
            Save offer visibility
          </Button>
        </div>
      </div>
    </Container>
  )
}
