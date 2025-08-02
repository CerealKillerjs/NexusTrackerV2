/**
 * Profile Page
 * Displays user profile information and settings
 * Optimized with component-based architecture
 */

import DashboardWrapper from '../dashboard/components/DashboardWrapper';
import ProfileContent from './components/ProfileContent';

export default function ProfilePage() {
  return (
    <DashboardWrapper>
      <ProfileContent />
    </DashboardWrapper>
  );
} 