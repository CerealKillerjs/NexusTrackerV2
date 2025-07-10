/**
 * SearchBar component
 * Displays a modern search bar with category and search options
 */

'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';

export default function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const { t } = useTranslation();
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Build search parameters
    const params = new URLSearchParams();
    if (searchTerm.trim()) {
      params.append('q', searchTerm.trim());
    }
    if (category && category !== 'all') {
      params.append('category', category);
    }
    
    // Redirect to search results page
    router.push(`/search?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-3 bg-background border border-border rounded-xl p-1 shadow-sm">
        {/* Category Selector */}
        <div className="relative flex-shrink-0">
          <select 
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
            className="w-full sm:w-48 px-4 py-3 bg-surface text-text border border-border rounded-lg font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 appearance-none cursor-pointer hover:bg-surface/80"
          >
            <option value="all">{t('home.search.categories.all')}</option>
            <option value="audio">{t('home.search.categories.audio')}</option>
            <option value="video">{t('home.search.categories.video')}</option>
            <option value="applications">{t('home.search.categories.applications')}</option>
            <option value="games">{t('home.search.categories.games')}</option>
            <option value="other">{t('home.search.categories.other')}</option>
          </select>
          {/* Custom dropdown arrow */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg className="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder={t('home.search.placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 bg-surface text-text border border-border rounded-lg font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 placeholder:text-text-secondary"
          />
          {/* Search icon */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg className="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Search Button */}
        <button 
          type="submit"
          className="px-6 py-3 bg-primary text-background font-semibold rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center gap-2 min-w-[120px]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {t('home.search.button')}
        </button>
      </div>

      {/* Quick Search Tips */}
      <div className="mt-4 text-center">
        <p className="text-text-secondary text-sm">
          💡 Try searching for specific content like "movie title", "artist name", or "software name"
        </p>
      </div>
    </form>
  );
} 