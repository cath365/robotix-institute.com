'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Badge, Button, GlassCard, Input, Select, Textarea } from '@/components/ui';
import { useAuthStore } from '@/store';
import { CalendarDays, ClipboardList, Clock, LockKeyhole, MailCheck, MessageCircle, RefreshCw, Send, UsersRound } from 'lucide-react';

type TeamUser = {
  id: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'ACCOUNTANT' | 'INSTRUCTOR' | 'STUDENT' | 'GUEST';
  avatar?: string | null;
};

type TeamMessage = {
  id: string;
  body: string;
  createdAt: string;
  user: TeamUser;
};

type TeamEvent = {
  id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  startsAt: string;
  endsAt: string;
  createdBy: TeamUser;
};

type TeamRequest = {
  id: string;
  title: string;
  details: string;
  priority: 'LOW' | 'NORMAL' | 'URGENT';
  status: 'OPEN' | 'REVIEWING' | 'APPROVED' | 'DONE' | 'REJECTED';
  response?: string | null;
  createdAt: string;
  user: TeamUser & { email: string };
};

const emptyEventForm = {
  title: '',
  description: '',
  location: '',
  startsAt: '',
  endsAt: '',
};

const emptyRequestForm = {
  title: '',
  details: '',
  priority: 'NORMAL',
};

const priorityOptions = [
  { value: 'LOW', label: 'Low' },
  { value: 'NORMAL', label: 'Normal' },
  { value: 'URGENT', label: 'Urgent' },
];

const requestStatusOptions = [
  { value: 'OPEN', label: 'Open' },
  { value: 'REVIEWING', label: 'Reviewing' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'DONE', label: 'Done' },
  { value: 'REJECTED', label: 'Rejected' },
];

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function initials(user?: Pick<TeamUser, 'firstName' | 'lastName'> | null) {
  return `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}` || 'RI';
}

function toIsoDateTimeLocal(value: string) {
  if (!value) return '';
  return new Date(value).toISOString();
}

