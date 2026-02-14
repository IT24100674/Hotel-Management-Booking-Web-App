import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Wifi, Coffee, Car, Dumbbell } from 'lucide-react';
import Modal from '../../componets/Modal';

const FacilityManagement = () => {
    const [facilities, setFacilities] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFacility, setEditingFacility] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        status: 'Operational',
        image_url: ''
    });

    useEffect(() => {
        fetchFacilities();
    }, []);

    const fetchFacilities = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/facilities');
            const data = await res.json();
            if (res.ok) {
                setFacilities(data);
            } else {
                console.error('Failed to fetch facilities:', data);
                setFacilities([]);
            }
        } catch (err) {
            console.error('Error fetching facilities:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = editingFacility
            ? `http://localhost:5000/api/facilities/${editingFacility.id}`
            : 'http://localhost:5000/api/facilities';
        const method = editingFacility ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                fetchFacilities();
                handleCloseModal();
            }
        } catch (err) {
            console.error('Error saving facility:', err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this facility?')) {
            try {
                await fetch(`http://localhost:5000/api/facilities/${id}`, { method: 'DELETE' });
                fetchFacilities();
            } catch (err) {
                console.error('Error deleting facility:', err);
            }
        }
    };

    const openAddModal = () => {
        setEditingFacility(null);
        setFormData({
            name: '',
            description: '',
            status: 'Operational',
            image_url: ''
        });
        setIsModalOpen(true);
    };

    const openEditModal = (facility) => {
        setEditingFacility(facility);
        setFormData({
            name: facility.name,
            description: facility.description || '',
            status: facility.status || 'Operational',
            image_url: facility.image_url || ''
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingFacility(null);
    };

    const getIcon = (name) => {
        const lowerName = name.toLowerCase();
        if (lowerName.includes('wifi') || lowerName.includes('internet')) return <Wifi size={24} />;
        if (lowerName.includes('gym') || lowerName.includes('fitness')) return <Dumbbell size={24} />;
        if (lowerName.includes('pool') || lowerName.includes('swim')) return <div className="text-blue-500">🏊</div>; // fallback emoji or custom icon
        if (lowerName.includes('parking')) return <Car size={24} />;
        if (lowerName.includes('restaurant') || lowerName.includes('dining') || lowerName.includes('food')) return <Coffee size={24} />;
        return <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">{name.charAt(0)}</div>;
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Facilities</h1>
                    <p className="text-gray-500 mt-1">Manage hotel amenities and services</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                >
                    <Plus size={20} />
                    Add Facility
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {facilities.map((facility) => (
                    <div key={facility.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                                {getIcon(facility.name)}
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => openEditModal(facility)} className="text-gray-400 hover:text-indigo-600 transition-colors">
                                    <Edit2 size={16} />
                                </button>
                                <button onClick={() => handleDelete(facility.id)} className="text-gray-400 hover:text-red-600 transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{facility.name}</h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{facility.description}</p>

                        <div className="flex items-center justify-between mt-auto">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${facility.status === 'Operational' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                {facility.status}
                            </span>
                        </div>
                        {facility.image_url && (
                            <div className="mt-4 h-32 rounded-lg overflow-hidden">
                                <img src={facility.image_url} alt={facility.name} className="w-full h-full object-cover" />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingFacility ? 'Edit Facility' : 'Add New Facility'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Facility Name</label>
                        <input
                            type="text"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        >
                            <option value="Operational">Operational</option>
                            <option value="Maintenance">Maintenance</option>
                            <option value="Closed">Closed</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                        <input
                            type="url"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                            value={formData.image_url}
                            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                            placeholder="https://example.com/facility.jpg"
                        />
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
                            {editingFacility ? 'Save Changes' : 'Create Facility'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default FacilityManagement;
