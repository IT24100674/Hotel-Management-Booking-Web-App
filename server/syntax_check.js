const handleCreateBooking = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
        let user_id = null;

        if (!formData.isGuest) {
            const { data: existingUser } = await supabase
                .from('users')
                .select('id')
                .eq('email', formData.guestEmail)
                .single();

            if (existingUser) {
                user_id = existingUser.id;
            } else {
                alert("User not found. Use 'Walk-in / Guest' option if they don't have an account.");
                setSubmitting(false);
                return;
            }
        }

        if (formData.bookingType === 'hall') {
            // --- HALL BOOKING ---
            const payload = {
                event_id: formData.hallId,
                booking_date: formData.bookingDate,
                session_type: formData.sessionType,
                status: 'Confirmed',
                total_price: formData.totalPrice,
                user_id: user_id
            };

            if (formData.isGuest) {
                payload.guest_name = formData.guestName;
                payload.guest_email = formData.guestEmail;
                payload.guest_phone = formData.guestPhone;
                payload.guest_id_no = formData.guestId;
            }

            const { error } = await supabase
                .from('hall_bookings')
                .insert([payload]);

            if (error) throw error;

        } else {
            // --- ROOM BOOKING ---
            let payload = {
                room_id: formData.roomId,
                check_in: formData.checkIn,
                check_out: formData.checkOut,
                total_price: formData.totalPrice,
                status: 'Confirmed'
            };

            if (formData.isGuest) {
                payload.guest_name = formData.guestName;
                payload.guest_email = formData.guestEmail;
                payload.guest_phone = formData.guestPhone;
                payload.guest_id_no = formData.guestId;
            } else {
                payload.user_id = user_id;
            }

            const res = await fetch('http://localhost:5000/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Booking failed');
            }
        }

        fetchData();
        setIsFormatModalOpen(false);
        setFormData({
            bookingType: 'room',
            guestName: '', guestEmail: '', guestPhone: '', guestId: '',
            roomId: '', hallId: '', checkIn: '', checkOut: '', bookingDate: '',
            totalPrice: 0, isGuest: false, sessionType: 'Morning'
        });

    } catch (error) {
        alert(error.message);
    } finally {
        setSubmitting(false);
    }
};
