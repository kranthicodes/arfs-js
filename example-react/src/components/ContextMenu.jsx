import { FaEye, FaEdit, FaGlobe } from 'react-icons/fa'

const ContextMenu = ({ selectedInstance, handleEntityDetailsClick }) => {
  const { id } = selectedInstance || {}

  function handleInspectViewBlock() {
    if (!id) return

    window.open(`https://viewblock.io/arweave/tx/${id}`, '_blank')
  }

  return (
    <div className={`z-20 w-80 rounded-md bg-slate-900 text-neutral-300`}>
      <button onClick={handleEntityDetailsClick} className="w-full px-5 py-3 hover:bg-indigo-500 duration-200 flex space-x-4 items-center">
        <FaEye />
        <span>View Detail</span>
      </button>
      <button className="w-full px-5 py-3 hover:bg-indigo-500 duration-200 flex space-x-4 items-center">
        <FaEdit />
        <span>Rename</span>
      </button>
      <button
        onClick={handleInspectViewBlock}
        className="w-full px-5 py-3 hover:bg-indigo-500 duration-200 flex space-x-4 items-center"
      >
        <FaGlobe />
        <span>Inspect on Viewblock</span>
      </button>
    </div>
  )
}

export default ContextMenu
