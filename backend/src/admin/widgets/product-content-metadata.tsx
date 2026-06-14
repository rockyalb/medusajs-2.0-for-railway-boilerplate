import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { PencilSquare } from "@medusajs/icons"
import {
  Button,
  Container,
  Drawer,
  Label,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui"
import type { AdminProduct, DetailWidgetProps } from "@medusajs/framework/types"
import { useEffect, useMemo, useState } from "react"
import type { FormEvent } from "react"
import { sdk } from "../lib/client"

type ProductMetadata = Record<string, unknown>

type MetadataField = {
  key:
    | "details"
    | "ingredients"
    | "how_to_use"
    | "meta_custom_label_0"
    | "meta_custom_label_1"
    | "meta_custom_label_2"
    | "meta_custom_label_3"
    | "meta_custom_label_4"
  label: string
  aliases?: string[]
  rows?: number
}

const fields: MetadataField[] = [
  {
    key: "details",
    label: "Details",
    aliases: ["product_details"],
  },
  {
    key: "ingredients",
    label: "Ingredients",
  },
  {
    key: "how_to_use",
    label: "How to use",
    aliases: ["howToUse", "how-to-use", "how to use"],
  },
  {
    key: "meta_custom_label_0",
    label: "Meta custom label 0",
    rows: 2,
  },
  {
    key: "meta_custom_label_1",
    label: "Meta custom label 1",
    rows: 2,
  },
  {
    key: "meta_custom_label_2",
    label: "Meta custom label 2",
    rows: 2,
  },
  {
    key: "meta_custom_label_3",
    label: "Meta custom label 3",
    rows: 2,
  },
  {
    key: "meta_custom_label_4",
    label: "Meta custom label 4",
    rows: 2,
  },
]

const stringifyMetadataValue = (value: unknown): string => {
  if (value === undefined || value === null) {
    return ""
  }

  if (typeof value === "string") {
    return value
  }

  if (Array.isArray(value)) {
    return value.map(stringifyMetadataValue).filter(Boolean).join("\n")
  }

  if (typeof value === "object") {
    return Object.entries(value)
      .map(([key, entryValue]) => {
        const formatted = stringifyMetadataValue(entryValue)

        return formatted ? `${key}: ${formatted}` : ""
      })
      .filter(Boolean)
      .join("\n")
  }

  return String(value)
}

const getFieldValue = (metadata: ProductMetadata, field: MetadataField) => {
  const keys = [field.key, ...(field.aliases || [])]
  const value = keys
    .map((key) => metadata[key])
    .find((entry) => stringifyMetadataValue(entry).trim().length > 0)

  return stringifyMetadataValue(value)
}

const ProductContentMetadataWidget = ({
  data,
}: DetailWidgetProps<AdminProduct>) => {
  const [open, setOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [metadata, setMetadata] = useState<ProductMetadata>(
    (data.metadata || {}) as ProductMetadata
  )

  const initialValues = useMemo(() => {
    return fields.reduce(
      (values, field) => ({
        ...values,
        [field.key]: getFieldValue(metadata, field),
      }),
      {} as Record<MetadataField["key"], string>
    )
  }, [metadata])

  const [formValues, setFormValues] = useState(initialValues)

  useEffect(() => {
    if (open) {
      setFormValues(initialValues)
    }
  }, [initialValues, open])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsPending(true)

    const nextMetadata = fields.reduce(
      (values, field) => ({
        ...values,
        [field.key]: formValues[field.key].trim(),
      }),
      { ...metadata } as ProductMetadata
    )

    try {
      const response = await sdk.client.fetch<{ product: AdminProduct }>(
        `/admin/products/${data.id}`,
        {
          method: "POST",
          body: {
            metadata: nextMetadata,
          },
        }
      )

      setMetadata((response.product?.metadata || {}) as ProductMetadata)
      setOpen(false)
      toast.success("Product content updated")
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to update product content")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Text size="small" leading="compact" weight="plus">
            Product content
          </Text>
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            Edit PDP content and Meta catalog labels.
          </Text>
        </div>
        <Button size="small" variant="secondary" onClick={() => setOpen(true)}>
          <PencilSquare />
          Edit
        </Button>
      </div>

      <div className="grid gap-y-4 px-6 py-4">
        {fields.map((field) => {
          const value = initialValues[field.key]

          return (
            <div key={field.key} className="grid gap-y-1">
              <Text size="small" leading="compact" weight="plus">
                {field.label}
              </Text>
              <Text
                size="small"
                leading="compact"
                className="line-clamp-3 whitespace-pre-line text-ui-fg-subtle"
              >
                {value || "Not set"}
              </Text>
            </div>
          )
        })}
      </div>

      <Drawer open={open} onOpenChange={setOpen}>
        <Drawer.Content>
          <form onSubmit={handleSubmit} className="flex h-full flex-col">
            <Drawer.Header>
              <Drawer.Title>Edit product content</Drawer.Title>
            </Drawer.Header>

            <Drawer.Body className="flex-1 overflow-auto p-4">
              <div className="flex flex-col gap-y-4">
                {fields.map((field) => (
                  <div key={field.key} className="grid gap-y-2">
                    <Label htmlFor={`product-content-${field.key}`}>
                      {field.label}
                    </Label>
                    <Textarea
                      id={`product-content-${field.key}`}
                      rows={field.rows || 8}
                      value={formValues[field.key]}
                      onChange={(event) =>
                        setFormValues((current) => ({
                          ...current,
                          [field.key]: event.target.value,
                        }))
                      }
                      disabled={isPending}
                    />
                  </div>
                ))}
              </div>
            </Drawer.Body>

            <Drawer.Footer>
              <div className="flex items-center justify-end gap-x-2">
                <Drawer.Close asChild>
                  <Button size="small" variant="secondary" disabled={isPending}>
                    Cancel
                  </Button>
                </Drawer.Close>
                <Button size="small" type="submit" isLoading={isPending}>
                  Save
                </Button>
              </div>
            </Drawer.Footer>
          </form>
        </Drawer.Content>
      </Drawer>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.after",
})

export default ProductContentMetadataWidget
