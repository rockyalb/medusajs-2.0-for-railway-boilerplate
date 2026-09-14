import { Metadata } from "next"
import { notFound } from "next/navigation"

import ProductTemplate from "@modules/products/templates"
import { getRegion } from "@lib/data/regions"
import { getProductByHandle, getProductsList } from "@lib/data/products"

type Props = {
  params: Promise<{ countryCode: string; handle: string }>
}

// Public Albania product HTML. Cart data loads separately in the client.
export const revalidate = 60

export async function generateStaticParams() {
  const { response } = await getProductsList({ countryCode: "al" })
  return response.products.map((product) => ({ countryCode: "al", handle: product.handle }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { countryCode, handle } = await params
  const region = await getRegion(countryCode)

  if (!region) {
    notFound()
  }

  const product = await getProductByHandle(handle, region.id)

  if (!product) {
    notFound()
  }

  return {
    title: `${product.title} | Medusa Store`,
    description: `${product.title}`,
    openGraph: {
      title: `${product.title} | Medusa Store`,
      description: `${product.title}`,
      images: product.thumbnail ? [product.thumbnail] : [],
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { countryCode, handle } = await params
  const region = await getRegion(countryCode)

  if (!region) {
    notFound()
  }

  const pricedProduct = await getProductByHandle(handle, region.id)
  if (!pricedProduct) {
    notFound()
  }

  return (
    <ProductTemplate
      product={pricedProduct}
      region={region}
      countryCode={countryCode}
    />
  )
}
