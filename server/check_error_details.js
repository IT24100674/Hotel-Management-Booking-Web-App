const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../client/.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkFK() {
    // We'll try to use a trick: provoke the error again but with a VERY specific value
    // and see the FULL error object.

    console.log('Provoking FK error to see details...');
    const { error } = await supabase
        .from('hall_bookings')
        .insert([{
            hall_id: 'f2b98382-fb2c-4825-b6c8-a42778be28b7',
            user_id: '00000000-0000-0000-0000-000000000000',
            booking_date: '2030-01-01',
            session_type: 'Morning'
        }]);

    if (error) {
        console.log('Full Error Object:', JSON.stringify(error, null, 2));
    } else {
        console.log('No error? Check if user_id was ignored or if RLS is on.');
    }
}

checkFK();
