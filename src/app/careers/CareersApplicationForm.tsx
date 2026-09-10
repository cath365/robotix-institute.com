'use client';

import { FormEvent, useState } from 'react';
import { Badge, Button, GlassCard, Input, Select, Textarea } from '@/components/ui';
import { CheckCircle2, Send } from 'lucide-react';

const roleOptions = [
  { value: 'Robotics instructor', label: 'Robotics instructor' },
  { value: 'Coding instructor', label: 'Coding instructor' },
  { value: 'Program assistant', label: 'Program assistant' },
  { value: 'School outreach', label: 'School outreach' },
  { value: 'Operations or admin', label: 'Operations or admin' },
  { value: 'Internship', label: 'Internship' },
];

export default function CareersApplicationForm() {
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submitApplication = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);
    setError(null);

    const form = new FormData(event.currentTarget);
    const name = String(form.get('name') || '');
    const email = String(form.get('email') || '');
    const role = String(form.get('role') || '');
    const phone = String(form.get('phone') || '');
    const experience = String(form.get('experience') || '');
    const availability = String(form.get('availability') || '');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          subject: `Career application: ${role}`,
          message: `Role interest: ${role}\nPhone: ${phone}\nAvailability: ${availability}\n\nExperience:\n${experience}`,
        }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json?.message || 'Application could not be sent.');
      event.currentTarget.reset();
      setMessage('Application sent. Robotix admin will review it from the messages inbox.');
    } catch (applicationError) {
      setError(applicationError instanceof Error ? applicationError.message : 'Application could not be sent.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <GlassCard className="p-6">
      <Badge variant="accent" className="mb-4">
        Apply
      </Badge>
      <h2 className="font-heading text-2xl font-semibold text-white">Join the Robotix teaching team</h2>
      <p className="mt-2 text-sm leading-6 text-white/60">
        If a matching role opens, this application gives Robotix your details for follow-up.
      </p>

      <form onSubmit={submitApplication} className="mt-6 space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Input name="name" label="Full name" required placeholder="Your name" />
          <Input name="email" label="Email" type="email" required placeholder="you@example.com" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Input name="phone" label="Phone" required placeholder="+260..." />
          <Select name="role" label="Role interest" options={roleOptions} required />
        </div>
        <Input name="availability" label="Availability" placeholder="Weekends, full-time, part-time, internship..." />
        <Textarea
          name="experience"
          label="Why do you want to work with Robotix?"
          required
          placeholder="Tell us about your teaching, robotics, coding, school, or operations experience..."
        />

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

        <Button type="submit" icon={<Send className="h-4 w-4" />} loading={submitting}>
          Send application
        </Button>
      </form>
    </GlassCard>
  );
}
