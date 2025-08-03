/**
 * Users Stats Display - Client Component
 * 
 * Componente para mostrar las estadísticas de usuarios con iconos
 */

'use client';

import { User } from '@styled-icons/boxicons-regular/User';
import { CheckCircle } from '@styled-icons/boxicons-regular/CheckCircle';
import { Time } from '@styled-icons/boxicons-regular/Time';
import { XCircle } from '@styled-icons/boxicons-regular/XCircle';

interface UsersStatsDisplayProps {
  stats: {
    totalUsers: number;
    activeUsers: number;
    pendingUsers: number;
    bannedUsers: number;
  };
}

export default function UsersStatsDisplay({ stats }: UsersStatsDisplayProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-surface rounded-lg p-6 border border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
            <User size={20} className="text-primary" />
          </div>
          <span className="text-xs text-text-secondary">Total</span>
        </div>
        <div className="text-2xl font-bold text-text">{stats.totalUsers}</div>
        <p className="text-sm text-text-secondary">Usuarios</p>
      </div>

      <div className="bg-surface rounded-lg p-6 border border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
            <CheckCircle size={20} className="text-white" />
          </div>
          <span className="text-xs text-text-secondary">Activos</span>
        </div>
        <div className="text-2xl font-bold text-text">{stats.activeUsers}</div>
        <p className="text-sm text-text-secondary">Usuarios Activos</p>
      </div>

      <div className="bg-surface rounded-lg p-6 border border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="w-8 h-8 bg-yellow-600 rounded-lg flex items-center justify-center">
            <Time size={20} className="text-white" />
          </div>
          <span className="text-xs text-text-secondary">Pendientes</span>
        </div>
        <div className="text-2xl font-bold text-text">{stats.pendingUsers}</div>
        <p className="text-sm text-text-secondary">Usuarios Pendientes</p>
      </div>

      <div className="bg-surface rounded-lg p-6 border border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
            <XCircle size={20} className="text-white" />
          </div>
          <span className="text-xs text-text-secondary">Baneados</span>
        </div>
        <div className="text-2xl font-bold text-text">{stats.bannedUsers}</div>
        <p className="text-sm text-text-secondary">Usuarios Baneados</p>
      </div>
    </div>
  );
} 