const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkFeatured() {
    console.log('Checking featured items...');
    const { count, error } = await supabase
        .from('menu')
        .select('*', { count: 'exact', head: true })
        .eq('is_featured', true);

    if (error) console.log('Error:', error.message);
    else console.log('Number of featured items:', count);

    if (count === 0) {
        console.log('No featured items found. Setting the first 3 items as featured...');
        const { data: items } = await supabase.from('menu').select('id').limit(3);
        if (items && items.length > 0) {
            for (const item of items) {
                await supabase.from('menu').update({ is_featured: true }).eq('id', item.id);
            }
            console.log(`Updated ${items.length} items to be featured.`);
        } else {
            console.log('No items found in menu table to feature.');
        }
    }
}

checkFeatured();
