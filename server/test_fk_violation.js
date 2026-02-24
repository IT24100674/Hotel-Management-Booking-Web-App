const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../client/.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
    const email = 'chathuralakshankg@gmail.com';

    // 1. Get User
    const { data: users } = await supabase.from('users').select('id').eq('email', email);
    if (!users || users.length === 0) {
        console.log('User not found');
        return;
    }
    const userId = users[0].id;
    console.log('Testing with User ID:', userId);

    // 2. Get a valid Hall
    const { data: halls } = await supabase.from('events').select('id').limit(1);
    if (!halls || halls.length === 0) {
        console.log('No halls found');
        return;
    }
    const hallId = halls[0].id;
    console.log('Testing with Hall ID:', hallId);

    // 3. Try Insert
    const payload = {
        hall_id: hallId,
        user_id: userId,
        booking_date: '2026-03-01',
        session_type: 'Morning',
        status: 'Confirmed',
        total_price: 100,
        guest_count: 10,
        customer_name: 'Test',
        customer_email: email
    };

    console.log('Attempting insert...');
    const { data, error } = await supabase.from('hall_bookings').insert([payload]).select();

    if (error) {
        console.error('Insert Error:', error);
    } else {
        console.log('Insert Success:', data);
    }
}

testInsert();
