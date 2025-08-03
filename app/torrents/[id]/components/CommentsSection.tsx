/**
 * Comments Section Component
 * 
 * Displays and manages comments for a torrent with:
 * - Nested comment tree (Reddit-style threads, max depth 4)
 * - Recursive rendering with indentation and vertical lines
 * - Reply form per comment (up to 4 levels)
 * - Pagination only for root comments
 * - Vote functionality (up/down)
 * - User information display with roles
 * - Real-time updates and validation
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useI18n } from '@/app/hooks/useI18n';
import { showNotification } from '@/app/utils/notifications';
import { useAvatar } from '@/app/hooks/useAvatar';
import Image from 'next/image';
// Icon imports
import { Comment } from '@styled-icons/boxicons-regular/Comment';
import { Send } from '@styled-icons/boxicons-regular/Send';
import { X } from '@styled-icons/boxicons-regular/X';

interface CommentData {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    role: string;
    createdAt: string;
  };
  userVote: 'upvote' | 'downvote' | null;
  _count: {
    upvotes: number;
    downvotes: number;
  };
  replies?: CommentData[];
  parentId?: string | null;
  isOP?: boolean;
}

interface CommentsResponse {
  comments: CommentData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface CommentsSectionProps {
  torrentId: string;
}

const MAX_DEPTH = 4;

export default function CommentsSection({ torrentId }: CommentsSectionProps) {
  const { data: session } = useSession();
  const { t } = useI18n();
  const [comments, setComments] = useState<CommentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Use ref to store translation function to avoid infinite loops
  const tRef = useRef(t);
  tRef.current = t;

  // Fetch comments from API
  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/torrent/${torrentId}/comments?page=${pagination.page}&limit=${pagination.limit}`
      );
      if (!response.ok) {
        throw new Error('Error loading comments');
      }
      const data: CommentsResponse = await response.json();
      setComments(data.comments);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching comments:', error);
      showNotification.error(tRef.current('torrentDetail.comments.error.load'));
    } finally {
      setLoading(false);
    }
  }, [torrentId, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Handle modal events and keyboard shortcuts
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showModal) {
        closeModal();
      }
    };
    const handleOpenModal = () => {
      if (session) {
        setShowModal(true);
      }
    };
    if (showModal) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    window.addEventListener('openCommentModal', handleOpenModal);
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
      window.removeEventListener('openCommentModal', handleOpenModal);
    };
  }, [showModal, session]);

  // Handle comment submission (root)
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      showNotification.error(tRef.current('torrentDetail.comments.error.loginRequired'));
      return;
    }
    if (!newComment.trim()) {
      showNotification.error(tRef.current('torrentDetail.comments.error.empty'));
      return;
    }
    try {
      setSubmitting(true);
      const response = await fetch(`/api/torrent/${torrentId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment.trim() }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error creating comment');
      }
      await fetchComments();
      setNewComment('');
      setShowModal(false);
      showNotification.success(tRef.current('torrentDetail.comments.success.created'));
    } catch (error) {
      console.error('Error creating comment:', error);
      showNotification.error(error instanceof Error ? error.message : 'Error creating comment');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle reply submission (nested)
  const handleSubmitReply = async (parentId: string) => {
    if (!session) {
      showNotification.error(tRef.current('torrentDetail.comments.error.loginRequired'));
      return;
    }
    if (!replyContent.trim()) {
      showNotification.error(tRef.current('torrentDetail.comments.error.empty'));
      return;
    }
    try {
      setSubmitting(true);
      const response = await fetch(`/api/torrent/${torrentId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyContent.trim(), parentId }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error creating reply');
      }
      await fetchComments();
      setReplyingTo(null);
      setReplyContent('');
      showNotification.success(tRef.current('torrentDetail.comments.success.replied'));
    } catch (error) {
      console.error('Error creating reply:', error);
      showNotification.error(error instanceof Error ? error.message : 'Error creating reply');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle vote on comment
  const handleVote = async (commentId: string, voteType: 'upvote' | 'downvote') => {
    if (!session) {
      showNotification.error(tRef.current('torrentDetail.comments.error.loginRequired'));
      return;
    }
    try {
      // Convert voteType to the format expected by the API
      const type = voteType === 'upvote' ? 'up' : 'down';
      
      const response = await fetch(`/api/torrent/${torrentId}/comments/${commentId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
      if (!response.ok) {
        throw new Error('Error voting');
      }
      await fetchComments();
    } catch (error) {
      console.error('Error voting:', error);
      showNotification.error('Error voting');
    }
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format user role for display
  const formatUserRole = (role: string): string => {
    const roles: Record<string, string> = {
      admin: tRef.current('torrentDetail.comments.roles.admin'),
      moderator: tRef.current('torrentDetail.comments.roles.moderator'),
      user: tRef.current('torrentDetail.comments.roles.user'),
      guest: tRef.current('torrentDetail.comments.roles.guest'),
    };
    return roles[role] || role;
  };

  // Close modal and reset form
  const closeModal = () => {
    setShowModal(false);
    setNewComment('');
  };

  // Calculate score from upvotes and downvotes
  const calculateScore = (upvotes: number, downvotes: number): number => {
    return upvotes - downvotes;
  };

  // Component to render user avatar with fallback
  const UserAvatar = ({ userId, username }: { userId: string; username: string }) => {
    const { avatarUrl, isLoading } = useAvatar(userId);
    
    if (isLoading) {
      return (
        <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-background font-medium text-xs animate-pulse">
          {username.charAt(0).toUpperCase()}
        </div>
      );
    }
    
    if (avatarUrl) {
      return (
        <div className="relative w-6 h-6 rounded-full overflow-hidden">
          <Image
            src={avatarUrl}
            alt={`${username} avatar`}
            fill
            className="object-cover"
          />
        </div>
      );
    }
    
    return (
      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-background font-medium text-xs">
        {username.charAt(0).toUpperCase()}
      </div>
    );
  };

  /**
   * Recursive render of a comment and its replies (Reddit-style)
   * @param comment The comment to render
   * @param depth Current depth (0=root)
   */
  const renderComment = (comment: CommentData, depth: number = 0) => {
    const isReplying = replyingTo === comment.id;
    const canReply = depth < MAX_DEPTH - 1;
    const score = calculateScore(comment._count.upvotes, comment._count.downvotes);
    
    return (
      <div key={comment.id} className="mb-4">
        <div className="flex">
          {/* Vertical line for threading - Reddit style */}
          {depth > 0 && (
            <div className="flex flex-col items-center mr-3 min-w-[24px]">
              <div className="w-px bg-border h-full min-h-[60px]" style={{ marginLeft: `${(depth - 1) * 8}px` }}></div>
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            {/* Comment header */}
            <div className="flex items-center space-x-2 mb-2">
              {/* User avatar - theme style */}
              <UserAvatar userId={comment.user.id} username={comment.user.username} />
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-text">{comment.user.username}</span>
                {comment.user.role === 'ADMIN' && (
                  <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded font-medium border border-primary/20">
                    {formatUserRole(comment.user.role)}
                  </span>
                )}
                {comment.user.role === 'MODERATOR' && (
                  <span className="px-2 py-1 text-xs bg-orange/10 text-orange rounded font-medium border border-orange/20">
                    {formatUserRole(comment.user.role)}
                  </span>
                )}
                {comment.isOP && (
                  <span className="px-2 py-1 text-xs bg-green/10 text-green rounded font-medium border border-green/20">
                    OP
                  </span>
                )}
                <span className="text-xs text-text-secondary">
                  {formatDate(comment.createdAt)}
                </span>
              </div>
            </div>
            
            {/* Comment content */}
            <div className="text-sm text-text leading-relaxed whitespace-pre-wrap mb-3">
              {comment.content}
            </div>
            
            {/* Comment actions - theme style */}
            <div className="flex items-center space-x-4 mb-3">
              {/* Vote buttons - theme style */}
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => handleVote(comment.id, 'upvote')}
                  className={`p-1.5 rounded hover:bg-surface transition-colors ${
                    comment.userVote === 'upvote' ? 'text-green' : 'text-text-secondary'
                  }`}
                  disabled={!session}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                <span className={`text-sm font-medium min-w-[20px] text-center ${
                  score > 0 ? 'text-green' : score < 0 ? 'text-error' : 'text-text-secondary'
                }`}>
                  {score}
                </span>
                <button
                  type="button"
                  onClick={() => handleVote(comment.id, 'downvote')}
                  className={`p-1.5 rounded hover:bg-surface transition-colors ${
                    comment.userVote === 'downvote' ? 'text-error' : 'text-text-secondary'
                  }`}
                  disabled={!session}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              
              {/* Reply button - theme style */}
              {canReply && session && (
                <button
                  type="button"
                  onClick={() => setReplyingTo(isReplying ? null : comment.id)}
                  className="text-xs text-text-secondary hover:text-text hover:bg-surface px-2 py-1 rounded transition-colors flex items-center space-x-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>{tRef.current('torrentDetail.comments.reply')}</span>
                </button>
              )}
            </div>
            
            {/* Reply form - theme style */}
            {isReplying && (
              <div className="mb-3">
                <form onSubmit={e => { e.preventDefault(); handleSubmitReply(comment.id); }}>
                  <textarea
                    value={replyContent}
                    onChange={e => setReplyContent(e.target.value)}
                    placeholder={tRef.current('torrentDetail.comments.replyPlaceholder')}
                    className="w-full p-3 border border-border rounded-md text-sm resize-none focus:ring-2 focus:ring-primary focus:border-transparent mb-2 bg-background text-text"
                    rows={3}
                  />
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-primary text-background text-sm rounded-md hover:bg-primary-dark disabled:opacity-50 transition-colors"
                      disabled={submitting || !replyContent.trim()}
                    >
                      {tRef.current('torrentDetail.comments.submitReply')}
                    </button>
                    <button
                      type="button"
                      className="px-3 py-1.5 border border-border text-text text-sm rounded-md hover:bg-surface transition-colors"
                      onClick={() => { setReplyingTo(null); setReplyContent(''); }}
                    >
                      {tRef.current('torrentDetail.comments.cancel')}
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {/* Replies (recursive) */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-3">
                {comment.replies.map(reply => renderComment(reply, depth + 1))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Comments List */}
      {loading ? (
        <div className="space-y-4">
          {/* Comment Skeleton 1 - Root Level */}
          <div className="mb-4">
            <div className="flex">
              <div className="flex-1 min-w-0">
                {/* Comment header skeleton */}
                <div className="flex items-center space-x-2 mb-2">
                  {/* Avatar skeleton */}
                  <div className="w-6 h-6 bg-text-secondary/10 rounded-full animate-pulse"></div>
                  <div className="flex items-center space-x-2">
                    {/* Username skeleton */}
                    <div className="w-20 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
                    {/* Role badge skeleton */}
                    <div className="w-12 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
                    {/* Date skeleton */}
                    <div className="w-16 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
                  </div>
                </div>
                
                {/* Comment content skeleton */}
                <div className="text-sm leading-relaxed mb-3 space-y-2">
                  <div className="w-full h-4 bg-text-secondary/10 rounded animate-pulse"></div>
                  <div className="w-3/4 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
                  <div className="w-1/2 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
                </div>
                
                {/* Comment actions skeleton */}
                <div className="flex items-center space-x-4 mb-3">
                  {/* Vote buttons skeleton */}
                  <div className="flex items-center space-x-1">
                    <div className="w-6 h-6 bg-text-secondary/10 rounded animate-pulse"></div>
                    <div className="w-8 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
                    <div className="w-6 h-6 bg-text-secondary/10 rounded animate-pulse"></div>
                  </div>
                  {/* Reply button skeleton */}
                  <div className="w-16 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Comment Skeleton 2 - With Reply (Level 1) */}
          <div className="mb-4">
            <div className="flex">
              {/* Vertical line for threading */}
              <div className="flex flex-col items-center mr-3 min-w-[24px]">
                <div className="w-px bg-border h-full min-h-[60px]"></div>
              </div>
              
              <div className="flex-1 min-w-0">
                {/* Comment header skeleton */}
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-6 h-6 bg-text-secondary/10 rounded-full animate-pulse"></div>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
                    <div className="w-16 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
                  </div>
                </div>
                
                {/* Comment content skeleton */}
                <div className="text-sm leading-relaxed mb-3 space-y-2">
                  <div className="w-full h-4 bg-text-secondary/10 rounded animate-pulse"></div>
                  <div className="w-2/3 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
                </div>
                
                {/* Comment actions skeleton */}
                <div className="flex items-center space-x-4 mb-3">
                  <div className="flex items-center space-x-1">
                    <div className="w-6 h-6 bg-text-secondary/10 rounded animate-pulse"></div>
                    <div className="w-8 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
                    <div className="w-6 h-6 bg-text-secondary/10 rounded animate-pulse"></div>
                  </div>
                  <div className="w-16 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Comment Skeleton 3 - Root Level with OP badge */}
          <div className="mb-4">
            <div className="flex">
              <div className="flex-1 min-w-0">
                {/* Comment header skeleton */}
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-6 h-6 bg-text-secondary/10 rounded-full animate-pulse"></div>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
                    <div className="w-8 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
                    <div className="w-12 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
                    <div className="w-16 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
                  </div>
                </div>
                
                {/* Comment content skeleton */}
                <div className="text-sm leading-relaxed mb-3 space-y-2">
                  <div className="w-full h-4 bg-text-secondary/10 rounded animate-pulse"></div>
                  <div className="w-4/5 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
                  <div className="w-1/3 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
                </div>
                
                {/* Comment actions skeleton */}
                <div className="flex items-center space-x-4 mb-3">
                  <div className="flex items-center space-x-1">
                    <div className="w-6 h-6 bg-text-secondary/10 rounded animate-pulse"></div>
                    <div className="w-8 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
                    <div className="w-6 h-6 bg-text-secondary/10 rounded animate-pulse"></div>
                  </div>
                  <div className="w-16 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Comment Skeleton 4 - Deep Reply (Level 2) */}
          <div className="mb-4">
            <div className="flex">
              {/* Vertical line for threading - deeper level */}
              <div className="flex flex-col items-center mr-3 min-w-[24px]">
                <div className="w-px bg-border h-full min-h-[60px]" style={{ marginLeft: '8px' }}></div>
              </div>
              
              <div className="flex-1 min-w-0">
                {/* Comment header skeleton */}
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-6 h-6 bg-text-secondary/10 rounded-full animate-pulse"></div>
                  <div className="flex items-center space-x-2">
                    <div className="w-18 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
                    <div className="w-16 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
                  </div>
                </div>
                
                {/* Comment content skeleton */}
                <div className="text-sm leading-relaxed mb-3 space-y-2">
                  <div className="w-full h-4 bg-text-secondary/10 rounded animate-pulse"></div>
                  <div className="w-1/2 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
                </div>
                
                {/* Comment actions skeleton */}
                <div className="flex items-center space-x-4 mb-3">
                  <div className="flex items-center space-x-1">
                    <div className="w-6 h-6 bg-text-secondary/10 rounded animate-pulse"></div>
                    <div className="w-8 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
                    <div className="w-6 h-6 bg-text-secondary/10 rounded animate-pulse"></div>
                  </div>
                  <div className="w-16 h-4 bg-text-secondary/10 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-text-secondary">
          <Comment size={48} className="mx-auto mb-4 opacity-50" />
          <p>{tRef.current('torrentDetail.comments.empty')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map(comment => renderComment(comment, 0))}
        </div>
      )}
      {/* Pagination (only for root comments) */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex space-x-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="px-3 py-2 border border-border text-text rounded hover:bg-surface-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {tRef.current('torrentDetail.comments.pagination.previous')}
            </button>
            <span className="px-3 py-2 text-text-secondary">
              {tRef.current('torrentDetail.comments.pagination.page').replace('{{current}}', pagination.page.toString()).replace('{{total}}', pagination.totalPages.toString())}
            </span>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.totalPages}
              className="px-3 py-2 border border-border text-text rounded hover:bg-surface-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {tRef.current('torrentDetail.comments.pagination.next')}
            </button>
          </div>
        </div>
      )}
      {/* Add Comment Modal (root) */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div 
            className="bg-surface rounded-lg border border-border p-6 w-full max-w-md mx-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text">
                {tRef.current('torrentDetail.comments.modal.title')}
              </h3>
              <button
                onClick={closeModal}
                className="text-text-secondary hover:text-text transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmitComment}>
              <textarea
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder={tRef.current('torrentDetail.comments.placeholder')}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-text placeholder-text-secondary focus:outline-none focus:border-primary transition-colors resize-none mb-4"
                rows={4}
                maxLength={280}
                disabled={submitting}
                autoFocus
              />
              <div className="flex items-center justify-between mb-4">
                <span className="text-text-secondary text-sm">
                  {newComment.length}/280
                </span>
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 border border-border text-text rounded-lg hover:bg-surface-light transition-colors disabled:opacity-50"
                >
                  {tRef.current('torrentDetail.comments.modal.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submitting || !newComment.trim()}
                  className="flex-1 px-4 py-2 bg-primary text-background rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <Send size={16} />
                  <span>{submitting ? tRef.current('torrentDetail.comments.modal.sending') : tRef.current('torrentDetail.comments.modal.send')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
} 