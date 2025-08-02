import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./providers/AuthProvider";
import { I18nProvider } from "./providers/I18nProvider";
import { BrandingProvider } from "./contexts/BrandingContext";
import { LanguageSelector } from "./components/ui/LanguageSelector";
import { Toaster } from 'react-hot-toast';
import SWRProvider from "./providers/SWRProvider";

/**
 * Font configuration for the application
 * Uses Geist Sans for body text and Geist Mono for code/monospace text
 */
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
  description: "The OverPowered Torrent Tracker",
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
};

/**
 * Root Layout Component
 * 
 * The main layout component that wraps all pages in the application.
 * Features:
 * - Global font configuration (Geist Sans and Mono)
 * - Authentication and i18n providers for context management
 * - Language selector for internationalization
 * - VS Code dark theme styling
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme') || 'dark';
                document.documentElement.className = theme;
              } catch {}
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
        suppressHydrationWarning
      >
        <I18nProvider>
          <AuthProvider>
            <BrandingProvider>
              <SWRProvider>
                {children}
                <LanguageSelector />
              </SWRProvider>
            </BrandingProvider>
          </AuthProvider>
        </I18nProvider>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
