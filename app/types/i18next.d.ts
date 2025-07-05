import { resources, defaultNS } from "../lib/i18n"

/**
 * TypeScript module augmentation for i18next
 *
 * Extends the i18next types to provide better type safety and autocompletion
 * for translation keys, namespaces, and resource structure in the app.
 *
 * - Sets the default namespace for translations
 * - Ensures resources type matches the loaded translations
 * - Forces returnNull to be false for stricter type safety
 */
declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS
    resources: typeof resources["en"]
    returnNull: false
  }
} 