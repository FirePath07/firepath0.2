import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigation } from '../components/Navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, CheckCircle, Lightbulb, AlertCircle, Clock, Reply } from 'lucide-react';

interface FeedbackItem {
    _id: string;
    type: string;
    content: string;
    adminReply?: string;
    createdAt: string;
}

export const FeedbackPage = () => {
    const { } = useAuth();
    const [type, setType] = useState<'feedback' | 'advice' | 'suggestion'>('feedback');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [myFeedback, setMyFeedback] = useState<FeedbackItem[]>([]);
    const [loadingFeedback, setLoadingFeedback] = useState(true);

    const fetchMyFeedback = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await fetch(`${baseUrl}/api/feedback/me`, {
                headers: { 'x-auth-token': token }
            });
            if (res.ok) {
                const data = await res.json();
                setMyFeedback(data);
            }
        } catch (err) {
            console.error("Fetch feedback error:", err);
        } finally {
            setLoadingFeedback(false);
        }
    };

    useEffect(() => {
        fetchMyFeedback();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await fetch(`${baseUrl}/api/feedback`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token || ''
                },
                body: JSON.stringify({ type, content })
            });

            if (res.ok) {
                setSubmitted(true);
                setContent('');
                fetchMyFeedback();
                setTimeout(() => setSubmitted(false), 5000);
            }
        } catch (err) {
            console.error("Feedback submission error:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0b0f1a] transition-colors duration-300">
            <Navigation showFullNav={true} />

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Left Side: Submission Form */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <div className="mb-10">
                            <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
                                Share Your <span className="text-emerald-600">Vision</span>
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-400">
                                Be part of the FirePath evolution. Your strategic input directly influences our development roadmap.
                            </p>
                        </div>

                        <div className="bg-white dark:bg-slate-800/40 rounded-[2.5rem] shadow-2xl p-8 md:p-10 border border-gray-100 dark:border-slate-700/50 relative overflow-hidden">
                            <form onSubmit={handleSubmit} className="relative z-10">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
                                    {[
                                        { id: 'feedback', label: 'Review', icon: MessageSquare },
                                        { id: 'suggestion', label: 'Feature', icon: Lightbulb },
                                        { id: 'advice', label: 'Strategy', icon: AlertCircle }
                                    ].map((item) => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => setType(item.id as any)}
                                            className={`flex items-center gap-3 px-4 py-4 rounded-2xl border-2 transition-all duration-300 ${
                                                type === item.id 
                                                    ? 'border-emerald-500 bg-emerald-500/5 text-emerald-600' 
                                                    : 'border-transparent bg-gray-50 dark:bg-slate-900/50 text-gray-400 hover:bg-emerald-500/5'
                                            }`}
                                        >
                                            <item.icon size={20} />
                                            <span className="font-black text-xs uppercase tracking-widest">{item.label}</span>
                                        </button>
                                    ))}
                                </div>

                                <div className="mb-8">
                                    <textarea
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder="Detailed strategic input..."
                                        className="w-full h-48 px-6 py-5 bg-gray-50 dark:bg-slate-900 border-none rounded-[2rem] font-medium text-gray-900 dark:text-white focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all resize-none text-lg shadow-inner"
                                        required
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting || !content.trim()}
                                    className="w-full py-5 bg-emerald-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all disabled:opacity-50 flex items-center justify-center gap-3 text-lg tracking-widest uppercase"
                                >
                                    {isSubmitting ? 'Transmitting...' : <>Submit Intelligence <Send size={20} /></>}
                                </button>
                            </form>

                            <AnimatePresence>
                                {submitted && (
                                    <motion.div
                                        initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                                        animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
                                        exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                                        className="absolute inset-0 bg-white/90 dark:bg-slate-900/90 z-20 flex flex-col items-center justify-center p-8 text-center"
                                    >
                                        <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-emerald-500/40">
                                            <CheckCircle className="w-10 h-10 text-white" />
                                        </div>
                                        <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Received</h3>
                                        <p className="font-bold text-gray-500 dark:text-gray-400">Your intelligence has been logged into the system.</p>
                                        <button 
                                            onClick={() => setSubmitted(false)}
                                            className="mt-8 px-10 py-3 bg-emerald-500 text-white font-black rounded-xl hover:bg-emerald-600 transition shadow-lg"
                                        >
                                            Close
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    {/* Right Side: My Feedbacks & Responses */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-8"
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight uppercase italic">Intelligence <span className="text-emerald-500 not-italic">Stream</span></h2>
                            <span className="px-3 py-1 bg-slate-200 dark:bg-slate-800 text-slate-500 text-[10px] font-black rounded-full uppercase tracking-widest">
                                {myFeedback.length} ENTRIES
                            </span>
                        </div>

                        <div className="space-y-6 max-h-[700px] overflow-y-auto pr-2 scrollbar-hide">
                            {loadingFeedback ? (
                                <div className="text-center py-20">
                                    <div className="animate-spin w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto"></div>
                                </div>
                            ) : myFeedback.length > 0 ? (
                                myFeedback.map((item) => (
                                    <div key={item._id} className="bg-white dark:bg-slate-800/40 p-6 rounded-[2rem] border border-gray-100 dark:border-slate-700/50 shadow-sm hover:shadow-xl transition-all">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">
                                                {item.type}
                                            </span>
                                            <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                                                <Clock size={12} /> {new Date(item.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-gray-700 dark:text-slate-300 font-medium italic mb-4">
                                            "{item.content}"
                                        </p>

                                        {item.adminReply && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="mt-4 p-5 bg-emerald-500/5 dark:bg-emerald-500/10 border-l-4 border-emerald-500 rounded-r-2xl"
                                            >
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Reply size={14} className="text-emerald-500" />
                                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Nexus Response</span>
                                                </div>
                                                <p className="text-gray-800 dark:text-emerald-200 font-bold">
                                                    {item.adminReply}
                                                </p>
                                            </motion.div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-20 bg-white dark:bg-slate-800/20 rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-slate-800">
                                    <MessageSquare size={48} className="mx-auto text-gray-200 dark:text-slate-800 mb-4" />
                                    <p className="text-gray-400 font-bold">No intelligence entries logged yet.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
};
