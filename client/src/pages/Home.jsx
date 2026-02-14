import React, { useEffect, useState } from 'react'
import Hero from '../componets/Hero'
import Testimonials from '../componets/Testimonials'
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

      {/* Facilities Section */}
      <section className="section-padding bg-white relative">
        <div className="container-custom">
          <div className="text-center mb-16">
            <span className="text-secondary font-medium tracking-widest uppercase text-sm mb-2 block">Our Amenities</span>
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-gray-900 mb-6">Experience Luxury</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Immerse yourself in a world of comfort with our premium facilities designed for your relaxation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {facilities.map((item) => (
              <div key={item._id} className="group relative h-[500px] overflow-hidden rounded-2xl cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent transition-opacity duration-300"></div>

                <div className="absolute bottom-0 left-0 p-8 w-full translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <h3 className="text-3xl font-playfair font-bold mb-2" style={{ color: '#ffffff' }}>{item.title}</h3>
                  <div className="w-12 h-1 bg-secondary mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100"></div>
                  <p className="text-gray-100 text-sm mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
                    {item.description}
                  </p>

                  <button
                    onClick={() => {
                      if (item.title === "Rooms") navigate('/rooms');
                      else alert("Feature coming soon!");
                    }}
                    className="btn-secondary py-2 px-6 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-300 transform translate-y-4 group-hover:translate-y-0"
                  >
                    Explore {item.title}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Menu Section */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <span className="text-secondary font-medium tracking-widest uppercase text-sm mb-2 block">Culinary Delights</span>
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-gray-900 mb-6">Exquisite Dining</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Savor the finest flavors prepared by our expert chefs using locally sourced ingredients.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {menuItems.map((item) => (
              <div key={item.id} className="group relative h-[450px] w-full cursor-pointer overflow-hidden rounded-2xl shadow-lg transition-all duration-500 hover:shadow-xl">

                {/* Image Background */}
                <div className="absolute inset-0">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                      <Utensils size={64} className="text-gray-400" />
                    </div>
                  )}
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-90 transition-opacity duration-300"></div>
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <span className="inline-block px-3 py-1 mb-3 text-xs font-bold tracking-widest text-secondary uppercase border border-secondary/50 rounded-full bg-black/40 backdrop-blur-sm">
                    {item.category}
                  </span>

                  <h3 className="font-playfair text-2xl font-bold mb-2 group-hover:text-secondary transition-colors" style={{ color: '#ffffff' }}>
                    {item.name}
                  </h3>

                  <p className="text-sm leading-relaxed mb-6 line-clamp-3 group-hover:text-white transition-colors" style={{ color: '#e5e7eb' }}>
                    {item.description || 'A masterpiece of flavors, carefully crafted to delight your senses.'}
                  </p>

                  <button onClick={() => navigate('/menu')} className="text-white text-sm font-semibold tracking-wide uppercase hover:text-secondary transition-colors flex items-center gap-2 group-hover:gap-3">
                    View Menu <span className="text-lg">→</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {menuItems.length === 0 && (
            <div className="text-center py-12">
              <div className="inline-block p-6 rounded-full bg-gray-100 text-gray-400 mb-4 animate-pulse">
                <Utensils size={32} />
              </div>
              <p className="text-gray-500 font-medium">Preparing our menu selection...</p>
            </div>
          )}

          <div className="text-center mt-12">
            <button onClick={() => navigate('/menu')} className="btn-outline inline-flex">
              View Full Menu
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <Testimonials />
    </>
  )
}

export default Home
