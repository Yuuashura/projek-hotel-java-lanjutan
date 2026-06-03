import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { usePreferences } from '../../context/PreferencesContext';

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
  const pageButtonClass = (active = false) => cn(
    'h-9 min-w-9 px-3 text-xs',
    active && 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]',
  );

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
      <div className="text-sm font-medium text-[var(--color-muted)]">
        {t('admin.pagination.page', { page: page + 1, totalPages })} - {t('admin.pagination.showing', { first: firstItem, last: lastItem, total: totalItems })} - {t('admin.pagination.perPage', { pageSize })}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
          title={t('admin.pagination.previous')}
          className="h-9 px-3 text-xs"
        >
          <ChevronLeft size={14} /> {t('admin.pagination.prevShort')}
        </Button>

        {pageNumbers[0] > 0 && (
          <>
            <Button type="button" variant="secondary" size="sm" onClick={() => onPageChange(0)} className={pageButtonClass(page === 0)}>
              1
            </Button>
            <span className="px-1 text-[var(--color-muted)]">...</span>
          </>
        )}

        {pageNumbers.map(pageNumber => (
          <Button
            key={pageNumber}
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onPageChange(pageNumber)}
            className={pageButtonClass(pageNumber === page)}
          >
            {pageNumber + 1}
          </Button>
        ))}

        {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
          <>
            <span className="px-1 text-[var(--color-muted)]">...</span>
            <Button type="button" variant="secondary" size="sm" onClick={() => onPageChange(totalPages - 1)} className={pageButtonClass(page === totalPages - 1)}>
              {totalPages}
            </Button>
          </>
        )}

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages - 1}
          title={t('admin.pagination.next')}
          className="h-9 px-3 text-xs"
        >
          {t('admin.pagination.nextShort')} <ChevronRight size={14} />
        </Button>
      </div>
    </div>
  );
};

export default PaginationControls;
