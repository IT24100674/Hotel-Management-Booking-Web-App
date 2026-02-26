const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkEvents() {
    console.log('Querying events table...');
    const { data, error } = await supabase.from('events').select('*');
    if (error) {
        console.error('Error:', error.message);
    } else {
        console.log('Events found:', data.length);
        console.log(data);
    }

    console.log('Querying event_bookings table...');
    const { data: bookings, error: bError } = await supabase.from('event_bookings').select('*');
    if (bError) {
        console.error('Booking Error:', bError.message);
    } else {
        console.log('Bookings found:', bookings.length);
    }
}

checkEvents();
