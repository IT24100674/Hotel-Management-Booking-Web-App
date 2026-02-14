import React, { useEffect, useState } from 'react';
import { Users, Calendar, DollarSign, BedDouble, Loader } from 'lucide-react';
import { supabase } from '../../supabaseClient';

const DashboardHome = () => {
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [statsData, setStatsData] = useState({
        totalIncome: 0,
        monthlyIncome: 0,
        monthlyChange: 0
    });
    const [loading, setLoading] = useState(true);

    const stats = [
        {
            title: 'Total Income',
            value: `$${statsData.totalIncome.toLocaleString()}`,
            change: `${statsData.monthlyChange > 0 ? '+' : ''}${statsData.monthlyChange}%`,
            icon: DollarSign,
            color: 'text-amber-500',
            bg: 'bg-amber-500/10'
        },
        {
            title: 'Monthly Income',
            value: `$${statsData.monthlyIncome.toLocaleString()}`,
            change: `${statsData.monthlyChange > 0 ? '+' : ''}${statsData.monthlyChange}%`,
            icon: Calendar,
            color: 'text-green-500',
            bg: 'bg-green-500/10'
        },
    ];

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Fetch Room Bookings and Stats first
            const [transactionsRes, statsRes] = await Promise.all([
                fetch('http://localhost:5000/api/bookings'),
                fetch('http://localhost:5000/api/bookings/stats')
            ]);

            // Fetch Hall Bookings separately to avoid crashing if it fails
            let hallBookings = [];
            try {
                const { data, error } = await supabase
                    .from('hall_bookings')
                    .select('*, events(title)')
                    .order('booking_date', { ascending: false });

                if (error) {
                    console.error("Error fetching hall bookings:", error);
                } else {
                    hallBookings = data || [];
                }
            } catch (hallErr) {
                console.error("Supabase fetch error:", hallErr);
            }

            let mergedTransactions = [];
            let totalIncomeWithHalls = 0;
            let monthlyIncomeWithHalls = 0;
            let roomBookings = [];
            let roomStats = { totalIncome: 0, monthlyIncome: 0, monthlyChange: 0 };

            if (transactionsRes.ok) {
                roomBookings = await transactionsRes.json();
            }
            if (statsRes.ok) {
                roomStats = await statsRes.json();
            }

            // Calculate Hall Stats
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();

            const hallIncome = hallBookings
                .filter(b => b.status === 'Confirmed')
                .reduce((sum, b) => sum + Number(b.total_price), 0);

            const monthlyHallIncome = hallBookings
                .filter(b => b.status === 'Confirmed')
                .filter(b => {
                    const d = new Date(b.booking_date);
                    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
                })
                .reduce((sum, b) => sum + Number(b.total_price), 0);

            // Merge Stats
            totalIncomeWithHalls = Number(roomStats.totalIncome) + hallIncome;
            monthlyIncomeWithHalls = Number(roomStats.monthlyIncome) + monthlyHallIncome;

            // Update State for Stats
            setStatsData({
                totalIncome: totalIncomeWithHalls,
                monthlyIncome: monthlyIncomeWithHalls,
                monthlyChange: roomStats.monthlyChange
            });

            // Merge Transactions
            const normalizedRooms = (Array.isArray(roomBookings) ? roomBookings : []).map(b => ({
                ...b,
                type: 'room',
                serviceName: `Room ${b.rooms?.room_number} (${b.rooms?.type})`,
                sortDate: new Date(b.created_at)
            }));

            const normalizedHalls = hallBookings.map(b => ({
                ...b,
                type: 'hall',
                serviceName: b.events?.title || 'Function Hall',
                sortDate: new Date(b.created_at)
            }));

            mergedTransactions = [...normalizedRooms, ...normalizedHalls]
                .sort((a, b) => b.sortDate - a.sortDate)
                .slice(0, 10);

            setRecentTransactions(mergedTransactions);

        } catch (err) {
            console.error("Failed to fetch dashboard data", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-playfair font-bold text-gray-900">Dashboard Overview</h1>
                <p className="text-gray-500 mt-2 font-medium">Welcome back, here's what's happening at Golden Waves.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                                <h3 className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</h3>
                            </div>
                            <div className={`p-3 rounded-xl ${stat.bg}`}>
                                <stat.icon size={24} className={stat.color} />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm">
                            <span className={stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}>
                                {stat.change}
                            </span>
                            <span className="text-gray-400 ml-2">vs last month</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Content Grid */}
            <div className="w-full">
                {/* Recent Transactions */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-900 font-playfair">Recent Transactions</h3>
                        <button className="text-amber-600 hover:text-amber-700 text-sm font-medium">View All</button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader className="animate-spin text-amber-500" />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                                        <th className="pb-3 pl-2">Guest</th>
                                        <th className="pb-3">Type</th>
                                        <th className="pb-3">Service/Item</th>
                                        <th className="pb-3">Date</th>
                                        <th className="pb-3">Status</th>
                                        <th className="pb-3 text-right pr-2">Price</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {recentTransactions.length > 0 ? (
                                        recentTransactions.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="py-4 pl-2">
                                                    <div className="font-medium text-gray-900">
                                                        {item.users?.name || item.users?.email || item.guest_name || item.customer_name || 'Unknown Guest'}
                                                    </div>
                                                </td>
                                                <td className="py-4 text-gray-600">
                                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${item.type === 'room' ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-50 text-amber-700'
                                                        }`}>
                                                        {item.type === 'room' ? 'Room' : 'Hall'}
                                                    </span>
                                                </td>
                                                <td className="py-4 text-gray-600 font-medium">
                                                    {item.serviceName}
                                                </td>
                                                <td className="py-4 text-gray-500">{new Date(item.created_at).toLocaleDateString()}</td>
                                                <td className="py-4">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${item.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                                                        item.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                                            'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 text-right font-medium text-gray-900 pr-2">${item.total_price}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="text-center py-8 text-gray-500">No recent transactions found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
