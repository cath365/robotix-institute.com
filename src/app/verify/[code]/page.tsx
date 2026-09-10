import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Badge, Button, GlassCard, Section } from '@/components/ui';
import prisma from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { Award, CheckCircle2, ShieldCheck } from 'lucide-react';

type VerifyPageProps = {
  params: { code: string };
};

export default async function VerifyCertificatePage({ params }: VerifyPageProps) {
  const certificate = await prisma.certificate.findUnique({
    where: { certCode: params.code },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  if (!certificate) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-brand-dark text-white">
      <Navbar />

      <section className="relative overflow-hidden border-b border-white/10 pt-28">
        <div className="aurora-bg absolute inset-0 opacity-75" />
        <div className="mx-auto max-w-5xl px-4 pb-12 sm:px-6 lg:px-8">
          <Badge variant="accent" className="mb-4">
            <ShieldCheck className="mr-1 h-3 w-3" />
            Verifiable credential
          </Badge>
          <h1 className="font-heading text-4xl font-bold sm:text-5xl">Certificate verification</h1>
          <p className="mt-4 max-w-2xl text-lg text-white/65">
            This page confirms that the certificate code belongs to a real Robotix Institute course completion record.
          </p>
        </div>
      </section>

      <Section className="py-10">
        <GlassCard className="mx-auto max-w-3xl p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                <CheckCircle2 className="h-4 w-4" />
                Verified
              </div>
              <h2 className="mt-5 font-heading text-3xl font-semibold">{certificate.title}</h2>
              <p className="mt-3 text-white/60">
                Issued to {certificate.user.firstName} {certificate.user.lastName}
              </p>
            </div>
            <div className="rounded-3xl bg-brand-accent/10 p-4 text-brand-accent">
              <Award className="h-10 w-10" />
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-white/40">Certificate code</div>
              <div className="mt-3 font-mono text-sm text-white">{certificate.certCode}</div>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-white/40">Issue date</div>
              <div className="mt-3 text-sm text-white">{formatDate(certificate.issueDate)}</div>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-white/40">Issued by</div>
              <div className="mt-3 text-sm text-white">Robotix Institute</div>
            </div>
          </div>

          <div className="mt-8">
            <Link href="/courses">
              <Button>Explore more courses</Button>
            </Link>
          </div>
        </GlassCard>
      </Section>

      <Footer />
    </main>
  );
}
