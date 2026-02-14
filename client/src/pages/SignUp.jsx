import React, { useState } from 'react'
import { supabase } from '../supabaseClient'
import { Link } from 'react-router-dom'

const SignUp = () => {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [message, setMessage] = useState(null)

    const handleSignUp = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setMessage(null)

        try {
            // 1. Sign up with Supabase Auth
            const { data, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name: name,
                    }
                }
            })

            if (authError) throw authError;

            // 2. Insert into public.users table
            if (data?.user) {
                const { error: dbError } = await supabase
                    .from('users')
                    .insert([{
                        id: data.user.id,
                        name: name,
                        email: email,
                        role: 'user'
                    }]);

                if (dbError) throw dbError;
            }

            setMessage('Registration successful! Please check your email to verify your account.')
            // Optional: Clear form
            setName('')
            setEmail('')
            setPassword('')

        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 relative overflow-hidden">
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
                            <h1 className="text-3xl font-playfair font-bold text-white tracking-wider">
                                LUXE<span className="text-secondary">STAY</span>
                            </h1>
                        </Link>
                        <h2 className="text-2xl font-playfair font-bold text-white mb-2">Create Account</h2>
                        <p className="text-gray-300 text-sm">Join us to experience luxury at its finest.</p>
                    </div>

                    {error && <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-xl mb-6 text-sm text-center backdrop-blur-sm">{error}</div>}
                    {message && <div className="bg-green-500/10 border border-green-500/20 text-green-200 p-4 rounded-xl mb-6 text-sm text-center backdrop-blur-sm">{message}</div>}

                    <form onSubmit={handleSignUp} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">Full Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
                                placeholder="John Doe"
                            />
                        </div>
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
                            <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
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
                            {loading ? 'Creating Account...' : 'Sign Up'}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm text-gray-400">
                        Already have an account? <Link to="/sign-in" className="text-secondary font-bold hover:text-white transition-colors">Sign In</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SignUp
