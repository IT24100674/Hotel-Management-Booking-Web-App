import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, MapPin, Image as ImageIcon, Loader, Users, DollarSign, List } from 'lucide-react';
import Modal from '../../componets/Modal';
import { supabase } from '../../supabaseClient';

const EventManagement = () => {
    const [events, setEvents] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        capacity: '',
        price_per_guest: '',
        features: '',
        type: 'Wedding',
        image_url: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/events');
            const data = await res.json();
            if (res.ok) {
                setEvents(data);
            } else {
                console.error('Failed to fetch events:', data);
                setEvents([]);
            }
        } catch (err) {
            console.error('Error fetching events:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);

        try {
            let imageUrl = formData.image_url;

            if (imageFile) {
                const fileExt = imageFile.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('event_images')
                    .upload(filePath, imageFile);

                if (uploadError) throw uploadError;

                const { data: publicUrlData } = supabase.storage
                    .from('event_images')
                    .getPublicUrl(filePath);

                imageUrl = publicUrlData.publicUrl;
            }

            const payload = { ...formData, image_url: imageUrl };

            const url = editingEvent
                ? `http://localhost:5000/api/events/${editingEvent.id}`
                : 'http://localhost:5000/api/events';
            const method = editingEvent ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                fetchEvents();
                handleCloseModal();
            } else {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to save');
            }
        } catch (err) {
            console.error('Error saving event:', err);
            alert('Error saving event: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this package?')) {
            try {
                // 1. Find the package to get image URL
                const packageToDelete = events.find(h => h.id === id);
                if (packageToDelete && packageToDelete.image_url) {
                    // Extract filename from URL
                    // URL format: .../event_images/filename.ext
                    const fileName = packageToDelete.image_url.split('/').pop();

                    const { error: storageError } = await supabase.storage
                        .from('event_images')
                        .remove([fileName]);

                    if (storageError) {
                        console.error('Error deleting image:', storageError);
                    }
                }

                // 2. Delete the record (Backend now handles associated bookings)
                await fetch(`http://localhost:5000/api/events/${id}`, { method: 'DELETE' });
                fetchEvents();
            } catch (err) {
                console.error('Error deleting event:', err);
                alert('Failed to delete package');
            }
        }
    };

    const openAddModal = () => {
        setEditingEvent(null);
        setFormData({ title: '', description: '', capacity: '', price: '', features: '', type: 'Wedding', image_url: '' });
        setImageFile(null);
        setIsModalOpen(true);
    };

    const openEditModal = (event) => {
        setEditingEvent(event);
        setFormData({
            title: event.title,
            description: event.description,
            capacity: event.capacity || '',
            price_per_guest: event.price_per_guest || '',
            features: event.features || '',
            type: event.type || 'Wedding',
            image_url: event.image_url || ''
        });
        setImageFile(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingEvent(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Event Packages</h1>
                    <p className="text-gray-500 mt-1">Manage wedding packages, party bundles, and corporate event deals</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                >
                    <Plus size={20} />
                    Add Package
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                    <div key={event.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
                        <div className="relative h-48 bg-gray-100">
                            {event.image_url ? (
                                <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    No Image
                                </div>
                            )}
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 z-10">
                                <button onClick={() => openEditModal(event)} className="p-2 bg-white/90 rounded-full text-indigo-600 hover:text-indigo-800 shadow-sm">
                                    <Edit2 size={16} />
                                </button>
                                <button onClick={() => handleDelete(event.id)} className="p-2 bg-white/90 rounded-full text-red-600 hover:text-red-800 shadow-sm">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 text-white text-xs rounded-md">
                                {event.capacity} Guests
                            </div>
                            <div className="absolute top-2 left-2 px-2 py-1 bg-indigo-600/90 text-white text-[10px] uppercase font-bold rounded shadow-sm z-10">
                                {event.type || 'Standard'}
                            </div>
                        </div>
                        <div className="p-5">
                            <span className="text-lg font-bold text-indigo-600">${event.price_per_guest} <span className="text-xs text-gray-400 font-normal">/ guest</span></span>
                            <div className="mt-2 space-y-2 text-sm text-gray-600">
                                {event.features && (
                                    <div className="flex items-start gap-2">
                                        <List size={16} className="text-gray-400 mt-0.5" />
                                        <p className="line-clamp-1">{event.features}</p>
                                    </div>
                                )}
                            </div>
                            <p className="mt-3 text-gray-600 text-sm line-clamp-2">{event.description}</p>
                        </div>
                    </div>
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingEvent ? 'Edit Package' : 'New Package'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Package Name</label>
                        <input
                            type="text"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g. Gold Wedding Package"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Package Type</label>
                        <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white"
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        >
                            <option value="Wedding">Wedding</option>
                            <option value="Birthday">Birthday</option>
                            <option value="Family Party">Family Party</option>
                            <option value="Meeting">Meeting</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            required
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Capacity (Guests)</label>
                            <div className="relative">
                                <Users size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="number"
                                    required
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                    value={formData.capacity}
                                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Price per Guest</label>
                            <div className="relative">
                                <DollarSign size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="number"
                                    required
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                    value={formData.price_per_guest}
                                    onChange={(e) => setFormData({ ...formData, price_per_guest: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Features (Comma separated)</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                            value={formData.features}
                            onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                            placeholder="AC, Sound System, Projector, Stage"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Package Image</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-indigo-500 transition-colors cursor-pointer relative group bg-gray-50">
                            <div className="space-y-1 text-center">
                                {imageFile ? (
                                    <div className="flex flex-col items-center">
                                        <div className="text-sm text-indigo-600 font-medium break-all">{imageFile.name}</div>
                                        <p className="text-xs text-gray-500">Ready to upload</p>
                                    </div>
                                ) : formData.image_url ? (
                                    <div className="flex flex-col items-center">
                                        <img src={formData.image_url} alt="Preview" className="h-20 w-20 object-cover rounded-md mb-2" />
                                        <p className="text-xs text-gray-500">Current Image</p>
                                    </div>
                                ) : (
                                    <>
                                        <ImageIcon className="mx-auto h-12 w-12 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                                        <div className="flex text-sm text-gray-600">
                                            <span className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                                                <span>Upload a file</span>
                                            </span>
                                            <p className="pl-1">or drag and drop</p>
                                        </div>
                                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                                    </>
                                )}
                                <input
                                    type="file"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={(e) => setImageFile(e.target.files[0])}
                                    accept="image/*"
                                />
                            </div>
                        </div>
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
                            disabled={uploading}
                            className={`px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2 ${uploading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {uploading && <Loader size={16} className="animate-spin" />}
                            {editingEvent ? 'Save Changes' : 'Add Package'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default EventManagement;
