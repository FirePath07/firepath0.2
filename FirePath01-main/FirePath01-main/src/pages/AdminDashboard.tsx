import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navigation } from '../components/Navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, MessageSquare, Clock, Search, ShieldCheck, Mail, 
  Trash2, X, AlertTriangle, DollarSign, 
  Target, BarChart3, Activity, Send, Reply, Bell, CheckCircle2
} from 'lucide-react';
import { formatIndianCurrency } from '../utils/currency';

interface UserData {
    _id: string;
    name: string;
    email: string;
    financialData: any;
    createdAt: string;
}

interface FeedbackData {
    _id: string;
    userName: string;
    userEmail: string;
    type: string;
    content: string;
    adminReply?: string;
    isRead?: boolean;
    createdAt: string;
}

export const AdminDashboard = () => {
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState<'users' | 'suggestions'>('users');
    const [users, setUsers] = useState<UserData[]>([]);
    const [suggestions, setSuggestions] = useState<FeedbackData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    
    // Feedback interaction states
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');
    const [isSubmittingReply, setIsSubmittingReply] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            const [usersRes, suggRes] = await Promise.all([
                fetch('http://localhost:5000/api/feedback/admin/users', {
                    headers: { 'x-auth-token': token || '' }
                }),
                fetch('http://localhost:5000/api/feedback/admin/suggestions', {
                    headers: { 'x-auth-token': token || '' }
                })
            ]);

            if (usersRes.ok && suggRes.ok) {
                const usersData = await usersRes.json();
                const suggestionsData = await suggRes.json();
                setUsers(usersData);
                setSuggestions(suggestionsData);
            }
        } catch (err) {
            console.error("Admin data fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentUser && currentUser.email !== 'firepathjjrp@gmail.com') {
            navigate('/profile');
            return;
        }
        if (currentUser) fetchData();

        // Handle tab from URL
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        if (tab === 'suggestions') setActiveTab('suggestions');
    }, [currentUser, navigate, location]);

    const handleDeleteUser = async (userId: string) => {
        setIsDeleting(true);
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`http://localhost:5000/api/feedback/admin/users/${userId}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token || '' }
            });
            if (res.ok) {
                setUsers(users.filter(u => u._id !== userId));
                setSuggestions(suggestions.filter(s => users.find(u => u._id === userId)?.email !== s.userEmail));
                setShowDeleteConfirm(null);
                setSelectedUser(null);
            }
        } catch (err) {
            console.error("Delete user error:", err);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteFeedback = async (id: string) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`http://localhost:5000/api/feedback/admin/suggestions/${id}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token || '' }
            });
            if (res.ok) {
                setSuggestions(suggestions.filter(s => s._id !== id));
            }
        } catch (err) {
            console.error("Delete feedback error:", err);
        }
    };

    const handleSendReply = async (id: string) => {
        if (!replyText.trim()) return;
        setIsSubmittingReply(true);
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`http://localhost:5000/api/feedback/admin/${id}/reply`, {
                method: 'PUT',
                headers: { 
                    'x-auth-token': token || '',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reply: replyText })
            });
            if (res.ok) {
                const updatedFeedback = await res.json();
                setSuggestions(suggestions.map(s => s._id === id ? updatedFeedback : s));
                setReplyingTo(null);
                setReplyText('');
            }
        } catch (err) {
            console.error("Reply error:", err);
        } finally {
            setIsSubmittingReply(false);
        }
    };

    const handleMarkAsRead = async (id: string) => {
        const feedback = suggestions.find(s => s._id === id);
        if (feedback?.isRead) return;

        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`http://localhost:5000/api/feedback/admin/${id}/read`, {
                method: 'PUT',
                headers: { 'x-auth-token': token || '' }
            });
            if (res.ok) {
                const updated = await res.json();
                setSuggestions(suggestions.map(s => s._id === id ? updated : s));
            }
        } catch (err) {
             console.error("Read mark error:", err);
        }
    };

    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredSuggestions = suggestions.filter(s => 
        s.userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const calculateFIRENumber = (u: UserData) => {
        if (u.financialData?.selectedFireAmount) return u.financialData.selectedFireAmount;
        const annualExpenses = (u.financialData?.monthlyExpenses || 0) * 12;
        const inflationRate = (u.financialData?.inflationRate || 6) / 100;
        const yearsToInvest = Math.max(0, (u.financialData?.targetRetirementAge || 60) - (u.financialData?.age || 25));
        const futExp = annualExpenses * Math.pow(1 + inflationRate, yearsToInvest);
        return futExp * 25;
    };

    const unreadCount = suggestions.filter(s => !s.isRead).length;

    if (!currentUser || currentUser.email !== 'firepathjjrp@gmail.com') return null;

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0b0f1a] transition-colors duration-500 font-sans selection:bg-emerald-500/30">
            <Navigation showFullNav={true} />

            <main className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 py-10">
                {/* Simplified Admin Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-12 gap-8 bg-white dark:bg-slate-800/40 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-700/50 shadow-xl shadow-slate-200/50 dark:shadow-none">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-6"
                    >
                        <div className="relative">
                            <div className="w-20 h-20 bg-gradient-to-tr from-emerald-600 to-emerald-400 rounded-[2rem] shadow-2xl shadow-emerald-500/40 flex items-center justify-center relative z-10">
                                <ShieldCheck className="w-10 h-10 text-white" />
                            </div>
                            <motion.div 
                                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                                transition={{ repeat: Infinity, duration: 3 }}
                                className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full"
                            />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight italic">Admin <span className="text-emerald-500 not-italic">Center</span></h1>
                                <span className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-emerald-500/20">System Administrator</span>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 font-bold flex items-center gap-2 text-xs uppercase tracking-tighter">
                                <Activity className="w-4 h-4 text-emerald-500 animate-pulse" /> Management Terminal
                            </p>
                        </div>
                    </motion.div>

                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="relative group w-full sm:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                            <input 
                                type="text"
                                placeholder={`Search ${activeTab === 'users' ? 'Participants' : 'Feedback'}...`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-6 py-4 bg-slate-100 dark:bg-slate-900/50 border-none rounded-[1.5rem] outline-none ring-2 ring-transparent focus:ring-emerald-500/30 transition-all text-slate-700 dark:text-slate-200 font-medium h-14"
                            />
                        </div>
                        <div className="flex items-center gap-4 bg-slate-100 dark:bg-slate-900/50 px-6 rounded-2xl h-14 border border-transparent hover:border-emerald-500/20 transition-all">
                             <div className="text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Active Admin</p>
                                <p className="text-sm font-black text-slate-900 dark:text-emerald-400 leading-none">JJRP_ROOT</p>
                             </div>
                             <div className="w-10 h-10 rounded-full border-2 border-emerald-500 p-0.5 shadow-lg shadow-emerald-500/10">
                                 <div className="w-full h-full bg-slate-300 dark:bg-slate-700 rounded-full flex items-center justify-center font-black text-emerald-600">J</div>
                             </div>
                        </div>
                    </div>
                </div>

                {/* Dashboard Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                    {[
                        { label: 'Total Users', value: users.length, icon: Users, color: 'emerald', trend: '+Live' },
                        { 
                          label: 'Recent Feedback', 
                          value: suggestions.length, 
                          icon: MessageSquare, 
                          color: 'blue', 
                          trend: unreadCount > 0 ? `${unreadCount} NEW` : 'Clean',
                          onClick: () => setActiveTab('suggestions'),
                          isNotify: unreadCount > 0
                        },
                        { label: 'Asset Management', value: formatIndianCurrency(users.reduce((acc, u) => acc + (u.financialData?.currentSavings || 0), 0)), icon: DollarSign, color: 'emerald', trend: 'Global' },
                        { label: 'System Uptime', value: '99.9%', icon: Activity, color: 'purple', trend: 'Perfect' }
                    ].map((stat, i) => (
                        <motion.button 
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            onClick={stat.onClick}
                            className="text-left bg-white dark:bg-slate-800/60 p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700/50 relative overflow-hidden group hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border-b-4 border-b-transparent hover:border-b-emerald-500"
                        >
                            <div className="flex items-start justify-between relative z-10">
                                <div className={`p-4 rounded-2xl bg-${stat.color}-50 dark:bg-${stat.color}-500/10 relative`}>
                                    <stat.icon className={`w-8 h-8 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                                    {stat.isNotify && (
                                        <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white dark:border-slate-800"></span>
                                        </span>
                                    )}
                                </div>
                                <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter ${stat.isNotify ? 'bg-red-500 text-white' : `bg-${stat.color}-100 dark:bg-${stat.color}-500/20 text-${stat.color}-700 dark:text-${stat.color}-300`}`}>
                                    {stat.trend}
                                </span>
                            </div>
                            <div className="mt-6 relative z-10">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                                <p className="text-3xl font-black text-slate-900 dark:text-white">{stat.value}</p>
                            </div>
                        </motion.button>
                    ))}
                </div>

                {/* Interactive Tabs */}
                <div className="flex items-center gap-2 mb-10 bg-slate-200/40 dark:bg-slate-900/60 p-2 rounded-[1.5rem] w-fit shadow-inner">
                    <button
                        onClick={() => { setActiveTab('users'); setSearchTerm(''); }}
                        className={`flex items-center gap-3 px-10 py-4 rounded-[1.2rem] font-black transition-all ${activeTab === 'users' ? 'bg-emerald-500 text-white shadow-2xl shadow-emerald-500/40 scale-[1.05]' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                    >
                        <Users size={20} /> User Directory
                    </button>
                    <button
                        onClick={() => { setActiveTab('suggestions'); setSearchTerm(''); }}
                        className={`flex items-center gap-3 px-10 py-4 rounded-[1.2rem] font-black transition-all relative ${activeTab === 'suggestions' ? 'bg-emerald-500 text-white shadow-2xl shadow-emerald-500/40 scale-[1.05]' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                    >
                        <MessageSquare size={20} /> Feedback Center
                        {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-[10px] rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">{unreadCount}</span>}
                    </button>
                </div>

                {/* Main Content Area */}
                <motion.div 
                    layout
                    className="bg-white dark:bg-slate-800/40 rounded-[3rem] shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700/50 overflow-hidden"
                >
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-40">
                            <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full"
                            />
                            <p className="mt-6 text-slate-400 font-black tracking-widest uppercase animate-pulse">Loading Data...</p>
                        </div>
                    ) : (
                        <AnimatePresence mode="wait">
                            {activeTab === 'users' ? (
                                <motion.div 
                                    key="users-tab"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="overflow-x-auto"
                                >
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700/50">
                                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">User Name</th>
                                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Target Value</th>
                                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Duration</th>
                                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] text-center">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50 dark:divide-slate-700/30">
                                            {filteredUsers.map((u) => (
                                                <tr 
                                                    key={u._id} 
                                                    className="group hover:bg-emerald-50/20 dark:hover:bg-emerald-500/5 transition-all cursor-pointer"
                                                    onClick={() => setSelectedUser(u)}
                                                >
                                                    <td className="px-10 py-8">
                                                        <div className="flex items-center gap-6">
                                                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center font-black text-2xl text-emerald-500 shadow-inner group-hover:scale-110 transition-transform">
                                                                {u.name.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <div className="font-black text-xl text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                                                                    {u.name}
                                                                    {u.email === 'firepathjjrp@gmail.com' && <div className="p-1 bg-emerald-500 text-white rounded-full"><ShieldCheck size={12} /></div>}
                                                                </div>
                                                                <div className="text-xs font-bold text-slate-400 flex items-center gap-2">
                                                                    <Mail className="w-3.5 h-3.5" /> {u.email}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-8">
                                                        <div className="flex flex-col gap-2">
                                                            <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                                                                {formatIndianCurrency(calculateFIRENumber(u))}
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-32 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
                                                                    <motion.div 
                                                                        initial={{ width: 0 }}
                                                                        animate={{ width: `${Math.min(((u.financialData?.currentSavings || 0) / calculateFIRENumber(u)) * 100, 100)}%` }}
                                                                        className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400" 
                                                                    ></motion.div>
                                                                </div>
                                                                <span className="text-[10px] font-black text-slate-400 uppercase italic">Progress</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-8">
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-black text-sm">
                                                                <Clock size={14} className="text-emerald-500" />
                                                                {Math.floor((Date.now() - new Date(u.createdAt).getTime()) / (1000 * 60 * 60 * 24))} Days Active
                                                            </div>
                                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-5">
                                                                Since {new Date(u.createdAt).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-8">
                                                        <div className="flex justify-center">
                                                            {u.email !== 'firepathjjrp@gmail.com' ? (
                                                                <button 
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setShowDeleteConfirm(u._id);
                                                                    }}
                                                                    className="w-12 h-12 flex items-center justify-center bg-red-50 dark:bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm hover:shadow-xl hover:shadow-red-500/20 group/btn"
                                                                >
                                                                    <Trash2 size={20} className="group-hover/btn:scale-110 transition-transform" />
                                                                </button>
                                                            ) : (
                                                                <div className="w-12 h-12 flex items-center justify-center bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 rounded-2xl cursor-not-allowed">
                                                                    <X size={20} />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </motion.div>
                            ) : (
                                <motion.div 
                                    key="sugg-tab"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="p-10 grid grid-cols-1 gap-8"
                                >
                                    {filteredSuggestions.map((s) => (
                                        <motion.div 
                                            key={s._id} 
                                            onMouseEnter={() => handleMarkAsRead(s._id)}
                                            className={`bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700/50 p-8 rounded-[2.5rem] transition-all relative group shadow-sm hover:shadow-2xl ${!s.isRead ? 'ring-2 ring-emerald-500/50' : ''}`}
                                        >
                                            {!s.isRead && (
                                                <div className="absolute top-6 left-6 flex items-center gap-1.5">
                                                    <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50" />
                                                    <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">New Priority</span>
                                                </div>
                                            )}
                                            
                                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center font-black text-2xl text-emerald-500 border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none">
                                                        {s.userName.charAt(0)}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <p className="font-black text-2xl text-slate-900 dark:text-white tracking-tight leading-none mb-2">{s.userName}</p>
                                                        <p className="text-xs text-slate-400 font-black uppercase tracking-widest flex items-center gap-2">
                                                            <Mail size={12} className="text-emerald-500" /> {s.userEmail}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] shadow-sm ${
                                                        s.type === 'suggestion' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 
                                                        s.type === 'advice' ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400' : 
                                                        'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
                                                    }`}>
                                                        {s.type}
                                                    </span>
                                                    <button 
                                                        onClick={() => handleDeleteFeedback(s._id)}
                                                        className="p-3 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all group/fdel"
                                                    >
                                                        <Trash2 size={18} className="group-hover/fdel:scale-110" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="relative">
                                                <div className="bg-white dark:bg-slate-800/80 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-700/50 shadow-inner mb-6">
                                                    <p className="text-slate-700 dark:text-slate-300 text-lg leading-relaxed font-medium">
                                                        "{s.content}"
                                                    </p>
                                                    <div className="mt-4 flex justify-end">
                                                        <span className="text-[10px] text-slate-400 font-black flex items-center gap-1.5 uppercase tracking-widest">
                                                            <Clock className="w-3.5 h-3.5" />
                                                            Received {new Date(s.createdAt).toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Admin Reply Display */}
                                                {s.adminReply && (
                                                    <div className="ml-10 bg-emerald-500/5 dark:bg-emerald-500/10 border-l-4 border-emerald-500 p-6 rounded-r-[1.5rem] rounded-bl-[1.5rem] mt-4 relative">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <CheckCircle2 size={16} className="text-emerald-500" />
                                                            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Admin Response Sent</span>
                                                        </div>
                                                        <p className="text-slate-700 dark:text-slate-300 font-bold italic">
                                                            {s.adminReply}
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Reply Input Area */}
                                                <AnimatePresence>
                                                    {replyingTo === s._id ? (
                                                        <motion.div 
                                                            initial={{ opacity: 0, scale: 0.95 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            exit={{ opacity: 0, scale: 0.95 }}
                                                            className="mt-6 flex flex-col gap-4"
                                                        >
                                                            <textarea 
                                                                value={replyText}
                                                                onChange={(e) => setReplyText(e.target.value)}
                                                                placeholder="Type your response here..."
                                                                className="w-full p-6 bg-slate-100 dark:bg-slate-900 border-none rounded-[1.5rem] ring-2 ring-emerald-500/20 focus:ring-emerald-500 transition-all outline-none dark:text-white font-medium resize-none min-h-[120px]"
                                                            />
                                                            <div className="flex gap-4 self-end">
                                                                <button 
                                                                    onClick={() => setReplyingTo(null)}
                                                                    className="px-6 py-2 rounded-xl font-black text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors uppercase text-xs"
                                                                >
                                                                    Cancel
                                                                </button>
                                                                <button 
                                                                    disabled={isSubmittingReply}
                                                                    onClick={() => handleSendReply(s._id)}
                                                                    className="flex items-center gap-2 px-8 py-3 bg-emerald-500 text-white font-black rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                                                                >
                                                                    {isSubmittingReply ? 'Sending...' : 'Send Reply'} <Send size={16} />
                                                                </button>
                                                            </div>
                                                        </motion.div>
                                                    ) : (
                                                        <button 
                                                            onClick={() => {
                                                                setReplyingTo(s._id);
                                                                setReplyText(s.adminReply || '');
                                                            }}
                                                            className="mt-6 flex items-center gap-2 px-8 py-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl font-black text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm group/reply"
                                                        >
                                                            <Reply size={18} className="group-hover/reply:translate-x-1 group-hover/reply:-translate-y-1 transition-transform" /> 
                                                            {s.adminReply ? 'Update Response' : 'Reply to Feedback'}
                                                        </button>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </motion.div>
                                    ))}
                                    {filteredSuggestions.length === 0 && (
                                        <div className="col-span-full py-40 text-center bg-slate-50 dark:bg-slate-900/40 rounded-[3rem]">
                                            <Bell className="w-20 h-20 text-slate-200 dark:text-slate-800 mx-auto mb-6" />
                                            <p className="text-slate-400 text-xl font-black uppercase tracking-widest">No feedback available</p>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    )}
                </motion.div>

                {/* Account Details Overlay (Modal) */}
                <AnimatePresence>
                    {selectedUser && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setSelectedUser(null)}
                                className="absolute inset-0 bg-[#0f172a]/80 backdrop-blur-xl"
                            />
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="bg-white dark:bg-slate-900 rounded-[4rem] shadow-2xl w-full max-w-2xl relative overflow-hidden overflow-y-auto max-h-[90vh] border border-slate-100 dark:border-slate-800"
                            >
                                <div className="p-12 pb-0 flex justify-between items-start">
                                    <div className="flex items-center gap-8">
                                        <div className="w-24 h-24 bg-gradient-to-br from-emerald-600 to-emerald-400 rounded-[2.5rem] flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-emerald-500/40">
                                            {selectedUser.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">{selectedUser.name}</h3>
                                            <p className="text-slate-500 font-bold flex items-center gap-2"><Mail size={16} className="text-emerald-500" /> {selectedUser.email}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setSelectedUser(null)} className="p-4 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors group">
                                        <X size={28} className="text-slate-400 group-hover:rotate-90 transition-transform" />
                                    </button>
                                </div>

                                <div className="p-12 space-y-12">
                                    <div className="grid grid-cols-2 gap-8">
                                        {[
                                            { label: 'Primary Goal', value: selectedUser.financialData?.primaryGoal || 'Asset Generation', icon: Target, color: 'blue' },
                                            { label: 'Risk Profile', value: selectedUser.financialData?.riskProfile || 'Standard', icon: BarChart3, color: 'amber' },
                                            { label: 'Monthly Surplus', value: formatIndianCurrency((selectedUser.financialData?.monthlyIncome || 0) - (selectedUser.financialData?.monthlyExpenses || 0)), icon: DollarSign, color: 'emerald' },
                                            { label: 'Retirement Plan', value: `Retire @ ${selectedUser.financialData?.targetRetirementAge || 60}`, icon: Clock, color: 'purple' }
                                        ].map((item) => (
                                            <div key={item.label} className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700/50 group hover:border-emerald-500/30 transition-colors">
                                                <div className={`p-4 bg-${item.color}-500/10 rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform`}>
                                                    <item.icon className="w-8 h-8 text-emerald-500" />
                                                </div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{item.label}</p>
                                                <p className="text-xl font-black text-slate-900 dark:text-white tracking-tight capitalize">{item.value}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* User Administration Section */}
                                    <div className="pt-10 border-t border-slate-100 dark:border-slate-800">
                                        {selectedUser.email !== 'firepathjjrp@gmail.com' ? (
                                            <div className="bg-red-500/5 p-10 rounded-[3rem] border border-red-500/20 text-center">
                                                <div className="inline-flex p-4 bg-red-500/10 rounded-full text-red-500 mb-6">
                                                    <AlertTriangle size={36} />
                                                </div>
                                                <h4 className="text-2xl font-black text-slate-900 dark:text-white mb-4 italic">ACCOUNT_DELETION</h4>
                                                <p className="text-slate-500 dark:text-slate-400 font-bold mb-8">
                                                    Permanently delete all user files and financial data from the system.
                                                </p>
                                                <button 
                                                    onClick={() => setShowDeleteConfirm(selectedUser._id)}
                                                    className="w-full py-5 bg-red-600 text-white font-black rounded-2xl hover:bg-red-700 transition-all shadow-2xl shadow-red-500/30 flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
                                                >
                                                    Delete Account <Trash2 size={20} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="bg-emerald-500/5 p-10 rounded-[3rem] border border-emerald-500/20 text-center">
                                                <div className="inline-flex p-4 bg-emerald-500/10 rounded-full text-emerald-500 mb-6">
                                                    <ShieldCheck size={36} />
                                                </div>
                                                <h4 className="text-2xl font-black text-emerald-600 mb-4 italic">ADMIN_PROTECTION</h4>
                                                <p className="text-slate-500 dark:text-slate-400 font-bold mb-4">
                                                    This account is system protected. It cannot be deleted.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Account Termination Confirmation Overlay */}
                <AnimatePresence>
                    {showDeleteConfirm && (
                        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => !isDeleting && setShowDeleteConfirm(null)}
                                className="absolute inset-0 bg-[#0f172a]/95 backdrop-blur-2xl"
                            />
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-white dark:bg-slate-900 rounded-[3rem] p-12 max-w-md w-full relative z-10 text-center shadow-2xl border border-slate-100 dark:border-slate-800"
                            >
                                <div className="w-24 h-24 bg-red-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-red-500">
                                    <Trash2 size={48} />
                                </div>
                                <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4 italic">ARE YOU SURE?</h3>
                                <p className="text-slate-500 dark:text-slate-400 font-bold mb-10 leading-relaxed uppercase tracking-widest text-[10px]">
                                    Deleting this user is IRREVERSIBLE. All user history will be lost forever.
                                </p>
                                <div className="flex flex-col gap-5">
                                    <button 
                                        disabled={isDeleting}
                                        onClick={() => handleDeleteUser(showDeleteConfirm)}
                                        className="py-5 bg-red-600 text-white font-black rounded-2xl hover:bg-red-700 transition-all shadow-2xl shadow-red-500/40 disabled:opacity-50 tracking-[0.2em] uppercase text-xs"
                                    >
                                        {isDeleting ? 'Deleting...' : 'CONFIRM DELETE'}
                                    </button>
                                    <button 
                                        disabled={isDeleting}
                                        onClick={() => setShowDeleteConfirm(null)}
                                        className="py-5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all tracking-[0.2em] uppercase text-xs"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};
