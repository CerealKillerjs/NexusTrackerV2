/**
 * Dashboard Home Page - Server Component
 * Optimized with Server Components and Client Components separation
 * Features:
 * - Server-side authentication check
 * - Server-side rendering for improved performance
 * - Streaming with Suspense for better UX
 * - Internationalization support with server-side translations
 */

import { Suspense } from 'react';
import DashboardWrapper from './components/DashboardWrapper';
import LatestTorrents from './components/LatestTorrents';
import DashboardTitle from './components/DashboardTitle';

// Skeleton para los torrents recientes
function TorrentsSkeleton() {
  return (
    <div className="bg-surface rounded-lg border border-border p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="w-40 h-6 bg-text-secondary/10 rounded animate-pulse"></div>
        <div className="w-24 h-8 bg-text-secondary/10 rounded animate-pulse"></div>
      </div>
      
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center p-3 border-b border-border">
            <div className="w-12 h-12 bg-text-secondary/10 rounded animate-pulse mr-4"></div>
            <div className="flex-1">
              <div className="w-3/4 h-5 bg-text-secondary/10 rounded animate-pulse mb-2"></div>
              <div className="flex space-x-2">
                <div className="w-16 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
                <div className="w-16 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
                <div className="w-16 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="w-20 h-8 bg-text-secondary/10 rounded animate-pulse ml-4"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <DashboardWrapper>
      <div className="max-w-7xl mx-auto px-4">
        <DashboardTitle />
        
        {/* Torrents recientes con skeleton */}
        <Suspense fallback={<TorrentsSkeleton />}>
          <LatestTorrents />
        </Suspense>
      </div>
    </DashboardWrapper>
  );
} 