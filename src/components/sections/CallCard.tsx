import { Icon } from "@/components/ui/Icon";

const bars = Array.from(
  { length: 28 },
  (_, i) => 18 + Math.round(Math.abs(Math.sin(i * 1.3)) * 70),
);

/** Decorative "live call" card shown in the hero. Purely visual. */
export function CallCard() {
  return (
    <div aria-hidden="true" className="relative mx-auto w-full max-w-md lg:max-w-none">
      <div className="relative rotate-1 rounded-[1.75rem] bg-linear-to-br from-royal via-navy to-navy-deep p-6 text-white shadow-soft sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-lg font-bold">Inbound call</p>
            <p className="text-sm text-white/70">Customer care, Hindi</p>
          </div>
          <span className="rounded-full bg-brand-green px-3 py-1 text-xs font-bold tracking-wider">
            LIVE
          </span>
        </div>

        <div className="mt-6 flex h-16 items-center gap-1">
          {bars.map((h, i) => (
            <span
              key={i}
              className="w-full origin-center animate-[wave_1.4s_ease-in-out_infinite] rounded-full bg-linear-to-t from-royal to-brand-green-light motion-reduce:animate-none"
              style={{ height: `${h}%`, animationDelay: `${(i % 7) * 0.12}s` }}
            />
          ))}
        </div>

        <div className="mt-6 space-y-3 text-sm">
          <p className="max-w-[85%] rounded-2xl rounded-bl-sm bg-white px-4 py-3 text-ink">
            Hi, I applied for a credit card last week.
          </p>
          <p className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-brand-green px-4 py-3">
            Of course. Let me check that for you now.
          </p>
        </div>

        <div className="mt-6 flex items-center justify-between rounded-2xl border border-dashed border-brand-green-light/70 px-4 py-3 text-sm">
          <span className="font-semibold">Call outcome</span>
          <span className="font-semibold text-brand-green-light">Resolved on first call</span>
        </div>
      </div>

      <div className="absolute -bottom-6 -left-4 hidden items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm shadow-soft sm:-left-8 sm:flex">
        <span className="grid size-10 place-items-center rounded-xl bg-mint text-brand-green">
          <Icon name="headset" />
        </span>
        <span>
          <span className="block font-bold text-navy">Trained agents</span>
          <span className="text-muted">Voice and non-voice</span>
        </span>
      </div>
    </div>
  );
}
