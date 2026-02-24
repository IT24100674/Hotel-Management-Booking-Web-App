const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../client/.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testColumns() {
    console.log('--- Testing columns in hall_bookings ---');

    // Test each column individually to see what sticks
    const columns = [
        'hall_id', 'event_id',
        'customer_name', 'guest_name',
        'customer_email', 'guest_email',
        'customer_phone', 'guest_phone',
        'customer_id_no', 'guest_id_no'
    ];

    for (const col of columns) {
        const { error } = await supabase.from('hall_bookings').select(col).limit(1);
        if (error) {
            console.log(`Column ${col}: MISSING (${error.message})`);
        } else {
            console.log(`Column ${col}: EXISTS`);
        }
    }
}

testColumns();
