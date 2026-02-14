const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './server/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createEventBucket() {
    const bucketName = 'event_images';
    console.log(`Attempting to create bucket: '${bucketName}'...`);

    try {
        // 1. Try to create the bucket
        const { data, error } = await supabase.storage.createBucket(bucketName, {
            public: true,
            fileSizeLimit: 5242880, // 5MB
            allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
        });

        if (error) {
            console.error('Error creating bucket:', error.message);

            // 2. If it exists, update it to be public
            if (error.message.includes('already exists') || error.error === 'Duplicate') {
                console.log('Bucket exists. Updating configuration...');
                const { error: updateError } = await supabase.storage.updateBucket(bucketName, {
                    public: true,
                    fileSizeLimit: 5242880,
                    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
                });

                if (updateError) {
                    console.error('Error updating bucket:', updateError.message);
                } else {
                    console.log('Bucket updated successfully.');
                }
            }
        } else {
            console.log('Bucket created successfully:', data);
        }

        // 3. List buckets to verify
        const { data: buckets, error: listError } = await supabase.storage.listBuckets();
        if (listError) {
            console.error('Error listing buckets:', listError);
        } else {
            const exists = buckets.find(b => b.name === bucketName);
            if (exists) {
                console.log(`Verified: Bucket '${bucketName}' is present.`);
                console.log('Configuration:', exists);
            } else {
                console.error(`Warning: Bucket '${bucketName}' was not found in list after creation.`);
            }
        }

    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

createEventBucket();
