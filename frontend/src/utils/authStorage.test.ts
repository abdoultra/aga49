import { beforeEach, describe, expect, it } from 'vitest'
import {
  clearSession,
  getStoredAdmin,
  getStoredToken,
  storeSession,
} from './authStorage'
import type { Admin } from '../types/api'

describe('authStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('enregistre et relit une session administrateur', () => {
    const admin: Admin = {
      _id: 'admin-1',
      id: 'admin-1',
      nom: '',
      prenom: 'Aminata',
      email: '',
      role: 'super_admin',
    }

    storeSession({ token: 'jwt-test', admin })

    expect(getStoredToken()).toBe('jwt-test')
    expect(getStoredAdmin()).toEqual(admin)
  })

  it('nettoie une session complète', () => {
    storeSession({
      token: 'jwt-test',
      admin: {
        _id: 'admin-1',
        id: 'admin-1',
        nom: '',
        prenom: '',
        email: '',
        role: 'admin',
      },
    })

    clearSession()

    expect(getStoredToken()).toBeNull()
    expect(getStoredAdmin()).toBeNull()
  })

  it('supprime une valeur administrateur illisible', () => {
    localStorage.setItem('aga_admin', '{invalide')

    expect(getStoredAdmin()).toBeNull()
    expect(localStorage.getItem('aga_admin')).toBeNull()
  })
})
