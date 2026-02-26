const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function checkAllTables() {
    const tables = ['events', 'event_bookings', 'rooms', 'room_bookings', 'staff', 'facilities', 'facility_bookings', 'menu', 'reviews', 'payments', 'faqs', 'users'];

    for (const table of tables) {
        const { data, error, count } = await supabase.from(table).select('*', { count: 'exact', head: true });
        if (error) {
            console.log(`Table ${table}: ERROR - ${error.message}`);
        } else {
            console.log(`Table ${table}: ${count} rows`);
        }
    }
}

checkAllTables();
