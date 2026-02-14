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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md border border-gray-100 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-playfair font-bold text-gray-900">
                        {initialData ? 'Edit Staff Member' : 'Add New Staff'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                            placeholder="e.g. Sarah Smith"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`w-full px-4 py-3 bg-gray-50 border ${errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-primary focus:ring-primary'} rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 transition-all`}
                            placeholder="name@gmail.com"
                            required
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email}</p>}
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Phone Number</label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className={`w-full px-4 py-3 bg-gray-50 border ${errors.phone ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-primary focus:ring-primary'} rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 transition-all`}
                            placeholder="10-digit number"
                            required
                        />
                        {errors.phone && <p className="text-red-500 text-xs mt-1 font-medium">{errors.phone}</p>}
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Temporary Password</label>
                        <input
                            type="text"
                            value={tempPassword}
                            onChange={(e) => setTempPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                            required={!initialData}
                            placeholder={initialData ? "Leave blank to keep current" : "Create a generic password"}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Role Assignment</label>
                        <div className="relative">
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none"
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
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-light shadow-lg hover:shadow-primary/30 transition-all transform hover:-translate-y-0.5 text-sm"
                        >
                            {initialData ? 'Save Changes' : 'Add Staff Member'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddStaffModal;
