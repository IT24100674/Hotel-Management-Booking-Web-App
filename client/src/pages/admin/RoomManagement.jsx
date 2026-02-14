import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Bed, DollarSign, CheckCircle, XCircle } from 'lucide-react';
import Modal from '../../componets/Modal';

const RoomManagement = () => {
    const roomDescriptions = {
        'Single': "A cozy room perfect for solo travelers, featuring a comfortable single bed and modern amenities.",
        'Double': "Spacious room designed for two, with a plush double bed and a sitting area.",
        'Suite': "Luxury suite with a separate living area, king-sized bed, and premium views.",
        'Deluxe': "Expansive room for families or groups, offering two queen beds and top-tier facilities."
    };
    const [rooms, setRooms] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState(null);
    const [formData, setFormData] = useState({
        room_number: '',
        type: 'Single',
        price: '',
        status: 'Available',
        description: '',
        image_url: ''
    });

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
                console.error('Failed to fetch rooms:', data);
                setRooms([]);
            }
        } catch (err) {
            console.error('Error fetching rooms:', err);
        }
    };

    const [imageFile, setImageFile] = useState(null);

    // ... existing useEffect ...

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = editingRoom
            ? `http://localhost:5000/api/rooms/${editingRoom.id}`
            : 'http://localhost:5000/api/rooms';
        const method = editingRoom ? 'PUT' : 'POST';

        const data = new FormData();
        data.append('room_number', formData.room_number);
        data.append('type', formData.type);
        data.append('price', formData.price);
        data.append('status', formData.status);
        data.append('description', formData.description);

        if (imageFile) {
            data.append('image', imageFile);
        } else if (formData.image_url) {
            data.append('image_url', formData.image_url);
        }

        try {
            const res = await fetch(url, {
                method,
                // Do NOT set Content-Type header when sending FormData; browser sets it automatically with boundary
                body: data
            });
            if (res.ok) {
                fetchRooms();
                handleCloseModal();
            } else {
                const errorData = await res.json();
                console.error('Failed to save room (Status ' + res.status + '):', errorData);
                alert(`Failed to save room: ${errorData.error || JSON.stringify(errorData)}`);
            }
        } catch (err) {
            console.error('Error saving room (Network/Code):', err);
            alert(`Error saving room: ${err.message}. See console for details.`);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this room?')) {
            try {
                await fetch(`http://localhost:5000/api/rooms/${id}`, { method: 'DELETE' });
                fetchRooms();
            } catch (err) {
                console.error('Error deleting room:', err);
            }
        }
    };

    const openAddModal = () => {
        setEditingRoom(null);
        setFormData({
            room_number: '',
            type: 'Single',
            price: '',
            status: 'Available',
            description: roomDescriptions['Single'],
            image_url: ''
        });
        setImageFile(null);
        setIsModalOpen(true);
    };

    const openEditModal = (room) => {
        setEditingRoom(room);
        setFormData({
            room_number: room.room_number,
            type: room.type,
            price: room.price,
            status: room.status,
            description: room.description || '',
            image_url: room.image_url || ''
        });
        setImageFile(null);
        setIsModalOpen(true);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingRoom(null);
        setImageFile(null);
    };

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'available': return 'bg-green-100 text-green-700';
            case 'occupied': return 'bg-red-100 text-red-700';
            case 'maintenance': return 'bg-yellow-100 text-yellow-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="space-y-6">
            {/* ... Header and Grid (unchanged) ... */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Rooms</h1>
                    <p className="text-gray-500 mt-1">Manage hotel rooms and availability</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                >
                    <Plus size={20} />
                    Add Room
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms.map((room) => (
                    <div key={room.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
                        <div className="relative h-48 bg-gray-100">
                            {room.image_url ? (
                                <img src={room.image_url} alt={`Room ${room.room_number}`} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <Bed size={48} opacity={0.5} />
                                </div>
                            )}
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                <button onClick={() => openEditModal(room)} className="p-2 bg-white/90 rounded-full text-indigo-600 hover:text-indigo-800 shadow-sm">
                                    <Edit2 size={16} />
                                </button>
                                <button onClick={() => handleDelete(room.id)} className="p-2 bg-white/90 rounded-full text-red-600 hover:text-red-800 shadow-sm">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            <div className="absolute bottom-2 left-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(room.status)}`}>
                                    {room.status}
                                </span>
                            </div>
                        </div>
                        <div className="p-5">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Room {room.room_number}</h3>
                                    <p className="text-sm text-gray-500">{room.type}</p>
                                </div>
                                <div className="flex items-center text-lg font-semibold text-gray-900">
                                    <DollarSign size={16} className="text-gray-400" />
                                    {room.price}
                                </div>
                            </div>
                            <p className="mt-3 text-gray-600 text-sm line-clamp-2">{room.description}</p>
                        </div>
                    </div>
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingRoom ? 'Edit Room' : 'Add New Room'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
                            <input
                                type="text"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                value={formData.room_number}
                                onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Price per Night</label>
                            <input
                                type="number"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                value={formData.type}
                                onChange={(e) => {
                                    const newType = e.target.value;
                                    setFormData({
                                        ...formData,
                                        type: newType,
                                        description: roomDescriptions[newType] || ''
                                    });
                                }}
                            >
                                <option value="Single">Single</option>
                                <option value="Double">Double</option>
                                <option value="Suite">Suite</option>
                                <option value="Deluxe">Deluxe</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="Available">Available</option>
                                <option value="Occupied">Occupied</option>
                                <option value="Maintenance">Maintenance</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Room Image</label>
                        <div className="flex items-center gap-4">
                            <div className="relative w-full">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                />
                            </div>
                        </div>
                        {/* Preview existing or selected image name? */}
                        {formData.image_url && !imageFile && (
                            <p className="mt-1 text-xs text-gray-500 truncate">Current: {formData.image_url}</p>
                        )}
                        {imageFile && (
                            <p className="mt-1 text-xs text-green-600 truncate">Selected: {imageFile.name}</p>
                        )}
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={handleCloseModal}
                            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                        >
                            {editingRoom ? 'Save Changes' : 'Create Room'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default RoomManagement;
