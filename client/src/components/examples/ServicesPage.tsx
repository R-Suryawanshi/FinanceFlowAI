import { ServicesPage } from '../ServicesPage';

export default function ServicesPageExample() {
  return (
    <ServicesPage
      onNavigateToCalculator={(type) => console.log('Navigate to calculator:', type)}
      onGetStarted={() => console.log('Get Started')}
    />
  );
}