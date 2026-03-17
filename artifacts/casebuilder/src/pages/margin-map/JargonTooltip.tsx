import { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { JARGON_TOOLTIPS } from './marginEngine';

interface Props {
  term: string;
  children?: React.ReactNode;
}

export function JargonTooltip({ term, children }: Props) {
  const [show, setShow] = useState(false);
  const text = JARGON_TOOLTIPS[term];
  if (!text) return <>{children}</>;

  return (
    <span className="relative inline-flex items-center gap-1">
      {children}
      <button
        type="button"
        className="text-muted-foreground/60 hover:text-primary transition-colors shrink-0"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
      >
        <HelpCircle className="w-3 h-3" />
      </button>
      {show && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 p-2.5 text-xs bg-slate-900 text-white rounded-lg shadow-lg z-50 leading-relaxed whitespace-normal pointer-events-none">
          {text}
        </span>
      )}
    </span>
  );
}
