const supabase = require('../config/supabaseClient');

// Get all event bookings (Admin)
const getAllEventBookings = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('event_bookings')
            .select(`
                *,
                events (title, type, price_per_guest, capacity)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create a new event booking
const createEventBooking = async (req, res) => {
    const {
        hall_id,
        user_id,
        customer_name,
        customer_email,
        customer_phone,
        customer_id_no,
        booking_date,
        session_type,
        guest_count,
        total_price,
        paymentMethod,
        transactionId
    } = req.body;

    try {
        // 1. Availability Check
        const { data: existing } = await supabase
            .from('event_bookings')
            .select('id')
            .eq('hall_id', hall_id)
            .eq('booking_date', booking_date)
            .eq('session_type', session_type)
            .neq('status', 'Cancelled');

        if (existing && existing.length > 0) {
            return res.status(400).json({ error: 'This hall is already booked for the selected date and session.' });
        }

        // 2. Capacity Check
        const { data: event } = await supabase
            .from('events')
            .select('capacity')
            .eq('id', hall_id)
            .single();

        if (event && guest_count > event.capacity) {
            return res.status(400).json({ error: `Maximum capacity for this package is ${event.capacity}.` });
        }

        // 3. Insert Booking
        const { data: bookingData, error: bookingError } = await supabase
            .from('event_bookings')
            .insert([{
                hall_id,
                user_id,
                customer_name,
                customer_email,
                customer_phone,
                customer_id_no,
                booking_date,
                session_type,
                guest_count,
                total_price,
                status: 'Confirmed'
            }])
            .select();

        if (bookingError) throw bookingError;
        const newBooking = bookingData[0];

        // 4. Optional: Record Payment
        if (paymentMethod) {
            const { error: paymentError } = await supabase
                .from('payments')
                .insert([{
                    user_id: user_id || null,
                    event_booking_id: newBooking.id,
                    amount: total_price,
                    payment_method: paymentMethod,
                    transaction_id: transactionId || `MAN-E-${Math.random().toString(36).substr(2, 7).toUpperCase()}`,
                    payment_status: 'Paid'
                }]);

            if (paymentError) {
                // Rollback
                await supabase.from('event_bookings').delete().eq('id', newBooking.id);
                return res.status(500).json({ error: `Booking created but payment recording failed: ${paymentError.message}. Booking has been rolled back.` });
            }
        }

        res.status(201).json(newBooking);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get event bookings for a specific user
const getUserEventBookings = async (req, res) => {
    const { userId } = req.params;
    try {
        const { data, error } = await supabase
            .from('event_bookings')
            .select(`
                *,
                events (title, type, image_url)
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete an event booking
// Cancel/Delete event booking (Soft delete/Status change)
const deleteEventBooking = async (req, res) => {
    const { id } = req.params;
    try {
        // 1. Update Payment Status to Refunded
        await supabase
            .from('payments')
            .update({ payment_status: 'Refunded' })
            .eq('event_booking_id', id);

        // 2. Update Booking Status to Cancelled instead of deleting
        const { data, error } = await supabase
            .from('event_bookings')
            .update({ status: 'Cancelled' })
            .eq('id', id)
            .select();

        if (error) throw error;
        res.status(200).json({ message: 'Event booking cancelled successfully', data: data[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Cancel an event booking (10 day rule)
const cancelEventBooking = async (req, res) => {
    const { id } = req.params;

    try {
        const { data: booking, error: fetchError } = await supabase
            .from('event_bookings')
            .select('booking_date')
            .eq('id', id)
            .single();

        if (fetchError) throw fetchError;

        const bookingDate = new Date(booking.booking_date);
        const now = new Date();
        const diffHours = (bookingDate - now) / (1000 * 60 * 60);

        if (diffHours < 240) { // 10 days
            return res.status(400).json({ error: 'Event Package cancellation allowed up to 10 days before event.' });
        }

        // Update Payment Status to Refunded
        await supabase
            .from('payments')
            .update({ payment_status: 'Refunded' })
            .eq('event_booking_id', id);

        const { data, error } = await supabase
            .from('event_bookings')
            .update({ status: 'Cancelled' })
            .eq('id', id)
            .select();

        if (error) throw error;
        res.status(200).json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Check event availability
const checkEventAvailability = async (req, res) => {
    const { hall_id, booking_date, session_type } = req.query;

    if (!hall_id || !booking_date || !session_type) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    try {
        const { data: existing, error } = await supabase
            .from('event_bookings')
            .select('id')
            .eq('hall_id', hall_id)
            .eq('booking_date', booking_date)
            .eq('session_type', session_type)
            .neq('status', 'Cancelled');

        if (error) throw error;
        res.status(200).json({ available: existing.length === 0 });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllEventBookings,
    createEventBooking,
    getUserEventBookings,
    deleteEventBooking,
    cancelEventBooking,
    checkEventAvailability
};
