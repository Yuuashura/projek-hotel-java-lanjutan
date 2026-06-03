import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';

const PasswordField = ({ label, show, onToggleShow, icon: Icon, ...props }) => (
  <div className="space-y-2">
    <label className="label">{label}</label>
    <div className="relative">
      {Icon && <Icon size={16} className="absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[var(--color-muted)]" />}
      <Input className={Icon ? 'pl-11 pr-11' : 'pr-11'} type={show ? 'text' : 'password'} {...props} />
      <button
        type="button"
        onClick={onToggleShow}
        className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-[var(--color-muted)] transition hover:bg-[var(--color-primary-soft)] hover:text-[var(--color-text)]"
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  </div>
);

export default PasswordField;
