import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { supabase } from "../supabaseClient";





const Navbar = () => {
    const navLinks = [
        { name: 'Home', path: '/' },
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
        <nav className={`fixed top-0 left-0 w-full flex items-center justify-between px-4 md:px-16 lg:px-24 xl:px-32 transition-all duration-500 z-50 ${isHomePage
            ? (isScrolled ? "bg-white shadow-md text-gray-800 py-3 md:py-4" : "bg-black/25 text-white backdrop-blur-sm py-4 md:py-6")
            : "bg-white shadow-md text-gray-800 py-3 md:py-4"
            }`}>

            {/* Hotel name */}
            <Link
                to="/"
                className={`font-playfair text-xl md:text-2xl lg:text-3xl font-bold tracking-tight ${isHomePage ? (isScrolled ? "text-amber-600" : "text-amber-400") : "text-amber-600"
                    }`}
            >
                Golden Waves Hotel
            </Link>


            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-4 lg:gap-8">
                {navLinks.map((link, i) => (
                    <a
                        key={i}
                        href={link.path}
                        className={`group flex flex-col gap-0.5 ${isHomePage ? (isScrolled ? "text-gray-700" : "text-white") : "text-gray-700"
                            }`}
                    >
                        {link.name}
                        <div
                            className={`${isHomePage ? (isScrolled ? "bg-gray-700" : "bg-white") : "bg-gray-700"
                                } h-0.5 w-0 group-hover:w-full transition-all duration-300`}
                        />
                    </a>
                ))}
            </div>

            {/* Desktop Right */}
            <div className="hidden md:flex items-center gap-4">
                <img
                    src={assets.searchIcon}
                    alt="search"
                    className={`h-7 transition-all duration-500 ${isHomePage ? (isScrolled ? 'invert' : '') : 'invert'
                        }`}
                />

                {user ? (
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold">
                            {user.email?.charAt(0).toUpperCase()}
                        </div>
                        <Link to="/profile" className="px-4 py-1.5 text-sm font-medium rounded-full border border-gray-300 bg-white/80 hover:bg-white transition text-gray-800">
                            My Profile
                        </Link>
                        {(user.email === "chathuralakshan123567@gmail.com" || user.email === "chathuralakshan1234567@gmail.com" || (user.role && (user.role === 'owner' || user.role.includes('manager') || user.role === 'receptionist'))) && (
                            <Link to="/admin" className="px-4 py-1.5 text-sm font-medium rounded-full border border-gray-300 bg-white/80 hover:bg-white transition text-gray-800">
                                Dashboard
                            </Link>
                        )}
                        <button onClick={handleSignOut} className="px-4 py-1.5 text-sm font-medium rounded-full border border-gray-300 bg-white/80 hover:bg-white transition text-gray-800 cursor-pointer">
                            Sign Out
                        </button>
                    </div>
                ) : (
                    <Link to="/sign-in" className="px-4 py-1.5 text-sm font-medium rounded-full border border-gray-300 bg-white/80 hover:bg-white transition text-gray-800">
                        Sign In
                    </Link>
                )}

            </div>

            {/* Mobile Right: menu button */}
            <div className="flex items-center gap-3 md:hidden">
                <img
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    src={assets.menuIcon}
                    alt=""
                    className={`h-7 ${isHomePage ? (isScrolled ? 'invert' : '') : 'invert'
                        }`}
                />
            </div>

            {/* Mobile Menu */}
            <div className={`fixed top-0 left-0 w-full h-screen bg-white text-base flex flex-col md:hidden items-center justify-center gap-6 font-medium text-gray-800 transition-all duration-500 ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
                <button className="absolute top-4 right-4" onClick={() => setIsMenuOpen(false)}>
                    <img src={assets.closeIcon} alt="close-menu" className="h-6.5" />
                </button>

                {navLinks.map((link, i) => (
                    <a key={i} href={link.path} onClick={() => setIsMenuOpen(false)}>
                        {link.name}
                    </a>
                ))}

                {user ? (
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-10 h-10 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                            {user.email?.charAt(0).toUpperCase()}
                        </div>
                        <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="border px-4 py-2 text-sm rounded-full bg-gray-50 text-gray-700">
                            My Profile
                        </Link>
                        {(user.email === "chathuralakshan123567@gmail.com" || user.email === "chathuralakshan1234567@gmail.com" || (user.role && (user.role === 'owner' || user.role.includes('manager') || user.role === 'receptionist'))) && (
                            <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="border px-4 py-2 text-sm rounded-full bg-indigo-100 text-indigo-700">
                                Dashboard
                            </Link>
                        )}
                        <button onClick={() => { handleSignOut(); setIsMenuOpen(false); }} className="border px-4 py-2 text-sm rounded-full bg-gray-100">
                            Sign Out
                        </button>
                    </div>
                ) : (
                    <Link to="/sign-in" onClick={() => setIsMenuOpen(false)} className="border px-4 py-2 text-sm rounded-full">
                        Sign In
                    </Link>
                )}


            </div>
        </nav>

    );
}

export default Navbar