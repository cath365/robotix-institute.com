import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AccountsPanelClient from './AccountsPanelClient';

export const metadata: Metadata = {
  title: 'Accounts Panel',
  description: 'Protected Robotix Institute accounts panel for payment follow-up and order reconciliation.',
};

export default function AccountsPage() {
  return (
    <main className="min-h-screen bg-brand-dark text-white">
      <Navbar />
      <section className="relative overflow-hidden pt-28 pb-16">
        <div className="absolute inset-0 aurora-bg opacity-75" />
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AccountsPanelClient />
        </div>
      </section>
      <Footer />
    </main>
  );
}
