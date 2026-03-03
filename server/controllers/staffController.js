const supabase = require('../config/supabaseClient');

// Get all staff
const getStaff = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('staff')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a single staff member by ID
const getStaffById = async (req, res) => {
    const { id } = req.params;
    try {
        const { data, error } = await supabase
            .from('staff')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create a new staff member
const createStaff = async (req, res) => {
    let { name, role, email, phone, tempPassword } = req.body;
    if (email) email = email.toLowerCase();
    try {
        // Check if email already exists
        const { data: existingStaff } = await supabase
            .from('staff')
            .select('id')
            .ilike('email', email);

        if (existingStaff && existingStaff.length > 0) {
            return res.status(400).json({ error: 'A staff member with this email already exists.' });
        }

        const { data, error } = await supabase
            .from('staff')
            .insert([{
                name,
                role,
                email,
                phone_no: phone, // Map phone to phone_no
                temp_password: tempPassword // Include temp_password
            }])
            .select();

        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a staff member
const updateStaff = async (req, res) => {
    const { id } = req.params;
    let { name, role, email, phone, temp_password } = req.body;
    if (email) {
        email = email.toLowerCase();
        // Check if email already exists for a different staff member
        const { data: existingStaff } = await supabase
            .from('staff')
            .select('id')
            .ilike('email', email)
            .neq('id', id);

        if (existingStaff && existingStaff.length > 0) {
            return res.status(400).json({ error: 'A staff member with this email already exists.' });
        }
    }

    // Prepare updates object based on available fields
    const updates = {};
    if (name) updates.name = name;
    if (role) updates.role = role;
    if (email) updates.email = email;
    if (phone) updates.phone_no = phone;
    if (temp_password) updates.temp_password = temp_password;

    try {
        const { data, error } = await supabase
            .from('staff')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) throw error;
        res.status(200).json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete a staff member
const deleteStaff = async (req, res) => {
    const { id } = req.params;
    try {
        const { error } = await supabase
            .from('staff')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.status(200).json({ message: 'Staff member deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getStaff,
    getStaffById,
    createStaff,
    updateStaff,
    deleteStaff
};
