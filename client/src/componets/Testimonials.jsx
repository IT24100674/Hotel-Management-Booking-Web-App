import React, { useEffect, useState } from 'react';
import { assets } from '../assets/assets';
import { Star, Quote } from 'lucide-react';
import { Link } from 'react-router-dom';

const Testimonials = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchApprovedReviews = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/reviews');
                const data = await res.json();
                if (res.ok) {
                    // Only show approved reviews
                    const approved = data.filter(r => r.status === 'Approved');
                    setReviews(approved);
                }
            } catch (err) {
                console.error('Error fetching testimonials:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchApprovedReviews();
    }, []);

    if (loading) return null;

    // If no approved reviews, don't show the section or show a subset of dummy ones
    if (reviews.length === 0) return null;

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
                    {reviews.slice(0, 3).map((review, index) => (
                        <div
                            key={review.id || index}
                            className="bg-white p-8 rounded-3xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.12)] transition-all duration-500 border border-gray-100 flex flex-col h-full group relative overflow-hidden"
                        >
                            {/* Decorative element */}
                            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-[100px] transition-transform duration-500 group-hover:scale-150"></div>

                            <div className="flex items-center gap-4 mb-8 relative z-10">
                                <div className="relative">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100/50 flex items-center justify-center text-indigo-700 font-bold border border-indigo-100 group-hover:border-secondary transition-all duration-500 text-2xl shadow-sm rotate-3 group-hover:rotate-0">
                                        {review.user_name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 bg-amber-600 text-white w-8 h-8 flex items-center justify-center rounded-xl shadow-lg ring-4 ring-white">
                                        <Quote size={16} fill="currentColor" />
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-playfair font-bold text-xl text-gray-900 group-hover:text-amber-700 transition-colors">{review.user_name}</h4>
                                    <div className="px-2.5 py-1 bg-gray-50 text-[10px] text-gray-500 uppercase tracking-widest font-bold rounded-lg mt-1 inline-block border border-gray-100">
                                        {review.events?.title ? `Event: ${review.events.title}` : review.rooms?.room_number ? `Room: ${review.rooms.room_number}` : 'Happy Guest'}
                                    </div>
                                </div>
                            </div>

                            <div className="flex mb-6 gap-1 relative z-10">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        size={18}
                                        fill={i < review.rating ? "#d97706" : "none"}
                                        className={i < review.rating ? "text-amber-600" : "text-gray-200"}
                                    />
                                ))}
                            </div>

                            <div className="relative z-10 flex-grow">
                                <p className="text-gray-600 italic leading-relaxed text-base group-hover:text-gray-800 transition-colors">
                                    "{review.comment.length > 150 ? `${review.comment.substring(0, 150)}...` : review.comment}"
                                </p>
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-50 text-[11px] flex justify-between items-center relative z-10">
                                <span className="text-gray-400 font-medium flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
                                    {new Date(review.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                                <span className="text-emerald-600 font-extrabold uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full">Verified Stay</span>
                            </div>
                        </div>
                    ))}
                </div>

                {reviews.length > 3 && (
                    <div className="text-center mt-16">
                        <Link to="/reviews" className="inline-flex items-center gap-3 px-10 py-4 bg-white border-2 border-primary text-primary font-bold rounded-full hover:bg-primary hover:text-white transition-all duration-300 shadow-xl shadow-primary/5 hover:shadow-2xl hover:shadow-primary/10 group">
                            Explore More Guest Stories
                            <span className="text-xl transition-transform duration-300 group-hover:translate-x-2">→</span>
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
};

export default Testimonials;
