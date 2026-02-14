const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env manually
const envPath = path.join(__dirname, '.env');
const env = fs.readFileSync(envPath, 'utf8');
const url = env.match(/VITE_SUPABASE_URL=(.*)/)[1].trim();
const key = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1].trim();

const supabase = createClient(url, key);

async function checkDuplicates() {
    const { data: bookings, error } = await supabase
        .from('hall_bookings')
        .select('id, event_id, booking_date, session_type, status');

    if (error) {
        console.error(error);
        return;
    }

    const seen = new Set();
    const duplicates = [];

    bookings.forEach(b => {
        const key = `${b.event_id}-${b.booking_date}-${b.session_type}`;
        if (seen.has(key) && b.status !== 'Cancelled') {
            duplicates.push(b);
        }
        if (b.status !== 'Cancelled') seen.add(key);
    });

    console.log('Total bookings:', bookings.length);
    console.log('Duplicates found:', duplicates.length);
    if (duplicates.length > 0) {
        console.log('Duplicate records:', JSON.stringify(duplicates, null, 2));
    }
}

checkDuplicates();
