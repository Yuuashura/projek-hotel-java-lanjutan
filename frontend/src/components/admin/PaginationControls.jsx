import { ChevronLeft, ChevronRight } from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';
import { cn } from '../../lib/utils';

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
  const { t } = usePreferences();

  if (totalPages <= 1) return null;

  const pageNumbers = buildPageNumbers(page, totalPages);
  const firstItem = page * pageSize + 1;
  const lastItem = Math.min((page + 1) * pageSize, totalItems);

  const buttonClass = (active = false) => cn(
    'inline-flex h-9 min-w-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-3',
    'font-[var(--font-body)] text-[0.78rem] font-light transition disabled:cursor-not-allowed disabled:opacity-45',
    active
      ? 'border-[var(--color-primary)] bg-[var(--color-primary)] font-normal text-white'
      : 'border-[var(--color-accent)] bg-[var(--color-surface)] text-[var(--color-text)]',
  );

  return (
    <div className="[display:flex] [justify-content:space-between] [align-items:center] [gap:1rem] [flex-wrap:wrap] [margin-top:1rem]">
      <div className="[color:var(--color-muted)] [font-weight:300] [font-size:0.82rem]">
        {t('admin.pagination.page', { page: page + 1, totalPages })} · {t('admin.pagination.showing', { first: firstItem, last: lastItem, total: totalItems })} · {t('admin.pagination.perPage', { pageSize })}
      </div>

      <div className="[display:flex] [align-items:center] [gap:0.35rem] [flex-wrap:wrap]">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
          title={t('admin.pagination.previous')}
          className={buttonClass()}>

          <ChevronLeft size={14} /> {t('admin.pagination.prevShort')}
        </button>

        {pageNumbers[0] > 0 &&
        <>
            <button type="button" onClick={() => onPageChange(0)} className={buttonClass(page === 0)}>1</button>
            <span className="[color:var(--color-muted)] [padding:0_0.25rem]">...</span>
          </>
        }

        {pageNumbers.map((pageNumber) =>
        <button
          key={pageNumber}
          type="button"
          onClick={() => onPageChange(pageNumber)}
          className={buttonClass(pageNumber === page)}>

            {pageNumber + 1}
          </button>
        )}

        {pageNumbers[pageNumbers.length - 1] < totalPages - 1 &&
        <>
            <span className="[color:var(--color-muted)] [padding:0_0.25rem]">...</span>
            <button type="button" onClick={() => onPageChange(totalPages - 1)} className={buttonClass(page === totalPages - 1)}>{totalPages}</button>
          </>
        }

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages - 1}
          title={t('admin.pagination.next')}
          className={buttonClass()}>

          {t('admin.pagination.nextShort')} <ChevronRight size={14} />
        </button>
      </div>
    </div>);

};

export default PaginationControls;
