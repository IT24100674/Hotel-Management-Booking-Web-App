const supabase = require('../config/supabaseClient');

// Get all facilities
const getFacilities = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('facilities')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a single facility by ID
const getFacilityById = async (req, res) => {
    const { id } = req.params;
    try {
        const { data, error } = await supabase
            .from('facilities')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create a new facility
const createFacility = async (req, res) => {
    const { name, description, status, image_url } = req.body;
    try {
        const { data, error } = await supabase
            .from('facilities')
            .insert([{ name, description, status, image_url }])
            .select();

        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a facility
const updateFacility = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    try {
        const { data, error } = await supabase
            .from('facilities')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) throw error;
        res.status(200).json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete a facility
const deleteFacility = async (req, res) => {
    const { id } = req.params;
    try {
        const { error } = await supabase
            .from('facilities')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.status(200).json({ message: 'Facility deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getFacilities,
    getFacilityById,
    createFacility,
    updateFacility,
    deleteFacility
};
