const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../client/.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRooms() {
    const { data, error } = await supabase.from('bookings').select('*');
    if (error) console.error(error);
    console.log('Room Bookings Count:', data?.length || 0);
    console.log('Sample data:', JSON.stringify(data?.slice(0, 2), null, 2));
}

checkRooms();
