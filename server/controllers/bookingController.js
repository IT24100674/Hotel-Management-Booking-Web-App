const supabase = require('../config/supabaseClient');

// Get bookings for the logged-in user (or all if admin - logic depends on query)
// For this specific endpoint, we'll fetch by user_id
const getUserBookings = async (req, res) => {
    const { userId } = req.params;

    try {
        const { data, error } = await supabase
            .from('bookings')
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

// Create a new booking
const createBooking = async (req, res) => {
    const { user_id, room_id, check_in, check_out, total_price, guest_name, guest_email, guest_phone, guest_id_no } = req.body;

    // Basic validation
    // Guest MUST have a name AND an ID number.
    const hasGuestIdentity = guest_name && guest_id_no;

    if ((!user_id && !hasGuestIdentity) || !room_id || !check_in || !check_out || !total_price) {
        return res.status(400).json({ error: 'Missing required fields. Provide User ID or Guest Name & ID.' });
    }

    try {
        // 1. Check if room is available
        const { data: existingBookings, error: checkError } = await supabase
            .from('bookings')
            .select('check_in, check_out')
            .eq('room_id', room_id)
            .eq('status', 'Confirmed') // Only check confirmed bookings
            .or(`and(check_in.lte.${check_in},check_out.gt.${check_in}),and(check_in.lt.${check_out},check_out.gte.${check_out}),and(check_in.gte.${check_in},check_out.lte.${check_out})`);

        if (checkError) {
            console.error("Availability Check Error:", checkError);
            throw checkError;
        }

        if (existingBookings && existingBookings.length > 0) {
            return res.status(400).json({ error: 'Room is already booked for these dates' });
        }

        // 2. Insert booking
        const bookingData = {
            room_id,
            check_in,
            check_out,
            total_price,
            status: 'Confirmed' // Default to confirmed for manual bookings? Or Pending? Let's say Confirmed for now as it's admin creation.
        };

        if (user_id) {
            bookingData.user_id = user_id;
            // Also save guest_id_no if provided (e.g. from online booking form)
            if (guest_id_no) bookingData.guest_id_no = guest_id_no;
        } else {
            bookingData.guest_name = guest_name;
            bookingData.guest_email = guest_email;
            bookingData.guest_phone = guest_phone;
            bookingData.guest_id_no = guest_id_no;
        }

        const { data, error } = await supabase
            .from('bookings')
            .insert([bookingData])
            .select();

        if (error) throw error;

        res.status(201).json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all bookings (for Admin Dashboard)
const getAllBookings = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('bookings')
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

// Get booking statistics (Total Income, Monthly Income)
const getBookingStats = async (req, res) => {
    try {
        const { data: bookings, error } = await supabase
            .from('bookings')
            .select('total_price, created_at')
            .eq('status', 'Confirmed');

        if (error) throw error;

        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth(); // 0-indexed

        const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthYear = lastMonthDate.getFullYear();
        const lastMonth = lastMonthDate.getMonth();

        let totalIncome = 0;
        let currentMonthIncome = 0;
        let lastMonthIncome = 0;

        bookings.forEach(booking => {
            const price = parseFloat(booking.total_price) || 0;
            const date = new Date(booking.created_at);
            const year = date.getFullYear();
            const month = date.getMonth();

            // Total
            totalIncome += price;

            // Current Month
            if (year === currentYear && month === currentMonth) {
                currentMonthIncome += price;
            }

            // Last Month
            if (year === lastMonthYear && month === lastMonth) {
                lastMonthIncome += price;
            }
        });

        // Calculate Percentage Change for Monthly Income
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

// Check availability (Public/Helper)
const checkAvailability = async (req, res) => {
    const { room_id, check_in, check_out } = req.query;

    if (!room_id || !check_in || !check_out) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    try {
        const { data: existingBookings, error } = await supabase
            .from('bookings')
            .select('id')
            .eq('room_id', room_id)
            .eq('status', 'Confirmed')
            .or(`and(check_in.lte.${check_in},check_out.gt.${check_in}),and(check_in.lt.${check_out},check_out.gte.${check_out}),and(check_in.gte.${check_in},check_out.lte.${check_out})`);

        if (error) throw error;

        const isAvailable = existingBookings.length === 0;
        res.status(200).json({ available: isAvailable });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Cancel Booking (24h rule)
const cancelBooking = async (req, res) => {
    const { id } = req.params;

    try {
        // 1. Fetch booking to check date
        const { data: booking, error: fetchError } = await supabase
            .from('bookings')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError) throw fetchError;
        if (!booking) return res.status(404).json({ error: 'Booking not found' });

        // 2. Check time constraint (24h before check-in)
        const checkInDate = new Date(booking.check_in);
        const now = new Date();
        const diffMs = checkInDate - now;
        const diffHours = diffMs / (1000 * 60 * 60);

        if (diffHours < 24) {
            return res.status(400).json({ error: 'Cancellation is only allowed up to 24 hours before check-in.' });
        }

        // 3. Update status
        const { data, error } = await supabase
            .from('bookings')
            .update({ status: 'Cancelled' })
            .eq('id', id)
            .select();

        if (error) throw error;

        res.status(200).json(data[0]);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete Booking
const deleteBooking = async (req, res) => {
    const { id } = req.params;

    try {
        const { error } = await supabase
            .from('bookings')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.status(200).json({ message: 'Booking deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getUserBookings,
    createBooking,
    getAllBookings,
    getBookingStats,
    checkAvailability,
    cancelBooking,
    deleteBooking
};
