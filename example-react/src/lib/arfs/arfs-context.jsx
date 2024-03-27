import * as React from 'react'
import { getArFSClient } from '../../utils/getArFSClient'

const ArFSContext = React.createContext()

export function ArFSProvider({ children }) {
  const arfsClient = getArFSClient()

  return <ArFSContext.Provider value={{ arfsClient }}>{children}</ArFSContext.Provider>
}

export function useArFS() {
  const context = React.useContext(ArFSContext)
  if (context === undefined) {
    throw new Error('useArFS must be used within a ArFSProvider')
  }

  return context
}
