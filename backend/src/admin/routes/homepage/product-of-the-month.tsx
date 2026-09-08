import { Button, Container, FocusModal, Heading, Input, Label, Table, Text, Textarea, toast } from "@medusajs/ui"
import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { sdk } from "../../lib/client"

export type ProductOfTheMonthSettings = { product_id: string | null; description: string | null }
type Product = { id: string; title: string; thumbnail: string | null; description?: string; subtitle?: string; metadata?: Record<string, unknown> }

export default function ProductOfTheMonthSection({ settings, onSaved }: {
  settings?: ProductOfTheMonthSettings
  onSaved: () => void
}) {
  const [productId, setProductId] = useState(settings?.product_id ?? null)
  const [description, setDescription] = useState(settings?.description ?? "")
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [query, setQuery] = useState("")
  const [offset, setOffset] = useState(0)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    setProductId(settings?.product_id ?? null)
    setDescription(settings?.description ?? "")
  }, [settings?.product_id, settings?.description])
  useEffect(() => {
    const timer = setTimeout(() => { setQuery(search); setOffset(0) }, 250)
    return () => clearTimeout(timer)
  }, [search])

  const selected = useQuery({
    queryKey: ["homepage-potm-product", productId],
    queryFn: () => sdk.client.fetch<{ product: Product }>(`/admin/products/${productId}?fields=id,title,thumbnail,description,subtitle,metadata`),
    enabled: Boolean(productId),
  })
  const products = useQuery({
    queryKey: ["homepage-potm-picker", query, offset],
    queryFn: () => sdk.client.fetch<{ products: Product[]; count: number }>(`/admin/products?status[]=published&limit=10&offset=${offset}&q=${encodeURIComponent(query)}&fields=id,title,thumbnail`),
    enabled: open,
  })
  const product = selected.data?.product
  const metadata = product?.metadata ?? {}
  const fallback = [metadata.product_of_the_month_reason, metadata.product_of_month_reason, product?.description, product?.subtitle].find((value) => typeof value === "string" && value.trim()) as string | undefined

  const save = async () => {
    setPending(true)
    try {
      const result = await sdk.client.fetch<{ revalidated: boolean }>("/admin/homepage", {
        method: "POST",
        body: { product_of_the_month: { product_id: productId, description: productId ? description.trim() || null : null } },
      })
      if (result.revalidated) toast.success("Product of the month saved")
      else toast.warning("Saved, but the storefront cache could not be refreshed.")
      onSaved()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save product of the month")
    } finally { setPending(false) }
  }

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <Heading level="h2">Product of the month</Heading>
        <Text size="small" className="text-ui-fg-subtle">Choose the featured product, then write its homepage description.</Text>
      </div>
      <div className="flex flex-col gap-4 px-6 py-4">
        {productId ? (
          <div className="flex items-center gap-3">
            {product?.thumbnail && <img src={product.thumbnail} alt="" className="h-16 w-12 object-contain" />}
            <Text size="small" weight="plus">{selected.isError ? "Could not load selected product" : product?.title ?? "Loading product..."}</Text>
          </div>
        ) : <Text size="small" className="text-ui-fg-subtle">Automatic monthly selection</Text>}
        <div className="flex gap-2">
          <Button size="small" variant="secondary" disabled={pending} onClick={() => setOpen(true)}>{productId ? "Change product" : "Choose product"}</Button>
          {productId && <Button size="small" variant="transparent" disabled={pending} onClick={() => { setProductId(null); setDescription("") }}>Use automatic selection</Button>}
        </div>
        {productId && <div className="flex max-w-xl flex-col gap-2">
          <Label htmlFor="potm-description">Why chosen / homepage description</Label>
          <Textarea id="potm-description" rows={5} maxLength={2000} value={description} disabled={pending} onChange={(event) => setDescription(event.target.value)} placeholder={fallback || "Write a short description..."} />
          <Text size="small" className="text-ui-fg-subtle">Leave blank to use the product's existing why-chosen text or product details. Changing the product clears this custom description.</Text>
        </div>}
        <Button size="small" className="self-start" isLoading={pending} disabled={pending} onClick={save}>Save product of the month</Button>
      </div>
      <FocusModal open={open} onOpenChange={setOpen}>
        <FocusModal.Content>
          <FocusModal.Header><Heading level="h2">Choose product of the month</Heading></FocusModal.Header>
          <FocusModal.Body className="overflow-y-auto p-6">
            <div className="mx-auto flex max-w-3xl flex-col gap-4">
              <Label htmlFor="potm-product-search">Search products</Label>
              <Input id="potm-product-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by product name" />
              {products.isError ? <Text>Could not load products. <Button size="small" onClick={() => products.refetch()}>Retry</Button></Text> : products.isFetching ? <Text>Loading products...</Text> : <>
                <Table>
                  <Table.Header><Table.Row><Table.HeaderCell>Product</Table.HeaderCell><Table.HeaderCell>Select</Table.HeaderCell></Table.Row></Table.Header>
                  <Table.Body>{products.data?.products.map((item) => <Table.Row key={item.id}>
                    <Table.Cell><div className="flex items-center gap-3">{item.thumbnail && <img src={item.thumbnail} alt="" className="h-12 w-10 object-contain" />}<Text size="small">{item.title}</Text></div></Table.Cell>
                    <Table.Cell><Button size="small" variant="secondary" onClick={() => { if (productId !== item.id) { setProductId(item.id); setDescription("") } setOpen(false) }}>{productId === item.id ? "Selected" : "Choose"}</Button></Table.Cell>
                  </Table.Row>)}</Table.Body>
                </Table>
                {!products.data?.products.length && <Text>No products found.</Text>}
              </>}
              <div className="flex gap-2">
                <Button size="small" variant="secondary" disabled={offset === 0 || products.isFetching} onClick={() => setOffset(offset - 10)}>Previous</Button>
                <Button size="small" variant="secondary" disabled={offset + 10 >= (products.data?.count ?? 0) || products.isFetching} onClick={() => setOffset(offset + 10)}>Next</Button>
              </div>
            </div>
          </FocusModal.Body>
        </FocusModal.Content>
      </FocusModal>
    </Container>
  )
}
