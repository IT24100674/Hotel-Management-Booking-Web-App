const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../client/.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectTotals() {
    console.log('--- Database Audit ---');

    const { data: rooms } = await supabase.from('bookings').select('*').eq('status', 'Confirmed');
    const { data: halls } = await supabase.from('hall_bookings').select('*').eq('status', 'Confirmed');

    const roomTotal = rooms?.reduce((sum, b) => sum + Number(b.total_price), 0) || 0;
    const hallTotal = halls?.reduce((sum, b) => sum + Number(b.total_price), 0) || 0;

    console.log(`Confirmed Room Bookings: ${rooms?.length || 0} (Total: $${roomTotal})`);
    if (rooms?.length > 0) console.log('Room IDs:', rooms.map(b => b.id));

    console.log(`Confirmed Hall Bookings: ${halls?.length || 0} (Total: $${hallTotal})`);
    if (halls?.length > 0) {
        halls.forEach(h => console.log(`- Hall ${h.id}: $${h.total_price} on ${h.booking_date}`));
    }
}

inspectTotals();
