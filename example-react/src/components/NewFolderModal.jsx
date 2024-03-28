import { AnimatePresence, motion } from 'framer-motion'
import React from 'react'
import { FiFolder } from 'react-icons/fi'
import { useGlobalStore } from '../store/globalStore'
import BarLoader from './BarLoader'

const NewFolderModal = ({ isOpen, setIsOpen }) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [name, setName] = React.useState('')
  const [createFolder] = useGlobalStore((state) => [state.explorerActions.createFolder])

  async function handleSubmit() {
    if (!name) return

    setIsSubmitting(true)
    await createFolder(name)
    setIsSubmitting(false)

    setIsOpen(false)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="bg-slate-900/20 backdrop-blur p-8 fixed inset-0 z-50 grid place-items-center overflow-y-scroll cursor-pointer"
        >
          <motion.div
            initial={{ scale: 0, rotate: '0deg' }}
            animate={{ scale: 1, rotate: '0deg' }}
            exit={{ scale: 0, rotate: '0deg' }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-br from-violet-600 to-indigo-600 text-white p-6 rounded-lg w-full max-w-lg shadow-xl cursor-default relative overflow-hidden"
          >
            <FiFolder className="text-white/10 rotate-12 text-[250px] absolute z-0 -top-24 -left-24" />
            <div className="relative z-10">
              <div className="bg-white w-16 h-16 mb-2 rounded-full text-3xl text-indigo-600 grid place-items-center mx-auto">
                <FiFolder />
              </div>
              <h3 className="text-3xl font-bold text-center mb-2">Create a New Folder</h3>
              <div className="flex py-4">
                <input
                  value={name}
                  onChange={(evt) => setName(evt.target.value)}
                  type="text"
                  placeholder="Your folder name..."
                  className={`bg-indigo-700 transition-colors duration-[750ms] placeholder-white/70 p-2 rounded-md w-full focus:outline-0`}
                />
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setIsOpen(false)}
                  className="bg-transparent hover:bg-white/10 transition-colors text-white font-semibold w-full py-2 rounded"
                >
                  Nah, go back
                </button>
                <button
                  disabled={isSubmitting}
                  onClick={handleSubmit}
                  className="bg-white hover:opacity-90 transition-opacity text-indigo-600 font-semibold w-full py-2 rounded flex justify-center"
                >
                  {!isSubmitting && 'Lets go!'}
                  {isSubmitting && <BarLoader />}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default NewFolderModal
