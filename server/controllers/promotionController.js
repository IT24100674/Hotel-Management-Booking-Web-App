const supabase = require('../config/supabaseClient');

// Helper function to upload file to Supabase Storage
const uploadImage = async (file) => {
    try {
        const fileExt = file.originalname.split('.').pop();
        const fileName = `${Date.now()}_promo.${fileExt}`;
        const filePath = `${fileName}`;

        const { data, error } = await supabase.storage
            .from('promotion_images')
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
            });

        if (error) {
            console.error('Supabase Storage Upload Error:', error);
            throw error;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('promotion_images')
            .getPublicUrl(filePath);

        return publicUrl;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw new Error('Failed to upload image: ' + error.message);
    }
};

// Helper to check for overlapping promotions of the same type
const checkPromotionOverlap = async (target_type, start_date, end_date, excludeId = null) => {
    let query = supabase
        .from('promotions')
        .select('id, title')
        .eq('is_active', true)
        .eq('target_type', target_type)
        .lte('start_date', end_date)
        .gte('end_date', start_date);

    if (excludeId) {
        query = query.neq('id', excludeId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data && data.length > 0 ? data[0] : null;
};

const getAllPromotions = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('promotions')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getActivePromotionsByType = async (req, res) => {
    const { type } = req.params; // 'Rooms', 'Events', 'Facilities', 'All'
    try {
        const today = new Date().toISOString().split('T')[0];

        // Fetch promotions that are active, within date range, and apply to either the specific type or 'All'
        const { data, error } = await supabase
            .from('promotions')
            .select('*')
            .eq('is_active', true)
            .lte('start_date', today)
            .gte('end_date', today)
            .in('target_type', [type, 'All']);

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createPromotion = async (req, res) => {
    const { title, discount_percentage, start_date, end_date, target_type } = req.body;

    if (new Date(end_date) < new Date(start_date)) {
        return res.status(400).json({ error: 'End Date cannot be before Start Date.' });
    }

    try {
        // Check for overlaps before creating
        const conflict = await checkPromotionOverlap(target_type || 'All', start_date, end_date);
        if (conflict) {
            return res.status(400).json({ error: 'An offer has already been created for this date.' });
        }

        let image_url = null;
        if (req.file) {
            image_url = await uploadImage(req.file);
        }

        const { data, error } = await supabase
            .from('promotions')
            .insert([{
                title,
                discount_percentage,
                start_date,
                end_date,
                target_type: target_type || 'All',
                is_active: true,
                image_url
            }])
            .select();

        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (error) {
        console.error('Error creating promotion:', error);
        res.status(500).json({ error: error.message });
    }
};

const deletePromotion = async (req, res) => {
    const { id } = req.params;
    try {
        // Find image string to clean up
        const { data: promo, error: fetchError } = await supabase
            .from('promotions')
            .select('image_url')
            .eq('id', id)
            .single();

        if (fetchError) throw fetchError;

        if (promo && promo.image_url) {
            const imageUrl = promo.image_url;
            const fileName = imageUrl.split('/').pop();
            const { error: storageError } = await supabase.storage
                .from('promotion_images')
                .remove([fileName]);

            if (storageError) {
                console.error('Error deleting promotion image from storage:', storageError);
            }
        }

        const { error } = await supabase
            .from('promotions')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.status(200).json({ message: 'Promotion deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const togglePromotionStatus = async (req, res) => {
    const { id } = req.params;
    const { is_active } = req.body;
    try {
        const { data, error } = await supabase
            .from('promotions')
            .update({ is_active })
            .eq('id', id)
            .select();

        if (error) throw error;
        res.status(200).json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updatePromotion = async (req, res) => {
    const { id } = req.params;
    const { title, discount_percentage, start_date, end_date, target_type } = req.body;

    if (new Date(end_date) < new Date(start_date)) {
        return res.status(400).json({ error: 'End Date cannot be before Start Date.' });
    }

    try {
        // Check for overlaps before updating
        const conflict = await checkPromotionOverlap(target_type || 'All', start_date, end_date, id);
        if (conflict) {
            return res.status(400).json({ error: 'alredycreated offer for this date' });
        }
        let updateData = {
            title,
            discount_percentage,
            start_date,
            end_date,
            target_type: target_type || 'All'
        };

        if (req.file) {
            // Find the old image to delete it to avoid bucket littering
            const { data: oldPromo } = await supabase
                .from('promotions')
                .select('image_url')
                .eq('id', id)
                .single();

            if (oldPromo && oldPromo.image_url) {
                const fileName = oldPromo.image_url.split('/').pop();
                await supabase.storage.from('promotion_images').remove([fileName]);
            }

            // Upload the new image
            updateData.image_url = await uploadImage(req.file);
        }

        const { data, error } = await supabase
            .from('promotions')
            .update(updateData)
            .eq('id', id)
            .select();

        if (error) throw error;
        res.status(200).json(data[0]);
    } catch (error) {
        console.error('Error updating promotion:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllPromotions,
    getActivePromotionsByType,
    createPromotion,
    deletePromotion,
    togglePromotionStatus,
    updatePromotion
};
