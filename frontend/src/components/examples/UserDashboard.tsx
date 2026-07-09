import { UserDashboard } from '../../pages/UserDashboard';

export default function UserDashboardExample() {
  return (
    <UserDashboard
      onNavigateToCalculator={(type) => console.log('Navigate to calculator:', type)}
    />
  );
}