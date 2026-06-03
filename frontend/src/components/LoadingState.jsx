import { cn } from '@/lib/utils';

const LoadingState = ({ text = 'Memuat data...', compact = false }) => (
  <div className={cn('relative grid w-full place-items-center overflow-hidden rounded-[var(--radius-sm)]', compact ? 'min-h-20 p-4' : 'min-h-44 p-8')}>
    <div className="absolute inset-0 opacity-70 [background:radial-gradient(circle_at_18%_30%,color-mix(in_srgb,var(--color-primary)_18%,transparent),transparent_30%),radial-gradient(circle_at_78%_62%,color-mix(in_srgb,var(--color-gold)_16%,transparent),transparent_28%)]" />
    <div className="relative flex min-w-48 flex-col items-center gap-4 rounded-[var(--radius-sm)] border border-[var(--glass-border)] bg-[var(--glass-bg-strong)] px-6 py-5 text-center shadow-[var(--shadow-float)] backdrop-blur-xl">
      <div className="relative h-12 w-24" aria-hidden="true">
        <span className="absolute left-2 top-5 size-1.5 animate-[constellationPulse_1.8s_ease-in-out_infinite] rounded-full bg-[var(--color-primary)]" />
        <span className="absolute left-9 top-2 size-1.5 animate-[constellationPulse_1.8s_ease-in-out_.15s_infinite] rounded-full bg-[var(--color-gold)]" />
        <span className="absolute left-16 top-7 size-1.5 animate-[constellationPulse_1.8s_ease-in-out_.3s_infinite] rounded-full bg-[var(--color-primary)]" />
        <span className="absolute right-2 top-4 size-1.5 animate-[constellationPulse_1.8s_ease-in-out_.45s_infinite] rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,.75)]" />
        <span className="absolute left-3 top-6 h-px w-20 rotate-[-12deg] bg-[linear-gradient(90deg,transparent,var(--color-primary),transparent)] opacity-45" />
        <span className="absolute left-9 top-4 h-px w-12 rotate-[25deg] bg-[linear-gradient(90deg,transparent,var(--color-gold),transparent)] opacity-40" />
      </div>
      <div className="size-9 animate-spin rounded-full border-2 border-[var(--color-accent)] border-t-[var(--color-primary)]" />
      <div className="text-sm font-bold text-[var(--color-text)]">{text}</div>
      <div className="flex gap-1.5" aria-hidden="true">
        {[0, 1, 2].map((item) => (
          <span
            key={item}
            className="h-1.5 w-6 animate-[pulseDot_1s_ease-in-out_infinite] rounded-full bg-[var(--color-primary)] opacity-35"
            style={{ animationDelay: `${item * 0.12}s` }}
          />
        ))}
      </div>
    </div>
  </div>
);

export default LoadingState;
