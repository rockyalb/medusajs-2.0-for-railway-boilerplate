import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  ArrowDownMini,
  ArrowUpMini,
  ArrowUpTray,
  House,
  MagnifyingGlass,
  Trash,
  XMark,
} from "@medusajs/icons"
import {
  Button,
  Container,
  Heading,
  Input,
  Label,
  Text,
  toast,
} from "@medusajs/ui"
import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { sdk } from "../../lib/client"

type HeroSettings = {
  image_url: string | null
  image_alt: string | null
  eyebrow: string | null
  headline: string | null
  cta_label: string | null
  cta_href: string | null
}

type HomepageSettings = {
  hero: HeroSettings
  category_cards: { images: Record<string, string> }
  bestsellers: { product_ids: string[] }
}

type AdminCategory = {
  id: string
  name: string
  handle: string
  parent_category_id: string | null
}

type AdminProduct = {
  id: string
  title: string
  thumbnail: string | null
  status?: string
}

const MAX_BESTSELLERS = 12

const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData()
  formData.append("files", file)

  const res = await fetch("/admin/uploads", {
    method: "POST",
    credentials: "include",
    body: formData,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any)?.message ?? "Image upload failed")
  }

  const data = (await res.json()) as { files?: { url: string }[] }
  const url = data.files?.[0]?.url

  if (!url) {
    throw new Error("Upload succeeded but no file URL was returned")
  }

  return url
}

const revalidationToast = (revalidated: boolean, label: string) => {
  if (revalidated) {
    toast.success(`${label} saved — homepage cache refreshed`)
  } else {
    toast.warning(
      `${label} saved, but the storefront cache could not be refreshed. Check STOREFRONT_URL / REVALIDATE_SECRET on the backend.`
    )
  }
}

const ImageUploadButton = ({
  onUploaded,
  disabled,
  children,
}: {
  onUploaded: (url: string) => void
  disabled?: boolean
  children: React.ReactNode
}) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""

    if (!file) {
      return
    }

    setIsUploading(true)
    try {
      onUploaded(await uploadImage(file))
    } catch (e: any) {
      toast.error(e?.message ?? "Image upload failed")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
      <Button
        size="small"
        variant="secondary"
        type="button"
        isLoading={isUploading}
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
      >
        <ArrowUpTray />
        {children}
      </Button>
    </>
  )
}

