/**
 * Password Requirements Card component
 * Displays password requirements in a modern card format
 */

import React from 'react';
import { useTranslation } from 'react-i18next';

interface PasswordRequirementsCardProps {
  password: string;
  isVisible: boolean;
}

const PasswordRequirementsCard: React.FC<PasswordRequirementsCardProps> = ({ password, isVisible }) => {
  const { t } = useTranslation();

  const requirements = [
    {
      id: 'length',
      label: 'At least 8 characters',
      met: password.length >= 8,
      icon: password.length >= 8 ? '✓' : '○'
    },
    {
      id: 'uppercase',
      label: 'One uppercase letter',
      met: /[A-Z]/.test(password),
      icon: /[A-Z]/.test(password) ? '✓' : '○'
    },
    {
      id: 'lowercase',
      label: 'One lowercase letter',
      met: /[a-z]/.test(password),
      icon: /[a-z]/.test(password) ? '✓' : '○'
    },
    {
      id: 'number',
      label: 'One number',
      met: /[0-9]/.test(password),
      icon: /[0-9]/.test(password) ? '✓' : '○'
    },
    {
      id: 'special',
      label: 'One special character',
      met: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      icon: /[!@#$%^&*(),.?":{}|<>]/.test(password) ? '✓' : '○'
    }
  ];

  const metCount = requirements.filter(req => req.met).length;
  const totalCount = requirements.length;

  if (!isVisible) return null;

  return (
    <div className="mt-2 p-3 bg-surface/50 backdrop-blur-sm rounded-xl border border-border/50 shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold text-text">Password Requirements</h4>
        <span className="text-xs text-text-secondary">
          {metCount}/{totalCount} met
        </span>
      </div>
      
      <div className="space-y-1">
        {requirements.map((requirement) => (
          <div 
            key={requirement.id}
            className={`flex items-center gap-2 text-sm transition-colors duration-200 ${
              requirement.met 
                ? 'text-green-600' 
                : 'text-text-secondary'
            }`}
          >
            <span className={`text-sm font-bold ${
              requirement.met ? 'text-green-600' : 'text-text-secondary'
            }`}>
              {requirement.icon}
            </span>
            <span>{requirement.label}</span>
          </div>
        ))}
      </div>

      {/* Progress indicator */}
      <div className="mt-2">
        <div className="w-full h-1 bg-border rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              metCount === totalCount ? 'bg-green-600' : 'bg-primary'
            }`}
            style={{ width: `${(metCount / totalCount) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default PasswordRequirementsCard; 