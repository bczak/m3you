import { Check, Copy } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

/**
 * A syntax-plain code panel with a copy button.
 *
 * Deliberately not Shiki-highlighted: this block renders code that changes on
 * every control interaction, and re-running a highlighter per keystroke is both
 * janky and heavy. Prose code fences in MDX still get full highlighting.
 */
export function CodeBlock({ code, language = 'tsx' }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timeout.current), []);

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    clearTimeout(timeout.current);
    timeout.current = setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="m3-code" data-language={language}>
      <button type="button" className="m3-code__copy" onClick={copy} aria-label={copied ? 'Copied' : 'Copy code'}>
        {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
      </button>
      <pre className="m3-code__pre">
        <code>{code}</code>
      </pre>
    </div>
  );
}
