/**
 * Settings Content - Client Component
 *
 * Contenido principal de la página de configuraciones con diseño original
 */

'use client';

import { useEffect, useState } from "react";
import { Button } from "@/app/components/ui/Button";
import { FormField } from "@/app/components/ui/FigmaFloatingLabelInput";
import { showNotification } from "@/app/utils/notifications";
import { ToggleSwitch } from "@/app/components/ui/ToggleSwitch";
import { Cog } from '@styled-icons/boxicons-regular/Cog';
import { Envelope } from '@styled-icons/boxicons-regular/Envelope';
import { UserPlus } from '@styled-icons/boxicons-regular/UserPlus';
import { Shield } from '@styled-icons/boxicons-regular/Shield';
import { Palette } from '@styled-icons/boxicons-regular/Palette';
import { Support } from '@styled-icons/boxicons-regular/Support';
import { TrendingUp } from '@styled-icons/boxicons-regular/TrendingUp';
import { CheckCircle } from '@styled-icons/boxicons-regular/CheckCircle';
import { XCircle } from '@styled-icons/boxicons-regular/XCircle';

interface SettingsContentProps {
  translations: {
    title: string;
    description: string;
    sections: {
      tracker: string;
      email: string;
      support: string;
      registration: string;
      rateLimiting: string;
      branding: string;
      ratioSettings: string;
    };
    tracker: {
      description: string;
    };
    email: {
      description: string;
    };
    support: {
      description: string;
    };
    registration: {
      description: string;
    };
    rateLimiting: {
      description: string;
    };
    branding: {
      description: string;
    };
    ratioSettings: {
      description: string;
    };
  };
}

