"use client"

import { RadioGroup } from "@headlessui/react"
import { CheckCircleSolid } from "@medusajs/icons"
import { Button, Heading, Text, clx } from "@medusajs/ui"

import Divider from "@modules/common/components/divider"
import Radio from "@modules/common/components/radio"
import ErrorMessage from "@modules/checkout/components/error-message"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { setShippingMethod } from "@lib/data/cart"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"

type ShippingProps = {
  cart: HttpTypes.StoreCart
  availableShippingMethods: HttpTypes.StoreCartShippingOption[] | null
}

const FREE_DELIVERY_THRESHOLD = 7500

const normalizeCity = (city?: string | null) => {
  return city
    ?.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
}

const Shipping: React.FC<ShippingProps> = ({
  cart,
  availableShippingMethods,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const lastAppliedOptionIdRef = useRef<string | null>(null)

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "delivery"

  const selectedShippingMethod = availableShippingMethods?.find(
    // To do: remove the previously selected shipping method instead of using the last one
    (method) => method.id === cart.shipping_methods?.at(-1)?.shipping_option_id
  )

  const selectableShippingMethods = useMemo(() => {
    return (availableShippingMethods ?? []).filter(
      (method) => !method.insufficient_inventory
    )
  }, [availableShippingMethods])

  const automaticShippingMethod = useMemo(() => {
    if (!cart.shipping_address || selectableShippingMethods.length === 0) {
      return undefined
    }

    const cityGroup =
      normalizeCity(cart.shipping_address.city) === "tirane"
        ? "tirane"
        : "other"
    const targetCode =
      (cart.subtotal ?? 0) >= FREE_DELIVERY_THRESHOLD
        ? "free-delivery"
        : cityGroup === "tirane"
        ? "tirane-delivery"
        : "standard-delivery"

    return (
      selectableShippingMethods.find(
        (method) => method.type?.code === targetCode
      ) ?? selectableShippingMethods[0]
    )
  }, [cart.shipping_address, cart.subtotal, selectableShippingMethods])

  const handleEdit = () => {
    router.push(pathname + "?step=delivery", { scroll: false })
  }

  const handleSubmit = async () => {
    if (
      automaticShippingMethod &&
      selectedShippingMethod?.id !== automaticShippingMethod.id
    ) {
      const didSetShippingMethod = await set(automaticShippingMethod.id)

      if (!didSetShippingMethod) {
        return
      }
    }

    router.push(pathname + "?step=payment", { scroll: false })
  }

  const set = useCallback(async (id: string) => {
    setIsLoading(true)
    setError(null)
    lastAppliedOptionIdRef.current = id
    return await setShippingMethod({ cartId: cart.id, shippingMethodId: id })
      .then(() => true)
      .catch((err) => {
        lastAppliedOptionIdRef.current = null
        setError(err.message)
        return false
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [cart.id])

  useEffect(() => {
    if (
      !automaticShippingMethod ||
      selectedShippingMethod?.id === automaticShippingMethod.id ||
      lastAppliedOptionIdRef.current === automaticShippingMethod.id ||
      isLoading
    ) {
      return
    }

    set(automaticShippingMethod.id)
  }, [
    automaticShippingMethod,
    selectedShippingMethod?.id,
    isLoading,
    set,
  ])

  useEffect(() => {
    setError(null)
  }, [isOpen])

  return (
    <div className="bg-white">
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          level="h2"
          className={clx(
            "flex flex-row text-3xl-regular gap-x-2 items-baseline",
            {
              "opacity-50 pointer-events-none select-none":
                !isOpen && cart.shipping_methods?.length === 0,
            }
          )}
        >
          Delivery
          {!isOpen && (cart.shipping_methods?.length ?? 0) > 0 && (
            <CheckCircleSolid />
          )}
        </Heading>
        {!isOpen &&
          cart?.shipping_address &&
          cart?.billing_address &&
          cart?.email && (
            <Text>
              <button
                onClick={handleEdit}
                className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
                data-testid="edit-delivery-button"
              >
                Edit
              </button>
            </Text>
          )}
      </div>
      {isOpen ? (
        <div data-testid="delivery-options-container">
          <div className="pb-8">
            <RadioGroup value={selectedShippingMethod?.id} onChange={set}>
              {selectableShippingMethods.map((option) => {
                return (
                  <RadioGroup.Option
                    key={option.id}
                    value={option.id}
                    data-testid="delivery-option-radio"
                    className={clx(
                      "flex items-center justify-between text-small-regular cursor-pointer py-4 border rounded-rounded px-8 mb-2 hover:shadow-borders-interactive-with-active",
                      {
                        "border-ui-border-interactive":
                          option.id === selectedShippingMethod?.id,
                      }
                    )}
                  >
                    <div className="flex items-center gap-x-4">
                      <Radio
                        checked={option.id === selectedShippingMethod?.id}
                      />
                      <span className="text-base-regular">{option.name}</span>
                    </div>
                    <span className="justify-self-end text-ui-fg-base">
                      {convertToLocale({
                        amount: option.amount!,
                        currency_code: cart?.currency_code,
                      })}
                    </span>
                  </RadioGroup.Option>
                )
              })}
            </RadioGroup>
          </div>

          <ErrorMessage
            error={error}
            data-testid="delivery-option-error-message"
          />

          <Button
            size="large"
            className="mt-6"
            onClick={handleSubmit}
            isLoading={isLoading}
            disabled={!selectedShippingMethod && !automaticShippingMethod}
            data-testid="submit-delivery-option-button"
          >
            Continue to payment
          </Button>
        </div>
      ) : (
        <div>
          <div className="text-small-regular">
            {cart && (cart.shipping_methods?.length ?? 0) > 0 && (
              <div className="flex flex-col w-1/3">
                <Text className="txt-medium-plus text-ui-fg-base mb-1">
                  Method
                </Text>
                <Text className="txt-medium text-ui-fg-subtle">
                  {selectedShippingMethod?.name}{" "}
                  {convertToLocale({
                    amount: selectedShippingMethod?.amount!,
                    currency_code: cart?.currency_code,
                  })}
                </Text>
              </div>
            )}
          </div>
        </div>
      )}
      <Divider className="mt-8" />
    </div>
  )
}

export default Shipping
