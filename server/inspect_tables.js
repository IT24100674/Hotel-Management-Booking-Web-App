const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
    console.log('Inspecting "menu" table...');
    const { data: menuData, error: menuError } = await supabase.from('menu').select('*').limit(1);
    if (menuError) console.log('Error querying "menu":', menuError.message);
    else console.log('Success querying "menu". Sample keys:', menuData.length ? Object.keys(menuData[0]) : 'Table empty');

    console.log('\nInspecting "menu_items" table...');
    const { data: itemsData, error: itemsError } = await supabase.from('menu_items').select('*').limit(1);
    if (itemsError) console.log('Error querying "menu_items":', itemsError.message);
    else console.log('Success querying "menu_items". Sample keys:', itemsData.length ? Object.keys(itemsData[0]) : 'Table empty');
}

inspect();
