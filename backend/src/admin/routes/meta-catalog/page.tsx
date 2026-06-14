import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Buildings, Link } from "@medusajs/icons"
import { Button, Container, Heading, Input, Label, Text, toast } from "@medusajs/ui"

const getFeedUrl = () => {
  const baseUrl = window.location.origin.replace(/\/+$/, "")

  return `${baseUrl}/meta/catalog`
}

const MetaCatalogPage = () => {
  const feedUrl = getFeedUrl()

  const copyFeedUrl = async () => {
    await navigator.clipboard.writeText(feedUrl)
    toast.success("Feed URL copied")
  }

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <Heading level="h1">Meta Catalog</Heading>
        <Text size="small" className="text-ui-fg-subtle">
          Use this URL as a scheduled data feed in Meta Commerce Manager.
        </Text>
      </div>

      <div className="grid gap-y-6 px-6 py-4">
        <div className="grid max-w-[720px] gap-y-2">
          <Label htmlFor="meta-feed-url">XML feed URL</Label>
          <div className="flex gap-2">
            <Input id="meta-feed-url" value={feedUrl} readOnly />
            <Button size="small" variant="secondary" onClick={copyFeedUrl}>
              <Link />
              Copy
            </Button>
          </div>
        </div>

        <div className="grid max-w-[720px] gap-y-2">
          <Text size="small" leading="compact" weight="plus">
            Feed behavior
          </Text>
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            Every published variant is exported. Collection and category names
            are included in product_type so product sets can be filtered in
            Meta. Variants without managed inventory are always marked in stock.
          </Text>
        </div>

        <div className="grid max-w-[720px] gap-y-2">
          <Text size="small" leading="compact" weight="plus">
            Internal labels
          </Text>
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            Open a product and edit its Meta custom labels. The five values are
            exported as custom_label_0 through custom_label_4 for additional
            product-set filters.
          </Text>
        </div>
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Meta Catalog",
  icon: Buildings,
})

export default MetaCatalogPage
