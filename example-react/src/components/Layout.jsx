import { Navbar } from './Navbar'
import SideNav from './Sidebar'

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen min-w-screen bg-slate-900 text-slate-100">
      <SideNav />
      <div className="w-full">
        <Navbar />
        {children}
      </div>
    </div>
  )
}
