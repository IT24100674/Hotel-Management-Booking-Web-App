import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import AddStaffModal from "../componets/AddStaffModal";

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const navigate = useNavigate();
  const [currentRole, setCurrentRole] = useState(null);

  useEffect(() => {
    const getSession = async () => {
      // 1. Check Supabase Session
      const { data: { session } } = await supabase.auth.getSession();
      let currentUser = session?.user;

      // 2. Check Local Storage if no Supabase Session
      if (!currentUser) {
        const localUser = localStorage.getItem('hotel_user');
        if (localUser) {
          currentUser = JSON.parse(localUser);
        }
      }

      if (!currentUser) {
        navigate('/sign-in');
        setLoading(false);
        return;
      }

      // Check if superadmin (hardcoded)
      if (currentUser.email === "chathuralakshan1234567@gmail.com") {
        setUser(currentUser);
        setCurrentRole('owner');
        setLoading(false);
        return;
      }

      // If local user has role in object, use it directly
      if (currentUser.role) {
        setUser(currentUser);
        setCurrentRole(currentUser.role);
        setLoading(false);
        return;
      }

      // Check against staff table (for Supabase Auth users)
      const { data: staffMember, error } = await supabase
        .from('staff')
        .select('role')
        .eq('email', currentUser.email)
        .single();

      if (staffMember && !error) {
        setUser(currentUser);
        setCurrentRole(staffMember.role);
      } else {
        // Not authorized
        navigate('/');
      }
      setLoading(false);
    };

    getSession();
  }, [navigate]);

  const [editingStaff, setEditingStaff] = useState(null);

  useEffect(() => {
    const fetchStaff = async () => {
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching staff:', error);
      } else {
        setStaffList(data);
      }
    };

    if (user) {
      fetchStaff();
    }
  }, [user]);

  const refreshStaff = async () => {
    const { data } = await supabase
      .from('staff')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setStaffList(data);
  };

  const handleAddStaff = async (newStaff) => {
    try {
      const { data, error } = await supabase
        .from('staff')
        .insert([
          {
            name: newStaff.name,
            email: newStaff.email,
            phone_no: newStaff.phone,
            role: newStaff.role,
            temp_password: newStaff.tempPassword
          }
        ])
        .select();

      if (error) throw error;

      if (data) {
        setStaffList([data[0], ...staffList]);
        alert("Staff added successfully!");
      } else {
        refreshStaff();
      }

    } catch (error) {
      console.error('Error adding staff:', error.message);
      alert('Error adding staff: ' + error.message);
    }
  };

  const handleUpdateStaff = async (id, updatedStaff) => {
    try {
      const updates = {
        name: updatedStaff.name,
        email: updatedStaff.email,
        phone_no: updatedStaff.phone,
        role: updatedStaff.role,
      };

      // Only update password if provided
      if (updatedStaff.tempPassword) {
        updates.temp_password = updatedStaff.tempPassword;
      }

      const { error } = await supabase
        .from('staff')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      alert("Staff updated successfully!");
      refreshStaff();
      setEditingStaff(null);

    } catch (error) {
      console.error('Error updating staff:', error.message);
      alert('Error updating staff: ' + error.message);
    }
  };

  const handleDeleteStaff = async (id) => {
    if (!window.confirm("Are you sure you want to delete this staff member?")) return;

    try {
      const { error } = await supabase
        .from('staff')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setStaffList(staffList.filter(staff => staff.id !== id));
      alert("Staff deleted successfully!");

    } catch (error) {
      console.error('Error deleting staff:', error.message);
      alert('Error deleting staff: ' + error.message);
    }
  };

  const openEditModal = (staff) => {
    setEditingStaff(staff);
    setIsAddStaffOpen(true);
  };

  const openAddModal = () => {
    setEditingStaff(null);
    setIsAddStaffOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 px-4 md:px-12 lg:px-20 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-playfair font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-500">
            Welcome back, <span className="text-gray-900 font-bold">{user.email}</span>
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary-light transition-all shadow-lg hover:shadow-primary/30 flex items-center gap-2 font-medium transform hover:-translate-y-0.5"
        >
          <span className="text-xl leading-none">+</span> Add Staff
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {/* Stats Cards */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4">Total Staff</h3>
          <div className="flex items-end justify-between">
            <p className="text-4xl font-playfair font-bold text-gray-900">{staffList?.length || 0}</p>
            <div className="h-2 w-2 rounded-full bg-secondary mb-2 animate-pulse"></div>
          </div>
        </div>
        {/* Placeholder for other stats */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow opacity-60">
          <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4">Active Bookings</h3>
          <div className="flex items-end justify-between">
            <p className="text-4xl font-playfair font-bold text-gray-900">-</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow opacity-60">
          <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4">Total Revenue</h3>
          <div className="flex items-end justify-between">
            <p className="text-4xl font-playfair font-bold text-gray-900">-</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <h2 className="text-xl font-playfair font-bold text-gray-900">User Management</h2>
          <span className="text-xs font-medium px-3 py-1 bg-gray-100 rounded-full text-gray-500">
            {staffList.length} Users
          </span>
        </div>

        {(!staffList || staffList.length === 0) ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full mb-4 flex items-center justify-center text-gray-300">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <p className="text-lg font-medium text-gray-900">No staff members found</p>
            <p className="text-sm mt-1">Get started by adding a new staff member.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-400 font-bold text-xs uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="px-8 py-4">Name</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  {(currentRole === 'owner' || currentRole === 'staff_manager' || currentRole === 'head_manager') && (
                    <th className="px-6 py-4 text-right">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {staffList.map((staff) => (
                  <tr key={staff.id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-lg font-playfair shadow-md">
                          {staff.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{staff.name}</div>
                          <div className="text-xs text-gray-400 font-mono">{staff.id.substring(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-gray-700 font-medium">{staff.email}</span>
                        <span className="text-xs text-gray-400">{staff.phone_no}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${staff.role === 'owner'
                        ? 'bg-purple-50 text-purple-700 border-purple-100'
                        : staff.role.includes('manager')
                          ? 'bg-gray-100 text-gray-700 border-gray-200'
                          : 'bg-gray-50 text-gray-600 border-gray-100'
                        }`}>
                        {staff.role.replace('head_manager', 'staff_manager').replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span className="text-xs font-medium text-gray-500">Active</span>
                      </div>
                    </td>
                    {(currentRole === 'owner' || currentRole === 'staff_manager' || currentRole === 'head_manager') && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {/* Edit Button */}
                          {(currentRole === 'owner' || ((currentRole === 'staff_manager' || currentRole === 'head_manager') && staff.role !== 'owner')) && (
                            <button
                              onClick={() => openEditModal(staff)}
                              className="text-gray-700 hover:text-gray-900 font-medium text-xs px-3 py-1.5 bg-white rounded-lg border border-gray-200 transition-colors hover:bg-gray-50 shadow-sm"
                            >
                              Edit
                            </button>
                          )}

                          {/* Delete Button */}
                          {((staff.role === 'owner' && user.email === 'chathuralakshan1234567@gmail.com') ||
                            (staff.role !== 'owner' && (currentRole === 'owner' || currentRole === 'staff_manager' || currentRole === 'head_manager'))) && (
                              <button
                                onClick={() => handleDeleteStaff(staff.id)}
                                className="text-red-600 hover:text-red-700 font-medium text-xs px-3 py-1.5 bg-white rounded-lg border border-red-100 transition-colors hover:bg-red-50 shadow-sm"
                              >
                                Delete
                              </button>
                            )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AddStaffModal
        isOpen={isAddStaffOpen}
        onClose={() => setIsAddStaffOpen(false)}
        onAdd={handleAddStaff}
        onEdit={handleUpdateStaff}
        initialData={editingStaff}
        currentUserRole={currentRole}
      />
    </div>
  );
};

export default AdminDashboard;
