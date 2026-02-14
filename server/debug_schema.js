const supabase = require('./config/supabaseClient');

async function inspectSchema() {
    console.log("Inspecting 'staff' table columns...");
    try {
        // Method 1: Get one row and print keys (done before, trying explicitly)
        const { data: rows, error: rowError } = await supabase
            .from('staff')
            .select('*')
            .limit(1);

        if (rows && rows.length > 0) {
            console.log("First row keys:", Object.keys(rows[0]));
        } else {
            console.log("Table is empty or no data returned.");
        }

        // Method 2: Attempt to insert a dummy row to see valid columns error? 
        // No, dangerous.

        // Method 3: Just assume keys from Method 1 are the source of truth.
        // If 'id' is missing from keys, it's missing.

    } catch (err) {
        console.error("Unexpected Error:", err);
    }
}

inspectSchema();
