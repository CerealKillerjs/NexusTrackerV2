/**
 * NexusTracker Configuration
 * 
 * This file contains all configuration settings for the NexusTracker application.
 * It centralizes all environment variables and provides type-safe access to configuration.
 * 
 * Features:
 * - Type-safe configuration access
 * - Environment variable validation
 * - Default values for development
 * - Centralized configuration management
 * 
 * The configuration is split into:
 * - Environment settings (site name, URLs, etc.)
 * - Security settings (secrets, authentication)
 * - Feature flags and site behavior
 * - Database and external service settings
 */

/**
 * Environment Configuration
 * 
 * Contains all environment-specific settings like site name, URLs,
 * and feature configurations that control the site's behavior.
 */
export const envs = {
  /**
   * Site Configuration
   */
  // The name of your tracker site. Maximum 20 characters.
  SQ_SITE_NAME: process.env.SQ_SITE_NAME || "NexusTracker",
  
  // A short description of your tracker site. Maximum 80 characters.
  SQ_SITE_DESCRIPTION: process.env.SQ_SITE_DESCRIPTION || "A modern BitTorrent tracker platform",
  
  // The URL of your tracker site
  SQ_BASE_URL: process.env.SQ_BASE_URL || "http://localhost:3000",
  
  // The URL of your API
  SQ_API_URL: process.env.SQ_API_URL || "http://localhost:3000/api",
  
  /**
   * Registration and User Management
   */
  // Registration mode: "open", "invite", or "closed"
  SQ_ALLOW_REGISTER: (process.env.SQ_ALLOW_REGISTER as "open" | "invite" | "closed") || "open",
  
  // Whether users can upload anonymously
  SQ_ALLOW_ANONYMOUS_UPLOADS: process.env.SQ_ALLOW_ANONYMOUS_UPLOADS === "true",
  
  // Whether torrent pages can be viewed by unregistered users
  SQ_ALLOW_UNREGISTERED_VIEW: process.env.SQ_ALLOW_UNREGISTERED_VIEW === "true",
  
  /**
   * Ratio and Hit & Run Settings
   */
  // Minimum allowed ratio. Set to -1 to disable.
  SQ_MINIMUM_RATIO: parseFloat(process.env.SQ_MINIMUM_RATIO || "0.75"),
  
  // Maximum allowed hit'n'runs. Set to -1 to disable.
  SQ_MAXIMUM_HIT_N_RUNS: parseInt(process.env.SQ_MAXIMUM_HIT_N_RUNS || "1"),
  
  /**
   * Bonus Points System
   */
  // Bonus points earned per GB uploaded
  SQ_BP_EARNED_PER_GB: parseInt(process.env.SQ_BP_EARNED_PER_GB || "1"),
  
  // Bonus points earned for filling requests
  SQ_BP_EARNED_PER_FILLED_REQUEST: parseInt(process.env.SQ_BP_EARNED_PER_FILLED_REQUEST || "1"),
  
  // Cost of invites in bonus points
  SQ_BP_COST_PER_INVITE: parseInt(process.env.SQ_BP_COST_PER_INVITE || "3"),
  
  // Cost of 1 GB upload in bonus points
  SQ_BP_COST_PER_GB: parseInt(process.env.SQ_BP_COST_PER_GB || "3"),
  
  /**
   * Torrent Settings
   */
  // Whether to enable freeleech on all torrents
  SQ_SITE_WIDE_FREELEECH: process.env.SQ_SITE_WIDE_FREELEECH === "true",
  
  // Blacklisted file extensions
  SQ_EXTENSION_BLACKLIST: (process.env.SQ_EXTENSION_BLACKLIST || "exe").split(","),
  
  // Torrent categories and sources
  SQ_TORRENT_CATEGORIES: {
    Movies: ["BluRay", "WebDL", "HDRip", "WebRip", "DVD", "Cam"],
    TV: ["BluRay", "WebDL", "HDRip", "WebRip", "DVD"],
    Music: ["FLAC", "MP3", "AAC", "OGG"],
    Books: ["PDF", "EPUB", "MOBI", "AZW3"],
  },
  
  /**
   * Localization and Time
   */
  // Default site locale
  SQ_SITE_DEFAULT_LOCALE: process.env.SQ_SITE_DEFAULT_LOCALE || "en",
  
  // Default timezone
  SQ_DEFAULT_TIMEZONE: process.env.SQ_DEFAULT_TIMEZONE || "UTC",
  
  /**
   * Feature Flags
   */
  // Enable last seen feature
  SQ_ENABLE_LAST_SEEN: process.env.SQ_ENABLE_LAST_SEEN !== "false",
  
  // Enable protected torrents feature
  SQ_ENABLE_PROTECTED_TORRENTS: process.env.SQ_ENABLE_PROTECTED_TORRENTS !== "false",
  
  /**
   * Custom Theme (optional)
   */
  SQ_CUSTOM_THEME: process.env.SQ_CUSTOM_THEME ? JSON.parse(process.env.SQ_CUSTOM_THEME) : {
    primary: "#0ea3e8",
    background: "#1f2023",
    sidebar: "#27282b",
    border: "#303236",
    text: "#f8f8f8",
    grey: "#aaaaaa",
  },
}

