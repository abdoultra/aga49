import { ChevronLeft, ChevronRight } from 'lucide-react'
import './Pagination.css'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  return (
    <nav className="pagination" aria-label="Pagination">
      <button
        type="button"
        aria-label="Page précédente"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft size={17} />
      </button>
      <span>
        Page <strong>{page}</strong> sur {totalPages}
      </span>
      <button
        type="button"
        aria-label="Page suivante"
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        <ChevronRight size={17} />
      </button>
    </nav>
  )
}

export default Pagination
