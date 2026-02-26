const supabase = require('../config/supabaseClient');

// Create a new payment record
const createPayment = async (req, res) => {
    const {
        user_id,
        room_booking_id,
        event_booking_id,
        facility_booking_id,
        amount,
        payment_method,
        transaction_id
    } = req.body;

    try {
        const { data, error } = await supabase
            .from('payments')
            .insert([{
                user_id: user_id || null,
                room_booking_id: room_booking_id || null,
                event_booking_id: event_booking_id || null,
                facility_booking_id: facility_booking_id || null,
                amount,
                payment_method,
                transaction_id,
                payment_status: 'Paid'
            }])
            .select();

        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all payments (Admin)
const getAllPayments = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('payments')
            .select(`
                *,
                users (name, email)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get payments by user
const getUserPayments = async (req, res) => {
    const { userId } = req.params;
    try {
        const { data, error } = await supabase
            .from('payments')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createPayment,
    getAllPayments,
    getUserPayments
};
