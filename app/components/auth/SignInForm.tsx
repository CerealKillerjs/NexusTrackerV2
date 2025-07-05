"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useI18n } from "@/app/hooks/useI18n"
import { Button } from "@/app/components/ui/Button"
import { Input } from "@/app/components/ui/Input"
import { createSignInSchema, type SignInInput } from "@/app/lib/validations"
import i18n from "@/app/lib/i18n"

export function SignInForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { t, isReady } = useI18n()

  // Create dynamic schema based on current language
  const [schema, setSchema] = useState(createSignInSchema())

  useEffect(() => {
    if (isReady) {
      const currentLang = i18n.language || 'es'
      setSchema(createSignInSchema(currentLang))
    }
  }, [isReady, i18n.language])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInInput>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: SignInInput) => {
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        setError(t("auth.errors.invalidCredentials"))
      } else {
        router.push("/dashboard")
        router.refresh()
      }
    } catch {
      setError(t("auth.errors.signInError"))
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
            auth.signin.title
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            auth.signin.subtitle
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
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">
          {t("auth.signin.title")}
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          {t("auth.signin.subtitle")}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          {t("auth.signin.button")}
        </Button>
      </form>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          {t("auth.signin.noAccount")}{" "}
          <a
            href="/auth/signup"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            {t("auth.signin.signUpLink")}
          </a>
        </p>
      </div>
    </div>
  )
} 