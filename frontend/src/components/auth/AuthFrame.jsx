import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const AuthFrame = ({ title, subtitle, children, footnote, wide = false, centerOnly = false }) => (
  <main className="auth-frame relative grid min-h-screen place-items-center overflow-hidden bg-[var(--background-luxury)] px-4 py-24 text-[var(--color-text)]">
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,color-mix(in_srgb,var(--color-primary)_8%,transparent),transparent_32%),radial-gradient(circle_at_82%_70%,color-mix(in_srgb,var(--color-gold)_7%,transparent),transparent_30%)]" />
    <div className={cn('relative w-full animate-slide-in', wide ? 'max-w-2xl' : 'max-w-md', centerOnly && 'max-w-md')}>
      <header className="mb-6 rounded-[var(--radius-sm)] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--color-surface)_82%,var(--color-background))] px-4 py-5 text-center shadow-[0_10px_24px_-24px_rgba(15,23,42,.2)] backdrop-blur-xl dark:bg-[rgba(15,23,42,.72)]">
        <Link to="/" className="inline-flex no-underline">
          <span className="font-heading text-4xl font-extrabold text-[var(--color-text)]">
            NgiNep<span className="text-[var(--color-primary)]">.</span>
          </span>
        </Link>
        <h1 className="mb-2 mt-5 font-heading text-3xl font-bold text-[var(--color-text)]">{title}</h1>
        {subtitle && <p className="m-0 text-sm leading-6 text-[var(--color-muted)]">{subtitle}</p>}
      </header>

      <Card className={cn('auth-card-panel relative overflow-hidden border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--color-surface)_86%,var(--color-background))] p-6 shadow-[0_14px_38px_-34px_rgba(15,23,42,.26)] backdrop-blur-xl dark:bg-[rgba(15,23,42,.78)] dark:shadow-[0_24px_70px_-28px_rgba(0,0,0,.78)] sm:p-8', centerOnly && 'text-center')}>
        <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,color-mix(in_srgb,var(--color-primary)_56%,white),color-mix(in_srgb,var(--color-gold)_42%,white),color-mix(in_srgb,var(--color-primary)_56%,white))]" />
        {children}
      </Card>

      {footnote && <p className="mt-6 rounded-[var(--radius-sm)] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--color-surface)_74%,var(--color-background))] px-4 py-3 text-center text-sm leading-6 text-[var(--color-muted)] shadow-[0_8px_20px_-22px_rgba(15,23,42,.18)] dark:bg-[rgba(15,23,42,.62)]">{footnote}</p>}
    </div>
  </main>
);

export default AuthFrame;
