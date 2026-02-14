import React from 'react';
import { testimonials, assets } from '../assets/assets';

const Testimonials = () => {
    return (
        <section className="section-padding bg-gray-50 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/5 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>

            <div className="container-custom relative z-10">
                <div className="text-center mb-16">
                    <span className="text-secondary font-medium tracking-widest uppercase text-sm mb-2 block">Testimonials</span>
                    <h2 className="font-playfair text-4xl md:text-5xl font-bold text-primary mb-6">Guest Stories</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                        Read about the unforgettable experiences our guests have had. Your comfort is our greatest achievement.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <div
                            key={testimonial.id || index}
                            className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full group"
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div className="relative">
                                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-primary/10 group-hover:border-secondary transition-colors">
                                        <img src={testimonial.image} alt={testimonial.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 bg-secondary text-white text-[10px] w-6 h-6 flex items-center justify-center rounded-full shadow-sm">
                                        <span className="mb-0.5">❝</span>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-playfair font-bold text-lg text-gray-900">{testimonial.name}</h4>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">{testimonial.address || 'Happy Guest'}</p>
                                </div>
                            </div>

                            <div className="flex mb-4 text-secondary">
                                {[...Array(5)].map((_, i) => (
                                    <span key={i} className="text-lg">{i < testimonial.rating ? '★' : '☆'}</span>
                                ))}
                            </div>

                            <p className="text-gray-600 italic leading-relaxed text-sm flex-grow">
                                "{testimonial.review}"
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
