/**
 * Bookmarks Page - User's Bookmarked Torrents
 * Optimized with component-based architecture and skeleton loading
 * Features:
 * - List of bookmarked torrents with pagination
 * - Quick remove bookmark functionality with confirmation modal
 * - Consistent design with dashboard layout
 * - Internationalization support
 */

import DashboardWrapper from '@/app/dashboard/components/DashboardWrapper';
import BookmarksContent from './components/BookmarksContent';

export default function BookmarksPage() {
  return (
    <DashboardWrapper>
      <BookmarksContent />
    </DashboardWrapper>
  );
} 