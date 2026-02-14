import React from 'react';

const DebugBanner = () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) return null;

    return (
        <div className="bg-red-600 text-white text-center p-4 fixed top-0 left-0 w-full z-[100]">
            <p className="font-bold">⚠️ Supabase Configuration Missing</p>
            <p className="text-sm mt-1">
                {!supabaseUrl && <span className="block">Missing VITE_SUPABASE_URL</span>}
                {!supabaseKey && <span className="block">Missing VITE_SUPABASE_ANON_KEY</span>}
            </p>
            <p className="text-xs mt-2">Please create a <code>.env</code> file in the <code>client</code> directory with these values.</p>
        </div>
    );
};

export default DebugBanner;
