const supabase = require('../config/supabaseClient');

// Get user profile by ID
const getUserProfile = async (req, res) => {
    const { id } = req.params;
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;

        if (!data) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update user profile
const updateUserProfile = async (req, res) => {
    const { id } = req.params;
    const { name, phone } = req.body; // Add other fields as needed

    const updates = {};
    if (name) updates.name = name;
    // Add phone column to users table if not exists, or just store it if it does. 
    // For now assuming users table only has name, email, role based on previous schema.
    // If phone is needed, I might need to alter table. 
    // content of previous schema update:
    /*
    create table public.users (
      id uuid references auth.users not null primary key,
      name text,
      email text not null,
      role text default 'user',
      created_at timestamp with time zone default timezone('utc'::text, now()) not null
    );
    */
    // The user schema doesn't have phone. I'll just update name for now.

    try {
        const { data, error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) throw error;
        res.status(200).json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getUserProfile,
    updateUserProfile
};
