import { useContext } from 'react'
import { UserSessionContext, type UserSessionContextType } from '../contexts/UserSessionContext'

export const useUserSession = (): UserSessionContextType => {
  const context = useContext(UserSessionContext)
  if (context === undefined) {
    throw new Error('useUserSession must be used within a UserSessionProvider')
  }
  return context
}