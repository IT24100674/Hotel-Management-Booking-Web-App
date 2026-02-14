const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixBucket() {
    const bucketName = 'room_images';

    console.log(`Checking bucket: ${bucketName}...`);

    // 1. Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) {
        console.error('Error listing buckets:', listError);
        return;
    }

    const bucketExists = buckets.find(b => b.name === bucketName);

    if (!bucketExists) {
        console.log(`Bucket '${bucketName}' not found. Creating...`);
        const { data, error: createError } = await supabase.storage.createBucket(bucketName, {
            public: true,
            fileSizeLimit: 5242880, // 5MB
            allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
        });

        if (createError) {
            console.error('Error creating bucket:', createError);
            return;
        }
        console.log(`Bucket '${bucketName}' created successfully.`);
    } else {
        console.log(`Bucket '${bucketName}' already exists.`);

        // Update to ensure it is public
        const { error: updateError } = await supabase.storage.updateBucket(bucketName, {
            public: true
        });
        if (updateError) {
            console.error('Error updating bucket to public:', updateError);
        } else {
            console.log(`Bucket '${bucketName}' verified as public.`);
        }
    }

    // Note: Storage policies (RLS) cannot be fully managed via supabase-js client usually requires SQL or dashboard
    // But 'public: true' in createBucket usually allows public reads.
    // Writes might still be blocked if no policy exists.

    console.log('\nIMPORTANT: If upload still fails, you may need to add a Storage Policy in the Supabase Dashboard:');
    console.log('1. Go to Storage -> Policies');
    console.log(`2. Under '${bucketName}', click "New Policy"`);
    console.log('3. Choose "For full customization"');
    console.log('4. Policy Name: "Allow public uploads"');
    console.log('5. Allowed operations: INSERT, SELECT, UPDATE, DELETE');
    console.log('6. Target roles: check "anon" and "authenticated" (for simplicity in dev)');
    console.log('7. Review and Save');

}

fixBucket();
