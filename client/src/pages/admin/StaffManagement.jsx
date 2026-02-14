import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, User, Phone, Mail, Shield } from 'lucide-react';
import AddStaffModal from '../../componets/AddStaffModal';

const StaffManagement = () => {
    const [staffList, setStaffList] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);

    // Get current user from storage
    const storedUser = JSON.parse(localStorage.getItem('hotel_user') || '{}');
    const currentUserRole = storedUser.role || 'staff_manager';
    const currentUserEmail = storedUser.email || '';

    // Developer check
    const isDeveloper = currentUserEmail === 'chathuralakshan123567@gmail.com' || currentUserEmail === 'chathuralakshan1234567@gmail.com';

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/staff');
            const data = await res.json();
            if (res.ok) {
                setStaffList(data);
            } else {
                console.error('Failed to fetch staff:', data);
                setStaffList([]);
            }
        } catch (err) {
            console.error('Error fetching staff:', err);
        }
    };

    const handleAddStaff = async (newStaff) => {
        try {
            const payload = {
                ...newStaff
            };

            const res = await fetch('http://localhost:5000/api/staff', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (res.ok) {
                fetchStaff();
                setIsModalOpen(false);
            } else {
                alert(data.error || 'Failed to add staff');
            }
        } catch (err) {
            console.error('Error adding staff:', err);
            alert('An error occurred while adding staff.');
        }
    };

    const handleUpdateStaff = async (id, updatedStaff) => {
        try {
            const res = await fetch(`http://localhost:5000/api/staff/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedStaff)
            });

            if (res.ok) {
                fetchStaff();
                setIsModalOpen(false);
                setEditingStaff(null);
            }
        } catch (err) {
            console.error('Error updating staff:', err);
        }
    };

    const handleDeleteStaff = async (id) => {
        if (window.confirm('Are you sure you want to delete this staff member?')) {
            try {
                await fetch(`http://localhost:5000/api/staff/${id}`, { method: 'DELETE' });
                fetchStaff();
            } catch (err) {
                console.error('Error deleting staff:', err);
            }
        }
    };

    const openAddModal = () => {
        setEditingStaff(null);
        setIsModalOpen(true);
    };

    const openEditModal = (staff) => {
        setEditingStaff(staff);
        setIsModalOpen(true);
    };

    const getRoleColor = (role) => {
        if (role === 'owner') return 'bg-purple-100 text-purple-700';
        if (role.includes('manager')) return 'bg-blue-100 text-blue-700';
        return 'bg-gray-100 text-gray-700';
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Staff</h1>
                    <p className="text-gray-500 mt-1">Manage team members and permissions</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                >
                    <Plus size={20} />
                    Add Staff
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4">Role</th>
                                {/* <th className="px-6 py-4">Status</th> Status column removed */}
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {staffList.map((staff) => (
                                <tr key={staff.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                                {staff.name ? staff.name.charAt(0).toUpperCase() : <User size={20} />}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">{staff.name}</div>
                                                <div className="text-xs text-gray-500">ID: {staff.id ? String(staff.id).slice(0, 8) : 'N/A'}...</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1 text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Mail size={14} className="text-gray-400" />
                                                {staff.email}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Phone size={14} className="text-gray-400" />
                                                {staff.phone_no || staff.phone}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getRoleColor(staff.role)}`}>
                                            {staff.role.replace('_', ' ')}
                                        </span>
                                    </td>
                                    {/* Status cell removed */}
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {(staff.role !== 'owner' || isDeveloper) && (
                                                <button
                                                    onClick={() => openEditModal(staff)}
                                                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                    title="Edit Staff"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                            )}
                                            {(staff.role !== 'owner' || isDeveloper) && (
                                                <button
                                                    onClick={() => handleDeleteStaff(staff.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete Staff"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <AddStaffModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={handleAddStaff}
                onEdit={handleUpdateStaff}
                initialData={editingStaff}
                currentUserRole={currentUserRole}
            />
        </div>
    );
};

export default StaffManagement;
