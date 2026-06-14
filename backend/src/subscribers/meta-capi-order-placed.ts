import crypto from "crypto"

import { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa"
import { Modules } from "@medusajs/framework/utils"

type OrderMetadata = {
  meta_tracking?: {
    fbp?: string
    fbc?: string
    fbclid?: string
    purchase_event_id?: string
    client_user_agent?: string
    client_ip_address?: string
    source_url?: string
    captured_at?: string
  }
}

const META_GRAPH_VERSION = process.env.META_GRAPH_VERSION || "v25.0"

function sha256(value?: string | null) {
  if (!value) {
    return undefined
  }

  const normalized = value.trim().toLowerCase()

  if (!normalized) {
    return undefined
  }

  return crypto.createHash("sha256").update(normalized).digest("hex")
}

function getClientIp(order: any) {
  const metadata = order.metadata as Record<string, unknown> | null
  const tracking = metadata?.meta_tracking as Record<string, unknown> | undefined

  return typeof tracking?.client_ip_address === "string"
    ? tracking.client_ip_address
    : undefined
}

async function updateOrderMeta(container: any, order: any, metaCapi: any) {
  const orderService = container.resolve(Modules.ORDER) as any

  await orderService.updateOrders(order.id, {
    metadata: {
      ...((order.metadata || {}) as Record<string, unknown>),
      meta_capi: {
        ...metaCapi,
        updated_at: new Date().toISOString(),
      },
    },
  })
}

export default async function metaCapiOrderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve("logger")
  const query = container.resolve("query")
  const pixelId = process.env.META_PIXEL_ID
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN

  if (!pixelId || !accessToken) {
    logger.warn(
      "Meta CAPI skipped: META_PIXEL_ID or META_CAPI_ACCESS_TOKEN is not configured"
    )
    return
  }

  try {
    const { data: orders } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "display_id",
        "email",
        "currency_code",
        "total",
        "metadata",
        "created_at",
        "customer_id",
        "shipping_address.phone",
        "shipping_address.first_name",
        "shipping_address.last_name",
        "items.product_id",
        "items.variant_id",
        "items.quantity",
        "items.unit_price",
      ],
      filters: {
        id: data.id,
      },
    })

    const order = orders?.[0]

    if (!order) {
      logger.warn(`Meta CAPI skipped: order ${data.id} was not found`)
      return
    }

    const metadata = (order.metadata || {}) as OrderMetadata
    const tracking = metadata.meta_tracking || {}
    const contents = (order.items || [])
      .filter((item: any) => item.variant_id || item.product_id)
      .map((item: any) => ({
        id: item.variant_id || item.product_id,
        quantity: item.quantity,
        item_price: item.unit_price,
      }))

    const payload = {
      data: [
        {
          event_name: "Purchase",
          event_time: Math.floor(new Date(order.created_at).getTime() / 1000),
          event_id: tracking.purchase_event_id || `purchase.${order.id}`,
          action_source: "website",
          event_source_url: tracking.source_url,
          user_data: {
            em: sha256(order.email),
            ph: sha256(order.shipping_address?.phone),
            fn: sha256(order.shipping_address?.first_name),
            ln: sha256(order.shipping_address?.last_name),
            external_id: sha256(order.customer_id || order.email || order.id),
            client_user_agent: tracking.client_user_agent,
            client_ip_address: getClientIp(order),
            fbp: tracking.fbp,
            fbc: tracking.fbc,
          },
          custom_data: {
            currency: order.currency_code?.toUpperCase(),
            value: order.total,
            order_id: String(order.display_id || order.id),
            content_type: "product",
            content_ids: contents.map((item: any) => item.id),
            contents,
          },
        },
      ],
      ...(process.env.META_TEST_EVENT_CODE
        ? { test_event_code: process.env.META_TEST_EVENT_CODE }
        : {}),
    }

    const response = await fetch(
      `https://graph.facebook.com/${META_GRAPH_VERSION}/${pixelId}/events?access_token=${accessToken}`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    )

    const responseBody = await response.json().catch(() => null)

    if (!response.ok) {
      logger.error(
        `Meta CAPI failed for order ${order.id}: ${JSON.stringify(responseBody)}`
      )
      await updateOrderMeta(container, order, {
        status: "failed",
        response: responseBody,
      }).catch((error) => {
        logger.error(
          `Failed to update Meta CAPI metadata for ${order.id}: ${error.message}`
        )
      })
      return
    }

    await updateOrderMeta(container, order, {
      status: "sent",
      response: responseBody,
    }).catch((error) => {
      logger.error(
        `Failed to update Meta CAPI metadata for ${order.id}: ${error.message}`
      )
    })

    logger.info(
      `Meta CAPI Purchase sent for order ${order.id}: ${JSON.stringify(responseBody)}`
    )
  } catch (error) {
    logger.error(`Meta CAPI failed for order ${data.id}: ${error.message}`)
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
