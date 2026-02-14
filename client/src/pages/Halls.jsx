import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { MapPin, Users, DollarSign, List, Calendar, Check, X, Loader } from 'lucide-react';

const Halls = () => {
    const [halls, setHalls] = useState([]);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [selectedHall, setSelectedHall] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Booking Form State
    const [bookingData, setBookingData] = useState({
        date: '',
        session_type: 'Morning',
        guest_count: '',
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        customer_id_no: ''
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchHalls();
        // Pre-fill user data if logged in
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setBookingData(prev => ({
                    ...prev,
                    customer_email: user.email
                }));
            }
        };
        getUser();
    }, []);

    const fetchHalls = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('events') // Querying 'events' table which now represents halls
                .select('*')
                .order('price', { ascending: true });

            if (error) throw error;
            setHalls(data || []);
        } catch (error) {
            console.error('Error fetching halls:', error);
        } finally {
            setLoading(false);
        }
    };

    const openBookingModal = async (hall) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            alert("Please sign in to proceed with booking.");
            navigate('/sign-in');
            return;
        }

        setSelectedHall(hall);
        setBookingData(prev => ({
            ...prev,
            guest_count: hall.capacity || '',
            customer_email: user.email // Ensure email is set from auth
        }));
        setIsModalOpen(true);
    };

    const closeBookingModal = () => {
        setIsModalOpen(false);
        setSelectedHall(null);
        setBookingData(prev => ({ ...prev, date: '', session_type: 'Morning', guest_count: '' }));
    };

    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        console.log("Submitting booking form...");
        setSubmitting(true);

        try {
            console.log("Fetching user...");
            const { data: { user } } = await supabase.auth.getUser();
            console.log("User fetched:", user);

            if (!user) {
                alert("Please sign in to proceed with booking.");
                setSubmitting(false);
                return;
            }

            // --- AVAILABILITY CHECK ---
            const { data: existingBookings, error: checkError } = await supabase
                .from('hall_bookings')
                .select('id')
                .eq('event_id', selectedHall.id)
                .eq('booking_date', bookingData.date)
                .eq('session_type', bookingData.session_type)
                .neq('status', 'Cancelled');

            if (checkError) throw checkError;

            if (existingBookings && existingBookings.length > 0) {
                alert(`Sorry, this hall is already booked for ${bookingData.date} (${bookingData.session_type}). Please choose another date or session.`);
                setSubmitting(false);
                return;
            }
            // ---------------------------

            const bookingPayload = {
                event_id: selectedHall.id,
                user_id: user.id,
                guest_name: bookingData.customer_name,
                guest_email: bookingData.customer_email,
                guest_phone: bookingData.customer_phone,
                guest_id_no: bookingData.customer_id_no,
                booking_date: bookingData.date,
                session_type: bookingData.session_type,
                guest_count: bookingData.guest_count,
                total_price: selectedHall.price
            };

            console.log("Navigating to payment with payload:", bookingPayload);

            // Navigate to Payment
            navigate('/payment', {
                state: {
                    bookingDetails: bookingPayload,
                    hall: selectedHall,
                    type: 'hall'
                }
            });
            console.log("Navigation called.");

        } catch (error) {
            console.error('Error proceeding to payment:', error);
            alert('Error: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Hero Section */}
            <div className="relative bg-black text-white py-24 px-4 text-center">
                <div className="absolute inset-0 overflow-hidden">
                    <img
                        src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2098&auto=format&fit=crop"
                        alt="Luxury Hall"
                        className="w-full h-full object-cover opacity-40"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/90"></div>
                </div>
                <div className="relative z-10 max-w-4xl mx-auto">
                    <h1 className="font-playfair text-5xl md:text-6xl font-bold mb-6">Our Venues</h1>
                    <p className="text-xl text-gray-300 font-light max-w-2xl mx-auto">
                        Elegant spaces for your weddings, parties, and corporate events.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-12">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
                    </div>
                ) : halls.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {halls.map((hall) => (
                            <div key={hall.id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group flex flex-col">
                                <div className="relative h-64 overflow-hidden">
                                    {hall.image_url ? (
                                        <img
                                            src={hall.image_url}
                                            alt={hall.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                                            No Image
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm font-bold shadow-sm text-gray-900">
                                        Up to {hall.capacity} Guests
                                    </div>
                                </div>

                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-2xl font-playfair font-bold text-gray-900 leading-tight">{hall.title}</h3>
                                    </div>

                                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                                        <MapPin size={16} className="text-amber-600" />
                                        <span>{hall.location}</span>
                                    </div>

                                    <p className="text-gray-600 mb-6 line-clamp-2 flex-1">
                                        {hall.description}
                                    </p>

                                    <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-gray-700">
                                            <List size={16} className="text-amber-600" />
                                            <span className="font-medium">Features:</span>
                                            <span className="text-gray-600 truncate">{hall.features || 'Standard Amenities'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-700">
                                            <DollarSign size={16} className="text-amber-600" />
                                            <span className="font-medium">Price:</span>
                                            <span className="text-lg font-bold text-gray-900">${hall.price}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => openBookingModal(hall)}
                                        className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-amber-600 transition-colors shadow-lg shadow-gray-900/10"
                                    >
                                        Book Now
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <h3 className="text-xl font-medium text-gray-900">No venues available at the moment.</h3>
                    </div>
                )}
            </div>

            {/* Booking Modal */}
            {isModalOpen && selectedHall && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-gray-900 px-6 py-4 flex justify-between items-center text-white flex-shrink-0">
                            <h3 className="text-lg font-playfair font-bold">Book {selectedHall.title}</h3>
                            <button onClick={closeBookingModal} className="text-gray-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleBookingSubmit} className="p-6 space-y-4 overflow-y-auto">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                    <input
                                        type="date"
                                        required
                                        min={new Date().toISOString().split('T')[0]}
                                        value={bookingData.date}
                                        onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Session</label>
                                    <select
                                        value={bookingData.session_type}
                                        onChange={(e) => setBookingData({ ...bookingData, session_type: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none bg-white"
                                    >
                                        <option>Morning</option>
                                        <option>Evening</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Guests (Max {selectedHall.capacity})</label>
                                <input
                                    type="number"
                                    required
                                    max={selectedHall.capacity}
                                    value={bookingData.guest_count}
                                    onChange={(e) => setBookingData({ ...bookingData, guest_count: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                                />
                            </div>

                            <div className="border-t border-gray-100 pt-4">
                                <h4 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Contact Details</h4>
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        placeholder="Full Name"
                                        required
                                        value={bookingData.customer_name}
                                        onChange={(e) => setBookingData({ ...bookingData, customer_name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                                    />
                                    <input
                                        type="email"
                                        placeholder="Email Address"
                                        required
                                        value={bookingData.customer_email}
                                        onChange={(e) => setBookingData({ ...bookingData, customer_email: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                                    />
                                    <input
                                        type="tel"
                                        placeholder="Phone Number"
                                        required
                                        value={bookingData.customer_phone}
                                        onChange={(e) => setBookingData({ ...bookingData, customer_phone: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                                    />
                                    <input
                                        type="text"
                                        placeholder="ID / Passport / NIC Number"
                                        required
                                        value={bookingData.customer_id_no || ''}
                                        onChange={(e) => setBookingData({ ...bookingData, customer_id_no: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl flex justify-between items-center text-sm">
                                <span className="text-gray-600">Total Estimated Price:</span>
                                <span className="text-xl font-bold text-amber-600">${selectedHall.price}</span>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all
                            ${submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-amber-600 hover:bg-amber-700 shadow-amber-900/20'}
                        `}
                            >
                                {submitting ? 'Processing...' : 'Proceed to Payment'}
                            </button>
                            <p className="text-xs text-center text-gray-400">You won't be charged yet.</p>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Halls;
