/**
 * Upload Torrent Page
 * 
 * Optimized upload page with component-based architecture
 */

import DashboardWrapper from '@/app/dashboard/components/DashboardWrapper';
import UploadContent from './components/UploadContent';

export default function UploadPage() {
  return (
    <DashboardWrapper>
      <UploadContent />
    </DashboardWrapper>
  );
} 