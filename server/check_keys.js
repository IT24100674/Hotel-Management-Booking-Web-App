require('dotenv').config();

console.log('Checking keys...');
if (process.env.SUPABASE_URL) console.log('SUPABASE_URL found');
else console.log('SUPABASE_URL MISSING');

if (process.env.SUPABASE_ANON_KEY) console.log('SUPABASE_ANON_KEY found');
else console.log('SUPABASE_ANON_KEY MISSING');

if (process.env.SUPABASE_SERVICE_KEY) console.log('SUPABASE_SERVICE_KEY found');
else console.log('SUPABASE_SERVICE_KEY MISSING');
