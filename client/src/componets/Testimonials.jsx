import React from 'react';
import { testimonials, assets } from '../assets/assets';

const Testimonials = () => {
    return (
        <div className="py-16 bg-white px-4 md:px-16 lg:px-24">
            <div className="text-center mb-12">
                <h2 className="font-playfair text-3xl md:text-4xl font-bold text-gray-800 mb-4">What Our Guests Say</h2>
                <p className="text-gray-600 max-w-xl mx-auto">Read realized reviews from our valued guests about their stay.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {testimonials.map((testimonial) => (
                    <div key={testimonial.id} className="bg-white border boundary-gray-100 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 relative">
                        <div className="absolute top-6 right-8 opacity-10">
                            <img src={assets.logo} alt="quote" className="w-16 h-16 grayscale" />
                            {/* Using logo temporarily if a quote icon isn't available, or just use text quotes */}
                            <span className="text-6xl font-serif text-gray-400 absolute -top-4 -right-2">"</span>
                        </div>

                        <div className="flex items-center gap-4 mb-6">
                            <img src={testimonial.image} alt={testimonial.name} className="w-12 h-12 rounded-full object-cover border-2 border-indigo-100" />
                            <div>
                                <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                                <p className="text-xs text-gray-500">{testimonial.address}</p>
                            </div>
                        </div>

                        <div className="flex mb-4">
                            {[...Array(testimonial.rating)].map((_, i) => (
                                <img key={i} src={assets.starIconFilled} alt="star" className="w-4 h-4" />
                            ))}
                        </div>

                        <p className="text-gray-600 italic leading-relaxed">"{testimonial.review}"</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Testimonials;
