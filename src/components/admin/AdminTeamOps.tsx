'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Badge, Button, GlassCard, Input, Select, Textarea } from '@/components/ui';
import { useAuthStore } from '@/store';
import { CalendarDays, Copy, MailPlus, MapPin, Trash2, UserPlus } from 'lucide-react';

type StaffMember = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
};

type Invite = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  expiresAt: string;
  acceptedAt?: string | null;
};

type TimetableEntry = {
  id: string;
  duty?: string | null;
  location?: string | null;
  description?: string | null;
  startsAt: string;
  endsAt: string;
  assignedTo?: StaffMember | null;
};

const roleOptions = [
  { value: 'INSTRUCTOR', label: 'Instructor' },
  { value: 'ACCOUNTANT', label: 'Accounts personnel' },
];

const emptyInvite = {
  firstName: '',
  lastName: '',
  email: '',
  role: 'INSTRUCTOR',
};

const emptyTimetable = {
  assignedToId: '',
  duty: '',
  location: '',
  startsAt: '',
  endsAt: '',
  description: '',
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export default function AdminTeamOps() {
  const token = useAuthStore((state) => state.token);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [inviteForm, setInviteForm] = useState(emptyInvite);
  const [timetableForm, setTimetableForm] = useState(emptyTimetable);
  const [latestInviteUrl, setLatestInviteUrl] = useState('');
  const [latestInviteExpiresAt, setLatestInviteExpiresAt] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingInvite, setSavingInvite] = useState(false);
  const [savingTimetable, setSavingTimetable] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [staffRes, inviteRes, timetableRes] = await Promise.all([
        fetch('/api/team/staff', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/team/invites', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/team/timetable', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const [staffJson, inviteJson, timetableJson] = await Promise.all([
        staffRes.json(),
        inviteRes.json(),
        timetableRes.json(),
      ]);
      if (!staffRes.ok) throw new Error(staffJson?.message || 'Staff could not be loaded.');
      setStaff(Array.isArray(staffJson.data) ? staffJson.data : []);
      setInvites(inviteRes.ok && Array.isArray(inviteJson.data) ? inviteJson.data : []);
      setEntries(timetableRes.ok && Array.isArray(timetableJson.data) ? timetableJson.data : []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Team operations could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const createInvite = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;
    setSavingInvite(true);
    setError(null);
    try {
      const response = await fetch('/api/team/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(inviteForm),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json?.message || 'Invite could not be created.');
      setInvites((current) => [json.data.invite, ...current]);
      setLatestInviteUrl(json.data.inviteUrl || '');
      setLatestInviteExpiresAt(json.data.invite?.expiresAt || '');
      setInviteForm(emptyInvite);
    } catch (inviteError) {
      setError(inviteError instanceof Error ? inviteError.message : 'Invite could not be created.');
    } finally {
      setSavingInvite(false);
    }
  };

  const createTimetable = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;
    setSavingTimetable(true);
    setError(null);
    try {
      const response = await fetch('/api/team/timetable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...timetableForm,
          startsAt: new Date(timetableForm.startsAt).toISOString(),
          endsAt: new Date(timetableForm.endsAt).toISOString(),
        }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json?.message || 'Timetable entry could not be created.');
      setEntries((current) => [...current, json.data].sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()));
      setTimetableForm(emptyTimetable);
    } catch (timetableError) {
      setError(timetableError instanceof Error ? timetableError.message : 'Timetable entry could not be created.');
    } finally {
      setSavingTimetable(false);
    }
  };

  const deleteInvite = async (inviteId: string) => {
    if (!token) return;
    setError(null);
    try {
      const response = await fetch(`/api/team/invites?id=${encodeURIComponent(inviteId)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json?.message || 'Invite could not be removed.');
      setInvites((current) => current.filter((invite) => invite.id !== inviteId));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Invite could not be removed.');
    }
  };

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <GlassCard className="p-6">
          <Badge variant="accent" className="mb-4">
            <UserPlus className="mr-1 h-3 w-3" />
            Invite Team Members
          </Badge>
          <h2 className="font-heading text-2xl font-semibold">Invite staff by email</h2>
          <p className="mt-2 text-sm leading-6 text-white/60">
            Create secure invite links for instructors and accounts personnel.
          </p>
          <form onSubmit={createInvite} className="mt-5 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="First name" value={inviteForm.firstName} onChange={(event) => setInviteForm((current) => ({ ...current, firstName: event.target.value }))} required />
              <Input label="Last name" value={inviteForm.lastName} onChange={(event) => setInviteForm((current) => ({ ...current, lastName: event.target.value }))} required />
            </div>
            <Input label="Email" type="email" value={inviteForm.email} onChange={(event) => setInviteForm((current) => ({ ...current, email: event.target.value }))} required />
            <Select label="Role" value={inviteForm.role} onChange={(event) => setInviteForm((current) => ({ ...current, role: event.target.value }))} options={roleOptions} />
            <Button type="submit" icon={<MailPlus className="h-4 w-4" />} loading={savingInvite}>
              Create invitation
            </Button>
          </form>

          {latestInviteUrl ? (
            <div className="mt-5 rounded-2xl border border-brand-secondary/20 bg-brand-secondary/10 p-4">
              <div className="text-sm font-semibold text-white">Latest invite link</div>
              <p className="mt-1 text-xs text-brand-secondary">
                Expires in 2 hours{latestInviteExpiresAt ? `, at ${formatDateTime(latestInviteExpiresAt)}` : ''}.
              </p>
              <p className="mt-2 break-all text-xs leading-5 text-white/60">{latestInviteUrl}</p>
              <Button type="button" size="sm" variant="secondary" className="mt-3" icon={<Copy className="h-4 w-4" />} onClick={() => navigator.clipboard?.writeText(latestInviteUrl)}>
                Copy link
              </Button>
            </div>
          ) : null}
        </GlassCard>

        <GlassCard className="p-6">
          <Badge variant="accent" className="mb-4">
            <CalendarDays className="mr-1 h-3 w-3" />
            Team Timetable
          </Badge>
          <h2 className="font-heading text-2xl font-semibold">Create duty schedule</h2>
          <p className="mt-2 text-sm leading-6 text-white/60">
            Assign who should be where, what they should do, and when.
          </p>
          <form onSubmit={createTimetable} className="mt-5 space-y-4">
            <Select
              label="Team member"
              value={timetableForm.assignedToId}
              onChange={(event) => setTimetableForm((current) => ({ ...current, assignedToId: event.target.value }))}
              options={[
                { value: '', label: loading ? 'Loading staff...' : 'Choose staff member' },
                ...staff.map((member) => ({ value: member.id, label: `${member.firstName} ${member.lastName} (${member.role})` })),
              ]}
              required
            />
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Duty" value={timetableForm.duty} onChange={(event) => setTimetableForm((current) => ({ ...current, duty: event.target.value }))} placeholder="Teach robotics / reception / follow-up calls" required />
              <Input label="Location" value={timetableForm.location} onChange={(event) => setTimetableForm((current) => ({ ...current, location: event.target.value }))} placeholder="Lab 1, school visit, front desk" required />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Starts" type="datetime-local" value={timetableForm.startsAt} onChange={(event) => setTimetableForm((current) => ({ ...current, startsAt: event.target.value }))} required />
              <Input label="Ends" type="datetime-local" value={timetableForm.endsAt} onChange={(event) => setTimetableForm((current) => ({ ...current, endsAt: event.target.value }))} required />
            </div>
            <Textarea label="Notes" value={timetableForm.description} onChange={(event) => setTimetableForm((current) => ({ ...current, description: event.target.value }))} placeholder="Any preparation notes for this duty..." />
            <Button type="submit" icon={<MapPin className="h-4 w-4" />} loading={savingTimetable}>
              Add timetable duty
            </Button>
          </form>
        </GlassCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard className="p-6">
          <h3 className="font-heading text-xl font-semibold">Recent invites</h3>
          <div className="mt-4 space-y-3">
            {invites.length === 0 ? <p className="text-sm text-white/55">No team invites yet.</p> : null}
            {invites.map((invite) => (
              <div key={invite.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-white">{invite.firstName} {invite.lastName}</div>
                    <div className="text-xs text-white/50">{invite.email}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={invite.acceptedAt ? 'success' : 'primary'}>{invite.acceptedAt ? 'Accepted' : invite.role}</Badge>
                    {!invite.acceptedAt ? (
                      <button
                        type="button"
                        onClick={() => deleteInvite(invite.id)}
                        className="rounded-lg border border-white/10 p-2 text-white/45 transition hover:border-red-300/30 hover:bg-red-400/10 hover:text-red-100"
                        title="Remove pending invite"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="font-heading text-xl font-semibold">Upcoming duties</h3>
          <div className="mt-4 space-y-3">
            {entries.length === 0 ? <p className="text-sm text-white/55">No timetable duties yet.</p> : null}
            {entries.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-brand-secondary">{formatDateTime(entry.startsAt)}</div>
                <div className="mt-2 text-sm font-semibold text-white">
                  {entry.assignedTo ? `${entry.assignedTo.firstName} ${entry.assignedTo.lastName}` : 'Unassigned'}
                </div>
                <div className="mt-1 text-sm text-white/65">{entry.duty}</div>
                <div className="mt-1 text-xs text-white/45">{entry.location} | until {formatDateTime(entry.endsAt)}</div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
