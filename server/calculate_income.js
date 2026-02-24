const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../client/.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function calculateStats() {
    console.log('--- Income Report ---');

    // 1. Room Bookings
    const { data: rooms, error: roomErr } = await supabase
        .from('bookings')
        .select('total_price, created_at')
        .eq('status', 'Confirmed');

    if (roomErr) console.error('Room Error:', roomErr);

    // 2. Hall Bookings
    const { data: halls, error: hallErr } = await supabase
        .from('hall_bookings')
        .select('total_price, created_at, status')
        .eq('status', 'Confirmed');

    if (hallErr) console.error('Hall Error:', hallErr);

    console.log('Room dataset count:', rooms?.length);
    console.log('Hall dataset count:', halls?.length);

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const stats = {
        rooms: { total: 0, monthly: 0 },
        halls: { total: 0, monthly: 0 },
        combined: { total: 0, monthly: 0 }
    };

    if (rooms) {
        rooms.forEach(b => {
            const price = parseFloat(b.total_price) || 0;
            const date = new Date(b.created_at);
            stats.rooms.total += price;
            if (date.getFullYear() === currentYear && date.getMonth() === currentMonth) {
                stats.rooms.monthly += price;
            } else {
                console.log(`Room booking from ${b.created_at} skipped for monthly (Current: ${currentYear}-${currentMonth + 1})`);
            }
        });
    }

    if (halls) {
        halls.forEach(b => {
            const price = parseFloat(b.total_price) || 0;
            const date = new Date(b.created_at);
            stats.halls.total += price;
            if (date.getFullYear() === currentYear && date.getMonth() === currentMonth) {
                stats.halls.monthly += price;
            }
        });
    }

    stats.combined.total = stats.rooms.total + stats.halls.total;
    stats.combined.monthly = stats.rooms.monthly + stats.halls.monthly;

    console.log(JSON.stringify(stats, null, 2));
}

calculateStats();
