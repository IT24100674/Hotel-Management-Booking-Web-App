import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { assets } from '../assets/assets'; // For fallback images if needed

const About = () => {
    const [aboutData, setAboutData] = useState({
        hero_subtitle: 'OUR HERITAGE',
        hero_title: 'The Art of Hospitality',
        hero_description: 'For over a century, Luxe Heritage has defined the standard of luxury, offering unparalleled elegance and a sanctuary of refined comfort in the heart of the city.',
        hero_image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=2070&auto=format&fit=crop', // default grand lobby
        section_title: 'A Legacy of Elegance',
        section_p1: 'Established in 1924, Luxe Heritage began as a grand vision to create a haven of sophistication for discerning travelers. The architecture, inspired by European grandeur, has stood as a testament to timeless design, while our commitment to service has evolved to meet the needs of the modern connoisseur.',
        section_p2: 'Every detail, from the hand-carved moldings in our suites to the curated art collections in our public spaces, tells a story of passion, dedication, and a relentless pursuit of perfection.',
        section_image: 'https://images.unsplash.com/photo-1588644301556-91e813359dff?q=80&w=1964&auto=format&fit=crop' // default vintage exterior
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAboutData = async () => {
            try {
                const { data, error } = await supabase
                    .from('about_page')
                    .select('*')
                    .eq('id', 1)
                    .single();

                if (data && !error) {
                    setAboutData(data);
                }
            } catch (err) {
                console.error("Error fetching about data:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAboutData();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#fdfdfc]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
            </div>
        );
    }

    return (
        <div className="bg-[#fcfbf9] min-h-screen flex flex-col font-sans">
            {/* Hero Section */}
            <div 
                className="relative h-[80vh] w-full bg-black/60 flex items-center justify-center flex-col text-center px-4"
            >
                {/* Background Image with Overlay */}
                <div 
                    className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat w-full h-full"
                    style={{ backgroundImage: `url(${aboutData.hero_image})` }}
                />
                
                {/* Gradient Fades */}
                <div className="absolute inset-0 z-10 bg-black/30 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-[#fcfbf9] to-transparent z-20 pointer-events-none"></div>

                {/* Content */}
                <div className="relative z-30 max-w-4xl mx-auto flex flex-col items-center mt-12">
                    <p className="text-white tracking-[0.3em] text-sm font-bold uppercase mb-4 opacity-90 drop-shadow-md">
                        {aboutData.hero_subtitle}
                    </p>
                    <h1 style={{ color: '#c5a059' }} className="text-5xl md:text-7xl font-playfair font-normal mb-6 drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
                        {aboutData.hero_title}
                    </h1>
                    <p className="text-white/90 text-lg md:text-xl max-w-2xl font-light leading-relaxed drop-shadow-md">
                        {aboutData.hero_description}
                    </p>
                </div>
            </div>

            {/* Split Content Section */}
            <div className="w-full max-w-7xl mx-auto px-6 md:px-12 py-24 pb-32">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-32 items-center">
                    
                    {/* Text Column */}
                    <div className="flex flex-col items-start justify-center order-2 md:order-1 pt-8 md:pt-0">
                        <h2 className="text-4xl md:text-5xl font-playfair font-normal text-gray-900 mb-8 leading-tight">
                            {aboutData.section_title}
                        </h2>
                        
                        <div className="space-y-6 text-gray-600 font-light leading-relaxed mb-10 text-justify">
                            <p className="text-[15px]">{aboutData.section_p1}</p>
                            <p className="text-[15px]">{aboutData.section_p2}</p>
                        </div>
                    </div>
                    
                    {/* Image Column */}
                    <div className="relative order-1 md:order-2 w-full flex justify-end">
                        <div className="relative w-full aspect-[4/5] md:aspect-square lg:aspect-[3/4] max-w-md mx-auto md:ml-auto md:mr-0 overflow-hidden shadow-2xl">
                            <img 
                                src={aboutData.section_image} 
                                alt="Heritage Vintage" 
                                className="w-full h-full object-cover filter grayscale-[40%] contrast-[1.1] hover:grayscale-0 transition-all duration-700"
                            />
                            {/* Subtle border framing effect */}
                            <div className="absolute inset-4 border border-white/20 pointer-events-none"></div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Final Call to Action Section */}
            <div className="w-full bg-black py-32 px-6 flex flex-col items-center justify-center text-center mt-12">
                <h2 style={{ color: '#ffffff' }} className="text-4xl md:text-6xl font-sans font-light mb-6 tracking-wider">
                    Experience the Star
                </h2>
                <p className="text-gray-300 font-serif text-lg md:text-xl mb-12 max-w-2xl px-4">
                    Immerse yourself in a world of quiet luxury. Reserve your sanctuary today.
                </p>
                <a 
                    href="/rooms" 
                    className="bg-white text-black text-[11px] font-bold uppercase tracking-[0.3em] px-10 py-4 hover:bg-gray-200 hover:scale-105 active:scale-95 transition-all duration-300"
                >
                    BOOK YOUR STAY
                </a>
            </div>
            
        </div>
    );
};

export default About;
