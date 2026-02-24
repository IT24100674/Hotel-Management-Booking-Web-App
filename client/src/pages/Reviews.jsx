import React, { useEffect, useState } from 'react';
import { Star, MessageSquare, Quote, Calendar, CheckCircle } from 'lucide-react';

const Reviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/reviews');
                const data = await res.json();
                if (res.ok) {
                    // Only show approved reviews
                    const approved = data.filter(r => r.status === 'Approved');
                    setReviews(approved);
                }
            } catch (err) {
                console.error('Error fetching reviews:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="pt-28 pb-20 bg-gray-50 min-h-screen">
            <div className="container-custom">
                {/* Header */}
                <div className="text-center mb-16">
                    <span className="text-secondary font-medium tracking-widest uppercase text-sm mb-2 block">Guest Experiences</span>
                    <h1 className="font-playfair text-4xl md:text-5xl font-bold text-gray-900 mb-6">Guest Stories & Reviews</h1>
                    <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                        Hear from our guests about their stays and events at Golden Waves. We take pride in creating unforgettable memories.
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
                        <MessageSquare size={64} className="mx-auto text-gray-200 mb-4" />
                        <h3 className="text-xl font-medium text-gray-900 mb-2">No reviews yet</h3>
                        <p className="text-gray-500">Be the first to share your experience after your stay!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {reviews.map((review) => (
                            <div
                                key={review.id}
                                className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col group"
                            >
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="relative">
                                        <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center text-amber-700 font-bold border-2 border-amber-100 group-hover:border-secondary transition-colors text-xl">
                                            {review.user_name?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 bg-secondary text-white text-[10px] w-6 h-6 flex items-center justify-center rounded-full shadow-sm">
                                            <Quote size={12} className="text-white" />
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-playfair font-bold text-lg text-gray-900">{review.user_name}</h4>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
                                            {review.events?.title ? `Event: ${review.events.title}` : review.rooms?.room_number ? `Room: ${review.rooms.room_number}` : 'Happy Guest'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex mb-4 text-amber-500">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={16}
                                            fill={i < review.rating ? "currentColor" : "none"}
                                            stroke="currentColor"
                                            className={i < review.rating ? "text-amber-500" : "text-gray-300"}
                                        />
                                    ))}
                                </div>

                                <p className="text-gray-600 italic leading-relaxed text-sm flex-grow">
                                    "{review.comment}"
                                </p>

                                <div className="mt-6 pt-4 border-t border-gray-50 text-[10px] text-gray-400 flex justify-between items-center">
                                    <div className="flex items-center gap-1">
                                        <Calendar size={12} />
                                        <span>{new Date(review.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-green-600 font-bold uppercase tracking-tighter">
                                        <CheckCircle size={12} />
                                        <span>Verified Stay</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reviews;
