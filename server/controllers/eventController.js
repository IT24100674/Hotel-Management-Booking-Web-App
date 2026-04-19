const supabase = require('../config/supabaseClient');

// Get all events
const getEvents = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        console.error('DATABASE ERROR:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get a single event by ID
const getEventById = async (req, res) => {
    const { id } = req.params;
    try {
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        console.error('DATABASE ERROR:', error);
        res.status(500).json({ error: error.message });
    }
};

// Create a new event
const createEvent = async (req, res) => {
    const { title, description, image_url, capacity, price_per_guest, features, type } = req.body;
    try {
        const { data, error } = await supabase
            .from('events')
            .insert([{
                title,
                description,
                image_url,
                capacity,
                price_per_guest,
                features,
                type
            }])
            .select();

        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (error) {
        console.error('DATABASE ERROR:', error);
        res.status(500).json({ error: error.message });
    }
};

// Update an event
const updateEvent = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    try {
        const { data, error } = await supabase
            .from('events')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) throw error;
        res.status(200).json(data[0]);
    } catch (error) {
        console.error('DATABASE ERROR:', error);
        res.status(500).json({ error: error.message });
    }
};

// Delete an event
const deleteEvent = async (req, res) => {
    const { id } = req.params;
    try {
        // 1. Check for future or active bookings
        const today = new Date().toISOString().split('T')[0];
        const { data: futureBookings, error: bookingCheckError } = await supabase
            .from('event_bookings')
            .select('id')
            .eq('hall_id', id)
            .gte('booking_date', today)
            .neq('status', 'Cancelled');

        if (bookingCheckError) throw bookingCheckError;

        if (futureBookings && futureBookings.length > 0) {
            return res.status(400).json({
                error: 'Cannot delete event hall with active or future bookings. Please clear these bookings first.'
            });
        }

        // 2. Delete the event package (Cascade will handle past bookings if configured)
        const { error } = await supabase
            .from('events')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.status(200).json({ message: 'Event and past history deleted successfully' });
    } catch (error) {
        console.error('DELETE EVENT ERROR:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent
};
