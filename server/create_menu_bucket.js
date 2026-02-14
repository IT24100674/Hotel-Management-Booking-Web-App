const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function createMenuBucket() {
    const bucketName = 'menu_images';
    console.log(`Attempting to create bucket: '${bucketName}'...`);

    try {
        const { data, error } = await supabase.storage.createBucket(bucketName, {
            public: true,
            fileSizeLimit: 5242880, // 5MB
            allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
        });

        if (error) {
            console.error('Error creating bucket:', error.message);
            // If error is "Bucket already exists", we try to update it to be public
            if (error.message && (error.message.includes('already exists') || error.error === 'Duplicate')) {
                console.log('Bucket exists. Ensuring it is public...');
                const { error: updateError } = await supabase.storage.updateBucket(bucketName, {
                    public: true
                });
                if (updateError) console.error('Update error:', updateError);
                else console.log('Bucket updated to public.');
            }
        } else {
            console.log('Bucket created successfully:', data);
        }

    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

createMenuBucket();
