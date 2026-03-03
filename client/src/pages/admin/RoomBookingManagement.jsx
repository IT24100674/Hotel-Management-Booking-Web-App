import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Home, User, Mail, Phone, CreditCard, XCircle } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import PaymentConfirmModal from '../../componets/PaymentConfirmModal';

const RoomBookingManagement = () => {
    const [bookings, setBookings] = useState([]);
    const [rooms, setRooms] = useState([]);
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
        roomId: '',
        checkIn: '',
        checkOut: '',
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
            const [bookingsRes, roomsRes] = await Promise.all([
                fetch('http://localhost:5000/api/room-bookings'),
                fetch('http://localhost:5000/api/rooms')
            ]);

            if (!bookingsRes.ok || !roomsRes.ok) throw new Error('Failed to fetch data');

            const roomBookingsData = await bookingsRes.json();
            const roomsData = await roomsRes.json();

            // Normalize and Sort by created_at (most recent first)
            const normalized = (Array.isArray(roomBookingsData) ? roomBookingsData : [])
                .map(b => ({
                    ...b,
                    sortDate: new Date(b.created_at)
                }))
                .sort((a, b) => b.sortDate - a.sortDate);

            setBookings(normalized);
            setRooms(roomsData);
        } catch (error) {
            console.error('Error fetching room bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => setSearchTerm(e.target.value);

    const filteredBookings = bookings.filter(b => {
        const search = searchTerm.toLowerCase();

        // Handle joined user or guest name
        const userName = b.users?.name || (Array.isArray(b.users) ? b.users[0]?.name : '');
        const guestName = (userName || b.guest_name || '').toLowerCase();

        const guestPhone = (b.guest_phone || '').toLowerCase();
        const guestIdNo = (b.guest_id_no || '').toLowerCase();

        // Handle joined room number
        const roomObj = b.rooms || (Array.isArray(b.rooms) ? b.rooms[0] : null);
        const roomNum = (roomObj?.room_number || '').toString();

        return guestName.includes(search) || guestIdNo.includes(search) || guestPhone.includes(search) || roomNum.includes(search);
    });

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this room booking?')) return;
        try {
            const res = await fetch(`http://localhost:5000/api/room-bookings/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to cancel');
            alert('Booking cancelled successfully');
            fetchData();
        } catch (error) {
            alert(error.message);
        }
    };

    const calculatePrice = () => {
        if (!formData.roomId || !formData.checkIn || !formData.checkOut) return 0;
        const room = rooms.find(r => r.id === formData.roomId);
        if (!room) return 0;

        const start = new Date(formData.checkIn);
        const end = new Date(formData.checkOut);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays > 0 ? diffDays * room.price : 0;
    };

    useEffect(() => {
        setFormData(prev => ({ ...prev, totalPrice: calculatePrice() }));
    }, [formData.roomId, formData.checkIn, formData.checkOut, rooms]);

    const handleSave = (e) => {
        e.preventDefault();
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
                    foundUserData = { name: users[0].name, email: users[0].email, phone: formData.guestPhone };
                } else {
                    alert("User email not found. Use 'Walk-in / Guest' option.");
                    setSubmitting(false);
                    return;
                }
            }

            // Phone validation for all reservations
            const phoneToValidate = formData.guestPhone;
            if (phoneToValidate && (phoneToValidate.length !== 10 || !/^\d+$/.test(phoneToValidate))) {
                alert("Phone number must be exactly 10 digits.");
                setSubmitting(false);
                return;
            }

            if (!phoneToValidate) {
                alert("Phone number is required.");
                setSubmitting(false);
                return;
            }

            const payload = {
                room_id: formData.roomId,
                check_in: formData.checkIn,
                check_out: formData.checkOut,
                total_price: formData.totalPrice,
                status: 'Confirmed',
                user_id,
                guest_name: formData.isGuest ? formData.guestName : foundUserData.name,
                guest_email: formData.isGuest ? formData.guestEmail : foundUserData.email,
                guest_phone: formData.isGuest ? formData.guestPhone : foundUserData.phone,
                guest_id_no: formData.guestId,
                paymentMethod: formData.paymentMethod,
                transactionId: `MAN-R-${Math.random().toString(36).substr(2, 7).toUpperCase()}`
            };

            const res = await fetch('http://localhost:5000/api/room-bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Booking failed');
            }

            alert('Room booking and payment recorded successfully');
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
                    <h1 className="text-3xl font-bold text-gray-900">Room Bookings</h1>
                    <p className="text-gray-500 mt-1">Manage guest stays and room reservations</p>
                </div>
                <button
                    onClick={() => {
                        setFormData({ guestName: '', guestEmail: '', guestPhone: '', guestId: '', roomId: '', checkIn: '', checkOut: '', totalPrice: 0, isGuest: false, paymentMethod: 'Cash' });
                        setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors shadow-sm"
                >
                    <Plus size={20} />
                    New Room Booking
                </button>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search guest name, NIC/Passport, or room..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4">Guest</th>
                                <th className="px-6 py-4">Room</th>
                                <th className="px-6 py-4">Stay Dates</th>
                                <th className="px-6 py-4">Total</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">Loading bookings...</td></tr>
                            ) : filteredBookings.length === 0 ? (
                                <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">No room bookings found.</td></tr>
                            ) : (
                                filteredBookings.map((b) => (
                                    <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{b.users?.name || b.guest_name || 'Guest'}</div>
                                            <div className="text-xs text-gray-500">{b.users?.email || b.guest_email || 'N/A'}</div>
                                            <div className="text-xs text-gray-500">{b.guest_phone || 'No Phone'}</div>
                                            <div className="text-[10px] text-gray-400 font-mono mt-0.5">{b.guest_id_no}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Home size={16} className="text-amber-500" />
                                                <span className="font-medium text-gray-900">Room {b.rooms?.room_number}</span>
                                            </div>
                                            <div className="text-xs text-gray-500">{b.rooms?.type}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{new Date(b.check_in).toLocaleDateString()}</div>
                                            <div className="text-xs text-gray-400">to {new Date(b.check_out).toLocaleDateString()}</div>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-amber-600">${b.total_price}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${b.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {b.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {['owner', 'staff_manager', 'room_manager'].includes(userRole) && b.status === 'Confirmed' && (
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
                            <h2 className="text-2xl font-playfair font-bold text-gray-900">New Room Reservation</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                                <Plus size={24} className="rotate-45" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="flex items-center gap-3 mb-4 bg-amber-50 p-4 rounded-xl border border-amber-100">
                                <input
                                    type="checkbox"
                                    id="isGuest"
                                    checked={formData.isGuest}
                                    onChange={(e) => setFormData({ ...formData, isGuest: e.target.checked })}
                                    className="w-5 h-5 text-amber-600 rounded-lg focus:ring-amber-500"
                                />
                                <label htmlFor="isGuest" className="text-sm font-semibold text-amber-900">
                                    Walk-in / Guest (No Registered Account)
                                </label>
                            </div>

                            {formData.isGuest ? (
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700 ml-1">Guest Name</label>
                                    <input type="text" required value={formData.guestName} onChange={e => setFormData({ ...formData, guestName: e.target.value })} className="w-full border-gray-200 border rounded-xl p-3 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none" placeholder="John Doe" />
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700 ml-1">Registered Email</label>
                                    <input type="email" required value={formData.guestEmail} onChange={e => setFormData({ ...formData, guestEmail: e.target.value })} className="w-full border-gray-200 border rounded-xl p-3 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none" placeholder="guest@example.com" />
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700 ml-1">Phone Number</label>
                                <input type="tel" required value={formData.guestPhone} onChange={e => setFormData({ ...formData, guestPhone: e.target.value })} className="w-full border-gray-200 border rounded-xl p-3 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none" placeholder="10 Digits" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700 ml-1">ID / Passport / NIC</label>
                                <input type="text" required value={formData.guestId} onChange={e => setFormData({ ...formData, guestId: e.target.value })} className="w-full border-gray-200 border rounded-xl p-3 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none" placeholder="ID Number" />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700 ml-1">Select Room</label>
                                <select required value={formData.roomId} onChange={e => setFormData({ ...formData, roomId: e.target.value })} className="w-full border-gray-200 border rounded-xl p-3 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none bg-white">
                                    <option value="">Choose a room...</option>
                                    {rooms.map(r => (
                                        <option key={r.id} value={r.id}>Room {r.room_number} ({r.type}) - ${r.price}/night</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700 ml-1">Check In</label>
                                    <input type="date" required min={new Date().toISOString().split('T')[0]} value={formData.checkIn} onChange={e => setFormData({ ...formData, checkIn: e.target.value })} className="w-full border-gray-200 border rounded-xl p-3 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700 ml-1">Check Out</label>
                                    <input type="date" required min={formData.checkIn || new Date().toISOString().split('T')[0]} value={formData.checkOut} onChange={e => setFormData({ ...formData, checkOut: e.target.value })} className="w-full border-gray-200 border rounded-xl p-3 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none" />
                                </div>
                            </div>

                            <div className="space-y-4 py-4 border-t border-gray-100 mt-6">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700 ml-1">Payment Method</label>
                                    <select
                                        value={formData.paymentMethod}
                                        onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
                                        className="w-full border-gray-200 border rounded-xl p-3 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none bg-white"
                                    >
                                        <option value="Cash">Cash (Recommended for Walk-in)</option>
                                        <option value="Card">Card</option>
                                    </select>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-gray-600">Total Calculation:</span>
                                    <span className="text-2xl font-bold text-amber-600">${formData.totalPrice}</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold py-4 rounded-xl hover:from-amber-700 hover:to-amber-800 transition-all shadow-lg shadow-amber-900/20 disabled:opacity-50"
                            >
                                {submitting ? 'Confirming...' : 'Create Reservation'}
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

export default RoomBookingManagement;
