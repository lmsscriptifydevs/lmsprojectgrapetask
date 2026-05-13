import { DashboardShell } from '@/components/layout/DashboardShell';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { TrainerDashboard } from '@/features/trainer/TrainerDashboard';

export default function TrainerDashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardShell area="Trainer">
        <TrainerDashboard />
      </DashboardShell>
    </ProtectedRoute>
  );
}
