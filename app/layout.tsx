import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./providers/AuthProvider";
import { I18nProvider } from "./providers/I18nProvider";
import { LanguageSelector } from "./components/ui/LanguageSelector";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Application metadata
 * 
 * Defines metadata for the application including title, description, and other SEO-related information.
 * This metadata is used by search engines and social media platforms.
 */
export const metadata: Metadata = {
  title: "NexusTracker V2",
  description: "Sistema de autenticación moderno con Next.js",
};

/**
 * Root Layout Component
 * 
 * The main layout component that wraps all pages in the application.
 * Features:
 * - Global font configuration (Inter)
 * - Session provider for authentication state management
 * - Language selector for internationalization
 * - Responsive design with Tailwind CSS
 * - SEO metadata configuration
 * 
 * This layout provides:
 * - Consistent styling across all pages
 * - Authentication context for all components
 * - Language switching functionality
 * - Proper HTML structure and accessibility
 * 
 * @param children - React components to be rendered within the layout
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <I18nProvider>
          <AuthProvider>
            {children}
            <LanguageSelector />
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
