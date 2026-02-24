const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '../client/.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function dumpData() {
    console.log('Fetching last 5 hall bookings...');
    const { data, error } = await supabase
        .from('hall_bookings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error('Error:', error.message);
    } else {
        fs.writeFileSync('hall_bookings_dump.json', JSON.stringify(data, null, 2));
        console.log('Data saved to hall_bookings_dump.json');
    }
}

dumpData();
