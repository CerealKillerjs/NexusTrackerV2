/**
 * User Types and Role Definitions
 * 
 * This file defines the user roles and extends NextAuth types
 * to include custom user properties.
 */

// User role types
export type UserRole = 'user' | 'guest' | 'admin' | 'moderator'

// Role permissions
export const ROLE_PERMISSIONS = {
  guest: {
    canViewTorrents: true,
    canSearch: true,
    canViewWiki: true,
    canUpload: false,
    canComment: false,
    canVote: false,
    canReport: false,
    canAccessAdmin: false,
  },
  user: {
    canViewTorrents: true,
    canSearch: true,
    canViewWiki: true,
    canUpload: true,
    canComment: true,
    canVote: true,
    canReport: true,
    canAccessAdmin: false,
  },
  moderator: {
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
  admin: {
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
export function hasPermission(role: UserRole, permission: keyof typeof ROLE_PERMISSIONS.admin): boolean {
  return ROLE_PERMISSIONS[role]?.[permission] ?? false
}

// Helper function to check if user is admin
export function isAdmin(role: UserRole): boolean {
  return role === 'admin'
}

// Helper function to check if user is moderator or admin
export function isModerator(role: UserRole): boolean {
  return role === 'moderator' || role === 'admin'
}

// Helper function to check if user can access admin panel
export function canAccessAdmin(role: UserRole): boolean {
  return hasPermission(role, 'canAccessAdmin')
} 