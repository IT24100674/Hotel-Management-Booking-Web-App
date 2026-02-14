const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPrices() {
    console.log('Checking prices for featured items...');
    const { data: items, error } = await supabase
        .from('menu')
        .select('*')
        .eq('is_featured', true)
        .limit(3);

    if (error) console.log('Error:', error.message);
    else {
        console.log(`Found ${items.length} featured items.`);
        items.forEach(item => {
            console.log(`Item: ${item.name}, Price: ${item.price}, Available: ${item.is_available}, Featured: ${item.is_featured}`);
        });
    }
}

checkPrices();
