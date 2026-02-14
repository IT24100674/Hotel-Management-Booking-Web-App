const supabase = require('./config/supabaseClient');

async function checkUserRole() {
    const email = 'chathuralakshan123567@gmail.com';
    console.log(`Checking role for ${email}...`);
    try {
        const { data, error } = await supabase
            .from('staff')
            .select('*')
            .eq('email', email)
            .single();

        if (error) {
            console.error("Supabase Error:", error);
        } else {
            console.log("User Data:", data);
            console.log("Role:", data.role);
        }
    } catch (err) {
        console.error("Unexpected Error:", err);
    }
}

checkUserRole();
