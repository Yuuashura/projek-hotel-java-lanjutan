import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, X } from 'lucide-react';

const CitySearchSelect = ({ cities, value, onChange, placeholder = "Pilih Kota", style = {} }) => {
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

  const selectedCity = cities.find(c => String(c.id_city || c.id) === String(value));

  // Sync search input when selected city changes
  useEffect(() => {
    if (selectedCity && !isOpen) {
      setSearch(selectedCity.name);
    } else if (!value) {
      setSearch('');
    }
  }, [value, selectedCity, isOpen]);

  const filteredCities = cities.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    (c.province && c.province.toLowerCase().includes(search.toLowerCase()))
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
    <div ref={containerRef} style={{ position: 'relative', width: '100%', ...style }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input
          type="text"
          className="input"
          style={{
            width: '100%',
            paddingRight: '3rem',
            border: 'none',
            borderBottom: '1px solid var(--color-accent)',
            background: 'transparent',
            borderRadius: 0,
            color: 'var(--color-text)',
            fontSize: '0.9rem',
            paddingLeft: 0,
            height: '100%',
            minHeight: '38px',
          }}
          placeholder={placeholder}
          value={search}
          onFocus={() => {
            setIsOpen(true);
            setSearch(''); // clear search on focus so user can type to search
          }}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
        />
        {value ? (
          <button
            type="button"
            onClick={handleClear}
            style={{
              position: 'absolute',
              right: '1.5rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-muted)',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={14} />
          </button>
        ) : null}
        <ChevronDown
          size={14}
          style={{
            position: 'absolute',
            right: 0,
            color: 'var(--color-muted)',
            pointerEvents: 'none',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
          }}
        />
      </div>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-accent)',
            borderRadius: 'var(--radius-sm)',
            boxShadow: 'var(--shadow-float)',
            maxHeight: '200px',
            overflowY: 'auto',
            zIndex: 9999,
            marginTop: '4px',
          }}
        >
          {filteredCities.length > 0 ? (
            filteredCities.map((city) => {
              const id = city.id_city || city.id;
              const isSelected = String(id) === String(value);
              return (
                <div
                  key={id}
                  onClick={() => handleSelect(city)}
                  style={{
                    padding: '0.75rem 1rem',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    color: isSelected ? 'var(--color-primary)' : 'var(--color-text)',
                    backgroundColor: isSelected ? 'rgba(212,175,55,0.05)' : 'transparent',
                    borderBottom: '1px solid rgba(212,175,55,0.05)',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(212,175,55,0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = isSelected ? 'rgba(212,175,55,0.05)' : 'transparent';
                  }}
                >
                  <div style={{ fontWeight: 400 }}>{city.name}</div>
                  {city.province && (
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-muted)', fontWeight: 300 }}>
                      {city.province}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: 'var(--color-muted)', textAlign: 'center' }}>
              Tidak ada kota ditemukan
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CitySearchSelect;
