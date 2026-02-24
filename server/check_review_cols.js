const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkReviewsTable() {
    console.log('Checking specifically for "booking_id" and "hall_booking_id" in "reviews" table...');

    const { error: colError } = await supabase.from('reviews').select('booking_id').limit(1);
    if (colError) {
        console.log('❌ Column "booking_id" is MISSING:', colError.message);
    } else {
        console.log('✅ Column "booking_id" EXISTS!');
    }

    const { error: colError2 } = await supabase.from('reviews').select('hall_booking_id').limit(1);
    if (colError2) {
        console.log('❌ Column "hall_booking_id" is MISSING:', colError2.message);
    } else {
        console.log('✅ Column "hall_booking_id" EXISTS!');
    }
}

checkReviewsTable();
