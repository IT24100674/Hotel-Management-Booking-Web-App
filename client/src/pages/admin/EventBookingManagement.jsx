import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Calendar, Users, Mail, Phone, Clock, XCircle } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import PaymentConfirmModal from '../../componets/PaymentConfirmModal';

const EventBookingManagement = () => {
    const [bookings, setBookings] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [userRole, setUserRole] = useState('');

    const [formData, setFormData] = useState({
        guestName: '',
        guestEmail: '',
        guestPhone: '',
        guestId: '',
        eventId: '',
        bookingDate: '',
        sessionType: 'Morning',
        guestCount: 1,
        totalPrice: 0,
        isGuest: false,
        paymentMethod: 'Cash'
    });

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('hotel_user') || '{}');
        setUserRole(user.role || '');
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Event Packages
            const { data: eventsData } = await supabase.from('events').select('*');
            if (eventsData) setEvents(eventsData);

            // Fetch Event Bookings via Backend API
            const res = await fetch('http://localhost:5000/api/event-bookings');
            if (!res.ok) throw new Error('Failed to fetch event bookings');
            const eventBookings = await res.json();

            setBookings(eventBookings || []);
        } catch (error) {
            console.error('Error fetching event bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => setSearchTerm(e.target.value);

    const filteredBookings = bookings.filter(b => {
        const search = searchTerm.toLowerCase();
        const guestName = (b.customer_name || '').toLowerCase();
        const guestIdNo = (b.customer_id_no || '').toLowerCase();

        // Handle joined event/package title
        const eventObj = b.events || (Array.isArray(b.events) ? b.events[0] : null);
        const eventTitle = (eventObj?.title || '').toLowerCase();

        return guestName.includes(search) || guestIdNo.includes(search) || eventTitle.includes(search);
    });

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this event booking?')) return;
        try {
            const res = await fetch(`http://localhost:5000/api/event-bookings/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to cancel');
            alert('Booking cancelled successfully');
            fetchData();
        } catch (error) {
            alert(error.message);
        }
    };

    const calculatePrice = () => {
        if (!formData.eventId) return 0;
        const event = events.find(h => h.id === formData.eventId);
        const pricePerGuest = event ? (event.price_per_guest || 0) : 0;
        return (parseInt(formData.guestCount) || 0) * pricePerGuest;
    };

    useEffect(() => {
        setFormData(prev => ({ ...prev, totalPrice: calculatePrice() }));
    }, [formData.eventId, formData.guestCount, events]);

    const handleSave = (e) => {
        e.preventDefault();

        // Capacity Check
        const selectedEvent = events.find(h => h.id === formData.eventId);
        if (selectedEvent && parseInt(formData.guestCount) > selectedEvent.capacity) {
            alert(`Maximum capacity for this package is ${selectedEvent.capacity}.`);
            return;
        }

        setIsPaymentModalOpen(true);
    };

    const confirmBooking = async () => {
        setIsPaymentModalOpen(false);
        setSubmitting(true);
        try {
            let user_id = null;
            let foundUserData = { name: null, email: null, phone: null };

            if (!formData.isGuest) {
                const { data: users } = await supabase
                    .from('users')
                    .select('id, email, name')
                    .ilike('email', formData.guestEmail.trim());

                if (users && users.length > 0) {
                    user_id = users[0].id;
                    foundUserData = { name: users[0].name, email: users[0].email, phone: null };
                } else {
                    alert("User email not found. Use 'Walk-in / Guest' option.");
                    setSubmitting(false);
                    return;
                }
            }

            // Availability Check
            const { data: existing } = await supabase
                .from('event_bookings')
                .select('id')
                .eq('hall_id', formData.eventId)
                .eq('booking_date', formData.bookingDate)
                .eq('session_type', formData.sessionType)
                .neq('status', 'Cancelled');

            if (existing && existing.length > 0) {
                alert("This location is already booked for the selected date and session.");
                setSubmitting(false);
                return;
            }

            const payload = {
                hall_id: formData.eventId,
                user_id,
                customer_name: formData.isGuest ? formData.guestName : foundUserData.name,
                customer_email: formData.isGuest ? formData.guestEmail : foundUserData.email,
                customer_phone: formData.isGuest ? formData.guestPhone : foundUserData.phone,
                customer_id_no: formData.guestId,
                booking_date: formData.bookingDate,
                session_type: formData.sessionType,
                guest_count: formData.guestCount,
                total_price: formData.totalPrice,
                paymentMethod: formData.paymentMethod,
                transactionId: `MAN-E-${Math.random().toString(36).substr(2, 7).toUpperCase()}`
            };

            const res = await fetch('http://localhost:5000/api/event-bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Booking failed');
            }

            alert('Event booking and payment recorded successfully');
            fetchData();
            setIsModalOpen(false);
        } catch (error) {
            alert(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Event Bookings</h1>
                    <p className="text-gray-500 mt-1">Manage events, weddings, and party celebrations</p>
                </div>
                <button
                    onClick={() => {
                        setFormData({ guestName: '', guestEmail: '', guestPhone: '', guestId: '', eventId: '', bookingDate: '', sessionType: 'Morning', guestCount: 1, totalPrice: 0, isGuest: false, paymentMethod: 'Cash' });
                        setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                >
                    <Plus size={20} />
                    New Event Booking
                </button>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search customer, NIC/Passport, or package..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Package/Event</th>
                                <th className="px-6 py-4">Event Details</th>
                                <th className="px-6 py-4">Total</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">Loading bookings...</td></tr>
                            ) : filteredBookings.length === 0 ? (
                                <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">No event bookings found.</td></tr>
                            ) : (
                                filteredBookings.map((b) => (
                                    <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{b.customer_name || 'Guest'}</div>
                                            <div className="text-xs text-gray-500">{b.customer_email || 'N/A'}</div>
                                            <div className="text-[10px] text-gray-400 font-mono mt-0.5">{b.customer_id_no}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={16} className="text-indigo-500" />
                                                <span className="font-medium text-gray-900">{b.events?.title || 'Event Package'}</span>
                                            </div>
                                            <div className="text-xs text-gray-500">{b.events?.type}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{new Date(b.booking_date).toLocaleDateString()}</div>
                                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                                <Clock size={12} /> {b.session_type} • <Users size={12} /> {b.guest_count} guests
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-indigo-600">${b.total_price}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${b.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {b.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {['owner', 'staff_manager', 'event_manager'].includes(userRole) && b.status === 'Confirmed' && (
                                                <button
                                                    onClick={() => handleDelete(b.id)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-100"
                                                >
                                                    <XCircle size={14} />
                                                    CANCEL
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh]">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-playfair font-bold text-gray-900">New Event Booking</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                                <Plus size={24} className="rotate-45" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="flex items-center gap-3 mb-4 bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                                <input
                                    type="checkbox"
                                    id="isGuest"
                                    checked={formData.isGuest}
                                    onChange={(e) => setFormData({ ...formData, isGuest: e.target.checked })}
                                    className="w-5 h-5 text-indigo-600 rounded-lg focus:ring-indigo-500"
                                />
                                <label htmlFor="isGuest" className="text-sm font-semibold text-indigo-900">
                                    Walk-in / Guest (No Registered Account)
                                </label>
                            </div>

                            {formData.isGuest ? (
                                <>
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-gray-700 ml-1">Customer Name</label>
                                        <input type="text" required value={formData.guestName} onChange={e => setFormData({ ...formData, guestName: e.target.value })} className="w-full border-gray-200 border rounded-xl p-3 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" placeholder="John Doe" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-gray-700 ml-1">Phone Number</label>
                                        <input type="tel" value={formData.guestPhone} onChange={e => setFormData({ ...formData, guestPhone: e.target.value })} className="w-full border-gray-200 border rounded-xl p-3 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" placeholder="+1 234 567 890" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-gray-700 ml-1">ID / Passport / NIC</label>
                                        <input type="text" required value={formData.guestId} onChange={e => setFormData({ ...formData, guestId: e.target.value })} className="w-full border-gray-200 border rounded-xl p-3 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" placeholder="ID Number" />
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700 ml-1">Registered Email</label>
                                    <input type="email" required value={formData.guestEmail} onChange={e => setFormData({ ...formData, guestEmail: e.target.value })} className="w-full border-gray-200 border rounded-xl p-3 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" placeholder="guest@example.com" />
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700 ml-1">Select Package</label>
                                <select required value={formData.eventId} onChange={e => setFormData({ ...formData, eventId: e.target.value })} className="w-full border-gray-200 border rounded-xl p-3 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-white">
                                    <option value="">Choose a package...</option>
                                    {events.map(h => (
                                        <option key={h.id} value={h.id}>{h.title} (${h.price_per_guest}/guest)</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700 ml-1">Event Date</label>
                                    <input type="date" required min={new Date().toISOString().split('T')[0]} value={formData.bookingDate} onChange={e => setFormData({ ...formData, bookingDate: e.target.value })} className="w-full border-gray-200 border rounded-xl p-3 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700 ml-1">Session</label>
                                    <select required value={formData.sessionType} onChange={e => setFormData({ ...formData, sessionType: e.target.value })} className="w-full border-gray-200 border rounded-xl p-3 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-white">
                                        <option value="Morning">Morning</option>
                                        <option value="Evening">Evening</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700 ml-1">Number of Guests</label>
                                <input type="number" required min="1" value={formData.guestCount} onChange={e => setFormData({ ...formData, guestCount: e.target.value })} onWheel={(e) => e.target.blur()} className="w-full border-gray-200 border rounded-xl p-3 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" placeholder="100" />
                            </div>

                            <div className="space-y-4 py-4 border-t border-gray-100 mt-6">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700 ml-1">Payment Method</label>
                                    <select
                                        value={formData.paymentMethod}
                                        onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
                                        className="w-full border-gray-200 border rounded-xl p-3 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-white"
                                    >
                                        <option value="Cash">Cash</option>
                                        <option value="Card">Card</option>
                                    </select>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-gray-600">Total Calculation:</span>
                                    <span className="text-2xl font-bold text-indigo-600">${formData.totalPrice}</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-900/20 disabled:opacity-50"
                            >
                                {submitting ? 'Confirming...' : 'Create Booking'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <PaymentConfirmModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                onConfirm={confirmBooking}
                amount={formData.totalPrice}
                method={formData.paymentMethod}
            />
        </div>
    );
};

export default EventBookingManagement;
