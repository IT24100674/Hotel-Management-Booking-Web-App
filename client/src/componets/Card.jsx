import React from 'react'
import { useNavigate } from 'react-router-dom'

const Card = ({ title, description, image }) => {
  const navigate = useNavigate()
  return (
    <div className="w-80 min-h-[420px] p-4 bg-white border border-gray-200 hover:-translate-y-1 transition duration-300 rounded-lg shadow shadow-black/10 flex flex-col">
      <img className="rounded-md h-40 w-full object-cover shrink-0" src={image} alt={title} />
      <p className="text-gray-900 text-xl font-semibold ml-2 mt-4 shrink-0">
        {title}
      </p>
      <p className="text-zinc-400 text-sm/6 mt-2 ml-2 mb-2 line-clamp-3 flex-1 min-h-0">
        {description}
      </p>
      <div className="mt-auto mb-3 ml-2">
        <button onClick={()=> navigate("/rooms")}
          type="button"
          className="bg-indigo-600 hover:bg-indigo-700 transition cursor-pointer px-6 py-2 font-medium rounded-md text-white text-sm"
        >
          Book Now
        </button>
      </div>
    </div>
  )
}

export default Card