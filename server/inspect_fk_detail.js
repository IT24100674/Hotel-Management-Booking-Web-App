const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../client/.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectFK() {
    // We can use a trick to see where it references by trying an insert and seeing the error message detail
    // or by querying pg_constraint if we have perm (though usually anon doesn't).

    console.log('Inspecting foreign key via test insert...');
    // Use a random UUID that definitely doesn't exist
    const randomId = '00000000-0000-0000-0000-000000000000';
    const { data: halls } = await supabase.from('events').select('id').limit(1);
    const hallId = halls[0].id;

    const { error } = await supabase.from('hall_bookings').insert([{
        hall_id: hallId,
        user_id: randomId,
        booking_date: '2026-03-01',
        session_type: 'Morning'
    }]);

    if (error) {
        console.log('Error info:', JSON.stringify(error, null, 2));
    } else {
        console.log('Insert unexpectedly succeeded (RLS might be blocking but it didn't error ?).');
    }
}

inspectFK();
