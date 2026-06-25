import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import useAuth from '../../hooks/useAuth'
import ProtectedRoute from './ProtectedRoute'
import type { AuthContextValue } from '../../context/authContextObject'

vi.mock('../../hooks/useAuth')

const authMock = (
  overrides: Partial<AuthContextValue>,
): AuthContextValue => ({
  admin: null,
  isAuthenticated: false,
  isLoading: false,
  login: vi.fn(),
  logout: vi.fn(),
  updateAdmin: vi.fn(),
  ...overrides,
})

function renderProtectedRoute(initialPath = '/admin/membres') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/admin/login" element={<h1>Connexion</h1>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/admin/membres" element={<h1>Membres privés</h1>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReset()
  })

  it('affiche un état de chargement pendant la restauration de session', () => {
    vi.mocked(useAuth).mockReturnValue(authMock({
      isAuthenticated: false,
      isLoading: true,
    }))

    renderProtectedRoute()

    expect(
      screen.getByRole('status', { name: /vérification de la session/i }),
    ).toBeInTheDocument()
  })

  it('redirige un visiteur non authentifié vers la connexion', () => {
    vi.mocked(useAuth).mockReturnValue(authMock({
      isAuthenticated: false,
      isLoading: false,
    }))

    renderProtectedRoute()

    expect(
      screen.getByRole('heading', { name: 'Connexion' }),
    ).toBeInTheDocument()
    expect(screen.queryByText('Membres privés')).not.toBeInTheDocument()
  })

  it('affiche la page privée lorsque la session est valide', () => {
    vi.mocked(useAuth).mockReturnValue(authMock({
      isAuthenticated: true,
      isLoading: false,
    }))

    renderProtectedRoute()

    expect(
      screen.getByRole('heading', { name: 'Membres privés' }),
    ).toBeInTheDocument()
  })
})
