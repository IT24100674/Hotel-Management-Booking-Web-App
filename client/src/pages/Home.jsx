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
  const [faqs, setFaqs] = useState([])

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
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/faqs');
      const data = await res.json();
      if (res.ok) {
        // Show top 4 active FAQs on home page
        setFaqs(data.filter(f => f.is_active).slice(0, 4));
      }
    } catch (err) {
      console.error('Error fetching FAQs for home:', err);
    }
  };

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
      <section className="section-padding bg-white relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-50/30 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-50/30 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2"></div>

        <div className="container-custom relative z-10">
          <div className="text-center mb-20">
            <div className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-[0.3em] text-secondary uppercase border-b-2 border-secondary/20 bg-secondary/5 rounded-t-lg">
              Our Amenities
            </div>
            <h2 className="font-playfair text-5xl md:text-6xl font-black text-gray-900 mb-8 leading-tight">
              Experience <span className="text-secondary italic">Luxury</span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-secondary to-transparent mx-auto mb-8"></div>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg font-medium leading-relaxed">
              Immerse yourself in a world of comfort with our premium facilities designed for your ultimate relaxation and unforgettable moments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {facilities.map((item) => (
              <div key={item._id} className="group relative h-[550px] overflow-hidden rounded-[2.5rem] cursor-pointer shadow-2xl transition-all duration-700 hover:-translate-y-3">
                {/* Image Component with Zoom Effect */}
                <div className="absolute inset-0 scale-100 group-hover:scale-110 transition-transform duration-[1.5s] ease-out">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* sophisticated Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500"></div>

                {/* Corner Accent */}
                <div className="absolute top-6 left-6 w-12 h-12 border-t-2 border-l-2 border-white/20 rounded-tl-xl transition-all duration-500 group-hover:w-16 group-hover:h-16 group-hover:border-secondary"></div>

                <div className="absolute inset-x-0 bottom-0 p-10 flex flex-col items-start translate-y-12 group-hover:translate-y-0 transition-transform duration-700 ease-in-out">
                  <div className="mb-4">
                    <span className="text-xs font-bold tracking-widest text-secondary uppercase bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                      Top Rated
                    </span>
                  </div>

                  <h3 className="text-4xl font-playfair font-black mb-4 text-white drop-shadow-lg tracking-tight">
                    {item.title}
                  </h3>

                  <div className="w-0 h-[3px] bg-secondary mb-6 transition-all duration-700 ease-in-out group-hover:w-20"></div>

                  <p className="text-gray-200/90 text-sm leading-relaxed mb-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 font-medium">
                    {item.description}
                  </p>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (item.title === "Rooms") navigate('/rooms');
                      else if (item.title === "Events") navigate('/event-packages');
                      else navigate('/facilities');
                    }}
                    className="relative px-8 py-3 bg-white text-gray-950 text-xs font-black uppercase tracking-widest rounded-full overflow-hidden group/btn transition-all duration-300 transform translate-y-8 group-hover:translate-y-0 shadow-xl opacity-0 group-hover:opacity-100"
                  >
                    <span className="relative z-10">Explore {item.title}</span>
                    <div className="absolute inset-0 bg-secondary translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
                  </button>
                </div>

                {/* Glass Badge for Item Count or Feature (Optional) */}
                <div className="absolute top-8 right-8">
                  <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-lg border border-white/20 flex items-center justify-center text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-all duration-500 rotate-45 group-hover:rotate-0">
                    {item._id === 1 ? '5★' : item._id === 2 ? 'GF' : '24h'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Menu Section */}
      <section className="section-padding bg-gray-50/50 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-1/2 left-0 w-[600px] h-[600px] bg-amber-50/20 rounded-full blur-[100px] -translate-y-1/2 -translate-x-1/2"></div>

        <div className="container-custom relative z-10">
          <div className="text-center mb-20">
            <div className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-[0.3em] text-amber-600 uppercase border-b-2 border-amber-600/20 bg-amber-50 rounded-t-lg">
              Culinary Delights
            </div>
            <h2 className="font-playfair text-5xl md:text-6xl font-black text-gray-900 mb-8 leading-tight">
              Exquisite <span className="text-amber-600 italic">Dining</span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-amber-600 to-transparent mx-auto mb-8"></div>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg font-medium leading-relaxed">
              Savor the finest flavors prepared by our expert chefs using locally sourced ingredients, crafted to perfection for your palate.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {menuItems.map((item) => (
              <div key={item.id} className="group relative h-[500px] w-full cursor-pointer overflow-hidden rounded-[2.5rem] shadow-xl transition-all duration-700 hover:-translate-y-3 hover:shadow-2xl">
                {/* Image Background with Ken Burns effect */}
                <div className="absolute inset-0 scale-100 group-hover:scale-110 transition-transform duration-[2s] ease-out">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                      <Utensils size={64} className="text-gray-300" />
                    </div>
                  )}
                </div>

                {/* sophisticated Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500"></div>

                {/* Content Container */}
                <div className="absolute inset-0 p-10 flex flex-col justify-end">
                  <div className="mb-4 transform -translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                    <span className="inline-block px-4 py-1.5 text-[10px] font-black tracking-[0.2em] text-white uppercase border border-white/30 rounded-full bg-white/10 backdrop-blur-md">
                      {item.category}
                    </span>
                  </div>

                  <h3 className="font-playfair text-3xl font-black mb-3 text-white tracking-tight group-hover:text-amber-400 transition-colors duration-300">
                    {item.name}
                  </h3>

                  <div className="w-12 h-0.5 bg-amber-500 mb-6 transition-all duration-500 group-hover:w-24"></div>

                  <p className="text-sm leading-relaxed mb-8 line-clamp-2 text-gray-300 group-hover:text-white transition-colors duration-300 font-medium">
                    {item.description || 'A masterpiece of flavors, carefully crafted to delight your senses.'}
                  </p>

                  <button
                    onClick={() => navigate('/menu')}
                    className="flex items-center gap-3 text-white text-xs font-black tracking-[0.2em] uppercase group/link"
                  >
                    <span className="relative">
                      View Menu
                      <span className="absolute -bottom-1 left-0 w-full h-px bg-white/20 group-hover/link:bg-white transition-colors"></span>
                    </span>
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md group-hover/link:bg-amber-500 group-hover/link:text-gray-900 transition-all duration-300">
                      <span className="text-lg leading-none transform group-hover/link:translate-x-0.5 transition-transform">→</span>
                    </div>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {menuItems.length === 0 && (
            <div className="text-center py-24 bg-white rounded-[3rem] shadow-inner">
              <div className="inline-block p-8 rounded-3xl bg-amber-50 text-amber-500 mb-6 animate-bounce">
                <Utensils size={48} />
              </div>
              <h3 className="text-2xl font-playfair font-bold text-gray-900 mb-2">Chef is Preparing...</h3>
              <p className="text-gray-400 font-medium">Our featured menu is being refreshed</p>
            </div>
          )}

          <div className="text-center mt-20">
            <button
              onClick={() => navigate('/menu')}
              className="group relative px-12 py-5 bg-gray-900 text-white text-sm font-black uppercase tracking-[0.2em] rounded-full overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-gray-950/20"
            >
              <span className="relative z-10 flex items-center gap-3">
                Experience Full Menu
                <span className="text-xl group-hover:translate-x-2 transition-transform">→</span>
              </span>
              <div className="absolute inset-0 bg-amber-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
            </button>
          </div>
        </div>
      </section >

      {/* FAQ Preview Section */}
      <section className="section-padding bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="container-custom relative z-10">
          <div className="text-center mb-16">
            <span className="text-secondary font-bold tracking-widest uppercase text-xs mb-4 block">Quick Help</span>
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-gray-900 mb-6">Common Questions</h2>
            <div className="w-20 h-1 bg-secondary mx-auto"></div>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {faqs.length > 0 ? faqs.map((faq) => (
                <div key={faq.id} className="bg-gray-50 p-8 rounded-3xl border border-gray-100 hover:border-secondary/30 transition-all group">
                  <h3 className="font-bold text-lg text-gray-900 mb-3 group-hover:text-secondary transition-colors line-clamp-2">{faq.question}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">{faq.answer}</p>
                </div>
              )) : (
                <>
                  <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 animate-pulse h-40"></div>
                  <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 animate-pulse h-40"></div>
                  <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 animate-pulse h-40"></div>
                  <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 animate-pulse h-40"></div>
                </>
              )}
            </div>

            <div className="text-center mt-12">
              <button
                onClick={() => navigate('/faq')}
                className="inline-flex items-center gap-2 text-secondary font-black text-sm uppercase tracking-widest hover:gap-4 transition-all"
              >
                View Full Help Center
                <span className="text-xl">→</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <Testimonials />
    </>
  )
}

export default Home
