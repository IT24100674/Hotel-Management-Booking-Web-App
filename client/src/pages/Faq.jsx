import React, { useEffect, useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Search, MessageSquare } from 'lucide-react';

const Faq = () => {
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [openIndex, setOpenIndex] = useState(null);

    useEffect(() => {
        fetchFaqs();
    }, []);

    const fetchFaqs = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/faqs');
            const data = await res.json();
            if (res.ok) {
                // Filter only active FAQs for public view
                setFaqs(data.filter(f => f.is_active));
            }
        } catch (err) {
            console.error('Error fetching FAQs:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleFaq = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const filteredFaqs = faqs.filter(faq =>
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Grouping FAQs by category
    const groupedFaqs = filteredFaqs.reduce((acc, faq) => {
        if (!acc[faq.category]) acc[faq.category] = [];
        acc[faq.category].push(faq);
        return acc;
    }, {});

    return (
        <div className="bg-gray-50 min-h-screen pb-20 pt-24">
            {/* Header Section */}
            <div className="container-custom px-4 text-center mb-16">
                <span className="text-secondary font-medium tracking-widest uppercase text-sm mb-4 block">How can we help?</span>
                <h1 className="font-playfair text-4xl md:text-5xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h1>

                <div className="max-w-xl mx-auto relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-secondary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search for answers..."
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-secondary outline-none transition-all text-gray-700"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="container-custom px-4 max-w-4xl mx-auto">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : Object.keys(groupedFaqs).length > 0 ? (
                    Object.entries(groupedFaqs).map(([category, items]) => (
                        <div key={category} className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-200 pb-2 uppercase tracking-wide text-xs">
                                <span className="w-8 h-8 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center font-bold">
                                    {category[0]}
                                </span>
                                {category}
                            </h2>
                            <div className="space-y-4">
                                {items.map((faq, idx) => {
                                    const globalIdx = `${category}-${idx}`;
                                    const isOpen = openIndex === globalIdx;
                                    return (
                                        <div
                                            key={faq.id}
                                            className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${isOpen ? 'border-secondary shadow-md ring-1 ring-secondary/20' : 'border-gray-100 hover:border-gray-300 shadow-sm'
                                                }`}
                                        >
                                            <button
                                                onClick={() => toggleFaq(globalIdx)}
                                                className="w-full px-6 py-5 text-left flex justify-between items-center gap-4 focus:outline-none"
                                            >
                                                <span className={`font-semibold transition-colors ${isOpen ? 'text-secondary' : 'text-gray-900'}`}>
                                                    {faq.question}
                                                </span>
                                                <div className={`flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                                                    <ChevronDown size={20} className={isOpen ? 'text-secondary' : 'text-gray-400'} />
                                                </div>
                                            </button>
                                            <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                                <div className="px-6 pb-6 text-gray-600 border-t border-gray-50 pt-4 leading-relaxed whitespace-pre-line">
                                                    {faq.answer}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
                        <HelpCircle size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-medium text-gray-900">No questions found</h3>
                        <p className="text-gray-500 mt-2">Try a different search term or browse our categories.</p>
                    </div>
                )}

                {/* Contact CTA */}
                <div className="mt-20 bg-primary text-white p-10 rounded-3xl shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-500"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                            <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                                <MessageSquare className="text-secondary" />
                                Still have questions?
                            </h3>
                            <p className="text-white/80">Our support team is always here to assist you with your booking needs.</p>
                        </div>
                        <button
                            onClick={() => window.location.href = '/contact'}
                            className="bg-secondary text-primary font-bold px-8 py-4 rounded-xl hover:bg-white transition-colors whitespace-nowrap shadow-lg"
                        >
                            Contact Support
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Faq;
