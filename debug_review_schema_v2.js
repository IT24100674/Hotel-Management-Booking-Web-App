const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Try to find Supabase credentials by searching common locations
function getSupabaseCreds() {
    const rootEnv = '.env';
    const serverEnv = 'server/.env';

    let envPath = fs.existsSync(rootEnv) ? rootEnv : (fs.existsSync(serverEnv) ? serverEnv : null);

    if (!envPath) return null;

    const content = fs.readFileSync(envPath, 'utf8');
    const urlMatch = content.match(/VITE_SUPABASE_URL=(.*)/) || content.match(/SUPABASE_URL=(.*)/);
    const keyMatch = content.match(/VITE_SUPABASE_ANON_KEY=(.*)/) || content.match(/SUPABASE_ANON_KEY=(.*)/);

    return {
        url: urlMatch ? urlMatch[1].trim() : null,
        key: keyMatch ? keyMatch[1].trim() : null
    };
}

const creds = getSupabaseCreds();
if (!creds || !creds.url || !creds.key) {
    console.error('Could not find Supabase credentials in .env or server/.env');
    process.exit(1);
}

const supabase = createClient(creds.url, creds.key);

async function checkReviewsTable() {
    console.log('Fetching reviews table definition (via sample select)...');
    const { data, error } = await supabase.from('reviews').select('*').limit(1);

    if (error) {
        console.error('Error fetching reviews:', error.message);
    } else {
        console.log('Sample row columns:', data.length > 0 ? Object.keys(data[0]) : 'Table is empty');

        // Explicitly check for booking_id
        console.log('Checking specifically for "booking_id"...');
        const { error: colError } = await supabase.from('reviews').select('booking_id').limit(1);
        if (colError) {
            console.log('❌ Column "booking_id" is MISSING:', colError.message);
        } else {
            console.log('✅ Column "booking_id" EXISTS!');
        }

        console.log('Checking specifically for "hall_booking_id"...');
        const { error: colError2 } = await supabase.from('reviews').select('hall_booking_id').limit(1);
        if (colError2) {
            console.log('❌ Column "hall_booking_id" is MISSING:', colError2.message);
        } else {
            console.log('✅ Column "hall_booking_id" EXISTS!');
        }
    }
}

checkReviewsTable();
