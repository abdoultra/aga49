import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Pagination from './Pagination'

describe('Pagination', () => {
  it('reste invisible lorsqu’une seule page suffit', () => {
    const { container } = render(
      <Pagination page={1} totalPages={1} onPageChange={() => {}} />,
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('demande la page suivante et bloque la page précédente au début', () => {
    const onPageChange = vi.fn()
    render(
      <Pagination page={1} totalPages={3} onPageChange={onPageChange} />,
    )

    expect(
      screen.getByRole('button', { name: 'Page précédente' }),
    ).toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: 'Page suivante' }))

    expect(onPageChange).toHaveBeenCalledWith(2)
  })
})
