import { Modules } from '@medusajs/framework/utils'
import { INotificationModuleService, IOrderModuleService } from '@medusajs/framework/types'
import { SubscriberArgs, SubscriberConfig } from '@medusajs/medusa'
import { EmailTemplates } from '../modules/email-notifications/templates'
import { BREVO_ORDER_PLACED_TEMPLATE_ID, BREVO_REPLY_TO_EMAIL } from '../lib/constants'

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<any>) {
  const notificationModuleService: INotificationModuleService = container.resolve(Modules.NOTIFICATION)
  const orderModuleService: IOrderModuleService = container.resolve(Modules.ORDER)
  
  const order = await orderModuleService.retrieveOrder(data.id, { relations: ['items', 'summary', 'shipping_address'] })
  const shippingAddress = await (orderModuleService as any).orderAddressService_.retrieve(order.shipping_address.id)
  const orderNumber = String(order.display_id)

  try {
    await notificationModuleService.createNotifications({
      to: order.email,
      channel: 'email',
      template: EmailTemplates.ORDER_PLACED,
      data: {
        emailOptions: {
          replyTo: BREVO_REPLY_TO_EMAIL,
          ...(BREVO_ORDER_PLACED_TEMPLATE_ID
            ? { templateId: BREVO_ORDER_PLACED_TEMPLATE_ID }
            : { subject: `Porosia YCO #${orderNumber} u konfirmua` })
        },
        params: {
          order_number: orderNumber,
          order_date: new Date(order.created_at).toLocaleDateString(),
          customer_email: order.email,
          customer_first_name: shippingAddress.first_name,
          customer_last_name: shippingAddress.last_name,
          currency_code: order.currency_code?.toUpperCase(),
          total: order.summary.raw_current_order_total.value,
          shipping_address_1: shippingAddress.address_1,
          shipping_city: shippingAddress.city,
          shipping_province: shippingAddress.province,
          shipping_postal_code: shippingAddress.postal_code,
          shipping_country_code: shippingAddress.country_code,
          items: order.items.map((item) => ({
            title: item.title,
            product_title: item.product_title,
            quantity: item.quantity,
            unit_price: item.unit_price,
          })),
        },
        order,
        shippingAddress,
        preview: 'Thank you for your order!'
      }
    })
  } catch (error) {
    console.error('Error sending order confirmation notification:', error)
  }
}

export const config: SubscriberConfig = {
  event: 'order.placed'
}
