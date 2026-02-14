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
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 pt-24 px-4 md:px-12 lg:px-20">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
            Admin Dashboard
          </h1>
          <p className="text-slate-600">
            Welcome, {user.email}
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
        >
          <span>+</span> Add Staff
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Stats Cards (Placeholders) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-slate-500 text-sm font-medium">Total Staff</h3>
          <p className="text-2xl font-bold text-slate-800 mt-2">{staffList?.length || 0}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h2 className="font-semibold text-slate-800">User Management</h2>
        </div>

        {(!staffList || staffList.length === 0) ? (
          <div className="p-8 text-center text-slate-500">
            No staff members added yet. Click "Add Staff" to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-800 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">UserID</th>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Phone No</th>
                  <th className="px-6 py-3">Created Date</th>
                  <th className="px-6 py-3">Role</th>
                  {(currentRole === 'owner' || currentRole === 'staff_manager' || currentRole === 'head_manager') && (
                    <th className="px-6 py-3">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staffList.map((staff) => (
                  <tr key={staff.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-mono text-xs">{staff.id}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{staff.name}</td>
                    <td className="px-6 py-4">{staff.phone_no}</td>
                    <td className="px-6 py-4">
                      {new Date(staff.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 capitalize">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${staff.role === 'owner' ? 'bg-purple-100 text-purple-700' :
                        staff.role === 'staff_manager' || staff.role === 'head_manager' ? 'bg-blue-100 text-blue-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                        {staff.role.replace('head_manager', 'staff_manager').replace('_', ' ')}
                      </span>
                    </td>
                    {(currentRole === 'owner' || currentRole === 'staff_manager' || currentRole === 'head_manager') && (
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {/* Edit Button: Owner can edit all, Staff Manager can edit non-owners */}
                          {(currentRole === 'owner' || ((currentRole === 'staff_manager' || currentRole === 'head_manager') && staff.role !== 'owner')) && (
                            <button
                              onClick={() => openEditModal(staff)}
                              className="text-blue-600 hover:text-blue-800 font-medium text-xs px-3 py-1 bg-blue-50 rounded-md border border-blue-100"
                            >
                              Edit
                            </button>
                          )}

                          {/* Delete Button: 
                                - Target Owner: Only Superuser (chathuralakshan1234567@gmail.com) can delete 
                                - Target Non-Owner: Owner and Staff Manager can delete
                            */}
                          {((staff.role === 'owner' && user.email === 'chathuralakshan1234567@gmail.com') ||
                            (staff.role !== 'owner' && (currentRole === 'owner' || currentRole === 'staff_manager' || currentRole === 'head_manager'))) && (
                              <button
                                onClick={() => handleDeleteStaff(staff.id)}
                                className="text-red-600 hover:text-red-800 font-medium text-xs px-3 py-1 bg-red-50 rounded-md border border-red-100"
                              >
                                Delete
                              </button>
                            )}                     </div>
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
