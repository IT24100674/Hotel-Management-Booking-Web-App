import React, { useEffect, useState } from 'react'
import Hero from '../componets/Hero'
import Card from '../componets/Card'
import { roomsDummyData, assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { Utensils } from 'lucide-react'

const Home = () => {
  const navigate = useNavigate()
  const [menuItems, setMenuItems] = useState([])

  const facilities = [
    {
      _id: 1,
      title: "Rooms",
      description: "Luxury accommodations for your perfect stay.",
      image: assets.roomImg1
    },
    {
      _id: 2,
      title: "Events",
      description: "Grand halls for weddings and conferences.",
      image: assets.event
    },
    {
      _id: 3,
      title: "Others",
      description: "Gym, Spa, and other premium facilities.",
      image: assets.others
    }
  ];

  useEffect(() => {
    fetchFeaturedMenu();
  }, []);

  const fetchFeaturedMenu = async () => {
    try {
      const { data, error } = await supabase
        .from('menu')
        .select('*')
        .eq('is_available', true)
        .eq('is_featured', true)
        .limit(3);

      if (error) throw error;
      if (data) setMenuItems(data);
    } catch (error) {
      console.error('Error fetching menu:', error);
    }
  };

  return (
    <>
      <Hero />

      {/* Featured Rooms Section */}
      <div className="py-16 px-4 md:px-16 lg:px-24 bg-white">
        <div className="text-center mb-12">
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-gray-800 mb-4">Facilities</h2>
          <p className="text-gray-600 max-w-xl mx-auto">Experience comfort and luxury in our handpicked selection.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {facilities.map((item) => (
            <div key={item._id} className="group relative h-[400px] overflow-hidden rounded-2xl cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-colors duration-300"></div>

              <div className="absolute bottom-0 left-0 p-8 w-full">
                <h3 className="text-2xl font-playfair font-bold text-white mb-3">{item.title}</h3>
                <p className="text-gray-200 text-sm mb-5">
                  {item.description}
                </p>

                <div>
                  <button
                    onClick={() => {
                      if (item.title === "Rooms") navigate('/rooms');
                      else alert("Feature coming soon!");
                    }}
                    className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-full transition-colors shadow-md"
                  >
                    View {item.title}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View Details button removed */}
      </div>

      {/* Featured Menu Section */}
      <div className="py-16 px-4 md:px-16 lg:px-24 bg-gray-50">
        <div className="text-center mb-12">
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-gray-800 mb-4">Our Delicious Menu</h2>
          <p className="text-gray-600 max-w-xl mx-auto">Savor the finest flavors prepared by our expert chefs.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-7xl mx-auto px-4">
          {menuItems.map((item) => (
            <div key={item.id} className="group relative h-[500px] w-full cursor-pointer overflow-hidden rounded-2xl shadow-xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">

              {/* Image Background */}
              <div className="absolute inset-0">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="h-full w-full bg-gray-800 flex items-center justify-center">
                    <Utensils size={64} className="text-gray-600" />
                  </div>
                )}
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-90"></div>
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-4 transition-transform duration-500 group-hover:translate-y-0">
                <span className="inline-block px-3 py-1 mb-4 text-xs font-bold tracking-widest text-amber-400 uppercase border border-amber-400/30 rounded-full bg-black/30 backdrop-blur-sm">
                  {item.category}
                </span>

                <h3 className="font-playfair text-3xl font-bold text-white mb-3 drop-shadow-lg">
                  {item.name}
                </h3>

                <p className="text-gray-200 text-sm leading-relaxed opacity-0 transform translate-y-4 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0 delay-100 line-clamp-3">
                  {item.description || 'A masterpiece of flavors, carefully crafted to delight your senses.'}
                </p>

                <div className="mt-6 border-t border-white/20 pt-4 opacity-0 transition-opacity duration-500 group-hover:opacity-100 delay-200">
                  <button onClick={() => navigate('/menu')} className="text-white text-sm font-semibold tracking-wide uppercase group-hover:text-amber-400 transition-colors flex items-center gap-2">
                    View Menu <span className="text-lg">→</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {menuItems.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <p>Loading tasty options...</p>
          </div>
        )}
      </div>
    </>
  )
}

export default Home
