import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, Power, Loader2, Calendar, Percent, Pencil, X } from 'lucide-react';

const PromotionManagement = () => {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [editingPromoId, setEditingPromoId] = useState(null);

    const [newPromo, setNewPromo] = useState({
        title: '',
        discount_percentage: '',
        start_date: '',
        end_date: '',
        target_type: 'All'
    });
    const [imageFile, setImageFile] = useState(null);

    useEffect(() => {
        fetchPromotions();
    }, []);

    const fetchPromotions = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/promotions');
            if (!res.ok) throw new Error('Failed to fetch promotions');
            const data = await res.json();
            setPromotions(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Handles submitting the form for both Creating and Updating promotions.
    // Differentiates the action by checking if an editingPromoId is set.
    // Uses FormData instead of JSON to securely transmit the image file alongside the text data.
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (new Date(newPromo.end_date) < new Date(newPromo.start_date)) {
            alert("End Date cannot be before Start Date.");
            return;
        }

        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('title', newPromo.title);
            formData.append('discount_percentage', Number(newPromo.discount_percentage));
            formData.append('start_date', newPromo.start_date);
            formData.append('end_date', newPromo.end_date);
            formData.append('target_type', newPromo.target_type);

            if (imageFile) {
                formData.append('image', imageFile);
            }

            const url = editingPromoId
                ? `http://localhost:5000/api/promotions/${editingPromoId}`
                : 'http://localhost:5000/api/promotions';

            const method = editingPromoId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                // Browser handles boundary automatically with FormData!
                body: formData
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || (editingPromoId ? 'Failed to update promotion' : 'Failed to create promotion'));
            }

            // Reset form and refresh list
            cancelEdit();
            fetchPromotions();
        } catch (err) {
            alert(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    // Pre-fills the form with the selected promotion's details for editing.
    // Sets the editingPromoId so the form knows to perform a PUT request (update) instead of POST (create).
    const handleEdit = (promo) => {
        setEditingPromoId(promo.id);
        setNewPromo({
            title: promo.title,
            discount_percentage: promo.discount_percentage,
            start_date: promo.start_date,
            end_date: promo.end_date,
            target_type: promo.target_type || 'All'
        });
        setImageFile(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Resets the form and editing state back to default (create mode).
    const cancelEdit = () => {
        setEditingPromoId(null);
        setNewPromo({ title: '', discount_percentage: '', start_date: '', end_date: '', target_type: 'All' });
        setImageFile(null);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this promotion?")) return;
        try {
            const res = await fetch(`http://localhost:5000/api/promotions/${id}`, {
                method: 'DELETE'
            });
            if (!res.ok) throw new Error('Failed to delete promotion');
            fetchPromotions();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        try {
            const res = await fetch(`http://localhost:5000/api/promotions/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_active: !currentStatus })
            });
            if (!res.ok) throw new Error('Failed to toggle status');
            fetchPromotions();
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-playfair font-bold text-slate-900 mb-2 flex items-center gap-3">
                    <Tag className="text-indigo-500" size={32} />
                    Promotion Management
                </h1>
                <p className="text-slate-500 font-medium">
                    Create and manage special discount offers for your guests.
                </p>
            </div>

            {/* Promotion Form */}
            <div className={`bg-white p-6 md:p-8 rounded-2xl shadow-sm border ${editingPromoId ? 'border-indigo-300 ring-2 ring-indigo-50' : 'border-slate-100'}`}>
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    {editingPromoId ? <Pencil size={20} className="text-indigo-500" /> : <Plus size={20} className="text-slate-400" />}
                    {editingPromoId ? 'Edit Promotion' : 'Create New Promotion'}
                </h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div className="lg:col-span-1">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Title</label>
                        <input
                            required
                            type="text"
                            placeholder="e.g. Summer Sale"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                            value={newPromo.title}
                            onChange={e => setNewPromo({ ...newPromo, title: e.target.value })}
                        />
                    </div>
                    <div className="lg:col-span-1">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Target</label>
                        <select
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all cursor-pointer text-slate-600 appearance-none bg-white font-medium"
                            value={newPromo.target_type}
                            onChange={e => setNewPromo({ ...newPromo, target_type: e.target.value })}
                        >
                            <option value="All">All Services</option>
                            <option value="Rooms">Rooms Only</option>
                            <option value="Events">Events Only</option>
                            <option value="Facilities">Facilities Only</option>
                        </select>
                    </div>
                    <div className="lg:col-span-1">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Discount (%)</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Percent size={16} className="text-slate-400" />
                            </div>
                            <input
                                required
                                type="number"
                                min="1" max="100"
                                placeholder="15"
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                value={newPromo.discount_percentage}
                                onChange={e => setNewPromo({ ...newPromo, discount_percentage: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="lg:col-span-1">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Start Date</label>
                        <input
                            required
                            type="date"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-slate-600"
                            value={newPromo.start_date}
                            onChange={e => setNewPromo({ ...newPromo, start_date: e.target.value })}
                        />
                    </div>
                    <div className="lg:col-span-1">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">End Date</label>
                        <input
                            required
                            type="date"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-slate-600"
                            value={newPromo.end_date}
                            onChange={e => setNewPromo({ ...newPromo, end_date: e.target.value })}
                        />
                    </div>
                    <div className="lg:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Promotion Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={e => setImageFile(e.target.files[0])}
                            className="w-full px-4 py-[9px] rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 text-slate-600 bg-white"
                        />
                    </div>
                    <div className={`lg:col-span-1 flex gap-3 ${editingPromoId ? 'lg:col-span-2' : ''}`}>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-[13.5px] px-4 rounded-xl shadow-lg shadow-indigo-200 transition-all flex justify-center items-center gap-2 disabled:opacity-50"
                        >
                            {submitting ? <Loader2 size={20} className="animate-spin" /> : (editingPromoId ? <Pencil size={18} /> : <Plus size={20} />)}
                            {editingPromoId ? 'Update Promotion' : 'Create'}
                        </button>
                        {editingPromoId && (
                            <button
                                type="button"
                                onClick={cancelEdit}
                                disabled={submitting}
                                className="px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-[13.5px] rounded-xl transition-all flex justify-center items-center gap-2 disabled:opacity-50"
                            >
                                <X size={18} /> Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* List Active/Inactive Promotions */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-8 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-800">All Promotions</h2>
                    <span className="text-xs font-semibold px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full">
                        {promotions.length} Total
                    </span>
                </div>

                {loading ? (
                    <div className="flex justify-center p-12"><Loader2 className="animate-spin text-indigo-500" size={32} /></div>
                ) : error ? (
                    <div className="p-12 text-center text-red-500">{error}</div>
                ) : promotions.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center">
                        <Tag size={48} className="text-slate-200 mb-4" />
                        <p className="text-slate-500 font-medium text-lg">No promotions found.</p>
                        <p className="text-sm text-slate-400 mt-1">Create one above to get started!</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Title</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Discount</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Target</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Valid Period</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {promotions.map(promo => {
                                    const now = new Date();
                                    const start = new Date(promo.start_date);
                                    const end = new Date(promo.end_date);
                                    const isExpired = now > end;

                                    // Time correction for accurate expiration handling (stripping time from 'now')
                                    const strippedNow = new Date(now.toISOString().split('T')[0]);
                                    const isActuallyExpired = strippedNow > end;

                                    return (
                                        <tr key={promo.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="px-8 py-4 font-bold text-slate-900 flex items-center gap-3">
                                                {promo.image_url ? (
                                                    <img src={promo.image_url} alt="Promo" className="w-10 h-10 object-cover rounded shadow-sm border border-slate-200" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                                                        <Tag size={16} />
                                                    </div>
                                                )}
                                                {promo.title}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-1 font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                                                    {promo.discount_percentage}%
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide ${promo.target_type === 'Rooms' ? 'bg-blue-50 text-blue-600' :
                                                    promo.target_type === 'Events' ? 'bg-amber-50 text-amber-600' :
                                                        promo.target_type === 'Facilities' ? 'bg-emerald-50 text-emerald-600' :
                                                            'bg-purple-50 text-purple-600'
                                                    }`}>
                                                    {promo.target_type || 'All'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={14} className="text-slate-400" />
                                                    {start.toLocaleDateString()} - {end.toLocaleDateString()}
                                                </div>
                                                {isActuallyExpired && <span className="text-[10px] text-red-500 font-bold uppercase block mt-1">Expired</span>}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${promo.is_active
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : 'bg-slate-100 text-slate-500'
                                                    }`}>
                                                    {promo.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEdit(promo)}
                                                        className="p-2 rounded-lg border border-indigo-200 text-indigo-500 hover:bg-indigo-50 transition-colors"
                                                        title="Edit Promotion"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleStatus(promo.id, promo.is_active)}
                                                        className={`p-2 rounded-lg transition-colors border ${promo.is_active
                                                            ? 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                                                            : 'border-slate-200 text-slate-500 hover:bg-slate-100'
                                                            }`}
                                                        title={promo.is_active ? "Deactivate Promotion" : "Activate Promotion"}
                                                    >
                                                        <Power size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(promo.id)}
                                                        className="p-2 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                                                        title="Delete Promotion"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PromotionManagement;
