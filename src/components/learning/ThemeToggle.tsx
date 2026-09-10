'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui';

export function ThemeToggle() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      onClick={() => setDark((value) => !value)}
      icon={dark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    >
      {dark ? 'Dark' : 'Light'}
    </Button>
  );
}
