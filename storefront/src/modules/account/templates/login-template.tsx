"use client"

import { useState } from "react"

import Register from "@modules/account/components/register"
import Login from "@modules/account/components/login"

export enum LOGIN_VIEW {
  SIGN_IN = "sign-in",
  REGISTER = "register",
}

type Props = {
  returnTo?: string
  initialView?: string
}

const LoginTemplate = ({ returnTo, initialView }: Props) => {
  const [currentView, setCurrentView] = useState(
    initialView === "register" ? LOGIN_VIEW.REGISTER : LOGIN_VIEW.SIGN_IN
  )

  return (
    <div className="w-full flex justify-start px-8 py-8">
      {currentView === "sign-in" ? (
        <Login setCurrentView={setCurrentView} returnTo={returnTo} />
      ) : (
        <Register setCurrentView={setCurrentView} returnTo={returnTo} />
      )}
    </div>
  )
}

export default LoginTemplate
