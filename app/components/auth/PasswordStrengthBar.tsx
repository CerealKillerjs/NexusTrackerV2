/**
 * Password Strength Bar component
 * Displays the strength of a password with visual feedback and security recommendations
 */

import React from 'react';
import { useI18n } from '@/app/hooks/useI18n';

interface PasswordStrengthBarProps {
  password: string;
}

const PasswordStrengthBar: React.FC<PasswordStrengthBarProps> = ({ password }) => {
  const { t } = useI18n();

  const calculateStrength = (): { strength: number; message: string } => {
    let strength = 0;

    // Individual validations (20% each)
    if (password.length >= 8) strength += 20;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[a-z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 20;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 20;

    let message = t('auth.register.passwordStrength.weak');
    if (strength > 20) message = t('auth.register.passwordStrength.fair');
    if (strength > 60) message = t('auth.register.passwordStrength.good');
    if (strength > 80) message = t('auth.register.passwordStrength.strong');

    return { strength, message };
  };

  const { strength, message } = calculateStrength();

  const getBarColor = () => {
    if (strength <= 20) return 'bg-[var(--password-weak)]';     // Weak
    if (strength <= 60) return 'bg-[var(--password-fair)]';     // Fair
    if (strength <= 80) return 'bg-[var(--password-good)]';     // Good
    return 'bg-primary';                                        // Strong - uses the existing primary color
  };

  // Check individual requirements
  const requirements = [
    { 
      met: password.length >= 8, 
      text: t('auth.register.passwordRequirements.minLength', 'Al menos 8 caracteres') 
    },
    { 
      met: /[A-Z]/.test(password), 
      text: t('auth.register.passwordRequirements.uppercase', 'Al menos una mayúscula') 
    },
    { 
      met: /[a-z]/.test(password), 
      text: t('auth.register.passwordRequirements.lowercase', 'Al menos una minúscula') 
    },
    { 
      met: /[0-9]/.test(password), 
      text: t('auth.register.passwordRequirements.number', 'Al menos un número') 
    },
    { 
      met: /[!@#$%^&*(),.?":{}|<>]/.test(password), 
      text: t('auth.register.passwordRequirements.special', 'Al menos un carácter especial') 
    }
  ];

  return (
    <div className="mt-1 mb-4">
      {/* Security Recommendations Header */}
      <div className="mb-3">
        <h4 className="text-sm font-medium text-text mb-2">
          {t('auth.register.securityRecommendations', 'Recomendaciones para la seguridad')}
        </h4>
        
        {/* Requirements List */}
        <div className="space-y-1">
          {requirements.map((req, index) => (
            <div key={index} className="flex items-center text-xs">
              <span className={`mr-2 ${req.met ? 'text-green-500' : 'text-gray-400'}`}>
                {req.met ? '✓' : '○'}
              </span>
              <span className={req.met ? 'text-text' : 'text-text-secondary'}>
                {req.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Strength Bar */}
      <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${getBarColor()}`}
          style={{ width: `${strength}%` }}
        />
      </div>
      
      {/* Strength Info */}
      {password && (
        <div className="flex justify-between mt-1">
          <span className="text-xs text-text-secondary">{message}</span>
          <span className="text-xs text-text-secondary">{strength}%</span>
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthBar; 