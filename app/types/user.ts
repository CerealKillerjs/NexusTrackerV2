/**
 * User Types and Role Definitions
 * 
 * This file defines the user roles and extends NextAuth types
 * to include custom user properties.
 */

// User role types
export type UserRole = 'USER' | 'GUEST' | 'ADMIN' | 'MODERATOR'

// Role permissions
export const ROLE_PERMISSIONS = {
  GUEST: {
    canViewTorrents: true,
    canSearch: true,
    canViewWiki: true,
    canUpload: false,
    canComment: false,
    canVote: false,
    canReport: false,
    canModerate: false,
    canAccessAdmin: false,
  },
  USER: {
    canViewTorrents: true,
    canSearch: true,
    canViewWiki: true,
    canUpload: true,
    canComment: true,
    canVote: true,
    canReport: true,
    canModerate: false,
    canAccessAdmin: false,
  },
  MODERATOR: {
    canViewTorrents: true,
    canSearch: true,
    canViewWiki: true,
    canUpload: true,
    canComment: true,
    canVote: true,
    canReport: true,
    canModerate: true,
    canAccessAdmin: false,
  },
  ADMIN: {
    canViewTorrents: true,
    canSearch: true,
    canViewWiki: true,
    canUpload: true,
    canComment: true,
    canVote: true,
    canReport: true,
    canModerate: true,
    canAccessAdmin: true,
  },
} as const

// Helper function to check permissions
export function hasPermission(role: UserRole, permission: keyof typeof ROLE_PERMISSIONS.ADMIN): boolean {
  return ROLE_PERMISSIONS[role]?.[permission] ?? false
}

// Helper function to check if user is admin
export function isAdmin(role: UserRole): boolean {
  return role === 'ADMIN'
}

// Helper function to check if user is moderator or admin
export function isModerator(role: UserRole): boolean {
  return role === 'MODERATOR' || role === 'ADMIN'
}

// Helper function to check if user can access admin panel
export function canAccessAdmin(role: UserRole): boolean {
  return hasPermission(role, 'canAccessAdmin')
}

/**
 * User Types
 * Defines the types for the user profile page
 */

// User profile interface
export interface UserProfile {
  id: number;
  username: string;
  email: string;
  joinDate: string;
  avatar: string | null;
  stats: {
    uploaded: string;
    downloaded: string;
    ratio: number;
    points: number;
    rank: string;
  };
  preferences: {
    notifications: boolean;
    privateProfile: boolean;
    language: string;
    theme: 'light' | 'dark';
  };
}

// Download history interface
export interface DownloadHistory {
  id: number;
  torrentName: string;
  downloadDate: string;
  size: string;
  uploaded: string;
  downloaded: string;
  ratio: number;
  status: 'completed' | 'active' | 'stopped';
}

// Achievement interface
export interface Achievement {
  type: 'uploader' | 'seeder' | 'contributor';
  date: string;
  value: string;
}

// Activity item interface
export interface ActivityItem {
  id: string;
  type: 'download' | 'achievement' | 'ratio' | 'seeding';
  title: string;
  description: string;
  date: string;
  metadata?: {
    torrentName?: string;
    achievement?: string;
    oldRatio?: number;
    newRatio?: number;
    seedingCount?: number;
  };
}

// Mock achievements
export const mockAchievements: Achievement[] = [
  {
    type: 'uploader',
    date: '2024-02-15',
    value: '100 uploads'
  },
  {
    type: 'seeder',
    date: '2024-02-10',
    value: '1000 hours'
  },
  {
    type: 'contributor',
    date: '2024-02-01',
    value: '50 comments'
  }
]; 