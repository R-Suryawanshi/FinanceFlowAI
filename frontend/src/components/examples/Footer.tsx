import { Footer } from '../Footer';

export default function FooterExample() {
  return (
    <Footer
      onPageChange={(page) => console.log('Page changed to:', page)}
    />
  );
}