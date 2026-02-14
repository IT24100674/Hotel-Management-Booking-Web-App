import React from 'react'
import heroImage from '../assets/hero.jpg'
import { useNavigate } from 'react-router-dom'


const Hero = () => {
  const navigate = useNavigate()
  return (
    <div
      className='relative flex flex-col items-center justify-center text-white bg-no-repeat bg-cover bg-center h-screen'
      style={{ backgroundImage: `url(${heroImage})` }}
    >
      <div className='absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60'></div>

      <div className='relative z-10 text-center px-4 max-w-5xl mx-auto mt-16'>
        <h1 className='font-playfair text-5xl md:text-7xl lg:text-8xl font-bold mb-6 drop-shadow-lg leading-tight animate-[fadeIn_1s_ease-out]' style={{ color: '#c5a059' }}>
          Where comfort meets <span className="italic">the waves</span>
        </h1>
        <p className='text-lg md:text-xl lg:text-2xl mb-12 max-w-2xl mx-auto drop-shadow-md text-gray-200 animate-[slideUp_1s_ease-out_0.3s_both]'>
          Relax by the water, unwind in style. Your ideal escape is just a few clicks away.
        </p>

        {/* Search Bar / Booking Form */}
        <div className="glass-panel p-6 rounded-xl shadow-2xl grid grid-cols-1 md:grid-cols-4 gap-4 items-end max-w-5xl mx-auto text-gray-800 animate-[scaleUp_0.8s_ease-out_0.6s_both]">
          <div className="flex flex-col items-start w-full">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Check-in</label>
            <input type="date" className="w-full p-3 bg-white/80 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/50 text-gray-700 font-medium" />
          </div>
          <div className="flex flex-col items-start w-full">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Check-out</label>
            <input type="date" className="w-full p-3 bg-white/80 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/50 text-gray-700 font-medium" />
          </div>
          <div className="flex flex-col items-start w-full">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Guests</label>
            <select className="w-full p-3 bg-white/80 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/50 text-gray-700 font-medium">
              <option value="1">1 Guest</option>
              <option value="2">2 Guests</option>
              <option value="3">3 Guests</option>
              <option value="4">4+ Guests</option>
            </select>
          </div>
          <button
            onClick={() => navigate('/rooms')}
            className="w-full bg-secondary hover:bg-secondary-dark text-white font-medium rounded-lg px-6 py-3 h-[50px] text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
          >
            Search Availability
          </button>
        </div>
      </div>
    </div>
  )
}

export default Hero
