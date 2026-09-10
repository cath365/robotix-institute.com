import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Section, GlassCard, Badge } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The rules for using Robotix Institute.',
};

export default function TermsPage() {
  return (
    <main className="bg-brand-dark min-h-screen">
      <Navbar />
      <section className="pt-32 pb-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Badge variant="accent" className="mb-3">Legal</Badge>
          <h1 className="font-heading text-4xl font-bold text-white mb-2">Terms of Service</h1>
          <p className="text-white/40 text-sm">Last updated: May 2026</p>
        </div>
      </section>
      <Section>
        <GlassCard className="p-8 prose prose-invert max-w-none">
          <h2>1. Acceptance</h2>
          <p>
            By creating an account or using Robotix Institute you agree to these Terms.
            If you don&apos;t, please don&apos;t use the platform.
          </p>

          <h2>2. Accounts</h2>
          <p>
            You are responsible for keeping your password safe. Don&apos;t share your account.
            One account per learner please.
          </p>

          <h2>3. Acceptable use</h2>
          <ul>
            <li>No harassment, hate speech, or illegal content.</li>
            <li>No uploading malware or attempting to break the platform.</li>
            <li>No copying paid content or course material without permission.</li>
            <li>No collecting other users&apos; personal data.</li>
          </ul>

          <h2>4. User content</h2>
          <p>
            You own what you create (code projects, portfolio items, forum posts).
            By uploading, you grant us a non-exclusive licence to display it on the
            platform and showcase it for educational purposes.
          </p>

          <h2>5. Payments and programs</h2>
          <p>
            Program payments, deposits, and learning arrangements are confirmed
            through Robotix staff. Offline payment proof may be reviewed by the
            accounts team before a record is marked as paid.
          </p>

          <h2>6. Termination</h2>
          <p>
            We may suspend accounts that violate these Terms. You can delete your
            account at any time.
          </p>

          <h2>7. Liability</h2>
          <p>
            The platform is provided &ldquo;as is&rdquo;. We don&apos;t guarantee uptime, and we
            aren&apos;t liable for indirect damages.
          </p>

          <h2>8. Governing law</h2>
          <p>These Terms are governed by the laws of the Republic of Zambia.</p>
        </GlassCard>
      </Section>
      <Footer />
    </main>
  );
}