/**
 * Security and Secrets Configuration
 * 
 * Contains all sensitive configuration like database URLs, secrets,
 * and external service credentials.
 */
export const secrets = {
  /**
   * Database Configuration
   */
  // Database URL (handled by Prisma)
  DATABASE_URL: process.env.DATABASE_URL!,
  
  /**
   * Authentication Secrets
   */
  // NextAuth secret for JWT signing
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET!,
  
  // NextAuth URL
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:3000",
  
  /**
   * Email Configuration
   */
  // Disable email sending (for development)
  SQ_DISABLE_EMAIL: process.env.SQ_DISABLE_EMAIL === "true",
  
  // Email configuration (if not disabled)
  SQ_MAIL_FROM_ADDRESS: process.env.SQ_MAIL_FROM_ADDRESS,
  SQ_SMTP_HOST: process.env.SQ_SMTP_HOST,
  SQ_SMTP_PORT: parseInt(process.env.SQ_SMTP_PORT || "587"),
  SQ_SMTP_SECURE: process.env.SQ_SMTP_SECURE === "true",
  SQ_SMTP_USER: process.env.SQ_SMTP_USER,
  SQ_SMTP_PASS: process.env.SQ_SMTP_PASS,
  
  /**
   * Admin Configuration
   */
  // Admin email for initial setup
  SQ_ADMIN_EMAIL: process.env.SQ_ADMIN_EMAIL || "admin@nexustracker.com",
  
  /**
   * External Services
   */
  // Sentry DSN for error tracking
  SENTRY_DSN: process.env.SENTRY_DSN,
}

/**
 * Configuration Validation
 * 
 * Validates that all required configuration values are present
 * and have valid formats.
 */
export function validateConfig() {
  const requiredSecrets = [
    "DATABASE_URL",
    "NEXTAUTH_SECRET",
  ]
  
  const missingSecrets = requiredSecrets.filter(secret => !secrets[secret as keyof typeof secrets])
  
  if (missingSecrets.length > 0) {
    throw new Error(`Missing required configuration: ${missingSecrets.join(", ")}`)
  }
  
  // Validate email configuration if not disabled
  if (!secrets.SQ_DISABLE_EMAIL) {
    const requiredEmailSecrets = [
      "SQ_MAIL_FROM_ADDRESS",
      "SQ_SMTP_HOST",
      "SQ_SMTP_USER",
      "SQ_SMTP_PASS",
    ]
    
    const missingEmailSecrets = requiredEmailSecrets.filter(
      secret => !secrets[secret as keyof typeof secrets]
    )
    
    if (missingEmailSecrets.length > 0) {
      throw new Error(`Email enabled but missing configuration: ${missingEmailSecrets.join(", ")}`)
    }
  }
  
  return true
}

/**
 * Export configuration as default
 */
const config = {
  envs,
  secrets,
  validateConfig,
}

export default config 