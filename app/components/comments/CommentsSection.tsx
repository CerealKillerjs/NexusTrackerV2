/**
 * Comments Section Component
 * 
 * Displays and manages comments for a torrent with:
 * - Comment list with pagination
 * - Modal for comment creation
 * - Vote functionality (up/down)
 * - User information display with roles
 * - Real-time updates and validation
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useI18n } from '@/app/hooks/useI18n';
import { showNotification } from '@/app/utils/notifications';
// Icon imports
import { Comment } from '@styled-icons/boxicons-regular/Comment';
import { Like } from '@styled-icons/boxicons-regular/Like';
import { Dislike } from '@styled-icons/boxicons-regular/Dislike';
import { User } from '@styled-icons/boxicons-regular/User';
import { Calendar } from '@styled-icons/boxicons-regular/Calendar';
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
  userVote: 'up' | 'down' | null;
  upVotes: number;
  downVotes: number;
  score: number;
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

export default function CommentsSection({ torrentId }: CommentsSectionProps) {
  const { data: session } = useSession();
  const { t } = useI18n();
  const [comments, setComments] = useState<CommentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

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
      showNotification.error(t('torrentDetail.comments.error.load'));
    } finally {
      setLoading(false);
    }
  }, [torrentId, pagination.page, pagination.limit, t]);

  // Fetch comments when component mounts or pagination changes
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

    // Listen for the open modal event from parent component
    window.addEventListener('openCommentModal', handleOpenModal);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
      window.removeEventListener('openCommentModal', handleOpenModal);
    };
  }, [showModal, session]);

  // Handle comment submission
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      showNotification.error(t('torrentDetail.comments.error.loginRequired'));
      return;
    }

    if (!newComment.trim()) {
      showNotification.error(t('torrentDetail.comments.error.empty'));
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(`/api/torrent/${torrentId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newComment.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error creating comment');
      }

      const data = await response.json();
      setComments(prev => [data.comment, ...prev]);
      setNewComment('');
      setShowModal(false);
      showNotification.success(t('torrentDetail.comments.success.created'));
      
      // Update comment count
      setPagination(prev => ({
        ...prev,
        total: prev.total + 1,
      }));
    } catch (error) {
      console.error('Error creating comment:', error);
      showNotification.error(error instanceof Error ? error.message : 'Error creating comment');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle vote on comment
  const handleVote = async (commentId: string, voteType: 'up' | 'down') => {
    if (!session) {
      showNotification.error(t('torrentDetail.comments.error.loginRequired'));
      return;
    }

    try {
      const response = await fetch(`/api/torrent/${torrentId}/comments/${commentId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: voteType }),
      });

      if (!response.ok) {
        throw new Error('Error voting');
      }

      // Update local state optimistically
      setComments(prev => prev.map(comment => {
        if (comment.id === commentId) {
          const currentVote = comment.userVote;
          let newVote: 'up' | 'down' | null = null;
          let upVotes = comment.upVotes;
          let downVotes = comment.downVotes;

          if (currentVote === voteType) {
            // Remove vote
            if (voteType === 'up') upVotes--;
            else downVotes--;
          } else {
            // Change vote or add new vote
            if (currentVote === 'up') upVotes--;
            else if (currentVote === 'down') downVotes--;
            
            if (voteType === 'up') upVotes++;
            else downVotes++;
            newVote = voteType;
          }

          return {
            ...comment,
            userVote: newVote,
            upVotes,
            downVotes,
            score: upVotes - downVotes,
          };
        }
        return comment;
      }));

      showNotification.success(t('torrentDetail.comments.success.vote'));
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
      admin: t('torrentDetail.comments.roles.admin'),
      moderator: t('torrentDetail.comments.roles.moderator'),
      user: t('torrentDetail.comments.roles.user'),
      guest: t('torrentDetail.comments.roles.guest'),
    };
    return roles[role] || role;
  };

  // Close modal and reset form
  const closeModal = () => {
    setShowModal(false);
    setNewComment('');
  };

  return (
    <>
      {/* Comments List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="text-text">{t('torrentDetail.comments.loading')}</div>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-text-secondary">
          <Comment size={48} className="mx-auto mb-4 opacity-50" />
          <p>{t('torrentDetail.comments.empty')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-background rounded-lg border border-border p-4">
              {/* Comment Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <User size={16} className="text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-text font-medium">{comment.user.username}</span>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        {formatUserRole(comment.user.role)}
                      </span>
                    </div>
                    <div className="flex items-center text-text-secondary text-sm">
                      <Calendar size={12} className="mr-1" />
                      {formatDate(comment.createdAt)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Comment Content */}
              <div className="mb-3">
                <p className="text-text whitespace-pre-wrap">{comment.content}</p>
              </div>

              {/* Comment Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleVote(comment.id, 'up')}
                    className={`flex items-center space-x-1 px-2 py-1 rounded text-sm transition-colors ${
                      comment.userVote === 'up'
                        ? 'bg-green-500/10 text-green-500'
                        : 'text-text-secondary hover:text-text'
                    }`}
                  >
                    <Like size={14} />
                    <span>{comment.upVotes}</span>
                  </button>
                  <button
                    onClick={() => handleVote(comment.id, 'down')}
                    className={`flex items-center space-x-1 px-2 py-1 rounded text-sm transition-colors ${
                      comment.userVote === 'down'
                        ? 'bg-red-500/10 text-red-500'
                        : 'text-text-secondary hover:text-text'
                    }`}
                  >
                    <Dislike size={14} />
                    <span>{comment.downVotes}</span>
                  </button>
                  <span className="text-text-secondary text-sm">
                    {t('torrentDetail.comments.score').replace('{{score}}', comment.score.toString())}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex space-x-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="px-3 py-2 border border-border text-text rounded hover:bg-surface-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('torrentDetail.comments.pagination.previous')}
            </button>
            <span className="px-3 py-2 text-text-secondary">
              {t('torrentDetail.comments.pagination.page').replace('{{current}}', pagination.page.toString()).replace('{{total}}', pagination.totalPages.toString())}
            </span>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.totalPages}
              className="px-3 py-2 border border-border text-text rounded hover:bg-surface-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('torrentDetail.comments.pagination.next')}
            </button>
          </div>
        </div>
      )}

      {/* Add Comment Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div 
            className="bg-surface rounded-lg border border-border p-6 w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text">
                {t('torrentDetail.comments.modal.title')}
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
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={t('torrentDetail.comments.placeholder')}
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
                  {t('torrentDetail.comments.modal.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submitting || !newComment.trim()}
                  className="flex-1 px-4 py-2 bg-primary text-background rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <Send size={16} />
                  <span>{submitting ? t('torrentDetail.comments.modal.sending') : t('torrentDetail.comments.modal.send')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
} 