"use client"

import Back from "@modules/common/icons/back"
import FastDelivery from "@modules/common/icons/fast-delivery"
import Refresh from "@modules/common/icons/refresh"

import Accordion from "./accordion"
import { HttpTypes } from "@medusajs/types"

type ProductTabsProps = {
  product: HttpTypes.StoreProduct
}

type ProductMetadata = Record<string, unknown>

const getSectionId = (label: string) =>
  `product-section-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`

const metadataSections = [
  {
    label: "Details",
    keys: ["details", "product_details"],
  },
  {
    label: "Ingredients",
    keys: ["ingredients"],
  },
  {
    label: "How to use",
    keys: ["how_to_use", "howToUse", "how-to-use", "how to use"],
  },
]

const hasDisplayableValue = (value: unknown): boolean => {
  if (typeof value === "string") {
    return value.trim().length > 0
  }

  if (Array.isArray(value)) {
    return value.some(hasDisplayableValue)
  }

  if (value && typeof value === "object") {
    return Object.values(value).some(hasDisplayableValue)
  }

  return value !== undefined && value !== null
}

const getMetadataValue = (metadata: ProductMetadata, keys: string[]) => {
  return keys.map((key) => metadata[key]).find(hasDisplayableValue)
}

const formatMetadataLabel = (value: string) => {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

const MetadataValue = ({ value }: { value: unknown }) => {
  if (!hasDisplayableValue(value)) {
    return null
  }

  if (Array.isArray(value)) {
    return (
      <ul className="list-disc space-y-2 pl-5">
        {value.filter(hasDisplayableValue).map((item, index) => (
          <li key={index}>
            <MetadataValue value={item} />
          </li>
        ))}
      </ul>
    )
  }

  if (value && typeof value === "object") {
    return (
      <div className="flex flex-col gap-y-3">
        {Object.entries(value)
          .filter(([, entryValue]) => hasDisplayableValue(entryValue))
          .map(([key, entryValue]) => (
            <div key={key} className="flex flex-col gap-y-1">
              <span className="font-semibold">{formatMetadataLabel(key)}</span>
              <MetadataValue value={entryValue} />
            </div>
          ))}
      </div>
    )
  }

  return <p className="whitespace-pre-line">{String(value)}</p>
}

const ProductTabs = ({ product }: ProductTabsProps) => {
  const metadata = (product.metadata || {}) as ProductMetadata
  const dynamicTabs = metadataSections
    .map((section) => ({
      label: section.label,
      value: getMetadataValue(metadata, section.keys),
    }))
    .filter((section) => hasDisplayableValue(section.value))

  const tabs = [
    ...dynamicTabs.map((section) => ({
      label: section.label,
      component: (
        <div className="text-small-regular py-8 text-ui-fg-subtle">
          <MetadataValue value={section.value} />
        </div>
      ),
    })),
    {
      label: "Product Information",
      component: <ProductInfoTab product={product} />,
    },
    {
      label: "Shipping & Returns",
      component: <ShippingInfoTab />,
    },
  ]

  return (
    <div className="w-full">
      <Accordion
        type="single"
        collapsible
        defaultValue={tabs[0]?.label}
        onValueChange={(value) => {
          if (value) {
            window.requestAnimationFrame(() => {
              const section = document.getElementById(getSectionId(value))
              const panel = document.getElementById("product-details-panel")
              const isDesktop = window.matchMedia("(min-width: 1024px)").matches

              if (section && panel && isDesktop) {
                const sectionTop =
                  section.getBoundingClientRect().top -
                  panel.getBoundingClientRect().top +
                  panel.scrollTop

                panel.scrollTo({
                  top: Math.max(sectionTop - 20, 0),
                  behavior: "smooth",
                })
              } else {
                section?.scrollIntoView({
                  behavior: "smooth",
                  block: "nearest",
                })
              }
            })
          }
        }}
      >
        {tabs.map((tab, i) => (
          <Accordion.Item
            key={i}
            id={getSectionId(tab.label)}
            title={tab.label}
            headingSize="medium"
            value={tab.label}
          >
            {tab.component}
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  )
}

const ProductInfoTab = ({ product }: ProductTabsProps) => {
  return (
    <div className="text-small-regular py-8">
      <div className="grid grid-cols-2 gap-x-8">
        <div className="flex flex-col gap-y-4">
          <div>
            <span className="font-semibold">Material</span>
            <p>{product.material ? product.material : "-"}</p>
          </div>
          <div>
            <span className="font-semibold">Country of origin</span>
            <p>{product.origin_country ? product.origin_country : "-"}</p>
          </div>
          <div>
            <span className="font-semibold">Type</span>
            <p>{product.type ? product.type.value : "-"}</p>
          </div>
        </div>
        <div className="flex flex-col gap-y-4">
          <div>
            <span className="font-semibold">Weight</span>
            <p>{product.weight ? `${product.weight} g` : "-"}</p>
          </div>
          <div>
            <span className="font-semibold">Dimensions</span>
            <p>
              {product.length && product.width && product.height
                ? `${product.length}L x ${product.width}W x ${product.height}H`
                : "-"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

const ShippingInfoTab = () => {
  return (
    <div className="text-small-regular py-8">
      <div className="grid grid-cols-1 gap-y-8">
        <div className="flex items-start gap-x-2">
          <FastDelivery />
          <div>
            <span className="font-semibold">Fast delivery</span>
            <p className="max-w-sm">
              Your package will arrive in 3-5 business days at your pick up
              location or in the comfort of your home.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-x-2">
          <Refresh />
          <div>
            <span className="font-semibold">Simple exchanges</span>
            <p className="max-w-sm">
              Is the fit not quite right? No worries - we&apos;ll exchange your
              product for a new one.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-x-2">
          <Back />
          <div>
            <span className="font-semibold">Easy returns</span>
            <p className="max-w-sm">
              Just return your product and we&apos;ll refund your money. No
              questions asked – we&apos;ll do our best to make sure your return
              is hassle-free.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductTabs
