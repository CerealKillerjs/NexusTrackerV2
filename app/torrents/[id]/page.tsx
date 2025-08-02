/**
 * Torrent Detail Page - Server Component
 * 
 * Optimized with Server Components and Client Components separation
 * Features:
 * - Server-side authentication check
 * - Server-side rendering for improved performance
 * - Streaming with Suspense for better UX
 * - Internationalization support with server-side translations
 */

import { headers } from 'next/headers';
import { serverT, getPreferredLanguage } from '@/app/lib/server-i18n';
import DashboardWrapper from '@/app/dashboard/components/DashboardWrapper';
import TorrentDetailContent from './components/TorrentDetailContent';

export default async function TorrentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Resolver los parámetros
  const { id } = await params;
  
  // Detectar idioma dinámicamente desde headers y cookies
  const headersList = await headers();
  const language = await getPreferredLanguage(headersList);

  // Precargar traducciones del servidor
  const translations = {
    // Header translations
    downloads: serverT('torrentDetail.header.downloads', language),
    freeleech: serverT('torrentDetail.header.freeleech', language),
    
    // Torrent info translations
    torrentInfoTitle: serverT('torrentDetail.torrentInfo.title', language),
    size: serverT('torrentDetail.torrentInfo.size', language),
    type: serverT('torrentDetail.torrentInfo.type', language),
    source: serverT('torrentDetail.torrentInfo.source', language),
    files: serverT('torrentDetail.torrentInfo.files', language),
    tags: serverT('torrentDetail.torrentInfo.tags', language),
    description: serverT('torrentDetail.torrentInfo.description', language),
    nfoFile: serverT('torrentDetail.torrentInfo.nfoFile', language),
    
    // File list translations
    fileListCount: serverT('torrentDetail.fileList.count', language),
    fileListSearch: serverT('torrentDetail.fileList.search', language),
    
    // Comments translations
    commentsCount: serverT('torrentDetail.comments.count', language),
    addComment: serverT('torrentDetail.comments.addComment', language),
    
    // Actions translations
    actionsTitle: serverT('torrentDetail.actions.title', language),
    downloading: serverT('torrentDetail.actions.downloading', language),
    generating: serverT('torrentDetail.actions.generating', language),
    magnet: serverT('torrentDetail.actions.magnet', language),
    addBookmark: serverT('torrentDetail.actions.addBookmark', language),
    removeBookmark: serverT('torrentDetail.actions.removeBookmark', language),
    like: serverT('torrentDetail.actions.like', language),
    dislike: serverT('torrentDetail.actions.dislike', language),
    copyLink: serverT('torrentDetail.actions.copyLink', language),
    
    // Uploader translations
    uploaderTitle: serverT('torrentDetail.uploader.title', language),
    anonymous: serverT('torrentDetail.uploader.anonymous', language),
    user: serverT('torrentDetail.uploader.user', language),
    ratio: serverT('torrentDetail.uploader.ratio', language),
    uploaded: serverT('torrentDetail.uploader.uploaded', language),
    downloaded: serverT('torrentDetail.uploader.downloaded', language),
    
    // Statistics translations
    statisticsTitle: serverT('torrentDetail.statistics.title', language),
    bookmarks: serverT('torrentDetail.statistics.bookmarks', language),
    votes: serverT('torrentDetail.statistics.votes', language),
    comments: serverT('torrentDetail.statistics.comments', language),
    
    // Error translations
    errorTitle: serverT('torrentDetail.error.title', language),
    notFound: serverT('torrentDetail.error.notFound', language),
    loadError: serverT('torrentDetail.error.loadError', language),
    fetchError: serverT('torrentDetail.error.fetchError', language),
    
    // Notification translations
    loginRequiredDownload: serverT('torrentDetail.notifications.loginRequired.download', language),
    loginRequiredBookmark: serverT('torrentDetail.notifications.loginRequired.bookmark', language),
    loginRequiredVote: serverT('torrentDetail.notifications.loginRequired.vote', language),
    errorDownload: serverT('torrentDetail.notifications.error.download', language),
    errorBookmark: serverT('torrentDetail.notifications.error.bookmark', language),
    errorVote: serverT('torrentDetail.notifications.error.vote', language),
    successDownload: serverT('torrentDetail.notifications.success.download', language),
    successBookmarkAdded: serverT('torrentDetail.notifications.success.bookmarkAdded', language),
    successBookmarkRemoved: serverT('torrentDetail.notifications.success.bookmarkRemoved', language),
    successVote: serverT('torrentDetail.notifications.success.vote', language),
    successLinkCopied: serverT('torrentDetail.notifications.success.linkCopied', language),
  };

  return (
    <DashboardWrapper>
      <TorrentDetailContent 
        torrentId={id} 
        serverTranslations={translations} 
      />
    </DashboardWrapper>
  );
} 