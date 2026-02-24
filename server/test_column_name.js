const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../client/.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkOldColumn() {
    console.log('--- Testing specifically for event_id in hall_bookings ---');

    const { data, error } = await supabase
        .from('hall_bookings')
        .select('event_id')
        .limit(1);

    if (error) {
        console.error('Column event_id also does not exist or table error:', error.message);
    } else {
        console.log('Column event_id EXISTS in hall_bookings!');
    }
}

checkOldColumn();
