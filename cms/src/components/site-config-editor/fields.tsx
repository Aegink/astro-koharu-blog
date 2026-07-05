import { Icon } from '@iconify/react';
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Section({ icon, title, desc, children }: { icon: string; title: string; desc?: string; children: ReactNode }) {
  return (
    <section className="space-y-4 rounded-2xl border border-border bg-muted/20 p-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2 font-semibold">
          <Icon icon={icon} className="size-5 text-primary" />
          {title}
        </div>
        {desc && <p className="text-muted-foreground text-sm leading-6">{desc}</p>}
      </div>
      {children}
    </section>
  );
}

export function InfoBox({ children }: { children: ReactNode }) {
  return <div className="rounded-2xl border border-sky-500/30 bg-sky-500/10 p-4 text-sky-100 text-sm leading-6">{children}</div>;
}

export function WarnBox({ children }: { children: ReactNode }) {
  return <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-100 text-sm leading-6">{children}</div>;
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="font-medium text-sm">{label}</span>
      {children}
      {hint && <span className="block text-muted-foreground text-xs leading-5">{hint}</span>}
    </label>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        'w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60',
        props.className,
      )}
    />
  );
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        'w-full resize-y rounded-xl border border-input bg-background px-3 py-2.5 text-sm leading-6 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60',
        props.className,
      )}
    />
  );
}

export function SelectInput(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn('w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20', props.className)}
    />
  );
}

export function CheckField({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 rounded-2xl border border-border bg-muted/20 p-4">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="size-4" />
      <span>
        <span className="block font-medium text-sm">{label}</span>
        {hint && <span className="text-muted-foreground text-xs leading-5">{hint}</span>}
      </span>
    </label>
  );
}
