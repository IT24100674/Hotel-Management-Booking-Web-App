const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../client/.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectColumns() {
    console.log('--- Inspecting ALL columns in hall_bookings ---');
    // We try to fetch with a filter that returns no data but gives us headers if possible
    // Or just fetch everything and look at keys if data exists
    const { data, error } = await supabase.from('hall_bookings').select('*').limit(1);

    if (error) {
        console.error('Error:', error.message);
    } else if (data && data.length > 0) {
        console.log('Columns found:', Object.keys(data[0]));
    } else {
        // If table is empty, we can try to "force" an error to see column list or use another trick
        // Actually, let's try to fetch a specifically known column that should fail if renamed
        const { error: err2 } = await supabase.from('hall_bookings').select('event_id').limit(1);
        if (err2) console.log('event_id missing:', err2.message);
        else console.log('event_id exists');

        const { error: err3 } = await supabase.from('hall_bookings').select('hall_id').limit(1);
        if (err3) console.log('hall_id missing:', err3.message);
        else console.log('hall_id exists');
    }
}

inspectColumns();
