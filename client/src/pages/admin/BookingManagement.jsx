import React, { useState, useEffect } from 'react';
import { Search, Plus, Calendar, User, Trash2, Edit2, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../../supabaseClient';

const BookingManagement = () => {
    const [bookings, setBookings] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [halls, setHalls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all');

    // Modal States
    const [showTypeSelection, setShowTypeSelection] = useState(false);
    const [isFormatModalOpen, setIsFormatModalOpen] = useState(false);
    const [editingBooking, setEditingBooking] = useState(null);
    const [userRole, setUserRole] = useState('');

    const [formData, setFormData] = useState({
        bookingType: 'room', // 'room' | 'hall'
        guestName: '',
        guestEmail: '',
        guestPhone: '',
        guestId: '',
        roomId: '',
        hallId: '',
        checkIn: '',
        checkOut: '',
        bookingDate: '',
        sessionType: 'Morning',
        totalPrice: 0,
        isGuest: false
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('hotel_user') || '{}');
        setUserRole(user.role || '');
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [bookingsRes, roomsRes] = await Promise.all([
                fetch('http://localhost:5000/api/bookings'),
                fetch('http://localhost:5000/api/rooms')
            ]);

            // Fetch Halls (Events)
            const { data: hallsData } = await supabase
                .from('events')
                .select('*');
            if (hallsData) setHalls(hallsData);

            // Fetch Hall Bookings separately
            let hallBookingsData = [];
            try {
                const { data, error } = await supabase
                    .from('hall_bookings')
                    .select(`
                        *,
                        events (title)
                    `)
                    .order('booking_date', { ascending: false });

                if (error) {
                    console.error("Error fetching hall bookings:", error);
                } else {
                    hallBookingsData = data || [];
                }
            } catch (hallErr) {
                console.error("Supabase fetch error:", hallErr);
            }

            if (!bookingsRes.ok) throw new Error('Failed to fetch bookings');
            const roomBookingsData = await bookingsRes.json();

            // Assume rooms might fail or return empty, but handle json
            let roomsData = [];
            if (roomsRes.ok) {
                roomsData = await roomsRes.json();
            }

            // Normalize Data
            const normalizedRoomBookings = (Array.isArray(roomBookingsData) ? roomBookingsData : []).map(b => ({
                ...b,
                type: 'room',
                serviceName: `Room ${b.rooms?.room_number} (${b.rooms?.type})`,
                dateDisplay: new Date(b.check_in).toLocaleDateString(),
                sortDate: new Date(b.check_in)
            }));

            const normalizedHallBookings = hallBookingsData.map(b => ({
                ...b,
                type: 'hall',
                serviceName: b.events?.title || 'Function Hall',
                dateDisplay: `${new Date(b.booking_date).toLocaleDateString()} (${b.session_type})`,
                sortDate: (() => {
                    const d = new Date(b.booking_date);
                    // Add hours based on session to distinguish them within the same day
                    if (b.session_type === 'Morning') d.setHours(8);
                    else d.setHours(18);
                    return d;
                })()
            }));

            const allBookings = [...normalizedRoomBookings, ...normalizedHallBookings].sort((a, b) => a.sortDate - b.sortDate);

            setBookings(allBookings);
            setRooms(roomsData);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setBookings([]);
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredBookings = bookings.filter(booking => {
        const searchterm = searchTerm.toLowerCase();

        // Extract ID Number (Captured as guest_id_no for rooms or customer_id_no for halls)
        const guestIdNo = (booking.guest_id_no || booking.customer_id_no || '').toLowerCase();

        const matchesSearch = guestIdNo.includes(searchterm);

        const matchesTab = activeTab === 'all'
            ? true
            : activeTab === 'rooms'
                ? booking.type === 'room'
                : booking.type === 'hall';

        return matchesSearch && matchesTab;
    });

    const handleNewBookingClick = () => {
        setShowTypeSelection(true);
    };

    const selectBookingType = (type) => {
        setFormData(prev => ({
            ...prev,
            bookingType: type,
            // Reset fields
            guestName: '', guestEmail: '', guestPhone: '', guestId: '',
            roomId: '', hallId: '', checkIn: '', checkOut: '', bookingDate: '',
            totalPrice: 0, isGuest: false, sessionType: 'Morning'
        }));
        setShowTypeSelection(false);
        setEditingBooking(null); // Clear editing state when starting new
        setIsFormatModalOpen(true);
    };

    const handleDeleteBooking = async (booking) => {
        if (!window.confirm('Are you sure you want to delete this booking?')) return;

        try {
            if (booking.type === 'hall') {
                const { error } = await supabase
                    .from('hall_bookings')
                    .delete()
                    .eq('id', booking.id);
                if (error) throw error;
            } else {
                const res = await fetch(`http://localhost:5000/api/bookings/${booking.id}`, {
                    method: 'DELETE'
                });
                if (!res.ok) throw new Error('Failed to delete booking');
            }
            alert('Booking deleted successfully');
            fetchData();
        } catch (error) {
            console.error('Delete error:', error);
            alert(error.message);
        }
    };

    const handleSaveBooking = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            let user_id = null;

            if (!formData.isGuest) {
                const { data: existingUser } = await supabase
                    .from('users')
                    .select('id')
                    .eq('email', formData.guestEmail)
                    .single();

                if (existingUser) {
                    user_id = existingUser.id;
                } else {
                    alert("User not found. Use 'Walk-in / Guest' option if they don't have an account.");
                    setSubmitting(false);
                    return;
                }
            }

            if (formData.bookingType === 'hall') {
                // --- HALL BOOKING ---

                // --- AVAILABILITY CHECK ---
                let query = supabase
                    .from('hall_bookings')
                    .select('id')
                    .eq('event_id', formData.hallId)
                    .eq('booking_date', formData.bookingDate)
                    .eq('session_type', formData.sessionType)
                    .neq('status', 'Cancelled');

                if (editingBooking) {
                    query = query.neq('id', editingBooking.id);
                }

                const { data: existingBookings, error: checkError } = await query;

                if (checkError) throw checkError;

                if (existingBookings && existingBookings.length > 0) {
                    alert(`Sorry, this hall is already booked for ${formData.bookingDate} (${formData.sessionType}).`);
                    setSubmitting(false);
                    return;
                }
                // ---------------------------
                const payload = {
                    event_id: formData.hallId,
                    booking_date: formData.bookingDate,
                    session_type: formData.sessionType,
                    status: 'Confirmed',
                    total_price: formData.totalPrice,
                    user_id: user_id
                };

                if (formData.isGuest) {
                    payload.guest_name = formData.guestName;
                    payload.guest_email = formData.guestEmail;
                    payload.guest_phone = formData.guestPhone;
                    payload.guest_id_no = formData.guestId;
                } else {
                    payload.guest_name = null;
                    payload.guest_email = null;
                    payload.guest_phone = null;
                    payload.guest_id_no = null;
                }

                const { error } = await supabase
                    .from('hall_bookings')
                    .insert([payload]);
                if (error) throw error;

            } else {
                // --- ROOM BOOKING ---
                let payload = {
                    room_id: formData.roomId,
                    check_in: formData.checkIn,
                    check_out: formData.checkOut,
                    total_price: formData.totalPrice,
                    status: 'Confirmed'
                };

                if (formData.isGuest) {
                    payload.guest_name = formData.guestName;
                    payload.guest_email = formData.guestEmail;
                    payload.guest_phone = formData.guestPhone;
                    payload.guest_id_no = formData.guestId;
                    payload.user_id = null;
                } else {
                    payload.user_id = user_id;
                    payload.guest_name = null;
                    payload.guest_email = null;
                    payload.guest_phone = null;
                    payload.guest_id_no = null;
                }

                const res = await fetch('http://localhost:5000/api/bookings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.error || 'Booking failed');
                }
            }

            alert('Booking created successfully');
            fetchData();
            setIsFormatModalOpen(false);

        } catch (error) {
            alert(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const calculatePrice = () => {
        if (formData.bookingType === 'room') {
            if (!formData.roomId || !formData.checkIn || !formData.checkOut) return 0;
            const room = rooms.find(r => r.id === formData.roomId);
            if (!room) return 0;

            const start = new Date(formData.checkIn);
            const end = new Date(formData.checkOut);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            return diffDays > 0 ? diffDays * room.price : 0;
        } else {
            // Hall Price
            if (!formData.hallId) return 0;
            const hall = halls.find(h => h.id === formData.hallId);
            return hall ? hall.price : 0;
        }
    };

    // Update price when form changes
    useEffect(() => {
        const price = calculatePrice();
        setFormData(prev => ({ ...prev, totalPrice: price }));
    }, [formData.roomId, formData.checkIn, formData.checkOut, rooms, formData.bookingType, formData.hallId, halls, formData.bookingDate]);


    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
                    <p className="text-gray-500 mt-1">Manage reservations</p>
                </div>
                <button
                    onClick={handleNewBookingClick}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                >
                    <Plus size={20} />
                    New Booking
                </button>
            </div>

            {/* Tabs */}
            <div className="flex p-1 bg-gray-100 rounded-xl w-fit">
                {['all', 'rooms', 'halls'].map((tab) => {
                    const count = tab === 'all'
                        ? bookings.length
                        : bookings.filter(b => b.type === (tab === 'rooms' ? 'room' : 'hall')).length;

                    return (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            <span className={`ml-2 text-xs py-0.5 px-1.5 rounded-full ${activeTab === tab ? 'bg-gray-100 text-gray-900' : 'bg-gray-200 text-gray-600'
                                }`}>
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by ID Number only..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                </div>
            </div>

            {/* Booking List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4">Guest</th>
                                <th className="px-6 py-4">Service</th>
                                <th className="px-6 py-4">Date / Session</th>
                                <th className="px-6 py-4">Total</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredBookings.map((booking) => (
                                <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">
                                            {booking.users?.name || booking.guest_name || booking.customer_name || 'Guest'}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {booking.users?.email || booking.guest_email || booking.customer_email || 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{booking.serviceName}</div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {booking.dateDisplay}
                                        {booking.type === 'room' && (
                                            <span className="text-xs text-gray-400 block">
                                                to {new Date(booking.check_out).toLocaleDateString()}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">${booking.total_price}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${booking.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                                            booking.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                                            }`}>
                                            {booking.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${booking.type === 'room' ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-50 text-amber-700'
                                            }`}>
                                            {booking.type === 'room' ? 'Room' : 'Hall'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            {['owner', 'staff_manager', 'receptionist'].includes(userRole) && (
                                                <button
                                                    onClick={() => handleDeleteBooking(booking)}
                                                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Type Selection Modal */}
            {showTypeSelection && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-8 w-full max-w-sm text-center">
                        <h2 className="text-2xl font-bold mb-6 text-gray-900">Select Booking Type</h2>
                        <div className="grid grid-cols-1 gap-4">
                            <button
                                onClick={() => selectBookingType('room')}
                                className="p-4 border-2 border-indigo-100 rounded-xl hover:border-indigo-600 hover:bg-indigo-50 transition-all group"
                            >
                                <div className="text-indigo-600 mb-2 group-hover:scale-110 transition-transform">
                                    <User size={32} className="mx-auto" />
                                </div>
                                <div className="font-bold text-gray-900">Room Booking</div>
                                <div className="text-sm text-gray-500">For hotel stays</div>
                            </button>

                            <button
                                onClick={() => selectBookingType('hall')}
                                className="p-4 border-2 border-amber-100 rounded-xl hover:border-amber-600 hover:bg-amber-50 transition-all group"
                            >
                                <div className="text-amber-600 mb-2 group-hover:scale-110 transition-transform">
                                    <Calendar size={32} className="mx-auto" />
                                </div>
                                <div className="font-bold text-gray-900">Hall Booking</div>
                                <div className="text-sm text-gray-500">For events & functions</div>
                            </button>
                        </div>
                        <button
                            onClick={() => setShowTypeSelection(false)}
                            className="mt-6 text-gray-500 hover:text-gray-700 text-sm font-medium"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Main Booking Form Modal */}
            {isFormatModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md overflow-y-auto max-h-[90vh]">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">
                                New {formData.bookingType === 'room' ? 'Room' : 'Hall'} Reservation
                            </h2>
                            <button onClick={() => setIsFormatModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <XCircle size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveBooking} className="space-y-4">
                            <div className="flex items-center gap-2 mb-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <input
                                    type="checkbox"
                                    id="isGuest"
                                    checked={formData.isGuest || false}
                                    onChange={(e) => setFormData({ ...formData, isGuest: e.target.checked })}
                                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                                />
                                <label htmlFor="isGuest" className="text-sm font-medium text-gray-700">
                                    Walk-in / Guest (No Account)
                                </label>
                            </div>

                            {formData.isGuest ? (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Guest Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.guestName}
                                            onChange={e => setFormData({ ...formData, guestName: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg p-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Guest Phone (Optional)</label>
                                        <input
                                            type="tel"
                                            value={formData.guestPhone || ''}
                                            onChange={e => setFormData({ ...formData, guestPhone: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg p-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Guest ID / Passport / NIC</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.guestId || ''}
                                            onChange={e => setFormData({ ...formData, guestId: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg p-2"
                                            placeholder="NIC / Passport No"
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Guest Email (Must exist)</label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.guestEmail}
                                            onChange={e => setFormData({ ...formData, guestEmail: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg p-2"
                                        />
                                    </div>
                                    {/* Capture ID for Registered Users too if Hall Booking */}
                                    {formData.bookingType === 'hall' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Guest ID / Passport / NIC</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.guestId || ''}
                                                onChange={e => setFormData({ ...formData, guestId: e.target.value })}
                                                className="w-full border border-gray-300 rounded-lg p-2"
                                                placeholder="NIC / Passport No"
                                            />
                                        </div>
                                    )}
                                </>
                            )}

                            {formData.bookingType === 'room' ? (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
                                        <select
                                            className="w-full border border-gray-300 rounded-lg p-2"
                                            required
                                            value={formData.roomId}
                                            onChange={e => setFormData({ ...formData, roomId: e.target.value })}
                                        >
                                            <option value="">Select Room</option>
                                            {rooms.map(r => (
                                                <option key={r.id} value={r.id}>Room {r.room_number} ({r.type}) - ${r.price}/night</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Check In</label>
                                            <input
                                                type="date"
                                                required
                                                min={new Date().toISOString().split('T')[0]}
                                                value={formData.checkIn}
                                                onChange={e => setFormData({ ...formData, checkIn: e.target.value })}
                                                className="w-full border border-gray-300 rounded-lg p-2"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Check Out</label>
                                            <input
                                                type="date"
                                                required
                                                min={formData.checkIn || new Date().toISOString().split('T')[0]}
                                                value={formData.checkOut}
                                                onChange={e => setFormData({ ...formData, checkOut: e.target.value })}
                                                className="w-full border border-gray-300 rounded-lg p-2"
                                            />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* HALL BOOKING FIELDS */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Hall / Venue</label>
                                        <select
                                            className="w-full border border-gray-300 rounded-lg p-2"
                                            required
                                            value={formData.hallId}
                                            onChange={e => setFormData({ ...formData, hallId: e.target.value })}
                                        >
                                            <option value="">Select Venue</option>
                                            {halls.map(h => (
                                                <option key={h.id} value={h.id}>{h.title} - ${h.price}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                            <input
                                                type="date"
                                                required
                                                min={new Date().toISOString().split('T')[0]}
                                                value={formData.bookingDate}
                                                onChange={e => setFormData({ ...formData, bookingDate: e.target.value })}
                                                className="w-full border border-gray-300 rounded-lg p-2"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Session</label>
                                            <select
                                                className="w-full border border-gray-300 rounded-lg p-2"
                                                required
                                                value={formData.sessionType}
                                                onChange={e => setFormData({ ...formData, sessionType: e.target.value })}
                                            >
                                                <option value="Morning">Morning</option>
                                                <option value="Evening">Evening</option>
                                            </select>
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="flex justify-between items-center py-2 border-t border-gray-100">
                                <span className="font-medium text-gray-900">Total Price:</span>
                                <span className="text-xl font-bold text-indigo-600">${formData.totalPrice}</span>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsFormatModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm"
                                >
                                    {submitting ? 'Saving...' : 'Confirm'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div >
    );
};

export default BookingManagement;
