const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../client/.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectConstraints() {
    console.log('--- Inspecting Constraints for hall_bookings ---');

    // We cannot query information_schema directly with supabase-js easily unless we use rpc.
    // Instead we will try to make the exact fail query and catch the full error object.

    const { data, error } = await supabase
        .from('hall_bookings')
        .select('*, users(name, email, id_no), events(title)')
        .limit(1);

    if (error) {
        console.error('Full Error Object:', JSON.stringify(error, null, 2));
    } else {
        console.log('Query Successful!');
    }
}

inspectConstraints();
