const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load env from server directory
dotenv.config({ path: path.join(__dirname, 'server', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log('Checking columns for "reviews" table...');

    // Try to insert a dummy record (or just fetch one) to see column errors
    // Better way: query rpc or generic select
    const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error fetching reviews:', error);
    } else {
        if (data && data.length > 0) {
            console.log('Columns found in first row:', Object.keys(data[0]));
        } else {
            console.log('No data found in reviews table to inspect columns.');
            // Try to fetch column names via informational query if possible, or just attempt a column-specific select
            const { error: colError } = await supabase
                .from('reviews')
                .select('booking_id')
                .limit(1);

            if (colError) {
                console.log('Column "booking_id" check failed:', colError.message);
            } else {
                console.log('Column "booking_id" exists!');
            }
        }
    }
}

checkSchema();
