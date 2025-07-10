"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import AdminLayout from "@/app/components/admin/AdminLayout"
import { Button } from "@/app/components/ui/Button"
import { Input } from "@/app/components/ui/Input"
import { FormField } from "@/app/components/ui/FigmaFloatingLabelInput"
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

  // Helper to convert HEX to RGB
  function hexToRgb(hex: string) {
    let c = hex.replace('#', '')
    if (c.length === 3) c = c.split('').map(x => x + x).join('')
    const num = parseInt(c, 16)
    return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`
  }

  // Handle file upload for logo and favicon
  const handleFileUpload = async (type: 'logo' | 'favicon', file: File) => {
    const formData = new FormData()
    formData.append('type', type)
    formData.append('file', file)
    const res = await fetch('/api/admin/branding/upload', {
      method: 'POST',
      body: formData,
    })
    const data = await res.json()
    if (res.ok && data.url) {
      handleChange(type === 'logo' ? 'BRANDING_LOGO_URL' : 'BRANDING_FAVICON_URL', data.url)
      showNotification.success(`${type === 'logo' ? 'Logo' : 'Favicon'} uploaded!`)
    } else {
      showNotification.error(data.error || 'Upload failed')
    }
  }

  // Reset branding colors to defaults from CSS variables
  const handleResetColors = async () => {
    // Get the current CSS variable values for --primary and --secondary
    const root = document.documentElement;
    const defaultPrimary = getComputedStyle(root).getPropertyValue('--primary').trim();
    const defaultSecondary = getComputedStyle(root).getPropertyValue('--secondary').trim();
    setConfig((prev) => ({
      ...prev,
      BRANDING_PRIMARY_COLOR: defaultPrimary,
      BRANDING_SECONDARY_COLOR: defaultSecondary,
    }));
    // Save immediately
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          BRANDING_PRIMARY_COLOR: defaultPrimary,
          BRANDING_SECONDARY_COLOR: defaultSecondary,
        }),
      });
      if (!res.ok) throw new Error("Failed to reset colors");
      showNotification.success("Colors reset to default");
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Error resetting colors");
    } finally {
      setSaving(false);
    }
  };

  // Branding keys
  const brandingKeys = {
    name: 'BRANDING_NAME',
    logo: 'BRANDING_LOGO_URL',
    favicon: 'BRANDING_FAVICON_URL',
    primary: 'BRANDING_PRIMARY_COLOR',
    secondary: 'BRANDING_SECONDARY_COLOR',
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
  const registrationKeys = ["REGISTRATION_MODE", "INVITE_EXPIRY_HOURS", "MAX_INVITES_PER_USER"]
  const emailEnabledKey = "EMAIL_ENABLED"
  const emailEnabled = config[emailEnabledKey] !== "false"
  const supportEmailKey = "SUPPORT_EMAIL"

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-text mb-2">System Settings</h1>
          <p className="text-lg text-text-secondary">Manage system-wide configuration for your tracker. Changes are applied instantly.</p>
        </div>
        <div className="bg-surface/80 backdrop-blur-xl border border-border/30 rounded-2xl shadow-xl p-10">
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
                    <FormField
                      label={key.replace(/_/g, ' ')}
                      value={config[key] || ''}
                      onChange={val => handleChange(key, val)}
                      className="w-full text-white"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Branding Section */}
            <div>
              <h2 className="text-xl font-semibold text-text mb-4 mt-8">Branding</h2>
              <div className="flex justify-end mb-4">
                <button
                  type="button"
                  className="px-4 py-2 bg-primary text-background rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium border border-primary/30 shadow"
                  onClick={handleResetColors}
                  disabled={saving}
                >
                  Reset to Default Colors
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tracker Name */}
                <div>
                  <FormField
                    label="Tracker Name"
                    value={config[brandingKeys.name] || ''}
                    onChange={val => handleChange(brandingKeys.name, val)}
                    className="w-full text-white"
                  />
                </div>
                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-medium text-white mb-1">Logo</label>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml"
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload('logo', e.target.files[0])
                      }
                    }}
                    className="block w-full text-white"
                  />
                  {config[brandingKeys.logo] && (
                    <img src={config[brandingKeys.logo]} alt="Logo Preview" className="mt-2 h-12" />
                  )}
                </div>
                {/* Favicon Upload */}
                <div>
                  <label className="block text-sm font-medium text-white mb-1">Favicon</label>
                  <input
                    type="file"
                    accept="image/png,image/x-icon,image/svg+xml"
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload('favicon', e.target.files[0])
                      }
                    }}
                    className="block w-full text-white"
                  />
                  {config[brandingKeys.favicon] && (
                    <img src={config[brandingKeys.favicon]} alt="Favicon Preview" className="mt-2 h-8" />
                  )}
                </div>
                {/* Primary Color */}
                <div>
                  <label className="block text-sm font-medium text-white mb-1">Primary Color</label>
                  <input
                    type="color"
                    value={config[brandingKeys.primary] || '#007bff'}
                    onChange={e => handleChange(brandingKeys.primary, e.target.value)}
                    className="w-16 h-10 p-0 border-none bg-transparent"
                  />
                  <div className="text-xs text-white mt-1">
                    HEX: {config[brandingKeys.primary] || '#007bff'}<br />
                    RGB: {hexToRgb(config[brandingKeys.primary] || '#007bff')}
                  </div>
                </div>
                {/* Secondary Color */}
                <div>
                  <label className="block text-sm font-medium text-white mb-1">Secondary Color</label>
                  <input
                    type="color"
                    value={config[brandingKeys.secondary] || '#6c757d'}
                    onChange={e => handleChange(brandingKeys.secondary, e.target.value)}
                    className="w-16 h-10 p-0 border-none bg-transparent"
                  />
                  <div className="text-xs text-white mt-1">
                    HEX: {config[brandingKeys.secondary] || '#6c757d'}<br />
                    RGB: {hexToRgb(config[brandingKeys.secondary] || '#6c757d')}
                  </div>
                </div>
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
              {emailEnabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {smtpKeys.map((key) => (
                    <div key={key}>
                      <FormField
                        label={key.replace(/_/g, ' ')}
                        value={config[key] || ''}
                        onChange={val => handleChange(key, val)}
                        type={key === "SMTP_PASS" ? "password" : "text"}
                        className="w-full text-white"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Support Email Section */}
            <div>
              <h2 className="text-xl font-semibold text-text mb-4 mt-8">Support Email</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <FormField
                    label="Support Email"
                    value={config[supportEmailKey] || ''}
                    onChange={val => handleChange(supportEmailKey, val)}
                    className="w-full text-white"
                    type="email"
                  />
                </div>
              </div>
            </div>

            {/* Registration Section */}
            <div>
              <h2 className="text-xl font-semibold text-text mb-4 mt-6">Registration & Invites</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <select
                    id="REGISTRATION_MODE"
                    value={config["REGISTRATION_MODE"] || 'open'}
                    onChange={e => handleChange("REGISTRATION_MODE", e.target.value)}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="open">Open Registration</option>
                    <option value="invite_only">Invite Only</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div>
                  <FormField
                    label="Invite Expiry (hours)"
                    value={config["INVITE_EXPIRY_HOURS"] || '6'}
                    onChange={val => handleChange("INVITE_EXPIRY_HOURS", val)}
                    className="w-full text-white"
                    type="number"
                    // min and max are not supported by FormField, but can be added if needed
                  />
                </div>
                <div>
                  <FormField
                    label="Max Invites Per User"
                    value={config["MAX_INVITES_PER_USER"] || '5'}
                    onChange={val => handleChange("MAX_INVITES_PER_USER", val)}
                    className="w-full text-white"
                    type="number"
                    // min and max are not supported by FormField, but can be added if needed
                  />
                </div>
              </div>
            </div>

            {/* Public Browsing Section */}
            <div>
              <h2 className="text-xl font-semibold text-text mb-4 mt-6">Public Browsing</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-medium mb-1 text-white" htmlFor="PUBLIC_BROWSING_MODE">Browsing Mode</label>
                  <select
                    id="PUBLIC_BROWSING_MODE"
                    value={config["PUBLIC_BROWSING_MODE"] || 'PUBLIC'}
                    onChange={e => handleChange("PUBLIC_BROWSING_MODE", e.target.value)}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="PUBLIC">Public - Search Engine Style</option>
                    <option value="PRIVATE">Private - Login Required</option>
                  </select>
                  <p className="text-sm text-text-secondary mt-1">
                    {config["PUBLIC_BROWSING_MODE"] === 'PUBLIC' 
                      ? 'Home page shows public torrent search (current design)'
                      : 'Home page shows simple login/register interface'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Save Button and Success Message */}
            <div className="flex items-center space-x-4 mt-8">
              <Button type="submit" disabled={saving} variant="accent">
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