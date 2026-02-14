const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBuckets() {
    console.log('Connecting to Supabase:', supabaseUrl);
    console.log('Listing all storage buckets...\n');

    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
        console.error('Error listing buckets:', error);
        return;
    }

    if (buckets && buckets.length > 0) {
        console.log('Found buckets:');
        buckets.forEach(b => {
            console.log(`- Name: "${b.name}" | Public: ${b.public} | ID: ${b.id}`);
        });
    } else {
        console.log('No buckets found! Please create one in the dashboard.');
    }
}

checkBuckets();
