const supabase = require('../config/supabaseClient');

// Get all menu items
const getMenuItems = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('menu')
            .select('*')
            .order('category', { ascending: true });

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a single menu item by ID
const getMenuItemById = async (req, res) => {
    const { id } = req.params;
    try {
        const { data, error } = await supabase
            .from('menu')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create a new menu item
const createMenuItem = async (req, res) => {
    const { name, description, price, category, is_available, image_url, is_featured } = req.body;
    try {
        const { data, error } = await supabase
            .from('menu')
            .insert([{ name, description, price, category, is_available, image_url, is_featured }])
            .select();

        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a menu item
const updateMenuItem = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    try {
        const { data, error } = await supabase
            .from('menu')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) throw error;
        res.status(200).json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete a menu item
const deleteMenuItem = async (req, res) => {
    const { id } = req.params;
    try {
        // First, fetch the item to get the image URL
        const { data: item, error: fetchError } = await supabase
            .from('menu')
            .select('image_url')
            .eq('id', id)
            .single();

        if (fetchError) throw fetchError;

        if (item && item.image_url) {
            const imageUrl = item.image_url;
            // Extract filename from URL (assuming standard Supabase Storage URL structure)
            const fileName = imageUrl.split('/').pop();

            const { error: storageError } = await supabase.storage
                .from('menu_images')
                .remove([fileName]);

            if (storageError) {
                console.error('Error deleting image from storage:', storageError);
                // We continue to delete the record even if image deletion fails
            }
        }

        const { error } = await supabase
            .from('menu')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.status(200).json({ message: 'Menu item deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getMenuItems,
    getMenuItemById,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem
};
