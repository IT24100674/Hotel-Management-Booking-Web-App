import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Wifi, Coffee, Car, Dumbbell, Image as ImageIcon, Loader } from 'lucide-react';
import Modal from '../../componets/Modal';
import { supabase } from '../../supabaseClient';

const FacilityManagement = () => {
    const [facilities, setFacilities] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFacility, setEditingFacility] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        status: 'Operational',
        image_url: '',
        price_per_hour: '0',
        max_capacity: '1'
    });
    const [imageFile, setImageFile] = useState(null);
    const [uploading, setUploading] = useState(false);

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
        setUploading(true);
        try {
            let imageUrl = formData.image_url;

            if (imageFile) {
                const fileExt = imageFile.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('facility_images')
                    .upload(filePath, imageFile);

                if (uploadError) throw uploadError;

                const { data: publicUrlData } = supabase.storage
                    .from('facility_images')
                    .getPublicUrl(filePath);

                imageUrl = publicUrlData.publicUrl;
            }

            const payload = {
                ...formData,
                image_url: imageUrl,
                price_per_hour: parseFloat(formData.price_per_hour) || 0,
                max_capacity: parseInt(formData.max_capacity) || 1
            };

            const url = editingFacility
                ? `http://localhost:5000/api/facilities/${editingFacility.id}`
                : 'http://localhost:5000/api/facilities';
            const method = editingFacility ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                fetchFacilities();
                handleCloseModal();
            }
        } catch (err) {
            console.error('Error saving facility:', err);
            alert('Error saving facility: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this facility?')) {
            try {
                // Find facility to get image URL
                const facilityToDelete = facilities.find(f => f.id === id);
                if (facilityToDelete && facilityToDelete.image_url) {
                    const fileName = facilityToDelete.image_url.split('/').pop();
                    await supabase.storage
                        .from('facility_images')
                        .remove([fileName]);
                }

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
            image_url: '',
            price_per_hour: '0',
            max_capacity: '1'
        });
        setImageFile(null);
        setIsModalOpen(true);
    };

    const openEditModal = (facility) => {
        setEditingFacility(facility);
        setFormData({
            name: facility.name,
            description: facility.description || '',
            status: facility.status || 'Operational',
            image_url: facility.image_url || '',
            price_per_hour: facility.price_per_hour?.toString() || '0',
            max_capacity: facility.max_capacity?.toString() || '1'
        });
        setImageFile(null);
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
                    <h1 className="text-3xl font-bold text-gray-900">Other Facilities</h1>
                    <p className="text-gray-500 mt-1">Manage other hotel amenities and services</p>
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
                            <div className="flex flex-col">
                                <span className={`px-2 py-1 rounded-full text-[10px] w-fit font-medium mb-1 ${facility.status === 'Operational' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                    {facility.status}
                                </span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    Max {facility.max_capacity} People
                                </span>
                            </div>
                            <div className="text-right">
                                <span className="text-indigo-600 font-bold block">
                                    ${facility.price_per_hour}/hr
                                </span>
                                <span className="text-[10px] text-gray-400 font-medium">Per Person</span>
                            </div>
                        </div>
                        {facility.image_url && (
                            <div className="mt-4 h-32 rounded-lg overflow-hidden">
                                <img src={facility.image_url} alt={facility.name} className="w-full h-full object-cover" />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingFacility ? 'Edit Facility' : 'Add New Other Facility'}>
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
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Price / Hour ($)</label>
                            <input
                                type="number"
                                required
                                min="0"
                                step="0.01"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                value={formData.price_per_hour}
                                onChange={(e) => setFormData({ ...formData, price_per_hour: e.target.value })}
                                onWheel={(e) => e.target.blur()}
                                placeholder="Per person"
                            />
                            <p className="text-[10px] text-gray-400 mt-1">Cost for one person</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Max Capacity</label>
                            <input
                                type="number"
                                required
                                min="1"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                value={formData.max_capacity}
                                onChange={(e) => setFormData({ ...formData, max_capacity: e.target.value })}
                                onWheel={(e) => e.target.blur()}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Facility Image</label>
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
                            {editingFacility ? 'Save Changes' : 'Create Facility'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default FacilityManagement;
