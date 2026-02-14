import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { ArrowLeft, Calendar, User, CheckCircle, AlertCircle, Loader } from 'lucide-react';

const BookingPage = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);

    // Form State
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [guestId, setGuestId] = useState('');
    const [totalPrice, setTotalPrice] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Get Current User
                const { data: { user: authUser } } = await supabase.auth.getUser();
                if (!authUser) {
                    // Redirect to login if not authenticated, storing return url
                    // For now simple redirect
                    navigate('/sign-in'); // TODO: Add state to return here
                    return;
                }
                setUser(authUser);

                // 2. Get Room Details
                const res = await fetch(`http://localhost:5000/api/rooms/${roomId}`);
                if (!res.ok) throw new Error('Failed to load room details');
                const data = await res.json();
                setRoom(data);

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [roomId, navigate]);

    // Calculate Price when dates change
    useEffect(() => {
        if (checkIn && checkOut && room) {
            const start = new Date(checkIn);
            const end = new Date(checkOut);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays > 0) {
                setTotalPrice(diffDays * room.price);
            } else {
                setTotalPrice(0);
            }
        }
    }, [checkIn, checkOut, room]);

    const handleBooking = async (e) => {
        e.preventDefault();
        setError(null);

        if (!user) return;

        // Basic date validation
        if (new Date(checkIn) >= new Date(checkOut)) {
            setError("Check-out date must be after check-in date");
            return;
        }

        setSubmitting(true);

        try {
            // Check availability
            const res = await fetch(`http://localhost:5000/api/bookings/check-availability?room_id=${roomId}&check_in=${checkIn}&check_out=${checkOut}`);

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Failed to check availability');
            }

            const data = await res.json();

            if (!data.available) {
                setError("Room is already booked for these dates. Please choose different dates.");
                setSubmitting(false);
                return;
            }

            // Show Confirmation Modal instead of navigating immediately
            setShowConfirmation(true);
            setSubmitting(false);

        } catch (err) {
            setError(err.message);
            setSubmitting(false);
        }
    };

    const confirmAndPay = () => {
        // Navigate to Payment Page
        navigate('/payment', {
            state: {
                bookingDetails: {
                    user_id: user.id,
                    room_id: roomId,
                    check_in: checkIn,
                    check_out: checkOut,
                    guest_id_no: guestId,
                    total_price: totalPrice
                },
                room: room
            }
        });
    };


    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Loader className="w-10 h-10 text-amber-600 animate-spin" />
        </div>
    );

    if (error && !room) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Page</h2>
                <p className="text-gray-600 mb-4">{error}</p>
                <button onClick={() => navigate('/rooms')} className="text-amber-600 hover:underline">
                    Back to Rooms
                </button>
            </div>
        </div>
    );

    if (success) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
                <p className="text-gray-600 mb-6">
                    Your stay at Room {room.room_number} has been booked successfully.
                </p>
                <p className="text-sm text-gray-400">Redirecting to your bookings...</p>
            </div>
        </div>
    );

    // Get tomorrow's date for min checkout
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    const todayStr = new Date().toISOString().split('T')[0];

    return (
        <div className="min-h-screen bg-gray-50 pt-20 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <button
                    onClick={() => navigate('/rooms')}
                    className="flex items-center text-gray-600 hover:text-gray-900 mb-8 transition-colors"
                >
                    <ArrowLeft size={20} className="mr-2" />
                    Back to Rooms
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Room Details Column */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-3xl overflow-hidden shadow-xl">
                            <div className="relative h-64 sm:h-80">
                                {room.image_url ? (
                                    <img src={room.image_url} alt="Room" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                        <span className="text-gray-400">No Image</span>
                                    </div>
                                )}
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-1 rounded-full text-sm font-bold shadow-sm">
                                    {room.type}
                                </div>
                            </div>
                            <div className="p-8">
                                <h1 className="text-3xl font-playfair font-bold text-gray-900 mb-2">Room {room.room_number}</h1>
                                <p className="text-gray-600 mb-6">{room.description || "A luxury stay awaits you."}</p>

                                <div className="flex flex-wrap gap-4 text-sm text-gray-500 border-t border-gray-100 pt-6">
                                    <div className="flex items-center gap-2">
                                        <User size={18} />
                                        <span>Capacity: {
                                            room.type === 'Single' ? '1 Guest' :
                                                room.type === 'Double' ? '2 Guests' :
                                                    room.type === 'Suite' ? '2 Guests' : '4 Guests'
                                        }</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-amber-600 font-bold text-lg">${room.price}</span>
                                        <span>/ night</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Booking Form Column */}
                    <div>
                        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                            <h2 className="text-2xl font-playfair font-bold text-gray-900 mb-6">Complete Your Reservation</h2>

                            {error && (
                                <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 flex items-center gap-3">
                                    <AlertCircle size={20} />
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleBooking} className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Check-in Date</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-3 text-gray-400" size={18} />
                                            <input
                                                type="date"
                                                required
                                                min={todayStr}
                                                value={checkIn}
                                                onChange={(e) => setCheckIn(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Check-out Date</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-3 text-gray-400" size={18} />
                                            <input
                                                type="date"
                                                required
                                                min={checkIn ? new Date(new Date(checkIn).getTime() + 86400000).toISOString().split('T')[0] : tomorrowStr}
                                                value={checkOut}
                                                onChange={(e) => setCheckOut(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Guest ID / NIC / Passport</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-3 text-gray-400" size={18} />
                                            <input
                                                type="text"
                                                required
                                                value={guestId}
                                                onChange={(e) => setGuestId(e.target.value)}
                                                placeholder="Enter your ID Number"
                                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 space-y-3">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Price per night</span>
                                        <span>${room.price}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Duration</span>
                                        <span>
                                            {checkIn && checkOut && totalPrice > 0
                                                ? `${totalPrice / room.price} nights`
                                                : '-'}
                                        </span>
                                    </div>
                                    <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-lg text-gray-900">
                                        <span>Total</span>
                                        <span className="text-amber-600">${totalPrice}</span>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting || totalPrice === 0}
                                    className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all transform hover:-translate-y-1
                                        ${submitting || totalPrice === 0
                                            ? 'bg-gray-300 cursor-not-allowed shadow-none hover:translate-y-0'
                                            : 'bg-gradient-to-r from-gray-900 to-gray-800 hover:from-black hover:to-gray-900 shadow-gray-900/20'}`}
                                >
                                    {submitting ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader className="animate-spin" size={20} />
                                            Processing...
                                        </div>
                                    ) : (
                                        'Review & Pay'
                                    )}
                                </button>
                                <p className="text-center text-xs text-gray-400 mt-4">
                                    By booking, you agree to our terms and conditions.
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirmation && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-gray-900 px-6 py-4 flex justify-between items-center">
                            <h3 className="text-lg font-playfair font-bold text-white">Confirm Booking Details</h3>
                            <button
                                onClick={() => setShowConfirmation(false)}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <ArrowLeft size={20} className="rotate-180" />
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
                                {room.image_url && (
                                    <img src={room.image_url} alt="Room" className="w-20 h-20 rounded-xl object-cover" />
                                )}
                                <div>
                                    <h4 className="font-bold text-lg text-gray-900">Room {room.room_number}</h4>
                                    <p className="text-sm text-gray-500">{room.type} Suite</p>
                                </div>
                            </div>

                            <div className="space-y-4 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Check-in</span>
                                    <span className="font-medium text-gray-900">{checkIn}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Check-out</span>
                                    <span className="font-medium text-gray-900">{checkOut}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Guest ID</span>
                                    <span className="font-medium text-gray-900 font-mono">{guestId}</span>
                                </div>
                                <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                                    <span className="font-bold text-gray-900 text-lg">Total Amount</span>
                                    <span className="font-bold text-amber-600 text-xl">${totalPrice}</span>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={() => setShowConfirmation(false)}
                                    className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    Edit Details
                                </button>
                                <button
                                    onClick={confirmAndPay}
                                    className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold rounded-xl hover:from-amber-600 hover:to-amber-700 shadow-lg shadow-amber-500/20 transition-all hover:-translate-y-0.5"
                                >
                                    Confirm & Pay
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingPage;
