import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  BarChart3, 
  Users, 
  UserCircle, 
  Calendar, 
  Settings, 
  LogOut, 
  Plus, 
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  Building2,
  X,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  User,
  Save,
  ArrowLeft,
  Archive,
  Briefcase,
  ListChecks,
  Flag,
  ShieldAlert,
  Activity,
  Pill,
  ClipboardList,
  ShoppingCart,
  Truck,
  BookOpen,
  HeartPulse,
  RefreshCw,
  RefreshCcw,
  FileText,
  AlertTriangle,
  History,
  Link,
  Eye,
  Filter,
  MoreVertical,
  UserPlus,
  Zap,
  ChevronUp,
  ThumbsDown,
  HelpCircle,
  Bell,
  Check,
  UploadCloud,
  Trash2,
  Image,
  File as LucideFile,
  Download,
  FileDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

// --- Types ---
interface User {
  id: string;
  name: string;
  email: string;
  companyId: string;
  company: {
    name: string;
  };
  roleId: string;
  role: {
    name: string;
    permissions: { permission: { key: string } }[];
  }
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: any) => void;
  logout: () => void;
  hasPermission: (key: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Toast System ---
type ToastType = 'success' | 'error' | 'warning' | 'info';
interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  addToast: (message: string, type: ToastType) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: ToastType) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md min-w-[300px] ${
                toast.type === 'success' ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-400' :
                toast.type === 'error' ? 'bg-red-950/90 border-red-500/30 text-red-400' :
                toast.type === 'warning' ? 'bg-amber-950/90 border-amber-500/30 text-amber-400' :
                'bg-slate-900/90 border-slate-700 text-slate-300'
              }`}
            >
              {toast.type === 'success' && <CheckCircle2 size={18} />}
              {toast.type === 'error' && <XCircle size={18} />}
              {toast.type === 'warning' && <AlertTriangle size={18} />}
              {toast.type === 'info' && <Info size={18} />}
              <span className="text-xs font-bold uppercase tracking-widest flex-1">{toast.message}</span>
              <button 
                onClick={() => removeToast(toast.id)}
                className="hover:opacity-60 transition-opacity"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};

// --- Common UI Components ---

const Breadcrumbs = ({ currentView }: { currentView: string }) => {
  const viewLabels: Record<string, string> = {
    dashboard: 'General Console',
    clients: 'Client Directory',
    staff: 'Workforce Registry',
    visits: 'Operation Rota',
    compliance: 'Quality Governance',
    actions: 'Compliance Actions',
    risks: 'Clinical Risk Register',
    audits: 'Quality Audits',
    medication: 'Clinical MAR',
    'medication-orders': 'Pharmacy Supply',
    'care-plans': 'Clinical Care Plans',
    reports: 'Business Intelligence',
    users: 'Identity Management',
    roles: 'Access Control',
    company: 'Institutional Config'
  };

  return (
    <div className="flex items-center gap-2 mb-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] font-mono">
      <span>CARESUITE</span>
      <ChevronRight size={10} className="text-emerald-900/40" />
      <span className="text-emerald-500/80">{viewLabels[currentView] || currentView.toUpperCase()}</span>
    </div>
  );
};

const PageHeader = ({ title, subtitle, actions, currentView }: { title: string, subtitle?: string, actions?: React.ReactNode, currentView?: string }) => {
  return (
    <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
      <div>
        {currentView && <Breadcrumbs currentView={currentView} />}
        <h1 className="text-3xl font-black text-white tracking-tight uppercase leading-none mb-2">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {actions}
      </div>
    </div>
  );
};

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', type = 'destruct' }: { 
  isOpen: boolean, 
  onClose: () => void, 
  onConfirm: () => void, 
  title: string, 
  message: string,
  confirmText?: string,
  type?: 'destruct' | 'primary'
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-[#111413] border border-emerald-900/30 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
        >
          <div className="p-8">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 shadow-lg ${
              type === 'destruct' ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'
            }`}>
              {type === 'destruct' ? <AlertTriangle size={24} /> : <CheckCircle2 size={24} />}
            </div>
            <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-tight">{title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{message}</p>
          </div>
          <div className="bg-[#151917] p-6 flex justify-end gap-3 border-t border-emerald-900/10">
            <button 
              onClick={onClose}
              className="px-6 py-2 rounded-lg text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={() => { onConfirm(); onClose(); }}
              className={`px-8 py-2 rounded-lg text-xs font-bold text-white uppercase tracking-widest transition-all shadow-xl ${
                type === 'destruct' ? 'bg-red-600 hover:bg-red-500 shadow-red-900/20' : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const EmptyState = ({ icon: Icon, title, message, action }: { icon: any, title: string, message: string, action?: React.ReactNode }) => {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center border-2 border-dashed border-emerald-900/10 rounded-2xl bg-emerald-950/5">
      <div className="w-16 h-16 rounded-2xl bg-emerald-950/20 flex items-center justify-center text-emerald-900/40 mb-6">
        <Icon size={32} />
      </div>
      <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-tight">{title}</h3>
      <p className="text-slate-500 text-sm max-w-xs mb-8">{message}</p>
      {action && action}
    </div>
  );
};

const Info = ({ size }: { size: number }) => <AlertCircle size={size} />;

// --- Auth Provider ---
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data && !data.error) {
          setUser(data);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = (userData: any) => setUser(userData);
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      setUser(null);
    }
  };

  const hasPermission = (key: string) => {
    if (!user) return false;
    if (user.role.name === 'Owner') return true;
    return user.role.permissions.some(p => p.permission.key === key);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

// --- Components ---

const NotificationBell = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications?unreadOnly=true');
      const data = await res.json();
      if (Array.isArray(data)) setNotifications(data);
    } catch (err) {
      console.error('Notifications fetch failed:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000); // Check every minute
      return () => clearInterval(interval);
    }
  }, [user]);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error('Mark as read failed:', err);
    }
  };

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications/read-all', { method: 'PATCH' });
      setNotifications([]);
    } catch (err) {
      console.error('Mark all read failed:', err);
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setShowNotifications(!showNotifications)}
        className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-emerald-400 hover:bg-emerald-950/30 border border-emerald-900/20 rounded-full transition-all relative"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-[9px] font-bold text-black flex items-center justify-center rounded-full border-2 border-[#0a0c0b]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {showNotifications && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-3 w-80 bg-[#111413] border border-emerald-900/40 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 overflow-hidden"
            >
              <div className="p-4 border-b border-emerald-900/20 flex justify-between items-center bg-emerald-950/20">
                <h3 className="text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-2">
                  <Bell size={12} className="text-emerald-500" />
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-[9px] text-emerald-500 font-bold hover:underline">Clear All</button>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-10 text-center">
                    <Check size={24} className="mx-auto text-emerald-900/20 mb-3" />
                    <p className="text-[10px] text-slate-600 uppercase font-bold tracking-widest">Inbox Zero</p>
                    <p className="text-[9px] text-slate-700 mt-1 uppercase tracking-tight">You are all caught up</p>
                  </div>
                ) : (
                  notifications.map(notify => (
                    <div key={notify.id} className="p-4 border-b border-emerald-900/10 hover:bg-emerald-500/5 transition-colors group relative">
                      <div className="flex gap-3">
                        <div className={`mt-1 shrink-0 ${
                          notify.type === 'ALERT' ? 'text-red-500' :
                          notify.type === 'WARNING' ? 'text-amber-500' :
                          'text-emerald-500'
                        }`}>
                          {notify.type === 'ALERT' ? <AlertCircle size={14} /> :
                           notify.type === 'WARNING' ? <AlertTriangle size={14} /> :
                           <AlertCircle size={14} />}
                        </div>
                        <div className="flex-1">
                          <p className="text-[11px] font-bold text-white mb-0.5 leading-tight uppercase tracking-tight">{notify.title}</p>
                          <p className="text-[10px] text-slate-400 leading-relaxed mb-2">{notify.message}</p>
                          <div className="flex justify-between items-center">
                            <span className="text-[8px] text-slate-600 font-bold uppercase">{new Date(notify.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            <button 
                              onClick={() => markAsRead(notify.id)}
                              className="text-[9px] text-emerald-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
                            >
                              <Check size={10} /> Mark read
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const Sidebar = ({ currentView, setView }: { currentView: string; setView: (v: string) => void }) => {
  const { user, logout, hasPermission } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, permission: null },
    { id: 'clients', label: 'Clients', icon: UserCircle, permission: 'clients.view' },
    { id: 'staff', label: 'Staff', icon: Users, permission: 'staff.view' },
    { id: 'visits', label: 'Visits / Rota', icon: Calendar, permission: 'visits.view' },
    { id: 'compliance', label: 'Compliance Dashboard', icon: ShieldCheck, permission: 'compliance.view' },
    { id: 'actions', label: 'Actions', icon: ListChecks, permission: 'actions.view' },
    { id: 'risks', label: 'Risks', icon: ShieldAlert, permission: 'risks.view' },
    { id: 'audits', label: 'Audits', icon: ClipboardList, permission: 'audits.view' },
    { id: 'medication', label: 'Medication', icon: Pill, permission: 'medication.view' },
    { id: 'medication-orders', label: 'Med Orders', icon: ShoppingCart, permission: 'medication.orders.view' },
    { id: 'care-plans', label: 'Care Plans', icon: BookOpen, permission: 'carePlans.view' },
    { id: 'reports', label: 'Reports & Export', icon: FileDown, permission: 'reports.view' },
  ];

  const settingsItems = [
    { id: 'users', label: 'Users', icon: Users, permission: 'users.view' },
    { id: 'roles', label: 'Roles', icon: ShieldCheck, permission: 'settings.roles.view' },
    { id: 'company', label: 'Company Settings', icon: Building2, permission: 'company.view' },
  ];

  return (
    <div className="w-64 border-r border-emerald-900/30 flex flex-col h-screen fixed left-0 top-0 bg-[#0a0c0b] z-20">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 emerald-gradient rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-sm"></div>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">CareSuite</h1>
        </div>

        <nav className="space-y-1">
          {menuItems.map(item => {
            if (item.permission && !hasPermission(item.permission)) return null;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`w-full sidebar-link ${currentView === item.id ? 'sidebar-link-active' : ''}`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-8">
          <h2 className="px-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3">Settings</h2>
          <nav className="space-y-1">
            {settingsItems.map(item => {
              if (item.permission && !hasPermission(item.permission)) return null;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  className={`w-full sidebar-link ${currentView === item.id ? 'sidebar-link-active' : ''}`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="mt-auto p-4 border-t border-emerald-900/30">
        <div className="flex items-center gap-3 px-3 py-4 mb-2">
          <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold shrink-0">
            {user?.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold truncate text-white">{user?.name}</p>
            <p className="text-xs text-slate-500 truncate">{user?.role.name}</p>
          </div>
        </div>
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-800/50 hover:text-red-400 transition-all font-medium text-sm"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
};

// --- Views ---

const DashboardView = ({ setView }: { setView: (v: string) => void }) => {
  const [stats, setStats] = useState<any>(null);
  const { hasPermission } = useAuth();

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setStats(data);
        } else {
          console.error('Dashboard stats error:', data);
          setStats({ activeClients: 0, activeStaff: 0, totalVisitsToday: 0, unassignedVisits: 0 });
        }
      })
      .catch(err => {
        console.error('Dashboard fetch error:', err);
        setStats({ activeClients: 0, activeStaff: 0, totalVisitsToday: 0, unassignedVisits: 0 });
      });
  }, []);

  if (!stats) return <div className="p-8 text-slate-500 font-mono text-xs uppercase tracking-widest animate-pulse">Initializing Dashboard Data...</div>;

  const statCards = [
    { label: 'Active Clients', value: stats.activeClients, icon: UserCircle, color: 'text-emerald-500', trend: '+4 this week', bg: 'emerald' },
    { label: 'Staff Active', value: stats.activeStaff, icon: Users, color: 'text-slate-300', trend: 'of 34 active', bg: 'slate' },
    { label: 'Care Meds', value: stats.activeMedications || 0, icon: Pill, color: 'text-emerald-400', trend: `${stats.pendingOrders || 0} orders active`, bg: 'emerald' },
    { label: 'Active Risks', value: stats.openRisks || 0, icon: ShieldAlert, color: 'text-amber-400', trend: `${(stats.highRisks || 0) + (stats.criticalRisks || 0)} threat level`, bg: 'amber' },
    { label: 'Quality Audits', value: stats.totalAudits || 0, icon: ClipboardList, color: 'text-blue-400', trend: `${stats.nonCompliantAudits || 0} non-compliant`, bg: 'blue' },
    { label: 'Overdue Task', value: (stats.overdueActions || 0) + (stats.overdueReviews || 0) + (stats.overdueMedReviews || 0) + (stats.overdueOrders || 0) + (stats.overdueCarePlanReviews || 0) + (stats.overdueAudits || 0), icon: AlertCircle, color: 'text-red-500', trend: 'Immediate attention', isCritical: true, bg: 'red' },
  ];

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <PageHeader 
        title="Command Center" 
        subtitle="Real-time operational governance and clinical oversight"
        currentView="dashboard"
        actions={
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {[1,2,3].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0a0c0b] bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400 uppercase">
                  {['JD', 'AS', 'RL'][i-1]}
                </div>
              ))}
              <div className="w-8 h-8 rounded-full border-2 border-[#0a0c0b] bg-emerald-600 flex items-center justify-center text-[10px] font-bold text-white">
                +8
              </div>
            </div>
            <div className="h-8 w-px bg-emerald-900/30 mx-2"></div>
            <button className="flex items-center gap-2 px-4 py-2 bg-emerald-950/20 border border-emerald-900/30 text-emerald-500 rounded-lg hover:bg-emerald-900/20 transition-all text-[10px] font-bold uppercase tracking-widest">
              <RefreshCw size={12} />
              Refresh
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        {statCards.map(stat => (
          <div key={stat.label} className={`group relative p-6 bg-[#111413] border border-emerald-900/20 rounded-2xl overflow-hidden hover:border-emerald-500/30 transition-all ${stat.isCritical ? 'border-red-900/30' : ''}`}>
            <div className={`absolute top-0 left-0 w-1 h-full ${
              stat.bg === 'emerald' ? 'bg-emerald-500/50' : 
              stat.bg === 'red' ? 'bg-red-500/50' : 
              stat.bg === 'amber' ? 'bg-amber-500/50' : 'bg-slate-500/50'
            }`}></div>
            <div className="flex justify-between items-start mb-4">
              <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${stat.isCritical ? 'text-red-400' : 'text-slate-500'}`}>{stat.label}</p>
              <stat.icon size={16} className={stat.color} />
            </div>
            <div className="flex items-end gap-2">
              <span className={`text-4xl font-black ${stat.isCritical ? 'text-red-500' : 'text-white'} leading-none tracking-tight`}>{stat.value}</span>
              <span className={`text-[9px] font-bold uppercase tracking-widest pb-1 ${stat.isCritical ? 'text-red-400/60' : 'text-emerald-500'}`}>
                {stat.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-[#111413] rounded-2xl border border-emerald-900/20 flex flex-col overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-emerald-900/10 flex justify-between items-center bg-[#151917]/50">
              <h2 className="text-xs font-bold text-white uppercase tracking-[0.2em] flex items-center gap-3">
                <History size={16} className="text-emerald-500" />
                Live Operational Stream
              </h2>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Real-time
                </span>
                <button className="text-[10px] text-slate-500 font-bold hover:text-emerald-400 uppercase tracking-widest flex items-center gap-1 transition-colors">
                  <Filter size={10} />
                  Filter Stream
                </button>
              </div>
            </div>
            <div className="p-0 max-h-[600px] overflow-y-auto custom-scrollbar">
              <ActivityFeed limit={15} />
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#111413] rounded-2xl border border-red-900/10 p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-3xl rounded-full translate-x-12 -translate-y-12"></div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
              <h2 className="text-xs font-bold text-white uppercase tracking-[0.2em]">Priority Indicators</h2>
            </div>
            <div className="space-y-4">
              {[
                ...(stats.criticalActions > 0 ? [{ title: `${stats.criticalActions} Critical Actions`, sub: 'Life safety risk intervention', icon: '!', color: 'text-red-500', bg: 'bg-red-500/10' }] : []),
                ...(stats.nonCompliantAudits > 0 ? [{ title: `${stats.nonCompliantAudits} Non-Compliant Audits`, sub: 'Governance risk level high', icon: 'A', color: 'text-red-500', bg: 'bg-red-500/10' }] : []),
                ...(stats.overdueActions > 0 ? [{ title: `${stats.overdueActions} Overdue Actions`, sub: 'Compliance deadline missed', icon: '!', color: 'text-amber-500', bg: 'bg-amber-500/10' }] : []),
                ...(stats.overdueReviews > 0 ? [{ title: `${stats.overdueReviews} Risk Reviews Due`, sub: 'Assessment update required', icon: 'R', color: 'text-amber-500', bg: 'bg-amber-500/10' }] : []),
                ...(stats.criticalRisks > 0 ? [{ title: `${stats.criticalRisks} Critical Risks`, sub: 'Life safety threat active', icon: '!', color: 'text-red-500', bg: 'bg-red-500/10' }] : []),
                { title: 'System Status', sub: 'All protocols normative', icon: '✓', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
              ].slice(0, 6).map((alert, i) => (
                <div key={i} className="flex gap-4 p-3 rounded-xl border border-transparent hover:border-emerald-900/10 hover:bg-emerald-900/5 transition-all group cursor-pointer">
                  <div className={`w-10 h-10 rounded-xl ${alert.bg} flex-shrink-0 flex items-center justify-center ${alert.color} font-black text-sm`}>{alert.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white font-bold uppercase tracking-tight truncate">{alert.title}</p>
                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-1">{alert.sub}</p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight size={14} className="text-slate-700" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#111413] rounded-2xl border border-emerald-900/20 p-6 shadow-2xl">
            <h2 className="text-xs font-bold text-white uppercase tracking-[0.2em] mb-6">Protocol Rapid Trigger</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Schedule Visit', icon: Calendar, view: 'visits' },
                { label: 'Register Staff', icon: UserPlus, view: 'staff' },
                { label: 'Audit Assets', icon: ClipboardList, view: 'audits' },
                { label: 'Risk Eval', icon: ShieldAlert, view: 'risks' }
              ].map(action => (
                <button 
                  key={action.label}
                  onClick={() => setView(action.view)}
                  className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border border-emerald-900/20 bg-emerald-500/[0.02] hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all group"
                >
                  <action.icon size={20} className="text-emerald-500/50 group-hover:text-emerald-400 transition-colors" />
                  <span className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-400 group-hover:text-white transition-colors">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ActivityFeed = ({ limit = 20, entityType, entityId }: { limit?: number, entityType?: string, entityId?: string }) => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    params.append('limit', String(limit));
    if (entityType) params.append('entityType', entityType);
    if (entityId) params.append('entityId', entityId);

    fetch(`/api/activity-logs?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setLogs(data);
      })
      .catch(err => console.error('Activity logs fetch failed:', err))
      .finally(() => setLoading(false));
  }, [limit, entityType, entityId]);

  if (loading) return <div className="p-8 text-center text-xs text-slate-500">Loading activity...</div>;
  if (logs.length === 0) return <div className="p-8 text-center text-xs text-slate-600">No activity logged yet.</div>;

  return (
    <div className="divide-y divide-emerald-900/10">
      {logs.map(log => (
        <div key={log.id} className="p-4 hover:bg-emerald-900/5 transition-colors">
          <div className="flex gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              log.actionType === 'CREATE' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
              log.actionType === 'UPDATE' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
              log.actionType === 'ARCHIVE' || log.actionType === 'DELETE' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
              'bg-slate-500/10 text-slate-500 border border-slate-500/20'
            }`}>
              {log.actionType === 'CREATE' ? <Plus size={18} /> :
               log.actionType === 'UPDATE' ? <Save size={18} /> :
               log.actionType === 'ARCHIVE' ? <Archive size={18} /> :
               log.actionType === 'COMPLETE' ? <CheckCircle2 size={18} /> :
               log.actionType === 'STATUS_CHANGE' ? <RefreshCw size={18} /> :
               <Activity size={18} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start gap-2 mb-1">
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{log.entityType} • {log.actionType}</span>
                <span className="text-[10px] text-slate-500 whitespace-nowrap">{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <p className="text-sm text-slate-200 leading-snug">{log.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px] text-slate-400 font-bold uppercase">
                  {log.user?.name?.[0] || 'U'}
                </div>
                <p className="text-[10px] text-slate-500">by <span className="text-slate-400 font-medium">{log.user?.name}</span></p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const ListView = ({ title, apiEndpoint, permissionBase, currentView }: { title: string, apiEndpoint: string, permissionBase: string, currentView: string }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { hasPermission } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    fetch(apiEndpoint)
      .then(res => res.json())
      .then(resData => {
        if (Array.isArray(resData)) {
          setData(resData);
        } else {
          console.error('API did not return an array:', resData);
          setData([]);
        }
      })
      .catch(err => {
        console.error('Fetch error:', err);
        addToast('Failed to synchronize with clinical server', 'error');
        setData([]);
      })
      .finally(() => setLoading(false));
  }, [apiEndpoint]);

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <PageHeader 
        title={title} 
        subtitle={`Institutional registry of all ${title.toLowerCase()} records`}
        currentView={currentView}
        actions={
          hasPermission(`${permissionBase}.create`) && (
            <button className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all font-bold text-xs uppercase tracking-[0.1em] shadow-xl shadow-emerald-900/20">
              <Plus size={16} />
              Register New {title.slice(0, -1)}
            </button>
          )
        }
      />

      <div className="premium-card bg-[#111413] border border-emerald-900/10 shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-emerald-900/10 flex items-center gap-4 bg-[#151917]/50">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder={`Query ${title.toLowerCase()} dataset...`}
              className="bg-[#0a0c0b] border border-emerald-900/20 focus:border-emerald-500/50 outline-none rounded-xl pl-11 pr-4 py-2.5 text-slate-200 w-full text-xs font-medium transition-all"
            />
          </div>
          <button className="px-4 py-2.5 bg-slate-800/50 border border-emerald-900/10 text-slate-400 rounded-xl hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
            <Filter size={12} />
            Data Filters
          </button>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-24 text-center">
              <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] font-mono">Synchronizing Data Tiers...</p>
            </div>
          ) : !Array.isArray(data) || data.length === 0 ? (
            <EmptyState 
              icon={Search} 
              title="No Records Identifed" 
              message={`Our clinical database returned an empty set for this ${title.toLowerCase()} query.`}
              action={
                hasPermission(`${permissionBase}.create`) && (
                  <button className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">
                    Create First Entry
                  </button>
                )
              }
            />
          ) : (
            <table className="w-full text-left">
              <thead className="bg-[#151917]/70 text-slate-500 text-[9px] font-black uppercase tracking-[0.2em] border-b border-emerald-900/10">
                <tr>
                  <th className="px-8 py-5">Institutional Link</th>
                  <th className="px-8 py-5">Operational Status</th>
                  <th className="px-8 py-5">Registration Date</th>
                  <th className="px-8 py-5 text-right">Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-900/5">
                {data.map((item) => (
                  <tr key={item.id || item.email} className="group hover:bg-emerald-500/[0.03] transition-colors cursor-pointer">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-950/30 border border-emerald-900/20 flex items-center justify-center text-emerald-500 group-hover:border-emerald-500/30 transition-all">
                          <UserCircle size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm tracking-tight group-hover:text-emerald-400 transition-colors">
                            {item.name || `${item.firstName} ${item.lastName}`}
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono tracking-tight opacity-70">{item.email || item.phone || 'NO_CONTACT_DATA'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex">
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.1em] border flex items-center gap-1.5 ${
                          (item.status === 'ACTIVE' || item.carePackageStatus === 'ACTIVE' || item.employmentStatus === 'ACTIVE') ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                             (item.status === 'ACTIVE' || item.carePackageStatus === 'ACTIVE' || item.employmentStatus === 'ACTIVE') ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'
                          }`}></span>
                          {item.status || item.carePackageStatus || item.employmentStatus || 'UNDEFINED'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-slate-500 text-xs font-mono font-medium">
                      {new Date(item.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="p-2 text-slate-600 hover:text-emerald-500 transition-colors hover:bg-emerald-900/10 rounded-lg">
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="p-4 border-t border-emerald-900/10 bg-[#151917]/30 flex justify-between items-center">
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest font-mono">End of Dataset • {data.length} Records</p>
          <div className="flex gap-2">
            <button className="p-2 border border-emerald-900/10 rounded-lg text-slate-500 disabled:opacity-30" disabled><ArrowLeft size={14}/></button>
            <button className="p-2 border border-emerald-900/10 rounded-lg text-slate-500 disabled:opacity-30" disabled><ChevronRight size={14}/></button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ActionsView = () => {
  const [actions, setActions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    overdue: 'false',
    search: ''
  });
  const { hasPermission } = useAuth();

  const fetchActions = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams(filters);
      const res = await fetch(`/api/actions?${queryParams.toString()}`);
      const data = await res.json();
      if (Array.isArray(data)) setActions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActions();
  }, [filters]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'High': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'Medium': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'Low': return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
      default: return 'text-slate-400';
    }
  };

  const getStatusColor = (status: string, dueDate: string) => {
    if (status === 'Completed') return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    if (status === 'Cancelled') return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
    
    const isOverdue = dueDate && new Date(dueDate) < new Date();
    if (isOverdue) return 'text-red-500 bg-red-500/10 border-red-500/20';
    
    if (status === 'In Progress') return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <PageHeader 
        title="Command Unit: Actions" 
        subtitle="Clinical governance and operational task orchestration"
        currentView="actions"
        actions={
          <div className="flex gap-3">
            <ExportButton entity="actions" filters={filters} />
            {hasPermission('actions.create') && (
              <button 
                onClick={() => { setSelectedAction(null); setIsFormOpen(true); }}
                className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all font-bold text-xs uppercase tracking-widest shadow-xl shadow-emerald-900/20"
              >
                <Plus size={16} />
                New Protocol Action
              </button>
            )}
          </div>
        }
      />

      <div className="premium-card bg-[#111413] border border-emerald-900/10 shadow-2xl overflow-hidden mb-8">
        <div className="p-5 border-b border-emerald-900/10 grid grid-cols-1 md:grid-cols-4 gap-4 bg-[#151917]/50">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Lifecycle Status</label>
            <select 
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full bg-[#0a0c0b] border border-emerald-900/20 focus:border-emerald-500/50 outline-none rounded-xl px-4 py-2.5 text-slate-200 text-xs font-bold uppercase tracking-widest transition-all"
            >
              <option value="">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Threat Level</label>
            <select 
              value={filters.priority}
              onChange={(e) => setFilters({...filters, priority: e.target.value})}
              className="w-full bg-[#0a0c0b] border border-emerald-900/20 focus:border-emerald-500/50 outline-none rounded-xl px-4 py-2.5 text-slate-200 text-xs font-bold uppercase tracking-widest transition-all"
            >
              <option value="">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <div className="flex flex-col justify-end">
            <button 
              onClick={() => setFilters({...filters, overdue: filters.overdue === 'true' ? 'false' : 'true'})}
              className={`flex items-center justify-between px-4 py-2.5 rounded-xl border transition-all ${
                filters.overdue === 'true' 
                  ? 'bg-red-500/10 border-red-500/30 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.1)]' 
                  : 'bg-[#0a0c0b] border-emerald-900/20 text-slate-500 hover:text-slate-300'
              }`}
            >
              <span className="text-[10px] font-black uppercase tracking-widest">Overdue Protocol</span>
              <div className={`w-3 h-3 rounded-full border-2 ${filters.overdue === 'true' ? 'bg-red-500 border-red-400' : 'border-slate-700'}`}></div>
            </button>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Identity Search</label>
            <div className="relative">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search actions..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="w-full bg-[#0a0c0b] border border-emerald-900/20 focus:border-emerald-500/50 outline-none rounded-xl pl-11 pr-4 py-2.5 text-slate-200 text-xs font-bold uppercase tracking-widest transition-all"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#151917]/70 text-slate-500 text-[9px] font-black uppercase tracking-[0.2em] border-b border-emerald-900/10">
              <tr>
                <th className="px-8 py-5">System Priority</th>
                <th className="px-8 py-5">Operational Detail</th>
                <th className="px-8 py-5">Assigned Vector</th>
                <th className="px-8 py-5">Compliance Due</th>
                <th className="px-8 py-5">State</th>
                <th className="px-8 py-5 text-right">Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-900/5">
              {loading ? (
                <tr><td colSpan={6} className="py-24 text-center">
                  <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] font-mono">Synchronizing Action Layer...</p>
                </td></tr>
              ) : actions.length === 0 ? (
                <tr><td colSpan={6}>
                  <EmptyState 
                    icon={ClipboardList} 
                    title="No Matching Protocols" 
                    message="Our system governance engine could not find any action records matching your filter parameters."
                  />
                </td></tr>
              ) : actions.map((action) => {
                const assignedName = action.assignedToUser ? action.assignedToUser.name : 
                                    (action.assignedToStaff ? `${action.assignedToStaff.firstName} ${action.assignedToStaff.lastName}` : 'Unassigned');
                return (
                  <tr 
                    key={action.id} 
                    className={`group hover:bg-emerald-500/[0.03] transition-colors cursor-pointer ${action.priority === 'Critical' && action.status !== 'Completed' ? 'bg-red-500/[0.03]' : ''}`}
                    onClick={() => { setSelectedAction(action); setIsDetailsOpen(true); }}
                  >
                    <td className="px-8 py-6">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.1em] border ${getPriorityColor(action.priority)}`}>
                        {action.priority}
                      </span>
                    </td>
                    <td className="px-8 py-6 min-w-[250px]">
                      <div className="font-bold text-white text-sm tracking-tight group-hover:text-emerald-400 transition-colors uppercase">{action.title}</div>
                      <div className="text-[10px] text-slate-500 font-mono tracking-tight uppercase mt-1 opacity-70">
                        {action.sourceType} • ID-REF: {action.sourceId?.slice(-8).toUpperCase() || 'MANUAL'}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black border transition-all ${
                          (action.assignedToUser || action.assignedToStaff) 
                            ? 'bg-emerald-950/30 border-emerald-900/30 text-emerald-500 group-hover:border-emerald-500/50' 
                            : 'bg-slate-900 border-slate-800 text-slate-700'
                        }`}>
                          {(assignedName !== 'Unassigned') ? assignedName.split(' ').map((n:string)=>n[0]).join('') : '?'}
                        </div>
                        <span className="text-[11px] text-slate-300 font-bold uppercase tracking-tight">{assignedName}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className={`text-xs font-mono font-bold flex items-center gap-2 ${(new Date(action.dueDate) < new Date() && action.status !== 'Completed') ? 'text-red-500' : 'text-slate-500'}`}>
                        <Calendar size={12} className="opacity-50" />
                        {action.dueDate ? new Date(action.dueDate).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase() : 'NO_DATE'}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.1em] border flex items-center gap-1.5 w-fit ${getStatusColor(action.status, action.dueDate)}`}>
                        <span className={`w-1 h-1 rounded-full ${['Open', 'In Progress'].includes(action.status) ? 'bg-current animate-pulse' : 'bg-current'}`}></span>
                        {action.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="p-2 text-slate-600 hover:text-emerald-500 transition-colors hover:bg-emerald-900/10 rounded-lg">
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <ActionForm 
          action={selectedAction} 
          onClose={() => setIsFormOpen(false)} 
          onSuccess={() => { setIsFormOpen(false); fetchActions(); }} 
        />
      )}

      {isDetailsOpen && selectedAction && (
        <ActionDetails
          actionId={selectedAction.id}
          onClose={() => setIsDetailsOpen(false)}
          onUpdate={fetchActions}
        />
      )}
    </div>
  );
};

const ActionForm = ({ action, onClose, onSuccess }: { action?: any, onClose: () => void, onSuccess: () => void }) => {
  const [formData, setFormData] = useState({
    title: action?.title || '',
    description: action?.description || '',
    priority: action?.priority || 'Medium',
    status: action?.status || 'Open',
    sourceType: action?.sourceType || 'Manual',
    sourceId: action?.sourceId || '',
    dueDate: action?.dueDate ? new Date(action.dueDate).toISOString().split('T')[0] : '',
    assignedToUserId: action?.assignedToUserId || '',
    assignedToStaffId: action?.assignedToStaffId || '',
    notes: action?.notes || ''
  });
  const [users, setUsers] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { hasPermission } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [uRes, sRes] = await Promise.all([
          fetch('/api/users'),
          fetch('/api/staff')
        ]);
        const uData = await uRes.json();
        const sData = await sRes.json();
        if (Array.isArray(uData)) setUsers(uData);
        if (Array.isArray(sData)) setStaff(sData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const url = action ? `/api/actions/${action.id}` : '/api/actions';
    const method = action ? 'PUT' : 'POST';

    const payload = {
      ...formData,
      dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else onSuccess();
    } catch (err) {
      setError('Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl bg-[#111413] border border-emerald-900/30 rounded-2xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight uppercase font-sans">
              {action ? 'Modify Action' : 'New Compliance Action'}
            </h2>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold font-mono">System Integrity Override</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-2 bg-slate-900/50 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Action Title</label>
              <input 
                type="text" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="e.g. Audit Medication Records SW1"
                className="form-input font-sans text-sm"
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Requirement Description</label>
              <textarea 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Detailed instructions for compliance..."
                className="form-input min-h-[100px] text-sm font-sans"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Priority Protocol</label>
              <select 
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
                className="form-input font-bold uppercase tracking-widest text-[10px]"
              >
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="High">High Priority</option>
                <option value="Critical">Critical Priority</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Compliance Deadline</label>
              <input 
                type="date" 
                value={formData.dueDate}
                onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                className="form-input font-mono text-xs"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Source Entity</label>
              <select 
                value={formData.sourceType}
                onChange={(e) => setFormData({...formData, sourceType: e.target.value})}
                className="form-input uppercase tracking-widest text-[10px] font-bold"
              >
                <option value="Manual">Manual</option>
                <option value="Audit">Audit</option>
                <option value="Risk">Risk</option>
                <option value="Incident">Incident</option>
                <option value="Medication">Medication</option>
                <option value="Visit">Visit</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status Phase</label>
              <select 
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="form-input uppercase tracking-widest text-[10px] font-bold"
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Assign to Admin (User)</label>
              <select 
                value={formData.assignedToUserId}
                onChange={(e) => setFormData({...formData, assignedToUserId: e.target.value, assignedToStaffId: ''})}
                className="form-input text-xs"
              >
                <option value="">No admin assigned</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role.name})</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Assign to Carer (Staff)</label>
              <select 
                value={formData.assignedToStaffId}
                onChange={(e) => setFormData({...formData, assignedToStaffId: e.target.value, assignedToUserId: ''})}
                className="form-input text-xs"
              >
                <option value="">No staff assigned</option>
                {staff.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName} - {s.jobTitle}</option>)}
              </select>
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t border-emerald-900/10">
            <button 
              type="button" 
              onClick={onClose}
              className="px-6 py-3 rounded-xl border border-emerald-900/30 text-slate-400 font-bold uppercase tracking-widest text-[10px] hover:bg-emerald-900/10 transition-all flex items-center gap-2"
            >
              <X size={14} />
              Abort
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow-xl shadow-emerald-900/40 uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'Syncing...' : (
                <>
                  <Save size={16} />
                  {action ? 'Execute Changes' : 'Initialize Record'}
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const ActionDetails = ({ actionId, onClose, onUpdate }: { actionId: string, onClose: () => void, onUpdate: () => void }) => {
  const [action, setAction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFinishing, setIsFinishing] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');
  const { hasPermission } = useAuth();

  const fetchAction = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/actions/${actionId}`);
      const data = await res.json();
      setAction(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAction();
  }, [actionId]);

  const handleComplete = async () => {
    if (!hasPermission('actions.close')) return;
    setIsFinishing(true);
    try {
      await fetch(`/api/actions/${actionId}/complete`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completionNotes })
      });
      onUpdate();
      fetchAction();
    } catch (err) {
      console.error(err);
    } finally {
      setIsFinishing(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await fetch(`/api/actions/${actionId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      onUpdate();
      fetchAction();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return null;

  const assignedName = action.assignedToUser ? action.assignedToUser.name : 
                      (action.assignedToStaff ? `${action.assignedToStaff.firstName} ${action.assignedToStaff.lastName}` : 'Unassigned');

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl bg-[#111413] border border-emerald-900/30 rounded-2xl shadow-2xl overflow-hidden font-sans"
      >
        <div className="p-8 border-b border-emerald-900/10 bg-[#151917]/50">
          <div className="flex justify-between items-start mb-4">
            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-widest border ${
              action.priority === 'Critical' ? 'text-red-500 border-red-500/30 bg-red-500/5' : 'text-emerald-500 border-emerald-500/30 bg-emerald-500/5'
            }`}>
              {action.priority} PRIORITY
            </span>
            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight mb-2 uppercase">{action.title}</h2>
          <div className="flex items-center gap-6 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
            <div className="flex items-center gap-2">
              <Activity size={14} className="text-emerald-600" />
              STATUS: <span className="text-emerald-400">{action.status}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-emerald-600" />
              DUE: <span className={new Date(action.dueDate) < new Date() ? 'text-red-500' : 'text-slate-400'}>
                {new Date(action.dueDate).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
          <div className="space-y-6">
            <section>
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Requirement Details</h3>
              <p className="text-sm text-slate-300 leading-relaxed font-sans">{action.description}</p>
            </section>

            <section>
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Resource Traceability</h3>
              <div className="bg-[#0a0c0b] border border-emerald-900/20 rounded-lg p-3 space-y-2">
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-500 uppercase font-bold tracking-wider">Source:</span>
                  <span className="text-white font-mono">{action.sourceType}</span>
                </div>
                {action.sourceId && (
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-500 uppercase font-bold tracking-wider">Entity ID:</span>
                    <span className="text-slate-400 font-mono truncate max-w-[150px]">{action.sourceId}</span>
                  </div>
                )}
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-500 uppercase font-bold tracking-wider">Initialized:</span>
                  <span className="text-slate-400 font-mono">{new Date(action.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section>
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Ownership Assignment</h3>
              <div className="flex items-center gap-4 p-4 bg-emerald-950/20 border border-emerald-900/20 rounded-xl mb-4">
                <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-950/50">
                  {assignedName[0]}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{assignedName}</p>
                  <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">
                    {action.assignedToUser ? 'Identity Account' : (action.assignedToStaff ? 'Health Personnel' : 'System Orphan')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {action.status !== 'Completed' && action.status !== 'In Progress' && (
                  <button 
                    onClick={() => handleStatusChange('In Progress')}
                    className="w-full py-2 px-3 border border-emerald-900/30 text-emerald-500 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-900/10 transition-all"
                  >
                    Start Action
                  </button>
                )}
                {action.status !== 'Cancelled' && action.status !== 'Completed' && (
                  <button 
                    onClick={() => handleStatusChange('Cancelled')}
                    className="w-full py-2 px-3 border border-red-900/30 text-red-500 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-red-900/10 transition-all"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </section>

            {action.status !== 'Completed' && hasPermission('actions.close') && (
              <section className="pt-4 border-t border-emerald-900/10 space-y-4">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Finalize Compliance</h3>
                <textarea 
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder="Official notes on completion..."
                  className="form-input min-h-[80px] text-xs font-sans"
                />
                <button 
                  onClick={handleComplete}
                  disabled={isFinishing}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-widest text-[10px] rounded-xl shadow-lg shadow-emerald-900/40 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={16} />
                  {isFinishing ? 'Documenting...' : 'Mark as Completed'}
                </button>
              </section>
            )}

            {action.status === 'Completed' && (
              <section className="pt-4 border-t border-emerald-900/10">
                <div className="p-4 bg-emerald-900/10 border border-emerald-900/30 rounded-xl">
                  <div className="flex items-center gap-2 text-emerald-500 mb-2">
                    <CheckCircle2 size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Compliance Confirmed</span>
                  </div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Authenticated At: <span className="text-white font-mono">{new Date(action.completedAt).toLocaleString()}</span></p>
                  <p className="text-xs text-slate-300 italic">"{action.completionNotes || 'No completion notes provided.'}"</p>
                </div>
              </section>
            )}
          </div>
        </div>
        
        <div className="p-8 border-t border-emerald-900/10 bg-[#0d100e]">
          <AttachmentSection entityType={action.sourceType === 'Incident' ? 'Incident' : 'Action'} entityId={actionId} />
        </div>
      </motion.div>
    </div>
  );
};


const UsersView = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { user: currentUser, hasPermission } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (Array.isArray(data)) setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await fetch('/api/roles');
      const data = await res.json();
      if (Array.isArray(data)) setRoles(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const handleStatusToggle = async (user: any) => {
    if (!hasPermission('users.disable')) return;
    const newStatus = user.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    try {
      const res = await fetch(`/api/users/${user.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.error) alert(data.error);
      else fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRoleChange = async (userId: string, roleId: string) => {
    if (!hasPermission('users.assignRole')) return;
    try {
      const res = await fetch(`/api/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleId })
      });
      const data = await res.json();
      if (data.error) alert(data.error);
      else fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight uppercase mb-1">User Directory</h1>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Manage access and identity</p>
        </div>
        {hasPermission('users.create') && (
          <button 
            onClick={() => { setSelectedUser(null); setIsFormOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-900/20"
          >
            <Plus size={16} />
            Create Member
          </button>
        )}
      </div>

      <div className="premium-card bg-[#111413]">
        <div className="p-4 border-b border-emerald-900/10 flex items-center gap-3 bg-[#151917]">
          <Search size={16} className="text-slate-500" />
          <input 
            type="text" 
            placeholder="Search by name, email or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none focus:ring-0 text-slate-200 w-full text-sm"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#151917]/50 text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-emerald-900/10">
              <tr>
                <th className="px-6 py-4">Identification</th>
                <th className="px-6 py-4">Security Role</th>
                <th className="px-6 py-4">System Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-900/10">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-500 font-mono text-xs uppercase tracking-widest">Scanning network...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-500 font-mono text-xs uppercase tracking-widest">No matching records.</td></tr>
              ) : filteredUsers.map((u) => (
                <tr key={u.id} className="table-row-hover">
                  <td className="px-6 py-4">
                    <div className="font-medium text-white text-sm">{u.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono tracking-tight">{u.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    {hasPermission('users.assignRole') ? (
                      <select 
                        value={u.roleId}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider rounded px-2 py-1 outline-none"
                      >
                        {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                      </select>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{u.role.name}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`badge-emerald ${u.status === 'DISABLED' ? 'bg-red-500/10 text-red-500 border-red-500/20' : ''}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    {hasPermission('users.edit') && (
                      <button 
                        onClick={() => { setSelectedUser(u); setIsFormOpen(true); }}
                        className="text-xs text-emerald-500 font-bold uppercase tracking-widest hover:text-emerald-400 transition-colors"
                      >
                        Edit
                      </button>
                    )}
                    {hasPermission('users.disable') && u.id !== currentUser?.id && (
                      <button 
                        onClick={() => handleStatusToggle(u)}
                        className={`text-xs font-bold uppercase tracking-widest transition-colors ${u.status === 'ACTIVE' ? 'text-red-400 hover:text-red-300' : 'text-emerald-500 hover:text-emerald-400'}`}
                      >
                        {u.status === 'ACTIVE' ? 'Disable' : 'Enable'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <UserForm 
          user={selectedUser} 
          roles={roles}
          onClose={() => setIsFormOpen(false)} 
          onSuccess={() => { setIsFormOpen(false); fetchUsers(); }} 
        />
      )}
    </div>
  );
};

const UserForm = ({ user, roles, onClose, onSuccess }: { user?: any, roles: any[], onClose: () => void, onSuccess: () => void }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    roleId: user?.roleId || roles[0]?.id || ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const url = user ? `/api/users/${user.id}` : '/api/users';
    const method = user ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else onSuccess();
    } catch (err) {
      setError('Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-[#111413] border border-emerald-900/30 rounded-2xl shadow-2xl p-8"
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold text-white tracking-tight uppercase">
            {user ? 'Modify Profile' : 'New Identity'}
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Full Name</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="form-input"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Identity Email</label>
            <input 
              type="email" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="form-input"
              required
            />
          </div>

          {!user && (
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Secure Key</label>
              <input 
                type="password" 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="form-input"
                required
              />
            </div>
          )}

          {!user && (
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Authority Role</label>
              <select 
                value={formData.roleId}
                onChange={(e) => setFormData({...formData, roleId: e.target.value})}
                className="form-input"
                required
              >
                {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 px-6 py-4 rounded-xl border border-emerald-900/30 text-slate-400 font-bold uppercase tracking-widest text-[10px] hover:bg-emerald-900/10 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-xl shadow-emerald-900/40 uppercase tracking-widest text-[10px] transition-all"
            >
              {isSubmitting ? 'Processing...' : (user ? 'Update Profile' : 'Initialize')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};


const RolesView = () => {
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPermEditorOpen, setIsPermEditorOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const { hasPermission } = useAuth();

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/roles');
      const data = await res.json();
      if (Array.isArray(data)) setRoles(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const res = await fetch('/api/permissions');
      const data = await res.json();
      if (Array.isArray(data)) setPermissions(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const handleClone = async (role: any) => {
    const name = prompt(`Enter name for new role:`, `${role.name} (Copy)`);
    if (!name) return;
    try {
      const res = await fetch(`/api/roles/${role.id}/clone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      if (res.ok) fetchRoles();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight uppercase mb-1">Access Control</h1>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Define authority levels and boundaries</p>
        </div>
        {hasPermission('settings.roles.manage') && (
          <button 
            onClick={() => { setSelectedRole(null); setIsFormOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-900/20"
          >
            <ShieldCheck size={16} />
            Develop New Role
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center text-slate-500 font-mono text-xs uppercase tracking-widest">Decoding Authority Matrix...</div>
        ) : roles.map(role => (
          <div key={role.id} className="premium-card bg-[#111413] p-6 hover:border-emerald-500/30 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-950/30 border border-emerald-900/40 flex items-center justify-center text-emerald-500">
                <ShieldCheck size={20} />
              </div>
              {role.isSystem && (
                <span className="text-[8px] font-bold text-emerald-500/80 uppercase tracking-[0.2em] border border-emerald-500/20 px-2 py-0.5 rounded-full">System</span>
              )}
            </div>
            
            <h3 className="text-white font-bold text-lg mb-1">{role.name}</h3>
            <p className="text-slate-500 text-xs mb-6 line-clamp-2 h-8">{role.description || 'No description provided.'}</p>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Privileges</span>
                <span className="text-emerald-400 font-mono text-sm">{role.permissions.length} Enabled</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Active Users</span>
                <span className="text-slate-300 font-mono text-sm">{role._count.users} Assigned</span>
              </div>
            </div>

            <div className="pt-4 border-t border-emerald-900/10 flex items-center justify-between">
              <div className="flex gap-3">
                {hasPermission('settings.roles.manage') && !role.isSystem && role.name !== 'Owner' && (
                  <button 
                    onClick={() => { setSelectedRole(role); setIsFormOpen(true); }}
                    className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest hover:text-emerald-400 transition-colors"
                  >
                    Edit
                  </button>
                )}
                {hasPermission('settings.roles.manage') && (
                  <button 
                    onClick={() => handleClone(role)}
                    className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-white transition-colors"
                  >
                    Clone
                  </button>
                )}
              </div>
              <button 
                onClick={() => { setSelectedRole(role); setIsPermEditorOpen(true); }}
                className="flex items-center gap-2 text-[10px] font-bold text-white uppercase tracking-widest bg-emerald-900/20 px-3 py-1.5 rounded-lg hover:bg-emerald-900/40 transition-colors"
              >
                Permissions
              </button>
            </div>
          </div>
        ))}
      </div>

      {isFormOpen && (
        <RoleForm 
          role={selectedRole} 
          onClose={() => setIsFormOpen(false)} 
          onSuccess={() => { setIsFormOpen(false); fetchRoles(); }} 
        />
      )}

      {isPermEditorOpen && selectedRole && (
        <RolePermissionEditor 
          role={selectedRole}
          allPermissions={permissions}
          onClose={() => setIsPermEditorOpen(false)}
          onSuccess={() => { setIsPermEditorOpen(false); fetchRoles(); }}
        />
      )}
    </div>
  );
};

const RoleForm = ({ role, onClose, onSuccess }: { role?: any, onClose: () => void, onSuccess: () => void }) => {
  const [formData, setFormData] = useState({
    name: role?.name || '',
    description: role?.description || ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const url = role ? `/api/roles/${role.id}` : '/api/roles';
    const method = role ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else onSuccess();
    } catch (err) {
      setError('Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-[#111413] border border-emerald-900/30 rounded-2xl shadow-2xl p-8"
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold text-white tracking-tight uppercase">
            {role ? 'Modify Designation' : 'New Authority Level'}
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Role Name</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="form-input"
              placeholder="e.g. Regional Manager"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Description</label>
            <textarea 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="form-input h-24 resize-none"
              placeholder="Define current responsibilities..."
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 px-6 py-4 rounded-xl border border-emerald-900/30 text-slate-400 font-bold uppercase tracking-widest text-[10px] hover:bg-emerald-900/10 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-xl shadow-emerald-900/40 uppercase tracking-widest text-[10px] transition-all"
            >
              {isSubmitting ? 'Syncing...' : (role ? 'Update Role' : 'Initialize')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const RolePermissionEditor = ({ role, allPermissions, onClose, onSuccess }: { role: any, allPermissions: any[], onClose: () => void, onSuccess: () => void }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(role.permissions.map((p: any) => p.permissionId));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { user: currentUser } = useAuth();

  const categories = Array.from(new Set(allPermissions.map(p => p.group)));

  const togglePermission = (id: string) => {
    if (role.name === 'Owner') return;
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      const res = await fetch(`/api/roles/${role.id}/permissions`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissionIds: selectedIds })
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else onSuccess();
    } catch (err) {
      setError('Failed to save permissions');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex justify-end">
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        className="w-full max-w-2xl bg-[#0a0c0b] h-full flex flex-col shadow-[-20px_0_60px_rgba(0,0,0,0.5)]"
      >
        <div className="p-8 border-b border-emerald-900/10 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight uppercase mb-1">Privilege Matrix</h2>
            <p className="text-xs text-emerald-500 font-mono tracking-widest uppercase">Target Role: {role.name}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 transition-colors text-slate-400">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-12">
          {role.name === 'Owner' && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 text-xs font-bold uppercase tracking-widest flex items-center gap-3">
              <ShieldCheck size={16} />
              Owner profile has immutable master access.
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold uppercase tracking-widest flex items-center gap-3">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {categories.map(cat => (
            <div key={cat} className="space-y-4">
              <div className="flex items-center gap-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-[0.2em]">{cat}</h3>
                <div className="h-px flex-1 bg-emerald-900/10"></div>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {allPermissions.filter(p => p.group === cat).map(p => {
                  const isEnabled = selectedIds.includes(p.id);
                  const isOwner = role.name === 'Owner';
                  return (
                    <div 
                      key={p.id} 
                      onClick={() => !isOwner && togglePermission(p.id)}
                      className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer group ${
                        isEnabled 
                          ? 'bg-emerald-900/10 border-emerald-500/20' 
                          : 'bg-black/20 border-emerald-900/5 hover:border-emerald-900/20'
                      }`}
                    >
                      <div>
                        <p className={`text-sm font-bold transition-colors ${isEnabled ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`}>{p.name}</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">{p.key}</p>
                      </div>
                      <div className={`w-12 h-6 rounded-full relative transition-all ${isEnabled ? 'bg-emerald-500' : 'bg-slate-800'}`}>
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isEnabled ? 'left-7' : 'left-1'}`}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="p-8 border-t border-emerald-900/10 bg-[#0d100e]">
          <div className="flex gap-4">
            <button 
              onClick={onClose}
              className="flex-1 px-6 py-4 rounded-xl border border-emerald-900/30 text-slate-400 font-bold uppercase tracking-widest text-[10px] hover:bg-emerald-900/10 transition-all"
            >
              Discard Changes
            </button>
            <button 
              onClick={handleSave}
              disabled={isSubmitting || role.name === 'Owner'}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-xl shadow-emerald-900/40 uppercase tracking-widest text-[10px] transition-all"
            >
              {isSubmitting ? 'Syncing Matrix...' : 'Commit Permissions'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const AttachmentSection = ({ entityType, entityId }: { entityType: string, entityId: string }) => {
  const [attachments, setAttachments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { hasPermission } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchAttachments = async () => {
    try {
      const res = await fetch(`/api/attachments/${entityType}/${entityId}`);
      const data = await res.json();
      if (Array.isArray(data)) setAttachments(data);
    } catch (err) {
      console.error('Fetch attachments failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttachments();
  }, [entityType, entityId]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('attachment', file);
    formData.append('entityType', entityType);
    formData.append('entityId', entityId);

    try {
      const res = await fetch('/api/attachments/upload', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        fetchAttachments();
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        const err = await res.json();
        alert(err.error || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, fileName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${fileName}"?`)) return;
    try {
      const res = await fetch(`/api/attachments/${id}`, { method: 'DELETE' });
      if (res.ok) fetchAttachments();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const getFileIcon = (type: string) => {
    if (type.includes('image')) return <Image size={18} />;
    if (type.includes('pdf')) return <FileText size={18} />;
    return <LucideFile size={18} />;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Documents & Attachments</h3>
        {hasPermission('attachments.upload') && (
          <div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleUpload} 
              className="hidden" 
              id={`file-upload-${entityId}`} 
            />
            <label 
              htmlFor={`file-upload-${entityId}`}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border border-emerald-500/20 text-emerald-500 text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-500/10 transition-all cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
            >
              {uploading ? <RefreshCw size={12} className="animate-spin" /> : <UploadCloud size={12} />}
              {uploading ? 'Uploading...' : 'Upload File'}
            </label>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center p-8 text-xs text-slate-500 font-mono">Accessing documents...</div>
      ) : attachments.length === 0 ? (
        <div className="text-center p-8 border border-dashed border-emerald-900/20 rounded-xl bg-emerald-950/5">
          <p className="text-[10px] text-slate-600 uppercase font-bold tracking-widest">No documents attached</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2">
          {attachments.map(file => (
            <div key={file.id} className="flex items-center justify-between p-3 rounded-xl bg-[#151917] border border-emerald-900/10 hover:border-emerald-500/30 transition-all group">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-emerald-950/30 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-black transition-all">
                  {getFileIcon(file.fileType)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate max-w-[200px] md:max-w-[300px]">{file.fileName}</p>
                  <p className="text-[9px] text-slate-500 uppercase tracking-tight mt-0.5">
                    {Math.round((file.fileSize || 0) / 1024)} KB • {file.uploadedByUser?.name} • {new Date(file.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <a 
                  href={`/api/attachments/download/${file.id}`} 
                  className="p-2 rounded-lg hover:bg-emerald-500/10 text-emerald-500"
                  title="Download"
                >
                  <Download size={16} />
                </a>
                {hasPermission('attachments.delete') && (
                  <button 
                    onClick={() => handleDelete(file.id, file.fileName)}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-red-400"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ReportsView = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [exporting, setExporting] = useState<string | null>(null);

  const exportData = async (entity: string) => {
    setExporting(entity);
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (status) params.append('status', status);
    if (priority) params.append('priority', priority);

    try {
      const res = await fetch(`/api/reports/export/${entity}?${params.toString()}`);
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Export failed');
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `export_${entity}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Export download failed:', err);
    } finally {
      setExporting(null);
    }
  };

  const reportCards = [
    { id: 'clients', title: 'Clients Directory', description: 'Complete list of clients with care status and funding info.', icon: UserCircle },
    { id: 'staff', title: 'Staff Roster', description: 'Staff members, roles, and employment status.', icon: Users },
    { id: 'visits', title: 'Visit Activity', description: 'Log of all scheduled and completed visits.', icon: Calendar },
    { id: 'actions', title: 'Compliance Actions', description: 'Track all open and closed compliance requirements.', icon: ListChecks },
    { id: 'risks', title: 'Risk Register', description: 'Snapshot of all identified risks and their levels.', icon: ShieldAlert },
    { id: 'audits', title: 'Audit Histories', description: 'Record of all quality audits and results.', icon: ClipboardList },
  ];

  return (
    <div className="p-8">
      <div className="bg-[#111413] rounded-2xl border border-emerald-900/20 overflow-hidden mb-8">
        <div className="p-6 border-b border-emerald-900/20 bg-emerald-950/10">
          <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <Filter size={14} className="text-emerald-500" />
            Report Filters
          </h3>
          <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-tight">Apply filters to refine your data exports</p>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Start Date</label>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-[#0a0c0b] border border-emerald-900/30 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">End Date</label>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-[#0a0c0b] border border-emerald-900/30 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">General Status</label>
            <select 
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-[#0a0c0b] border border-emerald-900/30 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="Open">Open</option>
              <option value="Completed">Completed</option>
              <option value="COMPLETED">Completed (Visits)</option>
              <option value="MISSED">Missed (Visits)</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Priority / Level</label>
            <select 
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full bg-[#0a0c0b] border border-emerald-900/30 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50"
            >
              <option value="">All Levels</option>
              <option value="High">High / Critical</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportCards.map(report => {
          const Icon = report.icon;
          return (
            <div key={report.id} className="bg-[#111413] rounded-2xl border border-emerald-900/20 p-6 hover:border-emerald-500/30 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-950/30 flex items-center justify-center text-emerald-500 mb-4 group-hover:scale-110 transition-transform">
                <Icon size={24} />
              </div>
              <h4 className="text-sm font-bold text-white mb-2 uppercase tracking-wide">{report.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed mb-6 h-12 overflow-hidden">{report.description}</p>
              
              <button 
                onClick={() => exportData(report.id)}
                disabled={exporting === report.id}
                className="w-full py-3 bg-emerald-500 text-black text-[10px] font-bold uppercase tracking-[0.2em] rounded-lg hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
              >
                {exporting === report.id ? (
                  <>
                    <RefreshCw size={12} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileDown size={14} />
                    Export CSV
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ExportButton = ({ entity, filters = {} }: { entity: string, filters?: any }) => {
  const [exporting, setExporting] = useState(false);
  const { hasPermission } = useAuth();

  if (!hasPermission('reports.export')) return null;

  const handleExport = async () => {
    setExporting(true);
    const params = new URLSearchParams(filters);
    try {
      const res = await fetch(`/api/reports/export/${entity}?${params.toString()}`);
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Export failed');
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `export_${entity}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Export download failed:', err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <button 
      onClick={handleExport}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-emerald-900/40 text-slate-400 text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-900/20 hover:text-white transition-all"
    >
      {exporting ? <RefreshCw size={12} className="animate-spin" /> : <FileDown size={12} />}
      {exporting ? 'Exporting...' : 'Export CSV'}
    </button>
  );
};

const ClientsView = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const { hasPermission } = useAuth();
  const { addToast } = useToast();
  const [viewMode, setViewMode] = useState<'list' | 'profile'>('list');
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean, id: string, archive: boolean }>({ isOpen: false, id: '', archive: false });

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/clients?archived=${showArchived ? 'true' : 'false'}&search=${searchQuery}`);
      const data = await res.json();
      if (Array.isArray(data)) setClients(data);
    } catch (err) {
      console.error(err);
      addToast('Failed to retrieve client data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchClients();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, showArchived]);

  const handleArchive = async (id: string, archive: boolean) => {
    try {
      const res = await fetch(`/api/clients/${id}/archive`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archive })
      });
      if (res.ok) {
        addToast(archive ? 'Client archived successfully' : 'Client record restored', 'success');
        fetchClients();
      } else {
        addToast('Operation failed', 'error');
      }
    } catch (err) {
      console.error(err);
      addToast('System error during archive', 'error');
    }
  };

  if (viewMode === 'profile' && selectedClient) {
    return (
      <ClientProfile 
        client={selectedClient} 
        onBack={() => setViewMode('list')} 
        onEdit={() => setIsFormOpen(true)}
      />
    );
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <PageHeader 
        title="Client Directory" 
        subtitle={`Managing ${clients.length} supported lives across the network`}
        currentView="clients"
        actions={
          <div className="flex gap-3">
            <button 
              onClick={() => setShowArchived(!showArchived)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                showArchived 
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' 
                  : 'bg-emerald-950/20 border-emerald-900/30 text-emerald-500 hover:bg-emerald-900/20'
              }`}
            >
              {showArchived ? 'View Active' : 'View Archived'}
            </button>
            <ExportButton entity="clients" />
            {hasPermission('clients.create') && (
              <button 
                onClick={() => { setSelectedClient(null); setIsFormOpen(true); }}
                className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all font-bold text-xs uppercase tracking-widest shadow-xl shadow-emerald-900/20"
              >
                <Plus size={16} />
                Register Client
              </button>
            )}
          </div>
        }
      />

      <div className="premium-card bg-[#111413] mb-6">
        <div className="p-4 border-b border-emerald-900/10 flex items-center gap-3 bg-[#151917]">
          <Search size={16} className="text-slate-500" />
          <input 
            type="text" 
            placeholder="Search by name, postcode, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none focus:ring-0 text-slate-200 w-full text-sm"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#151917]/50 text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-emerald-900/10">
              <tr>
                <th className="px-6 py-4">Client Name</th>
                <th className="px-6 py-4">Status & Funding</th>
                <th className="px-6 py-4">Contact Info</th>
                <th className="px-6 py-4">Postcode</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-900/10">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-mono text-xs uppercase tracking-widest">Accessing records...</td></tr>
              ) : clients.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-mono text-xs uppercase tracking-widest">No clients found.</td></tr>
              ) : clients.map((c) => (
                <tr key={c.id} className="table-row-hover group">
                  <td className="px-6 py-4">
                    <div className="font-medium text-white text-sm">{c.firstName} {c.lastName}</div>
                    <div className="text-[10px] text-slate-500 font-mono tracking-tight">DOB: {c.dateOfBirth ? new Date(c.dateOfBirth).toLocaleDateString() : 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className={`badge-emerald w-fit ${c.carePackageStatus === 'ARCHIVED' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : ''}`}>
                        {c.carePackageStatus}
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{c.fundingType || 'Private'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-slate-300">{c.phone || 'No phone'}</div>
                    <div className="text-[10px] text-slate-500 truncate max-w-[150px]">{c.email || 'No email'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-mono text-emerald-500/80">{c.postcode || 'N/A'}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => { setSelectedClient(c); setViewMode('profile'); }}
                        className="text-xs text-emerald-500 font-bold uppercase tracking-widest hover:text-emerald-400"
                      >
                        Profile
                      </button>
                      {hasPermission('clients.edit') && (
                        <button 
                          onClick={() => { setSelectedClient(c); setIsFormOpen(true); }}
                          className="text-xs text-slate-400 font-bold uppercase tracking-widest hover:text-white"
                        >
                          Edit
                        </button>
                      )}
                      {hasPermission('clients.archive') && (
                        <button 
                          onClick={() => handleArchive(c.id, !c.archivedAt)}
                          className="text-xs text-red-500/70 font-bold uppercase tracking-widest hover:text-red-400"
                        >
                          {c.archivedAt ? 'Restore' : 'Archive'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <ClientForm 
          client={selectedClient} 
          onClose={() => setIsFormOpen(false)} 
          onSuccess={() => { 
            console.log('ClientForm onSuccess triggered');
            setIsFormOpen(false); 
            fetchClients(); 
          }} 
        />
      )}
    </div>
  );
};

const ClientProfile = ({ client, onBack, onEdit }: { client: any, onBack: () => void, onEdit: () => void }) => {
  return (
    <div className="p-8 max-w-5xl mx-auto">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-6 text-xs font-bold uppercase tracking-widest"
      >
        <ArrowLeft size={16} />
        Back to Directory
      </button>

      <div className="premium-card bg-[#111413] p-8 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-emerald-600 flex items-center justify-center text-3xl font-bold text-white shadow-xl shadow-emerald-900/20">
              {client.firstName[0]}{client.lastName[0]}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-white">{client.firstName} {client.lastName}</h1>
                <span className="badge-emerald">{client.carePackageStatus}</span>
              </div>
              <p className="text-slate-500 text-sm flex items-center gap-2">
                <MapPin size={14} /> {client.town}, {client.postcode}
              </p>
            </div>
          </div>
          <button 
            onClick={onEdit}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-900/20"
          >
            Edit Profile
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
          <div className="space-y-6">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Personal Details</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-950/30 flex items-center justify-center text-emerald-500"><CalendarDays size={16} /></div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Date of Birth</p>
                  <p className="text-sm text-slate-200">{client.dateOfBirth ? new Date(client.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-950/30 flex items-center justify-center text-emerald-500"><Phone size={16} /></div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Direct Phone</p>
                  <p className="text-sm text-slate-200">{client.phone || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-950/30 flex items-center justify-center text-emerald-500"><Mail size={16} /></div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Email Address</p>
                  <p className="text-sm text-slate-200">{client.email || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Primary Contact</h3>
            <div className="p-4 rounded-xl bg-[#151917] border border-emerald-900/10">
              <p className="text-[10px] text-emerald-500 uppercase font-bold tracking-[0.2em] mb-2">Emergency Contact</p>
              <p className="text-white font-bold text-lg mb-1">{client.primaryContactName || 'None listed'}</p>
              <p className="text-xs text-slate-400 mb-4">{client.primaryContactRelationship || 'N/A'}</p>
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-mono">
                <Phone size={14} /> {client.primaryContactPhone || 'N/A'}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Operational</h3>
            <div className="space-y-4">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Funding Type</span>
                <span className="text-sm text-slate-200">{client.fundingType || 'Not specified'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Address Record</span>
                <p className="text-sm text-slate-200 leading-relaxed mt-1">
                  {client.addressLine1}<br/>
                  {client.addressLine2 && <>{client.addressLine2}<br/></>}
                  {client.town}<br/>
                  {client.postcode}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-10 border-t border-emerald-900/10">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Care Notes</h3>
          <div className="bg-[#0a0c0b] p-6 rounded-xl border border-emerald-900/5 text-slate-400 text-sm leading-relaxed italic mb-10">
            {client.notes || 'No operational notes recorded for this client.'}
          </div>

          <AttachmentSection entityType="Client" entityId={client.id} />
        </div>
      </div>
    </div>
  );
};

const ClientForm = ({ client, onClose, onSuccess }: { client?: any, onClose: () => void, onSuccess: () => void }) => {
  const { logout } = useAuth();
  const [formData, setFormData] = useState({
    firstName: client?.firstName || '',
    lastName: client?.lastName || '',
    dateOfBirth: client?.dateOfBirth ? new Date(client.dateOfBirth).toISOString().split('T')[0] : '',
    email: client?.email || '',
    phone: client?.phone || '',
    addressLine1: client?.addressLine1 || '',
    addressLine2: client?.addressLine2 || '',
    town: client?.town || '',
    postcode: client?.postcode || '',
    carePackageStatus: client?.carePackageStatus || 'ACTIVE',
    fundingType: client?.fundingType || 'Private',
    primaryContactName: client?.primaryContactName || '',
    primaryContactPhone: client?.primaryContactPhone || '',
    primaryContactRelationship: client?.primaryContactRelationship || '',
    notes: client?.notes || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const url = client ? `/api/clients/${client.id}` : '/api/clients';
    const method = client ? 'PUT' : 'POST';

    let payload;
    try {
      payload = {
        ...formData,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : null
      };
    } catch (e) {
      setError('Invalid date format');
      setIsSubmitting(false);
      return;
    }

    try {
      console.log('Submitting payload:', payload);
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 15000); // 15s timeout

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(id);

      if (res.status === 401) {
        setIsSubmitting(false);
        logout(); // Automatically redirect to login by clearing user state
        return;
      }

      const text = await res.text();
      console.log('Raw response text:', text);
      
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseErr) {
        console.error('Failed to parse response as JSON:', text);
        setError('Server returned an invalid response format.');
        setIsSubmitting(false);
        return;
      }

      console.log('Parsed response data:', data);
      if (data.error) {
        setError(data.error + (data.details ? `: ${data.details}` : ''));
      }
      else onSuccess();
    } catch (err) {
      console.error('Submit error:', err);
      if (err instanceof Error && err.name === 'AbortError') {
        setError('Request timed out. The server might be busy.');
      } else {
        setError('Connection failed. Please check network or try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl bg-[#111413] border border-emerald-900/30 rounded-2xl shadow-2xl p-8 my-auto"
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold text-white tracking-tight uppercase">
            {client ? 'Edit Client Record' : 'Client Registration'}
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-6">
              <h3 className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Base Identity</h3>
              <div className="space-y-4">
                <input 
                  type="text" placeholder="First Name" required
                  value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})}
                  className="form-input"
                />
                <input 
                  type="text" placeholder="Last Name" required
                  value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})}
                  className="form-input"
                />
                <input 
                  type="date" placeholder="Date of Birth"
                  value={formData.dateOfBirth} onChange={e => setFormData({...formData, dateOfBirth: e.target.value})}
                  className="form-input"
                />
                <select 
                  value={formData.carePackageStatus} onChange={e => setFormData({...formData, carePackageStatus: e.target.value})}
                  className="form-input"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                  <option value="HOSPITAL">HOSPITAL</option>
                  <option value="PENDING">PENDING</option>
                </select>
              </div>
            </div>

            <div className="md:col-span-1 space-y-6 md:border-x md:px-6 border-emerald-900/10">
              <h3 className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Residence & Contact</h3>
              <div className="space-y-4">
                <input 
                  type="text" placeholder="Address Line 1"
                  value={formData.addressLine1} onChange={e => setFormData({...formData, addressLine1: e.target.value})}
                  className="form-input"
                />
                <input 
                  type="text" placeholder="Town"
                  value={formData.town} onChange={e => setFormData({...formData, town: e.target.value})}
                  className="form-input"
                />
                <input 
                  type="text" placeholder="Postcode"
                  value={formData.postcode} onChange={e => setFormData({...formData, postcode: e.target.value})}
                  className="form-input"
                />
                <input 
                  type="email" placeholder="Email (optional)"
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                  className="form-input"
                />
                <input 
                  type="tel" placeholder="Phone"
                  value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="form-input"
                />
              </div>
            </div>

            <div className="md:col-span-1 space-y-6">
              <h3 className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Care Context</h3>
              <div className="space-y-4">
                <select 
                  value={formData.fundingType} onChange={e => setFormData({...formData, fundingType: e.target.value})}
                  className="form-input"
                >
                  <option value="Private">Private</option>
                  <option value="Social Services">Social Services</option>
                  <option value="Direct Payment">Direct Payment</option>
                  <option value="NHS">NHS</option>
                </select>
                <div className="pt-4 space-y-3">
                  <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Emergency Advocate</p>
                  <input 
                    type="text" placeholder="Contact Name"
                    value={formData.primaryContactName} onChange={e => setFormData({...formData, primaryContactName: e.target.value})}
                    className="form-input"
                  />
                  <input 
                    type="tel" placeholder="Contact Phone"
                    value={formData.primaryContactPhone} onChange={e => setFormData({...formData, primaryContactPhone: e.target.value})}
                    className="form-input"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Confidential Care Insights</label>
            <textarea 
              value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}
              className="w-full bg-[#050706] border border-emerald-900/30 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none transition-all h-24 resize-none"
              placeholder="Record any specific care requirements or risks..."
            />
          </div>

          <div className="flex gap-4 pt-4 border-t border-emerald-900/10">
            <button 
              type="button" onClick={onClose}
              className="px-8 py-4 rounded-xl border border-emerald-900/30 text-slate-400 font-bold uppercase tracking-widest text-[10px] hover:bg-emerald-900/10 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit" disabled={isSubmitting}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-xl shadow-emerald-900/40 uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3"
            >
              {isSubmitting ? 'Finalizing Sync...' : (
                <>
                  <Save size={16} />
                  {client ? 'Commit Changes' : 'Initialize Record'}
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const StaffView = () => {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const { hasPermission } = useAuth();
  const { addToast } = useToast();
  const [viewMode, setViewMode] = useState<'list' | 'profile'>('list');
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean, id: string, archive: boolean }>({ isOpen: false, id: '', archive: false });

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/staff?archived=${showArchived ? 'true' : 'false'}&search=${searchQuery}`);
      const data = await res.json();
      if (Array.isArray(data)) setStaff(data);
    } catch (err) {
      console.error(err);
      addToast('Failed to retrieve workforce data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStaff();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, showArchived]);

  const handleArchive = async (id: string, archive: boolean) => {
    try {
      const res = await fetch(`/api/staff/${id}/archive`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archive })
      });
      if (res.ok) {
        addToast(archive ? 'Staff member deactivated' : 'Staff member reactivated', 'success');
        fetchStaff();
      } else {
        addToast('Operation failed', 'error');
      }
    } catch (err) {
      console.error(err);
      addToast('Network error during deactivation', 'error');
    }
  };

  if (viewMode === 'profile' && selectedStaff) {
    return (
      <StaffProfile 
        staff={selectedStaff} 
        onBack={() => setViewMode('list')} 
        onEdit={() => setIsFormOpen(true)}
      />
    );
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <PageHeader 
        title="Human Resources" 
        subtitle={`Overseeing ${staff.length} professional caregivers across active rotas`}
        currentView="staff"
        actions={
          <div className="flex gap-3">
            <button 
              onClick={() => setShowArchived(!showArchived)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                showArchived 
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' 
                  : 'bg-emerald-950/20 border-emerald-900/30 text-emerald-500 hover:bg-emerald-900/20'
              }`}
            >
              {showArchived ? 'View Active' : 'View Inactive'}
            </button>
            <ExportButton entity="staff" />
            {hasPermission('staff.create') && (
              <button 
                onClick={() => { setSelectedStaff(null); setIsFormOpen(true); }}
                className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all font-bold text-xs uppercase tracking-widest shadow-xl shadow-emerald-900/20"
              >
                <Plus size={16} />
                Onboard Personnel
              </button>
            )}
          </div>
        }
      />

      <div className="premium-card bg-[#111413] mb-6">
        <div className="p-4 border-b border-emerald-900/10 flex items-center gap-3 bg-[#151917]">
          <Search size={16} className="text-slate-500" />
          <input 
            type="text" 
            placeholder="Search by name, position, or postcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none focus:ring-0 text-slate-200 w-full text-sm"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#151917]/50 text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-emerald-900/10">
              <tr>
                <th className="px-6 py-4">Staff Member</th>
                <th className="px-6 py-4">Role & Status</th>
                <th className="px-6 py-4">Contact Detail</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-900/10">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-mono text-xs uppercase tracking-widest">Scanning workforce...</td></tr>
              ) : staff.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-mono text-xs uppercase tracking-widest">No staff records found.</td></tr>
              ) : staff.map((s) => (
                <tr key={s.id} className="table-row-hover group">
                  <td className="px-6 py-4">
                    <div className="font-medium text-white text-sm">{s.firstName} {s.lastName}</div>
                    <div className="text-[10px] text-slate-500 font-mono tracking-tight">ID: {s.id.slice(-8).toUpperCase()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className={`badge-emerald w-fit ${s.employmentStatus === 'INACTIVE' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : ''}`}>
                        {s.employmentStatus}
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{s.jobTitle || 'Care Assistant'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-slate-300">{s.phone || 'No phone'}</div>
                    <div className="text-[10px] text-slate-500 truncate max-w-[150px]">{s.email || 'No email'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-mono text-emerald-500/80">{s.postcode || 'N/A'}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => { setSelectedStaff(s); setViewMode('profile'); }}
                        className="text-xs text-emerald-500 font-bold uppercase tracking-widest hover:text-emerald-400"
                      >
                        Profile
                      </button>
                      {hasPermission('staff.edit') && (
                        <button 
                          onClick={() => { setSelectedStaff(s); setIsFormOpen(true); }}
                          className="text-xs text-slate-400 font-bold uppercase tracking-widest hover:text-white"
                        >
                          Edit
                        </button>
                      )}
                      {hasPermission('staff.archive') && (
                        <button 
                          onClick={() => handleArchive(s.id, !s.archivedAt)}
                          className="text-xs text-red-500/70 font-bold uppercase tracking-widest hover:text-red-400"
                        >
                          {s.archivedAt ? 'Reactivate' : 'Deactivate'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <StaffForm 
          staff={selectedStaff} 
          onClose={() => { setIsFormOpen(false); setSelectedStaff(null); }} 
          onSuccess={() => { setIsFormOpen(false); setSelectedStaff(null); fetchStaff(); }}
        />
      )}

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={() => handleArchive(confirmModal.id, confirmModal.archive)}
        title={confirmModal.archive ? 'Deactivate Professional Record' : 'Reactivate Professional Record'}
        message={confirmModal.archive 
          ? 'This will deactivate the staff member from active rotas and clinical operations. Compliance data will be preserved.'
          : 'This will restore the staff member to active status and enable rota allocation.'
        }
        confirmText={confirmModal.archive ? 'Confirm Deactivation' : 'Reactivate Record'}
        type={confirmModal.archive ? 'destruct' : 'primary'}
      />
    </div>
  );
};

const StaffProfile = ({ staff, onBack, onEdit }: { staff: any, onBack: () => void, onEdit: () => void }) => {
  return (
    <div className="p-8 max-w-5xl mx-auto">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-6 text-xs font-bold uppercase tracking-widest"
      >
        <ArrowLeft size={16} />
        Return to Directory
      </button>

      <div className="premium-card bg-[#111413] p-8 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-slate-800 border border-emerald-500/20 flex items-center justify-center text-3xl font-bold text-emerald-500 shadow-xl">
              {staff.firstName[0]}{staff.lastName[0]}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-white">{staff.firstName} {staff.lastName}</h1>
                <span className={`badge-emerald ${staff.employmentStatus === 'INACTIVE' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : ''}`}>
                  {staff.employmentStatus}
                </span>
              </div>
              <p className="text-slate-500 text-sm flex items-center gap-2">
                <Briefcase size={14} /> {staff.jobTitle || 'Care Professional'}
              </p>
            </div>
          </div>
          <button 
            onClick={onEdit}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-900/20"
          >
            Update Profile
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
          <div className="space-y-6">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Identification</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-950/30 flex items-center justify-center text-emerald-500"><CalendarDays size={16} /></div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Date of Birth</p>
                  <p className="text-sm text-slate-200">{staff.dateOfBirth ? new Date(staff.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-950/30 flex items-center justify-center text-emerald-500"><Phone size={16} /></div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Direct Line</p>
                  <p className="text-sm text-slate-200">{staff.phone || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-950/30 flex items-center justify-center text-emerald-500"><Mail size={16} /></div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Email Identity</p>
                  <p className="text-sm text-slate-200">{staff.email || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Emergency Contact</h3>
            <div className="p-4 rounded-xl bg-[#151917] border border-emerald-900/10">
              <p className="text-[10px] text-emerald-500 uppercase font-bold tracking-[0.2em] mb-2">Primary Advocate</p>
              <p className="text-white font-bold text-lg mb-1">{staff.emergencyContactName || 'None listed'}</p>
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-mono mt-4">
                <Phone size={14} /> {staff.emergencyContactPhone || 'N/A'}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Employment</h3>
            <div className="space-y-4">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Start Date</span>
                <span className="text-sm text-slate-200">{staff.startDate ? new Date(staff.startDate).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Contracted Hours</span>
                <span className="text-sm text-slate-200">{staff.contractedHours || 0} hrs / week</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Home Base</span>
                <p className="text-sm text-slate-200 leading-relaxed mt-1">
                  {staff.addressLine1}<br/>
                  {staff.town}<br/>
                  {staff.postcode}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-10 border-t border-emerald-900/10">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Personnel Notes</h3>
          <div className="bg-[#0a0c0b] p-6 rounded-xl border border-emerald-900/5 text-slate-400 text-sm leading-relaxed italic mb-10">
            {staff.notes || 'No significant personnel history recorded.'}
          </div>

          <AttachmentSection entityType="Staff" entityId={staff.id} />
        </div>
      </div>
    </div>
  );
};

const StaffForm = ({ staff, onClose, onSuccess }: { staff?: any, onClose: () => void, onSuccess: () => void }) => {
  const [formData, setFormData] = useState({
    firstName: staff?.firstName || '',
    lastName: staff?.lastName || '',
    dateOfBirth: staff?.dateOfBirth ? new Date(staff.dateOfBirth).toISOString().split('T')[0] : '',
    email: staff?.email || '',
    phone: staff?.phone || '',
    addressLine1: staff?.addressLine1 || '',
    addressLine2: staff?.addressLine2 || '',
    town: staff?.town || '',
    postcode: staff?.postcode || '',
    jobTitle: staff?.jobTitle || '',
    employmentStatus: staff?.employmentStatus || 'ACTIVE',
    startDate: staff?.startDate ? new Date(staff.startDate).toISOString().split('T')[0] : '',
    contractedHours: staff?.contractedHours || 0,
    emergencyContactName: staff?.emergencyContactName || '',
    emergencyContactPhone: staff?.emergencyContactPhone || '',
    notes: staff?.notes || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const url = staff ? `/api/staff/${staff.id}` : '/api/staff';
    const method = staff ? 'PUT' : 'POST';

    const payload = {
      ...formData,
      dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : null,
      startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
      contractedHours: Number(formData.contractedHours)
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else onSuccess();
    } catch (err) {
      setError('Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl bg-[#111413] border border-emerald-900/30 rounded-2xl shadow-2xl p-8 my-auto"
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold text-white tracking-tight uppercase">
            {staff ? 'Amend Workforce Data' : 'Personnel Commissioning'}
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-6">
              <h3 className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Base Identity</h3>
              <div className="space-y-4">
                <input 
                  type="text" placeholder="First Name" required
                  value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})}
                  className="form-input"
                />
                <input 
                  type="text" placeholder="Last Name" required
                  value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})}
                  className="form-input"
                />
                <input 
                  type="date" placeholder="Date of Birth"
                  value={formData.dateOfBirth} onChange={e => setFormData({...formData, dateOfBirth: e.target.value})}
                  className="form-input"
                />
                <select 
                  value={formData.employmentStatus} onChange={e => setFormData({...formData, employmentStatus: e.target.value})}
                  className="form-input"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="PROBATION">PROBATION</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>
            </div>

            <div className="md:col-span-1 space-y-6 md:border-x md:px-6 border-emerald-900/10">
              <h3 className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Professional Context</h3>
              <div className="space-y-4">
                <input 
                  type="text" placeholder="Job Title" required
                  value={formData.jobTitle} onChange={e => setFormData({...formData, jobTitle: e.target.value})}
                  className="form-input"
                />
                <input 
                  type="date" placeholder="Employment Start Date"
                  value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})}
                  className="form-input"
                />
                <div className="space-y-1">
                  <label className="text-[8px] font-bold text-slate-500 uppercase px-1">Contract Hours</label>
                  <input 
                    type="number" placeholder="Contract Hours"
                    value={formData.contractedHours} onChange={e => setFormData({...formData, contractedHours: e.target.value})}
                    className="form-input"
                  />
                </div>
                <input 
                  type="email" placeholder="Professional Email"
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                  className="form-input"
                />
              </div>
            </div>

            <div className="md:col-span-1 space-y-6">
              <h3 className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Emergency & Contact</h3>
              <div className="space-y-4">
                <input 
                  type="tel" placeholder="Primary Phone"
                  value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="form-input"
                />
                <div className="pt-4 space-y-3">
                  <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Emergency Contact</p>
                  <input 
                    type="text" placeholder="Full Name"
                    value={formData.emergencyContactName} onChange={e => setFormData({...formData, emergencyContactName: e.target.value})}
                    className="form-input"
                  />
                  <input 
                    type="tel" placeholder="Emergency Phone"
                    value={formData.emergencyContactPhone} onChange={e => setFormData({...formData, emergencyContactPhone: e.target.value})}
                    className="form-input"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Personnel Notes</label>
            <textarea 
              value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}
              className="form-input h-24 resize-none"
              placeholder="Internal record of performance, certifications, or disciplinary history..."
            />
          </div>

          <div className="flex gap-4 pt-4 border-t border-emerald-900/10">
            <button 
              type="button" onClick={onClose}
              className="px-8 py-4 rounded-xl border border-emerald-900/30 text-slate-400 font-bold uppercase tracking-widest text-[10px] hover:bg-emerald-900/10 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit" disabled={isSubmitting}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-xl shadow-emerald-900/40 uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3"
            >
              <Save size={16} />
              {isSubmitting ? 'Optimizing Personnel Matrix...' : (staff ? 'Commit Amendments' : 'Execute Onboarding')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const RotaView = () => {
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<any>(null);
  const { hasPermission } = useAuth();

  const fetchVisits = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/visits?date=${selectedDate}`);
      const data = await res.json();
      if (Array.isArray(data)) setVisits(data);
      else setVisits([]);
    } catch (err) {
      console.error(err);
      setVisits([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, [selectedDate]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'LATE': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'MISSED': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'CANCELLED': return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
      case 'IN_PROGRESS': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'SCHEDULED': return 'bg-slate-800 text-slate-400 border-slate-700/50';
      case 'ASSIGNED': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      default: return 'bg-slate-800 text-slate-400';
    }
  };

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight uppercase mb-1">Service Rota</h1>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Master Deployment Schedule</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <ExportButton entity="visits" />
          <input 
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="form-input !py-2 !px-4 !w-auto bg-slate-900 shadow-inner"
          />
          {hasPermission('visits.create') && (
            <button 
              onClick={() => { setSelectedVisit(null); setIsFormOpen(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors font-bold text-xs uppercase tracking-wider"
            >
              <Plus size={16} />
              Schedule Visit
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="py-20 text-center text-slate-500 font-mono text-xs uppercase tracking-widest">Synchronizing Rota Matrix...</div>
        ) : visits.length === 0 ? (
          <div className="premium-card bg-[#111413] p-12 text-center">
            <Clock size={40} className="mx-auto text-emerald-900/40 mb-4" />
            <h3 className="text-white font-bold mb-1 uppercase tracking-tight">Zero Deployment</h3>
            <p className="text-slate-500 text-xs uppercase tracking-widest">No visits scheduled for this cycle.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {visits.map((v) => (
              <div 
                key={v.id} 
                className={`premium-card p-5 group transition-all border-l-4 ${v.staffId ? 'border-l-emerald-500' : 'border-l-amber-500 bg-amber-500/5'}`}
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                  <div className="flex items-center gap-6 flex-1">
                    <div className="text-center min-w-[80px]">
                      <div className="text-lg font-bold text-white tracking-tighter">{new Date(v.scheduledStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">START</div>
                    </div>
                    
                    <div className="h-10 w-px bg-emerald-900/10 hidden lg:block"></div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-bold text-sm tracking-tight">{v.client.firstName} {v.client.lastName}</span>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase border ${getStatusColor(v.status)}`}>
                          {v.status}
                        </span>
                        {v.status === 'MISSED' && <AlertCircle size={14} className="text-red-500 animate-pulse" />}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                          <User size={12} className="text-emerald-500" />
                          {v.staff ? `${v.staff.firstName} ${v.staff.lastName}` : <span className="text-amber-500">Unassigned</span>}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                          <CalendarDays size={12} />
                          {v.visitType || 'Standard Call'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full lg:w-auto justify-end border-t lg:border-none pt-4 lg:pt-0 border-emerald-900/5">
                    {hasPermission('visits.edit') && (
                      <button 
                        onClick={() => { setSelectedVisit(v); setIsFormOpen(true); }}
                        className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-white transition-colors p-2"
                      >
                        Modify
                      </button>
                    )}
                    {hasPermission('visits.status') && (
                      <select 
                        className="px-4 py-2 bg-emerald-900/20 text-emerald-400 hover:bg-emerald-900/40 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all outline-none border-none cursor-pointer"
                        value={v.status}
                        onChange={async (e) => {
                          const newStatus = e.target.value;
                          try {
                            const res = await fetch(`/api/visits/${v.id}/status`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ status: newStatus })
                            });
                            if (res.ok) fetchVisits();
                          } catch (err) {
                            console.error(err);
                          }
                        }}
                      >
                        <option value="SCHEDULED">Scheduled</option>
                        <option value="ASSIGNED">Assigned</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="LATE">Late</option>
                        <option value="MISSED">Missed</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isFormOpen && (
        <VisitForm 
          visit={selectedVisit}
          onClose={() => setIsFormOpen(false)}
          onSuccess={() => { setIsFormOpen(false); fetchVisits(); }}
          initialDate={selectedDate}
        />
      )}
    </div>
  );
};

const VisitForm = ({ visit, onClose, onSuccess, initialDate }: { visit?: any, onClose: () => void, onSuccess: () => void, initialDate: string }) => {
  const [formData, setFormData] = useState({
    clientId: visit?.clientId || '',
    staffId: visit?.staffId || '',
    scheduledStart: visit?.scheduledStart ? new Date(visit.scheduledStart).toISOString().slice(0, 16) : `${initialDate}T09:00`,
    scheduledEnd: visit?.scheduledEnd ? new Date(visit.scheduledEnd).toISOString().slice(0, 16) : `${initialDate}T10:00`,
    visitType: visit?.visitType || 'Standard Care',
    notes: visit?.notes || ''
  });
  const [clients, setClients] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cRes, sRes] = await Promise.all([
          fetch('/api/clients'),
          fetch('/api/staff')
        ]);
        const [cData, sData] = await Promise.all([cRes.json(), sRes.json()]);
        setClients(cData);
        setStaff(sData);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const url = visit ? `/api/visits/${visit.id}` : '/api/visits';
    const method = visit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else onSuccess();
    } catch (err) {
      setError('Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl bg-[#111413] border border-emerald-900/30 rounded-2xl shadow-2xl p-8"
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold text-white tracking-tight uppercase">
            {visit ? 'Modify Deployment' : 'Schedule Deployment'}
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Client Target</label>
              <select 
                required
                value={formData.clientId}
                onChange={e => setFormData({...formData, clientId: e.target.value})}
                className="form-input"
              >
                <option value="">Select Client...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Assigned Personnel</label>
              <select 
                value={formData.staffId}
                onChange={e => setFormData({...formData, staffId: e.target.value})}
                className="form-input"
              >
                <option value="">Pending Assignment...</option>
                {staff.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Deployment Start</label>
              <input 
                type="datetime-local"
                required
                value={formData.scheduledStart}
                onChange={e => setFormData({...formData, scheduledStart: e.target.value})}
                className="form-input"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Deployment End</label>
              <input 
                type="datetime-local"
                required
                value={formData.scheduledEnd}
                onChange={e => setFormData({...formData, scheduledEnd: e.target.value})}
                className="form-input"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Service Classification</label>
            <input 
              type="text"
              placeholder="e.g. Lunch Call, Morning Routine"
              value={formData.visitType}
              onChange={e => setFormData({...formData, visitType: e.target.value})}
              className="form-input"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Briefing Notes</label>
            <textarea 
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
              className="form-input h-24 resize-none"
              placeholder="Operational details for the caregiver..."
            />
          </div>

          <div className="flex gap-4 pt-4 border-t border-emerald-900/10">
            <button 
              type="button" onClick={onClose}
              className="px-8 py-4 rounded-xl border border-emerald-900/30 text-slate-400 font-bold uppercase tracking-widest text-[10px] hover:bg-emerald-900/10 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit" disabled={isSubmitting}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-xl shadow-emerald-900/40 uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3"
            >
              <Save size={16} />
              {isSubmitting ? 'Syncing Schema...' : (visit ? 'Commit Re-deployment' : 'Initialize Schedule')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const RisksView = () => {
  const [risks, setRisks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isActionOpen, setIsActionOpen] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState<any>(null);
  const [filter, setFilter] = useState({
    status: '',
    riskLevel: '',
    category: '',
    overdue: false,
    search: ''
  });
  const { hasPermission } = useAuth();

  const fetchRisks = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (filter.status) query.append('status', filter.status);
      if (filter.riskLevel) query.append('riskLevel', filter.riskLevel);
      if (filter.category) query.append('category', filter.category);
      if (filter.overdue) query.append('overdue', 'true');
      if (filter.search) query.append('search', filter.search);
      
      const res = await fetch(`/api/risks?${query.toString()}`);
      const data = await res.json();
      if (Array.isArray(data)) setRisks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRisks();
  }, [filter.status, filter.riskLevel, filter.category, filter.overdue]);

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'Critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'High': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'Medium': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      default: return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Resolved': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'Monitoring': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'Archived': return 'text-slate-500 bg-slate-800 border-slate-700';
      default: return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    }
  };

  const categories = [
    'Client', 'Staff', 'Medication', 'Safeguarding', 
    'Infection Control', 'Environmental', 'Operational', 'Compliance'
  ];

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight uppercase mb-1">Corporate Risk Register</h1>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Governance & Threat Assessment</p>
        </div>
        <div className="flex gap-3">
          <ExportButton entity="risks" filters={filter} />
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
            <input 
              type="text" 
              placeholder="Search threats..."
              value={filter.search}
              onChange={e => setFilter({...filter, search: e.target.value})}
              onKeyDown={e => e.key === 'Enter' && fetchRisks()}
              className="bg-[#111413] border border-emerald-900/20 rounded-lg pl-10 pr-4 py-2 text-xs text-white outline-none focus:border-emerald-500 w-64 transition-all"
            />
          </div>
          <button 
            onClick={() => setFilter({ ...filter, overdue: !filter.overdue })}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${
              filter.overdue 
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' 
                : 'bg-slate-800/50 border-slate-700/30 text-slate-400 hover:text-white'
            }`}
          >
            {filter.overdue ? 'Showing Overdue' : 'Overdue Reviews'}
          </button>
          {hasPermission('risks.create') && (
            <button 
              onClick={() => { setSelectedRisk(null); setIsFormOpen(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-900/20"
            >
              <Plus size={16} />
              Identify New Risk
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-4 mb-6 overflow-x-auto pb-2 scrollbar-none">
        <select 
          value={filter.status}
          onChange={(e) => setFilter({...filter, status: e.target.value})}
          className="bg-[#111413] border border-emerald-900/20 text-slate-300 text-[10px] font-bold uppercase tracking-widest rounded-lg px-4 py-2 outline-none focus:border-emerald-500 min-w-[140px]"
        >
          <option value="">All Statuses</option>
          <option value="Open">Open</option>
          <option value="Monitoring">Monitoring</option>
          <option value="Resolved">Resolved</option>
          <option value="Archived">Archived</option>
        </select>
        <select 
          value={filter.riskLevel}
          onChange={(e) => setFilter({...filter, riskLevel: e.target.value})}
          className="bg-[#111413] border border-emerald-900/20 text-slate-300 text-[10px] font-bold uppercase tracking-widest rounded-lg px-4 py-2 outline-none focus:border-emerald-500 min-w-[140px]"
        >
          <option value="">All Risk Levels</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
        <select 
          value={filter.category}
          onChange={(e) => setFilter({...filter, category: e.target.value})}
          className="bg-[#111413] border border-emerald-900/20 text-slate-300 text-[10px] font-bold uppercase tracking-widest rounded-lg px-4 py-2 outline-none focus:border-emerald-500 min-w-[140px]"
        >
          <option value="">All Categories</option>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="py-20 text-center text-slate-500 font-mono text-xs uppercase tracking-widest animate-pulse">Running Risk Analysis...</div>
        ) : risks.length === 0 ? (
          <div className="premium-card bg-[#111413] p-16 text-center border-dashed border-emerald-900/20">
            <ShieldCheck size={48} className="mx-auto text-emerald-900/40 mb-4" />
            <h3 className="text-white font-bold mb-2 uppercase tracking-tight">System Integrity Maximum</h3>
            <p className="text-slate-500 text-xs uppercase tracking-widest">No threats detected matching these parameters.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {risks.map((risk) => {
              const isOverdueReview = risk.status !== 'Archived' && risk.status !== 'Resolved' && risk.reviewDate && new Date(risk.reviewDate) < new Date();
              return (
                <div 
                  key={risk.id} 
                  className={`premium-card p-6 group transition-all border-l-4 relative overflow-hidden ${
                    risk.riskLevel === 'Critical' ? 'border-l-red-600 bg-red-600/5' : 
                    risk.riskLevel === 'High' ? 'border-l-amber-600 bg-amber-600/5' :
                    'border-l-emerald-600'
                  }`}
                >
                  {risk.riskLevel === 'Critical' && (
                    <div className="absolute top-0 right-0 p-1 bg-red-600/10 text-red-600/20 rotate-45 translate-x-4 -translate-y-4 font-black text-4xl pointer-events-none select-none">
                      CRITICAL
                    </div>
                  )}
                  
                  <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className={`px-2.5 py-1 rounded text-[10px] font-black border uppercase tracking-wider ${getRiskLevelColor(risk.riskLevel)}`}>
                          <ShieldAlert size={10} className="inline mr-1" /> {risk.riskLevel} Risk
                        </span>
                        <span className={`px-2.5 py-1 rounded text-[10px] font-bold border uppercase tracking-wider ${getStatusColor(risk.status)}`}>
                          {risk.status}
                        </span>
                        {isOverdueReview && (
                          <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-red-500/20 text-red-500 border border-red-500/30 uppercase tracking-widest animate-pulse">
                            REVIEW OVERDUE
                          </span>
                        )}
                        <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest border-l border-emerald-900/10 pl-3">
                          {risk.category}
                        </span>
                      </div>
                      <h3 className="text-white font-bold text-lg mb-1 tracking-tight truncate group-hover:text-emerald-400 transition-colors uppercase">{risk.title}</h3>
                      <p className="text-slate-500 text-xs truncate max-w-2xl font-medium">{risk.description}</p>
                      
                      <div className="flex items-center gap-6 mt-4 flex-wrap">
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                          <History size={12} className="text-emerald-500" />
                          Review: {risk.reviewDate ? new Date(risk.reviewDate).toLocaleDateString() : 'Pending Date'}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                          <UserCircle size={12} className="text-emerald-500" />
                          Owner: {risk.ownerUser?.name || 'Unassigned'}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 uppercase tracking-widest font-bold border-l border-emerald-900/10 pl-4">
                          Impact: {risk.impact} | Likelihood: {risk.likelihood}
                        </div>
                        {(risk.linkedClient || risk.linkedStaff) && (
                          <div className="flex items-center gap-2 text-[10px] text-emerald-500/60 uppercase tracking-widest font-bold bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
                            <Link size={10} />
                            Linked: {risk.linkedClient ? `${risk.linkedClient.firstName} ${risk.linkedClient.lastName}` : `${risk.linkedStaff.firstName} ${risk.linkedStaff.lastName}`}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full lg:w-auto justify-end border-t lg:border-none pt-4 lg:pt-0 border-emerald-900/5">
                      <button 
                        onClick={() => { setSelectedRisk(risk); setIsFormOpen(true); }}
                        className="p-2 text-slate-400 hover:text-white transition-colors"
                        title="Edit Risk"
                      >
                        <Settings size={18} />
                      </button>
                      <button 
                        onClick={() => { setSelectedRisk(risk); setIsReviewOpen(true); }}
                        className="px-4 py-2 bg-emerald-900/20 text-emerald-500 hover:bg-emerald-900/40 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-emerald-500/10 transition-all"
                      >
                        Assessment Update
                      </button>
                      {hasPermission('risks.create_action') && risk.status !== 'Archived' && (
                        <button 
                          onClick={() => { setSelectedRisk(risk); setIsActionOpen(true); }}
                          className="px-4 py-2 bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white rounded-lg text-[10px] font-bold uppercase tracking-widest border border-blue-500/10 transition-all"
                        >
                          Link Action
                        </button>
                      )}
                      {hasPermission('risks.archive') && risk.status !== 'Archived' && (
                        <button 
                          onClick={async () => {
                            if (!window.confirm('Moving threat to historical archives?')) return;
                            await fetch(`/api/risks/${risk.id}/archive`, { method: 'PATCH' });
                            fetchRisks();
                          }}
                          className="p-2 text-slate-600 hover:text-red-500 transition-colors"
                          title="Archive"
                        >
                          <Archive size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isFormOpen && (
        <RiskForm 
          risk={selectedRisk}
          onClose={() => setIsFormOpen(false)}
          onSuccess={() => { setIsFormOpen(false); fetchRisks(); }}
        />
      )}

      {isReviewOpen && selectedRisk && (
        <RiskReviewModal 
          risk={selectedRisk}
          onClose={() => setIsReviewOpen(false)}
          onSuccess={() => { setIsReviewOpen(false); fetchRisks(); }}
        />
      )}

      {isActionOpen && selectedRisk && (
        <CreateLinkedActionModal 
          risk={selectedRisk}
          onClose={() => setIsActionOpen(false)}
          onSuccess={() => { setIsActionOpen(false); }}
        />
      )}
    </div>
  );
};

const RiskForm = ({ risk, onClose, onSuccess }: { risk?: any, onClose: () => void, onSuccess: () => void }) => {
  const [formData, setFormData] = useState({
    title: risk?.title || '',
    description: risk?.description || '',
    category: risk?.category || 'Client',
    likelihood: risk?.likelihood || 'Medium',
    impact: risk?.impact || 'Medium',
    riskLevel: risk?.riskLevel || 'Medium',
    controls: risk?.controls || '',
    reviewDate: risk?.reviewDate ? new Date(risk.reviewDate).toISOString().split('T')[0] : '',
    ownerUserId: risk?.ownerUserId || '',
    linkedClientId: risk?.linkedClientId || '',
    linkedStaffId: risk?.linkedStaffId || '',
    status: risk?.status || 'Open',
    notes: risk?.notes || ''
  });
  
  const [loading, setLoading] = useState({ staff: true, clients: true, users: true });
  const [data, setData] = useState({ staff: [], clients: [], users: [] });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/staff').then(res => res.json()),
      fetch('/api/clients').then(res => res.json()),
      fetch('/api/users').then(res => res.json())
    ]).then(([staffArr, clientsArr, usersArr]) => {
      setData({ 
        staff: Array.isArray(staffArr) ? staffArr : [], 
        clients: Array.isArray(clientsArr) ? clientsArr : [],
        users: Array.isArray(usersArr) ? usersArr : []
      });
      setLoading({ staff: false, clients: false, users: false });
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const url = risk ? `/api/risks/${risk.id}` : '/api/risks';
    const method = risk ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const resData = await res.json();
      if (resData.error) setError(resData.error);
      else onSuccess();
    } catch (err) {
      setError('System communication failure');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    'Client', 'Staff', 'Medication', 'Safeguarding', 
    'Infection Control', 'Environmental', 'Operational', 'Compliance'
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl bg-[#0a0c0b] border border-emerald-900/30 rounded-2xl shadow-3xl p-8"
      >
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-emerald-900/10">
          <div>
            <h2 className="text-xl font-black text-white tracking-tighter uppercase italic">
              {risk ? 'Modify Threat Profile' : 'Register New Hazard'}
            </h2>
            <p className="text-[10px] text-emerald-500/50 uppercase tracking-widest font-bold">Risk Management Interface</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
              <AlertTriangle size={16} />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Hazard Identification</label>
              <input 
                type="text" required
                placeholder="Brief hazard name..."
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                className="form-input"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Operational Taxonomy</label>
              <select 
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                className="form-input"
              >
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Narrative Context</label>
            <textarea 
              required
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="form-input h-24 resize-none"
              placeholder="Detailed description of the threat..."
            />
          </div>

          <div className="grid grid-cols-3 gap-6 bg-emerald-900/5 p-4 rounded-xl border border-emerald-900/10">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-emerald-500/70 uppercase tracking-widest">Likelihood</label>
              <select 
                value={formData.likelihood}
                onChange={e => setFormData({...formData, likelihood: e.target.value})}
                className="form-input bg-[#111413]"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-emerald-500/70 uppercase tracking-widest">Impact</label>
              <select 
                value={formData.impact}
                onChange={e => setFormData({...formData, impact: e.target.value})}
                className="form-input bg-[#111413]"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest underline decoration-2 decoration-emerald-800">Risk Level</label>
              <select 
                value={formData.riskLevel}
                onChange={e => setFormData({...formData, riskLevel: e.target.value})}
                className="form-input border-emerald-500/50 bg-[#111413] text-emerald-400 font-black"
              >
                <option value="Low">LOW</option>
                <option value="Medium">MEDIUM</option>
                <option value="High">HIGH</option>
                <option value="Critical">CRITICAL</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Governance Controls</label>
            <textarea 
              required
              value={formData.controls}
              onChange={e => setFormData({...formData, controls: e.target.value})}
              className="form-input h-24 resize-none"
              placeholder="What specific measures are controlling this risk?..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Strategic Owner</label>
              <select 
                value={formData.ownerUserId}
                onChange={e => setFormData({...formData, ownerUserId: e.target.value})}
                className="form-input"
              >
                <option value="">Select Accountability Owner...</option>
                {data.users.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Audit Deadline</label>
              <input 
                type="date"
                required
                value={formData.reviewDate}
                onChange={e => setFormData({...formData, reviewDate: e.target.value})}
                className="form-input"
              />
            </div>
          </div>

          <div className="p-4 bg-slate-900/30 rounded-xl space-y-4 border border-slate-800">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 border-b border-slate-800 pb-2">Entropic Linking (Optional)</p>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Link Client</label>
                <select 
                  value={formData.linkedClientId}
                  onChange={e => setFormData({...formData, linkedClientId: e.target.value, linkedStaffId: ''})}
                  className="form-input border-slate-800"
                >
                  <option value="">No Client Association</option>
                  {data.clients.map((c: any) => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Link Staff</label>
                <select 
                  value={formData.linkedStaffId}
                  onChange={e => setFormData({...formData, linkedStaffId: e.target.value, linkedClientId: ''})}
                  className="form-input border-slate-800"
                >
                  <option value="">No Staff Association</option>
                  {data.staff.map((s: any) => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t border-emerald-900/10">
            <button 
              type="button" onClick={onClose}
              className="px-10 py-4 rounded-xl border border-emerald-900/30 text-slate-400 font-bold uppercase tracking-widest text-[10px] hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit" disabled={isSubmitting}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black py-4 rounded-xl shadow-2xl shadow-emerald-900/40 uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3 active:scale-95"
            >
              <Save size={16} />
              {isSubmitting ? 'Syncing Register...' : (risk ? 'Commit Assessment' : 'Register Threat Profile')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const RiskReviewModal = ({ risk, onClose, onSuccess }: { risk: any, onClose: () => void, onSuccess: () => void }) => {
  const [formData, setFormData] = useState({
    status: risk.status,
    notes: '',
    reviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await fetch(`/api/risks/${risk.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      onSuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] flex items-center justify-center p-6">
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="w-full max-w-lg bg-[#0a0c0b] border border-emerald-900/30 rounded-2xl p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-white font-black uppercase tracking-tighter italic">Threat Update: {risk.title}</h2>
          <button onClick={onClose}><X size={20} className="text-slate-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Revised Status</label>
            <select 
              value={formData.status}
              onChange={e => setFormData({...formData, status: e.target.value})}
              className="form-input"
            >
              <option value="Open">Active/Open</option>
              <option value="Monitoring">Monitoring/Controlled</option>
              <option value="Resolved">Mitigated/Resolved</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Audit Findings / Review Notes</label>
            <textarea 
              required
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
              className="form-input h-32 resize-none"
              placeholder="Detail the effectiveness of current controls..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Next Scheduled Review</label>
            <input 
              type="date"
              required
              value={formData.reviewDate}
              onChange={e => setFormData({...formData, reviewDate: e.target.value})}
              className="form-input"
            />
          </div>
          <button 
            type="submit" disabled={isSubmitting}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl uppercase tracking-widest text-[10px] shadow-xl"
          >
            {isSubmitting ? 'Logging Review...' : 'Commit Audit Update'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const CreateLinkedActionModal = ({ risk, onClose, onSuccess }: { risk: any, onClose: () => void, onSuccess: () => void }) => {
  const [formData, setFormData] = useState({
    title: `Mitigation Action: ${risk.title}`,
    description: `Required intervention to address ${risk.riskLevel} risk assessment findings. Findings: ${risk.controls || 'Consult risk profile.'}`,
    priority: risk.riskLevel === 'Critical' ? 'Critical' : (risk.riskLevel === 'High' ? 'High' : 'Medium'),
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    assignedToUserId: risk.ownerUserId || ''
  });
  const [users, setUsers] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/users').then(res => res.json()).then(data => { if (Array.isArray(data)) setUsers(data); });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await fetch(`/api/risks/${risk.id}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      onSuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] flex items-center justify-center p-6">
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="w-full max-w-lg bg-[#0a0c0b] border border-emerald-900/30 rounded-2xl p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-white font-black uppercase tracking-tighter italic">Strategic Intervention</h2>
          <button onClick={onClose}><X size={20} className="text-slate-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Action Directive</label>
            <input 
              type="text" required
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              className="form-input"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Assignment</label>
            <select 
              value={formData.assignedToUserId}
              onChange={e => setFormData({...formData, assignedToUserId: e.target.value})}
              className="form-input"
            >
              <option value="">Awaiting Owner...</option>
              {users.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Priority</label>
              <select 
                value={formData.priority}
                onChange={e => setFormData({...formData, priority: e.target.value})}
                className="form-input"
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Deadline</label>
              <input 
                type="date"
                required
                value={formData.dueDate}
                onChange={e => setFormData({...formData, dueDate: e.target.value})}
                className="form-input"
              />
            </div>
          </div>
          <button 
              type="submit" disabled={isSubmitting}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl uppercase tracking-widest text-[10px] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <UserPlus size={16} />
              {isSubmitting ? 'Raising Directive...' : 'Initialize Compliance Action'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const AuditFormModal = ({ audit, onClose, onSuccess }: { audit?: any, onClose: () => void, onSuccess: (audit?: any) => void }) => {
  const [formData, setFormData] = useState({
    title: audit?.title || '',
    auditType: audit?.auditType || 'Medication Audit',
    auditorId: audit?.auditorId || '',
    linkedClientId: audit?.linkedClientId || '',
    linkedStaffId: audit?.linkedStaffId || '',
    auditDate: audit?.auditDate ? new Date(audit.auditDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    reviewDate: audit?.reviewDate ? new Date(audit.reviewDate).toISOString().split('T')[0] : '',
    status: audit?.status || 'Draft',
    checklistTemplate: [] as string[]
  });
  
  const [data, setData] = useState({ staff: [], clients: [], users: [] });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const templates: Record<string, string[]> = {
    "Medication Audit": [
      "Is the medication stored securely in a locked cabinet?",
      "Are all medications within their expiry dates?",
      "Is the temperature log for the fridge maintained?",
      "Are Controlled Drugs (CDs) recorded in the CD register correctly?",
      "Is there a clear record of disposal for discontinued meds?",
      "Are PRN protocols in place for all as-needed medications?"
    ],
    "MAR Chart Audit": [
      "Are there any gaps in the MAR charts for the current cycle?",
      "Are all handwritten entries signed and witnessed?",
      "Do the MAR charts match the current prescriptions?",
      "Are reasons recorded for any omitted doses?",
      "Is the client name and DOB clear on every page?",
      "Are allergy details clearly visible?"
    ],
    "Care Plan Audit": [
      "Has the care plan been reviewed in the last 6 months?",
      "Does the care plan reflect the client's current needs?",
      "Is there evidence of client/family involvement in the plan?",
      "Are risk assessments linked to the care needs identified?",
      "Is the mobility section up to date with equipment needs?",
      "Are the desired outcomes clearly stated and tracked?"
    ],
    "Staff File Audit": [
      "Is there a valid DBS check on file?",
      "Are there at least two verified references?",
      "Is there a full employment history with gaps explained?",
      "Is the right to work documentation current?",
      "Is there a signed contract of employment?",
      "Is the induction checklist completed and signed?"
    ]
  };

  useEffect(() => {
    Promise.all([
      fetch('/api/staff').then(res => res.json()),
      fetch('/api/clients').then(res => res.json()),
      fetch('/api/users').then(res => res.json())
    ]).then(([staffArr, clientsArr, usersArr]) => {
      setData({ 
        staff: Array.isArray(staffArr) ? staffArr : [], 
        clients: Array.isArray(clientsArr) ? clientsArr : [],
        users: Array.isArray(usersArr) ? usersArr : []
      });
    });
  }, []);

  useEffect(() => {
    if (!audit && templates[formData.auditType]) {
      setFormData(prev => ({ ...prev, checklistTemplate: templates[formData.auditType] }));
    }
  }, [formData.auditType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      const url = audit ? `/api/audits/${audit.id}` : '/api/audits';
      const method = audit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const resData = await res.json();
      if (resData.error) setError(resData.error);
      else onSuccess(resData);
    } catch (err) {
      setError('System communication failure');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6 overflow-y-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl bg-[#0a0c0b] border border-emerald-900/30 rounded-2xl shadow-3xl p-8">
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-emerald-900/10">
          <div>
            <h2 className="text-xl font-black text-white tracking-tighter uppercase italic">
              {audit ? 'Modify Audit Parameters' : 'Initialize Compliance Audit'}
            </h2>
            <p className="text-[10px] text-emerald-500/50 uppercase tracking-widest font-bold font-mono">Status: {formData.status}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"><AlertTriangle size={16} />{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Audit Designation</label>
              <input type="text" required placeholder="e.g. Q1 Medication Audit" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="form-input" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Audit Type</label>
              <select value={formData.auditType} onChange={e => setFormData({...formData, auditType: e.target.value})} className="form-input">
                {Object.keys(templates).map(t => <option key={t} value={t}>{t}</option>)}
                <option value="Other">Other Audit Type</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Lead Auditor</label>
              <select required value={formData.auditorId} onChange={e => setFormData({...formData, auditorId: e.target.value})} className="form-input">
                <option value="">Select Auditor...</option>
                {data.users.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Audit Timeline</label>
              <input type="date" required value={formData.auditDate} onChange={e => setFormData({...formData, auditDate: e.target.value})} className="form-input" />
            </div>
          </div>

          <div className="p-4 bg-slate-900/30 rounded-xl space-y-4 border border-slate-800">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 border-b border-slate-800 pb-2">Contextual Linking (Target of Audit)</p>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Target Client</label>
                <select value={formData.linkedClientId} onChange={e => setFormData({...formData, linkedClientId: e.target.value, linkedStaffId: ''})} className="form-input border-slate-800">
                  <option value="">N/A (Organization Wide)</option>
                  {data.clients.map((c: any) => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Target Staff</label>
                <select value={formData.linkedStaffId} onChange={e => setFormData({...formData, linkedStaffId: e.target.value, linkedClientId: ''})} className="form-input border-slate-800">
                  <option value="">N/A (Organization Wide)</option>
                  {data.staff.map((s: any) => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
                </select>
              </div>
            </div>
          </div>

          {!audit && formData.checklistTemplate.length > 0 && (
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-emerald-500/70 uppercase tracking-widest">Checklist Blueprint (Auto-Generated)</label>
              <div className="bg-emerald-900/5 p-3 rounded-lg border border-emerald-900/10 text-[9px] text-slate-500 font-medium space-y-1">
                {formData.checklistTemplate.map((q, i) => <div key={i}>• {q}</div>)}
              </div>
            </div>
          )}

          <div className="flex gap-4 pt-6 border-t border-emerald-900/10">
            <button type="button" onClick={onClose} className="px-10 py-4 rounded-xl border border-emerald-900/30 text-slate-400 font-bold uppercase tracking-widest text-[10px] hover:bg-white/5 transition-all">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black py-4 rounded-xl shadow-2xl uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3">
              <Save size={16} />
              {isSubmitting ? 'Provisioning...' : (audit ? 'Commit Changes' : 'Initialize Workshop')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const AuditDetailsView = ({ auditId, onBack }: { auditId: string, onBack: () => void }) => {
  const [audit, setAudit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updatingItem, setUpdatingItem] = useState<string | null>(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [selectedItemForAction, setSelectedItemForAction] = useState<any>(null);
  const { hasPermission } = useAuth();

  const fetchAudit = async () => {
    try {
      const res = await fetch(`/api/audits/${auditId}`);
      const data = await res.json();
      setAudit(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAudit(); }, [auditId]);

  const updateItem = async (itemId: string, data: any) => {
    setUpdatingItem(itemId);
    try {
      await fetch(`/api/audits/${auditId}/checklist-items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      fetchAudit();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingItem(null);
    }
  };

  const completeAudit = async () => {
    if (!audit.checklistItems.every((item: any) => item.answer !== 'N/A')) {
      if (!window.confirm('Some items are still marked N/A. Proceed with completion?')) return;
    }
    
    const failCount = audit.checklistItems.filter((i: any) => i.answer === 'Fail').length;
    const totalAnswered = audit.checklistItems.filter((i: any) => i.answer !== 'N/A').length;
    const score = totalAnswered > 0 ? Math.round(((totalAnswered - failCount) / totalAnswered) * 100) : 0;
    
    let result = 'Compliant';
    if (score < 70) result = 'Non-Compliant';
    else if (score < 90) result = 'Partially Compliant';

    try {
      await fetch(`/api/audits/${auditId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Completed', result, score })
      });
      fetchAudit();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !audit) return <div className="p-20 text-center text-slate-500 font-mono text-xs uppercase tracking-widest animate-pulse">Syncing Audit Cache...</div>;

  const getAnswerColor = (ans: string) => {
    switch (ans) {
      case 'Pass': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'Fail': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-slate-500 bg-slate-500/5 border-slate-700/50';
    }
  };

  return (
    <div className="p-8">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-6 text-xs font-bold uppercase tracking-widest">
        <ArrowLeft size={16} />
        Back to Register
      </button>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-6">
          <div className="premium-card p-6 bg-[#0a0c0b]">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic">{audit.title}</h2>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{audit.auditType}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black border uppercase tracking-wider ${getAnswerColor(audit.result || '')}`}>{audit.result || 'In Progress'}</span>
                </div>
              </div>
              <div className="bg-emerald-900/10 p-3 rounded-xl border border-emerald-900/20 text-center min-w-[80px]">
                <div className="text-[10px] font-bold text-emerald-500/50 uppercase tracking-widest mb-1">Audit Score</div>
                <div className={`text-2xl font-black ${audit.score < 80 ? 'text-red-500' : 'text-emerald-400'}`}>{audit.score !== null ? `${audit.score}%` : '--'}</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-emerald-900/10">
              <div>
                <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-1">Auditor</p>
                <p className="text-xs text-slate-300 font-bold">{audit.auditor?.name}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-1">Audit Date</p>
                <p className="text-xs text-slate-300 font-bold">{new Date(audit.auditDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-1">Target</p>
                <p className="text-xs text-slate-300 font-bold">
                  {audit.linkedClient ? `${audit.linkedClient.firstName} ${audit.linkedClient.lastName}` : (audit.linkedStaff ? `${audit.linkedStaff.firstName} ${audit.linkedStaff.lastName}` : 'System Wide')}
                </p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-1">Internal Status</p>
                <p className="text-xs text-emerald-500 font-bold uppercase tracking-widest">{audit.status}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-tighter italic border-b border-emerald-900/20 pb-2">Verification Checklist</h3>
            {audit.checklistItems.map((item: any) => (
              <div key={item.id} className={`premium-card p-4 transition-all border-l-4 ${item.answer === 'Fail' ? 'border-l-red-500 bg-red-500/5' : 'border-l-transparent'}`}>
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                  <div className="flex-1">
                    <p className="text-xs text-white font-bold mb-3">{item.question}</p>
                    <div className="flex gap-2">
                       {['Pass', 'Fail', 'N/A'].map(opt => (
                         <button 
                           key={opt}
                           disabled={audit.status === 'Archived' || audit.status === 'Reviewed'}
                           onClick={() => updateItem(item.id, { answer: opt })}
                           className={`px-3 py-1 rounded text-[9px] font-black uppercase tracking-wider border transition-all ${
                             item.answer === opt 
                               ? getAnswerColor(opt) + ' shadow-lg shadow-black/20' 
                               : 'bg-slate-900 text-slate-500 border-slate-800 hover:border-slate-600'
                           }`}
                         >
                           {opt}
                         </button>
                       ))}
                       {item.answer === 'Fail' && (
                         <button 
                           onClick={() => { setSelectedItemForAction(item); setIsActionModalOpen(true); }}
                           className="flex items-center gap-1 px-3 py-1 bg-red-600/10 text-red-500 border border-red-500/20 rounded text-[9px] font-black uppercase tracking-wide hover:bg-red-600 hover:text-white transition-all ml-2"
                         >
                           <Plus size={10} /> Link Corrective Action
                         </button>
                       )}
                    </div>
                  </div>
                  <div className="w-full md:w-64 space-y-2">
                    <textarea 
                      placeholder="Findings/Evidence notes..."
                      value={item.notes || ''}
                      disabled={audit.status === 'Archived' || audit.status === 'Reviewed'}
                      onBlur={(e) => updateItem(item.id, { notes: e.target.value })}
                      onChange={(e) => {
                         const items = [...audit.checklistItems];
                         const idx = items.findIndex(i => i.id === item.id);
                         items[idx].notes = e.target.value;
                         setAudit({...audit, checklistItems: items});
                      }}
                      className="w-full bg-[#111413] border border-slate-800 rounded p-2 text-[10px] text-slate-400 h-16 outline-none focus:border-emerald-500 transition-colors resize-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full lg:w-80 space-y-6">
          <div className="premium-card p-6 bg-[#0a0c0b] border-emerald-500/20">
            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4 border-b border-emerald-900/10 pb-2">Audit Verdict</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Key Findings</label>
                <textarea 
                  className="form-input h-24 text-[10px] resize-none" 
                  value={audit.findings || ''}
                  onChange={e => setAudit({...audit, findings: e.target.value})}
                  onBlur={e => fetch(`/api/audits/${auditId}`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ findings: e.target.value }) })}
                  placeholder="Summarize main compliance gaps..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Recommendations</label>
                <textarea 
                  className="form-input h-24 text-[10px] resize-none" 
                  value={audit.recommendations || ''}
                  onChange={e => setAudit({...audit, recommendations: e.target.value})}
                  onBlur={e => fetch(`/api/audits/${auditId}`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ recommendations: e.target.value }) })}
                  placeholder="Steps to achieve compliance..."
                />
              </div>
              {audit.status !== 'Completed' && audit.status !== 'Reviewed' && audit.status !== 'Archived' && (
                <button 
                  onClick={completeAudit}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl uppercase tracking-widest text-[10px] mt-4 shadow-xl transition-all active:scale-95"
                >
                  Commit Compliance Verdict
                </button>
              )}
              {audit.status === 'Completed' && hasPermission('audits.review') && (
                <button 
                  onClick={async () => {
                    await fetch(`/api/audits/${auditId}/status`, { method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ status: 'Reviewed' }) });
                    fetchAudit();
                  }}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl uppercase tracking-widest text-[10px] mt-4 shadow-xl transition-all active:scale-95"
                >
                  Finalize Manager Review
                </button>
              )}
            </div>
          </div>
          
          <div className="premium-card p-6 border-slate-800">
            <div className="flex items-center gap-2 text-amber-500 mb-3">
              <History size={16} />
              <h3 className="text-[10px] font-black uppercase tracking-widest">Audit Lifecycle</h3>
            </div>
            <p className="text-[9px] text-slate-500 leading-relaxed font-medium">
              Registered on {new Date(audit.createdAt).toLocaleString()}. 
              Last update identified {new Date(audit.updatedAt).toLocaleString()}.
              This audit constitutes a formal governance document for CQC inspection purposes.
            </p>
          </div>

          <div className="mt-12 pt-8 border-t border-emerald-900/10">
            <AttachmentSection entityType="Audit" entityId={auditId} />
          </div>
        </div>
      </div>

      {isActionModalOpen && selectedItemForAction && (
        <CreateAuditActionModal 
          auditId={audit.id}
          item={selectedItemForAction}
          onClose={() => setIsActionModalOpen(false)}
          onSuccess={() => { setIsActionModalOpen(false); fetchAudit(); }}
        />
      )}
    </div>
  );
};

const CreateAuditActionModal = ({ auditId, item, onClose, onSuccess }: { auditId: string, item: any, onClose: () => void, onSuccess: () => void }) => {
  const [formData, setFormData] = useState({
    title: `Remediate: ${item.question}`,
    description: `Corrective action required following audit failure. Finding: ${item.notes || 'Unsatisfactory response recorded during inspection.'}`,
    priority: 'High',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    assignedToUserId: ''
  });
  const [users, setUsers] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/users').then(res => res.json()).then(data => { if (Array.isArray(data)) setUsers(data); });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await fetch(`/api/audits/${auditId}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      onSuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] flex items-center justify-center p-6">
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="w-full max-w-lg bg-[#0a0c0b] border border-emerald-900/30 rounded-2xl p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-white font-black uppercase tracking-tighter italic">Directive: Corrective Action</h2>
          <button onClick={onClose}><X size={20} className="text-slate-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-red-500 uppercase tracking-widest font-mono">Immediate Directive</label>
            <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="form-input border-red-500/20" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Accountability</label>
            <select value={formData.assignedToUserId} onChange={e => setFormData({...formData, assignedToUserId: e.target.value})} className="form-input">
              <option value="">Awaiting Owner...</option>
              {users.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Priority</label>
              <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} className="form-input">
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Deadline</label>
              <input type="date" required value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} className="form-input" />
            </div>
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl uppercase tracking-widest text-[10px] shadow-2xl transition-all flex items-center justify-center gap-2">
            <UserPlus size={16} />
            {isSubmitting ? 'Syncing Directive...' : 'Issue Corrective Action'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const AuditsView = () => {
  const [audits, setAudits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'list' | 'details'>('list');
  const [filter, setFilter] = useState({
    status: '',
    auditType: '',
    result: '',
    search: ''
  });
  const { hasPermission } = useAuth();

  const fetchAudits = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (filter.status) query.append('status', filter.status);
      if (filter.auditType) query.append('auditType', filter.auditType);
      if (filter.result) query.append('result', filter.result);
      if (filter.search) query.append('search', filter.search);
      
      const res = await fetch(`/api/audits?${query.toString()}`);
      const data = await res.json();
      if (Array.isArray(data)) setAudits(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAudits(); }, [filter.status, filter.auditType, filter.result]);

  const auditTypes = ["Medication Audit", "MAR Chart Audit", "Care Plan Audit", "Client File Audit", "Staff File Audit", "Training Audit", "Visit Log Audit", "Incident Audit", "Infection Control Audit", "Health & Safety Audit"];

  const getResultColor = (result: string) => {
    switch (result) {
      case 'Compliant': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'Partially Compliant': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'Non-Compliant': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
    }
  };

  if (viewMode === 'details' && selectedAudit) {
    return <AuditDetailsView auditId={selectedAudit.id} onBack={() => { setViewMode('list'); setSelectedAudit(null); fetchAudits(); }} />;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight uppercase mb-1">Quality & Compliance Audits</h1>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Governance & Operational Integrity Monitoring</p>
        </div>
        <div className="flex gap-3">
          <ExportButton entity="audits" filters={filter} />
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
            <input type="text" placeholder="Search audit trail..." value={filter.search} onChange={e => setFilter({...filter, search: e.target.value})} onKeyDown={e => e.key === 'Enter' && fetchAudits()} className="bg-[#111413] border border-emerald-900/20 rounded-lg pl-10 pr-4 py-2 text-xs text-white outline-none focus:border-emerald-500 w-64 transition-all" />
          </div>
          {hasPermission('audits.create') && (
            <button onClick={() => { setSelectedAudit(null); setIsFormOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-emerald-900/20">
              <Plus size={16} /> New Assessment
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-4 mb-6 overflow-x-auto pb-2 scrollbar-none">
        <select value={filter.status} onChange={(e) => setFilter({...filter, status: e.target.value})} className="bg-[#111413] border border-emerald-900/20 text-slate-300 text-[10px] font-bold uppercase tracking-widest rounded-lg px-4 py-2 outline-none focus:border-emerald-500 min-w-[140px]">
          <option value="">All Statuses</option>
          <option value="Draft">Draft</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Reviewed">Reviewed</option>
        </select>
        <select value={filter.auditType} onChange={(e) => setFilter({...filter, auditType: e.target.value})} className="bg-[#111413] border border-emerald-900/20 text-slate-300 text-[10px] font-bold uppercase tracking-widest rounded-lg px-4 py-2 outline-none focus:border-emerald-500 min-w-[140px]">
          <option value="">All Types</option>
          {auditTypes.map(type => <option key={type} value={type}>{type}</option>)}
        </select>
        <select value={filter.result} onChange={(e) => setFilter({...filter, result: e.target.value})} className="bg-[#111413] border border-emerald-900/20 text-slate-300 text-[10px] font-bold uppercase tracking-widest rounded-lg px-4 py-2 outline-none focus:border-emerald-500 min-w-[140px]">
          <option value="">All Results</option>
          <option value="Compliant">Compliant</option>
          <option value="Partially Compliant">Partially Compliant</option>
          <option value="Non-Compliant">Non-Compliant</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="py-20 text-center text-slate-500 font-mono text-xs uppercase tracking-widest animate-pulse">Running Quality Scan...</div>
        ) : audits.length === 0 ? (
          <div className="premium-card bg-[#111413] p-16 text-center border-dashed border-emerald-900/20">
            <ClipboardList size={48} className="mx-auto text-emerald-900/40 mb-4" />
            <h3 className="text-white font-bold mb-2 uppercase tracking-tight">Audit Trail Clear</h3>
            <p className="text-slate-500 text-xs uppercase tracking-widest">No quality assessments match current parameters.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {audits.map(audit => (
              <div key={audit.id} className={`premium-card p-6 group transition-all border-l-4 ${audit.result === 'Non-Compliant' ? 'border-l-red-600 bg-red-600/5' : audit.result === 'Partially Compliant' ? 'border-l-amber-600 bg-amber-600/5' : 'border-l-emerald-600'}`}>
                <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap text-[10px] font-black uppercase tracking-wider">
                      <span className="px-2 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700">{audit.auditType}</span>
                      <span className={`px-2 py-1 rounded border ${getResultColor(audit.result)}`}>{audit.result || 'Outcome Pending'}</span>
                      <span className="text-slate-500">{audit.status}</span>
                    </div>
                    <h3 className="text-white font-bold text-lg mb-1 tracking-tight truncate group-hover:text-emerald-400 transition-colors uppercase">{audit.title}</h3>
                    <div className="flex items-center gap-6 mt-4 flex-wrap text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                      <div className="flex items-center gap-2"><Calendar size={12} className="text-emerald-500" />{new Date(audit.auditDate).toLocaleDateString()}</div>
                      <div className="flex items-center gap-2"><UserCircle size={12} className="text-emerald-500" />{audit.auditor?.name}</div>
                      {audit.score !== null && <div className="flex items-center gap-2 border-l border-emerald-900/10 pl-4">Score: <span className={audit.score < 80 ? 'text-red-500' : 'text-emerald-500'}>{audit.score}%</span></div>}
                      {(audit.linkedClient || audit.linkedStaff) && (
                        <div className="flex items-center gap-2 text-emerald-500/60 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
                          <Link size={10} />
                          {audit.linkedClient ? `${audit.linkedClient.firstName}` : `${audit.linkedStaff.firstName}`}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
                    <button onClick={() => { setSelectedAudit(audit); setViewMode('details'); }} className="px-6 py-2 bg-emerald-600/10 text-emerald-500 hover:bg-emerald-600 hover:text-white rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-500/10 transition-all">Audit Workspace</button>
                    {hasPermission('audits.archive') && audit.status !== 'Archived' && (
                      <button onClick={async () => { if (window.confirm('Archive this assessment?')) { await fetch(`/api/audits/${audit.id}/archive`, { method: 'PATCH' }); fetchAudits(); } }} className="p-2 text-slate-600 hover:text-red-500 transition-colors"><Archive size={18} /></button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isFormOpen && <AuditFormModal onClose={() => setIsFormOpen(false)} onSuccess={(audit) => { setIsFormOpen(false); if (audit) { setSelectedAudit(audit); setViewMode('details'); } fetchAudits(); }} />}
    </div>
  );
};

const ComplianceDashboardView = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { hasPermission } = useAuth();

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/compliance/summary');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSummary(); }, []);

  if (loading) return <div className="p-20 text-center text-slate-500 font-mono text-xs uppercase tracking-widest animate-pulse">Scanning Governance Integrity...</div>;
  if (!data) return <div className="p-20 text-center text-red-500 font-mono text-xs uppercase tracking-widest">Failed to initialize compliance stream.</div>;

  const { stats } = data;

  const cards = [
    { label: 'Open Actions', value: stats.openActions, icon: ListChecks, color: 'text-slate-300' },
    { label: 'Overdue Actions', value: stats.overdueActions, icon: AlertCircle, color: 'text-red-500', isCritical: stats.overdueActions > 0 },
    { label: 'High Priority', value: stats.highPriorityActions, icon: ChevronUp, color: 'text-amber-500' },
    { label: 'Critical Actions', value: stats.criticalActions, icon: Zap, color: 'text-red-600', isCritical: stats.criticalActions > 0 },
    { label: 'Open Risks', value: stats.openRisks, icon:ShieldAlert, color: 'text-amber-500' },
    { label: 'High Risks', value: stats.highRisks, icon: ShieldAlert, color: 'text-red-400' },
    { label: 'Critical Risks', value: stats.criticalRisks, icon: Zap, color: 'text-red-600', isCritical: stats.criticalRisks > 0 },
    { label: 'Overdue Risk Reviews', value: stats.overdueRiskReviews, icon: Clock, color: 'text-red-500', isCritical: stats.overdueRiskReviews > 0 },
    { label: 'Total Audits', value: stats.totalAudits, icon: ClipboardList, color: 'text-emerald-500' },
    { label: 'Non-Compliant', value: stats.nonCompliantAudits, icon: ThumbsDown, color: 'text-red-500', isCritical: stats.nonCompliantAudits > 0 },
    { label: 'Audit Actions', value: stats.auditsWithOpenActions, icon: HelpCircle, color: 'text-amber-500' },
    { label: 'Overdue Audits', value: stats.overdueAudits, icon: Calendar, color: 'text-red-500', isCritical: stats.overdueAudits > 0 }
  ];

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic">Compliance & Risk Oversight</h1>
          <p className="text-[10px] text-emerald-500/50 uppercase tracking-widest font-bold font-mono">Live Governance Stream • Inspection Readiness Mode</p>
        </div>
        <button onClick={fetchSummary} className="p-2 bg-emerald-900/10 border border-emerald-900/20 rounded-lg text-emerald-500 hover:bg-emerald-900/20 transition-all">
          <RefreshCcw size={16} />
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {cards.map((card, i) => (
          <div key={i} className={`premium-card p-4 transition-all hover:scale-[1.02] border-emerald-900/10 ${card.isCritical ? 'bg-red-500/5 border-red-500/20 shadow-lg shadow-red-950/20' : ''}`}>
            <div className="flex justify-between items-start mb-2">
              <card.icon size={18} className={card.color} />
              {card.isCritical && <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
            </div>
            <div className="text-2xl font-black text-white mb-0.5 tracking-tight">{card.value}</div>
            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Critical Risks */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-red-500 border-b border-red-500/10 pb-2">
            <Zap size={16} />
            <h3 className="text-xs font-black uppercase tracking-tighter italic">Critical Threats Requiring Attention</h3>
          </div>
          {data.criticalRisks.length === 0 ? (
            <div className="h-40 flex items-center justify-center bg-emerald-500/5 rounded-2xl border border-emerald-900/10 text-emerald-500/30 text-[10px] font-bold uppercase tracking-widest">No Critical Threats Identified</div>
          ) : (
            <div className="space-y-3">
              {data.criticalRisks.map((risk: any) => (
                <div key={risk.id} className="premium-card p-4 flex justify-between items-center bg-red-500/5 border-red-500/10">
                  <div>
                    <h4 className="text-xs text-white font-bold uppercase">{risk.title}</h4>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Identified: {new Date(risk.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded text-[9px] font-black uppercase tracking-widest">CRITICAL</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Overdue Actions */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-amber-500 border-b border-amber-500/10 pb-2">
            <Clock size={16} />
            <h3 className="text-xs font-black uppercase tracking-tighter italic">Lapsed Compliance Actions</h3>
          </div>
          {data.overdueActions.length === 0 ? (
            <div className="h-40 flex items-center justify-center bg-emerald-500/5 rounded-2xl border border-emerald-900/10 text-emerald-500/30 text-[10px] font-bold uppercase tracking-widest">Action Pipeline Clean</div>
          ) : (
            <div className="space-y-3">
              {data.overdueActions.map((action: any) => (
                <div key={action.id} className="premium-card p-4 flex justify-between items-center border-amber-900/20">
                  <div>
                    <h4 className="text-xs text-white font-bold truncate max-w-[200px]">{action.title}</h4>
                    <p className="text-[10px] text-red-400 uppercase tracking-widest mt-1 font-bold">Lapsed {new Date(action.dueDate).toLocaleDateString()}</p>
                  </div>
                  <div className="px-2 py-1 rounded bg-slate-800 text-slate-500 text-[9px] font-bold uppercase tracking-widest">{action.priority}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Non-Compliant Audits */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-red-500 border-b border-red-500/10 pb-2">
            <ThumbsDown size={16} />
            <h3 className="text-xs font-black uppercase tracking-tighter italic">Failing Quality Assessments</h3>
          </div>
          {data.nonCompliantAudits.length === 0 ? (
            <div className="h-40 flex items-center justify-center bg-emerald-500/5 rounded-2xl border border-emerald-900/10 text-emerald-500/30 text-[10px] font-bold uppercase tracking-widest">Zero Failures Recorded</div>
          ) : (
            <div className="space-y-3">
              {data.nonCompliantAudits.map((audit: any) => (
                <div key={audit.id} className="premium-card p-4 bg-red-500/5 border-red-500/20">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-xs text-white font-bold leading-tight">{audit.title}</h4>
                    <span className="text-[14px] font-black text-red-500">{audit.score}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest">{audit.auditType}</p>
                    <p className="text-[9px] text-red-400 font-bold uppercase tracking-widest italic">{audit.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Reviews */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-blue-400 border-b border-blue-400/10 pb-2">
            <Calendar size={16} />
            <h3 className="text-xs font-black uppercase tracking-tighter italic">Upcoming Audit Reviews</h3>
          </div>
          {data.upcomingAuditReviews.length === 0 ? (
            <div className="h-40 flex items-center justify-center bg-emerald-500/5 rounded-2xl border border-emerald-900/10 text-emerald-500/30 text-[10px] font-bold uppercase tracking-widest">No Scheduled Reviews</div>
          ) : (
            <div className="space-y-3">
              {data.upcomingAuditReviews.map((audit: any) => (
                <div key={audit.id} className="premium-card p-4 border-blue-900/20">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-[10px] text-white font-bold uppercase tracking-wider">{audit.title}</h4>
                    <span className="text-[9px] font-mono text-emerald-500">READY</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Review Deadline</p>
                    <p className="text-xs text-blue-400 font-black">{new Date(audit.reviewDate).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MedicationView = () => {
  const [medications, setMedications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMed, setSelectedMed] = useState<any>(null);
  const [filter, setFilter] = useState({
    status: '',
    type: '',
    clientId: ''
  });
  const [clients, setClients] = useState<any[]>([]);
  const [medView, setMedView] = useState<'records' | 'mar' | 'stock'>('records');
  const { hasPermission } = useAuth();

  const fetchMedications = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (filter.status) query.append('status', filter.status || 'Active');
      if (filter.type) query.append('medicationType', filter.type);
      if (filter.clientId) query.append('clientId', filter.clientId);
      
      const res = await fetch(`/api/medication?${query.toString()}`);
      const data = await res.json();
      if (Array.isArray(data)) setMedications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch('/api/clients')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setClients(data); });
    fetchMedications();
  }, [filter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'On Hold': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'Discontinued': return 'text-slate-500 bg-slate-800 border-slate-700';
      default: return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight uppercase mb-1">Medication Management</h1>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Care & Stored Records</p>
        </div>
        <div className="flex gap-3">
          {medView === 'records' && hasPermission('medication.create') && (
            <button 
              onClick={() => { setSelectedMed(null); setIsFormOpen(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-900/20"
            >
              <Plus size={16} />
              Add Medication
            </button>
          )}
        </div>
      </div>

      <div className="flex border-b border-emerald-900/10 mb-8">
        <button 
          onClick={() => setMedView('records')}
          className={`px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2 ${medView === 'records' ? 'text-emerald-500 border-emerald-500 bg-emerald-500/5' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
        >
          Clinical Records
        </button>
        <button 
          onClick={() => setMedView('mar')}
          className={`px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2 ${medView === 'mar' ? 'text-emerald-500 border-emerald-500 bg-emerald-500/5' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
        >
          Electronic MAR
        </button>
        <button 
          onClick={() => setMedView('stock')}
          className={`px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2 ${medView === 'stock' ? 'text-emerald-500 border-emerald-500 bg-emerald-500/5' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
        >
          Stock Governance
        </button>
      </div>

      {medView === 'records' && (
        <>
          <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
        <select 
          value={filter.clientId}
          onChange={(e) => setFilter({...filter, clientId: e.target.value})}
          className="bg-[#111413] border border-emerald-900/20 text-slate-300 text-[10px] font-bold uppercase tracking-widest rounded-lg px-4 py-2 outline-none focus:border-emerald-500"
        >
          <option value="">All Clients</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
        </select>
        <select 
          value={filter.status}
          onChange={(e) => setFilter({...filter, status: e.target.value})}
          className="bg-[#111413] border border-emerald-900/20 text-slate-300 text-[10px] font-bold uppercase tracking-widest rounded-lg px-4 py-2 outline-none focus:border-emerald-500"
        >
          <option value="">All Statuses</option>
          <option value="Active">Active</option>
          <option value="On Hold">On Hold</option>
          <option value="Discontinued">Discontinued</option>
        </select>
        <select 
          value={filter.type}
          onChange={(e) => setFilter({...filter, type: e.target.value})}
          className="bg-[#111413] border border-emerald-900/20 text-slate-300 text-[10px] font-bold uppercase tracking-widest rounded-lg px-4 py-2 outline-none focus:border-emerald-500"
        >
          <option value="">All Types</option>
          <option value="Regular">Regular</option>
          <option value="PRN">PRN</option>
          <option value="Topical">Topical</option>
          <option value="Controlled Drug">Controlled Drug</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="py-20 text-center text-slate-500 font-mono text-xs uppercase tracking-widest">Accessing Pharmacy Logs...</div>
        ) : medications.length === 0 ? (
          <div className="premium-card bg-[#111413] p-12 text-center border-dashed border-emerald-900/20">
            <Pill size={40} className="mx-auto text-emerald-900/40 mb-4" />
            <h3 className="text-white font-bold mb-1 uppercase tracking-tight">No Medication Records</h3>
            <p className="text-slate-500 text-xs uppercase tracking-widest">Register care medication to begin tracking.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {medications.map((m) => {
              const isOverdueReview = m.status === 'Active' && m.reviewDate && new Date(m.reviewDate) < new Date();
              const prnWaring = m.isPRN && (!m.prnGuidance || m.prnGuidance.length < 5);
              const topicalWarning = m.isTopical && (!m.bodyMapNotes || m.bodyMapNotes.length < 5);

              return (
                <div 
                  key={m.id} 
                  className={`premium-card p-6 group transition-all border-l-4 ${
                    m.medicationType === 'Controlled Drug' ? 'border-l-red-600 bg-red-600/5' : 
                    m.status === 'Discontinued' ? 'border-l-slate-800' : 'border-l-emerald-600'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className={`px-2.5 py-1 rounded text-[10px] font-bold border uppercase tracking-wider ${getStatusColor(m.status)}`}>
                          {m.status}
                        </span>
                        <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-emerald-950/30 text-emerald-400 border border-emerald-900/30 uppercase tracking-wider">
                          {m.medicationType}
                        </span>
                        {m.isPRN && (
                          <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wider">
                            PRN / As Required
                          </span>
                        )}
                        {isOverdueReview && (
                          <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-amber-500/20 text-amber-500 border border-amber-500/30 uppercase tracking-wider animate-pulse">
                            Review Overdue
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-baseline gap-2 mb-1">
                        <h3 className="text-white font-bold text-lg tracking-tight uppercase">{m.medicationName}</h3>
                        <span className="text-emerald-500 font-mono text-sm">{m.strength}</span>
                      </div>
                      
                      <p className="text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
                        {m.client.firstName} {m.client.lastName} • {m.dosageInstructions}
                      </p>

                      {(prnWaring || topicalWarning) && (
                        <div className="flex gap-4 mt-3">
                          {prnWaring && (
                            <div className="flex items-center gap-2 text-[9px] font-bold text-red-400 bg-red-500/10 px-2 py-1 rounded border border-red-500/20 uppercase tracking-widest">
                              <AlertCircle size={10} /> Missing PRN Guidance
                            </div>
                          )}
                          {topicalWarning && (
                            <div className="flex items-center gap-2 text-[9px] font-bold text-red-400 bg-red-500/10 px-2 py-1 rounded border border-red-500/20 uppercase tracking-widest">
                              <AlertCircle size={10} /> Missing Body Map
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-6 mt-4 flex-wrap">
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                          <Clock size={12} className="text-emerald-500" />
                          {m.frequency}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                          <Activity size={12} className="text-emerald-500" />
                          Route: {m.route}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase tracking-widest font-bold border-l border-emerald-900/20 pl-4">
                          Review: {m.reviewDate ? new Date(m.reviewDate).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full lg:w-auto justify-end border-t lg:border-none pt-4 lg:pt-0 border-emerald-900/5">
                      <button 
                        onClick={() => { setSelectedMed(m); setIsFormOpen(true); }}
                        className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-white transition-colors px-4 py-2"
                      >
                        Profile Detail
                      </button>
                      {hasPermission('medication.archive') && m.status !== 'Discontinued' && (
                        <button 
                          onClick={async () => {
                            if (!window.confirm('Discontinue this medication?')) return;
                            await fetch(`/api/medication/${m.id}/archive`, { method: 'PATCH' });
                            fetchMedications();
                          }}
                          className="px-6 py-2 bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all"
                        >
                          Discontinue
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      </>
      )}

      {medView === 'mar' && <MedicationMARView clients={clients} />}
      {medView === 'stock' && <MedicationStockView clients={clients} />}

      {isFormOpen && (
        <MedicationForm 
          medication={selectedMed}
          onClose={() => setIsFormOpen(false)}
          onSuccess={() => { setIsFormOpen(false); fetchMedications(); }}
        />
      )}
    </div>
  );
};

const MedicationForm = ({ medication, onClose, onSuccess }: { medication?: any, onClose: () => void, onSuccess: () => void }) => {
  const [formData, setFormData] = useState({
    clientId: medication?.clientId || '',
    medicationName: medication?.medicationName || '',
    strength: medication?.strength || '',
    form: medication?.form || 'Tablet',
    route: medication?.route || 'Oral',
    dosageInstructions: medication?.dosageInstructions || '',
    frequency: medication?.frequency || 'Daily',
    medicationType: medication?.medicationType || 'Regular',
    isPRN: medication?.isPRN || false,
    prnGuidance: medication?.prnGuidance || '',
    isTopical: medication?.isTopical || false,
    bodyMapNotes: medication?.bodyMapNotes || '',
    startDate: medication?.startDate ? new Date(medication.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    reviewDate: medication?.reviewDate ? new Date(medication.reviewDate).toISOString().split('T')[0] : '',
    status: medication?.status || 'Active',
    riskNotes: medication?.riskNotes || '',
    prescribedBy: medication?.prescribedBy || '',
    pharmacy: medication?.pharmacy || '',
    maxDose24Hours: medication?.maxDose24Hours || '',
    prnReason: medication?.prnReason || ''
  });
  const [clients, setClients] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/clients')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setClients(data); });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const url = medication ? `/api/medication/${medication.id}` : '/api/medication';
    const method = medication ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else onSuccess();
    } catch (err) {
      setError('Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl bg-[#111413] border border-emerald-900/30 rounded-2xl shadow-2xl p-8 overflow-y-auto max-h-[90vh]"
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold text-white tracking-tight uppercase">
            {medication ? 'Update Medication Profile' : 'Add Medication Record'}
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Care Recipient (Client)</label>
              <select 
                value={formData.clientId}
                onChange={e => setFormData({...formData, clientId: e.target.value})}
                required
                className="form-input"
              >
                <option value="">Link to Client...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Medication Name</label>
              <input 
                type="text" required
                placeholder="e.g. Paracetamol"
                value={formData.medicationName}
                onChange={e => setFormData({...formData, medicationName: e.target.value})}
                className="form-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Strength</label>
              <input 
                type="text" required
                placeholder="e.g. 500mg"
                value={formData.strength}
                onChange={e => setFormData({...formData, strength: e.target.value})}
                className="form-input"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Form</label>
              <select 
                value={formData.form}
                onChange={e => setFormData({...formData, form: e.target.value})}
                className="form-input"
              >
                <option value="Tablet">Tablet</option>
                <option value="Capsule">Capsule</option>
                <option value="Liquid">Liquid</option>
                <option value="Cream">Cream / Ointment</option>
                <option value="Inhaler">Inhaler</option>
                <option value="Injection">Injection</option>
                <option value="Patch">Patch</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Route</label>
              <select 
                value={formData.route}
                onChange={e => setFormData({...formData, route: e.target.value})}
                className="form-input"
              >
                <option value="Oral">Oral</option>
                <option value="Topical">Topical</option>
                <option value="Inhalation">Inhalation</option>
                <option value="Subcutaneous">Subcutaneous</option>
                <option value="Intramuscular">Intramuscular</option>
                <option value="Transdermal">Transdermal</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Prescribing Authority (Doctor/GP)</label>
              <input 
                type="text" 
                placeholder="e.g. Dr. Smith"
                value={formData.prescribedBy}
                onChange={e => setFormData({...formData, prescribedBy: e.target.value})}
                className="form-input"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Dispensing Pharmacy</label>
              <input 
                type="text"
                placeholder="e.g. Boots Pharmacy"
                value={formData.pharmacy}
                onChange={e => setFormData({...formData, pharmacy: e.target.value})}
                className="form-input"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Dosage Instructions</label>
            <textarea 
              required
              value={formData.dosageInstructions}
              onChange={e => setFormData({...formData, dosageInstructions: e.target.value})}
              className="form-input h-20 resize-none"
              placeholder="Detailed administration instructions..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Frequency</label>
              <input 
                type="text" required
                placeholder="e.g. Twice Daily (Morning & Evening)"
                value={formData.frequency}
                onChange={e => setFormData({...formData, frequency: e.target.value})}
                className="form-input"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Medication Type</label>
              <select 
                value={formData.medicationType}
                onChange={e => setFormData({...formData, medicationType: e.target.value})}
                className="form-input"
              >
                <option value="Regular">Regular Medication</option>
                <option value="PRN">PRN (As Required)</option>
                <option value="Topical">Topical / Cream</option>
                <option value="Controlled Drug">Controlled Drug</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="flex gap-8">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div 
                onClick={() => setFormData({...formData, isPRN: !formData.isPRN})}
                className={`w-5 h-5 rounded border transition-all flex items-center justify-center ${formData.isPRN ? 'bg-emerald-600 border-emerald-500' : 'border-emerald-900/30'}`}
              >
                {formData.isPRN && <CheckCircle2 size={12} className="text-white" />}
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-slate-300">Is PRN / Variable</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <div 
                onClick={() => setFormData({...formData, isTopical: !formData.isTopical})}
                className={`w-5 h-5 rounded border transition-all flex items-center justify-center ${formData.isTopical ? 'bg-emerald-600 border-emerald-500' : 'border-emerald-900/30'}`}
              >
                {formData.isTopical && <CheckCircle2 size={12} className="text-white" />}
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-slate-300">Is Topical / Requires Body Map</span>
            </label>
          </div>

          <AnimatePresence>
            {formData.isPRN && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 overflow-hidden bg-blue-500/5 p-4 rounded-xl border border-blue-500/10"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">PRN Reason / Indication</label>
                    <input 
                      type="text"
                      placeholder="e.g. Pain relief, agitation"
                      value={formData.prnReason}
                      onChange={e => setFormData({...formData, prnReason: e.target.value})}
                      className="form-input border-blue-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Max Dose in 24 Hours</label>
                    <input 
                      type="text"
                      placeholder="e.g. 8 tablets (4000mg)"
                      value={formData.maxDose24Hours}
                      onChange={e => setFormData({...formData, maxDose24Hours: e.target.value})}
                      className="form-input border-blue-500/20"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">PRN Guidance & Protocol</label>
                  <textarea 
                    value={formData.prnGuidance}
                    onChange={e => setFormData({...formData, prnGuidance: e.target.value})}
                    className="form-input h-20 resize-none border-blue-500/20"
                    placeholder="Specify exact interval between doses, specific signs to look for..."
                  />
                </div>
              </motion.div>
            )}

            {formData.isTopical && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 overflow-hidden"
              >
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Body Map Notes (Mandatory for Topical)</label>
                <textarea 
                  value={formData.bodyMapNotes}
                  onChange={e => setFormData({...formData, bodyMapNotes: e.target.value})}
                  className="form-input h-20 resize-none border-blue-500/30"
                  placeholder="Describe exact locations on the body map for application..."
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">System Start Date</label>
              <input 
                type="date" required
                value={formData.startDate}
                onChange={e => setFormData({...formData, startDate: e.target.value})}
                className="form-input"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Next Compliance Review</label>
              <input 
                type="date" required
                value={formData.reviewDate}
                onChange={e => setFormData({...formData, reviewDate: e.target.value})}
                className="form-input"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Risk Assessment Notes</label>
            <textarea 
              value={formData.riskNotes}
              onChange={e => setFormData({...formData, riskNotes: e.target.value})}
              className="form-input h-20 resize-none"
              placeholder="e.g. High risk of drowsiness, consult with GP..."
            />
          </div>

          <div className="flex gap-4 pt-4 border-t border-emerald-900/10">
            <button 
              type="button" onClick={onClose}
              className="px-8 py-4 rounded-xl border border-emerald-900/30 text-slate-400 font-bold uppercase tracking-widest text-[10px] hover:bg-emerald-900/10 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit" disabled={isSubmitting}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-xl shadow-emerald-900/40 uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3"
            >
              <Save size={16} />
              {isSubmitting ? 'Syncing...' : (medication ? 'Commit To Records' : 'Register Medication')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const MedicationOrdersView = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [filter, setFilter] = useState({ status: '', clientId: '' });
  const [clients, setClients] = useState<any[]>([]);
  const { hasPermission } = useAuth();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (filter.status) query.append('status', filter.status);
      if (filter.clientId) query.append('clientId', filter.clientId);
      const res = await fetch(`/api/medication-orders?${query.toString()}`);
      const data = await res.json();
      if (Array.isArray(data)) setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch('/api/clients').then(res => res.json()).then(data => { if (Array.isArray(data)) setClients(data); });
    fetchOrders();
  }, [filter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Checked': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'Received': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'Collected': return 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20';
      case 'Ready for Collection': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'Ordered': return 'text-slate-400 bg-slate-800 border-slate-700';
      case 'Issue Reported': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-slate-500 bg-slate-900 border-slate-800';
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight uppercase mb-1">Pharmacy Orders</h1>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Supply Chain & Tracking</p>
        </div>
        <div className="flex gap-3">
          {hasPermission('medication.orders.create') && (
            <button 
              onClick={() => { setSelectedOrder(null); setIsFormOpen(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-900/20"
            >
              <Plus size={16} />
              New Order
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
        <select 
          value={filter.clientId}
          onChange={(e) => setFilter({...filter, clientId: e.target.value})}
          className="bg-[#111413] border border-emerald-900/20 text-slate-300 text-[10px] font-bold uppercase tracking-widest rounded-lg px-4 py-2 outline-none focus:border-emerald-500"
        >
          <option value="">All Clients</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
        </select>
        <select 
          value={filter.status}
          onChange={(e) => setFilter({...filter, status: e.target.value})}
          className="bg-[#111413] border border-emerald-900/20 text-slate-300 text-[10px] font-bold uppercase tracking-widest rounded-lg px-4 py-2 outline-none focus:border-emerald-500"
        >
          <option value="">All Statuses</option>
          <option value="Draft">Draft</option>
          <option value="Requested">Requested</option>
          <option value="Ordered">Ordered</option>
          <option value="Ready for Collection">Ready for Collection</option>
          <option value="Collected">Collected</option>
          <option value="Received">Received</option>
          <option value="Checked">Checked</option>
          <option value="Issue Reported">Issue Reported</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="py-20 text-center text-slate-500 font-mono text-xs uppercase tracking-widest">Querying Global Pharmacy Hub...</div>
        ) : orders.length === 0 ? (
          <div className="premium-card bg-[#111413] p-12 text-center border-dashed border-emerald-900/20">
            <ShoppingCart size={40} className="mx-auto text-emerald-900/40 mb-4" />
            <h3 className="text-white font-bold mb-1 uppercase tracking-tight">No Active Orders</h3>
            <p className="text-slate-500 text-xs uppercase tracking-widest">Start a new prescription request to track supply.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const isOverdue = ['Requested', 'Ordered', 'Ready for Collection'].includes(order.status) && order.expectedCollectionDate && new Date(order.expectedCollectionDate) < new Date();
              
              return (
                <div key={order.id} className="premium-card p-6 group transition-all border-l-4 border-l-emerald-600">
                  <div className="flex flex-col lg:flex-row gap-6 justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <span className={`px-2.5 py-1 rounded text-[10px] font-bold border uppercase tracking-wider ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                        {isOverdue && (
                          <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-red-500/20 text-red-500 border border-red-500/30 uppercase tracking-wider animate-pulse">
                            Overdue Collection
                          </span>
                        )}
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                          ID: {order.id.slice(0, 8)}
                        </span>
                      </div>

                      <h3 className="text-white font-bold text-lg tracking-tight uppercase mb-1">
                        {order.client.firstName} {order.client.lastName}
                      </h3>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Building2 size={12} className="text-emerald-500" />
                        Pharmacy: {order.pharmacyName || 'Unknown'} • {order.collectionMethod || 'N/A'}
                      </p>

                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 py-4 border-t border-emerald-900/10">
                        <div>
                          <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1 font-bold">Requested</p>
                          <p className="text-[11px] text-white font-bold">{order.prescriptionRequestDate ? new Date(order.prescriptionRequestDate).toLocaleDateString() : '-'}</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1 font-bold">Expected</p>
                          <p className={`text-[11px] font-bold ${isOverdue ? 'text-red-500' : 'text-white'}`}>
                            {order.expectedCollectionDate ? new Date(order.expectedCollectionDate).toLocaleDateString() : '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1 font-bold">Items</p>
                          <p className="text-[11px] text-emerald-500 font-bold">{order.items.length} Product(s)</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1 font-bold">Updated</p>
                          <p className="text-[11px] text-white font-bold">{new Date(order.updatedAt).toLocaleDateString()}</p>
                        </div>
                      </div>

                      {order.notes && (
                        <div className="mt-4 p-3 bg-emerald-950/20 rounded-lg border border-emerald-900/10">
                          <p className="text-[10px] text-slate-400 italic">"{order.notes}"</p>
                        </div>
                      )}

                      <div className="mt-6 flex items-center gap-1 overflow-hidden">
                        {[
                          { label: 'Req', status: 'Requested' },
                          { label: 'Ord', status: 'Ordered' },
                          { label: 'Ready', status: 'Ready for Collection' },
                          { label: 'Col', status: 'Collected' },
                          { label: 'Rec', status: 'Received' },
                          { label: 'Chk', status: 'Checked' }
                        ].map((step, idx, arr) => {
                          const statuses = arr.map(s => s.status);
                          const currentIdx = statuses.indexOf(order.status);
                          const isDone = currentIdx >= idx || order.status === 'Checked';
                          const isCurrent = currentIdx === idx;
                          
                          return (
                            <React.Fragment key={step.label}>
                              <div className="flex flex-col items-center gap-1 group/step">
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold transition-all ${
                                  isDone ? 'bg-emerald-500 text-[#050706]' : 'bg-slate-800 text-slate-600'
                                } ${isCurrent ? 'ring-4 ring-emerald-500/20 scale-110' : ''}`}>
                                  {isDone ? '✓' : idx + 1}
                                </div>
                                <span className={`text-[7px] font-bold uppercase tracking-tighter ${isDone ? 'text-emerald-500' : 'text-slate-600'}`}>
                                  {step.label}
                                </span>
                              </div>
                              {idx < arr.length - 1 && (
                                <div className={`flex-1 h-[2px] mt-[-10px] min-w-[10px] ${isDone && currentIdx > idx ? 'bg-emerald-500' : 'bg-slate-800'}`} />
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 w-full lg:w-auto">
                      <button 
                         onClick={() => { setSelectedOrder(order); setIsFormOpen(true); }}
                         className="px-6 py-2 border border-emerald-900/30 text-slate-400 hover:text-white hover:border-emerald-500 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all"
                      >
                        Manage Supply
                      </button>
                      {hasPermission('medication.orders.status') && (
                        <div className="flex gap-2">
                          <button 
                             onClick={async () => {
                               await fetch(`/api/medication-orders/${order.id}/status`, {
                                 method: 'PATCH',
                                 headers: { 'Content-Type': 'application/json' },
                                 body: JSON.stringify({ status: 'Collected' })
                               });
                               fetchOrders();
                             }}
                             className="px-3 py-2 bg-emerald-600/10 text-emerald-500 hover:bg-emerald-600 hover:text-white rounded-lg text-[9px] font-extrabold uppercase tracking-tighter transition-all flex-1"
                          >
                            Mark Collected
                          </button>
                          <button 
                             onClick={async () => {
                               await fetch(`/api/medication-orders/${order.id}/status`, {
                                 method: 'PATCH',
                                 headers: { 'Content-Type': 'application/json' },
                                 body: JSON.stringify({ status: 'Issue Reported' })
                               });
                               fetchOrders();
                             }}
                             className="px-3 py-2 bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white rounded-lg text-[9px] font-extrabold uppercase tracking-tighter transition-all flex-1"
                          >
                            Report Issue
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isFormOpen && (
        <MedicationOrderForm 
          order={selectedOrder}
          onClose={() => setIsFormOpen(false)}
          onSuccess={() => { setIsFormOpen(false); fetchOrders(); }}
        />
      )}
    </div>
  );
};

const MedicationOrderForm = ({ order, onClose, onSuccess }: { order?: any, onClose: () => void, onSuccess: () => void }) => {
  const [formData, setFormData] = useState({
    clientId: order?.clientId || '',
    pharmacyName: order?.pharmacyName || '',
    prescriptionRequestDate: order?.prescriptionRequestDate ? new Date(order.prescriptionRequestDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    orderDate: order?.orderDate ? new Date(order.orderDate).toISOString().split('T')[0] : '',
    expectedCollectionDate: order?.expectedCollectionDate ? new Date(order.expectedCollectionDate).toISOString().split('T')[0] : '',
    collectionDate: order?.collectionDate ? new Date(order.collectionDate).toISOString().split('T')[0] : '',
    receivedDate: order?.receivedDate ? new Date(order.receivedDate).toISOString().split('T')[0] : '',
    checkedDate: order?.checkedDate ? new Date(order.checkedDate).toISOString().split('T')[0] : '',
    status: order?.status || 'Requested',
    collectionMethod: order?.collectionMethod || 'Pharmacy Collection',
    notes: order?.notes || ''
  });
  const [items, setItems] = useState<any[]>(order?.items || []);
  const [clients, setClients] = useState<any[]>([]);
  const [medications, setMedications] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/clients').then(res => res.json()).then(data => { if (Array.isArray(data)) setClients(data); });
    if (formData.clientId) {
      fetch(`/api/medication?clientId=${formData.clientId}&status=Active`)
        .then(res => res.json())
        .then(data => { if (Array.isArray(data)) setMedications(data); });
    }
  }, [formData.clientId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setError('At least one item is required');
      return;
    }
    setIsSubmitting(true);
    setError('');

    const url = order ? `/api/medication-orders/${order.id}` : '/api/medication-orders';
    const method = order ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, items })
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else onSuccess();
    } catch (err) {
      setError('Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addItem = () => {
    setItems([...items, { medicationName: '', quantityRequested: '1 Month Supply', itemStatus: 'Requested' }]);
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-3xl bg-[#111413] border border-emerald-900/30 rounded-2xl shadow-2xl p-8 overflow-y-auto max-h-[90vh]"
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold text-white tracking-tight uppercase">
            {order ? 'Compliance Logic: Order Review' : 'Initiate Medication Batch Order'}
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Target Client</label>
              <select 
                value={formData.clientId}
                onChange={e => setFormData({...formData, clientId: e.target.value})}
                required
                className="form-input"
              >
                <option value="">Select Recipient...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pharmacy Authority</label>
              <input 
                type="text" required
                placeholder="e.g. South Green Pharmacy"
                value={formData.pharmacyName}
                onChange={e => setFormData({...formData, pharmacyName: e.target.value})}
                className="form-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Order Status</label>
              <select 
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value})}
                className="form-input text-emerald-500 font-bold"
              >
                <option value="Requested">Requested</option>
                <option value="Ordered">Ordered</option>
                <option value="Ready for Collection">Ready for Collection</option>
                <option value="Collected">Collected</option>
                <option value="Received">Received</option>
                <option value="Checked">Checked</option>
                <option value="Issue Reported">Issue Reported</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Collection Logic</label>
              <select 
                value={formData.collectionMethod}
                onChange={e => setFormData({...formData, collectionMethod: e.target.value})}
                className="form-input"
              >
                <option value="Pharmacy Collection">Pharmacy Collection</option>
                <option value="Pharmacy Delivery">Pharmacy Collection</option>
                <option value="Family Collection">Family Collection</option>
                <option value="Staff Collection">Staff Collection</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Expected Date</label>
              <input 
                type="date"
                value={formData.expectedCollectionDate}
                onChange={e => setFormData({...formData, expectedCollectionDate: e.target.value})}
                className="form-input"
              />
            </div>
          </div>

          <div className="p-6 bg-emerald-950/20 border border-emerald-900/30 rounded-2xl relative">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4 flex items-center justify-between">
              Supply Line Items
              <button 
                type="button" onClick={addItem}
                className="text-[10px] text-emerald-500 hover:text-emerald-400 font-bold uppercase transition-colors"
              >
                + Add Medication
              </button>
            </h3>
            
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {items.map((item, idx) => (
                <div key={idx} className="flex gap-3 items-center border-b border-emerald-900/10 pb-3">
                  <div className="flex-1">
                    <select 
                      value={item.medicationId || ''}
                      onChange={e => {
                        const med = medications.find(m => m.id === e.target.value);
                        updateItem(idx, 'medicationId', e.target.value);
                        updateItem(idx, 'medicationName', med ? med.medicationName : '');
                      }}
                      className="form-input text-[11px] py-2 mb-1"
                    >
                      <option value="">Manual Entry...</option>
                      {medications.map(m => <option key={m.id} value={m.id}>{m.medicationName} ({m.strength})</option>)}
                    </select>
                    {!item.medicationId && (
                      <input 
                        type="text" placeholder="Product Name"
                        value={item.medicationName}
                        onChange={e => updateItem(idx, 'medicationName', e.target.value)}
                        className="form-input text-[11px] py-1.5"
                      />
                    )}
                  </div>
                  <div className="w-32">
                    <input 
                      type="text" placeholder="Qty (e.g. 28)"
                      value={item.quantityRequested}
                      onChange={e => updateItem(idx, 'quantityRequested', e.target.value)}
                      className="form-input text-[11px] py-2"
                    />
                  </div>
                  <button onClick={() => removeItem(idx)} className="text-red-900/50 hover:text-red-500 p-2">
                    <X size={14} />
                  </button>
                </div>
              ))}
              {items.length === 0 && (
                <div className="text-center py-6 border border-dashed border-emerald-900/20 rounded-xl text-slate-500 text-[10px] uppercase font-bold tracking-widest">
                  No line items registered
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Coordination Notes</label>
            <textarea 
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
              className="form-input h-20 resize-none"
              placeholder="e.g. Family will collect, prescription waiting on GP signature..."
            />
          </div>

          <div className="flex gap-4 pt-4 border-t border-emerald-900/10">
            <button 
              type="button" onClick={onClose}
              className="px-8 py-4 rounded-xl border border-emerald-900/30 text-slate-400 font-bold uppercase tracking-widest text-[10px] hover:bg-emerald-900/10 transition-all"
            >
              Abort
            </button>
            <button 
              type="submit" disabled={isSubmitting}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-xl shadow-emerald-900/40 uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3"
            >
              <Save size={16} />
              {isSubmitting ? 'Syncing Supply Chain...' : (order ? 'Verify Order Update' : 'Initialize Batch Order')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const CarePlansView = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [filter, setFilter] = useState({ clientId: '', status: '' });
  const { hasPermission } = useAuth();

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (filter.clientId) query.append('clientId', filter.clientId);
      if (filter.status) query.append('status', filter.status);
      const res = await fetch(`/api/care-plans?${query.toString()}`);
      const data = await res.json();
      if (Array.isArray(data)) setPlans(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch('/api/clients').then(res => res.json()).then(data => { if (Array.isArray(data)) setClients(data); });
    fetchPlans();
  }, [filter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'Under Review': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'Superseded': return 'text-slate-500 bg-slate-900 border-slate-800';
      case 'Archived': return 'text-red-500/60 bg-red-500/5 border-red-500/10';
      default: return 'text-slate-500 bg-slate-900 border-slate-800';
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight uppercase mb-1">Care Plans</h1>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Standardized Care Assessments</p>
        </div>
        <div className="flex gap-3">
          {hasPermission('carePlans.create') && (
            <button 
              onClick={() => { setSelectedPlan(null); setIsFormOpen(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-900/20"
            >
              <Plus size={16} />
              New Care Plan
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
        <select 
          value={filter.clientId}
          onChange={(e) => setFilter({...filter, clientId: e.target.value})}
          className="bg-[#111413] border border-emerald-900/20 text-slate-300 text-[10px] font-bold uppercase tracking-widest rounded-lg px-4 py-2 outline-none focus:border-emerald-500"
        >
          <option value="">All Clients</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
        </select>
        <select 
          value={filter.status}
          onChange={(e) => setFilter({...filter, status: e.target.value})}
          className="bg-[#111413] border border-emerald-900/20 text-slate-300 text-[10px] font-bold uppercase tracking-widest rounded-lg px-4 py-2 outline-none focus:border-emerald-500"
        >
          <option value="">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Draft">Draft</option>
          <option value="Under Review">Under Review</option>
          <option value="Superseded">Superseded</option>
          <option value="Archived">Archived</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="py-20 text-center text-slate-500 font-mono text-xs uppercase tracking-widest">Accessing Clinical Archives...</div>
        ) : plans.length === 0 ? (
          <div className="premium-card bg-[#111413] p-12 text-center border-dashed border-emerald-900/20">
            <BookOpen size={40} className="mx-auto text-emerald-900/40 mb-4" />
            <h3 className="text-white font-bold mb-1 uppercase tracking-tight">No Care Plans Found</h3>
            <p className="text-slate-500 text-xs uppercase tracking-widest">Create a care plan for a client.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {plans.map((plan) => {
              const isOverdue = plan.status === 'Active' && plan.reviewDate && new Date(plan.reviewDate) < new Date();
              
              return (
                <div key={plan.id} className="premium-card p-6 group transition-all hover:border-emerald-500/40 border-l-4 border-l-emerald-600">
                  <div className="flex flex-col lg:flex-row gap-6 justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <span className={`px-2.5 py-1 rounded text-[10px] font-bold border uppercase tracking-wider ${getStatusColor(plan.status)}`}>
                          {plan.status}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-slate-400 border border-slate-700 uppercase">
                          v{plan.version}
                        </span>
                        {isOverdue && (
                          <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-red-500/20 text-red-500 border border-red-500/30 uppercase tracking-wider animate-pulse flex items-center gap-1">
                            <AlertCircle size={10} />
                            Review Overdue
                          </span>
                        )}
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                          ID: {plan.id.slice(0, 8)}
                        </span>
                      </div>

                      <h3 className="text-white font-bold text-lg tracking-tight uppercase mb-1">
                        {plan.client.firstName} {plan.client.lastName}
                      </h3>
                      <p className="text-emerald-500 text-xs font-bold uppercase tracking-widest mb-4">
                        {plan.title}
                      </p>

                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 py-4 border-t border-emerald-900/10">
                        <div>
                          <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1 font-bold">Next Review</p>
                          <p className={`text-[11px] font-bold ${isOverdue ? 'text-red-500' : 'text-white'}`}>
                            {plan.reviewDate ? new Date(plan.reviewDate).toLocaleDateString() : 'TBD'}
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1 font-bold">Last Reviewed</p>
                          <p className="text-[11px] text-white font-bold">{plan.reviewedAt ? new Date(plan.reviewedAt).toLocaleDateString() : 'Never'}</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1 font-bold">Created</p>
                          <p className="text-[11px] text-white font-bold">{new Date(plan.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1 font-bold">Summary</p>
                          <p className="text-[11px] text-slate-400 truncate w-32 font-medium">{plan.summary || 'No summary provided'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 w-full lg:w-auto">
                      <button 
                         onClick={() => { setSelectedPlan(plan); setIsFormOpen(true); }}
                         className="px-6 py-2 border border-emerald-900/30 text-slate-400 hover:text-white hover:border-emerald-500 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all"
                      >
                        Manage Plan
                      </button>
                      {plan.status === 'Active' && hasPermission('carePlans.review') && (
                        <button 
                           onClick={async () => {
                             const nextReview = new Date();
                             nextReview.setMonth(nextReview.getMonth() + 3);
                             await fetch(`/api/care-plans/${plan.id}/review`, {
                               method: 'PATCH',
                               headers: { 'Content-Type': 'application/json' },
                               body: JSON.stringify({ nextReviewDate: nextReview })
                             });
                             fetchPlans();
                           }}
                           className="px-6 py-2 bg-emerald-600/10 text-emerald-500 hover:bg-emerald-600 hover:text-white rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                        >
                          <RefreshCw size={12} />
                          Quick Review
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isFormOpen && (
        <CarePlanForm 
          plan={selectedPlan}
          clients={clients}
          onClose={() => setIsFormOpen(false)}
          onSuccess={() => { setIsFormOpen(false); fetchPlans(); }}
        />
      )}
    </div>
  );
};

const CarePlanForm = ({ plan, clients, onClose, onSuccess }: { plan?: any, clients: any[], onClose: () => void, onSuccess: () => void }) => {
  const [formData, setFormData] = useState({
    clientId: plan?.clientId || '',
    title: plan?.title || 'Comprehensive Care Strategy',
    status: plan?.status || 'Active',
    summary: plan?.summary || '',
    personalCareNeeds: plan?.personalCareNeeds || '',
    mobilityNeeds: plan?.mobilityNeeds || '',
    nutritionHydrationNeeds: plan?.nutritionHydrationNeeds || '',
    medicationSupportNeeds: plan?.medicationSupportNeeds || '',
    communicationNeeds: plan?.communicationNeeds || '',
    continenceNeeds: plan?.continenceNeeds || '',
    mentalHealthNeeds: plan?.mentalHealthNeeds || '',
    cognitionNeeds: plan?.cognitionNeeds || '',
    socialNeeds: plan?.socialNeeds || '',
    religiousCulturalNeeds: plan?.religiousCulturalNeeds || '',
    risksSummary: plan?.risksSummary || '',
    outcomes: plan?.outcomes || '',
    preferences: plan?.preferences || '',
    reviewDate: plan?.reviewDate ? new Date(plan.reviewDate).toISOString().split('T')[0] : new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('summary');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const url = plan ? `/api/care-plans/${plan.id}` : '/api/care-plans';
    const method = plan ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else onSuccess();
    } catch (err) {
      setError('Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { id: 'summary', label: 'Summary' },
    { id: 'physical', label: 'Physical & Mobility' },
    { id: 'clinical', label: 'Clinical & Continence' },
    { id: 'mental', label: 'Mental & Social' },
    { id: 'risk', label: 'Outcome & Risk' }
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-5xl bg-[#111413] border border-emerald-900/30 rounded-2xl shadow-2xl p-8 flex flex-col max-h-[90vh]"
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 flex items-center justify-center text-emerald-500">
              <BookOpen size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight uppercase">
                {plan ? 'Edit Care Plan' : 'New Care Plan Formulation'}
              </h2>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Standard Version Control • Client centered care</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          {error && (
            <div className="p-4 mb-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Client Identity</label>
              <select 
                value={formData.clientId}
                onChange={e => setFormData({...formData, clientId: e.target.value})}
                required
                disabled={!!plan}
                className="form-input text-xs"
              >
                <option value="">Select Recipient...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Plan Designation</label>
              <input 
                type="text" required
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                placeholder="e.g. Daily Living Support"
                className="form-input text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Lifecycle Status</label>
              <select 
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value})}
                className="form-input text-xs font-bold text-emerald-500"
              >
                <option value="Draft">Draft (Build Phase)</option>
                <option value="Active">Active (Live Implementation)</option>
                <option value="Under Review">Under Review (Audit Phase)</option>
                <option value="Archived">Archived (Retired)</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 border-b border-emerald-900/10 mb-6 overflow-x-auto pb-px">
            {tabs.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all relative ${
                  activeTab === tab.id ? 'text-emerald-500' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && <motion.div layoutId="activeTabPlan" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto space-y-6 pr-4 custom-scrollbar">
            {activeTab === 'summary' && (
              <div className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                     <FileText size={14} /> Care Executive Summary
                   </label>
                   <textarea 
                     value={formData.summary}
                     onChange={e => setFormData({...formData, summary: e.target.value})}
                     className="form-input h-32 text-xs leading-relaxed"
                     placeholder="Provide a high-level overview of the client's care requirements and personality..."
                   />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Preferences & Life Story</label>
                    <textarea 
                      value={formData.preferences}
                      onChange={e => setFormData({...formData, preferences: e.target.value})}
                      className="form-input h-24 text-xs"
                      placeholder="What matters to the client? Likes, dislikes, routine..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Next Governance Review</label>
                    <input 
                      type="date"
                      value={formData.reviewDate}
                      onChange={e => setFormData({...formData, reviewDate: e.target.value})}
                      className="form-input text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'physical' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Personal Care Needs</label>
                  <textarea 
                    value={formData.personalCareNeeds}
                    onChange={e => setFormData({...formData, personalCareNeeds: e.target.value})}
                    className="form-input h-32 text-xs"
                    placeholder="Washing, dressing, grooming support..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Mobility & Transfers</label>
                  <textarea 
                    value={formData.mobilityNeeds}
                    onChange={e => setFormData({...formData, mobilityNeeds: e.target.value})}
                    className="form-input h-32 text-xs"
                    placeholder="Walking aids, hoisting, repositioning..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Nutrition & Hydration</label>
                  <textarea 
                    value={formData.nutritionHydrationNeeds}
                    onChange={e => setFormData({...formData, nutritionHydrationNeeds: e.target.value})}
                    className="form-input h-32 text-xs"
                    placeholder="Dietary requirements, fluid intake, meal prep..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Medication Administration</label>
                  <textarea 
                    value={formData.medicationSupportNeeds}
                    onChange={e => setFormData({...formData, medicationSupportNeeds: e.target.value})}
                    className="form-input h-32 text-xs"
                    placeholder="Level of support needed for meds..."
                  />
                </div>
              </div>
            )}

            {activeTab === 'clinical' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Communication Profile</label>
                  <textarea 
                    value={formData.communicationNeeds}
                    onChange={e => setFormData({...formData, communicationNeeds: e.target.value})}
                    className="form-input h-32 text-xs"
                    placeholder="Speech, hearing, vision, communication aids..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Continence & Elimination</label>
                  <textarea 
                    value={formData.continenceNeeds}
                    onChange={e => setFormData({...formData, continenceNeeds: e.target.value})}
                    className="form-input h-32 text-xs"
                    placeholder="Toileting support, catheter/stoma care..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Cognition & Awareness</label>
                  <textarea 
                    value={formData.cognitionNeeds}
                    onChange={e => setFormData({...formData, cognitionNeeds: e.target.value})}
                    className="form-input h-32 text-xs"
                    placeholder="Dementia, memory, orientation..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Religious & Cultural</label>
                  <textarea 
                    value={formData.religiousCulturalNeeds}
                    onChange={e => setFormData({...formData, religiousCulturalNeeds: e.target.value})}
                    className="form-input h-32 text-xs"
                    placeholder="Faith, language, cultural traditions..."
                  />
                </div>
              </div>
            )}

            {activeTab === 'mental' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Mental Health & Wellbeing</label>
                  <textarea 
                    value={formData.mentalHealthNeeds}
                    onChange={e => setFormData({...formData, mentalHealthNeeds: e.target.value})}
                    className="form-input h-40 text-xs"
                    placeholder="Depression, anxiety, coping mechanisms..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Social Inclusion & Interaction</label>
                  <textarea 
                    value={formData.socialNeeds}
                    onChange={e => setFormData({...formData, socialNeeds: e.target.value})}
                    className="form-input h-40 text-xs"
                    placeholder="Family, loneliness, community participation..."
                  />
                </div>
              </div>
            )}

            {activeTab === 'risk' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Integrated Risk Profile</label>
                  <textarea 
                    value={formData.risksSummary}
                    onChange={e => setFormData({...formData, risksSummary: e.target.value})}
                    className="form-input h-40 text-xs"
                    placeholder="Summary of key risks identified in assessments..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white uppercase tracking-widest">Defined Outcomes</label>
                  <textarea 
                    value={formData.outcomes}
                    onChange={e => setFormData({...formData, outcomes: e.target.value})}
                    className="form-input h-40 text-xs"
                    placeholder="What goals is this plan intended to achieve?..."
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-6 mt-6 border-t border-emerald-900/10">
            <button 
              type="button" onClick={onClose}
              className="px-8 py-4 rounded-xl border border-emerald-900/30 text-slate-400 font-bold uppercase tracking-widest text-[10px] hover:bg-emerald-900/10 transition-all font-mono"
            >
              Cancel Formulation
            </button>
            <button 
              type="submit" disabled={isSubmitting}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-xl shadow-emerald-900/40 uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3"
            >
              <Save size={16} />
              {isSubmitting ? 'Saving changes...' : (plan ? 'Update Care Plan' : 'Create Care Plan')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const SignupView = ({ onToggle }: { onToggle: () => void }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    companyName: '',
    tradingName: '',
    addressLine1: '',
    town: '',
    postcode: '',
    ownerName: '',
    ownerEmail: '',
    ownerPassword: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (!formData.companyName || !formData.addressLine1 || !formData.town || !formData.postcode) {
        setError('Required organization fields missing.');
        return;
      }
      setStep(2);
      return;
    }

    setIsSubmitting(true);
    setError('');
    
    try {
      const res = await fetch('/api/auth/signup-company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else login(data.user);
    } catch (err) {
      setError('Signup failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#050706]">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500 inline-flex items-center justify-center mb-6 shadow-2xl shadow-emerald-500/20">
            <Building2 size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tighter mb-2">Create Authority</h1>
          <p className="text-slate-500 text-sm font-medium uppercase tracking-widest">
            {step === 1 ? 'Company Details' : 'Master Account Setup'}
          </p>
        </div>

        <form onSubmit={handleSignup} className="bg-[#111413] border border-emerald-900/20 p-8 rounded-2xl shadow-2xl space-y-6">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          {step === 1 ? (
            <>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Organization Name</label>
                <input 
                  type="text" 
                  value={formData.companyName}
                  onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                  className="w-full bg-[#050706] border border-emerald-900/30 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none transition-all placeholder:text-slate-700"
                  placeholder="e.g. Bluebird Care"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Trading Name (Optional)</label>
                <input 
                  type="text" 
                  value={formData.tradingName}
                  onChange={(e) => setFormData({...formData, tradingName: e.target.value})}
                  className="w-full bg-[#050706] border border-emerald-900/30 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none transition-all placeholder:text-slate-700"
                  placeholder="e.g. BBC London"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Address Line 1</label>
                <input 
                  type="text" 
                  value={formData.addressLine1}
                  onChange={(e) => setFormData({...formData, addressLine1: e.target.value})}
                  className="w-full bg-[#050706] border border-emerald-900/30 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none transition-all placeholder:text-slate-700"
                  placeholder="123 High Street"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Town / City</label>
                  <input 
                    type="text" 
                    value={formData.town}
                    onChange={(e) => setFormData({...formData, town: e.target.value})}
                    className="w-full bg-[#050706] border border-emerald-900/30 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none transition-all placeholder:text-slate-700"
                    placeholder="London"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Postcode</label>
                  <input 
                    type="text" 
                    value={formData.postcode}
                    onChange={(e) => setFormData({...formData, postcode: e.target.value})}
                    className="w-full bg-[#050706] border border-emerald-900/30 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none transition-all placeholder:text-slate-700"
                    placeholder="SW1A 1AA"
                    required
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Full Name (Owner)</label>
                <input 
                  type="text" 
                  value={formData.ownerName}
                  onChange={(e) => setFormData({...formData, ownerName: e.target.value})}
                  className="w-full bg-[#050706] border border-emerald-900/30 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none transition-all"
                  placeholder="James Dalton"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Master Email</label>
                <input 
                  type="email" 
                  value={formData.ownerEmail}
                  onChange={(e) => setFormData({...formData, ownerEmail: e.target.value})}
                  className="w-full bg-[#050706] border border-emerald-900/30 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none transition-all"
                  placeholder="admin@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Secure Key</label>
                <input 
                  type="password" 
                  value={formData.ownerPassword}
                  onChange={(e) => setFormData({...formData, ownerPassword: e.target.value})}
                  className="w-full bg-[#050706] border border-emerald-900/30 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </>
          )}

          <div className="flex gap-4 pt-2">
            {step === 2 && (
              <button 
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl transition-all uppercase tracking-widest text-xs"
              >
                Back
              </button>
            )}
            <button 
              type="submit"
              disabled={isSubmitting}
              className="flex-[2] bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all shadow-xl shadow-emerald-900/40 uppercase tracking-widest text-xs flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  Initializing...
                </>
              ) : (step === 1 ? 'Next Step' : 'Initialize Account')}
            </button>
          </div>
        </form>

        <div className="mt-8 pt-8 border-t border-emerald-900/10 text-center">
          <p className="text-slate-500 text-sm">
            Already have an account? <span onClick={onToggle} className="text-brand-emerald-400 cursor-pointer hover:underline">Log in here</span>
          </p>
        </div>
      </div>
    </div>
  );
};

const LoginView = ({ onToggle }: { onToggle: () => void }) => {
  const [email, setEmail] = useState('admin@caresuite.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else login(data.user);
    } catch (err) {
      setError('Connection failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#050706]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500 inline-flex items-center justify-center mb-6 shadow-2xl shadow-emerald-500/20">
            <div className="w-8 h-8 bg-white rounded-md"></div>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tighter mb-2">CareSuite</h1>
          <p className="text-slate-500 text-sm font-medium uppercase tracking-widest">Enterprise Care Management</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#111413] border border-emerald-900/20 p-8 rounded-2xl shadow-2xl space-y-6">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              <AlertCircle size={14} />
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email Access</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#050706] border border-emerald-900/30 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none transition-all placeholder:text-slate-700"
              placeholder="operator@caresuite.io"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Secure Key</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#050706] border border-emerald-900/30 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none transition-all placeholder:text-slate-700"
              placeholder="••••••••"
              required
            />
          </div>
          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all shadow-xl shadow-emerald-900/40 uppercase tracking-widest text-xs flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                Authenticating...
              </>
            ) : 'Authenticate'}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-emerald-900/10 text-center">
          <p className="text-slate-500 text-sm">
            Don't have an account? <span onClick={onToggle} className="text-brand-emerald-400 cursor-pointer hover:underline">Start your 14-day trial</span>
          </p>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}

function AppContent() {
  const { user, loading, logout, hasPermission } = useAuth();
  const [view, setView] = useState('dashboard');
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');

  if (loading) return (
    <div className="min-h-screen bg-[#050706] flex flex-col items-center justify-center gap-6">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 emerald-gradient rounded-lg animate-pulse"></div>
        <h1 className="text-2xl font-bold tracking-tight text-white uppercase italic">CareSuite</h1>
      </div>
      <div className="flex gap-1.5">
        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></motion.div>
        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></motion.div>
        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></motion.div>
      </div>
      <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.3em] font-mono">System Initialization</p>
    </div>
  );

  if (!user) {
    return authView === 'login' 
      ? <LoginView onToggle={() => setAuthView('signup')} /> 
      : <SignupView onToggle={() => setAuthView('login')} />;
  }

  const getHeaderTitle = () => {
    switch(view) {
      case 'dashboard': return 'Dashboard Overview';
      case 'clients': return 'Client Management';
      case 'staff': return 'Staff Operations';
      case 'visits': return 'Rota Live Feed';
      case 'compliance': return 'Compliance Oversight';
      case 'actions': return 'Compliance Module';
      case 'risks': return 'Risk Register';
      case 'audits': return 'Quality Audits';
      case 'medication': return 'Medication Records';
      case 'medication-orders': return 'Medication Supply Chain';
      case 'care-plans': return 'Care Strategy & Planning';
      case 'reports': return 'Reporting & Analytics';
      case 'users': return 'User Directory';
      case 'roles': return 'Access Control';
      case 'company': return 'Organization Settings';
      default: return 'CareSuite Console';
    }
  };

  const renderView = () => {
    switch(view) {
      case 'dashboard': return <DashboardView setView={setView} />;
      case 'clients': 
        return hasPermission('clients.view') ? <ClientsView /> : <DashboardView setView={setView} />;
      case 'staff':
        return hasPermission('staff.view') ? <StaffView /> : <DashboardView setView={setView} />;
      case 'visits':
        return hasPermission('visits.view') ? <RotaView /> : <DashboardView setView={setView} />;
      case 'compliance':
        return hasPermission('compliance.view') ? <ComplianceDashboardView /> : <DashboardView setView={setView} />;
      case 'actions':
        return hasPermission('actions.view') ? <ActionsView /> : <DashboardView setView={setView} />;
      case 'risks':
        return hasPermission('risks.view') ? <RisksView /> : <DashboardView setView={setView} />;
      case 'audits':
        return hasPermission('audits.view') ? <AuditsView /> : <DashboardView setView={setView} />;
      case 'medication':
        return hasPermission('medication.view') ? <MedicationView /> : <DashboardView setView={setView} />;
      case 'medication-orders':
        return hasPermission('medication.orders.view') ? <MedicationOrdersView /> : <DashboardView setView={setView} />;
      case 'care-plans':
        return hasPermission('carePlans.view') ? <CarePlansView /> : <DashboardView setView={setView} />;
      case 'reports':
        return hasPermission('reports.view') ? <ReportsView /> : <DashboardView setView={setView} />;
      case 'users':
        return hasPermission('users.view') ? <ListView title="System Users" apiEndpoint="/api/users" permissionBase="users" currentView={view} /> : <DashboardView setView={setView} />;
      case 'roles':
        return hasPermission('settings.roles.view') ? <ListView title="Role Definitions" apiEndpoint="/api/roles" permissionBase="settings.roles" currentView={view} /> : <DashboardView setView={setView} />;
      case 'company':
        return hasPermission('company.view') ? <CompanySettingsView /> : <DashboardView setView={setView} />;
      default:
        return <DashboardView setView={setView} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#050706] flex text-slate-200">
      <Sidebar currentView={view} setView={setView} />
      
      <main className="flex-1 ml-64 min-h-screen flex flex-col">
        <header className="h-16 flex-shrink-0 bg-[#0a0c0b]/80 backdrop-blur-md border-b border-emerald-900/30 flex items-center justify-between px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
            <h1 className="text-xs font-bold text-white uppercase tracking-[0.2em]">{getHeaderTitle()}</h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-emerald-950/20 border border-emerald-900/30 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Network Operational</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right text-[10px] uppercase font-bold tracking-widest text-slate-500 hidden sm:block">
                <p className="text-slate-300">{new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' })}</p>
                <p className="text-[8px] opacity-70">{user?.company?.name}</p>
              </div>
              
              <NotificationBell />

              <button 
                onClick={logout}
                className="w-8 h-8 rounded-full border border-red-900/30 text-red-500 flex items-center justify-center hover:bg-red-500/10 transition-all shadow-lg shadow-red-950/20"
                title="Exit System"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

const CompanySettingsView = () => {
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { hasPermission } = useAuth();

  useEffect(() => {
    fetch('/api/company')
      .then(res => res.json())
      .then(data => {
        setCompany(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasPermission('company.edit')) return;
    setIsSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/company', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(company)
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else {
        setSuccess('Organization profile updated successfully.');
        setCompany(data);
      }
    } catch (err) {
      setError('Save operation failed.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-slate-500 font-mono text-xs uppercase tracking-widest">Querying identity server...</div>;
  if (!company) return <div className="p-8 text-red-500">Failed to load organization data.</div>;

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
          <Building2 size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight uppercase">Organization Profile</h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Manage institutional settings and compliance details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
            <AlertCircle size={16} />
            {error}
          </div>
        )}
        {success && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
            <CheckCircle2 size={16} />
            {success}
          </div>
        )}

        <div className="bg-[#111413] border border-emerald-900/20 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-emerald-900/10 bg-[#151917]/50">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest">General Information</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Company Name</label>
              <input 
                type="text" 
                value={company.name}
                onChange={e => setCompany({...company, name: e.target.value})}
                className="w-full bg-[#050706] border border-emerald-900/30 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none transition-all placeholder:text-slate-700"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Trading Name</label>
              <input 
                type="text" 
                value={company.tradingName || ''}
                onChange={e => setCompany({...company, tradingName: e.target.value})}
                className="w-full bg-[#050706] border border-emerald-900/30 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none transition-all placeholder:text-slate-700"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Contact Email</label>
              <input 
                type="email" 
                value={company.email}
                onChange={e => setCompany({...company, email: e.target.value})}
                className="w-full bg-[#050706] border border-emerald-900/30 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none transition-all placeholder:text-slate-700"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Contact Phone</label>
              <input 
                type="text" 
                value={company.phone || ''}
                onChange={e => setCompany({...company, phone: e.target.value})}
                className="w-full bg-[#050706] border border-emerald-900/30 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none transition-all placeholder:text-slate-700"
              />
            </div>
          </div>
        </div>

        <div className="bg-[#111413] border border-emerald-900/20 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-emerald-900/10 bg-[#151917]/50">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest">Regulatory & Location</h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">CQC Provider ID</label>
                <input 
                  type="text" 
                  value={company.cqcProviderId || ''}
                  onChange={e => setCompany({...company, cqcProviderId: e.target.value})}
                  className="w-full bg-[#050706] border border-emerald-900/30 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none transition-all font-mono placeholder:text-slate-700"
                  placeholder="e.g. 1-12345678"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Address Line 1</label>
                <input 
                  type="text" 
                  value={company.addressLine1 || ''}
                  onChange={e => setCompany({...company, addressLine1: e.target.value})}
                  className="w-full bg-[#050706] border border-emerald-900/30 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none transition-all placeholder:text-slate-700"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Town / City</label>
                <input 
                  type="text" 
                  value={company.town || ''}
                  onChange={e => setCompany({...company, town: e.target.value})}
                  className="w-full bg-[#050706] border border-emerald-900/30 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none transition-all placeholder:text-slate-700"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Postcode</label>
                <input 
                  type="text" 
                  value={company.postcode || ''}
                  onChange={e => setCompany({...company, postcode: e.target.value})}
                  className="w-full bg-[#050706] border border-emerald-900/30 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none transition-all font-mono placeholder:text-slate-700"
                />
              </div>
            </div>
          </div>
        </div>

        {hasPermission('company.edit') && (
          <div className="flex justify-end">
            <button 
              type="submit"
              disabled={isSaving}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-4 px-12 rounded-xl shadow-xl shadow-emerald-900/40 uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3"
            >
              {isSaving ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Synchronizing...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Persist Changes
                </>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

const MedicationMARView = ({ clients }: { clients: any[] }) => {
  const [selectedClientId, setSelectedClientId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [meds, setMeds] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null);

  const fetchMAR = async () => {
    if (!selectedClientId) return;
    setLoading(true);
    try {
      const [mRes, aRes] = await Promise.all([
        fetch(`/api/medication?clientId=${selectedClientId}&status=Active`),
        fetch(`/api/mar/client/${selectedClientId}?startDate=${date}T00:00:00Z&endDate=${date}T23:59:59Z`)
      ]);
      const mData = await mRes.json();
      const aData = await aRes.json();
      if (Array.isArray(mData)) setMeds(mData);
      if (Array.isArray(aData)) setAdmins(aData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMAR();
  }, [selectedClientId, date]);

  const getTimeSlot = (m: any) => {
    const freq = m.frequency.toLowerCase();
    if (freq.includes('morning') || freq.includes('breakfast')) return 'Morning';
    if (freq.includes('lunch') || freq.includes('noon')) return 'Lunch';
    if (freq.includes('tea') || freq.includes('dinner')) return 'Tea';
    if (freq.includes('bed') || freq.includes('night')) return 'Bed';
    if (m.isPRN) return 'PRN';
    return 'Other';
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'Administered': return <CheckCircle2 size={16} className="text-emerald-500" />;
      case 'Refused': return <XCircle size={16} className="text-red-500" />;
      case 'Not Given': return <AlertTriangle size={16} className="text-amber-500" />;
      default: return <Clock size={16} className="text-slate-700" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4 mb-8">
        <div className="flex-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Select Care Recipient</label>
          <select 
            value={selectedClientId}
            onChange={e => setSelectedClientId(e.target.value)}
            className="bg-[#111413] border border-emerald-900/20 text-slate-300 text-[10px] font-bold uppercase tracking-widest rounded-lg px-4 py-2 w-full outline-none focus:border-emerald-500"
          >
            <option value="">Choose Client...</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Transaction Date</label>
          <input 
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="bg-[#111413] border border-emerald-900/20 text-slate-300 text-[10px] font-bold uppercase tracking-widest rounded-lg px-4 py-2 outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {!selectedClientId ? (
        <div className="premium-card p-12 text-center border-dashed border-emerald-900/20">
          <User size={40} className="mx-auto text-emerald-900/20 mb-4" />
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Select a client to load their MAR chart.</p>
        </div>
      ) : loading ? (
        <div className="py-20 text-center text-slate-500 font-mono text-xs uppercase tracking-widest">Syncing with clinical server...</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-emerald-900/10">
          <table className="w-full text-left border-collapse bg-[#0a0c0b]">
            <thead>
              <tr className="border-b border-emerald-900/20">
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-r border-emerald-900/10">Medication</th>
                {['Morning', 'Lunch', 'Tea', 'Bed', 'PRN'].map(slot => (
                  <th key={slot} className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">{slot}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {meds.map(m => (
                <tr key={m.id} className="border-b border-emerald-900/5 hover:bg-emerald-500/[0.02] transition-colors">
                  <td className="p-4 border-r border-emerald-900/10 min-w-[250px]">
                    <div className="flex flex-col">
                      <span className="text-white font-bold uppercase text-xs tracking-tight">{m.medicationName}</span>
                      <span className="text-emerald-500 font-mono text-[10px]">{m.strength} • {m.form}</span>
                      <span className="text-slate-500 text-[10px] font-semibold uppercase tracking-tighter mt-1">{m.dosageInstructions}</span>
                    </div>
                  </td>
                  {['Morning', 'Lunch', 'Tea', 'Bed', 'PRN'].map(slot => {
                    const slotMatch = getTimeSlot(m);
                    const isRelevant = slot === slotMatch || (m.isPRN && slot === 'PRN');
                    const admin = admins.find(a => a.medicationId === m.id && getTimeSlot(m) === slot);
                    
                    return (
                      <td key={slot} className={`p-4 border-r border-emerald-900/5 text-center ${!isRelevant && 'bg-black/20'}`}>
                        {isRelevant ? (
                          <button 
                            onClick={() => {
                              setSelectedAdmin(admin || { medicationId: m.id, clientId: selectedClientId, scheduledTime: `${date}T09:00:00Z` });
                              setIsModalOpen(true);
                            }}
                            className={`w-full aspect-square max-w-[48px] mx-auto rounded-lg border-2 flex flex-col items-center justify-center gap-1 transition-all ${
                              admin?.status === 'Administered' ? 'bg-emerald-500/10 border-emerald-500/30' :
                              admin?.status === 'Refused' ? 'bg-red-500/10 border-red-500/30' :
                              'border-emerald-900/10 hover:border-emerald-500/40'
                            }`}
                          >
                            {getStatusIcon(admin?.status)}
                            {admin?.administeredTime && (
                              <span className="text-[8px] font-bold text-emerald-500">{new Date(admin.administeredTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            )}
                          </button>
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-900/10 mx-auto" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <MedicationAdministrationModal 
          admin={selectedAdmin}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => { setIsModalOpen(false); fetchMAR(); }}
        />
      )}
    </div>
  );
};

const MedicationAdministrationModal = ({ admin, onClose, onSuccess }: { admin: any, onClose: () => void, onSuccess: () => void }) => {
  const [formData, setFormData] = useState({
    status: admin?.status || 'Administered',
    administeredTime: admin?.administeredTime ? new Date(admin.administeredTime).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
    doseGiven: admin?.doseGiven || '',
    notes: admin?.notes || '',
    refusalReason: admin?.refusalReason || '',
    notGivenReason: admin?.notGivenReason || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = admin.id ? `/api/mar/${admin.id}/status` : '/api/mar';
      const method = admin.id ? 'PATCH' : 'POST';
      const body = admin.id ? formData : { ...formData, ...admin };
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) onSuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] flex items-center justify-center p-6 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-[#0a0c0b] border border-emerald-500/20 rounded-2xl p-8"
      >
        <h2 className="text-xl font-bold text-white tracking-widest uppercase mb-6 flex items-center gap-3">
          <Activity className="text-emerald-500" /> Record Administration
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status / Outcome</label>
              <select 
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value})}
                className="form-input text-xs"
              >
                <option value="Administered">Administered</option>
                <option value="Refused">Refused by Client</option>
                <option value="Not Given">Not Given / Gap</option>
                <option value="Omitted">Omitted</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Time Stamp</label>
              <input 
                type="datetime-local"
                value={formData.administeredTime}
                onChange={e => setFormData({...formData, administeredTime: e.target.value})}
                className="form-input text-xs"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Actual Dose Given</label>
            <input 
              type="text"
              required
              placeholder="e.g. 2 Tablets / 10ml"
              value={formData.doseGiven}
              onChange={e => setFormData({...formData, doseGiven: e.target.value})}
              className="form-input"
            />
          </div>

          {formData.status === 'Refused' && (
             <div className="space-y-2 animate-in slide-in-from-top-2">
               <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Refusal Reason</label>
               <input 
                 type="text" required
                 value={formData.refusalReason}
                 onChange={e => setFormData({...formData, refusalReason: e.target.value})}
                 className="form-input border-red-500/30"
                 placeholder="Why was it refused?"
               />
             </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Administration Notes</label>
            <textarea 
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
              className="form-input h-24 resize-none"
              placeholder="Record any specific observations..."
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-6 py-3 border border-emerald-900/20 text-slate-500 hover:text-white rounded-xl uppercase text-[10px] font-bold tracking-widest transition-all">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 bg-emerald-600 hover:bg-emerald-500 py-3 rounded-xl text-white font-bold uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-900/40 transition-all">Confirm Event</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const MedicationStockView = ({ clients }: { clients: any[] }) => {
  const [selectedClientId, setSelectedClientId] = useState('');
  const [meds, setMeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMed, setSelectedMed] = useState<any>(null);

  const fetchStock = async () => {
    if (!selectedClientId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/medication?clientId=${selectedClientId}&status=Active`);
      const data = await res.json();
      if (Array.isArray(data)) setMeds(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, [selectedClientId]);

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Select Client for Stock Audit</label>
        <select 
          value={selectedClientId}
          onChange={e => setSelectedClientId(e.target.value)}
          className="bg-[#111413] border border-emerald-900/20 text-slate-300 text-[10px] font-bold uppercase tracking-widest rounded-lg px-4 py-2 w-full max-w-md outline-none focus:border-emerald-500"
        >
          <option value="">Select Care Recipient...</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
        </select>
      </div>

      {!selectedClientId ? (
        <div className="premium-card p-12 text-center border-dashed border-emerald-900/20">
          <Archive size={40} className="mx-auto text-emerald-900/20 mb-4" />
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Select a client to audit their current pharmaceutical stock.</p>
        </div>
      ) : loading ? (
        <div className="py-20 text-center text-slate-500 font-mono text-xs uppercase tracking-widest">Inventory sync in progress...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {meds.map(m => (
            <div key={m.id} className="premium-card p-6 border-l-4 border-l-emerald-600 flex justify-between items-center group">
              <div>
                <h4 className="text-white font-bold uppercase tracking-tight mb-1">{m.medicationName}</h4>
                <p className="text-emerald-500 font-mono text-[10px]">{m.strength} • {m.form}</p>
                <div className="mt-3 flex items-center gap-4">
                  <div className="bg-emerald-950/30 px-3 py-1 rounded border border-emerald-500/20">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">In Stock: {m.currentStock || 0}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => { setSelectedMed(m); setIsModalOpen(true); }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[9px] font-bold uppercase tracking-widest transition-all"
              >
                Perform Count
              </button>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <StockCheckModal 
          medication={selectedMed}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => { setIsModalOpen(false); fetchStock(); }}
        />
      )}
    </div>
  );
};

const StockCheckModal = ({ medication, onClose, onSuccess }: { medication: any, onClose: () => void, onSuccess: () => void }) => {
  const [formData, setFormData] = useState({
    quantity: '',
    notes: '',
    type: 'Manual Audit'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/medication/${medication.id}/stock-check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) onSuccess();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-[#0a0c0b] border border-emerald-500/20 rounded-2xl p-8"
      >
        <h2 className="text-lg font-bold text-white tracking-widest uppercase mb-6">Stock Audit: {medication.medicationName}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Actual Count Available</label>
            <input 
              type="number" required step="0.01"
              value={formData.quantity}
              onChange={e => setFormData({...formData, quantity: e.target.value})}
              className="form-input text-lg font-mono text-emerald-500"
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Audit Notes</label>
            <textarea 
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
              className="form-input h-20 resize-none text-xs"
              placeholder="e.g. Verified against physical pack..."
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-6 py-3 border border-emerald-900/20 text-slate-500 hover:text-white rounded-xl uppercase text-[10px] font-bold tracking-widest transition-all">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 bg-emerald-600 hover:bg-emerald-500 py-3 rounded-xl text-white font-bold uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-900/40 transition-all">Submit Audit</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
