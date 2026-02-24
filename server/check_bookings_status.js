const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../client/.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStatus() {
    const { data, error } = await supabase.from('bookings').select('id, status, total_price');
    if (error) console.error(error);
    console.log('Bookings:', JSON.stringify(data, null, 2));
}

checkStatus();
