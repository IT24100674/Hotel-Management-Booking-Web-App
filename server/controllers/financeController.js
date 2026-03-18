const supabase = require('../config/supabaseClient');

// Helper to get start and end dates based on report type
const getDateRange = (type) => {
    const end = new Date();
    const start = new Date();

    if (type === 'weekly') {
        start.setDate(end.getDate() - 7);
    } else if (type === 'monthly') {
        start.setMonth(end.getMonth() - 1);
    } else if (type === 'yearly') {
        start.setFullYear(end.getFullYear() - 1);
    }

    return {
        startDate: start.toISOString(),
        endDate: end.toISOString()
    };
};

const getReport = async (req, res) => {
    const { type } = req.params; // 'weekly', 'monthly', 'yearly'

    if (!['weekly', 'monthly', 'yearly'].includes(type)) {
        return res.status(400).json({ error: 'Invalid report type' });
    }

    try {
        const { startDate, endDate } = getDateRange(type);

        const { data, error } = await supabase
            .from('payments')
            .select('*')
            .eq('payment_status', 'Paid')
            .gte('created_at', startDate)
            .lte('created_at', endDate)
            .order('created_at', { ascending: true });

        if (error) throw error;

        // Group data based on type
        const groupedData = {};

        data.forEach(payment => {
            const dateStr = payment.created_at;
            const date = new Date(dateStr);
            let key = '';

            if (type === 'weekly' || type === 'monthly') {
                // Group by day (YYYY-MM-DD)
                key = date.toISOString().split('T')[0];
            } else if (type === 'yearly') {
                // Group by month (YYYY-MM)
                key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            }

            if (!groupedData[key]) {
                groupedData[key] = {
                    date: key,
                    totalRevenue: 0,
                    paymentCount: 0
                };
            }
            groupedData[key].totalRevenue += Number(payment.amount || 0);
            groupedData[key].paymentCount += 1;
        });

        // Convert grouped object to array
        const reportArray = Object.values(groupedData).sort((a, b) => a.date.localeCompare(b.date));

        // Calculate totals
        const totalRevenue = reportArray.reduce((sum, item) => sum + item.totalRevenue, 0);
        const totalPayments = reportArray.reduce((sum, item) => sum + item.paymentCount, 0);

        res.status(200).json({
            type,
            startDate,
            endDate,
            summary: {
                totalRevenue,
                totalPayments
            },
            data: reportArray,
            raw: data // Optional: returning raw data for comprehensive table views etc.
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getReport
};
