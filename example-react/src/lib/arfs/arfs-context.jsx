import * as React from 'react'
import { ArFS } from 'arfs-js'

const ArFSContext = React.createContext()

export function ArFSProvider({ children }) {
  const arfsClient = new ArFS({ wallet: 'use_wallet' })

  return <ArFSContext.Provider value={{ arfsClient }}>{children}</ArFSContext.Provider>
}

export function useArFS() {
  const context = React.useContext(ArFSContext)
  if (context === undefined) {
    throw new Error('useArFS must be used within a ArFSProvider')
  }

  return context
}
