import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const buildPageNumbers = (page, totalPages) => {
  const maxButtons = 5;
  const half = Math.floor(maxButtons / 2);
  let start = Math.max(0, page - half);
  const end = Math.min(totalPages, start + maxButtons);

  if (end - start < maxButtons) {
    start = Math.max(0, end - maxButtons);
  }

  return Array.from({ length: end - start }, (_, index) => start + index);
};

const PaginationControls = ({ page, totalPages, totalItems, pageSize, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pageNumbers = buildPageNumbers(page, totalPages);
  const firstItem = page * pageSize + 1;
  const lastItem = Math.min((page + 1) * pageSize, totalItems);

  const buttonStyle = (active = false, disabled = false) => ({
    minWidth: 36,
    height: 36,
    padding: '0 0.7rem',
    border: active ? '1px solid var(--color-primary)' : '1px solid var(--color-accent)',
    borderRadius: 'var(--radius-sm)',
    background: active ? 'var(--color-primary)' : 'white',
    color: active ? 'white' : disabled ? 'var(--color-muted)' : 'var(--color-text)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.45 : 1,
    fontFamily: 'var(--font-body)',
    fontSize: '0.78rem',
    fontWeight: active ? 400 : 300,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.35rem',
  });

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
      <div style={{ color: 'var(--color-muted)', fontWeight: 300, fontSize: '0.82rem' }}>
        Halaman {page + 1} dari {totalPages} · Menampilkan {firstItem}-{lastItem} dari {totalItems} data · {pageSize} per halaman
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
          title="Halaman sebelumnya"
          style={buttonStyle(false, page === 0)}
        >
          <ChevronLeft size={14} /> Prev
        </button>

        {pageNumbers[0] > 0 && (
          <>
            <button type="button" onClick={() => onPageChange(0)} style={buttonStyle(page === 0)}>1</button>
            <span style={{ color: 'var(--color-muted)', padding: '0 0.25rem' }}>...</span>
          </>
        )}

        {pageNumbers.map(pageNumber => (
          <button
            key={pageNumber}
            type="button"
            onClick={() => onPageChange(pageNumber)}
            style={buttonStyle(pageNumber === page)}
          >
            {pageNumber + 1}
          </button>
        ))}

        {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
          <>
            <span style={{ color: 'var(--color-muted)', padding: '0 0.25rem' }}>...</span>
            <button type="button" onClick={() => onPageChange(totalPages - 1)} style={buttonStyle(page === totalPages - 1)}>{totalPages}</button>
          </>
        )}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages - 1}
          title="Halaman berikutnya"
          style={buttonStyle(false, page >= totalPages - 1)}
        >
          Next <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default PaginationControls;
