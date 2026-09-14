"use server"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { updateTag } from "next/cache"
import { unstable_rethrow } from "next/navigation"
import { getAuthHeaders, getCartId } from "./cookies"
import { placeOrder, transferCartToCustomer } from "./cart"

const COD_PROVIDER = "pp_system_default"

function addressFromForm(form: FormData, prefix: string) {
  const value = (field: string) =>
    String(form.get(`${prefix}.${field}`) ?? "").trim()
  return {
    first_name: value("first_name"),
    last_name: value("last_name"),
    address_1: value("address_1"),
    address_2: value("address_2"),
    company: value("company"),
    city: value("city"),
    postal_code: value("postal_code"),
    province: value("province"),
    country_code: value("country_code").toLowerCase(),
    phone: value("phone"),
  }
}

async function prepare(form: FormData, final = false) {
  const cartId = await getCartId()
  if (!cartId)
    throw new Error("Shporta nuk u gjet. Ju lutemi rifreskoni faqen.")
  const shipping = addressFromForm(form, "shipping_address")
  const billing =
    form.get("same_as_billing") === "on"
      ? shipping
      : addressFromForm(form, "billing_address")
  const email = String(form.get("email") ?? "").trim()
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  if (!shipping.city || !shipping.country_code) {
    throw new Error("Plotësoni qytetin dhe shtetin për të llogaritur dërgesën.")
  }
  if (
    final &&
    (!validEmail ||
      [shipping, billing].some(
        (address) =>
          !address.first_name ||
          !address.last_name ||
          !address.address_1 ||
          !address.city ||
          !address.country_code
      ))
  ) {
    throw new Error(
      "Plotësoni të dhënat e kontaktit dhe adresën për të vazhduar."
    )
  }

  const headers = await getAuthHeaders()
  await transferCartToCustomer(cartId)
  let { cart } = await sdk.store.cart.update(
    cartId,
    {
      shipping_address: shipping,
      ...(billing.country_code ? { billing_address: billing } : {}),
      ...(validEmail ? { email } : {}),
    },
    {},
    headers
  )

  // Eligibility (including city and free-delivery rules) belongs to Medusa.
  const { shipping_options } = await sdk.store.fulfillment.listCartOptions(
    { cart_id: cartId },
    { ...headers, cache: "no-store" }
  )
  const options = shipping_options
    .filter(
      (option) =>
        !option.insufficient_inventory &&
        option.amount != null &&
        ["free-delivery", "tirane-delivery", "standard-delivery"].includes(
          option.type?.code ?? ""
        )
    )
    .sort(
      (a, b) => Number(a.amount) - Number(b.amount) || a.id.localeCompare(b.id)
    )
  const option = options[0]
  if (!option)
    throw new Error(
      "Dërgesa nuk është e disponueshme për këtë adresë ose shportë. Kontrolloni adresën dhe produktet."
    )

  // Medusa replaces the cart shipping methods and refreshes totals.
  const shippingResult = await sdk.store.cart.addShippingMethod(
    cartId,
    { option_id: option.id },
    {},
    headers
  )
  cart = shippingResult.cart

  if (final) {
    if (!cart.region_id) throw new Error("Rajoni i shportës nuk u gjet.")
    const { payment_providers } = await sdk.store.payment.listPaymentProviders(
      { region_id: cart.region_id },
      { ...headers, cache: "no-store" }
    )
    if (!payment_providers.some((provider) => provider.id === COD_PROVIDER)) {
      throw new Error(
        "Pagesa në dorëzim nuk është e disponueshme. Ju lutemi provoni përsëri më vonë."
      )
    }
    await sdk.store.payment.initiatePaymentSession(
      cart,
      { provider_id: COD_PROVIDER },
      {},
      headers
    )
    const refreshed = await sdk.store.cart.retrieve(
      cartId,
      {},
      { ...headers, cache: "no-store" }
    )
    cart = refreshed.cart
  }
  updateTag("cart")
  updateTag("shipping")
  return cart
}

export async function prepareCheckout(form: FormData): Promise<{
  cart?: HttpTypes.StoreCart
  error?: string
}> {
  try {
    return { cart: await prepare(form) }
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Dërgesa nuk u përditësua. Ju lutemi provoni përsëri.",
    }
  }
}

export async function completeCodCheckout(
  form: FormData,
  expected: {
    total: number
    currency: string
    shippingOptionId: string
  }
): Promise<{ cart?: HttpTypes.StoreCart; error?: string }> {
  try {
    const cart = await prepare(form, true)
    if (
      cart.total !== expected.total ||
      cart.currency_code !== expected.currency ||
      cart.shipping_methods?.at(-1)?.shipping_option_id !==
        expected.shippingOptionId
    ) {
      return {
        cart,
        error:
          "Totali ose dërgesa ndryshoi. Kontrolloni totalin e ri dhe përfundoni porosinë.",
      }
    }
    await placeOrder()
    return { error: "Porosia nuk u përfundua. Ju lutemi provoni përsëri." }
  } catch (error) {
    unstable_rethrow(error)
    return {
      error:
        error instanceof Error
          ? error.message
          : "Porosia nuk u përfundua. Ju lutemi provoni përsëri.",
    }
  }
}
