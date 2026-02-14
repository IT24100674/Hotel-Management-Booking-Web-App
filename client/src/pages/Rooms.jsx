import React, { useEffect, useState } from 'react';
import { Bed, User, Wifi, Maximize, ArrowRight, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const RoomCard = ({ room, navigate, getCapacity }) => {
    const handleBookClick = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            alert("Please sign in to proceed with booking.");
            navigate('/sign-in');
            return;
        }
        navigate(`/book/${room.id}`);
    };

    return (
        <div className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 group flex flex-col h-full">
            {/* Image Container */}
            <div className="relative h-72 overflow-hidden">
                {room.image_url ? (
                    <img
                        src={room.image_url}
                        alt={`Room ${room.room_number}`}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <Bed className="w-16 h-16 text-gray-300" />
                    </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>

                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-primary shadow-sm">
                    {room.type}
                </div>
                {room.status !== 'Available' && (
                    <div className="absolute top-4 left-4 bg-red-500/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-white shadow-sm">
                        {room.status}
                    </div>
                )}

                <div className="absolute bottom-4 left-4 text-white">

                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold font-playfair">${room.price}</span>
                        <span className="text-xs opacity-75">/ night</span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-8 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-playfair font-bold text-gray-900 group-hover:text-primary transition-colors">Room {room.room_number}</h3>
                </div>

                <p className="text-gray-600 mb-6 line-clamp-3 text-sm leading-relaxed flex-1">
                    {room.description || "Experience the ultimate comfort in our well-appointed rooms, featuring modern amenities and stunning views."}
                </p>

                {/* Features */}
                <div className="flex gap-4 mb-8 text-gray-500 text-xs font-medium border-t border-gray-100 pt-6">
                    <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
                        <User size={14} className="text-secondary" /> {getCapacity(room.type)}
                    </div>
                    <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
                        <Maximize size={14} className="text-secondary" /> 45 m²
                    </div>
                    <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
                        <Wifi size={14} className="text-secondary" /> Free Wifi
                    </div>
                </div>

                <button
                    onClick={handleBookClick}
                    className={`w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-wide transition-all duration-300 flex items-center justify-center gap-2 shadow-lg
                        ${room.status === 'Available'
                            ? 'bg-primary text-white hover:bg-primary-light hover:shadow-primary/30 transform hover:-translate-y-0.5'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'}`}
                    disabled={room.status !== 'Available'}
                >
                    {room.status === 'Available' ? 'Book Now' : 'Currently Unavailable'}
                    {room.status === 'Available' && <ArrowRight size={16} />}
                </button>
            </div>
        </div>
    );
};

const Rooms = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const [selectedCategory, setSelectedCategory] = useState('All');

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/rooms');
            const data = await res.json();
            if (res.ok) {
                setRooms(data);
            } else {
                setError('Failed to load rooms');
            }
        } catch (err) {
            setError('Error connecting to server');
        } finally {
            setLoading(false);
        }
    };

    const categories = ['All', ...new Set(rooms.map(room => room.type))];
    const filteredRooms = selectedCategory === 'All'
        ? rooms
        : rooms.filter(room => room.type === selectedCategory);

    const getCapacity = (type) => {
        switch (type?.toLowerCase()) {
            case 'single': return '1 Guest';
            case 'double': return '2 Guests';
            case 'suite': return '2 Guests';
            case 'deluxe': return '4 Guests';
            default: return '2 Guests';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader className="w-10 h-10 text-amber-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-20 pb-16">
            {/* Header */}
            <div className="bg-primary text-white py-20 px-4 mb-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-secondary/20 rounded-full blur-3xl"></div>
                <div className="absolute -top-24 -left-24 w-72 h-72 bg-secondary/10 rounded-full blur-3xl"></div>

                <div className="container-custom text-center relative z-10">
                    <span className="text-secondary font-medium tracking-widest uppercase text-sm mb-4 block">Accommodations</span>
                    <h1 className="text-5xl md:text-6xl font-playfair font-bold mb-6" style={{ color: '#c5a059' }}>Our Luxurious Rooms</h1>
                    <p className="text-gray-200 max-w-2xl mx-auto text-xl font-light">
                        Experience comfort and elegance in our carefully designed accommodations, tailored for your perfect stay.
                    </p>
                </div>
            </div>

            <div className="container-custom px-4">
                {error ? (
                    <div className="text-center text-red-600 bg-red-50 p-4 rounded-xl border border-red-100">
                        {error}
                    </div>
                ) : (
                    <>
                        {/* Category Filter */}
                        <div className="flex justify-center mb-16 flex-wrap gap-3">
                            {categories.map(category => (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`px-8 py-3 rounded-full text-sm font-medium transition-all duration-300 border backdrop-blur-sm ${selectedCategory === category
                                        ? 'bg-primary text-white border-primary shadow-lg shadow-primary/25 transform scale-105'
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-secondary hover:text-secondary hover:shadow-md'
                                        }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>

                        {/* Room Grid */}
                        {filteredRooms.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredRooms.map((room) => (
                                    <RoomCard
                                        key={room.id}
                                        room={room}
                                        navigate={navigate}
                                        getCapacity={getCapacity}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 text-gray-500 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                                <Bed className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                <h3 className="text-xl font-playfair font-bold text-gray-900 mb-2">No rooms found</h3>
                                <p className="text-gray-500">We couldn't find any rooms in the "{selectedCategory}" category.</p>
                                <button
                                    onClick={() => setSelectedCategory('All')}
                                    className="mt-6 text-secondary font-medium hover:text-primary transition-colors underline underline-offset-4"
                                >
                                    View all rooms
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Rooms;
