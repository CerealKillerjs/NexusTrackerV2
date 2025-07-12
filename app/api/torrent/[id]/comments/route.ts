/**
 * API endpoint for torrent comments
 * GET: List comments for a torrent (paginated, with nested replies)
 * POST: Create a new comment for a torrent (supports replies)
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';
import { z } from 'zod';

// Zod schema for comment creation
const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(280, 'Comment is too long (max 280 characters)'),
  parentId: z.string().optional(), // Optional parent comment ID for replies
});

// Helper function to build comment tree
interface CommentWithReplies {
  id: string;
  content: string;
  userId: string;
  torrentId: string | null;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    username: string;
    role: string;
    createdAt: Date;
  };
  _count: {
    upvotes: number;
    downvotes: number;
  };
  userVote: 'upvote' | 'downvote' | null;
  isOP: boolean;
  replies: CommentWithReplies[];
}

function buildCommentTree(comments: CommentWithReplies[], maxDepth: number = 4): CommentWithReplies[] {
  const commentMap = new Map<string, CommentWithReplies>();
  const rootComments: CommentWithReplies[] = [];

  // First pass: create a map of all comments
  comments.forEach(comment => {
    commentMap.set(comment.id, { ...comment, replies: [] });
  });

  // Second pass: build the tree structure
  comments.forEach(comment => {
    const commentWithReplies = commentMap.get(comment.id);
    
    if (!commentWithReplies) return; // Skip if comment not found in map
    
    if (comment.parentId) {
      // This is a reply
      const parent = commentMap.get(comment.parentId);
      if (parent && parent.replies.length < maxDepth) {
        parent.replies.push(commentWithReplies);
      }
    } else {
      // This is a root comment
      rootComments.push(commentWithReplies);
    }
  });

  return rootComments;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id: torrentId } = await params;
    const { searchParams } = new URL(request.url);
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Check if torrent exists and get uploader info
    const torrent = await prisma.torrent.findUnique({ 
      where: { id: torrentId }, 
      select: { id: true, uploadedBy: true } 
    });
    
    if (!torrent) {
      return NextResponse.json({ error: 'Torrent not found' }, { status: 404 });
    }

    // Fetch all comments for this torrent (including replies)
    const comments = await prisma.comment.findMany({
      where: { torrentId },
      include: {
        user: { 
          select: { 
            id: true, 
            username: true, 
            role: true, 
            createdAt: true 
          } 
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get vote counts for all comments
    const voteCounts = await prisma.vote.groupBy({
      by: ['commentId', 'type'],
      where: {
        commentId: { in: comments.map(c => c.id) }
      },
      _count: true,
    });

    // Get user votes if logged in
    let userVotes: Record<string, 'upvote' | 'downvote'> = {};
    if (session?.user) {
      const votes = await prisma.vote.findMany({
        where: {
          userId: session.user.id,
          commentId: { in: comments.map(c => c.id) },
        },
        select: { commentId: true, type: true },
      });
      
      userVotes = votes.reduce((acc, vote) => {
        if (vote.commentId) {
          // Convert 'up'/'down' to 'upvote'/'downvote' for frontend compatibility
          acc[vote.commentId] = (vote.type === 'up' ? 'upvote' : 'downvote') as 'upvote' | 'downvote';
        }
        return acc;
      }, {} as Record<string, 'upvote' | 'downvote'>);
    }

    // Build vote counts map
    const voteCountsMap = new Map<string, { upvotes: number; downvotes: number }>();
    comments.forEach(comment => {
      voteCountsMap.set(comment.id, { upvotes: 0, downvotes: 0 });
    });

    voteCounts.forEach(vote => {
      if (vote.commentId) {
        const counts = voteCountsMap.get(vote.commentId)!;
        if (vote.type === 'up') {
          counts.upvotes = vote._count;
        } else if (vote.type === 'down') {
          counts.downvotes = vote._count;
        }
      }
    });

    // Add vote counts, user votes, and OP status to comments
    const commentsWithVotes = comments.map(comment => {
      const counts = voteCountsMap.get(comment.id)!;
      const isOP = comment.user.id === torrent.uploadedBy;
      return {
        ...comment,
        _count: counts,
        userVote: userVotes[comment.id] || null,
        isOP,
      };
    });

    // Build comment tree
    const commentTree = buildCommentTree(commentsWithVotes);

    // Apply pagination to root comments only
    const totalRootComments = commentTree.length;
    const paginatedRootComments = commentTree.slice(offset, offset + limit);

    return NextResponse.json({
      comments: paginatedRootComments,
      pagination: {
        page,
        limit,
        total: totalRootComments,
        totalPages: Math.ceil(totalRootComments / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: 'Error loading comments' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'You must be logged in to comment' }, { status: 401 });
    }
    
    const { id: torrentId } = await params;
    const body = await request.json();
    
    // Validate input
    const validation = createCommentSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 });
    }
    
    const { content, parentId } = validation.data;
    
    // Check if torrent exists
    const torrent = await prisma.torrent.findUnique({ 
      where: { id: torrentId }, 
      select: { id: true } 
    });
    
    if (!torrent) {
      return NextResponse.json({ error: 'Torrent not found' }, { status: 404 });
    }

    // If this is a reply, validate the parent comment
    if (parentId) {
      const parentComment = await prisma.comment.findFirst({
        where: { 
          id: parentId, 
          torrentId 
        },
        select: { id: true, parentId: true }
      });
      
      if (!parentComment) {
        return NextResponse.json({ error: 'Parent comment not found' }, { status: 404 });
      }

      // Check depth limit (max 4 levels deep)
      let depth = 0;
      let current = parentComment;
      while (current.parentId && depth < 4) {
        depth++;
        const parent = await prisma.comment.findUnique({
          where: { id: current.parentId },
          select: { id: true, parentId: true }
        });
        if (!parent) break;
        current = parent;
      }
      
      if (depth >= 4) {
        return NextResponse.json({ error: 'Maximum reply depth reached' }, { status: 400 });
      }
    }
    
    // Check user permissions
    const user = await prisma.user.findUnique({ 
      where: { id: session.user.id }, 
      select: { role: true } 
    });
    
    if (!user || user.role === 'GUEST') {
      return NextResponse.json({ error: 'You do not have permission to comment' }, { status: 403 });
    }
    
    // Create comment
    const comment = await prisma.comment.create({
      data: { 
        content, 
        userId: session.user.id, 
        torrentId,
        parentId: parentId || null,
      },
      include: { 
        user: { 
          select: { 
            id: true, 
            username: true, 
            role: true, 
            createdAt: true 
          } 
        } 
      },
    });
    
    return NextResponse.json({
      message: 'Comment created successfully',
      comment: { 
        ...comment, 
        userVote: null, 
        _count: { upvotes: 0, downvotes: 0 },
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json({ error: 'Error creating comment' }, { status: 500 });
  }
} 