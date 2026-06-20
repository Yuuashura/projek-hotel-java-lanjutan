import { useState, useEffect, useRef } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { cn } from '../lib/utils';

const CitySearchSelect = ({ cities, value, onChange, placeholder = "Pilih Kota", className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const selectedCity = cities.find((c) => String(c.id_city || c.id) === String(value));

  // Sync search input when selected city changes
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (selectedCity && !isOpen) setSearch(selectedCity.name);
      else if (!value) setSearch('');
    }, 0);
    return () => window.clearTimeout(timer);
  }, [value, selectedCity, isOpen]);

  const filteredCities = cities.filter((c) =>
  c.name.toLowerCase().includes(search.toLowerCase()) ||
  c.province && c.province.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (city) => {
    const cityId = city.id_city || city.id;
    onChange(cityId);
    setSearch(city.name);
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setSearch('');
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <div className="[position:relative] [display:flex] [align-items:center]">
        <input
          type="text"
          className="input [width:100%] [padding-right:3rem] [border:none] [border-bottom:1px_solid_var(--color-accent)] [background:transparent] [border-radius:0] [color:var(--color-text)] [font-size:0.9rem] [font-weight:400] [padding-left:0] [height:100%] [min-height:38px]"














          placeholder={placeholder}
          value={search}
          onFocus={() => {
            setIsOpen(true);
            setSearch(''); // clear search on focus so user can type to search
          }}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }} />
        
        {value ?
        <button
          type="button"
          onClick={handleClear} className="[position:absolute] [right:1.5rem] [background:none] [border:none] [cursor:pointer] [color:var(--color-muted)] [padding:0] [display:flex] [align-items:center]">











          
            <X size={14} />
          </button> :
        null}
        <ChevronDown
          size={14}
          className={cn('pointer-events-none absolute right-0 text-[var(--color-muted)] transition-transform', isOpen && 'rotate-180')} />
        
      </div>

      {isOpen &&
      <div className="[position:absolute] [top:100%] [left:0] [right:0] [background-color:var(--color-surface-solid)] [border:1px_solid_var(--color-accent)] [border-radius:var(--radius-sm)] [box-shadow:var(--shadow-float)] [max-height:200px] [overflow-y:auto] [z-index:9999] [margin-top:4px]">














        
          {filteredCities.length > 0 ?
        filteredCities.map((city) => {
          const id = city.id_city || city.id;
          const isSelected = String(id) === String(value);
          return (
            <div
              key={id}
              onClick={() => handleSelect(city)}
              className={cn(
                'cursor-pointer border-b border-[rgba(212,175,55,0.05)] px-4 py-3 text-left text-[0.85rem] transition hover:bg-[rgba(212,175,55,0.08)]',
                isSelected ? 'bg-[rgba(212,175,55,0.05)] text-[var(--color-primary)]' : 'bg-transparent text-[var(--color-text)]',
              )}>
              
                  <div className="[font-weight:400]">{city.name}</div>
                  {city.province &&
              <div className="[font-size:0.7rem] [color:var(--color-muted)] [font-weight:300]">
                      {city.province}
                    </div>
              }
                </div>);

        }) :

        <div className="[padding:0.75rem_1rem] [font-size:0.85rem] [color:var(--color-muted)] [text-align:center]">
              Tidak ada kota ditemukan
            </div>
        }
        </div>
      }
    </div>);

};

export default CitySearchSelect;
