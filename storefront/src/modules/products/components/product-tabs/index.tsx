"use client"

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
        <div className="text-small-regular py-4 text-ui-fg-subtle">
          <MetadataValue value={section.value} />
        </div>
      ),
    })),
    {
      label: "Transporti",
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

const ShippingInfoTab = () => {
  return (
    <div className="text-small-regular py-4">
      <p className="max-w-sm">
        Transporti FALAS në porosi me vlerë mbi 8,000 ALL
      </p>
    </div>
  )
}

export default ProductTabs