export default function TeamWorkspaceClient() {
  const { isAuthenticated, token, user } = useAuthStore();
  const [messages, setMessages] = useState<TeamMessage[]>([]);
  const [events, setEvents] = useState<TeamEvent[]>([]);
  const [requests, setRequests] = useState<TeamRequest[]>([]);
  const [messageBody, setMessageBody] = useState('');
  const [eventForm, setEventForm] = useState(emptyEventForm);
  const [requestForm, setRequestForm] = useState(emptyRequestForm);
  const [loading, setLoading] = useState(true);
  const [savingMessage, setSavingMessage] = useState(false);
  const [savingEvent, setSavingEvent] = useState(false);
  const [savingRequest, setSavingRequest] = useState(false);
  const [savingRequestId, setSavingRequestId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isTeamMember = user?.role === 'ADMIN' || user?.role === 'ACCOUNTANT' || user?.role === 'INSTRUCTOR';

  const upcomingToday = useMemo(
    () =>
      events.filter((event) => {
        const startsAt = new Date(event.startsAt);
        const now = new Date();
        return (
          startsAt.getFullYear() === now.getFullYear() &&
          startsAt.getMonth() === now.getMonth() &&
          startsAt.getDate() === now.getDate()
        );
      }).length,
    [events]
  );

  const loadWorkspace = async () => {
    if (!token || !isTeamMember) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [messageResponse, eventResponse, requestResponse] = await Promise.all([
        fetch('/api/team/messages?limit=40', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/team/events', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/team/requests', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const [messageJson, eventJson, requestJson] = await Promise.all([
        messageResponse.json(),
        eventResponse.json(),
        requestResponse.json(),
      ]);

      if (!messageResponse.ok) throw new Error(messageJson?.message || 'Team chat could not be loaded.');
      if (!eventResponse.ok) throw new Error(eventJson?.message || 'Team calendar could not be loaded.');
      if (!requestResponse.ok) throw new Error(requestJson?.message || 'Team requests could not be loaded.');

      setMessages(Array.isArray(messageJson?.data) ? messageJson.data : []);
      setEvents(Array.isArray(eventJson?.data) ? eventJson.data : []);
      setRequests(Array.isArray(requestJson?.data) ? requestJson.data : []);
    } catch (workspaceError) {
      setError(workspaceError instanceof Error ? workspaceError.message : 'Team workspace could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspace();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, isTeamMember]);

  const postMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token || !messageBody.trim()) return;

    setSavingMessage(true);
    setError(null);
    try {
      const response = await fetch('/api/team/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ body: messageBody }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json?.message || 'Message could not be posted.');
      setMessages((current) => [...current, json.data]);
      setMessageBody('');
    } catch (messageError) {
      setError(messageError instanceof Error ? messageError.message : 'Message could not be posted.');
    } finally {
      setSavingMessage(false);
    }
  };

  const createEvent = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;

    setSavingEvent(true);
    setError(null);
    try {
      const response = await fetch('/api/team/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...eventForm,
          startsAt: toIsoDateTimeLocal(eventForm.startsAt),
          endsAt: toIsoDateTimeLocal(eventForm.endsAt),
        }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json?.message || 'Calendar event could not be created.');
      setEvents((current) => [...current, json.data].sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()));
      setEventForm(emptyEventForm);
    } catch (eventError) {
      setError(eventError instanceof Error ? eventError.message : 'Calendar event could not be created.');
    } finally {
      setSavingEvent(false);
    }
  };

  const createRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;

    setSavingRequest(true);
    setError(null);
    try {
      const response = await fetch('/api/team/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestForm),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json?.message || 'Request could not be sent.');
      setRequests((current) => [json.data, ...current]);
      setRequestForm(emptyRequestForm);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Request could not be sent.');
    } finally {
      setSavingRequest(false);
    }
  };

  const updateRequestStatus = async (requestId: string, status: string, responseText = '') => {
    if (!token || user?.role !== 'ADMIN') return;

    setSavingRequestId(requestId);
    setError(null);
    try {
      const response = await fetch('/api/team/requests', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ requestId, status, response: responseText }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json?.message || 'Request could not be updated.');
      setRequests((current) => current.map((request) => (request.id === requestId ? json.data : request)));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Request could not be updated.');
    } finally {
      setSavingRequestId(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <GlassCard className="p-8 text-center">
        <LockKeyhole className="mx-auto h-10 w-10 text-brand-secondary" />
        <h1 className="mt-5 font-heading text-3xl font-bold text-white">Team login required</h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-white/62">
          Sign in with an admin or instructor account to open the internal team chat and calendar.
        </p>
        <Link href="/login?next=/team" className="mt-6 inline-flex">
          <Button>Sign in to team workspace</Button>
        </Link>
      </GlassCard>
    );
  }

  if (!isTeamMember) {
    return (
      <GlassCard className="p-8 text-center">
        <LockKeyhole className="mx-auto h-10 w-10 text-brand-secondary" />
        <h1 className="mt-5 font-heading text-3xl font-bold text-white">Staff access only</h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-white/62">
          This workspace is for Robotix administrators, instructors, and accounts staff. Student accounts stay focused on learning tools.
        </p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: 'Team messages', value: messages.length.toString(), icon: MessageCircle },
          { label: 'Calendar events', value: events.length.toString(), icon: CalendarDays },
          { label: 'Team requests', value: requests.length.toString(), icon: ClipboardList },
        ].map((item) => (
          <GlassCard key={item.label} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="rounded-2xl bg-brand-secondary/10 p-3 text-brand-secondary">
                <item.icon className="h-5 w-5" />
              </div>
              <Badge variant="primary" className="text-[10px] uppercase tracking-[0.2em]">
                Staff
              </Badge>
            </div>
            <div className="mt-5 text-3xl font-bold text-white">{item.value}</div>
            <div className="mt-2 text-sm font-medium text-white/75">{item.label}</div>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="overflow-hidden p-0">
        <div className="border-b border-white/10 bg-white/[0.04] p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <Badge variant="accent" className="mb-3">
                <UsersRound className="mr-1 h-3 w-3" />
                Team Workspace
              </Badge>
              <h1 className="font-heading text-3xl font-bold text-white">Internal chat and follow-up calendar</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-white/62">
                Coordinate parent follow-ups, classes, school visits, and admin tasks in one staff-only area.
              </p>
            </div>
            <Button variant="secondary" icon={<RefreshCw className="h-4 w-4" />} onClick={loadWorkspace} loading={loading}>
              Refresh
            </Button>
          </div>
          {error ? (
            <div className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
              {error}
            </div>
          ) : null}
        </div>

        <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
          <div id="chat" className="scroll-mt-24 border-white/10 p-6 lg:border-r">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-heading text-2xl font-semibold text-white">Team chat</h2>
                <p className="mt-2 text-sm text-white/55">Quick internal notes for the Robotix team.</p>
              </div>
              <MessageCircle className="h-6 w-6 text-brand-secondary" />
            </div>

            <div className="mt-5 max-h-[460px] space-y-3 overflow-y-auto rounded-3xl border border-white/8 bg-brand-dark/35 p-4">
              {loading ? (
                <div className="text-sm text-white/50">Loading team messages...</div>
              ) : null}
              {!loading && messages.length === 0 ? (
                <div className="text-sm text-white/50">No team messages yet. Start the first one.</div>
              ) : null}
              {messages.map((message) => (
                <div key={message.id} className="rounded-2xl border border-white/8 bg-white/[0.04] p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-secondary text-xs font-bold text-brand-dark">
                      {initials(message.user)}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">
                        {message.user.firstName} {message.user.lastName}
                      </div>
                      <div className="text-xs text-white/42">{formatDateTime(message.createdAt)}</div>
                    </div>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-white/68">{message.body}</p>
                </div>
              ))}
            </div>

            <form onSubmit={postMessage} className="mt-4 space-y-3">
              <Textarea
                label="New team message"
                value={messageBody}
                onChange={(event) => setMessageBody(event.target.value)}
                placeholder="Share a follow-up note, class update, or task for the team..."
                required
              />
              <Button type="submit" icon={<Send className="h-4 w-4" />} loading={savingMessage}>
                Post message
              </Button>
            </form>
          </div>

          <div id="calendar" className="scroll-mt-24 p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-heading text-2xl font-semibold text-white">Team calendar</h2>
                <p className="mt-2 text-sm text-white/55">Track follow-ups, demos, meetings, and class schedules.</p>
              </div>
              <CalendarDays className="h-6 w-6 text-brand-secondary" />
            </div>

            <form onSubmit={createEvent} className="mt-5 space-y-4 rounded-3xl border border-white/8 bg-white/[0.03] p-4">
              <Input
                label="Event title"
                value={eventForm.title}
                onChange={(event) => setEventForm((current) => ({ ...current, title: event.target.value }))}
                placeholder="Follow up with parent / Saturday robotics class"
                required
              />
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="Starts"
                  type="datetime-local"
                  value={eventForm.startsAt}
                  onChange={(event) => setEventForm((current) => ({ ...current, startsAt: event.target.value }))}
                  required
                />
                <Input
                  label="Ends"
                  type="datetime-local"
                  value={eventForm.endsAt}
                  onChange={(event) => setEventForm((current) => ({ ...current, endsAt: event.target.value }))}
                  required
                />
              </div>
              <Input
                label="Location"
                value={eventForm.location}
                onChange={(event) => setEventForm((current) => ({ ...current, location: event.target.value }))}
                placeholder="Robotix Institute, school, call, or online"
              />
              <Textarea
                label="Details"
                value={eventForm.description}
                onChange={(event) => setEventForm((current) => ({ ...current, description: event.target.value }))}
                placeholder="What should the team know before this event?"
              />
              <Button type="submit" icon={<MailCheck className="h-4 w-4" />} loading={savingEvent}>
                Add calendar event
              </Button>
            </form>

            <div className="mt-5 space-y-3">
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <div className="flex items-center justify-between text-sm text-white/65">
                  <span>Events today</span>
                  <span className="font-semibold text-white">{upcomingToday}</span>
                </div>
              </div>
              {loading ? <div className="text-sm text-white/50">Loading calendar...</div> : null}
              {!loading && events.length === 0 ? (
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm text-white/50">
                  No team calendar events yet.
                </div>
              ) : null}
              {events.map((event) => (
                <div key={event.id} className="rounded-2xl border border-white/8 bg-white/[0.04] p-4">
                  <div className="text-xs uppercase tracking-[0.22em] text-brand-secondary">
                    {formatDateTime(event.startsAt)}
                  </div>
                  <h3 className="mt-2 font-heading text-xl font-semibold text-white">{event.title}</h3>
                  <p className="mt-2 text-sm text-white/58">
                    Until {formatDateTime(event.endsAt)}
                    {event.location ? ` - ${event.location}` : ''}
                  </p>
                  {event.description ? (
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-white/65">{event.description}</p>
                  ) : null}
                  <div className="mt-3 text-xs text-white/40">
                    Added by {event.createdBy.firstName} {event.createdBy.lastName}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>

      <div id="requests" className="scroll-mt-24">
      <GlassCard className="overflow-hidden p-0">
        <div className="border-b border-white/10 bg-white/[0.04] p-6">
          <Badge variant="accent" className="mb-3">
            <ClipboardList className="mr-1 h-3 w-3" />
            Company Requests
          </Badge>
          <h2 className="font-heading text-3xl font-bold text-white">Ask admin for what the team needs.</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-white/62">
            Staff can request teaching materials, kits, maintenance, transport, class support, or anything needed for Robotix operations.
          </p>
        </div>

        <div className="grid gap-0 lg:grid-cols-[0.85fr_1.15fr]">
          <form onSubmit={createRequest} className="border-white/10 p-6 lg:border-r">
            <Input
              label="Request title"
              value={requestForm.title}
              onChange={(event) => setRequestForm((current) => ({ ...current, title: event.target.value }))}
              placeholder="Arduino batteries, transport, lab repair..."
              required
            />
            <Select
              label="Priority"
              value={requestForm.priority}
              onChange={(event) => setRequestForm((current) => ({ ...current, priority: event.target.value }))}
              options={priorityOptions}
              className="mt-4"
            />
            <Textarea
              label="Details"
              value={requestForm.details}
              onChange={(event) => setRequestForm((current) => ({ ...current, details: event.target.value }))}
              placeholder="Explain what is needed, why it is needed, and when it is needed..."
              required
              className="mt-4"
            />
            <Button type="submit" className="mt-4" icon={<Send className="h-4 w-4" />} loading={savingRequest}>
              Send request
            </Button>
          </form>

          <div className="p-6">
            <h3 className="font-heading text-2xl font-semibold text-white">
              {user?.role === 'ADMIN' ? 'All team requests' : 'My requests'}
            </h3>
            <div className="mt-5 space-y-3">
              {loading ? <div className="text-sm text-white/50">Loading requests...</div> : null}
              {!loading && requests.length === 0 ? (
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm text-white/50">
                  No team requests yet.
                </div>
              ) : null}
              {requests.map((request) => (
                <div key={request.id} className="rounded-2xl border border-white/8 bg-white/[0.04] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-xs uppercase tracking-[0.22em] text-brand-secondary">{request.priority}</div>
                      <h4 className="mt-2 font-heading text-xl font-semibold text-white">{request.title}</h4>
                      <p className="mt-1 text-xs text-white/45">
                        {request.user.firstName} {request.user.lastName} | {formatDateTime(request.createdAt)}
                      </p>
                    </div>
                    <Badge variant={request.status === 'REJECTED' ? 'danger' : request.status === 'DONE' ? 'success' : 'primary'}>
                      {request.status}
                    </Badge>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-white/65">{request.details}</p>
                  {request.response ? (
                    <div className="mt-3 rounded-2xl border border-brand-secondary/15 bg-brand-secondary/8 p-3 text-sm leading-6 text-white/65">
                      Admin response: {request.response}
                    </div>
                  ) : null}
                  {user?.role === 'ADMIN' ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {requestStatusOptions.map((option) => (
                        <Button
                          key={option.value}
                          type="button"
                          size="sm"
                          variant={request.status === option.value ? 'primary' : 'secondary'}
                          loading={savingRequestId === request.id}
                          onClick={() => updateRequestStatus(request.id, option.value, request.response || '')}
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>
      </div>
    </div>
  );
}
