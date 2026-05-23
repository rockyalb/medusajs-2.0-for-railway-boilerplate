import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import {
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  deleteShippingOptionsWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateRegionsWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows"

const COUNTRY_CODE = "al"
const CURRENCY_CODE = "all"
const SERVICE_ZONE_NAME = "Albania Delivery"
const FULFILLMENT_SET_NAME = "Albania delivery"
const STOCK_LOCATION_NAME = "Albania Warehouse"

export default async function setupAllShipping({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT)
  const inventoryModuleService = container.resolve(Modules.INVENTORY)
  const regionModuleService = container.resolve(Modules.REGION)
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL)
  const stockLocationModuleService = container.resolve(Modules.STOCK_LOCATION)
  const storeModuleService = container.resolve(Modules.STORE)

  logger.info("Setting store currency to Albanian Lek (ALL)...")

  const [store] = await storeModuleService.listStores()
  let [defaultSalesChannel] = await salesChannelModuleService.listSalesChannels({
    name: "Default Sales Channel",
  })

  if (!defaultSalesChannel) {
    const { result } = await createSalesChannelsWorkflow(container).run({
      input: {
        salesChannelsData: [
          {
            name: "Default Sales Channel",
          },
        ],
      },
    })

    defaultSalesChannel = result[0]
  }

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        supported_currencies: [
          {
            currency_code: CURRENCY_CODE,
            is_default: true,
            is_tax_inclusive: true,
          },
        ],
      },
    },
  })

  let [region] = await regionModuleService.listRegions({
    name: "Albania",
  })

  if (region) {
    const { result } = await updateRegionsWorkflow(container).run({
      input: {
        selector: { id: region.id },
        update: {
          name: "Albania",
          currency_code: CURRENCY_CODE,
          countries: [COUNTRY_CODE],
          is_tax_inclusive: true,
          payment_providers: ["pp_system_default"],
        },
      },
    })

    region = result[0]
  } else {
    const { result } = await createRegionsWorkflow(container).run({
      input: {
        regions: [
          {
            name: "Albania",
            currency_code: CURRENCY_CODE,
            countries: [COUNTRY_CODE],
            is_tax_inclusive: true,
            payment_providers: ["pp_system_default"],
          },
        ],
      },
    })

    region = result[0]
  }

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        default_sales_channel_id: defaultSalesChannel.id,
        default_region_id: region.id,
      },
    },
  })

  let [stockLocation] = await stockLocationModuleService.listStockLocations({
    name: STOCK_LOCATION_NAME,
  })

  if (!stockLocation) {
    const { result } = await createStockLocationsWorkflow(container).run({
      input: {
        locations: [
          {
            name: STOCK_LOCATION_NAME,
            address: {
              city: "Tirana",
              country_code: "AL",
              address_1: "",
            },
          },
        ],
      },
    })

    stockLocation = result[0]
  }

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        default_location_id: stockLocation.id,
      },
    },
  })

  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: {
      id: stockLocation.id,
      add: [defaultSalesChannel.id],
    },
  })

  try {
    await link.create({
      [Modules.STOCK_LOCATION]: {
        stock_location_id: stockLocation.id,
      },
      [Modules.FULFILLMENT]: {
        fulfillment_provider_id: "manual_manual",
      },
    })
  } catch (error) {
    logger.warn("Stock location was already linked to manual fulfillment.")
  }

  let [shippingProfile] =
    await fulfillmentModuleService.listShippingProfiles({
      type: "default",
    })

  if (!shippingProfile) {
    const { result } = await createShippingProfilesWorkflow(container).run({
      input: {
        data: [
          {
            name: "Default Shipping Profile",
            type: "default",
          },
        ],
      },
    })

    shippingProfile = result[0]
  }

  let [fulfillmentSet] = await fulfillmentModuleService.listFulfillmentSets(
    {
      name: FULFILLMENT_SET_NAME,
    },
    {
      relations: ["service_zones"],
    }
  )

  if (!fulfillmentSet) {
    fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
      name: FULFILLMENT_SET_NAME,
      type: "shipping",
      service_zones: [
        {
          name: SERVICE_ZONE_NAME,
          geo_zones: [
            {
              country_code: COUNTRY_CODE,
              type: "country",
            },
          ],
        },
      ],
    })

  }

  try {
    await link.create({
      [Modules.STOCK_LOCATION]: {
        stock_location_id: stockLocation.id,
      },
      [Modules.FULFILLMENT]: {
        fulfillment_set_id: fulfillmentSet.id,
      },
    })
  } catch (error) {
    logger.warn("Stock location was already linked to fulfillment set.")
  }

  let serviceZone = fulfillmentSet.service_zones?.find(
    (zone) => zone.name === SERVICE_ZONE_NAME
  )

  if (!serviceZone) {
    serviceZone = await fulfillmentModuleService.createServiceZones({
      name: SERVICE_ZONE_NAME,
      fulfillment_set_id: fulfillmentSet.id,
      geo_zones: [
        {
          country_code: COUNTRY_CODE,
          type: "country",
        },
      ],
    })
  }

  const inventoryItems = await inventoryModuleService.listInventoryItems(
    {},
    {
      select: ["id"],
      take: 1000,
    }
  )
  const existingInventoryLevels =
    await inventoryModuleService.listInventoryLevels(
      {
        location_id: stockLocation.id,
      },
      {
        select: ["inventory_item_id"],
        take: 1000,
      }
    )
  const existingInventoryItemIds = new Set(
    existingInventoryLevels.map((level) => level.inventory_item_id)
  )
  const inventoryLevelsToCreate = inventoryItems
    .filter((item) => !existingInventoryItemIds.has(item.id))
    .map((item) => ({
      inventory_item_id: item.id,
      location_id: stockLocation.id,
      stocked_quantity: 1000000,
    }))

  if (inventoryLevelsToCreate.length) {
    await inventoryModuleService.createInventoryLevels(inventoryLevelsToCreate)
  }

  const existingOptions = await fulfillmentModuleService.listShippingOptions(
    {},
    {
      select: ["id", "name"],
    }
  )

  if (existingOptions.length) {
    await deleteShippingOptionsWorkflow(container).run({
      input: {
        ids: existingOptions.map((option) => option.id),
      },
    })
  }

  const commonRules: {
    attribute: string
    value: string
    operator: "eq"
  }[] = [
    {
      attribute: "enabled_in_store",
      value: "true",
      operator: "eq",
    },
    {
      attribute: "is_return",
      value: "false",
      operator: "eq",
    },
  ]

  await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: "Free Delivery",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: serviceZone.id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Free Delivery",
          description: "Free delivery for orders over 7,500 Lek.",
          code: "free-delivery",
        },
        prices: [
          {
            currency_code: CURRENCY_CODE,
            amount: 0,
            rules: [
              {
                attribute: "item_total",
                operator: "gte",
                value: 7500,
              },
            ],
          },
        ],
        rules: commonRules,
      },
      {
        name: "Tirane Delivery",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: serviceZone.id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Tirane Delivery",
          description: "Delivery in Tirane for orders under 7,500 Lek.",
          code: "tirane-delivery",
        },
        prices: [
          {
            currency_code: CURRENCY_CODE,
            amount: 240,
            rules: [
              {
                attribute: "item_total",
                operator: "lt",
                value: 7500,
              },
            ],
          },
        ],
        rules: [
          ...commonRules,
          {
            attribute: "delivery_city_group",
            value: "tirane",
            operator: "eq" as const,
          },
        ],
      },
      {
        name: "Standard Delivery",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: serviceZone.id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Standard Delivery",
          description: "Delivery outside Tirane for orders under 7,500 Lek.",
          code: "standard-delivery",
        },
        prices: [
          {
            currency_code: CURRENCY_CODE,
            amount: 360,
            rules: [
              {
                attribute: "item_total",
                operator: "lt",
                value: 7500,
              },
            ],
          },
        ],
        rules: [
          ...commonRules,
          {
            attribute: "delivery_city_group",
            value: "other",
            operator: "eq" as const,
          },
        ],
      },
    ],
  })

  logger.info("Finished setting ALL currency and Albania delivery options.")
}
