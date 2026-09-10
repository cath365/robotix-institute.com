import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Section, GlassCard, Badge } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Robotix Institute collects, uses, and protects your data.',
};

export default function PrivacyPage() {
  return (
    <main className="bg-brand-dark min-h-screen">
      <Navbar />
      <section className="pt-32 pb-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Badge variant="accent" className="mb-3">Legal</Badge>
          <h1 className="font-heading text-4xl font-bold text-white mb-2">Privacy Policy</h1>
          <p className="text-white/40 text-sm">Last updated: May 2026</p>
        </div>
      </section>
      <Section>
        <GlassCard className="p-8 prose prose-invert max-w-none">
          <h2>1. Introduction</h2>
          <p>
            Robotix Institute (&ldquo;we&rdquo;, &ldquo;us&rdquo;) operates the website and platform at
            robotixinstitute.co.zm. This policy explains what personal data we collect,
            why, and how we keep it safe.
          </p>

          <h2>2. Data we collect</h2>
          <ul>
            <li><strong>Account data</strong> — email, first/last name, hashed password, role.</li>
            <li><strong>Profile data</strong> — bio, avatar, GitHub/LinkedIn links you choose to share.</li>
            <li><strong>Learning data</strong> — courses enrolled, progress, quiz answers, certificates.</li>
            <li><strong>Project data</strong> — code projects, robotics projects, portfolio items.</li>
            <li><strong>Order data</strong> — phone, delivery address, items purchased (only if you order).</li>
            <li><strong>Technical data</strong> — IP, device type, browser, anonymous analytics.</li>
          </ul>

          <h2>3. How we use it</h2>
          <ul>
            <li>To provide the platform and your account.</li>
            <li>To grade work and issue certificates.</li>
            <li>To deliver hardware orders (only with your consent).</li>
            <li>To improve safety, performance, and content.</li>
            <li>To send service emails (resets, notifications) — never marketing without consent.</li>
          </ul>

          <h2>4. Children</h2>
          <p>
            We knowingly collect data from learners under 13 only with verifiable
            parental or school consent. Parents may request deletion at any time
            by emailing <a href="mailto:hello@robotixinstitute.co.zm">hello@robotixinstitute.co.zm</a>.
          </p>

          <h2>5. Security</h2>
          <p>
            Passwords are bcrypt-hashed. All traffic is served over HTTPS.
            JWT tokens are stored as HTTP-only cookies. Files are scanned and
            served from a CDN with strict content-type controls.
          </p>

          <h2>6. Your rights</h2>
          <p>
            You can access, correct, or delete your account at any time from your
            dashboard, or by emailing us.
          </p>

          <h2>7. Contact</h2>
          <p>
            Questions? Email <a href="mailto:hello@robotixinstitute.co.zm">hello@robotixinstitute.co.zm</a>.
          </p>
        </GlassCard>
      </Section>
      <Footer />
    </main>
  );
}
