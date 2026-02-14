import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { CreditCard, Lock, Calendar, CheckCircle, AlertCircle, Loader } from 'lucide-react';

const PaymentPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { bookingDetails, room, hall, type } = location.state || {}; // Expecting details from BookingPage or Halls

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Mock Form State
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [nameOnCard, setNameOnCard] = useState('');

    useEffect(() => {
        if (!bookingDetails || (!room && !hall)) {
            navigate('/'); // Redirect if accessed directly without state
        }
    }, [bookingDetails, room, hall, navigate]);

    const handlePayment = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Simulate payment processing delay
        setTimeout(async () => {
            try {
                // 1. "Process Payment" (Mock success)

                if (type === 'hall') {
                    // Create Hall Booking
                    const { error: bookingError } = await supabase
                        .from('hall_bookings')
                        .insert([{
                            ...bookingDetails,
                            status: 'Confirmed' // Paid and Confirmed
                        }]);

                    if (bookingError) throw bookingError;

                } else {
                    // Create Room Booking
                    const res = await fetch('http://localhost:5000/api/bookings', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            ...bookingDetails,
                            status: 'Confirmed'
                        })
                    });

                    if (!res.ok) {
                        const errData = await res.json();
                        throw new Error(errData.error || 'Booking creation failed after payment');
                    }
                }

                setSuccess(true);
                // Redirect after short delay
                setTimeout(() => {
                    navigate('/profile?tab=bookings');
                }, 3000);

            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        }, 2000); // 2 second mock delay
    };

    if (!bookingDetails || (!room && !hall)) return null;

    if (success) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-3xl font-playfair font-bold text-gray-900 mb-2">Payment Successful!</h2>
                <p className="text-gray-600 mb-6">
                    Your booking for <strong>{type === 'hall' ? hall.title : `Room ${room.room_number}`}</strong> is confirmed.
                </p>
                <div className="bg-gray-50 p-4 rounded-xl mb-6 text-sm text-gray-500">
                    <p>Transaction ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                    <p>Amount Paid: <strong>${bookingDetails.total_price}</strong></p>
                </div>
                <p className="text-sm text-amber-600 animate-pulse">Redirecting to your bookings...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Order Summary */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-playfair font-bold text-gray-900">Order Summary</h2>
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                        <div className="h-48 relative">
                            <img src={type === 'hall' ? hall.image_url : room.image_url} alt="Item" className="w-full h-full object-cover" />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                                <h3 className="text-white font-bold text-xl">{type === 'hall' ? hall.title : `Room ${room.room_number}`}</h3>
                                <p className="text-gray-200 text-sm">{type === 'hall' ? 'Function Hall' : `${room.type} Suite`}</p>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            {type === 'hall' ? (
                                <>
                                    <div className="flex justify-between items-center text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={16} />
                                            <span>Date</span>
                                        </div>
                                        <span className="font-medium text-gray-900">{bookingDetails.booking_date}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={16} />
                                            <span>Session</span>
                                        </div>
                                        <span className="font-medium text-gray-900">{bookingDetails.session_type}</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex justify-between items-center text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={16} />
                                            <span>Check-in</span>
                                        </div>
                                        <span className="font-medium text-gray-900">{bookingDetails.check_in}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={16} />
                                            <span>Check-out</span>
                                        </div>
                                        <span className="font-medium text-gray-900">{bookingDetails.check_out}</span>
                                    </div>
                                </>
                            )}

                            <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                                <span className="text-lg font-bold text-gray-900">Total to Pay</span>
                                <span className="text-2xl font-bold text-amber-600">${bookingDetails.total_price}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment Form */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-playfair font-bold text-gray-900">Payment Details</h2>
                    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                        {error && (
                            <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 flex items-center gap-3">
                                <AlertCircle size={20} />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handlePayment} className="space-y-6" autoComplete="off">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                                <div className="relative">
                                    <CreditCard className="absolute left-3 top-3.5 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        name="cc-number"
                                        autoComplete="off"
                                        placeholder="0000 0000 0000 0000"
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                                        value={cardNumber}
                                        onChange={(e) => setCardNumber(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                                    <input
                                        type="text"
                                        placeholder="MM/YY"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                                        value={expiry}
                                        onChange={(e) => setExpiry(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            name="cvv"
                                            autoComplete="off"
                                            placeholder="123"
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                                            value={cvv}
                                            onChange={(e) => setCvv(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name</label>
                                <input
                                    type="text"
                                    placeholder="John Doe"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                                    value={nameOnCard}
                                    onChange={(e) => setNameOnCard(e.target.value)}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all transform hover:-translate-y-1
                                    ${loading
                                        ? 'bg-gray-400 cursor-not-allowed shadow-none hover:translate-y-0'
                                        : 'bg-gradient-to-r from-gray-900 to-gray-800 hover:from-black hover:to-gray-900 shadow-gray-900/20'}`}
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader className="animate-spin" size={20} />
                                        Processing Payment...
                                    </div>
                                ) : (
                                    `Pay $${bookingDetails.total_price}`
                                )}
                            </button>

                            <div className="text-center">
                                <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
                                    <Lock size={12} /> Secure 256-bit SSL Encrypted Payment
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;
