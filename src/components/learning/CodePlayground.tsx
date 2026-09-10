'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Terminal } from 'lucide-react';
import { Button } from '@/components/ui';
import { executeCode } from '@/lib/code-execution';
import { cn } from '@/lib/utils';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => <div className="flex h-[260px] items-center justify-center text-sm text-white/50">Loading editor...</div>,
});

interface CodePlaygroundProps {
  initialCode: string;
  language: 'javascript' | 'python';
}

export function CodePlayground({ initialCode, language }: CodePlaygroundProps) {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState('Run your code to see the output here.');
  const [error, setError] = useState('');
  const [running, setRunning] = useState(false);

  const run = async () => {
    setRunning(true);
    setError('');
    const result = await executeCode({ language, code, timeout: 2500 });
    setOutput(result.output || '');
    setError(result.error || '');
    setRunning(false);
  };

  return (
    <div className="overflow-hidden rounded-lg border border-white/10 bg-slate-950 shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-white/5 px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <Terminal className="h-4 w-4 text-brand-accent" />
          {language === 'python' ? 'Python AI Lab' : 'JavaScript Game Lab'}
        </div>
        <Button size="sm" onClick={run} loading={running} icon={<Play className="h-4 w-4" />}>
          Run
        </Button>
      </div>
      <div className="grid lg:grid-cols-[1.35fr_0.65fr]">
        <div className="min-h-[280px]">
          <MonacoEditor
            height="320px"
            language={language}
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              tabSize: 2,
              wordWrap: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </div>
        <div className="border-t border-white/10 bg-black/30 p-4 lg:border-l lg:border-t-0">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/40">Output</p>
          <motion.pre
            key={`${output}-${error}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              'min-h-[230px] whitespace-pre-wrap rounded-md border p-3 font-mono text-sm',
              error ? 'border-red-500/30 bg-red-950/30 text-red-200' : 'border-emerald-500/20 bg-emerald-950/20 text-emerald-100'
            )}
          >
            {error || output}
          </motion.pre>
        </div>
      </div>
    </div>
  );
}
