import * as React from 'react'
import { getArFSClient } from '../../utils/getArFSClient'
import useWallet from '../wallet-provider/useWallet'

const ArFSContext = React.createContext()

export function ArFSProvider({ children }) {
  const [arfsClient, setArfsClient] = React.useState({})
  const { connected } = useWallet()

  React.useEffect(() => {
    if(connected){
      const client = getArFSClient()
      setArfsClient(client)
    }
  }, [connected])

  return <ArFSContext.Provider value={{ arfsClient }}>{children}</ArFSContext.Provider>
}

export function useArFS() {
  const context = React.useContext(ArFSContext)
  if (context === undefined) {
    throw new Error('useArFS must be used within a ArFSProvider')
  }

  return context
}
