const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '../client/.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function fullAudit() {
    console.log('--- Comprehensive Financial Audit ---');

    const [roomsRes, hallsRes] = await Promise.all([
        supabase.from('bookings').select('*'),
        supabase.from('hall_bookings').select('*')
    ]);

    const audit = {
        now: new Date().toISOString(),
        currentMonth: new Date().getMonth() + 1,
        currentYear: new Date().getFullYear(),
        rooms: {
            all: roomsRes.data || [],
            confirmed: (roomsRes.data || []).filter(b => b.status === 'Confirmed'),
            totalConfirmedIncome: 0
        },
        halls: {
            all: hallsRes.data || [],
            confirmed: (hallsRes.data || []).filter(b => b.status === 'Confirmed'),
            totalConfirmedIncome: 0
        }
    };

    audit.rooms.totalConfirmedIncome = audit.rooms.confirmed.reduce((sum, b) => sum + Number(b.total_price), 0);
    audit.halls.totalConfirmedIncome = audit.halls.confirmed.reduce((sum, b) => sum + Number(b.total_price), 0);

    audit.summary = {
        totalConfirmed: audit.rooms.totalConfirmedIncome + audit.halls.totalConfirmedIncome,
        roomsCount: audit.rooms.confirmed.length,
        hallsCount: audit.halls.confirmed.length
    };

    fs.writeFileSync('financial_audit.json', JSON.stringify(audit, null, 2));
    console.log('Audit complete. Results in financial_audit.json');
}

fullAudit();
