import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Lock, Loader } from 'lucide-react';

const UpdatePassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if we have a session (Supabase handles the token from URL automatically)
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                // If no session, they might have clicked a bad link or it expired
                setError("Invalid or expired reset link. Please try again.");
            }
        };

        checkSession();

        // Listen for auth state changes just in case
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'PASSWORD_RECOVERY') {
                // This event is fired when the user clicks the password reset link
                // The session is already set by supabase-js
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            setLoading(false);
            return;
        }

        try {
            const { error } = await supabase.auth.updateUser({ password: password });

            if (error) throw error;

            setMessage("Password updated successfully! Redirecting to login...");
            setTimeout(() => {
                navigate('/sign-in');
            }, 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full space-y-8">
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <div className="text-center mb-8">
                        <div className="mx-auto h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                            <Lock className="h-6 w-6 text-amber-600" />
                        </div>
                        <h2 className="text-3xl font-playfair font-bold text-gray-900">Set New Password</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Please enter your new password below.
                        </p>
                    </div>

                    {message && (
                        <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6 border border-green-100">
                            {message}
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 border border-red-100">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleUpdatePassword} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all bg-gray-50 focus:bg-white"
                                    placeholder="Enter new password"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all bg-gray-50 focus:bg-white"
                                    placeholder="Confirm new password"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-gray-900 to-gray-800 hover:from-black hover:to-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-all ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? <Loader className="animate-spin h-5 w-5" /> : 'Update Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UpdatePassword;
