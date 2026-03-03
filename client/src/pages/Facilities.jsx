import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wifi, Coffee, Car, Dumbbell, Image as ImageIcon, Loader, Clock, Info, Users, Calendar, Timer, DollarSign, ArrowRight, CreditCard } from 'lucide-react';
import { supabase } from '../supabaseClient';
import Modal from '../componets/Modal';

const FacilityCard = ({ facility, onBook }) => {
    return (
        <div className="bg-white rounded-[40px] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 group flex flex-col h-full border-b-4 border-b-transparent hover:border-b-secondary hover:-translate-y-2">
            {/* Image Container */}
            <div className="relative h-72 overflow-hidden rounded-t-[40px] isolation-auto">
                {facility.image_url ? (
                    <img
                        src={facility.image_url}
                        alt={facility.name}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                        style={{ backfaceVisibility: 'hidden' }}
                    />
                ) : (
                    <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                        <ImageIcon className="w-16 h-16 text-gray-200" />
                    </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>

                <div className="absolute top-6 right-6">
                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md shadow-sm border
                        ${facility.status === 'Operational'
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                        {facility.status}
                    </div>
                </div>

                {facility.price_per_hour > 0 && (
                    <div className="absolute bottom-6 left-6 text-white bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
                        <div className="flex flex-col">
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-3xl font-black font-playfair tracking-tighter text-secondary">${facility.price_per_hour}</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">/ hour</span>
                            </div>
                            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-300 -mt-1">Per Person</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-10 flex-1 flex flex-col">
                <div className="mb-4">
                    <h3 className="text-3xl font-playfair font-black text-gray-900 leading-tight group-hover:text-secondary transition-colors duration-300">
                        {facility.name}
                    </h3>
                    <div className="w-12 h-1 bg-secondary/20 mt-3 group-hover:w-20 transition-all duration-500"></div>
                </div>

                <p className="text-gray-500 mb-8 line-clamp-4 text-sm leading-relaxed flex-1 font-medium">
                    {facility.description || "Experience our premium services designed for your ultimate comfort and luxury."}
                </p>

                {/* Icons/Badges */}
                <div className="flex flex-wrap gap-4 items-center text-gray-400 mb-8">
                    <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100 transition-colors hover:border-secondary/20">
                        <Users size={14} className="text-secondary" />
                        <span className="text-[10px] font-black uppercase tracking-tighter text-gray-600">
                            Up to {facility.max_capacity} People
                        </span>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100 transition-colors hover:border-secondary/20">
                        <Clock size={14} className="text-secondary" />
                        <span className="text-[10px] font-black uppercase tracking-tighter text-gray-600">Premium Access</span>
                    </div>
                </div>

                <button
                    onClick={() => onBook(facility)}
                    className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 hover:bg-secondary hover:text-primary transition-all duration-300 group/btn shadow-xl shadow-gray-200/50"
                >
                    Book This Facility
                    <ArrowRight size={16} className="transition-transform group-hover/btn:translate-x-1" />
                </button>
            </div>
        </div>
    );
};

const Facilities = () => {
    const [facilities, setFacilities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Booking State
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [selectedFacility, setSelectedFacility] = useState(null);
    const [bookingData, setBookingData] = useState({
        customer_name: '',
        customer_id_no: '',
        customer_phone: '',
        customer_email: '',
        booking_date: '',
        start_time: '10:00',
        duration_hours: 1,
        guest_count: 1
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchFacilities();
        checkUser();
    }, []);

    const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setBookingData(prev => ({
                ...prev,
                customer_email: user.email
            }));
        }
    };

    const fetchFacilities = async () => {
        try {
            setLoading(true);
            const res = await fetch('http://localhost:5000/api/facilities');
            const data = await res.json();
            if (res.ok) {
                setFacilities(data);
            } else {
                setError('Failed to load facilities');
            }
        } catch (err) {
            setError('Error connecting to server');
        } finally {
            setLoading(false);
        }
    };

    const openBookingModal = async (facility) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            alert("Please sign in to book a facility.");
            navigate('/sign-in');
            return;
        }
        setSelectedFacility(facility);
        setBookingData(prev => ({
            ...prev,
            guest_count: 1,
            duration_hours: 1
        }));
        setIsBookingModalOpen(true);
    };

    const handleBookingSubmit = async (e) => {
        e.preventDefault();

        // --- PHONE VALIDATION ---
        if (bookingData.customer_phone.length !== 10 || !/^\d+$/.test(bookingData.customer_phone)) {
            alert("Phone number must be exactly 10 digits.");
            return;
        }

        setSubmitting(true);

        try {
            const totalPrice = (selectedFacility.price_per_hour * bookingData.duration_hours * bookingData.guest_count).toFixed(2);

            // 1. Check Availability
            const availRes = await fetch(`http://localhost:5000/api/facility-bookings/check-availability?facility_id=${selectedFacility.id}&booking_date=${bookingData.booking_date}&start_time=${bookingData.start_time}&guest_count=${bookingData.guest_count}`);
            const availData = await availRes.json();

            if (!availRes.ok) {
                alert(availData.message || 'Availability check failed');
                return;
            }

            // 2. Prepare Booking Details for Payment Page
            const { data: { user } } = await supabase.auth.getUser();
            const bookingDetails = {
                ...bookingData,
                facility_id: selectedFacility.id,
                user_id: user?.id,
                customer_name: bookingData.customer_name,
                customer_email: bookingData.customer_email,
                customer_phone: bookingData.customer_phone,
                customer_id_no: bookingData.customer_id_no,
                total_price: totalPrice
            };

            // 3. Redirect to Payment
            navigate('/payment', {
                state: {
                    bookingDetails,
                    facility: selectedFacility,
                    type: 'facility'
                }
            });

        } catch (err) {
            console.error('Error proceeding to payment:', err);
            alert('An error occurred. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="relative">
                    <div className="w-20 h-20 border-2 border-secondary/20 rounded-full animate-ping"></div>
                    <Loader className="w-8 h-8 text-secondary animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
            </div>
        );
    }

    const totalPrice = selectedFacility
        ? (selectedFacility.price_per_hour * bookingData.duration_hours * bookingData.guest_count).toFixed(2)
        : 0;

    return (
        <div className="min-h-screen bg-white pb-24">
            {/* Elegant Header */}
            <div className="relative pt-40 pb-24 px-4 overflow-hidden bg-gray-950">
                {/* Abstract decorative elements */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-secondary/5 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[120px] translate-y-1/3 -translate-x-1/4"></div>

                <div className="container-custom text-center relative z-10">
                    <div className="inline-block px-6 py-2 mb-8 bg-secondary/10 border border-secondary/20 rounded-full">
                        <span className="text-secondary text-[11px] font-black tracking-[0.4em] uppercase">Exquisite Amenities</span>
                    </div>

                    <h1 className="text-6xl md:text-8xl font-playfair font-black text-white mb-8 leading-tight">
                        Other <span className="text-secondary italic">Facilities</span>
                    </h1>

                    <div className="w-32 h-1 bg-gradient-to-r from-transparent via-secondary to-transparent mx-auto mb-10"></div>

                    <p className="text-gray-400 max-w-2xl mx-auto text-xl font-medium leading-relaxed">
                        Discover a collection of premium services meticulously designed to enhance your stay and create unforgettable memories.
                    </p>
                </div>
            </div>

            <div className="container-custom px-4 -mt-12 relative z-20">
                {error ? (
                    <div className="text-center p-12 bg-white rounded-[3rem] shadow-2xl border border-red-50 max-w-2xl mx-auto">
                        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Info size={40} />
                        </div>
                        <h3 className="text-2xl font-playfair font-bold text-gray-900 mb-2">Something went wrong</h3>
                        <p className="text-gray-500">{error}</p>
                    </div>
                ) : (
                    <>
                        {facilities.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                {facilities.map((facility) => (
                                    <FacilityCard key={facility.id} facility={facility} onBook={openBookingModal} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-32 bg-gray-50 rounded-[4rem] border-2 border-dashed border-gray-200">
                                <div className="w-24 h-24 bg-white shadow-xl rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-gray-100">
                                    <ImageIcon className="w-10 h-10 text-gray-300" />
                                </div>
                                <h3 className="text-3xl font-playfair font-black text-gray-900 mb-4">Under Enhancement</h3>
                                <p className="text-gray-500 max-w-sm mx-auto font-medium">Our premium facilities are being updated to serve you better. Please check back soon.</p>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Booking Modal */}
            <Modal
                isOpen={isBookingModalOpen}
                onClose={() => setIsBookingModalOpen(false)}
                title={`Book ${selectedFacility?.name}`}
            >
                <form onSubmit={handleBookingSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Full Name</label>
                            <div className="relative">
                                <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary" size={16} />
                                <input
                                    type="text"
                                    required
                                    placeholder="Enter your full name"
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all font-medium text-gray-900"
                                    value={bookingData.customer_name}
                                    onChange={(e) => setBookingData({ ...bookingData, customer_name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="col-span-2">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Customer NIC / Passport Number</label>
                            <div className="relative">
                                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary" size={16} />
                                <input
                                    type="text"
                                    required
                                    placeholder="Enter NIC or Passport Number"
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all font-medium text-gray-900"
                                    value={bookingData.customer_id_no}
                                    onChange={(e) => setBookingData({ ...bookingData, customer_id_no: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Phone Number</label>
                            <input
                                type="tel"
                                required
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all font-medium text-gray-900"
                                value={bookingData.customer_phone}
                                onChange={(e) => setBookingData({ ...bookingData, customer_phone: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Booking Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary" size={16} />
                                <input
                                    type="date"
                                    required
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all font-medium text-gray-900"
                                    value={bookingData.booking_date}
                                    onChange={(e) => setBookingData({ ...bookingData, booking_date: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Start Time</label>
                            <div className="relative">
                                <Timer className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary" size={16} />
                                <input
                                    type="time"
                                    required
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all font-medium text-gray-900"
                                    value={bookingData.start_time}
                                    onChange={(e) => setBookingData({ ...bookingData, start_time: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Duration (Hours)</label>
                            <input
                                type="number"
                                required
                                min="1"
                                max="12"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all font-medium text-gray-900"
                                value={bookingData.duration_hours}
                                onChange={(e) => setBookingData({ ...bookingData, duration_hours: parseInt(e.target.value) })}
                                onWheel={(e) => e.target.blur()}
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Guest Count (Max {selectedFacility?.max_capacity})</label>
                            <div className="relative">
                                <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary" size={16} />
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    max={selectedFacility?.max_capacity}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all font-medium text-gray-900"
                                    value={bookingData.guest_count}
                                    onChange={(e) => {
                                        const value = e.target.value === '' ? '' : parseInt(e.target.value);
                                        setBookingData({ ...bookingData, guest_count: value });
                                    }}
                                    onWheel={(e) => e.target.blur()}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-primary/5 rounded-[2rem] border border-primary/5">
                        <div className="flex justify-between items-center">
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">Total Amount</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-black font-playfair text-primary">${totalPrice}</span>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">USD</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-[9px] font-bold text-secondary uppercase tracking-[0.2em] block">Calculation</span>
                                <span className="text-[11px] font-medium text-gray-500">${selectedFacility?.price_per_hour} × {bookingData.duration_hours}h × {bookingData.guest_count}p</span>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 hover:bg-secondary hover:text-primary transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-primary/20"
                    >
                        {submitting ? (
                            <div className="flex items-center gap-2">
                                <Loader size={18} className="animate-spin" />
                                <span>Verifying...</span>
                            </div>
                        ) : (
                            <>
                                Check Availability & Pay
                                <ArrowRight size={16} />
                            </>
                        )}
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default Facilities;
