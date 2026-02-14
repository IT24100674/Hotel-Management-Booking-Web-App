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
          <h1 className="font-playfair text-5xl md:text-6xl font-bold mb-6">Our Menu</h1>
          <p className="text-xl text-gray-300 font-light max-w-2xl mx-auto">
            Discover a symphony of flavors, crafted with passion and fresh ingredients.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
          {/* Categories */}
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full text-sm font-semibold tracking-wide transition-all duration-300 ${selectedCategory === category
                    ? 'bg-amber-500 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search dishes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full md:w-64 rounded-full border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all"
            />
          </div>
        </div>

        {/* Menu Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-x-8 gap-y-12">
            {filteredItems.map((item) => (
              <div key={item.id} className="group bg-white rounded-xl p-4 hover:shadow-lg transition-all duration-300 border border-transparent hover:border-amber-100 flex gap-4 md:gap-6 items-start">

                {/* Image */}
                <div className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Utensils size={32} />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-xl font-playfair font-bold text-gray-900 truncate pr-2 group-hover:text-amber-600 transition-colors">
                      {item.name}
                    </h3>
                    <span className="text-lg font-bold text-amber-600 whitespace-nowrap">
                      {item.price}
                    </span>
                  </div>

                  <p className="text-gray-500 text-sm mb-3 line-clamp-2">
                    {item.description}
                  </p>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-600 rounded">
                      {item.category}
                    </span>

                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Utensils className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-900">No items found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your search or category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;
