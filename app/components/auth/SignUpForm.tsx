"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useI18n } from "@/app/hooks/useI18n"
import { Button } from "@/app/components/ui/Button"
import { Input } from "@/app/components/ui/Input"
import { Toast } from "@/app/components/ui/Toast"
import { createSignUpSchema, type SignUpInput } from "@/app/lib/validations"
import i18n from "@/app/lib/i18n"

export function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [toast, setToast] = useState<{
    message: string
    type: "success" | "error" | "info"
    isVisible: boolean
  }>({
    message: "",
    type: "info",
    isVisible: false
  })
  
  const router = useRouter()
  const { t, isReady } = useI18n()

  // Create dynamic schema based on current language
  const [schema, setSchema] = useState(createSignUpSchema())

  useEffect(() => {
    if (isReady) {
      const currentLang = i18n.language || 'es'
      setSchema(createSignUpSchema(currentLang))
    }
  }, [isReady, i18n.language])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<SignUpInput>({
    resolver: zodResolver(schema),
  })

  const showToast = (message: string, type: "success" | "error" | "info") => {
    setToast({
      message,
      type,
      isVisible: true
    })
  }

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }))
  }

  const onSubmit = async (data: SignUpInput) => {
    setIsLoading(true)
    setError("")

    try {
      const currentLang = i18n.language || 'es'
      
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept-Language": currentLang,
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage = errorData.error || t("auth.errors.registrationFailed")
        setError(errorMessage)
        showToast(errorMessage, "error")
        return
      }

      // Registration successful
      showToast(t("auth.toast.registrationSuccess"), "success")
      
      // Reset form
      reset()
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/auth/signin")
      }, 2000)

    } catch {
      const errorMessage = t("auth.toast.networkError")
      setError(errorMessage)
      showToast(errorMessage, "error")
    } finally {
      setIsLoading(false)
    }
  }

  // Don't render until i18n is ready to prevent hydration mismatch
  if (!isReady) {
    return (
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            auth.signup.title
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            auth.signup.subtitle
          </p>
        </div>
        <div className="space-y-4">
          <div className="h-10 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-10 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-10 bg-gray-200 animate-pulse rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            {t("auth.signup.title")}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {t("auth.signup.subtitle")}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label={t("auth.username")}
            type="text"
            placeholder={t("auth.placeholders.username")}
            error={errors.username?.message}
            {...register("username")}
          />

          <Input
            label={t("auth.email")}
            type="email"
            placeholder={t("auth.placeholders.email")}
            error={errors.email?.message}
            {...register("email")}
          />

          <Input
            label={t("auth.password")}
            type="password"
            placeholder={t("auth.placeholders.password")}
            error={errors.password?.message}
            {...register("password")}
          />

          <Input
            label={t("auth.confirmPassword")}
            type="password"
            placeholder={t("auth.placeholders.password")}
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />

          {error && (
            <div className="rounded-md bg-red-50 p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            loading={isLoading}
          >
            {t("auth.signup.button")}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            {t("auth.signup.hasAccount")}{" "}
            <a
              href="/auth/signin"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              {t("auth.signup.signInLink")}
            </a>
          </p>
        </div>
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
        duration={toast.type === "success" ? 3000 : 5000}
      />
    </>
  )
} 