import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Mail, Trash2, Calendar, User, AlignLeft } from 'lucide-react';

const MessagesManagement = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('contact_messages')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setMessages(data || []);
        } catch (err) {
            console.error('Error fetching messages:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this message?")) return;

        try {
            const { error } = await supabase
                .from('contact_messages')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setMessages(messages.filter(msg => msg.id !== id));
        } catch (err) {
            console.error('Error deleting message:', err);
            alert("Failed to delete message.");
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-playfair font-bold text-gray-900 mb-2">Customer Messages</h1>
                    <p className="text-gray-500">View and manage inquiries from the Contact Us form.</p>
                </div>
                <div className="bg-primary/10 text-primary px-4 py-2 rounded-full font-semibold text-sm flex items-center gap-2">
                    <Mail size={18} />
                    <span>{messages.length} Messages</span>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            ) : messages.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-400">
                        <Mail size={32} />
                    </div>
                    <h3 className="text-xl font-playfair font-bold text-gray-900 mb-2">No messages yet</h3>
                    <p className="text-gray-500">When customers submit the contact form, their messages will appear here.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {messages.map((message) => (
                        <div key={message.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="p-6">
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-lg font-playfair shadow-sm shrink-0">
                                                {message.name ? message.name.charAt(0).toUpperCase() : '?'}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                                                    {message.name}
                                                </h3>
                                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                                                    <span className="flex items-center gap-1.5"><Mail size={14} /> <a href={`mailto:${message.email}`} className="hover:text-primary transition-colors">{message.email}</a></span>
                                                    <span className="flex items-center gap-1.5"><Calendar size={14} /> {formatDate(message.created_at)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                                            <h4 className="font-bold text-gray-800 mb-2 border-b border-gray-200 pb-2 inline-block">
                                                Subject: {message.subject || 'No Subject'}
                                            </h4>
                                            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                                {message.message}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex justify-end pt-2">
                                        <button
                                            onClick={() => handleDelete(message.id)}
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium border border-transparent hover:border-red-100"
                                            title="Delete Message"
                                        >
                                            <Trash2 size={16} /> <span className="md:hidden">Delete</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MessagesManagement;
