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
        <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group flex flex-col">
            {/* Image Container */}
            <div className="relative h-64 overflow-hidden">
                {room.image_url ? (
                    <img
                        src={room.image_url}
                        alt={`Room ${room.room_number}`}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <Bed className="w-16 h-16 text-gray-400" />
                    </div>
                )}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-gray-800 shadow-sm">
                    {room.type}
                </div>
                {room.status !== 'Available' && (
                    <div className="absolute top-4 left-4 bg-red-500/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white shadow-sm">
                        {room.status}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-playfair font-bold text-gray-900">Room {room.room_number}</h3>
                    <div className="flex flex-col items-end">
                        <span className="text-2xl font-bold text-amber-600">${room.price}</span>
                        <span className="text-xs text-gray-500">/ night</span>
                    </div>
                </div>

                <p className="text-gray-600 mb-6 line-clamp-3 flex-1">
                    {room.description || "Experience the ultimate comfort in our well-appointed rooms, featuring modern amenities and stunning views."}
                </p>

                {/* Features */}
                <div className="flex gap-4 mb-6 text-gray-500 text-sm border-t border-gray-100 pt-4">
                    <div className="flex items-center gap-1">
                        <User size={16} /> {getCapacity(room.type)}
                    </div>
                    <div className="flex items-center gap-1">
                        <Maximize size={16} /> 45 m²
                    </div>
                    <div className="flex items-center gap-1">
                        <Wifi size={16} /> Free Wifi
                    </div>
                </div>

                <button
                    onClick={handleBookClick}
                    className={`w-full py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2
                        ${room.status === 'Available'
                            ? 'bg-gray-900 text-white hover:bg-amber-600'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
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
            <div className="bg-gray-900 text-white py-16 px-4 mb-12">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-playfair font-bold mb-4 text-amber-500">Our Luxurious Rooms</h1>
                    <p className="text-gray-300 max-w-2xl mx-auto text-lg">
                        Experience comfort and elegance in our carefully designed accommodations.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {error ? (
                    <div className="text-center text-red-600 bg-red-50 p-4 rounded-lg">
                        {error}
                    </div>
                ) : (
                    <>
                        {/* Category Filter */}
                        <div className="flex justify-center mb-12 flex-wrap gap-4">
                            {categories.map(category => (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${selectedCategory === category
                                        ? 'bg-amber-600 text-white border-amber-600 shadow-md'
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-amber-600 hover:text-amber-600'
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
                            <div className="text-center py-12 text-gray-500 bg-white rounded-2xl border border-gray-100 p-8">
                                <Bed className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                <h3 className="text-lg font-medium text-gray-900">No rooms found</h3>
                                <p className="mt-1">We couldn't find any rooms in the "{selectedCategory}" category.</p>
                                <button
                                    onClick={() => setSelectedCategory('All')}
                                    className="mt-4 text-amber-600 font-medium hover:text-amber-700 hover:underline"
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
