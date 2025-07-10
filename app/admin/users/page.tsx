/**
 * Admin Users Management Page
 * Provides comprehensive user management interface for administrators
 * - List all users with detailed information
 * - Search and filter capabilities
 * - User status management
 * - Role management
 * - Statistics and analytics
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/app/components/admin/AdminLayout';
import { useI18n } from '@/app/hooks/useI18n';
// Icon imports
import { User } from '@styled-icons/boxicons-regular/User';
import { Shield } from '@styled-icons/boxicons-solid/Shield';
import { Search } from '@styled-icons/boxicons-regular/Search';
import { Refresh } from '@styled-icons/boxicons-regular/Refresh';
import { Edit } from '@styled-icons/boxicons-regular/Edit';
import { Trash } from '@styled-icons/boxicons-regular/Trash';
import { CheckCircle } from '@styled-icons/boxicons-regular/CheckCircle';
import { XCircle } from '@styled-icons/boxicons-regular/XCircle';
import { Time } from '@styled-icons/boxicons-regular/Time';
import { Download } from '@styled-icons/boxicons-regular/Download';
import { Upload } from '@styled-icons/boxicons-regular/Upload';
import EditUserModal from '@/app/components/admin/EditUserModal';
import DeleteUserModal from '@/app/components/admin/DeleteUserModal';

// User interface
interface UserData {
  id: string;
  username: string;
  email: string;
  role: 'USER' | 'MODERATOR' | 'ADMIN';
  status: 'ACTIVE' | 'BANNED' | 'PENDING';
  createdAt: string;
  uploaded: string;
  downloaded: string;
  ratio: number;
  passkey: string;
  isEmailVerified: boolean;
  uploadCount: number;
  downloadCount: number;
  availableInvites: number;
}

interface UsersResponse {
  users: UserData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useI18n();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  // Fetch users from API (top-level, useCallback)
  const fetchUsers = useCallback(async () => {
    try {
      setError(null);
      const params = new URLSearchParams({
        limit: '50',
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      if (searchTerm) params.append('search', searchTerm);
      if (roleFilter !== 'all') params.append('role', roleFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      const response = await fetch(`/api/admin/users?${params}`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error al cargar los usuarios: ${response.status} ${errorText}`);
      }
      const data: UsersResponse = await response.json();
      setUsers(data.users);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  }, [searchTerm, roleFilter, statusFilter]);

  // Check if user is admin and fetch users
  useEffect(() => {
    const checkAdminAndFetchUsers = async () => {
      if (status === 'authenticated' && session?.user) {
        try {
          setLoading(true);
          
          const response = await fetch('/api/auth/check-admin');
          if (response.ok) {
            const { isAdmin: adminStatus } = await response.json();
            setIsAdmin(adminStatus);
            
            if (adminStatus) {
              await fetchUsers();
            } else {
              router.push('/dashboard');
            }
          } else {
            setIsAdmin(false);
            router.push('/dashboard');
          }
        } catch (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
          router.push('/dashboard');
        } finally {
          setLoading(false);
        }
      } else if (status === 'unauthenticated') {
        setLoading(false);
        router.push('/auth/signin');
      }
    };

    checkAdminAndFetchUsers();
  }, [status, session, router, fetchUsers]);

  // Refetch users when filters change (only if admin)
  useEffect(() => {
    if (status === 'authenticated' && isAdmin && !loading) {
      fetchUsers();
    }
  }, [searchTerm, roleFilter, statusFilter, status, isAdmin, loading, fetchUsers]);

  // Show loading while checking authentication and admin status
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-900 dark:text-white text-lg">{t('common.loading')}</div>
      </div>
    );
  }

  // Don't render if not authenticated or not admin
  if (status === 'unauthenticated' || !session || !isAdmin) {
    return null;
  }

  const formatBytes = (bytes: string): string => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const bytesNum = BigInt(bytes);
    if (bytesNum === BigInt(0)) return '0 B';
    const i = Math.floor(Math.log(Number(bytesNum)) / Math.log(1024));
    return `${(Number(bytesNum) / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      USER: { bg: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', icon: User },
      MODERATOR: { bg: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', icon: Shield },
      ADMIN: { bg: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', icon: Shield }
    };
    
    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.USER;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg}`}>
        <Icon className="mr-1" size={12} />
        {t(`admin.users.roles.${role.toLowerCase()}`)}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { bg: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: CheckCircle },
      BANNED: { bg: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', icon: XCircle },
      PENDING: { bg: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', icon: Time }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.ACTIVE;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg}`}>
        <Icon className="mr-1" size={12} />
        {t(`admin.users.status.${status.toLowerCase()}`)}
      </span>
    );
  };

  // Modal handlers
  const handleEditUser = (user: UserData) => {
    setSelectedUserId(user.id);
    setEditModalOpen(true);
  };

  const handleDeleteUser = (user: UserData) => {
    setSelectedUser(user);
    setDeleteModalOpen(true);
  };

  const handleUserUpdated = () => {
    fetchUsers(); // Refresh the user list
  };

  const handleUserDeleted = () => {
    fetchUsers(); // Refresh the user list
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text mb-2">
              <User className="inline mr-2 align-text-bottom" size={22} /> {t('admin.users.title')}
            </h1>
            <p className="text-text-secondary">
              {t('admin.users.description')}
            </p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-surface border border-border rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" size={16} />
              <input
                type="text"
                placeholder={t('admin.users.search.placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-border rounded-md bg-background text-text placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border border-border rounded-md bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">{t('admin.users.filters.allRoles')}</option>
              <option value="USER">{t('admin.users.roles.user')}</option>
              <option value="MODERATOR">{t('admin.users.roles.moderator')}</option>
              <option value="ADMIN">{t('admin.users.roles.admin')}</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-border rounded-md bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">{t('admin.users.filters.allStatus')}</option>
              <option value="ACTIVE">{t('admin.users.status.active')}</option>
              <option value="BANNED">{t('admin.users.status.banned')}</option>
              <option value="PENDING">{t('admin.users.status.pending')}</option>
            </select>

            {/* Refresh Button */}
            <button
              onClick={fetchUsers}
              disabled={loading}
              className="flex items-center justify-center px-4 py-2 bg-primary text-background rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              <Refresh size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
              {t('admin.users.refresh')}
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-surface-light">
            <h2 className="text-xl font-semibold text-text">
              {t('admin.users.list.title')}
              <span className="ml-2 text-sm text-text-secondary">
                {t('admin.users.list.count', { count: users.length })}
              </span>
            </h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="text-text-secondary">{t('admin.users.loading')}</div>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <div className="text-error mb-4">{error}</div>
              <button
                onClick={fetchUsers}
                className="px-4 py-2 bg-primary text-background rounded hover:bg-primary-dark transition-colors"
              >
                {t('admin.users.retry')}
              </button>
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-text-secondary mb-2">{t('admin.users.empty')}</div>
              <p className="text-sm text-text-secondary">
                {t('admin.users.emptyDescription')}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface-light border-b border-border">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">
                      {t('admin.users.table.headers.user')}
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">
                      {t('admin.users.table.headers.role')}
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">
                      {t('admin.users.table.headers.status')}
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">
                      {t('admin.users.table.headers.stats')}
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">
                      Invitaciones
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">
                      {t('admin.users.table.headers.joined')}
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">
                      {t('admin.users.table.headers.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-surface-light transition-colors duration-150">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                            <User className="text-background" size={16} />
                          </div>
                          <div>
                            <div className="font-medium text-text">{user.username}</div>
                            <div className="text-sm text-text-secondary">{user.email}</div>
                            {!user.isEmailVerified && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                {t('admin.users.emailNotVerified')}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(user.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Upload className="mr-1 text-green-500" size={14} />
                            <span className="text-text-secondary">{t('admin.users.table.uploaded')}:</span>
                            <span className="ml-1 font-mono">{formatBytes(user.uploaded)}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Download className="mr-1 text-red-500" size={14} />
                            <span className="text-text-secondary">{t('admin.users.table.downloaded')}:</span>
                            <span className="ml-1 font-mono">{formatBytes(user.downloaded)}</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-text-secondary">{t('admin.users.table.ratio')}:</span>
                            <span className={`ml-1 font-medium ${user.ratio >= 1 ? 'text-green-500' : 'text-red-500'}`}>
                              {user.ratio.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.availableInvites > 0 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                          }`}>
                            {user.availableInvites} disponible{user.availableInvites !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-text-secondary">
                        <div className="text-sm">
                          {new Date(user.createdAt).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="p-1 text-text-secondary hover:text-primary hover:bg-surface-light rounded transition-colors"
                            title={t('admin.users.actions.edit')}
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="p-1 text-text-secondary hover:text-error hover:bg-surface-light rounded transition-colors"
                            title={t('admin.users.actions.delete')}
                          >
                            <Trash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modals */}
        <EditUserModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          userId={selectedUserId}
          onUserUpdated={handleUserUpdated}
        />

        <DeleteUserModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          user={selectedUser}
          onUserDeleted={handleUserDeleted}
        />
      </div>
    </AdminLayout>
  );
} 