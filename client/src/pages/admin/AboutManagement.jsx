import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Save, Image as ImageIcon, CheckCircle, Upload } from 'lucide-react';

const AboutManagement = () => {
    const [formData, setFormData] = useState({
        hero_subtitle: 'OUR HERITAGE',
        hero_title: 'The Art of Hospitality',
        hero_description: 'For over a century, Luxe Heritage has defined the standard of luxury...',
        hero_image: '',
        section_title: 'A Legacy of Elegance',
        section_p1: 'Established in 1924...',
        section_p2: 'Every detail...',
        section_image: ''
    });
    
    // Track file objects selected for upload
    const [heroFile, setHeroFile] = useState(null);
    const [sectionFile, setSectionFile] = useState(null);
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        fetchAboutData();
    }, []);

    const fetchAboutData = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('about_page')
                .select('*')
                .eq('id', 1)
                .single();
                
            if (data && !error) {
                setFormData(data);
            }
        } catch (err) {
            console.error("Error fetching about page data:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (!file) return;
        
        if (type === 'hero') {
            setHeroFile(file);
        } else {
            setSectionFile(file);
        }
    };

    const uploadImage = async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.floor(Math.random() * 10000)}.${fileExt}`;
        const filePath = `${fileName}`;
        
        const { error: uploadError } = await supabase.storage
            .from('about_images')
            .upload(filePath, file);

        if (uploadError) {
            throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('about_images')
            .getPublicUrl(filePath);

        // Add a timestamp query to force the browser to skip cache
        return `${publicUrl}?t=${Date.now()}`;
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setSuccessMessage('');

        try {
            let finalHeroImageUrl = formData.hero_image;
            let finalSectionImageUrl = formData.section_image;

            // Upload Hero Image if provided
            if (heroFile) {
                finalHeroImageUrl = await uploadImage(heroFile);
            }

            // Upload Section Image if provided
            if (sectionFile) {
                finalSectionImageUrl = await uploadImage(sectionFile);
            }

            const payload = {
                ...formData,
                hero_image: finalHeroImageUrl,
                section_image: finalSectionImageUrl
            };

            // Check if row id=1 exists
            const { count } = await supabase
                .from('about_page')
                .select('*', { count: 'exact', head: true })
                .eq('id', 1);

            let saveError;

            if (count > 0) {
                const { error } = await supabase
                    .from('about_page')
                    .update(payload)
                    .eq('id', 1);
                saveError = error;
            } else {
                const { error } = await supabase
                    .from('about_page')
                    .insert([{ id: 1, ...payload }]);
                saveError = error;
            }

            if (saveError) throw saveError;

            // Reset file inputs but keep the new URLs in formData to preview
            setFormData(payload);
            setHeroFile(null);
            setSectionFile(null);
            
            // Clear the actual input DOM elements so selecting the same file triggers an update
            const fileInputs = document.querySelectorAll('input[type="file"]');
            fileInputs.forEach(input => { input.value = ''; });

            setSuccessMessage('About page updated successfully!');
            
            setTimeout(() => setSuccessMessage(''), 3000);
            
        } catch (err) {
            console.error("Error saving about page:", err);
            const errorMessage = err?.message || err?.error_description || JSON.stringify(err);
            alert(`Failed to save! Supabase Error: ${errorMessage}`);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-playfair font-bold text-gray-900 mb-2">About Page Settings</h1>
                    <p className="text-gray-500">Customize the text and imagery for the public About Us page.</p>
                </div>
                {successMessage && (
                    <div className="bg-green-50 text-green-700 px-4 py-2 rounded-xl border border-green-100 flex items-center gap-2 animate-fade-in">
                        <CheckCircle size={18} />
                        <span className="font-medium text-sm">{successMessage}</span>
                    </div>
                )}
            </div>

            <form onSubmit={handleSave} className="space-y-8">
                
                {/* Hero Section Container */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gray-50 px-8 py-5 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900">Hero Section (Top)</h2>
                    </div>
                    <div className="p-8 space-y-6">
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Subtitle</label>
                                <input
                                    type="text"
                                    name="hero_subtitle"
                                    value={formData.hero_subtitle}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Main Title</label>
                                <input
                                    type="text"
                                    name="hero_title"
                                    value={formData.hero_title}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description / Paragraph</label>
                            <textarea
                                name="hero_description"
                                value={formData.hero_description}
                                onChange={handleInputChange}
                                rows="3"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all resize-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Background Image</label>
                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                                <div className="w-32 h-20 bg-gray-100 rounded-xl border border-gray-200 overflow-hidden flex-shrink-0 relative group">
                                    {heroFile ? (
                                        <img src={URL.createObjectURL(heroFile)} className="w-full h-full object-cover" alt="Hero preview" />
                                    ) : formData.hero_image ? (
                                        <img src={formData.hero_image} className="w-full h-full object-cover" alt="Current Hero" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400"><ImageIcon size={24} /></div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors text-sm font-medium">
                                        <Upload size={16} /> Choose New Image
                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'hero')} />
                                    </label>
                                    <p className="text-xs text-gray-500 mt-2">Upload a high-quality landscape image. Recommended 1920x1080.</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Content Section Container */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gray-50 px-8 py-5 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900">Historical / Heritage Section</h2>
                    </div>
                    <div className="p-8 space-y-6">
                        
                        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Section Title</label>
                                <input
                                    type="text"
                                    name="section_title"
                                    value={formData.section_title}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Paragraph 1</label>
                                <textarea
                                    name="section_p1"
                                    value={formData.section_p1}
                                    onChange={handleInputChange}
                                    rows="4"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all resize-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Paragraph 2</label>
                                <textarea
                                    name="section_p2"
                                    value={formData.section_p2}
                                    onChange={handleInputChange}
                                    rows="4"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all resize-none"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Section Image (Vintage/Historical)</label>
                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                                <div className="w-20 h-24 bg-gray-100 rounded-xl border border-gray-200 overflow-hidden flex-shrink-0 relative group">
                                    {sectionFile ? (
                                        <img src={URL.createObjectURL(sectionFile)} className="w-full h-full object-cover" alt="Section preview" />
                                    ) : formData.section_image ? (
                                        <img src={formData.section_image} className="w-full h-full object-cover" alt="Current Section" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400"><ImageIcon size={20} /></div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors text-sm font-medium">
                                        <Upload size={16} /> Choose New Image
                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'section')} />
                                    </label>
                                    <p className="text-xs text-gray-500 mt-2">Upload a portrait or square orientation image to match the layout.</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 px-8 py-4 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-primary-light transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {saving ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <Save size={20} />
                        )}
                        {saving ? 'Saving Changes...' : 'Save All Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AboutManagement;
