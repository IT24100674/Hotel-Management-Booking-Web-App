const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '../client/.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUser() {
    const email = 'chathuralakshankg@gmail.com';
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email);

    fs.writeFileSync('user_check_result.json', JSON.stringify({ data, error }, null, 2));
}

checkUser();
