const { createClient } = require('@supabase/supabase-client');
require('dotenv').config({ path: './server/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log("Checking hall_bookings schema...");
    const { data, error } = await supabase
        .from('hall_bookings')
        .select('*')
        .limit(1);

    if (error) {
        console.error("Error fetching table:", error.message);
        return;
    }

    if (data && data.length > 0) {
        console.log("Columns found in existing record:", Object.keys(data[0]));
    } else {
        console.log("No data in hall_bookings. Checking columns via RPC or fallback...");
        // Fallback: try to insert a dummy record and see which fields are rejected (dangerous)
        // Better: just check the events table too
        const { data: eventData } = await supabase.from('events').select('*').limit(1);
        if (eventData && eventData.length > 0) {
            console.log("Events columns:", Object.keys(eventData[0]));
        }
    }
}

checkSchema();
