const supabase = require('../config/supabaseClient');

// Create a new facility booking
const createBooking = async (req, res) => {
    const {
        facility_id,
        user_id,
        customer_name,
        customer_email,
        customer_phone,
        customer_id_no,
        booking_date,
        start_time,
        duration_hours,
        guest_count,
        total_price,
        paymentMethod,
        transactionId
    } = req.body;

    try {
        // 1. Insert Booking
        const { data: bookingData, error: bookingError } = await supabase
            .from('facility_bookings')
            .insert([{
                facility_id,
                user_id,
                customer_name,
                customer_email,
                customer_phone,
                customer_id_no,
                booking_date,
                start_time,
                duration_hours,
                guest_count,
                total_price: total_price || 0,
                status: 'Confirmed'
            }])
            .select();

        if (bookingError) throw bookingError;
        const newBooking = bookingData[0];

        // 2. Optional: Record Payment
        if (paymentMethod) {
            const { error: paymentError } = await supabase
                .from('payments')
                .insert([{
                    user_id: user_id || null,
                    facility_booking_id: newBooking.id,
                    amount: total_price,
                    payment_method: paymentMethod,
                    transaction_id: transactionId || `MAN-F-${Math.random().toString(36).substr(2, 7).toUpperCase()}`,
                    payment_status: 'Paid'
                }]);

            if (paymentError) {
                // Rollback
                await supabase.from('facility_bookings').delete().eq('id', newBooking.id);
                return res.status(500).json({ error: `Booking created but payment recording failed: ${paymentError.message}. Booking has been rolled back.` });
            }
        }

        res.status(201).json(newBooking);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get all facility bookings (Admin)
const getBookings = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('facility_bookings')
            .select(`
                *,
                facilities (
                    name
                )
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Cancel/Delete a facility booking (Soft delete/Status change)
const deleteBooking = async (req, res) => {
    const { id } = req.params;
    try {
        // 1. Update Payment Status to Refunded
        await supabase
            .from('payments')
            .update({ payment_status: 'Refunded' })
            .eq('facility_booking_id', id);

        // 2. Update Booking Status to Cancelled instead of deleting
        const { data, error } = await supabase
            .from('facility_bookings')
            .update({ status: 'Cancelled' })
            .eq('id', id)
            .select();

        if (error) throw error;
        res.status(200).json({ message: 'Booking cancelled successfully', data: data[0] });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Check facility availability
const checkAvailability = async (req, res) => {
    const { facility_id, booking_date, start_time, guest_count } = req.query;

    try {
        // 1. Get facility max capacity
        const { data: facility, error: fError } = await supabase
            .from('facilities')
            .select('max_capacity')
            .eq('id', facility_id)
            .single();

        if (fError) throw fError;
        if (!facility) return res.status(404).json({ error: 'Facility not found' });

        // 2. Get total guest count for existing bookings in that time slot
        const { data: bookings, error: bError } = await supabase
            .from('facility_bookings')
            .select('guest_count')
            .eq('facility_id', facility_id)
            .eq('booking_date', booking_date)
            .eq('start_time', start_time)
            .eq('status', 'Confirmed');

        if (bError) throw bError;

        const currentGuests = bookings.reduce((sum, b) => sum + (b.guest_count || 0), 0);
        const remainingCapacity = facility.max_capacity - currentGuests;

        if (parseInt(guest_count) > remainingCapacity) {
            return res.status(400).json({
                available: false,
                remainingCapacity,
                message: `Exceeds remaining capacity. Only ${remainingCapacity} spots left for this time.`
            });
        }

        res.status(200).json({
            available: true,
            remainingCapacity,
            message: 'Facility is available'
        });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get bookings by user ID
const getBookingsByUser = async (req, res) => {
    const { userId } = req.params;
    try {
        const { data, error } = await supabase
            .from('facility_bookings')
            .select(`
                *,
                facilities (
                    name,
                    image_url
                )
            `)
            .eq('user_id', userId)
            .order('booking_date', { ascending: false });

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    createBooking,
    getBookings,
    getBookingsByUser,
    deleteBooking,
    checkAvailability
};
