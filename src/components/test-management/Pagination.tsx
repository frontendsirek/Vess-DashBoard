import { cn } from '@/lib/utils'

type PaginationProps = {
  currentPage: number
  totalPages: number
  onChange: (page: number) => void
}

export function Pagination({ currentPage, totalPages, onChange }: PaginationProps) {
  const pages = buildPageList(currentPage, totalPages)

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-2 py-2"
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className={cn(
          'rounded-md px-2 py-1 text-[15px] font-normal leading-[18px] transition-colors',
          currentPage === 1
            ? 'text-vess-grey-400'
            : 'text-vess-grey-950 hover:text-vess-primary-500',
        )}
      >
        Prev
      </button>
      {pages.map((page, idx) =>
        page === 'ellipsis' ? (
          <span
            key={`ellipsis-${idx}`}
            className="px-2 text-vess-grey-500"
            aria-hidden
          >
            …
          </span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => onChange(page)}
            aria-current={page === currentPage ? 'page' : undefined}
            className={cn(
              'flex size-8 items-center justify-center rounded-md text-[15px] font-medium leading-[18px] transition-colors',
              page === currentPage
                ? 'bg-vess-primary-500 text-vess-grey-50'
                : 'text-vess-grey-950 hover:bg-vess-grey-100',
            )}
          >
            {page}
          </button>
        ),
      )}
      <button
        type="button"
        onClick={() => onChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className={cn(
          'rounded-md px-2 py-1 text-[15px] font-normal leading-[18px] transition-colors',
          currentPage === totalPages
            ? 'text-vess-grey-400'
            : 'text-vess-grey-950 hover:text-vess-primary-500',
        )}
      >
        Next
      </button>
    </nav>
  )
}

function buildPageList(
  current: number,
  total: number,
): Array<number | 'ellipsis'> {
  const result: Array<number | 'ellipsis'> = []
  const windowStart = Math.max(1, current - 2)
  const windowEnd = Math.min(total - 1, current + 2)

  for (let p = 1; p <= 3 && p <= total; p++) result.push(p)

  if (windowStart > 4) result.push('ellipsis')

  for (let p = Math.max(4, windowStart); p <= windowEnd; p++) {
    if (!result.includes(p)) result.push(p)
  }

  if (windowEnd < total - 1) result.push('ellipsis')

  if (total > 3) result.push(total)

  return result
}
