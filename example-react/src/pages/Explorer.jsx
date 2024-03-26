import React from 'react'
import { useArFS } from '../lib/arfs/arfs-context'
import Drive from './components/Drive'
import useWallet from '../lib/wallet-provider/useWallet'

export default function ExplorerPage() {
  const [drives, setDrives] = React.useState([])
  const { arfsClient } = useArFS()
  const { connected } = useWallet()

  React.useEffect(() => {
    if (connected) {
      fetchAllDrives()
    }
  }, [connected])

  async function fetchAllDrives() {
    try {
      const drives = await arfsClient.drive.listAll()
      console.log({ drives })
      setDrives(drives || [])
    } catch (error) {
      console.log({ error })
    }
  }
  return (
    <div className="w-full">
      <div className="m-4 rounded border-2 border-dashed border-slate-600 bg-slate-800">
        <div className="flex py-2 px-2">
          <h1 className="text-xl">Explorer</h1>
        </div>
      </div>
      <div className="p-4 min-h-[400px] gap-6 flex justify-start items-start m-4 rounded border-2 border-dashed border-slate-600 bg-slate-800">
        {drives.map((drive, idx) => (
          <Drive key={idx} instance={drive} />
        ))}
      </div>
    </div>
  )
}
