import { FaHardDrive } from 'react-icons/fa6'
import { motion } from 'framer-motion'

export default function Drive({ instance, handleDriveClick }) {
  return (
    <motion.div
      onClick={() => handleDriveClick(instance)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="cursor-pointer flex flex-col items-center gap-2 hover:bg-slate-700 p-4 rounded-md h-full text-neutral-200 hover:text-white transition-colors"
    >
      <div className="hover:text-inherit text-inherit">
        <FaHardDrive className="w-16 h-16 hover:text-inherit text-inherit" />
      </div>
      <div className="hover:text-inherit text-inherit">
        <h3 className="text-xl font-medium tracking-wide">{instance?.name || 'unknown'}</h3>
      </div>
    </motion.div>
  )
}
