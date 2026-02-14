import React from 'react'
import heroImage from '../assets/hero.jpg'


const Hero = () => {
  return (
    <div
      className='relative flex flex-col items-center justify-center text-white bg-no-repeat bg-cover bg-center h-screen'
      style={{ backgroundImage: `url(${heroImage})` }}
    >
      <div className='absolute inset-0 bg-black/40'></div>

      <div className='relative z-10 text-center px-4 max-w-4xl mx-auto'>
        <h1 className='font-playfair text-4xl md:text-6xl lg:text-7xl font-bold mb-6 drop-shadow-lg leading-tight'>
          Where comfort meets the waves
        </h1>
        <p className='text-lg md:text-xl lg:text-2xl mb-10 max-w-2xl mx-auto drop-shadow-md'>
          Relax by the water, unwind in style. Your ideal escape is just a few clicks away.
        </p>

        {/* Search Bar / Booking Form */}
        <div className="bg-white p-4 rounded-lg shadow-xl grid grid-cols-1 md:grid-cols-4 gap-4 items-end max-w-4xl mx-auto text-gray-800">
          <div className="flex flex-col items-start w-full">
            <label className="text-sm font-semibold text-gray-600 mb-1">Check-in</label>
            <input type="date" className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-indigo-500" />
          </div>
          <div className="flex flex-col items-start w-full">
            <label className="text-sm font-semibold text-gray-600 mb-1">Check-out</label>
            <input type="date" className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-indigo-500" />
          </div>
          <div className="flex flex-col items-start w-full">
            <label className="text-sm font-semibold text-gray-600 mb-1">Guests</label>
            <select className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-indigo-500 bg-white">
              <option value="1">1 Guest</option>
              <option value="2">2 Guests</option>
              <option value="3">3 Guests</option>
              <option value="4">4+ Guests</option>
            </select>
          </div>
          <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-300 h-[42px]">
            Search
          </button>
        </div>
      </div>
    </div>
  )
}

export default Hero
