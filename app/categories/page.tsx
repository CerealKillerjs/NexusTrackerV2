/**
 * Categories Page - Server Component
 * 
 * Displays all available torrent categories with statistics
 * Shows category cards with torrent counts and popular items
 * Includes navigation to category-specific pages
 */

import { Suspense } from 'react';
import { headers } from 'next/headers';
import { serverT, getPreferredLanguage } from '@/app/lib/server-i18n';
import DashboardWrapper from '@/app/dashboard/components/DashboardWrapper';
import CategoriesContent from './components/CategoriesContent';

// Skeleton para el contenido de categorías
function CategoriesSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Skeleton */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="w-48 h-8 bg-text-secondary/10 rounded animate-pulse mb-2"></div>
            <div className="w-64 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
          </div>
          <div className="w-32 h-10 bg-text-secondary/10 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Categories Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="bg-surface border border-border rounded-lg overflow-hidden">
            {/* Category Header Skeleton */}
            <div className="h-24 bg-text-secondary/10"></div>
            
            {/* Category Content Skeleton */}
            <div className="p-6">
              <div className="w-full h-4 bg-text-secondary/10 rounded animate-pulse mb-4"></div>
              
              {/* Recent Torrents Skeleton */}
              <div className="space-y-3 mb-4">
                <div className="w-32 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
                {[1, 2, 3].map((j) => (
                  <div key={j} className="space-y-2">
                    <div className="w-full h-3 bg-text-secondary/10 rounded animate-pulse"></div>
                    <div className="flex justify-between">
                      <div className="w-16 h-3 bg-text-secondary/10 rounded animate-pulse"></div>
                      <div className="w-12 h-3 bg-text-secondary/10 rounded animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Button Skeleton */}
              <div className="w-full h-10 bg-text-secondary/10 rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Popular Tags Section Skeleton */}
      <div className="mt-12 bg-surface border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="w-48 h-6 bg-text-secondary/10 rounded animate-pulse mb-2"></div>
            <div className="w-64 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
          </div>
          <div className="w-32 h-10 bg-text-secondary/10 rounded animate-pulse"></div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <div key={i} className="w-20 h-8 bg-text-secondary/10 rounded-full animate-pulse"></div>
          ))}
        </div>
      </div>

      {/* Statistics Section Skeleton */}
      <div className="mt-12 bg-surface border border-border rounded-lg p-6">
        <div className="w-32 h-6 bg-text-secondary/10 rounded animate-pulse mb-4"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="text-center">
              <div className="w-12 h-8 bg-text-secondary/10 rounded animate-pulse mx-auto mb-2"></div>
              <div className="w-20 h-4 bg-text-secondary/10 rounded animate-pulse mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default async function CategoriesPage() {
  // Detectar idioma dinámicamente desde headers y cookies
  const headersList = await headers();
  const language = await getPreferredLanguage(headersList);

  // Precargar traducciones del servidor
  const translations = {
    title: serverT('categories.title', language),
    subtitle: serverT('categories.subtitle', language),
    browseAll: serverT('categories.browseAll', language),
    browseCategory: serverT('categories.browseCategory', language),
    torrents: serverT('categories.torrents', language),
    recentTorrents: serverT('categories.recentTorrents', language),
    statistics: serverT('categories.statistics', language),
    movies: serverT('categories.movies', language),
    moviesDescription: serverT('categories.moviesDescription', language),
    tv: serverT('categories.tv', language),
    tvDescription: serverT('categories.tvDescription', language),
    music: serverT('categories.music', language),
    musicDescription: serverT('categories.musicDescription', language),
    books: serverT('categories.books', language),
    booksDescription: serverT('categories.booksDescription', language),
    games: serverT('categories.games', language),
    gamesDescription: serverT('categories.gamesDescription', language),
    software: serverT('categories.software', language),
    softwareDescription: serverT('categories.softwareDescription', language),
    other: serverT('categories.other', language),
    otherDescription: serverT('categories.otherDescription', language),
    tagsTitle: serverT('tags.title', language),
    tagsSubtitle: serverT('tags.subtitle', language),
    viewAll: serverT('tags.viewAll', language),
    noTags: serverT('tags.noTags', language),
  };

  return (
    <DashboardWrapper>
      <div className="min-h-screen bg-background text-text">
        <Suspense fallback={<CategoriesSkeleton />}>
          <CategoriesContent serverTranslations={translations} />
        </Suspense>
      </div>
    </DashboardWrapper>
  );
} 