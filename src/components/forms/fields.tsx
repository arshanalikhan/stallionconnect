import { cn } from "@/lib/cn";
import { HONEYPOT_FIELD } from "@/lib/forms/schemas";

const control =
  "w-full rounded-xl border-[1.5px] bg-white px-3.5 py-3 text-ink transition outline-none placeholder:text-muted/60 focus:border-royal focus:ring-4 focus:ring-royal/15";

type Base = { name: string; label: string; error?: string; required?: boolean; hint?: string };

function Wrap({
  name,
  label,
  error,
  required,
  hint,
  children,
  className,
}: Base & { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("grid content-start gap-1.5", className)}>
      <label htmlFor={`f-${name}`} className="text-sm font-semibold text-navy">
        {label}
        {required ? (
          <span className="text-brand-green"> *</span>
        ) : (
          <span className="font-normal text-muted"> (optional)</span>
        )}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      {error && (
        <p id={`f-${name}-error`} className="text-sm text-[#c0322b]">
          {error}
        </p>
      )}
    </div>
  );
}

const aria = (name: string, error?: string) => ({
  id: `f-${name}`,
  name,
  "aria-invalid": error ? true : undefined,
  "aria-describedby": error ? `f-${name}-error` : undefined,
});

export function TextField({
  type = "text",
  autoComplete,
  placeholder,
  className,
  ...p
}: Base & { type?: string; autoComplete?: string; placeholder?: string; className?: string }) {
  return (
    <Wrap {...p} className={className}>
      <input
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className={cn(control, p.error ? "border-[#c0322b]" : "border-line")}
        {...aria(p.name, p.error)}
      />
    </Wrap>
  );
}

export function SelectField({
  options,
  defaultValue,
  className,
  ...p
}: Base & { options: readonly string[]; defaultValue?: string; className?: string }) {
  return (
    <Wrap {...p} className={className}>
      <div className="relative">
        <select
          defaultValue={defaultValue ?? ""}
          className={cn(
            control,
            "appearance-none pr-10",
            p.error ? "border-[#c0322b]" : "border-line",
          )}
          {...aria(p.name, p.error)}
        >
          <option value="" disabled>
            Choose one
          </option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-navy"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.2}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>
    </Wrap>
  );
}

export function TextAreaField({
  placeholder,
  rows = 4,
  className,
  ...p
}: Base & { placeholder?: string; rows?: number; className?: string }) {
  return (
    <Wrap {...p} className={className}>
      <textarea
        rows={rows}
        placeholder={placeholder}
        className={cn(control, "resize-y", p.error ? "border-[#c0322b]" : "border-line")}
        {...aria(p.name, p.error)}
      />
    </Wrap>
  );
}

export function ConsentField({ error, children }: { error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="flex items-start gap-3 text-sm text-muted">
        <input
          type="checkbox"
          name="consent"
          className="mt-0.5 size-4 shrink-0 accent-brand-green"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "f-consent-error" : undefined}
        />
        <span>{children}</span>
      </label>
      {error && (
        <p id="f-consent-error" className="mt-1.5 text-sm text-[#c0322b]">
          {error}
        </p>
      )}
    </div>
  );
}

/** Off-screen field for bots. Real visitors never see or fill it. */
export function Honeypot() {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label>
        Leave this empty
        <input type="text" name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}
