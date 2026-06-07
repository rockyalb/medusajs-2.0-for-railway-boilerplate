import { Text, clx } from "@medusajs/ui"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import React from "react"

type AccordionItemProps = AccordionPrimitive.AccordionItemProps & {
  title: string
  subtitle?: string
  description?: string
  required?: boolean
  tooltip?: string
  forceMountContent?: true
  headingSize?: "small" | "medium" | "large"
  customTrigger?: React.ReactNode
  complete?: boolean
  active?: boolean
  triggerable?: boolean
  children: React.ReactNode
}

type AccordionProps =
  | (AccordionPrimitive.AccordionSingleProps &
      React.RefAttributes<HTMLDivElement>)
  | (AccordionPrimitive.AccordionMultipleProps &
      React.RefAttributes<HTMLDivElement>)

const Accordion: React.FC<AccordionProps> & {
  Item: React.FC<AccordionItemProps>
} = ({ children, ...props }) => {
  return (
    /* x@ts-expect-error */
    <AccordionPrimitive.Root {...props}>{children}</AccordionPrimitive.Root>
  )
}

const Item: React.FC<AccordionItemProps> = ({
  title,
  subtitle,
  description,
  children,
  className,
  headingSize = "large",
  customTrigger = undefined,
  forceMountContent = undefined,
  triggerable,
  ...props
}) => {
  return (
    /* x@ts-expect-error */
    <AccordionPrimitive.Item
      {...props}
      className={clx(
        "group border-t border-yco-cream-dark last:mb-0 last:border-b",
        "py-4 scroll-mt-28",
        className
      )}
    >
      {/* x@ts-expect-error */}
      <AccordionPrimitive.Header className="px-1">
        {/* x@ts-expect-error */}
        <AccordionPrimitive.Trigger className="flex w-full flex-col text-left outline-none">
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-4">
              <Text className="font-sans text-sm font-bold uppercase tracking-[0.14em] text-yco-charcoal">
                {title}
              </Text>
            </div>
            {customTrigger || <MorphingTrigger />}
          </div>
          {subtitle && (
            <Text as="span" size="small" className="mt-1">
              {subtitle}
            </Text>
          )}
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
      {/* x@ts-expect-error */}
      <AccordionPrimitive.Content
        forceMount={forceMountContent}
        className={clx(
          "yco-expand-radix-content radix-state-closed:pointer-events-none px-1"
        )}
      >
        <div className="yco-expand-radix-inner inter-base-regular text-yco-charcoal">
          {description && <Text>{description}</Text>}
          <div className="w-full">{children}</div>
        </div>
      </AccordionPrimitive.Content>
    </AccordionPrimitive.Item>
  )
}

Accordion.Item = Item

const MorphingTrigger = () => {
  return (
    <div className="group relative rounded-circle bg-transparent p-[6px] text-yco-charcoal transition-colors duration-300 hover:bg-white disabled:bg-transparent disabled:text-yco-charcoal/30">
      <div className="h-5 w-5">
        <span className="absolute inset-y-[31.75%] left-[48%] right-1/2 w-[1.5px] rounded-circle bg-current transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-radix-state-open:rotate-90" />
        <span className="absolute inset-x-[31.75%] bottom-1/2 top-[48%] h-[1.5px] rounded-circle bg-current transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-radix-state-open:left-1/2 group-radix-state-open:right-1/2 group-radix-state-open:rotate-90" />
      </div>
    </div>
  )
}

export default Accordion
