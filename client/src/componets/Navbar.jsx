import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { supabase } from "../supabaseClient";





const Navbar = () => {
    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Rooms', path: '/rooms' },
        { name: 'Venues', path: '/halls' },
        { name: 'Menu', path: '/menu' },
        { name: 'Reviews', path: '/' }, // TODO: Create Reviews page
        { name: 'Contact', path: '/' },
        { name: 'About', path: '/' },
    ];

    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [user, setUser] = useState(null);
    const location = useLocation()
    const navigate = useNavigate();

    const isHomePage = location.pathname === "/";

    useEffect(() => {
        const checkUser = () => {
            // 1. Check Supabase Session
            supabase.auth.getSession().then(({ data: { session } }) => {
                if (session?.user) {
                    setUser(session.user)
                } else {
                    // 2. Check Local Storage
                    const localUser = localStorage.getItem('hotel_user')
                    if (localUser) {
                        setUser(JSON.parse(localUser))
                    } else {
                        setUser(null)
                    }
                }
            })
        }

        checkUser()

        // Listen for Supabase Auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                setUser(session.user)
            } else {
                // Re-check local storage on sign out
                const localUser = localStorage.getItem('hotel_user')
                if (localUser) setUser(JSON.parse(localUser))
                else setUser(null)
            }
        })

        // Listen for local storage changes (custom login)
        const handleStorageChange = () => {
            checkUser()
        }
        window.addEventListener('storage', handleStorageChange)

        return () => {
            subscription.unsubscribe()
            window.removeEventListener('storage', handleStorageChange)
        }
    }, [])

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        localStorage.removeItem('hotel_user');
        setUser(null)
        window.dispatchEvent(new Event('storage')) // Notify other tabs/components
        navigate('/');
    }


    // Handle scroll
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener("scroll", handleScroll);
        handleScroll();

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);



    return (
        <nav className={`fixed top-0 left-0 w-full flex items-center justify-between px-6 md:px-12 lg:px-24 py-4 z-50 transition-all duration-300 ${isScrolled || !isHomePage ? "glass-nav shadow-sm" : "bg-transparent py-6"
            }`}>

            {/* Hotel name */}
            <Link
                to="/"
                className={`font-playfair text-2xl md:text-3xl font-bold tracking-tight transition-colors duration-300 ${isScrolled || !isHomePage ? "text-gray-900" : "text-white"
                    }`}
            >
                Golden Waves
            </Link>


            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
                {navLinks.map((link, i) => (
                    <Link
                        key={i}
                        to={link.path}
                        className={`group relative text-sm font-medium tracking-wide transition-colors duration-300 ${isScrolled || !isHomePage ? "text-gray-700 hover:text-secondary" : "text-white/90 hover:text-white"
                            }`}
                    >
                        {link.name}
                        <span className={`absolute -bottom-1 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${isScrolled || !isHomePage ? "bg-secondary" : "bg-white"
                            }`}></span>
                    </Link>
                ))}
            </div>

            {/* Desktop Right */}
            <div className="hidden md:flex items-center gap-6">
                <img
                    src={assets.searchIcon}
                    alt="search"
                    className={`h-6 w-6 cursor-pointer transition-colors duration-300 ${isScrolled || !isHomePage ? "invert-0 opacity-70 hover:opacity-100" : "invert opacity-90 hover:opacity-100"
                        }`}
                />

                {user ? (
                    <div className="flex items-center gap-4">
                        <Link to="/profile" className="flex items-center gap-2 group">
                            <div className="w-9 h-9 bg-secondary text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md group-hover:scale-105 transition-transform">
                                {user.email?.charAt(0).toUpperCase()}
                            </div>
                            <span className={`text-sm font-medium ${isScrolled || !isHomePage ? "text-gray-700" : "text-white"}`}>
                                Profile
                            </span>
                        </Link>

                        {(user.email === "chathuralakshan123567@gmail.com" || user.email === "chathuralakshan1234567@gmail.com" || (user.role && (user.role === 'owner' || user.role.includes('manager') || user.role === 'receptionist'))) && (
                            <Link to="/admin" className={`px-4 py-2 text-sm font-medium rounded-full border transition-all ${isScrolled || !isHomePage
                                ? "border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white"
                                : "border-white text-white hover:bg-white hover:text-gray-900"
                                }`}>
                                Dashboard
                            </Link>
                        )}
                        <button
                            onClick={handleSignOut}
                            className={`text-sm font-medium transition-colors ${isScrolled || !isHomePage ? "text-gray-500 hover:text-red-500" : "text-white/80 hover:text-white"
                                }`}
                        >
                            Log Out
                        </button>
                    </div>
                ) : (
                    <Link to="/sign-in" className={`px-6 py-2.5 text-sm font-medium rounded-full transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 ${isScrolled || !isHomePage
                        ? "bg-gray-900 text-white hover:bg-gray-800"
                        : "bg-white text-gray-900 hover:bg-gray-100"
                        }`}>
                        Sign In
                    </Link>
                )}

            </div>

            {/* Mobile Right: menu button */}
            <div className="flex items-center gap-4 md:hidden">
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="focus:outline-none">
                    <img
                        src={assets.menuIcon}
                        alt="menu"
                        className={`h-8 w-8 transition-all ${isScrolled || !isHomePage ? "" : "invert"}`}
                    />
                </button>
            </div>

            {/* Mobile Menu */}
            <div className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"}`} onClick={() => setIsMenuOpen(false)} />

            <div className={`fixed top-0 right-0 w-[80%] max-w-sm h-full bg-white shadow-2xl z-50 flex flex-col p-8 transform transition-transform duration-300 ease-in-out ${isMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
                <div className="flex justify-between items-center mb-10">
                    <span className="font-playfair text-2xl font-bold text-gray-900">Golden Waves</span>
                    <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition">
                        <img src={assets.closeIcon} alt="close" className="h-6 w-6 opacity-70" />
                    </button>
                </div>

                <div className="flex flex-col gap-6">
                    {navLinks.map((link, i) => (
                        <Link
                            key={i}
                            to={link.path}
                            onClick={() => setIsMenuOpen(false)}
                            className="text-lg font-medium text-gray-800 hover:text-secondary transition-colors border-b border-gray-100 pb-2"
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                <div className="mt-auto flex flex-col gap-4">
                    {user ? (
                        <>
                            <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                                <div className="w-10 h-10 bg-secondary text-white rounded-full flex items-center justify-center font-bold">
                                    {user.email?.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-gray-900">My Profile</span>
                                    <span className="text-xs text-gray-500 truncate max-w-[150px]">{user.email}</span>
                                </div>
                            </div>

                            <Link
                                to="/profile"
                                onClick={() => setIsMenuOpen(false)}
                                className="btn-outline w-full justify-center"
                            >
                                View Profile
                            </Link>

                            {(user.email === "chathuralakshan123567@gmail.com" || user.email === "chathuralakshan1234567@gmail.com" || (user.role && (user.role === 'owner' || user.role.includes('manager') || user.role === 'receptionist'))) && (
                                <Link
                                    to="/admin"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="btn-secondary w-full justify-center"
                                >
                                    Admin Dashboard
                                </Link>
                            )}

                            <button
                                onClick={() => { handleSignOut(); setIsMenuOpen(false); }}
                                className="w-full py-3 text-red-500 font-medium hover:bg-red-50 rounded-lg transition"
                            >
                                Sign Out
                            </button>
                        </>
                    ) : (
                        <Link
                            to="/sign-in"
                            onClick={() => setIsMenuOpen(false)}
                            className="btn-primary w-full justify-center shadow-lg"
                        >
                            Sign In / Register
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar