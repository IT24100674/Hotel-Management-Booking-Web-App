const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../client/.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectConstraints() {
    // We can't query information_schema directly with anon key usually, 
    // but we can try to see what's happening by testing valid/invalid inserts if we have permissions.
    // Better yet, let's try to fetch a single hall_booking and check its structure.

    console.log('Testing hall_bookings structure...');
    const { data, error } = await supabase
        .from('hall_bookings')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error fetching hall_bookings:', error.message);
    } else {
        console.log('Sample data:', data);
    }
}

inspectConstraints();
