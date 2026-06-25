import { useContext } from 'react'
import { AuthContext } from '../context/authContextObject'
import type { AuthContextValue } from '../context/authContextObject'

function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth doit être utilisé dans AuthProvider')
  }

  return context
}

export default useAuth
