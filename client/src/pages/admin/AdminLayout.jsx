import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import {
    LayoutDashboard,
    BedDouble,
    CalendarCheck,
    CalendarPlus,
    Package,
    Key,
    Users,
    Building2,
    UtensilsCrossed,
    MessageCircleQuestion,
    Star,
    Home,
    LogOut
} from 'lucide-react';

const AdminLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [userRole, setUserRole] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(true);

    const allMenuItems = [
        { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, roles: ['owner', 'staff_manager', 'event_manager', 'room_manager', 'facility_manager', 'restaurant_manager', 'content_manager', 'support_manager', 'manager', 'receptionist'] },
        { path: '/admin/room-bookings', label: 'Room Bookings', icon: CalendarPlus, roles: ['owner', 'receptionist', 'room_manager'] },
        { path: '/admin/hall-bookings', label: 'Event Bookings', icon: CalendarCheck, roles: ['owner', 'event_manager', 'receptionist'] },
        { path: '/admin/facility-bookings', label: 'Facility Bookings', icon: Key, roles: ['owner', 'facility_manager', 'receptionist'] },
        { path: '/admin/event-packages', label: 'Manage Packages', icon: Package, roles: ['owner', 'event_manager'] },
        { path: '/admin/rooms', label: 'Manage Rooms', icon: BedDouble, roles: ['owner', 'room_manager'] },
        { path: '/admin/facilities', label: 'Other Facilities', icon: Building2, roles: ['owner', 'facility_manager'] },
        { path: '/admin/staff', label: 'Staff', icon: Users, roles: ['owner', 'staff_manager'] },
        { path: '/admin/menu', label: 'Menu', icon: UtensilsCrossed, roles: ['owner', 'restaurant_manager', 'content_manager'] },
        { path: '/admin/faqs', label: 'Manage FAQs', icon: MessageCircleQuestion, roles: ['owner', 'content_manager', 'support_manager'] },
        { path: '/admin/reviews', label: 'Reviews', icon: Star, roles: ['owner', 'support_manager', 'manager', 'content_manager'] },
        { path: '/', label: 'Home', icon: Home, roles: ['owner', 'staff_manager', 'event_manager', 'room_manager', 'facility_manager', 'restaurant_manager', 'content_manager', 'support_manager', 'manager', 'receptionist'] },
    ];

    React.useEffect(() => {
        const hydrateSession = async () => {
            const storedUser = JSON.parse(localStorage.getItem('hotel_user') || '{}');

            if (storedUser && storedUser.role) {
                setUserRole(storedUser.role);
                setIsLoading(false);
                checkAccess(storedUser.role);
                return;
            }

            // Fallback: Check Supabase Session directly (for OAuth users)
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const { user } = session;
                let role = 'user';
                let name = user.email.split('@')[0];
                let id = user.id;

                // Check developer override first
                if (user.email.toLowerCase() === 'chathuralakshan123567@gmail.com' ||
                    user.email.toLowerCase() === 'chathuralakshan1234567@gmail.com') {
                    role = 'owner';
                } else {
                    // Check DB
                    try {
                        const { data: staffData } = await supabase
                            .from('staff')
                            .select('*')
                            .eq('email', user.email)
                            .single();

                        if (staffData) {
                            role = staffData.role;
                            name = staffData.name;
                            id = staffData.id;
                        }
                    } catch (err) {
                        console.error('Error fetching role for admin:', err);
                    }
                }

                // Hydrate storage
                const userSession = { email: user.email, role, name, id };
                localStorage.setItem('hotel_user', JSON.stringify(userSession));
                setUserRole(role);
                setIsLoading(false);
                checkAccess(role);
            } else {
                // No session at all
                navigate('/sign-in');
            }
        };

        hydrateSession();
    }, [navigate]);

    const checkAccess = (role) => {
        const currentPath = location.pathname;
        if (currentPath === '/admin') {
            const firstAllowed = allMenuItems.find(item => item.roles.includes(role));
            if (firstAllowed) navigate(firstAllowed.path);
        } else {
            const matchingItem = allMenuItems.find(item => currentPath.startsWith(item.path));
            if (matchingItem && !matchingItem.roles.includes(role)) {
                alert('Access Denied');
                const firstAllowed = allMenuItems.find(item => item.roles.includes(role));
                navigate(firstAllowed ? firstAllowed.path : '/');
            }
        }
    };

    if (isLoading) {
        return <div className="flex items-center justify-center h-screen">Loading Admin Panel...</div>;
    }

    const handleSignOut = () => {
        localStorage.removeItem('hotel_user');
        localStorage.removeItem('sb-access-token'); // Clear Supabase auth if any
        navigate('/');
    };



    const allowedMenuItems = allMenuItems.filter(item =>
        item.roles.includes(userRole)
    );

    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            {/* Sidebar - Modern Premium Style */}
            <div className="w-72 bg-slate-950 text-slate-300 flex flex-col shadow-2xl z-20 border-r border-slate-800">
                {/* Brand Header */}
                <div className="p-8 pb-6 border-b border-slate-800/80">
                    <h1 className="text-2xl font-playfair font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-600 tracking-wide drop-shadow-sm">
                        Golden Waves
                    </h1>
                    <div className="flex items-center gap-2 mt-3 bg-slate-900/50 py-1.5 px-3 rounded-md w-max border border-slate-800/50">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-medium">
                            {userRole.replace('_', ' ')}
                        </p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5 custom-scrollbar">
                    {allowedMenuItems.map((item) => {
                        const isActive = item.path === '/admin' || item.path === '/'
                            ? location.pathname === item.path
                            : location.pathname.startsWith(item.path);

                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 ease-out ${isActive
                                    ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-[0_4px_20px_-4px_rgba(251,191,36,0.3)] scale-[1.02]'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:scale-[1.01]'
                                    }`}
                            >
                                <div className={`mr-3 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                                    <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                                </div>
                                <span className="flex-1 tracking-wide">{item.label}</span>
                                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-slate-950 ml-2 shadow-sm"></div>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer / Sign Out */}
                <div className="p-5 border-t border-slate-800/80 bg-slate-900/30">
                    <button
                        onClick={handleSignOut}
                        className="w-full group flex items-center justify-between px-4 py-3.5 text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-300 border border-transparent hover:border-red-500/20"
                    >
                        <div className="flex items-center gap-3">
                            <LogOut size={18} className="group-hover:rotate-12 transition-transform duration-300" />
                            <span className="tracking-wide">Sign Out</span>
                        </div>
                    </button>
                    <div className="flex justify-between items-center mt-5 px-1">
                        <p className="text-[10px] text-slate-500 font-mono tracking-wider">v1.2.0</p>
                        <div className="flex items-center gap-1.5">
                            <svg className="w-3 h-3 text-slate-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path></svg>
                            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Secure</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

                {/* Scrollable Content */}
                <main className="flex-1 overflow-y-auto p-8 relative z-10">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
