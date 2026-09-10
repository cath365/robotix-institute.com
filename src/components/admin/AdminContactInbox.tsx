'use client';

import { useEffect, useMemo, useState } from 'react';
import { Badge, Button, GlassCard, Select, Textarea } from '@/components/ui';
import type { ContactMessage } from '@/lib/firebase';
import { useAuthStore } from '@/store';
import { formatDate } from '@/lib/utils';
import { Inbox, Mail, MessageSquare, Server, UserRound } from 'lucide-react';

type StaffMember = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
};

const followUpStatuses = [
  { value: 'NEW', label: 'New' },
  { value: 'CONTACTED', label: 'Contacted' },
  { value: 'BOOKED', label: 'Booked' },
  { value: 'CLOSED', label: 'Closed' },
];

function getMessageDateValue(value: ContactMessage['createdAt']) {
  if (!value) return null;
  if (typeof value === 'string') return new Date(value);
  if (typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
    return value.toDate();
  }
  return null;
}

function getMessageDateLabel(value: ContactMessage['createdAt']) {
  const date = getMessageDateValue(value);
  return date ? formatDate(date) : 'Unknown date';
}

export default function AdminContactInbox() {
  const token = useAuthStore((state) => state.token);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setLoadError('Admin sign-in is required to load contact messages.');
      return;
    }

    let cancelled = false;

    const loadMessages = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const [messageResponse, staffResponse] = await Promise.all([
          fetch('/api/contact?limit=20', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('/api/team/staff', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        const [messageJson, staffJson] = await Promise.all([
          messageResponse.json(),
          staffResponse.json(),
        ]);
        if (!messageResponse.ok) {
          throw new Error(messageJson?.message || 'Contact inbox could not be loaded.');
        }
        if (!cancelled) {
          setMessages(Array.isArray(messageJson?.data) ? messageJson.data : []);
          setStaff(staffResponse.ok && Array.isArray(staffJson?.data) ? staffJson.data : []);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(error instanceof Error ? error.message : 'Contact inbox could not be loaded.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadMessages();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const summary = useMemo(
    () => ({
      total: messages.length,
      withSubject: messages.filter((message) => message.subject).length,
      today: messages.filter((message) => {
        const sent = getMessageDateValue(message.createdAt);
        if (!sent) return false;
        const now = new Date();
        return (
          sent.getFullYear() === now.getFullYear() &&
          sent.getMonth() === now.getMonth() &&
          sent.getDate() === now.getDate()
        );
      }).length,
    }),
    [messages]
  );

  const updateMessageField = (id: string, updates: Partial<ContactMessage>) => {
    setMessages((current) =>
      current.map((message) => (message.id === id ? { ...message, ...updates } : message))
    );
  };

  const saveFollowUp = async (message: ContactMessage) => {
    if (!token) return;
    setSavingId(message.id);
    setLoadError(null);
    try {
      const response = await fetch('/api/contact', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: message.id,
          status: message.status || 'NEW',
          assignedToId: message.assignedToId || null,
          adminNotes: message.adminNotes || '',
        }),
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json?.message || 'Could not save follow-up details.');
      }
      updateMessageField(message.id, json.data);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Could not save follow-up details.');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: 'Inbox messages', value: summary.total.toString(), icon: Inbox },
          { label: 'With subject line', value: summary.withSubject.toString(), icon: Mail },
          { label: 'Received today', value: summary.today.toString(), icon: MessageSquare },
        ].map((item) => (
          <GlassCard key={item.label} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="rounded-2xl bg-brand-accent/10 p-3 text-brand-accent">
                <item.icon className="h-5 w-5" />
              </div>
              <Badge variant="primary" className="text-[10px] uppercase tracking-[0.2em]">
                Server
              </Badge>
            </div>
            <div className="mt-5 text-3xl font-bold">{item.value}</div>
            <div className="mt-2 text-sm font-medium text-white/80">{item.label}</div>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <Badge variant="accent" className="mb-3">
              <UserRound className="mr-1 h-3 w-3" />
              Contact Inbox
            </Badge>
            <h3 className="font-heading text-2xl font-semibold">Messages sent from the public website</h3>
            <p className="mt-3 text-sm leading-6 text-white/60">
              Families, schools, partners, and media contacts now land in the shared server inbox for consistent admin follow-up.
            </p>
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-white/60">
            <span className="inline-flex items-center gap-2">
              <Server className="h-4 w-4 text-brand-secondary" />
              Server-backed capture active
            </span>
          </div>
        </div>

        {loadError ? (
          <div className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
            {loadError}
          </div>
        ) : null}

        {loading ? (
          <div className="mt-6 rounded-2xl border border-white/8 bg-white/[0.03] p-5 text-sm text-white/58">
            Loading contact inbox...
          </div>
        ) : null}

        {!loading && messages.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-white/8 bg-white/[0.03] p-5 text-sm leading-6 text-white/58">
            No website contact messages have been received yet.
          </div>
        ) : null}

        {!loading && messages.length > 0 ? (
          <div className="mt-6 grid gap-4 xl:grid-cols-2">
            {messages.map((message) => (
              <GlassCard key={message.id} className="p-5 school-lift">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-[0.24em] text-brand-secondary">Inbox message</div>
                    <h4 className="mt-2 font-heading text-xl font-semibold">{message.name}</h4>
                    <p className="mt-1 text-sm text-white/55">{message.email}</p>
                  </div>
                  <Badge variant="primary" className="text-[10px] uppercase tracking-[0.2em]">
                    {message.status}
                  </Badge>
                </div>

                <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm leading-6 text-white/62">
                  <div className="mb-2 text-white">
                    <span className="font-semibold">Subject:</span> {message.subject || 'General enquiry'}
                  </div>
                  <p>{message.message}</p>
                </div>

                <div className="mt-4 rounded-2xl border border-brand-secondary/15 bg-brand-secondary/8 p-4">
                  <div className="mb-3 text-sm font-semibold text-white">Follow-up workflow</div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Select
                      label="Status"
                      value={message.status || 'NEW'}
                      onChange={(event) => updateMessageField(message.id, { status: event.target.value })}
                      options={followUpStatuses}
                    />
                    <Select
                      label="Assigned staff"
                      value={message.assignedToId || ''}
                      onChange={(event) => updateMessageField(message.id, { assignedToId: event.target.value || null })}
                      options={[
                        { value: '', label: 'Unassigned' },
                        ...staff.map((member) => ({
                          value: member.id,
                          label: `${member.firstName} ${member.lastName} (${member.role})`,
                        })),
                      ]}
                    />
                  </div>
                  <Textarea
                    label="Private admin notes"
                    value={message.adminNotes || ''}
                    onChange={(event) => updateMessageField(message.id, { adminNotes: event.target.value })}
                    placeholder="Add call notes, next steps, pricing discussed, or follow-up reminders..."
                    className="mt-3"
                  />
                  {message.assignedTo ? (
                    <div className="mt-3 text-xs text-white/48">
                      Assigned to {message.assignedTo.firstName} {message.assignedTo.lastName}
                    </div>
                  ) : null}
                  <Button
                    size="sm"
                    className="mt-3"
                    loading={savingId === message.id}
                    onClick={() => saveFollowUp(message)}
                  >
                    Save follow-up
                  </Button>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-white/45">
                  <span>Received: {getMessageDateLabel(message.createdAt)}</span>
                  <Button
                    size="sm"
                    onClick={() => {
                      window.location.href = `mailto:${message.email}?subject=${encodeURIComponent(message.subject || 'Robotix Institute reply')}`;
                    }}
                  >
                    Reply by email
                  </Button>
                </div>
              </GlassCard>
            ))}
          </div>
        ) : null}
      </GlassCard>
    </div>
  );
}
