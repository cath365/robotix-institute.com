'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Bot,
  BrainCircuit,
  Check,
  Copy,
  Globe,
  GraduationCap,
  Languages,
  MessageSquareText,
  RefreshCw,
  Send,
  Shield,
  Sparkles,
  Sprout,
  Users,
  Wrench,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Badge, Button, GlassCard, Section } from '@/components/ui';
import { sanitizeText } from '@/lib/utils';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  source?: 'api' | 'fallback';
};

const promptContexts = [
  'General robotics guidance',
  'School rollout and STEM clubs',
  'AI builder and app creation',
  'Smart agriculture systems',
] as const;

const languageModes = ['English', 'Bemba-ready', 'Nyanja-ready', 'Swahili-ready'] as const;

const suggestedPrompts = [
  'Design a beginner robotics pathway for a school club launching next month.',
  'Explain how to build a smart irrigation dashboard with ESP32 sensors and weather alerts.',
  'Help me create a robotics project portfolio that feels like LinkedIn for young innovators.',
  'Generate Arduino workflow ideas for a line-following robot with obstacle detection.',
  'How should Robotix AI guide a parent choosing the right STEM path for their child?',
  'Give me a low-code AI app idea for a Zambian school innovation challenge.',
];

const capabilityCards = [
  {
    title: 'Student guidance',
    text: 'Explain robotics, coding, and AI step by step with practical examples and project direction.',
    icon: GraduationCap,
  },
  {
    title: 'School support',
    text: 'Help schools roll out clubs, choose learning paths, and shape stronger STEM programs.',
    icon: Users,
  },
  {
    title: 'Builder workflows',
    text: 'Assist with apps, websites, Arduino systems, dashboards, and connected innovation projects.',
    icon: BrainCircuit,
  },
  {
    title: 'AgriTech intelligence',
    text: 'Support smart farming ideas with dashboards, sensor logic, automation flows, and alerts.',
    icon: Sprout,
  },
];

const initialAssistantMessage =
  "I’m Robotix AI, the intelligence layer for the Robotix ecosystem. I can guide students, help schools, explain robotics, recommend projects, shape AI app ideas, and support future multilingual STEM experiences across English, Bemba, Nyanja, and Swahili. Ask me anything about learning, building, robotics, AI, IoT, or launching innovation pathways.";

function fallbackResponse(message: string, context: string) {
  const lower = message.toLowerCase();
  if (lower.includes('irrigation') || lower.includes('agriculture') || lower.includes('farming')) {
    return `Here is a strong Robotix-style smart agriculture concept:\n\n## Smart Irrigation Stack\nUse soil moisture sensors, an ESP32 gateway, a weather input, and a dashboard layer.\n\n- Capture soil readings every few minutes.\n- Trigger irrigation only when moisture drops below a defined threshold.\n- Add weather awareness so the system avoids watering before rain.\n- Surface the data in a live dashboard for schools, clubs, or farm pilots.\n\n## Learning progression\n1. Start with a single moisture sensor and LED alert.\n2. Add a relay-controlled water pump.\n3. Push readings to a cloud dashboard.\n4. Layer in notifications and recommendation logic.\n\nIf you want, I can turn this into Arduino code, a dashboard schema, or a student-friendly project brief.`;
  }

  if (lower.includes('school') || lower.includes('club')) {
    return `A strong Robotix school rollout should feel like a launch system, not just a course list.\n\n## School rollout model\n- Start with a flagship robotics club and one visible pilot project.\n- Create beginner, intermediate, and advanced pathways for different learner levels.\n- Give the school a dashboard for attendance, projects, events, and performance trends.\n- Use competitions and showcases to turn learning into visible momentum.\n- Build a portfolio trail so each student develops a lasting innovation identity.\n\nBecause your selected context is "${context}", I can also turn this into a 30-day rollout plan if you want.`;
  }

  if (lower.includes('app') || lower.includes('builder') || lower.includes('website')) {
    return `A good Robotix AI builder experience should help users move from idea to prototype quickly.\n\n## Beginner-friendly AI app flow\n- Choose a template: chatbot, portfolio site, dashboard, or automation tool.\n- Define the goal in plain language.\n- Select data sources or inputs.\n- Generate the first interface and logic blocks.\n- Test, refine, and publish.\n\nFor your next step, I can draft a no-code builder workflow, a feature list, or a landing page concept for the app.`;
  }

  return `Here’s a strong Robotix AI response path for that question.\n\n## What I can do next\n- Break the concept into simple learning steps.\n- Draft a project plan or prototype workflow.\n- Generate code or pseudocode.\n- Suggest a school, parent, or student-friendly explanation.\n- Reframe the idea for the African innovation ecosystem vision.\n\nTell me whether you want a beginner explanation, a builder workflow, or a real project plan.`;
}

