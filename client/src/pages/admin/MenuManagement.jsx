import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Utensils, DollarSign, Filter, Loader, Image as ImageIcon } from 'lucide-react';
import Modal from '../../componets/Modal';
import { supabase } from '../../supabaseClient';

const MenuManagement = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [filter, setFilter] = useState('All');
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: 'Main Course',
        is_available: true,
        image_url: '',
        is_featured: false
    });
    const [imageFile, setImageFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchMenuItems();
    }, []);

    const fetchMenuItems = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/menu');
            const data = await res.json();
            if (res.ok) {
                setMenuItems(data);
            } else {
                console.error('Failed to fetch menu:', data);
                setMenuItems([]);
            }
        } catch (err) {
            console.error('Error fetching menu items:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Starting submit...');
        setUploading(true);

        try {
            let imageUrl = formData.image_url;
            console.log('Current formData:', formData);

            if (imageFile) {
                console.log('Uploading image...', imageFile.name);
                const fileExt = imageFile.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `${fileName}`;

                const { data, error: uploadError } = await supabase.storage
                    .from('menu_images')
                    .upload(filePath, imageFile);

                if (uploadError) {
                    console.error('Upload error:', uploadError);
                    throw uploadError;
                }
                console.log('Upload successful:', data);

                const { data: publicUrlData } = supabase.storage
                    .from('menu_images')
                    .getPublicUrl(filePath);

                console.log('Public URL data:', publicUrlData);
                imageUrl = publicUrlData.publicUrl;
            }

            const payload = { ...formData, image_url: imageUrl };
            console.log('Sending payload:', payload);

            const url = editingItem
                ? `http://localhost:5000/api/menu/${editingItem.id}`
                : 'http://localhost:5000/api/menu';
            const method = editingItem ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            console.log('API Response status:', res.status);

            if (res.ok) {
                console.log('Item saved successfully');
                fetchMenuItems();
                handleCloseModal();
            } else {
                console.error('API Error:', await res.text());
            }
        } catch (err) {
            console.error('Error saving menu item:', err);
            alert(`Error: ${err.message}`);
        } finally {
            console.log('Finishing submit, setting uploading to false');
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                await fetch(`http://localhost:5000/api/menu/${id}`, { method: 'DELETE' });
                fetchMenuItems();
            } catch (err) {
                console.error('Error deleting menu item:', err);
            }
        }
    };

    const openAddModal = () => {
        setEditingItem(null);
        setFormData({
            name: '',
            description: '',
            price: '',
            category: 'Main Course',
            is_available: true,
            is_available: true,
            is_featured: false,
            image_url: ''
        });
        setImageFile(null);
        setIsModalOpen(true);
    };

    const openEditModal = (item) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            description: item.description || '',
            price: item.price,
            category: item.category,
            is_available: item.is_available,
            is_available: item.is_available,
            is_featured: item.is_featured || false,
            image_url: item.image_url || ''
        });
        setImageFile(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    };

    const filteredItems = filter === 'All' ? menuItems : menuItems.filter(item => item.category === filter);
    const categories = ['All', ...new Set(menuItems.map(item => item.category))];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Restaurant Menu</h1>
                    <p className="text-gray-500 mt-1">Manage food and beverage offerings</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none appearance-none bg-white text-sm"
                        >
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    <button
                        onClick={openAddModal}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm whitespace-nowrap"
                    >
                        <Plus size={20} />
                        Add Item
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item) => (
                    <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
                        <div className="relative h-48 bg-gray-100">
                            {item.image_url ? (
                                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <Utensils size={48} opacity={0.5} />
                                </div>
                            )}
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 z-10">
                                <button onClick={() => openEditModal(item)} className="p-2 bg-white/90 rounded-full text-indigo-600 hover:text-indigo-800 shadow-sm">
                                    <Edit2 size={16} />
                                </button>
                                <button onClick={() => handleDelete(item.id)} className="p-2 bg-white/90 rounded-full text-red-600 hover:text-red-800 shadow-sm">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            {!item.is_available && (
                                <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                                    <span className="px-3 py-1 bg-gray-800 text-white text-xs font-bold rounded-full uppercase tracking-wider">Not Available</span>
                                </div>
                            )}
                        </div>
                        <div className="p-5">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                                    <span className="text-xs text-indigo-600 font-medium bg-indigo-50 px-2 py-0.5 rounded-full">{item.category}</span>
                                </div>
                                <div className="flex items-center text-lg font-semibold text-gray-900">
                                    <DollarSign size={16} className="text-gray-400" />
                                    {item.price}
                                </div>
                            </div>
                            <p className="text-gray-600 text-sm line-clamp-2">{item.description}</p>
                        </div>
                    </div>
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingItem ? 'Edit Menu Item' : 'Add Menu Item'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                        <input
                            type="text"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                            <input
                                type="number"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option value="Starters">Starters</option>
                                <option value="Main Course">Main Course</option>
                                <option value="Desserts">Desserts</option>
                                <option value="Beverages">Beverages</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="is_available"
                                checked={formData.is_available}
                                onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                            />
                            <label htmlFor="is_available" className="text-sm font-medium text-gray-700 select-none">
                                Available
                            </label>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="is_featured"
                                checked={formData.is_featured}
                                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                            />
                            <label htmlFor="is_featured" className="text-sm font-medium text-gray-700 select-none">
                                Feature on Home Page
                            </label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Item Image</label>
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
                            {editingItem ? 'Save Changes' : 'Add Item'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default MenuManagement;
