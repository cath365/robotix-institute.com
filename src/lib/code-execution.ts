// Code Execution Service
// Handles code execution for the playground

interface ExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  executionTime: number;
}

interface ExecutionOptions {
  language: 'python' | 'javascript' | 'cpp' | 'arduino' | 'micropython';
  code: string;
  timeout?: number; // milliseconds
  input?: string;
}

// Simulated execution for client-side
// In production, this would call a secure backend service
export async function executeCode(options: ExecutionOptions): Promise<ExecutionResult> {
  const { language, code, timeout = 5000, input } = options;
  const startTime = performance.now();

  try {
    // For JavaScript, we can execute in a sandboxed environment
    if (language === 'javascript') {
      return await executeJavaScript(code, timeout, input);
    }

    // For Python, we can use Pyodide (Python in WebAssembly)
    if (language === 'python') {
      return await executePython(code, timeout, input);
    }

    // For other languages, return a simulation
    return simulateExecution(language, code);
  } catch (error) {
    const executionTime = performance.now() - startTime;
    return {
      success: false,
      output: '',
      error: error instanceof Error ? error.message : 'Unknown error',
      executionTime,
    };
  }
}

// Execute JavaScript in a sandboxed environment
async function executeJavaScript(code: string, timeout: number, input?: string): Promise<ExecutionResult> {
  const startTime = performance.now();
  let output = '';
  
  try {
    const blockedTokens = [
      'window',
      'document',
      'localStorage',
      'sessionStorage',
      'fetch',
      'XMLHttpRequest',
      'WebSocket',
      'eval',
      'Function',
      'constructor',
      'import(',
      'navigator',
      'location',
    ];
    const foundToken = blockedTokens.find((token) => code.includes(token));
    if (foundToken) {
      throw new Error(`Unsafe JavaScript token blocked: ${foundToken}`);
    }

    // Create a sandboxed console
    const logs: string[] = [];
    const mockConsole = {
      log: (...args: unknown[]) => logs.push(args.map(String).join(' ')),
      error: (...args: unknown[]) => logs.push('Error: ' + args.map(String).join(' ')),
      warn: (...args: unknown[]) => logs.push('Warning: ' + args.map(String).join(' ')),
      info: (...args: unknown[]) => logs.push(args.map(String).join(' ')),
    };

    // Create a sandboxed function
    const sandboxedCode = `"use strict";\n${code}`;

    // Execute with timeout
    await Promise.race([
      new Promise<void>((resolve, reject) => {
        try {
          const fn = new Function('console', 'input', sandboxedCode);
          fn(mockConsole, input);
          resolve();
        } catch (e) {
          reject(e);
        }
      }),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Execution timeout')), timeout)
      ),
    ]);

    output = logs.join('\n');
    const executionTime = performance.now() - startTime;

    return {
      success: true,
      output: output || 'Program executed successfully (no output)',
      executionTime,
    };
  } catch (error) {
    const executionTime = performance.now() - startTime;
    return {
      success: false,
      output,
      error: error instanceof Error ? error.message : 'Execution failed',
      executionTime,
    };
  }
}

// Execute Python using Pyodide
async function executePython(code: string, timeout: number, input?: string): Promise<ExecutionResult> {
  const startTime = performance.now();
  
  try {
    if (typeof window === 'undefined') {
      throw new Error('Python execution is only available in the browser.');
    }

    if (!(window as any).loadPyodide) {
      await new Promise<void>((resolve, reject) => {
        const existing = document.querySelector<HTMLScriptElement>('script[data-pyodide]');
        if (existing) {
          existing.addEventListener('load', () => resolve(), { once: true });
          existing.addEventListener('error', () => reject(new Error('Pyodide failed to load')), { once: true });
          return;
        }
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js';
        script.async = true;
        script.dataset.pyodide = 'true';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Pyodide failed to load'));
        document.head.appendChild(script);
      });
    }

    if ((window as any).loadPyodide) {
      const pyodide = await (window as any).loadPyodide();
      
      // Redirect stdout
      await pyodide.runPythonAsync(`
        import sys
        from io import StringIO
        sys.stdout = StringIO()
      `);

      // Run the code
      await Promise.race([
        pyodide.runPythonAsync(code),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Execution timeout')), timeout)
        ),
      ]);

      // Get output
      const output = await pyodide.runPythonAsync('sys.stdout.getvalue()');
      const executionTime = performance.now() - startTime;

      return {
        success: true,
        output: output || 'Program executed successfully (no output)',
        executionTime,
      };
    }

    throw new Error('Pyodide is unavailable. Python code was not executed.');
  } catch (error) {
    const executionTime = performance.now() - startTime;
    return {
      success: false,
      output: '',
      error: error instanceof Error ? error.message : 'Execution failed',
      executionTime,
    };
  }
}

// Simulate execution for compiled languages
function simulateExecution(language: string, code: string): ExecutionResult {
  const startTime = performance.now();
  const executionTime = performance.now() - startTime + Math.random() * 100;

  const languageInfo: Record<string, { name: string; note: string }> = {
    cpp: {
      name: 'C++',
      note: 'Compilation requires a backend compiler service',
    },
    arduino: {
      name: 'Arduino',
      note: 'Upload to a physical Arduino board to run this code',
    },
    micropython: {
      name: 'MicroPython',
      note: 'Upload to an ESP32/ESP8266 to run this code',
    },
  };

  const info = languageInfo[language] || { name: language, note: 'Execution not available' };

  // Basic syntax validation
  const errors = validateSyntax(language, code);
  if (errors.length > 0) {
    return {
      success: false,
      output: '',
      error: errors.join('\n'),
      executionTime,
    };
  }

  return {
    success: true,
    output: `✓ ${info.name} code analyzed successfully\n\n${info.note}\n\nCode structure looks valid. Key observations:\n- ${countLines(code)} lines of code\n- ${countFunctions(language, code)} function(s) detected\n\nTo run this code:\n1. Copy the code to your development environment\n2. Compile/upload to your target device`,
    executionTime,
  };
}

// Simple syntax validation
function validateSyntax(language: string, code: string): string[] {
  const errors: string[] = [];

  // Check for balanced braces
  const braceStack: string[] = [];
  const braceMap: Record<string, string> = { '{': '}', '[': ']', '(': ')' };
  
  for (let i = 0; i < code.length; i++) {
    const char = code[i];
    if ('{[('.includes(char)) {
      braceStack.push(char);
    } else if ('}])'.includes(char)) {
      const last = braceStack.pop();
      if (!last || braceMap[last] !== char) {
        errors.push(`Syntax error: Unmatched '${char}' at position ${i}`);
        break;
      }
    }
  }

  if (braceStack.length > 0) {
    errors.push(`Syntax error: Unclosed '${braceStack[braceStack.length - 1]}'`);
  }

  // Language-specific checks
  if (language === 'arduino' || language === 'cpp') {
    if (!code.includes('void setup()') && !code.includes('int main(')) {
      errors.push('Warning: No setup() or main() function found');
    }
  }

  return errors;
}

function countLines(code: string): number {
  return code.split('\n').filter(line => line.trim().length > 0).length;
}

function countFunctions(language: string, code: string): number {
  if (language === 'python') {
    return (code.match(/^def\s+\w+/gm) || []).length;
  }
  // C-style languages
  return (code.match(/\w+\s+\w+\s*\([^)]*\)\s*\{/g) || []).length;
}

// Export types
export type { ExecutionResult, ExecutionOptions };
