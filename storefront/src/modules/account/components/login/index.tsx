"use client"

import { useEffect } from "react"
import { useFormState } from "react-dom"
import { useRouter } from "next/navigation"

import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import Input from "@modules/common/components/input"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import { login } from "@lib/data/customer"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
  returnTo?: string
}

const Login = ({ setCurrentView, returnTo }: Props) => {
  const [message, formAction] = useFormState(login, "idle")
  const router = useRouter()

  useEffect(() => {
    if (message === null) {
      if (returnTo) {
        router.push(returnTo)
      } else {
        router.refresh()
      }
    }
  }, [message, returnTo, router])

  return (
    <div
      className="max-w-sm w-full flex flex-col items-center"
      data-testid="login-page"
    >
      <h1 className="text-large-semi uppercase mb-6">Mirë se u kthyet</h1>
      <p className="text-center text-base-regular text-ui-fg-base mb-8">
        Hyni për të pasur një përvojë më të mirë blerjeje.
      </p>
      <form className="w-full" action={formAction}>
        <div className="flex flex-col w-full gap-y-2">
          <Input
            label="Email"
            name="email"
            type="email"
            title="Vendosni një adresë email-i të vlefshme."
            autoComplete="email"
            required
            data-testid="email-input"
          />
          <Input
            label="Fjalëkalimi"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            data-testid="password-input"
          />
        </div>
        <ErrorMessage error={typeof message === "string" && message !== "idle" ? message : null} data-testid="login-error-message" />
        <SubmitButton data-testid="sign-in-button" className="w-full mt-6">
          Hyr
        </SubmitButton>
      </form>
      <span className="text-center text-ui-fg-base text-small-regular mt-6">
        Nuk keni llogari?{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.REGISTER)}
          className="underline"
          data-testid="register-button"
        >
          Regjistrohu
        </button>
        .
      </span>
    </div>
  )
}

export default Login
