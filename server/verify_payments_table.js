const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ SUPABASE_URL or SUPABASE_ANON_KEY missing in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyPaymentsTable() {
    console.log("Verifying 'payments' table...");
    try {
        const { data, error } = await supabase
            .from('payments')
            .select('*')
            .limit(1);

        if (error) {
            console.error("❌ Error accessing 'payments' table:", error.message);
        } else {
            console.log("✅ 'payments' table exists.");
            if (data && data.length > 0) {
                console.log("Columns found:", Object.keys(data[0]));
            } else {
                console.log("Table is empty. Checking columns via dummy select...");
                const { error: colError } = await supabase.from('payments').select('id, amount, payment_method, room_booking_id, event_booking_id, facility_booking_id').limit(0);
                if (colError) {
                    console.error("❌ Column verification failed:", colError.message);
                } else {
                    console.log("✅ Columns verified: amount, payment_method, room_booking_id, event_booking_id, facility_booking_id");
                }
            }
        }
    } catch (err) {
        console.error("Unexpected error:", err.message);
    }
}

verifyPaymentsTable();
