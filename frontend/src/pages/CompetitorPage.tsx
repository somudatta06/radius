import { CompetitorDiscovery } from '@/components/CompetitorDiscovery';
import LandingNav from '@/components/LandingNav';
import Footer from '@/components/Footer';

export default function CompetitorPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <LandingNav />
      <main className="flex-1 pt-20">
        <CompetitorDiscovery />
      </main>
      <Footer />
    </div>
  );
}
