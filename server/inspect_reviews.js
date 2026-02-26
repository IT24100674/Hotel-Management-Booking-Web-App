const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function inspectReviewsTable() {
    // We can execute a raw SQL query via rpc if available, or just fetch a row and look at keys
    const { data, error } = await supabase.from('reviews').select('*').limit(1);
    console.log("Reviews table columns based on select '*'");
    if (data && data.length > 0) {
        console.log(Object.keys(data[0]));
    } else {
        console.log("No data, inserting a dummy row to test columns...");
        // Try to insert a dummy row to see what columns error out or succeed
        const { error: insertErr } = await supabase.from('reviews').insert([{ user_name: 'test', rating: 5, comment: 'test' }]);
        console.log("Insert Error:", insertErr);
    }
}

inspectReviewsTable();
