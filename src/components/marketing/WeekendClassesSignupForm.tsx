'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Badge, Button, GlassCard, Input, Select, Textarea } from '@/components/ui';
import { CheckCircle2, Mail, Phone, UserRound } from 'lucide-react';

const trackOptions = [
  { value: '', label: 'Select a learning track' },
  { value: 'robotics-foundations', label: 'Robotics Foundations' },
  { value: 'coding-and-games', label: 'Coding and Game Creation' },
  { value: 'python-and-advanced-builds', label: 'Python and Advanced Builds' },
  { value: 'not-sure-yet', label: 'Not sure yet' },
];

const scheduleOptions = [
  { value: '', label: 'Select a preferred schedule' },
  { value: 'saturday-morning', label: 'Saturday morning' },
  { value: 'saturday-afternoon', label: 'Saturday afternoon' },
  { value: 'weekend-flexible', label: 'Any weekend slot' },
  { value: 'after-school-flexible', label: 'After-school / flexible' },
];

const initialForm = {
  parentName: '',
  parentEmail: '',
  parentPhone: '',
  childName: '',
  childAge: '',
  childSchool: '',
  preferredTrack: '',
  preferredSchedule: '',
  notes: '',
};

export default function WeekendClassesSignupForm() {
  const [form, setForm] = useState(initialForm);
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const updateField = (field: keyof typeof initialForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !form.parentName ||
      !form.parentEmail ||
      !form.parentPhone ||
      !form.childName ||
      !form.childAge ||
      !form.preferredTrack ||
      !form.preferredSchedule
    ) {
      toast.error('Please fill in the parent, child, and schedule details first.');
      return;
    }

    setSending(true);

    try {
      const response = await fetch('/api/weekend-class-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.message || 'Could not save the sign-up right now.');
      }

      setSubmitted(true);
      setForm(initialForm);
      toast.success("Weekend sign-up saved. Robotix can now review your child's interest.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not save the sign-up right now.');
    } finally {
      setSending(false);
    }
  };

  return (
    <GlassCard className="p-6 shine-effect">
      <Badge variant="accent" className="mb-3">
        <UserRound className="mr-1 h-3 w-3" />
        Kid Sign-Up
      </Badge>
      <h2 className="font-heading text-3xl font-bold">Register your child&apos;s interest in weekend classes</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60">
        Share your child&apos;s age, school, and preferred track so Robotix can understand what kind of weekend STEM path
        may fit best.
      </p>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm leading-6 text-white/62">
          <div className="font-semibold text-white">Public hours</div>
          <div className="mt-1">Saturday to Wednesday, 10AM to 7PM</div>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm leading-6 text-white/62">
          <div className="font-semibold text-white">Best for</div>
          <div className="mt-1">Parents looking for structured weekend STEM learning in Lusaka</div>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm leading-6 text-white/62">
          <div className="font-semibold text-white">Submission mode</div>
          <div className="mt-1">Secure server capture</div>
        </div>
      </div>

      {submitted ? (
        <div className="mt-6 rounded-3xl border border-brand-secondary/20 bg-brand-secondary/10 p-5">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 text-brand-secondary" />
            <div>
              <div className="font-semibold text-white">Interest registered</div>
              <p className="mt-2 text-sm leading-6 text-white/68">
                Your child&apos;s weekend-class interest has been captured. The next step is to contact Robotix directly
                so you can confirm the current schedule, age fit, and available slots.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Parent / guardian name"
            value={form.parentName}
            onChange={(e) => updateField('parentName', e.target.value)}
            placeholder="Your full name"
            required
            icon={<UserRound className="h-4 w-4" />}
          />
          <Input
            label="Parent email"
            type="email"
            value={form.parentEmail}
            onChange={(e) => updateField('parentEmail', e.target.value)}
            placeholder="you@example.com"
            required
            icon={<Mail className="h-4 w-4" />}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Parent phone"
            value={form.parentPhone}
            onChange={(e) => updateField('parentPhone', e.target.value)}
            placeholder="+260..."
            required
            icon={<Phone className="h-4 w-4" />}
          />
          <Input
            label="Child name"
            value={form.childName}
            onChange={(e) => updateField('childName', e.target.value)}
            placeholder="Child's name"
            required
            icon={<UserRound className="h-4 w-4" />}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Input
            label="Child age"
            value={form.childAge}
            onChange={(e) => updateField('childAge', e.target.value)}
            placeholder="e.g. 9"
            required
          />
          <Input
            label="Current school"
            value={form.childSchool}
            onChange={(e) => updateField('childSchool', e.target.value)}
            placeholder="Optional but helpful"
          />
          <Select
            label="Preferred schedule"
            value={form.preferredSchedule}
            onChange={(e) => updateField('preferredSchedule', e.target.value)}
            options={scheduleOptions}
            required
          />
        </div>

        <Select
          label="Preferred learning track"
          value={form.preferredTrack}
          onChange={(e) => updateField('preferredTrack', e.target.value)}
          options={trackOptions}
          required
        />

        <Textarea
          label="Anything Robotix should know?"
          value={form.notes}
          onChange={(e) => updateField('notes', e.target.value)}
          placeholder="Share what your child enjoys, their experience level, or what you hope they gain from weekend classes."
        />

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" loading={sending}>
            Sign up my child
          </Button>
          <span className="text-sm text-white/50">Submissions are saved to the Robotix backend for admin follow-up.</span>
        </div>
      </form>
    </GlassCard>
  );
}
