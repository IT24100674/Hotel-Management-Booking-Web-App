const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRLS() {
    console.log("Checking RLS policies for 'payments'...");
    try {
        // Query pg_policies via RPC or raw query if possible, but usually we can't do raw SQL via anon key easily unless there's a function.
        // Instead, let's try to test various types of inserts to see which policy is failing.

        console.log("Testing anonymous INSERT into 'payments'...");
        const { data, error } = await supabase
            .from('payments')
            .insert([{
                amount: 100,
                payment_method: 'Cash',
                transaction_id: 'DIAG-' + Math.random().toString(36).substr(2, 9).toUpperCase()
            }]);

        if (error) {
            console.error("❌ INSERT failed:", error.message);
            if (error.message.includes("row-level security policy")) {
                console.log("👉 CONFIRMED: RLS policy violation.");
            }
        } else {
            console.log("✅ INSERT succeeded. RLS seems fine for this case.");
        }
    } catch (err) {
        console.error("Unexpected error:", err.message);
    }
}

checkRLS();
