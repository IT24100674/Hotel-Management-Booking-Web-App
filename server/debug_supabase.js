const supabase = require('./config/supabaseClient');

async function testSupabase() {
    console.log("Testing Supabase connection...");
    try {
        const { data, error } = await supabase
            .from('staff')
            .select('*')
            .limit(1);

        if (error) {
            console.error("Supabase Error:", error);
        } else {
            console.log("Success! Data:", data);
        }
    } catch (err) {
        console.error("Unexpected Error:", err);
    }
}

testSupabase();
