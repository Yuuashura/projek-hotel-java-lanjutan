import { Link } from 'react-router-dom';
import Card, { CardAccent } from '../ui/Card';
import { cn } from '../../utils/cn';

const AuthLayout = ({
  title,
  subtitle,
  wide = false,
  scroll = false,
  cardClassName,
  children,
  footnote,
}) => (
  <main className={cn('auth-page', scroll && 'auth-page-scroll')}>
    <section className={cn('auth-shell animate-slide-in', wide && 'auth-shell-wide')}>
      <header className="auth-header">
        <Link to="/" className="no-underline">
          <div className="auth-brand">
            NgiNep<span className="text-[var(--color-primary)]">.</span>
          </div>
        </Link>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </header>

      <Card className={cn('auth-card', cardClassName)}>
        <CardAccent />
        {children}
      </Card>

      {footnote && <p className="auth-footnote">{footnote}</p>}
    </section>
  </main>
);

export default AuthLayout;
