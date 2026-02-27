import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Utensils, Search } from 'lucide-react';
import Navbar from '../componets/Navbar';
import Footer from '../componets/Footer';

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('menu')
        .select('*')
        .eq('is_available', true)
        .order('category', { ascending: true });

      if (error) throw error;
      setMenuItems(data || []);
    } catch (error) {
      console.error('Error fetching menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', ...new Set(menuItems.map(item => item.category))];

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="relative bg-black text-white py-24 px-4 text-center">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop"
            alt="Restaurant Interior"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/90"></div>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="font-playfair text-5xl md:text-6xl font-bold mb-6" style={{ color: '#c5a059' }}>Our Menu</h1>
          <p className="text-xl text-gray-300 font-light max-w-2xl mx-auto">
            Discover a symphony of flavors, crafted with passion and fresh ingredients.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-16">
          {/* Categories */}
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-7 py-2.5 rounded-full text-sm font-semibold tracking-wide transition-all duration-300 border ${selectedCategory === category
                  ? 'bg-amber-500 text-white border-amber-500 shadow-[0_4px_15px_-3px_rgba(245,158,11,0.4)] scale-[1.03]'
                  : 'bg-white text-gray-500 hover:text-gray-900 border-gray-200 hover:border-amber-300 hover:shadow-sm'
                  }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-amber-500 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search dishes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-6 py-3 w-full rounded-full border border-gray-200 bg-white shadow-sm focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all duration-300 font-medium text-gray-700"
            />
          </div>
        </div>

        {/* Menu Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-32">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-amber-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-amber-500 rounded-full border-t-transparent animate-spin"></div>
            </div>
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {filteredItems.map((item) => (
              <div key={item.id} className="group flex flex-col bg-white rounded-2xl overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 border border-gray-100 p-4 relative">

                {/* Image */}
                <div className="relative w-full aspect-[4/3] overflow-hidden rounded-xl bg-gray-50 mb-6">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                      <Utensils size={48} strokeWidth={1} />
                      <p className="text-xs uppercase tracking-widest mt-2">No Image</p>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1 px-2 pb-2">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-teal-600 mb-2">
                    {item.category}
                  </span>

                  <h3 className="text-2xl font-playfair font-bold text-gray-900 leading-tight mb-3">
                    {item.name}
                  </h3>

                  <p className="text-gray-500 text-sm leading-relaxed flex-1">
                    {item.description || "A wonderful dish curated by our master chefs."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center bg-white rounded-3xl border border-dashed border-gray-200">
            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-6">
              <Utensils className="h-8 w-8 text-amber-500" />
            </div>
            <h3 className="text-2xl font-playfair font-bold text-gray-900">No divine dishes found</h3>
            <p className="text-gray-500 mt-2 max-w-sm">We couldn't find anything matching your search. Explore our other tantalizing categories.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;
