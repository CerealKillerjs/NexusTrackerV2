/**
 * usePermissions Hook
 * 
 * Custom hook for checking user permissions based on their role.
 * Provides easy access to permission checking throughout the application.
 */

import { useSession } from 'next-auth/react'
import { hasPermission, isAdmin, isModerator, canAccessAdmin, UserRole } from '@/app/types/user'

export function usePermissions() {
  const { data: session } = useSession()
  const userRole = (session?.user?.role as UserRole) || 'guest'

  return {
    // Current user role
    role: userRole,
    
    // Permission checking functions
    hasPermission: (permission: keyof ReturnType<typeof hasPermission> extends (role: UserRole, permission: infer P) => boolean ? P : never) => 
      hasPermission(userRole, permission),
    
    // Role checking functions
    isAdmin: () => isAdmin(userRole),
    isModerator: () => isModerator(userRole),
    canAccessAdmin: () => canAccessAdmin(userRole),
    
    // Quick permission checks
    canViewTorrents: hasPermission(userRole, 'canViewTorrents'),
    canSearch: hasPermission(userRole, 'canSearch'),
    canViewWiki: hasPermission(userRole, 'canViewWiki'),
    canUpload: hasPermission(userRole, 'canUpload'),
    canComment: hasPermission(userRole, 'canComment'),
    canVote: hasPermission(userRole, 'canVote'),
    canReport: hasPermission(userRole, 'canReport'),
    canModerate: hasPermission(userRole, 'canModerate'),
    canAccessAdminPanel: hasPermission(userRole, 'canAccessAdmin'),
  }
} 