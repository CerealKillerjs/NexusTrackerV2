"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import AdminLayout from "@/app/components/admin/AdminLayout"
import { Button } from "@/app/components/ui/Button"
import { FormField } from "@/app/components/ui/FigmaFloatingLabelInput"
import { SelectField } from "@/app/components/ui/FigmaFloatingLabelSelect"
import { showNotification } from "@/app/utils/notifications"
import { ToggleSwitch } from "@/app/components/ui/ToggleSwitch"
import { useI18n } from '@/app/hooks/useI18n'
// Icon imports for menu items
import { Cog } from '@styled-icons/boxicons-regular/Cog'
import { Envelope } from '@styled-icons/boxicons-regular/Envelope'
import { UserPlus } from '@styled-icons/boxicons-regular/UserPlus'
import { Shield } from '@styled-icons/boxicons-regular/Shield'
import { Palette } from '@styled-icons/boxicons-regular/Palette'
import { Support } from '@styled-icons/boxicons-regular/Support'

export default function AdminSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t } = useI18n()
  const [config, setConfig] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [activeSection, setActiveSection] = useState('tracker')

  // Configuration sections with translations
  const CONFIG_SECTIONS = [
    {
      id: 'tracker',
      title: t('admin.settings.sections.tracker'),
      icon: Cog,
      description: t('admin.settings.tracker.description')
    },
    {
      id: 'email',
      title: t('admin.settings.sections.email'),
      icon: Envelope,
      description: t('admin.settings.email.description')
    },
    {
      id: 'support',
      title: t('admin.settings.sections.support'),
      icon: Support,
      description: t('admin.settings.support.description')
    },
    {
      id: 'registration',
      title: t('admin.settings.sections.registration'),
      icon: UserPlus,
      description: t('admin.settings.registration.description')
    },
    {
      id: 'rateLimiting',
      title: t('admin.settings.sections.rateLimiting'),
      icon: Shield,
      description: t('admin.settings.rateLimiting.description')
    },
    {
      id: 'branding',
      title: t('admin.settings.sections.branding'),
      icon: Palette,
      description: t('admin.settings.branding.description')
    },
    {
      id: 'ratioSettings',
      title: t('admin.settings.sections.ratioSettings'),
      icon: Shield,
      description: t('admin.settings.ratioSettings.description')
    }
  ]

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
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Error loading configuration")
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
      showNotification.success(t('admin.settings.actions.saved'))
      setSuccess(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error saving configuration")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <AdminLayout><div className="p-8">{t('common.loading')}</div></AdminLayout>
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

  // Announce rules config keys
  const ratioKeys = [
    { key: 'MINIMUM_RATIO', label: t('admin.settings.ratioSettings.minimumRatio'), type: 'number' },
    { key: 'BONUS_PER_GB', label: t('admin.settings.ratioSettings.bonusPerGb'), type: 'number' },
    { key: 'MAXIMUM_HITNRUNS', label: t('admin.settings.ratioSettings.maxHitnRuns'), type: 'number' },
    { key: 'RATIO_GRACE_MB', label: t('admin.settings.ratioSettings.graceMb'), type: 'number' }, // Grace period in MB
  ];

  // Preset values
  const ratioPresets = [
    {
      name: t('admin.settings.ratioSettings.presets.easy'),
      values: { MINIMUM_RATIO: '0.2', BONUS_PER_GB: '2', MAXIMUM_HITNRUNS: '10' }
    },
    {
      name: t('admin.settings.ratioSettings.presets.balanced'),
      values: { MINIMUM_RATIO: '0.4', BONUS_PER_GB: '1', MAXIMUM_HITNRUNS: '5' }
    },
    {
      name: t('admin.settings.ratioSettings.presets.strict'),
      values: { MINIMUM_RATIO: '0.8', BONUS_PER_GB: '3', MAXIMUM_HITNRUNS: '2' }
    },
  ];

  // Render section content
  const renderSectionContent = () => {
    switch (activeSection) {
      case 'tracker':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-text mb-4">{t('admin.settings.tracker.title')}</h2>
              <p className="text-text-secondary mb-6">{t('admin.settings.tracker.description')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {trackerKeys.map((key) => (
                <div key={key}>
                  <FormField
                    label={t('admin.settings.tracker.trackerUrl')}
                    value={config[key] || ''}
                    onChange={val => handleChange(key, val)}
                    className="w-full text-white"
                  />
                </div>
              ))}
            </div>
          </div>
        )

      case 'email':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-text mb-4">{t('admin.settings.email.title')}</h2>
              <p className="text-text-secondary mb-6">{t('admin.settings.email.description')}</p>
            </div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-medium text-text">{t('admin.settings.email.enableEmail')}</h3>
                <p className="text-sm text-text-secondary">{t('admin.settings.email.enableEmailDesc')}</p>
              </div>
              <ToggleSwitch
                checked={emailEnabled}
                onChange={e => handleChange(emailEnabledKey, e.target.checked ? "true" : "false")}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {smtpKeys.map((key) => {
                // Map SMTP keys to translation keys
                const translationKey = key === "SMTP_HOST" ? "smtpHost" :
                                     key === "SMTP_PORT" ? "smtpPort" :
                                     key === "SMTP_USER" ? "smtpUser" :
                                     key === "SMTP_PASS" ? "smtpPass" :
                                     key === "SMTP_FROM" ? "smtpFrom" : key.toLowerCase()
                
                return (
                  <div key={key}>
                    <FormField
                      label={t(`admin.settings.email.${translationKey}`)}
                      value={config[key] || ''}
                      onChange={val => handleChange(key, val)}
                      type={key === "SMTP_PASS" ? "password" : "text"}
                      disabled={!emailEnabled}
                      className="w-full text-white"
                    />
                  </div>
                )
              })}
            </div>
          </div>
        )

      case 'support':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-text mb-4">{t('admin.settings.support.title')}</h2>
              <p className="text-text-secondary mb-6">{t('admin.settings.support.description')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <FormField
                  label={t('admin.settings.support.supportEmail')}
                  value={config[supportEmailKey] || ''}
                  onChange={val => handleChange(supportEmailKey, val)}
                  className="w-full text-white"
                  type="email"
                />
                <p className="text-sm text-text-secondary mt-2">
                  {t('admin.settings.support.supportEmailDesc')}
                </p>
              </div>
            </div>
          </div>
        )

      case 'registration':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-text mb-4">{t('admin.settings.registration.title')}</h2>
              <p className="text-text-secondary mb-6">{t('admin.settings.registration.description')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <SelectField
                  label={t('admin.settings.registration.registrationMode')}
                  options={[
                    { value: "open", label: t('admin.settings.registration.modes.open') },
                    { value: "invite_only", label: t('admin.settings.registration.modes.inviteOnly') },
                    { value: "closed", label: t('admin.settings.registration.modes.closed') },
                  ]}
                  value={config["REGISTRATION_MODE"] || 'open'}
                  onChange={val => handleChange("REGISTRATION_MODE", val)}
                  className="w-full text-white"
                />
                <p className="text-sm text-text-secondary mt-2">
                  {t('admin.settings.registration.registrationModeDesc')}
                </p>
              </div>
              <div>
                <FormField
                  label={t('admin.settings.registration.inviteExpiry')}
                  value={config["INVITE_EXPIRY_HOURS"] || '6'}
                  onChange={val => handleChange("INVITE_EXPIRY_HOURS", val)}
                  className="w-full text-white"
                  type="number"
                />
                <p className="text-sm text-text-secondary mt-2">
                  {t('admin.settings.registration.inviteExpiryDesc')}
                </p>
              </div>
              <div>
                <FormField
                  label={t('admin.settings.registration.maxInvites')}
                  value={config["MAX_INVITES_PER_USER"] || '5'}
                  onChange={val => handleChange("MAX_INVITES_PER_USER", val)}
                  className="w-full text-white"
                  type="number"
                />
                <p className="text-sm text-text-secondary mt-2">
                  {t('admin.settings.registration.maxInvitesDesc')}
                </p>
              </div>
            </div>
          </div>
        )

      case 'rateLimiting':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-text mb-4">{t('admin.settings.rateLimiting.title')}</h2>
              <p className="text-text-secondary mb-6">{t('admin.settings.rateLimiting.description')}</p>
            </div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-medium text-text">{t('admin.settings.rateLimiting.enableRateLimiting')}</h3>
                <p className="text-sm text-text-secondary">{t('admin.settings.rateLimiting.enableRateLimitingDesc')}</p>
              </div>
              <ToggleSwitch
                checked={config["ANNOUNCE_RATE_LIMITING_ENABLED"] === "true"}
                onChange={e => handleChange("ANNOUNCE_RATE_LIMITING_ENABLED", e.target.checked ? "true" : "false")}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <FormField
                  label={t('admin.settings.rateLimiting.announceInterval')}
                  value={config["ANNOUNCE_INTERVAL"] || '900'}
                  onChange={val => handleChange("ANNOUNCE_INTERVAL", val)}
                  className="w-full text-white"
                  type="number"
                />
                <p className="text-sm text-text-secondary mt-2">
                  {t('admin.settings.rateLimiting.announceIntervalDesc')}
                </p>
              </div>
              <div>
                <FormField
                  label={t('admin.settings.rateLimiting.minInterval')}
                  value={config["ANNOUNCE_MIN_INTERVAL"] || '300'}
                  onChange={val => handleChange("ANNOUNCE_MIN_INTERVAL", val)}
                  className="w-full text-white"
                  type="number"
                />
                <p className="text-sm text-text-secondary mt-2">
                  {t('admin.settings.rateLimiting.minIntervalDesc')}
                </p>
              </div>
              <div>
                <FormField
                  label={t('admin.settings.rateLimiting.rateLimitPerHour')}
                  value={config["ANNOUNCE_RATE_LIMIT_PER_HOUR"] || '60'}
                  onChange={val => handleChange("ANNOUNCE_RATE_LIMIT_PER_HOUR", val)}
                  className="w-full text-white"
                  type="number"
                />
                <p className="text-sm text-text-secondary mt-2">
                  {t('admin.settings.rateLimiting.rateLimitPerHourDesc')}
                </p>
              </div>
            </div>
          </div>
        )

      case 'branding':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-text mb-4">{t('admin.settings.branding.title')}</h2>
              <p className="text-text-secondary mb-6">{t('admin.settings.branding.description')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <FormField
                  label={t('admin.settings.branding.trackerName')}
                  value={config["BRANDING_NAME"] || ''}
                  onChange={val => handleChange("BRANDING_NAME", val)}
                  className="w-full text-white"
                  placeholder={t('admin.settings.branding.placeholder')}
                />
                <p className="text-sm text-text-secondary mt-2">
                  {t('admin.settings.branding.trackerNameDesc')}
                </p>
              </div>
            </div>
          </div>
        )

      case 'ratioSettings':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-text mb-4">{t('admin.settings.ratioSettings.title')}</h2>
              <p className="text-text-secondary mb-6">{t('admin.settings.ratioSettings.description')}</p>
            </div>
            {/* Recommended presets card */}
            <div className="mb-6 p-4 bg-surface-light border border-border rounded-lg">
              <h3 className="font-semibold mb-2">{t('admin.settings.ratioSettings.recommendedTitle')}</h3>
              <div className="flex flex-wrap gap-4">
                {ratioPresets.map((preset) => (
                  <Button
                    key={preset.name}
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      Object.entries(preset.values).forEach(([key, value]) => handleChange(key, value))
                    }}
                  >
                    {preset.name}
                  </Button>
                ))}
              </div>
              <div className="text-xs text-text-secondary mt-2">{t('admin.settings.ratioSettings.recommendedDesc')}</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {ratioKeys.map(({ key, label, type }) => (
                <div key={key}>
                  <FormField
                    label={label}
                    value={config[key] || ''}
                    onChange={val => handleChange(key, val)}
                    className="w-full text-white"
                    type={type}
                  />
                </div>
              ))}
            </div>
          </div>
        )

      default:
        return <div>Select a section from the menu</div>
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text mb-2">{t('admin.settings.title')}</h1>
          <p className="text-text-secondary">{t('admin.settings.description')}</p>
        </div>

        {/* Two-column layout */}
        <div className="flex gap-6">
          {/* Left sidebar - Menu */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-surface border border-border rounded-lg overflow-hidden">
              <div className="p-4 border-b border-border bg-surface-light">
                <h2 className="text-lg font-semibold text-text">{t('admin.settings.sections.title')}</h2>
              </div>
              <nav className="p-2">
                {CONFIG_SECTIONS.map((section) => {
                  const IconComponent = section.icon
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full text-left p-3 rounded-lg mb-1 transition-colors flex items-center space-x-3 ${
                        activeSection === section.id
                          ? 'bg-primary/10 text-primary'
                          : 'text-text hover:bg-surface-light'
                      }`}
                    >
                      <div className="w-5 h-5 flex items-center justify-center">
                        <IconComponent size={20} />
                      </div>
                      <div>
                        <div className="font-medium">{section.title}</div>
                        <div className={`text-xs ${activeSection === section.id ? 'text-primary/80' : 'text-text-secondary'}`}>
                          {section.description}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* Right content area */}
          <div className="flex-1">
            <div className="bg-surface border border-border rounded-lg p-8 shadow-sm">
              <form
                onSubmit={e => {
                  e.preventDefault()
                  handleSave()
                }}
              >
                {/* Section content */}
                {renderSectionContent()}

                {/* Save Button and Success Message */}
                <div className="flex items-center space-x-4 mt-8 pt-6 border-t border-border">
                  <Button type="submit" disabled={saving} variant="accent">
                    {saving ? t('admin.settings.actions.saving') : t('admin.settings.actions.save')}
                  </Button>
                  {success && <span className="text-green-600 text-sm">{t('admin.settings.actions.saved')}</span>}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
} 