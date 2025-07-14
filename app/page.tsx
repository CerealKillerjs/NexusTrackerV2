/**
 * Home Page - Optimized for maximum performance
 * Server Component with server-side translations and optimized loading
 * Redirects authenticated users server-side for better performance
 */

import { Suspense } from 'react';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/app/lib/auth';
import { serverT, getPreferredLanguage } from '@/app/lib/server-i18n';
import { LanguageSync } from './components/ui/LanguageSync';
import { HomeContent } from '@/app/components/HomeContent';

// Enhanced loading component with theme-consistent styling
function HomeLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-text">
      <main className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="text-center mb-8">
          <div className="h-16 bg-gradient-to-r from-primary to-accent rounded-lg mb-4 animate-pulse"></div>
          <div className="h-6 bg-text-secondary rounded w-64 mx-auto animate-pulse"></div>
        </div>
        
        <div className="flex space-x-6 mb-8">
          <div className="w-32 h-12 bg-primary rounded-lg animate-pulse"></div>
          <div className="w-32 h-12 bg-surface rounded-lg animate-pulse"></div>
        </div>

        <div className="text-center">
          <div className="h-4 bg-text-secondary rounded w-80 mx-auto mb-4 animate-pulse"></div>
          <div className="h-4 bg-text-secondary rounded w-64 mx-auto animate-pulse"></div>
        </div>
      </main>

      <footer className="text-center p-8 bg-surface border-t border-border">
        <div className="h-4 bg-text-secondary rounded w-96 mx-auto mb-4 animate-pulse"></div>
        <div className="flex justify-center space-x-4">
          <div className="h-4 bg-text-secondary rounded w-16 animate-pulse"></div>
          <div className="h-4 bg-border rounded w-1"></div>
          <div className="h-4 bg-text-secondary rounded w-16 animate-pulse"></div>
          <div className="h-4 bg-border rounded w-1"></div>
          <div className="h-4 bg-text-secondary rounded w-16 animate-pulse"></div>
        </div>
      </footer>
    </div>
  );
}

export default async function Home() {
  // Get headers for language detection
  const headersList = await headers();
  const language = await getPreferredLanguage(headersList);
  
  // Check authentication server-side
  const session = await auth();
  
  // Redirect authenticated users to dashboard
  if (session) {
    redirect('/dashboard');
  }

  // Server-side translations
  const loginText = serverT('home.footer.login', language);
  const registerText = serverT('home.footer.register', language);
  const description = serverT('home.footer.description', language);
  const aboutText = serverT('home.footer.about', language);
  const statsText = serverT('home.footer.stats', language);
  const apiText = serverT('home.footer.api', language);
  const title = serverT('home.title', language);
  const subtitle = serverT('home.description', language);
  const welcomeTitle = serverT('home.welcome.title', language);
  const welcomeDescription = serverT('home.welcome.description', language);

  // Debug logging
  console.log('🏠 Home Page Server Translations:', {
    language,
    loginText,
    registerText,
    description,
    aboutText,
    statsText,
    apiText,
    title,
    subtitle,
    welcomeTitle,
    welcomeDescription
  });

  return (
    <>
      <LanguageSync serverLanguage={language} />
      <Suspense fallback={<HomeLoading />}>
        <HomeContent 
          serverTranslations={{
            loginText,
            registerText,
            description,
            aboutText,
            statsText,
            apiText,
            title,
            subtitle,
            welcomeTitle,
            welcomeDescription
          }}
        />
      </Suspense>
    </>
  );
}
