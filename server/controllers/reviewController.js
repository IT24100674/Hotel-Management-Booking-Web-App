const supabase = require('../config/supabaseClient');

// Get all reviews
const getReviews = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a single review by ID
const getReviewById = async (req, res) => {
    const { id } = req.params;
    try {
        const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create a new review
const createReview = async (req, res) => {
    const { user_name, rating, comment, event_id, room_id, status } = req.body;
    try {
        const { data, error } = await supabase
            .from('reviews')
            .insert([{ user_name, rating, comment, event_id, room_id, status }])
            .select();

        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a review (e.g., status change to approved)
const updateReview = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    try {
        const { data, error } = await supabase
            .from('reviews')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) throw error;
        res.status(200).json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete a review
const deleteReview = async (req, res) => {
    const { id } = req.params;
    try {
        const { error } = await supabase
            .from('reviews')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.status(200).json({ message: 'Review deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getReviews,
    getReviewById,
    createReview,
    updateReview,
    deleteReview
};
