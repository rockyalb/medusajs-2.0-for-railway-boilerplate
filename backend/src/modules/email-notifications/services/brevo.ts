import { Logger, NotificationTypes } from '@medusajs/framework/types'
import { AbstractNotificationProviderService, MedusaError } from '@medusajs/framework/utils'
import { render } from '@react-email/render'
import { ReactNode } from 'react'
import { generateEmailTemplate } from '../templates'

type InjectedDependencies = {
  logger: Logger
}

interface BrevoServiceConfig {
  apiKey: string
  fromEmail: string
  fromName?: string
}

export interface BrevoNotificationServiceOptions {
  api_key: string
  from: string
  from_name?: string
}

type EmailAddressInput =
  | string
  | {
      email?: string
      name?: string
    }

type NotificationEmailOptions = {
  subject?: string
  replyTo?: EmailAddressInput
  cc?: EmailAddressInput | EmailAddressInput[]
  bcc?: EmailAddressInput | EmailAddressInput[]
  headers?: Record<string, string>
  text?: string
  templateId?: number | string
}

type BrevoRecipient = {
  email: string
  name?: string
}

type BrevoSendEmailPayload = {
  sender: BrevoRecipient
  to: BrevoRecipient[]
  subject?: string
  templateId?: number
  htmlContent?: string
  textContent?: string
  params?: Record<string, unknown>
  replyTo?: BrevoRecipient
  cc?: BrevoRecipient[]
  bcc?: BrevoRecipient[]
  headers?: Record<string, string>
  attachment?: {
    content: string
    name: string
  }[]
}

const toRecipient = (recipient: EmailAddressInput): BrevoRecipient | undefined => {
  if (typeof recipient === 'string') {
    return recipient.trim() ? { email: recipient.trim() } : undefined
  }

  if (recipient.email?.trim()) {
    return {
      email: recipient.email.trim(),
      name: recipient.name,
    }
  }

  return undefined
}

const toRecipients = (
  recipients: EmailAddressInput | EmailAddressInput[] | undefined
): BrevoRecipient[] | undefined => {
  if (!recipients) {
    return undefined
  }

  const recipientList = Array.isArray(recipients) ? recipients : [recipients]
  const normalized = recipientList
    .map((recipient) => toRecipient(recipient))
    .filter((recipient): recipient is BrevoRecipient => Boolean(recipient))

  return normalized.length ? normalized : undefined
}

export class BrevoNotificationService extends AbstractNotificationProviderService {
  static identifier = 'BREVO_NOTIFICATION_SERVICE'

  protected config_: BrevoServiceConfig
  protected logger_: Logger

  constructor({ logger }: InjectedDependencies, options: BrevoNotificationServiceOptions) {
    super()
    this.config_ = {
      apiKey: options.api_key,
      fromEmail: options.from,
      fromName: options.from_name,
    }
    this.logger_ = logger
  }

  async send(
    notification: NotificationTypes.ProviderSendNotificationDTO
  ): Promise<NotificationTypes.ProviderSendNotificationResultsDTO> {
    if (!notification) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, 'No notification information provided')
    }

    if (notification.channel === 'sms') {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, 'SMS notification not supported')
    }

    const emailOptions = (notification.data?.emailOptions ?? {}) as NotificationEmailOptions
    const templateId = emailOptions.templateId ? Number(emailOptions.templateId) : undefined
    const to = toRecipients(notification.to as EmailAddressInput | EmailAddressInput[])

    if (!to?.length) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, 'No email recipient provided')
    }

    const payload: BrevoSendEmailPayload = {
      sender: {
        email: notification.from?.trim() ?? this.config_.fromEmail,
        name: this.config_.fromName,
      },
      to,
      replyTo: toRecipient(emailOptions.replyTo),
      cc: toRecipients(emailOptions.cc),
      bcc: toRecipients(emailOptions.bcc),
      headers: emailOptions.headers,
      attachment: Array.isArray(notification.attachments)
        ? notification.attachments.map((attachment) => ({
            content: attachment.content,
            name: attachment.filename,
          }))
        : undefined,
    }

    if (templateId) {
      payload.templateId = templateId
      payload.params = (notification.data?.params ?? {}) as Record<string, unknown>
      payload.subject = emailOptions.subject
    } else {
      let emailContent: ReactNode

      try {
        emailContent = generateEmailTemplate(notification.template, notification.data)
      } catch (error) {
        if (error instanceof MedusaError) {
          throw error
        }

        throw new MedusaError(
          MedusaError.Types.UNEXPECTED_STATE,
          `Failed to generate email content for template: ${notification.template}`
        )
      }

      payload.subject = emailOptions.subject ?? 'You have a new notification'
      payload.htmlContent = await render(emailContent)
      payload.textContent = emailOptions.text ?? (await render(emailContent, { plainText: true }))
    }

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': this.config_.apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const responseBody = await response.text()

      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Failed to send "${notification.template}" email to ${to
          .map((recipient) => recipient.email)
          .join(', ')} via Brevo: ${response.status} ${response.statusText} - ${responseBody}`
      )
    }

    this.logger_.log(
      `Successfully sent "${notification.template}" email to ${to
        .map((recipient) => recipient.email)
        .join(', ')} via Brevo`
    )

    return {}
  }
}