const HeroSection = ({
  hero,
  onSaved,
}: {
  hero: HeroSettings
  onSaved: (homepage: HomepageSettings) => void
}) => {
  const [imageUrl, setImageUrl] = useState(hero.image_url ?? "")
  const [imageAlt, setImageAlt] = useState(hero.image_alt ?? "")
  const [eyebrow, setEyebrow] = useState(hero.eyebrow ?? "")
  const [headline, setHeadline] = useState(hero.headline ?? "")
  const [ctaLabel, setCtaLabel] = useState(hero.cta_label ?? "")
  const [ctaHref, setCtaHref] = useState(hero.cta_href ?? "")
  const [isPending, setIsPending] = useState(false)

  useEffect(() => {
    setImageUrl(hero.image_url ?? "")
    setImageAlt(hero.image_alt ?? "")
    setEyebrow(hero.eyebrow ?? "")
    setHeadline(hero.headline ?? "")
    setCtaLabel(hero.cta_label ?? "")
    setCtaHref(hero.cta_href ?? "")
  }, [hero])

  const handleSave = async () => {
    setIsPending(true)
    try {
      const data = await sdk.client.fetch<{
        homepage: HomepageSettings
        revalidated: boolean
      }>("/admin/homepage", {
        method: "POST",
        body: {
          hero: {
            image_url: imageUrl.trim() || null,
            image_alt: imageAlt.trim() || null,
            eyebrow: eyebrow.trim() || null,
            headline: headline.trim() || null,
            cta_label: ctaLabel.trim() || null,
            cta_href: ctaHref.trim() || null,
          },
        },
      })
      onSaved(data.homepage)
      revalidationToast(data.revalidated, "Hero")
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to save hero settings")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <Heading level="h2">Hero</Heading>
        <Text size="small" className="text-ui-fg-subtle">
          The image and copy at the top of the homepage. Empty fields fall
          back to the storefront defaults.
        </Text>
      </div>

      <div className="flex flex-col gap-y-6 px-6 py-4">
        <div className="flex flex-wrap items-start gap-6">
          <div className="h-40 w-64 shrink-0 overflow-hidden rounded-lg border border-ui-border-base bg-ui-bg-subtle">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={imageAlt || "Hero preview"}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Text size="small" className="text-ui-fg-muted">
                  Storefront default image
                </Text>
              </div>
            )}
          </div>

          <div className="flex min-w-[280px] flex-1 flex-col gap-y-4">
            <div className="flex items-center gap-x-2">
              <ImageUploadButton
                disabled={isPending}
                onUploaded={(url) => setImageUrl(url)}
              >
                Upload hero image
              </ImageUploadButton>
              {imageUrl && (
                <Button
                  size="small"
                  variant="transparent"
                  type="button"
                  disabled={isPending}
                  onClick={() => setImageUrl("")}
                >
                  <XMark />
                  Use default
                </Button>
              )}
            </div>

            <div className="grid gap-y-2">
              <Label htmlFor="hero-image-url">Image URL</Label>
              <Input
                id="hero-image-url"
                value={imageUrl}
                placeholder="https://…"
                onChange={(e) => setImageUrl(e.target.value)}
                disabled={isPending}
              />
            </div>

            <div className="grid gap-y-2">
              <Label htmlFor="hero-image-alt">Image alt text</Label>
              <Input
                id="hero-image-alt"
                value={imageAlt}
                placeholder="Describe the image"
                onChange={(e) => setImageAlt(e.target.value)}
                disabled={isPending}
              />
            </div>
          </div>
        </div>

        <div className="grid max-w-[720px] gap-y-4">
          <div className="grid gap-y-2">
            <Label htmlFor="hero-eyebrow">Eyebrow</Label>
            <Input
              id="hero-eyebrow"
              value={eyebrow}
              placeholder="MIRË PËR JU, MIRË PËR PLANETIN."
              onChange={(e) => setEyebrow(e.target.value)}
              disabled={isPending}
            />
          </div>

          <div className="grid gap-y-2">
            <Label htmlFor="hero-headline">Headline</Label>
            <Input
              id="hero-headline"
              value={headline}
              placeholder="Shtëpia e produkteve zero-waste, organike dhe natyrale."
              onChange={(e) => setHeadline(e.target.value)}
              disabled={isPending}
            />
          </div>

          <div className="grid gap-y-4 md:grid-cols-2 md:gap-x-4">
            <div className="grid gap-y-2">
              <Label htmlFor="hero-cta-label">Button label</Label>
              <Input
                id="hero-cta-label"
                value={ctaLabel}
                placeholder="Shiko produktet"
                onChange={(e) => setCtaLabel(e.target.value)}
                disabled={isPending}
              />
            </div>
            <div className="grid gap-y-2">
              <Label htmlFor="hero-cta-href">Button link</Label>
              <Input
                id="hero-cta-href"
                value={ctaHref}
                placeholder="/store"
                onChange={(e) => setCtaHref(e.target.value)}
                disabled={isPending}
              />
            </div>
          </div>
        </div>

        <div>
          <Button size="small" isLoading={isPending} onClick={handleSave}>
            Save hero
          </Button>
        </div>
      </div>
    </Container>
  )
}

