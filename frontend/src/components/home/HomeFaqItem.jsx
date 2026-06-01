import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const HomeFaqItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ borderBottom: '1px solid var(--color-accent)', background: 'transparent', transition: 'all 0.3s ease' }}>
      <button onClick={() => setOpen(!open)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 0', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
        <span style={{ fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: '1rem', color: 'var(--color-text)' }}>{q}</span>
        <ChevronDown size={18} style={{ flexShrink: 0, color: 'var(--color-muted)', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }} />
      </button>
      <div style={{ maxHeight: open ? '200px' : '0px', overflow: 'hidden', transition: 'max-height 0.3s ease-out' }}>
        <p style={{ paddingBottom: '1.5rem', color: 'var(--color-muted)', fontWeight: 300, lineHeight: 1.7, fontSize: '0.9rem' }}>{a}</p>
      </div>
    </div>
  );
};

export default HomeFaqItem;
