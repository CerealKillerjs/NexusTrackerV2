"use client"

import { signOut } from "next-auth/react"
import { useI18n } from "@/app/hooks/useI18n"
import { Button } from "@/app/components/ui/Button"

export function LogoutButton() {
  const { t, isReady } = useI18n()

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" })
  }

  // Don't render until i18n is ready
  if (!isReady) {
    return (
      <Button
        onClick={handleSignOut}
        variant="outline"
        className="w-full"
      >
        Cerrar Sesión
      </Button>
    )
  }

  return (
    <Button
      onClick={handleSignOut}
      variant="outline"
      className="w-full"
    >
      {t("auth.logout")}
    </Button>
  )
} 