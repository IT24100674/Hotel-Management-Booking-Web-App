const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../client/.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkFKTarget() {
    console.log('Querying information_schema for FK details...');

    // We'll use the rpc trick if we have a function, but usually we don't.
    // Instead, let's try to infer it by testing inserts to different tables.

    // Test 1: Does it reference public.users?
    // I'll pick an ID that is in public.users and see if it works.
    const testId = '1661f6d3-553d-46f7-b615-b3630b4060b8'; // chathura's ID

    console.log(`Testing insert into hall_bookings with user_id: ${testId}`);
    const { error } = await supabase
        .from('hall_bookings')
        .insert([{
            hall_id: 'f2b98382-fb2c-4825-b6c8-a42778be28b7',
            user_id: testId,
            booking_date: '2030-01-02',
            session_type: 'Morning'
        }]);

    if (error) {
        console.log('Error with known user_id:', JSON.stringify(error, null, 2));
    } else {
        console.log('SUCCESS with known user_id! This means the ID is valid.');
    }
}

checkFKTarget();
