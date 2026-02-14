import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { User, Mail, Save, Loader, Lock, AlertCircle } from 'lucide-react';

const UserProfile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const [activeTab, setActiveTab] = useState('profile');
    const [bookings, setBookings] = useState([]);
    const [loadingBookings, setLoadingBookings] = useState(false);

    useEffect(() => {
        fetchUserProfile();
    }, []);

    useEffect(() => {
        if (user?.id) {
            fetchBookings(user.id);
        }
    }, [user]);

    const fetchUserProfile = async () => {
        try {
            const { data: { user: authUser } } = await supabase.auth.getUser();

            if (authUser) {
                const res = await fetch(`http://localhost:5000/api/users/${authUser.id}`);
                const data = await res.json();

                if (res.ok) {
                    setUser(data);
                    setName(data.name || '');
                    setEmail(data.email || authUser.email);
                } else {
                    setUser({ id: authUser.id, email: authUser.email });
                    setEmail(authUser.email);
                }
            }
        } catch (err) {
            console.error(err);
            setError('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const fetchBookings = async (userId) => {
        setLoadingBookings(true);
        try {
            // 1. Fetch Room Bookings using existing API
            const roomRes = await fetch(`http://localhost:5000/api/bookings/user/${userId}`);
            let roomData = [];
            if (roomRes.ok) {
                roomData = await roomRes.json();
            }

            // 2. Fetch Hall Bookings using Supabase
            const { data: hallData, error: hallError } = await supabase
                .from('hall_bookings')
                .select(`
                    *,
                    events (
                        title,
                        image_url,
                        location
                    )
                `)
                .eq('user_id', userId)
                .order('booking_date', { ascending: false });

            if (hallError) throw hallError;

            // 3. Normalize and Merge
            const normalizedRooms = roomData.map(b => ({ ...b, type: 'room', sortDate: new Date(b.check_in) }));
            const normalizedHalls = (hallData || []).map(b => ({ ...b, type: 'hall', sortDate: new Date(b.booking_date) }));

            const allBookings = [...normalizedRooms, ...normalizedHalls].sort((a, b) => b.sortDate - a.sortDate);

            setBookings(allBookings);
        } catch (err) {
            console.error("Failed to fetch bookings", err);
        } finally {
            setLoadingBookings(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);
        setError(null);

        try {
            const res = await fetch(`http://localhost:5000/api/users/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            });

            if (res.ok) {
                setMessage('Profile updated successfully!');
                const storedUser = JSON.parse(localStorage.getItem('hotel_user') || '{}');
                if (storedUser) {
                    storedUser.name = name;
                    localStorage.setItem('hotel_user', JSON.stringify(storedUser));
                    window.dispatchEvent(new Event('storage'));
                }
            } else {
                throw new Error('Failed to update profile');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleCancelBooking = async (bookingId, type = 'room') => {
        if (!window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
            return;
        }

        try {
            if (type === 'hall') {
                const { error } = await supabase
                    .from('hall_bookings')
                    .update({ status: 'Cancelled' })
                    .eq('id', bookingId);

                if (error) throw error;
            } else {
                const res = await fetch(`http://localhost:5000/api/bookings/cancel/${bookingId}`, {
                    method: 'PUT'
                });

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || 'Failed to cancel booking');
                }
            }

            // Success
            setMessage('Booking cancelled successfully.');
            fetchBookings(user.id); // Refresh list
        } catch (err) {
            alert(err.message);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Loader className="animate-spin text-indigo-600" size={48} />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <p className="text-gray-500">Please sign in to view your profile.</p>
            </div>
        );
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-gray-500/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="max-w-4xl w-full space-y-8 relative z-10">
                <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                    {/* Header Section */}
                    <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-8 py-12 text-white relative">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <svg width="200" height="200" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L2 7L12 12L22 7L12 2Z" /><path d="M2 17L12 22L22 17" /><path d="M2 12L12 17L22 12" /></svg>
                        </div>

                        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                            <div className="relative">
                                <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-4xl font-playfair font-bold text-white shadow-lg border-4 border-gray-800">
                                    {name ? name.charAt(0).toUpperCase() : email.charAt(0).toUpperCase()}
                                </div>
                                <div className="absolute bottom-0 right-0 bg-green-500 w-6 h-6 rounded-full border-4 border-gray-800"></div>
                            </div>
                            <div className="text-center md:text-left flex-1">
                                <h1 className="text-3xl font-playfair font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">
                                    {name || 'Valued Guest'}
                                </h1>
                                <p className="text-gray-400 flex items-center justify-center md:justify-start gap-2 mt-2">
                                    <Mail size={16} className="text-amber-500" /> {email}
                                </p>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-6 mt-8 border-b border-gray-700">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'profile' ? 'text-amber-500' : 'text-gray-400 hover:text-white'}`}
                            >
                                Profile Details
                                {activeTab === 'profile' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-500 rounded-t-full"></div>}
                            </button>
                            <button
                                onClick={() => setActiveTab('bookings')}
                                className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'bookings' ? 'text-amber-500' : 'text-gray-400 hover:text-white'}`}
                            >
                                My Bookings
                                {activeTab === 'bookings' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-500 rounded-t-full"></div>}
                            </button>
                        </div>
                    </div>

                    <div className="p-8 md:p-12">
                        {activeTab === 'profile' ? (
                            <>
                                {/* Messages */}
                                {message && (
                                    <div className="bg-green-50 text-green-700 p-4 rounded-xl mb-8 border border-green-100 flex items-center gap-3 shadow-sm">
                                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                        <span className="font-medium">Success:</span> {message}
                                    </div>
                                )}

                                {error && (
                                    <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-8 border border-red-100 flex items-center gap-3 shadow-sm">
                                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                        {error}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                    {/* Profile Details Form */}
                                    <div>
                                        <h2 className="text-xl font-playfair font-bold text-gray-800 mb-6 flex items-center gap-2">
                                            <span className="w-1 h-6 bg-amber-500 rounded-full"></span>
                                            Profile Details
                                        </h2>
                                        <form onSubmit={handleUpdateProfile} className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                                <div className="relative group">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-amber-500 transition-colors">
                                                        <User size={18} />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={name}
                                                        onChange={(e) => setName(e.target.value)}
                                                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all bg-gray-50 focus:bg-white"
                                                        placeholder="Enter your full name"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                                        <Mail size={18} />
                                                    </div>
                                                    <input
                                                        type="email"
                                                        value={email}
                                                        disabled
                                                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-400 cursor-not-allowed"
                                                    />
                                                </div>
                                                <p className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                                                    <Lock size={10} /> Authenticated via secure provider
                                                </p>
                                            </div>

                                            <div className="pt-4">
                                                <button
                                                    type="submit"
                                                    disabled={saving}
                                                    className={`flex items-center justify-center gap-2 w-full px-6 py-3 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl hover:from-black hover:to-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${saving ? 'opacity-70 cursor-not-allowed' : ''
                                                        }`}
                                                >
                                                    {saving ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
                                                    {saving ? 'Saving...' : 'Save Profile'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>

                                    {/* Divider for Mobile / Spacer for Desktop */}
                                    <div className="lg:hidden border-t border-gray-100 my-4"></div>

                                    {/* Password Change Section */}
                                    <div>
                                        <h2 className="text-xl font-playfair font-bold text-gray-800 mb-6 flex items-center gap-2">
                                            <span className="w-1 h-6 bg-amber-500 rounded-full"></span>
                                            Security
                                        </h2>
                                        <PasswordChangeForm />
                                    </div>
                                </div>
                            </>
                        ) : (
                            /* Bookings Tab */
                            <div>
                                <h2 className="text-xl font-playfair font-bold text-gray-800 mb-6 flex items-center gap-2">
                                    <span className="w-1 h-6 bg-amber-500 rounded-full"></span>
                                    My Bookings
                                </h2>
                                <div className="bg-blue-50 text-blue-700 p-4 rounded-xl mb-6 text-sm border border-blue-100 flex items-start gap-3">
                                    <div className="mt-0.5"><AlertCircle size={16} /></div>
                                    <div>
                                        <strong>Cancellation Policy (Rooms Only):</strong> Cancellations can only be made up to 24 hours before the check-in date. Hall bookings cannot be cancelled online.
                                    </div>
                                </div>
                                {loadingBookings ? (
                                    <div className="text-center py-12">
                                        <Loader className="w-8 h-8 mx-auto text-amber-500 animate-spin" />
                                        <p className="mt-2 text-gray-500">Loading bookings...</p>
                                    </div>
                                ) : bookings.length > 0 ? (
                                    <div className="space-y-4">
                                        {bookings.map((booking) => (
                                            <div key={booking.id} className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6">
                                                {/* Image Section */}
                                                <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                                                    {booking.type === 'hall' ? (
                                                        booking.events?.image_url && <img src={booking.events.image_url} alt="Hall" className="w-full h-full object-cover" />
                                                    ) : (
                                                        booking.rooms?.image_url && <img src={booking.rooms.image_url} alt="Room" className="w-full h-full object-cover" />
                                                    )}
                                                </div>

                                                {/* Content Section */}
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h3 className="font-bold text-lg text-gray-900">
                                                            {booking.type === 'hall'
                                                                ? `${booking.events?.title || 'Function Hall'}`
                                                                : `Room ${booking.rooms?.room_number} - ${booking.rooms?.type}`
                                                            }
                                                        </h3>
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${booking.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                                                            booking.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                                                'bg-gray-100 text-gray-700'
                                                            }`}>
                                                            {booking.status}
                                                        </span>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                                                        {booking.type === 'hall' ? (
                                                            <>
                                                                <div>
                                                                    <p className="text-gray-400 text-xs uppercase tracking-wider">Event Date</p>
                                                                    <p className="font-medium text-gray-900">{new Date(booking.booking_date).toLocaleDateString()}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-gray-400 text-xs uppercase tracking-wider">Session</p>
                                                                    <p className="font-medium text-gray-900">{booking.session_type}</p>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <div>
                                                                    <p className="text-gray-400 text-xs uppercase tracking-wider">Check In</p>
                                                                    <p className="font-medium text-gray-900">{new Date(booking.check_in).toLocaleDateString()}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-gray-400 text-xs uppercase tracking-wider">Check Out</p>
                                                                    <p className="font-medium text-gray-900">{new Date(booking.check_out).toLocaleDateString()}</p>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                                                        <div className="text-sm text-gray-500">Total Price <span className="text-xl font-bold text-amber-600 ml-2">${booking.total_price}</span></div>

                                                        {booking.status === 'Confirmed' && (
                                                            booking.type === 'hall' ? (
                                                                <span className="text-xs text-gray-400 italic" title="Contact admin for cancellation">
                                                                    Cancellation unavailable
                                                                </span>
                                                            ) : (
                                                                (new Date(booking.check_in) - new Date() > 24 * 60 * 60 * 1000) ? (
                                                                    <button
                                                                        onClick={() => handleCancelBooking(booking.id, booking.type)}
                                                                        className="text-sm text-red-600 hover:text-red-800 font-medium underline transition-colors"
                                                                    >
                                                                        Cancel Booking
                                                                    </button>
                                                                ) : (
                                                                    <span className="text-xs text-gray-400 italic" title="Less than 24 hours before check-in">
                                                                        Cancellation unavailable
                                                                    </span>
                                                                )
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                        <p className="text-gray-500 mb-4">You haven't made any bookings yet.</p>
                                        <div className="flex justify-center gap-4">
                                            <a href="/rooms" className="text-amber-600 font-medium hover:underline">Browse Rooms</a>
                                            <span className="text-gray-300">|</span>
                                            <a href="/halls" className="text-amber-600 font-medium hover:underline">Browse Venues</a>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const PasswordChangeForm = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        setError(null);

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters");
            setLoading(false);
            return;
        }

        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });

            if (error) throw error;

            setMessage("Password updated successfully");
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
            <form onSubmit={handlePasswordChange} className="space-y-6">
                {message && (
                    <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm border border-green-100">
                        {message}
                    </div>
                )}
                {error && (
                    <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-100">
                        {error}
                    </div>
                )}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-amber-500 transition-colors">
                            <Lock size={18} />
                        </div>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all bg-white"
                            placeholder="Enter new password"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-amber-500 transition-colors">
                            <Lock size={18} />
                        </div>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all bg-white"
                            placeholder="Confirm new password"
                            required
                        />
                    </div>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className={`flex items-center justify-center gap-2 w-full px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl hover:from-amber-600 hover:to-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${loading ? 'opacity-70 cursor-not-allowed' : ''
                            }`}
                    >
                        {loading ? <Loader className="animate-spin" size={18} /> : <Lock size={18} />}
                        {loading ? 'Updating...' : 'Update Password'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UserProfile;
