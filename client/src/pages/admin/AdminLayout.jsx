import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

const AdminLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [userRole, setUserRole] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(true);

    const allMenuItems = [
        { path: '/admin', label: 'Dashboard', roles: ['owner', 'staff_manager', 'event_manager', 'room_manager', 'facility_manager', 'restaurant_manager', 'content_manager', 'support_manager', 'manager', 'receptionist'] },
        { path: '/admin/bookings', label: 'Bookings', roles: ['owner', 'receptionist', 'room_manager'] },
        { path: '/admin/halls', label: 'Halls', roles: ['owner', 'event_manager'] },
        { path: '/admin/rooms', label: 'Rooms', roles: ['owner', 'room_manager'] },
        { path: '/admin/staff', label: 'Staff', roles: ['owner', 'staff_manager'] },
        { path: '/admin/facilities', label: 'Facilities', roles: ['owner', 'facility_manager'] },
        { path: '/admin/menu', label: 'Menu', roles: ['owner', 'restaurant_manager', 'content_manager'] },
        { path: '/admin/reviews', label: 'Reviews', roles: ['owner', 'support_manager', 'manager', 'content_manager'] },
        { path: '/', label: 'Home', roles: ['owner', 'support_manager', 'manager', 'content_manager', 'receptionist'] },
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
            {/* Sidebar - Modern Luxury Style */}
            <div className="w-72 bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col shadow-2xl z-20">
                {/* Brand Header */}
                <div className="p-8 border-b border-gray-700/50">
                    <h1 className="text-2xl font-playfair font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">
                        Golden Waves
                    </h1>
                    <div className="flex items-center gap-2 mt-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">
                            {userRole.replace('_', ' ')} Panel
                        </p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
                    {allowedMenuItems.map((item) => {
                        const isActive = item.path === '/admin' || item.path === '/'
                            ? location.pathname === item.path
                            : location.pathname.startsWith(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`group flex items-center px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-300 ${isActive
                                    ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-lg shadow-amber-900/20 translate-x-1'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50 hover:translate-x-1'
                                    }`}
                            >
                                <span className="flex-1">{item.label}</span>
                                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white ml-2"></div>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer / Sign Out */}
                <div className="p-4 border-t border-gray-700/50 bg-gray-900/50">
                    <button
                        onClick={handleSignOut}
                        className="w-full group flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-300"
                    >
                        <span>Sign Out</span>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </button>
                    <p className="text-xs text-center text-gray-600 mt-4 font-mono">v1.2.0 • Secure</p>
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
