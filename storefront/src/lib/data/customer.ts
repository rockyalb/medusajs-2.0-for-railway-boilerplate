"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { HttpTypes } from "@medusajs/types"
import { updateTag } from "next/cache"
import { redirect } from "next/navigation"
import { cache } from "react"
import { transferCartToCustomer } from "./cart"
import { getAuthHeaders, removeAuthToken, setAuthToken } from "./cookies"

const getAuthTokenValue = (token: unknown) => {
  if (typeof token === "string") {
    return token
  }

  if (token && typeof token === "object" && "location" in token) {
    return String((token as { location: unknown }).location)
  }

  return ""
}

export const getCustomer = cache(async function () {
  return await sdk.client
    .fetch<HttpTypes.StoreCustomerResponse>("/store/customers/me", {
      query: {},
      cache: "no-store",
      headers: { ...(await getAuthHeaders()) },
    })
    .then(({ customer }) => customer)
    .catch(() => null)
})

export const updateCustomer = cache(async function (
  body: HttpTypes.StoreUpdateCustomer
) {
  const updateRes = await sdk.store.customer
    .update(body, {}, await getAuthHeaders())
    .then(({ customer }) => customer)
    .catch(medusaError)

  updateTag("customer")
  return updateRes
})

export async function signup(_currentState: unknown, formData: FormData) {
  const password = formData.get("password") as string
  const customerForm = {
    email: formData.get("email") as string,
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    phone: formData.get("phone") as string,
  }

  try {
    const token = await sdk.auth.register("customer", "emailpass", {
      email: customerForm.email,
      password: password,
    })

    const registrationToken = getAuthTokenValue(token)
    const customHeaders = { authorization: `Bearer ${registrationToken}` }

    const { customer: createdCustomer } = await sdk.store.customer.create(
      customerForm,
      {},
      customHeaders
    )

    const loginToken = await sdk.auth.login("customer", "emailpass", {
      email: customerForm.email,
      password,
    })

    const authToken = getAuthTokenValue(loginToken)
    const authHeaders = { authorization: `Bearer ${authToken}` }

    await setAuthToken(authToken)
    await transferCartToCustomer(undefined, authHeaders)

    updateTag("customer")
    return null
  } catch (error: any) {
    return error.toString()
  }
}

export async function login(_currentState: unknown, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  try {
    const token = await sdk.auth.login("customer", "emailpass", {
      email,
      password,
    })
    const authToken = getAuthTokenValue(token)
    const authHeaders = { authorization: `Bearer ${authToken}` }

    await setAuthToken(authToken)
    await transferCartToCustomer(undefined, authHeaders)

    updateTag("customer")
    return null
  } catch (error: any) {
    return error.toString()
  }
}

export async function signout() {
  await sdk.auth.logout()
  await removeAuthToken()
  updateTag("auth")
  updateTag("customer")
  redirect("/account")
}

export const addCustomerAddress = async (
  _currentState: unknown,
  formData: FormData
): Promise<any> => {
  const address = {
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    company: formData.get("company") as string,
    address_1: formData.get("address_1") as string,
    address_2: formData.get("address_2") as string,
    city: formData.get("city") as string,
    postal_code: formData.get("postal_code") as string,
    province: formData.get("province") as string,
    country_code: formData.get("country_code") as string,
    phone: formData.get("phone") as string,
  }

  return sdk.store.customer
    .createAddress(address, {}, await getAuthHeaders())
    .then(({ customer }) => {
      updateTag("customer")
      return { success: true, error: null }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
}

export const deleteCustomerAddress = async (
  addressId: string
): Promise<void> => {
  await sdk.store.customer
    .deleteAddress(addressId, await getAuthHeaders())
    .then(() => {
      updateTag("customer")
      return { success: true, error: null }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
}

export const updateCustomerAddress = async (
  currentState: Record<string, unknown>,
  formData: FormData
): Promise<any> => {
  const addressId = currentState.addressId as string

  const address = {
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    company: formData.get("company") as string,
    address_1: formData.get("address_1") as string,
    address_2: formData.get("address_2") as string,
    city: formData.get("city") as string,
    postal_code: formData.get("postal_code") as string,
    province: formData.get("province") as string,
    country_code: formData.get("country_code") as string,
    phone: formData.get("phone") as string,
  }

  return sdk.store.customer
    .updateAddress(addressId, address, {}, await getAuthHeaders())
    .then(() => {
      updateTag("customer")
      return { success: true, error: null }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
}
