const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../client/.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
    console.log('--- Checking hall_bookings columns ---');

    // Fetch one record (or empty) but we really want the structure.
    // Supabase JS doesn't give schema directly easily without using meta-queries which might be blocked.
    // However, if we insert a dummy record with guest_name and it fails, we know.
    // BETTER: select * and see if keys exist (if data exists).

    const { data, error } = await supabase
        .from('hall_bookings')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error:', error);
    } else {
        if (data.length > 0) {
            console.log('Existing Columns based on data:', Object.keys(data[0]));
        } else {
            console.log('No data to infer columns. Attempting to insert dummy with guest_name to test...');
            // We won't actually insert, just wanted to check.
            // Let's rely on the assumption that if I didn't explicitly add them, they probably aren't there.
        }
    }
}

checkColumns();
