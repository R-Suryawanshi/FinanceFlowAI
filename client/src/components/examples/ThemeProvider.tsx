import { ThemeProvider } from '../ThemeProvider';
import { Button } from '@/components/ui/button';

export default function ThemeProviderExample() {
  return (
    <ThemeProvider>
      <div className="p-4">
        <Button>Theme Provider Example</Button>
      </div>
    </ThemeProvider>
  );
}