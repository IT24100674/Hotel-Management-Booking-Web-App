const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../client/.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function listConstraints() {
    console.log('Listing constraints for hall_bookings...');

    // We can't query pg_catalog directly usually, but we can try to use a trick
    // if we have service key. But I only have anon key.

    // Wait, I can try to use a dummy insert that violates the FK and read the detail carefully.
    // I'll use a very long string to see if it gets truncated.

    const { error } = await supabase
        .from('hall_bookings')
        .insert([{
            hall_id: 'f2b98382-fb2c-4825-b6c8-a42778be28b7',
            user_id: '11111111-1111-1111-1111-111111111111',
            booking_date: '2030-12-31',
            session_type: 'Morning'
        }]);

    console.log('Error Details:', JSON.stringify(error, null, 2));
}

listConstraints();
