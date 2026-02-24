const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../client/.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUser() {
    const email = 'chathuralakshankg@gmail.com';
    console.log(`Checking if user exists: ${email}`);

    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email);

    if (error) {
        console.error('Error:', error.message);
    } else {
        console.log('User data:', data);
    }
}

checkUser();
