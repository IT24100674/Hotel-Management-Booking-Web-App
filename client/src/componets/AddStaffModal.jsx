import React, { useState, useEffect } from 'react';

const AddStaffModal = ({ isOpen, onClose, onAdd, onEdit, initialData, currentUserRole }) => {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('staff_manager');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [tempPassword, setTempPassword] = useState('');
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (initialData) {
            setEmail(initialData.email || '');
            setRole(initialData.role || 'staff_manager');
            setName(initialData.name || '');
            setPhone(initialData.phone_no || '');
            setTempPassword(initialData.temp_password || '');
        } else {
            setEmail('');
            setRole('staff_manager');
            setName('');
            setPhone('');
            setTempPassword('');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialData, isOpen]);


    if (!isOpen) return null;

    const validate = () => {
        const newErrors = {};

        // Email validation (Gmail only)
        if (!email.endsWith('@gmail.com')) {
            newErrors.email = 'Email must be a valid @gmail.com address';
        }

        // Phone validation (Simple 10 digit check)
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(phone)) {
            newErrors.phone = 'Phone number must be exactly 10 digits';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;

        const staffData = { email, role, name, phone, tempPassword };

        if (initialData) {
            onEdit(initialData.id, staffData);
        } else {
            onAdd(staffData);
        }

        // Reset form handled by parent or effect, but clearing here for good measure if adding
        if (!initialData) {
            setEmail('');
            setRole('staff_manager');
            setName('');
            setPhone('');
            setTempPassword('');
        }
        setErrors({});
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">{initialData ? 'Edit Staff' : 'Add New Staff'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`mt-1 block w-full border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2 text-gray-900`}
                            required
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Phone No</label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className={`mt-1 block w-full border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2 text-gray-900`}
                            required
                        />
                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Temp Password</label>
                        <input
                            type="text"
                            value={tempPassword}
                            onChange={(e) => setTempPassword(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900"
                            required={!initialData}
                            placeholder={initialData ? "Leave blank to keep current" : ""}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Role</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900"
                        >
                            {currentUserRole === 'owner' && <option value="owner">Owner</option>}
                            <option value="staff_manager">Staff Manager</option>
                            <option value="receptionist">Receptionist</option>
                            <option value="event_manager">Event Manager</option>
                            <option value="room_manager">Room Manager</option>
                            <option value="financial_manager">Financial Manager</option>
                            <option value="content_manager">Content Manager</option>
                            <option value="facility_manager">Facility Manager</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md border border-gray-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 shadow-sm"
                        >
                            {initialData ? 'Update' : 'Confirm'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddStaffModal;
