const supabase = require('../config/supabaseClient');

// Get room bookings for a specific user
const getUserRoomBookings = async (req, res) => {
    const { userId } = req.params;

    try {
        const { data, error } = await supabase
            .from('room_bookings')
            .select(`
                *,
                rooms (
                    room_number,
                    type,
                    image_url
                )
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create a new room booking
const createRoomBooking = async (req, res) => {
    const {
        user_id,
        room_id,
        check_in,
        check_out,
        total_price,
        guest_name,
        guest_email,
        guest_phone,
        guest_id_no,
        paymentMethod,
        transactionId
    } = req.body;

    // Basic validation
    const hasGuestIdentity = guest_name && guest_id_no;

    if ((!user_id && !hasGuestIdentity) || !room_id || !check_in || !check_out || !total_price) {
        return res.status(400).json({ error: 'Missing required fields. Provide User ID or Guest Name & ID.' });
    }

    // --- PAST DATE VALIDATION ---
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate date comparison
    if (new Date(check_in) < today) {
        return res.status(400).json({ error: 'Cannot book for a past date.' });
    }

    // Strict phone number validation: ensures it is exactly 10 digits.
    // This was added to prevent malformed contact details from entering the system.
    if (!guest_phone || !/^\d{10}$/.test(guest_phone)) {
        return res.status(400).json({ error: 'Phone number is required and must be exactly 10 digits.' });
    }

    try {
        // 1. Prevent Double-Booking: Query the database for any existing confirmed bookings 
        // that share dates with the requested check-in/check-out boundaries.
        const { data: existingBookings } = await supabase
            .from('room_bookings')
            .select('id, check_in, check_out') // Select check_in and check_out for the overlap logic
            .eq('room_id', room_id)
            .neq('status', 'Cancelled') // Consider bookings that are not cancelled
            .or(`check_in.lte.${check_out},check_out.gte.${check_in}`); // Broad initial filter

        if (existingBookings && existingBookings.length > 0) {
            // Check if any existing booking actually overlaps
            const remains = existingBookings.filter(b => {
                const bStart = new Date(b.check_in);
                const bEnd = new Date(b.check_out);
                const reqStart = new Date(check_in);
                const reqEnd = new Date(check_out);
                return reqStart < bEnd && reqEnd > bStart;
            });
            if (remains.length > 0) {
                return res.status(400).json({ error: 'Room is already booked for these dates' });
            }
        }

        // 2. Insert booking
        const { data: bookingData, error: bookingError } = await supabase
            .from('room_bookings')
            .insert([{
                room_id,
                check_in,
                check_out,
                total_price,
                status: 'Confirmed',
                user_id: user_id || null,
                guest_name: guest_name || null,
                guest_email: guest_email || null,
                guest_phone: guest_phone || null,
                guest_id_no: guest_id_no || null
            }])
            .select();

        if (bookingError) throw bookingError;
        const newBooking = bookingData[0];

        // 3. Financial Integration: Record the Payment immediately (for manual/cash bookings).
        // If the payment record fails to insert, we roll back and delete the booking to prevent orphaned data.
        if (paymentMethod) {
            const { error: paymentError } = await supabase
                .from('payments')
                .insert([{
                    user_id: user_id || null,
                    room_booking_id: newBooking.id,
                    amount: total_price,
                    payment_method: paymentMethod,
                    transaction_id: transactionId || `MAN-R-${Math.random().toString(36).substr(2, 7).toUpperCase()}`,
                    payment_status: 'Paid'
                }]);

            if (paymentError) {
                // Rollback: delete the booking if payment recording failed
                await supabase.from('room_bookings').delete().eq('id', newBooking.id);
                return res.status(500).json({ error: `Booking created but payment recording failed: ${paymentError.message}. Booking has been rolled back.` });
            }
        }

        res.status(201).json(newBooking);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all room bookings (Admin)
const getAllRoomBookings = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('room_bookings')
            .select(`
                *,
                rooms (
                    room_number,
                    type,
                    price
                ),
                users (
                    name,
                    email
                )
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get income statistics
const getRoomBookingStats = async (req, res) => {
    try {
        // 1. Fetch Room Bookings
        const { data: roomBookings, error: roomError } = await supabase
            .from('room_bookings')
            .select('total_price, created_at')
            .eq('status', 'Confirmed');

        if (roomError) throw roomError;

        // 2. Fetch Event Bookings
        const { data: eventBookings, error: eventError } = await supabase
            .from('event_bookings')
            .select('total_price, created_at')
            .eq('status', 'Confirmed');

        if (eventError) throw eventError;

        // 3. Fetch Facility Bookings
        const { data: facilityBookings, error: facilityError } = await supabase
            .from('facility_bookings')
            .select('total_price, created_at')
            .eq('status', 'Confirmed');

        if (facilityError) throw facilityError;

        const allBookings = [...roomBookings, ...eventBookings, ...facilityBookings];

        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthYear = lastMonthDate.getFullYear();
        const lastMonth = lastMonthDate.getMonth();

        let totalIncome = 0;
        let currentMonthIncome = 0;
        let lastMonthIncome = 0;

        allBookings.forEach(booking => {
            const price = parseFloat(booking.total_price) || 0;
            const date = new Date(booking.created_at);
            const year = date.getFullYear();
            const month = date.getMonth();

            totalIncome += price;
            if (year === currentYear && month === currentMonth) currentMonthIncome += price;
            if (year === lastMonthYear && month === lastMonth) lastMonthIncome += price;
        });

        let monthlyChange = 0;
        if (lastMonthIncome === 0) {
            monthlyChange = currentMonthIncome > 0 ? 100 : 0;
        } else {
            monthlyChange = ((currentMonthIncome - lastMonthIncome) / lastMonthIncome) * 100;
        }

        res.status(200).json({
            totalIncome,
            monthlyIncome: currentMonthIncome,
            monthlyChange: monthlyChange.toFixed(1)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Check room availability
const checkRoomAvailability = async (req, res) => {
    const { room_id, check_in, check_out } = req.query;

    if (!room_id || !check_in || !check_out) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    try {
        const { data: existingBookings, error } = await supabase
            .from('room_bookings')
            .select('id')
            .eq('room_id', room_id)
            .eq('status', 'Confirmed')
            .or(`and(check_in.lte.${check_in},check_out.gt.${check_in}),and(check_in.lt.${check_out},check_out.gte.${check_out}),and(check_in.gte.${check_in},check_out.lte.${check_out})`);

        if (error) throw error;
        res.status(200).json({ available: existingBookings.length === 0 });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Cancel Room Booking
const cancelRoomBooking = async (req, res) => {
    const { id } = req.params;

    try {
        const { data: booking, error: fetchError } = await supabase
            .from('room_bookings')
            .select('check_in')
            .eq('id', id)
            .single();

        if (fetchError) throw fetchError;

        const checkInDate = new Date(booking.check_in);
        const now = new Date();
        const diffHours = (checkInDate - now) / (1000 * 60 * 60);

        if (diffHours < 48) {
            return res.status(400).json({ error: 'Cancellation allowed up to 48h before check-in.' });
        }

        // Update Payment Status to Refunded
        await supabase
            .from('payments')
            .update({ payment_status: 'Refunded' })
            .eq('room_booking_id', id);

        const { data, error } = await supabase
            .from('room_bookings')
            .update({ status: 'Cancelled' })
            .eq('id', id)
            .select();

        if (error) throw error;
        res.status(200).json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete Room Booking
const deleteRoomBooking = async (req, res) => {
    const { id } = req.params;
    try {
        // 1. Update Payment Status to Refunded
        await supabase
            .from('payments')
            .update({ payment_status: 'Refunded' })
            .eq('room_booking_id', id);

        // 2. Update Booking Status to Cancelled instead of deleting
        const { data, error } = await supabase
            .from('room_bookings')
            .update({ status: 'Cancelled' })
            .eq('id', id)
            .select();

        if (error) throw error;
        res.status(200).json({ message: 'Booking cancelled successfully', data: data[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getUserRoomBookings,
    createRoomBooking,
    getAllRoomBookings,
    getRoomBookingStats,
    checkRoomAvailability,
    cancelRoomBooking,
    deleteRoomBooking
};
