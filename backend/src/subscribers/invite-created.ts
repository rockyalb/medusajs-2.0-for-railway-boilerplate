import { INotificationModuleService, IUserModuleService } from '@medusajs/framework/types'
import { Modules } from '@medusajs/framework/utils'
import { SubscriberArgs, SubscriberConfig } from '@medusajs/framework'
import { BACKEND_URL, BREVO_INVITE_USER_TEMPLATE_ID, BREVO_REPLY_TO_EMAIL } from '../lib/constants'
import { EmailTemplates } from '../modules/email-notifications/templates'

export default async function userInviteHandler({
    event: { data },
    container,
  }: SubscriberArgs<any>) {

  const notificationModuleService: INotificationModuleService = container.resolve(
    Modules.NOTIFICATION,
  )
  const userModuleService: IUserModuleService = container.resolve(Modules.USER)
  const invite = await userModuleService.retrieveInvite(data.id)
  const inviteLink = `${BACKEND_URL}/app/invite?token=${invite.token}`

  try {
    await notificationModuleService.createNotifications({
      to: invite.email,
      channel: 'email',
      template: EmailTemplates.INVITE_USER,
      data: {
        emailOptions: {
          replyTo: BREVO_REPLY_TO_EMAIL,
          ...(BREVO_INVITE_USER_TEMPLATE_ID
            ? { templateId: BREVO_INVITE_USER_TEMPLATE_ID }
            : { subject: 'Je ftuar në YCO Admin' })
        },
        params: {
          invite_link: inviteLink,
          email: invite.email,
        },
        inviteLink,
        preview: 'The administration dashboard awaits...'
      }
    })
  } catch (error) {
    console.error(error)
  }
}

export const config: SubscriberConfig = {
  event: ['invite.created', 'invite.resent']
}
