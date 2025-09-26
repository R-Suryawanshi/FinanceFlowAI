import { Header } from '../Header';
import { ThemeProvider } from '../ThemeProvider';

export default function HeaderExample() {
  return (
    <ThemeProvider>
      <Header
        currentPage="home"
        onPageChange={(page) => console.log('Page changed to:', page)}
        isLoggedIn={false}
        onLogin={() => console.log('Login')}
        onSignup={() => console.log('Signup')}
        onLogout={() => console.log('Logout')}
      />
    </ThemeProvider>
  );
}