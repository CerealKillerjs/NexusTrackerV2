"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import AdminLayout from "@/app/components/admin/AdminLayout"
import { Button } from "@/app/components/ui/Button"
import { Input } from "@/app/components/ui/Input"
import { showNotification } from "@/app/utils/notifications"
import { ToggleSwitch } from "@/app/components/ui/ToggleSwitch"

export default function AdminSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [config, setConfig] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Only allow admins
  useEffect(() => {
    if (status === "loading") return
    if (status === "unauthenticated" || session?.user?.role !== "ADMIN") {
      router.push("/dashboard")
    }
  }, [status, session, router])

  // Fetch config
  useEffect(() => {
    const fetchConfig = async () => {
      setLoading(true)
      try {
        const res = await fetch("/api/admin/settings")
        if (!res.ok) throw new Error("Failed to fetch configuration")
        const data = await res.json()
        setConfig(data.config || {})
      } catch (err: any) {
        setError(err.message || "Error loading configuration")
      } finally {
        setLoading(false)
      }
    }
    if (status === "authenticated" && session?.user?.role === "ADMIN") {
      fetchConfig()
    }
  }, [status, session])

  // Handle input change
  const handleChange = (key: string, value: string) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }

  // Handle save
  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(false)
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      })
      if (!res.ok) throw new Error("Failed to save configuration")
      showNotification.success("Configuration saved")
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || "Error saving configuration")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <AdminLayout><div className="p-8">Loading configuration...</div></AdminLayout>
  }
  if (error) {
    return <AdminLayout><div className="p-8 text-red-600">{error}</div></AdminLayout>
  }

  // Group settings (example: SMTP, Tracker, etc.)
  const smtpKeys = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "SMTP_FROM"]
  const trackerKeys = ["NEXT_PUBLIC_TRACKER_URL"]
  const emailEnabledKey = "EMAIL_ENABLED"
  const emailEnabled = config[emailEnabledKey] !== "false"
  const supportEmailKey = "SUPPORT_EMAIL"

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text mb-2">System Settings</h1>
          <p className="text-text-secondary">Manage system-wide configuration for your tracker. Changes are applied instantly.</p>
        </div>

        <div className="bg-surface border border-border rounded-lg p-8 shadow-sm">
          <form
            onSubmit={e => {
              e.preventDefault()
              handleSave()
            }}
            className="space-y-8"
          >
            {/* Tracker Section */}
            <div>
              <h2 className="text-xl font-semibold text-text mb-4">Tracker</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {trackerKeys.map((key) => (
                  <div key={key}>
                    <label className="block font-medium mb-1 capitalize text-white" htmlFor={key}>{key.replace(/_/g, ' ')}</label>
                    <Input
                      id={key}
                      value={config[key] || ''}
                      onChange={e => handleChange(key, e.target.value)}
                      className="w-full text-white"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* SMTP Section */}
            <div>
              <div className="flex items-center justify-between mb-4 mt-6">
                <h2 className="text-xl font-semibold text-text">Email (SMTP)</h2>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-white">Enable Email</span>
                  <ToggleSwitch
                    checked={emailEnabled}
                    onChange={e => handleChange(emailEnabledKey, e.target.checked ? "true" : "false")}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {smtpKeys.map((key) => (
                  <div key={key}>
                    <label className="block font-medium mb-1 capitalize text-white" htmlFor={key}>{key.replace(/_/g, ' ')}</label>
                    <Input
                      id={key}
                      value={config[key] || ''}
                      onChange={e => handleChange(key, e.target.value)}
                      className="w-full text-white"
                      type={key === "SMTP_PASS" ? "password" : "text"}
                      disabled={!emailEnabled}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Support Email Section */}
            <div>
              <h2 className="text-xl font-semibold text-text mb-4 mt-8">Support Email</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-medium mb-1 capitalize text-white" htmlFor={supportEmailKey}>Support Email</label>
                  <Input
                    id={supportEmailKey}
                    value={config[supportEmailKey] || ''}
                    onChange={e => handleChange(supportEmailKey, e.target.value)}
                    className="w-full text-white"
                    type="email"
                  />
                </div>
              </div>
            </div>

            {/* Save Button and Success Message */}
            <div className="flex items-center space-x-4 mt-8">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Settings"}
              </Button>
              {success && <span className="text-green-600 text-sm">Settings saved!</span>}
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  )
} 