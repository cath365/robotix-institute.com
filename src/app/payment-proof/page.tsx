import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PaymentProofForm from './PaymentProofForm';

export const metadata: Metadata = {
  title: 'Submit Payment Proof',
  description: 'Send Robotix Institute mobile money or offline payment proof to accounts for review.',
};

export default function PaymentProofPage() {
  return (
    <main className="min-h-screen bg-brand-dark text-white">
      <Navbar />
      <section className="relative overflow-hidden pt-28 pb-16">
        <div className="absolute inset-0 aurora-bg opacity-75" />
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PaymentProofForm />
        </div>
      </section>
      <Footer />
    </main>
  );
}
