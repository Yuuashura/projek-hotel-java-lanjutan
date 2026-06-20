import { cn } from '../lib/utils';

const dots = [
  'left-2 top-[19px]',
  'left-[34px] top-[9px] [animation-delay:150ms]',
  'left-[62px] top-6 [animation-delay:300ms]',
  'left-[82px] top-[13px] [animation-delay:450ms]',
];
const barDelays = ['', '[animation-delay:140ms]', '[animation-delay:280ms]'];

const LoadingState = ({ text = 'Memuat data...', compact = false }) => (
  <div
    className={cn(
      'relative grid min-h-[210px] place-items-center overflow-hidden',
      'bg-[linear-gradient(135deg,rgba(246,211,101,0.12),transparent_38%),linear-gradient(160deg,rgba(44,82,130,0.08),transparent_52%),var(--color-surface)] px-8 py-12',
      'after:absolute after:inset-0 after:-translate-x-full after:animate-[shimmer_1.6s_ease-in-out_infinite] after:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent)]',
      compact && 'min-h-[150px] px-5 py-8',
    )}
  >
    <div className="relative z-[1] flex flex-col items-center gap-4 text-center">
      <div className="relative mb-[-0.25rem] h-[42px] w-24" aria-hidden="true">
        <div className="absolute left-3 right-3 top-5 h-px -rotate-[10deg] animate-[constellationPulse_1.8s_ease-in-out_infinite] bg-[linear-gradient(90deg,transparent,var(--color-primary),var(--color-gold),transparent)]" />
        <div className="absolute left-3 right-3 top-6 h-px rotate-[18deg] animate-[constellationPulse_1.8s_ease-in-out_infinite] bg-[linear-gradient(90deg,transparent,var(--color-primary),var(--color-gold),transparent)] [animation-delay:400ms]" />
        {dots.map((position) => (
          <span
            key={position}
            className={cn(
              'absolute size-2 animate-[pulseDot_1.2s_ease-in-out_infinite] rounded-full border-2 border-[var(--color-primary)]',
              'bg-[var(--color-surface)] shadow-[0_0_14px_var(--color-primary-soft)]',
              position,
            )}
          />
        ))}
      </div>
      <div className="size-[42px] animate-[spin_0.9s_linear_infinite] rounded-full border border-[var(--color-accent)] border-r-[var(--color-gold)] border-t-[var(--color-primary)] shadow-[0_0_0_8px_var(--color-primary-soft)]" />
      <div className="text-[0.82rem] font-semibold uppercase text-[var(--color-text)]">{text}</div>
      <div className="flex gap-2" aria-hidden="true">
        {barDelays.map((delay) => (
          <span
            key={delay}
            className={cn(
              'size-2 animate-[pulseDot_1s_ease-in-out_infinite] rounded-full bg-[var(--color-primary)] opacity-35',
              delay,
            )}
          />
        ))}
      </div>
    </div>
  </div>
);

export default LoadingState;
