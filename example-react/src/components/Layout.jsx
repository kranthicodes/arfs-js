import { FloatingNav } from './FloatingNav'
import SideNav from './Sidebar'

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen min-w-screen bg-slate-900 text-slate-100">
      <SideNav />
      <div className="w-full">
        <div className="p-4 w-full flex justify-center">
          <FloatingNav />
        </div>
        {children}
      </div>
    </div>
  )
}
