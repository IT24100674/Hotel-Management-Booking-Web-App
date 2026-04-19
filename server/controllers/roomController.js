const supabase = require('../config/supabaseClient');

// Get all rooms
const getRooms = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('rooms')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a single room by ID
const getRoomById = async (req, res) => {
    const { id } = req.params;
    try {
        const { data, error } = await supabase
            .from('rooms')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Helper function to upload file to Supabase Storage
const uploadImage = async (file) => {
    try {
        const fileExt = file.originalname.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { data, error } = await supabase.storage
            .from('room_images')
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
            });

        if (error) {
            console.error('Supabase Storage Upload Error:', error);
            throw error;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('room_images')
            .getPublicUrl(filePath);

        return publicUrl;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw new Error('Failed to upload image: ' + error.message);
    }
};

// Create a new room
const createRoom = async (req, res) => {
    const { room_number, type, price, status, description, image_url: urlFromBody } = req.body;
    let image_url = urlFromBody;

    try {
        if (req.file) {
            image_url = await uploadImage(req.file);
        }

        const { data, error } = await supabase
            .from('rooms')
            .insert([{ room_number, type, price, status, description, image_url }])
            .select();

        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a room
const updateRoom = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    try {
        if (req.file) {
            const image_url = await uploadImage(req.file);
            updates.image_url = image_url;
        }

        const { data, error } = await supabase
            .from('rooms')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) throw error;
        res.status(200).json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete a room
const deleteRoom = async (req, res) => {
    const { id } = req.params;
    try {
        // 1. Check for future or active bookings
        const today = new Date().toISOString().split('T')[0];
        const { data: futureBookings, error: bookingCheckError } = await supabase
            .from('room_bookings')
            .select('id')
            .eq('room_id', id)
            .gte('check_out', today)
            .neq('status', 'Cancelled');

        if (bookingCheckError) throw bookingCheckError;

        if (futureBookings && futureBookings.length > 0) {
            return res.status(400).json({
                error: 'Cannot delete room with active or future bookings. Please clear these bookings first.'
            });
        }

        // 2. Get the room to find the image URL
        const { data: room, error: fetchError } = await supabase
            .from('rooms')
            .select('image_url')
            .eq('id', id)
            .single();

        if (fetchError) throw fetchError;

        // 3. Delete image from storage if it exists
        if (room && room.image_url) {
            const imageUrl = room.image_url;
            const fileName = imageUrl.split('/').pop();
            const { error: storageError } = await supabase.storage
                .from('room_images')
                .remove([fileName]);

            if (storageError) {
                console.error('Error deleting image from storage:', storageError);
                // Continue to delete the room record even if storage deletion fails
            }
        }

        // 4. Delete the room (Cascade will handle past bookings if configured)
        const { error } = await supabase
            .from('rooms')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.status(200).json({ message: 'Room and past history deleted successfully' });
    } catch (error) {
        console.error('DELETE ROOM ERROR:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getRooms,
    getRoomById,
    createRoom,
    updateRoom,
    deleteRoom
};
