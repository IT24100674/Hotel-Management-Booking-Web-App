import React, { useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate, Link } from 'react-router-dom'

const SignIn = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    const [showForgotPassword, setShowForgotPassword] = useState(false)
    const [resetMessage, setResetMessage] = useState(null)

    const handleResetPassword = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setResetMessage(null)

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/update-password`,
            })

            if (error) throw error

            setResetMessage("Password reset link sent! Check your email.")
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleSignIn = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        // 1. Try Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (!authError && authData.session) {
            // Fetch role from staff table to ensure consistent session state
            const { user } = authData.session;
            let role = 'user'; // default
            let name = user.email.split('@')[0];
            let id = user.id;

            try {
                // 1. Check if user is in 'staff' table
                const { data: staffData } = await supabase
                    .from('staff')
                    .select('*')
                    .eq('email', user.email)
                    .single();

                if (staffData) {
                    role = staffData.role; // e.g., 'receptionist'
                    name = staffData.name;
                    id = staffData.id;
                } else {
                    // 2. If not in staff, check 'users' table (customers)
                    const { data: userData } = await supabase
                        .from('users')
                        .select('*')
                        .eq('email', user.email)
                        .single();

                    if (userData) {
                        role = userData.role || 'user';
                        name = userData.name || name;
                        id = userData.id;
                    }
                }

                // Dev Override
                if (user.email === 'chathuralakshan123567@gmail.com' || user.email === 'chathuralakshan1234567@gmail.com') {
                    role = 'owner';
                }

            } catch (err) {
                console.error("Error fetching role:", err);
            }

            const userSession = {
                email: user.email,
                role: role,
                name: name,
                id: id
            };

            localStorage.setItem('hotel_user', JSON.stringify(userSession));
            window.dispatchEvent(new Event('storage')); // Notify Navbar

            navigate(role === 'owner' || role.includes('manager') || role === 'receptionist' ? '/admin' : '/');
            setLoading(false);
            return;
        }

        // 2. Fallback: Check 'staff' table logic 
        try {
            const { data: staffData, error: staffError } = await supabase
                .from('staff')
                .select('*')
                .eq('email', email)
                .eq('temp_password', password)
                .single()

            if (staffData && !staffError) {
                // Determine destination based on role? Or just go to home/admin
                const userSession = {
                    email: staffData.email,
                    role: staffData.role,
                    name: staffData.name,
                    id: staffData.id // vital for updates
                }
                localStorage.setItem('hotel_user', JSON.stringify(userSession))

                // Force a reload or event dispatch to update Navbar? 
                // Navigate first, but Navbar might not pick up local storage change immediately without a context or event.
                // For simplicity, we can reload or dispatch a custom event.
                window.dispatchEvent(new Event('storage'))
                navigate(staffData.role === 'owner' || staffData.role.includes('manager') ? '/admin' : '/')
            } else {
                throw new Error("Invalid login credentials")
            }

        } catch (err) {
            setError(err.message || "Invalid login credentials")
        }

        setLoading(false)
    }

    if (showForgotPassword) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100">
                <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                    <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Reset Password</h2>
                    {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
                    {resetMessage && <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm">{resetMessage}</div>}

                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Enter your email"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Sending Link...' : 'Send Reset Link'}
                        </button>
                    </form>

                    <div className="mt-4 text-center">
                        <button
                            onClick={() => { setShowForgotPassword(false); setError(null); setResetMessage(null); }}
                            className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
                        >
                            Back to Sign In
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 relative py-20">
            {/* Background Image */}
            <div className="absolute inset-0">
                <img
                    src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070&auto=format&fit=crop"
                    alt="Luxury Hotel Lobby"
                    className="w-full h-full object-cover opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/80"></div>
            </div>

            <div className="relative z-10 w-full max-w-md px-4">
                <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-8 md:p-10 border border-white/10">
                    <div className="text-center mb-8">
                        <Link to="/" className="inline-block mb-6">
                            <h1 className="text-3xl font-playfair font-bold tracking-wider" style={{ color: '#c5a059' }}>
                                LUXE<span style={{ color: '#c5a059' }}>STAY</span>
                            </h1>
                        </Link>
                        <h2 className="text-2xl font-playfair font-bold mb-2" style={{ color: '#c5a059' }}>Welcome Back</h2>
                        <p className="text-gray-300 text-sm">Sign in to manage your bookings and account.</p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-xl mb-6 text-sm text-center backdrop-blur-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSignIn} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
                                placeholder="name@example.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">Password</label>
                                <button
                                    type="button"
                                    onClick={() => setShowForgotPassword(true)}
                                    className="text-xs text-secondary hover:text-white transition-colors"
                                >
                                    Forgot Password?
                                </button>
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all transform hover:-translate-y-0.5
                                ${loading
                                    ? 'bg-gray-600 cursor-not-allowed'
                                    : 'bg-secondary hover:bg-amber-500 shadow-secondary/20'}`}
                        >
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-8">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/10"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 text-gray-400 bg-transparent backdrop-blur-md rounded">Or continue with</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={async () => {
                                try {
                                    const { error } = await supabase.auth.signInWithOAuth({
                                        provider: 'google',
                                        options: {
                                            redirectTo: window.location.origin
                                        }
                                    })
                                    if (error) throw error
                                } catch (error) {
                                    setError(error.message)
                                }
                            }}
                            className="mt-6 w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white text-gray-900 font-bold rounded-xl hover:bg-gray-100 transition-all transform hover:-translate-y-0.5"
                        >
                            <svg className="h-5 w-5" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            <span>Sign in with Google</span>
                        </button>
                    </div>

                    <div className="mt-8 text-center text-sm text-gray-400">
                        Don't have an account? <Link to="/sign-up" className="text-secondary font-bold hover:text-white transition-colors">Sign Up</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SignIn
