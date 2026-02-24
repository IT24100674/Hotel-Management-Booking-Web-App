const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../client/.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function finalCheck() {
    console.log('--- Final Comprehensive Column Check ---');

    const tests = [
        'hall_id', 'event_id',
        'customer_name', 'guest_name',
        'customer_email', 'guest_email',
        'customer_phone', 'guest_phone',
        'customer_id_no', 'guest_id_no'
    ];

    const results = {};

    for (const col of tests) {
        try {
            const { error } = await supabase.from('hall_bookings').select(col).limit(1);
            if (error) {
                results[col] = `MISSING (${error.message})`;
            } else {
                results[col] = 'EXISTS';
            }
        } catch (e) {
            results[col] = `ERROR (${e.message})`;
        }
    }

    console.log(JSON.stringify(results, null, 2));
}

finalCheck();
