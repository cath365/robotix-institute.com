'use client';

import { FormEvent, useState } from 'react';
import { Bot, Send } from 'lucide-react';
import { Button } from '@/components/ui';
import { LearningPathSlug } from '@/lib/learning-data';
import { sanitizeText } from '@/lib/utils';

const contextAnswers: Record<LearningPathSlug, string> = {
  ai: 'In AI, think of your code like a learner: it studies examples, finds patterns, then makes a careful guess. Start with tiny data and ask what clue changed the answer.',
  arduino: 'For Arduino, separate the input from the output. Buttons and sensors are inputs. LEDs, motors, and buzzers are outputs. Your code is the rule between them.',
  programming: 'In programming, break the problem into steps: store values, make a choice, repeat when needed, then print or return the result.',
  'game-dev': 'For games, focus on state: player position, score, timer, and win condition. Change one state at a time and test the feeling quickly.',
};

export function AIAssistant({ context }: { context: LearningPathSlug }) {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: contextAnswers[context],
    },
  ]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const clean = sanitizeText(question, 220);
    if (!clean) return;
    setMessages((current) => [...current, { role: 'user', text: clean }]);
    setQuestion('');
    setLoading(true);
    try {
      const res = await fetch('/api/ai-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: clean,
          context: { topic: context },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'AI assistant request failed');
      setMessages((current) => [...current, { role: 'assistant', text: data.data?.message || data.message }]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        { role: 'assistant', text: error instanceof Error ? error.message : 'The assistant could not respond.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
      <div className="mb-3 flex items-center gap-2 font-semibold text-white">
        <Bot className="h-4 w-4 text-brand-accent" />
        Robotix Coach
      </div>
      <div className="mb-3 max-h-64 space-y-3 overflow-y-auto pr-1">
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={message.role === 'assistant' ? 'rounded-lg bg-brand-accent/10 p-3 text-sm text-white/80' : 'ml-8 rounded-lg bg-white/10 p-3 text-sm text-white'}
          >
            {message.text}
          </div>
        ))}
      </div>
      <form onSubmit={submit} className="flex gap-2">
        <input
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          className="input-field h-11 flex-1"
          maxLength={220}
          placeholder="Ask for a simpler explanation..."
        />
        <Button type="submit" size="sm" loading={loading} icon={<Send className="h-4 w-4" />}>
          Ask
        </Button>
      </form>
    </div>
  );
}
