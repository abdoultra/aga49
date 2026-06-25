import { useState } from 'react'

function usePagination<T>(items: T[], pageSize = 8) {
  const [requestedPage, setRequestedPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const page = Math.min(requestedPage, totalPages)
  const start = (page - 1) * pageSize

  const setPage = (nextPage: number) => {
    setRequestedPage(Math.min(Math.max(nextPage, 1), totalPages))
  }

  return {
    page,
    setPage,
    totalPages,
    paginatedItems: items.slice(start, start + pageSize),
  }
}

export default usePagination
