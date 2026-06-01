import { X } from 'lucide-react';

const FilterBadge = ({ label, onClear }) => (
  <button
    type="button"
    className="badge"
    onClick={onClear}
    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.75rem', cursor: 'pointer' }}
  >
    {label} <X size={10} />
  </button>
);

export default FilterBadge;
