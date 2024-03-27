import { motion } from 'framer-motion'
import useWallet from '../lib/wallet-provider/useWallet'
import React, { useState } from 'react'
import { FaUserCircle } from 'react-icons/fa'

export const FloatingNav = () => {
  const { connected, reConnect } = useWallet()

  React.useEffect(() => {
    reConnect()
  }, [])

  return (
    <nav className="flex w-fit items-center gap-6 rounded-lg border-[1px] border-neutral-700 bg-slate-950 py-2 px-6 text-sm text-neutral-400">
      <NavLink>Refresh</NavLink>
      <NavLink>Deep-Refresh</NavLink>

      {!connected && <ConnectButton />}
      {connected && <UserButton />}
    </nav>
  )
}

const NavLink = ({ children }) => {
  return (
    <a href="#" rel="nofollow" className="block overflow-hidden">
      <motion.div whileHover={{ y: -20 }} transition={{ ease: 'backInOut', duration: 0.5 }} className="h-[20px]">
        <span className="flex h-[20px] items-center">{children}</span>
        <span className="flex h-[20px] items-center text-neutral-50">{children}</span>
      </motion.div>
    </a>
  )
}

const ConnectButton = () => {
  const { handleConnectionWithArConnect } = useWallet()

  return (
    <button
      onClick={handleConnectionWithArConnect}
      className={`
          relative z-0 flex items-center gap-2 overflow-hidden whitespace-nowrap rounded-lg border-[1px] 
          border-neutral-600 px-4 py-1.5 font-medium
         text-neutral-300 transition-all duration-300
         bg-slate-800
          before:absolute before:inset-0
          before:-z-10 before:translate-y-[200%]
          before:scale-[2.5]
          before:rounded-[100%] before:bg-indigo-600
          before:transition-transform before:duration-1000
          before:content-[""]
  
          hover:scale-105 hover:text-neutral-50
          hover:before:translate-y-[0%]
          active:scale-100`}
    >
      Connect
    </button>
  )
}

const UserButton = () => {
  const [open, setOpen] = useState(false)

  return (
    <motion.button
      className="text-xl bg-slate-800 hover:bg-slate-700 rounded-full transition-colors relative py-1.5"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setOpen(!open)}
    >
      <span className="block relative z-10">
        <FaUserCircle className="w-6 h-6 hover:text-white" />
      </span>
    </motion.button>
  )
}
