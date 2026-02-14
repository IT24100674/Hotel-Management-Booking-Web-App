const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../client/.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
    console.log('--- Inspecting hall_bookings ---');

    // 1. Try to fetch all columns
    const { data: bookings, error } = await supabase
        .from('hall_bookings')
        .select('*');

    if (error) {
        console.error('Error fetching hall_bookings:', error);
    } else {
        console.log(`Found ${bookings.length} hall bookings.`);
        if (bookings.length > 0) {
            console.log('Sample booking:', bookings[0]);
        }
    }

    // 2. Try to fetch with relations (events)
    console.log('\n--- Testing Relation: events(title) ---');
    const { data: eventData, error: eventError } = await supabase
        .from('hall_bookings')
        .select('*, events(title)')
        .limit(1);

    if (eventError) {
        console.error('Relation events Error:', eventError.message);
    } else {
        console.log('Relation events Success!');
    }

    // 3. Try to fetch with relations (users)
    console.log('\n--- Testing Relation: users(name) ---');
    const { data: userData, error: userError } = await supabase
        .from('hall_bookings')
        .select('*, users(name)')
        .limit(1);

    if (userError) {
        console.error('Relation users Error:', userError.message);
    } else {
        console.log('Relation users Success!');
    }
}

inspect();
