import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ArFSProvider } from './lib/arfs/arfs-context.jsx'
import WalletProvider from './lib/wallet-provider/Provider.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WalletProvider>
      <ArFSProvider>
        <App />
      </ArFSProvider>
    </WalletProvider>
  </React.StrictMode>
)
