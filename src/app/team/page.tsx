import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import TeamWorkspaceClient from './TeamWorkspaceClient';

export const metadata: Metadata = {
  title: 'Team Workspace',
  description: 'Staff-only Robotix Institute workspace for internal chat and shared calendar coordination.',
};

export default function TeamPage() {
  return (
    <main className="min-h-screen bg-brand-dark text-white">
      <Navbar />
      <section className="relative overflow-hidden pt-28 pb-16">
        <div className="absolute inset-0 aurora-bg opacity-75" />
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <TeamWorkspaceClient />
        </div>
      </section>
      <Footer />
    </main>
  );
}