function renderAssistantContent(content: string) {
  const blocks = content.split(/```/g);

  return blocks.map((block, index) => {
    if (index % 2 === 1) {
      const code = block.replace(/^[a-zA-Z0-9_-]+\n/, '');
      return (
        <pre key={`code-${index}`} className="my-4 overflow-x-auto rounded-2xl bg-black/30 p-4 text-xs text-brand-accent">
          <code>{code}</code>
        </pre>
      );
    }

    return block
      .split('\n\n')
      .filter(Boolean)
      .map((part, partIndex) => {
        const lines = part.split('\n').filter(Boolean);
        const key = `text-${index}-${partIndex}`;

        if (part.startsWith('## ')) {
          return (
            <h3 key={key} className="mt-4 text-base font-semibold text-white first:mt-0">
              {part.replace(/^##\s*/, '')}
            </h3>
          );
        }

        if (lines.every((line) => line.startsWith('- '))) {
          return (
            <ul key={key} className="my-3 space-y-2 pl-5 text-sm text-white/78">
              {lines.map((line) => (
                <li key={line} className="list-disc">
                  {line.replace(/^- /, '')}
                </li>
              ))}
            </ul>
          );
        }

        if (lines.every((line) => /^\d+\./.test(line))) {
          return (
            <ol key={key} className="my-3 space-y-2 pl-5 text-sm text-white/78">
              {lines.map((line) => (
                <li key={line} className="list-decimal">
                  {line.replace(/^\d+\.\s*/, '')}
                </li>
              ))}
            </ol>
          );
        }

        return (
          <p key={key} className="my-3 whitespace-pre-wrap text-sm leading-7 text-white/82">
            {part}
          </p>
        );
      });
  });
}

export default function AITutorPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'initial',
      role: 'assistant',
      content: initialAssistantMessage,
      timestamp: new Date(),
      source: 'fallback',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeContext, setActiveContext] = useState<(typeof promptContexts)[number]>('General robotics guidance');
  const [languageMode, setLanguageMode] = useState<(typeof languageModes)[number]>('English');
  const [statusText, setStatusText] = useState('Ready to guide learners, schools, and builders.');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const canSend = useMemo(() => sanitizeText(input, 1600).length > 0 && !isTyping, [input, isTyping]);

  const sendMessage = async (text?: string) => {
    const clean = sanitizeText(text || input, 1600);
    if (!clean || isTyping) return;

    const userMessage: Message = {
      id: `${Date.now()}`,
      role: 'user',
      content: clean,
      timestamp: new Date(),
    };

    setMessages((current) => [...current, userMessage]);
    setInput('');
    setIsTyping(true);
    setStatusText('Robotix AI is thinking through your request...');

    try {
      const response = await fetch('/api/ai-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: clean,
          context: {
            topic: activeContext,
            language: languageMode,
          },
        }),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json?.message || 'Robotix AI could not reach the live intelligence layer.');
      }

      const assistantMessage: Message = {
        id: `${Date.now()}-assistant`,
        role: 'assistant',
        content: json?.data?.message || 'Robotix AI did not return a response.',
        timestamp: new Date(),
        source: 'api',
      };

      setMessages((current) => [...current, assistantMessage]);
      setStatusText('Live AI response delivered.');
    } catch (error) {
      const fallbackMessage: Message = {
        id: `${Date.now()}-fallback`,
        role: 'assistant',
        content: fallbackResponse(clean, activeContext),
        timestamp: new Date(),
        source: 'fallback',
      };

      setMessages((current) => [...current, fallbackMessage]);
      setStatusText(
        error instanceof Error
          ? `${error.message} Showing Robotix fallback guidance instead.`
          : 'Live AI is unavailable, so fallback guidance is active.'
      );
    } finally {
      setIsTyping(false);
    }
  };

  const copyMessage = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const resetConversation = () => {
    setMessages([
      {
        id: 'initial',
        role: 'assistant',
        content: initialAssistantMessage,
        timestamp: new Date(),
        source: 'fallback',
      },
    ]);
    setStatusText('Conversation reset. Robotix AI is ready again.');
  };

  return (
    <main className="min-h-screen bg-brand-dark text-white">
      <Navbar />

      <section className="relative overflow-hidden pt-28">
        <div className="aurora-bg absolute inset-0 opacity-80" />
        <div className="bg-grid absolute inset-0 opacity-10" />
        <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
            <div className="space-y-6">
              <div>
                <Badge variant="accent" className="mb-4">
                  <Bot className="mr-1 h-3 w-3" />
                  Robotix AI
                </Badge>
                <h1 className="font-heading text-4xl font-bold sm:text-5xl">
                  A premium AI guidance layer for the entire innovation ecosystem.
                </h1>
                <p className="mt-4 max-w-2xl text-lg text-white/65">
                  Built to answer questions, recommend projects, support schools, explain robotics, and eventually speak across multiple African language contexts.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {capabilityCards.map((card) => (
                  <GlassCard key={card.title} className="p-5">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-accent/10 text-brand-accent">
                      <card.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-heading text-lg font-semibold">{card.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-white/62">{card.text}</p>
                  </GlassCard>
                ))}
              </div>

              <GlassCard className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-brand-accent">Configuration</p>
                    <h2 className="mt-2 font-heading text-2xl font-semibold">Context-aware assistance</h2>
                  </div>
                  <Languages className="h-6 w-6 text-brand-accent" />
                </div>

                <div className="mt-6">
                  <div className="mb-3 text-xs uppercase tracking-[0.2em] text-white/35">Active context</div>
                  <div className="flex flex-wrap gap-2">
                    {promptContexts.map((item) => (
                      <button
                        key={item}
                        onClick={() => setActiveContext(item)}
                        className={`rounded-full px-3 py-2 text-sm transition-all ${
                          activeContext === item
                            ? 'bg-brand-accent text-brand-dark'
                            : 'border border-white/10 bg-white/[0.03] text-white/65 hover:border-brand-accent/25 hover:text-white'
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <div className="mb-3 text-xs uppercase tracking-[0.2em] text-white/35">Language path</div>
                  <div className="flex flex-wrap gap-2">
                    {languageModes.map((item) => (
                      <button
                        key={item}
                        onClick={() => setLanguageMode(item)}
                        className={`rounded-full px-3 py-2 text-sm transition-all ${
                          languageMode === item
                            ? 'bg-brand-secondary text-white'
                            : 'border border-white/10 bg-white/[0.03] text-white/65 hover:border-brand-accent/25 hover:text-white'
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm text-white/62">
                  Live mode uses the configured AI endpoint at `/api/ai-tutor`. If that service is unavailable, Robotix AI falls back to local guidance so the experience stays useful.
                </div>
              </GlassCard>
            </div>

            <GlassCard className="overflow-hidden p-0">
              <div className="border-b border-white/10 bg-white/[0.03] px-5 py-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-accent to-brand-accent-light text-brand-dark shadow-glow-accent">
                      <Bot className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="font-heading text-xl font-semibold">Robotix AI Command Interface</h2>
                      <p className="text-xs text-white/45">{statusText}</p>
                    </div>
                  </div>
                  <button
                    onClick={resetConversation}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white/65 transition-colors hover:text-white"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Reset
                  </button>
                </div>
              </div>

              <div className="max-h-[42rem] overflow-y-auto px-5 py-5">
                <div className="space-y-5">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}
                    >
                      {message.role === 'assistant' && (
                        <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-brand-accent/10 text-brand-accent">
                          <Bot className="h-4 w-4" />
                        </div>
                      )}

                      <div
                        className={`max-w-[86%] rounded-[1.5rem] px-4 py-4 ${
                          message.role === 'user'
                            ? 'rounded-tr-md bg-brand-primary text-white'
                            : 'rounded-tl-md border border-white/8 bg-white/[0.04]'
                        }`}
                      >
                        <div className="text-xs uppercase tracking-[0.18em] text-white/35">
                          {message.role === 'user' ? 'You' : message.source === 'api' ? 'Live AI' : 'Fallback guidance'}
                        </div>
                        <div className="mt-3">
                          {message.role === 'assistant' ? (
                            <div>{renderAssistantContent(message.content)}</div>
                          ) : (
                            <p className="whitespace-pre-wrap text-sm leading-7 text-white/90">{message.content}</p>
                          )}
                        </div>
                        {message.role === 'assistant' && message.id !== 'initial' && (
                          <div className="mt-4 flex items-center gap-3 border-t border-white/8 pt-3">
                            <button
                              onClick={() => copyMessage(message.content, message.id)}
                              className="inline-flex items-center gap-1 text-xs text-white/40 transition-colors hover:text-white/70"
                            >
                              {copiedId === message.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                              {copiedId === message.id ? 'Copied' : 'Copy'}
                            </button>
                          </div>
                        )}
                      </div>

                      {message.role === 'user' && (
                        <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white/[0.06] text-white/70">
                          <MessageSquareText className="h-4 w-4" />
                        </div>
                      )}
                    </motion.div>
                  ))}

                  {isTyping && (
                    <div className="flex gap-3">
                      <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-brand-accent/10 text-brand-accent">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="rounded-[1.5rem] rounded-tl-md border border-white/8 bg-white/[0.04] px-4 py-4">
                        <div className="flex gap-2">
                          {[0, 1, 2].map((dot) => (
                            <span
                              key={dot}
                              className="h-2 w-2 rounded-full bg-white/35 animate-bounce"
                              style={{ animationDelay: `${dot * 120}ms` }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={endRef} />
                </div>
              </div>

              <div className="border-t border-white/10 bg-white/[0.02] px-5 py-5">
                {messages.length <= 1 && (
                  <div className="mb-4 grid gap-3 sm:grid-cols-2">
                    {suggestedPrompts.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => sendMessage(prompt)}
                        className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left text-sm text-white/68 transition-all hover:border-brand-accent/25 hover:text-white"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex gap-3">
                  <textarea
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault();
                        sendMessage();
                      }
                    }}
                    rows={3}
                    placeholder="Ask Robotix AI about robotics, schools, smart agriculture, AI tools, projects, or ecosystem strategy..."
                    className="input-field min-h-[88px] flex-1 resize-none"
                  />
                  <Button
                    onClick={() => sendMessage()}
                    disabled={!canSend}
                    className="shrink-0 self-end"
                    icon={<Send className="h-4 w-4" />}
                  >
                    Send
                  </Button>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-white/35">
                  <span className="inline-flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    Multilingual roadmap ready
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Wrench className="h-3 w-3" />
                    Project and code guidance
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    Verify safety-critical robotics decisions
                  </span>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      <Section className="py-8">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              title: 'For students',
              text: 'Get course recommendations, clearer explanations, project ideas, and confidence-building guidance.',
              icon: GraduationCap,
            },
            {
              title: 'For schools',
              text: 'Use Robotix AI to support club launches, resource choices, event preparation, and pathway planning.',
              icon: Users,
            },
            {
              title: 'For innovators',
              text: 'Move from prototype idea to app, dashboard, device workflow, or ecosystem-facing product concept.',
              icon: ArrowRight,
            },
          ].map((item) => (
            <GlassCard key={item.title} className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-accent/10 text-brand-accent">
                <item.icon className="h-6 w-6" />
              </div>
              <h3 className="font-heading text-xl font-semibold">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/64">{item.text}</p>
            </GlassCard>
          ))}
        </div>
      </Section>

      <Footer />
    </main>
  );
}