export default function SettingsContent({ translations }: SettingsContentProps) {
  const [config, setConfig] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [activeSection, setActiveSection] = useState('tracker');

  // Configuration sections with translations
  const CONFIG_SECTIONS = [
    {
      id: 'tracker',
      title: translations.sections.tracker,
      icon: Cog,
      description: translations.tracker.description
    },
    {
      id: 'email',
      title: translations.sections.email,
      icon: Envelope,
      description: translations.email.description
    },
    {
      id: 'support',
      title: translations.sections.support,
      icon: Support,
      description: translations.support.description
    },
    {
      id: 'registration',
      title: translations.sections.registration,
      icon: UserPlus,
      description: translations.registration.description
    },
    {
      id: 'rateLimiting',
      title: translations.sections.rateLimiting,
      icon: Shield,
      description: translations.rateLimiting.description
    },
    {
      id: 'branding',
      title: translations.sections.branding,
      icon: Palette,
      description: translations.branding.description
    },
    {
      id: 'ratioSettings',
      title: translations.sections.ratioSettings,
      icon: Shield,
      description: translations.ratioSettings.description
    }
  ];

  // Fetch config
  useEffect(() => {
    const fetchConfig = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/settings");
        if (!res.ok) throw new Error("Failed to fetch configuration");
        const data = await res.json();
        setConfig(data.config || {});
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Error loading configuration");
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const handleChange = (key: string, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  // Función para verificar qué preajuste coincide con la configuración actual
  const getActivePreset = () => {
    const currentRatio = config['MINIMUM_RATIO'] || '0.5';
    const currentBonus = config['BONUS_PER_GB'] || '1';
    const currentHitRuns = config['MAXIMUM_HITNRUNS'] || '5';
    const currentGrace = config['RATIO_GRACE_MB'] || '50';

    // Verificar preajuste Fácil
    if (currentRatio === '0.3' && currentBonus === '2' && currentHitRuns === '8' && currentGrace === '100') {
      return 'easy';
    }
    
    // Verificar preajuste Equilibrado
    if (currentRatio === '0.5' && currentBonus === '1' && currentHitRuns === '5' && currentGrace === '50') {
      return 'balanced';
    }
    
    // Verificar preajuste Estricto
    if (currentRatio === '1.0' && currentBonus === '0.5' && currentHitRuns === '3' && currentGrace === '25') {
      return 'strict';
    }
    
    return 'custom';
  };

  const activePreset = getActivePreset();

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config)
      });

      if (!res.ok) throw new Error("Failed to save configuration");

      setSuccess(true);
      showNotification.success("Configuración guardada exitosamente");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error saving configuration";
      setError(errorMessage);
      showNotification.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'tracker':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-text mb-4">Configuración del Tracker</h2>
              <p className="text-text-secondary mb-6">{translations.tracker.description}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Tracker URL"
                value={config['NEXT_PUBLIC_TRACKER_URL'] || ''}
                onChange={(value) => handleChange('NEXT_PUBLIC_TRACKER_URL', value)}
              />
            </div>
          </div>
        );

      case 'email':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-text mb-4">Configuración de Email</h2>
              <p className="text-text-secondary mb-6">{translations.email.description}</p>
            </div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-medium text-text">Habilitar Email</h3>
                <p className="text-sm text-text-secondary">Habilitar o deshabilitar la funcionalidad de email</p>
              </div>
              <ToggleSwitch
                checked={config['EMAIL_ENABLED'] !== 'false'}
                onChange={(e) => handleChange('EMAIL_ENABLED', e.target.checked ? 'true' : 'false')}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="SMTP Host"
                value={config['SMTP_HOST'] || ''}
                onChange={(value) => handleChange('SMTP_HOST', value)}
                disabled={config['EMAIL_ENABLED'] === 'false'}
              />
              <FormField
                label="SMTP Port"
                value={config['SMTP_PORT'] || ''}
                onChange={(value) => handleChange('SMTP_PORT', value)}
                disabled={config['EMAIL_ENABLED'] === 'false'}
              />
              <FormField
                label="SMTP User"
                value={config['SMTP_USER'] || ''}
                onChange={(value) => handleChange('SMTP_USER', value)}
                disabled={config['EMAIL_ENABLED'] === 'false'}
              />
              <FormField
                label="SMTP Password"
                type="password"
                value={config['SMTP_PASS'] || ''}
                onChange={(value) => handleChange('SMTP_PASS', value)}
                disabled={config['EMAIL_ENABLED'] === 'false'}
              />
              <FormField
                label="SMTP From"
                value={config['SMTP_FROM'] || ''}
                onChange={(value) => handleChange('SMTP_FROM', value)}
                disabled={config['EMAIL_ENABLED'] === 'false'}
              />
            </div>
          </div>
        );

      case 'support':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-text mb-4">Configuración de Soporte</h2>
              <p className="text-text-secondary mb-6">{translations.support.description}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Support Email"
                value={config['SUPPORT_EMAIL'] || ''}
                onChange={(value) => handleChange('SUPPORT_EMAIL', value)}
                type="email"
              />
            </div>
          </div>
        );

      case 'registration':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-text mb-4">Configuración de Registro</h2>
              <p className="text-text-secondary mb-6">{translations.registration.description}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Registration Mode"
                value={config['REGISTRATION_MODE'] || 'open'}
                onChange={(value) => handleChange('REGISTRATION_MODE', value)}
              />
              <FormField
                label="Invite Expiry (hours)"
                value={config['INVITE_EXPIRY_HOURS'] || '6'}
                onChange={(value) => handleChange('INVITE_EXPIRY_HOURS', value)}
                type="number"
              />
              <FormField
                label="Max Invites per User"
                value={config['MAX_INVITES_PER_USER'] || '5'}
                onChange={(value) => handleChange('MAX_INVITES_PER_USER', value)}
                type="number"
              />
            </div>
          </div>
        );

      case 'rateLimiting':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-text mb-4">Configuración de Rate Limiting</h2>
              <p className="text-text-secondary mb-6">{translations.rateLimiting.description}</p>
            </div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-medium text-text">Habilitar Rate Limiting</h3>
                <p className="text-sm text-text-secondary">Habilitar o deshabilitar la limitación de velocidad</p>
              </div>
              <ToggleSwitch
                checked={config['ANNOUNCE_RATE_LIMITING_ENABLED'] === 'true'}
                onChange={(e) => handleChange('ANNOUNCE_RATE_LIMITING_ENABLED', e.target.checked ? 'true' : 'false')}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Announce Interval"
                value={config['ANNOUNCE_INTERVAL'] || '900'}
                onChange={(value) => handleChange('ANNOUNCE_INTERVAL', value)}
                type="number"
                disabled={config['ANNOUNCE_RATE_LIMITING_ENABLED'] !== 'true'}
              />
              <FormField
                label="Min Interval"
                value={config['ANNOUNCE_MIN_INTERVAL'] || '300'}
                onChange={(value) => handleChange('ANNOUNCE_MIN_INTERVAL', value)}
                type="number"
                disabled={config['ANNOUNCE_RATE_LIMITING_ENABLED'] !== 'true'}
              />
              <FormField
                label="Rate Limit per Hour"
                value={config['ANNOUNCE_RATE_LIMIT_PER_HOUR'] || '60'}
                onChange={(value) => handleChange('ANNOUNCE_RATE_LIMIT_PER_HOUR', value)}
                type="number"
                disabled={config['ANNOUNCE_RATE_LIMITING_ENABLED'] !== 'true'}
              />
            </div>
          </div>
        );

      case 'branding':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-text mb-4">Configuración de Branding</h2>
              <p className="text-text-secondary mb-6">{translations.branding.description}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Branding Name"
                value={config['BRANDING_NAME'] || ''}
                onChange={(value) => handleChange('BRANDING_NAME', value)}
              />
            </div>
          </div>
        );

      case 'ratioSettings':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-text mb-4">Configuración de Ratio</h2>
              <p className="text-text-secondary mb-6">{translations.ratioSettings.description}</p>
            </div>
            
            {/* Preajustes de Ratio */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-text mb-4">Preajustes de Ratio</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Preajuste Fácil */}
                <button
                  type="button"
                  onClick={() => {
                    handleChange('MINIMUM_RATIO', '0.3');
                    handleChange('BONUS_PER_GB', '2');
                    handleChange('MAXIMUM_HITNRUNS', '8');
                    handleChange('RATIO_GRACE_MB', '100');
                  }}
                  className={`p-4 border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-colors text-left relative ${
                    activePreset === 'easy' ? 'border-primary/50 bg-primary/5' : 'border-border'
                  }`}
                >
                  {activePreset === 'easy' && (
                    <div className="absolute top-2 right-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary text-white">
                        Activo
                      </span>
                    </div>
                  )}
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                      <CheckCircle size={20} className="text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-text">Fácil</h4>
                      <p className="text-sm text-text-secondary">Ratio mínimo: 0.3</p>
                    </div>
                  </div>
                  <div className="text-xs text-text-secondary space-y-1">
                    <div>• Ratio mínimo: 0.3</div>
                    <div>• Bonus por GB: 2</div>
                    <div>• Hit & Runs máx: 8</div>
                    <div>• Gracia: 100 MB</div>
                  </div>
                </button>

                {/* Preajuste Equilibrado */}
                <button
                  type="button"
                  onClick={() => {
                    handleChange('MINIMUM_RATIO', '0.5');
                    handleChange('BONUS_PER_GB', '1');
                    handleChange('MAXIMUM_HITNRUNS', '5');
                    handleChange('RATIO_GRACE_MB', '50');
                  }}
                  className={`p-4 border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-colors text-left relative ${
                    activePreset === 'balanced' ? 'border-primary/50 bg-primary/5' : 'border-border'
                  }`}
                >
                  {activePreset === 'balanced' && (
                    <div className="absolute top-2 right-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary text-white">
                        Activo
                      </span>
                    </div>
                  )}
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <TrendingUp size={20} className="text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-text">Equilibrado</h4>
                      <p className="text-sm text-text-secondary">Ratio mínimo: 0.5</p>
                    </div>
                  </div>
                  <div className="text-xs text-text-secondary space-y-1">
                    <div>• Ratio mínimo: 0.5</div>
                    <div>• Bonus por GB: 1</div>
                    <div>• Hit & Runs máx: 5</div>
                    <div>• Gracia: 50 MB</div>
                  </div>
                </button>

                {/* Preajuste Estricto */}
                <button
                  type="button"
                  onClick={() => {
                    handleChange('MINIMUM_RATIO', '1.0');
                    handleChange('BONUS_PER_GB', '0.5');
                    handleChange('MAXIMUM_HITNRUNS', '3');
                    handleChange('RATIO_GRACE_MB', '25');
                  }}
                  className={`p-4 border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-colors text-left relative ${
                    activePreset === 'strict' ? 'border-primary/50 bg-primary/5' : 'border-border'
                  }`}
                >
                  {activePreset === 'strict' && (
                    <div className="absolute top-2 right-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary text-white">
                        Activo
                      </span>
                    </div>
                  )}
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                      <XCircle size={20} className="text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-text">Estricto</h4>
                      <p className="text-sm text-text-secondary">Ratio mínimo: 1.0</p>
                    </div>
                  </div>
                  <div className="text-xs text-text-secondary space-y-1">
                    <div>• Ratio mínimo: 1.0</div>
                    <div>• Bonus por GB: 0.5</div>
                    <div>• Hit & Runs máx: 3</div>
                    <div>• Gracia: 25 MB</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Configuración Manual */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-text">Configuración Manual</h3>
                {activePreset === 'custom' && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Configuración Personalizada
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="Minimum Ratio"
                  value={config['MINIMUM_RATIO'] || '0.5'}
                  onChange={(value) => handleChange('MINIMUM_RATIO', value)}
                  type="number"
                />
                <FormField
                  label="Bonus per GB"
                  value={config['BONUS_PER_GB'] || '1'}
                  onChange={(value) => handleChange('BONUS_PER_GB', value)}
                  type="number"
                />
                <FormField
                  label="Maximum Hit & Runs"
                  value={config['MAXIMUM_HITNRUNS'] || '5'}
                  onChange={(value) => handleChange('MAXIMUM_HITNRUNS', value)}
                  type="number"
                />
                <FormField
                  label="Ratio Grace MB"
                  value={config['RATIO_GRACE_MB'] || '50'}
                  onChange={(value) => handleChange('RATIO_GRACE_MB', value)}
                  type="number"
                />
              </div>
            </div>
          </div>
        );

      default:
        return <div>Sección no encontrada</div>;
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-10">
        <div className="mb-8 animate-pulse">
          <div className="h-8 bg-surface-light rounded mb-2"></div>
          <div className="h-4 bg-surface-light rounded"></div>
        </div>
        <div className="flex gap-6">
          <div className="w-80 flex-shrink-0">
            <div className="bg-surface border border-border rounded-lg overflow-hidden">
              <div className="p-4 border-b border-border bg-surface-light">
                <div className="h-6 bg-surface-light rounded"></div>
              </div>
              <div className="p-2">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="p-3 mb-1">
                    <div className="h-4 bg-surface-light rounded mb-1"></div>
                    <div className="h-3 bg-surface-light rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex-1">
            <div className="bg-surface border border-border rounded-lg p-8">
              <div className="space-y-6">
                <div className="h-6 bg-surface-light rounded mb-4"></div>
                <div className="h-4 bg-surface-light rounded mb-6"></div>
                <div className="h-10 bg-surface-light rounded mb-4"></div>
                <div className="h-10 bg-surface-light rounded mb-4"></div>
                <div className="h-10 bg-surface-light rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text mb-2">{translations.title}</h1>
        <p className="text-text-secondary">{translations.description}</p>
      </div>

      {/* Two-column layout */}
      <div className="flex gap-6">
        {/* Left sidebar - Menu */}
        <div className="w-80 flex-shrink-0">
          <div className="bg-surface border border-border rounded-lg overflow-hidden">
            <div className="p-4 border-b border-border bg-surface-light">
              <h2 className="text-lg font-semibold text-text">Secciones</h2>
            </div>
            <nav className="p-2">
              {CONFIG_SECTIONS.map((section) => {
                const IconComponent = section.icon;
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
                );
              })}
            </nav>
          </div>
        </div>

        {/* Right content area */}
        <div className="flex-1">
          <div className="bg-surface border border-border rounded-lg p-8 shadow-sm">
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSave();
              }}
            >
              {/* Section content */}
              {renderSectionContent()}

              {/* Error/Success Messages */}
              {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800">{error}</p>
                </div>
              )}

              {success && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800">Configuración guardada exitosamente</p>
                </div>
              )}

              {/* Save Button */}
              <div className="flex items-center space-x-4 mt-8 pt-6 border-t border-border">
                <Button type="submit" disabled={saving} variant="accent">
                  {saving ? 'Guardando...' : 'Guardar Configuración'}
                </Button>
                {success && <span className="text-green-600 text-sm">Guardado exitosamente</span>}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 