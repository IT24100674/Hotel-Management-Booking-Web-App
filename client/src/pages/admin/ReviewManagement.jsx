import React, { useEffect, useState } from 'react';
import { Trash2, CheckCircle, XCircle, Star, MessageSquare } from 'lucide-react';

const ReviewManagement = () => {
    const [reviews, setReviews] = useState([]);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/reviews');
            const data = await res.json();
            if (res.ok) {
                setReviews(data);
            } else {
                console.error('Failed to fetch reviews:', data);
                setReviews([]);
            }
        } catch (err) {
            console.error('Error fetching reviews:', err);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            const res = await fetch(`http://localhost:5000/api/reviews/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                fetchReviews();
            }
        } catch (err) {
            console.error('Error updating review status:', err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this review?')) {
            try {
                await fetch(`http://localhost:5000/api/reviews/${id}`, { method: 'DELETE' });
                fetchReviews();
            } catch (err) {
                console.error('Error deleting review:', err);
            }
        }
    };

    const filteredReviews = filter === 'All' ? reviews : reviews.filter(review => review.status === filter);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Reviews & FAQs</h1>
                    <p className="text-gray-500 mt-1">Moderate user feedback and questions</p>
                </div>
                <div className="flex gap-2">
                    {['All', 'Pending', 'Approved', 'Rejected'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === status
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredReviews.map((review) => (
                    <div key={review.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col items-start gap-4">
                        <div className="w-full flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                                    {review.user_name ? review.user_name.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">{review.user_name || 'Anonymous User'}</h3>
                                    <div className="flex text-yellow-400 text-xs mt-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} stroke="currentColor" className={i < review.rating ? "text-yellow-400" : "text-gray-300"} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${review.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                review.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                    'bg-yellow-100 text-yellow-700'
                                }`}>
                                {review.status || 'Pending'}
                            </span>
                        </div>

                        <div className="w-full bg-gray-50 p-4 rounded-lg text-gray-700 text-sm relative">
                            <MessageSquare size={16} className="absolute top-4 left-4 text-gray-300 transform -scale-x-100" />
                            <p className="pl-6 italic">"{review.comment}"</p>
                        </div>

                        <div className="text-xs text-gray-400 w-full flex justify-between items-center">
                            <span>{new Date(review.created_at).toLocaleDateString()}</span>
                            {review.event_id && <span>Event ID: {review.event_id}</span>}
                            {review.room_id && <span>Room ID: {review.room_id}</span>}
                        </div>

                        <div className="w-full flex justify-end gap-2 pt-2 border-t border-gray-100 mt-auto">
                            {review.status !== 'Approved' && (
                                <button
                                    onClick={() => handleUpdateStatus(review.id, 'Approved')}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                                >
                                    <CheckCircle size={16} /> Approve
                                </button>
                            )}
                            {review.status !== 'Rejected' && (
                                <button
                                    onClick={() => handleUpdateStatus(review.id, 'Rejected')}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                                >
                                    <XCircle size={16} /> Reject
                                </button>
                            )}
                            <button
                                onClick={() => handleDelete(review.id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors ml-auto"
                            >
                                <Trash2 size={16} /> Delete
                            </button>
                        </div>
                    </div>
                ))}
                {filteredReviews.length === 0 && (
                    <div className="col-span-full py-12 flex flex-col items-center justify-center text-gray-400">
                        <MessageSquare size={48} className="mb-4 opacity-50" />
                        <p>No reviews found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewManagement;
