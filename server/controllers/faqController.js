const supabase = require('../config/supabaseClient');

// Get all FAQs
exports.getFaqs = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('faqs')
            .select('*')
            .order('display_order', { ascending: true });

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create a new FAQ
exports.createFaq = async (req, res) => {
    try {
        const { question, answer, category, is_active, display_order } = req.body;
        const { data, error } = await supabase
            .from('faqs')
            .insert([{ question, answer, category, is_active, display_order }])
            .select();

        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update an FAQ
exports.updateFaq = async (req, res) => {
    try {
        const { id } = req.params;
        const { question, answer, category, is_active, display_order } = req.body;
        const { data, error } = await supabase
            .from('faqs')
            .update({ question, answer, category, is_active, display_order })
            .eq('id', id)
            .select();

        if (error) throw error;
        res.status(200).json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete an FAQ
exports.deleteFaq = async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase
            .from('faqs')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.status(200).json({ message: 'FAQ deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
