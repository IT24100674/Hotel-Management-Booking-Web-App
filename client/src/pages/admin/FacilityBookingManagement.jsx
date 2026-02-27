import React, { useState, useEffect } from 'react';
import { Search, Trash2, Calendar, User, Clock, Users, Loader, Plus, XCircle, CreditCard, Mail, Phone, Shield } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import Modal from '../../componets/Modal';
import PaymentConfirmModal from '../../componets/PaymentConfirmModal';

const FacilityBookingManagement = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [userRole, setUserRole] = useState('');
    const [facilities, setFacilities] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        facility_id: '',
        isGuest: false,
        guestEmail: '',
        customer_name: '',
        customer_phone: '',
        customer_id_no: '',
        booking_date: '',
        start_time: '',
        duration_hours: 1,
        guest_count: 1,
        total_price: 0,
        paymentMethod: 'Cash'
    });

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('hotel_user') || '{}');
        setUserRole(user.role || '');
        fetchBookings();
        fetchFacilities();
    }, []);

    const fetchFacilities = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/facilities');
            const data = await res.json();
            if (res.ok) setFacilities(data);
        } catch (err) {
            console.error('Error fetching facilities:', err);
        }
    };

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const res = await fetch('http://localhost:5000/api/facility-bookings');
            const data = await res.json();
            if (res.ok) {
                setBookings(data);
            } else {
                console.error('Failed to fetch bookings:', data);
            }
        } catch (err) {
            console.error('Error fetching bookings:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this booking?')) return;
        try {
            const res = await fetch(`http://localhost:5000/api/facility-bookings/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setBookings(bookings.filter(b => b.id !== id));
            } else {
                alert('Failed to delete booking');
            }
        } catch (err) {
            console.error('Error deleting booking:', err);
        }
    };

    const handleSave = (e) => {
        e.preventDefault();
        setIsPaymentModalOpen(true);
    };

    const confirmBooking = async () => {
        setIsPaymentModalOpen(false);
        setSubmitting(true);

        try {
            // 1. Availability Check
            const availRes = await fetch(`http://localhost:5000/api/facility-bookings/check-availability?facility_id=${formData.facility_id}&booking_date=${formData.booking_date}&start_time=${formData.start_time}&guest_count=${formData.guest_count}`);
            const availData = await availRes.json();

            if (!availRes.ok || !availData.available) {
                alert(availData.message || 'Facility not available for this slot.');
                setSubmitting(false);
                return;
            }

            // 2. User/UserId resolving
            let user_id = null;
            let finalName = formData.customer_name;
            let finalEmail = formData.guestEmail;
            let finalPhone = formData.customer_phone;

            if (!formData.isGuest) {
                const { data: users } = await supabase
                    .from('users')
                    .select('id, name, email')
                    .ilike('email', formData.guestEmail.trim());

                if (users && users.length > 0) {
                    user_id = users[0].id;
                    finalName = users[0].name;
                    finalEmail = users[0].email;
                } else {
                    alert("User not found. Use 'Walk-in / Guest' option.");
                    setSubmitting(false);
                    return;
                }
            }

            // 3. Create Booking
            const res = await fetch('http://localhost:5000/api/facility-bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    user_id,
                    customer_name: finalName,
                    customer_email: finalEmail,
                    customer_phone: finalPhone,
                    paymentMethod: formData.paymentMethod,
                    transactionId: `MAN-F-${Math.random().toString(36).substr(2, 7).toUpperCase()}`
                })
            });

            if (res.ok) {
                alert('Facility booking and payment recorded successfully!');
                fetchBookings();
                setIsModalOpen(false);
            } else {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to create booking');
            }
        } catch (err) {
            alert(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const calculatePrice = () => {
        const facility = facilities.find(f => f.id === formData.facility_id);
        if (!facility) return 0;
        return (parseFloat(facility.price_per_hour) || 0) * (parseInt(formData.duration_hours) || 1) * (parseInt(formData.guest_count) || 1);
    };

    useEffect(() => {
        setFormData(prev => ({ ...prev, total_price: calculatePrice() }));
    }, [formData.facility_id, formData.duration_hours, formData.guest_count, facilities]);

    const filteredBookings = bookings.filter(booking => {
        const search = searchTerm.toLowerCase();
        const customerName = (booking.customer_name || '').toLowerCase();
        const customerId = (booking.customer_id_no || '').toLowerCase();
        const customerEmail = (booking.customer_email || '').toLowerCase();

        // Handle joined facility name
        const facilityObj = booking.facilities || (Array.isArray(booking.facilities) ? booking.facilities[0] : null);
        const facilityName = (facilityObj?.name || '').toLowerCase();

        return customerName.includes(search) ||
            customerId.includes(search) ||
            customerEmail.includes(search) ||
            facilityName.includes(search);
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Facility Bookings</h1>
                    <p className="text-gray-500 mt-1">Manage reservations for gym, spa, and other facilities</p>
                </div>
                <button
                    onClick={() => {
                        setFormData({
                            facility_id: '',
                            isGuest: false,
                            guestEmail: '',
                            customer_name: '',
                            customer_phone: '',
                            customer_id_no: '',
                            booking_date: '',
                            start_time: '',
                            duration_hours: 1,
                            guest_count: 1,
                            total_price: 0,
                            paymentMethod: 'Cash'
                        });
                        setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors shadow-sm font-semibold"
                >
                    <Plus size={20} />
                    New Facility Booking
                </button>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search name, NIC/Passport, or facility..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
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
                                <th className="px-6 py-4">Facility</th>
                                <th className="px-6 py-4">Date & Time</th>
                                <th className="px-6 py-4">Duration</th>
                                <th className="px-6 py-4">Guests</th>
                                <th className="px-6 py-4">Total Price</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-10 text-center">
                                        <Loader className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
                                    </td>
                                </tr>
                            ) : filteredBookings.length > 0 ? (
                                filteredBookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{booking.customer_name || 'Anonymous'}</div>
                                            <div className="text-xs font-bold text-secondary uppercase tracking-widest mt-1">{booking.customer_id_no || 'No ID'}</div>
                                            <div className="text-xs text-gray-500 mt-1">{booking.customer_email}</div>
                                            <div className="text-xs text-gray-400">{booking.customer_phone}</div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {booking.facilities?.name}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Calendar size={14} className="text-gray-400" />
                                                {new Date(booking.booking_date).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Clock size={14} className="text-gray-400" />
                                                {booking.start_time}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {booking.duration_hours} Hour(s)
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Users size={14} className="text-gray-400" />
                                                {booking.guest_count}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-indigo-600">
                                            ${booking.total_price}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${booking.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {booking.status === 'Confirmed' && (
                                                <button
                                                    onClick={() => handleDelete(booking.id)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-100"
                                                >
                                                    <XCircle size={14} />
                                                    CANCEL
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="px-6 py-10 text-center text-gray-500">
                                        No bookings found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Facility Booking">
                <form onSubmit={handleSave} className="space-y-4">
                    {/* Guest Toggle */}
                    <div className="flex items-center gap-3 p-3 bg-secondary/5 rounded-xl border border-secondary/10">
                        <input
                            type="checkbox"
                            id="isGuest"
                            checked={formData.isGuest}
                            onChange={(e) => setFormData({ ...formData, isGuest: e.target.checked })}
                            className="w-5 h-5 text-secondary rounded-lg focus:ring-secondary/20"
                        />
                        <label htmlFor="isGuest" className="text-sm font-semibold text-secondary">
                            Walk-in / Guest (No Registered Account)
                        </label>
                    </div>

                    {/* Customer Info */}
                    {formData.isGuest ? (
                        <>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Customer Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input type="text" required value={formData.customer_name} onChange={e => setFormData({ ...formData, customer_name: e.target.value })} className="w-full pl-10 pr-4 py-2 border border-gray-100 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-secondary/20 transition-all" placeholder="Enter name" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Phone</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input type="tel" value={formData.customer_phone} onChange={e => setFormData({ ...formData, customer_phone: e.target.value })} className="w-full pl-10 pr-4 py-2 border border-gray-100 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-secondary/20 transition-all" placeholder="Phone" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">ID / Passport</label>
                                    <div className="relative">
                                        <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input type="text" required value={formData.customer_id_no} onChange={e => setFormData({ ...formData, customer_id_no: e.target.value })} className="w-full pl-10 pr-4 py-2 border border-gray-100 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-secondary/20 transition-all" placeholder="NIC/Passport" />
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Member Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input type="email" required value={formData.guestEmail} onChange={e => setFormData({ ...formData, guestEmail: e.target.value })} className="w-full pl-10 pr-4 py-2 border border-gray-100 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-secondary/20 transition-all" placeholder="email@example.com" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">ID / Passport</label>
                                <div className="relative">
                                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input type="text" required value={formData.customer_id_no} onChange={e => setFormData({ ...formData, customer_id_no: e.target.value })} className="w-full pl-10 pr-4 py-2 border border-gray-100 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-secondary/20 transition-all" placeholder="NIC/Passport" />
                                </div>
                            </div>
                        </>
                    )}

                    {/* Facility Selection */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Select Facility</label>
                        <select
                            required
                            value={formData.facility_id}
                            onChange={e => setFormData({ ...formData, facility_id: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-100 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-secondary/20 transition-all"
                        >
                            <option value="">Choose a facility...</option>
                            {facilities.map(f => (
                                <option key={f.id} value={f.id}>{f.name} (${f.price_per_hour}/hr)</option>
                            ))}
                        </select>
                    </div>

                    {/* Timing */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Date</label>
                            <input
                                type="date"
                                required
                                min={new Date().toISOString().split('T')[0]}
                                value={formData.booking_date}
                                onChange={e => setFormData({ ...formData, booking_date: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-100 rounded-xl bg-gray-50 outline-none"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Start Time</label>
                            <input
                                type="time"
                                required
                                value={formData.start_time}
                                onChange={e => setFormData({ ...formData, start_time: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-100 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-secondary/20 transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Duration (Hrs)</label>
                            <input
                                type="number"
                                required
                                min="1"
                                value={formData.duration_hours}
                                onChange={e => setFormData({ ...formData, duration_hours: parseInt(e.target.value) })}
                                onWheel={(e) => e.target.blur()}
                                className="w-full px-4 py-2 border border-gray-100 rounded-xl bg-gray-50 outline-none"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Guests</label>
                            <input
                                type="number"
                                required
                                min="1"
                                value={formData.guest_count}
                                onChange={e => setFormData({ ...formData, guest_count: parseInt(e.target.value) })}
                                onWheel={(e) => e.target.blur()}
                                className="w-full px-4 py-2 border border-gray-100 rounded-xl bg-gray-50 outline-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-gray-100">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Payment Method</label>
                            <select
                                value={formData.paymentMethod}
                                onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-100 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-secondary/20 transition-all font-semibold"
                            >
                                <option value="Cash">Cash</option>
                                <option value="Card">Card</option>
                            </select>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-gray-400 uppercase text-xs tracking-widest">Calculated Total</span>
                            <div className="flex items-center gap-2">
                                <CreditCard className="text-secondary" size={18} />
                                <span className="text-2xl font-bold text-secondary">${formData.total_price}</span>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-secondary text-white font-bold py-3 rounded-xl hover:bg-secondary/90 shadow-lg shadow-secondary/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {submitting ? <Loader className="animate-spin" size={20} /> : 'Create Manual Booking'}
                    </button>
                </form>
            </Modal>

            <PaymentConfirmModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                onConfirm={confirmBooking}
                amount={formData.total_price}
                method={formData.paymentMethod}
            />
        </div>
    );
};

export default FacilityBookingManagement;
