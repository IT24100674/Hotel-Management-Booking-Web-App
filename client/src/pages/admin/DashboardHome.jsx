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
            // Fetch All Booking Types and Stats
            const [roomBookingsRes, eventBookingsRes, facilityBookingsRes] = await Promise.all([
                fetch('http://localhost:5000/api/room-bookings'),
                fetch('http://localhost:5000/api/event-bookings'),
                fetch('http://localhost:5000/api/facility-bookings')
            ]);

            let roomBookings = [];
            let eventBookings = [];
            let facilityBookings = [];

            if (roomBookingsRes.ok) roomBookings = await roomBookingsRes.json();
            if (eventBookingsRes.ok) eventBookings = await eventBookingsRes.json();
            if (facilityBookingsRes.ok) facilityBookings = await facilityBookingsRes.json();

            // Calculate Payment Stats Directly from Supabase
            const { data: allPayments } = await supabase
                .from('payments')
                .select('amount, created_at')
                .eq('payment_status', 'Paid');

            let totalIncome = 0;
            let currentMonthIncome = 0;
            let lastMonthIncome = 0;

            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();

            const lastMonthDate = currentMonth === 0 ? 11 : currentMonth - 1;
            const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

            if (allPayments) {
                allPayments.forEach(p => {
                    const amount = Number(p.amount || 0);
                    totalIncome += amount;

                    const date = new Date(p.created_at);
                    if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
                        currentMonthIncome += amount;
                    } else if (date.getMonth() === lastMonthDate && date.getFullYear() === lastMonthYear) {
                        lastMonthIncome += amount;
                    }
                });
            }

            let monthlyChange = 0;
            if (lastMonthIncome > 0) {
                monthlyChange = ((currentMonthIncome - lastMonthIncome) / lastMonthIncome) * 100;
            } else if (currentMonthIncome > 0) {
                monthlyChange = 100;
            }

            // Update State for Stats
            setStatsData({
                totalIncome: totalIncome,
                monthlyIncome: currentMonthIncome,
                monthlyChange: parseFloat(monthlyChange.toFixed(1))
            });

            // Normalize Room Transactions
            const normalizedRooms = (Array.isArray(roomBookings) ? roomBookings : []).map(b => ({
                ...b,
                type: 'room',
                serviceName: `Room ${b.rooms?.room_number} (${b.rooms?.type})`,
                sortDate: new Date(b.created_at)
            }));

            // Normalize Event Transactions
            const normalizedEvents = (Array.isArray(eventBookings) ? eventBookings : []).map(b => ({
                ...b,
                type: 'event',
                serviceName: b.events?.title || 'Event Package',
                sortDate: new Date(b.created_at)
            }));

            // Normalize Facility Transactions
            const normalizedFacilities = (Array.isArray(facilityBookings) ? facilityBookings : []).map(b => ({
                ...b,
                type: 'facility',
                serviceName: b.facilities?.name || 'Facility Service',
                sortDate: new Date(b.created_at)
            }));

            // Merge and Sort All
            const mergedTransactions = [...normalizedRooms, ...normalizedEvents, ...normalizedFacilities]
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
                                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${item.type === 'room' ? 'bg-indigo-50 text-indigo-700' :
                                                        item.type === 'event' ? 'bg-amber-50 text-amber-700' :
                                                            'bg-emerald-50 text-emerald-700'
                                                        }`}>
                                                        {item.type === 'room' ? 'Room' :
                                                            item.type === 'event' ? (item.events?.type || 'Event') :
                                                                'Facility'}
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
