'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { Badge, Button, GlassCard, Input, Select, Textarea } from '@/components/ui';
import { robotixProfile } from '@/lib/robotix-profile';
import { ArrowLeft, CheckCircle2, CreditCard, FileUp, Phone, ShieldCheck } from 'lucide-react';

const paymentMethods = [
  { value: 'MTN Mobile Money', label: 'MTN Mobile Money' },
  { value: 'Airtel Money', label: 'Airtel Money' },
  { value: 'Zamtel Money', label: 'Zamtel Money' },
  { value: 'Bank transfer', label: 'Bank transfer' },
  { value: 'Cash', label: 'Cash' },
];

export default function PaymentProofForm() {
  const paymentContacts = robotixProfile.contacts.filter((contact) => contact.href.startsWith('tel:'));
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);
    setError(null);

    try {
      const formData = new FormData(event.currentTarget);
      const response = await fetch('/api/payment-proofs', {
        method: 'POST',
        body: formData,
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json?.message || 'Payment proof could not be submitted.');

      event.currentTarget.reset();
      setMessage('Payment proof sent. Accounts will review it and update the payment record.');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Payment proof could not be submitted.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
      <div className="space-y-5">
        <Link href="/courses" className="inline-flex items-center gap-2 text-sm text-white/55 transition hover:text-brand-secondary">
          <ArrowLeft className="h-4 w-4" />
          Back to courses
        </Link>

        <div>
          <Badge variant="accent" className="mb-4">
            <CreditCard className="mr-1 h-3 w-3" />
            Payment Proof
          </Badge>
          <h1 className="font-heading text-4xl font-bold leading-tight text-white md:text-5xl">
            Pay by mobile money, then send the receipt to accounts.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/62">
            Use one of the Robotix public payment/contact numbers below, then upload a screenshot, photo, PDF, or transaction reference.
          </p>
        </div>

        <GlassCard className="p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-brand-secondary/10 p-3 text-brand-secondary">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-heading text-xl font-semibold text-white">Mobile payment numbers</h2>
              <p className="text-xs text-white/45">Confirm the payment name with Robotix if needed.</p>
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            {paymentContacts.map((contact) => (
              <a
                key={contact.value}
                href={contact.href}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:border-brand-secondary/35 hover:bg-brand-secondary/10"
              >
                <div className="text-xs uppercase tracking-[0.2em] text-white/38">{contact.label}</div>
                <div className="mt-1 font-heading text-2xl font-semibold text-white">{contact.value}</div>
              </a>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex gap-3">
            <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-brand-accent" />
            <p className="text-sm leading-6 text-white/62">
              Proofs go into the protected accounts panel. Account staff review the payment before marking it verified or paid.
            </p>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-brand-accent/10 p-3 text-brand-accent">
            <FileUp className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-heading text-2xl font-semibold text-white">Submit payment proof</h2>
            <p className="text-sm text-white/48">Receipt photos, screenshots, and PDFs up to 4MB are accepted.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input name="parentName" label="Parent or payer name" required placeholder="Full name" />
          <div className="grid gap-4 md:grid-cols-2">
            <Input name="parentEmail" label="Email" type="email" required placeholder="parent@example.com" />
            <Input name="parentPhone" label="Phone" required placeholder="+260..." />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input name="amount" label="Amount paid (ZMW)" type="number" min="1" step="0.01" required placeholder="450" />
            <Select name="method" label="Payment method" options={paymentMethods} required />
          </div>
          <Input name="reference" label="Transaction reference" placeholder="Mobile money transaction ID" />
          <Input name="orderId" label="Order ID, if you have one" placeholder="Optional" />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-white/70">Receipt screenshot/photo or PDF</label>
            <input
              name="proof"
              type="file"
              accept="image/png,image/jpeg,image/webp,application/pdf"
              className="input-field cursor-pointer file:mr-4 file:rounded-full file:border-0 file:bg-brand-secondary/15 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-secondary"
            />
          </div>
          <Textarea name="note" label="Short note" placeholder="Example: Paid for Arduino starter kit / weekend class deposit..." />

          {message ? (
            <div className="flex items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
              <CheckCircle2 className="h-4 w-4" />
              {message}
            </div>
          ) : null}
          {error ? (
            <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
              {error}
            </div>
          ) : null}

          <Button type="submit" loading={submitting} className="w-full justify-center">
            Send proof to accounts
          </Button>
        </form>
      </GlassCard>
    </div>
  );
}
