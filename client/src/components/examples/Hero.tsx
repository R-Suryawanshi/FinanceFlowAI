import { Hero } from '../Hero';

export default function HeroExample() {
  return (
    <Hero
      onGetStarted={() => console.log('Get Started')}
      onLearnMore={() => console.log('Learn More')}
    />
  );
}