const CategoryCardsSection = ({
  images,
  onSaved,
}: {
  images: Record<string, string>
  onSaved: (homepage: HomepageSettings) => void
}) => {
  const [categories, setCategories] = useState<AdminCategory[]>([])
  const [draftImages, setDraftImages] = useState<Record<string, string>>(images)
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, setIsPending] = useState(false)

  useEffect(() => {
    setDraftImages(images)
  }, [images])

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await sdk.client.fetch<{
          product_categories: AdminCategory[]
        }>(
          "/admin/product-categories?limit=100&fields=id,name,handle,parent_category_id"
        )
        setCategories(
          (data.product_categories ?? []).filter(
            (category) => !category.parent_category_id
          )
        )
      } catch (e: any) {
        toast.error(e?.message ?? "Failed to load categories")
      } finally {
        setIsLoading(false)
      }
    }

    loadCategories()
  }, [])

  const handleSave = async () => {
    setIsPending(true)
    try {
      const data = await sdk.client.fetch<{
        homepage: HomepageSettings
        revalidated: boolean
      }>("/admin/homepage", {
        method: "POST",
        body: { category_cards: { images: draftImages } },
      })
      onSaved(data.homepage)
      revalidationToast(data.revalidated, "Category cards")
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to save category card images")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <Heading level="h2">Category cards</Heading>
        <Text size="small" className="text-ui-fg-subtle">
          Override the image shown on each homepage category card. Categories
          without an override use their first product&apos;s image.
        </Text>
      </div>

      <div className="flex flex-col gap-y-4 px-6 py-4">
        {isLoading ? (
          <Text size="small" className="text-ui-fg-subtle">
            Loading categories…
          </Text>
        ) : categories.length === 0 ? (
          <Text size="small" className="text-ui-fg-subtle">
            No top-level categories found.
          </Text>
        ) : (
          categories.map((category) => {
            const image = draftImages[category.id]

            return (
              <div
                key={category.id}
                className="flex flex-wrap items-center gap-4 rounded-lg border border-ui-border-base p-3"
              >
                <div className="h-16 w-20 shrink-0 overflow-hidden rounded-md border border-ui-border-base bg-ui-bg-subtle">
                  {image ? (
                    <img
                      src={image}
                      alt={category.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Text size="xsmall" className="text-ui-fg-muted">
                        Auto
                      </Text>
                    </div>
                  )}
                </div>

                <div className="min-w-[140px] flex-1">
                  <Text size="small" weight="plus">
                    {category.name}
                  </Text>
                  <Text size="xsmall" className="text-ui-fg-subtle">
                    /categories/{category.handle}
                  </Text>
                </div>

                <div className="flex items-center gap-x-2">
                  <ImageUploadButton
                    disabled={isPending}
                    onUploaded={(url) =>
                      setDraftImages((prev) => ({
                        ...prev,
                        [category.id]: url,
                      }))
                    }
                  >
                    Upload
                  </ImageUploadButton>
                  {image && (
                    <Button
                      size="small"
                      variant="transparent"
                      type="button"
                      disabled={isPending}
                      onClick={() =>
                        setDraftImages((prev) => {
                          const next = { ...prev }
                          delete next[category.id]
                          return next
                        })
                      }
                    >
                      <Trash />
                      Reset
                    </Button>
                  )}
                </div>
              </div>
            )
          })
        )}

        <div>
          <Button
            size="small"
            isLoading={isPending}
            disabled={isLoading}
            onClick={handleSave}
          >
            Save category cards
          </Button>
        </div>
      </div>
    </Container>
  )
}

const BestsellersSection = ({
  productIds,
  onSaved,
}: {
  productIds: string[]
  onSaved: (homepage: HomepageSettings) => void
}) => {
  const [selected, setSelected] = useState<AdminProduct[]>([])
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<AdminProduct[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const searchSeq = useRef(0)

  // Hydrate the saved ids into product rows (title + thumbnail).
  useEffect(() => {
    if (!productIds.length) {
      setSelected([])
      return
    }

    const hydrate = async () => {
      try {
        const params = new URLSearchParams()
        productIds.forEach((id) => params.append("id[]", id))
        params.set("limit", String(productIds.length))
        params.set("fields", "id,title,thumbnail")

        const data = await sdk.client.fetch<{ products: AdminProduct[] }>(
          `/admin/products?${params.toString()}`
        )
        const byId = new Map(
          (data.products ?? []).map((product) => [product.id, product])
        )
        setSelected(
          productIds
            .map((id) => byId.get(id))
            .filter((product): product is AdminProduct => !!product)
        )
      } catch (e: any) {
        toast.error(e?.message ?? "Failed to load bestseller products")
      }
    }

    hydrate()
  }, [productIds])

  useEffect(() => {
    const term = query.trim()

    if (term.length < 2) {
      setResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    const seq = ++searchSeq.current
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams()
        params.set("q", term)
        params.set("limit", "8")
        params.set("fields", "id,title,thumbnail,status")

        const data = await sdk.client.fetch<{ products: AdminProduct[] }>(
          `/admin/products?${params.toString()}`
        )
        if (seq === searchSeq.current) {
          setResults(data.products ?? [])
        }
      } catch {
        if (seq === searchSeq.current) {
          setResults([])
        }
      } finally {
        if (seq === searchSeq.current) {
          setIsSearching(false)
        }
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  const selectedIds = useMemo(
    () => new Set(selected.map((product) => product.id)),
    [selected]
  )

  const addProduct = (product: AdminProduct) => {
    if (selectedIds.has(product.id)) {
      return
    }
    if (selected.length >= MAX_BESTSELLERS) {
      toast.error(`You can pick at most ${MAX_BESTSELLERS} bestsellers`)
      return
    }
    setSelected((prev) => [...prev, product])
  }

  const moveProduct = (index: number, direction: -1 | 1) => {
    setSelected((prev) => {
      const target = index + direction
      if (target < 0 || target >= prev.length) {
        return prev
      }
      const next = [...prev]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  const handleSave = async () => {
    setIsPending(true)
    try {
      const data = await sdk.client.fetch<{
        homepage: HomepageSettings
        revalidated: boolean
      }>("/admin/homepage", {
        method: "POST",
        body: {
          bestsellers: { product_ids: selected.map((product) => product.id) },
        },
      })
      onSaved(data.homepage)
      revalidationToast(data.revalidated, "Bestsellers")
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to save bestsellers")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <Heading level="h2">Bestsellers</Heading>
        <Text size="small" className="text-ui-fg-subtle">
          Pick and order the products shown in the homepage bestsellers
          section. Leave the list empty to let the storefront choose
          automatically.
        </Text>
      </div>

      <div className="flex flex-col gap-y-6 px-6 py-4">
        <div className="grid max-w-[560px] gap-y-2">
          <Label htmlFor="bestseller-search">Add products</Label>
          <div className="relative">
            <MagnifyingGlass className="text-ui-fg-muted absolute left-2 top-1/2 -translate-y-1/2" />
            <Input
              id="bestseller-search"
              className="pl-8"
              value={query}
              placeholder="Search products by name…"
              onChange={(e) => setQuery(e.target.value)}
              disabled={isPending}
            />
          </div>

          {query.trim().length >= 2 && (
            <div className="rounded-lg border border-ui-border-base">
              {isSearching ? (
                <Text size="small" className="text-ui-fg-subtle px-3 py-2">
                  Searching…
                </Text>
              ) : results.length === 0 ? (
                <Text size="small" className="text-ui-fg-subtle px-3 py-2">
                  No products found.
                </Text>
              ) : (
                results.map((product) => {
                  const alreadyAdded = selectedIds.has(product.id)

                  return (
                    <button
                      key={product.id}
                      type="button"
                      className="hover:bg-ui-bg-subtle-hover flex w-full items-center gap-x-3 px-3 py-2 text-left disabled:opacity-50"
                      disabled={alreadyAdded || isPending}
                      onClick={() => addProduct(product)}
                    >
                      <div className="h-8 w-8 shrink-0 overflow-hidden rounded-md bg-ui-bg-subtle">
                        {product.thumbnail && (
                          <img
                            src={product.thumbnail}
                            alt={product.title}
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      <Text size="small" className="flex-1">
                        {product.title}
                      </Text>
                      <Text size="xsmall" className="text-ui-fg-subtle">
                        {alreadyAdded ? "Added" : "Add"}
                      </Text>
                    </button>
                  )
                })
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-y-2">
          <Text size="small" weight="plus">
            Selected ({selected.length}/{MAX_BESTSELLERS})
          </Text>

          {selected.length === 0 ? (
            <Text size="small" className="text-ui-fg-subtle">
              No products selected — the storefront will pick bestsellers
              automatically.
            </Text>
          ) : (
            selected.map((product, index) => (
              <div
                key={product.id}
                className="flex items-center gap-x-3 rounded-lg border border-ui-border-base p-2"
              >
                <Text size="small" className="text-ui-fg-subtle w-6 text-center">
                  {index + 1}
                </Text>
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-ui-bg-subtle">
                  {product.thumbnail && (
                    <img
                      src={product.thumbnail}
                      alt={product.title}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <Text size="small" className="flex-1">
                  {product.title}
                </Text>
                <Button
                  size="small"
                  variant="transparent"
                  type="button"
                  disabled={index === 0 || isPending}
                  onClick={() => moveProduct(index, -1)}
                >
                  <ArrowUpMini />
                </Button>
                <Button
                  size="small"
                  variant="transparent"
                  type="button"
                  disabled={index === selected.length - 1 || isPending}
                  onClick={() => moveProduct(index, 1)}
                >
                  <ArrowDownMini />
                </Button>
                <Button
                  size="small"
                  variant="transparent"
                  type="button"
                  disabled={isPending}
                  onClick={() =>
                    setSelected((prev) =>
                      prev.filter((item) => item.id !== product.id)
                    )
                  }
                >
                  <Trash />
                </Button>
              </div>
            ))
          )}
        </div>

        <div>
          <Button size="small" isLoading={isPending} onClick={handleSave}>
            Save bestsellers
          </Button>
        </div>
      </div>
    </Container>
  )
}

const HomepagePage = () => {
  const [homepage, setHomepage] = useState<HomepageSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchSettings = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await sdk.client.fetch<{ homepage: HomepageSettings }>(
        "/admin/homepage"
      )
      setHomepage(data.homepage)
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to load homepage settings")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  return (
    <div className="flex flex-col gap-y-3">
      <Container className="p-0">
        <div className="px-6 py-4">
          <Heading level="h1">Homepage</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Manage the storefront homepage. Every save hard-expires the
            homepage cache so changes go live immediately.
          </Text>
        </div>
      </Container>

      {isLoading || !homepage ? (
        <Container className="p-6">
          <Text size="small" className="text-ui-fg-subtle">
            {isLoading ? "Loading homepage settings…" : "Failed to load settings."}
          </Text>
        </Container>
      ) : (
        <>
          <HeroSection hero={homepage.hero} onSaved={setHomepage} />
          <CategoryCardsSection
            images={homepage.category_cards.images}
            onSaved={setHomepage}
          />
          <BestsellersSection
            productIds={homepage.bestsellers.product_ids}
            onSaved={setHomepage}
          />
        </>
      )}
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Homepage",
  icon: House,
})

export default HomepagePage
